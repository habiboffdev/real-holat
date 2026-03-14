import Link from 'next/link'
import Image from 'next/image'
import { createSupabaseServer } from '@/lib/supabase/server'
import { StatCard } from '@/components/dashboard/stat-card'
import { DashboardCharts } from '@/components/dashboard/dashboard-charts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  ClipboardCheck,
  CheckCircle,
  AlertTriangle,
  MessageSquare,
  ArrowRight,
  Camera,
  User,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

function relativeTime(dateStr: string): string {
  const diffMin = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000)
  if (diffMin < 1) return 'hozirgina'
  if (diffMin < 60) return `${diffMin} daq. oldin`
  const h = Math.floor(diffMin / 60)
  if (h < 24) return `${h} soat oldin`
  const d = Math.floor(h / 24)
  if (d < 7) return `${d} kun oldin`
  return `${Math.floor(d / 7)} hafta oldin`
}

const RESP_LABEL: Record<string, string> = { acknowledged: 'Qabul qilindi', in_progress: 'Jarayonda', resolved: 'Hal qilindi' }
const RESP_STYLE: Record<string, string> = { acknowledged: 'bg-amber/10 text-amber', in_progress: 'bg-teal/10 text-teal', resolved: 'bg-emerald/10 text-emerald' }

export default async function GovernmentDashboardPage() {
  const supabase = await createSupabaseServer()

  const { data: allInspections } = await supabase.from('inspections').select('id, is_fulfilled')
  const total = allInspections?.length || 0
  const fulfilled = allInspections?.filter(i => i.is_fulfilled).length || 0
  const pct = total ? Math.round((fulfilled / total) * 100) : 0
  const unfulfilled = total - fulfilled

  const { count: totalResponses } = await supabase.from('gov_responses').select('*', { count: 'exact', head: true })

  // Open issues = unfulfilled without response
  const unfulfilledIds = (allInspections || []).filter(i => !i.is_fulfilled).map(i => i.id)
  let openIssues = unfulfilledIds.length
  if (unfulfilledIds.length > 0) {
    const { data: responded } = await supabase.from('gov_responses').select('inspection_id').in('inspection_id', unfulfilledIds)
    const respondedSet = new Set((responded || []).map(r => r.inspection_id))
    openIssues = unfulfilledIds.filter(id => !respondedSet.has(id)).length
  }

  // Charts
  const { data: promises } = await supabase.from('promises').select('status, category')
  const statusCounts: Record<string, number> = {}
  const categoryCounts: Record<string, number> = {}
  promises?.forEach(p => {
    statusCounts[p.status] = (statusCounts[p.status] || 0) + 1
    if (p.category) categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1
  })
  const STATUS_COLORS: Record<string, string> = { pending: '#f59e0b', fulfilled: '#10b981', problematic: '#f43f5e', in_progress: '#06b6d4' }
  const statusData = Object.entries(statusCounts).map(([name, value]) => ({ name, value, color: STATUS_COLORS[name] || '#94a3b8' }))
  const categoryData = Object.entries(categoryCounts).map(([name, count]) => ({ name, count }))

  // Recent inspections
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
    .limit(15)

  const items = ((recentRaw as unknown as Row[]) || []).map(r => ({
    id: r.id,
    photo_url: r.photo_url,
    is_fulfilled: r.is_fulfilled,
    comment: r.comment,
    created_at: r.created_at,
    promise: r.promises?.title || '—',
    school: r.schools_cache?.name || '—',
    inspector: r.profiles?.full_name || 'Anonim',
    response: r.gov_responses?.[r.gov_responses.length - 1]?.status || null,
  }))

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-[1.75rem] font-bold tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
          Boshqaruv paneli
        </h1>
        <p className="text-muted-foreground text-[0.9rem] mt-1">
          Fuqarolar tekshiruvlari va hisobotlar
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <StatCard label="Jami tekshiruvlar" value={total} icon={<ClipboardCheck />} color="#06b6d4" />
        <StatCard label="Bajarildi" value={pct} icon={<CheckCircle />} color="#10b981" suffix="%" />
        <StatCard label="Ochiq muammolar" value={openIssues} icon={<AlertTriangle />} color="#f43f5e" />
        <StatCard label="Javob berildi" value={totalResponses || 0} icon={<MessageSquare />} color="#f59e0b" />
      </div>

      {/* Main content */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Reports */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle style={{ fontFamily: 'var(--font-heading)' }}>
                Oxirgi hisobotlar
              </CardTitle>
              <CardDescription>
                {items.length} ta tekshiruv
              </CardDescription>
            </CardHeader>
            <CardContent>
              {items.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  Hozircha tekshiruvlar yo&apos;q
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {items.map(item => (
                    <div key={item.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                      {/* Photo */}
                      {item.photo_url ? (
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                          <Image src={item.photo_url} alt="" fill className="object-cover" sizes="48px" />
                        </div>
                      ) : (
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-muted">
                          <Camera className="h-5 w-5 text-muted-foreground/50" />
                        </div>
                      )}

                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[0.85rem] font-medium">{item.school}</p>
                        <p className="truncate text-[0.75rem] text-muted-foreground">
                          {item.promise} &middot; {item.inspector}
                        </p>
                      </div>

                      {/* Status + action */}
                      <div className="flex shrink-0 flex-col items-end gap-1.5">
                        <Badge className={`border-0 rounded-md text-[0.68rem] ${item.is_fulfilled ? 'bg-emerald/10 text-emerald' : 'bg-coral/10 text-coral'}`}>
                          {item.is_fulfilled ? 'Bajarildi' : 'Muammo'}
                        </Badge>

                        {item.response ? (
                          <Badge className={`border-0 rounded-md text-[0.65rem] ${RESP_STYLE[item.response] || 'bg-muted text-muted-foreground'}`}>
                            {RESP_LABEL[item.response] || item.response}
                          </Badge>
                        ) : !item.is_fulfilled ? (
                          <Link href={`/government/reports/${item.id}`}>
                            <Button variant="ghost" size="xs" className="h-6 text-[0.7rem] text-teal gap-0.5">
                              Javob berish <ArrowRight className="h-3 w-3" />
                            </Button>
                          </Link>
                        ) : (
                          <span className="text-[0.68rem] text-muted-foreground">{relativeTime(item.created_at)}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="lg:col-span-2">
          <DashboardCharts statusData={statusData} categoryData={categoryData} />
        </div>
      </div>
    </div>
  )
}
