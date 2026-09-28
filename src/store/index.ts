import { create } from 'zustand'
import { games, gameMap } from '@/data/games'
import { getAchievements } from '@/data/achievements'
import {
  cannedReplies, chatSeed, commentsSeed, friendOwned, friendsSeed, requestsSeed,
  type ChatMessage, type Friend, type FriendRequest, type ProfileComment,
} from '@/data/social'
import { DAY, HOUR, MIN, clamp, finalPrice, pick, rng } from '@/lib/utils'

export interface OwnedGame {
  playtime: number
  lastPlayed: number | null
  installed: boolean
  favorite: boolean
  unlocked: Record<string, number>
  addedAt: number
}

export type DownloadStatus = 'downloading' | 'queued' | 'paused'
export interface DownloadItem { gameId: string; kind: 'install' | 'update'; total: number; done: number; status: DownloadStatus; addedAt: number }
export interface CompletedItem { gameId: string; kind: 'install' | 'update'; total: number; at: number }

export type ToastKind = 'info' | 'success' | 'error' | 'achievement' | 'friend' | 'download'
export interface Toast { id: string; kind: ToastKind; title: string; body?: string; gameId?: string; friendId?: string; achId?: string }

export interface Notice { id: string; kind: 'friend' | 'sale' | 'download' | 'gift' | 'update' | 'purchase'; title: string; body: string; at: number; read: boolean; link?: string }

export type MyStatus = 'online' | 'away' | 'invisible'

export interface Me {
  name: string
  realName: string
  bio: string
  country: string
  level: number
  xp: number
  avatarSeed: string
  showcaseGameId: string
  status: MyStatus
  joinedAt: number
  code: string
}

const NOW = Date.now()
let uid = 0
const nid = (p = 'id') => `${p}-${Date.now().toString(36)}-${(uid++).toString(36)}`

const LIB: [string, number, number | null, boolean, number, boolean?][] = [
  ['ashen-meridian', 12640, 2 * HOUR, true, 0.62, true],
  ['starfall-colony', 1840, 5 * HOUR, true, 0.2],
  ['void-protocol', 15200, 14 * HOUR, true, 0.55, true],
  ['neon-drift', 3400, 1.2 * DAY, true, 0.4],
  ['hollow-lantern', 2860, 3 * DAY, true, 0.85, true],
  ['pixel-harvest', 8900, 5 * DAY, true, 0.7],
  ['abyssal-bloom', 980, 7 * DAY, true, 0.25],
  ['skyforge-isles', 4300, 14 * DAY, true, 0.44],
  ['cardbound', 1200, 20 * DAY, false, 0.3],
  ['crownfall-tactics', 620, 40 * DAY, false, 0.12],
  ['echoes-tessaly', 720, 60 * DAY, true, 0.66],
  ['kitsune-gardens', 540, 90 * DAY, false, 1],
  ['mechborn-arena', 380, 120 * DAY, false, 0.15],
  ['lumen-grid', 60, 200 * DAY, false, 0.05],
  ['rogue-circuit', 0, null, false, 0],
  ['dustline-outlaws', 0, null, false, 0],
]

function buildOwned(): Record<string, OwnedGame> {
  const out: Record<string, OwnedGame> = {}
  LIB.forEach(([id, playtime, ago, installed, ratio, favorite]) => {
    const r = rng(id + ':own')
    const lastPlayed = ago === null ? null : NOW - ago
    const addedAt = (lastPlayed ?? NOW) - Math.round(r() * 400 + 5) * DAY
    const unlocked: Record<string, number> = {}
    const list = getAchievements(id)
    const target = Math.round(list.length * ratio)
    const sorted = [...list].filter((a) => ratio >= 1 || a.name !== '传奇').sort((a, b) => b.rarity + r() * 30 - (a.rarity + r() * 30))
    sorted.slice(0, target).forEach((a) => {
      unlocked[a.id] = addedAt + r() * ((lastPlayed ?? NOW) - addedAt)
    })
    out[id] = { playtime, lastPlayed, installed, favorite: !!favorite, unlocked, addedAt }
  })
  return out
}

interface State {
  owned: Record<string, OwnedGame>
  downloads: DownloadItem[]
  completed: CompletedItem[]
  speed: number
  speedHistory: number[]
  bandwidthLimit: number | null
  cart: string[]
  wishlist: string[]
  wallet: number
  ownedDlc: string[]
  running: { gameId: string; phase: 'launching' | 'running'; startedAt: number; nextAchAt: number } | null
  me: Me
  friends: Friend[]
  requests: FriendRequest[]
  outgoing: string[]
  chats: Record<string, ChatMessage[]>
  openChats: string[]
  activeChat: string | null
  chatMinimized: boolean
  unread: Record<string, number>
  typing: Record<string, boolean>
  notices: Notice[]
  toasts: Toast[]
  comments: ProfileComment[]
  friendsPanel: boolean
  cartOpen: boolean
  paletteOpen: boolean
  installTarget: string | null
  checkoutOpen: boolean
  addFriendOpen: boolean
  editProfileOpen: boolean
  fundsOpen: boolean
  confirm: { title: string; body: string; confirmLabel: string; danger?: boolean; onConfirm: () => void } | null
}

interface Actions {
  toast: (t: Omit<Toast, 'id'>, ms?: number) => void
  dismissToast: (id: string) => void
  notify: (n: Omit<Notice, 'id' | 'at' | 'read'>) => void
  markNoticesRead: () => void
  set: (p: Partial<State>) => void
  ask: (c: NonNullable<State['confirm']>) => void

  addToCart: (id: string) => void
  removeFromCart: (id: string) => void
  checkout: (fromWallet?: boolean) => boolean
  toggleWishlist: (id: string) => void
  addFunds: (n: number) => void
  claimFree: (id: string) => void
  buyDlc: (id: string, title: string, price: number) => void

  installGame: (id: string) => void
  uninstallGame: (id: string) => void
  pauseDownload: (id: string) => void
  resumeDownload: (id: string) => void
  removeDownload: (id: string) => void
  moveDownload: (id: string, dir: -1 | 1) => void
  pauseAll: () => void
  resumeAll: () => void
  clearCompleted: () => void
  tickDownloads: () => void

  launch: (id: string) => void
  stop: () => void
  tickRunning: () => void
  toggleFavorite: (id: string) => void

  setStatus: (s: MyStatus) => void
  updateMe: (p: Partial<Me>) => void
  addComment: (text: string) => void

  openChat: (id: string) => void
  closeChat: (id: string) => void
  sendMessage: (id: string, text: string) => void
  sendInvite: (id: string, gameId: string) => void
  removeFriend: (id: string) => void
  toggleFriendFavorite: (id: string) => void
  acceptRequest: (id: string) => void
  declineRequest: (id: string) => void
  sendRequest: (u: { id: string; name: string; level: number; code: string }) => void
  tickFriends: () => void
}

export const useStore = create<State & Actions>((set, get) => ({
  owned: buildOwned(),
  downloads: [
    { gameId: 'dustline-outlaws', kind: 'install', total: gameMap['dustline-outlaws'].sizeMB, done: gameMap['dustline-outlaws'].sizeMB * 0.64, status: 'downloading', addedAt: NOW - HOUR },
    { gameId: 'hollow-lantern', kind: 'update', total: 860, done: 0, status: 'queued', addedAt: NOW - 30 * MIN },
    { gameId: 'cardbound', kind: 'install', total: gameMap.cardbound.sizeMB, done: gameMap.cardbound.sizeMB * 0.31, status: 'paused', addedAt: NOW - 2 * DAY },
  ],
  completed: [
    { gameId: 'starfall-colony', kind: 'update', total: 1240, at: NOW - 6 * HOUR },
    { gameId: 'abyssal-bloom', kind: 'install', total: gameMap['abyssal-bloom'].sizeMB, at: NOW - 8 * DAY },
  ],
  speed: 96,
  speedHistory: Array.from({ length: 60 }, (_, i) => 80 + Math.sin(i / 4) * 14 + (i % 7) * 2),
  bandwidthLimit: null,
  cart: [],
  wishlist: ['oathbreaker', 'chrono-relay', 'metro-architect', 'blade-blossom', 'frontier-freight', 'solace-station'],
  wallet: 356.4,
  ownedDlc: ['am-dlc2'],
  running: null,
  me: {
    name: 'Stellar', realName: '林星野', bio: '白天写代码，晚上打 Boss。魂系 / 策略 / 独立游戏爱好者。', country: '中国 · 上海',
    level: 42, xp: 6840, avatarSeed: 'stellar', showcaseGameId: 'ashen-meridian', status: 'online', joinedAt: NOW - 2120 * DAY, code: '2046-0917',
  },
  friends: friendsSeed,
  requests: requestsSeed,
  outgoing: [],
  chats: chatSeed,
  openChats: [],
  activeChat: null,
  chatMinimized: false,
  unread: { kaito: 1 },
  typing: {},
  notices: [
    { id: 'n1', kind: 'friend', title: 'Nyx 想添加你为好友', body: '你们有 3 位共同好友', at: NOW - 2 * HOUR, read: false, link: '/friends?tab=requests' },
    { id: 'n2', kind: 'sale', title: '愿望单中的游戏正在特惠', body: 'Frontier Freight 现已 -60%，¥98 → ¥39', at: NOW - 5 * HOUR, read: false, link: '/game/frontier-freight' },
    { id: 'n3', kind: 'update', title: 'Hollow Lantern 有可用更新', body: '版本 1.6.2 · 860 MB', at: NOW - 30 * MIN, read: false, link: '/downloads' },
    { id: 'n4', kind: 'gift', title: '你收到了一份礼物', body: '北极星 赠送了你「秋季特卖 2026」贴纸包', at: NOW - 2 * DAY, read: true, link: '/profile' },
  ],
  toasts: [],
  comments: commentsSeed,
  friendsPanel: true,
  cartOpen: false,
  paletteOpen: false,
  installTarget: null,
  checkoutOpen: false,
  addFriendOpen: false,
  editProfileOpen: false,
  fundsOpen: false,
  confirm: null,

  set: (p) => set(p),
  ask: (c) => set({ confirm: c }),

  toast: (t, ms = 4800) => {
    const id = nid('t')
    set((s) => ({ toasts: [...s.toasts.slice(-3), { ...t, id }] }))
    setTimeout(() => get().dismissToast(id), ms)
  },
  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
  notify: (n) => set((s) => ({ notices: [{ ...n, id: nid('n'), at: Date.now(), read: false }, ...s.notices] })),
  markNoticesRead: () => set((s) => ({ notices: s.notices.map((n) => ({ ...n, read: true })) })),

  addToCart: (id) => {
    if (get().cart.includes(id) || get().owned[id]) return
    set((s) => ({ cart: [...s.cart, id] }))
    get().toast({ kind: 'success', title: '已添加到购物车', body: gameMap[id]?.title, gameId: id })
  },
  removeFromCart: (id) => set((s) => ({ cart: s.cart.filter((c) => c !== id) })),
  checkout: (fromWallet = true) => {
    const { cart, wallet } = get()
    const total = cart.reduce((sum, id) => sum + finalPrice(gameMap[id].price, gameMap[id].discount), 0)
    if (fromWallet && total > wallet) return false
    const now = Date.now()
    set((s) => {
      const owned = { ...s.owned }
      cart.forEach((id) => { owned[id] = { playtime: 0, lastPlayed: null, installed: false, favorite: false, unlocked: {}, addedAt: now } })
      return { owned, wallet: fromWallet ? Math.round((wallet - total) * 100) / 100 : wallet, cart: [], wishlist: s.wishlist.filter((w) => !cart.includes(w)) }
    })
    get().notify({ kind: 'purchase', title: '购买成功', body: `${cart.length} 件商品已添加到你的游戏库`, link: '/library' })
    return true
  },
  toggleWishlist: (id) => {
    const has = get().wishlist.includes(id)
    set((s) => ({ wishlist: has ? s.wishlist.filter((w) => w !== id) : [...s.wishlist, id] }))
    get().toast({ kind: 'info', title: has ? '已从愿望单移除' : '已加入愿望单', body: gameMap[id]?.title, gameId: id }, 3000)
  },
  addFunds: (n) => {
    set((s) => ({ wallet: Math.round((s.wallet + n) * 100) / 100 }))
    get().toast({ kind: 'success', title: '充值成功', body: `已向 Nova 钱包添加 ¥${n}` })
  },
  buyDlc: (id, title, price) => {
    if (get().wallet < price) {
      get().toast({ kind: 'error', title: '钱包余额不足', body: `需要 ¥${price}，请先充值` })
      set({ fundsOpen: true })
      return
    }
    set((s) => ({ ownedDlc: [...s.ownedDlc, id], wallet: Math.round((s.wallet - price) * 100) / 100 }))
    get().toast({ kind: 'success', title: 'DLC 购买成功', body: title })
  },
  claimFree: (id) => {
    set((s) => ({ owned: { ...s.owned, [id]: { playtime: 0, lastPlayed: null, installed: false, favorite: false, unlocked: {}, addedAt: Date.now() } } }))
    get().toast({ kind: 'success', title: '已添加到游戏库', body: gameMap[id].title, gameId: id })
  },

  installGame: (id) => {
    const g = gameMap[id]
    if (!g || get().downloads.some((d) => d.gameId === id)) return
    const hasActive = get().downloads.some((d) => d.status === 'downloading')
    set((s) => ({ downloads: [...s.downloads, { gameId: id, kind: 'install', total: g.sizeMB, done: 0, status: hasActive ? 'queued' : 'downloading', addedAt: Date.now() }] }))
    get().toast({ kind: 'download', title: hasActive ? '已加入下载队列' : '开始下载', body: g.title, gameId: id })
  },
  uninstallGame: (id) => {
    set((s) => ({ owned: { ...s.owned, [id]: { ...s.owned[id], installed: false } }, downloads: s.downloads.filter((d) => d.gameId !== id) }))
    get().toast({ kind: 'info', title: '已卸载', body: `${gameMap[id].title} 的本地文件已删除`, gameId: id })
  },
  pauseDownload: (id) => set((s) => ({ downloads: s.downloads.map((d) => (d.gameId === id ? { ...d, status: 'paused' } : d)) })),
  resumeDownload: (id) =>
    set((s) => {
      const item = s.downloads.find((d) => d.gameId === id)
      if (!item) return {}
      const rest = s.downloads.filter((d) => d.gameId !== id).map((d) => (d.status === 'downloading' ? { ...d, status: 'queued' as const } : d))
      return { downloads: [{ ...item, status: 'downloading' }, ...rest] }
    }),
  removeDownload: (id) =>
    set((s) => {
      const downloads = s.downloads.filter((d) => d.gameId !== id)
      if (!downloads.some((d) => d.status === 'downloading')) {
        const next = downloads.findIndex((d) => d.status === 'queued')
        if (next >= 0) downloads[next] = { ...downloads[next], status: 'downloading' }
      }
      return { downloads }
    }),
  moveDownload: (id, dir) =>
    set((s) => {
      const list = [...s.downloads]
      const i = list.findIndex((d) => d.gameId === id)
      const j = i + dir
      if (i < 0 || j < 0 || j >= list.length) return {}
      ;[list[i], list[j]] = [list[j], list[i]]
      return { downloads: list }
    }),
  pauseAll: () => set((s) => ({ downloads: s.downloads.map((d) => (d.status === 'downloading' ? { ...d, status: 'paused' } : d)) })),
  resumeAll: () =>
    set((s) => {
      if (s.downloads.some((d) => d.status === 'downloading')) return {}
      const i = s.downloads.findIndex((d) => d.status !== 'downloading')
      if (i < 0) return {}
      return { downloads: s.downloads.map((d, k) => (k === i ? { ...d, status: 'downloading' } : d)) }
    }),
  clearCompleted: () => set({ completed: [] }),
  tickDownloads: () => {
    const s = get()
    const active = s.downloads.find((d) => d.status === 'downloading')
    if (!active) {
      if (s.speed !== 0 || s.speedHistory[s.speedHistory.length - 1] !== 0) set({ speed: 0, speedHistory: [...s.speedHistory.slice(1), 0] })
      return
    }
    const base = s.speed || 90
    const dip = Math.random() < 0.05 ? -30 : 0
    let speed = clamp(base + (112 - base) * 0.18 + (Math.random() - 0.5) * 20 + dip, 48, 158)
    if (s.bandwidthLimit) speed = Math.min(speed, s.bandwidthLimit * (0.94 + Math.random() * 0.06))
    const done = Math.min(active.total, active.done + speed)
    if (done >= active.total) {
      const downloads = s.downloads.filter((d) => d.gameId !== active.gameId)
      const next = downloads.findIndex((d) => d.status === 'queued')
      if (next >= 0) downloads[next] = { ...downloads[next], status: 'downloading' }
      const owned = active.kind === 'install' && s.owned[active.gameId]
        ? { ...s.owned, [active.gameId]: { ...s.owned[active.gameId], installed: true } }
        : s.owned
      set({ downloads, owned, completed: [{ gameId: active.gameId, kind: active.kind, total: active.total, at: Date.now() }, ...s.completed], speed, speedHistory: [...s.speedHistory.slice(1), speed] })
      const title = gameMap[active.gameId].title
      get().toast({ kind: 'download', title: active.kind === 'install' ? '下载完成，可以开始游戏' : '更新已完成', body: title, gameId: active.gameId }, 6000)
      get().notify({ kind: 'download', title: `${title} 已准备就绪`, body: active.kind === 'install' ? '安装完成，点击开始游戏' : '更新已安装', link: `/library/${active.gameId}` })
      return
    }
    set({
      downloads: s.downloads.map((d) => (d === active ? { ...d, done } : d)),
      speed,
      speedHistory: [...s.speedHistory.slice(1), speed],
    })
  },

  launch: (id) => {
    if (get().running) return
    const now = Date.now()
    set({ running: { gameId: id, phase: 'launching', startedAt: now, nextAchAt: now + 14000 } })
    setTimeout(() => {
      const r = get().running
      if (r?.gameId === id) set({ running: { ...r, phase: 'running' } })
    }, 2200)
  },
  stop: () => {
    const r = get().running
    if (!r) return
    const mins = Math.max(1, Math.round((Date.now() - r.startedAt) / MIN))
    set((s) => ({
      running: null,
      owned: { ...s.owned, [r.gameId]: { ...s.owned[r.gameId], playtime: s.owned[r.gameId].playtime + mins, lastPlayed: Date.now() } },
    }))
    get().toast({ kind: 'info', title: '游戏已退出', body: `${gameMap[r.gameId].title} · 本次游玩 ${mins} 分钟`, gameId: r.gameId }, 3500)
  },
  tickRunning: () => {
    const r = get().running
    if (!r || r.phase !== 'running' || Date.now() < r.nextAchAt) return
    const own = get().owned[r.gameId]
    const locked = getAchievements(r.gameId).filter((a) => !own.unlocked[a.id])
    set({ running: { ...r, nextAchAt: Date.now() + 22000 + Math.random() * 20000 } })
    if (!locked.length) return
    const a = locked.sort((x, y) => y.rarity - x.rarity)[Math.floor(Math.random() * Math.min(4, locked.length))]
    set((s) => ({ owned: { ...s.owned, [r.gameId]: { ...own, unlocked: { ...own.unlocked, [a.id]: Date.now() } } }, me: { ...s.me, xp: s.me.xp + 25 } }))
    get().toast({ kind: 'achievement', title: a.name, body: a.desc, gameId: r.gameId, achId: a.id }, 6500)
  },
  toggleFavorite: (id) => set((s) => ({ owned: { ...s.owned, [id]: { ...s.owned[id], favorite: !s.owned[id].favorite } } })),

  setStatus: (status) => set((s) => ({ me: { ...s.me, status } })),
  updateMe: (p) => set((s) => ({ me: { ...s.me, ...p } })),
  addComment: (text) => set((s) => ({ comments: [{ id: nid('c'), author: s.me.name, authorId: 'me', text, at: Date.now() }, ...s.comments] })),

  openChat: (id) =>
    set((s) => ({
      openChats: s.openChats.includes(id) ? s.openChats : [...s.openChats, id],
      activeChat: id,
      chatMinimized: false,
      unread: { ...s.unread, [id]: 0 },
    })),
  closeChat: (id) =>
    set((s) => {
      const openChats = s.openChats.filter((c) => c !== id)
      return { openChats, activeChat: s.activeChat === id ? openChats[openChats.length - 1] ?? null : s.activeChat }
    }),
  sendMessage: (id, text) => {
    const msg: ChatMessage = { id: nid('m'), from: 'me', text, at: Date.now() }
    set((s) => ({ chats: { ...s.chats, [id]: [...(s.chats[id] ?? []), msg] } }))
    const friend = get().friends.find((f) => f.id === id)
    if (!friend || friend.status === 'offline') return
    setTimeout(() => set((s) => ({ typing: { ...s.typing, [id]: true } })), 700 + Math.random() * 600)
    setTimeout(() => {
      const reply: ChatMessage = { id: nid('m'), from: id, text: cannedReplies[Math.floor(Math.random() * cannedReplies.length)], at: Date.now() }
      set((s) => {
        const visible = s.activeChat === id && !s.chatMinimized && s.openChats.includes(id)
        return {
          typing: { ...s.typing, [id]: false },
          chats: { ...s.chats, [id]: [...(s.chats[id] ?? []), reply] },
          unread: visible ? s.unread : { ...s.unread, [id]: (s.unread[id] ?? 0) + 1 },
        }
      })
    }, 2200 + Math.random() * 1500)
  },
  sendInvite: (id, gameId) => {
    set((s) => ({ chats: { ...s.chats, [id]: [...(s.chats[id] ?? []), { id: nid('m'), from: 'me', text: '', kind: 'invite', gameId, at: Date.now() }] } }))
    const f = get().friends.find((x) => x.id === id)
    get().toast({ kind: 'friend', title: '已发送游戏邀请', body: `邀请 ${f?.name} 一起玩 ${gameMap[gameId].title}`, friendId: id }, 3000)
  },
  removeFriend: (id) => {
    const f = get().friends.find((x) => x.id === id)
    set((s) => ({ friends: s.friends.filter((x) => x.id !== id), openChats: s.openChats.filter((c) => c !== id), activeChat: s.activeChat === id ? null : s.activeChat }))
    get().toast({ kind: 'info', title: '已移除好友', body: f?.name })
  },
  toggleFriendFavorite: (id) => set((s) => ({ friends: s.friends.map((f) => (f.id === id ? { ...f, favorite: !f.favorite } : f)) })),
  acceptRequest: (id) => {
    const r = get().requests.find((x) => x.id === id)
    if (!r) return
    const f: Friend = { id: r.id, name: r.name, code: '0000-0000', level: r.level, status: 'online', country: '未知', bio: '', since: Date.now() }
    set((s) => ({ requests: s.requests.filter((x) => x.id !== id), friends: [f, ...s.friends] }))
    get().toast({ kind: 'friend', title: '已成为好友', body: `你和 ${r.name} 现在是好友了`, friendId: id })
  },
  declineRequest: (id) => set((s) => ({ requests: s.requests.filter((x) => x.id !== id) })),
  sendRequest: (u) => {
    set((s) => ({ outgoing: [...s.outgoing, u.id] }))
    get().toast({ kind: 'friend', title: '好友请求已发送', body: u.name }, 3000)
    setTimeout(() => {
      if (!get().outgoing.includes(u.id)) return
      const f: Friend = { id: u.id, name: u.name, code: u.code, level: u.level, status: 'online', country: '未知', bio: '', since: Date.now() }
      set((s) => ({ outgoing: s.outgoing.filter((x) => x !== u.id), friends: [f, ...s.friends] }))
      get().toast({ kind: 'friend', title: `${u.name} 接受了你的好友请求`, friendId: u.id })
    }, 7000)
  },
  tickFriends: () => {
    const s = get()
    const r = rng(Date.now())
    const f = pick(r, s.friends)
    if (!f) return
    let next: Partial<Friend> = {}
    if (f.status === 'offline') next = { status: 'online', lastSeen: undefined }
    else if (f.status === 'online') {
      const owned = friendOwned(f.id)
      const g = owned.length ? pick(r, owned) : games[0].id
      next = r() < 0.6 ? { status: 'ingame', gameId: g, rich: pick(r, ['主菜单', '探索中', '合作模式', '排位赛', '第 2 章']) } : { status: 'away' }
    } else if (f.status === 'ingame') next = r() < 0.5 ? { status: 'online', gameId: undefined, rich: undefined } : { status: 'offline', gameId: undefined, rich: undefined, lastSeen: Date.now() }
    else next = { status: 'online' }
    set({ friends: s.friends.map((x) => (x.id === f.id ? { ...x, ...next } : x)) })
    if (next.status === 'ingame' && next.gameId) get().toast({ kind: 'friend', title: f.name, body: `正在玩 ${gameMap[next.gameId].title}`, friendId: f.id, gameId: next.gameId }, 4000)
    else if (next.status === 'online' && f.status === 'offline' && f.favorite) get().toast({ kind: 'friend', title: f.name, body: '现已上线', friendId: f.id }, 3500)
  },
}))

export const useActiveDownload = () => useStore((s) => s.downloads.find((d) => d.status === 'downloading'))
export const useDownloadFor = (id: string) => useStore((s) => s.downloads.find((d) => d.gameId === id))
