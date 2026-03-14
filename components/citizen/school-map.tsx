'use client'

import dynamic from 'next/dynamic'
import type { SchoolWithHealth } from './school-list'

const SchoolMapInner = dynamic(
  () => import('./school-map-inner').then((m) => ({ default: m.SchoolMapInner })),
  {
    ssr: false,
    loading: () => (
      <div className="h-[65vh] rounded-2xl bg-muted/50 animate-pulse flex items-center justify-center">
        <span className="text-muted-foreground text-[0.9rem]">Xarita yuklanmoqda...</span>
      </div>
    ),
  }
)

export function SchoolMap({ schools }: { schools: SchoolWithHealth[] }) {
  return <SchoolMapInner schools={schools} />
}
