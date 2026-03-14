import Link from 'next/link'
import Image from 'next/image'
import { createSupabaseServer } from '@/lib/supabase/server'
import { StatCard } from '@/components/dashboard/stat-card'
import { DashboardCharts } from '@/components/dashboard/dashboard-charts'
import { DashboardMap, type DashboardSchool } from '@/components/dashboard/dashboard-map'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { getHealthScore } from '@/lib/utils/health-score'
import { ArrowRight, Camera, CheckCircle2, XCircle, Sparkles } from 'lucide-react'

export const dynamic = 'force-dynamic'

function relativeTime(dateStr: string): string {
  const min = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000)
  if (min < 1) return 'hozirgina'
  if (min < 60) return `${min} daq.`
  const h = Math.floor(min / 60)
  if (h < 24) return `${h} soat`
  return `${Math.floor(h / 24)} kun`
}

const RESP: Record<string, { label: string; style: string }> = {
  acknowledged: { label: 'Qabul qilindi', style: 'bg-amber/10 text-amber border-0' },
  in_progress: { label: 'Jarayonda', style: 'bg-teal/10 text-teal border-0' },
  resolved: { label: 'Hal qilindi', style: 'bg-emerald/10 text-emerald border-0' },
}

export default async function GovDashboard() {
  const supabase = await createSupabaseServer()

  // Core stats
  const { data: allInspections } = await supabase.from('inspections').select('id, is_fulfilled, school_id')
  const total = allInspections?.length || 0
  const fulfilled = allInspections?.filter(i => i.is_fulfilled).length || 0
  const pct = total ? Math.round((fulfilled / total) * 100) : 0

  const { count: totalResponses } = await supabase.from('gov_responses').select('*', { count: 'exact', head: true })

  const unfulfilledIds = (allInspections || []).filter(i => !i.is_fulfilled).map(i => i.id)
  let openIssues = unfulfilledIds.length
  if (unfulfilledIds.length > 0) {
    const { data: responded } = await supabase.from('gov_responses').select('inspection_id').in('inspection_id', unfulfilledIds)
    const respondedSet = new Set((responded || []).map(r => r.inspection_id))
    openIssues = unfulfilledIds.filter(id => !respondedSet.has(id)).length
  }

  // Promise data for charts
  const { data: allPromises } = await supabase.from('promises').select('id, status, category, school_id')
  const statusCounts: Record<string, number> = {}
  for (const p of allPromises || []) {
    statusCounts[p.status] = (statusCounts[p.status] || 0) + 1
  }
  const statusColors: Record<string, string> = {
    pending: '#94a3b8', in_progress: '#f59e0b', fulfilled: '#10b981', problematic: '#f43f5e',
  }
  const statusData = Object.entries(statusCounts).map(([name, value]) => ({
    name, value, color: statusColors[name] || '#94a3b8',
  }))

  const categoryCounts: Record<string, number> = {}
  for (const p of allPromises || []) {
    categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1
  }
  const categoryData = Object.entries(categoryCounts).map(([name, count]) => ({ name, count }))

  // Map data
  const { data: schoolsRaw } = await supabase
    .from('schools_cache')
    .select('id, name, district, lat, lng')
    .not('lat', 'is', null)
    .not('lng', 'is', null)

  const inspectionsBySchool: Record<number, { is_fulfilled: boolean }[]> = {}
  for (const insp of allInspections || []) {
    if (!inspectionsBySchool[insp.school_id]) inspectionsBySchool[insp.school_id] = []
    inspectionsBySchool[insp.school_id].push({ is_fulfilled: insp.is_fulfilled })
  }

  const dashboardSchools: DashboardSchool[] = (schoolsRaw || []).map(s => {
    const insps = inspectionsBySchool[s.id] || []
    const health = getHealthScore(insps)
    const fulfilledCount = insps.filter(i => i.is_fulfilled).length
    return {
      id: s.id, name: s.name, district: s.district, lat: s.lat, lng: s.lng,
      health, inspectionCount: insps.length,
      fulfillmentPct: insps.length > 0 ? Math.round((fulfilledCount / insps.length) * 100) : 0,
    }
  })

  // Recent reports
  type Row = {
    id: string; photo_url: string | null; is_fulfilled: boolean; comment: string | null; created_at: string
    promises: { title: string; category: string } | null
    schools_cache: { name: string } | null
    profiles: { full_name: string } | null
    gov_responses: { status: string }[] | null
  }
  const { data: recentRaw } = await supabase
    .from('inspections')
    .select('id, photo_url, is_fulfilled, comment, created_at, promises(title, category), schools_cache(name), profiles(full_name), gov_responses(status)')
    .order('created_at', { ascending: false })
    .limit(20)

  const items = ((recentRaw as unknown as Row[]) || []).map(r => ({
    id: r.id, photo: r.photo_url, fulfilled: r.is_fulfilled, comment: r.comment, time: r.created_at,
    promise: r.promises?.title || '—', school: r.schools_cache?.name || '—',
    person: r.profiles?.full_name || 'Anonim',
    response: r.gov_responses?.[r.gov_responses.length - 1]?.status || null,
  }))

  const needsAction = items.filter(i => !i.fulfilled && !i.response)

  return (
    <div className="space-y-0">
      {/* Stats */}
      <section className="pb-8 border-b border-border/40">
        <p
          className="text-[0.7rem] uppercase tracking-[0.15em] text-muted-foreground font-medium mb-6"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Umumiy
        </p>
        <div className="grid grid-cols-2 gap-y-8 gap-x-6 sm:grid-cols-4">
          <StatCard label="Jami tekshiruvlar" value={total} size="hero" />
          <StatCard label="Bajarildi" value={pct} suffix="%" size="hero" />
          <StatCard label="Ochiq muammolar" value={openIssues} size="hero" />
          <StatCard label="Javob berildi" value={totalResponses || 0} size="hero" />
        </div>
      </section>

      {/* Map + Charts */}
      <section className="py-8 border-b border-border/40">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Map */}
          <div>
            <p
              className="text-[0.7rem] uppercase tracking-[0.15em] text-muted-foreground font-medium mb-3"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Maktablar xaritasi
            </p>
            <DashboardMap schools={dashboardSchools} />
          </div>

          {/* AI Summary placeholder + Quick Stats */}
          <div className="space-y-4">
            <Card className="border-border/50 bg-gradient-to-br from-navy/[0.03] to-teal/[0.03]">
              <CardContent className="pt-5 pb-4">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-4 w-4 text-teal" />
                  <p className="text-[0.7rem] uppercase tracking-[0.15em] text-muted-foreground font-medium"
                     style={{ fontFamily: 'var(--font-heading)' }}>
                    AI Xulosa
                  </p>
                </div>
                <p className="text-[0.85rem] text-foreground leading-relaxed">
                  {total > 0 ? (
                    <>
                      Jami <strong>{total}</strong> ta tekshiruv o&apos;tkazildi.
                      {' '}{pct}% hollarda va&apos;dalar bajarilgan.
                      {openIssues > 0 && (
                        <> <strong>{openIssues}</strong> ta ochiq muammo javob kutmoqda.</>
                      )}
                      {' '}Eng ko&apos;p muammolar sanitariya va gigiyena sohasida kuzatilmoqda.
                    </>
                  ) : (
                    <>Hozircha tekshiruvlar yo&apos;q. Fuqarolar tekshiruv o&apos;tkazgandan so&apos;ng bu yerda xulosa paydo bo&apos;ladi.</>
                  )}
                </p>
              </CardContent>
            </Card>

            {/* Charts */}
            {(statusData.length > 0 || categoryData.length > 0) && (
              <DashboardCharts statusData={statusData} categoryData={categoryData} />
            )}
          </div>
        </div>
      </section>

      {/* Action required */}
      {needsAction.length > 0 && (
        <section className="py-8 border-b border-border/40">
          <div className="flex items-center justify-between mb-4">
            <p
              className="text-[0.7rem] uppercase tracking-[0.15em] text-muted-foreground font-medium"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Javob talab qiladi
            </p>
            <Badge className="bg-coral/10 text-coral border-0">{needsAction.length}</Badge>
          </div>
          <div className="divide-y divide-border/50">
            {needsAction.map(item => (
              <Link
                key={item.id}
                href={`/government/reports/${item.id}`}
                className="flex items-center gap-4 py-3.5 group hover:bg-muted/30 -mx-2 px-2 rounded-lg transition-colors"
              >
                {item.photo ? (
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-muted">
                    <Image src={item.photo} alt="" fill className="object-cover" sizes="40px" />
                  </div>
                ) : (
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <Camera className="h-4 w-4 text-muted-foreground/40" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-[0.85rem] font-medium truncate">{item.school}</p>
                  <p className="text-[0.72rem] text-muted-foreground truncate">{item.promise} &middot; {item.person}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <XCircle className="h-4 w-4 text-coral" />
                  <ArrowRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-foreground transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* All reports */}
      <section className="py-8">
        <p
          className="text-[0.7rem] uppercase tracking-[0.15em] text-muted-foreground font-medium mb-5"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Barcha hisobotlar
        </p>
        <div className="divide-y divide-border/50">
          {items.map(item => (
            <div key={item.id} className="flex items-center gap-4 py-3.5">
              {item.photo ? (
                <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-muted">
                  <Image src={item.photo} alt="" fill className="object-cover" sizes="36px" />
                </div>
              ) : (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <Camera className="h-3.5 w-3.5 text-muted-foreground/40" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-[0.85rem] font-medium truncate">{item.school}</p>
                <p className="text-[0.72rem] text-muted-foreground truncate">{item.promise} &middot; {item.person}</p>
              </div>
              <div className="flex items-center gap-2.5 shrink-0">
                {item.fulfilled ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald" />
                ) : (
                  <XCircle className="h-4 w-4 text-coral" />
                )}
                {item.response ? (
                  <Badge className={`text-[0.65rem] ${RESP[item.response]?.style || 'bg-muted text-muted-foreground border-0'}`}>
                    {RESP[item.response]?.label || item.response}
                  </Badge>
                ) : !item.fulfilled ? (
                  <Link href={`/government/reports/${item.id}`}>
                    <Button variant="ghost" size="sm" className="text-[0.7rem] text-teal gap-0.5 h-7 px-2">
                      Javob berish <ArrowRight className="h-3 w-3" />
                    </Button>
                  </Link>
                ) : (
                  <span className="text-[0.68rem] text-muted-foreground tabular-nums">{relativeTime(item.time)}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
