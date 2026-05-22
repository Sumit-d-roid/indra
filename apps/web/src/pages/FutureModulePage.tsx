import { Panel } from '../components/Panel'
import type { FutureModule } from '../types'

type FutureModulePageProps = {
  module: FutureModule
}

export function FutureModulePage({ module }: FutureModulePageProps) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <Panel title={module.title} eyebrow={module.status}>
        <p className="text-sm leading-7 text-slate-300">{module.purpose}</p>
      </Panel>
      <Panel title="Expandable signal channels" eyebrow="foundation architecture">
        <div className="space-y-3">
          {module.signals.map((signal) => (
            <div key={signal} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-cyan-100">
              {signal}
            </div>
          ))}
        </div>
      </Panel>
    </div>
  )
}
