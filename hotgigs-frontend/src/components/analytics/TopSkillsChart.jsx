import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

export default function TopSkillsChart({ data }) {
  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />
      default:
        return <Minus className="h-4 w-4 text-gray-400" />
    }
  }

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'up':
        return '#10b981'
      case 'down':
        return '#ef4444'
      default:
        return '#6b7280'
    }
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{payload[0].payload.skill}</p>
          <p className="text-sm text-gray-600">Demand: {payload[0].value} jobs</p>
          <p className="text-sm text-gray-600 capitalize">Trend: {payload[0].payload.trend}</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Top Skills in Demand</h3>
        <p className="text-sm text-gray-600 mt-1">Most requested skills across all job postings</p>
      </div>
      
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={data} layout="horizontal" margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="skill" stroke="#6b7280" tick={{ fontSize: 12 }} />
          <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="count" radius={[8, 8, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getTrendColor(entry.trend)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
        {data.map((skill, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              {getTrendIcon(skill.trend)}
              <span className="text-sm font-medium text-gray-700">{skill.skill}</span>
            </div>
            <span className="text-sm font-bold text-gray-900">{skill.count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

