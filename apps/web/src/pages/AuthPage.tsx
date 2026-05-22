import { Panel } from '../components/Panel'

export function AuthPage() {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <Panel title="Secure access" eyebrow="jwt authentication starter">
        <div className="space-y-4">
          {['Identity', 'Password'].map((label) => (
            <label key={label} className="block">
              <span className="text-sm text-slate-300">{label}</span>
              <input
                type={label === 'Password' ? 'password' : 'text'}
                className="mt-3 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none placeholder:text-slate-500"
                placeholder={label === 'Password' ? '••••••••••' : 'observer@indra.local'}
              />
            </label>
          ))}
          <button type="button" className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-5 py-3 text-xs uppercase tracking-[0.35em] text-cyan-100">
            Enter system
          </button>
        </div>
      </Panel>

      <Panel title="Register observer" eyebrow="local development support">
        <div className="grid gap-4 md:grid-cols-2">
          {['Username', 'Display name', 'Email', 'Cognitive focus'].map((label) => (
            <label key={label} className="block">
              <span className="text-sm text-slate-300">{label}</span>
              <input className="mt-3 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none placeholder:text-slate-500" placeholder={label} />
            </label>
          ))}
          <label className="md:col-span-2 block">
            <span className="text-sm text-slate-300">Password</span>
            <input type="password" className="mt-3 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none placeholder:text-slate-500" placeholder="Minimum 8 characters" />
          </label>
        </div>
      </Panel>
    </div>
  )
}
