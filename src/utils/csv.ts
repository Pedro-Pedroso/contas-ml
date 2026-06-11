// Exportação e importação de planilha (CSV amigável para Excel)
//
// Ciclo: Exportar baixa a planilha-modelo com colunas em português →
// edita no Excel → Importar sobe de volta (atualiza por nome de cliente).

import { Account, TipoConta, StatusConta } from '../types'
import { formatarData } from './calculations'

// Separador ";" — Excel pt-BR abre direto em colunas
const SEP = ';'

const CABECALHO = [
  'Cliente', 'Assessor', 'Tipo', 'Estrela', 'Data Início', 'Data Término',
  'Meta Faturamento', 'Faturamento', 'Faturamento Mês Anterior',
  'Meta Pedidos', 'Pedidos', 'Em Risco', 'Status', 'Observação',
]

const simNao = (v: boolean) => (v ? 'Sim' : 'Não')

const tipoLabel: Record<TipoConta, string> = {
  mensalista: 'Mensalista',
  lojista_digital: 'Lojista Digital',
}

const statusLabel: Record<StatusConta, string> = {
  ativo: 'Ativo',
  pausado: 'Pausado',
  encerrado: 'Encerrado',
}

/** Exporta as contas como planilha-modelo editável e força download */
export function exportarCSV(contas: Account[]): void {
  const aspas = (s: string) => `"${s.replace(/"/g, '""')}"`

  const linhas = [
    CABECALHO.join(SEP),
    ...contas.map((c) =>
      [
        aspas(c.nome_cliente),
        aspas(c.assessor),
        tipoLabel[c.tipo],
        simNao(c.estrela),
        formatarData(c.data_inicio),
        formatarData(c.data_termino),
        c.meta_faturamento,
        c.faturamento_real,
        c.faturamento_mes_anterior ?? '',
        c.meta_vendas ?? '',
        c.vendas_reais ?? '',
        simNao(c.em_risco),
        statusLabel[c.status],
        aspas(c.observacao ?? ''),
      ].join(SEP)
    ),
  ].join('\r\n')

  const blob = new Blob(['﻿' + linhas], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  const hoje = new Date().toISOString().slice(0, 10)
  link.href = url
  link.download = `wxp-contas-${hoje}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

// ---------- importação ----------

/** Normaliza cabeçalho: minúsculas, sem acento, sem pontuação */
function normalizar(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

// Sinônimos aceitos para cada campo (depois de normalizar)
const MAPA_COLUNAS: Record<string, string[]> = {
  nome_cliente: ['cliente', 'nome cliente', 'nome do cliente', 'conta', 'nome'],
  assessor: ['assessor', 'responsavel'],
  tipo: ['tipo', 'tipo de conta', 'tipo conta'],
  estrela: ['estrela', 'prioritario', 'cliente estrela'],
  data_inicio: ['data inicio', 'inicio', 'data de inicio', 'data entrada', 'entrada'],
  data_termino: ['data termino', 'termino', 'data de termino', 'data fim', 'fim', 'data termino contrato'],
  meta_faturamento: ['meta faturamento', 'meta de faturamento', 'meta fat', 'meta r'],
  faturamento_real: ['faturamento', 'faturamento real', 'faturamento atual', 'fat real', 'realizado'],
  faturamento_mes_anterior: ['faturamento mes anterior', 'fat mes anterior', 'faturamento anterior', 'mes anterior'],
  meta_vendas: ['meta pedidos', 'meta de pedidos', 'meta vendas', 'meta de vendas'],
  vendas_reais: ['pedidos', 'vendas', 'vendas reais', 'pedidos reais'],
  em_risco: ['em risco', 'risco'],
  status: ['status', 'situacao'],
  observacao: ['observacao', 'observacoes', 'obs', 'nota', 'notas'],
}

function identificarColuna(cabecalho: string): string | null {
  const norm = normalizar(cabecalho)
  for (const [campo, sinonimos] of Object.entries(MAPA_COLUNAS)) {
    if (sinonimos.includes(norm)) return campo
  }
  return null
}

/** Divide uma linha CSV respeitando aspas */
function parseLinha(linha: string, sep: string): string[] {
  const cols: string[] = []
  let atual = ''
  let dentroAspas = false
  for (let i = 0; i < linha.length; i++) {
    const ch = linha[i]
    if (dentroAspas) {
      if (ch === '"' && linha[i + 1] === '"') { atual += '"'; i++ }
      else if (ch === '"') dentroAspas = false
      else atual += ch
    } else {
      if (ch === '"') dentroAspas = true
      else if (ch === sep) { cols.push(atual.trim()); atual = '' }
      else atual += ch
    }
  }
  cols.push(atual.trim())
  return cols
}

/** Converte número em formato BR ("R$ 37.000,50") ou simples ("37000.5") */
function parseNumero(s: string): number | undefined {
  const limpo = s.replace(/r\$/i, '').replace(/\s/g, '').trim()
  if (limpo === '') return undefined
  let normalizado = limpo
  if (limpo.includes(',')) {
    // formato BR: pontos são milhar, vírgula é decimal
    normalizado = limpo.replace(/\./g, '').replace(',', '.')
  } else if (/^\d{1,3}(\.\d{3})+$/.test(limpo)) {
    // só pontos em grupos de 3 → milhar
    normalizado = limpo.replace(/\./g, '')
  }
  const n = Number(normalizado)
  return Number.isFinite(n) ? n : undefined
}

/** Converte data dd/mm/aaaa ou aaaa-mm-dd para ISO */
function parseData(s: string): string {
  const limpo = s.trim()
  if (/^\d{4}-\d{2}-\d{2}/.test(limpo)) return limpo.slice(0, 10)
  const partes = limpo.split('/')
  if (partes.length === 3) {
    const [dia, mes, ano] = partes
    const anoFull = ano.length === 2 ? `20${ano}` : ano
    return `${anoFull}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`
  }
  return limpo
}

function parseBool(s: string): boolean {
  const norm = normalizar(s)
  return ['sim', 'true', '1', 'x', 'verdadeiro'].includes(norm)
}

function parseTipo(s: string): TipoConta {
  return normalizar(s).includes('lojista') ? 'lojista_digital' : 'mensalista'
}

function parseStatus(s: string): StatusConta {
  const norm = normalizar(s)
  if (norm.includes('encerr')) return 'encerrado'
  if (norm.includes('paus')) return 'pausado'
  return 'ativo'
}

/** Lê planilha CSV (cabeçalhos flexíveis, ; ou ,) e faz upsert por nome de cliente */
export function importarCSV(
  arquivo: File,
  contasExistentes: Account[],
  onConcluido: (importadas: number, erros: number, novasContas: Account[]) => void
): void {
  const reader = new FileReader()
  reader.onload = (e) => {
    const texto = (e.target?.result as string).replace(/^﻿/, '')
    const linhas = texto.split(/\r?\n/).filter((l) => l.trim() !== '')

    if (linhas.length < 2) {
      onConcluido(0, 0, contasExistentes)
      return
    }

    // Detecta separador pela linha de cabeçalho
    const sep = linhas[0].includes(';') ? ';' : ','

    // Mapeia índice de coluna → campo
    const cabecalhos = parseLinha(linhas[0], sep)
    const indices = new Map<string, number>()
    cabecalhos.forEach((cab, i) => {
      const campo = identificarColuna(cab)
      if (campo && !indices.has(campo)) indices.set(campo, i)
    })

    if (!indices.has('nome_cliente')) {
      // Sem coluna de cliente, nada a importar
      onConcluido(0, linhas.length - 1, contasExistentes)
      return
    }

    let importadas = 0
    let erros = 0
    const novasContas = [...contasExistentes]

    const pegar = (cols: string[], campo: string): string => {
      const idx = indices.get(campo)
      return idx != null ? (cols[idx] ?? '') : ''
    }

    linhas.slice(1).forEach((linha) => {
      const cols = parseLinha(linha, sep)
      const nome_cliente = pegar(cols, 'nome_cliente')
      const assessor = pegar(cols, 'assessor')

      if (!nome_cliente || !assessor) {
        erros++
        return
      }

      const metaVendas = parseNumero(pegar(cols, 'meta_vendas'))
      const vendasReais = parseNumero(pegar(cols, 'vendas_reais'))
      const fatAnterior = parseNumero(pegar(cols, 'faturamento_mes_anterior'))

      const conta: Account = {
        id: crypto.randomUUID(),
        nome_cliente,
        assessor,
        tipo: parseTipo(pegar(cols, 'tipo')),
        estrela: parseBool(pegar(cols, 'estrela')),
        data_inicio: parseData(pegar(cols, 'data_inicio')),
        data_termino: parseData(pegar(cols, 'data_termino')),
        meta_faturamento: parseNumero(pegar(cols, 'meta_faturamento')) ?? 0,
        faturamento_real: parseNumero(pegar(cols, 'faturamento_real')) ?? 0,
        ...(fatAnterior != null ? { faturamento_mes_anterior: fatAnterior } : {}),
        ...(metaVendas != null ? { meta_vendas: metaVendas } : {}),
        ...(vendasReais != null ? { vendas_reais: vendasReais } : {}),
        em_risco: parseBool(pegar(cols, 'em_risco')),
        status: parseStatus(pegar(cols, 'status')),
        observacao: pegar(cols, 'observacao'),
      }

      // Upsert por nome_cliente — atualiza existente, adiciona novo
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
