import { motion } from 'motion/react'
import { useEffect, useRef, type ReactNode } from 'react'
import { useLocation } from 'react-router'
import { cn } from '@/lib/utils'

export function Page({ children, className, inner, id }: { children: ReactNode; className?: string; inner?: string; id?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const loc = useLocation()
  useEffect(() => {
    ref.current?.scrollTo({ top: 0 })
  }, [loc.pathname])
  return (
    <div ref={ref} id={id} className={cn('scroll-area h-full', className)}>
      <motion.div key={loc.pathname} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28, ease: [0.2, 0.8, 0.2, 1] }} className={inner}>
        {children}
      </motion.div>
    </div>
  )
}
