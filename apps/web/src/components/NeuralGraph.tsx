import * as d3 from 'd3'
import { useEffect, useRef } from 'react'
import type { CuriosityConnection, CuriosityNode } from '../types'

type NeuralGraphProps = {
  nodes: CuriosityNode[]
  connections: CuriosityConnection[]
}

type GraphNode = CuriosityNode & d3.SimulationNodeDatum

type GraphLink = CuriosityConnection & d3.SimulationLinkDatum<GraphNode>

export function NeuralGraph({ nodes, connections }: NeuralGraphProps) {
  const svgRef = useRef<SVGSVGElement | null>(null)

  useEffect(() => {
    if (!svgRef.current) {
      return undefined
    }

    const svg = d3.select<SVGSVGElement, unknown>(svgRef.current)
    svg.selectAll('*').remove()

    const width = 960
    const height = 520

    const graphNodes: GraphNode[] = nodes.map((node) => ({ ...node }))
    const graphLinks: GraphLink[] = connections.map((connection) => ({
      ...connection,
      source: connection.sourceNodeId,
      target: connection.targetNodeId,
    }))

    const root = svg
      .attr('viewBox', `0 0 ${width} ${height}`)
      .append('g')

    svg.call(
      d3.zoom<SVGSVGElement, unknown>().scaleExtent([0.7, 2.5]).on('zoom', (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
        root.attr('transform', event.transform.toString())
      }),
    )

    root
      .append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('rx', 28)
      .attr('fill', 'rgba(2, 6, 23, 0.9)')
      .attr('stroke', 'rgba(103, 232, 249, 0.08)')

    const link = root
      .append('g')
      .selectAll('line')
      .data(graphLinks)
      .enter()
      .append('line')
      .attr('stroke', 'rgba(103, 232, 249, 0.18)')
      .attr('stroke-width', (item: GraphLink) => item.weight * 3)

    const glow = root
      .append('g')
      .selectAll('circle')
      .data(graphNodes)
      .enter()
      .append('circle')
      .attr('r', (item: GraphNode) => 16 + item.engagementWeight * 16)
      .attr('fill', 'rgba(34, 211, 238, 0.12)')
      .attr('filter', 'blur(14px)')

    const node = root
      .append('g')
      .selectAll('circle')
      .data(graphNodes)
      .enter()
      .append('circle')
      .attr('r', (item: GraphNode) => 10 + item.engagementWeight * 13)
      .attr('fill', (item: GraphNode) => (item.cluster === 'Systems' ? '#67e8f9' : item.cluster === 'Biology' ? '#a78bfa' : '#22d3ee'))
      .attr('stroke', 'rgba(226, 232, 240, 0.6)')
      .attr('stroke-width', 1.3)
      .call(
        d3
          .drag<SVGCircleElement, GraphNode>()
          .on('start', (event: d3.D3DragEvent<SVGCircleElement, GraphNode, GraphNode>, item: GraphNode) => {
            if (!event.active) simulation.alphaTarget(0.2).restart()
            item.fx = item.x
            item.fy = item.y
          })
          .on('drag', (event: d3.D3DragEvent<SVGCircleElement, GraphNode, GraphNode>, item: GraphNode) => {
            item.fx = event.x
            item.fy = event.y
          })
          .on('end', (event: d3.D3DragEvent<SVGCircleElement, GraphNode, GraphNode>, item: GraphNode) => {
            if (!event.active) simulation.alphaTarget(0)
            item.fx = null
            item.fy = null
          }),
      )

    const labels = root
      .append('g')
      .selectAll('text')
      .data(graphNodes)
      .enter()
      .append('text')
      .text((item: GraphNode) => item.topic)
      .attr('fill', '#e2e8f0')
      .attr('font-size', 13)
      .attr('font-family', 'Inter, sans-serif')
      .attr('text-anchor', 'middle')
      .attr('dy', -22)

    const simulation = d3
      .forceSimulation(graphNodes)
      .force('link', d3.forceLink<GraphNode, GraphLink>(graphLinks).id((item: GraphNode) => item.id).distance((item: GraphLink) => 120 - item.weight * 40))
      .force('charge', d3.forceManyBody().strength(-340))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide<GraphNode>().radius((item: GraphNode) => 32 + item.engagementWeight * 10))
      .on('tick', () => {
        link
          .attr('x1', (item: GraphLink) => (item.source as GraphNode).x ?? 0)
          .attr('y1', (item: GraphLink) => (item.source as GraphNode).y ?? 0)
          .attr('x2', (item: GraphLink) => (item.target as GraphNode).x ?? 0)
          .attr('y2', (item: GraphLink) => (item.target as GraphNode).y ?? 0)

        glow.attr('cx', (item: GraphNode) => item.x ?? 0).attr('cy', (item: GraphNode) => item.y ?? 0)
        node.attr('cx', (item: GraphNode) => item.x ?? 0).attr('cy', (item: GraphNode) => item.y ?? 0)
        labels.attr('x', (item: GraphNode) => item.x ?? 0).attr('y', (item: GraphNode) => item.y ?? 0)
      })

    return () => {
      simulation.stop()
    }
  }, [connections, nodes])

  return <svg ref={svgRef} className="h-[520px] w-full overflow-hidden rounded-[1.75rem]" role="img" aria-label="Curiosity graph neural visualization" />
}
