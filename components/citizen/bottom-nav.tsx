'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
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
    <nav className="fixed bottom-0 inset-x-0 z-50 bg-white/80 backdrop-blur-2xl border-t border-border/50 pb-[env(safe-area-inset-bottom)]">
      <div className="flex h-16 items-stretch">
        {tabs.map((tab) => {
          const active = isActive(tab)
          const Icon = tab.icon

          return (
            <Link
              key={tab.path}
              href={tab.path}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 transition-colors duration-200 ${
                active ? 'text-teal' : 'text-muted-foreground/60'
              }`}
            >
              {/* Active dot indicator */}
              <span
                className={`h-[3px] w-[3px] rounded-full mb-0.5 transition-opacity duration-200 ${
                  active ? 'bg-teal opacity-100' : 'opacity-0'
                }`}
              />
              <Icon className="h-[22px] w-[22px]" strokeWidth={active ? 2.2 : 1.8} />
              <span className="text-[0.6rem] font-medium leading-none">{tab.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
