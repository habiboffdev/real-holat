'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { CheckCircle, Clock, Loader2, Send } from 'lucide-react'

type ResponseStatus = 'acknowledged' | 'in_progress' | 'resolved'

interface ResponseFormProps {
  inspectionId: string
  existingResponse?: {
    status: string
    comment: string | null
  } | null
}

const STATUS_OPTIONS: {
  value: ResponseStatus
  label: string
  color: string
  bgColor: string
  ringColor: string
  icon: typeof CheckCircle
}[] = [
  {
    value: 'acknowledged',
    label: 'Qabul qilindi',
    color: 'text-amber',
    bgColor: 'bg-amber/10 hover:bg-amber/20',
    ringColor: 'ring-amber',
    icon: Clock,
  },
  {
    value: 'in_progress',
    label: 'Jarayonda',
    color: 'text-teal',
    bgColor: 'bg-teal/10 hover:bg-teal/20',
    ringColor: 'ring-teal',
    icon: Loader2,
  },
  {
    value: 'resolved',
    label: 'Hal qilindi',
    color: 'text-emerald',
    bgColor: 'bg-emerald/10 hover:bg-emerald/20',
    ringColor: 'ring-emerald',
    icon: CheckCircle,
  },
]

const RESPONSE_STATUS_LABELS: Record<string, string> = {
  acknowledged: 'Qabul qilindi',
  in_progress: 'Jarayonda',
  resolved: 'Hal qilindi',
}

const RESPONSE_STATUS_COLORS: Record<string, string> = {
  acknowledged: 'bg-amber/10 text-amber',
  in_progress: 'bg-teal/10 text-teal',
  resolved: 'bg-emerald/10 text-emerald',
}

export function ResponseForm({ inspectionId, existingResponse }: ResponseFormProps) {
  const router = useRouter()
  const [selectedStatus, setSelectedStatus] = useState<ResponseStatus | null>(null)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // If response already exists, show read-only view
  if (existingResponse) {
    const statusLabel =
      RESPONSE_STATUS_LABELS[existingResponse.status] || existingResponse.status
    const statusColor =
      RESPONSE_STATUS_COLORS[existingResponse.status] || 'bg-muted text-muted-foreground'

    return (
      <Card>
        <CardHeader>
          <CardTitle
            className="text-lg"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Javob yuborilgan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Holat:</span>
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${statusColor}`}
            >
              {statusLabel}
            </span>
          </div>
          {existingResponse.comment && (
            <>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground mb-1">Izoh:</p>
                <p className="text-sm">{existingResponse.comment}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    )
  }

  const handleSubmit = async () => {
    if (!selectedStatus) {
      toast.error('Holatni tanlang')
      return
    }

    setIsSubmitting(true)

    try {
      const supabase = createClient()

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        toast.error("Tizimga kiring")
        setIsSubmitting(false)
        return
      }

      // Insert gov response
      const { error: responseError } = await supabase
        .from('gov_responses')
        .insert({
          inspection_id: inspectionId,
          responder_id: user.id,
          status: selectedStatus,
          comment: comment.trim() || null,
        })

      if (responseError) {
        throw responseError
      }

      // Update promise status if resolved
      if (selectedStatus === 'resolved') {
        // Get the promise_id from the inspection
        const { data: inspection } = await supabase
          .from('inspections')
          .select('promise_id')
          .eq('id', inspectionId)
          .single()

        if (inspection?.promise_id) {
          await supabase
            .from('promises')
            .update({ status: 'fulfilled' })
            .eq('id', inspection.promise_id)
        }
      }

      toast.success('Javob yuborildi!')
      router.refresh()
    } catch {
      toast.error("Xatolik. Qayta urinib ko'ring")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle
          className="text-lg"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Javob berish
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status buttons */}
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Holatni tanlang:</p>
          <div className="space-y-2">
            {STATUS_OPTIONS.map((option) => {
              const isSelected = selectedStatus === option.value
              const Icon = option.icon

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setSelectedStatus(option.value)}
                  className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all border-2 ${
                    isSelected
                      ? `${option.bgColor} ${option.color} ${option.ringColor} border-current ring-2 ${option.ringColor}`
                      : `${option.bgColor} ${option.color} border-transparent`
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {option.label}
                </button>
              )
            })}
          </div>
        </div>

        <Separator />

        {/* Comment textarea */}
        <div className="space-y-2">
          <label
            htmlFor="gov-comment"
            className="text-sm text-muted-foreground"
          >
            Izoh (ixtiyoriy):
          </label>
          <textarea
            id="gov-comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Javob haqida qo'shimcha ma'lumot..."
            rows={3}
            className="w-full rounded-xl border border-input bg-transparent px-3 py-2.5 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 resize-none"
          />
        </div>

        {/* Submit button */}
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={!selectedStatus || isSubmitting}
          className="w-full h-14 rounded-xl text-base font-bold bg-navy hover:bg-navy-light text-white gap-2"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Yuborilmoqda...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Javob yuborish
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
