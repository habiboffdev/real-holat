'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Home, MapPin, BarChart3, User } from 'lucide-react'
import { UZ } from '@/lib/constants/uzbek'

const tabs = [
  { label: UZ.nav_home, icon: Home, path: '/citizen', exact: true },
  { label: UZ.nav_map, icon: MapPin, path: '/citizen/map', exact: false },
  { label: UZ.nav_report, icon: BarChart3, path: '/dashboard', exact: false },
  { label: UZ.nav_profile, icon: User, path: '/citizen/profile', exact: false },
] as const

export function BottomNav() {
  const pathname = usePathname()

  function isActive(tab: (typeof tabs)[number]) {
    if (tab.exact) return pathname === tab.path
    return pathname.startsWith(tab.path)
  }

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 pb-[env(safe-area-inset-bottom)]">
      {/* Top gradient fade for depth */}
      <div className="absolute -top-6 inset-x-0 h-6 bg-gradient-to-t from-white/80 to-transparent pointer-events-none" />

      <div className="bg-white/85 backdrop-blur-2xl border-t border-border/40 shadow-[0_-1px_3px_rgba(0,0,0,0.04)]">
        <div className="flex h-[68px] items-stretch max-w-lg mx-auto">
          {tabs.map((tab) => {
            const active = isActive(tab)
            const Icon = tab.icon

            return (
              <Link
                key={tab.path}
                href={tab.path}
                className="flex flex-col items-center justify-center gap-1 flex-1 relative"
              >
                {/* Active background pill */}
                {active && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-x-3 top-2 bottom-2 bg-teal/8 rounded-xl"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}

                <div className="relative z-10 flex flex-col items-center gap-1">
                  <motion.div
                    animate={{
                      scale: active ? 1 : 1,
                      y: active ? -1 : 0,
                    }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  >
                    <Icon
                      className={`h-6 w-6 transition-colors duration-200 ${
                        active ? 'text-teal' : 'text-muted-foreground/50'
                      }`}
                      strokeWidth={active ? 2.2 : 1.6}
                    />
                  </motion.div>
                  <span
                    className={`text-[0.6rem] font-semibold leading-none tracking-wide transition-colors duration-200 ${
                      active ? 'text-teal' : 'text-muted-foreground/50'
                    }`}
                  >
                    {tab.label}
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
