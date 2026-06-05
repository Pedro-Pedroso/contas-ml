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
  faturamento_real: number
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
