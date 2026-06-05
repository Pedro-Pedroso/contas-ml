import React from 'react'
import { Search, X } from 'lucide-react'
import { ASSESSORES } from '../utils/data'

const selectStyle = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-sm)',
  padding: '8px 12px',
  color: 'var(--text-secondary)',
  fontSize: 13,
  fontFamily: 'var(--font-body)',
  cursor: 'pointer',
  outline: 'none',
}

export default function Filters({ filters, onChange, onReset }) {
  const hasActive = filters.search || filters.assessor || filters.tipo || filters.risco || filters.status !== 'Ativo'

  return (
    <div style={{
      display: 'flex',
      gap: 12,
      alignItems: 'center',
      flexWrap: 'wrap',
      marginBottom: 16,
    }}>
      {/* Search */}
      <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
        <Search size={14} style={{
          position: 'absolute', left: 12, top: '50%',
          transform: 'translateY(-50%)',
          color: 'var(--text-muted)',
          pointerEvents: 'none',
        }} />
        <input
          style={{
            ...selectStyle,
            width: '100%',
            paddingLeft: 36,
            cursor: 'text',
          }}
          placeholder="Buscar cliente..."
          value={filters.search}
          onChange={e => onChange('search', e.target.value)}
        />
      </div>

      <select style={selectStyle} value={filters.assessor} onChange={e => onChange('assessor', e.target.value)}>
        <option value="">Todos os assessores</option>
        {ASSESSORES.map(a => <option key={a} value={a}>{a}</option>)}
      </select>

      <select style={selectStyle} value={filters.tipo} onChange={e => onChange('tipo', e.target.value)}>
        <option value="">Todos os tipos</option>
        <option value="Mensalista">Mensalista</option>
        <option value="Lojista Digital">Lojista Digital</option>
      </select>

      <select style={selectStyle} value={filters.status} onChange={e => onChange('status', e.target.value)}>
        <option value="Ativo">Ativos</option>
        <option value="Pausado">Pausados</option>
        <option value="Concluído">Concluídos</option>
        <option value="">Todos</option>
      </select>

      <select style={selectStyle} value={filters.risco} onChange={e => onChange('risco', e.target.value)}>
        <option value="">Todos os riscos</option>
        <option value="true">Em risco</option>
        <option value="false">Sem risco</option>
      </select>

      {hasActive && (
        <button
          onClick={onReset}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'none',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            padding: '8px 12px',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            fontSize: 12,
            fontFamily: 'var(--font-display)',
            fontWeight: 600,
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--red)'; e.currentTarget.style.color = 'var(--red)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)' }}
        >
          <X size={12} /> Limpar filtros
        </button>
      )}
    </div>
  )
}
