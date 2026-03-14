'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { SchoolList, type SchoolWithHealth } from './school-list'
import { SchoolMap } from './school-map'
import { UZ } from '@/lib/constants/uzbek'

interface SchoolBrowseClientProps {
  schools: SchoolWithHealth[]
}

const tabs = [
  { key: 'list' as const, label: UZ.browse_list },
  { key: 'map' as const, label: UZ.browse_map },
]

export function SchoolBrowseClient({ schools }: SchoolBrowseClientProps) {
  const [activeTab, setActiveTab] = useState<'list' | 'map'>('list')

  return (
    <div className="space-y-5">
      {/* Custom segmented control */}
      <div className="bg-navy/5 rounded-2xl p-1.5 flex relative">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="flex-1 relative z-10 h-11 rounded-xl text-[0.88rem] font-semibold transition-colors duration-200"
            style={{
              color: activeTab === tab.key ? '#0c1b2e' : 'var(--muted-foreground)',
              fontFamily: 'var(--font-heading)',
            }}
          >
            {tab.label}
          </button>
        ))}

        {/* Sliding active indicator */}
        <motion.div
          className="absolute top-1.5 bottom-1.5 rounded-xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.04)]"
          animate={{
            left: activeTab === 'list' ? '6px' : '50%',
            right: activeTab === 'list' ? '50%' : '6px',
          }}
          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
        />
      </div>

      {/* Tab content */}
      {activeTab === 'list' && <SchoolList schools={schools} />}
      {activeTab === 'map' && <SchoolMap schools={schools} />}
    </div>
  )
}
