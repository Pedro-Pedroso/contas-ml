import { Icon } from './Primitives'
import { Avatar } from './Primitives'

type Screen = 'carteira' | 'time'

interface Props {
  screen: Screen
  onNavigate: (s: Screen) => void
  collapsed: boolean
  onToggle: () => void
}

export function Sidebar({ screen, onNavigate, collapsed, onToggle }: Props) {
  const items: { id: Screen; label: string; icon: Parameters<typeof Icon>[0]['name'] }[] = [
    { id: 'carteira', label: 'Carteira', icon: 'wallet' },
    { id: 'time',     label: 'Time',     icon: 'team'   },
  ]
  const future = [
    { id: 'historico', label: 'Histórico',      icon: 'history'  },
    { id: 'config',    label: 'Configurações',   icon: 'settings' },
  ] as const

  return (
    <nav className={`nav${collapsed ? ' collapsed' : ''}`}>
      <div className="brand">
        <span className="brand-mark">C</span>
        <span className="brand-text">
          <span className="brand-name">Contas</span>
          <span className="brand-sub">Gestão de carteira</span>
        </span>
      </div>

      <div className="nav-section-label">Painéis</div>
      <div className="nav-list">
        {items.map((it) => (
          <button
            key={it.id}
            className={`nav-item${screen === it.id ? ' active' : ''}`}
            onClick={() => onNavigate(it.id)}
            title={it.label}
          >
            <span className="nav-ico"><Icon name={it.icon} size={19} /></span>
            <span className="nav-label">{it.label}</span>
          </button>
        ))}
      </div>

      <div className="nav-section-label">Em breve</div>
      <div className="nav-list">
        {future.map((it) => (
          <button key={it.id} className="nav-item disabled" title={`${it.label} — em breve`}>
            <span className="nav-ico"><Icon name={it.icon} size={19} /></span>
            <span className="nav-label">{it.label}</span>
            <span className="nav-badge-soon">Em breve</span>
          </button>
        ))}
      </div>

      <div className="nav-spacer" />

      <button className="nav-toggle" onClick={onToggle} title={collapsed ? 'Expandir' : 'Recolher'}>
        <span className="nav-ico"><Icon name="chevrons" size={19} /></span>
        <span className="nav-label">Recolher</span>
      </button>

      <div className="nav-user">
        <Avatar name="Diego Martins" size={34} />
        <span className="meta">
          <b>Diego Martins</b>
          <span>Head de carteira</span>
        </span>
      </div>
    </nav>
  )
}
