import { type ChangeEvent } from 'react'
import { Filtros, Account } from '../types'

interface Props {
  filtros: Filtros
  onChange: (filtros: Filtros) => void
  contas: Account[]
}

const FILTROS_LIMPOS: Filtros = {
  assessor: '',
  tipo: '',
  risco: '',
  status: '',
  busca: '',
}

export function Filters({ filtros, onChange, contas }: Props) {
  const assessores = Array.from(new Set(contas.map((conta) => conta.assessor))).sort()
  const filtrosAtivos = Object.values(filtros).filter(Boolean).length

  const set = (campo: keyof Filtros) =>
    (event: ChangeEvent<HTMLSelectElement | HTMLInputElement>) =>
      onChange({ ...filtros, [campo]: event.target.value })

  return (
    <section className="filters-panel" aria-label="Filtros da carteira">
      <div className="filters-header">
        <div>
          <span className="section-kicker">Filtros</span>
          <h2>Encontrar contas</h2>
        </div>

        <button
          type="button"
          className="button button-ghost"
          onClick={() => onChange(FILTROS_LIMPOS)}
          disabled={filtrosAtivos === 0}
        >
          Limpar
        </button>
      </div>

      <div className="filters-grid">
        <label className="field">
          <span>Cliente</span>
          <input
            type="text"
            placeholder="Buscar por nome"
            value={filtros.busca}
            onChange={set('busca')}
          />
        </label>

        <label className="field">
          <span>Assessor</span>
          <select value={filtros.assessor} onChange={set('assessor')}>
            <option value="">Todos</option>
            {assessores.map((assessor) => (
              <option key={assessor} value={assessor}>{assessor}</option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Tipo</span>
          <select value={filtros.tipo} onChange={set('tipo')}>
            <option value="">Todos</option>
            <option value="mensalista">Mensalista</option>
            <option value="lojista_digital">Lojista Digital</option>
          </select>
        </label>

        <label className="field">
          <span>Status</span>
          <select value={filtros.status} onChange={set('status')}>
            <option value="">Todos</option>
            <option value="ativo">Ativo</option>
            <option value="encerrado">Encerrado</option>
            <option value="pausado">Pausado</option>
          </select>
        </label>

        <label className="field">
          <span>Risco</span>
          <select value={filtros.risco} onChange={set('risco')}>
            <option value="">Todos</option>
            <option value="sim">Em risco</option>
            <option value="nao">Sem risco</option>
          </select>
        </label>
      </div>
    </section>
  )
}
