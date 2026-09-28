import { Clock, Download, Library, Play, Star } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { GameArt, GameLogo } from '@/components/art/GameArt'
import { LibraryCapsule } from '@/components/game'
import { Page } from '@/components/Page'
import { Button, EmptyState, Progress, SectionHeader, Segmented, Select, Skeleton } from '@/components/ui'
import { gameMap } from '@/data/games'
import { useFakeLoad } from '@/lib/hooks'
import { useStore } from '@/store'
import { cn, formatHours, formatSize, timeAgo } from '@/lib/utils'

type Sort = 'name' | 'playtime' | 'recent' | 'added' | 'size'
type Zoom = 's' | 'm' | 'l'
const COLS: Record<Zoom, string> = { s: 'grid-cols-[repeat(auto-fill,minmax(128px,1fr))]', m: 'grid-cols-[repeat(auto-fill,minmax(164px,1fr))]', l: 'grid-cols-[repeat(auto-fill,minmax(210px,1fr))]' }

function RecentShelf() {
  const owned = useStore((s) => s.owned)
  const launch = useStore((s) => s.launch)
  const running = useStore((s) => s.running)
  const recent = Object.entries(owned).filter(([, o]) => o.lastPlayed).sort((a, b) => b[1].lastPlayed! - a[1].lastPlayed!).slice(0, 5)
  if (!recent.length) return null
  const [first, ...rest] = recent
  const fg = gameMap[first[0]]
  return (
    <section>
      <SectionHeader title={<span className="flex items-center gap-2"><Clock size={16} className="text-fg-3" />最近游玩</span>} />
      <div className="grid grid-cols-[1.9fr_repeat(4,1fr)] gap-4">
        <div className="flex flex-col">
          <div className="mb-2 text-[11px] font-medium text-fg-3">{timeAgo(first[1].lastPlayed!)}</div>
          <Link to={`/library/${fg.id}`} className="group relative flex-1 overflow-hidden rounded-2xl ring-1 ring-white/[0.06] transition hover:ring-white/15">
            <GameArt game={fg} className="absolute inset-0 transition duration-700 group-hover:scale-[1.03]" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5">
              <div className="min-w-0">
                <GameLogo game={fg} className="text-[30px]" />
                <div className="mt-2 text-xs text-white/70">已游玩 {formatHours(first[1].playtime)}</div>
              </div>
              {first[1].installed && !running && (
                <button onClick={(e) => { e.preventDefault(); launch(fg.id) }} className="flex h-11 shrink-0 items-center gap-2 rounded-xl bg-ingame px-4 text-sm font-bold whitespace-nowrap text-[#07210c] shadow-lg transition hover:scale-105">
                  <Play size={16} fill="currentColor" />开始游戏
                </button>
              )}
            </div>
          </Link>
        </div>
        {rest.map(([id, o]) => {
          const g = gameMap[id]
          return (
            <div key={id}>
              <div className="mb-2 text-[11px] font-medium text-fg-3">{timeAgo(o.lastPlayed!)}</div>
              <LibraryCapsule game={g} />
            </div>
          )
        })}
      </div>
    </section>
  )
}

function DownloadStrip() {
  const downloads = useStore((s) => s.downloads)
  if (!downloads.length) return null
  return (
    <Link to="/downloads" className="flex items-center gap-4 rounded-2xl bg-ink-2 p-3 pr-5 ring-1 ring-white/[0.05] transition hover:ring-white/10">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-nova/15 text-nova"><Download size={18} /></span>
      <div className="flex flex-1 items-center gap-6 overflow-hidden">
        {downloads.slice(0, 3).map((d) => (
          <div key={d.gameId} className="w-56 min-w-0">
            <div className="flex justify-between text-[12px]"><span className="truncate text-fg-2">{gameMap[d.gameId].title}</span><span className="text-fg-3 tabular-nums">{Math.floor((d.done / d.total) * 100)}%</span></div>
            <Progress value={(d.done / d.total) * 100} tone={d.status === 'downloading' ? 'nova' : 'muted'} className="mt-1.5 h-1" />
          </div>
        ))}
      </div>
      <span className="text-[12px] text-fg-3">管理下载 →</span>
    </Link>
  )
}

export default function LibraryHome() {
  const owned = useStore((s) => s.owned)
  const loading = useFakeLoad('libhome', 450)
  const [coll, setColl] = useState('all')
  const [sort, setSort] = useState<Sort>('recent')
  const [zoom, setZoom] = useState<Zoom>('m')

  const ownedGames = useMemo(() => Object.keys(owned).map((id) => gameMap[id]), [owned])
  const collections = useMemo(() => {
    const genres = new Map<string, number>()
    ownedGames.forEach((g) => g.genres.forEach((x) => genres.set(x, (genres.get(x) ?? 0) + 1)))
    return [
      { id: 'all', label: '全部游戏', count: ownedGames.length },
      { id: 'installed', label: '已安装', count: ownedGames.filter((g) => owned[g.id].installed).length },
      { id: 'favorite', label: '收藏', count: ownedGames.filter((g) => owned[g.id].favorite).length },
      ...[...genres.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([k, v]) => ({ id: `g:${k}`, label: k, count: v })),
    ]
  }, [ownedGames, owned])

  const list = useMemo(() => {
    const l = ownedGames.filter((g) => coll === 'all' || (coll === 'installed' ? owned[g.id].installed : coll === 'favorite' ? owned[g.id].favorite : g.genres.includes(coll.slice(2))))
    const o = (id: string) => owned[id]
    return [...l].sort((a, b) => {
      switch (sort) {
        case 'name': return a.title.localeCompare(b.title)
        case 'playtime': return o(b.id).playtime - o(a.id).playtime
        case 'added': return o(b.id).addedAt - o(a.id).addedAt
        case 'size': return b.sizeMB - a.sizeMB
        default: return (o(b.id).lastPlayed ?? o(b.id).addedAt) - (o(a.id).lastPlayed ?? o(a.id).addedAt)
      }
    })
  }, [ownedGames, owned, coll, sort])

  const totalHours = ownedGames.reduce((s, g) => s + owned[g.id].playtime, 0)
  const installedSize = ownedGames.filter((g) => owned[g.id].installed).reduce((s, g) => s + g.sizeMB, 0)

  return (
    <Page inner="space-y-10 px-8 py-7">
      {loading ? (
        <>
          <div className="grid grid-cols-[1.9fr_repeat(4,1fr)] gap-4"><Skeleton className="aspect-[16/10] rounded-2xl" />{Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="aspect-[2/3] rounded-xl" />)}</div>
          <div className="grid grid-cols-6 gap-4">{Array.from({ length: 12 }, (_, i) => <Skeleton key={i} className="aspect-[2/3] rounded-xl" />)}</div>
        </>
      ) : ownedGames.length === 0 ? (
        <EmptyState icon={Library} title="你的游戏库是空的" body="从商店购买或领取免费游戏后，它们会出现在这里。" action={<Link to="/store"><Button variant="primary">前往商店</Button></Link>} />
      ) : (
        <>
          <RecentShelf />
          <DownloadStrip />
          <section>
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="section-title">我的收藏夹</h2>
                <p className="mt-0.5 text-[13px] text-fg-3">{ownedGames.length} 款游戏 · 累计 {formatHours(totalHours)} · 已安装占用 {formatSize(installedSize)}</p>
              </div>
              <div className="flex items-center gap-2">
                <Select label="排序" value={sort} onChange={setSort} options={[{ value: 'recent', label: '最近活动' }, { value: 'name', label: '名称' }, { value: 'playtime', label: '游戏时间' }, { value: 'added', label: '添加日期' }, { value: 'size', label: '占用空间' }]} />
                <Segmented id="zoom" size="sm" value={zoom} onChange={setZoom} options={[{ value: 's', label: '小' }, { value: 'm', label: '中' }, { value: 'l', label: '大' }]} />
              </div>
            </div>
            <div className="no-scrollbar mb-5 flex gap-2 overflow-x-auto">
              {collections.map((c) => (
                <button key={c.id} onClick={() => setColl(c.id)} className={cn('flex shrink-0 items-center gap-2 rounded-full px-3.5 py-1.5 text-[12.5px] font-medium transition', coll === c.id ? 'bg-fg text-ink-1' : 'bg-white/[0.05] text-fg-2 hover:bg-white/[0.09] hover:text-fg')}>
                  {c.id === 'favorite' && <Star size={12} className={coll === c.id ? '' : 'text-gold'} />}
                  {c.label}<span className={cn('tabular-nums', coll === c.id ? 'text-ink-1/60' : 'text-fg-4')}>{c.count}</span>
                </button>
              ))}
            </div>
            {list.length === 0 ? (
              <EmptyState icon={Star} title="这个收藏夹里还没有游戏" body={coll === 'favorite' ? '在游戏页面点击星标，即可将游戏加入收藏。' : '换一个收藏夹看看吧。'} />
            ) : (
              <div className={cn('grid gap-x-4 gap-y-6', COLS[zoom])}>
                {list.map((g) => <LibraryCapsule key={g.id} game={g} />)}
              </div>
            )}
          </section>
        </>
      )}
    </Page>
  )
}
