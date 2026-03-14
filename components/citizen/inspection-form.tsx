'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, Loader2, Check, X } from 'lucide-react'
import confetti from 'canvas-confetti'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { UZ } from '@/lib/constants/uzbek'
import { PhotoUpload } from '@/components/citizen/photo-upload'

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
    'capturing' | 'reviewing' | 'submitting' | 'success'
  >('capturing')
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
    <AnimatePresence mode="wait">
      {/* PHASE: CAPTURING */}
      {phase === 'capturing' && (
        <motion.div
          key="capturing"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <PhotoUpload
            onPhotoReady={handlePhotoReady}
            onError={handlePhotoError}
            autoTrigger={true}
            promptText={`${promiseTitle} ${UZ.inspect_take_photo}`}
          />
        </motion.div>
      )}

      {/* PHASE: REVIEWING + SUBMITTING */}
      {(phase === 'reviewing' || phase === 'submitting') && (
        <motion.div
          key="reviewing"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="space-y-5"
        >
          {/* Photo preview */}
          <div>
            <p className="text-muted-foreground text-[0.82rem] font-medium mb-2.5">
              {UZ.inspect_your_photo}
            </p>
            {localPreview && (
              <div className="rounded-2xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.1)]">
                <img
                  src={localPreview}
                  alt="Inspection photo"
                  className="w-full aspect-[4/3] object-cover"
                />
              </div>
            )}
          </div>

          {/* Verdict question */}
          <h2
            className="text-[1.25rem] font-extrabold text-foreground tracking-tight"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            {UZ.inspect_question}
          </h2>

          {/* Verdict buttons - stacked with depth */}
          <div className="space-y-3">
            {/* YES button */}
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={() => setIsFulfilled(true)}
              disabled={phase === 'submitting'}
              className={`w-full h-14 rounded-xl font-bold text-[1rem] flex items-center justify-center gap-2.5 transition-all duration-250 ${
                isFulfilled === true
                  ? 'bg-emerald text-white shadow-[0_4px_14px_rgba(16,185,129,0.35)] scale-[1.02]'
                  : 'bg-emerald/6 text-emerald border-2 border-emerald/20 hover:border-emerald/40 hover:bg-emerald/10'
              }`}
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 ${
                  isFulfilled === true
                    ? 'bg-white/25'
                    : 'border-2 border-emerald/30'
                }`}
              >
                <Check
                  className={`h-3.5 w-3.5 transition-opacity duration-200 ${
                    isFulfilled === true ? 'opacity-100 text-white' : 'opacity-0'
                  }`}
                />
              </div>
              {UZ.inspect_yes}
            </motion.button>

            {/* NO button */}
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={() => setIsFulfilled(false)}
              disabled={phase === 'submitting'}
              className={`w-full h-14 rounded-xl font-bold text-[1rem] flex items-center justify-center gap-2.5 transition-all duration-250 ${
                isFulfilled === false
                  ? 'bg-coral text-white shadow-[0_4px_14px_rgba(244,63,94,0.35)] scale-[1.02]'
                  : 'bg-coral/6 text-coral border-2 border-coral/20 hover:border-coral/40 hover:bg-coral/10'
              }`}
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 ${
                  isFulfilled === false
                    ? 'bg-white/25'
                    : 'border-2 border-coral/30'
                }`}
              >
                <X
                  className={`h-3.5 w-3.5 transition-opacity duration-200 ${
                    isFulfilled === false ? 'opacity-100 text-white' : 'opacity-0'
                  }`}
                />
              </div>
              {UZ.inspect_no}
            </motion.button>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-muted-foreground text-[0.82rem] font-medium mb-2">
              {UZ.inspect_comment_label}
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={UZ.inspect_comment_placeholder}
              disabled={phase === 'submitting'}
              className="w-full h-24 rounded-xl border-2 border-border/60 bg-white/60 backdrop-blur-sm px-4 py-3 text-base placeholder:text-muted-foreground/40 focus:outline-none focus:border-teal/40 focus:ring-4 focus:ring-teal/10 resize-none disabled:opacity-50 transition-all duration-200"
            />
          </div>

          {/* Error message */}
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-coral text-[0.85rem] font-medium bg-coral/5 rounded-xl px-4 py-2.5"
            >
              {error}
            </motion.p>
          )}

          {/* Submit button */}
          <motion.button
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={handleSubmit}
            disabled={isSubmitDisabled}
            className={`w-full h-14 rounded-xl bg-navy text-white font-bold text-[1rem] tracking-wide flex items-center justify-center gap-2.5 transition-all duration-200 ${
              isSubmitDisabled
                ? 'opacity-35'
                : 'opacity-100 shadow-[0_4px_14px_rgba(12,27,46,0.25)] hover:shadow-[0_6px_20px_rgba(12,27,46,0.35)]'
            }`}
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            {phase === 'submitting' ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              UZ.inspect_submit
            )}
          </motion.button>
        </motion.div>
      )}

      {/* PHASE: SUCCESS */}
      {phase === 'success' && (
        <motion.div
          key="success"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{
            duration: 0.4,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
          className="flex flex-col items-center justify-center py-24 gap-5"
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
            className="w-20 h-20 rounded-full bg-emerald/10 flex items-center justify-center"
          >
            <CheckCircle2 className="h-12 w-12 text-emerald" />
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-[1.4rem] font-extrabold text-emerald text-center tracking-tight"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            {UZ.inspect_success}
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
