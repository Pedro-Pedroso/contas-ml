// Funções de cálculo de métricas das contas

import { Account } from '../types'

/** Percentual da meta de vendas atingido (só lojista_digital) */
export function calcPercentualVendas(conta: Account): number {
  if (!conta.meta_vendas || conta.meta_vendas === 0) return 0
  return Math.round(((conta.vendas_reais ?? 0) / conta.meta_vendas) * 100)
}

/** Faturamento que conta contra a meta: lojista = últimos 60 dias, mensalista = últimos 30 */
export function faturamentoConsiderado(conta: Account): number {
  return conta.tipo === 'lojista_digital' ? (conta.faturamento_60d ?? 0) : conta.faturamento_30d
}

/** Percentual da meta de faturamento atingido (sem o cap de 50% por métrica) */
export function calcPercentualFaturamento(conta: Account): number {
  if (conta.meta_faturamento === 0) return 0
  return Math.round((faturamentoConsiderado(conta) / conta.meta_faturamento) * 100)
}

/** Percentual da meta atingido — lojistas usam 50% capped por métrica.
 *  Cada indicador contribui no máximo 50 pts; exceder a meta não compensa o outro.
 *  Ex: fat 27% + pedidos 152% → 13,5 + 50 = 64% (não 90% como na média simples). */
export function calcPercentualMeta(conta: Account): number {
  const pctFat = calcPercentualFaturamento(conta)

  if (conta.tipo === 'lojista_digital' && conta.meta_vendas && conta.meta_vendas > 0) {
    const pctVendas = calcPercentualVendas(conta)
    return Math.round(Math.min(pctFat, 100) / 2 + Math.min(pctVendas, 100) / 2)
  }

  return pctFat
}

/** Crescimento % por janela móvel: últimos 30 dias vs os 30 anteriores.
 *  Os 30 anteriores são derivados de 60d − 30d (ambos lidos do painel ML).
 *  Null se falta dado, ou se a conta é inicial (janela anterior precede o início). */
export function calcCrescimento(conta: Account): number | null {
  const f30 = conta.faturamento_30d
  const f60 = conta.faturamento_60d
  if (f60 == null || f30 <= 0) return null
  const anteriores30 = f60 - f30
  if (anteriores30 <= 0) return null
  if (isContaInicial(conta)) return null
  return ((f30 / anteriores30) - 1) * 100
}

/** True se a conta tem até 60 dias desde data_inicio (ainda em fase inicial) */
export function isContaInicial(conta: Account): boolean {
  const inicio = new Date(conta.data_inicio)
  const hoje = new Date()
  const diffMs = hoje.getTime() - inicio.getTime()
  const diffDias = diffMs / (1000 * 60 * 60 * 24)
  return diffDias <= 60
}

/** Meses restantes entre hoje e data_termino (arredondado para baixo) */
export function calcMesesRestantes(dataTerm: string): number {
  const hoje = new Date()
  const termino = new Date(dataTerm)
  const diffMs = termino.getTime() - hoje.getTime()
  return Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30.44))
}

/** Média aritmética de % de meta das contas ativas excluindo fase inicial */
export function calcMediaAtingimento(contas: Account[]): number {
  const ativas = contas.filter((c) => c.status === 'ativo' && !isContaInicial(c))
  if (ativas.length === 0) return 0
  const soma = ativas.reduce((acc, c) => acc + calcPercentualMeta(c), 0)
  return Math.round(soma / ativas.length)
}

/** Contas ativas com meses_restantes <= 2 */
export function calcEncerrandoEm60Dias(contas: Account[]): Account[] {
  return contas.filter(
    (c) => c.status === 'ativo' && calcMesesRestantes(c.data_termino) <= 2
  )
}

/** Agrupa contas por assessor com métricas consolidadas */
export function calcMetricasPorAssessor(contas: Account[]) {
  const ativas = contas.filter((c) => c.status === 'ativo')
  const mapa = new Map<string, Account[]>()

  for (const conta of ativas) {
    const lista = mapa.get(conta.assessor) ?? []
    lista.push(conta)
    mapa.set(conta.assessor, lista)
  }

  return Array.from(mapa.entries()).map(([assessor, contasAssessor]) => {
    const contasRampadas = contasAssessor.filter((c) => !isContaInicial(c))
    const mediaAtingimento = contasRampadas.length === 0
      ? null
      : Math.round(contasRampadas.reduce((acc, c) => acc + calcPercentualMeta(c), 0) / contasRampadas.length)
    const gmvTotal = contasAssessor.reduce((acc, c) => acc + faturamentoConsiderado(c), 0)
    const iniciais = contasAssessor.filter(isContaInicial).length

    const rampadas = contasAssessor.filter((c) => !isContaInicial(c)).length
    const emRisco = contasAssessor.filter((c) => c.em_risco).length

    // Média simples dos crescimentos (contas com as duas janelas preenchidas)
    const crescimentos = contasAssessor
      .map(calcCrescimento)
      .filter((g): g is number => g !== null)
    const mediaCrescimento = crescimentos.length > 0
      ? crescimentos.reduce((acc, g) => acc + g, 0) / crescimentos.length
      : null

    return {
      assessor,
      contas: contasAssessor,
      totalContas: contasAssessor.length,
      iniciais,
      rampadas,
      mediaAtingimento,
      gmvTotal,
      mediaCrescimento,
      emRisco,
    }
  }).sort((a, b) => a.assessor.localeCompare(b.assessor))
}

/** Faixa de status por percentual atingido — base única para cores e classes.
 *  >= 80 verde · >= 50 âmbar · senão vermelho.
 *  Use com `var(--${faixaPct(p)})` (cor) ou `is-${faixaPct(p)}` (classe). */
export type FaixaStatus = 'green' | 'amber' | 'red'
export function faixaPct(percentual: number): FaixaStatus {
  if (percentual >= 80) return 'green'
  if (percentual >= 50) return 'amber'
  return 'red'
}

/** Formata data YYYY-MM-DD para dd/mm/aaaa */
export function formatarData(data: string): string {
  if (!data) return '—'
  const [ano, mes, dia] = data.split('-')
  return `${dia}/${mes}/${ano}`
}

/** Formata número como moeda brasileira */
export function formatarMoeda(valor: number): string {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

/** Moeda compacta: valores >= 1000 viram "R$ 37,5k"; abaixo disso, moeda cheia sem centavos */
export function formatarMoedaK(valor: number): string {
  if (Math.abs(valor) >= 1000) {
    const k = (valor / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })
    return `R$ ${k}k`
  }
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
}
