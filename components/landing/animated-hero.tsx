'use client'

import { motion, useInView } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'

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
      {count.toLocaleString()}
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

interface AnimatedLandingHeroProps {
  stats: { value: number; suffix: string; label: string }[]
}

export function AnimatedLandingHero({ stats }: AnimatedLandingHeroProps) {
  return (
    <section className="relative z-10 flex flex-col items-start px-6 pt-12 pb-12 md:px-12 md:pt-20 lg:px-20 lg:pt-28">
      <motion.h1
        initial="hidden"
        animate="visible"
        custom={0}
        variants={fadeUp}
        className="max-w-3xl text-[2.25rem] leading-[1.1] font-extrabold tracking-tight text-navy md:text-[3.25rem] lg:text-[4rem]"
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
        className="mt-5 max-w-xl text-[1rem] leading-relaxed text-muted-foreground md:text-[1.1rem]"
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
        className="mt-8 flex flex-wrap gap-8 md:gap-12"
      >
        {stats.map((stat) => (
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
  )
}
