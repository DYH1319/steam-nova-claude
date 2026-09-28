import { AnimatePresence, motion } from 'motion/react'
import { ArrowDown, ArrowUp, CircleCheck, Download, Gauge, HardDrive, Pause, Play, X } from 'lucide-react'
import { Link, useNavigate } from 'react-router'
import { GameArt } from '@/components/art/GameArt'
import { MiniCover } from '@/components/game'
import { Page } from '@/components/Page'
import { Button, EmptyState, IconButton, Progress, SectionHeader, Select } from '@/components/ui'
import { gameMap } from '@/data/games'
import { useActiveDownload, useStore, type DownloadItem } from '@/store'
import { cn, formatDuration, formatSize, formatSpeed, timeAgo } from '@/lib/utils'

function SpeedGraph() {
  const hist = useStore((s) => s.speedHistory)
  const speed = useStore((s) => s.speed)
  const W = 600, H = 150
  const max = Math.max(160, ...hist) * 1.1
  const pts = hist.map((v, i) => [(i / (hist.length - 1)) * W, H - (v / max) * H] as const)
  const line = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
  const nz = hist.filter((v) => v > 0)
  const peak = Math.max(0, ...hist)
  const avg = nz.length ? nz.reduce((a, b) => a + b, 0) / nz.length : 0
  return (
    <div className="flex h-full flex-col rounded-2xl bg-ink-2 p-5 ring-1 ring-white/[0.05]">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-fg-3"><Gauge size={13} />网络使用情况</div>
          <div className="mt-1 font-display text-3xl font-bold tabular-nums">{formatSpeed(speed)}</div>
        </div>
        <div className="grid grid-cols-2 gap-x-5 text-right text-[11px]">
          <span className="text-fg-3">峰值</span><span className="text-fg-3">平均</span>
          <span className="font-semibold text-fg-2 tabular-nums">{formatSpeed(peak)}</span>
          <span className="font-semibold text-fg-2 tabular-nums">{formatSpeed(avg)}</span>
        </div>
      </div>
      <div className="relative mt-4 flex-1">
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible">
          <defs>
            <linearGradient id="spd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ff6a3d" stopOpacity="0.45" /><stop offset="1" stopColor="#ff6a3d" stopOpacity="0" /></linearGradient>
            <linearGradient id="spdl" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#ffb347" /><stop offset="1" stopColor="#ff2e7e" /></linearGradient>
          </defs>
          {[0.25, 0.5, 0.75].map((f) => <line key={f} x1="0" x2={W} y1={H * f} y2={H * f} stroke="white" strokeOpacity="0.05" strokeDasharray="4 6" vectorEffect="non-scaling-stroke" />)}
          <path d={`${line} L${W},${H} L0,${H} Z`} fill="url(#spd)" style={{ transition: 'd 0.9s linear' }} />
          <path d={line} fill="none" stroke="url(#spdl)" strokeWidth="2" vectorEffect="non-scaling-stroke" style={{ transition: 'd 0.9s linear' }} />
        </svg>
      </div>
      <div className="mt-2 flex justify-between text-[10px] text-fg-4"><span>60 秒前</span><span>现在</span></div>
    </div>
  )
}

function ActiveCard({ d }: { d: DownloadItem }) {
  const g = gameMap[d.gameId]
  const speed = useStore((s) => s.speed)
  const pause = useStore((s) => s.pauseDownload)
  const pct = (d.done / d.total) * 100
  return (
    <div className="relative flex overflow-hidden rounded-2xl bg-ink-2 ring-1 ring-white/[0.05]">
      <div className="pointer-events-none absolute inset-0 opacity-25"><GameArt game={g} variant={2} grain={false} className="h-full w-full blur-2xl" /></div>
      <Link to={`/library/${g.id}`} className="relative w-[260px] shrink-0"><GameArt game={g} title="portrait" className="h-full w-full" /></Link>
      <div className="relative flex flex-1 flex-col p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-bold tracking-[0.14em] text-nova uppercase"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-nova" />{d.kind === 'update' ? '正在更新' : '正在下载'}</div>
            <Link to={`/library/${g.id}`} className="mt-1.5 block font-display text-2xl font-bold hover:text-nova-soft">{g.title}</Link>
            <div className="mt-1 text-[13px] text-fg-3">{g.developer}</div>
          </div>
          <Button variant="secondary" icon={Pause} onClick={() => pause(g.id)}>暂停</Button>
        </div>
        <div className="mt-auto">
          <div className="mb-2 flex items-end justify-between">
            <span className="font-display text-4xl font-bold tabular-nums">{pct.toFixed(1)}<span className="text-xl text-fg-3">%</span></span>
            <span className="text-[13px] text-fg-2 tabular-nums">剩余 {formatDuration((d.total - d.done) / Math.max(1, speed))}</span>
          </div>
          <Progress value={pct} className="h-2.5" striped />
          <div className="mt-4 grid grid-cols-4 gap-4 text-[12px]">
            {[
              ['已下载', `${formatSize(d.done)} / ${formatSize(d.total)}`],
              ['当前速度', formatSpeed(speed)],
              ['磁盘写入', formatSpeed(speed * 1.8)],
              ['安装位置', 'D:\\NovaLibrary'],
            ].map(([k, v]) => <div key={k}><div className="text-fg-3">{k}</div><div className="mt-0.5 font-semibold text-fg-2 tabular-nums">{v}</div></div>)}
          </div>
        </div>
      </div>
    </div>
  )
}

function QueueRow({ d, index, total }: { d: DownloadItem; index: number; total: number }) {
  const g = gameMap[d.gameId]
  const { moveDownload, resumeDownload, pauseDownload, removeDownload, ask } = useStore()
  const pct = (d.done / d.total) * 100
  return (
    <motion.div layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }} className="group flex items-center gap-4 rounded-xl bg-ink-2 p-2.5 pr-4 ring-1 ring-white/[0.04] transition hover:ring-white/10">
      <div className="flex flex-col">
        <button disabled={index === 0} onClick={() => moveDownload(d.gameId, -1)} className="rounded p-0.5 text-fg-3 hover:bg-white/10 hover:text-fg disabled:opacity-20" aria-label="上移"><ArrowUp size={13} /></button>
        <button disabled={index === total - 1} onClick={() => moveDownload(d.gameId, 1)} className="rounded p-0.5 text-fg-3 hover:bg-white/10 hover:text-fg disabled:opacity-20" aria-label="下移"><ArrowDown size={13} /></button>
      </div>
      <MiniCover game={g} className="aspect-[16/9] w-32 shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <Link to={`/library/${g.id}`} className="truncate text-[14px] font-medium hover:text-nova-soft">{g.title}</Link>
          <span className={cn('rounded px-1.5 py-0.5 text-[10px] font-semibold', d.kind === 'update' ? 'bg-online/15 text-online' : 'bg-white/[0.07] text-fg-2')}>{d.kind === 'update' ? '更新' : '安装'}</span>
        </div>
        <div className="mt-2 flex items-center gap-3">
          <Progress value={pct} tone="muted" className="h-1 max-w-[260px] flex-1" />
          <span className="text-[11.5px] text-fg-3 tabular-nums">{formatSize(d.done)} / {formatSize(d.total)}</span>
        </div>
      </div>
      <span className={cn('w-16 text-right text-[12px]', d.status === 'paused' ? 'text-away' : 'text-fg-3')}>{d.status === 'paused' ? '已暂停' : '排队中'}</span>
      <div className="flex items-center gap-0.5">
        <IconButton icon={Play} label="立即开始" onClick={() => resumeDownload(d.gameId)} />
        {d.status === 'queued' && <IconButton icon={Pause} label="暂停" onClick={() => pauseDownload(d.gameId)} />}
        <IconButton icon={X} label="移出队列" onClick={() => ask({ title: `取消下载 ${g.title}？`, body: d.done > 0 ? `已下载的 ${formatSize(d.done)} 数据将被删除。` : '该项目将被移出下载队列。', confirmLabel: '取消下载', danger: true, onConfirm: () => removeDownload(d.gameId) })} />
      </div>
    </motion.div>
  )
}

export default function Downloads() {
  const downloads = useStore((s) => s.downloads)
  const completed = useStore((s) => s.completed)
  const owned = useStore((s) => s.owned)
  const limit = useStore((s) => s.bandwidthLimit)
  const { set, pauseAll, resumeAll, clearCompleted, launch } = useStore()
  const active = useActiveDownload()
  const queue = downloads.filter((d) => d !== active)
  const nav = useNavigate()
  const remaining = downloads.reduce((s, d) => s + d.total - d.done, 0)

  return (
    <Page inner="mx-auto max-w-[1240px] space-y-8 px-8 py-7">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">下载</h1>
          <p className="mt-1 text-[13px] text-fg-3">{downloads.length ? `${downloads.length} 个项目 · 剩余 ${formatSize(remaining)}` : '所有游戏均为最新版本'}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-lg bg-white/[0.03] px-3 py-1.5 text-xs text-fg-3"><HardDrive size={13} />D: 可用 1.21 TB</div>
          <Select<string>
            label="限速"
            value={String(limit ?? 'none')}
            onChange={(v) => set({ bandwidthLimit: v === 'none' ? null : Number(v) })}
            options={[{ value: 'none', label: '无限制' }, { value: '100', label: '100 MB/s' }, { value: '50', label: '50 MB/s' }, { value: '20', label: '20 MB/s' }]}
          />
          {active ? <Button variant="secondary" size="sm" icon={Pause} onClick={pauseAll}>全部暂停</Button> : downloads.length > 0 && <Button variant="primary" size="sm" icon={Play} onClick={resumeAll}>继续下载</Button>}
        </div>
      </div>

      <div className="grid h-[300px] grid-cols-[1fr_380px] gap-5">
        {active ? <ActiveCard d={active} /> : (
          <div className="flex items-center justify-center rounded-2xl border border-dashed border-white/10 bg-ink-2/50">
            <EmptyState icon={Download} title="没有正在进行的下载" body={downloads.length ? '队列中的项目已暂停，点击继续即可恢复下载。' : '在游戏库中选择一款游戏开始安装。'} action={downloads.length ? <Button variant="primary" icon={Play} onClick={resumeAll}>继续下载</Button> : <Button variant="secondary" onClick={() => nav('/library')}>前往游戏库</Button>} className="py-0" />
          </div>
        )}
        <SpeedGraph />
      </div>

      <section>
        <SectionHeader title={`即将下载 (${queue.length})`} subtitle="使用箭头调整顺序，或点击 ▶ 立即开始" />
        {queue.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/[0.08] py-8 text-center text-[13px] text-fg-3">队列为空</div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence initial={false}>
              {queue.map((d, i) => <QueueRow key={d.gameId} d={d} index={i} total={queue.length} />)}
            </AnimatePresence>
          </div>
        )}
      </section>

      <section>
        <SectionHeader title={`已完成 (${completed.length})`} action={completed.length > 0 && <Button variant="ghost" size="sm" onClick={clearCompleted}>清除列表</Button>} />
        {completed.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/[0.08] py-8 text-center text-[13px] text-fg-3">暂无已完成的下载</div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence initial={false}>
              {completed.map((c) => {
                const g = gameMap[c.gameId]
                return (
                  <motion.div layout key={c.gameId + c.at} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-4 rounded-xl p-2.5 pr-4 transition hover:bg-white/[0.03]">
                    <CircleCheck size={18} className="ml-1 text-ingame" />
                    <MiniCover game={g} className="aspect-[16/9] w-24 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[13.5px] font-medium">{g.title}</div>
                      <div className="text-[11.5px] text-fg-3">{c.kind === 'update' ? '更新' : '安装'} · {formatSize(c.total)} · {timeAgo(c.at)}完成</div>
                    </div>
                    {owned[g.id]?.installed && <Button size="sm" variant="play" icon={Play} onClick={() => launch(g.id)}>开始游戏</Button>}
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </section>
    </Page>
  )
}
