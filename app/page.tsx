'use client'

import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'
import { ArrowRight, BarChart3, Landmark, User } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

function AnimatedNumber({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (!isInView) return
    let start = 0
    const duration = 1600
    const increment = target / (duration / 16)
    const timer = setInterval(() => {
      start += increment
      if (start >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 16)
    return () => clearInterval(timer)
  }, [isInView, target])

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  )
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
}

export default function Home() {
  return (
    <div className="min-h-dvh bg-background relative overflow-hidden">
      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 md:px-12 lg:px-20">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-navy flex items-center justify-center">
            <span className="text-teal-light font-bold text-sm" style={{ fontFamily: 'var(--font-heading)' }}>R</span>
          </div>
          <span
            className="text-xl font-bold tracking-tight text-navy"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Real Holat
          </span>
        </div>
        <Button
          className="rounded-xl bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy-light"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          <Link href="/auth/login" className="flex items-center gap-2">
            Kirish
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </nav>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-start px-6 pt-16 pb-12 md:px-12 md:pt-24 lg:px-20 lg:pt-32">
        <motion.h1
          initial="hidden"
          animate="visible"
          custom={0}
          variants={fadeUp}
          className="max-w-3xl text-[2.5rem] leading-[1.1] font-extrabold tracking-tight text-navy md:text-[3.5rem] lg:text-[4.25rem]"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Maktablar nazorati —{' '}
          <span className="text-teal">fuqarolar qo&apos;lida</span>
        </motion.h1>

        <motion.p
          initial="hidden"
          animate="visible"
          custom={1}
          variants={fadeUp}
          className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground md:text-xl"
        >
          Davlat va&apos;dalarini tekshiring. Haqiqiy holatni ko&apos;ring.
          Shaffoflikni ta&apos;minlang.
        </motion.p>

        {/* Stats Row */}
        <motion.div
          initial="hidden"
          animate="visible"
          custom={2}
          variants={fadeUp}
          className="mt-10 flex flex-wrap gap-8 md:gap-12"
        >
          {[
            { value: 800, suffix: '+', label: 'maktab' },
            { value: 1400, suffix: '+', label: "tekshiruv" },
            { value: 12, suffix: '', label: 'tuman' },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col">
              <span
                className="text-3xl font-extrabold text-navy md:text-4xl"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                <AnimatedNumber target={stat.value} suffix={stat.suffix} />
              </span>
              <span className="mt-1 text-sm font-medium text-muted-foreground uppercase tracking-wider">
                {stat.label}
              </span>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Entry Cards - simple CSS animation instead of per-card Framer Motion */}
      <section className="relative z-10 px-6 pb-20 md:px-12 lg:px-20">
        <div className="grid gap-4 md:grid-cols-3 md:gap-6 max-w-4xl">
          {[
            {
              icon: <User className="h-5 w-5" />,
              title: 'Fuqaro',
              description: 'Maktabni tekshiring',
              href: '/auth/login?role=citizen',
              borderColor: 'border-l-teal',
              iconBg: 'bg-teal/10 text-teal',
            },
            {
              icon: <Landmark className="h-5 w-5" />,
              title: 'Davlat',
              description: 'Hisobotlarni ko\'ring',
              href: '/auth/login?role=government',
              borderColor: 'border-l-amber',
              iconBg: 'bg-amber/10 text-amber',
            },
            {
              icon: <BarChart3 className="h-5 w-5" />,
              title: 'Jamoatchilik',
              description: 'Ochiq dashboard',
              href: '/dashboard',
              borderColor: 'border-l-emerald',
              iconBg: 'bg-emerald/10 text-emerald',
            },
          ].map((card, i) => (
            <div
              key={card.title}
              className="animate-in fade-in slide-in-from-bottom-4"
              style={{ animationDelay: `${300 + i * 100}ms`, animationFillMode: 'both' }}
            >
              <Link
                href={card.href}
                className={`glass-card group flex flex-col gap-4 rounded-2xl border-l-4 ${card.borderColor} p-6 transition-all duration-300 hover:-translate-y-1`}
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.iconBg}`}>
                  {card.icon}
                </div>
                <div>
                  <h3
                    className="text-lg font-bold text-navy"
                    style={{ fontFamily: 'var(--font-heading)' }}
                  >
                    {card.title}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {card.description}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-sm font-semibold text-teal transition-all group-hover:gap-2">
                  Ochish
                  <ArrowRight className="h-4 w-4" />
                </div>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 pb-8 md:px-12 lg:px-20">
        <div className="border-t border-border pt-6">
          <p className="text-xs text-muted-foreground">
            Real Holat &copy; 2026. Hackathon loyihasi.
          </p>
        </div>
      </footer>

      {/* Decorative gradient orb */}
      <div className="pointer-events-none absolute -top-40 right-0 h-[600px] w-[600px] rounded-full bg-teal opacity-[0.04] blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-60 -left-40 h-[500px] w-[500px] rounded-full bg-amber opacity-[0.05] blur-[100px]" />
    </div>
  )
}
