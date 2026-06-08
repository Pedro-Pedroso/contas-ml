// Funções de exportação e importação CSV

import { Account, TipoConta, StatusConta } from '../types'
import { formatarData } from './calculations'

const CABECALHO = [
  'id', 'nome_cliente', 'assessor', 'tipo', 'estrela', 'data_inicio',
  'data_termino', 'meta_faturamento', 'faturamento_real', 'meta_vendas',
  'vendas_reais', 'em_risco', 'status', 'observacao',
]

/** Exporta array de contas para CSV e força download */
export function exportarCSV(contas: Account[]): void {
  const linhas = [
    CABECALHO.join(','),
    ...contas.map((c) =>
      [
        c.id,
        `"${c.nome_cliente}"`,
        `"${c.assessor}"`,
        c.tipo,
        c.estrela,
        formatarData(c.data_inicio),
        formatarData(c.data_termino),
        c.meta_faturamento,
        c.faturamento_real,
        c.meta_vendas ?? '',
        c.vendas_reais ?? '',
        c.em_risco,
        c.status,
        `"${c.observacao ?? ''}"`,
      ].join(',')
    ),
  ].join('\n')

  const blob = new Blob(['﻿' + linhas], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  const hoje = new Date().toISOString().slice(0, 10)
  link.href = url
  link.download = `wxp-contas-${hoje}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

/** Lê arquivo CSV e retorna contas + contagem de erros */
export function importarCSV(
  arquivo: File,
  contasExistentes: Account[],
  onConcluido: (importadas: number, erros: number, novasContas: Account[]) => void
): void {
  const reader = new FileReader()
  reader.onload = (e) => {
    const texto = e.target?.result as string
    const linhas = texto.split('\n').filter((l) => l.trim() !== '')
    // Ignora o cabeçalho
    const dados = linhas.slice(1)

    let importadas = 0
    let erros = 0
    const novasContas = [...contasExistentes]

    dados.forEach((linha) => {
      // Processa valores entre aspas com vírgulas internas
      const cols = linha.match(/(".*?"|[^,]+)(?=,|$)/g)?.map((v) =>
        v.replace(/^"|"$/g, '').trim()
      )
      if (!cols || cols.length < 12) {
        erros++
        return
      }

      const [, nome_cliente, assessor, tipo, estrela, , , meta, real, meta_vendas_str, vendas_reais_str, em_risco, status, observacao] = cols

      if (!nome_cliente || !assessor || !tipo || !status) {
        erros++
        return
      }

      // Converte data dd/mm/aaaa -> YYYY-MM-DD
      const parseData = (s: string) => {
        const p = s.split('/')
        return p.length === 3 ? `${p[2]}-${p[1]}-${p[0]}` : s
      }

      const conta: Account = {
        id: crypto.randomUUID(),
        nome_cliente,
        assessor,
        tipo: tipo as TipoConta,
        estrela: estrela === 'true',
        data_inicio: parseData(cols[5]),
        data_termino: parseData(cols[6]),
        meta_faturamento: Number(meta) || 0,
        faturamento_real: Number(real) || 0,
        ...(meta_vendas_str ? { meta_vendas: Number(meta_vendas_str) } : {}),
        ...(vendas_reais_str ? { vendas_reais: Number(vendas_reais_str) } : {}),
        em_risco: em_risco === 'true',
        status: status as StatusConta,
        observacao: observacao ?? '',
      }

      // Upsert por nome_cliente
      const idx = novasContas.findIndex(
        (c) => c.nome_cliente.toLowerCase() === nome_cliente.toLowerCase()
      )
      if (idx >= 0) {
        novasContas[idx] = { ...conta, id: novasContas[idx].id }
      } else {
        novasContas.push(conta)
      }
      importadas++
    })

    onConcluido(importadas, erros, novasContas)
  }
  reader.readAsText(arquivo, 'utf-8')
}
