'use client'

import { useState } from 'react'
import { InteractiveSchoolMap } from './interactive-map'
import { BottomSheet } from '@/components/ui/bottom-sheet'
import { SchoolList, type SchoolWithHealth } from './school-list'
import { SchoolDetail } from './school-detail'
import { Layers, MapPin, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CitizenHomeClientProps {
  schools: SchoolWithHealth[]
  promisesBySchool: Record<number, any[]>
  inspectionsBySchool: Record<number, any[]>
}

export function CitizenHomeClient({ schools, promisesBySchool, inspectionsBySchool }: CitizenHomeClientProps) {
  const [selectedSchool, setSelectedSchool] = useState<SchoolWithHealth | null>(null)
  const [heatmapMode, setHeatmapMode] = useState(false)
  
  // Sheet state:
  // When no school is selected, sheet shows the list of schools (snaps to ~40% or 85%)
  // When a school is selected, sheet shows the detail view (snaps to 40% or 85%)
  const [sheetOpen, setSheetOpen] = useState(true)

  const handleSchoolClick = (school: SchoolWithHealth) => {
    setSelectedSchool(school)
    setSheetOpen(true)
  }

  const handleCloseSheet = () => {
    if (selectedSchool) {
      // If closing detail view, go back to list view
      setSelectedSchool(null)
      // Don't fully close, keep the list peek visible
    } else {
      // If closing list view, let it minimize to the bottom search bar
      setSheetOpen(false)
    }
  }

  return (
    <div className="relative h-[100dvh] w-full bg-background overflow-hidden">
      {/* 1. Full Screen Map Layer */}
      <div className="absolute inset-0 z-0">
        <InteractiveSchoolMap 
          schools={schools} 
          onSchoolClick={handleSchoolClick}
          heatmapMode={heatmapMode}
        />
      </div>

      {/* 2. Floating Top Right Controls (Heatmap Toggle) */}
      <div className="absolute top-[var(--safe-area-top,max(env(safe-area-inset-top),16px))] right-4 z-[100] flex flex-col items-end gap-3 pointer-events-none">
        {/* Heatmap Toggle */}
        <button 
          onClick={() => setHeatmapMode(!heatmapMode)}
          className={`h-12 w-12 rounded-2xl shadow-lg border flex items-center justify-center transition-all active:scale-95 pointer-events-auto ${
            heatmapMode 
              ? 'bg-navy border-navy text-white shadow-navy/20' 
              : 'bg-white/90 backdrop-blur-xl border-border/50 text-navy hover:bg-white'
          }`}
        >
          <Layers className="h-5 w-5" />
        </button>
      </div>

      {/* 3. Bottom Sheet Layer */}
      <BottomSheet 
        isOpen={sheetOpen} 
        onClose={handleCloseSheet}
        snapPoints={[0.4, 0.9]}
        defaultSnap={selectedSchool ? 0.9 : 0.4}
      >
        <div className="pb-24 pt-2"> {/* Fast padding for bottom nav */}
          {selectedSchool ? (
            // DETAIL VIEW (Slide-up context context)
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="mb-4 flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setSelectedSchool(null)}
                  className="rounded-full -ml-3 text-muted-foreground"
                >
                  &larr; Orqaga
                </Button>
              </div>
              <SchoolDetail 
                school={selectedSchool as any}
                promises={promisesBySchool[selectedSchool.id] || []}
                inspections={inspectionsBySchool[selectedSchool.id] || []}
                showInspectButtons={true}
              />
            </div>
          ) : (
            // BROWSE LIST VIEW
            <div className="animate-in fade-in slide-in-from-left-4 duration-300">
              <h2 
                className="text-[1.35rem] font-bold text-navy mb-4 tracking-tight"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                Yaqindagi maktablar
              </h2>
              <SchoolList schools={schools} />
            </div>
          )}
        </div>
      </BottomSheet>
      
      {/* 4. Bottom Nav spacing handled by layout, but sheet is absolute so we just pad its content */}
    </div>
  )
}
