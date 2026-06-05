export const ASSESSORES = ['João', 'João 2', 'Anthony', 'Kauã']

export const TIPOS = ['Mensalista', 'Lojista Digital']

export const INITIAL_ACCOUNTS = [
  {
    id: '1',
    cliente: 'Kenno Esportes',
    assessor: 'Anthony',
    tipo: 'Mensalista',
    estrela: true,
    inicio: '2024-01-01',
    termino: '2026-12-31',
    meta: 80000,
    real: 72000,
    risco: false,
    status: 'Ativo',
  },
  {
    id: '2',
    cliente: 'Mundus Store',
    assessor: 'João',
    tipo: 'Lojista Digital',
    estrela: false,
    inicio: '2024-06-01',
    termino: '2026-07-31',
    meta: 30000,
    real: 12000,
    risco: true,
    status: 'Ativo',
  },
  {
    id: '3',
    cliente: 'TechFit Brasil',
    assessor: 'Kauã',
    tipo: 'Mensalista',
    estrela: true,
    inicio: '2025-01-01',
    termino: '2027-01-01',
    meta: 55000,
    real: 49500,
    risco: false,
    status: 'Ativo',
  },
  {
    id: '4',
    cliente: 'Casa & Lar',
    assessor: 'João 2',
    tipo: 'Lojista Digital',
    estrela: false,
    inicio: '2024-03-01',
    termino: '2026-06-30',
    meta: 20000,
    real: 8000,
    risco: true,
    status: 'Ativo',
  },
  {
    id: '5',
    cliente: 'SportMax',
    assessor: 'Anthony',
    tipo: 'Mensalista',
    estrela: false,
    inicio: '2025-03-01',
    termino: '2027-03-01',
    meta: 40000,
    real: 38000,
    risco: false,
    status: 'Ativo',
  },
]

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

export function calcPercent(real, meta) {
  if (!meta || meta === 0) return 0
  return Math.round((real / meta) * 100)
}

export function calcMesesRestantes(termino) {
  const hoje = new Date()
  const fim = new Date(termino)
  const diff = (fim.getFullYear() - hoje.getFullYear()) * 12 + (fim.getMonth() - hoje.getMonth())
  return Math.max(0, diff)
}

export function getPercentColor(pct) {
  if (pct >= 80) return 'green'
  if (pct >= 50) return 'yellow'
  return 'red'
}

export function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatDate(dateStr) {
  if (!dateStr) return '—'
  const [y, m, d] = dateStr.split('-')
  return `${d}/${m}/${y}`
}

export function loadAccounts() {
  try {
    const saved = localStorage.getItem('wxp_accounts')
    return saved ? JSON.parse(saved) : INITIAL_ACCOUNTS
  } catch {
    return INITIAL_ACCOUNTS
  }
}

export function saveAccounts(accounts) {
  localStorage.setItem('wxp_accounts', JSON.stringify(accounts))
}

export function exportCSV(accounts) {
  const headers = [
    'Cliente', 'Assessor', 'Tipo', 'Estrela', 'Início', 'Término',
    'Meses Restantes', 'Meta (R$)', 'Real (R$)', '% Atingido', 'Em Risco', 'Status'
  ]
  const rows = accounts.map(a => [
    a.cliente,
    a.assessor,
    a.tipo,
    a.estrela ? 'Sim' : 'Não',
    formatDate(a.inicio),
    formatDate(a.termino),
    calcMesesRestantes(a.termino),
    a.meta,
    a.real,
    calcPercent(a.real, a.meta) + '%',
    a.risco ? 'Sim' : 'Não',
    a.status,
  ])
  const csv = [headers, ...rows].map(r => r.join(';')).join('\n')
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `wxp-contas-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export function parseCSV(text) {
  const lines = text.trim().split('\n')
  if (lines.length < 2) return null
  return lines.slice(1).map((line, i) => {
    const cols = line.split(';')
    return {
      id: generateId() + i,
      cliente: cols[0] || '',
      assessor: cols[1] || '',
      tipo: cols[2] || 'Mensalista',
      estrela: cols[3] === 'Sim',
      inicio: cols[4] ? cols[4].split('/').reverse().join('-') : '',
      termino: cols[5] ? cols[5].split('/').reverse().join('-') : '',
      meta: Number(cols[7]) || 0,
      real: Number(cols[8]) || 0,
      risco: cols[10] === 'Sim',
      status: cols[11] || 'Ativo',
    }
  })
}
