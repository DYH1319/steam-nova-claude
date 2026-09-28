import { LayoutGrid, List, Search, SearchX, X } from 'lucide-react'
import { useMemo } from 'react'
import { useSearchParams } from 'react-router'
import { StoreCapsule, StoreRow } from '@/components/game'
import { Button, Checkbox, EmptyState, IconButton, Select, Skeleton, Toggle } from '@/components/ui'
import { FEATURE_LABEL, GENRES, games, type Feature } from '@/data/games'
import { useFakeLoad } from '@/lib/hooks'
import { useStore } from '@/store'
import { cn, finalPrice } from '@/lib/utils'

type Sort = 'relevance' | 'release' | 'name' | 'priceAsc' | 'priceDesc' | 'rating' | 'discount'
const SORTS: { value: Sort; label: string }[] = [
  { value: 'relevance', label: '相关性' },
  { value: 'release', label: '发行日期' },
  { value: 'name', label: '名称' },
  { value: 'priceAsc', label: '价格从低到高' },
  { value: 'priceDesc', label: '价格从高到低' },
  { value: 'rating', label: '用户评测' },
  { value: 'discount', label: '折扣力度' },
]
const PRICES = [
  { value: 'any', label: '任意价格' },
  { value: '0', label: '免费' },
  { value: '50', label: '¥50 以下' },
  { value: '100', label: '¥100 以下' },
  { value: '200', label: '¥200 以下' },
] as const
const FEATS: Feature[] = ['single', 'multi', 'coop', 'controller', 'workshop', 'cloud']

export default function Browse() {
  const [sp, setSp] = useSearchParams()
  const owned = useStore((s) => s.owned)
  const q = sp.get('q') ?? ''
  const genres = sp.get('genre')?.split(',').filter(Boolean) ?? []
  const feats = (sp.get('feat')?.split(',').filter(Boolean) ?? []) as Feature[]
  const special = sp.get('special') === '1'
  const free = sp.get('free') === '1'
  const hideOwned = sp.get('hideOwned') === '1'
  const price = sp.get('price') ?? (free ? '0' : 'any')
  const sort = (sp.get('sort') as Sort) ?? 'relevance'
  const view = sp.get('view') ?? 'list'
  const loading = useFakeLoad(sp.toString(), 380)

  const upd = (k: string, v: string | null) => {
    const n = new URLSearchParams(sp)
    if (v === null || v === '') n.delete(k)
    else n.set(k, v)
    if (k === 'price') n.delete('free')
    setSp(n, { replace: true })
  }
  const toggleIn = (k: string, arr: string[], v: string) => upd(k, (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]).join(','))

  const results = useMemo(() => {
    const t = q.trim().toLowerCase()
    let list = games.filter((g) => {
      if (t && !(g.title.toLowerCase().includes(t) || g.tags.some((x) => x.toLowerCase().includes(t)) || g.developer.toLowerCase().includes(t) || g.genres.some((x) => x.includes(t)))) return false
      if (genres.length && !genres.every((x) => g.genres.includes(x))) return false
      if (feats.length && !feats.every((f) => g.features.includes(f))) return false
      if (special && !g.discount) return false
      if (hideOwned && owned[g.id]) return false
      const fp = finalPrice(g.price, g.discount)
      if (price === '0' && fp !== 0) return false
      if (price !== 'any' && price !== '0' && fp >= Number(price)) return false
      return true
    })
    const fp = (g: (typeof games)[0]) => finalPrice(g.price, g.discount)
    list = [...list].sort((a, b) => {
      switch (sort) {
        case 'release': return +new Date(b.release) - +new Date(a.release)
        case 'name': return a.title.localeCompare(b.title)
        case 'priceAsc': return fp(a) - fp(b)
        case 'priceDesc': return fp(b) - fp(a)
        case 'rating': return b.rating - a.rating
        case 'discount': return b.discount - a.discount
        default: return (b.players ?? 0) * (t && b.title.toLowerCase().startsWith(t) ? 10 : 1) - (a.players ?? 0) * (t && a.title.toLowerCase().startsWith(t) ? 10 : 1)
      }
    })
    return list
  }, [q, genres.join(), feats.join(), special, hideOwned, price, sort, owned]) // eslint-disable-line

  const genreCount = (name: string) => games.filter((g) => g.genres.includes(name)).length
  const activeFilters = [
    ...genres.map((x) => ({ label: x, clear: () => toggleIn('genre', genres, x) })),
    ...feats.map((x) => ({ label: FEATURE_LABEL[x], clear: () => toggleIn('feat', feats, x) })),
    ...(special ? [{ label: '特惠中', clear: () => upd('special', null) }] : []),
    ...(price !== 'any' ? [{ label: PRICES.find((p) => p.value === price)?.label ?? '', clear: () => upd('price', null) }] : []),
    ...(hideOwned ? [{ label: '隐藏已拥有', clear: () => upd('hideOwned', null) }] : []),
  ]
  const clearAll = () => setSp(q ? { q } : {}, { replace: true })

  return (
    <div className="mx-auto grid max-w-[1320px] grid-cols-[240px_1fr] gap-8 px-8 pt-8">
      <aside className="sticky top-[76px] h-fit space-y-6 pb-8">
        <div>
          <div className="eyebrow mb-2.5">价格</div>
          <div className="flex flex-wrap gap-1.5">
            {PRICES.map((p) => (
              <button key={p.value} onClick={() => upd('price', p.value === 'any' ? null : p.value)} className={cn('rounded-lg px-2.5 py-1 text-[12.5px] transition', price === p.value ? 'bg-nova/15 text-nova ring-1 ring-nova/40' : 'bg-white/[0.04] text-fg-2 hover:bg-white/[0.08]')}>{p.label}</button>
            ))}
          </div>
        </div>
        <div className="space-y-0.5">
          <Toggle checked={special} onChange={(v) => upd('special', v ? '1' : null)} label="仅显示特惠" />
          <Toggle checked={hideOwned} onChange={(v) => upd('hideOwned', v ? '1' : null)} label="隐藏已拥有的游戏" />
        </div>
        <div>
          <div className="eyebrow mb-1.5">类型</div>
          {GENRES.map((g) => <Checkbox key={g} checked={genres.includes(g)} onChange={() => toggleIn('genre', genres, g)} label={g} count={genreCount(g)} />)}
        </div>
        <div>
          <div className="eyebrow mb-1.5">功能</div>
          {FEATS.map((f) => <Checkbox key={f} checked={feats.includes(f)} onChange={() => toggleIn('feat', feats, f)} label={FEATURE_LABEL[f]} />)}
        </div>
      </aside>

      <div className="min-w-0 pb-8">
        <div className="relative mb-5">
          <Search size={18} className="absolute top-1/2 left-4 -translate-y-1/2 text-fg-3" />
          <input value={q} onChange={(e) => upd('q', e.target.value)} placeholder="按名称、标签或开发商搜索" className="input h-12 rounded-xl pl-11 text-[15px]" />
          {q && <IconButton icon={X} label="清除" size={28} onClick={() => upd('q', null)} className="absolute top-1/2 right-3 -translate-y-1/2" />}
        </div>
        <div className="mb-4 flex items-center justify-between gap-4">
          <div className="text-[13px] text-fg-3">
            {q ? <>“<span className="text-fg">{q}</span>” 的搜索结果：</> : '全部游戏：'}
            <span className="font-semibold text-fg tabular-nums">{results.length}</span> 项
          </div>
          <div className="flex items-center gap-2">
            <Select label="排序" value={sort} onChange={(v) => upd('sort', v === 'relevance' ? null : v)} options={SORTS} />
            <div className="flex rounded-lg bg-white/[0.04] p-0.5">
              <IconButton icon={List} label="列表视图" size={30} active={view === 'list'} onClick={() => upd('view', null)} />
              <IconButton icon={LayoutGrid} label="网格视图" size={30} active={view === 'grid'} onClick={() => upd('view', 'grid')} />
            </div>
          </div>
        </div>
        {activeFilters.length > 0 && (
          <div className="mb-4 flex flex-wrap items-center gap-1.5">
            {activeFilters.map((f) => (
              <button key={f.label} onClick={f.clear} className="flex items-center gap-1 rounded-full bg-white/[0.06] py-1 pr-2 pl-3 text-xs text-fg-2 transition hover:bg-white/[0.1] hover:text-fg">{f.label}<X size={12} /></button>
            ))}
            <button onClick={clearAll} className="ml-1 text-xs text-fg-3 hover:text-nova">清除全部</button>
          </div>
        )}
        {loading ? (
          view === 'grid' ? (
            <div className="grid grid-cols-3 gap-5">{Array.from({ length: 6 }, (_, i) => <div key={i}><Skeleton className="aspect-[16/9] rounded-xl" /><Skeleton className="mt-3 h-4 w-2/3" /></div>)}</div>
          ) : (
            <div className="space-y-2">{Array.from({ length: 6 }, (_, i) => <div key={i} className="flex items-center gap-4 p-2"><Skeleton className="aspect-[16/9] w-[168px]" /><div className="flex-1 space-y-2"><Skeleton className="h-4 w-1/3" /><Skeleton className="h-3 w-1/2" /></div><Skeleton className="h-8 w-24" /></div>)}</div>
          )
        ) : results.length === 0 ? (
          <EmptyState icon={SearchX} title="没有找到符合条件的游戏" body="试试减少筛选条件，或换个关键词搜索。" action={<Button variant="secondary" onClick={clearAll}>清除所有筛选</Button>} />
        ) : view === 'grid' ? (
          <div className="grid grid-cols-3 gap-x-5 gap-y-7">{results.map((g) => <StoreCapsule key={g.id} game={g} />)}</div>
        ) : (
          <div className="space-y-1">{results.map((g) => <StoreRow key={g.id} game={g} />)}</div>
        )}
      </div>
    </div>
  )
}
