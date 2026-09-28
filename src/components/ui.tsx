import { AnimatePresence, motion } from 'motion/react'
import { Check, ChevronDown, X, type LucideIcon } from 'lucide-react'
import {
  forwardRef, useEffect, useRef, useState, type ButtonHTMLAttributes, type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import type { Platform } from '@/data/games'
import { cn, finalPrice, formatPrice } from '@/lib/utils'

type Variant = 'primary' | 'secondary' | 'ghost' | 'play' | 'danger' | 'outline' | 'sale'
type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

const variants: Record<Variant, string> = {
  primary: 'nova-gradient text-white shadow-[0_8px_24px_-8px_rgba(255,90,60,0.6)] hover:brightness-110 active:brightness-95',
  secondary: 'bg-white/[0.07] text-fg hover:bg-white/[0.12] active:bg-white/[0.09]',
  ghost: 'text-fg-2 hover:text-fg hover:bg-white/[0.06]',
  play: 'bg-gradient-to-b from-[#8ef27b] to-[#4cc75a] text-[#07210c] shadow-[0_8px_24px_-8px_rgba(110,230,100,0.55)] hover:brightness-110',
  danger: 'bg-danger/90 text-white hover:bg-danger',
  outline: 'border border-white/12 text-fg hover:border-white/25 hover:bg-white/[0.04]',
  sale: 'bg-sale text-[#172400] hover:brightness-105',
}
const sizes: Record<Size, string> = {
  xs: 'h-7 px-2.5 text-xs gap-1.5 rounded-md',
  sm: 'h-8 px-3 text-[13px] gap-1.5 rounded-lg',
  md: 'h-9 px-4 text-sm gap-2 rounded-lg',
  lg: 'h-11 px-5 text-[15px] gap-2 rounded-xl',
  xl: 'h-14 px-8 text-lg gap-3 rounded-xl',
}

interface BtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  icon?: LucideIcon
  iconRight?: LucideIcon
}

export const Button = forwardRef<HTMLButtonElement, BtnProps>(function Button(
  { variant = 'secondary', size = 'md', icon: Icon, iconRight: IconR, className, children, ...rest }, ref,
) {
  const is = size === 'xl' ? 22 : size === 'lg' ? 18 : size === 'xs' ? 13 : 15
  return (
    <button
      ref={ref}
      className={cn(
        'inline-flex shrink-0 items-center justify-center font-semibold whitespace-nowrap transition-all duration-150 select-none disabled:opacity-40 disabled:saturate-50',
        variants[variant], sizes[size], className,
      )}
      {...rest}
    >
      {Icon && <Icon size={is} strokeWidth={2.2} />}
      {children}
      {IconR && <IconR size={is} strokeWidth={2.2} />}
    </button>
  )
})

export function IconButton({ icon: Icon, label, className, active, badge, size = 34, ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { icon: LucideIcon; label: string; active?: boolean; badge?: number | boolean; size?: number }) {
  return (
    <button
      aria-label={label}
      title={label}
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center rounded-lg text-fg-2 transition hover:bg-white/[0.07] hover:text-fg',
        active && 'bg-white/[0.08] text-fg', className,
      )}
      style={{ width: size, height: size }}
      {...rest}
    >
      <Icon size={Math.round(size * 0.5)} strokeWidth={2} />
      {!!badge && (
        <span className={cn('absolute top-1 right-1 flex items-center justify-center rounded-full bg-nova text-[9px] font-bold text-white ring-2 ring-ink-1', typeof badge === 'number' ? 'h-4 min-w-4 px-1' : 'h-2 w-2')}>
          {typeof badge === 'number' ? (badge > 9 ? '9+' : badge) : null}
        </span>
      )}
    </button>
  )
}

export function Modal({ open, onClose, children, width = 520, className, title, subtitle }: { open: boolean; onClose: () => void; children: ReactNode; width?: number; className?: string; title?: ReactNode; subtitle?: ReactNode }) {
  useEffect(() => {
    if (!open) return
    const h = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [open, onClose])
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[80] flex items-center justify-center p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            role="dialog"
            className={cn('relative max-h-full w-full overflow-hidden rounded-2xl bg-ink-2 shadow-pop', className)}
            style={{ maxWidth: width }}
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 420, damping: 34 }}
          >
            {title && (
              <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-1">
                <div>
                  <h2 className="font-display text-lg font-semibold">{title}</h2>
                  {subtitle && <p className="mt-0.5 text-sm text-fg-3">{subtitle}</p>}
                </div>
                <IconButton icon={X} label="关闭" onClick={onClose} className="-mr-2" />
              </div>
            )}
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}

export function Drawer({ open, onClose, children, width = 420 }: { open: boolean; onClose: () => void; children: ReactNode; width?: number }) {
  useEffect(() => {
    if (!open) return
    const h = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [open, onClose])
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[70]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" onClick={onClose} />
          <motion.aside
            className="absolute top-0 right-0 bottom-0 flex flex-col border-l hairline bg-ink-2 shadow-pop"
            style={{ width }}
            initial={{ x: width }}
            animate={{ x: 0 }}
            exit={{ x: width }}
            transition={{ type: 'spring', stiffness: 380, damping: 38 }}
          >
            {children}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}

export function useClickOutside<T extends HTMLElement>(open: boolean, onClose: () => void) {
  const ref = useRef<T>(null)
  useEffect(() => {
    if (!open) return
    const h = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && onClose()
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('mousedown', h)
    window.addEventListener('keydown', k)
    return () => {
      document.removeEventListener('mousedown', h)
      window.removeEventListener('keydown', k)
    }
  }, [open, onClose])
  return ref
}

export function Popover({ trigger, children, align = 'right', width = 260, className }: { trigger: (open: boolean, toggle: () => void) => ReactNode; children: (close: () => void) => ReactNode; align?: 'left' | 'right'; width?: number; className?: string }) {
  const [open, setOpen] = useState(false)
  const ref = useClickOutside<HTMLDivElement>(open, () => setOpen(false))
  return (
    <div ref={ref} className={cn('relative', className)}>
      {trigger(open, () => setOpen((o) => !o))}
      <AnimatePresence>
        {open && (
          <motion.div
            className={cn('absolute top-full z-50 mt-2 overflow-hidden rounded-xl bg-ink-3 shadow-pop', align === 'right' ? 'right-0' : 'left-0')}
            style={{ width }}
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.14 }}
          >
            {children(() => setOpen(false))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function MenuItem({ icon: Icon, children, onClick, danger, right, active }: { icon?: LucideIcon; children: ReactNode; onClick?: () => void; danger?: boolean; right?: ReactNode; active?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] transition',
        danger ? 'text-danger hover:bg-danger/10' : 'text-fg-2 hover:bg-white/[0.06] hover:text-fg',
        active && 'text-fg',
      )}
    >
      {Icon && <Icon size={15} className="shrink-0" />}
      <span className="flex-1 truncate">{children}</span>
      {right}
      {active && <Check size={14} className="text-nova" />}
    </button>
  )
}

export function Select<T extends string>({ value, onChange, options, label, className, width = 180 }: { value: T; onChange: (v: T) => void; options: { value: T; label: string }[]; label?: string; className?: string; width?: number }) {
  const current = options.find((o) => o.value === value)
  return (
    <Popover
      className={className}
      width={width}
      trigger={(open, toggle) => (
        <button onClick={toggle} className={cn('flex h-8 items-center gap-2 rounded-lg bg-white/[0.05] px-3 text-[13px] text-fg-2 transition hover:bg-white/[0.09] hover:text-fg', open && 'bg-white/[0.09] text-fg')}>
          {label && <span className="text-fg-3">{label}</span>}
          <span className="font-medium text-fg">{current?.label}</span>
          <ChevronDown size={14} className={cn('transition', open && 'rotate-180')} />
        </button>
      )}
    >
      {(close) => (
        <div className="p-1.5">
          {options.map((o) => (
            <MenuItem key={o.value} active={o.value === value} onClick={() => { onChange(o.value); close() }}>{o.label}</MenuItem>
          ))}
        </div>
      )}
    </Popover>
  )
}

export function Segmented<T extends string>({ value, onChange, options, id, size = 'md' }: { value: T; onChange: (v: T) => void; options: { value: T; label: ReactNode; count?: number }[]; id: string; size?: 'sm' | 'md' }) {
  return (
    <div className="inline-flex items-center rounded-lg bg-white/[0.04] p-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={cn('relative flex items-center gap-1.5 rounded-md font-medium transition', size === 'sm' ? 'h-7 px-2.5 text-xs' : 'h-8 px-3.5 text-[13px]', value === o.value ? 'text-fg' : 'text-fg-3 hover:text-fg-2')}
        >
          {value === o.value && <motion.span layoutId={id} className="absolute inset-0 rounded-md bg-white/[0.1] shadow-sm" transition={{ type: 'spring', stiffness: 500, damping: 38 }} />}
          <span className="relative flex items-center gap-1.5">{o.label}{o.count !== undefined && <span className="text-fg-3 tabular-nums">{o.count}</span>}</span>
        </button>
      ))}
    </div>
  )
}

export function Tabs<T extends string>({ value, onChange, options, id, className }: { value: T; onChange: (v: T) => void; options: { value: T; label: ReactNode; badge?: number }[]; id: string; className?: string }) {
  return (
    <div className={cn('flex items-center gap-6 border-b hairline', className)}>
      {options.map((o) => (
        <button key={o.value} onClick={() => onChange(o.value)} className={cn('relative flex items-center gap-2 pb-3 text-[14px] font-medium transition', value === o.value ? 'text-fg' : 'text-fg-3 hover:text-fg-2')}>
          {o.label}
          {!!o.badge && <span className="rounded-full bg-nova px-1.5 text-[10px] font-bold leading-4 text-white">{o.badge}</span>}
          {value === o.value && <motion.span layoutId={id} className="nova-gradient absolute right-0 -bottom-px left-0 h-0.5 rounded-full" />}
        </button>
      ))}
    </div>
  )
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: ReactNode }) {
  return (
    <button onClick={() => onChange(!checked)} className="flex w-full items-center justify-between gap-3 py-1.5 text-left text-[13px] text-fg-2 hover:text-fg">
      <span>{label}</span>
      <span className={cn('relative h-5 w-9 shrink-0 rounded-full transition', checked ? 'bg-nova' : 'bg-white/10')}>
        <motion.span layout className={cn('absolute top-0.5 h-4 w-4 rounded-full bg-white shadow', checked ? 'right-0.5' : 'left-0.5')} transition={{ type: 'spring', stiffness: 600, damping: 35 }} />
      </span>
    </button>
  )
}

export function Checkbox({ checked, onChange, label, count }: { checked: boolean; onChange: (v: boolean) => void; label: ReactNode; count?: number }) {
  return (
    <button onClick={() => onChange(!checked)} className="group flex w-full items-center gap-2.5 rounded-md py-1.5 text-left text-[13px] text-fg-2 hover:text-fg">
      <span className={cn('flex h-4 w-4 shrink-0 items-center justify-center rounded border transition', checked ? 'border-nova bg-nova text-white' : 'border-white/20 group-hover:border-white/40')}>
        {checked && <Check size={11} strokeWidth={3.5} />}
      </span>
      <span className="flex-1">{label}</span>
      {count !== undefined && <span className="text-xs text-fg-4 tabular-nums">{count}</span>}
    </button>
  )
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('skeleton rounded-lg', className)} />
}

export function EmptyState({ icon: Icon, title, body, action, className }: { icon: LucideIcon; title: string; body?: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <div className={cn('flex flex-col items-center justify-center px-6 py-16 text-center', className)}>
      <div className="relative mb-5">
        <div className="absolute inset-0 rounded-full bg-nova/20 blur-2xl" />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border hairline bg-ink-3">
          <Icon size={28} className="text-fg-2" strokeWidth={1.6} />
        </div>
      </div>
      <h3 className="font-display text-lg font-semibold">{title}</h3>
      {body && <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-fg-3">{body}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function Progress({ value, className, tone = 'nova', striped }: { value: number; className?: string; tone?: 'nova' | 'green' | 'gold' | 'muted' | 'blue'; striped?: boolean }) {
  const bg = { nova: 'nova-gradient', green: 'bg-ingame', gold: 'bg-gold', muted: 'bg-fg-3', blue: 'bg-online' }[tone]
  return (
    <div className={cn('h-1.5 overflow-hidden rounded-full bg-white/[0.07]', className)}>
      <div
        className={cn('relative h-full rounded-full transition-[width] duration-700 ease-out', bg)}
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      >
        {striped && <div className="absolute inset-0 animate-[shimmer_1.2s_linear_infinite] bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.35),transparent)] bg-[length:200px_100%]" />}
      </div>
    </div>
  )
}

export function Price({ price, discount, size = 'md', comingSoon, className }: { price: number; discount: number; size?: 'sm' | 'md' | 'lg'; comingSoon?: boolean; className?: string }) {
  if (comingSoon) return <span className={cn('text-[13px] font-medium text-fg-2', className)}>即将推出</span>
  const fp = finalPrice(price, discount)
  const pad = size === 'lg' ? 'h-11' : size === 'sm' ? 'h-6' : 'h-8'
  return (
    <div className={cn('inline-flex items-stretch overflow-hidden rounded-md', pad, className)}>
      {discount > 0 && (
        <span className={cn('flex items-center bg-sale px-1.5 font-display font-bold text-[#172400]', size === 'lg' ? 'text-xl px-2.5' : size === 'sm' ? 'text-[11px]' : 'text-sm')}>-{discount}%</span>
      )}
      <span className={cn('flex flex-col justify-center bg-black/35 px-2 leading-none', discount > 0 ? 'items-end' : '', size === 'lg' && 'px-3')}>
        {discount > 0 && <span className={cn('text-fg-3 line-through', size === 'lg' ? 'text-xs' : 'text-[10px]')}>{formatPrice(price)}</span>}
        <span className={cn('font-semibold text-fg tabular-nums', size === 'lg' ? 'text-lg' : size === 'sm' ? 'text-[12px]' : 'text-[13px]', discount > 0 && 'text-sale')}>{formatPrice(fp)}</span>
      </span>
    </div>
  )
}

export function PlatformIcons({ platforms, className }: { platforms: Platform[]; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-fg-3', className)}>
      {platforms.includes('win') && (
        <svg viewBox="0 0 16 16" className="h-3 w-3 fill-current"><path d="M0 2.3 6.5 1.4v6.2H0zm7.3-1L16 0v7.6H7.3zM0 8.4h6.5v6.2L0 13.7zm7.3 0H16V16l-8.7-1.2z" /></svg>
      )}
      {platforms.includes('mac') && (
        <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 fill-current"><path d="M11.2 8.5c0-1.6 1.3-2.4 1.4-2.4-.8-1.1-2-1.3-2.4-1.3-1-.1-2 .6-2.5.6s-1.3-.6-2.2-.6c-1.1 0-2.1.7-2.7 1.7-1.2 2-.3 5 .8 6.6.6.8 1.2 1.7 2.1 1.6.8 0 1.2-.5 2.2-.5s1.3.5 2.2.5 1.5-.8 2-1.6c.6-.9.9-1.8.9-1.9 0 0-1.8-.7-1.8-2.7zM9.6 3.6c.5-.6.8-1.4.7-2.2-.7 0-1.5.5-2 1.1-.4.5-.8 1.3-.7 2.1.8.1 1.5-.4 2-1z" /></svg>
      )}
      {platforms.includes('linux') && (
        <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 fill-current"><path d="M8 1c-1.7 0-2.6 1.4-2.6 3.3 0 .9.2 1.5-.4 2.4C4.2 7.8 3 9.5 3 11.2c0 .5.1.9.3 1.2-.4.3-1 .5-1 1.1 0 .8 1.3.9 2.6 1.3.9.3 1.6.3 2.1-.3h2c.5.6 1.2.6 2.1.3 1.3-.4 2.6-.5 2.6-1.3 0-.6-.6-.8-1-1.1.2-.3.3-.7.3-1.2 0-1.7-1.2-3.4-2-4.5-.6-.9-.4-1.5-.4-2.4C10.6 2.4 9.7 1 8 1zm-1 3a.6.8 0 1 1 0 .1zm2 0a.6.8 0 1 1 0 .1zM8 5.6l1.2.6L8 7l-1.2-.8z" /></svg>
      )}
    </span>
  )
}

export function Kbd({ children }: { children: ReactNode }) {
  return <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded border border-white/10 bg-white/[0.04] px-1 font-sans text-[10px] font-medium text-fg-3">{children}</kbd>
}

export function SectionHeader({ title, subtitle, action, className }: { title: ReactNode; subtitle?: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <div className={cn('mb-4 flex items-end justify-between gap-4', className)}>
      <div>
        <h2 className="section-title">{title}</h2>
        {subtitle && <p className="mt-0.5 text-[13px] text-fg-3">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

export function Ring({ value, size = 64, stroke = 6, children, color = 'url(#novaRing)' }: { value: number; size?: number; stroke?: number; children?: ReactNode; color?: string }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="novaRing" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ffb347" /><stop offset="0.5" stopColor="#ff6a3d" /><stop offset="1" stopColor="#ff2e7e" /></linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.07)" strokeWidth={stroke} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={stroke} fill="none" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)} style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  )
}
