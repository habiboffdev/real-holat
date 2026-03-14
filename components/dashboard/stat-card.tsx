'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

interface StatCardProps {
  label: string
  value: number
  suffix?: string
  size?: 'hero' | 'default'
}

export function StatCard({ label, value, suffix, size = 'default' }: StatCardProps) {
  const [displayed, setDisplayed] = useState(0)
  const hasAnimated = useRef(false)

  useEffect(() => {
    if (hasAnimated.current) return
    hasAnimated.current = true
    const duration = 800
    let start: number | null = null
    function step(ts: number) {
      if (!start) start = ts
      const t = Math.min((ts - start) / duration, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      setDisplayed(Math.round(eased * value))
      if (t < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [value])

  if (size === 'hero') {
    return (
      <div>
        <div className="flex items-baseline gap-1">
          <span
            className="text-[3.5rem] font-bold tracking-tight text-foreground leading-none"
            style={{ fontFamily: 'var(--font-heading)', fontVariantNumeric: 'tabular-nums' }}
          >
            {displayed.toLocaleString()}
          </span>
          {suffix && (
            <span className="text-[2rem] font-semibold text-muted-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
              {suffix}
            </span>
          )}
        </div>
        <p className="mt-1 text-[0.85rem] text-muted-foreground">{label}</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-baseline gap-0.5">
        <span
          className="text-[1.75rem] font-bold tracking-tight text-foreground leading-none"
          style={{ fontFamily: 'var(--font-heading)', fontVariantNumeric: 'tabular-nums' }}
        >
          {displayed.toLocaleString()}
        </span>
        {suffix && (
          <span className="text-[1rem] font-semibold text-muted-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
            {suffix}
          </span>
        )}
      </div>
      <p className="mt-0.5 text-[0.78rem] text-muted-foreground">{label}</p>
    </div>
  )
}
