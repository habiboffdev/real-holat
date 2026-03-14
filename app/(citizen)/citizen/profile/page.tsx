import { redirect } from 'next/navigation'
import { createSupabaseServer } from '@/lib/supabase/server'
import { getLevel, getProgress } from '@/lib/utils/gamification'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
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
    <div className="px-5 pt-8 space-y-7">
      {/* Top section: avatar + name + level */}
      <div className="flex items-center gap-4.5">
        {/* Avatar with teal ring */}
        <div className="relative shrink-0">
          <div className="w-18 h-18 rounded-full bg-gradient-to-br from-navy to-navy-light flex items-center justify-center text-white text-2xl font-extrabold ring-[3px] ring-teal/30 ring-offset-2 ring-offset-background"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            {firstLetter}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          {/* Name + role */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1
              className="text-[1.25rem] font-extrabold text-foreground truncate tracking-tight"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              {fullName}
            </h1>
            <Badge variant="secondary" className="rounded-full px-2.5 py-0.5 text-[0.7rem] font-bold tracking-wide uppercase bg-navy/6 text-navy">
              Fuqaro
            </Badge>
          </div>

          {/* Level badge - premium style */}
          <Card className="mt-2 inline-flex items-center gap-2 glass-card rounded-xl px-3.5 py-2">
            <span className="text-base leading-none">{level.badge}</span>
            <span
              className="text-navy text-[0.78rem] font-bold tracking-tight"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              {level.name}
            </span>
          </Card>
        </div>
      </div>

      {/* Level progress section - no shimmer overlay */}
      <div className="space-y-2.5">
        <div className="h-2.5 rounded-full bg-navy/5 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-teal to-teal-light transition-all duration-700 ease-out"
            style={{ width: `${progress.percentage}%` }}
          />
        </div>
        <p className="text-muted-foreground text-[0.78rem] font-medium">
          {progress.current} / {progress.needed} {UZ.profile_inspections}
        </p>
      </div>

      {/* Divider */}
      <Separator />

      {/* Inspection history */}
      <div className="space-y-4">
        <div>
          <h2
            className="text-[1.1rem] font-bold text-foreground tracking-tight"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            {UZ.profile_my_reports}
          </h2>
          <div className="h-[3px] w-8 rounded-full bg-teal mt-2" />
        </div>

        {!inspections || inspections.length === 0 ? (
          <Card className="glass-card rounded-2xl py-12 px-6 text-center">
            <p className="text-muted-foreground text-[0.9rem]">
              {UZ.profile_no_inspections}
            </p>
          </Card>
        ) : (
          <div className="space-y-2.5">
            {inspections.map((inspection) => {
              const promise = inspection.promises as unknown as {
                title: string
                category: string
              } | null
              const school = inspection.schools_cache as unknown as {
                name: string
              } | null

              return (
                <Card
                  key={inspection.id}
                  className={`glass-card rounded-2xl border-l-4 ${
                    inspection.is_fulfilled ? 'border-l-emerald' : 'border-l-coral'
                  }`}
                >
                  <CardContent className="flex items-center gap-3.5">
                    {/* Verdict indicator */}
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        inspection.is_fulfilled
                          ? 'bg-emerald/10 text-emerald'
                          : 'bg-coral/10 text-coral'
                      }`}
                    >
                      {inspection.is_fulfilled ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      )}
                    </div>

                    {/* Promise + school info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[0.88rem] font-semibold text-foreground truncate">
                        {promise?.title || 'Nomalum'}
                      </p>
                      {school?.name && (
                        <p className="text-muted-foreground text-[0.78rem] truncate mt-0.5">
                          {school.name}
                        </p>
                      )}
                    </div>

                    {/* Relative date */}
                    <span className="text-muted-foreground/60 text-[0.72rem] font-medium whitespace-nowrap shrink-0">
                      {getRelativeTime(inspection.created_at)}
                    </span>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Sign out button */}
      <div className="pb-4">
        <SignOutButton />
      </div>
    </div>
  )
}
