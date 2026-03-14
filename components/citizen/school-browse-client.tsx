'use client'

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { SchoolList, type SchoolWithHealth } from './school-list'
import { SchoolMap } from './school-map'
import { UZ } from '@/lib/constants/uzbek'

interface SchoolBrowseClientProps {
  schools: SchoolWithHealth[]
}

export function SchoolBrowseClient({ schools }: SchoolBrowseClientProps) {
  return (
    <Tabs defaultValue="list">
      <TabsList className="w-full bg-navy/5 rounded-xl p-1">
        <TabsTrigger
          value="list"
          className="flex-1 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
        >
          {UZ.browse_list}
        </TabsTrigger>
        <TabsTrigger
          value="map"
          className="flex-1 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
        >
          {UZ.browse_map}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="list" className="mt-4">
        <SchoolList schools={schools} />
      </TabsContent>

      <TabsContent value="map" className="mt-4">
        <SchoolMap schools={schools} />
      </TabsContent>
    </Tabs>
  )
}
