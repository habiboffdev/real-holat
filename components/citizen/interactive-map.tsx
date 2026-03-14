'use client'

import dynamic from 'next/dynamic'
import type { SchoolWithHealth } from './school-list'

// Dynamic import with ssr: false to prevent Leaflet window errors
export const InteractiveSchoolMap = dynamic(
  () => import('./interactive-map-inner').then(m => m.InteractiveSchoolMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-[100dvh] w-full bg-muted/30 animate-pulse flex flex-col items-center justify-center">
        <div className="h-10 w-10 border-4 border-teal border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-muted-foreground font-medium text-sm">Xarita yuklanmoqda...</p>
      </div>
    )
  }
)
