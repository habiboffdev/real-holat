'use client'

import dynamic from 'next/dynamic'
import type { DashboardSchool } from './dashboard-map-inner'

const DashboardMapInner = dynamic(
  () => import('./dashboard-map-inner').then(m => ({ default: m.DashboardMapInner })),
  {
    ssr: false,
    loading: () => (
      <div className="h-[400px] rounded-2xl bg-muted/50 animate-pulse flex items-center justify-center">
        <span className="text-muted-foreground text-[0.9rem]">Xarita yuklanmoqda...</span>
      </div>
    ),
  }
)

export function DashboardMap({ schools }: { schools: DashboardSchool[] }) {
  return <DashboardMapInner schools={schools} />
}

export type { DashboardSchool }
