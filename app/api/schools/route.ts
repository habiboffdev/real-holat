import { NextRequest, NextResponse } from 'next/server'
import { syncSchoolsFromAPI, getSchools, getSchool } from '@/lib/api/schools'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl

  const sync = searchParams.get('sync') === 'true'
  const region = searchParams.get('region') ?? undefined
  const district = searchParams.get('district') ?? undefined
  const idParam = searchParams.get('id')

  // Single school lookup
  if (idParam) {
    const id = parseInt(idParam, 10)
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid id parameter' },
        { status: 400 }
      )
    }

    try {
      const school = await getSchool(id)
      if (!school) {
        return NextResponse.json(
          { error: 'School not found' },
          { status: 404 }
        )
      }
      return NextResponse.json({ school })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      return NextResponse.json({ error: message }, { status: 500 })
    }
  }

  let synced = false
  const headers = new Headers()

  // Sync from GEOASR if requested
  if (sync) {
    try {
      const count = await syncSchoolsFromAPI()
      synced = true
      console.log(`[schools/sync] Synced ${count} schools from GEOASR`)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      console.error(`[schools/sync] GEOASR sync failed: ${message}`)
      // Return stale cached data with warning header
      headers.set('X-Cache-Warning', 'stale')
    }
  }

  try {
    const schools = await getSchools({ region, district })

    return new NextResponse(
      JSON.stringify({ schools, count: schools.length, synced }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...Object.fromEntries(headers.entries()),
        },
      }
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
