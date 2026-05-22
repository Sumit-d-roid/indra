import { Panel } from '../components/Panel'
import { dashboardData } from '../data/mockIndra'

export function DashboardPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-cyan-300/10 bg-[radial-gradient(circle_at_top,_rgba(45,212,191,0.14),_transparent_36%),linear-gradient(135deg,_rgba(15,23,42,0.94),_rgba(8,47,73,0.68))] p-6 lg:p-8">
        <p className="text-[0.65rem] uppercase tracking-[0.45em] text-cyan-200/55">cognitive state overview</p>
        <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="max-w-3xl text-3xl font-semibold text-white lg:text-5xl">A machine studying consciousness through curiosity, abstraction, and deliberate mental drift.</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
              {dashboardData.profile.displayName} is currently tracking <span className="text-cyan-200">{dashboardData.profile.cognitiveFocus}</span> with high creative volatility and elevated intellectual excitement.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm text-slate-200 sm:grid-cols-4">
            {[
              ['curiosity', dashboardData.latestEntry.curiosityLevel],
              ['focus', dashboardData.latestEntry.focusLevel],
              ['creativity', dashboardData.latestEntry.creativity],
              ['excitement', dashboardData.latestEntry.intellectualExcitement],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center">
                <p className="text-[0.65rem] uppercase tracking-[0.35em] text-slate-400">{label}</p>
                <p className="mt-2 text-2xl font-semibold text-white">{value}/10</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Panel title="Recent challenge matrix" eyebrow="adaptive challenges">
          <div className="space-y-4">
            {dashboardData.recentChallenges.map((challenge) => (
              <article key={challenge.id} className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.35em] text-cyan-200/55">{challenge.category}</p>
                    <h3 className="mt-2 text-lg text-white">{challenge.title}</h3>
                  </div>
                  <span className="rounded-full border border-cyan-300/20 px-3 py-1 text-xs text-cyan-100">difficulty {challenge.difficulty}</span>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-300">{challenge.prompt}</p>
              </article>
            ))}
          </div>
        </Panel>

        <Panel title="System notifications" eyebrow="adaptive system tone">
          <div className="space-y-3">
            {dashboardData.notifications.map((notification) => (
              <div key={notification.title} className="rounded-2xl border border-violet-300/10 bg-violet-300/5 p-4">
                <h3 className="text-sm font-medium text-violet-100">{notification.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">{notification.detail}</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {dashboardData.highlightMetrics.map((metric) => (
          <Panel key={metric.metricName} title={metric.metricName} eyebrow={`${metric.value.toFixed(1)} signal`}>
            <p className="text-sm leading-6 text-slate-300">{metric.insight}</p>
          </Panel>
        ))}
      </div>
    </div>
  )
}
