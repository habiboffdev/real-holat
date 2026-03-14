'use client'

import Link from 'next/link'
import {
  Droplets,
  SprayCan,
  Armchair,
  UtensilsCrossed,
  Dumbbell,
  Building2,
  CheckCircle2,
  Clock,
  Camera,
  ChevronRight,
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
  { icon: typeof Droplets; accent: string; label: string }
> = {
  toilet_repair: { icon: Droplets, accent: 'text-teal', label: UZ.category_toilet_repair },
  soap_dispensers: { icon: SprayCan, accent: 'text-teal', label: UZ.category_soap_dispensers },
  new_desks: { icon: Armchair, accent: 'text-amber', label: UZ.category_new_desks },
  cafeteria: { icon: UtensilsCrossed, accent: 'text-emerald', label: UZ.category_cafeteria },
  sports_hall: { icon: Dumbbell, accent: 'text-coral', label: UZ.category_sports_hall },
  renovation: { icon: Building2, accent: 'text-navy', label: UZ.category_renovation },
}

function relativeTime(dateStr: string): string {
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
  if (days === 0) return 'Bugun'
  if (days === 1) return 'Kecha'
  if (days < 7) return `${days} kun oldin`
  if (days < 30) return `${Math.floor(days / 7)} hafta oldin`
  return `${Math.floor(days / 30)} oy oldin`
}

export function PromiseCard({ promise, lastInspection, showInspectButton = false }: PromiseCardProps) {
  const config = CATEGORY_CONFIG[promise.category] ?? CATEGORY_CONFIG.renovation
  const Icon = config.icon
  const isInspected = !!lastInspection
  const canInspect = showInspectButton && !isInspected && promise.status !== 'fulfilled'

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="flex items-stretch">
          {/* Left content */}
          <div className="flex-1 p-4">
            <div className="flex items-center gap-2.5">
              <Icon className={`h-[18px] w-[18px] shrink-0 ${config.accent}`} />
              <h3
                className="text-[0.95rem] font-semibold leading-tight text-foreground"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                {config.label}
              </h3>
            </div>

            {promise.description && (
              <p className="mt-1.5 text-[0.82rem] leading-relaxed text-muted-foreground line-clamp-2 pl-[30px]">
                {promise.description}
              </p>
            )}

            {/* Status row bg-emerald/10 text-emerald */}
            <div className="mt-3 flex flex-wrap items-center gap-2 pl-[30px]">
              {promise.status === 'fulfilled' ? (
                <Badge className="gap-1 rounded-md bg-emerald/10 text-emerald text-[0.72rem] font-medium border-0">
                  <CheckCircle2 className="h-3 w-3" />
                  Bajarildi
                </Badge>
              ) : promise.status === 'problematic' ? (
                <Badge variant="destructive" className="rounded-md text-[0.72rem]">
                  Muammoli
                </Badge>
              ) : isInspected ? (
                // 🚀 $10B UX: The "Under Review" State
                <Badge className="gap-1.5 rounded-md bg-amber/10 text-amber-700 text-[0.72rem] font-medium border border-amber/20 overflow-hidden relative">
                  <span className="absolute inset-0 w-full h-full bg-amber/10 -translate-x-full animate-[shimmer_2s_infinite]" />
                  <Clock className="h-3 w-3 animate-pulse" />
                  Tekshirilmoqda
                </Badge>
              ) : null}

              {isInspected && (
                <span className="flex items-center gap-1 text-[0.72rem] text-muted-foreground ml-auto">
                  {relativeTime(lastInspection!.created_at)} yuborildi
                </span>
              )}
            </div>
          </div>

          {/* Right action area — MASSIVE TAP TARGET for 70yo users */}
          {canInspect && (
            <Link
              href={`/citizen/inspect/${promise.id}`}
              className="flex w-[88px] shrink-0 flex-col items-center justify-center gap-2 border-l-2 border-border bg-gradient-to-b from-teal/[0.05] to-teal/[0.12] text-teal transition-all active:bg-teal/20"
            >
              <div className="rounded-full bg-white p-2.5 shadow-sm border border-teal/20">
                <Camera className="h-6 w-6" />
              </div>
              <span className="text-[0.68rem] font-bold uppercase tracking-wider text-center leading-tight px-1 text-navy">
                Rasmini<br/>Olish
              </span>
            </Link>
          )}

          {isInspected && !canInspect && (
            <div className="flex w-[60px] shrink-0 items-center justify-center border-l border-border bg-muted/20">
              <ChevronRight className="h-5 w-5 text-muted-foreground/40" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
