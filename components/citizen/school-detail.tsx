'use client'

import { Users } from 'lucide-react'
import { UZ } from '@/lib/constants/uzbek'
import { PromiseCard } from '@/components/citizen/promise-card'
import { Card } from '@/components/ui/card'
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
  const initial = school.name.charAt(0).toUpperCase()

  return (
    <div>
      {/* School hero card */}
      <div className="space-y-4">
        {school.image_url ? (
          <div className="rounded-2xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
            <img
              src={school.image_url}
              alt={school.name}
              className="h-52 w-full object-cover"
            />
          </div>
        ) : (
          <div
            className="rounded-2xl h-52 flex items-center justify-center relative overflow-hidden shadow-[0_8px_30px_rgba(12,27,46,0.15)]"
            style={{
              background:
                'linear-gradient(135deg, #0c1b2e 0%, #162d4a 40%, #06b6d4 100%)',
            }}
          >
            {/* Mesh gradient overlay circles */}
            <div
              className="absolute w-64 h-64 rounded-full opacity-20 blur-3xl"
              style={{
                background: '#06b6d4',
                top: '-30%',
                right: '-10%',
              }}
            />
            <div
              className="absolute w-48 h-48 rounded-full opacity-15 blur-3xl"
              style={{
                background: '#22d3ee',
                bottom: '-20%',
                left: '10%',
              }}
            />
            <span
              className="text-7xl text-white/20 font-extrabold relative z-10"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              {initial}
            </span>
          </div>
        )}

        <div className="space-y-2">
          <h2
            className="text-[1.4rem] font-extrabold text-foreground tracking-tight leading-tight"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            {school.name}
          </h2>
          {school.district && (
            <p className="text-muted-foreground text-[0.9rem]">
              {school.district}
            </p>
          )}
          {school.student_count && (
            <Badge variant="outline" className="rounded-full px-3.5 py-1.5 text-[0.8rem] font-medium mt-1 gap-1.5 text-navy border-navy/8 bg-white/80 backdrop-blur-sm shadow-sm">
              <Users className="h-3.5 w-3.5 text-navy/60" />
              {school.student_count} o&apos;quvchi
            </Badge>
          )}
        </div>
      </div>

      {/* Promises heading with accent line */}
      <div className="mt-8 mb-4">
        <h3
          className="text-[1.1rem] font-bold text-foreground"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          {UZ.home_promises_heading}
        </h3>
        <div className="h-[3px] w-10 rounded-full bg-teal mt-2" />
      </div>

      {/* Promise cards list - simple CSS fade-in instead of Framer stagger */}
      {promises.length > 0 ? (
        <div className="space-y-3.5">
          {promises.map((promise, index) => {
            const lastInspection =
              inspections.find((i) => i.promise_id === promise.id) ?? null

            return (
              <div
                key={promise.id}
                className="animate-in fade-in slide-in-from-bottom-2"
                style={{ animationDelay: `${index * 80}ms`, animationFillMode: 'both' }}
              >
                <PromiseCard
                  promise={promise}
                  lastInspection={lastInspection}
                  showInspectButton={showInspectButtons}
                />
              </div>
            )
          })}
        </div>
      ) : (
        <Card className="glass-card rounded-2xl py-12 px-6 text-center">
          <p className="text-muted-foreground text-[0.95rem]">
            Bu maktab uchun hali va&apos;dalar kiritilmagan
          </p>
        </Card>
      )}
    </div>
  )
}
