import React, { useState } from 'react'
import { Star, AlertTriangle, Clock, Pencil, Trash2, ChevronUp, ChevronDown } from 'lucide-react'
import { calcPercent, calcMesesRestantes, formatCurrency, formatDate, getPercentColor } from '../utils/data'

function PercentBar({ pct }) {
  const color = getPercentColor(pct)
  const cssColor = `var(--${color})`
  const bgColor = `var(--${color}-dim)`
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{
        flex: 1,
        height: 4,
        background: 'var(--border)',
        borderRadius: 2,
        overflow: 'hidden',
        minWidth: 60,
      }}>
        <div style={{
          height: '100%',
          width: `${Math.min(pct, 100)}%`,
          background: cssColor,
          borderRadius: 2,
          transition: 'width 0.6s ease',
        }} />
      </div>
      <span style={{
        fontSize: 12,
        fontWeight: 600,
        color: cssColor,
        minWidth: 36,
        textAlign: 'right',
        fontFamily: 'var(--font-display)',
      }}>
        {pct}%
      </span>
    </div>
  )
}

function Badge({ children, color, dim }) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      padding: '3px 8px',
      borderRadius: 6,
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: '0.04em',
      color,
      background: dim,
      fontFamily: 'var(--font-display)',
      whiteSpace: 'nowrap',
    }}>
      {children}
    </span>
  )
}

const TH = ({ children, sortKey, sortConfig, onSort, style = {} }) => {
  const active = sortConfig?.key === sortKey
  return (
    <th
      onClick={() => sortKey && onSort(sortKey)}
      style={{
        padding: '12px 16px',
        textAlign: 'left',
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: active ? 'var(--accent)' : 'var(--text-muted)',
        fontFamily: 'var(--font-display)',
        cursor: sortKey ? 'pointer' : 'default',
        userSelect: 'none',
        whiteSpace: 'nowrap',
        borderBottom: '1px solid var(--border)',
        ...style,
      }}
    >
      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {children}
        {sortKey && active && (
          sortConfig.dir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
        )}
      </span>
    </th>
  )
}

export default function AccountsTable({ accounts, onEdit, onDelete }) {
  const [sortConfig, setSortConfig] = useState({ key: 'cliente', dir: 'asc' })

  const handleSort = (key) => {
    setSortConfig(prev =>
      prev.key === key
        ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
        : { key, dir: 'asc' }
    )
  }

  const sorted = [...accounts].sort((a, b) => {
    const { key, dir } = sortConfig
    let va, vb
    if (key === 'pct') {
      va = calcPercent(a.real, a.meta)
      vb = calcPercent(b.real, b.meta)
    } else if (key === 'mesesRestantes') {
      va = calcMesesRestantes(a.termino)
      vb = calcMesesRestantes(b.termino)
    } else {
      va = a[key]
      vb = b[key]
    }
    if (va < vb) return dir === 'asc' ? -1 : 1
    if (va > vb) return dir === 'asc' ? 1 : -1
    return 0
  })

  if (accounts.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '64px 32px',
        color: 'var(--text-muted)',
        fontFamily: 'var(--font-display)',
      }}>
        Nenhuma conta encontrada com os filtros aplicados.
      </div>
    )
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <TH sortKey="cliente" sortConfig={sortConfig} onSort={handleSort}>Cliente</TH>
            <TH sortKey="assessor" sortConfig={sortConfig} onSort={handleSort}>Assessor</TH>
            <TH sortKey="tipo" sortConfig={sortConfig} onSort={handleSort}>Tipo</TH>
            <TH>Flags</TH>
            <TH sortKey="inicio" sortConfig={sortConfig} onSort={handleSort}>Início</TH>
            <TH sortKey="termino" sortConfig={sortConfig} onSort={handleSort}>Término</TH>
            <TH sortKey="mesesRestantes" sortConfig={sortConfig} onSort={handleSort}>Restam</TH>
            <TH sortKey="meta" sortConfig={sortConfig} onSort={handleSort}>Meta</TH>
            <TH sortKey="real" sortConfig={sortConfig} onSort={handleSort}>Real</TH>
            <TH sortKey="pct" sortConfig={sortConfig} onSort={handleSort} style={{ minWidth: 140 }}>Atingimento</TH>
            <TH>Ações</TH>
          </tr>
        </thead>
        <tbody>
          {sorted.map((account, idx) => {
            const pct = calcPercent(account.real, account.meta)
            const meses = calcMesesRestantes(account.termino)
            const encerrando = meses <= 2

            return (
              <tr
                key={account.id}
                style={{
                  borderBottom: '1px solid var(--border-light)',
                  transition: 'background 0.15s',
                  animation: 'fadeIn 0.3s ease forwards',
                  animationDelay: `${idx * 30}ms`,
                  opacity: 0,
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                {/* Cliente */}
                <td style={{ padding: '14px 16px' }}>
                  <span style={{
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-display)',
                    fontSize: 13,
                  }}>
                    {account.cliente}
                  </span>
                </td>

                {/* Assessor */}
                <td style={{ padding: '14px 16px', color: 'var(--text-secondary)', fontSize: 13 }}>
                  {account.assessor}
                </td>

                {/* Tipo */}
                <td style={{ padding: '14px 16px' }}>
                  <Badge
                    color={account.tipo === 'Mensalista' ? 'var(--accent)' : 'var(--text-secondary)'}
                    dim={account.tipo === 'Mensalista' ? 'var(--accent-dim)' : 'var(--bg-input)'}
                  >
                    {account.tipo}
                  </Badge>
                </td>

                {/* Flags */}
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    {account.estrela && (
                      <span title="Cliente Estrela">
                        <Star size={14} fill="var(--yellow)" color="var(--yellow)" />
                      </span>
                    )}
                    {account.risco && (
                      <span title="Em Risco">
                        <AlertTriangle size={14} color="var(--red)" />
                      </span>
                    )}
                    {encerrando && (
                      <span title={`Encerra em ${meses} mês(es)`}>
                        <Clock size={14} color="var(--orange)" />
                      </span>
                    )}
                    {!account.estrela && !account.risco && !encerrando && (
                      <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>—</span>
                    )}
                  </div>
                </td>

                {/* Início */}
                <td style={{ padding: '14px 16px', color: 'var(--text-secondary)', fontSize: 12, whiteSpace: 'nowrap' }}>
                  {formatDate(account.inicio)}
                </td>

                {/* Término */}
                <td style={{ padding: '14px 16px', fontSize: 12, whiteSpace: 'nowrap' }}>
                  <span style={{ color: encerrando ? 'var(--orange)' : 'var(--text-secondary)', fontWeight: encerrando ? 600 : 400 }}>
                    {formatDate(account.termino)}
                  </span>
                </td>

                {/* Meses restantes */}
                <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                  <span style={{
                    fontSize: 13,
                    fontWeight: 700,
                    fontFamily: 'var(--font-display)',
                    color: encerrando ? 'var(--orange)' : meses > 6 ? 'var(--text-secondary)' : 'var(--yellow)',
                  }}>
                    {meses}m
                  </span>
                </td>

                {/* Meta */}
                <td style={{ padding: '14px 16px', color: 'var(--text-secondary)', fontSize: 13, whiteSpace: 'nowrap' }}>
                  {formatCurrency(account.meta)}
                </td>

                {/* Real */}
                <td style={{ padding: '14px 16px', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap' }}>
                  <span style={{ color: `var(--${getPercentColor(pct)})` }}>
                    {formatCurrency(account.real)}
                  </span>
                </td>

                {/* Atingimento */}
                <td style={{ padding: '14px 16px', minWidth: 140 }}>
                  <PercentBar pct={pct} />
                </td>

                {/* Ações */}
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => onEdit(account)}
                      style={{
                        background: 'none',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '6px',
                        cursor: 'pointer',
                        color: 'var(--text-secondary)',
                        display: 'flex',
                        transition: 'all 0.15s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
                      title="Editar"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => onDelete(account.id)}
                      style={{
                        background: 'none',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '6px',
                        cursor: 'pointer',
                        color: 'var(--text-secondary)',
                        display: 'flex',
                        transition: 'all 0.15s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--red)'; e.currentTarget.style.color = 'var(--red)' }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
                      title="Excluir"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
