import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function SourceEffectivenessChart({ data }) {
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          <p className="text-sm text-gray-600">Applications: {item.applications}</p>
          <p className="text-sm text-gray-600">Hires: {item.hires}</p>
          <p className="text-sm font-semibold text-green-600">Conversion: {item.conversionRate}%</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Source Effectiveness</h3>
        <p className="text-sm text-gray-600 mt-1">Application sources and their conversion rates</p>
      </div>
      
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="source" stroke="#6b7280" tick={{ fontSize: 12 }} />
          <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar dataKey="applications" fill="#3b82f6" radius={[8, 8, 0, 0]} name="Applications" />
          <Bar dataKey="hires" fill="#10b981" radius={[8, 8, 0, 0]} name="Hires" />
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.map((source, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-700">{source.source}</p>
                <p className="text-xs text-gray-500">{source.applications} applications</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-green-600">{source.conversionRate}%</p>
                <p className="text-xs text-gray-500">{source.hires} hires</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

