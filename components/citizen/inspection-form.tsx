'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, Loader2 } from 'lucide-react'
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
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } })
      const timeout = setTimeout(() => {
        router.push('/citizen')
        router.refresh()
      }, 1500)
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
          transition={{ duration: 0.25 }}
        >
          <PhotoUpload
            onPhotoReady={handlePhotoReady}
            onError={handlePhotoError}
            autoTrigger={true}
            promptText={`\ud83d\udcf7 ${promiseTitle} ${UZ.inspect_take_photo}`}
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
          transition={{ duration: 0.25 }}
        >
          {/* Photo preview */}
          <p className="text-muted-foreground text-[0.85rem] mb-2">
            {UZ.inspect_your_photo}
          </p>
          {localPreview && (
            <img
              src={localPreview}
              alt="Inspection photo"
              className="w-full rounded-2xl aspect-[4/3] object-cover"
            />
          )}

          {/* Verdict question */}
          <h2
            className="text-[1.2rem] font-semibold text-foreground mt-5 mb-3"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            {UZ.inspect_question}
          </h2>

          {/* YES button */}
          <motion.button
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={() => setIsFulfilled(true)}
            disabled={phase === 'submitting'}
            className={`w-full h-14 rounded-xl font-bold text-[1rem] flex items-center justify-center gap-2 transition-all duration-200 ${
              isFulfilled === true
                ? 'bg-emerald text-white ring-2 ring-emerald/50 scale-[1.02]'
                : 'bg-emerald/10 text-emerald border border-emerald/30'
            }`}
          >
            \u2705 {UZ.inspect_yes}
          </motion.button>

          {/* NO button */}
          <motion.button
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={() => setIsFulfilled(false)}
            disabled={phase === 'submitting'}
            className={`w-full h-14 rounded-xl font-bold text-[1rem] flex items-center justify-center gap-2 mt-3 transition-all duration-200 ${
              isFulfilled === false
                ? 'bg-coral text-white ring-2 ring-coral/50 scale-[1.02]'
                : 'bg-coral/10 text-coral border border-coral/30'
            }`}
          >
            \u274c {UZ.inspect_no}
          </motion.button>

          {/* Comment */}
          <label className="block text-muted-foreground text-[0.85rem] mt-4 mb-1.5">
            {UZ.inspect_comment_label}
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={UZ.inspect_comment_placeholder}
            disabled={phase === 'submitting'}
            className="w-full h-20 rounded-xl border border-border bg-background px-3 py-2 text-base placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-teal/30 resize-none disabled:opacity-50"
          />

          {/* Error message */}
          {error && (
            <p className="text-coral text-[0.85rem] mt-2">{error}</p>
          )}

          {/* Submit button */}
          <motion.button
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={handleSubmit}
            disabled={isSubmitDisabled}
            className={`w-full h-14 rounded-xl bg-navy text-white font-bold text-[1rem] flex items-center justify-center gap-2 mt-4 transition-opacity ${
              isSubmitDisabled ? 'opacity-40' : 'opacity-100'
            }`}
          >
            {phase === 'submitting' ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                \ud83d\udce4 {UZ.inspect_submit}
              </>
            )}
          </motion.button>
        </motion.div>
      )}

      {/* PHASE: SUCCESS */}
      {phase === 'success' && (
        <motion.div
          key="success"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
          className="flex flex-col items-center justify-center py-20 gap-4"
        >
          <CheckCircle2 className="h-16 w-16 text-emerald" />
          <p
            className="text-[1.3rem] font-semibold text-emerald text-center"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            {UZ.inspect_success}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
