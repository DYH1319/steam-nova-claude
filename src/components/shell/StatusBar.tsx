import { Download, MessageSquare, Pause, Play, Plus } from 'lucide-react'
import { Link } from 'react-router'
import { gameMap } from '@/data/games'
import { MiniCover } from '@/components/game'
import { Progress } from '@/components/ui'
import { useActiveDownload, useStore } from '@/store'
import { cn, formatDuration, formatSize, formatSpeed } from '@/lib/utils'

export function StatusBar() {
  const active = useActiveDownload()
  const downloads = useStore((s) => s.downloads)
  const speed = useStore((s) => s.speed)
  const friends = useStore((s) => s.friends)
  const panel = useStore((s) => s.friendsPanel)
  const unread = useStore((s) => Object.values(s.unread).reduce((a, b) => a + b, 0))
  const running = useStore((s) => s.running)
  const set = useStore((s) => s.set)
  const pauseDownload = useStore((s) => s.pauseDownload)
  const resumeAll = useStore((s) => s.resumeAll)
  const online = friends.filter((f) => f.status !== 'offline').length
  const g = active && gameMap[active.gameId]

  return (
    <footer className="relative z-30 flex h-10 shrink-0 items-center gap-4 border-t hairline bg-ink-0 px-3 text-[12px] text-fg-3">
      <Link to="/store/browse" className="flex items-center gap-1.5 rounded-md px-2 py-1 transition hover:bg-white/[0.05] hover:text-fg">
        <Plus size={14} /> 添加游戏
      </Link>
      {running && (
        <Link to={`/library/${running.gameId}`} className="flex items-center gap-2 rounded-md bg-ingame/10 px-2 py-1 text-ingame">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-ingame" />
          {running.phase === 'launching' ? '正在启动' : '正在运行'} · {gameMap[running.gameId].title}
        </Link>
      )}
      <div className="flex flex-1 justify-center">
        <div className="group flex w-[440px] items-center gap-3 rounded-lg px-2 py-1 transition hover:bg-white/[0.04]">
          {g && active ? (
            <>
              <MiniCover game={g} className="h-6 w-10 shrink-0" />
              <Link to="/downloads" className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-fg-2">{active.kind === 'update' ? '正在更新' : '正在下载'} <span className="text-fg">{g.title}</span></span>
                  <span className="shrink-0 tabular-nums">{formatSpeed(speed)} · {formatDuration((active.total - active.done) / Math.max(1, speed))}</span>
                </div>
                <Progress value={(active.done / active.total) * 100} className="mt-1 h-1" striped />
              </Link>
              <button aria-label="暂停" onClick={() => pauseDownload(active.gameId)} className="rounded p-1 text-fg-3 hover:bg-white/10 hover:text-fg"><Pause size={13} /></button>
            </>
          ) : downloads.length ? (
            <>
              <Download size={14} />
              <Link to="/downloads" className="flex-1 text-center hover:text-fg">下载已暂停 · 队列中还有 {downloads.length} 项</Link>
              <button aria-label="继续" onClick={resumeAll} className="rounded p-1 text-fg-3 hover:bg-white/10 hover:text-fg"><Play size={13} /></button>
            </>
          ) : (
            <Link to="/downloads" className="flex flex-1 items-center justify-center gap-2 hover:text-fg"><Download size={14} /> 管理下载 · 所有游戏均为最新</Link>
          )}
        </div>
      </div>
      <span className="hidden tabular-nums lg:block">{active ? `${formatSize(active.done)} / ${formatSize(active.total)}` : ''}</span>
      <button onClick={() => set({ friendsPanel: !panel })} className={cn('flex items-center gap-2 rounded-md px-2.5 py-1 transition hover:bg-white/[0.06] hover:text-fg', panel && 'text-fg')}>
        <MessageSquare size={14} />
        好友与聊天
        <span className="flex items-center gap-1 text-online"><span className="h-1.5 w-1.5 rounded-full bg-online" />{online}</span>
        {unread > 0 && <span className="rounded-full bg-nova px-1.5 text-[10px] font-bold leading-4 text-white">{unread}</span>}
      </button>
    </footer>
  )
}
