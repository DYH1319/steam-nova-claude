import { games, gameMap } from './games'
import { getAchievements } from './achievements'
import { DAY, HOUR, MIN, pick, rng } from '@/lib/utils'

export type Presence = 'online' | 'ingame' | 'away' | 'offline'

export interface Friend {
  id: string
  name: string
  code: string
  level: number
  status: Presence
  gameId?: string
  rich?: string
  lastSeen?: number
  country: string
  bio: string
  since: number
  favorite?: boolean
}

const NOW = Date.now()

export const friendsSeed: Friend[] = [
  { id: 'kaito', name: 'Kaito', code: '4821-0932', level: 87, status: 'ingame', gameId: 'void-protocol', rich: '竞技模式 · 9 : 7 · 霓虹港', country: '日本', bio: '只打排位。晚上 10 点后在线。', since: NOW - 900 * DAY, favorite: true },
  { id: 'yehang', name: '夜航船', code: '1180-2291', level: 54, status: 'ingame', gameId: 'ashen-meridian', rich: '灰烬王座 · 第 5 章', country: '中国', bio: '魂系受苦爱好者，目标全成就。', since: NOW - 620 * DAY, favorite: true },
  { id: 'mira', name: 'Mira_V', code: '7732-4410', level: 33, status: 'online', country: '德国', bio: 'Cozy games & coffee ☕', since: NOW - 400 * DAY },
  { id: 'polaris', name: '北极星', code: '3309-8812', level: 120, status: 'ingame', gameId: 'starfall-colony', rich: '第 142 天 · 人口 486', country: '中国', bio: '策略游戏老玩家 / 模组作者', since: NOW - 1500 * DAY, favorite: true },
  { id: 'lumen', name: 'Lumen', code: '5521-0071', level: 21, status: 'away', country: '加拿大', bio: '', since: NOW - 200 * DAY },
  { id: 'rook', name: 'Rook', code: '6610-3345', level: 66, status: 'ingame', gameId: 'neon-drift', rich: '全球联赛 · 第 3 名', country: '美国', bio: 'Drift or die.', since: NOW - 720 * DAY },
  { id: 'mobai', name: '墨白', code: '9021-5530', level: 45, status: 'online', country: '中国', bio: '独立游戏收藏家', since: NOW - 330 * DAY },
  { id: 'sable', name: 'Sable', code: '2204-7788', level: 12, status: 'offline', lastSeen: NOW - 3 * HOUR, country: '英国', bio: '', since: NOW - 90 * DAY },
  { id: 'juno', name: 'Juno', code: '8870-1123', level: 39, status: 'ingame', gameId: 'pixel-harvest', rich: '春季 第 12 天 · 钓鱼中', country: '巴西', bio: '🌻', since: NOW - 510 * DAY },
  { id: 'ache', name: '阿澈', code: '4410-9982', level: 72, status: 'offline', lastSeen: NOW - 26 * HOUR, country: '中国', bio: '周末开黑，欢迎邀请', since: NOW - 1100 * DAY },
  { id: 'pixelfox', name: 'Pixelfox', code: '3391-2260', level: 28, status: 'online', country: '法国', bio: 'Speedrunner · Glacier Run WR hunter', since: NOW - 260 * DAY },
  { id: 'vex', name: 'Vex', code: '1029-4471', level: 95, status: 'away', country: '韩国', bio: '', since: NOW - 800 * DAY },
  { id: 'youzi', name: '柚子茶', code: '5580-3317', level: 18, status: 'offline', lastSeen: NOW - 5 * DAY, country: '中国', bio: '种田玩家', since: NOW - 150 * DAY },
  { id: 'orin', name: 'Orin', code: '7710-6602', level: 50, status: 'offline', lastSeen: NOW - 40 * MIN, country: '瑞典', bio: '', since: NOW - 680 * DAY },
  { id: 'haruka', name: 'Haruka', code: '2299-0145', level: 61, status: 'ingame', gameId: 'blade-blossom', rich: '排位赛 · 剑圣段位', country: '日本', bio: '格斗游戏 / 街机', since: NOW - 450 * DAY },
  { id: 'laok', name: '老K', code: '6023-8841', level: 99, status: 'offline', lastSeen: NOW - 12 * DAY, country: '中国', bio: '退坑中…', since: NOW - 2000 * DAY },
  { id: 'zephyr', name: 'Zephyr', code: '9912-3304', level: 7, status: 'online', country: '澳大利亚', bio: '', since: NOW - 30 * DAY },
]

export interface FriendRequest { id: string; name: string; level: number; mutual: number; at: number; incoming: boolean }

export const requestsSeed: FriendRequest[] = [
  { id: 'nyx', name: 'Nyx', level: 44, mutual: 3, at: NOW - 2 * HOUR, incoming: true },
  { id: 'echo', name: '回声', level: 15, mutual: 1, at: NOW - 3 * DAY, incoming: true },
]

export const directory = [
  { id: 'nova-ace', name: 'NovaAce', level: 58, code: '1111-2222' },
  { id: 'starling', name: 'Starling', level: 23, code: '3141-5926' },
  { id: 'qingfeng', name: '清风', level: 77, code: '2718-2818' },
  { id: 'glitch', name: 'Glitch', level: 9, code: '1618-0339' },
  { id: 'aurora', name: 'Aurora', level: 102, code: '4669-2016' },
  { id: 'xiaoyu', name: '小雨', level: 34, code: '6626-0701' },
  { id: 'tundra', name: 'Tundra', level: 41, code: '8008-1350' },
]

export function friendOwned(friendId: string) {
  const r = rng(friendId + ':lib')
  return games.filter((g) => !g.comingSoon && r() < 0.45).map((g) => g.id)
}

export function friendPlaytime(friendId: string, gameId: string) {
  const r = rng(friendId + gameId)
  return Math.round(Math.pow(r(), 2) * 12000 + 30)
}

export function friendUnlocked(friendId: string, gameId: string) {
  const r = rng(friendId + gameId + ':ach')
  const ratio = r()
  return new Set(getAchievements(gameId).filter((a) => r() < ratio * (0.4 + a.rarity / 100)).map((a) => a.id))
}

export function friendsWhoOwn(friendList: Friend[], gameId: string) {
  return friendList.filter((f) => f.gameId === gameId || friendOwned(f.id).includes(gameId))
}

export interface ChatMessage { id: string; from: string; text: string; at: number; kind?: 'text' | 'invite'; gameId?: string }

export const chatSeed: Record<string, ChatMessage[]> = {
  kaito: [
    { id: 'k1', from: 'kaito', text: '今晚还排吗？', at: NOW - 3 * HOUR },
    { id: 'k2', from: 'me', text: '可以，十点左右', at: NOW - 3 * HOUR + 4 * MIN },
    { id: 'k3', from: 'kaito', text: '好，我先热热手', at: NOW - 3 * HOUR + 5 * MIN },
    { id: 'k4', from: 'kaito', text: '', at: NOW - 12 * MIN, kind: 'invite', gameId: 'void-protocol' },
  ],
  yehang: [
    { id: 'y1', from: 'yehang', text: '第五章那个双子 Boss 你怎么过的', at: NOW - 26 * HOUR },
    { id: 'y2', from: 'me', text: '先打左边那个，右边的会在它死后狂暴，留好体力', at: NOW - 25 * HOUR },
    { id: 'y3', from: 'yehang', text: '懂了，谢谢大佬 🙏', at: NOW - 25 * HOUR + 2 * MIN },
  ],
  mira: [{ id: 'm1', from: 'mira', text: 'Have you tried Paper Moon Café? So cozy!', at: NOW - 2 * DAY }],
}

export const cannedReplies = [
  '哈哈好的', '等我这局打完', '可以啊！', '稍等一下～', '真的假的 😂', '我在吃饭，一会儿回来', '走起！', '这个我也想玩', '收到', 'gg', '明天再说吧，今天有点累', '👍',
]

export interface Review { id: string; author: string; hours: number; positive: boolean; text: string; helpful: number; funny: number; at: number }

const POS = [
  '年度最佳，没有之一。美术、音乐、玩法全都在线，已经推荐给身边所有朋友了。',
  '入坑三十小时，依然每天都想上线看看。制作组的更新频率也很让人安心。',
  '手感极佳，关卡设计非常用心，能感受到开发者的热爱。',
  '原价买的也完全不亏，打折的时候更是闭眼入。',
  '剧情后劲太大了，通关之后在结尾字幕那里坐了很久。',
  '和朋友一起玩快乐翻倍，吵架也翻倍（笑）。',
  '优化很好，老电脑也能稳定 60 帧。',
  '本来只是想试试，结果一个周末就没了。',
]
const NEG = [
  '内容不错，但后期重复度有点高，希望后续更新能改善。',
  '服务器最近不太稳定，匹配时间偏长。',
  '难度曲线有点陡峭，新手劝退。',
  '价格偏高，建议等打折。',
]
const AUTHORS = ['风行者', 'Tofu', '一只咸鱼', 'Nightowl', '白夜', 'Crimson', '猫猫头', 'Atlas', '半糖', 'Quill', '深蓝', 'Moss']

export function getReviews(gameId: string): Review[] {
  const g = gameMap[gameId]
  if (!g || !g.reviews) return []
  const r = rng(gameId + ':rev')
  return Array.from({ length: 9 }, (_, i) => {
    const positive = r() * 100 < g.rating
    return {
      id: `${gameId}-r${i}`,
      author: pick(r, AUTHORS),
      hours: Math.round(Math.pow(r(), 1.5) * 400 * 10) / 10 + 1,
      positive,
      text: positive ? pick(r, POS) : pick(r, NEG),
      helpful: Math.round(Math.pow(r(), 2) * 2400),
      funny: Math.round(Math.pow(r(), 3) * 300),
      at: NOW - Math.round(r() * 120) * DAY,
    }
  })
}

export interface NewsPost { id: string; gameId: string; kind: '更新' | '活动' | '公告' | '开发者日志'; title: string; body: string; at: number }

export function getNews(gameId: string): NewsPost[] {
  const r = rng(gameId + ':news')
  const v = `${1 + Math.floor(r() * 3)}.${Math.floor(r() * 9)}`
  return [
    { id: 'n1', gameId, kind: '更新', title: `版本 ${v}.${Math.floor(r() * 9)} 补丁说明`, body: '修复了若干稳定性问题，优化了加载速度，并调整了部分平衡性数值。感谢每一位提交反馈的玩家。', at: NOW - Math.round(r() * 5 + 1) * DAY },
    { id: 'n2', gameId, kind: '活动', title: '秋季限时活动现已开启', body: '全新的季节挑战、限定外观与双倍奖励周末，活动持续至 10 月 15 日。', at: NOW - Math.round(r() * 10 + 8) * DAY },
    { id: 'n3', gameId, kind: '开发者日志', title: '开发者日志：下一步是什么？', body: '我们整理了社区中呼声最高的功能需求，并分享了接下来三个月的开发路线图。', at: NOW - Math.round(r() * 20 + 25) * DAY },
  ]
}

export interface ActivityItem { id: string; friendId: string; kind: 'achievement' | 'purchase' | 'played' | 'review' | 'friend'; gameId: string; detail?: string; at: number }

export function buildActivity(friendList: Friend[]): ActivityItem[] {
  const r = rng('activity')
  const out: ActivityItem[] = []
  friendList.forEach((f) => {
    const owned = friendOwned(f.id)
    const n = 1 + Math.floor(r() * 3)
    for (let i = 0; i < n && owned.length; i++) {
      const gameId = pick(r, owned)
      const kind = pick(r, ['achievement', 'achievement', 'purchase', 'played', 'review'] as const)
      const ach = getAchievements(gameId)
      out.push({
        id: `${f.id}-${i}`,
        friendId: f.id,
        kind,
        gameId,
        detail: kind === 'achievement' ? pick(r, ach)?.name : kind === 'played' ? `${(r() * 8 + 1).toFixed(1)} 小时` : undefined,
        at: NOW - Math.round(Math.pow(r(), 2) * 6 * DAY + 10 * MIN),
      })
    }
  })
  return out.sort((a, b) => b.at - a.at)
}

export interface ProfileComment { id: string; author: string; authorId: string; text: string; at: number }

export const commentsSeed: ProfileComment[] = [
  { id: 'c1', author: '夜航船', authorId: 'yehang', text: '感谢带我打过双子 Boss！+rep 技术大佬', at: NOW - 2 * DAY },
  { id: 'c2', author: 'Kaito', authorId: 'kaito', text: '+rep 靠谱队友，枪法准', at: NOW - 9 * DAY },
  { id: 'c3', author: 'Juno', authorId: 'juno', text: 'Thanks for the seeds in Pixel Harvest 🌱', at: NOW - 21 * DAY },
]

export const badges = [
  { id: 'b1', name: '资深玩家', desc: '加入 Nova 满 5 年', color: '#ffcf5a', xp: 500 },
  { id: 'b2', name: '秋季特卖 2026', desc: '参与秋季特卖活动', color: '#ff6a3d', xp: 100 },
  { id: 'b3', name: '收藏家 III', desc: '拥有 15 款游戏', color: '#52c7ff', xp: 300 },
  { id: 'b4', name: '成就猎人', desc: '解锁 500 项成就', color: '#c084fc', xp: 400 },
  { id: 'b5', name: '社区贡献者', desc: '撰写 10 篇评测', color: '#7ee06b', xp: 200 },
  { id: 'b6', name: '夜猫子', desc: '在凌晨 3 点游玩', color: '#6366f1', xp: 50 },
]
