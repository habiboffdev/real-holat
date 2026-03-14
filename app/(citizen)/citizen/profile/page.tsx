import { redirect } from 'next/navigation'
import { createSupabaseServer } from '@/lib/supabase/server'
import { getLevel, getProgress } from '@/lib/utils/gamification'
import { UZ } from '@/lib/constants/uzbek'
import { SignOutButton } from './sign-out-button'

function getRelativeTime(dateString: string): string {
  const now = new Date()
  const date = new Date(dateString)
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Bugun'
  if (diffDays === 1) return 'Kecha'
  if (diffDays < 7) return `${diffDays} kun oldin`
  const diffWeeks = Math.floor(diffDays / 7)
  if (diffWeeks === 1) return '1 hafta oldin'
  if (diffWeeks < 4) return `${diffWeeks} hafta oldin`
  const diffMonths = Math.floor(diffDays / 30)
  if (diffMonths === 1) return '1 oy oldin'
  return `${diffMonths} oy oldin`
}

export default async function ProfilePage() {
  const supabase = await createSupabaseServer()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/auth/signup')

  const { data: inspections } = await supabase
    .from('inspections')
    .select(
      'id, is_fulfilled, comment, created_at, promises(title, category), schools_cache(name)'
    )
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const inspectionCount = profile.inspection_count || 0
  const level = getLevel(inspectionCount)
  const progress = getProgress(inspectionCount)

  const fullName = profile.full_name || 'Foydalanuvchi'
  const firstLetter = fullName.charAt(0).toUpperCase()

  return (
    <div className="px-4 pt-6 space-y-6">
      {/* Top section: avatar + name + level */}
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-navy to-navy-light flex items-center justify-center text-white text-2xl font-bold shrink-0"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          {firstLetter}
        </div>

        <div className="flex-1 min-w-0">
          {/* Name + role */}
          <div className="flex items-center gap-2 flex-wrap">
            <h1
              className="text-[1.2rem] font-bold text-foreground truncate"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              {fullName}
            </h1>
            <span className="bg-navy/5 text-navy rounded-full px-2 py-0.5 text-[0.75rem] font-medium whitespace-nowrap">
              Fuqaro
            </span>
          </div>

          {/* Level badge */}
          <span className="inline-block bg-teal/10 text-teal rounded-full px-3 py-1 text-[0.85rem] font-medium mt-1">
            {level.badge} {level.name}
          </span>
        </div>
      </div>

      {/* Level progress section */}
      <div className="space-y-2">
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-teal transition-all duration-500"
            style={{ width: `${progress.percentage}%` }}
          />
        </div>
        <p className="text-muted-foreground text-[0.8rem]">
          {progress.current} / {progress.needed} {UZ.profile_inspections}
        </p>
      </div>

      {/* Divider */}
      <hr className="border-border/50" />

      {/* Inspection history */}
      <div className="space-y-3">
        <h2
          className="text-[1.1rem] font-semibold text-foreground"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          {UZ.profile_my_reports}
        </h2>

        {!inspections || inspections.length === 0 ? (
          <p className="text-center text-muted-foreground text-[0.9rem] py-8">
            {UZ.profile_no_inspections}
          </p>
        ) : (
          <div className="space-y-2">
            {inspections.map((inspection) => {
              const promise = inspection.promises as unknown as {
                title: string
                category: string
              } | null
              const school = inspection.schools_cache as unknown as {
                name: string
              } | null

              return (
                <div
                  key={inspection.id}
                  className="glass-card rounded-2xl p-4 flex items-center gap-3"
                >
                  {/* Verdict indicator */}
                  <div
                    className={`w-3 h-3 rounded-full shrink-0 ${
                      inspection.is_fulfilled ? 'bg-emerald' : 'bg-coral'
                    }`}
                  />

                  {/* Promise + school info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[0.9rem] font-medium text-foreground truncate">
                      {promise?.title || 'Nomalum'}
                    </p>
                    {school?.name && (
                      <p className="text-muted-foreground text-[0.8rem] truncate">
                        {school.name}
                      </p>
                    )}
                  </div>

                  {/* Relative date */}
                  <span className="text-muted-foreground text-[0.75rem] whitespace-nowrap shrink-0">
                    {getRelativeTime(inspection.created_at)}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Sign out button */}
      <SignOutButton />
    </div>
  )
}
