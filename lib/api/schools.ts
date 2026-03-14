import { createServiceClient } from '@/lib/supabase/server'

export interface School {
  id: number
  api_uid: number | null
  name: string
  name_ru: string | null
  district: string | null
  region: string | null
  lat: number | null
  lng: number | null
  student_count: number | null
  built_year: string | null
  last_renovation: string | null
  image_url: string | null
  sport_hall: string | null
  cafeteria: string | null
  internet: string | null
  water_supply: string | null
}

interface GeoasrSchool {
  _uid_: number
  obekt_nomi: string
  obekt_nomi_ru?: string
  tuman?: string
  viloyat?: string
  umumiy_uquvchi?: string | number
  qurilish_yili?: string
  kapital_tamir?: string
  sport_zal_holati?: string
  oshhona_holati?: string
  internetga_ulanish_turi?: string
  ichimlik_suvi_manbaa?: string
}

function mapGeoasrToSchool(raw: GeoasrSchool) {
  const studentCount =
    raw.umumiy_uquvchi != null
      ? parseInt(String(raw.umumiy_uquvchi), 10)
      : null

  return {
    api_uid: raw._uid_,
    name: raw.obekt_nomi,
    name_ru: raw.obekt_nomi_ru ?? null,
    district: raw.tuman ?? null,
    region: raw.viloyat ?? null,
    student_count: studentCount != null && !isNaN(studentCount) ? studentCount : null,
    built_year: raw.qurilish_yili ?? null,
    last_renovation: raw.kapital_tamir ?? null,
    sport_hall: raw.sport_zal_holati ?? null,
    cafeteria: raw.oshhona_holati ?? null,
    internet: raw.internetga_ulanish_turi ?? null,
    water_supply: raw.ichimlik_suvi_manbaa ?? null,
    synced_at: new Date().toISOString(),
  }
}

/**
 * Fetches all schools from the GEOASR API and upserts them into schools_cache.
 * Uses the service role client to bypass RLS.
 * Returns the count of synced schools.
 */
export async function syncSchoolsFromAPI(): Promise<number> {
  const token = process.env.GEOASR_TOKEN
  if (!token) {
    throw new Error('GEOASR_TOKEN environment variable is not set')
  }

  const res = await fetch('https://duasr.uz/api4/maktab44', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    // Skip Next.js cache so we always get fresh data from the gov API
    cache: 'no-store',
  })

  if (!res.ok) {
    throw new Error(
      `GEOASR API responded with ${res.status}: ${await res.text().catch(() => 'no body')}`
    )
  }

  const data: GeoasrSchool[] = await res.json()

  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('GEOASR API returned empty or invalid data')
  }

  const rows = data.map(mapGeoasrToSchool)

  const supabase = createServiceClient()

  // Upsert in chunks of 500 to avoid payload size issues
  const CHUNK_SIZE = 500
  for (let i = 0; i < rows.length; i += CHUNK_SIZE) {
    const chunk = rows.slice(i, i + CHUNK_SIZE)
    const { error } = await supabase
      .from('schools_cache')
      .upsert(chunk, { onConflict: 'api_uid' })

    if (error) {
      throw new Error(`Supabase upsert failed (chunk ${i / CHUNK_SIZE}): ${error.message}`)
    }
  }

  return rows.length
}

/**
 * Reads schools from the schools_cache table with optional filters.
 */
export async function getSchools(filters?: {
  region?: string
  district?: string
}): Promise<School[]> {
  const supabase = createServiceClient()

  let query = supabase.from('schools_cache').select('*')

  if (filters?.region) {
    query = query.ilike('region', `%${filters.region}%`)
  }
  if (filters?.district) {
    query = query.ilike('district', `%${filters.district}%`)
  }

  query = query.order('name', { ascending: true })

  const { data, error } = await query

  if (error) {
    throw new Error(`Failed to fetch schools from cache: ${error.message}`)
  }

  return (data ?? []) as School[]
}

/**
 * Gets a single school by its database ID.
 */
export async function getSchool(id: number): Promise<School | null> {
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('schools_cache')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return null
    }
    throw new Error(`Failed to fetch school ${id}: ${error.message}`)
  }

  return data as School
}
