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
      {/* School hero card — gradient with watermark */}
      <div className="rounded-2xl bg-gradient-to-br from-navy to-navy-light p-6 text-white relative overflow-hidden">
        {/* Watermark school number */}
        {schoolNumber && (
          <span
            className="pointer-events-none absolute -bottom-4 -right-2 text-[8rem] font-black text-white/[0.06] leading-none select-none"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            {schoolNumber}
          </span>
        )}
        {/* Decorative glow */}
        <div className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-teal opacity-[0.12] blur-[50px]" />

        <div className="relative z-10 flex items-start gap-4">
          {/* School number badge */}
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
            <span
              className="text-xl font-bold text-white"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              {schoolNumber || '#'}
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <h2
              className="text-[1.15rem] font-bold leading-snug tracking-tight text-white"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              {school.name}
            </h2>

            <div className="mt-2 flex flex-wrap items-center gap-2">
              {school.district && (
                <Badge className="gap-1 rounded-lg text-[0.75rem] font-normal bg-white/10 text-white/80 border-0 hover:bg-white/15">
                  <MapPin className="h-3 w-3" />
                  {school.district}
                </Badge>
              )}
              {school.student_count && (
                <Badge className="gap-1 rounded-lg text-[0.75rem] font-normal bg-white/10 text-white/80 border-0 hover:bg-white/15">
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
          className="mb-3 text-[1.05rem] font-bold text-navy"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Maktab holati va muammolari
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
