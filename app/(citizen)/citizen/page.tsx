import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseServer } from '@/lib/supabase/server'
import { SchoolDetail } from '@/components/citizen/school-detail'
import { getLevel, getProgress } from '@/lib/utils/gamification'
import { UZ } from '@/lib/constants/uzbek'

export default async function CitizenHomePage() {
  const supabase = await createSupabaseServer()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/auth/signup')

  // Fetch user's school
  let school = null
  if (profile.school_id) {
    const { data } = await supabase
      .from('schools_cache')
      .select('*')
      .eq('id', profile.school_id)
      .single()
    school = data
  }

  // Fetch promises for this school
  let promises: Array<{
    id: string
    category: string
    title: string
    description: string | null
    status: string
  }> = []
  if (school) {
    const { data } = await supabase
      .from('promises')
      .select('*')
      .eq('school_id', school.id)
      .order('created_at', { ascending: true })
    promises = data || []
  }

  // Fetch user's inspections for this school
  let inspections: Array<{ promise_id: string; created_at: string }> = []
  if (school) {
    const { data } = await supabase
      .from('inspections')
      .select('promise_id, created_at')
      .eq('user_id', user.id)
      .eq('school_id', school.id)
    inspections = data || []
  }

  const level = getLevel(profile.inspection_count || 0)
  const progress = getProgress(profile.inspection_count || 0)

  const firstName = (profile.full_name || '').split(' ')[0] || 'Foydalanuvchi'

  return (
    <div className="px-4 pt-6">
      {/* Top greeting bar */}
      <div className="flex items-center justify-between">
        <h1
          className="text-[1.35rem] font-bold text-foreground"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          {UZ.home_greeting}, {firstName}!
        </h1>
        <span className="bg-navy/5 text-navy rounded-full px-3 py-1 text-sm font-medium whitespace-nowrap">
          {level.badge} {level.name}
        </span>
      </div>

      {/* Level progress bar */}
      <div className="h-1.5 rounded-full bg-muted mt-2 mb-6 overflow-hidden">
        <div
          className="h-full rounded-full bg-teal transition-all duration-500"
          style={{ width: `${progress.percentage}%` }}
        />
      </div>

      {/* School detail or no-school state */}
      {school ? (
        <SchoolDetail
          school={school}
          promises={promises}
          inspections={inspections}
          showInspectButtons
        />
      ) : (
        <div className="glass-card rounded-2xl p-6 text-center space-y-3 mt-4">
          <p
            className="text-[1.1rem] font-semibold text-foreground"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            {UZ.home_no_school}
          </p>
          <p className="text-muted-foreground text-[0.9rem]">
            Profilingizda maktabni tanlang
          </p>
          <Link
            href="/citizen/profile"
            className="inline-flex h-12 items-center justify-center rounded-xl bg-teal text-white font-semibold text-[0.95rem] px-6 hover:bg-teal/90 transition-colors"
          >
            Maktabni tanlash
          </Link>
        </div>
      )}
    </div>
  )
}
