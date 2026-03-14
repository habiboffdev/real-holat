import { createSupabaseServer } from '@/lib/supabase/server'
import { getHealthScore } from '@/lib/utils/health-score'
import { SchoolBrowseClient } from '@/components/citizen/school-browse-client'

export default async function BrowsePage() {
  const supabase = await createSupabaseServer()

  // Get all schools
  const { data: schools } = await supabase
    .from('schools_cache')
    .select('id, name, district, lat, lng')
    .order('name')

  // Get all inspections for health score computation
  const { data: allInspections } = await supabase
    .from('inspections')
    .select('school_id, is_fulfilled')

  // Compute health per school
  const schoolsWithHealth = (schools || []).map((s) => {
    const schoolInspections = (allInspections || []).filter(
      (i) => i.school_id === s.id
    )
    return { ...s, health: getHealthScore(schoolInspections) }
  })

  return (
    <div className="px-4 pt-6">
      <h1
        style={{ fontFamily: 'var(--font-heading)' }}
        className="text-[1.35rem] font-bold mb-4"
      >
        Maktablar
      </h1>
      <SchoolBrowseClient schools={schoolsWithHealth} />
    </div>
  )
}
