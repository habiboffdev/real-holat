import { createSupabaseServer } from '@/lib/supabase/server'
import { InspectionForm } from '@/components/citizen/inspection-form'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { UZ } from '@/lib/constants/uzbek'

export default async function InspectPage({
  params,
}: {
  params: Promise<{ promiseId: string }>
}) {
  const { promiseId } = await params
  const supabase = await createSupabaseServer()

  const { data: promise } = await supabase
    .from('promises')
    .select('id, title, school_id, category')
    .eq('id', promiseId)
    .single()

  if (!promise) notFound()

  return (
    <div className="px-4 pt-4">
      <Link
        href="/citizen"
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
      >
        <ArrowLeft className="h-5 w-5" />
        <span className="text-[0.9rem]">{UZ.inspect_back}</span>
      </Link>

      <InspectionForm
        promiseId={promise.id}
        promiseTitle={promise.title}
        schoolId={promise.school_id}
      />
    </div>
  )
}
