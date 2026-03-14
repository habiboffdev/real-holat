'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Search, ChevronRight } from 'lucide-react'
import { UZ } from '@/lib/constants/uzbek'
import { getHealthColor, type HealthStatus } from '@/lib/utils/health-score'

export interface SchoolWithHealth {
  id: number
  name: string
  district: string | null
  lat?: number | null
  lng?: number | null
  health: HealthStatus
}

interface SchoolListProps {
  schools: SchoolWithHealth[]
}

type FilterType = 'all' | 'green' | 'red' | 'gray'

const filters: { key: FilterType; label: string; dotClass?: string }[] = [
  { key: 'all', label: UZ.browse_all },
  { key: 'green', label: UZ.browse_good, dotClass: 'bg-emerald' },
  { key: 'red', label: UZ.browse_problem, dotClass: 'bg-coral' },
  { key: 'gray', label: UZ.browse_unchecked, dotClass: 'bg-muted-foreground/30' },
]

function getHealthGlow(status: HealthStatus): string {
  switch (status) {
    case 'green':
      return 'shadow-[0_0_6px_rgba(16,185,129,0.4)]'
    case 'yellow':
      return 'shadow-[0_0_6px_rgba(245,158,11,0.4)]'
    case 'red':
      return 'shadow-[0_0_6px_rgba(244,63,94,0.4)]'
    case 'gray':
      return ''
  }
}

export function SchoolList({ schools }: SchoolListProps) {
  const [query, setQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')

  const filtered = schools.filter((s) => {
    if (query && !s.name.toLowerCase().includes(query.toLowerCase())) return false
    if (activeFilter === 'all') return true
    return s.health === activeFilter
  })

  return (
    <div className="space-y-1">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/40" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={UZ.browse_search}
          className="w-full h-13 rounded-2xl pl-12 pr-4 text-[0.95rem] bg-white/70 backdrop-blur-sm border-2 border-border/50 placeholder:text-muted-foreground/40 focus:outline-none focus:border-teal/40 focus:ring-4 focus:ring-teal/10 transition-all duration-200"
        />
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 overflow-x-auto py-3 no-scrollbar">
        {filters.map((f) => (
          <motion.button
            key={f.key}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveFilter(f.key)}
            className={`rounded-full px-4.5 py-2.5 text-[0.8rem] font-semibold transition-all duration-200 shrink-0 inline-flex items-center gap-2 ${
              activeFilter === f.key
                ? 'bg-navy text-white shadow-[0_2px_8px_rgba(12,27,46,0.2)]'
                : 'bg-white/80 text-muted-foreground border border-border/60 hover:border-navy/20 hover:bg-white'
            }`}
          >
            {f.dotClass && (
              <span
                className={`w-2.5 h-2.5 rounded-full ${f.dotClass} ${
                  activeFilter === f.key ? 'opacity-80' : ''
                }`}
              />
            )}
            {f.label}
          </motion.button>
        ))}
      </div>

      {/* School rows */}
      {filtered.length > 0 ? (
        <div className="space-y-0.5">
          {filtered.map((school, index) => (
            <motion.div
              key={school.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: Math.min(index * 0.03, 0.3),
                duration: 0.3,
              }}
            >
              <Link
                href={`/citizen/school/${school.id}`}
                className="flex items-center gap-3.5 py-4 px-1 rounded-xl transition-colors duration-150 hover:bg-navy/3 group min-h-[56px]"
              >
                <span
                  className={`w-3 h-3 rounded-full ${getHealthColor(school.health)} ${getHealthGlow(school.health)} shrink-0`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-[0.95rem] font-semibold text-foreground truncate group-hover:text-navy transition-colors">
                    {school.name}
                  </p>
                  {school.district && (
                    <p className="text-[0.78rem] text-muted-foreground truncate mt-0.5">
                      {school.district}
                    </p>
                  )}
                </div>
                <ChevronRight className="h-4.5 w-4.5 text-muted-foreground/30 shrink-0 group-hover:text-navy/50 group-hover:translate-x-0.5 transition-all duration-200" />
              </Link>
              {/* Separator */}
              {index < filtered.length - 1 && (
                <div className="ml-7 h-px bg-border/40" />
              )}
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card rounded-2xl py-14 text-center"
        >
          <p className="text-muted-foreground text-[0.9rem]">
            Natija topilmadi
          </p>
        </motion.div>
      )}
    </div>
  )
}
