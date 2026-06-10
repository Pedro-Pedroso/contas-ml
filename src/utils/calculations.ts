// Funções de cálculo de métricas das contas

import { Account } from '../types'

/** Percentual da meta de vendas atingido (só lojista_digital) */
export function calcPercentualVendas(conta: Account): number {
  if (!conta.meta_vendas || conta.meta_vendas === 0) return 0
  return Math.round(((conta.vendas_reais ?? 0) / conta.meta_vendas) * 100)
}

/** Percentual da meta atingido — lojistas usam média de faturamento + vendas */
export function calcPercentualMeta(conta: Account): number {
  const pctFat = conta.meta_faturamento === 0
    ? 0
    : Math.round((conta.faturamento_real / conta.meta_faturamento) * 100)

  if (conta.tipo === 'lojista_digital' && conta.meta_vendas && conta.meta_vendas > 0) {
    const pctVendas = calcPercentualVendas(conta)
    return Math.round((pctFat + pctVendas) / 2)
  }

  return pctFat
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
    const gmvTotal = contasAssessor.reduce((acc, c) => acc + c.faturamento_real, 0)
    const iniciais = contasAssessor.filter(isContaInicial).length

    const rampadas = contasAssessor.filter((c) => !isContaInicial(c)).length
    const metaBatida = contasAssessor
      .filter((c) => !isContaInicial(c) && calcPercentualMeta(c) >= 100).length
    const emRisco = contasAssessor.filter((c) => c.em_risco).length

    return {
      assessor,
      contas: contasAssessor,
      totalContas: contasAssessor.length,
      iniciais,
      rampadas,
      mediaAtingimento,
      gmvTotal,
      metaBatida,
      emRisco,
    }
  }).sort((a, b) => a.assessor.localeCompare(b.assessor))
}

/** Cor do badge de % de meta */
export function corPercentualMeta(percentual: number): string {
  if (percentual >= 80) return 'var(--success)'
  if (percentual >= 50) return 'var(--warning)'
  return 'var(--danger)'
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
