import { createSupabaseServer } from '@/lib/supabase/server'
import { InspectionForm } from '@/components/citizen/inspection-form'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, AlertCircle, FileText, Calendar, Landmark } from 'lucide-react'
import { UZ } from '@/lib/constants/uzbek'

export default async function InspectPage({
  params,
}: {
  params: Promise<{ promiseId: string }>
}) {
  const { promiseId } = await params
  const supabase = await createSupabaseServer()

  // 1. Fetch Promise
  const { data: promise } = await supabase
    .from('promises')
    .select('*, schools_cache(name)')
    .eq('id', promiseId)
    .single()

  if (!promise) notFound()

  // MOCK DATA for the $10B UX "Case File"
  // In a real app, this would come from the database
  const budget = Math.floor(Math.random() * 500 + 50)
  const deadline = new Date()
  deadline.setMonth(deadline.getMonth() + 2)
  const formattedDeadline = deadline.toLocaleDateString('uz-UZ', { month: 'long', year: 'numeric' })

  return (
    <div className="min-h-dvh bg-muted/30 pb-32">
      {/* Premium Header */}
      <div className="bg-navy px-5 pt-[max(env(safe-area-inset-top),20px)] pb-6 rounded-b-[32px] shadow-lg relative overflow-hidden">
        {/* Glow */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-teal/20 rounded-full blur-[80px]" />
        
        <Link
          href="/citizen"
          className="relative z-10 inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-6"
        >
          <div className="h-8 w-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10">
            <ArrowLeft className="h-4 w-4" />
          </div>
          <span className="text-[0.9rem] font-medium">Orqaga qaytish</span>
        </Link>

        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal/20 text-teal-light text-[0.75rem] font-bold tracking-wide uppercase mb-3 border border-teal/30">
            <FileText className="h-3.5 w-3.5" />
            Vaziyat fayli (Case File)
          </div>
          <h1 
            className="text-[1.6rem] font-bold text-white leading-tight mb-2"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            {promise.title}
          </h1>
          <p className="text-white/60 text-[0.95rem]">{promise.schools_cache?.name}</p>
        </div>
      </div>

      <div className="px-5 pt-6 space-y-4">
        {/* Context Card */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-border/50">
          <h2 className="text-[0.95rem] font-bold text-navy mb-4 flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}>
            <AlertCircle className="h-4 w-4 text-teal" />
            Loyiha tafsilotlari
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                <Landmark className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-[0.75rem] font-medium text-muted-foreground uppercase tracking-wider">Ajratilgan byudjet</p>
                <p className="text-[1.05rem] font-bold text-foreground">~{budget} mln so'm</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-0.5 h-8 w-8 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
                <Calendar className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <p className="text-[0.75rem] font-medium text-muted-foreground uppercase tracking-wider">Tugatish muddati</p>
                <p className="text-[1.05rem] font-bold text-foreground">{formattedDeadline}</p>
              </div>
            </div>
            
            {promise.description && (
              <div className="pt-3 border-t border-border/50">
                <p className="text-[0.85rem] leading-relaxed text-muted-foreground">
                  "{promise.description}"
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Call to Action Box */}
        <div className="bg-gradient-to-br from-teal/[0.05] to-teal/[0.15] border border-teal/20 rounded-2xl p-5 text-center px-6">
          <h3 className="text-[1.1rem] font-bold text-navy mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
            Sizning yordamingiz kerak
          </h3>
          <p className="text-[0.85rem] text-muted-foreground leading-relaxed mb-6">
            Davlat ushbu maktab uchun yuqoridagi mablag'ni ajratgan. Iltimos, borib haqiqiy holatni suratga oling va bizga yuboring.
          </p>
          
          {/* 
            Instead of immediately showing the camera, the InspectionForm now acts differently.
            Because we updated InspectionForm to have a absolute 'fixed' overlay for the camera, 
            rendering it here will place a "Take Photo" button on the page. 
            When clicked, it will overtake the full screen.
          */}
          <InspectionForm
            promiseId={promise.id}
            promiseTitle={promise.title}
            schoolId={promise.school_id}
          />
        </div>
      </div>
    </div>
  )
}
