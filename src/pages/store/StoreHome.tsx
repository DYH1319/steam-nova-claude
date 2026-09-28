import { AnimatePresence, motion } from 'motion/react'
import { ArrowRight, ChevronLeft, ChevronRight, Clock, Flame, Heart, Sparkles, Users } from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router'
import { Avatar } from '@/components/art/Avatar'
import { GameArt, GameLogo } from '@/components/art/GameArt'
import { OwnedBadge, StoreCapsule, WishButton } from '@/components/game'
import { Button, IconButton, PlatformIcons, Price, SectionHeader, Skeleton, Tabs } from '@/components/ui'
import { GENRES, games, gameMap, ratingLabel, type Game } from '@/data/games'
import { friendOwned } from '@/data/social'
import { useFakeLoad, useNow } from '@/lib/hooks'
import { useStore } from '@/store'
import { cn, formatDate } from '@/lib/utils'

const FEATURED = games.filter((g) => g.featured)

function BuyButtons({ g }: { g: Game }) {
  const owned = useStore((s) => !!s.owned[g.id])
  const inCart = useStore((s) => s.cart.includes(g.id))
  const addToCart = useStore((s) => s.addToCart)
  const set = useStore((s) => s.set)
  const nav = useNavigate()
  if (owned) return <Button variant="play" size="lg" onClick={() => nav(`/library/${g.id}`)}>在游戏库中查看</Button>
  if (g.comingSoon) return <Button variant="secondary" size="lg" onClick={() => nav(`/game/${g.id}`)}>了解更多</Button>
  return inCart
    ? <Button variant="secondary" size="lg" onClick={() => set({ cartOpen: true })}>在购物车中</Button>
    : <Button variant="primary" size="lg" onClick={() => addToCart(g.id)}>{g.price === 0 ? '免费开玩' : '加入购物车'}</Button>
}

function Hero() {
  const [i, setI] = useState(0)
  const [paused, setPaused] = useState(false)
  const nav = useNavigate()
  const g = FEATURED[i]
  useEffect(() => {
    if (paused) return
    const t = setTimeout(() => setI((x) => (x + 1) % FEATURED.length), 7000)
    return () => clearTimeout(t)
  }, [i, paused])
  const rl = ratingLabel(g.rating, g.reviews)
  return (
    <div className="grid grid-cols-[1fr_300px] gap-4" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="relative h-[440px] overflow-hidden rounded-2xl bg-ink-3 ring-1 ring-white/[0.06]">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div key={g.id} className="absolute inset-0 cursor-pointer" initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }} onClick={() => nav(`/game/${g.id}`)}>
            <GameArt game={g} variant={0} className="h-full w-full" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </motion.div>
        </AnimatePresence>
        <div className="pointer-events-none absolute inset-0 flex flex-col justify-end p-10">
          <AnimatePresence mode="wait">
            <motion.div key={g.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.4 }} className="max-w-[520px]">
              <div className="mb-4 flex items-center gap-2">
                <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-white backdrop-blur-md">
                  <Sparkles size={12} className="text-nova-soft" />{g.discount ? '特惠精选' : Date.now() - new Date(g.release).getTime() < 60 * 86400000 ? '全新上市' : '编辑推荐'}
                </span>
                <span className={cn('text-xs font-medium', rl.tone)}>{rl.label}</span>
              </div>
              <GameLogo game={g} className="text-[56px]" />
              <p className="mt-4 text-[15px] leading-relaxed text-white/80">{g.short}</p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {g.tags.slice(0, 4).map((t) => <span key={t} className="rounded-md bg-white/10 px-2 py-0.5 text-[11px] text-white/80 backdrop-blur">{t}</span>)}
              </div>
              <div className="pointer-events-auto mt-6 flex items-center gap-3">
                <Price price={g.price} discount={g.discount} size="lg" />
                <BuyButtons g={g} />
                <WishButton id={g.id} className="!h-11 !w-11 !opacity-100" />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="absolute right-6 bottom-6 flex gap-1.5">
          <IconButton icon={ChevronLeft} label="上一个" onClick={() => setI((i - 1 + FEATURED.length) % FEATURED.length)} className="bg-black/30 backdrop-blur" />
          <IconButton icon={ChevronRight} label="下一个" onClick={() => setI((i + 1) % FEATURED.length)} className="bg-black/30 backdrop-blur" />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {FEATURED.map((f, k) => (
          <button key={f.id} onClick={() => setI(k)} className={cn('group relative flex flex-1 items-center gap-3 overflow-hidden rounded-xl p-2 text-left transition', k === i ? 'bg-white/[0.08]' : 'hover:bg-white/[0.04]')}>
            <GameArt game={f} grain={false} className={cn('aspect-[16/10] h-full max-h-[62px] shrink-0 rounded-lg transition', k !== i && 'opacity-60 group-hover:opacity-100')} />
            <div className="min-w-0 flex-1">
              <div className={cn('truncate text-[13px] font-medium', k === i ? 'text-fg' : 'text-fg-2')}>{f.title}</div>
              <div className="mt-0.5 text-[11px] text-fg-3">{f.discount ? <span className="text-sale">-{f.discount}% 特惠中</span> : f.genres.slice(0, 2).join(' · ')}</div>
            </div>
            {k === i && (
              <span className="absolute right-0 bottom-0 left-0 h-0.5 bg-white/5">
                <motion.span key={`${i}-${paused}`} className="nova-gradient block h-full" initial={{ width: '0%' }} animate={{ width: paused ? '0%' : '100%' }} transition={{ duration: paused ? 0 : 7, ease: 'linear' }} />
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

function Countdown({ hours }: { hours: number }) {
  const now = useNow(1000)
  const end = useMemo(() => {
    const d = new Date(); d.setMinutes(0, 0, 0)
    return d.getTime() + hours * 3600000
  }, [hours])
  const left = Math.max(0, end - now) / 1000
  const d = Math.floor(left / 86400)
  const h = Math.floor((left % 86400) / 3600).toString().padStart(2, '0')
  const m = Math.floor((left % 3600) / 60).toString().padStart(2, '0')
  const s = Math.floor(left % 60).toString().padStart(2, '0')
  return <span className="tabular-nums">{d > 0 && `${d} 天 `}{h}:{m}:{s}</span>
}

function Scroller({ children, title, subtitle, action }: { children: ReactNode; title: ReactNode; subtitle?: string; action?: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const [edge, setEdge] = useState({ l: true, r: false })
  const upd = () => {
    const el = ref.current
    if (el) setEdge({ l: el.scrollLeft < 8, r: el.scrollLeft + el.clientWidth > el.scrollWidth - 8 })
  }
  useEffect(upd, [])
  const by = (d: number) => ref.current?.scrollBy({ left: d * (ref.current.clientWidth - 120), behavior: 'smooth' })
  return (
    <section>
      <SectionHeader
        title={title}
        subtitle={subtitle}
        action={
          <div className="flex items-center gap-2">
            {action}
            <IconButton icon={ChevronLeft} label="向左" disabled={edge.l} onClick={() => by(-1)} className="bg-white/[0.04] disabled:opacity-30" />
            <IconButton icon={ChevronRight} label="向右" disabled={edge.r} onClick={() => by(1)} className="bg-white/[0.04] disabled:opacity-30" />
          </div>
        }
      />
      <div ref={ref} onScroll={upd} className="no-scrollbar -mx-2 flex snap-x gap-4 overflow-x-auto scroll-smooth px-2 pt-1 pb-4">
        {children}
      </div>
    </section>
  )
}

function DealCard({ g }: { g: Game }) {
  const owned = useStore((s) => !!s.owned[g.id])
  return (
    <Link to={`/game/${g.id}`} className="group w-[292px] shrink-0 snap-start">
      <div className="relative overflow-hidden rounded-2xl bg-ink-3 ring-1 ring-white/[0.06] transition duration-300 group-hover:-translate-y-1 group-hover:ring-white/15">
        <GameArt game={g} title="landscape" className="aspect-[16/10] transition-transform duration-700 group-hover:scale-[1.04]" />
        <div className="absolute top-2.5 left-2.5 flex gap-1.5">{owned && <OwnedBadge />}</div>
        <WishButton id={g.id} className="absolute top-2.5 right-2.5" />
        <div className="flex items-center justify-between gap-3 p-3.5">
          <div className="min-w-0">
            <div className="flex items-center gap-1 text-[11px] font-medium text-nova-soft"><Clock size={11} /> 剩余 <Countdown hours={g.saleEndsInH ?? 48} /></div>
            <div className="mt-1 truncate text-[13.5px] font-medium">{g.title}</div>
          </div>
          <Price price={g.price} discount={g.discount} />
        </div>
      </div>
    </Link>
  )
}

function GenreTiles() {
  const tiles = GENRES.slice(0, 12).map((name) => {
    const list = games.filter((g) => g.genres.includes(name))
    return { name, count: list.length, game: list[0] }
  }).filter((t) => t.game)
  return (
    <section>
      <SectionHeader title="按类型浏览" subtitle="找到属于你的下一款游戏" />
      <div className="grid grid-cols-4 gap-3 xl:grid-cols-6">
        {tiles.map((t) => (
          <Link key={t.name} to={`/store/browse?genre=${encodeURIComponent(t.name)}`} className="group relative h-28 overflow-hidden rounded-xl ring-1 ring-white/[0.06]">
            <GameArt game={t.game} variant={2} grain={false} className="absolute inset-0 transition duration-700 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10 transition group-hover:from-black/70" />
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-3.5">
              <span className="font-display text-lg font-bold text-white">{t.name}</span>
              <span className="text-[11px] text-white/60">{t.count} 款</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

type TabKey = 'new' | 'top' | 'soon' | 'free'

function TabbedList() {
  const [tab, setTab] = useState<TabKey>('new')
  const list = useMemo(() => {
    const avail = games.filter((g) => !g.comingSoon)
    if (tab === 'new') return [...avail].sort((a, b) => +new Date(b.release) - +new Date(a.release)).slice(0, 8)
    if (tab === 'top') return [...avail].sort((a, b) => (b.players ?? 0) - (a.players ?? 0)).filter((g) => g.price > 0).slice(0, 8)
    if (tab === 'soon') return games.filter((g) => g.comingSoon || Date.now() - +new Date(g.release) < 25 * 86400000)
    return avail.filter((g) => g.price === 0 || g.discount >= 50)
  }, [tab])
  const [hover, setHover] = useState<string>(list[0]?.id)
  useEffect(() => setHover(list[0]?.id), [list])
  const h = gameMap[hover] ?? list[0]
  const rl = h && ratingLabel(h.rating, h.reviews)
  return (
    <section>
      <Tabs
        id="store-tabs"
        value={tab}
        onChange={setTab}
        className="mb-4"
        options={[
          { value: 'new', label: '新品与热门' },
          { value: 'top', label: '热销商品' },
          { value: 'soon', label: '即将推出' },
          { value: 'free', label: '免费与超值' },
        ]}
      />
      <div className="grid grid-cols-[1fr_340px] gap-5">
        <div className="space-y-1">
          {list.map((g) => (
            <Link
              key={g.id}
              to={`/game/${g.id}`}
              onMouseEnter={() => setHover(g.id)}
              className={cn('flex items-center gap-4 rounded-xl p-2 pr-4 transition', hover === g.id ? 'bg-white/[0.07]' : 'hover:bg-white/[0.03]')}
            >
              <GameArt game={g} title="landscape" grain={false} className="aspect-[16/9] w-[150px] shrink-0 rounded-lg" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-[14px] font-medium">{g.title}</div>
                <div className="mt-1 flex items-center gap-2 text-[11.5px] text-fg-3">
                  <PlatformIcons platforms={g.platforms} />
                  <span className="truncate">{g.tags.slice(0, 3).join(' · ')}</span>
                </div>
              </div>
              <div className="text-right">
                <Price price={g.price} discount={g.discount} comingSoon={g.comingSoon} />
                {g.comingSoon && <div className="mt-1 text-[11px] text-fg-3">{formatDate(g.release)}</div>}
              </div>
            </Link>
          ))}
        </div>
        {h && (
          <div className="sticky top-20 h-fit">
            <AnimatePresence mode="wait">
              <motion.div key={h.id} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="rounded-2xl bg-ink-2 p-4 ring-1 ring-white/[0.06]">
                <div className="font-display text-lg font-semibold">{h.title}</div>
                <div className="mt-1 flex items-center gap-2 text-xs">
                  <span className="text-fg-3">总体评价：</span>
                  <span className={rl.tone}>{rl.label}</span>
                  {h.reviews > 0 && <span className="text-fg-4">({h.reviews.toLocaleString()})</span>}
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">{h.tags.map((t) => <span key={t} className="chip">{t}</span>)}</div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {[1, 2, 3, 4].map((v) => <GameArt key={v} game={h} variant={v} grain={false} className="aspect-[16/9] rounded-lg" />)}
                </div>
                <p className="mt-3 line-clamp-3 text-[12.5px] leading-relaxed text-fg-3">{h.short}</p>
              </motion.div>
            </AnimatePresence>
          </div>
        )}
      </div>
    </section>
  )
}

function FriendsPlaying() {
  const friends = useStore((s) => s.friends)
  const data = useMemo(() => {
    const map: Record<string, typeof friends> = {}
    friends.forEach((f) => friendOwned(f.id).forEach((id) => (map[id] ??= []).push(f)))
    return Object.entries(map).sort((a, b) => b[1].length - a[1].length).slice(0, 4).map(([id, fs]) => ({ g: gameMap[id], fs }))
  }, [friends])
  return (
    <section>
      <SectionHeader title={<span className="flex items-center gap-2"><Users size={17} className="text-online" />好友都在玩</span>} subtitle="你的好友最近常玩的游戏" />
      <div className="grid grid-cols-4 gap-4">
        {data.map(({ g, fs }) => (
          <div key={g.id}>
            <StoreCapsule game={g} />
            <div className="mt-2.5 flex items-center gap-2">
              <div className="flex -space-x-2">
                {fs.slice(0, 5).map((f) => <Avatar key={f.id} seed={f.id} name={f.name} size={22} className="rounded-md ring-2 ring-ink-1" />)}
              </div>
              <span className="text-[11.5px] text-fg-3">{fs.length} 位好友拥有</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function Recommended() {
  const owned = useStore((s) => s.owned)
  const recs = useMemo(() => {
    const ownedGames = Object.keys(owned).map((id) => gameMap[id])
    const tagW: Record<string, number> = {}
    ownedGames.forEach((g) => g.tags.concat(g.genres).forEach((t) => (tagW[t] = (tagW[t] ?? 0) + (owned[g.id].playtime + 60))))
    return games
      .filter((g) => !owned[g.id])
      .map((g) => {
        const score = g.tags.concat(g.genres).reduce((s, t) => s + (tagW[t] ?? 0), 0)
        const because = ownedGames.filter((o) => o.tags.some((t) => g.tags.includes(t))).sort((a, b) => owned[b.id].playtime - owned[a.id].playtime)[0]
        return { g, score, because }
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
  }, [owned])
  return (
    <section>
      <SectionHeader title={<span className="flex items-center gap-2"><Heart size={17} className="text-nova-hot" />为你推荐</span>} subtitle="基于你的游玩记录与偏好" action={<Link to="/store/browse" className="flex items-center gap-1 text-[13px] text-fg-3 hover:text-nova">浏览更多 <ArrowRight size={14} /></Link>} />
      <div className="grid grid-cols-4 gap-x-4 gap-y-7">
        {recs.map(({ g, because }) => (
          <div key={g.id}>
            <StoreCapsule game={g} />
            {because && <div className="mt-1.5 truncate text-[11px] text-fg-4">因为你玩过 <span className="text-fg-3">{because.title}</span></div>}
          </div>
        ))}
      </div>
    </section>
  )
}

function StoreSkeleton() {
  return (
    <div className="space-y-12">
      <div className="grid grid-cols-[1fr_300px] gap-4">
        <Skeleton className="h-[440px] rounded-2xl" />
        <div className="flex flex-col gap-2">{Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className="flex-1 rounded-xl" />)}</div>
      </div>
      <div>
        <Skeleton className="mb-4 h-5 w-40" />
        <div className="flex gap-4">{Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-[240px] w-[292px] shrink-0 rounded-2xl" />)}</div>
      </div>
    </div>
  )
}

export default function StoreHome() {
  const loading = useFakeLoad('store', 650)
  const deals = useMemo(() => games.filter((g) => g.discount > 0).sort((a, b) => b.discount - a.discount), [])
  return (
    <div className="mx-auto max-w-[1320px] space-y-14 px-8 pt-6">
      {loading ? <StoreSkeleton /> : (
        <>
          <Hero />
          <div className="relative overflow-hidden rounded-2xl border border-nova/20 bg-gradient-to-r from-nova/15 via-nova-hot/10 to-transparent px-8 py-6">
            <div className="absolute -top-20 -right-10 h-60 w-60 rounded-full bg-nova-hot/20 blur-3xl" />
            <div className="relative flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-[12px] font-bold tracking-[0.16em] text-nova-soft uppercase"><Flame size={14} />Nova 秋季特卖</div>
                <div className="mt-1 font-display text-2xl font-bold">超过 {deals.length} 款游戏低至 4 折</div>
                <div className="mt-1 text-[13px] text-fg-3">活动截止 10 月 3 日 · 每日精选特惠轮换</div>
              </div>
              <Link to="/store/browse?special=1"><Button variant="primary" size="lg" iconRight={ArrowRight}>查看全部特惠</Button></Link>
            </div>
          </div>
          <Scroller title="限时特惠" subtitle="倒计时结束后恢复原价">
            {deals.map((g) => <DealCard key={g.id} g={g} />)}
          </Scroller>
          <TabbedList />
          <GenreTiles />
          <FriendsPlaying />
          <Recommended />
        </>
      )}
    </div>
  )
}
