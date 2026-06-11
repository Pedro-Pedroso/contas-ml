import { useState, useEffect, type ChangeEvent, type FormEvent, type ReactNode } from 'react'
import { Account } from '../types'

interface Props {
  conta?: Account | null
  onSalvar: (dados: Omit<Account, 'id'>) => void
  onFechar: () => void
}

const VAZIO: Omit<Account, 'id'> = {
  nome_cliente: '',
  assessor: '',
  tipo: 'mensalista',
  estrela: false,
  data_inicio: '',
  data_termino: '',
  meta_faturamento: 0,
  faturamento_30d: 0,
  em_risco: false,
  status: 'ativo',
  observacao: '',
}

export function AccountForm({ conta, onSalvar, onFechar }: Props) {
  const [form, setForm] = useState<Omit<Account, 'id'>>(VAZIO)

  useEffect(() => {
    if (conta) {
      const { id: _id, ...dados } = conta
      setForm(dados)
    } else {
      setForm(VAZIO)
    }
  }, [conta])

  const set =
    <K extends keyof Omit<Account, 'id'>>(campo: K) =>
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const valor =
        event.target.type === 'checkbox'
          ? (event.target as HTMLInputElement).checked
          : event.target.type === 'number'
          ? Number(event.target.value)
          : event.target.value
      setForm((prev) => ({ ...prev, [campo]: valor }))
    }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    onSalvar(form)
  }

  return (
    <div className="modal-overlay" onClick={onFechar}>
      <section className="modal-card" onClick={(event) => event.stopPropagation()} aria-modal="true" role="dialog">
        <header className="modal-header">
          <div>
            <span className="section-kicker">Conta</span>
            <h2>{conta ? 'Editar conta' : 'Nova conta'}</h2>
          </div>
          <button type="button" onClick={onFechar} className="icon-button" aria-label="Fechar formulário">
            ×
          </button>
        </header>

        <form onSubmit={handleSubmit} className="account-form">
          <div className="form-grid">
            <Campo label="Nome do cliente">
              <input className="control" required value={form.nome_cliente} onChange={set('nome_cliente')} />
            </Campo>
            <Campo label="Assessor">
              <input className="control" required value={form.assessor} onChange={set('assessor')} />
            </Campo>
          </div>

          <div className="form-grid">
            <Campo label="Tipo">
              <select className="control" required value={form.tipo} onChange={set('tipo')}>
                <option value="mensalista">Mensalista</option>
                <option value="lojista_digital">Lojista Digital</option>
              </select>
            </Campo>
            <Campo label="Status">
              <select className="control" required value={form.status} onChange={set('status')}>
                <option value="ativo">Ativo</option>
                <option value="encerrado">Encerrado</option>
                <option value="pausado">Pausado</option>
              </select>
            </Campo>
          </div>

          <div className="form-grid">
            <Campo label="Data de início">
              <input type="date" className="control" required value={form.data_inicio} onChange={set('data_inicio')} />
            </Campo>
            <Campo label="Data de término">
              <input type="date" className="control" required value={form.data_termino} onChange={set('data_termino')} />
            </Campo>
          </div>

          <div className="form-grid">
            <Campo label={form.tipo === 'lojista_digital' ? 'Meta de faturamento (60 dias)' : 'Meta de faturamento mensal'}>
              <input type="number" className="control" required min={0} value={form.meta_faturamento} onChange={set('meta_faturamento')} />
            </Campo>
            <span />
          </div>

          <div className="form-grid">
            <Campo label="Faturamento últimos 30 dias (painel ML)">
              <input type="number" className="control" required min={0} value={form.faturamento_30d} onChange={set('faturamento_30d')} />
            </Campo>
            <Campo label="Faturamento últimos 60 dias (painel ML)">
              <input
                type="number"
                className="control"
                min={0}
                required={form.tipo === 'lojista_digital'}
                value={form.faturamento_60d ?? ''}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    faturamento_60d: e.target.value === '' ? undefined : Number(e.target.value),
                  }))
                }
                placeholder={form.tipo === 'lojista_digital' ? 'Meta do lojista + crescimento' : 'Usado no cálculo de crescimento'}
              />
            </Campo>
          </div>

          {form.tipo === 'lojista_digital' && (
            <div className="form-grid">
              <Campo label="Meta de vendas (60 dias)">
                <input type="number" className="control" min={0} value={form.meta_vendas ?? ''} onChange={set('meta_vendas')} placeholder="225" />
              </Campo>
              <Campo label="Vendas realizadas (60 dias)">
                <input type="number" className="control" min={0} value={form.vendas_reais ?? ''} onChange={set('vendas_reais')} placeholder="0" />
              </Campo>
            </div>
          )}

          <div className="check-grid">
            <label className="check-card">
              <input type="checkbox" checked={form.estrela} onChange={set('estrela')} />
              <span>
                <strong>★ Estrela</strong>
                <small>Destacar na carteira</small>
              </span>
            </label>
            <label className="check-card">
              <input type="checkbox" checked={form.em_risco} onChange={set('em_risco')} />
              <span>
                <strong>Em risco</strong>
                <small>Sinalizar retenção</small>
              </span>
            </label>
          </div>

          <Campo label="Observações">
            <textarea
              className="control textarea"
              value={form.observacao}
              onChange={set('observacao')}
              placeholder="Notas do gestor"
            />
          </Campo>

          <div className="form-actions">
            <button type="button" onClick={onFechar} className="button button-secondary">
              Cancelar
            </button>
            <button type="submit" className="button button-primary">
              {conta ? 'Salvar alterações' : 'Cadastrar conta'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

function Campo({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  )
}
