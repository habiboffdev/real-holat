'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, Loader2, Camera, AlertTriangle } from 'lucide-react'
import confetti from 'canvas-confetti'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { UZ } from '@/lib/constants/uzbek'
import { PhotoUpload } from '@/components/citizen/photo-upload'
import { Button } from '@/components/ui/button'

export function ReportProblemForm({ schools }: { schools: { id: number; name: string }[] }) {
  const router = useRouter()
  const [phase, setPhase] = useState<'idle' | 'capturing' | 'reviewing' | 'submitting' | 'success'>('idle')
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [localPreview, setLocalPreview] = useState<string | null>(null)
  
  // Form State
  const [schoolId, setSchoolId] = useState<string>('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')

  // Fire confetti on success
  useEffect(() => {
    if (phase === 'success') {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } })
      const timeout = setTimeout(() => {
        router.push('/citizen/inbox')
        router.refresh()
      }, 2000)
      return () => clearTimeout(timeout)
    }
  }, [phase, router])

  const handlePhotoReady = (publicUrl: string, preview: string) => {
    setPhotoUrl(publicUrl)
    setLocalPreview(preview)
    setPhase('reviewing')
  }

  const handlePhotoError = (message: string) => {
    toast.error(message)
    setError(message)
  }

  const handleSubmit = async () => {
    if (!photoUrl || !schoolId || !title.trim()) return

    setPhase('submitting')
    setError('')

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setError(UZ.error_generic)
        setPhase('reviewing')
        return
      }

      // 1. Create a NEW promise
      const { data: newPromise, error: promiseError } = await supabase
        .from('promises')
        .insert({
          school_id: parseInt(schoolId, 10),
          category: 'other', // Or 'renovation', keeping it simple for crowdsourced
          title: title.trim(),
          description: description.trim() || 'Fuqaro tomonidan xabar qilingan muammo',
          status: 'problematic', // Instantly marked as problematic
          budget_allocated: 0,
        })
        .select('id')
        .single()

      if (promiseError || !newPromise) {
        setError(UZ.error_generic)
        setPhase('reviewing')
        return
      }

      // 2. Create the inspection linked to this new promise
      const { error: insertError } = await supabase
        .from('inspections')
        .insert({
          promise_id: newPromise.id,
          school_id: parseInt(schoolId, 10),
          user_id: user.id,
          photo_url: photoUrl,
          is_fulfilled: false, // It's a problem, so it's not fulfilled
          comment: description.trim() || 'Yangi muammo xabar qilindi',
        })

      if (insertError) {
        setError(UZ.error_generic)
        setPhase('reviewing')
        return
      }

      // 3. Increment user inspection count
      const { data: profile } = await supabase.from('profiles').select('inspection_count').eq('id', user.id).single()
      await supabase.from('profiles').update({ inspection_count: ((profile?.inspection_count as number) || 0) + 1 }).eq('id', user.id)

      setPhase('success')
    } catch {
      setError(UZ.error_generic)
      setPhase('reviewing')
    }
  }

  const isSubmitDisabled = !photoUrl || !schoolId || !title.trim() || phase === 'submitting'

  return (
    <>
      {/* PHASE: IDLE (Trigger Button) */}
      {phase === 'idle' && (
        <Button
          onClick={() => setPhase('capturing')}
          className="w-full h-14 rounded-xl font-bold text-[1.05rem] bg-coral text-white shadow-[0_4px_14px_rgba(244,63,94,0.3)] hover:bg-coral/90 active:scale-[0.98] transition-all"
        >
          <Camera className="mr-2 h-5 w-5" />
          Suratga Olishni Boshlash
        </Button>
      )}

      <AnimatePresence mode="wait">
        {/* PHASE: CAPTURING */}
        {phase === 'capturing' && (
          <motion.div
            key="capturing"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="fixed inset-0 z-[100] bg-background flex flex-col pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] px-4"
          >
            {/* Header */}
            <div className="flex items-center pt-4 pb-6">
              <button
                onClick={() => setPhase('idle')}
                className="text-muted-foreground hover:text-foreground px-2 py-1 flex items-center gap-2"
              >
                <span className="text-[1.5rem] leading-none mb-1">&larr;</span> Bekor qilish
              </button>
            </div>

            <div className="flex-1 flex flex-col justify-center pb-20">
              <h2 className="text-[1.5rem] font-bold text-coral text-center mb-8 px-4" style={{ fontFamily: 'var(--font-heading)' }}>
                Muammoni rasmga oling
              </h2>
              <PhotoUpload
                onPhotoReady={handlePhotoReady}
                onError={handlePhotoError}
                autoTrigger={true}
                promptText={`Yangi muammo rasmini oling`}
              />
            </div>
          </motion.div>
        )}

        {/* PHASE: REVIEWING + SUBMITTING */}
        {(phase === 'reviewing' || phase === 'submitting') && (
          <motion.div
            key="reviewing"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] bg-[#0c121e] text-white flex flex-col pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] scale-100"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-4">
              <button
                onClick={() => {
                  setPhase('capturing')
                  setPhotoUrl(null)
                  setLocalPreview(null)
                }}
                className="text-white/60 hover:text-white px-2 py-1"
              >
                Orqaga
              </button>
              <span className="font-semibold text-white/50 text-sm">2 / 2 qadam</span>
              <div className="w-16" />
            </div>

            <div className="flex-1 overflow-y-auto px-5 pb-8 flex flex-col">
              {/* Photo preview */}
              {localPreview && (
                <div className="w-full h-[200px] rounded-2xl overflow-hidden bg-white/5 shadow-2xl relative mb-6 shrink-0 border border-white/10">
                  <img src={localPreview} alt="Inspection" className="absolute inset-0 w-full h-full object-cover" />
                </div>
              )}

              <div className="flex-1 flex flex-col space-y-4 w-full">
                
                {/* Form Fields */}
                <div className="space-y-4">
                  <div>
                    <label className="text-[0.85rem] text-white/70 font-medium ml-1 mb-1.5 block">Qaysi maktab?</label>
                    <select 
                      value={schoolId}
                      onChange={(e) => setSchoolId(e.target.value)}
                      disabled={phase === 'submitting'}
                      className="w-full h-14 rounded-xl bg-white/10 border border-white/20 px-4 text-white appearance-none focus:outline-none focus:border-coral transition-colors"
                    >
                      <option value="" disabled className="text-black">Maktabni tanlang</option>
                      {schools.map(s => (
                        <option key={s.id} value={s.id} className="text-black">{s.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[0.85rem] text-white/70 font-medium ml-1 mb-1.5 block">Muammo nomi</label>
                    <input 
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Masalan: Tomdan chakka o'tyapti"
                      disabled={phase === 'submitting'}
                      className="w-full h-14 rounded-xl bg-white/10 border border-white/20 px-4 text-white placeholder:text-white/30 focus:outline-none focus:border-coral transition-colors"
                    />
                  </div>

                  <div>
                    <label className="text-[0.85rem] text-white/70 font-medium ml-1 mb-1.5 block">Qo'shimcha ma'lumot (ixtiyoriy)</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Batafsil tushuntirish..."
                      disabled={phase === 'submitting'}
                      className="w-full h-24 rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-coral resize-none transition-colors"
                    />
                  </div>
                </div>

                <div className="mt-auto pt-6">
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitDisabled}
                    className={`w-full h-16 rounded-2xl font-bold text-xl transition-all ${
                       isSubmitDisabled ? 'bg-white/10 text-white/30' : 'bg-coral text-white shadow-[0_0_30px_rgba(244,63,94,0.4)]'
                     }`}
                  >
                    {phase === 'submitting' ? <Loader2 className="h-6 w-6 animate-spin" /> : 'Yuborish'}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* PHASE: SUCCESS */}
        {phase === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-[100] bg-[#0c121e] flex flex-col items-center justify-center py-24 gap-6"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.1 }}
              className="w-24 h-24 rounded-full bg-emerald/10 border-2 border-emerald/20 flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.2)]"
            >
              <CheckCircle2 className="h-12 w-12 text-emerald" />
            </motion.div>
            
            <div className="text-center px-6">
              <h2 className="text-[1.8rem] font-bold text-white mb-2 tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
                Rahmat!
              </h2>
              <p className="text-white/60 text-[1.1rem]">
                Xabar qilingan muammo davlat mas'ullari tomonidan poydevor qilinadi.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
