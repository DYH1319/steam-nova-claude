import { AnimatePresence, motion } from 'motion/react'
import { CircleCheck, Download, Info, TriangleAlert, X } from 'lucide-react'
import { useNavigate } from 'react-router'
import { AchievementIcon } from '@/components/art/AchievementIcon'
import { Avatar } from '@/components/art/Avatar'
import { MiniCover } from '@/components/game'
import { getAchievements } from '@/data/achievements'
import { gameMap } from '@/data/games'
import { useStore, type Toast } from '@/store'
import { usePanelVisible } from './friends-utils'
import { cn } from '@/lib/utils'

function ToastCard({ t }: { t: Toast }) {
  const dismiss = useStore((s) => s.dismissToast)
  const friends = useStore((s) => s.friends)
  const nav = useNavigate()
  const g = t.gameId ? gameMap[t.gameId] : null

  if (t.kind === 'achievement' && g) {
    const a = getAchievements(g.id).find((x) => x.id === t.achId)!
    return (
      <button onClick={() => { nav(`/achievements/${g.id}`); dismiss(t.id) }} className="relative flex w-full items-center gap-3.5 overflow-hidden rounded-2xl border border-gold/30 bg-ink-3/95 p-3.5 text-left shadow-pop backdrop-blur-xl">
        <div className="pointer-events-none absolute -top-10 -left-10 h-32 w-32 rounded-full bg-gold/20 blur-2xl" />
        <motion.div initial={{ scale: 0.4, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 14, delay: 0.1 }}>
          <AchievementIcon a={a} unlocked size={52} />
        </motion.div>
        <div className="relative min-w-0 flex-1">
          <div className="text-[10.5px] font-bold tracking-[0.16em] text-gold uppercase">成就已解锁</div>
          <div className="mt-0.5 truncate text-[14px] font-semibold">{t.title}</div>
          <div className="truncate text-xs text-fg-3">{t.body}</div>
          <div className="mt-1 truncate text-[11px] text-fg-4">{g.title} · {a.rarity}% 的玩家拥有</div>
        </div>
      </button>
    )
  }

  const f = t.friendId ? friends.find((x) => x.id === t.friendId) : null
  const Icon = t.kind === 'success' ? CircleCheck : t.kind === 'error' ? TriangleAlert : t.kind === 'download' ? Download : Info
  const onClick = () => {
    if (t.kind === 'download' && g) nav(`/library/${g.id}`)
    else if (f) useStore.getState().openChat(f.id)
    else if (g && t.kind === 'success') nav(`/game/${g.id}`)
    dismiss(t.id)
  }
  return (
    <div onClick={onClick} className="group relative flex w-full cursor-pointer items-center gap-3 rounded-2xl border hairline bg-ink-3/95 p-3 shadow-pop backdrop-blur-xl">
      {f ? (
        <Avatar seed={f.id} name={f.name} size={40} status={f.status} />
      ) : g ? (
        <MiniCover game={g} className="h-10 w-14 shrink-0" />
      ) : (
        <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', t.kind === 'success' ? 'bg-ingame/15 text-ingame' : t.kind === 'error' ? 'bg-danger/15 text-danger' : 'bg-white/[0.06] text-fg-2')}>
          <Icon size={18} />
        </span>
      )}
      <div className="min-w-0 flex-1">
        <div className={cn('truncate text-[13px] font-semibold', t.kind === 'friend' && f?.status === 'ingame' ? 'text-ingame' : 'text-fg')}>{t.title}</div>
        {t.body && <div className="truncate text-xs text-fg-3">{t.body}</div>}
      </div>
      <button onClick={(e) => { e.stopPropagation(); dismiss(t.id) }} className="rounded-md p-1 text-fg-3 opacity-0 transition group-hover:opacity-100 hover:bg-white/10 hover:text-fg" aria-label="关闭"><X size={13} /></button>
    </div>
  )
}

export function Toasts() {
  const toasts = useStore((s) => s.toasts)
  const panel = usePanelVisible()
  return (
    <div className="pointer-events-none fixed top-[100px] z-[90] flex w-[340px] flex-col gap-2.5 transition-[right] duration-300" style={{ right: panel ? 288 : 16 }}>
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, x: 40, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40, scale: 0.96, transition: { duration: 0.18 } }}
            transition={{ type: 'spring', stiffness: 420, damping: 32 }}
            className="pointer-events-auto"
          >
            <ToastCard t={t} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
