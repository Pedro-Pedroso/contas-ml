// Primitivos visuais: Icon, Avatar, Bar, StatusTag

type IconName =
  | 'wallet' | 'team' | 'history' | 'settings' | 'chevrons' | 'chevron'
  | 'search' | 'plus' | 'star' | 'alert' | 'dots' | 'download'

interface IconProps { name: IconName; size?: number; className?: string }

export function Icon({ name, size = 18, className = '' }: IconProps) {
  const p = {
    width: size, height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.7,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className,
  }
  switch (name) {
    case 'wallet':
      return <svg {...p}><path d="M3 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v1"/><path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4"/><path d="M16 11h5v4h-5a2 2 0 0 1 0-4Z"/></svg>
    case 'team':
      return <svg {...p}><circle cx="9" cy="8" r="3"/><path d="M3 20a6 6 0 0 1 12 0"/><path d="M16 6.5a3 3 0 0 1 0 5.8"/><path d="M18 20a6 6 0 0 0-3-5.2"/></svg>
    case 'history':
      return <svg {...p}><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 4v4h4"/><path d="M12 8v4l3 2"/></svg>
    case 'settings':
      return <svg {...p}><circle cx="12" cy="12" r="3"/><path d="M12 3v2M12 19v2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M3 12h2M19 12h2M5.6 18.4 7 17M17 7l1.4-1.4"/></svg>
    case 'chevrons':
      return <svg {...p}><path d="m15 6-6 6 6 6"/></svg>
    case 'chevron':
      return <svg {...p}><path d="m6 9 6 6 6-6"/></svg>
    case 'search':
      return <svg {...p} width={16} height={16}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.2-3.2"/></svg>
    case 'plus':
      return <svg {...p}><path d="M12 5v14M5 12h14"/></svg>
    case 'star':
      return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}><path d="m12 3 2.5 5.6 6.1.6-4.6 4 1.4 6L12 16.8 6.6 19.2l1.4-6-4.6-4 6.1-.6L12 3Z"/></svg>
    case 'alert':
      return <svg {...p} width={14} height={14}><path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9 2 18a2 2 0 0 0 1.7 3h16.6A2 2 0 0 0 22 18L13.7 3.9a2 2 0 0 0-3.4 0Z"/></svg>
    case 'dots':
      return <svg {...p}><circle cx="5" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1.4" fill="currentColor" stroke="none"/></svg>
    case 'download':
      return <svg {...p} width={16} height={16}><path d="M12 4v10m0 0 4-4m-4 4-4-4"/><path d="M5 19h14"/></svg>
    default:
      return null
  }
}

// Avatar com cor estável derivada do nome
function avatarColor(name: string): string {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 360
  return `oklch(0.72 0.11 ${h})`
}
function initials(name: string): string {
  return name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase()
}

interface AvatarProps { name: string; size?: number }
export function Avatar({ name, size = 38 }: AvatarProps) {
  return (
    <span
      className="avatar"
      style={{ width: size, height: size, fontSize: size * 0.38, background: avatarColor(name) }}
    >
      {initials(name)}
    </span>
  )
}

// Barra de progresso com cor de status
interface BarProps { pct: number }
export function Bar({ pct }: BarProps) {
  const color = pct >= 80 ? 'var(--green)' : pct >= 50 ? 'var(--amber)' : 'var(--red)'
  const w = Math.max(2, Math.min(pct, 100))
  return (
    <div className="bar">
      <span style={{ width: `${w}%`, background: color }} />
    </div>
  )
}

// Indicador de crescimento entre os dois últimos meses fechados (▲ +12% / ▼ −5%)
import { nomesMesesComparacao } from '../utils/calculations'

interface GrowthProps { crescimento: number | null }
export function Growth({ crescimento }: GrowthProps) {
  if (crescimento === null) return null
  const pct = Math.round(crescimento)
  const cls = pct > 0 ? 'up' : pct < 0 ? 'down' : 'flat'
  const seta = pct > 0 ? '▲' : pct < 0 ? '▼' : '＝'
  const sinal = pct > 0 ? '+' : ''
  const { anterior, retrasado } = nomesMesesComparacao()
  return (
    <span className={`growth ${cls}`} title={`Crescimento ${anterior} vs ${retrasado} (meses fechados)`}>
      {seta} {sinal}{pct}%
    </span>
  )
}

// Tag de status para o hero
interface StatusTagProps { pct: number }
export function StatusTag({ pct }: StatusTagProps) {
  const isGreen = pct >= 80
  const isAmber = pct >= 50 && pct < 80
  const label = isGreen ? 'No alvo' : isAmber ? 'Atenção' : 'Crítico'
  const style = isGreen
    ? { background: 'var(--green-bg)', color: 'var(--green)', borderColor: 'var(--green-line)' }
    : isAmber
    ? { background: 'var(--amber-bg)', color: 'var(--amber)', borderColor: 'var(--amber-line)' }
    : { background: 'var(--red-bg)',   color: 'var(--red)',   borderColor: 'var(--red-line)'   }
  return <span className="status-tag" style={style}>{label}</span>
}
