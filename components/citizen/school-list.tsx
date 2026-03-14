'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, ChevronRight } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
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
  const [isSearchActive, setIsSearchActive] = useState(false)

  const filtered = schools.filter((s) => {
    if (query && !s.name.toLowerCase().includes(query.toLowerCase())) return false
    if (activeFilter === 'all') return true
    return s.health === activeFilter
  })

  // Escape key to close search
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsSearchActive(false)
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [])

  return (
    <>
      {/* 
        =========================================
        DEFAULT VIEW (Inside Bottom Sheet)
        =========================================
      */}
      <div className={`space-y-1 ${isSearchActive ? 'opacity-0 pointer-events-none absolute' : 'opacity-100 relative'}`}>
        {/* Fake Search bar trigger */}
        <div className="relative mb-5" onClick={() => setIsSearchActive(true)}>
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/40" />
          <div className="w-full flex items-center h-13 rounded-2xl pl-12 pr-4 text-[0.95rem] bg-white/70 backdrop-blur-sm border-2 border-border/50 text-muted-foreground/60 transition-all duration-200 cursor-pointer hover:bg-white active:scale-[0.98]">
            {UZ.browse_search}
          </div>
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 overflow-x-auto py-3 no-scrollbar mt-2">
          {filters.map((f) => (
            <Badge
              key={f.key}
              variant={activeFilter === f.key ? 'default' : 'outline'}
              className={`cursor-pointer rounded-full px-4.5 py-2.5 text-[0.8rem] font-semibold transition-all duration-200 shrink-0 gap-2 h-auto active:scale-95 ${
                activeFilter === f.key
                  ? 'bg-navy text-white shadow-[0_2px_8px_rgba(12,27,46,0.2)] border-navy'
                  : 'bg-white/80 text-muted-foreground border-border/60 hover:border-navy/20 hover:bg-white'
              }`}
              onClick={() => setActiveFilter(f.key)}
            >
              {f.dotClass && (
                <span
                  className={`w-2.5 h-2.5 rounded-full ${f.dotClass} ${
                    activeFilter === f.key ? 'opacity-80' : ''
                  }`}
                />
              )}
              {f.label}
            </Badge>
          ))}
        </div>

        {/* School rows - simple CSS animation instead of Framer stagger */}
        {filtered.length > 0 ? (
          <div className="space-y-0.5 mt-2 transition-all">
            {filtered.map((school, index) => (
              <div
                key={school.id}
                className="animate-in fade-in slide-in-from-bottom-1"
                style={{ animationDelay: `${Math.min(index * 30, 300)}ms`, animationFillMode: 'both' }}
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
              </div>
            ))}
          </div>
        ) : (
          <Card className="glass-card rounded-2xl py-14 text-center mt-2">
            <p className="text-muted-foreground text-[0.9rem]">
              Natija topilmadi
            </p>
          </Card>
        )}
      </div>

      {/* 
        =========================================
        SPOTLIGHT FULL SCREEN OVERLAY
        =========================================
      */}
      {isSearchActive && (
        <div className="fixed inset-0 z-[200] bg-white/95 backdrop-blur-2xl flex flex-col pt-[max(env(safe-area-inset-top),16px)] animate-in fade-in duration-200">
          
          {/* Top Search Header */}
          <div className="flex items-center gap-3 px-4 pb-4 border-b border-border/40">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-teal" />
              <Input
                autoFocus
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={UZ.browse_search}
                className="w-full h-13 rounded-xl pl-11 pr-4 text-[1rem] bg-muted/30 border-transparent focus-visible:border-teal/30 focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-teal/10 transition-all"
              />
            </div>
            <button 
              onClick={() => {
                setIsSearchActive(false)
                setQuery('')
              }}
              className="text-navy font-semibold text-[0.95rem] px-2 active:opacity-70 transition-opacity whitespace-nowrap"
            >
              Bekor qilish
            </button>
          </div>

          {/* Search Results */}
          <div className="flex-1 overflow-y-auto px-4 py-2">
            {!query && (
              <div className="py-8 text-center animate-in slide-in-from-bottom-2">
                <p className="text-muted-foreground font-medium mb-1">Qidiruvni boshlang</p>
                <p className="text-[0.8rem] text-muted-foreground/60">Maktab raqami yoki tuman nomini kiriting</p>
              </div>
            )}

            {query && filtered.length > 0 && (
              <div className="space-y-0.5 animate-in fade-in">
                {filtered.map((school) => (
                  <Link
                    key={`search-${school.id}`}
                    href={`/citizen/school/${school.id}`}
                    onClick={() => setIsSearchActive(false)}
                    className="flex items-center gap-3.5 py-3.5 px-2 rounded-xl transition-colors hover:bg-muted/50 group"
                  >
                    <div className="h-10 w-10 shrink-0 rounded-full bg-muted/50 flex items-center justify-center">
                      <Search className="h-4 w-4 text-muted-foreground/50" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[0.95rem] font-semibold text-foreground truncate">
                        {school.name}
                      </p>
                      {school.district && (
                        <p className="text-[0.8rem] text-muted-foreground truncate">
                          {school.district}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {query && filtered.length === 0 && (
              <div className="py-12 text-center animate-in fade-in">
                <p className="text-[0.95rem] font-medium text-navy">Hech narsa topilmadi</p>
                <p className="text-[0.8rem] text-muted-foreground mt-1">Boshqa so'z bilan izlab ko'ring</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
