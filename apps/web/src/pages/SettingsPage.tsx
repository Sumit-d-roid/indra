import { Panel } from '../components/Panel'

export function SettingsPage() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Panel title="System configuration" eyebrow="future AI abstraction layer">
        <div className="space-y-4 text-sm text-slate-300">
          <p>API endpoint routing prepared for OpenAI-compatible challenge generation and future local model substitution.</p>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 font-mono text-xs text-cyan-100">
            VITE_API_BASE_URL=http://localhost:5187/api
          </div>
        </div>
      </Panel>

      <Panel title="Terminal mode" eyebrow="optional advanced feature foundation">
        <p className="text-sm leading-7 text-slate-300">
          Dark atmospheric visuals, subtle glassmorphism, and layered motion establish the classified-research-system feel while keeping the UI minimal and personal.
        </p>
      </Panel>
    </div>
  )
}
