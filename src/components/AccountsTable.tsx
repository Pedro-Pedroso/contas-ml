import { useState, useRef, type ChangeEvent } from 'react'
import { Account } from '../types'
import { Icon, Avatar, Bar } from './Primitives'
import {
  calcPercentualMeta,
  calcPercentualVendas,
  calcMesesRestantes,
  formatarData,
  formatarMoeda,
  isContaInicial,
} from '../utils/calculations'
import { exportarCSV, importarCSV } from '../utils/csv'

type Filtro = 'todas' | 'risco' | 'inicial' | 'criticos'
type SortKey = 'cliente' | 'assessor' | 'pct' | 'prazo' | null
type SortDir = 'asc' | 'desc'

interface Props {
  contas: Account[]
  onEditar: (conta: Account) => void
  onExcluir: (id: string) => void
  onImportar: (novasContas: Account[]) => void
  onToast: (msg: string, tipo: 'sucesso' | 'erro') => void
}

function prazoTexto(meses: number): string {
  if (meses < 0) return 'Contrato vencido'
  if (meses === 0) return 'Vence este mês'
  if (meses === 1) return '1 mês restante'
  return `${meses} meses restantes`
}

export function AccountsTable({ contas, onEditar, onExcluir, onImportar, onToast }: Props) {
  const inputCSV = useRef<HTMLInputElement>(null)
  const [busca, setBusca] = useState('')
  const [filtro, setFiltro] = useState<Filtro>('todas')
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({ key: 'pct', dir: 'desc' })

  const toggleSort = (key: SortKey) =>
    setSort((s) => (s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'desc' }))

  const arrow = (key: SortKey) => {
    if (sort.key !== key) return <span className="arrow">▼</span>
    return <span className="arrow on">{sort.dir === 'asc' ? '▲' : '▼'}</span>
  }

  const ativas = contas.filter((c) => c.status === 'ativo')

  let list = ativas
  if (busca.trim()) {
    const q = busca.toLowerCase()
    list = list.filter(
      (c) => c.nome_cliente.toLowerCase().includes(q) || c.assessor.toLowerCase().includes(q)
    )
  }
  if (filtro === 'risco')    list = list.filter((c) => c.em_risco)
  if (filtro === 'inicial')  list = list.filter((c) => isContaInicial(c))
  if (filtro === 'criticos') list = list.filter((c) => calcMesesRestantes(c.data_termino) <= 2)

  const sorted = [...list].sort((a, b) => {
    const dir = sort.dir === 'asc' ? 1 : -1
    if (!sort.key) return 0
    let cmp = 0
    if (sort.key === 'cliente')  cmp = a.nome_cliente.localeCompare(b.nome_cliente)
    if (sort.key === 'assessor') cmp = a.assessor.localeCompare(b.assessor)
    if (sort.key === 'pct')      cmp = calcPercentualMeta(a) - calcPercentualMeta(b)
    if (sort.key === 'prazo')    cmp = calcMesesRestantes(a.data_termino) - calcMesesRestantes(b.data_termino)
    return cmp * dir
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
    <>
      <div className="section-head">
        <div>
          <h2>Contas gerenciadas</h2>
          <p>{sorted.length} de {ativas.length} contas ativas</p>
        </div>
      </div>

      {/* Toolbar: busca + seg control + exportar */}
      <div className="toolbar">
        <div className="search">
          <span className="ico"><Icon name="search" /></span>
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar cliente ou assessor…"
          />
        </div>
        <div className="seg">
          {([
            ['todas',    'Todas'],
            ['risco',    'Em risco'],
            ['inicial',  'Iniciais'],
            ['criticos', 'Prazo crítico'],
          ] as [Filtro, string][]).map(([k, l]) => (
            <button key={k} className={filtro === k ? 'on' : ''} onClick={() => setFiltro(k)}>
              {l}
            </button>
          ))}
        </div>
        <div style={{ flex: 1 }} />
        <button className="btn btn-ghost" onClick={() => exportarCSV(sorted)}>
          <Icon name="download" size={16} />Exportar
        </button>
        <button className="btn btn-ghost" onClick={() => inputCSV.current?.click()}>
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

      <div className="table-wrap">
        <table className="accounts">
          <thead>
            <tr>
              <th className="sortable" onClick={() => toggleSort('cliente')}>
                Cliente {arrow('cliente')}
              </th>
              <th className="sortable" onClick={() => toggleSort('assessor')}>
                Responsável {arrow('assessor')}
              </th>
              <th>Tipo</th>
              <th>Meta · realizado</th>
              <th className="sortable num" onClick={() => toggleSort('pct')}>
                % Meta {arrow('pct')}
              </th>
              <th className="sortable" onClick={() => toggleSort('prazo')}>
                Prazo {arrow('prazo')}
              </th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr><td colSpan={8} className="empty">Nenhuma conta para esse filtro.</td></tr>
            ) : sorted.map((conta) => {
              const p      = calcPercentualMeta(conta)
              const pFat   = conta.meta_faturamento === 0 ? 0 : Math.round((conta.faturamento_real / conta.meta_faturamento) * 100)
              const pVend  = calcPercentualVendas(conta)
              const meses  = calcMesesRestantes(conta.data_termino)
              const inicial = isContaInicial(conta)
              const isLoja = conta.tipo === 'lojista_digital' && (conta.meta_vendas ?? 0) > 0
              const cor    = p >= 80 ? 'green' : p >= 50 ? 'amber' : 'red'

              return (
                <tr key={conta.id} className={conta.em_risco ? 'is-risk' : ''}>
                  {/* Cliente */}
                  <td>
                    <div className="cli">
                      <div className="cli-top">
                        {conta.estrela && (
                          <span className="badge star" title="Cliente estrela">
                            <Icon name="star" size={13} />
                          </span>
                        )}
                        <span className="cli-name">{conta.nome_cliente}</span>
                        {inicial && <span className="badge inicial">Inicial</span>}
                        {conta.em_risco && (
                          <span className="badge risk">
                            <Icon name="alert" size={11} />Risco
                          </span>
                        )}
                      </div>
                      {conta.observacao && <span className="cli-note">{conta.observacao}</span>}
                    </div>
                  </td>

                  {/* Responsável */}
                  <td>
                    <div className="adv-inline">
                      <Avatar name={conta.assessor} size={26} />
                      <span>{conta.assessor}</span>
                    </div>
                  </td>

                  {/* Tipo */}
                  <td>
                    <span className={`badge type-${conta.tipo === 'lojista_digital' ? 'lojista' : 'mensalista'}`}>
                      {conta.tipo === 'lojista_digital' ? 'Lojista Digital' : 'Mensalista'}
                    </span>
                  </td>

                  {/* Meta · realizado */}
                  <td className="meta-cell">
                    {isLoja ? (
                      <div className="meta-loja">
                        <div className="meta-line">
                          <span className="ml-k">Faturamento</span>
                          <span className="ml-v">
                            {formatarMoeda(conta.faturamento_real)}{' '}
                            <i>/ {formatarMoeda(conta.meta_faturamento)}</i>
                          </span>
                        </div>
                        <div className="meta-line">
                          <span className="ml-k">Pedidos</span>
                          <span className="ml-v">
                            {conta.vendas_reais ?? 0}{' '}
                            <i>/ {conta.meta_vendas}</i>
                          </span>
                        </div>
                        <div className="meta-combined">
                          <Bar pct={p} />
                        </div>
                        <span className="mc-label">Progresso = média faturamento + pedidos</span>
                      </div>
                    ) : (
                      <>
                        <div className="meta-figs">
                          <span className="meta-real">{formatarMoeda(conta.faturamento_real)}</span>
                          <span className="meta-goal">/ {formatarMoeda(conta.meta_faturamento)}</span>
                        </div>
                        <Bar pct={p} />
                      </>
                    )}
                  </td>

                  {/* % Meta */}
                  <td>
                    <div className="pct-row">
                      <span className={`pct is-${cor}`}>{p}%</span>
                      {isLoja && (
                        <span className="pct-split">fat {pFat}% · ped {pVend}%</span>
                      )}
                    </div>
                  </td>

                  {/* Prazo */}
                  <td>
                    <div className={`deadline${meses <= 2 ? ' crit' : ''}`}>
                      <b>{formatarData(conta.data_termino)}</b>
                      <span>{prazoTexto(meses)}</span>
                    </div>
                  </td>

                  {/* Status */}
                  <td>
                    <span className="status-dot">
                      <span className={`d ${conta.status}`} />
                      {conta.status.charAt(0).toUpperCase() + conta.status.slice(1)}
                    </span>
                  </td>

                  {/* Ações */}
                  <td>
                    <button
                      className="row-act"
                      title={`Editar ${conta.nome_cliente}`}
                      onClick={() => onEditar(conta)}
                    >
                      <Icon name="dots" size={18} />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}
