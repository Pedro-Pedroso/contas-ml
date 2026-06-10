import { useState, useRef, type ChangeEvent, type CSSProperties } from 'react'
import { Account, Filtros } from '../types'
import { Filters } from './Filters'
import {
  calcPercentualMeta,
  calcPercentualVendas,
  calcMesesRestantes,
  corPercentualMeta,
  formatarData,
  formatarMoeda,
  isContaInicial,
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

type ColunaOrdem = 'nome_cliente' | 'assessor' | 'percentual' | 'prazo' | 'status' | null
type Direcao = 'asc' | 'desc'

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

function SortIcon({ coluna, atual, direcao }: { coluna: ColunaOrdem; atual: ColunaOrdem; direcao: Direcao }) {
  if (coluna !== atual) return <span className="sort-icon sort-icon--idle" aria-hidden="true">↕</span>
  return <span className="sort-icon sort-icon--active" aria-hidden="true">{direcao === 'asc' ? '↑' : '↓'}</span>
}

export function AccountsTable({
  contas, filtros, onFiltros, onEditar, onExcluir, onImportar, onToast,
}: Props) {
  const inputCSV = useRef<HTMLInputElement>(null)
  const filtrosAtivos = Object.values(filtros).filter(Boolean).length
  const [ordem, setOrdem] = useState<ColunaOrdem>(null)
  const [direcao, setDirecao] = useState<Direcao>('asc')

  const alternarOrdem = (coluna: ColunaOrdem) => {
    if (ordem === coluna) {
      setDirecao((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setOrdem(coluna)
      setDirecao('asc')
    }
  }

  const contasFiltradas = contas.filter((conta) => {
    if (filtros.assessor && conta.assessor !== filtros.assessor) return false
    if (filtros.tipo && conta.tipo !== filtros.tipo) return false
    if (filtros.status && conta.status !== filtros.status) return false
    if (filtros.risco === 'sim' && !conta.em_risco) return false
    if (filtros.risco === 'nao' && conta.em_risco) return false
    if (filtros.busca && !conta.nome_cliente.toLowerCase().includes(filtros.busca.toLowerCase())) return false
    return true
  })

  const contasOrdenadas = [...contasFiltradas].sort((a, b) => {
    if (!ordem) return 0
    let cmp = 0
    if (ordem === 'nome_cliente') cmp = a.nome_cliente.localeCompare(b.nome_cliente)
    else if (ordem === 'assessor') cmp = a.assessor.localeCompare(b.assessor)
    else if (ordem === 'percentual') cmp = calcPercentualMeta(a) - calcPercentualMeta(b)
    else if (ordem === 'prazo') cmp = calcMesesRestantes(a.data_termino) - calcMesesRestantes(b.data_termino)
    else if (ordem === 'status') cmp = a.status.localeCompare(b.status)
    return direcao === 'asc' ? cmp : -cmp
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

  const thProps = (coluna: ColunaOrdem) => ({
    className: `th-sortable${ordem === coluna ? ' th-sortable--active' : ''}`,
    onClick: () => alternarOrdem(coluna),
    role: 'button' as const,
    tabIndex: 0,
    onKeyDown: (e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') alternarOrdem(coluna) },
  })

  return (
    <section className="accounts-panel">
      <div className="panel-toolbar">
        <div>
          <span className="section-kicker">Carteira</span>
          <h2>Contas gerenciadas</h2>
          <p>
            {contasOrdenadas.length} de {contas.length} conta(s)
            {filtrosAtivos > 0 ? ` com ${filtrosAtivos} filtro(s)` : ' exibidas'}
          </p>
        </div>

        <div className="toolbar-actions">
          <button className="button button-secondary" onClick={() => exportarCSV(contasOrdenadas)}>
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
              <th {...thProps('nome_cliente')}>
                Cliente <SortIcon coluna="nome_cliente" atual={ordem} direcao={direcao} />
              </th>
              <th {...thProps('assessor')}>
                Responsável <SortIcon coluna="assessor" atual={ordem} direcao={direcao} />
              </th>
              <th>Tipo</th>
              <th {...thProps('prazo')}>
                Prazo <SortIcon coluna="prazo" atual={ordem} direcao={direcao} />
              </th>
              <th>Metas</th>
              <th {...thProps('percentual')}>
                % Meta <SortIcon coluna="percentual" atual={ordem} direcao={direcao} />
              </th>
              <th {...thProps('status')}>
                Status <SortIcon coluna="status" atual={ordem} direcao={direcao} />
              </th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {contasOrdenadas.length === 0 ? (
              <tr>
                <td colSpan={8} className="empty-state">
                  Nenhuma conta encontrada para os filtros selecionados.
                </td>
              </tr>
            ) : (
              contasOrdenadas.map((conta) => {
                const percentual = calcPercentualMeta(conta)
                const meses = calcMesesRestantes(conta.data_termino)
                const progresso = Math.max(0, Math.min(percentual, 100))
                const progressStyle = {
                  width: `${progresso}%`,
                  background: corPercentualMeta(percentual),
                } satisfies CSSProperties

                const isLojista = conta.tipo === 'lojista_digital'
                const temPedidos = isLojista && conta.meta_vendas != null && conta.meta_vendas > 0
                const pctFat = conta.meta_faturamento === 0
                  ? 0
                  : Math.round((conta.faturamento_real / conta.meta_faturamento) * 100)
                const pctVendas = calcPercentualVendas(conta)

                const inicial = isContaInicial(conta)

                return (
                  <tr key={conta.id} className={inicial ? 'row-inicial' : ''}>
                    <td data-label="Cliente" className="client-cell">
                      <div className="client-main">
                        <strong>{conta.nome_cliente}</strong>
                        {conta.estrela && (
                          <span className="priority-pill" title="Estrela">★ Estrela</span>
                        )}
                        {inicial && (
                          <span className="badge badge-inicial" title="Conta com até 60 dias — em fase inicial">Inicial</span>
                        )}
                        {conta.em_risco && (
                          <span className="badge badge-risk">Risco</span>
                        )}
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
                    <td data-label="Metas">
                      {isLojista ? (
                        <div className="revenue-cell">
                          <span className="meta-period-label">Últimos 60 dias</span>
                          <div className="meta-row">
                            <span className="meta-row-label">Fat.</span>
                            <div className="meta-row-values">
                              <strong>{formatarMoeda(conta.faturamento_real)}</strong>
                              <span>Meta {formatarMoeda(conta.meta_faturamento)}</span>
                            </div>
                          </div>
                          {temPedidos && (
                            <div className="meta-row">
                              <span className="meta-row-label">Ped.</span>
                              <div className="meta-row-values">
                                <strong>{conta.vendas_reais ?? 0} pedidos</strong>
                                <span>Meta {conta.meta_vendas} pedidos</span>
                              </div>
                            </div>
                          )}
                          {/* Barra única representando o atingimento médio */}
                          <div className="progress-track" aria-hidden="true">
                            <span style={progressStyle} />
                          </div>
                        </div>
                      ) : (
                        <div className="revenue-cell">
                          <strong>{formatarMoeda(conta.faturamento_real)}</strong>
                          <span>Meta {formatarMoeda(conta.meta_faturamento)}</span>
                          <div className="progress-track" aria-hidden="true">
                            <span style={progressStyle} />
                          </div>
                        </div>
                      )}
                    </td>
                    <td data-label="% Meta">
                      <span className={metaClass(percentual)}>{percentual}%</span>
                      {isLojista && temPedidos && (
                        <div className="meta-pill-detail">
                          <span className="muted" style={{ fontSize: '11px' }}>Fat. {pctFat}% · Ped. {pctVendas}%</span>
                        </div>
                      )}
                    </td>
                    <td data-label="Status">{badgeStatus(conta.status)}</td>
                    <td data-label="Ações">
                      <div className="row-actions">
                        <button
                          className="button button-table"
                          onClick={() => onEditar(conta)}
                          aria-label={`Editar ${conta.nome_cliente}`}
                        >
                          Editar
                        </button>
                        <button
                          className="button button-danger"
                          onClick={() => onExcluir(conta.id)}
                          aria-label={`Excluir ${conta.nome_cliente}`}
                        >
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
