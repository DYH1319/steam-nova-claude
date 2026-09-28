import { motion } from 'motion/react'
import {
  Check, CircleCheck, Copy, CreditCard, Download, HardDrive, Loader2, ShoppingCart, Trash2, UserPlus, Wallet, X,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { Avatar } from '@/components/art/Avatar'
import { GameArt, GameLogo } from '@/components/art/GameArt'
import { MiniCover } from '@/components/game'
import { Button, Checkbox, Drawer, EmptyState, IconButton, Modal, Price, Segmented, Select } from '@/components/ui'
import { gameMap } from '@/data/games'
import { directory } from '@/data/social'
import { useStore } from '@/store'
import { cn, finalPrice, formatPrice, formatSize, timeAgo } from '@/lib/utils'

function CartDrawer() {
  const { cartOpen, cart, wallet, set, removeFromCart } = useStore()
  const nav = useNavigate()
  const items = cart.map((id) => gameMap[id])
  const total = items.reduce((s, g) => s + finalPrice(g.price, g.discount), 0)
  const saved = items.reduce((s, g) => s + g.price - finalPrice(g.price, g.discount), 0)
  const close = () => set({ cartOpen: false })
  return (
    <Drawer open={cartOpen} onClose={close} width={440}>
      <div className="flex items-center justify-between border-b hairline px-5 py-4">
        <div>
          <h2 className="font-display text-lg font-semibold">购物车</h2>
          <p className="text-xs text-fg-3">{items.length} 件商品</p>
        </div>
        <IconButton icon={X} label="关闭" onClick={close} />
      </div>
      {items.length === 0 ? (
        <EmptyState
          className="flex-1"
          icon={ShoppingCart}
          title="购物车是空的"
          body="去商店逛逛吧，本周有超过 20 款游戏正在特惠。"
          action={<Button variant="primary" onClick={() => { close(); nav('/store') }}>浏览商店</Button>}
        />
      ) : (
        <>
          <div className="scroll-area flex-1 space-y-2 p-4">
            {items.map((g) => (
              <motion.div layout key={g.id} className="group flex gap-3 rounded-xl bg-white/[0.03] p-2.5 transition hover:bg-white/[0.05]">
                <MiniCover game={g} className="aspect-[16/9] w-28 shrink-0" />
                <div className="flex min-w-0 flex-1 flex-col">
                  <button onClick={() => { close(); nav(`/game/${g.id}`) }} className="truncate text-left text-[13.5px] font-medium hover:text-nova">{g.title}</button>
                  <div className="text-[11px] text-fg-3">{g.developer}</div>
                  <div className="mt-auto flex items-center justify-between">
                    <button onClick={() => removeFromCart(g.id)} className="flex items-center gap-1 text-[11px] text-fg-3 hover:text-danger"><Trash2 size={11} /> 移除</button>
                    <Price price={g.price} discount={g.discount} size="sm" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="space-y-3 border-t hairline p-5">
            {saved > 0 && <div className="flex justify-between text-[13px] text-fg-3"><span>节省</span><span className="text-sale">- {formatPrice(saved)}</span></div>}
            <div className="flex justify-between text-[13px] text-fg-3"><span>钱包余额</span><span>¥ {wallet.toFixed(2)}</span></div>
            <div className="flex items-end justify-between">
              <span className="text-sm text-fg-2">预计总额</span>
              <span className="font-display text-2xl font-bold tabular-nums">{formatPrice(total)}</span>
            </div>
            <Button variant="primary" size="lg" className="w-full" onClick={() => set({ cartOpen: false, checkoutOpen: true })}>结算</Button>
            <Button variant="ghost" size="sm" className="w-full" onClick={() => { close(); nav('/store') }}>继续购物</Button>
          </div>
        </>
      )}
    </Drawer>
  )
}

type Pay = 'wallet' | 'alipay' | 'wechat' | 'card'

function CheckoutModal() {
  const { checkoutOpen, cart, wallet, set, checkout, installGame } = useStore()
  const nav = useNavigate()
  const [pay, setPay] = useState<Pay>('wallet')
  const [agree, setAgree] = useState(true)
  const [phase, setPhase] = useState<'form' | 'processing' | 'done'>('form')
  const [bought, setBought] = useState<string[]>([])
  const items = (phase === 'done' ? bought : cart).map((id) => gameMap[id])
  const total = items.reduce((s, g) => s + finalPrice(g.price, g.discount), 0)
  const short = pay === 'wallet' && total > wallet
  useEffect(() => { if (checkoutOpen) { setPhase('form'); setPay(total > wallet ? 'alipay' : 'wallet') } }, [checkoutOpen]) // eslint-disable-line
  const close = () => set({ checkoutOpen: false })
  const buy = () => {
    setPhase('processing')
    setBought(cart)
    setTimeout(() => {
      checkout(pay === 'wallet')
      setPhase('done')
    }, 1400)
  }
  const methods: { id: Pay; label: string; sub: string; icon: React.ReactNode }[] = [
    { id: 'wallet', label: 'Nova 钱包', sub: `余额 ¥ ${wallet.toFixed(2)}`, icon: <Wallet size={18} className="text-nova" /> },
    { id: 'alipay', label: '支付宝', sub: '扫码或快捷支付', icon: <span className="flex h-[18px] w-[18px] items-center justify-center rounded bg-[#1677ff] text-[10px] font-bold text-white">支</span> },
    { id: 'wechat', label: '微信支付', sub: '扫码支付', icon: <span className="flex h-[18px] w-[18px] items-center justify-center rounded bg-[#07c160] text-[10px] font-bold text-white">微</span> },
    { id: 'card', label: '银行卡', sub: 'Visa / Mastercard / 银联', icon: <CreditCard size={18} className="text-fg-2" /> },
  ]
  return (
    <Modal open={checkoutOpen} onClose={close} width={620} title={phase === 'done' ? undefined : '确认购买'} subtitle={phase === 'done' ? undefined : '选择付款方式并完成订单'}>
      {phase === 'done' ? (
        <div className="p-8 text-center">
          <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 15 }} className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-ingame/15">
            <CircleCheck size={34} className="text-ingame" />
          </motion.div>
          <h2 className="font-display text-xl font-semibold">购买成功！</h2>
          <p className="mt-1 text-sm text-fg-3">以下游戏已添加到你的游戏库</p>
          <div className="mt-6 space-y-2 text-left">
            {items.map((g) => (
              <div key={g.id} className="flex items-center gap-3 rounded-xl bg-white/[0.03] p-2.5">
                <MiniCover game={g} className="aspect-[16/9] w-24" />
                <div className="flex-1 text-[13.5px] font-medium">{g.title}</div>
                <Button size="sm" variant="secondary" icon={Download} onClick={() => installGame(g.id)}>安装</Button>
              </div>
            ))}
          </div>
          <div className="mt-6 flex justify-center gap-2">
            <Button variant="ghost" onClick={close}>继续购物</Button>
            <Button variant="primary" onClick={() => { close(); nav(`/library/${items[0]?.id ?? ''}`) }}>前往游戏库</Button>
          </div>
        </div>
      ) : (
        <div className="p-6 pt-4">
          <div className="mb-5 max-h-[180px] space-y-1.5 overflow-auto rounded-xl bg-ink-0/50 p-2">
            {items.map((g) => (
              <div key={g.id} className="flex items-center gap-3 rounded-lg px-2 py-1.5">
                <MiniCover game={g} className="aspect-[16/9] w-16" />
                <span className="flex-1 truncate text-[13px]">{g.title}</span>
                <span className="text-[13px] tabular-nums text-fg-2">{formatPrice(finalPrice(g.price, g.discount))}</span>
              </div>
            ))}
          </div>
          <div className="eyebrow mb-2">付款方式</div>
          <div className="grid grid-cols-2 gap-2">
            {methods.map((m) => (
              <button key={m.id} onClick={() => setPay(m.id)} className={cn('flex items-center gap-3 rounded-xl border p-3 text-left transition', pay === m.id ? 'border-nova/70 bg-nova/[0.07]' : 'border-white/[0.07] hover:border-white/15')}>
                {m.icon}
                <span className="flex-1">
                  <span className="block text-[13px] font-medium">{m.label}</span>
                  <span className="block text-[11px] text-fg-3">{m.sub}</span>
                </span>
                <span className={cn('flex h-4 w-4 items-center justify-center rounded-full border', pay === m.id ? 'border-nova bg-nova' : 'border-white/20')}>{pay === m.id && <Check size={10} strokeWidth={4} className="text-white" />}</span>
              </button>
            ))}
          </div>
          {short && (
            <div className="mt-3 flex items-center justify-between rounded-xl border border-away/30 bg-away/10 px-3.5 py-2.5 text-[12.5px] text-away">
              钱包余额不足，还差 ¥ {(total - wallet).toFixed(2)}
              <Button size="xs" variant="secondary" onClick={() => set({ fundsOpen: true })}>充值</Button>
            </div>
          )}
          <div className="mt-4"><Checkbox checked={agree} onChange={setAgree} label={<span className="text-xs">我同意 Nova 用户协议，并确认以上商品为数字版本，购买后可在 14 天内且游玩少于 2 小时的情况下申请退款。</span>} /></div>
          <div className="mt-5 flex items-center justify-between border-t hairline pt-5">
            <div>
              <div className="text-xs text-fg-3">应付总额</div>
              <div className="font-display text-2xl font-bold tabular-nums">{formatPrice(total)}</div>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={close}>取消</Button>
              <Button variant="primary" size="lg" disabled={short || !agree || phase === 'processing' || !items.length} onClick={buy} className="min-w-[140px]">
                {phase === 'processing' ? <><Loader2 size={17} className="animate-spin" /> 处理中…</> : '确认付款'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  )
}

const DISKS = [
  { id: 'c', label: '系统盘 (C:)', free: 214 * 1024, total: 1000 * 1024 },
  { id: 'd', label: '游戏盘 (D:)', free: 1240 * 1024, total: 2000 * 1024 },
]

function InstallModal() {
  const { installTarget, set, installGame } = useStore()
  const g = installTarget ? gameMap[installTarget] : null
  const [disk, setDisk] = useState('d')
  const [desk, setDesk] = useState(true)
  const [menu, setMenu] = useState(true)
  const close = () => set({ installTarget: null })
  if (!g) return <Modal open={false} onClose={close}>{null}</Modal>
  const d = DISKS.find((x) => x.id === disk)!
  return (
    <Modal open={!!g} onClose={close} width={560}>
      <GameArt game={g} className="h-40">
        <div className="absolute inset-0 bg-gradient-to-t from-ink-2 via-ink-2/30 to-transparent" />
        <div className="absolute bottom-4 left-6">
          <div className="eyebrow mb-1 text-fg-2">安装</div>
          <GameLogo game={g} className="text-3xl" />
        </div>
        <IconButton icon={X} label="关闭" onClick={close} className="absolute top-3 right-3 bg-black/30" />
      </GameArt>
      <div className="space-y-5 p-6">
        <div className="grid grid-cols-3 gap-3">
          {[
            ['所需空间', formatSize(g.sizeMB)],
            ['预计下载时间', `约 ${Math.max(1, Math.round(g.sizeMB / 100 / 60))} 分钟`],
            ['可用空间', formatSize(d.free)],
          ].map(([k, v]) => (
            <div key={k} className="rounded-xl bg-white/[0.03] p-3">
              <div className="text-[11px] text-fg-3">{k}</div>
              <div className="mt-0.5 font-display text-[15px] font-semibold">{v}</div>
            </div>
          ))}
        </div>
        <div>
          <div className="eyebrow mb-2">安装位置</div>
          <div className="space-y-2">
            {DISKS.map((x) => {
              const used = ((x.total - x.free) / x.total) * 100
              const after = ((x.total - x.free + g.sizeMB) / x.total) * 100
              return (
                <button key={x.id} onClick={() => setDisk(x.id)} className={cn('flex w-full items-center gap-3 rounded-xl border p-3 text-left transition', disk === x.id ? 'border-nova/70 bg-nova/[0.06]' : 'border-white/[0.07] hover:border-white/15')}>
                  <HardDrive size={20} className="text-fg-2" />
                  <div className="flex-1">
                    <div className="flex justify-between text-[13px]"><span className="font-medium">{x.label}</span><span className="text-fg-3">{formatSize(x.free)} 可用 / {formatSize(x.total)}</span></div>
                    <div className="relative mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
                      <div className="absolute inset-y-0 left-0 rounded-full bg-nova/40" style={{ width: `${after}%` }} />
                      <div className="absolute inset-y-0 left-0 rounded-full bg-fg-3" style={{ width: `${used}%` }} />
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
        <div className="space-y-0.5">
          <Checkbox checked={desk} onChange={setDesk} label="创建桌面快捷方式" />
          <Checkbox checked={menu} onChange={setMenu} label="创建开始菜单快捷方式" />
        </div>
        <div className="flex justify-end gap-2 border-t hairline pt-5">
          <Button variant="ghost" onClick={close}>取消</Button>
          <Button variant="primary" icon={Download} onClick={() => { installGame(g.id); close() }}>开始安装</Button>
        </div>
      </div>
    </Modal>
  )
}

function AddFriendModal() {
  const { addFriendOpen, set, me, friends, outgoing, requests, sendRequest, acceptRequest, declineRequest } = useStore()
  const [tab, setTab] = useState<'search' | 'requests'>('search')
  const [q, setQ] = useState('')
  const [copied, setCopied] = useState(false)
  useEffect(() => { if (addFriendOpen) setTab(requests.length ? 'requests' : 'search') }, [addFriendOpen]) // eslint-disable-line
  const results = useMemo(() => {
    const t = q.trim().toLowerCase()
    return directory.filter((u) => !friends.some((f) => f.id === u.id) && (!t || u.name.toLowerCase().includes(t) || u.code.includes(t)))
  }, [q, friends])
  const close = () => set({ addFriendOpen: false })
  return (
    <Modal open={addFriendOpen} onClose={close} width={520} title="添加好友" subtitle="通过昵称、好友代码搜索玩家">
      <div className="p-6 pt-4">
        <div className="mb-4 flex items-center justify-between rounded-xl bg-gradient-to-r from-nova/15 to-nova-hot/10 p-4">
          <div>
            <div className="text-[11px] text-fg-3">你的好友代码</div>
            <div className="font-display text-xl font-bold tracking-wider">{me.code}</div>
          </div>
          <Button size="sm" variant="secondary" icon={copied ? Check : Copy} onClick={() => { navigator.clipboard?.writeText(me.code).catch(() => {}); setCopied(true); setTimeout(() => setCopied(false), 1500) }}>{copied ? '已复制' : '复制'}</Button>
        </div>
        <Segmented id="addf" value={tab} onChange={setTab} options={[{ value: 'search', label: '搜索玩家' }, { value: 'requests', label: '待处理请求', count: requests.length }]} />
        <div className="mt-4 min-h-[260px]">
          {tab === 'search' ? (
            <>
              <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="输入昵称或好友代码（如 3141-5926）" className="input h-10" />
              <div className="mt-3 space-y-1">
                {results.length === 0 && <div className="py-10 text-center text-sm text-fg-3">没有找到匹配的玩家</div>}
                {results.map((u) => {
                  const sent = outgoing.includes(u.id)
                  return (
                    <div key={u.id} className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-white/[0.03]">
                      <Avatar seed={u.id} name={u.name} size={38} />
                      <div className="flex-1">
                        <div className="text-[13.5px] font-medium">{u.name}</div>
                        <div className="text-[11px] text-fg-3">等级 {u.level} · #{u.code}</div>
                      </div>
                      <Button size="sm" variant={sent ? 'ghost' : 'secondary'} disabled={sent} icon={sent ? Check : UserPlus} onClick={() => sendRequest(u)}>{sent ? '已发送' : '添加'}</Button>
                    </div>
                  )
                })}
              </div>
            </>
          ) : requests.length === 0 ? (
            <EmptyState icon={UserPlus} title="没有待处理的请求" body="当有人想添加你为好友时，会显示在这里。" />
          ) : (
            <div className="space-y-1">
              {requests.map((r) => (
                <div key={r.id} className="flex items-center gap-3 rounded-xl px-2 py-2.5 hover:bg-white/[0.03]">
                  <Avatar seed={r.id} name={r.name} size={40} />
                  <div className="flex-1">
                    <div className="text-[13.5px] font-medium">{r.name}</div>
                    <div className="text-[11px] text-fg-3">等级 {r.level} · {r.mutual} 位共同好友 · {timeAgo(r.at)}</div>
                  </div>
                  <Button size="sm" variant="primary" onClick={() => acceptRequest(r.id)}>接受</Button>
                  <Button size="sm" variant="ghost" onClick={() => declineRequest(r.id)}>忽略</Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}

const AVATAR_SEEDS = ['stellar', 'nova-7', 'ember', 'aurora-x', 'quasar', 'drift', 'nebula', 'orbit-9']

function EditProfileModal() {
  const { editProfileOpen, set, me, updateMe, owned, toast } = useStore()
  const [form, setForm] = useState(me)
  useEffect(() => { if (editProfileOpen) setForm(me) }, [editProfileOpen]) // eslint-disable-line
  const close = () => set({ editProfileOpen: false })
  const ownedGames = Object.keys(owned).map((id) => gameMap[id])
  return (
    <Modal open={editProfileOpen} onClose={close} width={560} title="编辑个人资料" subtitle="你的个人资料对好友可见">
      <div className="space-y-5 p-6 pt-4">
        <div>
          <div className="eyebrow mb-2">头像</div>
          <div className="flex flex-wrap gap-2.5">
            {AVATAR_SEEDS.map((sd) => (
              <button key={sd} onClick={() => setForm({ ...form, avatarSeed: sd })} className={cn('rounded-[14px] p-0.5 transition', form.avatarSeed === sd ? 'ring-2 ring-nova' : 'opacity-70 hover:opacity-100')}>
                <Avatar seed={sd} name={form.name || '?'} size={48} />
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className="block"><span className="mb-1.5 block text-xs text-fg-3">昵称</span><input className="input" value={form.name} maxLength={20} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
          <label className="block"><span className="mb-1.5 block text-xs text-fg-3">地区</span><input className="input" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} /></label>
        </div>
        <label className="block">
          <span className="mb-1.5 flex justify-between text-xs text-fg-3"><span>个人简介</span><span>{form.bio.length}/120</span></span>
          <textarea className="input h-20 resize-none py-2" maxLength={120} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
        </label>
        <div>
          <div className="mb-1.5 text-xs text-fg-3">展示游戏</div>
          <Select width={300} value={form.showcaseGameId} onChange={(v) => setForm({ ...form, showcaseGameId: v })} options={ownedGames.map((g) => ({ value: g.id, label: g.title }))} />
        </div>
        <div className="flex justify-end gap-2 border-t hairline pt-5">
          <Button variant="ghost" onClick={close}>取消</Button>
          <Button variant="primary" disabled={!form.name.trim()} onClick={() => { updateMe({ ...form, name: form.name.trim() }); close(); toast({ kind: 'success', title: '个人资料已更新' }) }}>保存更改</Button>
        </div>
      </div>
    </Modal>
  )
}

function FundsModal() {
  const { fundsOpen, set, wallet, addFunds, toast } = useStore()
  const [amt, setAmt] = useState(100)
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const close = () => set({ fundsOpen: false })
  const go = () => {
    setBusy(true)
    setTimeout(() => { addFunds(amt); setBusy(false); close() }, 900)
  }
  return (
    <Modal open={fundsOpen} onClose={close} width={480} title="为 Nova 钱包充值" subtitle={`当前余额 ¥ ${wallet.toFixed(2)}`}>
      <div className="space-y-5 p-6 pt-4">
        <div className="grid grid-cols-4 gap-2">
          {[50, 100, 200, 500].map((v) => (
            <button key={v} onClick={() => setAmt(v)} className={cn('rounded-xl border py-4 text-center transition', amt === v ? 'border-nova/70 bg-nova/[0.08]' : 'border-white/[0.07] hover:border-white/15')}>
              <div className="font-display text-lg font-bold">¥{v}</div>
            </button>
          ))}
        </div>
        <Button variant="primary" size="lg" className="w-full" onClick={go} disabled={busy}>{busy ? <><Loader2 size={17} className="animate-spin" /> 处理中…</> : `充值 ¥${amt}`}</Button>
        <div className="flex items-center gap-3 text-xs text-fg-4"><div className="h-px flex-1 bg-white/[0.06]" />或兑换充值码<div className="h-px flex-1 bg-white/[0.06]" /></div>
        <div className="flex gap-2">
          <input className="input h-10 font-mono tracking-widest uppercase" placeholder="XXXXX-XXXXX-XXXXX" value={code} onChange={(e) => setCode(e.target.value)} />
          <Button variant="secondary" size="lg" disabled={code.length < 5} onClick={() => { toast({ kind: 'error', title: '充值码无效', body: '请检查后重新输入' }); setCode('') }}>兑换</Button>
        </div>
      </div>
    </Modal>
  )
}

function ConfirmModal() {
  const { confirm, set } = useStore()
  const close = () => set({ confirm: null })
  return (
    <Modal open={!!confirm} onClose={close} width={420}>
      {confirm && (
        <div className="p-6">
          <h2 className="font-display text-lg font-semibold">{confirm.title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-fg-3">{confirm.body}</p>
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="ghost" onClick={close}>取消</Button>
            <Button variant={confirm.danger ? 'danger' : 'primary'} onClick={() => { confirm.onConfirm(); close() }}>{confirm.confirmLabel}</Button>
          </div>
        </div>
      )}
    </Modal>
  )
}

export function GlobalModals() {
  return (
    <>
      <CartDrawer />
      <CheckoutModal />
      <InstallModal />
      <AddFriendModal />
      <EditProfileModal />
      <FundsModal />
      <ConfirmModal />
    </>
  )
}
