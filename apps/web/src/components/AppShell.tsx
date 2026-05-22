import { AnimatePresence, motion } from 'framer-motion'
import { Activity, Atom, Binary, Brain, ChartNoAxesCombined, Lock, Route, ShieldHalf, Sparkles } from 'lucide-react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'

const navigation = [
  { to: '/dashboard', label: 'Dashboard', icon: Activity },
  { to: '/check-in', label: 'Check-In', icon: Brain },
  { to: '/challenges', label: 'Challenges', icon: Sparkles },
  { to: '/curiosity-graph', label: 'Curiosity Graph', icon: Atom },
  { to: '/analytics', label: 'Evolution Analytics', icon: ChartNoAxesCombined },
  { to: '/settings', label: 'Settings', icon: ShieldHalf },
  { to: '/shadow', label: 'Shadow Module', icon: Binary },
  { to: '/labyrinth', label: 'Labyrinth Module', icon: Route },
  { to: '/auth', label: 'Access', icon: Lock },
]

export function AppShell() {
  const location = useLocation()

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-200">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(45,212,191,0.18),_transparent_26%),radial-gradient(circle_at_80%_20%,_rgba(167,139,250,0.18),_transparent_22%),linear-gradient(180deg,_rgba(2,6,23,0.6),_rgba(2,6,23,0.96))]" />
      <div className="relative mx-auto grid min-h-screen max-w-[1600px] gap-6 px-4 py-4 lg:grid-cols-[280px_minmax(0,1fr)] lg:px-6">
        <aside className="rounded-[2rem] border border-white/10 bg-slate-950/65 p-5 shadow-2xl backdrop-blur-xl">
          <div className="rounded-3xl border border-cyan-300/10 bg-white/[0.03] p-4">
            <p className="text-[0.65rem] uppercase tracking-[0.45em] text-cyan-200/55">classified system</p>
            <h1 className="mt-3 text-3xl font-semibold text-white">INDRA</h1>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              Experimental cognitive operating system focused on curiosity vectors, adaptive intelligence, and long-term mental evolution.
            </p>
          </div>

          <nav className="mt-6 space-y-2">
            {navigation.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition ${
                    isActive
                      ? 'border-cyan-300/30 bg-cyan-300/10 text-white'
                      : 'border-white/5 bg-white/[0.02] text-slate-400 hover:border-white/10 hover:text-slate-100'
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="mt-6 rounded-3xl border border-violet-300/10 bg-violet-300/5 p-4 text-sm text-slate-300">
            <p className="text-[0.65rem] uppercase tracking-[0.4em] text-violet-200/60">adaptive notice</p>
            <p className="mt-3">Novel domain exposure recommended. Obsession cycles now converging around cybernetics and ritual systems.</p>
          </div>
        </aside>

        <main className="overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/50 p-4 shadow-2xl backdrop-blur-xl lg:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
