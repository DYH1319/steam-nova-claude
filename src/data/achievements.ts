import { gameMap } from './games'
import { rng } from '@/lib/utils'

export type AchIcon =
  | 'trophy' | 'sword' | 'shield' | 'star' | 'flame' | 'crown' | 'skull' | 'gem' | 'compass' | 'map'
  | 'target' | 'zap' | 'heart' | 'rocket' | 'mountain' | 'clock' | 'coins' | 'eye' | 'ghost' | 'key'
  | 'medal' | 'anchor' | 'leaf' | 'moon' | 'sun' | 'feather' | 'flag' | 'hammer' | 'sparkles' | 'users'

export interface Achievement {
  id: string
  gameId: string
  name: string
  desc: string
  icon: AchIcon
  rarity: number
  hidden: boolean
}

const POOL: [string, string, AchIcon][] = [
  ['初出茅庐', '完成新手教程', 'feather'],
  ['第一滴血', '击败你的第一个敌人', 'sword'],
  ['探路者', '发现 10 个新区域', 'compass'],
  ['制图师', '完整揭示整张地图', 'map'],
  ['不屈之魂', '在一次游戏中死亡 50 次后仍继续前进', 'flame'],
  ['百发百中', '连续命中 25 次', 'target'],
  ['坚不可摧', '在不受伤的情况下击败一名首领', 'shield'],
  ['万贯家财', '累计获得 100,000 金币', 'coins'],
  ['收藏家', '收集所有稀有物品', 'gem'],
  ['王者归来', '完成主线剧情', 'crown'],
  ['闪电突袭', '在 10 分钟内完成一个章节', 'zap'],
  ['夜行者', '在夜晚完成 20 项任务', 'moon'],
  ['晨曦', '在黎明时分抵达山顶', 'sun'],
  ['登峰造极', '将任意角色提升至最高等级', 'mountain'],
  ['时间旅人', '累计游玩 100 小时', 'clock'],
  ['幽灵', '在不被发现的情况下完成一个关卡', 'ghost'],
  ['锁匠', '打开所有上锁的宝箱', 'key'],
  ['荣誉勋章', '获得全部荣誉勋章', 'medal'],
  ['深海之锚', '抵达最深处', 'anchor'],
  ['自然之友', '与所有野生生物建立友谊', 'leaf'],
  ['旗开得胜', '赢得第一场胜利', 'flag'],
  ['工匠之心', '打造一件传说级装备', 'hammer'],
  ['星光璀璨', '获得全部三星评价', 'sparkles'],
  ['并肩作战', '与好友完成一局合作游戏', 'users'],
  ['死神擦肩', '在生命值低于 1% 时获胜', 'skull'],
  ['洞察一切', '发现所有隐藏的秘密', 'eye'],
  ['温暖人心', '帮助 30 位 NPC', 'heart'],
  ['一飞冲天', '达到最高速度', 'rocket'],
  ['冠军', '赢得锦标赛', 'trophy'],
  ['完美主义者', '以最高难度通关', 'star'],
  ['风暴之中', '在暴风雨中存活一整晚', 'zap'],
  ['传奇', '解锁所有其他成就', 'trophy'],
  ['破晓', '在第一章中找到隐藏结局', 'sun'],
  ['连锁反应', '一次行动击败 5 名敌人', 'flame'],
  ['大富翁', '拥有全部地产', 'coins'],
  ['守护者', '保护队友免受 1000 点伤害', 'shield'],
  ['旅行者', '累计移动 500 公里', 'compass'],
  ['猎手', '狩猎所有种类的猎物', 'target'],
  ['星辰大海', '访问所有星系', 'rocket'],
  ['不眠之夜', '连续游玩 4 小时', 'moon'],
]

const cache: Record<string, Achievement[]> = {}

export function getAchievements(gameId: string): Achievement[] {
  if (cache[gameId]) return cache[gameId]
  const g = gameMap[gameId]
  if (!g) return []
  const r = rng(gameId + ':ach')
  const idx = POOL.map((_, i) => i).sort(() => r() - 0.5)
  const list: Achievement[] = []
  for (let i = 0; i < g.achievementCount; i++) {
    const pi = idx[i % POOL.length]
    const [name, desc, icon] = POOL[pi]
    const cycle = Math.floor(i / POOL.length)
    const difficulty = name === '传奇' ? 1 : pi / POOL.length
    const base = Math.min(96, Math.max(0.3, Math.pow(1 - difficulty, 1.5) * 90 * (1 - cycle * 0.3) + (r() - 0.5) * 12))
    list.push({
      id: `${gameId}-a${i}`,
      gameId,
      name: cycle ? `${name} ${['II', 'III', 'IV'][cycle - 1]}` : name,
      desc,
      icon,
      rarity: Math.round(base * 10) / 10,
      hidden: r() < 0.12,
    })
  }
  list.sort((a, b) => b.rarity - a.rarity)
  cache[gameId] = list
  return list
}

export const rarityTier = (p: number) =>
  p < 5 ? { label: '传说', color: '#ffcf5a' } : p < 15 ? { label: '史诗', color: '#c084fc' } : p < 40 ? { label: '稀有', color: '#52c7ff' } : { label: '普通', color: '#a4abbb' }
