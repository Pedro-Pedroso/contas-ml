import { useRef, type ChangeEvent, type CSSProperties } from 'react'
import { Account, Filtros } from '../types'
import { Filters } from './Filters'
import {
  calcPercentualMeta,
  calcMesesRestantes,
  corPercentualMeta,
  formatarData,
  formatarMoeda,
} from '../utils/calculations'
import { exportarCSV, importarCSV } from '../utils/csv'

interface Props {
  contas: Account[]
  filtros: Filtros
  onFiltros: (f: Filtros) => void
  onEditar: (conta: Account) => void
  onExcluir: (id: string) => void
  onImportar: (novasContas: Account[]) => void
  onToast: (msg: string, tipo: 'sucesso' | 'erro') => void
}

function badgeTipo(tipo: Account['tipo']) {
  return (
    <span className={`badge badge-type-${tipo === 'lojista_digital' ? 'digital' : 'monthly'}`}>
      {tipo === 'lojista_digital' ? 'Lojista Digital' : 'Mensalista'}
    </span>
  )
}

function badgeStatus(status: Account['status']) {
  const labels: Record<Account['status'], string> = {
    ativo: 'Ativo',
    encerrado: 'Encerrado',
    pausado: 'Pausado',
  }

  return <span className={`badge badge-status-${status}`}>{labels[status]}</span>
}

function metaClass(percentual: number) {
  if (percentual >= 80) return 'metric-pill success'
  if (percentual >= 50) return 'metric-pill warning'
  return 'metric-pill danger'
}

function prazoTexto(meses: number) {
  if (meses < 0) return 'Contrato vencido'
  if (meses === 0) return 'Vence este mês'
  if (meses === 1) return '1 mês restante'
  return `${meses} meses restantes`
}

export function AccountsTable({
  contas, filtros, onFiltros, onEditar, onExcluir, onImportar, onToast,
}: Props) {
  const inputCSV = useRef<HTMLInputElement>(null)
  const filtrosAtivos = Object.values(filtros).filter(Boolean).length

  const contasFiltradas = contas.filter((conta) => {
    if (filtros.assessor && conta.assessor !== filtros.assessor) return false
    if (filtros.tipo && conta.tipo !== filtros.tipo) return false
    if (filtros.status && conta.status !== filtros.status) return false
    if (filtros.risco === 'sim' && !conta.em_risco) return false
    if (filtros.risco === 'nao' && conta.em_risco) return false
    if (filtros.busca && !conta.nome_cliente.toLowerCase().includes(filtros.busca.toLowerCase())) return false
    return true
  })

  const handleImportar = (event: ChangeEvent<HTMLInputElement>) => {
    const arquivo = event.target.files?.[0]
    if (!arquivo) return

    importarCSV(arquivo, contas, (importadas, erros, novasContas) => {
      onImportar(novasContas)
      onToast(
        `${importadas} conta(s) importada(s)${erros > 0 ? ` - ${erros} com erro` : ''}.`,
        erros > 0 ? 'erro' : 'sucesso'
      )
    })

    event.target.value = ''
  }

  return (
    <section className="accounts-panel">
      <div className="panel-toolbar">
        <div>
          <span className="section-kicker">Carteira</span>
          <h2>Contas gerenciadas</h2>
          <p>
            {contasFiltradas.length} de {contas.length} conta(s)
            {filtrosAtivos > 0 ? ` com ${filtrosAtivos} filtro(s)` : ' exibidas'}
          </p>
        </div>

        <div className="toolbar-actions">
          <button className="button button-secondary" onClick={() => exportarCSV(contasFiltradas)}>
            Exportar CSV
          </button>
          <button className="button button-secondary" onClick={() => inputCSV.current?.click()}>
            Importar CSV
          </button>
          <input
            ref={inputCSV}
            type="file"
            accept=".csv"
            className="visually-hidden"
            onChange={handleImportar}
          />
        </div>
      </div>

      <Filters filtros={filtros} onChange={onFiltros} contas={contas} />

      <div className="table-shell">
        <table className="accounts-table">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Responsável</th>
              <th>Tipo</th>
              <th>Prazo</th>
              <th>Faturamento</th>
              <th>% Meta</th>
              <th>Sinal</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {contasFiltradas.length === 0 ? (
              <tr>
                <td colSpan={9} className="empty-state">
                  Nenhuma conta encontrada para os filtros selecionados.
                </td>
              </tr>
            ) : (
              contasFiltradas.map((conta) => {
                const percentual = calcPercentualMeta(conta)
                const meses = calcMesesRestantes(conta.data_termino)
                const progresso = Math.max(0, Math.min(percentual, 100))
                const progressStyle = {
                  width: `${progresso}%`,
                  background: corPercentualMeta(percentual),
                } satisfies CSSProperties

                return (
                  <tr key={conta.id}>
                    <td data-label="Cliente" className="client-cell">
                      <div className="client-main">
                        <strong>{conta.nome_cliente}</strong>
                        {conta.estrela && <span className="priority-pill">Prioritário</span>}
                      </div>
                      {conta.observacao && <span className="client-note">{conta.observacao}</span>}
                    </td>
                    <td data-label="Responsável">
                      <span className="muted">{conta.assessor}</span>
                    </td>
                    <td data-label="Tipo">{badgeTipo(conta.tipo)}</td>
                    <td data-label="Prazo">
                      <div className={`deadline-cell ${meses <= 2 ? 'is-critical' : ''}`}>
                        <strong>{formatarData(conta.data_termino)}</strong>
                        <span>{prazoTexto(meses)}</span>
                      </div>
                    </td>
                    <td data-label="Faturamento">
                      <div className="revenue-cell">
                        <strong>{formatarMoeda(conta.faturamento_real)}</strong>
                        <span>Meta {formatarMoeda(conta.meta_faturamento)}</span>
                        <div className="progress-track" aria-hidden="true">
                          <span style={progressStyle} />
                        </div>
                      </div>
                    </td>
                    <td data-label="% Meta">
                      <span className={metaClass(percentual)}>{percentual}%</span>
                    </td>
                    <td data-label="Sinal">
                      {conta.em_risco ? (
                        <span className="badge badge-risk">Risco</span>
                      ) : conta.estrela ? (
                        <span className="badge badge-priority">Prioridade</span>
                      ) : (
                        <span className="muted">Regular</span>
                      )}
                    </td>
                    <td data-label="Status">{badgeStatus(conta.status)}</td>
                    <td data-label="Ações">
                      <div className="row-actions">
                        <button className="button button-table" onClick={() => onEditar(conta)}>
                          Editar
                        </button>
                        <button className="button button-danger" onClick={() => onExcluir(conta.id)}>
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
