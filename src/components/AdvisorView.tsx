import { Account } from '../types'
import { calcMetricasPorAssessor, corPercentualMeta, formatarMoeda } from '../utils/calculations'

interface Props {
  contas: Account[]
}

function metaClass(percentual: number | null) {
  if (percentual === null) return 'metric-pill warning'
  if (percentual >= 80) return 'metric-pill success'
  if (percentual >= 50) return 'metric-pill warning'
  return 'metric-pill danger'
}

export function AdvisorView({ contas }: Props) {
  const metricas = calcMetricasPorAssessor(contas)

  if (metricas.length === 0) {
    return (
      <section className="accounts-panel" aria-label="Visão por assessor">
        <div className="panel-toolbar">
          <div>
            <span className="section-kicker">Assessores</span>
            <h2>Visão por assessor</h2>
          </div>
        </div>
        <p className="empty-state" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          Nenhuma conta ativa encontrada.
        </p>
      </section>
    )
  }

  return (
    <section className="accounts-panel" aria-label="Visão por assessor">
      <div className="panel-toolbar">
        <div>
          <span className="section-kicker">Assessores</span>
          <h2>Visão por assessor</h2>
          <p>{metricas.length} assessore(s) com contas ativas</p>
        </div>
      </div>

      <div className="table-shell">
        <table className="accounts-table advisor-table">
          <thead>
            <tr>
              <th>Assessor</th>
              <th>Contas ativas</th>
              <th>Em fase inicial</th>
              <th>Atingimento médio</th>
              <th>GMV total</th>
            </tr>
          </thead>
          <tbody>
            {metricas.map((m) => (
              <tr key={m.assessor}>
                <td data-label="Assessor">
                  <strong>{m.assessor}</strong>
                </td>
                <td data-label="Contas ativas">
                  <span className="metric-pill" style={{ background: 'var(--accent-soft)', color: 'var(--accent-strong)' }}>
                    {m.totalContas}
                  </span>
                </td>
                <td data-label="Em fase inicial">
                  {m.iniciais > 0 ? (
                    <span className="badge badge-inicial">{m.iniciais} inicial{m.iniciais > 1 ? 'is' : ''}</span>
                  ) : (
                    <span className="muted">—</span>
                  )}
                </td>
                <td data-label="Atingimento médio">
                  {m.mediaAtingimento === null ? (
                    <span className="muted" style={{ fontSize: '12px' }}>Só iniciais</span>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '120px' }}>
                      <span className={metaClass(m.mediaAtingimento)}>{m.mediaAtingimento}%</span>
                      <div className="progress-track" aria-hidden="true">
                        <span style={{
                          display: 'block',
                          height: '100%',
                          borderRadius: 'inherit',
                          width: `${Math.min(m.mediaAtingimento, 100)}%`,
                          background: corPercentualMeta(m.mediaAtingimento),
                        }} />
                      </div>
                    </div>
                  )}
                </td>
                <td data-label="GMV total">
                  <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
                    {formatarMoeda(m.gmvTotal)}
                  </strong>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
