'use client'

import { TrendingUp, BarChart3, LineChart, Calendar, Download, LayoutDashboard } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Campaign {
  id: string
  name: string
  status: string
  progress?: number
  budget: number | null
}

interface ReportData {
  campaigns: Campaign[]
  stats: {
    totalCampaigns: number
    activeCampaigns: number
    totalBudget: number
  }
}

export default function ReportsPage() {
  const [timeframe, setTimeframe] = useState('30d')
  const [data, setData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReportData()
  }, [])

  const fetchReportData = async () => {
    try {
      const response = await fetch('/api/campaigns')
      if (response.ok) {
        const campaigns = await response.json()

        const activeCampaigns = campaigns.filter((c: Campaign) => c.status === 'ACTIVE')
        const totalBudget = campaigns.reduce((sum: number, c: Campaign) => sum + (c.budget || 0), 0)

        setData({
          campaigns,
          stats: {
            totalCampaigns: campaigns.length,
            activeCampaigns: activeCampaigns.length,
            totalBudget
          }
        })
      }
    } catch (error) {
      console.error('Failed to fetch report data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin h-8 w-8 border-4 border-teal-600 rounded-full border-t-transparent" />
      </div>
    )
  }

  const hasData = data && data.campaigns.length > 0

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
          <Button variant="outline" disabled={!hasData}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Total Campaigns</p>
                <p className="text-2xl font-semibold">{data?.stats.totalCampaigns ?? 0}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100">
                <Calendar className="h-6 w-6 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Active Campaigns</p>
                <p className="text-2xl font-semibold">{data?.stats.activeCampaigns ?? 0}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100">
                <TrendingUp className="h-6 w-6 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Total Budget</p>
                <p className="text-2xl font-semibold">
                  {data?.stats.totalBudget ? `$${data.stats.totalBudget.toLocaleString()}` : '$0'}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100">
                <BarChart3 className="h-6 w-6 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Analytics Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChart className="h-5 w-5" />
              Revenue & Traffic
            </CardTitle>
            <CardDescription>Connect analytics to see performance data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 mb-4">
                <LineChart className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Analytics Data</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Connect your analytics platform to view revenue and traffic metrics here.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Traffic Sources Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Traffic Sources
            </CardTitle>
            <CardDescription>Session distribution by channel</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 mb-4">
                <BarChart3 className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Traffic Data</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Traffic source data will appear here once analytics is connected.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* SEO Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
              SEO Visibility
            </CardTitle>
            <CardDescription>Search engine performance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 mb-4">
                <TrendingUp className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No SEO Data</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Connect SEO tools to track keyword rankings and visibility.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Campaign Performance - Dynamic */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Campaign Progress
            </CardTitle>
            <CardDescription>Current campaign status</CardDescription>
          </CardHeader>
          <CardContent>
            {hasData ? (
              <div className="space-y-4">
                {data.campaigns.slice(0, 5).map((campaign) => (
                  <div key={campaign.id} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{campaign.name}</span>
                        <Badge variant={campaign.status === 'ACTIVE' ? 'default' : 'secondary'} className="text-xs">
                          {campaign.status}
                        </Badge>
                      </div>
                      {campaign.budget && (
                        <span className="text-muted-foreground">${campaign.budget.toLocaleString()}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-100 rounded-full h-2">
                        <div
                          className="bg-teal-500 h-2 rounded-full transition-all"
                          style={{ width: `${campaign.progress || 0}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground w-10 text-right">{campaign.progress || 0}%</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 mb-4">
                  <Calendar className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No Campaigns</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Create campaigns to track their progress here.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="cursor-pointer card-hover opacity-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Export Report</h3>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                <BarChart3 className="h-5 w-5 text-gray-600" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Available when data is present</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer card-hover opacity-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Schedule Report</h3>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                <Calendar className="h-5 w-5 text-gray-600" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Set up automated email reports</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer card-hover opacity-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Custom Dashboard</h3>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                <LayoutDashboard className="h-5 w-5 text-gray-600" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Coming soon</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
