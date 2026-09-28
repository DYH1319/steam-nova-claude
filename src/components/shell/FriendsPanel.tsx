import { AnimatePresence, motion } from 'motion/react'
import { ChevronDown, MessageSquare, PanelRightClose, Search, Star, User, UserPlus, Gamepad2, UserMinus } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Avatar, statusText, type AnyStatus } from '@/components/art/Avatar'
import { MiniCover } from '@/components/game'
import { IconButton, MenuItem, Popover } from '@/components/ui'
import { friendSubline, useGroupedFriends, usePanelVisible } from '@/components/shell/friends-utils'
import { gameMap } from '@/data/games'
import type { Friend } from '@/data/social'
import { useStore } from '@/store'
import { cn } from '@/lib/utils'

export function FriendRow({ f, compact, onClick, active }: { f: Friend; compact?: boolean; onClick?: () => void; active?: boolean }) {
  const unread = useStore((s) => s.unread[f.id] ?? 0)
  const openChat = useStore((s) => s.openChat)
  const running = useStore((s) => s.running)
  const sendInvite = useStore((s) => s.sendInvite)
  const toggleFav = useStore((s) => s.toggleFriendFavorite)
  const nav = useNavigate()
  const g = f.status === 'ingame' && f.gameId ? gameMap[f.gameId] : null
  return (
    <div
      onClick={onClick ?? (() => openChat(f.id))}
      onDoubleClick={() => openChat(f.id)}
      className={cn('group relative flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 transition hover:bg-white/[0.05]', active && 'bg-white/[0.07]')}
    >
      <Avatar seed={f.id} name={f.name} size={compact ? 30 : 36} status={f.status} />
      <div className="min-w-0 flex-1">
        <div className={cn('truncate text-[13px] font-medium', f.status === 'offline' ? 'text-fg-3' : f.status === 'ingame' ? 'text-ingame' : 'text-fg')}>{f.name}</div>
        <div className={cn('truncate text-[11.5px]', f.status === 'ingame' ? 'text-ingame/75' : 'text-fg-3')}>{friendSubline(f)}</div>
      </div>
      {g && <MiniCover game={g} className="h-6 w-6 shrink-0 opacity-90 group-hover:opacity-0" />}
      {unread > 0 && <span className="rounded-full bg-nova px-1.5 text-[10px] font-bold leading-4 text-white group-hover:opacity-0">{unread}</span>}
      <div className="absolute right-1.5 flex items-center opacity-0 transition group-hover:opacity-100" onClick={(e) => e.stopPropagation()}>
        <IconButton icon={MessageSquare} label="发消息" size={26} onClick={() => openChat(f.id)} />
        <Popover
          width={200}
          trigger={(_, toggle) => <IconButton icon={ChevronDown} label="更多" size={26} onClick={toggle} />}
        >
          {(close) => (
            <div className="p-1.5">
              <MenuItem icon={User} onClick={() => { nav(`/profile/${f.id}`); close() }}>查看个人资料</MenuItem>
              <MenuItem icon={Star} onClick={() => { toggleFav(f.id); close() }}>{f.favorite ? '取消收藏' : '添加到收藏'}</MenuItem>
              {running && f.status !== 'offline' && (
                <MenuItem icon={Gamepad2} onClick={() => { sendInvite(f.id, running.gameId); close() }}>邀请加入游戏</MenuItem>
              )}
              <MenuItem icon={UserMinus} danger onClick={() => {
                close()
                useStore.getState().ask({ title: `移除好友 ${f.name}？`, body: '移除后你们将不再能看到彼此的在线状态。', confirmLabel: '移除', danger: true, onConfirm: () => useStore.getState().removeFriend(f.id) })
              }}>移除好友</MenuItem>
            </div>
          )}
        </Popover>
      </div>
    </div>
  )
}

function Group({ title, list, defaultOpen = true }: { title: string; list: Friend[]; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  if (!list.length) return null
  return (
    <div className="mb-1">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center gap-1.5 px-2 py-1.5 text-[11px] font-semibold tracking-wider text-fg-3 uppercase hover:text-fg-2">
        <ChevronDown size={12} className={cn('transition', !open && '-rotate-90')} />
        {title}
        <span className="text-fg-4">({list.length})</span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            {list.map((f) => <FriendRow key={f.id} f={f} compact />)}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function FriendsPanel() {
  const open = usePanelVisible()
  const me = useStore((s) => s.me)
  const running = useStore((s) => s.running)
  const set = useStore((s) => s.set)
  const setStatus = useStore((s) => s.setStatus)
  const requests = useStore((s) => s.requests.length)
  const nav = useNavigate()
  const [q, setQ] = useState('')
  const g = useGroupedFriends(q)
  const myStatus: AnyStatus = me.status === 'online' && running ? 'ingame' : me.status

  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.aside
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 272, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 40 }}
          className="relative z-20 shrink-0 overflow-hidden border-l hairline bg-ink-2/60"
        >
          <div className="flex h-full w-[272px] flex-col">
            <div className="flex items-center gap-2.5 border-b hairline p-3">
              <button onClick={() => nav('/profile')}><Avatar seed={me.avatarSeed} name={me.name} size={38} status={myStatus} /></button>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13.5px] font-semibold">{me.name}</div>
                <Popover
                  align="left"
                  width={170}
                  trigger={(_, toggle) => (
                    <button onClick={toggle} className={cn('flex items-center gap-1 text-[11.5px]', myStatus === 'ingame' ? 'text-ingame' : myStatus === 'online' ? 'text-online' : myStatus === 'away' ? 'text-away' : 'text-fg-3')}>
                      {running && me.status === 'online' ? `正在玩 ${gameMap[running.gameId].title}` : statusText[myStatus]}
                      <ChevronDown size={11} />
                    </button>
                  )}
                >
                  {(close) => (
                    <div className="p-1.5">
                      {(['online', 'away', 'invisible'] as const).map((st) => (
                        <MenuItem key={st} active={me.status === st} onClick={() => { setStatus(st); close() }}>{statusText[st]}</MenuItem>
                      ))}
                    </div>
                  )}
                </Popover>
              </div>
              <IconButton icon={PanelRightClose} label="收起好友栏" size={30} onClick={() => set({ friendsPanel: false })} />
            </div>
            <div className="flex items-center gap-1.5 p-3 pb-2">
              <div className="relative flex-1">
                <Search size={13} className="absolute top-1/2 left-2.5 -translate-y-1/2 text-fg-3" />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="搜索好友" className="input h-8 pl-8 text-[12.5px]" />
              </div>
              <IconButton icon={UserPlus} label="添加好友" size={32} badge={requests || undefined} onClick={() => set({ addFriendOpen: true })} />
            </div>
            <div className="scroll-area flex-1 px-1.5 pb-3">
              {g.total === 0 ? (
                <div className="px-4 py-10 text-center text-xs text-fg-3">没有找到匹配 “{q}” 的好友</div>
              ) : (
                <>
                  <Group title="收藏" list={g.fav} />
                  <Group title="游戏中" list={g.ingame} />
                  <Group title="在线" list={g.online} />
                  <Group title="离线" list={g.offline} defaultOpen={false} />
                </>
              )}
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}
