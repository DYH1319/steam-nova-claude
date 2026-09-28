import { AnimatePresence, motion } from 'motion/react'
import {
  Check, ChevronLeft, ChevronRight, Cloud, Download, Gamepad2, Heart, Laugh, Maximize2, Monitor, Pause, Play, Share2, ShoppingCart,
  ThumbsDown, ThumbsUp, Trophy, User, Users, Volume2, Wrench, Swords, type LucideIcon,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { AchievementIcon } from '@/components/art/AchievementIcon'
import { Avatar } from '@/components/art/Avatar'
import { GameArt } from '@/components/art/GameArt'
import { StoreCapsule } from '@/components/game'
import { Button, EmptyState, PlatformIcons, Price, Progress, SectionHeader, Segmented, Select, Skeleton } from '@/components/ui'
import { getAchievements } from '@/data/achievements'
import { FEATURE_LABEL, REQUIREMENTS, gameMap, games, ratingLabel, type Feature, type Game } from '@/data/games'
import { friendsWhoOwn, getReviews } from '@/data/social'
import { useFakeLoad } from '@/lib/hooks'
import { useStore } from '@/store'
import { cn, formatDate, formatHours, formatPrice, formatSize, timeAgo } from '@/lib/utils'

const FEATURE_ICON: Record<Feature, LucideIcon> = {
  single: User, multi: Users, coop: Users, pvp: Swords, controller: Gamepad2, cloud: Cloud, achievements: Trophy, workshop: Wrench,
}

function Gallery({ g }: { g: Game }) {
  const [i, setI] = useState(0)
  const [playing, setPlaying] = useState(false)
  const shots = [0, 1, 2, 3, 4, 5, 6]
  useEffect(() => { setI(0); setPlaying(false) }, [g.id])
  const go = (d: number) => { setPlaying(false); setI((x) => (x + d + shots.length) % shots.length) }
  return (
    <div>
      <div className="group relative aspect-[16/9] overflow-hidden rounded-xl bg-black ring-1 ring-white/[0.06]">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div key={i} className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
            <motion.div
              className="h-full w-full"
              animate={playing ? { scale: [1, 1.18, 1.05], x: [0, -30, 20], y: [0, 10, -10] } : { scale: 1, x: 0, y: 0 }}
              transition={playing ? { duration: 14, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.4 }}
            >
              <GameArt game={g} variant={i === 0 ? 0 : i} className="h-full w-full" />
            </motion.div>
          </motion.div>
        </AnimatePresence>
        {i === 0 && !playing && (
          <button onClick={() => setPlaying(true)} className="absolute inset-0 flex items-center justify-center bg-black/25 transition hover:bg-black/10" aria-label="播放预告片">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/30 backdrop-blur-md transition hover:scale-110"><Play size={26} fill="white" className="ml-1 text-white" /></span>
            <span className="absolute bottom-4 left-4 rounded-md bg-black/50 px-2 py-1 text-[11px] font-medium text-white backdrop-blur">官方预告片 · 2:14</span>
          </button>
        )}
        {i === 0 && playing && (
          <div className="absolute inset-x-0 bottom-0 flex items-center gap-3 bg-gradient-to-t from-black/80 to-transparent px-4 pt-8 pb-3">
            <button onClick={() => setPlaying(false)} className="text-white" aria-label="暂停"><Pause size={17} fill="white" /></button>
            <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/20">
              <motion.div className="nova-gradient h-full" initial={{ width: '0%' }} animate={{ width: '100%' }} transition={{ duration: 134, ease: 'linear' }} />
            </div>
            <Volume2 size={16} className="text-white/80" />
            <Maximize2 size={15} className="text-white/80" />
          </div>
        )}
        <button onClick={() => go(-1)} className="absolute top-1/2 left-3 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white opacity-0 backdrop-blur transition group-hover:opacity-100 hover:bg-black/60" aria-label="上一张"><ChevronLeft size={20} /></button>
        <button onClick={() => go(1)} className="absolute top-1/2 right-3 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white opacity-0 backdrop-blur transition group-hover:opacity-100 hover:bg-black/60" aria-label="下一张"><ChevronRight size={20} /></button>
      </div>
      <div className="no-scrollbar mt-2.5 flex gap-2 overflow-x-auto pb-1">
        {shots.map((v, k) => (
          <button key={v} onClick={() => { setI(k); setPlaying(false) }} className={cn('relative aspect-[16/9] w-[112px] shrink-0 overflow-hidden rounded-lg transition', k === i ? 'ring-2 ring-nova' : 'opacity-55 hover:opacity-100')}>
            <GameArt game={g} variant={v} grain={false} className="h-full w-full" />
            {k === 0 && <span className="absolute inset-0 flex items-center justify-center bg-black/30"><Play size={16} fill="white" className="text-white" /></span>}
          </button>
        ))}
      </div>
    </div>
  )
}

function PurchaseBox({ g }: { g: Game }) {
  const own = useStore((s) => s.owned[g.id])
  const inCart = useStore((s) => s.cart.includes(g.id))
  const wished = useStore((s) => s.wishlist.includes(g.id))
  const { addToCart, toggleWishlist, set, claimFree, launch } = useStore()
  const nav = useNavigate()
  if (own)
    return (
      <div className="relative overflow-hidden rounded-2xl border border-ingame/25 bg-gradient-to-r from-ingame/10 to-transparent p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 font-display text-[17px] font-semibold"><Check size={18} className="text-ingame" />{g.title} 已在你的游戏库中</div>
            <div className="mt-1 text-[13px] text-fg-3">{own.playtime ? `已游玩 ${formatHours(own.playtime)}` : '尚未游玩'} · {own.installed ? '已安装' : '未安装'}</div>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => nav(`/library/${g.id}`)}>前往游戏库</Button>
            {own.installed ? <Button variant="play" icon={Play} onClick={() => launch(g.id)}>开始游戏</Button> : <Button variant="primary" icon={Download} onClick={() => set({ installTarget: g.id })}>安装</Button>}
          </div>
        </div>
      </div>
    )
  return (
    <div className="rounded-2xl bg-ink-2 p-5 ring-1 ring-white/[0.06]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="font-display text-[17px] font-semibold">{g.comingSoon ? `预购 ${g.title}` : g.price === 0 ? `开始玩 ${g.title}` : `购买 ${g.title}`}</div>
          <div className="mt-1 flex items-center gap-2 text-[12.5px] text-fg-3">
            <PlatformIcons platforms={g.platforms} />
            {g.discount > 0 && g.saleEndsInH && <span className="text-nova-soft">特惠将于 {Math.ceil(g.saleEndsInH / 24)} 天后结束</span>}
            {g.comingSoon && <span>预计发行：{formatDate(g.release)}</span>}
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-black/30 p-1.5">
          {!g.comingSoon && <Price price={g.price} discount={g.discount} size="lg" />}
          {g.comingSoon ? (
            <Button variant={wished ? 'secondary' : 'primary'} size="lg" icon={Heart} onClick={() => toggleWishlist(g.id)}>{wished ? '已在愿望单' : '加入愿望单'}</Button>
          ) : g.price === 0 ? (
            <Button variant="primary" size="lg" onClick={() => claimFree(g.id)}>免费开玩</Button>
          ) : inCart ? (
            <Button variant="secondary" size="lg" icon={Check} onClick={() => set({ cartOpen: true })}>在购物车中</Button>
          ) : (
            <Button variant="primary" size="lg" icon={ShoppingCart} onClick={() => addToCart(g.id)}>加入购物车</Button>
          )}
        </div>
      </div>
    </div>
  )
}

function DlcList({ g }: { g: Game }) {
  const owned = useStore((s) => !!s.owned[g.id])
  const ownedDlc = useStore((s) => s.ownedDlc)
  const { buyDlc, ask } = useStore()
  if (!g.dlc?.length) return null
  return (
    <section>
      <SectionHeader title="此游戏的可下载内容" />
      <div className="overflow-hidden rounded-xl ring-1 ring-white/[0.06]">
        {g.dlc.map((d, k) => {
          const has = ownedDlc.includes(d.id)
          return (
            <div key={d.id} className={cn('flex items-center gap-4 bg-ink-2 px-4 py-3', k > 0 && 'border-t hairline')}>
              <GameArt game={g} variant={k + 3} grain={false} className="aspect-[16/9] w-24 rounded-md" />
              <div className="flex-1 text-[13.5px]">{d.title}</div>
              {has ? <span className="flex items-center gap-1.5 text-[13px] text-ingame"><Check size={14} />已拥有</span> : (
                <>
                  <span className="text-[13px] tabular-nums text-fg-2">{formatPrice(d.price)}</span>
                  <Button size="sm" variant="secondary" disabled={!owned} title={owned ? '' : '需要先拥有基础游戏'} onClick={() => ask({ title: `购买 ${d.title}`, body: `将从 Nova 钱包中扣除 ${formatPrice(d.price)}。`, confirmLabel: '确认购买', onConfirm: () => buyDlc(d.id, d.title, d.price) })}>{owned ? '购买' : '需要本体'}</Button>
                </>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}

function Reviews({ g }: { g: Game }) {
  const all = useMemo(() => getReviews(g.id), [g.id])
  const [filter, setFilter] = useState<'all' | 'pos' | 'neg'>('all')
  const [sort, setSort] = useState<'helpful' | 'recent'>('helpful')
  const [votes, setVotes] = useState<Record<string, 'yes' | 'no' | 'funny'>>({})
  if (!g.reviews) return (
    <section><SectionHeader title="用户评测" /><EmptyState icon={ThumbsUp} title="暂无评测" body="游戏发行后，玩家的评测将显示在这里。" className="rounded-2xl bg-ink-2 py-10" /></section>
  )
  const list = all.filter((r) => filter === 'all' || (filter === 'pos' ? r.positive : !r.positive)).sort((a, b) => (sort === 'helpful' ? b.helpful - a.helpful : b.at - a.at))
  const rl = ratingLabel(g.rating, g.reviews)
  const rr = ratingLabel(g.recentRating, g.reviews)
  return (
    <section>
      <SectionHeader title="用户评测" />
      <div className="mb-5 grid grid-cols-2 gap-4 rounded-2xl bg-ink-2 p-5 ring-1 ring-white/[0.06]">
        {[['总体评测', g.rating, rl, g.reviews], ['最近 30 天', g.recentRating, rr, Math.round(g.reviews * 0.04)]].map(([k, v, l, n]) => (
          <div key={k as string}>
            <div className="text-xs text-fg-3">{k as string}</div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className={cn('font-display text-xl font-bold', (l as { tone: string }).tone)}>{(l as { label: string }).label}</span>
              <span className="text-xs text-fg-3">{(n as number).toLocaleString()} 篇评测</span>
            </div>
            <div className="mt-2.5 flex h-2 overflow-hidden rounded-full">
              <div className="bg-online" style={{ width: `${v}%` }} />
              <div className="flex-1 bg-danger/60" />
            </div>
            <div className="mt-1 flex justify-between text-[11px] text-fg-3"><span>{v as number}% 好评</span><span>{100 - (v as number)}% 差评</span></div>
          </div>
        ))}
      </div>
      <div className="mb-4 flex items-center justify-between">
        <Segmented id="rev-filter" value={filter} onChange={setFilter} options={[{ value: 'all', label: '全部' }, { value: 'pos', label: '好评' }, { value: 'neg', label: '差评' }]} />
        <Select value={sort} onChange={setSort} label="排序" options={[{ value: 'helpful', label: '最有价值' }, { value: 'recent', label: '最新发布' }]} />
      </div>
      <div className="space-y-3">
        {list.length === 0 && <div className="rounded-xl bg-ink-2 py-10 text-center text-sm text-fg-3">没有符合条件的评测</div>}
        {list.map((r) => (
          <motion.div layout key={r.id} className="rounded-2xl bg-ink-2 p-5 ring-1 ring-white/[0.05]">
            <div className="flex items-center gap-3">
              <Avatar seed={r.author} name={r.author} size={36} />
              <div className="flex-1">
                <div className="text-[13.5px] font-medium">{r.author}</div>
                <div className="text-[11px] text-fg-3">总时数 {r.hours} 小时 · 发布于 {timeAgo(r.at)}</div>
              </div>
              <div className={cn('flex items-center gap-2 rounded-lg px-3 py-1.5 text-[13px] font-semibold', r.positive ? 'bg-online/10 text-online' : 'bg-danger/10 text-danger')}>
                {r.positive ? <ThumbsUp size={15} /> : <ThumbsDown size={15} />}{r.positive ? '推荐' : '不推荐'}
              </div>
            </div>
            <p className="mt-3.5 text-[13.5px] leading-relaxed text-fg-2">{r.text}</p>
            <div className="mt-4 flex items-center gap-2 text-xs text-fg-3">
              <span>这篇评测是否有价值？</span>
              {([['yes', '是', ThumbsUp], ['no', '否', ThumbsDown], ['funny', '欢乐', Laugh]] as const).map(([k, l, I]) => (
                <button key={k} onClick={() => setVotes((v) => ({ ...v, [r.id]: v[r.id] === k ? undefined! : k }))} className={cn('flex items-center gap-1 rounded-md px-2 py-1 transition', votes[r.id] === k ? 'bg-nova/15 text-nova' : 'bg-white/[0.04] hover:bg-white/[0.08] hover:text-fg')}>
                  <I size={12} />{l}
                </button>
              ))}
              <span className="ml-auto">{(r.helpful + (votes[r.id] === 'yes' ? 1 : 0)).toLocaleString()} 人觉得有价值</span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

function DetailSkeleton() {
  return (
    <div className="mx-auto max-w-[1320px] px-8 pt-6">
      <Skeleton className="h-4 w-60" />
      <Skeleton className="mt-4 h-10 w-96" />
      <div className="mt-6 grid grid-cols-[1fr_360px] gap-6">
        <Skeleton className="aspect-[16/9] rounded-xl" />
        <div className="space-y-3"><Skeleton className="aspect-[16/9] rounded-xl" /><Skeleton className="h-16" /><Skeleton className="h-24" /></div>
      </div>
    </div>
  )
}

export default function GameDetail() {
  const { id = '' } = useParams()
  const g = gameMap[id]
  const loading = useFakeLoad(id, 500)
  const friends = useStore((s) => s.friends)
  const own = useStore((s) => s.owned[id])
  const toast = useStore((s) => s.toast)
  const wished = useStore((s) => s.wishlist.includes(id))
  const toggleWishlist = useStore((s) => s.toggleWishlist)
  const similar = useMemo(() => g ? games.filter((x) => x.id !== g.id && x.tags.some((t) => g.tags.includes(t))).slice(0, 4) : [], [g])
  if (!g) return <EmptyState icon={Gamepad2} title="找不到该游戏" body="它可能已下架或链接有误。" action={<Link to="/store"><Button variant="primary">返回商店</Button></Link>} />
  if (loading) return <DetailSkeleton />
  const rl = ratingLabel(g.rating, g.reviews)
  const rr = ratingLabel(g.recentRating, g.reviews)
  const achs = getAchievements(g.id)
  const fOwn = friendsWhoOwn(friends, g.id)
  const req = REQUIREMENTS[g.tier]

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[520px] overflow-hidden opacity-40">
        <GameArt game={g} variant={5} grain={false} className="h-full w-full scale-110 blur-3xl" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-ink-1/60 to-ink-1" />
      </div>
      <div className="relative mx-auto max-w-[1320px] px-8 pt-6">
        <div className="flex items-center gap-1.5 text-xs text-fg-3">
          <Link to="/store" className="hover:text-fg">商店</Link><ChevronRight size={12} />
          <Link to={`/store/browse?genre=${encodeURIComponent(g.genres[0])}`} className="hover:text-fg">{g.genres[0]}</Link><ChevronRight size={12} />
          <span className="text-fg-2">{g.title}</span>
        </div>
        <div className="mt-3 flex items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-[34px] leading-tight font-bold tracking-tight">{g.title}</h1>
            <div className="mt-1 flex items-center gap-3 text-[13px] text-fg-3">
              <span>{g.developer}</span>
              {own && <span className="flex items-center gap-1 rounded-md bg-ingame/15 px-2 py-0.5 text-[11px] font-semibold text-ingame"><Check size={11} />在游戏库中</span>}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant={wished ? 'secondary' : 'outline'} size="sm" icon={Heart} onClick={() => toggleWishlist(g.id)} className={wished ? 'text-nova-hot' : ''}>{wished ? '已在愿望单' : '添加至愿望单'}</Button>
            <Button variant="outline" size="sm" icon={Share2} onClick={() => { navigator.clipboard?.writeText(`nova://store/${g.id}`).catch(() => {}); toast({ kind: 'success', title: '链接已复制', body: `nova://store/${g.id}` }, 2500) }}>分享</Button>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-[1fr_360px] gap-6">
          <Gallery g={g} />
          <div className="flex flex-col">
            <GameArt game={g} title="landscape" className="aspect-[16/9] rounded-xl ring-1 ring-white/[0.06]" />
            <p className="mt-4 text-[13.5px] leading-relaxed text-fg-2">{g.short}</p>
            <dl className="mt-4 grid grid-cols-[88px_1fr] gap-y-2 text-[12.5px]">
              <dt className="text-fg-3">最近评测</dt><dd className={rr.tone}>{rr.label}{g.reviews > 0 && <span className="text-fg-4"> ({Math.round(g.reviews * 0.04).toLocaleString()})</span>}</dd>
              <dt className="text-fg-3">全部评测</dt><dd className={rl.tone}>{rl.label}{g.reviews > 0 && <span className="text-fg-4"> ({g.reviews.toLocaleString()})</span>}</dd>
              <dt className="text-fg-3">发行日期</dt><dd className="text-fg-2">{formatDate(g.release)}</dd>
              <dt className="text-fg-3">开发商</dt><dd className="text-nova-soft">{g.developer}</dd>
              <dt className="text-fg-3">发行商</dt><dd className="text-nova-soft">{g.publisher}</dd>
            </dl>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {g.tags.map((t) => <Link key={t} to={`/store/browse?q=${encodeURIComponent(t)}`} className="chip">{t}</Link>)}
            </div>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-[1fr_320px] gap-8">
          <div className="min-w-0 space-y-10">
            <PurchaseBox g={g} />
            <DlcList g={g} />
            <section>
              <SectionHeader title="关于这款游戏" />
              <div className="space-y-4 text-[14px] leading-[1.8] text-fg-2">
                {g.about.map((p, k) => <p key={k}>{p}</p>)}
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                {[5, 6].map((v) => <GameArt key={v} game={g} variant={v} className="aspect-[16/9] rounded-xl" />)}
              </div>
            </section>
            <section>
              <SectionHeader title={`包含 ${achs.length} 项 Nova 成就`} action={own && <Link to={`/achievements/${g.id}`} className="text-[13px] text-fg-3 hover:text-nova">查看我的进度 →</Link>} />
              <div className="flex flex-wrap gap-2">
                {achs.slice(0, 11).map((a) => (
                  <div key={a.id} className="group relative">
                    <AchievementIcon a={a} unlocked size={52} />
                    <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 w-44 -translate-x-1/2 rounded-lg bg-ink-4 p-2.5 text-xs opacity-0 shadow-pop transition group-hover:opacity-100">
                      <div className="font-semibold">{a.hidden ? '隐藏成就' : a.name}</div>
                      <div className="mt-0.5 text-fg-3">{a.hidden ? '继续游戏以揭晓' : a.desc}</div>
                    </div>
                  </div>
                ))}
                {achs.length > 11 && <div className="flex h-[52px] w-[52px] items-center justify-center rounded-xl bg-white/[0.05] text-sm font-semibold text-fg-2">+{achs.length - 11}</div>}
              </div>
            </section>
            <section>
              <SectionHeader title="系统需求" />
              <div className="grid grid-cols-2 gap-4">
                {([['最低配置', req.min], ['推荐配置', req.rec]] as const).map(([k, v]) => (
                  <div key={k} className="rounded-2xl bg-ink-2 p-5 ring-1 ring-white/[0.05]">
                    <div className="mb-3 flex items-center gap-2 text-sm font-semibold"><Monitor size={15} className="text-fg-3" />{k}</div>
                    <dl className="space-y-2 text-[12.5px]">
                      {Object.entries(v).map(([a, b]) => <div key={a} className="grid grid-cols-[72px_1fr] gap-2"><dt className="text-fg-3">{a}</dt><dd className="text-fg-2">{b}</dd></div>)}
                      <div className="grid grid-cols-[72px_1fr] gap-2"><dt className="text-fg-3">存储空间</dt><dd className="text-fg-2">需要 {formatSize(g.sizeMB * 1.1)} 可用空间</dd></div>
                    </dl>
                  </div>
                ))}
              </div>
            </section>
            <Reviews g={g} />
          </div>

          <aside className="space-y-5">
            <div className="rounded-2xl bg-ink-2 p-4 ring-1 ring-white/[0.05]">
              <div className="space-y-1">
                {g.features.map((f) => {
                  const I = FEATURE_ICON[f]
                  return <div key={f} className="flex items-center gap-3 rounded-lg px-2 py-1.5 text-[13px] text-fg-2"><I size={15} className="text-nova-soft" />{FEATURE_LABEL[f]}</div>
                })}
              </div>
            </div>
            <div className="rounded-2xl bg-ink-2 p-4 ring-1 ring-white/[0.05]">
              <div className="mb-3 text-sm font-semibold">支持语言</div>
              <table className="w-full text-[12px]">
                <thead><tr className="text-fg-3"><th className="pb-1.5 text-left font-normal" /><th className="font-normal">界面</th><th className="font-normal">音频</th><th className="font-normal">字幕</th></tr></thead>
                <tbody>
                  {[['简体中文', 1, g.tier !== 'low', 1], ['English', 1, 1, 1], ['日本語', 1, g.tier === 'high', 1], ['Deutsch', 1, 0, 1]].map(([l, ...c]) => (
                    <tr key={l as string} className="border-t hairline"><td className="py-1.5 text-fg-2">{l}</td>{c.map((v, k) => <td key={k} className="text-center">{v ? <Check size={13} className="mx-auto text-ingame" /> : ''}</td>)}</tr>
                  ))}
                </tbody>
              </table>
            </div>
            {fOwn.length > 0 && (
              <div className="rounded-2xl bg-ink-2 p-4 ring-1 ring-white/[0.05]">
                <div className="mb-3 flex items-center justify-between text-sm font-semibold">好友 <span className="text-xs font-normal text-fg-3">{fOwn.length} 位拥有</span></div>
                <div className="space-y-2">
                  {fOwn.slice(0, 6).map((f) => (
                    <Link to={`/profile/${f.id}`} key={f.id} className="flex items-center gap-2.5 rounded-lg p-1 hover:bg-white/[0.04]">
                      <Avatar seed={f.id} name={f.name} size={28} status={f.status} />
                      <span className="flex-1 truncate text-[13px]">{f.name}</span>
                      {f.gameId === g.id && <span className="text-[11px] text-ingame">正在玩</span>}
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {own && (
              <div className="rounded-2xl bg-ink-2 p-4 ring-1 ring-white/[0.05]">
                <div className="mb-2 flex items-center justify-between text-sm font-semibold">你的成就进度</div>
                <Progress value={(Object.keys(own.unlocked).length / achs.length) * 100} />
                <div className="mt-2 text-xs text-fg-3">{Object.keys(own.unlocked).length} / {achs.length} 已解锁</div>
              </div>
            )}
          </aside>
        </div>

        {similar.length > 0 && (
          <section className="mt-14">
            <SectionHeader title="更多类似游戏" />
            <div className="grid grid-cols-4 gap-4">{similar.map((s) => <StoreCapsule key={s.id} game={s} />)}</div>
          </section>
        )}
      </div>
    </div>
  )
}
