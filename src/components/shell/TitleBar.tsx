import { Copy, Minus, Square, X } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { MenuItem, Popover } from '@/components/ui'
import { useStore } from '@/store'
import { cn } from '@/lib/utils'

export function NovaMark({ size = 18 }: { size?: number }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden>
      <defs>
        <linearGradient id="novaMark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffb347" /><stop offset=".5" stopColor="#ff6a3d" /><stop offset="1" stopColor="#ff2e7e" />
        </linearGradient>
      </defs>
      <path d="M32 4 L37 27 L60 32 L37 37 L32 60 L27 37 L4 32 L27 27 Z" fill="url(#novaMark)" />
      <circle cx="32" cy="32" r="5" fill="#fff" opacity=".9" />
    </svg>
  )
}

export function TitleBar() {
  const nav = useNavigate()
  const s = useStore()
  const [max, setMax] = useState(true)
  const menus: { label: string; items: { label: string; onClick: () => void; hint?: string }[] }[] = [
    {
      label: 'Nova',
      items: [
        { label: '检查客户端更新…', onClick: () => s.toast({ kind: 'success', title: 'Nova 已是最新版本', body: '版本 3.8.2 (build 20260921)' }) },
        { label: '切换账户…', onClick: () => s.toast({ kind: 'info', title: '当前仅登录了一个账户' }) },
        { label: '离线模式', onClick: () => s.toast({ kind: 'info', title: '离线模式需要重启 Nova' }) },
        { label: '退出', onClick: () => s.toast({ kind: 'info', title: 'Nova 将继续在系统托盘中运行' }) },
      ],
    },
    {
      label: '查看',
      items: [
        { label: '商店', onClick: () => nav('/store'), hint: '' },
        { label: '游戏库', onClick: () => nav('/library') },
        { label: '下载', onClick: () => nav('/downloads') },
        { label: '好友', onClick: () => nav('/friends') },
        { label: '成就', onClick: () => nav('/achievements') },
        { label: s.friendsPanel ? '隐藏好友栏' : '显示好友栏', onClick: () => s.set({ friendsPanel: !s.friendsPanel }) },
        { label: '快速搜索', onClick: () => s.set({ paletteOpen: true }), hint: 'Ctrl K' },
      ],
    },
    {
      label: '好友',
      items: [
        { label: '添加好友…', onClick: () => s.set({ addFriendOpen: true }) },
        { label: '查看好友列表', onClick: () => nav('/friends') },
        { label: '设为在线', onClick: () => s.setStatus('online') },
        { label: '设为离开', onClick: () => s.setStatus('away') },
        { label: '设为隐身', onClick: () => s.setStatus('invisible') },
      ],
    },
    {
      label: '游戏',
      items: [
        { label: '查看游戏库', onClick: () => nav('/library') },
        { label: '兑换 Nova 钱包充值码…', onClick: () => s.set({ fundsOpen: true }) },
        { label: '管理下载', onClick: () => nav('/downloads') },
      ],
    },
    {
      label: '帮助',
      items: [
        { label: '键盘快捷键', onClick: () => s.toast({ kind: 'info', title: '快捷键', body: 'Ctrl K 快速搜索 · Alt ←/→ 后退/前进' }, 6000) },
        { label: '关于 Nova', onClick: () => s.toast({ kind: 'info', title: 'Nova 游戏平台', body: '版本 3.8.2 · 为玩家而生' }) },
      ],
    },
  ]
  return (
    <div className="drag flex h-8 shrink-0 items-center bg-ink-0 pl-3 text-[12px] text-fg-3 select-none">
      <div className="flex items-center gap-2 pr-3">
        <NovaMark size={15} />
        <span className="font-display text-[12.5px] font-semibold tracking-wide text-fg-2">NOVA</span>
      </div>
      <div className="no-drag flex items-center">
        {menus.map((m) => (
          <Popover
            key={m.label}
            align="left"
            width={220}
            trigger={(open, toggle) => (
              <button onClick={toggle} className={cn('h-8 rounded px-2.5 transition hover:bg-white/[0.06] hover:text-fg', open && 'bg-white/[0.06] text-fg')}>{m.label}</button>
            )}
          >
            {(close) => (
              <div className="p-1.5">
                {m.items.map((i) => (
                  <MenuItem key={i.label} onClick={() => { i.onClick(); close() }} right={i.hint ? <span className="text-[11px] text-fg-4">{i.hint}</span> : undefined}>{i.label}</MenuItem>
                ))}
              </div>
            )}
          </Popover>
        ))}
      </div>
      <div className="flex-1" />
      <div className="no-drag flex h-full">
        <button aria-label="最小化" onClick={() => s.toast({ kind: 'info', title: '窗口已最小化（演示）' }, 2000)} className="flex w-11 items-center justify-center transition hover:bg-white/[0.07] hover:text-fg"><Minus size={14} /></button>
        <button aria-label="最大化" onClick={() => setMax(!max)} className="flex w-11 items-center justify-center transition hover:bg-white/[0.07] hover:text-fg">{max ? <Copy size={12} className="scale-x-[-1]" /> : <Square size={11} />}</button>
        <button aria-label="关闭" onClick={() => s.toast({ kind: 'info', title: 'Nova 将继续在系统托盘中运行' })} className="flex w-11 items-center justify-center transition hover:bg-[#e81123] hover:text-white"><X size={15} /></button>
      </div>
    </div>
  )
}
