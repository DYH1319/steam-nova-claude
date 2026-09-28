import { useMemo } from 'react'
import { useLocation } from 'react-router'
import { statusText } from '@/components/art/Avatar'
import { gameMap } from '@/data/games'
import type { Friend } from '@/data/social'
import { useStore } from '@/store'
import { timeAgo } from '@/lib/utils'

export function friendSubline(f: Friend) {
  if (f.status === 'ingame' && f.gameId) return gameMap[f.gameId]?.title
  if (f.status === 'offline') return f.lastSeen ? `上次在线 ${timeAgo(f.lastSeen)}` : '离线'
  return statusText[f.status]
}

export function useGroupedFriends(q: string) {
  const friends = useStore((s) => s.friends)
  return useMemo(() => {
    const list = friends.filter((f) => f.name.toLowerCase().includes(q.toLowerCase()))
    const fav = list.filter((f) => f.favorite)
    const rest = list.filter((f) => !f.favorite)
    return {
      fav,
      ingame: rest.filter((f) => f.status === 'ingame'),
      online: rest.filter((f) => f.status === 'online' || f.status === 'away'),
      offline: rest.filter((f) => f.status === 'offline').sort((a, b) => (b.lastSeen ?? 0) - (a.lastSeen ?? 0)),
      total: list.length,
    }
  }, [friends, q])
}

export function usePanelVisible() {
  const open = useStore((s) => s.friendsPanel)
  const loc = useLocation()
  return open && !loc.pathname.startsWith('/friends')
}
