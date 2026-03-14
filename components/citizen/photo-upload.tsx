'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { Camera, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { resizeImage } from '@/lib/utils/image-resize'
import { UZ } from '@/lib/constants/uzbek'

interface PhotoUploadProps {
  onPhotoReady: (publicUrl: string, localPreview: string) => void
  onError: (message: string) => void
  autoTrigger?: boolean
  promptText?: string
}

export function PhotoUpload({
  onPhotoReady,
  onError,
  autoTrigger = false,
  promptText,
}: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const triggerCamera = useCallback(() => {
    inputRef.current?.click()
  }, [])

  useEffect(() => {
    if (autoTrigger) {
      if (promptText) {
        toast(promptText)
      }
      const timeout = setTimeout(() => triggerCamera(), 400)
      return () => clearTimeout(timeout)
    }
  }, [autoTrigger, promptText, triggerCamera])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploading(true)

      // Create local preview
      const localPreview = URL.createObjectURL(file)

      // Resize image
      const resized = await resizeImage(file, 1200)

      // Generate unique path
      const path = `inspections/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`

      // Upload to Supabase storage
      const supabase = createClient()
      const { error: uploadError } = await supabase.storage
        .from('inspection-photos')
        .upload(path, resized, { contentType: 'image/jpeg' })

      if (uploadError) {
        throw uploadError
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('inspection-photos')
        .getPublicUrl(path)

      onPhotoReady(urlData.publicUrl, localPreview)
    } catch {
      onError(UZ.error_upload_failed)
    } finally {
      setUploading(false)
      // Reset file input so same file can be re-selected
      if (inputRef.current) {
        inputRef.current.value = ''
      }
    }
  }

  return (
    <>
      <input
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        ref={inputRef}
        onChange={handleFileChange}
      />

      {uploading ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center rounded-2xl border-2 border-teal/20 bg-teal/3 py-20 gap-4"
        >
          {/* Progress ring */}
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-teal/15" />
            <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-transparent border-t-teal animate-spin" />
            <Loader2 className="absolute inset-0 m-auto h-6 w-6 text-teal" />
          </div>
          <span
            className="text-muted-foreground text-[0.95rem] font-medium"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            {UZ.inspect_uploading}
          </span>
        </motion.div>
      ) : (
        <motion.button
          type="button"
          onClick={triggerCamera}
          whileTap={{ scale: 0.97 }}
          whileHover={{ borderColor: 'rgba(6, 182, 212, 0.5)' }}
          className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-muted-foreground/20 bg-gradient-to-b from-white/80 to-muted/20 py-20 gap-4 w-full cursor-pointer hover:bg-teal/3 transition-all duration-300 group"
          style={{
            backgroundImage:
              'repeating-linear-gradient(90deg, transparent, transparent 8px, rgba(6,182,212,0) 8px)',
          }}
        >
          {/* Camera icon with pulse */}
          <div className="relative">
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute inset-0 w-16 h-16 rounded-2xl bg-teal/10 -m-2"
            />
            <Camera className="h-12 w-12 text-teal relative z-10 group-hover:scale-105 transition-transform duration-200" />
          </div>
          <span
            className="text-foreground/70 text-[1.05rem] font-semibold"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Suratga oling
          </span>
          <span className="text-muted-foreground/50 text-[0.8rem]">
            Bosib kamerani oching
          </span>
        </motion.button>
      )}
    </>
  )
}
