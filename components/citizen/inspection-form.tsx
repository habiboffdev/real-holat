'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, Loader2, Check, X, Camera } from 'lucide-react'
import confetti from 'canvas-confetti'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { UZ } from '@/lib/constants/uzbek'
import { PhotoUpload } from '@/components/citizen/photo-upload'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface InspectionFormProps {
  promiseId: string
  promiseTitle: string
  schoolId: number
}

export function InspectionForm({
  promiseId,
  promiseTitle,
  schoolId,
}: InspectionFormProps) {
  const router = useRouter()
  const [phase, setPhase] = useState<
    'idle' | 'capturing' | 'reviewing' | 'submitting' | 'success'
  >('idle')

  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [localPreview, setLocalPreview] = useState<string | null>(null)
  const [isFulfilled, setIsFulfilled] = useState<boolean | null>(null)
  const [comment, setComment] = useState('')
  const [error, setError] = useState('')

  // Fire confetti on success
  useEffect(() => {
    if (phase === 'success') {
      // Double burst for a bigger celebration
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7, x: 0.3 },
      })
      setTimeout(() => {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.7, x: 0.7 },
        })
      }, 150)
      const timeout = setTimeout(() => {
        router.push('/citizen')
        router.refresh()
      }, 1800)
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
    if (!photoUrl || isFulfilled === null) return

    setPhase('submitting')
    setError('')

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setError(UZ.error_generic)
        setPhase('reviewing')
        return
      }

      // Insert inspection
      const { error: insertError } = await supabase
        .from('inspections')
        .insert({
          promise_id: promiseId,
          school_id: schoolId,
          user_id: user.id,
          photo_url: photoUrl,
          is_fulfilled: isFulfilled,
          comment: comment.trim() || null,
        })

      if (insertError) {
        setError(UZ.error_generic)
        setPhase('reviewing')
        return
      }

      // Fetch current count and increment
      const { data: profile } = await supabase
        .from('profiles')
        .select('inspection_count')
        .eq('id', user.id)
        .single()

      await supabase
        .from('profiles')
        .update({
          inspection_count: ((profile?.inspection_count as number) || 0) + 1,
        })
        .eq('id', user.id)

      setPhase('success')
    } catch {
      setError(UZ.error_generic)
      setPhase('reviewing')
    }
  }

  const isSubmitDisabled =
    !photoUrl || isFulfilled === null || phase === 'submitting'

  return (
    <>
      {/* PHASE: IDLE (Trigger Button) */}
      {phase === 'idle' && (
        <Button
          onClick={() => setPhase('capturing')}
          className="w-full h-14 rounded-xl font-bold text-[1.05rem] bg-teal text-navy shadow-[0_4px_14px_rgba(20,184,166,0.3)] hover:bg-teal-light active:scale-[0.98] transition-all"
        >
          <Camera className="mr-2 h-5 w-5" />
          Rasmga Olishni Boshlash
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
              onClick={() => router.back()}
              className="text-muted-foreground hover:text-foreground px-2 py-1 flex items-center gap-2"
            >
              <span className="text-[1.5rem] leading-none mb-1">&larr;</span> Orqaga
            </button>
          </div>

          <div className="flex-1 flex flex-col justify-center pb-20">
            <h2 
              className="text-[1.5rem] font-bold text-navy text-center mb-8 px-4"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              {promiseTitle}
            </h2>
            <PhotoUpload
              onPhotoReady={handlePhotoReady}
              onError={handlePhotoError}
              autoTrigger={true}
              promptText={`${promiseTitle} ${UZ.inspect_take_photo}`}
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
          className="fixed inset-0 z-[100] bg-[#0A0A0A] text-white flex flex-col pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] scale-100"
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
            <span className="font-semibold text-white/50 text-sm">
              2 / 2 qadam
            </span>
            <div className="w-16" /> {/* Spacer */}
          </div>

          <div className="flex-1 overflow-y-auto px-5 pb-8 flex flex-col">
            {/* Massive Photo preview */}
            {localPreview && (
              <div className="w-full aspect-[3/4] rounded-[32px] overflow-hidden bg-white/5 shadow-2xl relative mb-8 flex-shrink-0">
                <img
                  src={localPreview}
                  alt="Inspection"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/80 to-transparent flex items-end p-6">
                  <h2 className="text-[1.5rem] font-bold leading-tight" style={{ fontFamily: 'var(--font-heading)' }}>
                    {promiseTitle}
                  </h2>
                </div>
              </div>
            )}

            <div className="flex-1 flex flex-col justify-end space-y-4 max-w-sm mx-auto w-full">
              <p className="text-center text-white/70 text-lg mb-2">
                Haqiqatdan ham bajarilganmi?
              </p>

              {/* Massive Verdict buttons */}
              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={() => setIsFulfilled(true)}
                  disabled={phase === 'submitting'}
                  className={`h-24 rounded-3xl font-bold text-xl flex flex-col gap-2 transition-all ${
                    isFulfilled === true
                      ? 'bg-emerald border-4 border-emerald/50'
                      : 'bg-[#1A1A1A] border-4 border-transparent hover:bg-[#222]'
                  }`}
                >
                  <CheckCircle2 className={`h-8 w-8 ${isFulfilled === true ? 'text-white' : 'text-emerald'}`} />
                  Ha
                </Button>

                <Button
                  onClick={() => setIsFulfilled(false)}
                  disabled={phase === 'submitting'}
                  className={`h-24 rounded-3xl font-bold text-xl flex flex-col gap-2 transition-all ${
                    isFulfilled === false
                      ? 'bg-coral border-4 border-coral/50'
                      : 'bg-[#1A1A1A] border-4 border-transparent hover:bg-[#222]'
                  }`}
                >
                  <X className={`h-8 w-8 ${isFulfilled === false ? 'text-white' : 'text-coral'}`} />
                  Yo'q
                </Button>
              </div>

              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Qo'shimcha izoh (ixtiyoriy)..."
                disabled={phase === 'submitting'}
                className="w-full h-16 rounded-2xl bg-[#1A1A1A] border border-white/10 px-4 py-4 text-white placeholder:text-white/30 focus:outline-none focus:border-teal/50 resize-none mt-4 text-base"
              />

              <Button
                onClick={handleSubmit}
                disabled={isSubmitDisabled}
                className={`w-full h-16 rounded-2xl font-bold text-xl mt-4 transition-all ${
                   isSubmitDisabled ? 'bg-white/10 text-white/30' : 'bg-teal text-navy shadow-[0_0_30px_rgba(6,182,212,0.4)]'
                 }`}
              >
                {phase === 'submitting' ? <Loader2 className="h-6 w-6 animate-spin" /> : 'Yuborish'}
              </Button>
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
          className="fixed inset-0 z-50 bg-[#0A0A0A] flex flex-col items-center justify-center py-24 gap-6"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 15,
              delay: 0.1,
            }}
            className="w-24 h-24 rounded-full bg-emerald/10 border-2 border-emerald/20 flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.2)]"
          >
            <CheckCircle2 className="h-12 w-12 text-emerald" />
          </motion.div>
          
          <div className="text-center px-6">
            <h2 
              className="text-[1.8rem] font-bold text-white mb-2 tracking-tight"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Qabul Qilindi!
            </h2>
            <p className="text-white/60 text-[1.1rem]">
              Sizning hissangiz maktabni yaxshilashga yordam beradi.
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  )
}
