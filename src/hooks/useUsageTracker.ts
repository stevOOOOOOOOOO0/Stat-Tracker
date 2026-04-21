export function useUsageTracker() {
  return { recordUsage: (_entityId: string, _entityType: string) => {} }
}
