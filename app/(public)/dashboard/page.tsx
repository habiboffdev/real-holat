import Image from 'next/image'
import Link from 'next/link'
import { createSupabaseServer } from '@/lib/supabase/server'
import { StatCard } from '@/components/dashboard/stat-card'
import { DashboardCharts } from '@/components/dashboard/dashboard-charts'
import { DashboardMap, type DashboardSchool } from '@/components/dashboard/dashboard-map'
import { RecentFeed } from '@/components/dashboard/recent-feed'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { getHealthScore, getHealthLabel, type HealthStatus } from '@/lib/utils/health-score'
import { ArrowRight, ShieldCheck } from 'lucide-react'

export const dynamic = 'force-dynamic'

function healthDotColor(status: HealthStatus): string {
  switch (status) {
    case 'green': return 'bg-emerald'
    case 'yellow': return 'bg-amber'
    case 'red': return 'bg-coral'
    case 'gray': return 'bg-muted-foreground/30'
  }
}

export default async function PublicDashboard() {
  const supabase = await createSupabaseServer()

  // Fetch all inspections
  const { data: allInspections } = await supabase
    .from('inspections')
    .select('id, is_fulfilled, school_id, photo_url, comment, created_at, promise_id')

  const total = allInspections?.length || 0
  const fulfilled = allInspections?.filter(i => i.is_fulfilled).length || 0
  const pct = total ? Math.round((fulfilled / total) * 100) : 0
  const issues = total - fulfilled
  const schoolIds = new Set(allInspections?.map(i => i.school_id) || [])

  // Inspector count
  const { count: inspectorCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'citizen')

  // Fetch promises for charts
  const { data: allPromises } = await supabase.from('promises').select('id, status, category, school_id')

  // Status chart data
  const statusCounts: Record<string, number> = {}
  for (const p of allPromises || []) {
    statusCounts[p.status] = (statusCounts[p.status] || 0) + 1
  }
  const statusColors: Record<string, string> = {
    pending: '#94a3b8',
    in_progress: '#f59e0b',
    fulfilled: '#10b981',
    problematic: '#f43f5e',
  }
  const statusData = Object.entries(statusCounts).map(([name, value]) => ({
    name,
    value,
    color: statusColors[name] || '#94a3b8',
  }))

  // Category chart data
  const categoryCounts: Record<string, number> = {}
  for (const p of allPromises || []) {
    categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1
  }
  const categoryData = Object.entries(categoryCounts).map(([name, count]) => ({ name, count }))

  // Fetch schools with coordinates for the map
  const { data: schoolsRaw } = await supabase
    .from('schools_cache')
    .select('id, name, district, lat, lng')
    .not('lat', 'is', null)
    .not('lng', 'is', null)

  // Also fetch schools that have promises (even without coords) for the ranking
  const schoolIdsWithPromises = new Set((allPromises || []).map(p => p.school_id))
  const { data: allSchoolsForRanking } = await supabase
    .from('schools_cache')
    .select('id, name, district')
    .in('id', Array.from(schoolIdsWithPromises))

  // Group inspections by school for health scores
  const inspectionsBySchool: Record<number, { is_fulfilled: boolean }[]> = {}
  for (const insp of allInspections || []) {
    if (!inspectionsBySchool[insp.school_id]) inspectionsBySchool[insp.school_id] = []
    inspectionsBySchool[insp.school_id].push({ is_fulfilled: insp.is_fulfilled })
  }

  // Build map schools
  const dashboardSchools: DashboardSchool[] = (schoolsRaw || []).map(s => {
    const insps = inspectionsBySchool[s.id] || []
    const health = getHealthScore(insps)
    const fulfilledCount = insps.filter(i => i.is_fulfilled).length
    return {
      id: s.id,
      name: s.name,
      district: s.district,
      lat: s.lat,
      lng: s.lng,
      health,
      inspectionCount: insps.length,
      fulfillmentPct: insps.length > 0 ? Math.round((fulfilledCount / insps.length) * 100) : 0,
    }
  })

  // Build school ranking (sorted by health, then inspection count)
  const schoolRanking = (allSchoolsForRanking || []).map(s => {
    const insps = inspectionsBySchool[s.id] || []
    const health = getHealthScore(insps)
    const fulfilledCount = insps.filter(i => i.is_fulfilled).length
    return {
      id: s.id,
      name: s.name,
      district: s.district,
      health,
      inspectionCount: insps.length,
      fulfillmentPct: insps.length > 0 ? Math.round((fulfilledCount / insps.length) * 100) : 0,
    }
  }).sort((a, b) => {
    // Sort: red first (most problems), then yellow, then green, then gray
    const order: Record<string, number> = { red: 0, yellow: 1, green: 2, gray: 3 }
    return (order[a.health] ?? 3) - (order[b.health] ?? 3)
  })

  // Recent inspections for feed
  type Row = {
    id: string; photo_url: string | null; is_fulfilled: boolean; comment: string | null; created_at: string
    promises: { title: string } | null; schools_cache: { name: string } | null; profiles: { full_name: string } | null
  }
  const { data: recentRaw } = await supabase
    .from('inspections')
    .select('id, photo_url, is_fulfilled, comment, created_at, promises(title), schools_cache(name), profiles(full_name)')
    .order('created_at', { ascending: false })
    .limit(6)

  const recentInspections = ((recentRaw as unknown as Row[]) || []).map(r => ({
    id: r.id,
    photo_url: r.photo_url,
    is_fulfilled: r.is_fulfilled,
    comment: r.comment,
    created_at: r.created_at,
    promise_title: r.promises?.title || '—',
    school_name: r.schools_cache?.name || '—',
    inspector_name: r.profiles?.full_name || 'Anonim',
  }))

  return (
    <div className="min-h-dvh bg-background">
      {/* Header */}
      <header className="border-b border-border/50">
        <div className="mx-auto max-w-6xl px-5 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-navy flex items-center justify-center">
              <ShieldCheck className="h-4 w-4 text-teal-light" />
            </div>
            <span className="text-[1rem] font-bold tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>Real Holat</span>
          </Link>
          <Badge variant="outline" className="gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald" />
            </span>
            Jonli ma&apos;lumotlar
          </Badge>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5">
        {/* Hero */}
        <section className="pt-12 pb-8">
          <h1
            className="text-[1.75rem] md:text-[2.25rem] font-extrabold tracking-tight text-navy leading-tight"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            O&apos;zbekiston maktablarining{' '}
            <span className="text-teal">haqiqiy holati</span>
          </h1>
          <p className="mt-2 text-[0.95rem] text-muted-foreground max-w-xl">
            Fuqarolar tomonidan tekshirilgan ma&apos;lumotlar. Shaffof. Ochiq. Haqiqiy.
          </p>
        </section>

        {/* Stats Grid - Horizontal Scroll on Mobile */}
        <section className="pb-10 -mx-5 px-5 overflow-x-auto no-scrollbar snap-x">
          <div className="flex sm:grid sm:grid-cols-4 gap-4 w-max sm:w-full pb-4 sm:pb-0">
            {([
              { label: 'Tekshiruvlar', value: total, suffix: '' },
              { label: 'Bajarildi', value: pct, suffix: '%' },
              { label: 'Muammolar', value: issues, suffix: '' },
              { label: 'Inspektorlar', value: inspectorCount || 0, suffix: '' },
            ]).map((stat) => (
              <Card key={stat.label} className="border-border/50 w-[160px] sm:w-auto snap-center shrink-0">
                <CardContent className="pt-5 pb-4">
                  <StatCard label={stat.label} value={stat.value} suffix={stat.suffix} size="hero" />
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Map + Charts Grid */}
        <section className="pb-10">
          <div className="flex flex-col lg:grid lg:grid-cols-5 gap-6">
            {/* Map - takes 3 cols, smaller height on mobile */}
            <div className="lg:col-span-3 order-1">
              <p
                className="text-[0.7rem] uppercase tracking-[0.15em] text-muted-foreground font-medium mb-3"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                Maktablar xaritasi
              </p>
              <div className="h-[350px] lg:h-auto">
                <DashboardMap schools={dashboardSchools} />
              </div>
            </div>

            {/* School Ranking - takes 2 cols */}
            <div className="lg:col-span-2 order-2">
              <p
                className="text-[0.7rem] uppercase tracking-[0.15em] text-muted-foreground font-medium mb-3"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                Maktablar reytingi
              </p>
              <Card className="border-border/50">
                <CardContent className="p-0">
                  <div className="divide-y divide-border/50 max-h-[350px] lg:max-h-[400px] overflow-y-auto">
                    {schoolRanking.length === 0 ? (
                      <p className="text-muted-foreground py-12 text-center text-[0.9rem]">
                        Ma&apos;lumot yo&apos;q
                      </p>
                    ) : (
                      schoolRanking.map((school, idx) => (
                        <Link
                          key={school.id}
                          href={`/citizen/school/${school.id}`}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors group"
                        >
                          <span className="text-[0.75rem] text-muted-foreground w-5 text-right tabular-nums">
                            {idx + 1}
                          </span>
                          <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${healthDotColor(school.health)}`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-[0.82rem] font-medium truncate">{school.name}</p>
                            {school.district && (
                              <p className="text-[0.7rem] text-muted-foreground truncate">{school.district}</p>
                            )}
                          </div>
                          <div className="text-right shrink-0">
                            {school.inspectionCount > 0 ? (
                              <span className="text-[0.75rem] font-medium tabular-nums">
                                {school.fulfillmentPct}%
                              </span>
                            ) : (
                              <span className="text-[0.7rem] text-muted-foreground">—</span>
                            )}
                          </div>
                          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/30 group-hover:text-foreground transition-colors shrink-0" />
                        </Link>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Charts */}
        {(statusData.length > 0 || categoryData.length > 0) && (
          <section className="pb-10">
            <p
              className="text-[0.7rem] uppercase tracking-[0.15em] text-muted-foreground font-medium mb-4"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Tahlil
            </p>
            <DashboardCharts statusData={statusData} categoryData={categoryData} />
          </section>
        )}

        {/* Recent Feed */}
        <section className="pb-12">
          <p
            className="text-[0.7rem] uppercase tracking-[0.15em] text-muted-foreground font-medium mb-4"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Oxirgi tekshiruvlar
          </p>
          <RecentFeed inspections={recentInspections} />
        </section>
      </main>

      <footer className="border-t border-border/40">
        <div className="mx-auto max-w-6xl px-5 py-6 flex items-center justify-between">
          <p className="text-[0.7rem] text-muted-foreground">Real Holat &copy; 2026 &middot; Shaffoflik platformasi</p>
          <Link href="/auth/login" className="text-[0.75rem] text-teal font-medium hover:underline">
            Tizimga kirish &rarr;
          </Link>
        </div>
      </footer>
    </div>
  )
}
