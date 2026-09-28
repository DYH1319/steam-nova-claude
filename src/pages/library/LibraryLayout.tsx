import { ArrowDownToLine, ChevronDown, House, Plus, Search, Star } from 'lucide-react'
import { useMemo, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router'
import { MiniCover } from '@/components/game'
import { Select } from '@/components/ui'
import { gameMap, type Game } from '@/data/games'
import { useStore } from '@/store'
import { cn } from '@/lib/utils'

type Filter = 'all' | 'installed' | 'favorite' | 'notinstalled'

function Row({ g }: { g: Game }) {
  const own = useStore((s) => s.owned[g.id])
  const dl = useStore((s) => s.downloads.find((d) => d.gameId === g.id))
  const running = useStore((s) => s.running?.gameId === g.id)
  return (
    <NavLink
      to={`/library/${g.id}`}
      className={({ isActive }) => cn('group flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition', isActive ? 'bg-white/[0.09] text-fg' : 'hover:bg-white/[0.04]')}
    >
      <MiniCover game={g} className="h-7 w-7 shrink-0 !rounded" dim={!own.installed && !dl} />
      <span className={cn('min-w-0 flex-1 truncate text-[13px]', running ? 'text-ingame' : own.installed ? 'text-fg-2 group-hover:text-fg' : 'text-fg-3')}>{g.title}</span>
      {running && <span className="h-2 w-2 animate-pulse rounded-full bg-ingame" />}
      {dl && (
        <span className={cn('flex items-center gap-1 text-[10.5px] tabular-nums', dl.status === 'downloading' ? 'text-nova' : 'text-fg-4')}>
          <ArrowDownToLine size={11} />{Math.floor((dl.done / dl.total) * 100)}%
        </span>
      )}
    </NavLink>
  )
}

export function LibraryLayout() {
  const owned = useStore((s) => s.owned)
  const nav = useNavigate()
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [favOpen, setFavOpen] = useState(true)
  const [allOpen, setAllOpen] = useState(true)

  const list = useMemo(() => {
    return Object.keys(owned)
      .map((id) => gameMap[id])
      .filter((g) => g.title.toLowerCase().includes(q.toLowerCase()))
      .filter((g) => filter === 'all' || (filter === 'installed' ? owned[g.id].installed : filter === 'favorite' ? owned[g.id].favorite : !owned[g.id].installed))
      .sort((a, b) => a.title.localeCompare(b.title))
  }, [owned, q, filter])
  const favs = list.filter((g) => owned[g.id].favorite)

  return (
    <div className="grid h-full grid-cols-[272px_1fr] grid-rows-[minmax(0,1fr)]">
      <aside className="flex min-h-0 flex-col border-r hairline bg-ink-2/40">
        <div className="space-y-2.5 p-3">
          <NavLink end to="/library" className={({ isActive }) => cn('flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13.5px] font-semibold transition', isActive ? 'bg-white/[0.08] text-fg' : 'text-fg-2 hover:bg-white/[0.04]')}>
            <House size={16} /> 游戏库主页
          </NavLink>
          <div className="flex items-center gap-1.5">
            <Select<Filter>
              width={170}
              value={filter}
              onChange={setFilter}
              options={[
                { value: 'all', label: '全部游戏' },
                { value: 'installed', label: '已安装' },
                { value: 'favorite', label: '收藏' },
                { value: 'notinstalled', label: '未安装' },
              ]}
            />
            <span className="ml-auto text-xs text-fg-3 tabular-nums">{list.length} / {Object.keys(owned).length}</span>
          </div>
          <div className="relative">
            <Search size={13} className="absolute top-1/2 left-2.5 -translate-y-1/2 text-fg-3" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="按名称搜索" className="input h-8 pl-8 text-[12.5px]" />
          </div>
        </div>
        <div className="scroll-area flex-1 px-2 pb-3">
          {list.length === 0 && <div className="px-3 py-8 text-center text-xs text-fg-3">没有匹配的游戏</div>}
          {favs.length > 0 && filter !== 'favorite' && (
            <div className="mb-2">
              <button onClick={() => setFavOpen(!favOpen)} className="flex w-full items-center gap-1.5 px-2 py-1.5 text-[11px] font-semibold tracking-wider text-fg-3 uppercase hover:text-fg-2">
                <ChevronDown size={12} className={cn('transition', !favOpen && '-rotate-90')} /><Star size={11} className="text-gold" /> 收藏 <span className="text-fg-4">({favs.length})</span>
              </button>
              {favOpen && favs.map((g) => <Row key={g.id} g={g} />)}
            </div>
          )}
          {list.length > 0 && (
            <div>
              <button onClick={() => setAllOpen(!allOpen)} className="flex w-full items-center gap-1.5 px-2 py-1.5 text-[11px] font-semibold tracking-wider text-fg-3 uppercase hover:text-fg-2">
                <ChevronDown size={12} className={cn('transition', !allOpen && '-rotate-90')} />
                {filter === 'installed' ? '已安装' : filter === 'favorite' ? '收藏' : filter === 'notinstalled' ? '未安装' : '全部游戏'} <span className="text-fg-4">({list.length})</span>
              </button>
              {allOpen && list.map((g) => <Row key={g.id} g={g} />)}
            </div>
          )}
        </div>
        <div className="border-t hairline p-2.5">
          <button onClick={() => nav('/store/browse')} className="flex w-full items-center justify-center gap-2 rounded-lg py-2 text-[12.5px] text-fg-3 transition hover:bg-white/[0.05] hover:text-fg"><Plus size={14} />添加游戏</button>
        </div>
      </aside>
      <div className="h-full min-h-0 min-w-0">
        <Outlet />
      </div>
    </div>
  )
}
