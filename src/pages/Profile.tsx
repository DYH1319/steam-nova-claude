import { AnimatePresence, motion } from 'motion/react'
import { Award, Clock, Gamepad2, MapPin, MessageSquare, Pencil, Send, Trophy, User, UserPlus, Users } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { AchievementIcon } from '@/components/art/AchievementIcon'
import { Avatar, statusText, statusTone, type AnyStatus } from '@/components/art/Avatar'
import { GameArt, GameLogo } from '@/components/art/GameArt'
import { MiniCover } from '@/components/game'
import { Page } from '@/components/Page'
import { Button, EmptyState, Progress, SectionHeader, Skeleton } from '@/components/ui'
import { getAchievements, type Achievement } from '@/data/achievements'
import { gameMap } from '@/data/games'
import { badges, friendOwned, friendPlaytime, friendUnlocked, type ProfileComment } from '@/data/social'
import { useFakeLoad } from '@/lib/hooks'
import { useStore } from '@/store'
import { DAY, cn, formatDate, formatHours, rng, timeAgo } from '@/lib/utils'

interface GameStat { id: string; playtime: number; lastPlayed: number | null; unlocked: Set<string>; unlockedAt: Record<string, number> }

function LevelBadge({ level, size = 36 }: { level: number; size?: number }) {
  const color = level >= 100 ? '#ffcf5a' : level >= 50 ? '#ff6a3d' : level >= 20 ? '#52c7ff' : '#a4abbb'
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg viewBox="0 0 40 40" className="absolute inset-0"><polygon points="20,2 36,11 36,29 20,38 4,29 4,11" fill="none" stroke={color} strokeWidth="2.5" /></svg>
      <span className="font-display text-[13px] font-bold" style={{ color }}>{level}</span>
    </div>
  )
}

export default function Profile() {
  const { id } = useParams()
  const isMe = !id || id === 'me'
  const me = useStore((s) => s.me)
  const owned = useStore((s) => s.owned)
  const friends = useStore((s) => s.friends)
  const comments = useStore((s) => s.comments)
  const running = useStore((s) => s.running)
  const { set, openChat, addComment, toast } = useStore()
  const nav = useNavigate()
  const loading = useFakeLoad(id ?? 'me', 500)
  const [text, setText] = useState('')
  const [friendComments, setFriendComments] = useState<Record<string, ProfileComment[]>>({})

  const friend = !isMe ? friends.find((f) => f.id === id) : null

  const stats: GameStat[] = useMemo(() => {
    if (isMe) return Object.entries(owned).map(([gid, o]) => ({ id: gid, playtime: o.playtime, lastPlayed: o.lastPlayed, unlocked: new Set(Object.keys(o.unlocked)), unlockedAt: o.unlocked }))
    if (!friend) return []
    const r = rng(friend.id + ':profile')
    return friendOwned(friend.id).map((gid) => {
      const u = friendUnlocked(friend.id, gid)
      const lp = Date.now() - Math.round(Math.pow(r(), 2) * 60) * DAY
      return { id: gid, playtime: friendPlaytime(friend.id, gid), lastPlayed: friend.gameId === gid ? Date.now() : lp, unlocked: u, unlockedAt: Object.fromEntries([...u].map((a) => [a, lp - r() * 90 * DAY])) }
    })
  }, [isMe, owned, friend])

  if (!isMe && !friend) return <EmptyState icon={User} title="找不到该用户" body="该用户可能已不是你的好友，或资料设为私密。" action={<Button variant="primary" onClick={() => nav('/friends')}>返回好友</Button>} />

  const name = isMe ? me.name : friend!.name
  const seed = isMe ? me.avatarSeed : friend!.id
  const level = isMe ? me.level : friend!.level
  const status: AnyStatus = isMe ? (me.status === 'online' && running ? 'ingame' : me.status) : friend!.status
  const currentGame = isMe ? running?.gameId : friend!.gameId
  const bio = isMe ? me.bio : friend!.bio
  const country = isMe ? me.country : friend!.country

  const totalMin = stats.reduce((s, x) => s + x.playtime, 0)
  const achAll: { a: Achievement; at: number }[] = stats.flatMap((s) => getAchievements(s.id).filter((a) => s.unlocked.has(a.id)).map((a) => ({ a, at: s.unlockedAt[a.id] })))
  const perfect = stats.filter((s) => { const l = getAchievements(s.id); return l.length && l.every((a) => s.unlocked.has(a.id)) }).length
  const showcase = gameMap[isMe ? me.showcaseGameId : [...stats].sort((a, b) => b.playtime - a.playtime)[0]?.id ?? 'ashen-meridian']
  const showStat = stats.find((s) => s.id === showcase.id)
  const rare = [...achAll].sort((a, b) => a.a.rarity - b.a.rarity).slice(0, 6)
  const recent = [...stats].filter((s) => s.lastPlayed).sort((a, b) => b.lastPlayed! - a.lastPlayed!).slice(0, 3)
  const myBadges = isMe ? badges : badges.filter((_, i) => rng(friend!.id + i)() < 0.55)
  const xpBase = level * 160
  const xpPct = isMe ? Math.min(100, ((me.xp - xpBase) / 160) * 100) : 40
  const wall = isMe ? comments : friendComments[friend!.id] ?? []
  const friendList = isMe ? friends : friends.filter((f) => f.id !== friend!.id).slice(0, 6)

  const post = () => {
    if (!text.trim()) return
    if (isMe) addComment(text.trim())
    else setFriendComments((c) => ({ ...c, [friend!.id]: [{ id: String(Date.now()), author: me.name, authorId: 'me', text: text.trim(), at: Date.now() }, ...(c[friend!.id] ?? [])] }))
    setText('')
    toast({ kind: 'success', title: '留言已发布' }, 2000)
  }

  return (
    <Page>
      <div className="relative h-72 overflow-hidden">
        <GameArt game={showcase} variant={1} className="h-full w-full" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-1 via-ink-1/60 to-ink-1/10" />
      </div>
      <div className="relative mx-auto -mt-36 max-w-[1180px] px-8 pb-12">
        <div className="flex items-end gap-6">
          <div className="rounded-[34px] bg-gradient-to-br from-nova via-nova-hot to-[#7c3aed] p-[3px] shadow-2xl">
            <div className="rounded-[31px] bg-ink-1 p-1"><Avatar seed={seed} name={name} size={140} /></div>
          </div>
          <div className="min-w-0 flex-1 pb-2">
            <div className="flex items-center gap-3">
              <h1 className="font-display text-4xl font-bold">{name}</h1>
              <LevelBadge level={level} />
            </div>
            <div className="mt-2 flex items-center gap-4 text-[13px] text-fg-3">
              {isMe && <span>{me.realName}</span>}
              <span className="flex items-center gap-1"><MapPin size={13} />{country}</span>
              <span className={cn('flex items-center gap-1.5', statusTone[status])}><span className="h-2 w-2 rounded-full bg-current" />{currentGame && status === 'ingame' ? `正在玩 ${gameMap[currentGame].title}` : statusText[status]}</span>
            </div>
            {bio && <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-fg-2">{bio}</p>}
          </div>
          <div className="w-64 pb-2">
            <div className="rounded-2xl bg-ink-2/90 p-4 ring-1 ring-white/[0.06] backdrop-blur">
              <div className="flex items-center justify-between text-[12px]"><span className="text-fg-3">等级 {level}</span><span className="text-fg-3 tabular-nums">{isMe ? `${me.xp - xpBase} / 160 XP` : ''}</span></div>
              <Progress value={xpPct} className="mt-2" />
              <div className="mt-3 flex gap-2">
                {isMe ? (
                  <Button variant="secondary" size="sm" icon={Pencil} className="flex-1" onClick={() => set({ editProfileOpen: true })}>编辑个人资料</Button>
                ) : (
                  <>
                    <Button variant="primary" size="sm" icon={MessageSquare} className="flex-1" onClick={() => openChat(friend!.id)}>发消息</Button>
                    <Button variant="secondary" size="sm" icon={Users} onClick={() => nav(`/friends?f=${friend!.id}`)}>好友</Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-6 gap-3">
          {[
            [Gamepad2, '游戏', stats.length],
            [Clock, '总时长', formatHours(totalMin)],
            [Trophy, '成就', achAll.length.toLocaleString()],
            [Award, '完美游戏', perfect],
            [Users, '好友', isMe ? friends.length : Math.round(rng(friend!.id)() * 80 + 12)],
            [Award, '徽章', myBadges.length],
          ].map(([I, k, v]) => {
            const Icon = I as typeof Clock
            return (
              <div key={k as string} className="rounded-2xl bg-ink-2 p-4 ring-1 ring-white/[0.05]">
                <div className="flex items-center gap-1.5 text-[11.5px] text-fg-3"><Icon size={13} />{k as string}</div>
                <div className="mt-1 font-display text-xl font-bold tabular-nums">{v as string}</div>
              </div>
            )
          })}
        </div>

        {loading ? (
          <div className="mt-8 grid grid-cols-[1fr_320px] gap-6"><div className="space-y-4"><Skeleton className="h-72 rounded-2xl" /><Skeleton className="h-40 rounded-2xl" /></div><Skeleton className="h-96 rounded-2xl" /></div>
        ) : (
          <div className="mt-8 grid grid-cols-[1fr_320px] gap-6">
            <div className="min-w-0 space-y-8">
              <section>
                <SectionHeader title="最爱的游戏" />
                <Link to={isMe ? `/library/${showcase.id}` : `/game/${showcase.id}`} className="group relative block h-64 overflow-hidden rounded-2xl ring-1 ring-white/[0.06]">
                  <GameArt game={showcase} className="h-full w-full transition duration-700 group-hover:scale-[1.03]" />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/40 to-transparent" />
                  <div className="absolute inset-0 flex flex-col justify-end p-7">
                    <GameLogo game={showcase} className="text-4xl" />
                    <div className="mt-4 flex gap-8 text-[12.5px]">
                      <div><div className="text-white/60">游戏时间</div><div className="font-display text-xl font-bold text-white">{formatHours(showStat?.playtime ?? 0)}</div></div>
                      <div><div className="text-white/60">成就</div><div className="font-display text-xl font-bold text-white">{showStat?.unlocked.size ?? 0} / {getAchievements(showcase.id).length}</div></div>
                      {showStat?.lastPlayed && <div><div className="text-white/60">最后游玩</div><div className="font-display text-xl font-bold text-white">{timeAgo(showStat.lastPlayed)}</div></div>}
                    </div>
                  </div>
                </Link>
              </section>

              {rare.length > 0 && (
                <section>
                  <SectionHeader title="稀有成就展柜" />
                  <div className="grid grid-cols-6 gap-3">
                    {rare.map(({ a }) => (
                      <div key={a.id} className="group flex flex-col items-center rounded-2xl bg-ink-2 p-4 text-center ring-1 ring-white/[0.05] transition hover:-translate-y-0.5 hover:ring-gold/30">
                        <AchievementIcon a={a} unlocked size={56} />
                        <div className="mt-3 line-clamp-1 text-[12px] font-medium">{a.name}</div>
                        <div className="mt-0.5 text-[10.5px] text-gold tabular-nums">{a.rarity}%</div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              <section>
                <SectionHeader title="最近动态" subtitle={`过去两周 ${formatHours(recent.reduce((s, x) => s + Math.min(x.playtime, 900), 0))}`} />
                <div className="space-y-3">
                  {recent.map((s) => {
                    const g = gameMap[s.id]
                    const achs = getAchievements(s.id)
                    const u = achs.filter((a) => s.unlocked.has(a.id))
                    return (
                      <div key={s.id} className="flex gap-4 rounded-2xl bg-ink-2 p-3 ring-1 ring-white/[0.05]">
                        <Link to={`/game/${g.id}`}><GameArt game={g} title="landscape" className="aspect-[16/9] w-56 rounded-xl" /></Link>
                        <div className="flex min-w-0 flex-1 flex-col py-1 pr-2">
                          <div className="flex items-start justify-between gap-3">
                            <Link to={`/game/${g.id}`} className="font-display text-[16px] font-semibold hover:text-nova-soft">{g.title}</Link>
                            <div className="text-right text-[11.5px] text-fg-3">总时数 {formatHours(s.playtime)}<br />最后运行 {timeAgo(s.lastPlayed!)}</div>
                          </div>
                          <div className="mt-auto">
                            <div className="mb-1.5 flex justify-between text-[11.5px] text-fg-3"><span>成就进度</span><span className="tabular-nums">{u.length} / {achs.length}</span></div>
                            <Progress value={(u.length / achs.length) * 100} className="mb-2.5" />
                            <div className="flex gap-1.5">
                              {u.slice(0, 8).map((a) => <AchievementIcon key={a.id} a={a} unlocked size={30} />)}
                              {u.length > 8 && <span className="flex h-[30px] items-center rounded-lg bg-white/[0.05] px-2 text-[11px] text-fg-3">+{u.length - 8}</span>}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>

              <section>
                <SectionHeader title="留言板" subtitle={`${wall.length} 条留言`} />
                <div className="rounded-2xl bg-ink-2 p-4 ring-1 ring-white/[0.05]">
                  <div className="flex gap-3">
                    <Avatar seed={me.avatarSeed} name={me.name} size={36} />
                    <div className="flex flex-1 gap-2">
                      <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && post()} placeholder={isMe ? '写点什么…' : `给 ${name} 留言`} className="input h-9 flex-1" maxLength={200} />
                      <Button variant="primary" icon={Send} disabled={!text.trim()} onClick={post}>发布</Button>
                    </div>
                  </div>
                  <div className="mt-4 space-y-1">
                    {wall.length === 0 && <div className="py-6 text-center text-[13px] text-fg-3">还没有留言，来做第一个吧</div>}
                    <AnimatePresence initial={false}>
                      {wall.map((c) => (
                        <motion.div key={c.id} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="flex gap-3 rounded-xl p-2.5 hover:bg-white/[0.02]">
                          <Link to={c.authorId === 'me' ? '/profile' : `/profile/${c.authorId}`}><Avatar seed={c.authorId === 'me' ? me.avatarSeed : c.authorId} name={c.author} size={34} /></Link>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 text-[12.5px]"><span className="font-semibold">{c.authorId === 'me' ? me.name : c.author}</span><span className="text-fg-4">{timeAgo(c.at)}</span></div>
                            <div className="mt-0.5 text-[13.5px] text-fg-2">{c.text}</div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              </section>
            </div>

            <aside className="space-y-5">
              {currentGame && status === 'ingame' && (
                <Link to={`/game/${currentGame}`} className="relative block overflow-hidden rounded-2xl ring-1 ring-ingame/30">
                  <GameArt game={gameMap[currentGame]} className="h-28" />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/85 to-black/20" />
                  <div className="absolute inset-0 flex flex-col justify-center p-4">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-ingame uppercase"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-ingame" />正在游戏中</div>
                    <div className="mt-1 font-display text-lg font-semibold text-white">{gameMap[currentGame].title}</div>
                  </div>
                </Link>
              )}
              <div className="rounded-2xl bg-ink-2 p-5 ring-1 ring-white/[0.05]">
                <div className="mb-4 flex items-center justify-between text-sm font-semibold">徽章 <span className="text-xs font-normal text-fg-3">{myBadges.length}</span></div>
                <div className="grid grid-cols-3 gap-3">
                  {myBadges.map((b) => (
                    <div key={b.id} className="group relative flex flex-col items-center text-center" title={b.desc}>
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl transition group-hover:scale-110" style={{ background: `radial-gradient(circle at 30% 25%, ${b.color}, ${b.color}33 70%)`, boxShadow: `0 8px 24px -8px ${b.color}88` }}>
                        <Award size={24} className="text-white drop-shadow" />
                      </div>
                      <div className="mt-2 line-clamp-1 text-[11px] text-fg-2">{b.name}</div>
                      <div className="text-[10px] text-fg-4">{b.xp} XP</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl bg-ink-2 p-5 ring-1 ring-white/[0.05]">
                <div className="mb-3 flex items-center justify-between text-sm font-semibold">游戏库 <Link to={isMe ? '/library' : `/friends?f=${friend!.id}`} className="text-xs font-normal text-fg-3 hover:text-nova">{stats.length} 款</Link></div>
                <div className="grid grid-cols-4 gap-1.5">
                  {[...stats].sort((a, b) => b.playtime - a.playtime).slice(0, 8).map((s) => (
                    <Link key={s.id} to={`/game/${s.id}`}><MiniCover game={gameMap[s.id]} className="aspect-square transition hover:scale-105" /></Link>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl bg-ink-2 p-5 ring-1 ring-white/[0.05]">
                <div className="mb-3 flex items-center justify-between text-sm font-semibold">好友 {isMe && <button onClick={() => set({ addFriendOpen: true })} className="text-fg-3 hover:text-nova"><UserPlus size={15} /></button>}</div>
                <div className="space-y-1">
                  {friendList.slice(0, 6).map((f) => (
                    <Link key={f.id} to={`/profile/${f.id}`} className="flex items-center gap-2.5 rounded-lg p-1.5 hover:bg-white/[0.04]">
                      <Avatar seed={f.id} name={f.name} size={30} status={f.status} />
                      <div className="min-w-0 flex-1">
                        <div className={cn('truncate text-[13px]', f.status === 'ingame' ? 'text-ingame' : f.status === 'offline' ? 'text-fg-3' : 'text-fg')}>{f.name}</div>
                      </div>
                      <LevelBadge level={f.level} size={26} />
                    </Link>
                  ))}
                </div>
              </div>
              <div className="px-1 text-[11.5px] text-fg-4">{isMe ? `Nova 会员自 ${formatDate(me.joinedAt)}` : `成为好友于 ${formatDate(friend!.since)}`}</div>
            </aside>
          </div>
        )}
      </div>
    </Page>
  )
}
