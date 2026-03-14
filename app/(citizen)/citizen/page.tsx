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
    <div className="px-5 pt-8 pb-4">
      {/* Top greeting bar */}
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="min-w-0">
          <p className="text-muted-foreground text-[0.8rem] font-medium">
            {UZ.home_greeting}
          </p>
          <h1
            className="text-[1.5rem] font-extrabold text-foreground tracking-tight truncate"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            {firstName}!
          </h1>
        </div>

        {/* Level badge - premium style */}
        <div className="shrink-0 glass-card rounded-2xl px-4 py-2.5 flex flex-col items-center gap-0.5">
          <span className="text-lg leading-none">{level.badge}</span>
          <span
            className="text-navy text-[0.65rem] font-bold tracking-wide whitespace-nowrap"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            {level.name}
          </span>
        </div>
      </div>

      {/* Level progress bar */}
      <div className="mb-8">
        <div className="h-2 rounded-full bg-navy/5 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-teal to-teal-light transition-all duration-700 ease-out relative"
            style={{ width: `${progress.percentage}%` }}
          >
            {/* Subtle glow/shine on progress */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-full" />
          </div>
        </div>
        <p className="text-muted-foreground text-[0.72rem] mt-1.5 font-medium">
          {progress.current} / {progress.needed} {UZ.profile_inspections}
        </p>
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
        <div className="glass-card rounded-2xl p-8 text-center space-y-4 mt-4">
          <div className="w-16 h-16 rounded-2xl bg-navy/5 flex items-center justify-center mx-auto">
            <svg
              className="h-8 w-8 text-navy/30"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0 0 12 9.75c-2.551 0-5.056.2-7.5.582V21"
              />
            </svg>
          </div>
          <div>
            <p
              className="text-[1.1rem] font-bold text-foreground"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              {UZ.home_no_school}
            </p>
            <p className="text-muted-foreground text-[0.85rem] mt-1">
              Profilingizda maktabni tanlang
            </p>
          </div>
          <Link
            href="/citizen/profile"
            className="inline-flex h-14 items-center justify-center rounded-xl bg-navy text-white font-bold text-[0.95rem] px-8 shadow-[0_4px_14px_rgba(12,27,46,0.2)] hover:shadow-[0_6px_20px_rgba(12,27,46,0.3)] transition-all"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Maktabni tanlash
          </Link>
        </div>
      )}
    </div>
  )
}
