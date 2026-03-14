import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseServer } from '@/lib/supabase/server'
import { getLevel, getProgress } from '@/lib/utils/gamification'
import { UZ } from '@/lib/constants/uzbek'
import { CitizenHomeClient } from '@/components/citizen/citizen-home-client'
import { getHealthScore } from '@/lib/utils/health-score'

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

  // Gamification overlay header
  const level = getLevel(profile.inspection_count || 0)
  const firstName = (profile.full_name || '').split(' ')[0] || 'Foydalanuvchi'

  // Fetch all schools for the map
  const { data: schoolsRaw } = await supabase
    .from('schools_cache')
    .select('id, name, district, lat, lng')
    .order('name')

  // Fetch all promises & inspections to pass to client
  const { data: allPromises } = await supabase
    .from('promises')
    .select('id, category, title, description, status, school_id')
    .order('created_at', { ascending: true })

  const { data: allInspections } = await supabase
    .from('inspections')
    .select('promise_id, created_at, school_id, user_id, is_fulfilled')

  // Build dicts for client
  const promisesBySchool: Record<number, any[]> = {}
  for (const p of allPromises || []) {
    if (!promisesBySchool[p.school_id]) promisesBySchool[p.school_id] = []
    promisesBySchool[p.school_id].push(p)
  }

  const inspectionsBySchool: Record<number, any[]> = {}
  for (const i of allInspections || []) {
    // For health score (needs all user's inspections)
    if (!inspectionsBySchool[i.school_id]) inspectionsBySchool[i.school_id] = []
    inspectionsBySchool[i.school_id].push(i)
  }

  // Calculate health per school
  const schools = (schoolsRaw || []).map(s => {
    const sInspections = inspectionsBySchool[s.id] || []
    return {
      ...s,
      health: getHealthScore(sInspections)
    }
  })

  // Filter inspections to ONLY show the current user's inspections in the detail view
  const userInspectionsBySchool: Record<number, any[]> = {}
  for (const i of allInspections || []) {
    if (i.user_id === user.id) {
      if (!userInspectionsBySchool[i.school_id]) userInspectionsBySchool[i.school_id] = []
      userInspectionsBySchool[i.school_id].push(i)
    }
  }

  return (
    <div className="relative h-[100dvh] w-full pb-[env(safe-area-inset-bottom)]">
      {/* Gamification Floating Header (Removed from standard layout, sits over the map) */}
      <div className="absolute top-[var(--safe-area-top,max(env(safe-area-inset-top),16px))] left-4 right-16 z-[100] pointer-events-none flex justify-between items-start gap-4">
        
        {/* Left Stats/Level */}
        <div className="bg-white/90 backdrop-blur-xl shadow-[0_4px_20px_rgba(12,27,46,0.1)] border border-border/50 rounded-2xl px-4 py-2.5 inline-flex flex-col mb-3 pointer-events-auto shrink-0">
          <h1
            className="text-[0.95rem] font-bold tracking-tight text-navy"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            {UZ.home_greeting}, {firstName}
          </h1>
          <p className="mt-0.5 text-[0.75rem] font-medium text-teal flex items-center gap-1.5">
             {level.badge}
             <span className="text-muted-foreground">{level.name}</span>
          </p>
        </div>

        {/* Right Inbox Button */}
        <Link 
          href="/citizen/inbox"
          className="bg-white/90 backdrop-blur-xl shadow-[0_4px_20px_rgba(12,27,46,0.1)] border border-border/50 rounded-2xl h-[52px] w-[52px] flex items-center justify-center pointer-events-auto shrink-0 active:scale-95 transition-transform"
        >
          <div className="relative">
            {/* Hardcoding an import-free bell using an SVG path to avoid import issues on a server component if BellRing isn't imported */}
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-navy">
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
            </svg>
            {(profile.inspection_count || 0) > 0 && (
              <span className="absolute -top-1 -right-0.5 h-2.5 w-2.5 rounded-full bg-coral border-2 border-white" />
            )}
          </div>
        </Link>
      </div>

      <CitizenHomeClient 
        schools={schools}
        promisesBySchool={promisesBySchool}
        inspectionsBySchool={userInspectionsBySchool}
      />
    </div>
  )
}
