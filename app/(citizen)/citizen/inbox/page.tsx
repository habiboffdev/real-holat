import { createSupabaseServer } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, Clock, XCircle, BellRing, ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { UZ } from '@/lib/constants/uzbek'

export const dynamic = 'force-dynamic'

function relativeTimeShort(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  const hours = Math.floor(diff / 3600000)
  
  if (hours < 1) return 'Hozirgin'
  if (hours < 24) return `${hours} soat oldin`
  if (days === 1) return 'Kecha'
  if (days < 7) return `${days} kun oldin`
  return new Date(dateStr).toLocaleDateString('uz-UZ', { month: 'short', day: 'numeric' })
}

export default async function InboxPage() {
  const supabase = await createSupabaseServer()

  // 1. Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-dvh px-5 text-center">
        <p className="text-muted-foreground mb-4">Tizimga kirmagansiz</p>
        <Link href="/auth/login" className="text-teal font-medium">Kirish</Link>
      </div>
    )
  }

  // 2. Fetch user's inspections and join related promises
  // We want to show when they submitted, and what the ultimate status of the promise is.
  const { data: inspections } = await supabase
    .from('inspections')
    .select(`
      id, 
      created_at, 
      is_fulfilled,
      promises(id, title, status)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-dvh bg-muted/30 pb-24">
      {/* Header */}
      <div className="bg-navy px-5 pt-[max(env(safe-area-inset-top),20px)] pb-6 rounded-b-[32px] shadow-[0_4px_20px_rgba(12,27,46,0.1)] relative">
        <div className="flex items-center justify-between mb-4">
          <Link
            href="/citizen"
            className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center border border-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="h-10 w-10 rounded-full bg-teal/20 flex items-center justify-center relative">
            <BellRing className="h-5 w-5 text-teal-light" />
            {(inspections?.length ?? 0) > 0 && (
              <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-coral animate-pulse" />
            )}
          </div>
        </div>
        
        <h1 
          className="text-[1.8rem] font-bold text-white leading-tight"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Xabarnomalar
        </h1>
        <p className="text-white/60 text-[0.95rem] mt-1">Sizning murojaatlaringiz holati</p>
      </div>

      {/* Notifications List */}
      <div className="px-5 pt-6 space-y-3">
        {!inspections || inspections.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <BellRing className="h-8 w-8 text-muted-foreground/40" />
            </div>
            <p className="text-[1.05rem] font-semibold text-navy">Xabarnomalar yo'q</p>
            <p className="text-[0.9rem] text-muted-foreground mt-1 px-4">Siz hali hech qanday tekshiruv o'tkazmagansiz.</p>
          </div>
        ) : (
          inspections.map((insp) => {
            const promise = insp.promises as unknown as { id: string; title: string; status: string }
            const isResolved = promise.status === 'fulfilled'
            const isProblematic = promise.status === 'problematic'
            const isPending = !isResolved && !isProblematic
            
            return (
              <Card key={insp.id} className="overflow-hidden border-border/50 hover:border-navy/20 transition-colors">
                <Link href={`/citizen/inspect/${promise.id}`}>
                  <CardContent className="p-4 flex items-start gap-4">
                    
                    {/* Icon Indicator */}
                    <div className="mt-1 shrink-0">
                      {isResolved ? (
                        <div className="h-10 w-10 rounded-full bg-emerald/10 flex items-center justify-center">
                          <CheckCircle2 className="h-5 w-5 text-emerald" />
                        </div>
                      ) : isProblematic ? (
                        <div className="h-10 w-10 rounded-full bg-coral/10 flex items-center justify-center">
                          <XCircle className="h-5 w-5 text-coral" />
                        </div>
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-amber/10 flex items-center justify-center">
                          <Clock className="h-5 w-5 text-amber-600 animate-pulse" />
                        </div>
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-[0.7rem] font-bold uppercase tracking-wider ${
                          isResolved ? 'text-emerald' : isProblematic ? 'text-coral' : 'text-amber-600'
                        }`}>
                          {isResolved ? 'Hal qilindi' : isProblematic ? 'Muammo aniqlandi' : 'Ko\'rib chiqilmoqda'}
                        </span>
                        <span className="text-[0.7rem] text-muted-foreground whitespace-nowrap ml-2">
                          {relativeTimeShort(insp.created_at)}
                        </span>
                      </div>
                      
                      <p className="text-[0.95rem] font-semibold text-navy leading-snug line-clamp-2">
                        {promise.title}
                      </p>
                      
                      <p className="text-[0.8rem] text-muted-foreground mt-1.5 leading-relaxed line-clamp-2">
                        {isResolved 
                          ? 'Murojaatingiz va yuborgan suratingiz asosida davlat tomonidan muammo to\'liq hal etildi. Kattakon rahmat!'
                          : isProblematic 
                          ? 'Siz yuborgan suratdagi kamchiliklar o\'rganilmoqda va tez orada chora ko\'riladi.'
                          : 'Sizning hisobotingiz tizimga qabul qilindi. Davlat inspektorlari uni ko\'rib chiqmoqda.'}
                      </p>
                    </div>

                    <div className="pt-8 shrink-0">
                      <ChevronRight className="h-5 w-5 text-muted-foreground/30" />
                    </div>
                  </CardContent>
                </Link>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
