import { useState, useCallback } from 'react'
import { Account } from '../types'
import { CONTAS_NOTION_V2 } from '../data/notionAccounts'

const STORAGE_KEY = 'wxp_accounts'
const STORAGE_VERSION_KEY = 'wxp_accounts_version'
const DATASET_VERSION = 'notion-contas-v5-janelas-2026-06-11'

function carregarDoStorage(): Account[] {
  try {
    const savedVersion = localStorage.getItem(STORAGE_VERSION_KEY)
    const salvo = localStorage.getItem(STORAGE_KEY)

    if (salvo && savedVersion === DATASET_VERSION) {
      return JSON.parse(salvo) as Account[]
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(CONTAS_NOTION_V2))
    localStorage.setItem(STORAGE_VERSION_KEY, DATASET_VERSION)
  } catch {
    /* ignora erros de storage/parse */
  }

  return CONTAS_NOTION_V2
}

function salvarNoStorage(contas: Account[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(contas))
  localStorage.setItem(STORAGE_VERSION_KEY, DATASET_VERSION)
}

export function useAccounts() {
  const [contas, setContas] = useState<Account[]>(carregarDoStorage)

  const salvar = useCallback((novasContas: Account[]) => {
    setContas(novasContas)
    salvarNoStorage(novasContas)
  }, [])

  const adicionarConta = useCallback(
    (dados: Omit<Account, 'id'>) => {
      const nova: Account = { ...dados, id: crypto.randomUUID() }
      salvar([...contas, nova])
    },
    [contas, salvar]
  )

  const editarConta = useCallback(
    (id: string, dados: Omit<Account, 'id'>) => {
      salvar(contas.map((conta) => (conta.id === id ? { ...dados, id } : conta)))
    },
    [contas, salvar]
  )

  const excluirConta = useCallback(
    (id: string) => {
      salvar(contas.filter((conta) => conta.id !== id))
    },
    [contas, salvar]
  )

  const importarContas = useCallback(
    (novasContas: Account[]) => {
      salvar(novasContas)
    },
    [salvar]
  )

  return { contas, adicionarConta, editarConta, excluirConta, importarContas }
}
