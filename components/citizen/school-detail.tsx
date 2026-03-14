'use client'

import { motion } from 'framer-motion'
import { UZ } from '@/lib/constants/uzbek'
import { PromiseCard } from '@/components/citizen/promise-card'
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
  return (
    <div>
      {/* School hero card */}
      <div className="space-y-3">
        {school.image_url ? (
          <div className="rounded-2xl overflow-hidden">
            <img
              src={school.image_url}
              alt={school.name}
              className="h-48 w-full object-cover"
            />
          </div>
        ) : (
          <div className="bg-gradient-to-br from-navy to-navy-light rounded-2xl h-48 flex items-center justify-center">
            <span
              className="text-5xl text-white/30 font-bold"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              {school.name.charAt(0)}
            </span>
          </div>
        )}

        <div className="space-y-1">
          <h2
            className="text-[1.35rem] font-bold text-foreground"
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
            <span className="inline-block bg-navy/5 text-navy rounded-full px-2.5 py-0.5 text-[0.8rem] font-medium mt-1">
              {school.student_count} o&apos;quvchi
            </span>
          )}
        </div>
      </div>

      {/* Promises heading */}
      <h3
        className="text-[1.1rem] font-semibold text-foreground mt-6 mb-3"
        style={{ fontFamily: 'var(--font-heading)' }}
      >
        {UZ.home_promises_heading}
      </h3>

      {/* Promise cards list */}
      {promises.length > 0 ? (
        <div className="space-y-3">
          {promises.map((promise, index) => {
            const lastInspection =
              inspections.find((i) => i.promise_id === promise.id) ?? null

            return (
              <motion.div
                key={promise.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.35 }}
              >
                <PromiseCard
                  promise={promise}
                  lastInspection={lastInspection}
                  showInspectButton={showInspectButtons}
                />
              </motion.div>
            )
          })}
        </div>
      ) : (
        <p className="text-muted-foreground text-center py-8 text-[0.95rem]">
          Bu maktab uchun hali va&apos;dalar kiritilmagan
        </p>
      )}
    </div>
  )
}
