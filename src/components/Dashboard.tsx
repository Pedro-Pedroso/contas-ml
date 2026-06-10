import { useState, useCallback } from 'react'
import { Account, Filtros } from '../types'
import { SummaryCards } from './SummaryCards'
import { AccountsTable } from './AccountsTable'
import { AccountForm } from './AccountForm'
import { AdvisorView } from './AdvisorView'
import { useAccounts } from '../hooks/useAccounts'
import { formatarMoeda } from '../utils/calculations'

const FILTROS_INICIAL: Filtros = {
  assessor: '',
  tipo: '',
  risco: '',
  status: '',
  busca: '',
}

interface Toast {
  msg: string
  tipo: 'sucesso' | 'erro'
  id: number
}

export function Dashboard() {
  const { contas, adicionarConta, editarConta, excluirConta, importarContas } = useAccounts()
  const [filtros, setFiltros] = useState<Filtros>(FILTROS_INICIAL)
  const [formAberto, setFormAberto] = useState(false)
  const [contaEditando, setContaEditando] = useState<Account | null>(null)
  const [toasts, setToasts] = useState<Toast[]>([])

  const contasAtivas = contas.filter((conta) => conta.status === 'ativo')
  const metaAtiva = contasAtivas.reduce((total, conta) => total + conta.meta_faturamento, 0)
  const realizadoAtivo = contasAtivas.reduce((total, conta) => total + conta.faturamento_real, 0)
  const atingimentoGlobal = metaAtiva > 0 ? Math.round((realizadoAtivo / metaAtiva) * 100) : 0
  const gapMeta = realizadoAtivo - metaAtiva
  const clientesEstrela = contas.filter((conta) => conta.estrela).length

  const exibirToast = useCallback((msg: string, tipo: 'sucesso' | 'erro') => {
    const id = Date.now()
    setToasts((t) => [...t, { msg, tipo, id }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000)
  }, [])

  const abrirNova = () => {
    setContaEditando(null)
    setFormAberto(true)
  }

  const abrirEditar = (conta: Account) => {
    setContaEditando(conta)
    setFormAberto(true)
  }

  const fecharForm = () => {
    setFormAberto(false)
    setContaEditando(null)
  }

  const handleSalvar = (dados: Omit<Account, 'id'>) => {
    if (contaEditando) {
      editarConta(contaEditando.id, dados)
      exibirToast('Conta atualizada com sucesso.', 'sucesso')
    } else {
      adicionarConta(dados)
      exibirToast('Conta cadastrada com sucesso.', 'sucesso')
    }
    fecharForm()
  }

  const handleExcluir = (id: string) => {
    if (window.confirm('Confirmar exclusão desta conta?')) {
      excluirConta(id)
      exibirToast('Conta excluída.', 'sucesso')
    }
  }

  return (
    <main className="dashboard-shell">
      <header className="dashboard-hero">
        <div className="hero-copy">
          <span className="section-kicker">Carteira WXP</span>
          <h1>Painel de Gestão</h1>
          <p>Visão operacional para priorizar riscos, metas e renovações da carteira gerenciada.</p>
        </div>

        <div className="hero-aside" aria-label="Resumo financeiro da carteira ativa">
          <div className="hero-metrics">
            <div>
              <span>Realizado ativo</span>
              <strong>{formatarMoeda(realizadoAtivo)}</strong>
            </div>
            <div>
              <span>Atingimento global</span>
              <strong>{atingimentoGlobal}%</strong>
            </div>
          </div>
          <button className="button button-primary" onClick={abrirNova}>
            <span aria-hidden="true">+</span>
            Nova conta
          </button>
        </div>
      </header>

      <section className="insight-strip" aria-label="Indicadores financeiros complementares">
        <div>
          <span>Meta ativa</span>
          <strong>{formatarMoeda(metaAtiva)}</strong>
        </div>
        <div>
          <span>Saldo sobre a meta</span>
          <strong className={gapMeta >= 0 ? 'positive-value' : 'negative-value'}>
            {formatarMoeda(gapMeta)}
          </strong>
        </div>
        <div>
          <span>Clientes estrela</span>
          <strong>{clientesEstrela}</strong>
        </div>
      </section>

      <SummaryCards contas={contas} />

      <AdvisorView contas={contas} />

      <AccountsTable
        contas={contas}
        filtros={filtros}
        onFiltros={setFiltros}
        onEditar={abrirEditar}
        onExcluir={handleExcluir}
        onImportar={importarContas}
        onToast={exibirToast}
      />

      {formAberto && (
        <AccountForm
          conta={contaEditando}
          onSalvar={handleSalvar}
          onFechar={fecharForm}
        />
      )}

      <div className="toast-stack" aria-live="polite" aria-atomic="true">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast ${toast.tipo}`} role="status">
            {toast.msg}
          </div>
        ))}
      </div>
    </main>
  )
}
