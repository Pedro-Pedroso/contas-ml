// Strip secundária — 5 células com indicadores de segundo nível

interface Props {
  atingMedio: number
  metaBatida: number
  rampadas: number
  prazosCriticos: number
  iniciais: number
  estrela: number
}

export function SummaryCards({ atingMedio, metaBatida, rampadas, prazosCriticos, iniciais, estrela }: Props) {
  const atingColor = atingMedio >= 80 ? 'var(--green)' : atingMedio >= 50 ? 'var(--amber)' : 'var(--red)'

  return (
    <div className="strip">
      <div className="strip-cell">
        <span className="s-label">
          <span className="dotmark accent" />
          Ating. médio
        </span>
        <span className="s-val" style={{ color: atingColor }}>
          {atingMedio}<span className="u">%</span>
        </span>
      </div>

      <div className="strip-cell">
        <span className="s-label">Metas batidas</span>
        <span className="s-val dim">
          {metaBatida}<span className="u">/ {rampadas}</span>
        </span>
      </div>

      <div className="strip-cell">
        <span className="s-label">
          {prazosCriticos > 0 && <span className="dotmark amber" />}
          Prazos críticos
        </span>
        <span className={`s-val ${prazosCriticos > 0 ? 'warn' : 'dim'}`}>
          {prazosCriticos}
        </span>
      </div>

      <div className="strip-cell">
        <span className="s-label">Em fase inicial</span>
        <span className="s-val dim">{iniciais}</span>
      </div>

      <div className="strip-cell">
        <span className="s-label">Clientes estrela</span>
        <span className="s-val dim">{estrela}</span>
      </div>
    </div>
  )
}
