import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'

interface Inspection {
  id: string
  photo_url: string | null
  is_fulfilled: boolean
  comment: string | null
  created_at: string
  promise_title: string
  school_name: string
  inspector_name: string
}

interface RecentFeedProps {
  inspections: Inspection[]
}

function relativeTime(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diffMs = now - then
  const diffMin = Math.floor(diffMs / 60_000)
  if (diffMin < 1) return 'hozirgina'
  if (diffMin < 60) return `${diffMin} daqiqa oldin`
  const diffHours = Math.floor(diffMin / 60)
  if (diffHours < 24) return `${diffHours} soat oldin`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `${diffDays} kun oldin`
  const diffWeeks = Math.floor(diffDays / 7)
  return `${diffWeeks} hafta oldin`
}

export function RecentFeed({ inspections }: RecentFeedProps) {
  if (!inspections || inspections.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Hozircha tekshiruvlar yo&apos;q
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {inspections.map((item) => {
        const isFulfilled = item.is_fulfilled
        const borderColor = isFulfilled ? '#10b981' : '#f43f5e'
        const badgeBg = isFulfilled ? 'bg-emerald/10' : 'bg-coral/10'
        const badgeText = isFulfilled ? 'text-emerald' : 'text-coral'
        const badgeLabel = isFulfilled ? 'Bajarildi' : 'Muammo'

        return (
          <Card
            key={item.id}
            className="overflow-hidden"
            style={{ borderLeft: `3px solid ${borderColor}` }}
          >
            <CardContent className="flex items-center gap-4 py-3">
              {/* Thumbnail */}
              {item.photo_url ? (
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg">
                  <Image
                    src={item.photo_url}
                    alt={item.promise_title}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                </div>
              ) : (
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <svg className="h-5 w-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                  </svg>
                </div>
              )}

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{item.school_name}</p>
                <p className="text-xs text-muted-foreground truncate">{item.promise_title}</p>
              </div>

              {/* Badge + time */}
              <div className="flex shrink-0 flex-col items-end gap-1">
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${badgeBg} ${badgeText}`}
                >
                  {badgeLabel}
                </span>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {relativeTime(item.created_at)}
                </span>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
