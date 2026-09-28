import { motion } from 'motion/react'
import { Check, ChevronRight, Lock, Search, Trophy } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router'
import { AchievementIcon } from '@/components/art/AchievementIcon'
import { Avatar } from '@/components/art/Avatar'
import { GameArt } from '@/components/art/GameArt'
import { Page } from '@/components/Page'
import { Button, EmptyState, Ring, Segmented, Select, Skeleton, Toggle } from '@/components/ui'
import { getAchievements, rarityTier } from '@/data/achievements'
import { gameMap } from '@/data/games'
import { friendUnlocked, friendsWhoOwn } from '@/data/social'
import { useFakeLoad } from '@/lib/hooks'
import { useStore } from '@/store'
import { cn, formatDate, formatHours } from '@/lib/utils'

type Filter = 'all' | 'unlocked' | 'locked'
type Sort = 'default' | 'rarity' | 'common' | 'recent' | 'name'

export default function GameAchievements() {
  const { id = '' } = useParams()
  const g = gameMap[id]
  const own = useStore((s) => s.owned[id])
  const friends = useStore((s) => s.friends)
  const loading = useFakeLoad(id, 450)
  const [filter, setFilter] = useState<Filter>('all')
  const [sort, setSort] = useState<Sort>('default')
  const [q, setQ] = useState('')
  const [reveal, setReveal] = useState(false)
  const [cmp, setCmp] = useState('none')
  const all = useMemo(() => (g ? getAchievements(g.id) : []), [g])
  const cmpFriends = useMemo(() => (g ? friendsWhoOwn(friends, g.id) : []), [friends, g])
  const cmpSet = useMemo(() => (cmp !== 'none' ? friendUnlocked(cmp, id) : null), [cmp, id])

  if (!g || !own) return <EmptyState icon={Trophy} title="你尚未拥有这款游戏" action={<Link to="/achievements"><Button variant="primary">返回成就</Button></Link>} />

  const unlocked = all.filter((a) => own.unlocked[a.id])
  const pct = (unlocked.length / all.length) * 100
  const list = all
    .filter((a) => filter === 'all' || (filter === 'unlocked' ? own.unlocked[a.id] : !own.unlocked[a.id]))
    .filter((a) => !q || ((!a.hidden || reveal || own.unlocked[a.id]) && (a.name + a.desc).includes(q)))
    .sort((a, b) => {
      if (sort === 'rarity') return a.rarity - b.rarity
      if (sort === 'common') return b.rarity - a.rarity
      if (sort === 'name') return a.name.localeCompare(b.name)
      if (sort === 'recent') return (own.unlocked[b.id] ?? 0) - (own.unlocked[a.id] ?? 0)
      return Number(!!own.unlocked[b.id]) - Number(!!own.unlocked[a.id]) || b.rarity - a.rarity
    })
  const cf = friends.find((f) => f.id === cmp)

  return (
    <Page>
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-50"><GameArt game={g} variant={3} grain={false} className="h-full w-full scale-110 blur-2xl" /></div>
        <div className="absolute inset-0 bg-gradient-to-b from-ink-1/40 to-ink-1" />
        <div className="relative mx-auto max-w-[1100px] px-8 pt-6 pb-8">
          <div className="flex items-center gap-1.5 text-xs text-fg-3">
            <Link to="/achievements" className="hover:text-fg">成就</Link><ChevronRight size={12} /><span className="text-fg-2">{g.title}</span>
          </div>
          <div className="mt-5 flex items-center gap-6">
            <Link to={`/library/${g.id}`}><GameArt game={g} title="portrait" className="aspect-[2/3] w-28 rounded-xl ring-1 ring-white/10" /></Link>
            <div className="flex-1">
              <h1 className="font-display text-3xl font-bold">{g.title}</h1>
              <div className="mt-1 text-[13px] text-fg-3">游戏时间 {formatHours(own.playtime)}</div>
              <div className="mt-4 flex gap-6 text-[12.5px]">
                <div><div className="text-fg-3">已解锁</div><div className="font-display text-xl font-bold tabular-nums">{unlocked.length}<span className="text-sm text-fg-4"> / {all.length}</span></div></div>
                <div><div className="text-fg-3">最稀有</div><div className="font-display text-xl font-bold tabular-nums">{unlocked.length ? `${Math.min(...unlocked.map((a) => a.rarity))}%` : '—'}</div></div>
                <div><div className="text-fg-3">传说级</div><div className="font-display text-xl font-bold tabular-nums text-gold">{unlocked.filter((a) => a.rarity < 5).length}</div></div>
              </div>
            </div>
            <Ring value={pct} size={110} stroke={9} color={pct === 100 ? '#ffcf5a' : undefined}>
              <div className="text-center"><div className="font-display text-2xl font-bold tabular-nums">{Math.round(pct)}%</div><div className="text-[10px] text-fg-3">完成度</div></div>
            </Ring>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1100px] px-8 pb-10">
        <div className="sticky top-0 z-10 -mx-2 mb-4 flex items-center gap-2 bg-ink-1/90 px-2 py-3 backdrop-blur-xl">
          <Segmented id="gach" value={filter} onChange={setFilter} options={[{ value: 'all', label: '全部', count: all.length }, { value: 'unlocked', label: '已解锁', count: unlocked.length }, { value: 'locked', label: '未解锁', count: all.length - unlocked.length }]} />
          <div className="relative w-52">
            <Search size={13} className="absolute top-1/2 left-2.5 -translate-y-1/2 text-fg-3" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="搜索成就" className="input h-8 pl-8 text-[12.5px]" />
          </div>
          <div className="w-40"><Toggle checked={reveal} onChange={setReveal} label="显示隐藏成就" /></div>
          <div className="flex-1" />
          <Select label="与好友比较" width={200} value={cmp} onChange={setCmp} options={[{ value: 'none', label: '不比较' }, ...cmpFriends.map((f) => ({ value: f.id, label: f.name }))]} />
          <Select label="排序" value={sort} onChange={setSort} options={[{ value: 'default', label: '默认' }, { value: 'rarity', label: '最稀有' }, { value: 'common', label: '最常见' }, { value: 'recent', label: '解锁时间' }, { value: 'name', label: '名称' }]} />
        </div>

        {cf && cmpSet && (
          <div className="mb-4 flex items-center gap-4 rounded-2xl bg-ink-2 p-4 ring-1 ring-white/[0.05]">
            <Avatar seed={cf.id} name={cf.name} size={36} />
            <div className="flex-1 text-[13px]"><span className="font-semibold">{cf.name}</span> <span className="text-fg-3">已解锁 {cmpSet.size} / {all.length} 项成就</span></div>
            <div className="text-[12px] text-fg-3">你领先 <span className={cn('font-semibold', unlocked.length >= cmpSet.size ? 'text-ingame' : 'text-danger')}>{unlocked.length - cmpSet.size}</span> 项</div>
          </div>
        )}

        {loading ? (
          <div className="space-y-2">{Array.from({ length: 8 }, (_, i) => <Skeleton key={i} className="h-[76px] rounded-xl" />)}</div>
        ) : list.length === 0 ? (
          <EmptyState icon={filter === 'unlocked' ? Trophy : Lock} title={filter === 'unlocked' ? '还没有解锁任何成就' : filter === 'locked' ? '全部成就均已解锁！' : '没有匹配的成就'} body={filter === 'unlocked' ? '开始游戏，去创造属于你的第一个里程碑吧。' : undefined} />
        ) : (
          <div className="space-y-2">
            {list.map((a, k) => {
              const isU = !!own.unlocked[a.id]
              const secret = a.hidden && !isU && !reveal
              const t = rarityTier(a.rarity)
              return (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(k, 12) * 0.02 }}
                  className={cn('flex items-center gap-4 rounded-xl p-3 pr-5 ring-1 transition', isU ? 'bg-ink-2 ring-white/[0.05]' : 'bg-ink-2/40 ring-white/[0.03]')}
                >
                  <AchievementIcon a={a} unlocked={isU} size={52} hideSecret={secret} />
                  <div className="min-w-0 flex-1">
                    <div className={cn('text-[14px] font-semibold', !isU && 'text-fg-2')}>{secret ? '隐藏成就' : a.name}</div>
                    <div className="mt-0.5 text-[12.5px] text-fg-3">{secret ? '继续游戏以揭晓此成就的详情' : a.desc}</div>
                  </div>
                  <div className="w-48">
                    <div className="mb-1 flex justify-between text-[11px]"><span style={{ color: t.color }}>{t.label}</span><span className="text-fg-3 tabular-nums">{a.rarity}% 玩家</span></div>
                    <div className="h-1 overflow-hidden rounded-full bg-white/[0.06]"><div className="h-full rounded-full" style={{ width: `${a.rarity}%`, background: t.color }} /></div>
                  </div>
                  <div className="w-32 text-right text-[11.5px]">
                    {isU ? <span className="flex items-center justify-end gap-1 text-ingame"><Check size={13} />{formatDate(own.unlocked[a.id])}</span> : <span className="text-fg-4">未解锁</span>}
                  </div>
                  {cmpSet && (
                    <div className="flex w-14 justify-center border-l hairline pl-4">
                      {cmpSet.has(a.id) ? <Check size={16} className="text-online" /> : <span className="text-fg-4">—</span>}
                    </div>
                  )}
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </Page>
  )
}
