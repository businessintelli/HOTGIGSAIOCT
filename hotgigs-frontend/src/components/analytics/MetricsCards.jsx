import { TrendingUp, TrendingDown, Users, Clock, DollarSign, CheckCircle, Target } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default function MetricsCards({ metrics }) {
  const cards = [
    {
      title: 'Total Applications',
      value: metrics.totalApplications,
      change: metrics.applicationsGrowth,
      changeLabel: 'vs last week',
      icon: Users,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Avg Time to Hire',
      value: `${metrics.avgTimeToHire} days`,
      icon: Clock,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600'
    },
    {
      title: 'Offer Acceptance',
      value: `${metrics.offerAcceptanceRate}%`,
      icon: CheckCircle,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600'
    },
    {
      title: 'Quality of Hire',
      value: `${metrics.qualityOfHire}/5.0`,
      icon: Target,
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600'
    },
    {
      title: 'Cost Per Hire',
      value: `$${metrics.costPerHire.toLocaleString()}`,
      icon: DollarSign,
      iconBg: 'bg-indigo-100',
      iconColor: 'text-indigo-600'
    },
    {
      title: 'This Week',
      value: metrics.applicationsThisWeek,
      change: ((metrics.applicationsThisWeek - metrics.applicationsLastWeek) / metrics.applicationsLastWeek * 100).toFixed(1),
      changeLabel: 'vs last week',
      icon: TrendingUp,
      iconBg: 'bg-teal-100',
      iconColor: 'text-teal-600'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon
        const isPositive = card.change > 0
        const TrendIcon = isPositive ? TrendingUp : TrendingDown

        return (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-1">{card.title}</p>
                <p className="text-3xl font-bold text-gray-900">{card.value}</p>
              </div>
              <div className={`h-12 w-12 ${card.iconBg} rounded-lg flex items-center justify-center`}>
                <Icon className={`h-6 w-6 ${card.iconColor}`} />
              </div>
            </div>
            
            {card.change !== undefined && (
              <div className="flex items-center gap-2">
                <Badge className={`${isPositive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} flex items-center gap-1`}>
                  <TrendIcon className="h-3 w-3" />
                  {Math.abs(card.change)}%
                </Badge>
                <span className="text-xs text-gray-500">{card.changeLabel}</span>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

