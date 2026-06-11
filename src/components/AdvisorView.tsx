import { useState } from 'react'
import { Account } from '../types'
import { Icon, Avatar, Bar } from './Primitives'
import {
  calcMetricasPorAssessor,
  calcPercentualMeta,
  formatarMoeda,
  isContaInicial,
  nomesMesesComparacao,
} from '../utils/calculations'

interface Props { contas: Account[] }

function BRLk(valor: number): string {
  if (Math.abs(valor) >= 1000) {
    return 'R$ ' + (valor / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + 'k'
  }
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
}

interface AdvisorCardProps {
  row: ReturnType<typeof calcMetricasPorAssessor>[number] & { rank: number }
  defaultOpen: boolean
}

function AdvisorCard({ row, defaultOpen }: AdvisorCardProps) {
  const [open, setOpen] = useState(defaultOpen)

  const aColor = row.mediaAtingimento == null
    ? 'var(--text-soft)'
    : row.mediaAtingimento >= 80 ? 'var(--green)'
    : row.mediaAtingimento >= 50 ? 'var(--amber)'
    : 'var(--red)'
  const aClass = row.mediaAtingimento == null ? ''
    : row.mediaAtingimento >= 80 ? 'is-green'
    : row.mediaAtingimento >= 50 ? 'is-amber'
    : 'is-red'

  const contasOrdenadas = [...row.contas].sort(
    (a, b) => calcPercentualMeta(b) - calcPercentualMeta(a)
  )

  return (
    <div className="advisor-card">
      <div className="ac-head">
        <Avatar name={row.assessor} size={42} />
        <div>
          <div className="ac-name">{row.assessor}</div>
          <div className="ac-role">Assessor de carteira</div>
        </div>
        <span className="ac-rank">#{row.rank} no time</span>
      </div>

      {/* Linha de 4 stats */}
      <div className="ac-stats">
        <div className="ac-stat">
          <div className="l">Contas</div>
          <div className="v">
            {row.totalContas}
            {row.iniciais > 0 && (
              <span className="u new">+{row.iniciais} nova{row.iniciais > 1 ? 's' : ''}</span>
            )}
          </div>
        </div>
        <div className="ac-stat">
          <div className="l">Ating. médio</div>
          <div className={`v ${aClass}`} style={{ color: aColor }}>
            {row.mediaAtingimento == null
              ? '—'
              : <>{row.mediaAtingimento}<span className="u">%</span></>
            }
          </div>
        </div>
        <div className="ac-stat">
          <div className="l">GMV gerido</div>
          <div className="v gmv">{BRLk(row.gmvTotal)}</div>
        </div>
        <div className="ac-stat">
          <div className="l">Cresc. médio</div>
          <div
            className="v"
            style={{
              color: row.mediaCrescimento == null
                ? 'var(--text-soft)'
                : row.mediaCrescimento > 0 ? 'var(--green)'
                : row.mediaCrescimento < 0 ? 'var(--red)'
                : 'var(--text)',
            }}
            title={`Média simples do crescimento das contas — ${nomesMesesComparacao().anterior} vs ${nomesMesesComparacao().retrasado} (meses fechados)`}
          >
            {row.mediaCrescimento == null ? (
              '—'
            ) : (
              <>
                {row.mediaCrescimento > 0 ? '+' : ''}
                {row.mediaCrescimento.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}
                <span className="u">%</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Rodapé: contas novas excluídas */}
      {row.iniciais > 0 && (
        <div className="ac-note">
          <span className="ic"><Icon name="alert" size={13} /></span>
          <span>
            <b>{row.iniciais} conta{row.iniciais > 1 ? 's' : ''} nova{row.iniciais > 1 ? 's' : ''}</b>{' '}
            em ramp-up — fora do atingimento médio ({row.rampadas} avaliada{row.rampadas !== 1 ? 's' : ''}).
          </span>
        </div>
      )}

      {/* Barra de atingimento */}
      <div className="ac-bar">
        <div className="bl">
          <span>Progresso médio da carteira</span>
          {row.emRisco > 0 && (
            <span style={{ color: 'var(--red)' }}>{row.emRisco} em risco</span>
          )}
        </div>
        <Bar pct={row.mediaAtingimento ?? 0} />
      </div>

      {/* Expand / collapse */}
      <button
        className={`ac-expand${open ? ' open' : ''}`}
        onClick={() => setOpen((o) => !o)}
      >
        {open ? 'Ocultar contas' : `Ver ${row.totalContas} contas`}
        <span className="chev"><Icon name="chevron" size={16} /></span>
      </button>

      <div className={`collapse${open ? ' open' : ''}`}>
        <div>
          <div className="ac-accounts">
            {contasOrdenadas.map((conta) => {
              const p = calcPercentualMeta(conta)
              const inicial = isContaInicial(conta)
              const cor = p >= 80 ? 'is-green' : p >= 50 ? 'is-amber' : 'is-red'
              return (
                <div className={`mini-row${inicial ? ' inicial' : ''}`} key={conta.id}>
                  <div className="mini-cli">
                    {conta.estrela && (
                      <span className="badge star" style={{ padding: 0 }}>
                        <Icon name="star" size={12} />
                      </span>
                    )}
                    <b>{conta.nome_cliente}</b>
                    {inicial && (
                      <span className="badge inicial" style={{ height: 19, fontSize: '10.5px' }}>Inicial</span>
                    )}
                    {conta.em_risco && (
                      <span className="badge risk" style={{ height: 19, fontSize: '10.5px' }}>Risco</span>
                    )}
                  </div>
                  <Bar pct={p} />
                  <span className={`mini-pct ${inicial ? '' : cor}`}>
                    {inicial ? '—' : `${p}%`}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export function AdvisorView({ contas }: Props) {
  const rows = calcMetricasPorAssessor(contas)

  // adicionar rank (sorted por atingimento desc, nulls last)
  const ranked = [...rows]
    .sort((a, b) => (b.mediaAtingimento ?? -1) - (a.mediaAtingimento ?? -1))
    .map((r, i) => ({ ...r, rank: i + 1 }))

  const totalGmv = ranked.reduce((s, r) => s + r.gmvTotal, 0)

  return (
    <>
      <div className="section-head">
        <div>
          <h2>Time de assessores</h2>
          <p>
            {ranked.length} assessore{ranked.length !== 1 ? 's' : ''} · {BRLk(totalGmv)} sob gestão · ordenados por atingimento
          </p>
        </div>
      </div>

      {ranked.length === 0 ? (
        <div className="empty">Nenhuma conta ativa encontrada.</div>
      ) : (
        <div className="advisor-grid">
          {ranked.map((row, i) => (
            <AdvisorCard key={row.assessor} row={row} defaultOpen={i < 2} />
          ))}
        </div>
      )}
    </>
  )
}
