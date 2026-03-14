import Link from 'next/link'
import Image from 'next/image'
import { createSupabaseServer } from '@/lib/supabase/server'
import { StatCard } from '@/components/dashboard/stat-card'
import { DashboardCharts } from '@/components/dashboard/dashboard-charts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  ClipboardCheck,
  CheckCircle,
  AlertTriangle,
  MessageSquare,
  ArrowRight,
} from 'lucide-react'

export const metadata = {
  title: 'Boshqaruv paneli — Real Holat',
  description: "Davlat boshqaruv paneli — tekshiruvlar va javoblar",
}

export const dynamic = 'force-dynamic'

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

const RESPONSE_STATUS_LABELS: Record<string, string> = {
  acknowledged: 'Qabul qilindi',
  in_progress: 'Jarayonda',
  resolved: 'Hal qilindi',
}

const RESPONSE_STATUS_COLORS: Record<string, string> = {
  acknowledged: 'bg-amber/10 text-amber',
  in_progress: 'bg-teal/10 text-teal',
  resolved: 'bg-emerald/10 text-emerald',
}

export default async function GovernmentDashboardPage() {
  const supabase = await createSupabaseServer()

  // --- Stats ---
  const { count: totalInspections } = await supabase
    .from('inspections')
    .select('*', { count: 'exact', head: true })

  const { data: allInspections } = await supabase
    .from('inspections')
    .select('is_fulfilled')

  const fulfilled = allInspections?.filter((i) => i.is_fulfilled).length || 0
  const fulfillmentPct = allInspections?.length
    ? Math.round((fulfilled / allInspections.length) * 100)
    : 0

  // Total gov responses
  const { count: totalResponses } = await supabase
    .from('gov_responses')
    .select('*', { count: 'exact', head: true })

  // Inspections that are unfulfilled AND have no gov response = open issues
  const { data: unfulfilledInspections } = await supabase
    .from('inspections')
    .select('id')
    .eq('is_fulfilled', false)

  const unfulfilledIds = (unfulfilledInspections || []).map((i) => i.id)

  let openIssues = unfulfilledIds.length
  if (unfulfilledIds.length > 0) {
    const { data: respondedInspections } = await supabase
      .from('gov_responses')
      .select('inspection_id')
      .in('inspection_id', unfulfilledIds)

    const respondedSet = new Set(
      (respondedInspections || []).map((r) => r.inspection_id)
    )
    openIssues = unfulfilledIds.filter((id) => !respondedSet.has(id)).length
  }

  // --- Charts ---
  const { data: promises } = await supabase
    .from('promises')
    .select('status, category')

  const statusCounts: Record<string, number> = {}
  const categoryCounts: Record<string, number> = {}
  promises?.forEach((p) => {
    statusCounts[p.status] = (statusCounts[p.status] || 0) + 1
    if (p.category) {
      categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1
    }
  })

  const STATUS_COLORS: Record<string, string> = {
    pending: '#f59e0b',
    fulfilled: '#10b981',
    problematic: '#f43f5e',
    in_progress: '#06b6d4',
  }

  const statusData = Object.entries(statusCounts).map(([name, value]) => ({
    name,
    value,
    color: STATUS_COLORS[name] || '#94a3b8',
  }))

  const categoryData = Object.entries(categoryCounts).map(([name, count]) => ({
    name,
    count,
  }))

  // --- Recent inspections with gov responses ---
  const { data: recentRaw } = await supabase
    .from('inspections')
    .select(
      'id, photo_url, is_fulfilled, comment, created_at, promises(title, category), schools_cache(name, district), profiles(full_name), gov_responses(status)'
    )
    .order('created_at', { ascending: false })
    .limit(20)

  type InspectionRow = {
    id: string
    photo_url: string | null
    is_fulfilled: boolean
    comment: string | null
    created_at: string
    promises: { title: string; category: string } | null
    schools_cache: { name: string; district: string } | null
    profiles: { full_name: string } | null
    gov_responses: { status: string }[] | null
  }

  const recentInspections = ((recentRaw as unknown as InspectionRow[]) || []).map((r) => ({
    id: r.id,
    photo_url: r.photo_url,
    is_fulfilled: r.is_fulfilled,
    comment: r.comment,
    created_at: r.created_at,
    promise_title: r.promises?.title || "Noma'lum",
    promise_category: r.promises?.category || '',
    school_name: r.schools_cache?.name || "Noma'lum",
    district: r.schools_cache?.district || '',
    inspector_name: r.profiles?.full_name || 'Anonim',
    gov_response_status:
      r.gov_responses && r.gov_responses.length > 0
        ? r.gov_responses[r.gov_responses.length - 1].status
        : null,
  }))

  return (
    <div className="space-y-6">
      {/* Welcome heading */}
      <div>
        <h1
          className="text-2xl font-bold"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Boshqaruv paneli
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Tekshiruvlar va fuqarolar hisobotlari
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Jami tekshiruvlar"
          value={totalInspections || 0}
          icon={<ClipboardCheck />}
          color="#06b6d4"
        />
        <StatCard
          label="Bajarildi"
          value={fulfillmentPct}
          icon={<CheckCircle />}
          color="#10b981"
          suffix="%"
        />
        <StatCard
          label="Ochiq muammolar"
          value={openIssues}
          icon={<AlertTriangle />}
          color="#f43f5e"
        />
        <StatCard
          label="Javob berildi"
          value={totalResponses || 0}
          icon={<MessageSquare />}
          color="#f59e0b"
        />
      </div>

      {/* Two-column layout */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Left: Reports feed (wider) */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle
                className="text-lg"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                Oxirgi hisobotlar
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentInspections.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Hozircha tekshiruvlar yo&apos;q
                </p>
              ) : (
                recentInspections.map((item) => {
                  const isFulfilled = item.is_fulfilled
                  const borderColor = isFulfilled ? '#10b981' : '#f43f5e'
                  const verdictBg = isFulfilled
                    ? 'bg-emerald/10'
                    : 'bg-coral/10'
                  const verdictText = isFulfilled
                    ? 'text-emerald'
                    : 'text-coral'
                  const verdictLabel = isFulfilled ? 'Bajarildi' : 'Muammo'

                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 rounded-xl border p-3"
                      style={{ borderLeft: `3px solid ${borderColor}` }}
                    >
                      {/* Thumbnail */}
                      {item.photo_url ? (
                        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg">
                          <Image
                            src={item.photo_url}
                            alt={item.promise_title}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        </div>
                      ) : (
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-muted">
                          <svg
                            className="h-6 w-6 text-muted-foreground"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1.5}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
                            />
                          </svg>
                        </div>
                      )}

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {item.school_name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {item.promise_title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {item.inspector_name} &middot;{' '}
                          {relativeTime(item.created_at)}
                        </p>
                      </div>

                      {/* Badge + action */}
                      <div className="flex shrink-0 flex-col items-end gap-2">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${verdictBg} ${verdictText}`}
                        >
                          {verdictLabel}
                        </span>
                        {item.gov_response_status ? (
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                              RESPONSE_STATUS_COLORS[
                                item.gov_response_status
                              ] || 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {RESPONSE_STATUS_LABELS[
                              item.gov_response_status
                            ] || item.gov_response_status}
                          </span>
                        ) : !isFulfilled ? (
                          <Link
                            href={`/government/reports/${item.id}`}
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs gap-1"
                            >
                              Javob berish
                              <ArrowRight className="h-3 w-3" />
                            </Button>
                          </Link>
                        ) : null}
                      </div>
                    </div>
                  )
                })
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Charts */}
        <div className="lg:col-span-2">
          <DashboardCharts statusData={statusData} categoryData={categoryData} />
        </div>
      </div>
    </div>
  )
}
