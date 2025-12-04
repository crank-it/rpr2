'use client'

import { DollarSign, TrendingUp, Target, BarChart3, ArrowUp, ArrowDown, LineChart, Users, Calendar, Download, Mail, Settings } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

export default function ReportsPage() {
  const [timeframe, setTimeframe] = useState('30d')

  const stats = [
    {
      title: 'Total Revenue',
      value: '$47,382',
      change: '+12.3%',
      period: 'vs last month',
      icon: DollarSign,
      trend: 'up' as const
    },
    {
      title: 'Site Traffic',
      value: '23.4K',
      change: '+8.7%',
      period: 'sessions',
      icon: TrendingUp,
      trend: 'up' as const
    },
    {
      title: 'Conversion Rate',
      value: '3.42%',
      change: '+0.3%',
      period: 'all channels',
      icon: Target,
      trend: 'up' as const
    },
    {
      title: 'Ad Spend ROI',
      value: '4.2x',
      change: '+1.1x',
      period: 'blended',
      icon: BarChart3,
      trend: 'up' as const
    },
  ]

  const channels = [
    { name: 'Organic Search', value: 45, sessions: '10.5K', revenue: '$18,240' },
    { name: 'Google Ads', value: 28, sessions: '6.5K', revenue: '$15,890' },
    { name: 'Social Media', value: 18, sessions: '4.2K', revenue: '$8,450' },
    { name: 'Direct', value: 9, sessions: '2.1K', revenue: '$4,802' },
  ]

  const campaigns = [
    { name: 'Summer Collection 2024', status: 'active', progress: 75, budget: '$45K' },
    { name: 'VIP Salon Program', status: 'planning', progress: 30, budget: '$25K' },
    { name: 'Instagram Influencer', status: 'active', progress: 60, budget: '$35K' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Analytics & Reports</h1>
          <p className="text-muted-foreground mt-2">
            Performance insights and marketing analytics
          </p>
        </div>
        <div className="flex gap-3">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="12m">Last 12 months</option>
          </select>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Hero Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-semibold">{stat.value}</p>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold flex items-center gap-1 ${
                      stat.trend === 'up' ? 'text-emerald-600' : 'text-red-600'
                    }`}>
                      {stat.trend === 'up' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                      {stat.change}
                    </span>
                    <span className="text-xs text-muted-foreground">{stat.period}</span>
                  </div>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100">
                  <stat.icon className="h-6 w-6 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Channel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChart className="h-5 w-5" />
              Revenue by Channel
            </CardTitle>
            <CardDescription>Performance breakdown by traffic source</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {channels.map((channel) => (
                <div key={channel.name} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{channel.name}</span>
                    <div className="flex items-center gap-4 text-muted-foreground">
                      <span>{channel.sessions}</span>
                      <span className="font-semibold text-gray-900">{channel.revenue}</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-teal-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${channel.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Traffic Sources */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Traffic Sources
            </CardTitle>
            <CardDescription>Session distribution by channel</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="text-center py-6">
                <p className="text-4xl font-semibold mb-2">23.4K</p>
                <p className="text-sm text-muted-foreground">Total Sessions</p>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-semibold">45%</p>
                  <p className="text-sm text-muted-foreground">Organic</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-semibold">28%</p>
                  <p className="text-sm text-muted-foreground">Paid</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-semibold">18%</p>
                  <p className="text-sm text-muted-foreground">Social</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-semibold">9%</p>
                  <p className="text-sm text-muted-foreground">Direct</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SEO Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
              SEO Visibility
            </CardTitle>
            <CardDescription>Search engine performance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                <div>
                  <p className="text-sm font-medium text-gray-700">Avg. Position</p>
                  <p className="text-2xl font-semibold text-emerald-600">12.4</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-emerald-600 flex items-center gap-1">
                    <ArrowUp className="h-3 w-3" />
                    +2.3
                  </p>
                  <p className="text-xs text-muted-foreground">vs last month</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Keywords Tracked</p>
                  <p className="text-2xl font-semibold">45</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Top 10 Rankings</p>
                  <p className="text-2xl font-semibold">12</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Campaign Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Active Campaigns
            </CardTitle>
            <CardDescription>Current campaign progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {campaigns.map((campaign) => (
                <div key={campaign.name} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{campaign.name}</span>
                      <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                        {campaign.status}
                      </Badge>
                    </div>
                    <span className="text-muted-foreground">{campaign.budget}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-teal-500 h-2 rounded-full transition-all"
                        style={{ width: `${campaign.progress}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-10 text-right">{campaign.progress}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="cursor-pointer card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Export Report</h3>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                <BarChart3 className="h-5 w-5 text-gray-600" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Download detailed analytics report</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Schedule Report</h3>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                <Mail className="h-5 w-5 text-gray-600" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Set up automated email reports</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Custom Dashboard</h3>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                <Settings className="h-5 w-5 text-gray-600" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Create personalized views</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
