import { createSupabaseServer } from '@/lib/supabase/server'
import { SchoolDetail } from '@/components/citizen/school-detail'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, QrCode } from 'lucide-react'

export default async function SchoolPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createSupabaseServer()

  const { data: school } = await supabase
    .from('schools_cache')
    .select('*')
    .eq('id', parseInt(id))
    .single()

  if (!school) notFound()

  const { data: promises } = await supabase
    .from('promises')
    .select('*')
    .eq('school_id', school.id)
    .order('created_at')

  const { data: { user } } = await supabase.auth.getUser()
  let inspections: any[] = []
  if (user) {
    const { data } = await supabase
      .from('inspections')
      .select('promise_id, created_at')
      .eq('user_id', user.id)
      .eq('school_id', school.id)
    inspections = data || []
  }

  return (
    <div className="px-4 pt-4">
      <div className="flex items-center justify-between mb-4">
        <Link href="/citizen/map" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-5 w-5" />
          <span className="text-[0.9rem]">Orqaga</span>
        </Link>
        <Link href={`/school/${school.id}/qr`} className="inline-flex items-center gap-1.5 text-[0.85rem] text-muted-foreground hover:text-teal transition-colors">
          <QrCode className="h-4 w-4" />
          <span>QR</span>
        </Link>
      </div>
      <SchoolDetail
        school={school}
        promises={promises || []}
        inspections={inspections}
        showInspectButtons={!!user}
      />
    </div>
  )
}
