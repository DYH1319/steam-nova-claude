import {
  Anchor, Clock, Coins, Compass, Crown, Eye, Feather, Flag, Flame, Gem, Ghost, Hammer, Heart, Key, Leaf, Lock, Map, Medal,
  Moon, Mountain, Rocket, Shield, Skull, Sparkles, Star, Sun, Sword, Target, Trophy, Users, Zap, type LucideIcon,
} from 'lucide-react'
import type { AchIcon, Achievement } from '@/data/achievements'
import { gameMap } from '@/data/games'
import { cn, mix } from '@/lib/utils'

const ICONS: Record<AchIcon, LucideIcon> = {
  trophy: Trophy, sword: Sword, shield: Shield, star: Star, flame: Flame, crown: Crown, skull: Skull, gem: Gem, compass: Compass,
  map: Map, target: Target, zap: Zap, heart: Heart, rocket: Rocket, mountain: Mountain, clock: Clock, coins: Coins, eye: Eye,
  ghost: Ghost, key: Key, medal: Medal, anchor: Anchor, leaf: Leaf, moon: Moon, sun: Sun, feather: Feather, flag: Flag,
  hammer: Hammer, sparkles: Sparkles, users: Users,
}

export function AchievementIcon({ a, unlocked, size = 48, className, hideSecret }: { a: Achievement; unlocked: boolean; size?: number; className?: string; hideSecret?: boolean }) {
  const g = gameMap[a.gameId]
  const [c0, c1, c2] = g.palette
  const Icon = hideSecret && !unlocked ? Lock : ICONS[a.icon]
  const rare = a.rarity < 5
  return (
    <div
      className={cn('relative shrink-0 overflow-hidden', !unlocked && 'grayscale', className)}
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.24,
        background: unlocked ? `linear-gradient(145deg, ${mix(c2, c1, 0.25)}, ${c1} 55%, ${mix(c0, '#000000', 0.2)})` : 'linear-gradient(145deg,#2a3040,#141821)',
        boxShadow: unlocked && rare ? `0 0 0 1.5px #ffcf5a, 0 0 18px -2px ${'#ffcf5a'}88` : 'inset 0 0 0 1px rgb(255 255 255 / 0.08)',
        opacity: unlocked ? 1 : 0.55,
      }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.35),transparent_55%)]" />
      <Icon className="absolute inset-0 m-auto text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]" style={{ width: size * 0.48, height: size * 0.48 }} strokeWidth={2} />
    </div>
  )
}
