export type Motif = 'mountains' | 'grid' | 'orbit' | 'forest' | 'waves' | 'shards' | 'hills' | 'dunes' | 'city' | 'sun'
export type TitleFont = 'display' | 'serif' | 'condensed'
export type Feature = 'single' | 'multi' | 'coop' | 'controller' | 'cloud' | 'achievements' | 'workshop' | 'pvp'
export type Platform = 'win' | 'mac' | 'linux'
export type Tier = 'low' | 'mid' | 'high'

export interface Dlc { id: string; title: string; price: number }

export interface Game {
  id: string
  title: string
  developer: string
  publisher: string
  release: string
  price: number
  discount: number
  saleEndsInH?: number
  genres: string[]
  tags: string[]
  features: Feature[]
  rating: number
  recentRating: number
  reviews: number
  short: string
  about: string[]
  sizeMB: number
  palette: [string, string, string]
  motif: Motif
  font: TitleFont
  achievementCount: number
  platforms: Platform[]
  tier: Tier
  dlc?: Dlc[]
  comingSoon?: boolean
  featured?: boolean
  players?: number
}

export const GENRES = ['动作', '冒险', '角色扮演', '策略', '模拟', '独立', '休闲', '竞速', '射击', '解谜', '恐怖', '生存', '大型多人'] as const

export const FEATURE_LABEL: Record<Feature, string> = {
  single: '单人',
  multi: '在线多人',
  coop: '在线合作',
  pvp: '玩家对战',
  controller: '完全支持手柄',
  cloud: 'Nova 云存档',
  achievements: 'Nova 成就',
  workshop: '创意工坊',
}

export const games: Game[] = [
  {
    id: 'ashen-meridian', title: 'Ashen Meridian', developer: 'Hollowpeak Studios', publisher: 'Northwind Interactive',
    release: '2026-03-12', price: 298, discount: 40, saleEndsInH: 58, genres: ['角色扮演', '动作', '冒险'],
    tags: ['开放世界', '魂系', '黑暗奇幻', '剧情丰富', '单人'], features: ['single', 'controller', 'cloud', 'achievements'],
    rating: 94, recentRating: 91, reviews: 184213, sizeMB: 88064, palette: ['#1a0f2e', '#d9480f', '#ffc078'], motif: 'mountains', font: 'serif',
    short: '在灰烬覆盖的子午线大陆上，追寻熄灭的太阳。一段关于牺牲、记忆与重燃的史诗旅程。',
    about: [
      '千年前，太阳在子午线的尽头熄灭，世界被永恒的余烬之雨笼罩。你是最后一位"持火者"，背负着一缕不肯熄灭的火种，穿越崩塌的王国、沉睡的巨像与被遗忘的神殿。',
      '无缝衔接的开放世界，超过 70 名风格迥异的首领，以及深度的构筑系统——每一把武器都拥有独立的战技，每一次死亡都会让余烬在大地上留下痕迹。',
    ],
    achievementCount: 42, platforms: ['win'], tier: 'high', featured: true, players: 86412,
    dlc: [{ id: 'am-dlc1', title: 'Ashen Meridian - 深渊回响', price: 128 }, { id: 'am-dlc2', title: 'Ashen Meridian - 数字原声集', price: 38 }],
  },
  {
    id: 'neon-drift', title: 'Neon Drift 2089', developer: 'Afterglow Labs', publisher: 'Afterglow Labs',
    release: '2025-11-02', price: 148, discount: 55, saleEndsInH: 30, genres: ['竞速', '动作'],
    tags: ['赛博朋克', '街头竞速', '合成器浪潮', '多人', '快节奏'], features: ['single', 'multi', 'pvp', 'controller', 'achievements', 'cloud'],
    rating: 88, recentRating: 90, reviews: 42118, sizeMB: 41200, palette: ['#0b0221', '#ff2e97', '#00e5ff'], motif: 'grid', font: 'condensed',
    short: '霓虹不眠的 2089 年，在悬浮高速上以每小时 600 公里的速度甩开整座城市。',
    about: [
      '欢迎来到新九龙——一座由霓虹、雨水与非法改装构成的垂直都市。打造你的悬浮战车，加入地下车队，在 40 余条动态赛道中争夺街头之王的称号。',
      '实时天气与昼夜系统、每周轮换的全球联赛，以及与合成器浪潮音乐同步的"节拍漂移"机制，让每一场比赛都像一支 MV。',
    ],
    achievementCount: 36, platforms: ['win', 'linux'], tier: 'mid', featured: true, players: 23104,
  },
  {
    id: 'starfall-colony', title: 'Starfall Colony', developer: 'Meridian Forge', publisher: 'Parallax Publishing',
    release: '2026-08-28', price: 168, discount: 0, genres: ['策略', '模拟'],
    tags: ['殖民模拟', '太空', '基地建设', '沙盒', '资源管理'], features: ['single', 'workshop', 'cloud', 'achievements'],
    rating: 92, recentRating: 93, reviews: 21876, sizeMB: 12800, palette: ['#020617', '#1e3a8a', '#93c5fd'], motif: 'orbit', font: 'display',
    short: '在遥远的冰封卫星上建立人类最后的殖民地，每一个决定都关乎文明的存续。',
    about: [
      '母星已不复存在。你将指挥一艘载有 200 名殖民者的方舟，在充满敌意的外星卫星上建立可持续的家园——管理氧气、能源、心理健康与派系政治。',
      '程序生成的星系、深度的科技树与完整的创意工坊支持，让每一局都是独一无二的生存史诗。',
    ],
    achievementCount: 48, platforms: ['win', 'mac', 'linux'], tier: 'mid', featured: true, players: 31220,
  },
  {
    id: 'hollow-lantern', title: 'Hollow Lantern', developer: 'Tiny Ember', publisher: 'Tiny Ember',
    release: '2024-06-18', price: 68, discount: 50, saleEndsInH: 58, genres: ['独立', '动作', '冒险'],
    tags: ['类银河战士恶魔城', '手绘', '平台跳跃', '氛围', '困难'], features: ['single', 'controller', 'cloud', 'achievements'],
    rating: 97, recentRating: 96, reviews: 96330, sizeMB: 3400, palette: ['#04130f', '#0f766e', '#fde68a'], motif: 'forest', font: 'serif',
    short: '提着一盏空心灯笼，深入被遗忘的地底森林，找回属于萤火虫的光。',
    about: [
      '一部全手绘的类银河战士恶魔城冒险。探索相互交织的地下森林王国，结识古怪而温柔的居民，挑战 40 余位精心设计的首领。',
      '你的灯笼会吸收敌人的光芒，并将其化为新的能力——用光来开辟道路，也用光来照亮真相。',
    ],
    achievementCount: 28, platforms: ['win', 'mac', 'linux'], tier: 'low', players: 8120,
  },
  {
    id: 'iron-tide', title: 'Iron Tide', developer: 'Bulwark Games', publisher: 'Anchorline',
    release: '2025-04-09', price: 198, discount: 25, saleEndsInH: 104, genres: ['策略', '模拟'],
    tags: ['海战', '历史', '即时战略', '大战略', '多人'], features: ['single', 'multi', 'pvp', 'achievements'],
    rating: 81, recentRating: 76, reviews: 15402, sizeMB: 52300, palette: ['#0a1520', '#334155', '#f97316'], motif: 'waves', font: 'condensed',
    short: '指挥钢铁舰队，在风暴肆虐的大洋上改写历史。',
    about: [
      '从驱逐舰到超无畏舰，亲自指挥超过 120 艘经过精确还原的历史战舰。在动态天气与真实弹道系统下，每一次齐射都需要深思熟虑。',
      '包含三大历史战役、沙盒模式以及最多 8 人的在线海战。',
    ],
    achievementCount: 30, platforms: ['win'], tier: 'high', players: 5402,
  },
  {
    id: 'pixel-harvest', title: 'Pixel Harvest', developer: 'Clover Patch', publisher: 'Clover Patch',
    release: '2023-09-21', price: 48, discount: 30, saleEndsInH: 30, genres: ['模拟', '休闲', '独立'],
    tags: ['农场模拟', '像素', '治愈', '合作', '生活模拟'], features: ['single', 'coop', 'controller', 'cloud', 'achievements'],
    rating: 96, recentRating: 97, reviews: 210455, sizeMB: 820, palette: ['#1a2e05', '#65a30d', '#fef08a'], motif: 'hills', font: 'display',
    short: '继承外婆留下的小农场，在四季轮转中种下属于你的慢生活。',
    about: [
      '开垦荒地、饲养动物、钓鱼、采矿，与小镇上 30 多位个性鲜明的居民成为朋友——甚至携手一生。',
      '支持最多 4 人在线合作，一起经营梦想中的农场。',
    ],
    achievementCount: 40, platforms: ['win', 'mac', 'linux'], tier: 'low', players: 44109,
  },
  {
    id: 'void-protocol', title: 'Void Protocol', developer: 'Redline Collective', publisher: 'Redline Collective',
    release: '2024-02-14', price: 0, discount: 0, genres: ['射击', '动作', '大型多人'],
    tags: ['免费开玩', '战术射击', '5v5', '电竞', '竞技'], features: ['multi', 'pvp', 'achievements'],
    rating: 79, recentRating: 72, reviews: 512840, sizeMB: 34100, palette: ['#09090b', '#dc2626', '#f4f4f5'], motif: 'shards', font: 'condensed',
    short: '5v5 战术射击。一次交火，一次决断，一个回合定胜负。',
    about: [
      '精准枪法与特工技能的碰撞。选择 20 余名拥有独特战术能力的特工，在紧张的攻防回合中配合队友取得胜利。',
      '128 tick 服务器、完善的反作弊系统与排位赛季，打造公平的竞技环境。',
    ],
    achievementCount: 24, platforms: ['win'], tier: 'mid', players: 412880,
  },
  {
    id: 'echoes-tessaly', title: 'Echoes of Tessaly', developer: 'Paper Lighthouse', publisher: 'Quiet Harbor',
    release: '2025-10-30', price: 88, discount: 20, saleEndsInH: 104, genres: ['冒险', '独立'],
    tags: ['剧情丰富', '选择影响剧情', '女性主角', '氛围', '音乐优美'], features: ['single', 'controller', 'cloud', 'achievements'],
    rating: 95, recentRating: 95, reviews: 12007, sizeMB: 6200, palette: ['#1e1b4b', '#7c3aed', '#f5d0fe'], motif: 'waves', font: 'serif',
    short: '在不断重复的潮汐之间，倾听一座海岛留下的回声。',
    about: [
      '艾拉回到童年的海岛泰萨利，只为寻找失踪的妹妹。但岛上的时间正随着潮汐倒流，每一次退潮都会带回一段被遗忘的记忆。',
      '由获奖作曲家打造的原声，结合完全分支的叙事结构，拥有 6 种截然不同的结局。',
    ],
    achievementCount: 18, platforms: ['win', 'mac'], tier: 'low', players: 1204,
  },
  {
    id: 'crownfall-tactics', title: 'Crownfall Tactics', developer: 'Gilded Hex', publisher: 'Northwind Interactive',
    release: '2025-07-15', price: 128, discount: 35, saleEndsInH: 58, genres: ['策略', '角色扮演'],
    tags: ['回合制战术', '战棋', '中世纪', '剧情丰富', '永久死亡'], features: ['single', 'cloud', 'achievements', 'controller'],
    rating: 90, recentRating: 88, reviews: 18322, sizeMB: 15400, palette: ['#1c1917', '#a16207', '#fde047'], motif: 'mountains', font: 'serif',
    short: '王冠已坠，诸侯并起。以智谋与鲜血重新统一破碎的王国。',
    about: [
      '一款致敬经典的回合制战棋 RPG。招募超过 60 名拥有独立剧情线的角色，在高低差、天气与地形交织的战场上排兵布阵。',
      '你的每一个选择都会影响阵营关系，最终决定谁将戴上王冠。',
    ],
    achievementCount: 52, platforms: ['win', 'mac'], tier: 'mid', players: 6890,
  },
  {
    id: 'abyssal-bloom', title: 'Abyssal Bloom', developer: 'Deepwater Co.', publisher: 'Parallax Publishing',
    release: '2026-01-22', price: 118, discount: 15, saleEndsInH: 30, genres: ['生存', '冒险'],
    tags: ['水下', '生存建造', '探索', '开放世界', '外星'], features: ['single', 'coop', 'controller', 'cloud', 'achievements'],
    rating: 93, recentRating: 94, reviews: 38421, sizeMB: 18900, palette: ['#012a36', '#0891b2', '#a7f3d0'], motif: 'waves', font: 'display',
    short: '坠落在一颗海洋星球，向深渊下潜，发现在黑暗中盛开的生命。',
    about: [
      '你的飞船坠落在一颗被海洋覆盖的星球上。收集资源、建造海底基地、驾驶潜航器，一步步向从未有光抵达的深处进发。',
      '发光的珊瑚森林、巨型的深海生物，以及一个埋藏在海底的古老秘密正在等你。',
    ],
    achievementCount: 34, platforms: ['win'], tier: 'mid', featured: true, players: 15320,
  },
  {
    id: 'rogue-circuit', title: 'Rogue Circuit', developer: 'Bitforge', publisher: 'Bitforge',
    release: '2026-09-10', price: 78, discount: 10, saleEndsInH: 104, genres: ['动作', '独立'],
    tags: ['Roguelike', '俯视角射击', '赛博朋克', '快节奏', '构筑'], features: ['single', 'coop', 'controller', 'achievements', 'cloud'],
    rating: 91, recentRating: 91, reviews: 6230, sizeMB: 2100, palette: ['#0f0a1f', '#8b5cf6', '#22d3ee'], motif: 'grid', font: 'condensed',
    short: '侵入企业主机，在每次重启的电路迷宫中构筑致命的程序组合。',
    about: [
      '一款高速的俯视角 Roguelike 射击游戏。你是一段失控的 AI，每次被删除都会以新的形态重生。',
      '超过 300 种可组合的程序模块，数以千计的构筑可能，每一局都是全新的体验。',
    ],
    achievementCount: 45, platforms: ['win', 'linux'], tier: 'low', players: 4510,
  },
  {
    id: 'kitsune-gardens', title: 'Kitsune Gardens', developer: 'Moonpetal', publisher: 'Quiet Harbor',
    release: '2025-03-03', price: 58, discount: 0, genres: ['解谜', '休闲', '独立'],
    tags: ['解谜', '和风', '治愈', '手绘', '短篇'], features: ['single', 'controller', 'achievements'],
    rating: 94, recentRating: 93, reviews: 8840, sizeMB: 1400, palette: ['#2a0a12', '#e11d48', '#fecdd3'], motif: 'sun', font: 'serif',
    short: '帮助一只迷路的小狐狸，在四季变换的庭院里修复被打乱的时光。',
    about: [
      '一款以日式庭园为舞台的空间解谜游戏。旋转、折叠、重组庭院的碎片，让樱花、流水与石灯笼回到它们该在的位置。',
      '超过 120 道精心设计的谜题，配以温柔的和风原声。',
    ],
    achievementCount: 20, platforms: ['win', 'mac'], tier: 'low', players: 980,
  },
  {
    id: 'frontier-freight', title: 'Frontier Freight', developer: 'Longhaul Sim', publisher: 'Anchorline',
    release: '2024-10-11', price: 98, discount: 60, saleEndsInH: 30, genres: ['模拟'],
    tags: ['驾驶', '卡车', '放松', '开放世界', '经营'], features: ['single', 'multi', 'controller', 'workshop', 'achievements'],
    rating: 89, recentRating: 90, reviews: 27410, sizeMB: 24500, palette: ['#291507', '#ea580c', '#fed7aa'], motif: 'dunes', font: 'condensed',
    short: '驾驶重型卡车穿越荒漠与峡谷，建立横跨大陆的货运帝国。',
    about: [
      '超过 200 座城市、20 万公里的真实比例公路网络。从一名个体司机开始，逐步扩张为拥有数百辆卡车的物流公司。',
      '支持方向盘外设与创意工坊模组。',
    ],
    achievementCount: 38, platforms: ['win', 'mac', 'linux'], tier: 'mid', players: 12030,
  },
  {
    id: 'glacier-run', title: 'Glacier Run', developer: 'Snowcap Games', publisher: 'Snowcap Games',
    release: '2026-09-18', price: 42, discount: 0, genres: ['休闲', '独立', '动作'],
    tags: ['平台跳跃', '速通', '极简', '精确操作', '冬季'], features: ['single', 'controller', 'achievements', 'cloud'],
    rating: 87, recentRating: 87, reviews: 1840, sizeMB: 640, palette: ['#0c1a2b', '#38bdf8', '#f0f9ff'], motif: 'mountains', font: 'display',
    short: '一座冰山，一条路线，一次失误就从头再来。',
    about: ['在不断崩塌的冰川上奔跑、滑行、攀爬。极简美术与精准手感，为速通玩家打造的平台跳跃游戏。', '内置全球排行榜与幽灵回放。'],
    achievementCount: 22, platforms: ['win', 'mac', 'linux'], tier: 'low', players: 640,
  },
  {
    id: 'mechborn-arena', title: 'Mechborn Arena', developer: 'Titanworks', publisher: 'Titanworks',
    release: '2025-05-20', price: 0, discount: 0, genres: ['动作', '射击', '大型多人'],
    tags: ['免费开玩', '机甲', '第三人称射击', '团队竞技', '科幻'], features: ['multi', 'pvp', 'coop', 'controller', 'achievements'],
    rating: 83, recentRating: 85, reviews: 98120, sizeMB: 45800, palette: ['#111827', '#f59e0b', '#fde68a'], motif: 'city', font: 'condensed',
    short: '驾驶 30 米高的战斗机甲，在崩塌的城市中展开 12v12 的钢铁对决。',
    about: ['自由组装你的机甲：躯干、武装、推进器与核心模块，打造独一无二的钢铁战士。', '可破坏的城市环境，让每一场战斗都会改变战场地貌。'],
    achievementCount: 32, platforms: ['win'], tier: 'high', players: 98210,
  },
  {
    id: 'quiet-signal', title: 'The Quiet Signal', developer: 'Static Room', publisher: 'Static Room',
    release: '2025-10-31', price: 72, discount: 40, saleEndsInH: 58, genres: ['恐怖', '冒险', '独立'],
    tags: ['心理恐怖', '第一人称', '氛围', '剧情丰富', '解谜'], features: ['single', 'controller', 'achievements'],
    rating: 90, recentRating: 89, reviews: 14230, sizeMB: 9800, palette: ['#0a0a0a', '#3f1d1d', '#ef4444'], motif: 'forest', font: 'display',
    short: '一座废弃的无线电站，每晚 3:17，它会收到一个不该存在的信号。',
    about: ['作为新任守夜人，你被派往北方针叶林深处的无线电中继站。起初只是些杂音，直到那个声音开始叫你的名字。', '没有战斗，只有你、收音机和逐渐崩塌的理智。'],
    achievementCount: 16, platforms: ['win'], tier: 'mid', players: 1120,
  },
  {
    id: 'solace-station', title: 'Solace Station', developer: 'Hearthlight', publisher: 'Parallax Publishing',
    release: '2026-06-06', price: 108, discount: 20, saleEndsInH: 104, genres: ['生存', '模拟'],
    tags: ['太空', '合作', '生存建造', '物理', '管理'], features: ['single', 'coop', 'cloud', 'achievements', 'workshop'],
    rating: 86, recentRating: 88, reviews: 9120, sizeMB: 7600, palette: ['#0b1020', '#0d9488', '#5eead4'], motif: 'orbit', font: 'display',
    short: '和朋友一起维修一座漂浮在深空中的破旧空间站——并活下去。',
    about: ['氧气在泄漏，电力在衰减，货舱里好像还有什么东西在动。与最多 4 名好友合作，修复、扩建并守护这座空间站。', '基于物理的建造系统让每一个焊点都至关重要。'],
    achievementCount: 30, platforms: ['win', 'linux'], tier: 'mid', players: 3890,
  },
  {
    id: 'cardbound', title: 'Cardbound Legends', developer: 'Arcane Deck', publisher: 'Arcane Deck',
    release: '2025-12-04', price: 68, discount: 25, saleEndsInH: 30, genres: ['策略', '独立'],
    tags: ['卡牌构筑', 'Roguelike', '回合制', '奇幻', '策略'], features: ['single', 'cloud', 'achievements', 'controller'],
    rating: 95, recentRating: 96, reviews: 33402, sizeMB: 3300, palette: ['#1a1033', '#c026d3', '#fbcfe8'], motif: 'shards', font: 'serif',
    short: '构筑你的牌组，攀登不断变化的魔法之塔。',
    about: ['五名风格迥异的英雄，超过 500 张卡牌，以及无数种协同组合。每一次攀登都是全新的挑战。', '每日挑战与自定义模式，让策略深度无穷无尽。'],
    achievementCount: 44, platforms: ['win', 'mac', 'linux'], tier: 'low', players: 11240,
  },
  {
    id: 'skyforge-isles', title: 'Skyforge Isles', developer: 'Cloudwright', publisher: 'Cloudwright',
    release: '2024-08-01', price: 88, discount: 45, saleEndsInH: 58, genres: ['模拟', '冒险', '休闲'],
    tags: ['沙盒', '建造', '飞行', '合作', '开放世界'], features: ['single', 'coop', 'multi', 'controller', 'workshop', 'achievements'],
    rating: 92, recentRating: 90, reviews: 55210, sizeMB: 11200, palette: ['#0c2340', '#22c55e', '#bbf7d0'], motif: 'hills', font: 'display',
    short: '在漂浮于云海之上的群岛间建造飞艇、开辟航线、打造你的天空王国。',
    about: ['自由建造：从小木屋到巨型浮空城堡。收集资源，设计飞艇，探索被云海隔开的数百座岛屿。', '支持最多 8 人合作的共享世界。'],
    achievementCount: 36, platforms: ['win', 'mac'], tier: 'mid', players: 14320,
  },
  {
    id: 'dustline-outlaws', title: 'Dustline Outlaws', developer: 'Sixgun Studio', publisher: 'Northwind Interactive',
    release: '2026-02-26', price: 178, discount: 30, saleEndsInH: 104, genres: ['射击', '动作', '冒险'],
    tags: ['西部', '开放世界', '第三人称', '剧情丰富', '赏金猎人'], features: ['single', 'controller', 'cloud', 'achievements'],
    rating: 85, recentRating: 82, reviews: 24310, sizeMB: 72400, palette: ['#1f0f05', '#b45309', '#fcd34d'], motif: 'dunes', font: 'condensed',
    short: '在法律尚未抵达的荒野边境，做一个有原则的亡命之徒。',
    about: ['骑马穿越沙漠、峡谷与淘金小镇，接下赏金任务，与各方势力周旋。', '拥有完整的决斗系统与动态声望机制。'],
    achievementCount: 40, platforms: ['win'], tier: 'high', players: 9230,
  },
  {
    id: 'paper-moon-cafe', title: 'Paper Moon Café', developer: 'Soft Hours', publisher: 'Quiet Harbor',
    release: '2026-04-14', price: 52, discount: 0, genres: ['模拟', '休闲', '独立'],
    tags: ['经营', '治愈', '剧情', '可爱', '烹饪'], features: ['single', 'controller', 'cloud', 'achievements'],
    rating: 96, recentRating: 97, reviews: 7630, sizeMB: 1800, palette: ['#2b1a2e', '#f472b6', '#fde2e4'], motif: 'sun', font: 'serif',
    short: '一家只在月夜营业的小咖啡馆，为迷路的灵魂冲一杯热饮。',
    about: ['经营一家开在世界尽头的深夜咖啡馆，为形形色色的客人调制饮品，倾听他们的故事。', '温暖的手绘风格与 Lo-fi 原声，陪你度过每一个夜晚。'],
    achievementCount: 24, platforms: ['win', 'mac'], tier: 'low', players: 2210,
  },
  {
    id: 'oathbreaker', title: 'Oathbreaker Saga', developer: 'Hollowpeak Studios', publisher: 'Northwind Interactive',
    release: '2027-02-18', price: 298, discount: 0, genres: ['角色扮演', '动作'],
    tags: ['魂系', '黑暗奇幻', '困难', '开放世界', '即将推出'], features: ['single', 'controller', 'cloud', 'achievements'],
    rating: 0, recentRating: 0, reviews: 0, sizeMB: 95000, palette: ['#0d0d10', '#57534e', '#f5f5f4'], motif: 'mountains', font: 'serif',
    short: '《Ashen Meridian》原班团队全新力作。背誓者，终将被誓言吞噬。',
    about: ['在誓言即是法则的王国，你因打破誓言而被放逐。如今，你要逐一斩断束缚这个世界的七道古老誓约。', '全新的姿态系统与骑乘战斗，将魂系战斗推向新高度。'],
    achievementCount: 50, platforms: ['win'], tier: 'high', comingSoon: true,
  },
  {
    id: 'lumen-grid', title: 'Lumen Grid', developer: 'Quanta Play', publisher: 'Quanta Play',
    release: '2024-12-09', price: 38, discount: 50, saleEndsInH: 30, genres: ['解谜', '独立', '休闲'],
    tags: ['解谜', '极简', '逻辑', '放松', '光影'], features: ['single', 'achievements', 'cloud'],
    rating: 93, recentRating: 92, reviews: 4120, sizeMB: 420, palette: ['#030712', '#2563eb', '#e0f2fe'], motif: 'grid', font: 'display',
    short: '引导光线穿越网格，用反射与折射点亮黑暗中的每一个节点。',
    about: ['一款优雅的光学解谜游戏。镜面、棱镜与滤光片，组合出令人惊叹的光路。', '200 道谜题 + 关卡编辑器。'],
    achievementCount: 26, platforms: ['win', 'mac', 'linux'], tier: 'low', players: 310,
  },
  {
    id: 'metro-architect', title: 'Metro Architect', developer: 'Gridline', publisher: 'Anchorline',
    release: '2026-09-05', price: 138, discount: 10, saleEndsInH: 104, genres: ['模拟', '策略'],
    tags: ['城市建造', '交通', '管理', '沙盒', '经济'], features: ['single', 'workshop', 'cloud', 'achievements'],
    rating: 89, recentRating: 89, reviews: 11890, sizeMB: 16700, palette: ['#0f172a', '#6366f1', '#c7d2fe'], motif: 'city', font: 'display',
    short: '从一条公交线开始，设计一座千万人口都市的交通命脉。',
    about: ['规划地铁、轻轨、公交与高架，模拟每一位市民的出行路径，让城市高效运转。', '深度的经济与政治系统，以及海量创意工坊内容。'],
    achievementCount: 34, platforms: ['win', 'mac', 'linux'], tier: 'mid', featured: true, players: 18720,
  },
  {
    id: 'wildcall', title: 'Wildcall', developer: 'Timberline', publisher: 'Parallax Publishing',
    release: '2025-09-12', price: 98, discount: 35, saleEndsInH: 58, genres: ['生存', '冒险', '动作'],
    tags: ['生存', '狩猎', '开放世界', '合作', '写实'], features: ['single', 'coop', 'controller', 'achievements'],
    rating: 84, recentRating: 86, reviews: 19870, sizeMB: 31200, palette: ['#0b1a0e', '#4d7c0f', '#d9f99d'], motif: 'forest', font: 'condensed',
    short: '在广袤的北方荒野中狩猎、建造、求生，倾听大自然的呼唤。',
    about: ['动态生态系统中的数百种野生动物，真实的季节与天气变化。', '独自求生，或与最多 6 名好友组成狩猎小队。'],
    achievementCount: 32, platforms: ['win'], tier: 'high', players: 7020,
  },
  {
    id: 'blade-blossom', title: 'Blade & Blossom', developer: 'Sakura Frame', publisher: 'Redline Collective',
    release: '2026-05-29', price: 158, discount: 20, saleEndsInH: 58, genres: ['动作'],
    tags: ['格斗', '动漫', '竞技', '多人', '街机'], features: ['single', 'multi', 'pvp', 'controller', 'achievements'],
    rating: 88, recentRating: 84, reviews: 13420, sizeMB: 38400, palette: ['#1a0510', '#be123c', '#fda4af'], motif: 'sun', font: 'condensed',
    short: '樱花飞舞的刀剑格斗。一瞬的破绽，一刀定胜负。',
    about: ['24 名剑士，各自拥有独特的流派与连段系统。回滚网络代码带来流畅的线上对战体验。', '包含完整的剧情模式与训练模式。'],
    achievementCount: 40, platforms: ['win'], tier: 'mid', players: 6310,
  },
  {
    id: 'orbital-couriers', title: 'Orbital Couriers', developer: 'Wobbly Moon', publisher: 'Wobbly Moon',
    release: '2025-08-08', price: 58, discount: 40, saleEndsInH: 30, genres: ['休闲', '独立'],
    tags: ['派对游戏', '合作', '搞笑', '物理', '本地合作'], features: ['single', 'coop', 'multi', 'controller', 'achievements'],
    rating: 91, recentRating: 92, reviews: 22040, sizeMB: 2600, palette: ['#1b0b33', '#f97316', '#fef3c7'], motif: 'orbit', font: 'display',
    short: '宇宙最不靠谱的快递公司，和朋友一起把包裹（大概）完好地送到。',
    about: ['在失重的空间站、旋转的小行星与混乱的外星集市间投递包裹。', '支持最多 4 人本地或在线合作——友谊的考验从此开始。'],
    achievementCount: 30, platforms: ['win', 'mac', 'linux'], tier: 'low', players: 5230,
  },
  {
    id: 'chrono-relay', title: 'Chrono Relay', developer: 'Paradox Engine', publisher: 'Parallax Publishing',
    release: '2026-11-14', price: 128, discount: 0, genres: ['动作', '冒险'],
    tags: ['时间循环', '科幻', '动作', '剧情丰富', '即将推出'], features: ['single', 'controller', 'cloud', 'achievements'],
    rating: 0, recentRating: 0, reviews: 0, sizeMB: 28000, palette: ['#07121f', '#06b6d4', '#fae8ff'], motif: 'shards', font: 'display',
    short: '同一个小时，你已经经历了一千次。这一次，你要改变结局。',
    about: ['被困在一座漂浮都市毁灭前的最后 60 分钟。每一次循环，你都会记住更多线索，获得更多能力。', '即时时间操控战斗：减速、倒放、复制过去的自己。'],
    achievementCount: 36, platforms: ['win'], tier: 'high', comingSoon: true,
  },
]

export const gameMap = Object.fromEntries(games.map((g) => [g.id, g])) as Record<string, Game>
export const getGame = (id: string) => gameMap[id]

export const REQUIREMENTS: Record<Tier, { min: Record<string, string>; rec: Record<string, string> }> = {
  low: {
    min: { 操作系统: 'Windows 10 64 位', 处理器: 'Intel Core i3-6100 / AMD FX-6300', 内存: '4 GB RAM', 显卡: 'GTX 750 Ti / Radeon R7 260X', DirectX: '11 版本' },
    rec: { 操作系统: 'Windows 11 64 位', 处理器: 'Intel Core i5-8400 / Ryzen 5 2600', 内存: '8 GB RAM', 显卡: 'GTX 1050 Ti / RX 570', DirectX: '12 版本' },
  },
  mid: {
    min: { 操作系统: 'Windows 10 64 位', 处理器: 'Intel Core i5-8400 / Ryzen 5 2600', 内存: '8 GB RAM', 显卡: 'GTX 1060 6GB / RX 580', DirectX: '12 版本' },
    rec: { 操作系统: 'Windows 11 64 位', 处理器: 'Intel Core i7-10700 / Ryzen 7 3700X', 内存: '16 GB RAM', 显卡: 'RTX 3060 / RX 6600 XT', DirectX: '12 版本' },
  },
  high: {
    min: { 操作系统: 'Windows 10 64 位', 处理器: 'Intel Core i7-8700K / Ryzen 5 3600X', 内存: '16 GB RAM', 显卡: 'RTX 2070 / RX 5700 XT', DirectX: '12 版本' },
    rec: { 操作系统: 'Windows 11 64 位', 处理器: 'Intel Core i7-12700K / Ryzen 7 5800X3D', 内存: '32 GB RAM', 显卡: 'RTX 4070 / RX 7800 XT', DirectX: '12 版本' },
  },
}

export function ratingLabel(r: number, reviews: number) {
  if (!reviews) return { label: '暂无评测', tone: 'text-fg-3' }
  if (r >= 95 && reviews > 5000) return { label: '好评如潮', tone: 'text-[#6fd3ff]' }
  if (r >= 85) return { label: '特别好评', tone: 'text-[#6fd3ff]' }
  if (r >= 80) return { label: '多半好评', tone: 'text-[#6fd3ff]' }
  if (r >= 70) return { label: '褒贬不一', tone: 'text-away' }
  return { label: '多半差评', tone: 'text-danger' }
}
