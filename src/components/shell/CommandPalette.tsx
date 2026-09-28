import { AnimatePresence, motion } from 'motion/react'
import { CornerDownLeft, Download, Gamepad2, Library, Search, Store, Trophy, User, Users, type LucideIcon } from 'lucide-react'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router'
import { Avatar } from '@/components/art/Avatar'
import { MiniCover } from '@/components/game'
import { Kbd } from '@/components/ui'
import { games } from '@/data/games'
import { useStore } from '@/store'
import { cn, finalPrice, formatPrice } from '@/lib/utils'
import { friendSubline } from './friends-utils'

interface Item { id: string; group: string; label: string; sub?: string; icon?: ReactNode; run: () => void }

const PAGES: [string, string, LucideIcon][] = [
  ['商店', '/store', Store], ['游戏库', '/library', Library], ['下载', '/downloads', Download],
  ['好友', '/friends', Users], ['成就', '/achievements', Trophy], ['个人资料', '/profile', User], ['愿望单', '/store/wishlist', Gamepad2],
]

export function CommandPalette() {
  const open = useStore((s) => s.paletteOpen)
  const set = useStore((s) => s.set)
  const owned = useStore((s) => s.owned)
  const friends = useStore((s) => s.friends)
  const openChat = useStore((s) => s.openChat)
  const nav = useNavigate()
  const [q, setQ] = useState('')
  const [idx, setIdx] = useState(0)
  const close = () => set({ paletteOpen: false })

  useEffect(() => { if (open) { setQ(''); setIdx(0) } }, [open])

  const items = useMemo<Item[]>(() => {
    const t = q.trim().toLowerCase()
    const m = (s: string) => s.toLowerCase().includes(t)
    const gs = games.filter((g) => !t || m(g.title) || g.tags.some(m) || g.genres.some(m) || m(g.developer))
      .sort((a, b) => Number(!!owned[b.id]) - Number(!!owned[a.id]))
      .slice(0, t ? 7 : 5)
    const out: Item[] = gs.map((g) => ({
      id: 'g' + g.id,
      group: '游戏',
      label: g.title,
      sub: owned[g.id] ? (owned[g.id].installed ? '在游戏库中 · 已安装' : '在游戏库中') : g.comingSoon ? '即将推出' : formatPrice(finalPrice(g.price, g.discount)),
      icon: <MiniCover game={g} className="h-8 w-14" />,
      run: () => nav(owned[g.id] ? `/library/${g.id}` : `/game/${g.id}`),
    }))
    friends.filter((f) => !t || m(f.name)).slice(0, t ? 5 : 3).forEach((f) =>
      out.push({ id: 'f' + f.id, group: '好友', label: f.name, sub: friendSubline(f), icon: <Avatar seed={f.id} name={f.name} size={30} status={f.status} />, run: () => openChat(f.id) }),
    )
    PAGES.filter(([l]) => !t || m(l)).forEach(([l, to, I]) =>
      out.push({ id: 'p' + to, group: '前往', label: l, icon: <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.06]"><I size={15} /></span>, run: () => nav(to) }),
    )
    if (t) out.push({ id: 'search', group: '商店', label: `在商店中搜索 “${q}”`, icon: <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-nova/15 text-nova"><Search size={15} /></span>, run: () => nav(`/store/browse?q=${encodeURIComponent(q)}`) })
    return out
  }, [q, owned, friends, nav, openChat])

  useEffect(() => setIdx(0), [q])

  const run = (i: Item) => { i.run(); close() }
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setIdx((i) => Math.min(items.length - 1, i + 1)) }
    if (e.key === 'ArrowUp') { e.preventDefault(); setIdx((i) => Math.max(0, i - 1)) }
    if (e.key === 'Enter' && items[idx]) run(items[idx])
    if (e.key === 'Escape') close()
  }

  let lastGroup = ''
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[85] flex justify-center pt-[12vh]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={close} />
          <motion.div
            className="relative h-fit w-full max-w-[600px] overflow-hidden rounded-2xl border hairline bg-ink-2 shadow-pop"
            initial={{ y: -12, scale: 0.98 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: -8, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 500, damping: 36 }}
          >
            <div className="flex items-center gap-3 border-b hairline px-4">
              <Search size={18} className="text-fg-3" />
              <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={onKey} placeholder="搜索游戏、好友或跳转页面…" className="h-14 flex-1 bg-transparent text-[15px] outline-none placeholder:text-fg-3" />
              <Kbd>Esc</Kbd>
            </div>
            <div className="scroll-area max-h-[420px] p-2">
              {items.length === 0 && <div className="py-12 text-center text-sm text-fg-3">没有找到结果</div>}
              {items.map((it, i) => {
                const header = it.group !== lastGroup ? it.group : null
                lastGroup = it.group
                return (
                  <div key={it.id}>
                    {header && <div className="px-3 pt-2.5 pb-1.5 text-[11px] font-semibold tracking-wider text-fg-4 uppercase">{header}</div>}
                    <button
                      onMouseEnter={() => setIdx(i)}
                      onClick={() => run(it)}
                      className={cn('flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition', i === idx ? 'bg-white/[0.07]' : '')}
                    >
                      {it.icon}
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13.5px] font-medium">{it.label}</span>
                        {it.sub && <span className="block truncate text-xs text-fg-3">{it.sub}</span>}
                      </span>
                      {i === idx && <CornerDownLeft size={14} className="text-fg-3" />}
                    </button>
                  </div>
                )
              })}
            </div>
            <div className="flex items-center gap-4 border-t hairline px-4 py-2.5 text-[11px] text-fg-3">
              <span className="flex items-center gap-1.5"><Kbd>↑</Kbd><Kbd>↓</Kbd> 选择</span>
              <span className="flex items-center gap-1.5"><Kbd>Enter</Kbd> 打开</span>
              <span className="flex items-center gap-1.5"><Kbd>Ctrl</Kbd><Kbd>K</Kbd> 切换</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
