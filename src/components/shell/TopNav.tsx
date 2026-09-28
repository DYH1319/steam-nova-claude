import { motion } from 'motion/react'
import {
  Bell, ChevronDown, ChevronLeft, ChevronRight, Download, Gift, LogOut, Pencil, Search, ShoppingCart, Tag, User, UserPlus, Wallet,
} from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router'
import { Avatar, statusText, type AnyStatus } from '@/components/art/Avatar'
import { IconButton, Kbd, MenuItem, Popover, Ring } from '@/components/ui'
import { useActiveDownload, useStore } from '@/store'
import { cn, timeAgo } from '@/lib/utils'

const TABS = [
  { to: '/store', label: '商店', match: ['/store', '/game'] },
  { to: '/library', label: '游戏库', match: ['/library'] },
  { to: '/downloads', label: '下载', match: ['/downloads'] },
  { to: '/friends', label: '好友', match: ['/friends'] },
  { to: '/achievements', label: '成就', match: ['/achievements'] },
]

const noticeIcon = { friend: UserPlus, sale: Tag, download: Download, gift: Gift, update: Download, purchase: ShoppingCart }

export function TopNav() {
  const loc = useLocation()
  const nav = useNavigate()
  const active = useActiveDownload()
  const queued = useStore((s) => s.downloads.length)
  const cart = useStore((s) => s.cart.length)
  const wallet = useStore((s) => s.wallet)
  const me = useStore((s) => s.me)
  const notices = useStore((s) => s.notices)
  const running = useStore((s) => s.running)
  const set = useStore((s) => s.set)
  const setStatus = useStore((s) => s.setStatus)
  const markRead = useStore((s) => s.markNoticesRead)
  const unread = notices.filter((n) => !n.read).length
  const myStatus: AnyStatus = me.status === 'online' && running ? 'ingame' : me.status

  return (
    <header className="relative z-40 flex h-14 shrink-0 items-center gap-4 border-b hairline bg-ink-1/95 px-3 backdrop-blur">
      <div className="flex items-center gap-0.5">
        <IconButton icon={ChevronLeft} label="后退 (Alt+←)" onClick={() => nav(-1)} />
        <IconButton icon={ChevronRight} label="前进 (Alt+→)" onClick={() => nav(1)} />
      </div>

      <nav className="flex h-full items-center gap-1">
        {TABS.map((t) => {
          const on = t.match.some((m) => loc.pathname.startsWith(m))
          return (
            <Link key={t.to} to={t.to} className={cn('relative flex h-full items-center gap-2 px-3.5 font-display text-[15px] font-semibold tracking-tight transition', on ? 'text-fg' : 'text-fg-3 hover:text-fg-2')}>
              {t.label}
              {t.to === '/downloads' && active && (
                <Ring value={(active.done / active.total) * 100} size={16} stroke={2.5} />
              )}
              {t.to === '/downloads' && !active && queued > 0 && <span className="rounded bg-white/10 px-1 text-[10px] font-bold text-fg-2">{queued}</span>}
              {on && <motion.span layoutId="topnav" className="nova-gradient absolute right-3 bottom-0 left-3 h-[3px] rounded-t-full" transition={{ type: 'spring', stiffness: 500, damping: 40 }} />}
            </Link>
          )
        })}
      </nav>

      <div className="flex-1" />

      <button
        onClick={() => set({ paletteOpen: true })}
        className="flex h-9 w-[260px] items-center gap-2.5 rounded-lg border hairline bg-white/[0.03] px-3 text-[13px] text-fg-3 transition hover:border-white/15 hover:bg-white/[0.05] hover:text-fg-2 2xl:w-[320px]"
      >
        <Search size={15} />
        <span className="flex-1 text-left">搜索游戏、好友或页面</span>
        <Kbd>Ctrl</Kbd><Kbd>K</Kbd>
      </button>

      <div className="flex items-center gap-1">
        <IconButton icon={ShoppingCart} label="购物车" badge={cart || undefined} onClick={() => set({ cartOpen: true })} />
        <Popover
          width={360}
          trigger={(open, toggle) => <IconButton icon={Bell} label="通知" active={open} badge={unread || undefined} onClick={toggle} />}
        >
          {(close) => (
            <div>
              <div className="flex items-center justify-between border-b hairline px-4 py-3">
                <span className="text-sm font-semibold">通知</span>
                <button onClick={markRead} className="text-xs text-fg-3 hover:text-nova">全部标为已读</button>
              </div>
              <div className="scroll-area max-h-[380px] p-1.5">
                {notices.map((n) => {
                  const Icon = noticeIcon[n.kind]
                  return (
                    <button
                      key={n.id}
                      onClick={() => { if (n.link) nav(n.link); markRead(); close() }}
                      className="flex w-full gap-3 rounded-lg p-2.5 text-left transition hover:bg-white/[0.05]"
                    >
                      <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', n.kind === 'sale' ? 'bg-sale/15 text-sale' : n.kind === 'friend' ? 'bg-online/15 text-online' : n.kind === 'gift' ? 'bg-nova-hot/15 text-nova-hot' : 'bg-ingame/15 text-ingame')}>
                        <Icon size={16} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2 text-[13px] font-medium text-fg">
                          <span className="truncate">{n.title}</span>
                          {!n.read && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-nova" />}
                        </span>
                        <span className="mt-0.5 block text-xs text-fg-3">{n.body}</span>
                        <span className="mt-1 block text-[11px] text-fg-4">{timeAgo(n.at)}</span>
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </Popover>
      </div>

      <button onClick={() => set({ fundsOpen: true })} className="flex h-9 items-center gap-2 rounded-lg bg-white/[0.04] px-3 text-[13px] font-semibold tabular-nums text-fg-2 transition hover:bg-white/[0.08] hover:text-fg">
        <Wallet size={15} className="text-nova" />¥ {wallet.toFixed(2)}
      </button>

      <Popover
        width={250}
        trigger={(open, toggle) => (
          <button onClick={toggle} className={cn('flex h-10 items-center gap-2.5 rounded-xl py-1 pr-2 pl-1 transition hover:bg-white/[0.05]', open && 'bg-white/[0.05]')}>
            <Avatar seed={me.avatarSeed} name={me.name} size={32} status={myStatus} />
            <span className="hidden text-left leading-tight xl:block">
              <span className="block text-[13px] font-semibold">{me.name}</span>
              <span className={cn('block text-[11px]', myStatus === 'ingame' ? 'text-ingame' : myStatus === 'online' ? 'text-online' : myStatus === 'away' ? 'text-away' : 'text-fg-3')}>{statusText[myStatus]}</span>
            </span>
            <ChevronDown size={14} className="text-fg-3" />
          </button>
        )}
      >
        {(close) => (
          <div className="p-1.5">
            <div className="flex items-center gap-3 px-2.5 py-2.5">
              <Avatar seed={me.avatarSeed} name={me.name} size={40} />
              <div>
                <div className="text-sm font-semibold">{me.name}</div>
                <div className="text-xs text-fg-3">等级 {me.level} · #{me.code}</div>
              </div>
            </div>
            <div className="my-1 h-px bg-white/[0.06]" />
            <MenuItem icon={User} onClick={() => { nav('/profile'); close() }}>查看个人资料</MenuItem>
            <MenuItem icon={Pencil} onClick={() => { set({ editProfileOpen: true }); close() }}>编辑个人资料</MenuItem>
            <MenuItem icon={Wallet} onClick={() => { set({ fundsOpen: true }); close() }} right={<span className="text-xs text-fg-3">¥{wallet.toFixed(2)}</span>}>钱包</MenuItem>
            <div className="my-1 h-px bg-white/[0.06]" />
            {(['online', 'away', 'invisible'] as const).map((st) => (
              <MenuItem key={st} active={me.status === st} onClick={() => setStatus(st)}>
                <span className="flex items-center gap-2">
                  <span className={cn('h-2 w-2 rounded-full', st === 'online' ? 'bg-online' : st === 'away' ? 'bg-away' : 'bg-fg-4')} />
                  {statusText[st]}
                </span>
              </MenuItem>
            ))}
            <div className="my-1 h-px bg-white/[0.06]" />
            <MenuItem icon={LogOut} onClick={() => { useStore.getState().toast({ kind: 'info', title: '这是演示账户，无法注销' }); close() }}>注销</MenuItem>
          </div>
        )}
      </Popover>
    </header>
  )
}
