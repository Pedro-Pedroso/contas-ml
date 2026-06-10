import { useState, useCallback } from 'react'
import { Account } from '../types'
import { AccountsTable } from './AccountsTable'
import { AccountForm } from './AccountForm'
import { AdvisorView } from './AdvisorView'
import { SummaryCards } from './SummaryCards'
import { Sidebar } from './Sidebar'
import { Icon, StatusTag } from './Primitives'
import { useAccounts } from '../hooks/useAccounts'
import {
  formatarMoeda,
  calcMediaAtingimento,
  isContaInicial,
  calcEncerrandoEm60Dias,
} from '../utils/calculations'

type Screen = 'carteira' | 'time'

interface Toast { msg: string; tipo: 'sucesso' | 'erro'; id: number }

function formatarMoedaK(valor: number): string {
  const abs = Math.abs(valor)
  if (abs >= 1000) {
    const k = (valor / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })
    return `R$ ${k}k`
  }
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
}

export function Dashboard() {
  const { contas, adicionarConta, editarConta, excluirConta, importarContas } = useAccounts()
  const [screen, setScreen] = useState<Screen>(
    () => (localStorage.getItem('contas.screen') as Screen) || 'carteira'
  )
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem('contas.nav') === '1'
  )
  const [formAberto, setFormAberto] = useState(false)
  const [contaEditando, setContaEditando] = useState<Account | null>(null)
  const [toasts, setToasts] = useState<Toast[]>([])

  const navigate = (s: Screen) => {
    setScreen(s)
    localStorage.setItem('contas.screen', s)
  }
  const toggleNav = () => {
    const next = !collapsed
    setCollapsed(next)
    localStorage.setItem('contas.nav', next ? '1' : '0')
  }

  const exibirToast = useCallback((msg: string, tipo: 'sucesso' | 'erro') => {
    const id = Date.now()
    setToasts((t) => [...t, { msg, tipo, id }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000)
  }, [])

  const abrirNova = () => { setContaEditando(null); setFormAberto(true) }
  const abrirEditar = (conta: Account) => { setContaEditando(conta); setFormAberto(true) }
  const fecharForm = () => { setFormAberto(false); setContaEditando(null) }

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

  // Métricas para o topbar — computed from all contas
  const contasAtivas = contas.filter((c) => c.status === 'ativo')

  const titles: Record<Screen, { crumb: string; h1: string }> = {
    carteira: { crumb: 'Carteira ativa', h1: 'Visão da carteira' },
    time:     { crumb: 'Time',           h1: 'Desempenho do time' },
  }
  const t = titles[screen]

  return (
    <div className="app">
      <Sidebar
        screen={screen}
        onNavigate={navigate}
        collapsed={collapsed}
        onToggle={toggleNav}
      />

      <div className="main">
        <header className="topbar">
          <div>
            <div className="crumb"><span className="dot" />{t.crumb}</div>
            <h1>{t.h1}</h1>
          </div>
          <div className="topbar-aside">
            <div className="updated">
              Atualizado<br />
              <b>hoje, {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</b>
            </div>
            <button className="btn btn-primary" onClick={abrirNova}>
              <Icon name="plus" size={17} />
              Nova conta
            </button>
          </div>
        </header>

        <div className="content">
          {screen === 'carteira' ? (
            <CarteiraScreen
              contas={contas}
              contasAtivas={contasAtivas}
              onEditar={abrirEditar}
              onExcluir={handleExcluir}
              onImportar={importarContas}
              onToast={exibirToast}
            />
          ) : (
            <TimeScreen contas={contas} />
          )}
        </div>
      </div>

      {formAberto && (
        <AccountForm conta={contaEditando} onSalvar={handleSalvar} onFechar={fecharForm} />
      )}

      <div className="toast-stack" aria-live="polite" aria-atomic="true">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast ${toast.tipo}`} role="status">
            {toast.msg}
          </div>
        ))}
      </div>
    </div>
  )
}

// ---- Tela 1: Carteira ----
interface CarteiraProps {
  contas: Account[]
  contasAtivas: Account[]
  onEditar: (c: Account) => void
  onExcluir: (id: string) => void
  onImportar: (novas: Account[]) => void
  onToast: (msg: string, tipo: 'sucesso' | 'erro') => void
}

function CarteiraScreen({ contas, contasAtivas, onEditar, onExcluir, onImportar, onToast }: CarteiraProps) {
  const metaTotal   = contasAtivas.reduce((s, c) => s + c.meta_faturamento, 0)
  const realTotal   = contasAtivas.reduce((s, c) => s + c.faturamento_real, 0)
  const atingGlobal = metaTotal > 0 ? Math.round((realTotal / metaTotal) * 100) : 0
  const saldo       = realTotal - metaTotal
  const emRisco     = contasAtivas.filter((c) => c.em_risco).length
  const atingMedio  = calcMediaAtingimento(contas)
  const iniciais    = contasAtivas.filter(isContaInicial).length
  const rampadas    = contasAtivas.filter((c) => !isContaInicial(c))
  const metaBatida  = rampadas.filter((c) => {
    const p = calcPercentualMetaLocal(c)
    return p >= 100
  }).length
  const prazosCriticos = calcEncerrandoEm60Dias(contas).length
  const estrela     = contas.filter((c) => c.estrela).length

  const heroColor = atingGlobal >= 80 ? 'green' : atingGlobal >= 50 ? 'amber' : 'red'
  const heroStyle = heroColor === 'green' ? 'var(--green)' : heroColor === 'amber' ? 'var(--amber)' : 'var(--red)'

  return (
    <div className="screen">
      {/* ---- Hero: 3 números dominantes ---- */}
      <div className="hero-grid">
        <div className="hero-card feature">
          <div className="hero-label">
            Atingimento global da carteira
            <StatusTag pct={atingGlobal} />
          </div>
          <div className={`hero-num is-${heroColor}`}>
            {atingGlobal}<span className="unit">%</span>
          </div>
          <div className="gauge">
            <div className="gauge-track">
              <div className="gauge-fill" style={{ width: `${Math.min(atingGlobal, 100)}%`, background: heroStyle }} />
            </div>
            <div className="gauge-ticks"><span>0%</span><span>meta · 100%</span></div>
          </div>
          <div className="hero-foot">
            <b>{formatarMoeda(realTotal)}</b> realizados de <b>{formatarMoeda(metaTotal)}</b> em meta · {contasAtivas.length} contas ativas
          </div>
        </div>

        <div className="hero-card">
          <div className="hero-label">Saldo sobre a meta</div>
          <div className={`hero-num sm ${saldo >= 0 ? 'is-green' : 'is-red'}`}>
            {saldo >= 0 ? '+' : '−'}{formatarMoedaK(Math.abs(saldo)).replace('R$ ', 'R$')}
          </div>
          <div className="hero-foot">
            {saldo >= 0
              ? <span><span className="pos">Acima</span> do alvo agregado da carteira</span>
              : <span><span className="neg">Abaixo</span> do alvo — falta fechar a diferença</span>}
          </div>
        </div>

        <div className="hero-card">
          <div className="hero-label">Contas em risco</div>
          <div className={`hero-num sm ${emRisco > 0 ? 'is-red' : 'is-green'}`}>{emRisco}</div>
          <div className="hero-foot">
            {emRisco > 0
              ? <span><b>{emRisco}</b> de {contasAtivas.length} contas precisam de retenção imediata</span>
              : <span>Nenhuma conta sinalizada para retenção</span>}
          </div>
        </div>
      </div>

      {/* ---- Strip secundária: 5 células ---- */}
      <SummaryCards
        atingMedio={atingMedio}
        metaBatida={metaBatida}
        rampadas={rampadas.length}
        prazosCriticos={prazosCriticos}
        iniciais={iniciais}
        estrela={estrela}
      />

      {/* ---- Tabela ---- */}
      <AccountsTable
        contas={contas}
        onEditar={onEditar}
        onExcluir={onExcluir}
        onImportar={onImportar}
        onToast={onToast}
      />
    </div>
  )
}

// helper local (evita importar do utils só pra esta tela)
import { calcPercentualMeta as calcPercentualMetaLocal } from '../utils/calculations'

// ---- Tela 2: Time ----
function TimeScreen({ contas }: { contas: Account[] }) {
  return (
    <div className="screen">
      <AdvisorView contas={contas} />
    </div>
  )
}
