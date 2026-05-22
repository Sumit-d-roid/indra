import { AnimatePresence, motion } from 'framer-motion'
import { Activity, Atom, BookOpenText, Brain, CalendarRange, ChartNoAxesCombined, Cpu, ShieldHalf } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { getStoredCognitiveProfile } from '../lib/cognitiveProfile'

const navigation = [
  { to: '/dashboard', label: 'Dashboard', icon: Activity },
  { to: '/autopilot', label: 'Session Autopilot', icon: Cpu },
  { to: '/check-in', label: 'Check-In', icon: Brain },
  { to: '/curiosity-graph', label: 'Curiosity Graph', icon: Atom },
  { to: '/weekly-review', label: 'Weekly Review', icon: CalendarRange },
  { to: '/narrative', label: 'Narrative Engine', icon: BookOpenText },
  { to: '/analytics', label: 'Evolution Analytics', icon: ChartNoAxesCombined },
  { to: '/settings', label: 'Settings', icon: ShieldHalf },
]

const dailyLoop = [
  { to: '/dashboard', label: '1. Observe state' },
  { to: '/check-in', label: '2. Run check-in' },
  { to: '/autopilot', label: '3. Run autopilot' },
  { to: '/curiosity-graph', label: '4. Inspect graph' },
  { to: '/weekly-review', label: '5. Weekly review' },
  { to: '/narrative', label: '6. Read narrative' },
]

function getDailyLoopIndex(pathname: string) {
  if (pathname.startsWith('/dashboard')) return 0
  if (pathname.startsWith('/check-in')) return 1
  if (pathname.startsWith('/autopilot')) return 2
  if (pathname.startsWith('/curiosity-graph')) return 3
  if (pathname.startsWith('/weekly-review')) return 4
  if (pathname.startsWith('/narrative')) return 5
  return -1
}

export function AppShell() {
  const location = useLocation()
  const [profileSnapshot, setProfileSnapshot] = useState(() => getStoredCognitiveProfile())
  const loopIndex = getDailyLoopIndex(location.pathname)
  const nextStep = loopIndex >= 0 ? dailyLoop[(loopIndex + 1) % dailyLoop.length] : dailyLoop[0]
  const profile = profileSnapshot?.profile
  const patterns = profileSnapshot?.patterns
  const topShadow = profileSnapshot?.shadowPatterns?.[0]

  useEffect(() => {
    const refresh = () => setProfileSnapshot(getStoredCognitiveProfile())
    window.addEventListener('focus', refresh)
    return () => window.removeEventListener('focus', refresh)
  }, [])

  const atmosphereClass = useMemo(() => {
    if (!profile) {
      return 'bg-[radial-gradient(circle_at_top,_rgba(45,212,191,0.18),_transparent_26%),radial-gradient(circle_at_80%_20%,_rgba(167,139,250,0.18),_transparent_22%),linear-gradient(180deg,_rgba(2,6,23,0.6),_rgba(2,6,23,0.96))]'
    }
    if (profile.emotionalVariance > 0.68) {
      return 'bg-[radial-gradient(circle_at_top,_rgba(251,113,133,0.20),_transparent_24%),radial-gradient(circle_at_80%_20%,_rgba(45,212,191,0.16),_transparent_26%),linear-gradient(180deg,_rgba(2,6,23,0.68),_rgba(2,6,23,0.98))]'
    }
    if (profile.noveltySeeking > 0.7) {
      return 'bg-[radial-gradient(circle_at_top,_rgba(45,212,191,0.22),_transparent_26%),radial-gradient(circle_at_80%_20%,_rgba(167,139,250,0.24),_transparent_22%),linear-gradient(180deg,_rgba(2,6,23,0.58),_rgba(2,6,23,0.96))]'
    }
    if (profile.consistency > 0.7) {
      return 'bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.20),_transparent_30%),radial-gradient(circle_at_80%_20%,_rgba(45,212,191,0.14),_transparent_24%),linear-gradient(180deg,_rgba(2,6,23,0.62),_rgba(2,6,23,0.96))]'
    }
    return 'bg-[radial-gradient(circle_at_top,_rgba(45,212,191,0.18),_transparent_26%),radial-gradient(circle_at_80%_20%,_rgba(167,139,250,0.18),_transparent_22%),linear-gradient(180deg,_rgba(2,6,23,0.6),_rgba(2,6,23,0.96))]'
  }, [profile])

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-200">
      <div className={`absolute inset-0 ${atmosphereClass}`} />
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

          <div className="mt-6 rounded-3xl border border-cyan-300/10 bg-cyan-300/5 p-4 text-sm text-slate-200">
            <p className="text-[0.65rem] uppercase tracking-[0.4em] text-cyan-200/60">daily flow</p>
            <p className="mt-3 text-slate-300">Follow this loop every session. The next step is highlighted.</p>
            <NavLink
              to={nextStep.to}
              className="mt-4 block rounded-xl border border-cyan-300/25 bg-cyan-300/10 px-3 py-2 text-center text-xs uppercase tracking-[0.28em] text-cyan-100 hover:border-cyan-200/40"
            >
              next: {nextStep.label}
            </NavLink>
            <div className="mt-4 space-y-2">
              {dailyLoop.map((step, index) => {
                const isActive = location.pathname.startsWith(step.to)
                const isDone = loopIndex > index
                return (
                  <NavLink
                    key={step.to}
                    to={step.to}
                    className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs ${
                      isActive
                        ? 'border-cyan-300/35 bg-cyan-300/10 text-cyan-100'
                        : isDone
                          ? 'border-emerald-300/20 bg-emerald-300/10 text-emerald-100'
                          : 'border-white/10 bg-white/5 text-slate-300'
                    }`}
                  >
                    <span className="font-mono">{isDone ? '✓' : index + 1}</span>
                    <span>{step.label.replace(/^\d+\.\s/, '')}</span>
                  </NavLink>
                )
              })}
            </div>
          </div>

          <div className="mt-6 rounded-3xl border border-violet-300/10 bg-violet-300/5 p-4 text-sm text-slate-300">
            <p className="text-[0.65rem] uppercase tracking-[0.4em] text-violet-200/60">adaptive notice</p>
            <p className="mt-3">
              {patterns
                ? `Profile mode: ${patterns.curiosityStyle}; ${patterns.avoidanceStyle}.${topShadow ? ` Shadow watch: ${topShadow.title}.` : ''}`
                : 'Local observer mode active. No login required while you iterate on cognition loops and challenge quality.'}
            </p>
            {profileSnapshot?.currentState ? (
              <p className="mt-2 text-xs uppercase tracking-[0.24em] text-violet-100/70">
                state: {profileSnapshot.currentState.replace(/-/g, ' ')}
              </p>
            ) : null}
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
