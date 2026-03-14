'use client'

import { QRCodeSVG } from 'qrcode.react'

interface QrCodeDisplayProps {
  url: string
  schoolName: string
}

export function QrCodeDisplay({ url, schoolName }: QrCodeDisplayProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      <QRCodeSVG
        value={url}
        size={220}
        level="M"
        includeMargin={false}
        bgColor="#ffffff"
        fgColor="#0c1b2e"
      />
      <p
        className="text-[0.75rem] text-muted-foreground"
        style={{ fontFamily: 'var(--font-heading)' }}
      >
        {schoolName}
      </p>
    </div>
  )
}
