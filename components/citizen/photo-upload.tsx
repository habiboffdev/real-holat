'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { Camera, Loader2 } from 'lucide-react'
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
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-muted-foreground/30 bg-muted/30 py-16 gap-3">
          <Loader2 className="h-10 w-10 text-teal animate-spin" />
          <span className="text-muted-foreground text-[0.95rem]">
            {UZ.inspect_uploading}
          </span>
        </div>
      ) : (
        <button
          type="button"
          onClick={triggerCamera}
          className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-muted-foreground/30 bg-muted/30 py-16 gap-3 w-full cursor-pointer hover:border-teal/50 hover:bg-teal/5 transition-colors active:scale-[0.98]"
        >
          <Camera className="h-12 w-12 text-teal" />
          <span className="text-muted-foreground text-[1rem] font-medium">
            Suratga oling
          </span>
        </button>
      )}
    </>
  )
}
