import { Check, Download, Heart, Loader2, Play, Star } from 'lucide-react'
import { useEffect, useState, type MouseEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { GameArt } from '@/components/art/GameArt'
import { PlatformIcons, Price, Progress } from '@/components/ui'
import { ratingLabel, type Game } from '@/data/games'
import { useStore } from '@/store'
import { cn, formatDate, formatHours } from '@/lib/utils'

function useHoverCycle(max = 3, delay = 700, every = 1300) {
  const [hover, setHover] = useState(false)
  const [v, setV] = useState(0)
  useEffect(() => {
    if (!hover) { setV(0); return }
    let i = 0
    let iv: ReturnType<typeof setInterval>
    const t = setTimeout(() => {
      setV(++i)
      iv = setInterval(() => setV((i = (i % max) + 1)), every)
    }, delay)
    return () => { clearTimeout(t); clearInterval(iv) }
  }, [hover, max, delay, every])
  return { v, bind: { onMouseEnter: () => setHover(true), onMouseLeave: () => setHover(false) } }
}

export function WishButton({ id, className }: { id: string; className?: string }) {
  const on = useStore((s) => s.wishlist.includes(id))
  const toggle = useStore((s) => s.toggleWishlist)
  return (
    <button
      aria-label="愿望单"
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(id) }}
      className={cn(
        'flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-md transition',
        on ? 'bg-nova-hot/90 text-white' : 'bg-black/45 text-white/80 opacity-0 group-hover:opacity-100 hover:bg-black/70 hover:text-white',
        className,
      )}
    >
      <Heart size={15} fill={on ? 'currentColor' : 'none'} />
    </button>
  )
}

export function OwnedBadge() {
  return <span className="rounded-md bg-black/55 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-ingame backdrop-blur-md">已拥有</span>
}

export function StoreCapsule({ game, className, size = 'md' }: { game: Game; className?: string; size?: 'md' | 'lg' }) {
  const owned = useStore((s) => !!s.owned[game.id])
  const { v, bind } = useHoverCycle()
  const isNew = Date.now() - new Date(game.release).getTime() < 30 * 86400000 && !game.comingSoon
  return (
    <Link to={`/game/${game.id}`} className={cn('group block', className)} {...bind}>
      <div className="relative aspect-[16/9] overflow-hidden rounded-xl bg-ink-3 ring-1 ring-white/[0.06] transition duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_18px_40px_-16px_rgba(0,0,0,0.9)] group-hover:ring-white/15">
        <GameArt game={game} variant={v} title={v ? 'none' : 'landscape'} className="h-full w-full transition-transform duration-700 group-hover:scale-[1.03]" />
        <div className="absolute top-2 left-2 flex gap-1.5">
          {owned && <OwnedBadge />}
          {isNew && <span className="rounded-md bg-nova px-1.5 py-0.5 text-[10px] font-bold text-white">新品</span>}
          {game.comingSoon && <span className="rounded-md bg-black/55 px-1.5 py-0.5 text-[10px] font-semibold text-fg backdrop-blur">即将推出</span>}
        </div>
        <WishButton id={game.id} className="absolute top-2 right-2" />
        {v > 0 && (
          <div className="absolute inset-x-0 bottom-0 flex gap-1 p-2">
            {[1, 2, 3].map((i) => <span key={i} className={cn('h-0.5 flex-1 rounded-full transition', i === v ? 'bg-white' : 'bg-white/30')} />)}
          </div>
        )}
      </div>
      <div className={cn('mt-2.5 flex items-start justify-between gap-3', size === 'lg' && 'mt-3')}>
        <div className="min-w-0">
          <div className={cn('truncate font-medium text-fg transition group-hover:text-white', size === 'lg' ? 'text-[15px]' : 'text-[13.5px]')}>{game.title}</div>
          <div className="mt-0.5 truncate text-xs text-fg-3">{game.tags.slice(0, 3).join(' · ')}</div>
        </div>
        <Price price={game.price} discount={game.discount} size="sm" comingSoon={game.comingSoon} className="mt-0.5" />
      </div>
    </Link>
  )
}

export function StoreRow({ game }: { game: Game }) {
  const owned = useStore((s) => !!s.owned[game.id])
  const rl = ratingLabel(game.rating, game.reviews)
  return (
    <Link to={`/game/${game.id}`} className="group flex items-center gap-4 rounded-xl p-2 pr-4 transition hover:bg-white/[0.04]">
      <div className="relative w-[168px] shrink-0 overflow-hidden rounded-lg ring-1 ring-white/5">
        <GameArt game={game} title="landscape" className="aspect-[16/9] transition-transform duration-500 group-hover:scale-105" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-[14.5px] font-medium">{game.title}</span>
          {owned && <span className="rounded bg-ingame/15 px-1.5 text-[10px] font-semibold text-ingame">已拥有</span>}
        </div>
        <div className="mt-1 flex items-center gap-2 text-xs text-fg-3">
          <PlatformIcons platforms={game.platforms} />
          <span className="text-fg-4">|</span>
          <span className="truncate">{game.tags.slice(0, 4).join(' · ')}</span>
        </div>
      </div>
      <div className="hidden w-32 text-xs text-fg-3 xl:block">{game.comingSoon ? '即将推出' : formatDate(game.release)}</div>
      <div className={cn('hidden w-20 text-xs font-medium lg:block', rl.tone)}>{rl.label}</div>
      <div className="flex w-32 justify-end">
        <Price price={game.price} discount={game.discount} comingSoon={game.comingSoon} />
      </div>
      <WishButton id={game.id} className="!bg-white/[0.06]" />
    </Link>
  )
}

export function LibraryCapsule({ game, className }: { game: Game; className?: string }) {
  const own = useStore((s) => s.owned[game.id])
  const dl = useStore((s) => s.downloads.find((d) => d.gameId === game.id))
  const running = useStore((s) => s.running?.gameId === game.id ? s.running : null)
  const launch = useStore((s) => s.launch)
  const set = useStore((s) => s.set)
  const nav = useNavigate()
  if (!own) return null
  const act = (e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (own.installed) launch(game.id)
    else if (dl) nav('/downloads')
    else set({ installTarget: game.id })
  }
  const dim = !own.installed && !dl
  return (
    <Link to={`/library/${game.id}`} className={cn('group relative block', className)}>
      <div className={cn('relative aspect-[2/3] overflow-hidden rounded-xl ring-1 ring-white/[0.06] transition duration-300 group-hover:-translate-y-1.5 group-hover:shadow-[0_22px_40px_-16px_rgba(0,0,0,0.95)] group-hover:ring-white/20', running && 'ring-2 ring-ingame')}>
        <GameArt game={game} title="portrait" className={cn('h-full w-full transition duration-500', dim && 'brightness-[0.6] saturate-[0.35] group-hover:brightness-100 group-hover:saturate-100')} />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/85 via-black/30 to-transparent opacity-0 transition group-hover:opacity-100" />
        {own.favorite && <Star size={14} className="absolute top-2.5 right-2.5 fill-gold text-gold drop-shadow" />}
        {running && (
          <span className="absolute top-2.5 left-2.5 flex items-center gap-1.5 rounded-md bg-ingame px-1.5 py-0.5 text-[10px] font-bold text-[#07210c]">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#07210c]" />{running.phase === 'launching' ? '启动中' : '运行中'}
          </span>
        )}
        <div className="absolute inset-x-0 bottom-0 flex translate-y-2 items-end justify-between gap-2 p-3 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <div className="min-w-0 text-[11px] text-fg-2">
            {own.playtime > 0 ? <>已游玩 <span className="text-fg">{formatHours(own.playtime)}</span></> : '尚未游玩'}
          </div>
          {!running && (
            <button
              onClick={act}
              aria-label={own.installed ? '开始游戏' : '安装'}
              className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-full shadow-lg transition hover:scale-110', own.installed ? 'bg-ingame text-[#07210c]' : 'bg-white text-ink-1')}
            >
              {own.installed ? <Play size={17} fill="currentColor" className="ml-0.5" /> : dl ? <Loader2 size={17} className="animate-spin" /> : <Download size={17} />}
            </button>
          )}
        </div>
        {dl && (
          <div className="absolute inset-x-0 bottom-0 bg-black/70 px-2.5 py-2 backdrop-blur-sm transition group-hover:opacity-0">
            <div className="mb-1 flex justify-between text-[10px] text-fg-2">
              <span>{dl.status === 'downloading' ? (dl.kind === 'update' ? '更新中' : '下载中') : dl.status === 'paused' ? '已暂停' : '排队中'}</span>
              <span className="tabular-nums">{Math.floor((dl.done / dl.total) * 100)}%</span>
            </div>
            <Progress value={(dl.done / dl.total) * 100} tone={dl.status === 'downloading' ? 'nova' : 'muted'} className="h-1" />
          </div>
        )}
      </div>
    </Link>
  )
}

export function MiniCover({ game, className, dim }: { game: Game; className?: string; dim?: boolean }) {
  return <GameArt game={game} grain={false} className={cn('rounded-md', dim && 'brightness-50 saturate-0', className)} />
}

export function OwnedCheck() {
  return <Check size={14} className="text-ingame" />
}
