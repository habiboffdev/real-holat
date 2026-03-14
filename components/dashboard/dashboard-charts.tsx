'use client'

import dynamic from 'next/dynamic'
import { Card, CardContent } from '@/components/ui/card'

function ChartSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardContent className="pt-4">
          <div className="h-4 w-32 rounded bg-muted animate-pulse mb-4" />
          <div className="h-[260px] flex items-center justify-center">
            <div className="h-[200px] w-[200px] rounded-full border-[24px] border-muted animate-pulse" />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-4">
          <div className="h-4 w-40 rounded bg-muted animate-pulse mb-4" />
          <div className="h-[300px] flex flex-col justify-center gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-6 rounded bg-muted animate-pulse" style={{ width: `${80 - i * 10}%` }} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

const DashboardChartsInner = dynamic(
  () => import('./dashboard-charts-inner'),
  {
    ssr: false,
    loading: () => <ChartSkeleton />,
  }
)

interface DashboardChartsProps {
  statusData: { name: string; value: number; color: string }[]
  categoryData: { name: string; count: number }[]
}

export function DashboardCharts({ statusData, categoryData }: DashboardChartsProps) {
  return <DashboardChartsInner statusData={statusData} categoryData={categoryData} />
}
