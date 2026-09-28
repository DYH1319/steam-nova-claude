import { AnimatePresence, motion } from 'motion/react'
import {
  Activity, Gamepad2, MessageSquare, MoreHorizontal, Search, ShoppingBag, Star, Trophy, User, UserMinus, UserPlus, Users, PenLine, Clock,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { Avatar, statusTone } from '@/components/art/Avatar'
import { GameArt } from '@/components/art/GameArt'
import { MiniCover } from '@/components/game'
import { FriendRow } from '@/components/shell/FriendsPanel'
import { friendSubline } from '@/components/shell/friends-utils'
import { Button, EmptyState, IconButton, MenuItem, Popover, SectionHeader, Segmented, Tabs } from '@/components/ui'
import { gameMap } from '@/data/games'
import { buildActivity, friendOwned, friendPlaytime, type ActivityItem, type Friend } from '@/data/social'
import { useStore } from '@/store'
import { cn, formatDate, formatHours, timeAgo } from '@/lib/utils'

const ACT_ICON = { achievement: Trophy, purchase: ShoppingBag, played: Gamepad2, review: PenLine, friend: UserPlus }

function ActivityRow({ a, f }: { a: ActivityItem; f: Friend }) {
  const g = gameMap[a.gameId]
  const Icon = ACT_ICON[a.kind]
  const text = {
    achievement: <>在 <Link to={`/game/${g.id}`} className="text-fg hover:text-nova">{g.title}</Link> 中解锁了成就 <span className="text-gold">「{a.detail}」</span></>,
    purchase: <>购买了 <Link to={`/game/${g.id}`} className="text-fg hover:text-nova">{g.title}</Link></>,
    played: <>游玩了 <Link to={`/game/${g.id}`} className="text-fg hover:text-nova">{g.title}</Link> {a.detail}</>,
    review: <>推荐了 <Link to={`/game/${g.id}`} className="text-fg hover:text-nova">{g.title}</Link></>,
    friend: <>添加了新好友</>,
  }[a.kind]
  return (
    <motion.div layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="group flex items-center gap-4 rounded-xl p-3 transition hover:bg-white/[0.03]">
      <Link to={`/profile/${f.id}`} className="relative">
        <Avatar seed={f.id} name={f.name} size={40} />
        <span className={cn('absolute -right-1 -bottom-1 flex h-5 w-5 items-center justify-center rounded-full ring-2 ring-ink-1', a.kind === 'achievement' ? 'bg-gold text-[#2a1d00]' : a.kind === 'purchase' ? 'bg-nova text-white' : a.kind === 'review' ? 'bg-online text-[#00202e]' : 'bg-ingame text-[#07210c]')}>
          <Icon size={11} strokeWidth={2.5} />
        </span>
      </Link>
      <div className="min-w-0 flex-1">
        <div className="text-[13.5px] leading-relaxed text-fg-2"><Link to={`/profile/${f.id}`} className="font-semibold text-fg hover:text-nova">{f.name}</Link> {text}</div>
        <div className="mt-0.5 text-[11.5px] text-fg-4">{timeAgo(a.at)}</div>
      </div>
      <Link to={`/game/${g.id}`}><MiniCover game={g} className="aspect-[16/9] w-24 opacity-80 transition group-hover:opacity-100" /></Link>
    </motion.div>
  )
}

function Feed() {
  const friends = useStore((s) => s.friends)
  const [filter, setFilter] = useState<'all' | 'achievement' | 'purchase' | 'played'>('all')
  const items = useMemo(() => buildActivity(friends), [friends])
  const list = items.filter((a) => filter === 'all' || a.kind === filter)
  const fmap = Object.fromEntries(friends.map((f) => [f.id, f]))
  const playing = friends.filter((f) => f.status === 'ingame')
  return (
    <div className="mx-auto max-w-[880px] space-y-8 px-8 py-7">
      {playing.length > 0 && (
        <section>
          <SectionHeader title={<span className="flex items-center gap-2"><span className="h-2 w-2 animate-pulse rounded-full bg-ingame" />正在游戏中</span>} />
          <div className="grid grid-cols-3 gap-3">
            {playing.slice(0, 6).map((f) => {
              const g = gameMap[f.gameId!]
              return (
                <Link key={f.id} to={`?f=${f.id}`} className="group relative h-28 overflow-hidden rounded-xl ring-1 ring-white/[0.06] transition hover:ring-ingame/40">
                  <GameArt game={g} grain={false} className="absolute inset-0 transition duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-black/10" />
                  <div className="absolute inset-0 flex items-center gap-3 p-4">
                    <Avatar seed={f.id} name={f.name} size={44} status="ingame" ring />
                    <div className="min-w-0">
                      <div className="truncate text-[14px] font-semibold text-ingame">{f.name}</div>
                      <div className="truncate text-[12px] text-white/80">{g.title}</div>
                      {f.rich && <div className="truncate text-[11px] text-white/50">{f.rich}</div>}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      )}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="section-title flex items-center gap-2"><Activity size={17} className="text-nova" />好友动态</h2>
          <Segmented id="feed" size="sm" value={filter} onChange={setFilter} options={[{ value: 'all', label: '全部' }, { value: 'achievement', label: '成就' }, { value: 'purchase', label: '购买' }, { value: 'played', label: '游玩' }]} />
        </div>
        <div className="divide-y divide-white/[0.04] rounded-2xl bg-ink-2/60 p-2 ring-1 ring-white/[0.04]">
          {list.length === 0 ? <EmptyState icon={Activity} title="暂无动态" /> : list.slice(0, 24).map((a) => fmap[a.friendId] && <ActivityRow key={a.id} a={a} f={fmap[a.friendId]} />)}
        </div>
      </section>
    </div>
  )
}

function FriendDetail({ f }: { f: Friend }) {
  const owned = useStore((s) => s.owned)
  const running = useStore((s) => s.running)
  const { openChat, sendInvite, toggleFriendFavorite, ask, removeFriend } = useStore()
  const nav = useNavigate()
  const theirs = friendOwned(f.id)
  const shared = theirs.filter((id) => owned[id]).map((id) => gameMap[id])
  const banner = gameMap[f.gameId ?? theirs[0] ?? 'ashen-meridian']
  const acts = useMemo(() => buildActivity([f]).slice(0, 5), [f])
  return (
    <motion.div key={f.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-10">
      <div className="relative h-64 overflow-hidden">
        <GameArt game={banner} className="h-full w-full" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-1 via-ink-1/50 to-transparent" />
      </div>
      <div className="relative mx-auto -mt-24 max-w-[880px] px-8">
        <div className="flex items-end gap-5">
          <Avatar seed={f.id} name={f.name} size={112} status={f.status} ring />
          <div className="min-w-0 flex-1 pb-1">
            <div className="flex items-center gap-3">
              <h1 className="font-display text-3xl font-bold">{f.name}</h1>
              <span className="flex h-7 min-w-7 items-center justify-center rounded-full border-2 border-nova px-1.5 text-[12px] font-bold text-nova">{f.level}</span>
              {f.favorite && <Star size={16} className="fill-gold text-gold" />}
            </div>
            <div className={cn('mt-1 text-[13.5px]', statusTone[f.status])}>{f.status === 'ingame' ? `正在玩 ${gameMap[f.gameId!].title}` : friendSubline(f)}{f.rich && f.status === 'ingame' && <span className="text-fg-3"> · {f.rich}</span>}</div>
          </div>
          <div className="flex gap-2 pb-1">
            <Button variant="primary" icon={MessageSquare} onClick={() => openChat(f.id)}>发消息</Button>
            {running && f.status !== 'offline' && <Button variant="secondary" icon={Gamepad2} onClick={() => sendInvite(f.id, running.gameId)}>邀请</Button>}
            <Button variant="secondary" icon={User} onClick={() => nav(`/profile/${f.id}`)}>个人资料</Button>
            <Popover width={190} trigger={(_, t) => <IconButton icon={MoreHorizontal} label="更多" onClick={t} className="h-9 w-9 bg-white/[0.07]" />}>
              {(close) => (
                <div className="p-1.5">
                  <MenuItem icon={Star} onClick={() => { toggleFriendFavorite(f.id); close() }}>{f.favorite ? '取消收藏' : '添加到收藏'}</MenuItem>
                  <MenuItem icon={UserMinus} danger onClick={() => { close(); ask({ title: `移除好友 ${f.name}？`, body: '移除后你们将不再能看到彼此的在线状态和动态。', confirmLabel: '移除', danger: true, onConfirm: () => { removeFriend(f.id); nav('/friends') } }) }}>移除好友</MenuItem>
                </div>
              )}
            </Popover>
          </div>
        </div>
        {f.bio && <p className="mt-5 text-[14px] text-fg-2">{f.bio}</p>}
        <div className="mt-6 grid grid-cols-4 gap-3">
          {[
            ['共同游戏', `${shared.length} 款`],
            ['拥有游戏', `${theirs.length} 款`],
            ['好友时长', `${Math.floor((Date.now() - f.since) / 86400000)} 天`],
            ['地区', f.country],
          ].map(([k, v]) => (
            <div key={k} className="rounded-xl bg-ink-2 p-4 ring-1 ring-white/[0.05]">
              <div className="text-[11px] text-fg-3">{k}</div>
              <div className="mt-1 font-display text-lg font-semibold">{v}</div>
            </div>
          ))}
        </div>
        <section className="mt-8">
          <SectionHeader title="共同游戏" subtitle="对比你们的游戏时间" />
          {shared.length === 0 ? <div className="rounded-xl bg-ink-2 py-8 text-center text-sm text-fg-3">你们还没有共同的游戏</div> : (
            <div className="grid grid-cols-2 gap-2.5">
              {shared.map((g) => {
                const mine = owned[g.id].playtime
                const their = friendPlaytime(f.id, g.id)
                const max = Math.max(mine, their, 1)
                return (
                  <Link key={g.id} to={`/library/${g.id}`} className="flex items-center gap-3 rounded-xl bg-ink-2 p-2.5 ring-1 ring-white/[0.04] transition hover:ring-white/10">
                    <MiniCover game={g} className="aspect-[16/9] w-24 shrink-0" />
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <div className="truncate text-[13px] font-medium">{g.title}</div>
                      <div className="flex items-center gap-2 text-[10.5px] text-fg-3"><span className="w-6">你</span><div className="h-1 flex-1 rounded-full bg-white/5"><div className="nova-gradient h-full rounded-full" style={{ width: `${(mine / max) * 100}%` }} /></div><span className="w-14 text-right tabular-nums">{formatHours(mine)}</span></div>
                      <div className="flex items-center gap-2 text-[10.5px] text-fg-3"><span className="w-6">TA</span><div className="h-1 flex-1 rounded-full bg-white/5"><div className="h-full rounded-full bg-online" style={{ width: `${(their / max) * 100}%` }} /></div><span className="w-14 text-right tabular-nums">{formatHours(their)}</span></div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </section>
        <section className="mt-8">
          <SectionHeader title="最近动态" />
          <div className="rounded-2xl bg-ink-2/60 p-2 ring-1 ring-white/[0.04]">
            {acts.length ? acts.map((a) => <ActivityRow key={a.id} a={a} f={f} />) : <div className="py-8 text-center text-sm text-fg-3">暂无动态</div>}
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-fg-4"><Clock size={12} />成为好友于 {formatDate(f.since)}</div>
        </section>
      </div>
    </motion.div>
  )
}

export default function Friends() {
  const friends = useStore((s) => s.friends)
  const requests = useStore((s) => s.requests)
  const outgoing = useStore((s) => s.outgoing)
  const { set, acceptRequest, declineRequest } = useStore()
  const [sp, setSp] = useSearchParams()
  const tab = (sp.get('tab') as 'all' | 'online' | 'requests') ?? 'all'
  const sel = sp.get('f')
  const [q, setQ] = useState('')
  const f = friends.find((x) => x.id === sel)
  const list = friends
    .filter((x) => x.name.toLowerCase().includes(q.toLowerCase()))
    .filter((x) => tab !== 'online' || x.status !== 'offline')
    .sort((a, b) => ['ingame', 'online', 'away', 'offline'].indexOf(a.status) - ['ingame', 'online', 'away', 'offline'].indexOf(b.status))
  const online = friends.filter((x) => x.status !== 'offline').length

  return (
    <div className="grid h-full grid-cols-[320px_1fr]">
      <aside className="flex min-h-0 flex-col border-r hairline bg-ink-2/40">
        <div className="p-4 pb-0">
          <div className="mb-4 flex items-center justify-between">
            <button onClick={() => setSp({})} className="text-left">
              <h1 className="font-display text-xl font-bold">好友</h1>
              <div className="text-xs text-fg-3">{online} 位在线 · 共 {friends.length} 位</div>
            </button>
            <Button size="sm" variant="secondary" icon={UserPlus} onClick={() => set({ addFriendOpen: true })}>添加</Button>
          </div>
          <Tabs
            id="friend-tabs"
            value={tab}
            onChange={(v) => setSp(v === 'all' ? {} : { tab: v })}
            options={[{ value: 'all', label: '全部' }, { value: 'online', label: '在线' }, { value: 'requests', label: '请求', badge: requests.length }]}
          />
        </div>
        {tab === 'requests' ? (
          <div className="scroll-area flex-1 p-3">
            {requests.length === 0 && outgoing.length === 0 ? <EmptyState icon={Users} title="没有待处理的请求" className="py-10" /> : (
              <>
                {requests.length > 0 && <div className="px-1 pb-2 text-[11px] font-semibold tracking-wider text-fg-3 uppercase">收到的请求</div>}
                <AnimatePresence initial={false}>
                  {requests.map((r) => (
                    <motion.div key={r.id} layout exit={{ opacity: 0, x: -20 }} className="mb-2 rounded-xl bg-ink-3 p-3">
                      <div className="flex items-center gap-3">
                        <Avatar seed={r.id} name={r.name} size={38} />
                        <div className="flex-1">
                          <div className="text-[13.5px] font-medium">{r.name}</div>
                          <div className="text-[11px] text-fg-3">等级 {r.level} · {r.mutual} 位共同好友</div>
                        </div>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <Button size="sm" variant="primary" onClick={() => acceptRequest(r.id)}>接受</Button>
                        <Button size="sm" variant="secondary" onClick={() => declineRequest(r.id)}>忽略</Button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {outgoing.length > 0 && <div className="px-1 pt-3 pb-2 text-[11px] font-semibold tracking-wider text-fg-3 uppercase">已发送</div>}
                {outgoing.map((id) => <div key={id} className="flex items-center gap-3 rounded-xl px-2 py-2 text-[13px] text-fg-2"><Avatar seed={id} name={id} size={30} />{id}<span className="ml-auto text-[11px] text-fg-4">等待回应…</span></div>)}
              </>
            )}
          </div>
        ) : (
          <>
            <div className="p-3 pb-1">
              <div className="relative">
                <Search size={13} className="absolute top-1/2 left-2.5 -translate-y-1/2 text-fg-3" />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="搜索好友" className="input h-8 pl-8 text-[12.5px]" />
              </div>
            </div>
            <div className="scroll-area flex-1 px-2 pb-3">
              {list.length === 0 ? <div className="px-4 py-10 text-center text-xs text-fg-3">没有匹配的好友</div> : list.map((x) => (
                <FriendRow key={x.id} f={x} active={x.id === sel} onClick={() => setSp({ ...(tab !== 'all' ? { tab } : {}), f: x.id })} />
              ))}
            </div>
          </>
        )}
      </aside>
      <div className="scroll-area min-w-0">
        {f ? <FriendDetail f={f} /> : <Feed />}
      </div>
    </div>
  )
}
