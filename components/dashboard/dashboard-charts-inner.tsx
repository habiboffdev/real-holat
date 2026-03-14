'use client'

import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent } from '@/components/ui/card'

interface ChartsProps {
  statusData: { name: string; value: number; color: string }[]
  categoryData: { name: string; count: number }[]
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Kutilmoqda',
  fulfilled: 'Bajarildi',
  problematic: 'Muammoli',
  in_progress: 'Jarayonda',
}

const CATEGORY_LABELS: Record<string, string> = {
  toilet_repair: 'Hojatxona ta\'miri',
  soap_dispensers: 'Sovun idishlari',
  new_desks: 'Yangi partalar',
  cafeteria: 'Oshxona',
  sports_hall: 'Sport zali',
  renovation: 'Ta\'mirlash',
}

export default function DashboardChartsInner({ statusData, categoryData }: ChartsProps) {
  const sortedCategories = [...categoryData].sort((a, b) => b.count - a.count)

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Donut chart - promise status */}
      <Card>
        <CardContent className="pt-4">
          <h3
            className="mb-4 text-lg font-semibold"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Va&apos;dalar holati
          </h3>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                  nameKey="name"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [
                    value,
                    STATUS_LABELS[name as string] || name,
                  ]}
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid rgba(0,0,0,0.1)',
                    fontSize: '14px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Legend */}
          <div className="mt-2 flex flex-wrap justify-center gap-4">
            {statusData.map((entry) => (
              <div key={entry.name} className="flex items-center gap-1.5 text-sm">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-muted-foreground">
                  {STATUS_LABELS[entry.name] || entry.name}
                </span>
                <span className="font-medium">{entry.value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bar chart - categories */}
      <Card>
        <CardContent className="pt-4">
          <h3
            className="mb-4 text-lg font-semibold"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Kategoriya bo&apos;yicha
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={sortedCategories}
                layout="vertical"
                margin={{ top: 0, right: 20, bottom: 0, left: 10 }}
              >
                <XAxis type="number" hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={120}
                  tick={{ fontSize: 13 }}
                  tickFormatter={(val: string) => CATEGORY_LABELS[val] || val}
                />
                <Tooltip
                  formatter={(value) => [value, 'Soni']}
                  labelFormatter={(label) => CATEGORY_LABELS[label as string] || label}
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid rgba(0,0,0,0.1)',
                    fontSize: '14px',
                  }}
                />
                <Bar
                  dataKey="count"
                  fill="#06b6d4"
                  radius={[0, 6, 6, 0]}
                  barSize={24}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
