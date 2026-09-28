import { useEffect } from 'react'
import { Navigate, Route, Routes, useNavigate } from 'react-router'
import { TitleBar } from '@/components/shell/TitleBar'
import { TopNav } from '@/components/shell/TopNav'
import { StatusBar } from '@/components/shell/StatusBar'
import { FriendsPanel } from '@/components/shell/FriendsPanel'
import { ChatDock } from '@/components/shell/ChatDock'
import { Toasts } from '@/components/shell/Toasts'
import { CommandPalette } from '@/components/shell/CommandPalette'
import { GlobalModals } from '@/components/modals'
import { StoreLayout } from '@/pages/store/StoreLayout'
import StoreHome from '@/pages/store/StoreHome'
import Browse from '@/pages/store/Browse'
import GameDetail from '@/pages/store/GameDetail'
import Wishlist from '@/pages/store/Wishlist'
import { LibraryLayout } from '@/pages/library/LibraryLayout'
import LibraryHome from '@/pages/library/LibraryHome'
import LibraryGame from '@/pages/library/LibraryGame'
import Downloads from '@/pages/Downloads'
import Friends from '@/pages/Friends'
import Achievements from '@/pages/achievements/Achievements'
import GameAchievements from '@/pages/achievements/GameAchievements'
import Profile from '@/pages/Profile'
import { useStore } from '@/store'

function useSimulation() {
  useEffect(() => {
    const s = useStore.getState
    const a = setInterval(() => { s().tickDownloads(); s().tickRunning() }, 1000)
    const b = setInterval(() => s().tickFriends(), 38000)
    return () => { clearInterval(a); clearInterval(b) }
  }, [])
}

function useShortcuts() {
  const nav = useNavigate()
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        useStore.getState().set({ paletteOpen: !useStore.getState().paletteOpen })
      }
      if (e.altKey && e.key === 'ArrowLeft') nav(-1)
      if (e.altKey && e.key === 'ArrowRight') nav(1)
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [nav])
}

export default function App() {
  useSimulation()
  useShortcuts()
  return (
    <div className="flex h-full flex-col bg-ink-1">
      <TitleBar />
      <TopNav />
      <div className="flex min-h-0 flex-1">
        <main className="relative min-w-0 flex-1">
          <Routes>
            <Route path="/" element={<Navigate to="/store" replace />} />
            <Route element={<StoreLayout />}>
              <Route path="/store" element={<StoreHome />} />
              <Route path="/store/browse" element={<Browse />} />
              <Route path="/store/wishlist" element={<Wishlist />} />
              <Route path="/game/:id" element={<GameDetail />} />
            </Route>
            <Route path="/library" element={<LibraryLayout />}>
              <Route index element={<LibraryHome />} />
              <Route path=":id" element={<LibraryGame />} />
            </Route>
            <Route path="/downloads" element={<Downloads />} />
            <Route path="/friends" element={<Friends />} />
            <Route path="/achievements" element={<Achievements />} />
            <Route path="/achievements/:id" element={<GameAchievements />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/:id" element={<Profile />} />
            <Route path="*" element={<Navigate to="/store" replace />} />
          </Routes>
        </main>
        <FriendsPanel />
      </div>
      <StatusBar />
      <ChatDock />
      <Toasts />
      <CommandPalette />
      <GlobalModals />
    </div>
  )
}
