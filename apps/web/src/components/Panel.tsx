import { motion } from 'framer-motion'
import type { PropsWithChildren, ReactNode } from 'react'

type PanelProps = PropsWithChildren<{
  title?: string
  eyebrow?: string
  action?: ReactNode
  className?: string
}>

export function Panel({ children, title, eyebrow, action, className = '' }: PanelProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className={`rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_24px_120px_rgba(0,0,0,0.35)] backdrop-blur-xl ${className}`}
    >
      {(title || eyebrow || action) && (
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            {eyebrow ? <p className="text-[0.65rem] uppercase tracking-[0.4em] text-cyan-200/60">{eyebrow}</p> : null}
            {title ? <h2 className="mt-2 text-lg font-semibold text-slate-100">{title}</h2> : null}
          </div>
          {action}
        </div>
      )}
      {children}
    </motion.section>
  )
}
