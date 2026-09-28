import { ChevronRight, Crown, Gem, Search, Sparkles, Target, Trophy } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { AchievementIcon } from '@/components/art/AchievementIcon'
import { MiniCover } from '@/components/game'
import { Page } from '@/components/Page'
import { EmptyState, Progress, Ring, SectionHeader, Segmented, Select, Skeleton } from '@/components/ui'
import { getAchievements, rarityTier } from '@/data/achievements'
import { gameMap } from '@/data/games'
import { useFakeLoad } from '@/lib/hooks'
import { useStore } from '@/store'
import { cn, timeAgo } from '@/lib/utils'

type Sort = 'progress' | 'name' | 'recent' | 'remaining'
type Filter = 'all' | 'progress' | 'perfect' | 'none'

export default function Achievements() {
  const owned = useStore((s) => s.owned)
  const loading = useFakeLoad('ach', 450)
  const [q, setQ] = useState('')
  const [sort, setSort] = useState<Sort>('recent')
  const [filter, setFilter] = useState<Filter>('all')

  const data = useMemo(() => Object.entries(owned).map(([id, o]) => {
    const list = getAchievements(id)
    const unlocked = list.filter((a) => o.unlocked[a.id])
    const last = Math.max(0, ...unlocked.map((a) => o.unlocked[a.id]))
    return { g: gameMap[id], list, unlocked, pct: list.length ? (unlocked.length / list.length) * 100 : 0, last }
  }), [owned])

  const allUnlocked = data.flatMap((d) => d.unlocked.map((a) => ({ a, at: owned[d.g.id].unlocked[a.id] })))
  const total = data.reduce((s, d) => s + d.list.length, 0)
  const perfect = data.filter((d) => d.pct === 100).length
  const started = data.filter((d) => d.unlocked.length > 0)
  const avg = started.length ? started.reduce((s, d) => s + d.pct, 0) / started.length : 0
  const legendary = allUnlocked.filter((x) => x.a.rarity < 5).length
  const recent = [...allUnlocked].sort((a, b) => b.at - a.at).slice(0, 8)
  const rarest = [...allUnlocked].sort((a, b) => a.a.rarity - b.a.rarity).slice(0, 5)

  const list = data
    .filter((d) => d.g.title.toLowerCase().includes(q.toLowerCase()))
    .filter((d) => filter === 'all' || (filter === 'perfect' ? d.pct === 100 : filter === 'none' ? d.unlocked.length === 0 : d.pct > 0 && d.pct < 100))
    .sort((a, b) => sort === 'progress' ? b.pct - a.pct : sort === 'name' ? a.g.title.localeCompare(b.g.title) : sort === 'remaining' ? (a.list.length - a.unlocked.length) - (b.list.length - b.unlocked.length) : b.last - a.last)

  if (loading)
    return (
      <Page inner="mx-auto max-w-[1240px] space-y-8 px-8 py-7">
        <Skeleton className="h-44 rounded-2xl" />
        <div className="grid grid-cols-4 gap-3">{Array.from({ length: 8 }, (_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
        <div className="space-y-2">{Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
      </Page>
    )

  return (
    <Page inner="mx-auto max-w-[1240px] space-y-10 px-8 py-7">
      <div className="relative overflow-hidden rounded-3xl bg-ink-2 p-8 ring-1 ring-white/[0.05]">
        <div className="pointer-events-none absolute -top-24 -right-24 h-80 w-80 rounded-full bg-gold/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 left-20 h-72 w-72 rounded-full bg-nova/10 blur-3xl" />
        <div className="relative flex items-center gap-10">
          <Ring value={(allUnlocked.length / total) * 100} size={140} stroke={10}>
            <div className="text-center">
              <div className="font-display text-3xl font-bold tabular-nums">{Math.round((allUnlocked.length / total) * 100)}%</div>
              <div className="text-[11px] text-fg-3">总完成度</div>
            </div>
          </Ring>
          <div className="flex-1">
            <h1 className="flex items-center gap-3 font-display text-3xl font-bold"><Trophy className="text-gold" size={28} />成就</h1>
            <p className="mt-1 text-[13.5px] text-fg-3">在 {data.length} 款游戏中追踪你的每一个里程碑</p>
            <div className="mt-6 grid grid-cols-4 gap-3">
              {[
                { icon: Trophy, label: '已解锁成就', value: `${allUnlocked.length.toLocaleString()}`, sub: `/ ${total.toLocaleString()}`, tone: 'text-gold' },
                { icon: Crown, label: '完美游戏', value: perfect, sub: '款 100%', tone: 'text-nova' },
                { icon: Target, label: '平均完成率', value: `${avg.toFixed(1)}%`, sub: '已开始的游戏', tone: 'text-online' },
                { icon: Gem, label: '传说级成就', value: legendary, sub: '< 5% 玩家拥有', tone: 'text-[#c084fc]' },
              ].map((s) => (
                <div key={s.label} className="rounded-2xl bg-white/[0.03] p-4">
                  <div className="flex items-center gap-1.5 text-[11.5px] text-fg-3"><s.icon size={13} className={s.tone} />{s.label}</div>
                  <div className="mt-1.5 flex items-baseline gap-1.5"><span className="font-display text-2xl font-bold tabular-nums">{s.value}</span><span className="text-[11px] text-fg-4">{s.sub}</span></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_380px] gap-6">
        <section>
          <SectionHeader title="最近解锁" />
          <div className="grid grid-cols-2 gap-2">
            {recent.map(({ a, at }) => (
              <Link key={a.id} to={`/achievements/${a.gameId}`} className="flex items-center gap-3 rounded-xl bg-ink-2 p-3 ring-1 ring-white/[0.04] transition hover:ring-white/10">
                <AchievementIcon a={a} unlocked size={44} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-medium">{a.name}</div>
                  <div className="truncate text-[11px] text-fg-3">{gameMap[a.gameId].title}</div>
                  <div className="text-[10.5px] text-fg-4">{timeAgo(at)}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>
        <section>
          <SectionHeader title={<span className="flex items-center gap-2"><Sparkles size={16} className="text-gold" />最稀有的成就</span>} />
          <div className="space-y-2 rounded-2xl bg-gradient-to-b from-gold/[0.07] to-transparent p-3 ring-1 ring-gold/15">
            {rarest.map(({ a }, k) => {
              const t = rarityTier(a.rarity)
              return (
                <Link key={a.id} to={`/achievements/${a.gameId}`} className="flex items-center gap-3 rounded-xl p-2 transition hover:bg-white/[0.04]">
                  <span className="w-4 text-center font-display text-sm font-bold text-fg-4">{k + 1}</span>
                  <AchievementIcon a={a} unlocked size={40} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13px] font-medium">{a.name}</div>
                    <div className="truncate text-[11px] text-fg-3">{gameMap[a.gameId].title}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[13px] font-bold tabular-nums" style={{ color: t.color }}>{a.rarity}%</div>
                    <div className="text-[10px] text-fg-4">{t.label}</div>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="section-title">游戏进度</h2>
          <div className="flex items-center gap-2">
            <div className="relative w-56">
              <Search size={13} className="absolute top-1/2 left-2.5 -translate-y-1/2 text-fg-3" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="搜索游戏" className="input h-8 pl-8 text-[12.5px]" />
            </div>
            <Segmented id="ach-filter" size="sm" value={filter} onChange={setFilter} options={[{ value: 'all', label: '全部' }, { value: 'progress', label: '进行中' }, { value: 'perfect', label: '已完美' }, { value: 'none', label: '未开始' }]} />
            <Select label="排序" value={sort} onChange={setSort} options={[{ value: 'recent', label: '最近解锁' }, { value: 'progress', label: '完成度' }, { value: 'remaining', label: '剩余最少' }, { value: 'name', label: '名称' }]} />
          </div>
        </div>
        {list.length === 0 ? <EmptyState icon={Trophy} title="没有符合条件的游戏" /> : (
          <div className="space-y-2">
            {list.map((d) => (
              <Link key={d.g.id} to={`/achievements/${d.g.id}`} className="group flex items-center gap-5 rounded-2xl bg-ink-2 p-3 pr-5 ring-1 ring-white/[0.04] transition hover:ring-white/10">
                <MiniCover game={d.g} className="aspect-[16/9] w-36 shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-[14.5px] font-semibold">{d.g.title}</span>
                    {d.pct === 100 && <span className="flex items-center gap-1 rounded-md bg-gold/15 px-1.5 py-0.5 text-[10px] font-bold text-gold"><Crown size={10} />完美</span>}
                  </div>
                  <div className="mt-2.5 flex items-center gap-3">
                    <Progress value={d.pct} tone={d.pct === 100 ? 'gold' : 'nova'} className="h-2 max-w-[340px] flex-1" />
                    <span className="text-[12px] text-fg-3 tabular-nums">{d.unlocked.length} / {d.list.length}</span>
                    <span className={cn('text-[12px] font-semibold tabular-nums', d.pct === 100 ? 'text-gold' : 'text-fg-2')}>{Math.round(d.pct)}%</span>
                  </div>
                </div>
                <div className="flex -space-x-1.5">
                  {[...d.unlocked].sort((a, b) => a.rarity - b.rarity).slice(0, 5).map((a) => <AchievementIcon key={a.id} a={a} unlocked size={32} className="ring-2 ring-ink-2" />)}
                </div>
                <div className="w-24 text-right text-[11px] text-fg-4">{d.last ? timeAgo(d.last) : '尚未解锁'}</div>
                <ChevronRight size={16} className="text-fg-4 transition group-hover:translate-x-0.5 group-hover:text-fg-2" />
              </Link>
            ))}
          </div>
        )}
      </section>
    </Page>
  )
}
