export function cn(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(' ')
}

export function hash(str: string) {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

export function rng(seed: string | number) {
  let a = typeof seed === 'number' ? seed : hash(seed)
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export const range = (r: () => number, min: number, max: number) => min + r() * (max - min)
export const pick = <T,>(r: () => number, arr: readonly T[]) => arr[Math.floor(r() * arr.length)]
export const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

export function mix(a: string, b: string, t: number) {
  const pa = parseInt(a.slice(1), 16)
  const pb = parseInt(b.slice(1), 16)
  const ch = (p: number, s: number) => (p >> s) & 255
  const m = (s: number) => Math.round(ch(pa, s) + (ch(pb, s) - ch(pa, s)) * t)
  return `#${((1 << 24) | (m(16) << 16) | (m(8) << 8) | m(0)).toString(16).slice(1)}`
}

export function formatPrice(v: number) {
  if (v === 0) return '免费'
  return `¥ ${v.toFixed(v % 1 ? 2 : 0)}`
}

export function finalPrice(price: number, discount: number) {
  return Math.round(price * (1 - discount / 100))
}

export function formatHours(minutes: number) {
  if (minutes < 60) return `${minutes} 分钟`
  const h = minutes / 60
  return `${h >= 100 ? Math.round(h).toLocaleString() : h.toFixed(1)} 小时`
}

export function formatSize(mb: number) {
  if (mb >= 1024) return `${(mb / 1024).toFixed(mb >= 10240 ? 1 : 2)} GB`
  return `${Math.round(mb)} MB`
}

export function formatSpeed(mbps: number) {
  return mbps >= 1 ? `${mbps.toFixed(1)} MB/s` : `${Math.round(mbps * 1024)} KB/s`
}

export function formatDuration(sec: number) {
  if (!isFinite(sec) || sec <= 0) return '--'
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = Math.floor(sec % 60)
  if (h) return `${h} 小时 ${m} 分`
  if (m) return `${m} 分 ${s.toString().padStart(2, '0')} 秒`
  return `${s} 秒`
}

export function timeAgo(ts: number, now = Date.now()) {
  const d = Math.max(0, now - ts) / 1000
  if (d < 60) return '刚刚'
  if (d < 3600) return `${Math.floor(d / 60)} 分钟前`
  if (d < 86400) return `${Math.floor(d / 3600)} 小时前`
  if (d < 86400 * 2) return '昨天'
  if (d < 86400 * 30) return `${Math.floor(d / 86400)} 天前`
  if (d < 86400 * 365) return `${Math.floor(d / 86400 / 30)} 个月前`
  return `${Math.floor(d / 86400 / 365)} 年前`
}

export function formatDate(ts: number | string) {
  const d = new Date(ts)
  return `${d.getFullYear()} 年 ${d.getMonth() + 1} 月 ${d.getDate()} 日`
}

export function formatClock(ts: number) {
  const d = new Date(ts)
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
}

export const MIN = 60 * 1000
export const HOUR = 60 * MIN
export const DAY = 24 * HOUR
