import { memo, useId, useMemo, type ReactNode } from 'react'
import type { Game, TitleFont } from '@/data/games'
import { cn, mix, pick, range, rng } from '@/lib/utils'

type R = () => number
type Pal = [string, string, string]

const W = 600

function stars(r: R, n: number, maxY: number, color = '#ffffff') {
  return Array.from({ length: n }, (_, i) => (
    <circle key={`s${i}`} cx={r() * W} cy={r() * maxY} r={range(r, 0.5, 1.9)} fill={color} opacity={range(r, 0.2, 0.9)} />
  ))
}

function ridge(r: R, baseY: number, amp: number, step: number) {
  let y = baseY - amp * range(r, 0.3, 0.8)
  let d = `M0,${W} L0,${y.toFixed(1)}`
  for (let x = step; x <= W + step; x += step * range(r, 0.6, 1.4)) {
    y = Math.max(baseY - amp, Math.min(baseY, y + (r() - 0.5) * amp * 0.9))
    d += ` L${x.toFixed(1)},${y.toFixed(1)}`
  }
  return d + ` L${W + 60},${W} Z`
}

function smooth(r: R, baseY: number, amp: number, step: number) {
  const pts: [number, number][] = []
  for (let x = -step; x <= W + step * 2; x += step * range(r, 0.7, 1.3)) pts.push([x, baseY - r() * amp])
  let d = `M${pts[0][0]},${W} L${pts[0][0]},${pts[0][1]}`
  for (let i = 0; i < pts.length - 1; i++) {
    const [x1, y1] = pts[i]
    const [x2, y2] = pts[i + 1]
    d += ` Q${x1},${y1} ${(x1 + x2) / 2},${(y1 + y2) / 2}`
  }
  return d + ` L${pts[pts.length - 1][0]},${W} Z`
}

function figure(x: number, y: number, s: number, fill: string) {
  return (
    <g transform={`translate(${x},${y}) scale(${s})`} fill={fill}>
      <path d="M-11,0 L-7,-30 Q0,-42 7,-30 L11,0 Z" />
      <circle cx="0" cy="-38" r="5.5" />
      <path d="M6,-26 L22,-4 L20,-2 L4,-22 Z" opacity="0.9" />
    </g>
  )
}

function scene(r: R, g: Game, id: string): { defs: ReactNode; body: ReactNode } {
  const [c0, c1, c2] = g.palette as Pal
  const dark = mix(c0, '#000000', 0.35)
  const defs: ReactNode[] = []
  const body: ReactNode[] = []
  const sunX = range(r, 200, 400)

  switch (g.motif) {
    case 'mountains': {
      body.push(...stars(r, 40, 260))
      body.push(<circle key="sun" cx={sunX} cy={range(r, 210, 260)} r={range(r, 38, 64)} fill={c2} opacity={0.92} />)
      const far = mix(c1, c2, 0.18)
      for (let i = 0; i < 4; i++) {
        body.push(<path key={`m${i}`} d={ridge(r, 300 + i * 52, 110 - i * 18, 26 + i * 8)} fill={mix(far, dark, (i / 3) * 0.92)} opacity={i === 0 ? 0.75 : 1} />)
        if (i < 3) body.push(<rect key={`f${i}`} x="0" y={290 + i * 52} width={W} height="80" fill={c2} opacity="0.05" />)
      }
      body.push(<g key="fig">{figure(range(r, 180, 420), 470, 1.1, dark)}</g>)
      break
    }
    case 'grid': {
      body.push(...stars(r, 50, 300))
      defs.push(
        <linearGradient key="sg" id={`${id}sg`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={c2} /><stop offset="1" stopColor={c1} /></linearGradient>,
        <mask key="sm" id={`${id}sm`}><rect width={W} height={W} fill="white" />{Array.from({ length: 7 }, (_, i) => <rect key={i} x="0" y={300 + i * 9 + i * i * 0.6} width={W} height={2 + i * 1.2} fill="black" />)}</mask>,
      )
      body.push(<circle key="sun" cx="300" cy="300" r="118" fill={`url(#${id}sg)`} mask={`url(#${id}sm)`} />)
      body.push(<path key="mt" d={ridge(r, 362, 70, 30)} fill={mix(c0, c1, 0.35)} />)
      body.push(<rect key="gr" x="0" y="360" width={W} height="240" fill={dark} />)
      body.push(<rect key="hz" x="0" y="352" width={W} height="12" fill={c2} opacity="0.35" />)
      for (let k = -14; k <= 14; k++) body.push(<line key={`v${k}`} x1={300 + k * 12} y1="360" x2={300 + k * 120} y2="600" stroke={c2} strokeOpacity="0.5" strokeWidth="1.4" />)
      for (let i = 1; i <= 12; i++) body.push(<line key={`h${i}`} x1="0" x2={W} y1={360 + i * i * 1.7} y2={360 + i * i * 1.7} stroke={c2} strokeOpacity="0.45" strokeWidth="1.4" />)
      break
    }
    case 'orbit': {
      body.push(...stars(r, 110, 600))
      const cx = range(r, 320, 400), cy = range(r, 290, 330), R = range(r, 120, 160)
      defs.push(
        <radialGradient key="pg" id={`${id}pg`} cx="0.32" cy="0.3" r="0.8"><stop offset="0" stopColor={c2} /><stop offset="0.45" stopColor={c1} /><stop offset="1" stopColor={dark} /></radialGradient>,
      )
      const rx = R * 1.75, ry = R * 0.32
      body.push(<ellipse key="rb" cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke={c2} strokeOpacity="0.35" strokeWidth="6" transform={`rotate(-16 ${cx} ${cy})`} />)
      body.push(<circle key="pl" cx={cx} cy={cy} r={R} fill={`url(#${id}pg)`} />)
      for (let i = 0; i < 5; i++) body.push(<ellipse key={`b${i}`} cx={cx} cy={cy - R * 0.5 + i * R * 0.25} rx={R * 0.95} ry={4} fill={c0} opacity="0.12" />)
      body.push(<path key="rf" d={`M${cx - rx},${cy} A${rx},${ry} 0 0 0 ${cx + rx},${cy}`} fill="none" stroke={c2} strokeOpacity="0.8" strokeWidth="6" transform={`rotate(-16 ${cx} ${cy})`} />)
      body.push(<circle key="mn" cx={cx - R * 1.6} cy={cy - R * 0.9} r={R * 0.16} fill={mix(c2, c1, 0.4)} />)
      body.push(<circle key="mn2" cx={cx + R * 1.2} cy={cy + R * 1.1} r={R * 0.08} fill={c2} opacity="0.8" />)
      break
    }
    case 'forest': {
      body.push(...stars(r, 30, 240))
      body.push(<circle key="moon" cx={sunX} cy={range(r, 180, 240)} r={range(r, 30, 48)} fill={c2} opacity="0.9" />)
      body.push(<circle key="halo" cx={sunX} cy="210" r="140" fill={c2} opacity="0.06" />)
      for (let i = 0; i < 4; i++) {
        const baseY = 340 + i * 58
        const col = mix(mix(c1, c2, 0.12), dark, 0.28 + i * 0.24)
        const trees: ReactNode[] = []
        const n = 22 - i * 3
        for (let t = 0; t < n; t++) {
          const x = (t / n) * W + range(r, -20, 20)
          const h = range(r, 70, 150) * (1 + i * 0.28)
          const w = h * 0.3
          trees.push(<path key={t} d={`M${x},${baseY - h} L${x + w * 0.55},${baseY - h * 0.55} L${x + w * 0.3},${baseY - h * 0.55} L${x + w},${baseY + 4} L${x - w},${baseY + 4} L${x - w * 0.3},${baseY - h * 0.55} L${x - w * 0.55},${baseY - h * 0.55} Z`} />)
        }
        body.push(<g key={`t${i}`} fill={col}>{trees}<rect x="0" y={baseY} width={W} height={W} /></g>)
        body.push(<rect key={`fog${i}`} x="0" y={baseY - 40} width={W} height="60" fill={c2} opacity="0.045" />)
      }
      break
    }
    case 'waves': {
      body.push(...stars(r, 35, 240))
      body.push(<circle key="sun" cx={sunX} cy="318" r={range(r, 60, 90)} fill={c2} opacity="0.95" />)
      defs.push(<linearGradient key="rf" id={`${id}rf`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={c2} stopOpacity="0.45" /><stop offset="1" stopColor={c2} stopOpacity="0" /></linearGradient>)
      for (let i = 0; i < 7; i++) {
        const y0 = 322 + i * i * 6 + i * 14
        const amp = 3 + i * 3
        const wl = range(r, 90, 160) + i * 20
        const ph = r() * Math.PI * 2
        let d = `M-20,${W} L-20,${y0}`
        for (let x = -20; x <= W + 20; x += 12) d += ` L${x},${(y0 + Math.sin(x / wl * Math.PI * 2 + ph) * amp).toFixed(1)}`
        d += ` L${W + 20},${W} Z`
        body.push(<path key={`w${i}`} d={d} fill={mix(mix(c1, c0, 0.2), dark, i / 6.5)} stroke={c2} strokeOpacity={0.22 - i * 0.02} strokeWidth="1.5" />)
        if (i === 1) body.push(<rect key="refl" x={sunX - 50} y="330" width="100" height="200" fill={`url(#${id}rf)`} />)
      }
      break
    }
    case 'shards': {
      body.push(...stars(r, 30, 600, c2))
      body.push(<polygon key="band" points="0,400 600,170 600,250 0,480" fill={c2} opacity="0.12" />)
      for (let i = 0; i < 18; i++) {
        const cx = r() * W, cy = range(r, 80, 540), s = range(r, 30, 160)
        const pts = Array.from({ length: 3 }, () => `${(cx + (r() - 0.5) * s * 2).toFixed(0)},${(cy + (r() - 0.5) * s * 2).toFixed(0)}`).join(' ')
        body.push(<polygon key={`p${i}`} points={pts} fill={pick(r, [c1, c2, mix(c1, c2, 0.5), mix(c1, c0, 0.4)])} opacity={range(r, 0.15, 0.75)} stroke={c2} strokeOpacity="0.25" />)
      }
      defs.push(<linearGradient key="cg" id={`${id}cg`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={c2} /><stop offset="1" stopColor={c1} /></linearGradient>)
      body.push(<polygon key="crystal" points="300,150 360,300 300,450 240,300" fill={`url(#${id}cg)`} opacity="0.95" />)
      body.push(<polygon key="crystal2" points="300,150 330,300 300,450" fill="#fff" opacity="0.18" />)
      body.push(<circle key="glow" cx="300" cy="300" r="170" fill={c2} opacity="0.07" />)
      break
    }
    case 'hills': {
      body.push(<circle key="sun" cx={range(r, 380, 480)} cy={range(r, 140, 190)} r="52" fill={c2} opacity="0.95" />)
      for (let i = 0; i < 6; i++) {
        const cx = r() * W, cy = range(r, 110, 260)
        body.push(<ellipse key={`c${i}`} cx={cx} cy={cy} rx={range(r, 50, 110)} ry={range(r, 12, 22)} fill="#fff" opacity={range(r, 0.08, 0.2)} />)
      }
      for (let i = 0; i < 4; i++) body.push(<path key={`h${i}`} d={smooth(r, 340 + i * 60, 90 - i * 10, 170 - i * 20)} fill={mix(mix(c1, c2, 0.4 - i * 0.1), dark, i * 0.24)} />)
      for (let i = 0; i < 9; i++) {
        const x = r() * W, y = range(r, 470, 540)
        body.push(<g key={`tr${i}`} fill={mix(c1, dark, 0.7)}><rect x={x - 2} y={y} width="4" height="16" /><circle cx={x} cy={y - 4} r={range(r, 10, 16)} /></g>)
      }
      break
    }
    case 'dunes': {
      body.push(...stars(r, 20, 200))
      body.push(<circle key="sun" cx={sunX} cy="300" r={range(r, 80, 110)} fill={c2} opacity="0.95" />)
      for (let i = 0; i < 6; i++) body.push(<rect key={`hz${i}`} x="0" y={270 + i * 12} width={W} height="3" fill={c0} opacity={0.12 + i * 0.04} />)
      for (let i = 0; i < 4; i++) body.push(<path key={`d${i}`} d={smooth(r, 350 + i * 62, 70 - i * 6, 220)} fill={mix(mix(c1, c2, 0.25), dark, 0.15 + i * 0.26)} />)
      body.push(<g key="fig">{figure(range(r, 200, 400), 432, 0.9, dark)}</g>)
      break
    }
    case 'city': {
      body.push(...stars(r, 40, 220))
      body.push(<circle key="moon" cx={sunX} cy={range(r, 150, 210)} r="44" fill={c2} opacity="0.85" />)
      for (let i = 0; i < 3; i++) body.push(<polygon key={`sl${i}`} points={`${120 + i * 180},520 ${80 + i * 200 + r() * 120},0 ${140 + i * 200 + r() * 120},0`} fill={c2} opacity="0.05" />)
      for (let l = 0; l < 3; l++) {
        const base = 430 + l * 50
        const col = mix(mix(c1, c0, 0.3), dark, l * 0.35)
        const els: ReactNode[] = []
        let x = -10
        while (x < W) {
          const w = range(r, 26, 64), h = range(r, 90, 260) * (1 - l * 0.18)
          els.push(<rect key={`b${x}`} x={x} y={base - h} width={w - 3} height={h + 200} fill={col} />)
          if (l > 0) {
            for (let wy = base - h + 10; wy < base - 8; wy += 12) for (let wx = x + 5; wx < x + w - 10; wx += 9)
              if (r() < 0.28) els.push(<rect key={`w${wx}-${wy}`} x={wx} y={wy} width="4" height="5" fill={c2} opacity={range(r, 0.35, 0.9)} />)
          }
          x += w
        }
        body.push(<g key={`l${l}`}>{els}</g>)
      }
      break
    }
    case 'sun': {
      defs.push(
        <linearGradient key="sg" id={`${id}sg`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={c2} /><stop offset="1" stopColor={c1} /></linearGradient>,
      )
      body.push(<circle key="sun" cx="300" cy="290" r="150" fill={`url(#${id}sg)`} />)
      for (let i = 0; i < 5; i++) body.push(<rect key={`st${i}`} x="150" y={330 + i * 20} width="300" height={3 + i * 2.2} fill={c0} opacity="0.85" />)
      body.push(<polygon key="fuji" points="40,470 250,300 280,292 320,292 350,300 560,470" fill={mix(c1, dark, 0.55)} />)
      body.push(<polygon key="snow" points="250,300 280,292 320,292 350,300 330,318 312,308 296,322 280,310 266,320" fill={c2} opacity="0.9" />)
      for (let i = 0; i < 5; i++) body.push(<rect key={`cl${i}`} x={r() * 500 - 80} y={range(r, 200, 440)} width={range(r, 120, 260)} height="16" rx="8" fill={mix(c1, c0, 0.35)} opacity="0.8" />)
      body.push(<rect key="gnd" x="0" y="468" width={W} height="140" fill={dark} />)
      for (let i = 0; i < 26; i++) body.push(<ellipse key={`pt${i}`} cx={r() * W} cy={r() * W} rx="4" ry="2.2" fill={c2} opacity={range(r, 0.3, 0.8)} transform={`rotate(${r() * 180})`} />)
      break
    }
  }
  return { defs, body }
}

interface ArtProps {
  game: Game
  variant?: number
  className?: string
  title?: 'portrait' | 'landscape' | 'none'
  children?: ReactNode
  grain?: boolean
}

export const GameArt = memo(function GameArt({ game, variant = 0, className, title = 'none', children, grain = true }: ArtProps) {
  const rawId = useId()
  const id = 'a' + rawId.replace(/[^a-zA-Z0-9]/g, '')
  const svg = useMemo(() => {
    const r = rng(`${game.id}:${variant}`)
    let [c0, c1, c2] = game.palette
    if (variant % 3 === 2) c1 = mix(c1, c2, 0.3)
    if (variant % 3 === 0 && variant) { c0 = mix(c0, '#000000', 0.35); c1 = mix(c1, c0, 0.35); c2 = mix(c2, '#ffffff', 0.25) }
    const { defs, body } = scene(r, { ...game, palette: [c0, c1, c2] }, id)
    const zoom = variant ? 1.1 + ((variant * 37) % 5) * 0.12 : 1
    const flip = variant % 2 === 1 ? -1 : 1
    const fx = variant ? range(r, 180, 420) : 300
    const fy = variant ? range(r, 260, 400) : 300
    return (
      <svg viewBox={`0 0 ${W} ${W}`} preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden>
        <defs>
          <linearGradient id={`${id}bg`} x1="0" y1="0" x2="0.3" y2="1">
            <stop offset="0" stopColor={c0} />
            <stop offset="0.7" stopColor={mix(c1, c0, 0.35)} />
            <stop offset="1" stopColor={c1} />
          </linearGradient>
          <radialGradient id={`${id}gl`} cx="0.5" cy="0.45" r="0.5">
            <stop offset="0" stopColor={c2} stopOpacity="0.4" />
            <stop offset="1" stopColor={c2} stopOpacity="0" />
          </radialGradient>
          {defs}
        </defs>
        <g transform={flip < 0 ? `translate(${W} 0) scale(-1 1)` : undefined}>
          <g transform={`translate(${fx} ${fy}) scale(${zoom}) translate(${-fx} ${-fy})`}>
            <rect width={W} height={W} fill={`url(#${id}bg)`} />
            <rect width={W} height={W} fill={`url(#${id}gl)`} />
            {body}
          </g>
        </g>
      </svg>
    )
  }, [game, variant, id])

  return (
    <div className={cn('@container overflow-hidden bg-ink-3', !className?.includes('absolute') && 'relative', grain && 'grain', className)}>
      {svg}
      {title !== 'none' && <ArtTitle game={game} layout={title} />}
      {children}
    </div>
  )
})

const fontClass: Record<TitleFont, string> = {
  display: 'font-display font-bold uppercase tracking-[-0.02em]',
  serif: 'font-serif font-bold uppercase tracking-[0.06em]',
  condensed: 'font-condensed uppercase tracking-[0.03em]',
}

export function GameLogo({ game, className, style }: { game: Game; className?: string; style?: React.CSSProperties }) {
  return (
    <div className={cn('leading-[0.92] text-white text-shadow text-balance', fontClass[game.font], className)} style={style}>
      {game.title}
    </div>
  )
}

function ArtTitle({ game, layout }: { game: Game; layout: 'portrait' | 'landscape' }) {
  if (layout === 'portrait')
    return (
      <div className="absolute inset-x-0 top-0 flex flex-col items-center px-[8%] pt-[14%] text-center">
        <GameLogo game={game} style={{ fontSize: game.font === 'condensed' ? '15cqw' : '11.5cqw' }} />
        <div className="mt-[4cqw] h-px w-[26%] bg-white/50" />
      </div>
    )
  return (
    <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/55 via-black/0 to-transparent p-[5%]">
      <GameLogo game={game} style={{ fontSize: game.font === 'condensed' ? '9.5cqw' : '7cqw' }} />
    </div>
  )
}
