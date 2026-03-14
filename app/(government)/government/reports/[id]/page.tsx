import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { createSupabaseServer } from '@/lib/supabase/server'
import { ResponseForm } from '@/components/government/response-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Calendar, MapPin, User } from 'lucide-react'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  return {
    title: `Hisobot — Real Holat`,
  }
}

const CATEGORY_LABELS: Record<string, string> = {
  toilet_repair: "Hojatxona ta'miri",
  soap_dispensers: 'Sovun idishlari',
  new_desks: 'Yangi partalar',
  cafeteria: 'Oshxona',
  sports_hall: 'Sport zali',
  renovation: "Ta'mirlash",
}

export default async function ReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: inspectionId } = await params
  const supabase = await createSupabaseServer()

  const { data: inspection, error } = await supabase
    .from('inspections')
    .select(
      '*, promises(title, category, description, status, schools_cache(name, district)), profiles(full_name), gov_responses(*)'
    )
    .eq('id', inspectionId)
    .single()

  if (error || !inspection) {
    notFound()
  }

  // Type cast for nested relations
  const promise = inspection.promises as unknown as {
    title: string
    category: string
    description: string
    status: string
    schools_cache: { name: string; district: string } | null
  } | null

  const profile = inspection.profiles as unknown as {
    full_name: string
  } | null

  const govResponses = (inspection.gov_responses || []) as unknown as {
    id: string
    status: string
    comment: string | null
    created_at: string
  }[]

  const latestResponse =
    govResponses.length > 0
      ? govResponses[govResponses.length - 1]
      : null

  const schoolName = promise?.schools_cache?.name || "Noma'lum maktab"
  const district = promise?.schools_cache?.district || ''
  const promiseTitle = promise?.title || "Noma'lum va'da"
  const promiseCategory = promise?.category || ''
  const promiseDescription = promise?.description || ''
  const inspectorName = profile?.full_name || 'Anonim'
  const isFulfilled = inspection.is_fulfilled

  const formattedDate = new Date(inspection.created_at).toLocaleDateString(
    'uz-UZ',
    {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }
  )

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/government"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Barcha hisobotlar
      </Link>

      {/* Two-column layout */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Left column: Photo + details */}
        <div className="lg:col-span-3 space-y-6">
          {/* Photo */}
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              {inspection.photo_url ? (
                <div className="relative aspect-[4/3] w-full">
                  <Image
                    src={inspection.photo_url}
                    alt={promiseTitle}
                    fill
                    className="object-cover rounded-2xl"
                    sizes="(max-width: 768px) 100vw, 60vw"
                    priority
                  />
                </div>
              ) : (
                <div className="flex aspect-[4/3] w-full items-center justify-center bg-muted rounded-2xl">
                  <svg
                    className="h-16 w-16 text-muted-foreground"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
                    />
                  </svg>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Inspection detail */}
          <Card>
            <CardHeader>
              <CardTitle
                className="text-lg"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                Tekshiruv ma&apos;lumotlari
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* School */}
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p
                    className="font-bold"
                    style={{ fontFamily: 'var(--font-heading)' }}
                  >
                    {schoolName}
                  </p>
                  {district && (
                    <p className="text-sm text-muted-foreground">{district}</p>
                  )}
                </div>
              </div>

              <Separator />

              {/* Promise */}
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Va&apos;da:
                </p>
                <p className="font-medium">{promiseTitle}</p>
                {promiseCategory && (
                  <Badge variant="secondary" className="mt-1">
                    {CATEGORY_LABELS[promiseCategory] || promiseCategory}
                  </Badge>
                )}
                {promiseDescription && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {promiseDescription}
                  </p>
                )}
              </div>

              <Separator />

              {/* Citizen info */}
              <div className="flex items-start gap-3">
                <User className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm">
                    <span className="text-muted-foreground">Tekshiruvchi: </span>
                    <span className="font-medium">{inspectorName}</span>
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-muted-foreground">Xulosa:</span>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        isFulfilled
                          ? 'bg-emerald/10 text-emerald'
                          : 'bg-coral/10 text-coral'
                      }`}
                    >
                      {isFulfilled ? 'Bajarildi' : 'Muammo'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Date */}
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                <p className="text-sm text-muted-foreground">
                  {formattedDate}
                </p>
              </div>

              {/* Citizen comment */}
              {inspection.comment && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Fuqaro izohi:
                    </p>
                    <blockquote className="border-l-3 border-teal pl-4 py-2 bg-teal/5 rounded-r-lg">
                      <p className="text-sm italic">
                        &ldquo;{inspection.comment}&rdquo;
                      </p>
                    </blockquote>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column: Response form */}
        <div className="lg:col-span-2">
          <div className="lg:sticky lg:top-24">
            <ResponseForm
              inspectionId={inspectionId}
              existingResponse={
                latestResponse
                  ? {
                      status: latestResponse.status,
                      comment: latestResponse.comment,
                    }
                  : null
              }
            />
          </div>
        </div>
      </div>
    </div>
  )
}
