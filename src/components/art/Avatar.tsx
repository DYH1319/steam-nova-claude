import { memo } from 'react'
import { cn, hash } from '@/lib/utils'
import type { Presence } from '@/data/social'

export type AnyStatus = Presence | 'invisible'

export const statusColor: Record<AnyStatus, string> = {
  online: 'bg-online',
  ingame: 'bg-ingame',
  away: 'bg-away',
  offline: 'bg-fg-4',
  invisible: 'bg-fg-4',
}
export const statusText: Record<AnyStatus, string> = {
  online: '在线',
  ingame: '游戏中',
  away: '离开',
  offline: '离线',
  invisible: '隐身',
}
export const statusTone: Record<AnyStatus, string> = {
  online: 'text-online',
  ingame: 'text-ingame',
  away: 'text-away',
  offline: 'text-fg-3',
  invisible: 'text-fg-3',
}

interface Props {
  seed: string
  name: string
  size?: number
  status?: AnyStatus
  className?: string
  ring?: boolean
}

export const Avatar = memo(function Avatar({ seed, name, size = 36, status, className, ring }: Props) {
  const h = hash(seed)
  const h1 = h % 360
  const h2 = (h1 + 40 + ((h >> 8) % 80)) % 360
  const shape = (h >> 4) % 4
  const radius = Math.max(6, size * 0.22)
  const dot = Math.min(18, Math.max(8, Math.round(size * 0.28)))
  const ringColor =
    status === 'ingame' ? 'ring-ingame/80' : status === 'online' ? 'ring-online/70' : status === 'away' ? 'ring-away/70' : 'ring-white/10'
  return (
    <div className={cn('relative shrink-0', className)} style={{ width: size, height: size }}>
      <div
        className={cn('relative h-full w-full overflow-hidden', ring && `ring-2 ring-offset-2 ring-offset-ink-1 ${ringColor}`)}
        style={{ borderRadius: radius, background: `linear-gradient(135deg, hsl(${h1} 70% 55%), hsl(${h2} 65% 32%))` }}
      >
        <svg viewBox="0 0 40 40" className="absolute inset-0 h-full w-full opacity-30">
          {shape === 0 && <circle cx="30" cy="10" r="14" fill="white" />}
          {shape === 1 && <polygon points="0,40 40,0 40,40" fill="white" />}
          {shape === 2 && <rect x="-10" y="18" width="60" height="8" fill="white" transform="rotate(-30 20 20)" />}
          {shape === 3 && <polygon points="20,2 38,20 20,38 2,20" fill="white" />}
        </svg>
        <span
          className="absolute inset-0 flex items-center justify-center font-display font-bold text-white drop-shadow"
          style={{ fontSize: size * 0.42 }}
        >
          {name.slice(0, 1).toUpperCase()}
        </span>
      </div>
      {status && (
        <span
          className={cn('absolute -right-0.5 -bottom-0.5 rounded-full border-2 border-ink-1', statusColor[status])}
          style={{ width: dot, height: dot }}
        />
      )}
    </div>
  )
})
