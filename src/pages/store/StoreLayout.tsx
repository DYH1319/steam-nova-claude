import { AnimatePresence, motion } from 'motion/react'
import { Heart, Search, ShoppingCart } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router'
import { MiniCover } from '@/components/game'
import { useClickOutside } from '@/components/ui'
import { games } from '@/data/games'
import { useStore } from '@/store'
import { cn, finalPrice, formatPrice } from '@/lib/utils'

const LINKS = [
  { to: '/store', label: '发现' },
  { to: '/store/browse', label: '浏览全部' },
  { to: '/store/browse?special=1', label: '特惠' },
  { to: '/store/browse?sort=release', label: '新品' },
  { to: '/store/browse?free=1', label: '免费开玩' },
]

function StoreSearch() {
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const [idx, setIdx] = useState(0)
  const nav = useNavigate()
  const ref = useClickOutside<HTMLDivElement>(open, () => setOpen(false))
  const results = useMemo(() => {
    const t = q.trim().toLowerCase()
    if (!t) return []
    return games.filter((g) => g.title.toLowerCase().includes(t) || g.tags.some((x) => x.toLowerCase().includes(t))).slice(0, 6)
  }, [q])
  const go = (path: string) => { nav(path); setOpen(false); setQ('') }
  return (
    <div ref={ref} className="relative w-[300px]">
      <Search size={15} className="absolute top-1/2 left-3 -translate-y-1/2 text-fg-3" />
      <input
        value={q}
        onChange={(e) => { setQ(e.target.value); setOpen(true); setIdx(0) }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') setIdx((i) => Math.min(results.length, i + 1))
          if (e.key === 'ArrowUp') setIdx((i) => Math.max(0, i - 1))
          if (e.key === 'Enter') {
            if (idx > 0 && results[idx - 1]) go(`/game/${results[idx - 1].id}`)
            else if (q.trim()) go(`/store/browse?q=${encodeURIComponent(q.trim())}`)
          }
        }}
        placeholder="搜索商店"
        className="input h-9 pl-9"
      />
      <AnimatePresence>
        {open && results.length > 0 && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="absolute top-full right-0 z-50 mt-2 w-[380px] overflow-hidden rounded-xl bg-ink-3 p-1.5 shadow-pop">
            {results.map((g, i) => (
              <button key={g.id} onMouseEnter={() => setIdx(i + 1)} onClick={() => go(`/game/${g.id}`)} className={cn('flex w-full items-center gap-3 rounded-lg p-2 text-left', idx === i + 1 && 'bg-white/[0.07]')}>
                <MiniCover game={g} className="aspect-[16/9] w-20" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-medium">{g.title}</span>
                  <span className="block truncate text-[11px] text-fg-3">{g.genres.join(' · ')}</span>
                </span>
                <span className={cn('text-[12px] tabular-nums', g.discount ? 'text-sale' : 'text-fg-2')}>{g.comingSoon ? '即将推出' : formatPrice(finalPrice(g.price, g.discount))}</span>
              </button>
            ))}
            <button onClick={() => go(`/store/browse?q=${encodeURIComponent(q)}`)} className="mt-1 w-full rounded-lg border-t hairline px-2 py-2.5 text-left text-xs text-fg-3 hover:text-nova">查看 “{q}” 的全部结果 →</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function StoreLayout() {
  const loc = useLocation()
  const ref = useRef<HTMLDivElement>(null)
  const wish = useStore((s) => s.wishlist.length)
  const cart = useStore((s) => s.cart.length)
  const set = useStore((s) => s.set)
  const full = loc.pathname + loc.search
  useEffect(() => { ref.current?.scrollTo({ top: 0 }) }, [loc.pathname])
  const isActive = (to: string) => (to.includes('?') ? full === to : to === '/store/browse' ? loc.pathname === to && !loc.search.match(/special|sort=release|free/) : loc.pathname === to)

  return (
    <div ref={ref} id="store-scroll" className="scroll-area h-full">
      <div className="sticky top-0 z-30 border-b hairline bg-ink-1/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-[1320px] items-center gap-1 px-8">
          {LINKS.map((l) => (
            <Link key={l.to} to={l.to} className={cn('rounded-lg px-3 py-1.5 text-[13.5px] font-medium transition', isActive(l.to) ? 'bg-white/[0.08] text-fg' : 'text-fg-3 hover:bg-white/[0.04] hover:text-fg')}>
              {l.label}
            </Link>
          ))}
          <div className="flex-1" />
          <Link to="/store/wishlist" className={cn('flex items-center gap-2 rounded-lg px-3 py-1.5 text-[13.5px] font-medium transition', loc.pathname === '/store/wishlist' ? 'bg-white/[0.08] text-fg' : 'text-fg-3 hover:text-fg')}>
            <Heart size={15} /> 愿望单 <span className="text-fg-3 tabular-nums">{wish}</span>
          </Link>
          <button onClick={() => set({ cartOpen: true })} className={cn('mr-2 flex items-center gap-2 rounded-lg px-3 py-1.5 text-[13.5px] font-medium transition', cart ? 'nova-gradient text-white' : 'text-fg-3 hover:text-fg')}>
            <ShoppingCart size={15} /> 购物车{cart > 0 && ` (${cart})`}
          </button>
          <StoreSearch />
        </div>
      </div>
      <motion.div key={loc.pathname} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}>
        <Outlet />
      </motion.div>
      <footer className="mx-auto mt-16 max-w-[1320px] border-t hairline px-8 py-8 text-xs text-fg-4">
        <div className="flex items-center justify-between">
          <span>© 2026 Nova Platform. 所有商标均为其各自所有者的财产。所有价格均包含增值税。</span>
          <span className="flex gap-5"><span className="hover:text-fg-2">隐私政策</span><span className="hover:text-fg-2">用户协议</span><span className="hover:text-fg-2">退款政策</span></span>
        </div>
      </footer>
    </div>
  )
}
