import React from 'react'
import { calcPercent, calcMesesRestantes } from '../utils/data'

const cardStyle = (delay) => ({
  background: 'var(--bg-card)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-lg)',
  padding: '24px 28px',
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  animation: 'fadeUp 0.4s ease forwards',
  animationDelay: delay,
  opacity: 0,
})

export default function SummaryCards({ accounts }) {
  const ativos = accounts.filter(a => a.status === 'Ativo')
  const emRisco = ativos.filter(a => a.risco)
  const encerrando = ativos.filter(a => calcMesesRestantes(a.termino) <= 2)

  const totalMeta = ativos.reduce((s, a) => s + (a.meta || 0), 0)
  const totalReal = ativos.reduce((s, a) => s + (a.real || 0), 0)
  const pctMedio = calcPercent(totalReal, totalMeta)
  const pctColor = pctMedio >= 80 ? 'var(--green)' : pctMedio >= 50 ? 'var(--yellow)' : 'var(--red)'

  const cards = [
    {
      label: 'Contas Ativas',
      value: ativos.length,
      sub: `${accounts.length} total`,
      color: 'var(--accent)',
      bg: 'var(--accent-dim)',
      delay: '0ms',
    },
    {
      label: 'Em Risco',
      value: emRisco.length,
      sub: emRisco.length === 0 ? 'Tudo sob controle' : emRisco.map(a => a.cliente).join(', '),
      color: emRisco.length > 0 ? 'var(--red)' : 'var(--green)',
      bg: emRisco.length > 0 ? 'var(--red-dim)' : 'var(--green-dim)',
      delay: '80ms',
    },
    {
      label: '% Médio de Meta',
      value: pctMedio + '%',
      sub: `R$ ${totalReal.toLocaleString('pt-BR')} de R$ ${totalMeta.toLocaleString('pt-BR')}`,
      color: pctColor,
      bg: pctMedio >= 80 ? 'var(--green-dim)' : pctMedio >= 50 ? 'var(--yellow-dim)' : 'var(--red-dim)',
      delay: '160ms',
    },
    {
      label: 'Encerrando em 60d',
      value: encerrando.length,
      sub: encerrando.length === 0 ? 'Nenhuma' : encerrando.map(a => a.cliente).join(', '),
      color: encerrando.length > 0 ? 'var(--orange)' : 'var(--text-secondary)',
      bg: encerrando.length > 0 ? 'var(--orange-dim)' : 'transparent',
      delay: '240ms',
    },
  ]

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: 16,
      marginBottom: 32,
    }}>
      {cards.map((card) => (
        <div key={card.label} style={cardStyle(card.delay)}>
          <span style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-display)',
          }}>
            {card.label}
          </span>
          <span style={{
            fontSize: 36,
            fontWeight: 800,
            fontFamily: 'var(--font-display)',
            color: card.color,
            lineHeight: 1,
          }}>
            {card.value}
          </span>
          <span style={{
            fontSize: 12,
            color: 'var(--text-secondary)',
            marginTop: 4,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }} title={card.sub}>
            {card.sub}
          </span>
        </div>
      ))}
    </div>
  )
}
