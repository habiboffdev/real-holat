'use client'

import { MapContainer, TileLayer, CircleMarker, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect } from 'react'
import Link from 'next/link'
import { getHealthLabel, type HealthStatus } from '@/lib/utils/health-score'
import type { SchoolWithHealth } from './school-list'
import { LocateFixed, Layers } from 'lucide-react'
import L from 'leaflet'

function healthFillColor(status: HealthStatus): string {
  switch (status) {
    case 'green': return '#10b981'
    case 'yellow': return '#f59e0b'
    case 'red': return '#f43f5e'
    case 'gray': return '#94a3b8'
  }
}

interface InteractiveSchoolMapProps {
  schools: SchoolWithHealth[]
  onSchoolClick: (school: SchoolWithHealth) => void
  heatmapMode?: boolean
}

// Controller component to move the map
function MapController({ center }: { center: [number, number] | null }) {
  const map = useMap()
  useEffect(() => {
    if (center) {
      map.flyTo(center, 14, { duration: 1.5 })
    }
  }, [center, map])
  return null
}

export function InteractiveSchoolMap({ schools, onSchoolClick, heatmapMode = false }: InteractiveSchoolMapProps) {
  const withCoords = schools.filter((s) => s.lat != null && s.lng != null)

  return (
    <div className="relative h-[100dvh] w-full">
      <MapContainer
        center={[41.2995, 69.2401]}
        zoom={heatmapMode ? 12 : 13}
        className="h-full w-full"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; OSM'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          className={heatmapMode ? "grayscale opacity-80" : ""}
        />

        {withCoords.map((school) => {
          const color = healthFillColor(school.health)
          
          if (heatmapMode) {
            // Render blurred, large circles for heatmap effect
            return (
              <CircleMarker
                key={`heat-${school.id}`}
                center={[school.lat!, school.lng!]}
                radius={25}
                fillColor={color}
                fillOpacity={0.15}
                stroke={false}
              />
            )
          }

          // Crisp UI markers for default mode
          return (
            <CircleMarker
              key={school.id}
              center={[school.lat!, school.lng!]}
              radius={heatmapMode ? 20 : 9}
              fillColor={color}
              fillOpacity={1}
              stroke={true}
              color="white"
              weight={2.5}
              eventHandlers={{
                click: () => onSchoolClick(school)
              }}
              // Add a subtle drop shadow to markers
              pathOptions={{ className: 'drop-shadow-sm' }}
            />
          )
        })}
      </MapContainer>

      {/* Map Controls overlaid */}
      <div className="absolute top-[var(--safe-area-top,max(env(safe-area-inset-top),20px))] right-4 z-[1000] flex flex-col gap-3">
        {/* Locate me */}
        <button className="h-11 w-11 rounded-full bg-white/90 backdrop-blur-md shadow-lg border border-border/50 flex items-center justify-center text-navy hover:bg-white active:scale-95 transition-all">
          <LocateFixed className="h-5 w-5" />
        </button>

        {/* Report New Problem FAB */}
        <Link 
          href="/citizen/report"
          className="h-14 w-14 rounded-full bg-coral text-white shadow-[0_4px_20px_rgba(244,63,94,0.4)] flex items-center justify-center hover:bg-coral/90 active:scale-95 transition-all mt-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14"/>
            <path d="M5 12h14"/>
          </svg>
        </Link>
      </div>

      {/* Map Legend */}
      {!heatmapMode && (
        <div className="absolute top-[var(--safe-area-top,max(env(safe-area-inset-top),84px))] left-4 z-[1000] pointer-events-none">
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-3 shadow-lg border border-border/50 pointer-events-auto flex flex-col gap-2.5">
            <span className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground ml-1" style={{ fontFamily: 'var(--font-heading)' }}>Xarita bo'yicha</span>
            <div className="flex flex-col gap-2 text-[0.8rem] font-medium text-navy">
              <div className="flex items-center gap-2.5">
                <span className="w-3.5 h-3.5 rounded-full bg-emerald shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                <span>Yaxshi</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-3.5 h-3.5 rounded-full bg-amber shadow-[0_0_8px_rgba(245,158,11,0.4)]" />
                <span>Aralash</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-3.5 h-3.5 rounded-full bg-coral shadow-[0_0_8px_rgba(244,63,94,0.4)]" />
                <span>Muammoli</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        /* Remove default Leaflet focus outline */
        .leaflet-container {
          outline: none !important;
        }
      `}</style>
    </div>
  )
}
