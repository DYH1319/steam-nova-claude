import { AnimatePresence, motion } from 'motion/react'
import { Check, Heart, Search, ShoppingCart, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { GameArt } from '@/components/art/GameArt'
import { Button, EmptyState, IconButton, PlatformIcons, Price, Select, Toggle } from '@/components/ui'
import { gameMap, ratingLabel } from '@/data/games'
import { useStore } from '@/store'
import { cn, finalPrice, formatDate } from '@/lib/utils'

type Sort = 'order' | 'price' | 'discount' | 'name' | 'release'

export default function Wishlist() {
  const wishlist = useStore((s) => s.wishlist)
  const cart = useStore((s) => s.cart)
  const owned = useStore((s) => s.owned)
  const { addToCart, toggleWishlist, set } = useStore()
  const [q, setQ] = useState('')
  const [sort, setSort] = useState<Sort>('order')
  const [onlySale, setOnlySale] = useState(false)
  const list = useMemo(() => {
    let l = wishlist.map((id) => gameMap[id]).filter((g) => g.title.toLowerCase().includes(q.toLowerCase()) && (!onlySale || g.discount > 0))
    if (sort === 'price') l = [...l].sort((a, b) => finalPrice(a.price, a.discount) - finalPrice(b.price, b.discount))
    if (sort === 'discount') l = [...l].sort((a, b) => b.discount - a.discount)
    if (sort === 'name') l = [...l].sort((a, b) => a.title.localeCompare(b.title))
    if (sort === 'release') l = [...l].sort((a, b) => +new Date(a.release) - +new Date(b.release))
    return l
  }, [wishlist, q, sort, onlySale])
  const onSale = wishlist.filter((id) => gameMap[id].discount > 0).length

  return (
    <div className="mx-auto max-w-[1120px] px-8 pt-8">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="flex items-center gap-3 font-display text-3xl font-bold"><Heart className="text-nova-hot" fill="currentColor" size={26} />我的愿望单</h1>
          <p className="mt-1 text-[13px] text-fg-3">{wishlist.length} 款游戏 · 其中 <span className="text-sale">{onSale} 款正在特惠</span></p>
        </div>
      </div>
      {wishlist.length === 0 ? (
        <EmptyState icon={Heart} title="愿望单还是空的" body="在商店中点击心形图标，即可将游戏添加到愿望单。特惠开始时我们会通知你。" action={<Link to="/store"><Button variant="primary">去商店看看</Button></Link>} />
      ) : (
        <>
          <div className="mb-4 flex items-center gap-3">
            <div className="relative w-72">
              <Search size={14} className="absolute top-1/2 left-3 -translate-y-1/2 text-fg-3" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="按名称搜索" className="input pl-9" />
            </div>
            <div className="w-40"><Toggle checked={onlySale} onChange={setOnlySale} label="仅显示特惠" /></div>
            <div className="flex-1" />
            <Select label="排序" value={sort} onChange={setSort} options={[{ value: 'order', label: '添加顺序' }, { value: 'price', label: '价格' }, { value: 'discount', label: '折扣' }, { value: 'name', label: '名称' }, { value: 'release', label: '发行日期' }]} />
          </div>
          {list.length === 0 ? <EmptyState icon={Search} title="没有匹配的游戏" /> : (
            <div className="space-y-2.5">
              <AnimatePresence initial={false}>
                {list.map((g, k) => {
                  const rl = ratingLabel(g.rating, g.reviews)
                  const inCart = cart.includes(g.id)
                  return (
                    <motion.div key={g.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -30, height: 0, marginTop: 0 }} className="group flex items-center gap-5 overflow-hidden rounded-2xl bg-ink-2 p-3 pr-5 ring-1 ring-white/[0.05] transition hover:ring-white/10">
                      <span className="w-6 text-center font-display text-sm font-semibold text-fg-4">{k + 1}</span>
                      <Link to={`/game/${g.id}`} className="shrink-0 overflow-hidden rounded-xl">
                        <GameArt game={g} title="landscape" className="aspect-[16/9] w-[220px] transition duration-500 group-hover:scale-105" />
                      </Link>
                      <div className="min-w-0 flex-1">
                        <Link to={`/game/${g.id}`} className="font-display text-lg font-semibold hover:text-nova">{g.title}</Link>
                        <div className="mt-1.5 grid grid-cols-[70px_1fr] gap-y-1 text-[12px]">
                          <span className="text-fg-3">总体评测</span><span className={rl.tone}>{rl.label}</span>
                          <span className="text-fg-3">发行日期</span><span className="text-fg-2">{formatDate(g.release)}</span>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <PlatformIcons platforms={g.platforms} />
                          {g.tags.slice(0, 4).map((t) => <span key={t} className="chip">{t}</span>)}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2.5">
                        <Price price={g.price} discount={g.discount} comingSoon={g.comingSoon} />
                        {owned[g.id] ? <span className="text-xs text-ingame">已拥有</span> : g.comingSoon ? (
                          <span className="text-xs text-fg-3">发行时通知我</span>
                        ) : inCart ? (
                          <Button size="sm" variant="secondary" icon={Check} onClick={() => set({ cartOpen: true })}>在购物车中</Button>
                        ) : (
                          <Button size="sm" variant="primary" icon={ShoppingCart} onClick={() => addToCart(g.id)}>加入购物车</Button>
                        )}
                      </div>
                      <IconButton icon={X} label="从愿望单移除" onClick={() => toggleWishlist(g.id)} className={cn('opacity-0 transition group-hover:opacity-100')} />
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          )}
        </>
      )}
    </div>
  )
}
