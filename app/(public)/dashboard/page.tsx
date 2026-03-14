import Image from 'next/image'
import { createSupabaseServer } from '@/lib/supabase/server'
import { StatCard } from '@/components/dashboard/stat-card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, XCircle, Camera } from 'lucide-react'

export const dynamic = 'force-dynamic'

function relativeTime(dateStr: string): string {
  const min = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000)
  if (min < 1) return 'hozirgina'
  if (min < 60) return `${min} daq.`
  const h = Math.floor(min / 60)
  if (h < 24) return `${h} soat`
  const d = Math.floor(h / 24)
  return `${d} kun`
}

export default async function PublicDashboard() {
  const supabase = await createSupabaseServer()

  const { data: allInspections } = await supabase.from('inspections').select('id, is_fulfilled, school_id')
  const total = allInspections?.length || 0
  const fulfilled = allInspections?.filter(i => i.is_fulfilled).length || 0
  const pct = total ? Math.round((fulfilled / total) * 100) : 0
  const issues = total - fulfilled
  const schoolIds = new Set(allInspections?.map(i => i.school_id) || [])

  const { count: inspectorCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'citizen')

  type Row = {
    id: string; photo_url: string | null; is_fulfilled: boolean; comment: string | null; created_at: string
    promises: { title: string } | null; schools_cache: { name: string } | null; profiles: { full_name: string } | null
  }
  const { data: recentRaw } = await supabase
    .from('inspections')
    .select('id, photo_url, is_fulfilled, comment, created_at, promises(title), schools_cache(name), profiles(full_name)')
    .order('created_at', { ascending: false })
    .limit(8)

  const recent = ((recentRaw as unknown as Row[]) || []).map(r => ({
    id: r.id, photo: r.photo_url, fulfilled: r.is_fulfilled, comment: r.comment, time: r.created_at,
    promise: r.promises?.title || '—', school: r.schools_cache?.name || '—', person: r.profiles?.full_name || 'Anonim',
  }))

  return (
    <div className="min-h-dvh bg-background">
      {/* Clean header — just logo + label */}
      <header className="border-b border-border/50">
        <div className="mx-auto max-w-4xl px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-md bg-navy flex items-center justify-center">
              <span className="text-[0.65rem] font-bold text-white" style={{ fontFamily: 'var(--font-heading)' }}>R</span>
            </div>
            <span className="text-[0.9rem] font-semibold" style={{ fontFamily: 'var(--font-heading)' }}>Real Holat</span>
          </div>
          <Badge variant="outline">Ochiq ma&apos;lumotlar</Badge>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-5">
        {/* Hero numbers — the data IS the design */}
        <section className="pt-14 pb-10 border-b border-border/40">
          <p
            className="text-[0.7rem] uppercase tracking-[0.15em] text-muted-foreground font-medium mb-8"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Umumiy ko&apos;rsatkichlar
          </p>
          <div className="grid grid-cols-2 gap-y-10 gap-x-8 sm:grid-cols-4">
            <StatCard label="Tekshiruvlar" value={total} size="hero" />
            <StatCard label="Bajarildi" value={pct} suffix="%" size="hero" />
            <StatCard label="Muammolar" value={issues} size="hero" />
            <StatCard label="Inspektorlar" value={inspectorCount || 0} size="hero" />
          </div>
        </section>

        {/* Secondary line */}
        <section className="py-6 border-b border-border/40 flex items-center gap-8 text-[0.82rem] text-muted-foreground">
          <span><strong className="text-foreground">{schoolIds.size}</strong> maktab tekshirildi</span>
          <span className="text-border">|</span>
          <span><strong className="text-foreground">{pct}%</strong> mamnuniyat</span>
        </section>

        {/* Recent — clean list, no cards */}
        <section className="py-8">
          <p
            className="text-[0.7rem] uppercase tracking-[0.15em] text-muted-foreground font-medium mb-5"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Oxirgi tekshiruvlar
          </p>

          {recent.length === 0 ? (
            <p className="text-muted-foreground py-16 text-center text-[0.9rem]">Hozircha tekshiruvlar yo&apos;q</p>
          ) : (
            <div className="divide-y divide-border/50">
              {recent.map(item => (
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
                    <p className="text-[0.82rem] font-medium truncate">{item.school}</p>
                    <p className="text-[0.72rem] text-muted-foreground truncate">{item.promise} &middot; {item.person}</p>
                  </div>
                  <div className="flex items-center gap-2.5 shrink-0">
                    {item.fulfilled ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald" />
                    ) : (
                      <XCircle className="h-4 w-4 text-coral" />
                    )}
                    <span className="text-[0.7rem] text-muted-foreground tabular-nums w-12 text-right">{relativeTime(item.time)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="border-t border-border/40">
        <div className="mx-auto max-w-4xl px-5 py-6">
          <p className="text-[0.7rem] text-muted-foreground">Real Holat &copy; 2026 &middot; Shaffoflik platformasi</p>
        </div>
      </footer>
    </div>
  )
}
