import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseServer } from '@/lib/supabase/server'
import { SchoolDetail } from '@/components/citizen/school-detail'
import { getLevel, getProgress } from '@/lib/utils/gamification'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { UZ } from '@/lib/constants/uzbek'
import { Building2 } from 'lucide-react'

export default async function CitizenHomePage() {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/auth/signup')

  let school = null
  if (profile.school_id) {
    const { data } = await supabase
      .from('schools_cache')
      .select('*')
      .eq('id', profile.school_id)
      .single()
    school = data
  }

  let promises: Array<{ id: string; category: string; title: string; description: string | null; status: string }> = []
  if (school) {
    const { data } = await supabase.from('promises').select('*').eq('school_id', school.id).order('created_at', { ascending: true })
    promises = data || []
  }

  let inspections: Array<{ promise_id: string; created_at: string }> = []
  if (school) {
    const { data } = await supabase.from('inspections').select('promise_id, created_at').eq('user_id', user.id).eq('school_id', school.id)
    inspections = data || []
  }

  const level = getLevel(profile.inspection_count || 0)
  const progress = getProgress(profile.inspection_count || 0)
  const firstName = (profile.full_name || '').split(' ')[0] || 'Foydalanuvchi'
  const inspectedCount = inspections.length
  const totalCount = promises.length

  return (
    <div className="px-4 pt-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1
            className="text-[1.5rem] font-bold tracking-tight text-foreground"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            {UZ.home_greeting}, {firstName}
          </h1>
          <p className="mt-0.5 text-[0.85rem] text-muted-foreground">
            {level.badge} {level.name}
          </p>
        </div>

        {/* Progress indicator */}
        {totalCount > 0 && (
          <div className="text-right">
            <p className="text-[1.5rem] font-bold text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
              {inspectedCount}<span className="text-muted-foreground text-[1rem]">/{totalCount}</span>
            </p>
            <p className="text-[0.72rem] text-muted-foreground">{UZ.profile_inspections}</p>
          </div>
        )}
      </div>

      {/* Progress bar */}
      {totalCount > 0 && (
        <div className="mb-6">
          <div className="h-1.5 rounded-full bg-border overflow-hidden">
            <div
              className="h-full rounded-full bg-teal transition-all duration-700"
              style={{ width: `${totalCount > 0 ? (inspectedCount / totalCount) * 100 : 0}%` }}
            />
          </div>
        </div>
      )}

      {/* School detail */}
      {school ? (
        <SchoolDetail
          school={school}
          promises={promises}
          inspections={inspections}
          showInspectButtons
        />
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Building2 className="mx-auto h-10 w-10 text-muted-foreground/40" />
            <p
              className="mt-3 text-[1.05rem] font-semibold"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              {UZ.home_no_school}
            </p>
            <p className="mt-1 text-[0.85rem] text-muted-foreground">
              Profilingizda maktabni tanlang
            </p>
            <Link href="/citizen/profile">
              <Button className="mt-4" size="lg">Maktabni tanlash</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
