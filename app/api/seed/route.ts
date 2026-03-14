import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { syncSchoolsFromAPI } from '@/lib/api/schools'

const promiseTemplates = [
  {
    category: 'toilet_repair',
    title: "Hojatxona ta'mirlandimi?",
    description: "Yangi sanitariya jihozlari o'rnatilishi kerak",
  },
  {
    category: 'soap_dispensers',
    title: 'Sovun idishlari bormi?',
    description: "Barcha hojatxonalarga sovun idishlari o'rnatilishi kerak",
  },
  {
    category: 'new_desks',
    title: "Yangi partalar qo'yildimi?",
    description: 'Eskilari almashtirilishi kerak',
  },
  {
    category: 'cafeteria',
    title: "Oshxona ta'mirlandimi?",
    description: 'Oshxona jihozlari yangilangan',
  },
  {
    category: 'sports_hall',
    title: 'Sport zali tuzatildimi?',
    description: "Sport zali ta'mirlanishi kerak",
  },
  {
    category: 'renovation',
    title: "Bino ta'mirlandimi?",
    description: "Umumiy ta'mirlash ishlari",
  },
]

const positiveComments = [
  "Zo'r ishlayapti!",
  'Hammasi joyida',
  "Ta'mir yaxshi bajarilgan",
  "Yangi jihozlar o'rnatilgan",
  'Toza va tartibli',
]

const negativeComments = [
  'Sovun idishi singan',
  "Hali ta'mirlanmagan",
  "Sifatsiz ish bajarilgan",
  "Jihozlar eskirgan",
  "Muammo hal etilmagan",
]

const govComments: Record<string, string[]> = {
  acknowledged: ["Ko'rib chiqildi", "Murojaat qabul qilindi", "Tekshiriladi"],
  in_progress: [
    "Ta'mir ishlari boshlandi",
    'Byudjet ajratildi',
    "Pudratchi tayinlandi",
  ],
  resolved: [
    'Muammo hal qilindi',
    "Ta'mir yakunlandi",
    "Yangi jihozlar o'rnatildi",
  ],
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export async function POST(request: NextRequest) {
  // Security: accept the service role key regardless of environment
  const seedKey = request.headers.get('x-seed-key')
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  const isValidKey = seedKey && serviceRoleKey && seedKey.trim() === serviceRoleKey.trim()
  const isDev = process.env.NODE_ENV === 'development'
  if (!isValidKey && !isDev) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()
  const summary: Record<string, unknown> = {}

  try {
    // ---------------------------------------------------------------
    // 0. CLEAN SLATE: Delete all existing inspections, gov_responses, promises
    // ---------------------------------------------------------------
    console.log('[seed] Cleaning existing data...')

    // Delete gov_responses first (depends on inspections)
    await supabase.from('gov_responses').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    // Delete inspections (depends on promises)
    await supabase.from('inspections').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    // Delete promises
    await supabase.from('promises').delete().neq('id', '00000000-0000-0000-0000-000000000000')

    summary.cleaned = true
    console.log('[seed] Existing data cleaned.')

    // ---------------------------------------------------------------
    // 1. Sync schools from GEOASR API
    // ---------------------------------------------------------------
    let schoolsSynced = 0
    try {
      schoolsSynced = await syncSchoolsFromAPI()
      summary.schools_synced = schoolsSynced
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      console.warn('[seed] School sync failed (using existing cache):', msg)
      summary.schools_sync_error = msg
    }

    // ---------------------------------------------------------------
    // 2. Create demo auth accounts (idempotent)
    // ---------------------------------------------------------------
    const demoUsers = [
      { email: 'fuqaro@demo.uz', password: 'demo123', role: 'citizen' },
      { email: 'davlat@demo.uz', password: 'demo123', role: 'government' },
    ]

    const userIds: Record<string, string> = {}

    for (const user of demoUsers) {
      const { data, error } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
      })

      if (error) {
        if (
          error.message.includes('already been registered') ||
          error.message.includes('already exists')
        ) {
          // User already exists -- look them up
          const { data: listData } = await supabase.auth.admin.listUsers()
          const existing = listData?.users?.find(
            (u) => u.email === user.email
          )
          if (existing) {
            userIds[user.role] = existing.id
          }
          console.log(`[seed] User ${user.email} already exists, skipping`)
        } else {
          throw new Error(
            `Failed to create user ${user.email}: ${error.message}`
          )
        }
      } else if (data.user) {
        userIds[user.role] = data.user.id
      }
    }

    summary.users_created = Object.keys(userIds).length

    // ---------------------------------------------------------------
    // 3. Create profile rows (upsert to be idempotent)
    // ---------------------------------------------------------------
    if (userIds.citizen) {
      const { error } = await supabase.from('profiles').upsert(
        {
          id: userIds.citizen,
          full_name: 'Zarina Karimova',
          role: 'citizen',
          district: 'Yunusobod tumani',
        },
        { onConflict: 'id' }
      )
      if (error) console.warn('[seed] Citizen profile upsert error:', error.message)
    }

    if (userIds.government) {
      const { error } = await supabase.from('profiles').upsert(
        {
          id: userIds.government,
          full_name: 'Abdulla Ismoilov',
          role: 'government',
        },
        { onConflict: 'id' }
      )
      if (error) console.warn('[seed] Gov profile upsert error:', error.message)
    }

    summary.profiles_created = 2

    // ---------------------------------------------------------------
    // 4. Get Tashkent schools and link citizen to one
    // ---------------------------------------------------------------
    const { data: tashkentSchools, error: schoolsErr } = await supabase
      .from('schools_cache')
      .select('*')
      .ilike('region', '%Toshkent%')
      .limit(50)

    if (schoolsErr) {
      throw new Error(`Failed to query schools: ${schoolsErr.message}`)
    }

    if (!tashkentSchools || tashkentSchools.length === 0) {
      throw new Error(
        'No Tashkent schools found in schools_cache. Make sure schools are synced first.'
      )
    }

    // Find a Yunusobod school for the citizen
    const yunusobodSchool = tashkentSchools.find(
      (s) => s.district && s.district.toLowerCase().includes('yunusobod')
    )
    const citizenSchool = yunusobodSchool || tashkentSchools[0]

    if (userIds.citizen && citizenSchool) {
      await supabase
        .from('profiles')
        .update({ school_id: citizenSchool.id })
        .eq('id', userIds.citizen)
    }

    summary.citizen_school = citizenSchool?.name

    // ---------------------------------------------------------------
    // 5. Pick 8 schools and create promises for each
    //    Citizen's school gets ALL 6 templates (so some can remain uninspected)
    // ---------------------------------------------------------------
    const selectedSchools = tashkentSchools.slice(0, 8)
    const allPromises: Array<{
      school_id: number
      category: string
      title: string
      description: string
      status: string
    }> = []

    for (const school of selectedSchools) {
      if (school.id === citizenSchool.id) {
        // Citizen's school: create ALL 6 promise templates
        // Mix statuses: some pending (so TEKSHIRING button appears), some in_progress/fulfilled
        const citizenStatuses = ['pending', 'pending', 'pending', 'in_progress', 'fulfilled', 'pending']
        for (let i = 0; i < promiseTemplates.length; i++) {
          const template = promiseTemplates[i]
          allPromises.push({
            school_id: school.id,
            category: template.category,
            title: template.title,
            description: template.description,
            status: citizenStatuses[i],
          })
        }
      } else {
        // Other schools: 2-3 random templates
        const count = 2 + Math.floor(Math.random() * 2)
        const shuffled = shuffle(promiseTemplates)
        const picked = shuffled.slice(0, count)

        for (const template of picked) {
          const statuses = ['pending', 'in_progress', 'fulfilled', 'problematic']
          allPromises.push({
            school_id: school.id,
            category: template.category,
            title: template.title,
            description: template.description,
            status: pick(statuses),
          })
        }
      }
    }

    const { data: insertedPromises, error: promisesErr } = await supabase
      .from('promises')
      .insert(allPromises)
      .select('id, school_id, category')

    if (promisesErr) {
      throw new Error(`Failed to insert promises: ${promisesErr.message}`)
    }

    summary.promises_created = insertedPromises?.length || 0

    // ---------------------------------------------------------------
    // 6. Create inspections with CAREFUL distribution
    //    - Demo citizen inspects only 2-3 promises at THEIR school
    //    - Leave 3-4 promises at citizen's school WITHOUT inspections
    //    - Create inspections from OTHER fake users at other schools
    // ---------------------------------------------------------------
    if (!insertedPromises || insertedPromises.length === 0) {
      throw new Error('No promises were created, cannot create inspections')
    }

    const citizenId = userIds.citizen
    if (!citizenId) {
      throw new Error('Citizen user not found, cannot create inspections')
    }

    const photoUrl =
      'https://placehold.co/800x600/e2e8f0/64748b?text=Tekshiruv+surati'

    // Separate promises by citizen's school vs other schools
    const citizenSchoolPromises = insertedPromises.filter(
      (p) => p.school_id === citizenSchool.id
    )
    const otherSchoolPromises = insertedPromises.filter(
      (p) => p.school_id !== citizenSchool.id
    )

    const inspectionRows: Array<{
      promise_id: string
      school_id: number
      user_id: string
      photo_url: string
      is_fulfilled: boolean
      comment: string
    }> = []

    // Demo citizen inspects only 2 promises at their school (leaving 4 uninspected)
    const citizenInspectCount = Math.min(2, citizenSchoolPromises.length)
    const shuffledCitizenPromises = shuffle(citizenSchoolPromises)
    for (let i = 0; i < citizenInspectCount; i++) {
      const promise = shuffledCitizenPromises[i]
      const isFulfilled = Math.random() > 0.4
      inspectionRows.push({
        promise_id: promise.id,
        school_id: promise.school_id,
        user_id: citizenId,
        photo_url: photoUrl,
        is_fulfilled: isFulfilled,
        comment: isFulfilled ? pick(positiveComments) : pick(negativeComments),
      })
    }

    summary.citizen_inspections_at_own_school = citizenInspectCount
    summary.uninspected_promises_at_citizen_school =
      citizenSchoolPromises.length - citizenInspectCount

    // Create 3 fake "other citizen" users for realistic inspections at other schools
    const fakeCitizenNames = [
      { email: 'ali@demo.uz', name: 'Ali Rahimov' },
      { email: 'nodira@demo.uz', name: 'Nodira Usmanova' },
      { email: 'jasur@demo.uz', name: 'Jasur Toshmatov' },
    ]

    const fakeUserIds: string[] = []
    for (const fakeUser of fakeCitizenNames) {
      const { data, error } = await supabase.auth.admin.createUser({
        email: fakeUser.email,
        password: 'demo123',
        email_confirm: true,
      })

      let odamId: string | null = null
      if (error) {
        if (
          error.message.includes('already been registered') ||
          error.message.includes('already exists')
        ) {
          const { data: listData } = await supabase.auth.admin.listUsers()
          const existing = listData?.users?.find((u) => u.email === fakeUser.email)
          if (existing) odamId = existing.id
        }
      } else if (data.user) {
        odamId = data.user.id
      }

      if (odamId) {
        fakeUserIds.push(odamId)
        // Create profile for fake user
        await supabase.from('profiles').upsert(
          {
            id: odamId,
            full_name: fakeUser.name,
            role: 'citizen',
            district: 'Toshkent shahri',
          },
          { onConflict: 'id' }
        )
      }
    }

    // Other users inspect promises at other schools (~10 inspections spread around)
    const shuffledOtherPromises = shuffle(otherSchoolPromises)
    const otherInspectCount = Math.min(10, shuffledOtherPromises.length)
    for (let i = 0; i < otherInspectCount; i++) {
      const promise = shuffledOtherPromises[i]
      const userId = fakeUserIds.length > 0 ? pick(fakeUserIds) : citizenId
      const isFulfilled = Math.random() > 0.4
      inspectionRows.push({
        promise_id: promise.id,
        school_id: promise.school_id,
        user_id: userId,
        photo_url: photoUrl,
        is_fulfilled: isFulfilled,
        comment: isFulfilled ? pick(positiveComments) : pick(negativeComments),
      })
    }

    // Also have the demo citizen inspect 2-3 promises at OTHER schools
    // (so the citizen has some inspection history but their own school still has uninspected ones)
    const remainingOtherPromises = shuffledOtherPromises.slice(otherInspectCount)
    const citizenOtherCount = Math.min(3, remainingOtherPromises.length)
    for (let i = 0; i < citizenOtherCount; i++) {
      const promise = remainingOtherPromises[i]
      const isFulfilled = Math.random() > 0.4
      inspectionRows.push({
        promise_id: promise.id,
        school_id: promise.school_id,
        user_id: citizenId,
        photo_url: photoUrl,
        is_fulfilled: isFulfilled,
        comment: isFulfilled ? pick(positiveComments) : pick(negativeComments),
      })
    }

    const { data: insertedInspections, error: inspErr } = await supabase
      .from('inspections')
      .insert(inspectionRows)
      .select('id, is_fulfilled')

    if (inspErr) {
      throw new Error(`Failed to insert inspections: ${inspErr.message}`)
    }

    summary.inspections_created = insertedInspections?.length || 0

    // ---------------------------------------------------------------
    // 7. Create ~5 gov responses for some inspections
    // ---------------------------------------------------------------
    if (insertedInspections && userIds.government) {
      const responderId = userIds.government
      const govResponseStatuses: Array<
        'acknowledged' | 'in_progress' | 'resolved'
      > = ['acknowledged', 'in_progress', 'resolved', 'acknowledged', 'resolved']

      // Pick 5 unfulfilled inspections (or any if not enough unfulfilled)
      const unfulfilled = insertedInspections.filter((i) => !i.is_fulfilled)
      const targetInspections =
        unfulfilled.length >= 5
          ? unfulfilled.slice(0, 5)
          : insertedInspections.slice(0, 5)

      const govRows = targetInspections.map((insp, idx) => {
        const status = govResponseStatuses[idx]
        return {
          inspection_id: insp.id,
          responder_id: responderId,
          status,
          comment: pick(govComments[status]),
        }
      })

      const { data: insertedResponses, error: govErr } = await supabase
        .from('gov_responses')
        .insert(govRows)
        .select('id')

      if (govErr) {
        console.warn('[seed] Gov responses insert error:', govErr.message)
      }

      summary.gov_responses_created = insertedResponses?.length || 0
    }

    // ---------------------------------------------------------------
    // 8. Update citizen profile inspection_count
    // ---------------------------------------------------------------
    if (citizenId) {
      const { count } = await supabase
        .from('inspections')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', citizenId)

      await supabase
        .from('profiles')
        .update({ inspection_count: count || 0 })
        .eq('id', citizenId)

      summary.citizen_inspection_count = count || 0
    }

    // Also update fake users' inspection counts
    for (const fakeId of fakeUserIds) {
      const { count } = await supabase
        .from('inspections')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', fakeId)

      await supabase
        .from('profiles')
        .update({ inspection_count: count || 0 })
        .eq('id', fakeId)
    }

    return NextResponse.json({
      success: true,
      message: 'Seed data created successfully',
      summary,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[seed] Error:', message)
    return NextResponse.json(
      { success: false, error: message, summary },
      { status: 500 }
    )
  }
}
