import { NeuralGraph } from '../components/NeuralGraph'
import { Panel } from '../components/Panel'
import { curiosityConnections, curiosityNodes } from '../data/mockIndra'

export function GraphPage() {
  return (
    <div className="space-y-6">
      <Panel title="Curiosity graph" eyebrow="living neural map">
        <NeuralGraph nodes={curiosityNodes} connections={curiosityConnections} />
      </Panel>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {curiosityNodes.map((node) => (
          <Panel key={node.id} title={node.topic} eyebrow={node.cluster}>
            <p className="text-sm text-slate-300">Adjacent domain: {node.adjacentDomain}</p>
            <p className="mt-3 text-sm text-cyan-100">{node.driftSignal}</p>
          </Panel>
        ))}
      </div>
    </div>
  )
}
