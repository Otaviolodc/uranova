'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

interface StatsChartsProps {
  links: any[]
}

export default function StatsCharts({ links }: StatsChartsProps) {
  // Dados para gráfico de cliques por link
  const linkClickData = links
    .filter(link => link.clicks > 0)
    .map(link => ({
      name: link.title.length > 15 ? link.title.substring(0, 15) + '...' : link.title,
      clicks: link.clicks,
      fullName: link.title
    }))
    .sort((a, b) => b.clicks - a.clicks)

  // Dados para gráfico temporal (últimos 7 dias)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - i)
    return {
      date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
      clicks: Math.floor(Math.random() * 10) // Mock data - você pode substituir por dados reais
    }
  }).reverse()

  if (links.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Analytics</h3>
        <p className="text-gray-500 text-center py-8">No data available yet</p>
      </div>
    )
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-6">Analytics Dashboard</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de cliques por link */}
        <div className="h-80">
          <h4 className="text-sm font-medium mb-4 text-center">Clicks per Link</h4>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={linkClickData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
              <YAxis />
              <Tooltip 
                formatter={(value) => [`${value} clicks`, 'Clicks']}
                labelFormatter={(value, payload) => payload[0]?.payload.fullName || value}
              />
              <Bar dataKey="clicks" fill="#6366f1" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico temporal (últimos 7 dias) */}
        <div className="h-80">
          <h4 className="text-sm font-medium mb-4 text-center">Clicks Last 7 Days</h4>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={last7Days}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => [`${value} clicks`, 'Clicks']} />
              <Line type="monotone" dataKey="clicks" stroke="#6366f1" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Estatísticas detalhadas */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-gray-600">Top Performing Link</h4>
          <p className="text-lg font-semibold">
            {linkClickData[0]?.fullName || 'N/A'}
          </p>
          <p className="text-sm text-gray-500">
            {linkClickData[0]?.clicks || 0} clicks
          </p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-gray-600">Average Clicks/Link</h4>
          <p className="text-lg font-semibold">
            {links.length > 0 ? Math.round(linkClickData.reduce((sum, link) => sum + link.clicks, 0) / links.length) : 0}
          </p>
          <p className="text-sm text-gray-500">per link</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-gray-600">Conversion Rate</h4>
          <p className="text-lg font-semibold">
            {links.length > 0 ? Math.round((linkClickData.reduce((sum, link) => sum + link.clicks, 0) / links.length) * 100) : 0}%
          </p>
          <p className="text-sm text-gray-500">estimated</p>
        </div>
      </div>
    </div>
  )
}
