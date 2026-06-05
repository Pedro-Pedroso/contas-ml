import React, { useState, useCallback, useRef } from 'react'
import { Plus, Download, Upload, LayoutDashboard } from 'lucide-react'
import SummaryCards from './components/SummaryCards'
import AccountsTable from './components/AccountsTable'
import AccountModal from './components/AccountModal'
import Filters from './components/Filters'
import { loadAccounts, saveAccounts, exportCSV, parseCSV } from './utils/data'

const FILTER_DEFAULTS = { search: '', assessor: '', tipo: '', risco: '', status: 'Ativo' }

export default function App() {
  const [accounts, setAccounts] = useState(() => loadAccounts())
  const [modal, setModal] = useState(null) // null | 'new' | account object
  const [filters, setFilters] = useState(FILTER_DEFAULTS)
  const [toast, setToast] = useState(null)
  const importRef = useRef()

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const persist = (next) => {
    setAccounts(next)
    saveAccounts(next)
  }

  const handleSave = useCallback((account) => {
    setAccounts(prev => {
      const exists = prev.find(a => a.id === account.id)
      const next = exists
        ? prev.map(a => a.id === account.id ? account : a)
        : [...prev, account]
      saveAccounts(next)
      return next
    })
    setModal(null)
    showToast(account.id ? 'Conta atualizada com sucesso!' : 'Conta adicionada com sucesso!')
  }, [])

  const handleDelete = useCallback((id) => {
    if (!window.confirm('Tem certeza que deseja excluir esta conta?')) return
    setAccounts(prev => {
      const next = prev.filter(a => a.id !== id)
      saveAccounts(next)
      return next
    })
    showToast('Conta excluída.', 'info')
  }, [])

  const handleImport = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const parsed = parseCSV(ev.target.result)
      if (!parsed || parsed.length === 0) {
        showToast('CSV inválido ou vazio.', 'error')
        return
      }
      persist([...accounts, ...parsed])
      showToast(`${parsed.length} contas importadas!`)
    }
    reader.readAsText(file, 'utf-8')
    e.target.value = ''
  }

  const filtered = accounts.filter(a => {
    if (filters.status && a.status !== filters.status) return false
    if (filters.assessor && a.assessor !== filters.assessor) return false
    if (filters.tipo && a.tipo !== filters.tipo) return false
    if (filters.risco !== '' && String(a.risco) !== filters.risco) return false
    if (filters.search && !a.cliente.toLowerCase().includes(filters.search.toLowerCase())) return false
    return true
  })

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Header */}
      <header style={{
        borderBottom: '1px solid var(--border)',
        padding: '0 40px',
        background: 'var(--bg-card)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <div style={{
          maxWidth: 1440,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 60,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 32, height: 32,
              background: 'var(--accent)',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <LayoutDashboard size={16} color="white" />
            </div>
            <div>
              <span style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: 16,
                color: 'var(--text-primary)',
                letterSpacing: '-0.02em',
              }}>
                WXP
              </span>
              <span style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 400,
                fontSize: 13,
                color: 'var(--text-muted)',
                marginLeft: 8,
              }}>
                Painel de Contas
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <input
              ref={importRef}
              type="file"
              accept=".csv"
              style={{ display: 'none' }}
              onChange={handleImport}
            />
            <button
              onClick={() => importRef.current.click()}
              style={btnSecondary}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              <Upload size={14} /> Importar CSV
            </button>
            <button
              onClick={() => exportCSV(accounts)}
              style={btnSecondary}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              <Download size={14} /> Exportar CSV
            </button>
            <button
              onClick={() => setModal('new')}
              style={btnPrimary}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              <Plus size={14} /> Nova Conta
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main style={{ maxWidth: 1440, margin: '0 auto', padding: '36px 40px' }}>

        {/* Summary cards */}
        <SummaryCards accounts={accounts} />

        {/* Table section */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          animation: 'fadeUp 0.4s ease 0.3s forwards',
          opacity: 0,
        }}>
          {/* Table header */}
          <div style={{
            padding: '20px 24px 16px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            flexWrap: 'wrap',
          }}>
            <div>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: 15,
                color: 'var(--text-primary)',
                marginBottom: 2,
              }}>
                Contas Gerenciadas
              </h2>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {filtered.length} conta{filtered.length !== 1 ? 's' : ''} exibida{filtered.length !== 1 ? 's' : ''}
                {accounts.length !== filtered.length && ` de ${accounts.length}`}
              </span>
            </div>
          </div>

          {/* Filters */}
          <div style={{ padding: '16px 24px 0' }}>
            <Filters
              filters={filters}
              onChange={(key, val) => setFilters(f => ({ ...f, [key]: val }))}
              onReset={() => setFilters(FILTER_DEFAULTS)}
            />
          </div>

          {/* Table */}
          <AccountsTable
            accounts={filtered}
            onEdit={(account) => setModal(account)}
            onDelete={handleDelete}
          />
        </div>

        {/* Legend */}
        <div style={{
          display: 'flex', gap: 24, marginTop: 20,
          padding: '0 4px',
          flexWrap: 'wrap',
        }}>
          {[
            { icon: '⭐', label: 'Cliente Estrela' },
            { icon: '⚠️', label: 'Em Risco' },
            { icon: '🕐', label: 'Encerrando em até 2 meses' },
            { color: 'var(--green)', label: '≥ 80% da meta' },
            { color: 'var(--yellow)', label: '50–79% da meta' },
            { color: 'var(--red)', label: '< 50% da meta' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {item.icon && <span style={{ fontSize: 12 }}>{item.icon}</span>}
              {item.color && <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.color, flexShrink: 0 }} />}
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.label}</span>
            </div>
          ))}
        </div>
      </main>

      {/* Modal */}
      {modal && (
        <AccountModal
          account={modal === 'new' ? null : modal}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 28, right: 28,
          background: toast.type === 'error' ? 'var(--red)' : toast.type === 'info' ? 'var(--bg-input)' : 'var(--green)',
          color: toast.type === 'info' ? 'var(--text-secondary)' : 'white',
          padding: '12px 20px',
          borderRadius: 'var(--radius-sm)',
          fontFamily: 'var(--font-display)',
          fontWeight: 600,
          fontSize: 13,
          animation: 'fadeUp 0.25s ease',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          zIndex: 2000,
        }}>
          {toast.msg}
        </div>
      )}
    </div>
  )
}

const btnPrimary = {
  display: 'flex', alignItems: 'center', gap: 6,
  background: 'var(--accent)',
  border: 'none',
  borderRadius: 'var(--radius-sm)',
  padding: '8px 16px',
  color: 'white',
  cursor: 'pointer',
  fontFamily: 'var(--font-display)',
  fontWeight: 700,
  fontSize: 13,
  transition: 'opacity 0.15s',
}

const btnSecondary = {
  display: 'flex', alignItems: 'center', gap: 6,
  background: 'none',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-sm)',
  padding: '8px 14px',
  color: 'var(--text-secondary)',
  cursor: 'pointer',
  fontFamily: 'var(--font-display)',
  fontWeight: 600,
  fontSize: 13,
  transition: 'border-color 0.15s',
}
