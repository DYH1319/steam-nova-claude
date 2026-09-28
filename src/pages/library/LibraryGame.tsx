import { AnimatePresence, motion } from 'motion/react'
import {
  CircleStop, Cloud, Download, FolderOpen, Gamepad2, Info, Loader2, Pause, Play, RefreshCw, Settings, ShieldCheck, Star, Store, Trash2, Trophy,
} from 'lucide-react'
import { useMemo } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { AchievementIcon } from '@/components/art/AchievementIcon'
import { Avatar } from '@/components/art/Avatar'
import { GameArt, GameLogo } from '@/components/art/GameArt'
import { Page } from '@/components/Page'
import { Button, EmptyState, IconButton, MenuItem, Popover, Progress, Ring, SectionHeader, Skeleton } from '@/components/ui'
import { getAchievements } from '@/data/achievements'
import { gameMap } from '@/data/games'
import { friendPlaytime, friendsWhoOwn, getNews } from '@/data/social'
import { useFakeLoad, useNow } from '@/lib/hooks'
import { useStore } from '@/store'
import { cn, formatDate, formatDuration, formatHours, formatSize, formatSpeed, timeAgo } from '@/lib/utils'

function ActionButton({ id }: { id: string }) {
  const own = useStore((s) => s.owned[id])
  const dl = useStore((s) => s.downloads.find((d) => d.gameId === id))
  const running = useStore((s) => (s.running?.gameId === id ? s.running : null))
  const other = useStore((s) => (s.running && s.running.gameId !== id ? s.running : null))
  const speed = useStore((s) => s.speed)
  const { launch, stop, set, pauseDownload, resumeDownload } = useStore()
  const now = useNow(1000)

  if (running?.phase === 'launching')
    return <Button variant="play" size="xl" disabled className="min-w-[200px] !opacity-90"><Loader2 size={22} className="animate-spin" />正在启动…</Button>
  if (running)
    return (
      <div className="flex items-center gap-4">
        <Button variant="danger" size="xl" icon={CircleStop} onClick={stop} className="min-w-[200px]">停止</Button>
        <div>
          <div className="flex items-center gap-2 text-[13px] font-semibold text-ingame"><span className="h-2 w-2 animate-pulse rounded-full bg-ingame" />正在运行</div>
          <div className="text-xs text-fg-3 tabular-nums">本次会话 {formatDuration((now - running.startedAt) / 1000)}</div>
        </div>
      </div>
    )
  if (dl) {
    const pct = (dl.done / dl.total) * 100
    return (
      <div className="flex items-center gap-4">
        {dl.status === 'downloading' ? (
          <Button variant="secondary" size="xl" icon={Pause} onClick={() => pauseDownload(id)} className="min-w-[200px]">暂停</Button>
        ) : (
          <Button variant="primary" size="xl" icon={Download} onClick={() => resumeDownload(id)} className="min-w-[200px]">{dl.status === 'paused' ? '继续下载' : '立即下载'}</Button>
        )}
        <div className="w-64">
          <div className="flex justify-between text-[12.5px]">
            <span className={cn('font-semibold', dl.status === 'downloading' ? 'text-nova' : 'text-fg-2')}>{dl.status === 'downloading' ? (dl.kind === 'update' ? '更新中' : '下载中') : dl.status === 'paused' ? '已暂停' : '排队中'} · {pct.toFixed(1)}%</span>
            {dl.status === 'downloading' && <span className="text-fg-3 tabular-nums">{formatSpeed(speed)}</span>}
          </div>
          <Progress value={pct} className="mt-2" striped={dl.status === 'downloading'} tone={dl.status === 'downloading' ? 'nova' : 'muted'} />
          <div className="mt-1.5 text-[11px] text-fg-3 tabular-nums">{formatSize(dl.done)} / {formatSize(dl.total)}{dl.status === 'downloading' && ` · 剩余 ${formatDuration((dl.total - dl.done) / Math.max(1, speed))}`}</div>
        </div>
      </div>
    )
  }
  if (own.installed)
    return (
      <Button variant="play" size="xl" icon={Play} disabled={!!other} title={other ? '另一款游戏正在运行' : ''} onClick={() => launch(id)} className="min-w-[200px]">
        开始游戏
      </Button>
    )
  return <Button variant="primary" size="xl" icon={Download} onClick={() => set({ installTarget: id })} className="min-w-[200px]">安装</Button>
}

export default function LibraryGame() {
  const { id = '' } = useParams()
  const g = gameMap[id]
  const own = useStore((s) => s.owned[id])
  const friends = useStore((s) => s.friends)
  const { toggleFavorite, uninstallGame, ask, toast, set } = useStore()
  const loading = useFakeLoad(id, 420)
  const nav = useNavigate()
  const achs = useMemo(() => (g ? getAchievements(g.id) : []), [g])
  const news = useMemo(() => (g ? getNews(g.id) : []), [g])

  if (!g || !own) return <EmptyState icon={Gamepad2} title="你的游戏库中没有这款游戏" action={<Link to="/library"><Button variant="primary">返回游戏库</Button></Link>} />

  const unlocked = achs.filter((a) => own.unlocked[a.id]).sort((a, b) => own.unlocked[b.id] - own.unlocked[a.id])
  const locked = achs.filter((a) => !own.unlocked[a.id])
  const pct = achs.length ? (unlocked.length / achs.length) * 100 : 0
  const fOwn = friendsWhoOwn(friends, g.id).sort((a, b) => Number(b.gameId === g.id) - Number(a.gameId === g.id))

  return (
    <Page>
      <div className="relative h-[380px] overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div key={g.id} initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }} className="absolute inset-0">
            <GameArt game={g} className="h-full w-full" />
          </motion.div>
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-ink-1 via-ink-1/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
        <motion.div key={g.id + 'logo'} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.5 }} className="absolute bottom-10 left-8 max-w-[60%]">
          <GameLogo game={g} className="text-[64px]" />
        </motion.div>
      </div>

      <div className="sticky top-0 z-20 border-b hairline bg-ink-1/85 backdrop-blur-xl">
        <div className="flex items-center gap-8 px-8 py-4">
          <ActionButton id={g.id} />
          <div className="flex items-center gap-8 text-[12px]">
            <div>
              <div className="text-fg-3">上次运行</div>
              <div className="mt-0.5 text-[13.5px] font-semibold">{own.lastPlayed ? timeAgo(own.lastPlayed) : '从未'}</div>
            </div>
            <div>
              <div className="text-fg-3">游戏时间</div>
              <div className="mt-0.5 text-[13.5px] font-semibold">{formatHours(own.playtime)}</div>
            </div>
            <Link to={`/achievements/${g.id}`} className="group">
              <div className="text-fg-3 group-hover:text-fg-2">成就</div>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-[13.5px] font-semibold tabular-nums">{unlocked.length}/{achs.length}</span>
                <Progress value={pct} className="w-20" tone={pct === 100 ? 'gold' : 'nova'} />
              </div>
            </Link>
            <div className="flex items-center gap-1.5 text-fg-3"><Cloud size={14} className="text-online" />云存档已同步</div>
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-1">
            <IconButton icon={Store} label="商店页面" onClick={() => nav(`/game/${g.id}`)} />
            <IconButton icon={Star} label={own.favorite ? '取消收藏' : '收藏'} onClick={() => toggleFavorite(g.id)} className={own.favorite ? 'text-gold hover:text-gold' : ''} />
            <Popover
              width={220}
              trigger={(open, toggle) => <IconButton icon={Settings} label="管理" active={open} onClick={toggle} />}
            >
              {(close) => (
                <div className="p-1.5">
                  <MenuItem icon={Info} onClick={() => { nav(`/game/${g.id}`); close() }}>属性与商店页面</MenuItem>
                  <MenuItem icon={Star} onClick={() => { toggleFavorite(g.id); close() }}>{own.favorite ? '从收藏中移除' : '添加到收藏'}</MenuItem>
                  {own.installed && (
                    <>
                      <MenuItem icon={FolderOpen} onClick={() => { toast({ kind: 'info', title: '已打开本地文件', body: `D:\\NovaLibrary\\common\\${g.title}` }); close() }}>浏览本地文件</MenuItem>
                      <MenuItem icon={ShieldCheck} onClick={() => { close(); toast({ kind: 'info', title: '正在验证游戏文件完整性…', gameId: g.id }, 2000); setTimeout(() => toast({ kind: 'success', title: '所有文件均已验证', body: g.title }), 2200) }}>验证游戏文件完整性</MenuItem>
                      <div className="my-1 h-px bg-white/[0.06]" />
                      <MenuItem icon={Trash2} danger onClick={() => { close(); ask({ title: `卸载 ${g.title}？`, body: `这将从本地磁盘删除所有游戏文件（${formatSize(g.sizeMB)}）。云存档不受影响。`, confirmLabel: '卸载', danger: true, onConfirm: () => uninstallGame(g.id) }) }}>卸载</MenuItem>
                    </>
                  )}
                  {!own.installed && <MenuItem icon={Download} onClick={() => { set({ installTarget: g.id }); close() }}>安装</MenuItem>}
                </div>
              )}
            </Popover>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-[1fr_340px] gap-8 px-8 py-8">
          <div className="space-y-4">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-36 rounded-2xl" />)}</div>
          <div className="space-y-4"><Skeleton className="h-56 rounded-2xl" /><Skeleton className="h-40 rounded-2xl" /></div>
        </div>
      ) : (
        <div className="grid grid-cols-[1fr_340px] gap-8 px-8 py-8">
          <div className="min-w-0 space-y-8">
            <section>
              <SectionHeader title="动态" subtitle="来自开发者的最新消息" />
              <div className="space-y-3">
                {news.map((n, k) => (
                  <article key={n.id} className="group flex gap-5 overflow-hidden rounded-2xl bg-ink-2 p-3 ring-1 ring-white/[0.05] transition hover:ring-white/10">
                    <GameArt game={g} variant={k + 2} grain={false} className="aspect-[16/10] w-52 shrink-0 rounded-xl" />
                    <div className="min-w-0 py-1 pr-3">
                      <div className="flex items-center gap-2 text-[11px]">
                        <span className={cn('rounded-md px-1.5 py-0.5 font-semibold', n.kind === '更新' ? 'bg-online/15 text-online' : n.kind === '活动' ? 'bg-nova/15 text-nova' : 'bg-white/[0.07] text-fg-2')}>{n.kind}</span>
                        <span className="text-fg-3">{timeAgo(n.at)}</span>
                      </div>
                      <h3 className="mt-2 text-[15px] font-semibold group-hover:text-nova-soft">{n.title}</h3>
                      <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-fg-3">{n.body}</p>
                    </div>
                  </article>
                ))}
              </div>
            </section>
            <section>
              <SectionHeader title="截图" subtitle="你在游戏中截取的精彩瞬间" action={<span className="text-xs text-fg-3">按 F12 截图</span>} />
              <div className="grid grid-cols-4 gap-3">
                {[1, 3, 4, 6].map((v) => <GameArt key={v} game={g} variant={v} grain={false} className="aspect-[16/9] cursor-zoom-in rounded-xl ring-1 ring-white/[0.05] transition hover:ring-white/20" />)}
              </div>
            </section>
          </div>

          <aside className="space-y-5">
            <Link to={`/achievements/${g.id}`} className="block rounded-2xl bg-ink-2 p-5 ring-1 ring-white/[0.05] transition hover:ring-white/10">
              <div className="flex items-center gap-4">
                <Ring value={pct} size={64} stroke={6} color={pct === 100 ? '#ffcf5a' : undefined}>
                  <span className="text-[13px] font-bold tabular-nums">{Math.round(pct)}%</span>
                </Ring>
                <div>
                  <div className="flex items-center gap-2 text-sm font-semibold"><Trophy size={15} className="text-gold" />成就</div>
                  <div className="mt-0.5 text-xs text-fg-3">已解锁 {unlocked.length} / {achs.length}</div>
                </div>
              </div>
              {unlocked.length > 0 && (
                <>
                  <div className="mt-5 mb-2 text-[11px] font-semibold tracking-wider text-fg-3 uppercase">最近解锁</div>
                  <div className="space-y-2.5">
                    {unlocked.slice(0, 3).map((a) => (
                      <div key={a.id} className="flex items-center gap-3">
                        <AchievementIcon a={a} unlocked size={36} />
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-[13px] font-medium">{a.name}</div>
                          <div className="text-[11px] text-fg-3">{timeAgo(own.unlocked[a.id])} · {a.rarity}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
              {locked.length > 0 && (
                <div className="mt-4 flex gap-1.5">
                  {locked.slice(0, 6).map((a) => <AchievementIcon key={a.id} a={a} unlocked={false} size={34} hideSecret={a.hidden} />)}
                  {locked.length > 6 && <span className="flex h-[34px] w-[34px] items-center justify-center rounded-lg bg-white/[0.05] text-[11px] font-semibold text-fg-3">+{locked.length - 6}</span>}
                </div>
              )}
            </Link>

            {fOwn.length > 0 && (
              <div className="rounded-2xl bg-ink-2 p-5 ring-1 ring-white/[0.05]">
                <div className="mb-3 text-sm font-semibold">玩过的好友 <span className="font-normal text-fg-3">· {fOwn.length}</span></div>
                <div className="space-y-2.5">
                  {fOwn.slice(0, 6).map((f) => (
                    <Link key={f.id} to={`/profile/${f.id}`} className="flex items-center gap-3">
                      <Avatar seed={f.id} name={f.name} size={32} status={f.status} />
                      <div className="min-w-0 flex-1">
                        <div className={cn('truncate text-[13px] font-medium', f.gameId === g.id && 'text-ingame')}>{f.name}</div>
                        <div className="text-[11px] text-fg-3">{f.gameId === g.id ? `正在玩 · ${f.rich ?? ''}` : `总时数 ${formatHours(friendPlaytime(f.id, g.id))}`}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-2xl bg-ink-2 p-5 ring-1 ring-white/[0.05]">
              <div className="mb-3 text-sm font-semibold">游戏信息</div>
              <dl className="space-y-2 text-[12.5px]">
                {[
                  ['开发商', g.developer],
                  ['发行日期', formatDate(g.release)],
                  ['添加到游戏库', formatDate(own.addedAt)],
                  ['本地占用', own.installed ? formatSize(g.sizeMB) : '未安装'],
                  ['安装位置', own.installed ? 'D:\\NovaLibrary' : '—'],
                ].map(([k, v]) => <div key={k} className="flex justify-between gap-3"><dt className="text-fg-3">{k}</dt><dd className="truncate text-right text-fg-2">{v}</dd></div>)}
              </dl>
              {own.installed && (
                <Button variant="ghost" size="sm" icon={RefreshCw} className="mt-3 w-full" onClick={() => toast({ kind: 'success', title: `${g.title} 已是最新版本` })}>检查更新</Button>
              )}
            </div>
          </aside>
        </div>
      )}
    </Page>
  )
}
