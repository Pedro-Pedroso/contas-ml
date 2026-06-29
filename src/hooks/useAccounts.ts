import { useState, useEffect, useCallback } from 'react'
import { Account, TipoConta, StatusConta } from '../types'
import { supabase } from '../lib/supabase'

// Linha da tabela `contas` no Supabase (numeric pode chegar como string)
interface ContaRow {
  id: string
  nome_cliente: string
  assessor: string
  tipo: string
  estrela: boolean
  data_inicio: string | null
  data_termino: string | null
  meta_faturamento: number | string
  faturamento_30d: number | string
  faturamento_60d: number | string | null
  meta_vendas: number | string | null
  vendas_reais: number | string | null
  em_risco: boolean
  status: string
  observacao: string | null
}

const numOpcional = (v: number | string | null): number | undefined =>
  v == null ? undefined : Number(v)

function rowToAccount(r: ContaRow): Account {
  return {
    id: r.id,
    nome_cliente: r.nome_cliente,
    assessor: r.assessor,
    tipo: r.tipo as TipoConta,
    estrela: r.estrela,
    data_inicio: r.data_inicio ?? '',
    data_termino: r.data_termino ?? '',
    meta_faturamento: Number(r.meta_faturamento ?? 0),
    faturamento_30d: Number(r.faturamento_30d ?? 0),
    ...(r.faturamento_60d != null ? { faturamento_60d: Number(r.faturamento_60d) } : {}),
    ...(r.meta_vendas != null ? { meta_vendas: Number(r.meta_vendas) } : {}),
    ...(r.vendas_reais != null ? { vendas_reais: Number(r.vendas_reais) } : {}),
    em_risco: r.em_risco,
    status: r.status as StatusConta,
    observacao: r.observacao ?? '',
  }
}

function accountToRow(c: Account): ContaRow {
  return {
    id: c.id,
    nome_cliente: c.nome_cliente,
    assessor: c.assessor,
    tipo: c.tipo,
    estrela: c.estrela,
    data_inicio: c.data_inicio || null,   // coluna date rejeita string vazia
    data_termino: c.data_termino || null,
    meta_faturamento: c.meta_faturamento,
    faturamento_30d: c.faturamento_30d,
    faturamento_60d: c.faturamento_60d ?? null,
    meta_vendas: c.meta_vendas ?? null,
    vendas_reais: c.vendas_reais ?? null,
    em_risco: c.em_risco,
    status: c.status,
    observacao: c.observacao ?? '',
  }
}

export function useAccounts() {
  const [contas, setContas] = useState<Account[]>([])
  const [carregando, setCarregando] = useState(true)
  // Erro da carga inicial; a UI decide como exibir (toast). Mutações retornam o erro diretamente.
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    let ativo = true
    supabase
      .from('contas')
      .select('*')
      .order('nome_cliente')
      .then(({ data, error }) => {
        if (!ativo) return
        if (error) {
          setErro(`Erro ao carregar contas: ${error.message}`)
        } else {
          setContas(((data ?? []) as ContaRow[]).map(rowToAccount))
        }
        setCarregando(false)
      })
    return () => { ativo = false }
  }, [])

  const adicionarConta = useCallback(async (dados: Omit<Account, 'id'>): Promise<string | null> => {
    const nova: Account = { ...dados, id: crypto.randomUUID() }
    const { error } = await supabase.from('contas').insert(accountToRow(nova))
    if (error) return `Erro ao salvar conta: ${error.message}`
    setContas((prev) => [...prev, nova])
    return null
  }, [])

  const editarConta = useCallback(async (id: string, dados: Omit<Account, 'id'>): Promise<string | null> => {
    const conta: Account = { ...dados, id }
    const { error } = await supabase.from('contas').update(accountToRow(conta)).eq('id', id)
    if (error) return `Erro ao atualizar conta: ${error.message}`
    setContas((prev) => prev.map((c) => (c.id === id ? conta : c)))
    return null
  }, [])

  const excluirConta = useCallback(async (id: string): Promise<string | null> => {
    const { error } = await supabase.from('contas').delete().eq('id', id)
    if (error) return `Erro ao excluir conta: ${error.message}`
    setContas((prev) => prev.filter((c) => c.id !== id))
    return null
  }, [])

  const importarContas = useCallback(async (novasContas: Account[]): Promise<string | null> => {
    const { error } = await supabase.from('contas').upsert(novasContas.map(accountToRow))
    if (error) return `Erro ao importar contas: ${error.message}`
    setContas(novasContas)
    return null
  }, [])

  return { contas, carregando, erro, adicionarConta, editarConta, excluirConta, importarContas }
}
