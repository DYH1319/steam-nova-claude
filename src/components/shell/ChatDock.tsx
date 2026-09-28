import { AnimatePresence, motion } from 'motion/react'
import { Gamepad2, Minus, Send, Smile, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { Avatar } from '@/components/art/Avatar'
import { GameArt } from '@/components/art/GameArt'
import { friendSubline, usePanelVisible } from '@/components/shell/friends-utils'
import { Button, IconButton } from '@/components/ui'
import { gameMap } from '@/data/games'
import type { ChatMessage } from '@/data/social'
import { useStore } from '@/store'
import { cn, formatClock } from '@/lib/utils'

const EMOJI = ['😂', '👍', '🔥', '😭', '🎮', '❤️', 'gg', '🙏']

function InviteCard({ m, mine }: { m: ChatMessage; mine: boolean }) {
  const g = gameMap[m.gameId!]
  const owned = useStore((s) => s.owned[g.id])
  const launch = useStore((s) => s.launch)
  const nav = useNavigate()
  return (
    <div className="w-60 overflow-hidden rounded-xl border hairline bg-ink-3">
      <GameArt game={g} title="landscape" className="aspect-[16/7]" />
      <div className="p-3">
        <div className="text-[11px] font-semibold tracking-wider text-fg-3 uppercase">{mine ? '你发送了游戏邀请' : '邀请你一起玩'}</div>
        <div className="mt-0.5 text-[13px] font-medium">{g.title}</div>
        {!mine && (
          <Button size="xs" variant={owned?.installed ? 'play' : 'secondary'} className="mt-2.5 w-full" onClick={() => (owned?.installed ? launch(g.id) : nav(owned ? `/library/${g.id}` : `/game/${g.id}`))}>
            {owned?.installed ? '加入游戏' : owned ? '安装后加入' : '查看商店页面'}
          </Button>
        )}
      </div>
    </div>
  )
}

export function ChatDock() {
  const s = useStore()
  const { openChats, activeChat, chatMinimized, friends, chats, typing, running } = s
  const friendsPanel = usePanelVisible()
  const [text, setText] = useState('')
  const [emoji, setEmoji] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)
  const f = friends.find((x) => x.id === activeChat)
  const msgs = (activeChat && chats[activeChat]) || []
  const nav = useNavigate()

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs.length, activeChat, typing[activeChat ?? ''], chatMinimized])

  const send = () => {
    if (!text.trim() || !activeChat) return
    s.sendMessage(activeChat, text.trim())
    setText('')
    setEmoji(false)
  }

  return (
    <AnimatePresence>
      {openChats.length > 0 && f && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0, height: chatMinimized ? 46 : 500 }}
          exit={{ opacity: 0, y: 30 }}
          transition={{ type: 'spring', stiffness: 420, damping: 38 }}
          className="fixed bottom-12 z-50 flex w-[372px] flex-col overflow-hidden rounded-2xl border hairline bg-ink-2 shadow-pop"
          style={{ right: friendsPanel ? 288 : 16 }}
        >
          <div className="flex h-[46px] shrink-0 items-center gap-1 border-b hairline bg-ink-3/60 pr-1.5 pl-2">
            <div className="no-scrollbar flex min-w-0 flex-1 gap-1 overflow-x-auto">
              {openChats.map((id) => {
                const fr = friends.find((x) => x.id === id)
                if (!fr) return null
                const on = id === activeChat
                return (
                  <button
                    key={id}
                    onClick={() => s.openChat(id)}
                    className={cn('group flex h-8 shrink-0 items-center gap-2 rounded-lg pr-1.5 pl-1 text-[12.5px] transition', on ? 'bg-white/[0.08] text-fg' : 'text-fg-3 hover:bg-white/[0.04] hover:text-fg-2')}
                  >
                    <Avatar seed={fr.id} name={fr.name} size={22} status={fr.status} />
                    <span className="max-w-[80px] truncate">{fr.name}</span>
                    {!!s.unread[id] && !on && <span className="h-1.5 w-1.5 rounded-full bg-nova" />}
                    <span onClick={(e) => { e.stopPropagation(); s.closeChat(id) }} className="rounded p-0.5 opacity-0 transition group-hover:opacity-100 hover:bg-white/10"><X size={11} /></span>
                  </button>
                )
              })}
            </div>
            <IconButton icon={Minus} label={chatMinimized ? '展开' : '最小化'} size={28} onClick={() => s.set({ chatMinimized: !chatMinimized })} />
            <IconButton icon={X} label="关闭全部" size={28} onClick={() => s.set({ openChats: [], activeChat: null })} />
          </div>
          {!chatMinimized && (
            <>
              <div className="flex items-center gap-3 border-b hairline px-4 py-2.5">
                <button onClick={() => nav(`/profile/${f.id}`)}><Avatar seed={f.id} name={f.name} size={34} status={f.status} /></button>
                <div className="min-w-0 flex-1">
                  <div className="text-[13.5px] font-semibold">{f.name}</div>
                  <div className={cn('truncate text-[11.5px]', f.status === 'ingame' ? 'text-ingame' : 'text-fg-3')}>
                    {friendSubline(f)}{f.rich && f.status === 'ingame' ? ` · ${f.rich}` : ''}
                  </div>
                </div>
                {running && f.status !== 'offline' && (
                  <Button size="xs" variant="secondary" icon={Gamepad2} onClick={() => s.sendInvite(f.id, running.gameId)}>邀请</Button>
                )}
              </div>
              <div className="scroll-area flex-1 space-y-2.5 px-4 py-4">
                {msgs.length === 0 && (
                  <div className="py-10 text-center text-xs text-fg-3">这是你和 {f.name} 聊天的开始。<br />打个招呼吧 👋</div>
                )}
                {msgs.map((m, i) => {
                  const mine = m.from === 'me'
                  const showTime = i === 0 || m.at - msgs[i - 1].at > 10 * 60 * 1000
                  return (
                    <div key={m.id}>
                      {showTime && <div className="my-2 text-center text-[10.5px] text-fg-4">{formatClock(m.at)}</div>}
                      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className={cn('flex', mine ? 'justify-end' : 'justify-start')}>
                        {m.kind === 'invite' ? (
                          <InviteCard m={m} mine={mine} />
                        ) : (
                          <div className={cn('max-w-[78%] rounded-2xl px-3.5 py-2 text-[13px] leading-relaxed', mine ? 'nova-gradient rounded-br-md text-white' : 'rounded-bl-md bg-white/[0.07] text-fg')}>{m.text}</div>
                        )}
                      </motion.div>
                    </div>
                  )
                })}
                {typing[f.id] && (
                  <div className="flex items-center gap-1 rounded-2xl rounded-bl-md bg-white/[0.07] px-3.5 py-3 w-fit">
                    {[0, 1, 2].map((i) => <motion.span key={i} className="h-1.5 w-1.5 rounded-full bg-fg-2" animate={{ opacity: [0.3, 1, 0.3], y: [0, -2, 0] }} transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }} />)}
                  </div>
                )}
                <div ref={endRef} />
              </div>
              <div className="relative border-t hairline p-3">
                <AnimatePresence>
                  {emoji && (
                    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} className="absolute bottom-full left-3 mb-2 flex gap-1 rounded-xl bg-ink-4 p-1.5 shadow-pop">
                      {EMOJI.map((e) => <button key={e} onClick={() => setText((t) => t + e)} className="h-8 min-w-8 rounded-lg px-1 text-base hover:bg-white/10">{e}</button>)}
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className="flex items-center gap-2">
                  <IconButton icon={Smile} label="表情" size={32} active={emoji} onClick={() => setEmoji(!emoji)} />
                  <input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && send()}
                    placeholder={f.status === 'offline' ? `${f.name} 当前离线，消息将在上线后送达` : `发消息给 ${f.name}`}
                    className="input h-9 flex-1"
                    autoFocus
                  />
                  <button onClick={send} disabled={!text.trim()} aria-label="发送" className="nova-gradient flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white transition disabled:opacity-30">
                    <Send size={15} />
                  </button>
                </div>
              </div>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
