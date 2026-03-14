import { createSupabaseServer } from '@/lib/supabase/server'
import { StatCard } from '@/components/dashboard/stat-card'
import { DashboardCharts } from '@/components/dashboard/dashboard-charts'
import { RecentFeed } from '@/components/dashboard/recent-feed'
import { School, CheckCircle, AlertTriangle, Users } from 'lucide-react'

export const metadata = {
  title: 'Dashboard — Real Holat',
  description: "O'zbekiston maktablarining haqiqiy holati — shaffoflik paneli",
}

// force dynamic so data is always fresh
export const dynamic = 'force-dynamic'

export default async function PublicDashboardPage() {
  const supabase = await createSupabaseServer()

  // --- Stats ---
  const { count: totalInspections } = await supabase
    .from('inspections')
    .select('*', { count: 'exact', head: true })

  const { data: allInspections } = await supabase
    .from('inspections')
    .select('is_fulfilled, school_id')

  const uniqueSchools = new Set(allInspections?.map((i) => i.school_id)).size

  const fulfilled = allInspections?.filter((i) => i.is_fulfilled).length || 0
  const fulfillmentPct = allInspections?.length
    ? Math.round((fulfilled / allInspections.length) * 100)
    : 0
  const totalIssues = (allInspections?.length || 0) - fulfilled

  const { count: totalInspectors } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'citizen')

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

  // --- Recent feed ---
  const { data: recentRaw } = await supabase
    .from('inspections')
    .select(
      'id, photo_url, is_fulfilled, comment, created_at, promises(title), schools_cache(name), profiles(full_name)'
    )
    .order('created_at', { ascending: false })
    .limit(10)

  const recentInspections = (recentRaw || []).map((r) => ({
    id: r.id,
    photo_url: r.photo_url,
    is_fulfilled: r.is_fulfilled,
    comment: r.comment,
    created_at: r.created_at,
    promise_title:
      (r.promises as unknown as { title: string })?.title || 'Noma\'lum',
    school_name:
      (r.schools_cache as unknown as { name: string })?.name || 'Noma\'lum',
    inspector_name:
      (r.profiles as unknown as { full_name: string })?.full_name || 'Anonim',
  }))

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="bg-navy text-white">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
          <h1
            className="text-2xl font-bold sm:text-4xl"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            O&apos;zbekiston maktablarining haqiqiy holati
          </h1>
          <p className="mt-2 text-white/60 text-sm sm:text-base">
            Fuqarolar monitoring platformasi
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-4 -mt-6 pb-16 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            label="Maktablar tekshirildi"
            value={uniqueSchools}
            icon={<School />}
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
            label="Muammolar"
            value={totalIssues}
            icon={<AlertTriangle />}
            color="#f43f5e"
          />
          <StatCard
            label="Inspektorlar"
            value={totalInspectors || 0}
            icon={<Users />}
            color="#f59e0b"
          />
        </div>

        {/* Charts */}
        <DashboardCharts statusData={statusData} categoryData={categoryData} />

        {/* Recent Feed */}
        <section>
          <h2
            className="mb-4 text-xl font-bold"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Oxirgi tekshiruvlar
          </h2>
          <RecentFeed inspections={recentInspections} />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-6">
        <p className="text-center text-xs text-muted-foreground">
          Real Holat — Shaffoflik platformasi
        </p>
      </footer>
    </div>
  )
}
