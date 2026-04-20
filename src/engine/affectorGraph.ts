import type { Stat } from '../types/stat'

// adjacency list: statId -> list of stat IDs that depend on it
type Graph = Map<string, string[]>

/**
 * Builds a directed dependency graph from a list of stats.
 * For each stat with affectors, for each affectorId, adds edge: affectorId -> stat.id
 */
export function buildGraph(stats: Stat[]): Graph {
  const graph: Graph = new Map()

  // Initialize all stat IDs in the graph
  for (const stat of stats) {
    if (!graph.has(stat.id)) {
      graph.set(stat.id, [])
    }
  }

  // Add edges: affectorId -> stat.id (affector is upstream, stat is downstream)
  for (const stat of stats) {
    if (stat.affectors && stat.affectors.length > 0) {
      for (const affectorId of stat.affectors) {
        if (!graph.has(affectorId)) {
          graph.set(affectorId, [])
        }
        const dependents = graph.get(affectorId)!
        if (!dependents.includes(stat.id)) {
          dependents.push(stat.id)
        }
      }
    }
  }

  return graph
}

/**
 * BFS from statId, returns all transitive dependents in topological order.
 */
export function getDownstream(statId: string, graph: Graph): string[] {
  const visited = new Set<string>()
  const queue: string[] = [statId]
  const result: string[] = []

  while (queue.length > 0) {
    const current = queue.shift()!
    const dependents = graph.get(current) ?? []
    for (const dep of dependents) {
      if (!visited.has(dep)) {
        visited.add(dep)
        result.push(dep)
        queue.push(dep)
      }
    }
  }

  return result
}

/**
 * Returns true if targetStatId is reachable from any candidateAffector,
 * which would create a cycle if targetStatId listed candidateAffectors as its affectors.
 */
export function detectCycle(
  candidateAffectors: string[],
  targetStatId: string,
  graph: Graph
): boolean {
  for (const affectorId of candidateAffectors) {
    const downstream = getDownstream(affectorId, graph)
    if (downstream.includes(targetStatId) || affectorId === targetStatId) {
      return true
    }
  }
  return false
}

/**
 * Topological sort (Kahn's algorithm) on the subgraph of given statIds.
 * Returns statIds in an order where all dependencies come before dependents.
 */
export function topologicalSort(statIds: string[], graph: Graph): string[] {
  const idSet = new Set(statIds)

  // Build in-degree map and adjacency list restricted to the subgraph
  const inDegree = new Map<string, number>()
  const subgraph = new Map<string, string[]>()

  for (const id of statIds) {
    inDegree.set(id, 0)
    subgraph.set(id, [])
  }

  for (const id of statIds) {
    const dependents = graph.get(id) ?? []
    for (const dep of dependents) {
      if (idSet.has(dep)) {
        subgraph.get(id)!.push(dep)
        inDegree.set(dep, (inDegree.get(dep) ?? 0) + 1)
      }
    }
  }

  // Start with nodes that have no incoming edges
  const queue: string[] = []
  for (const [id, degree] of inDegree) {
    if (degree === 0) {
      queue.push(id)
    }
  }

  const sorted: string[] = []

  while (queue.length > 0) {
    const current = queue.shift()!
    sorted.push(current)
    for (const dep of subgraph.get(current) ?? []) {
      const newDegree = (inDegree.get(dep) ?? 0) - 1
      inDegree.set(dep, newDegree)
      if (newDegree === 0) {
        queue.push(dep)
      }
    }
  }

  // If sorted doesn't contain all ids (cycle detected), append remaining
  if (sorted.length < statIds.length) {
    for (const id of statIds) {
      if (!sorted.includes(id)) {
        sorted.push(id)
      }
    }
  }

  return sorted
}
