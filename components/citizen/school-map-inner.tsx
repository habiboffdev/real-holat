'use client'

import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import Link from 'next/link'
import { getHealthLabel, type HealthStatus } from '@/lib/utils/health-score'
import type { SchoolWithHealth } from './school-list'
import { UZ } from '@/lib/constants/uzbek'

function healthFillColor(status: HealthStatus): string {
  switch (status) {
    case 'green': return '#10b981'
    case 'yellow': return '#f59e0b'
    case 'red': return '#f43f5e'
    case 'gray': return '#94a3b8'
  }
}

interface SchoolMapInnerProps {
  schools: SchoolWithHealth[]
}

export function SchoolMapInner({ schools }: SchoolMapInnerProps) {
  const withCoords = schools.filter(
    (s) => s.lat != null && s.lng != null
  )

  return (
    <MapContainer
      center={[41.2995, 69.2401]}
      zoom={11}
      className="h-[65vh] rounded-2xl overflow-hidden"
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
          radius={8}
          fillColor={healthFillColor(school.health)}
          fillOpacity={0.8}
          stroke={true}
          color="white"
          weight={2}
        >
          <Popup>
            <div className="text-sm space-y-1">
              <p className="font-bold">{school.name}</p>
              <p>{getHealthLabel(school.health)}</p>
              <Link
                href={`/citizen/school/${school.id}`}
                className="text-teal hover:underline"
              >
                {UZ.browse_detail} &rarr;
              </Link>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  )
}
