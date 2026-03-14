'use client'

import { SchoolList, type SchoolWithHealth } from './school-list'
import { SchoolMap } from './school-map'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { UZ } from '@/lib/constants/uzbek'

interface SchoolBrowseClientProps {
  schools: SchoolWithHealth[]
}

export function SchoolBrowseClient({ schools }: SchoolBrowseClientProps) {
  return (
    <Tabs defaultValue="list" className="space-y-5">
      <TabsList className="w-full rounded-2xl h-11">
        <TabsTrigger
          value="list"
          className="rounded-xl text-[0.88rem] font-semibold"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          {UZ.browse_list}
        </TabsTrigger>
        <TabsTrigger
          value="map"
          className="rounded-xl text-[0.88rem] font-semibold"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          {UZ.browse_map}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="list">
        <SchoolList schools={schools} />
      </TabsContent>
      <TabsContent value="map">
        <SchoolMap schools={schools} />
      </TabsContent>
    </Tabs>
  )
}
