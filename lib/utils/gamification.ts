export interface InspectorLevel {
  level: number
  name: string
  badge: string
  minInspections: number
  nextLevelAt: number | null
}

const LEVELS: InspectorLevel[] = [
  { level: 1, name: 'Yangi Inspector', badge: '⭐', minInspections: 0, nextLevelAt: 3 },
  { level: 2, name: 'Faol Inspector', badge: '⭐⭐', minInspections: 3, nextLevelAt: 10 },
  { level: 3, name: 'Tajribali Inspector', badge: '⭐⭐⭐', minInspections: 10, nextLevelAt: 25 },
  { level: 4, name: 'Expert Inspector', badge: '🏆', minInspections: 25, nextLevelAt: 50 },
  { level: 5, name: 'Xalq Qahramoni', badge: '💎', minInspections: 50, nextLevelAt: null },
]

export function getLevel(inspectionCount: number): InspectorLevel {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (inspectionCount >= LEVELS[i].minInspections) return LEVELS[i]
  }
  return LEVELS[0]
}

export function getProgress(inspectionCount: number): { current: number; needed: number; percentage: number } {
  const level = getLevel(inspectionCount)
  if (!level.nextLevelAt) return { current: inspectionCount, needed: inspectionCount, percentage: 100 }
  const progress = inspectionCount - level.minInspections
  const needed = level.nextLevelAt - level.minInspections
  return { current: progress, needed, percentage: Math.round((progress / needed) * 100) }
}
