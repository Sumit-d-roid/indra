import { useMemo, useState } from 'react'
import { Panel } from '../components/Panel'
import { challengePool } from '../data/mockIndra'

export function ChallengesPage() {
  const [index, setIndex] = useState(0)
  const [response, setResponse] = useState('')
  const challenge = useMemo(() => challengePool[index % challengePool.length], [index])

  return (
    <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <Panel
        title={challenge.title}
        eyebrow={challenge.category}
        action={
          <button
            type="button"
            onClick={() => setIndex((value) => value + 1)}
            className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-cyan-100"
          >
            inject novelty
          </button>
        }
      >
        <p className="text-lg leading-8 text-slate-200">{challenge.prompt}</p>
        <div className="mt-4 flex flex-wrap gap-3 text-xs uppercase tracking-[0.3em] text-slate-400">
          <span className="rounded-full border border-white/10 px-3 py-2">difficulty {challenge.difficulty}</span>
          <span className="rounded-full border border-white/10 px-3 py-2">novelty {(challenge.noveltyIndex * 100).toFixed(0)}%</span>
          <span className="rounded-full border border-white/10 px-3 py-2">adaptive matrix active</span>
        </div>

        <textarea
          value={response}
          onChange={(event) => setResponse(event.target.value)}
          className="mt-6 min-h-48 w-full rounded-[1.5rem] border border-white/10 bg-slate-950/70 px-5 py-4 text-sm leading-7 text-slate-100 outline-none placeholder:text-slate-500"
          placeholder="Respond as if the system is pressure-testing your worldview..."
        />
      </Panel>

      <div className="space-y-6">
        <Panel title="Challenge history" eyebrow="completion tracking">
          <div className="space-y-3">
            {challengePool.map((item) => (
              <div key={item.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-300">
                <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/55">{item.category}</p>
                <p className="mt-2 text-base text-white">{item.title}</p>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Neuroplasticity note" eyebrow="challenge rationale">
          <p className="text-sm leading-7 text-slate-300">
            The engine avoids repetition by colliding unfamiliar domains, rotating prompt structures, and escalating abstraction depth as response history expands.
          </p>
        </Panel>
      </div>
    </div>
  )
}
