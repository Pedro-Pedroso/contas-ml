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

/** Meses restantes entre hoje e data_termino (arredondado para baixo) */
export function calcMesesRestantes(dataTerm: string): number {
  const hoje = new Date()
  const termino = new Date(dataTerm)
  const diffMs = termino.getTime() - hoje.getTime()
  return Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30.44))
}

/** Média aritmética de % de meta de todas as contas ativas */
export function calcMediaAtingimento(contas: Account[]): number {
  const ativas = contas.filter((c) => c.status === 'ativo')
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
