'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, ChevronRight } from 'lucide-react'
import { Input } from '@/components/ui/input'
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

export function SchoolList({ schools }: SchoolListProps) {
  const [query, setQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')

  const filtered = schools.filter((s) => {
    if (query && !s.name.toLowerCase().includes(query.toLowerCase())) return false
    if (activeFilter === 'all') return true
    return s.health === activeFilter
  })

  return (
    <div>
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground/50" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={UZ.browse_search}
          className="h-12 rounded-xl pl-10"
        />
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 overflow-x-auto py-3 no-scrollbar">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setActiveFilter(f.key)}
            className={`rounded-full px-4 py-2 text-[0.8rem] font-medium transition-colors shrink-0 inline-flex items-center gap-1.5 ${
              activeFilter === f.key
                ? 'bg-navy text-white'
                : 'bg-white text-muted-foreground border border-border'
            }`}
          >
            {f.dotClass && (
              <span className={`w-2 h-2 rounded-full ${f.dotClass}`} />
            )}
            {f.label}
          </button>
        ))}
      </div>

      {/* School rows */}
      {filtered.length > 0 ? (
        <div>
          {filtered.map((school) => (
            <Link
              key={school.id}
              href={`/citizen/school/${school.id}`}
              className="flex items-center gap-3 py-3.5 border-b border-border/50 min-h-[56px]"
            >
              <span className={`w-2.5 h-2.5 rounded-full ${getHealthColor(school.health)} shrink-0`} />
              <div className="flex-1 min-w-0">
                <p className="text-[0.95rem] font-medium truncate">{school.name}</p>
                {school.district && (
                  <p className="text-[0.8rem] text-muted-foreground truncate">{school.district}</p>
                )}
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground/40 shrink-0" />
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-center py-12 text-[0.9rem]">
          Natija topilmadi
        </p>
      )}
    </div>
  )
}
