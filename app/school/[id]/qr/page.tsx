import { createSupabaseServer } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Download, Printer, QrCode as QrCodeIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { QrCodeDisplay } from '@/components/qr/qr-display'

export default async function QRCodePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createSupabaseServer()

  const { data: school } = await supabase
    .from('schools_cache')
    .select('id, name, district')
    .eq('id', parseInt(id))
    .single()

  if (!school) notFound()

  // Build the URL that the QR code will encode
  const baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL
    ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
    : process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  const schoolUrl = `${baseUrl}/citizen/school/${school.id}`

  return (
    <div className="min-h-dvh bg-background flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm text-center">
        {/* Back button */}
        <div className="mb-8">
          <Link
            href={`/citizen/school/${school.id}`}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-[0.9rem]"
          >
            <ArrowLeft className="h-4 w-4" />
            Orqaga
          </Link>
        </div>

        {/* School info */}
        <div className="mb-6">
          <div className="h-12 w-12 mx-auto mb-3 rounded-xl bg-navy flex items-center justify-center">
            <QrCodeIcon className="h-6 w-6 text-teal-light" />
          </div>
          <h1
            className="text-[1.25rem] font-bold text-navy mb-1"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            {school.name}
          </h1>
          {school.district && (
            <p className="text-[0.85rem] text-muted-foreground">{school.district}</p>
          )}
        </div>

        {/* QR Code */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-border/50 mb-6">
          <QrCodeDisplay url={schoolUrl} schoolName={school.name} />
        </div>

        {/* URL display */}
        <p className="text-[0.72rem] text-muted-foreground mb-6 break-all px-4">
          {schoolUrl}
        </p>

        {/* Action buttons */}
        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full h-12 rounded-xl gap-2 text-[0.9rem]"
            onClick={() => {}}
            id="print-btn"
          >
            <Printer className="h-4 w-4" />
            Chop etish
          </Button>
        </div>

        {/* Instructions */}
        <div className="mt-8 text-left bg-muted/50 rounded-xl p-4">
          <p className="text-[0.78rem] font-medium text-foreground mb-2">QR kodni qanday ishlatish:</p>
          <ol className="text-[0.75rem] text-muted-foreground space-y-1.5 list-decimal list-inside">
            <li>QR kodni chop eting</li>
            <li>Maktab devoriga yopishtiring</li>
            <li>Fuqarolar telefon bilan skanerlaydi</li>
            <li>Maktab sahifasi ochiladi</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
