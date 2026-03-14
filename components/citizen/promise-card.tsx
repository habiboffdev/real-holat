'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Droplets,
  SprayCan,
  Armchair,
  UtensilsCrossed,
  Dumbbell,
  Building2,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { UZ } from '@/lib/constants/uzbek'

export interface PromiseCardProps {
  promise: {
    id: string
    category: string
    title: string
    description: string | null
    status: string
  }
  lastInspection?: { created_at: string } | null
  showInspectButton?: boolean
}

const CATEGORY_CONFIG: Record<
  string,
  { icon: typeof Droplets; borderClass: string; colorClass: string; label: string }
> = {
  toilet_repair: {
    icon: Droplets,
    borderClass: 'border-l-teal',
    colorClass: 'text-teal',
    label: UZ.category_toilet_repair,
  },
  soap_dispensers: {
    icon: SprayCan,
    borderClass: 'border-l-teal-light',
    colorClass: 'text-teal-light',
    label: UZ.category_soap_dispensers,
  },
  new_desks: {
    icon: Armchair,
    borderClass: 'border-l-amber',
    colorClass: 'text-amber',
    label: UZ.category_new_desks,
  },
  cafeteria: {
    icon: UtensilsCrossed,
    borderClass: 'border-l-emerald',
    colorClass: 'text-emerald',
    label: UZ.category_cafeteria,
  },
  sports_hall: {
    icon: Dumbbell,
    borderClass: 'border-l-coral',
    colorClass: 'text-coral',
    label: UZ.category_sports_hall,
  },
  renovation: {
    icon: Building2,
    borderClass: 'border-l-navy-light',
    colorClass: 'text-navy-light',
    label: UZ.category_renovation,
  },
}

function getRelativeTime(dateString: string): string {
  const now = new Date()
  const date = new Date(dateString)
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Bugun'
  if (diffDays === 1) return 'Kecha'
  if (diffDays < 7) return `${diffDays} kun oldin`
  const diffWeeks = Math.floor(diffDays / 7)
  if (diffWeeks === 1) return '1 hafta oldin'
  if (diffWeeks < 4) return `${diffWeeks} hafta oldin`
  const diffMonths = Math.floor(diffDays / 30)
  if (diffMonths === 1) return '1 oy oldin'
  return `${diffMonths} oy oldin`
}

export function PromiseCard({
  promise,
  lastInspection,
  showInspectButton = false,
}: PromiseCardProps) {
  const config = CATEGORY_CONFIG[promise.category] ?? CATEGORY_CONFIG.renovation
  const Icon = config.icon

  return (
    <div
      className={`glass-card rounded-2xl p-5 space-y-3 border-l-4 ${config.borderClass}`}
    >
      {/* Top row: icon + title */}
      <div className="flex items-start gap-3">
        <Icon className={`h-6 w-6 shrink-0 mt-0.5 ${config.colorClass}`} />
        <h3
          className="text-[1.05rem] font-semibold text-foreground leading-snug"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          {config.label}
        </h3>
      </div>

      {/* Description */}
      {promise.description && (
        <p className="text-muted-foreground text-[0.9rem] leading-relaxed">
          {promise.description}
        </p>
      )}

      {/* Bottom section */}
      <div>
        {/* Status badges */}
        {promise.status === 'fulfilled' && (
          <Badge variant="secondary" className="bg-emerald/10 text-emerald">
            Bajarildi
          </Badge>
        )}
        {promise.status === 'problematic' && (
          <Badge variant="secondary" className="bg-coral/10 text-coral">
            Muammoli
          </Badge>
        )}

        {/* Inspected state */}
        {lastInspection && (
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-emerald/10 text-emerald">
              {UZ.home_inspected}
            </Badge>
            <span className="text-muted-foreground text-[0.8rem]">
              {getRelativeTime(lastInspection.created_at)}
            </span>
          </div>
        )}

        {/* Inspect button */}
        {showInspectButton && !lastInspection && promise.status !== 'fulfilled' && promise.status !== 'problematic' && (
          <motion.div whileTap={{ scale: 0.98 }}>
            <Link
              href={`/citizen/inspect/${promise.id}`}
              className="h-12 w-full rounded-xl bg-teal text-white font-semibold text-[0.95rem] flex items-center justify-center gap-2 hover:bg-teal/90 transition-colors mt-1"
            >
              TEKSHIRING &rarr;
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  )
}
