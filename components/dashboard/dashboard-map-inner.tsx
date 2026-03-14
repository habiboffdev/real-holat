'use client'

import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import Link from 'next/link'
import { type HealthStatus, getHealthLabel } from '@/lib/utils/health-score'

function healthFillColor(status: HealthStatus): string {
  switch (status) {
    case 'green': return '#10b981'
    case 'yellow': return '#f59e0b'
    case 'red': return '#f43f5e'
    case 'gray': return '#94a3b8'
  }
}

export interface DashboardSchool {
  id: number
  name: string
  district: string | null
  lat: number | null
  lng: number | null
  health: HealthStatus
  inspectionCount: number
  fulfillmentPct: number
}

interface DashboardMapInnerProps {
  schools: DashboardSchool[]
}

export function DashboardMapInner({ schools }: DashboardMapInnerProps) {
  const withCoords = schools.filter(s => s.lat != null && s.lng != null)

  return (
    <div className="relative">
      <MapContainer
        center={[41.2995, 69.2401]}
        zoom={11}
        className="h-[500px] rounded-2xl overflow-hidden"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {withCoords.map((school) => (
          <CircleMarker
            key={school.id}
            center={[school.lat!, school.lng!]}
            radius={10}
            fillColor={healthFillColor(school.health)}
            fillOpacity={0.85}
            stroke={true}
            color="white"
            weight={2}
          >
            <Popup>
              <div className="text-sm space-y-1 min-w-[160px]">
                <p className="font-bold text-[0.85rem]">{school.name}</p>
                {school.district && (
                  <p className="text-muted-foreground text-[0.75rem]">{school.district}</p>
                )}
                <div className="flex items-center gap-2 pt-1">
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: healthFillColor(school.health) }}
                  />
                  <span className="text-[0.75rem]">{getHealthLabel(school.health)}</span>
                </div>
                {school.inspectionCount > 0 && (
                  <p className="text-[0.75rem] text-muted-foreground">
                    {school.inspectionCount} tekshiruv · {school.fulfillmentPct}% bajarildi
                  </p>
                )}
                <Link
                  href={`/citizen/school/${school.id}`}
                  className="text-teal hover:underline text-[0.75rem] font-medium block pt-1"
                >
                  Batafsil &rarr;
                </Link>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>

      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-white/90 backdrop-blur-sm rounded-xl px-3.5 py-2.5 shadow-lg border border-border/50">
        <div className="flex items-center gap-3 text-[0.7rem]">
          {([
            { status: 'green' as HealthStatus, label: 'Yaxshi' },
            { status: 'yellow' as HealthStatus, label: 'Aralash' },
            { status: 'red' as HealthStatus, label: 'Muammoli' },
            { status: 'gray' as HealthStatus, label: 'Tekshirilmagan' },
          ]).map(item => (
            <div key={item.status} className="flex items-center gap-1">
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: healthFillColor(item.status) }}
              />
              <span className="text-muted-foreground">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
