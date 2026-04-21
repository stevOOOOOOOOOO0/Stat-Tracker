export function buildGraph(_stats: unknown[]): Map<string, string[]> { return new Map() }
export function getDownstream(_id: string, _graph: Map<string, string[]>): string[] { return [] }
export function detectCycle(_ids: string[], _targetId: string, _graph: Map<string, string[]>): boolean { return false }
export function topologicalSort(ids: string[], _graph: Map<string, string[]>): string[] { return ids }
