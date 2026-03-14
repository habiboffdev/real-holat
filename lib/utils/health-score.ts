export type HealthStatus = 'green' | 'yellow' | 'red' | 'gray'

export function getHealthScore(inspections: { is_fulfilled: boolean }[]): HealthStatus {
  if (inspections.length === 0) return 'gray'
  const fulfilled = inspections.filter(i => i.is_fulfilled).length
  const ratio = fulfilled / inspections.length
  if (ratio >= 0.7) return 'green'
  if (ratio >= 0.4) return 'yellow'
  return 'red'
}

export function getHealthColor(status: HealthStatus): string {
  switch (status) {
    case 'green': return 'bg-emerald'
    case 'yellow': return 'bg-amber'
    case 'red': return 'bg-coral'
    case 'gray': return 'bg-muted-foreground/30'
  }
}

export function getHealthLabel(status: HealthStatus): string {
  switch (status) {
    case 'green': return 'Yaxshi'
    case 'yellow': return 'Aralash'
    case 'red': return 'Muammoli'
    case 'gray': return 'Tekshirilmagan'
  }
}
