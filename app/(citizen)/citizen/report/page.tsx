import { createSupabaseServer } from '@/lib/supabase/server'
import { ReportProblemForm } from '@/components/citizen/report-problem-form'
import Link from 'next/link'
import { ArrowLeft, AlertTriangle } from 'lucide-react'
import { UZ } from '@/lib/constants/uzbek'

export const dynamic = 'force-dynamic'

export default async function ReportProblemPage() {
  const supabase = await createSupabaseServer()

  // Fetch all schools nearby for the select dropdown
  const { data: schools } = await supabase
    .from('schools_cache')
    .select('id, name, district')
    .order('name')

  return (
    <div className="min-h-dvh bg-muted/30 pb-32">
      {/* Premium Header */}
      <div className="bg-coral px-5 pt-[max(env(safe-area-inset-top),20px)] pb-6 rounded-b-[32px] shadow-lg relative overflow-hidden">
        {/* Glow */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/20 rounded-full blur-[80px]" />
        
        <Link
          href="/citizen"
          className="relative z-10 inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-6"
        >
          <div className="h-8 w-8 rounded-full bg-black/10 backdrop-blur-md flex items-center justify-center border border-white/10">
            <ArrowLeft className="h-4 w-4" />
          </div>
          <span className="text-[0.9rem] font-medium">Orqaga qaytish</span>
        </Link>

        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/10 text-white text-[0.75rem] font-bold tracking-wide uppercase mb-3 border border-white/20">
            <AlertTriangle className="h-3.5 w-3.5" />
            Yangi Murojaat
          </div>
          <h1 
            className="text-[1.6rem] font-bold text-white leading-tight mb-2"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Muammoni Xabar Qilish
          </h1>
          <p className="text-white/80 text-[0.95rem]">Maktabdagi kamchilikni suratga oling va bizga yuboring</p>
        </div>
      </div>

      <div className="px-5 pt-6 space-y-4">
        {/* Call to Action Box */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-border/50 text-center px-6">
          <h3 className="text-[1.1rem] font-bold text-navy mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
            Muammo nima haqida?
          </h3>
          <p className="text-[0.85rem] text-muted-foreground leading-relaxed mb-6">
            Davlat dasturiga kiritilmagan maktabdagi muammolarni xabar qilib, ularni hal etilishiga o'z hissangizni qo'shing.
          </p>
          
          <ReportProblemForm schools={schools || []} />
        </div>
      </div>
    </div>
  )
}
