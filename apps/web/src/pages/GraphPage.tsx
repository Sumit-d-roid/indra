import { useEffect, useState } from 'react'
import { NeuralGraph } from '../components/NeuralGraph'
import { Panel } from '../components/Panel'
import { indraApi } from '../lib/api'
import type { CuriosityConnection, CuriosityNode } from '../types'

export function GraphPage() {
  const [nodes, setNodes] = useState<CuriosityNode[]>([])
  const [connections, setConnections] = useState<CuriosityConnection[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const graph = await indraApi.getCuriosityGraph()
        if (active) {
          setNodes(graph.nodes)
          setConnections(graph.connections)
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : 'Failed to load graph.')
        }
      }
    }

    void load()
    return () => {
      active = false
    }
  }, [])

  if (nodes.length === 0) {
    return (
      <Panel title="Curiosity graph" eyebrow="loading">
        <p className="text-sm text-slate-300">{error ?? 'Building neural map...'}</p>
      </Panel>
    )
  }

  return (
    <div className="space-y-6">
      <Panel title="Curiosity graph" eyebrow="living neural map">
        <NeuralGraph nodes={nodes} connections={connections} />
      </Panel>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {nodes.map((node) => (
          <Panel key={node.id} title={node.topic} eyebrow={node.cluster}>
            <p className="text-sm text-slate-300">Adjacent domain: {node.adjacentDomain}</p>
            <p className="mt-3 text-sm text-cyan-100">{node.driftSignal}</p>
          </Panel>
        ))}
      </div>
    </div>
  )
}
