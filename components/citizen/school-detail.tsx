'use client'

import { MapPin, Users } from 'lucide-react'
import { UZ } from '@/lib/constants/uzbek'
import { PromiseCard } from '@/components/citizen/promise-card'
import { Badge } from '@/components/ui/badge'
import type { School } from '@/lib/api/schools'

interface SchoolDetailProps {
  school: School
  promises: Array<{
    id: string
    category: string
    title: string
    description: string | null
    status: string
  }>
  inspections?: Array<{ promise_id: string; created_at: string }>
  showInspectButtons?: boolean
}

export function SchoolDetail({
  school,
  promises,
  inspections = [],
  showInspectButtons = false,
}: SchoolDetailProps) {
  const schoolNumber = school.name.match(/(\d+)/)?.[1]

  return (
    <div className="space-y-6">
      {/* School card — compact, informational, no giant hero */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-start gap-4">
          {/* School number badge */}
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-navy text-white">
            <span
              className="text-xl font-bold"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              {schoolNumber || '#'}
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <h2
              className="text-[1.15rem] font-bold leading-snug tracking-tight text-foreground"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              {school.name}
            </h2>

            <div className="mt-2 flex flex-wrap items-center gap-2">
              {school.district && (
                <Badge variant="outline" className="gap-1 rounded-lg text-[0.75rem] font-normal text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  {school.district}
                </Badge>
              )}
              {school.student_count && (
                <Badge variant="outline" className="gap-1 rounded-lg text-[0.75rem] font-normal text-muted-foreground">
                  <Users className="h-3 w-3" />
                  {school.student_count} o&apos;quvchi
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Promises section */}
      <div>
        <h3
          className="mb-3 text-[0.95rem] font-semibold text-foreground"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          {UZ.home_promises_heading}
        </h3>

        {promises.length > 0 ? (
          <div className="space-y-3">
            {promises.map((promise) => {
              const lastInspection =
                inspections.find((i) => i.promise_id === promise.id) ?? null

              return (
                <PromiseCard
                  key={promise.id}
                  promise={promise}
                  lastInspection={lastInspection}
                  showInspectButton={showInspectButtons}
                />
              )
            })}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border py-10 text-center">
            <p className="text-[0.9rem] text-muted-foreground">
              Bu maktab uchun hali va&apos;dalar kiritilmagan
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
