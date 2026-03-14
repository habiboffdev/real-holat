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
  CheckCircle2,
  Clock,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
  {
    icon: typeof Droplets
    borderColor: string
    bgColor: string
    textColor: string
    iconBg: string
    label: string
  }
> = {
  toilet_repair: {
    icon: Droplets,
    borderColor: 'border-l-teal',
    bgColor: 'bg-teal/8',
    textColor: 'text-teal',
    iconBg: 'bg-teal/10',
    label: UZ.category_toilet_repair,
  },
  soap_dispensers: {
    icon: SprayCan,
    borderColor: 'border-l-teal-light',
    bgColor: 'bg-teal-light/8',
    textColor: 'text-teal-light',
    iconBg: 'bg-teal-light/10',
    label: UZ.category_soap_dispensers,
  },
  new_desks: {
    icon: Armchair,
    borderColor: 'border-l-amber',
    bgColor: 'bg-amber/8',
    textColor: 'text-amber',
    iconBg: 'bg-amber/10',
    label: UZ.category_new_desks,
  },
  cafeteria: {
    icon: UtensilsCrossed,
    borderColor: 'border-l-emerald',
    bgColor: 'bg-emerald/8',
    textColor: 'text-emerald',
    iconBg: 'bg-emerald/10',
    label: UZ.category_cafeteria,
  },
  sports_hall: {
    icon: Dumbbell,
    borderColor: 'border-l-coral',
    bgColor: 'bg-coral/8',
    textColor: 'text-coral',
    iconBg: 'bg-coral/10',
    label: UZ.category_sports_hall,
  },
  renovation: {
    icon: Building2,
    borderColor: 'border-l-navy-light',
    bgColor: 'bg-navy-light/8',
    textColor: 'text-navy-light',
    iconBg: 'bg-navy-light/10',
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
    <Card className={`glass-card border-l-4 ${config.borderColor} rounded-2xl`}>
      <CardContent className="space-y-4">
        {/* Top row: icon pill + title */}
        <div className="flex items-start gap-3.5">
          <div
            className={`w-10 h-10 rounded-xl ${config.iconBg} flex items-center justify-center shrink-0`}
          >
            <Icon className={`h-5 w-5 ${config.textColor}`} />
          </div>
          <div className="flex-1 min-w-0">
            <h3
              className="text-[1.05rem] font-bold text-foreground leading-snug tracking-tight"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              {config.label}
            </h3>
            {promise.description && (
              <p className="text-muted-foreground text-[0.85rem] leading-relaxed mt-1.5 line-clamp-2">
                {promise.description}
              </p>
            )}
          </div>
        </div>

        {/* Bottom section */}
        <div className="space-y-3">
          {/* Status badges */}
          {promise.status === 'fulfilled' && (
            <div className="flex items-center gap-2">
              <Badge className="bg-emerald/10 text-emerald border-emerald/20 rounded-full px-3 py-1.5 text-[0.8rem] font-semibold gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Bajarildi
              </Badge>
            </div>
          )}
          {promise.status === 'problematic' && (
            <div className="flex items-center gap-2">
              <Badge variant="destructive" className="rounded-full px-3 py-1.5 text-[0.8rem] font-semibold">
                Muammoli
              </Badge>
            </div>
          )}

          {/* Inspected state */}
          {lastInspection && (
            <div className="flex items-center gap-2.5">
              <Badge className="bg-emerald/10 text-emerald border-emerald/20 rounded-full px-3 py-1.5 text-[0.8rem] font-semibold gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {UZ.home_inspected}
              </Badge>
              <span className="text-muted-foreground text-[0.78rem] flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {getRelativeTime(lastInspection.created_at)}
              </span>
            </div>
          )}

          {/* Inspect button - the HERO CTA */}
          {showInspectButton &&
            !lastInspection &&
            promise.status !== 'fulfilled' &&
            promise.status !== 'problematic' && (
              <motion.div whileTap={{ scale: 0.97 }}>
                <Link
                  href={`/citizen/inspect/${promise.id}`}
                  className="h-14 w-full rounded-xl bg-teal text-white font-bold text-[0.95rem] tracking-wide flex items-center justify-center gap-2.5 transition-all duration-200 shadow-[0_4px_14px_rgba(6,182,212,0.35)] hover:shadow-[0_6px_20px_rgba(6,182,212,0.45)] hover:bg-teal/95"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  TEKSHIRING
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14m-7-7 7 7-7 7" />
                  </svg>
                </Link>
              </motion.div>
            )}
        </div>
      </CardContent>
    </Card>
  )
}
