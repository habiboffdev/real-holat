'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Card, CardContent } from '@/components/ui/card'

interface StatCardProps {
  label: string
  value: number
  icon: ReactNode
  color: string
  suffix?: string
}

export function StatCard({ label, value, icon, color, suffix }: StatCardProps) {
  const [displayed, setDisplayed] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const hasAnimated = useRef(false)

  useEffect(() => {
    if (hasAnimated.current) return
    hasAnimated.current = true

    const duration = 1000
    let start: number | null = null

    function step(timestamp: number) {
      if (!start) start = timestamp
      const elapsed = timestamp - start
      const progress = Math.min(elapsed / duration, 1)
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayed(Math.round(eased * value))
      if (progress < 1) {
        requestAnimationFrame(step)
      }
    }

    requestAnimationFrame(step)
  }, [value])

  return (
    <Card className="relative overflow-hidden" ref={ref}>
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ backgroundColor: color }}
      />
      <CardContent className="pt-4">
        <div
          className="mb-3 flex h-9 w-9 items-center justify-center rounded-full"
          style={{ backgroundColor: `${color}18` }}
        >
          <div style={{ color }} className="flex items-center justify-center [&>svg]:h-4 [&>svg]:w-4">
            {icon}
          </div>
        </div>
        <div
          className="text-3xl font-bold tracking-tight font-mono"
          style={{ fontFamily: 'var(--font-heading), var(--font-mono)' }}
        >
          {displayed.toLocaleString()}
          {suffix && <span className="text-xl ml-0.5">{suffix}</span>}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  )
}
