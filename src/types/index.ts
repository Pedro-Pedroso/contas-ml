// Tipos principais do sistema WXP Dashboard

export type TipoConta = 'mensalista' | 'lojista_digital'
export type StatusConta = 'ativo' | 'encerrado' | 'pausado'

export interface Account {
  id: string
  nome_cliente: string
  tipo: TipoConta
  assessor: string
  estrela: boolean
  data_inicio: string   // YYYY-MM-DD
  data_termino: string  // YYYY-MM-DD
  meta_faturamento: number
  faturamento_30d: number   // últimos 30 dias (painel ML)
  faturamento_60d?: number  // últimos 60 dias (painel ML) — meta do lojista + crescimento
  meta_vendas?: number
  vendas_reais?: number
  em_risco: boolean
  status: StatusConta
  observacao?: string
}

export interface Filtros {
  assessor: string
  tipo: string
  risco: string
  status: string
  busca: string
}
