'use client'

import { useState } from 'react'
import { Save, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'

export default function SettingsPage() {
  const [saving, setSaving] = useState(false)

  // Report metrics state
  const [metrics, setMetrics] = useState([
    { id: '1', label: 'Total Revenue', value: '287,450', trend: '+12.5%', trendDirection: 'up' },
    { id: '2', label: 'Active Projects', value: '24', trend: '+3', trendDirection: 'up' },
    { id: '3', label: 'Total Customers', value: '156', trend: '+8', trendDirection: 'up' },
    { id: '4', label: 'Asset Library', value: '1,234', trend: '+45', trendDirection: 'up' }
  ])

  // Performance data state
  const [performanceData, setPerformanceData] = useState([
    { month: 'Jan', value: 42000 },
    { month: 'Feb', value: 48000 },
    { month: 'Mar', value: 45000 },
    { month: 'Apr', value: 52000 },
    { month: 'May', value: 58000 },
    { month: 'Jun', value: 62000 }
  ])

  // Revenue by Channel state
  const [revenueByChannel, setRevenueByChannel] = useState([
    { id: '1', channel: 'Direct Sales', percentage: 45, amount: 129352 },
    { id: '2', channel: 'Distributor Network', percentage: 30, amount: 86235 },
    { id: '3', channel: 'Online Store', percentage: 15, amount: 43117 },
    { id: '4', channel: 'Partnerships', percentage: 10, amount: 28745 }
  ])

  // Traffic Sources state
  const [trafficSources, setTrafficSources] = useState([
    { id: '1', source: 'Organic Search', visitors: 12458, percentage: 42 },
    { id: '2', source: 'Direct', visitors: 8934, percentage: 30 },
    { id: '3', source: 'Social Media', visitors: 5367, percentage: 18 },
    { id: '4', source: 'Referral', visitors: 2978, percentage: 10 }
  ])

  // Active Campaigns state
  const [activeCampaigns, setActiveCampaigns] = useState([
    { id: '1', name: 'Summer Collection Launch', status: 'In Progress', progress: 75 },
    { id: '2', name: 'Distributor Training Program', status: 'Review', progress: 90 },
    { id: '3', name: 'Instagram Influencer Collaboration', status: 'In Progress', progress: 45 }
  ])

  // SEO Visibility state
  const [seoMetrics, setSeoMetrics] = useState([
    { id: '1', metric: 'Domain Authority', value: 68, trend: '+3' },
    { id: '2', metric: 'Organic Keywords', value: 1247, trend: '+89' },
    { id: '3', metric: 'Backlinks', value: 3542, trend: '+124' },
    { id: '4', metric: 'Monthly Traffic', value: 28945, trend: '+2.4k' }
  ])

  const handleSave = async () => {
    setSaving(true)
    // Simulate save
    setTimeout(() => {
      setSaving(false)
      alert('Settings saved successfully!')
    }, 1000)
  }

  const updateMetric = (id: string, field: string, value: string) => {
    setMetrics(metrics.map(m => m.id === id ? { ...m, [field]: value } : m))
  }

  const addMetric = () => {
    const newId = String(metrics.length + 1)
    setMetrics([...metrics, {
      id: newId,
      label: 'New Metric',
      value: '0',
      trend: '0%',
      trendDirection: 'up'
    }])
  }

  const deleteMetric = (id: string) => {
    setMetrics(metrics.filter(m => m.id !== id))
  }

  const updatePerformanceData = (index: number, field: string, value: string) => {
    const updated = [...performanceData]
    updated[index] = { ...updated[index], [field]: field === 'value' ? parseInt(value) || 0 : value }
    setPerformanceData(updated)
  }

  const updateRevenueChannel = (id: string, field: string, value: string) => {
    setRevenueByChannel(revenueByChannel.map(r =>
      r.id === id ? { ...r, [field]: ['percentage', 'amount'].includes(field) ? parseInt(value) || 0 : value } : r
    ))
  }

  const addRevenueChannel = () => {
    const newId = String(revenueByChannel.length + 1)
    setRevenueByChannel([...revenueByChannel, {
      id: newId,
      channel: 'New Channel',
      percentage: 0,
      amount: 0
    }])
  }

  const deleteRevenueChannel = (id: string) => {
    setRevenueByChannel(revenueByChannel.filter(r => r.id !== id))
  }

  const updateTrafficSource = (id: string, field: string, value: string) => {
    setTrafficSources(trafficSources.map(t =>
      t.id === id ? { ...t, [field]: ['visitors', 'percentage'].includes(field) ? parseInt(value) || 0 : value } : t
    ))
  }

  const addTrafficSource = () => {
    const newId = String(trafficSources.length + 1)
    setTrafficSources([...trafficSources, {
      id: newId,
      source: 'New Source',
      visitors: 0,
      percentage: 0
    }])
  }

  const deleteTrafficSource = (id: string) => {
    setTrafficSources(trafficSources.filter(t => t.id !== id))
  }

  const updateActiveCampaign = (id: string, field: string, value: string) => {
    setActiveCampaigns(activeCampaigns.map(c =>
      c.id === id ? { ...c, [field]: field === 'progress' ? parseInt(value) || 0 : value } : c
    ))
  }

  const addActiveCampaign = () => {
    const newId = String(activeCampaigns.length + 1)
    setActiveCampaigns([...activeCampaigns, {
      id: newId,
      name: 'New Campaign',
      status: 'In Progress',
      progress: 0
    }])
  }

  const deleteActiveCampaign = (id: string) => {
    setActiveCampaigns(activeCampaigns.filter(c => c.id !== id))
  }

  const updateSeoMetric = (id: string, field: string, value: string) => {
    setSeoMetrics(seoMetrics.map(s =>
      s.id === id ? { ...s, [field]: field === 'value' ? parseInt(value) || 0 : value } : s
    ))
  }

  const addSeoMetric = () => {
    const newId = String(seoMetrics.length + 1)
    setSeoMetrics([...seoMetrics, {
      id: newId,
      metric: 'New Metric',
      value: 0,
      trend: '+0'
    }])
  }

  const deleteSeoMetric = (id: string) => {
    setSeoMetrics(seoMetrics.filter(s => s.id !== id))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage dashboard metrics and report data
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {/* Dashboard Metrics */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Dashboard Metrics</CardTitle>
              <CardDescription className="mt-1">
                Configure the key metrics shown on the dashboard
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={addMetric}>
              <Plus className="mr-2 h-3 w-3" />
              Add Metric
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {metrics.map((metric) => (
            <div key={metric.id} className="grid grid-cols-12 gap-4 items-start p-4 border border-gray-100 rounded-lg">
              <div className="col-span-3">
                <Input
                  label="Label"
                  value={metric.label}
                  onChange={(e) => updateMetric(metric.id, 'label', e.target.value)}
                  placeholder="Metric name"
                />
              </div>
              <div className="col-span-2">
                <Input
                  label="Value"
                  value={metric.value}
                  onChange={(e) => updateMetric(metric.id, 'value', e.target.value)}
                  placeholder="123"
                />
              </div>
              <div className="col-span-2">
                <Input
                  label="Trend"
                  value={metric.trend}
                  onChange={(e) => updateMetric(metric.id, 'trend', e.target.value)}
                  placeholder="+12%"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-900 mb-2">Direction</label>
                <select
                  value={metric.trendDirection}
                  onChange={(e) => updateMetric(metric.id, 'trendDirection', e.target.value)}
                  className="luxury-input"
                >
                  <option value="up">Up (Green)</option>
                  <option value="down">Down (Red)</option>
                  <option value="neutral">Neutral (Gray)</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-900 mb-2">Preview</label>
                <Badge variant={metric.trendDirection === 'up' ? 'success' : metric.trendDirection === 'down' ? 'destructive' : 'secondary'}>
                  {metric.trend}
                </Badge>
              </div>
              <div className="col-span-1 flex items-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteMetric(metric.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Performance Chart Data */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Chart Data</CardTitle>
          <CardDescription className="mt-1">
            Monthly revenue data for the performance chart
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {performanceData.map((data, index) => (
              <div key={index} className="grid grid-cols-2 gap-4 items-end">
                <Input
                  label={`Month ${index + 1}`}
                  value={data.month}
                  onChange={(e) => updatePerformanceData(index, 'month', e.target.value)}
                  placeholder="Jan"
                />
                <Input
                  label="Revenue (AUD)"
                  type="number"
                  value={data.value}
                  onChange={(e) => updatePerformanceData(index, 'value', e.target.value)}
                  placeholder="42000"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Revenue by Channel */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Revenue by Channel</CardTitle>
              <CardDescription className="mt-1">
                Breakdown of revenue sources by channel
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={addRevenueChannel}>
              <Plus className="mr-2 h-3 w-3" />
              Add Channel
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {revenueByChannel.map((channel) => (
            <div key={channel.id} className="grid grid-cols-12 gap-4 items-end p-4 border border-gray-100 rounded-lg">
              <div className="col-span-5">
                <Input
                  label="Channel Name"
                  value={channel.channel}
                  onChange={(e) => updateRevenueChannel(channel.id, 'channel', e.target.value)}
                  placeholder="Direct Sales"
                />
              </div>
              <div className="col-span-3">
                <Input
                  label="Percentage %"
                  type="number"
                  value={channel.percentage}
                  onChange={(e) => updateRevenueChannel(channel.id, 'percentage', e.target.value)}
                  placeholder="45"
                  min="0"
                  max="100"
                />
              </div>
              <div className="col-span-3">
                <Input
                  label="Amount (AUD)"
                  type="number"
                  value={channel.amount}
                  onChange={(e) => updateRevenueChannel(channel.id, 'amount', e.target.value)}
                  placeholder="129352"
                />
              </div>
              <div className="col-span-1 flex items-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteRevenueChannel(channel.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Traffic Sources */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Traffic Sources</CardTitle>
              <CardDescription className="mt-1">
                Website traffic breakdown by source
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={addTrafficSource}>
              <Plus className="mr-2 h-3 w-3" />
              Add Source
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {trafficSources.map((source) => (
            <div key={source.id} className="grid grid-cols-12 gap-4 items-end p-4 border border-gray-100 rounded-lg">
              <div className="col-span-5">
                <Input
                  label="Source Name"
                  value={source.source}
                  onChange={(e) => updateTrafficSource(source.id, 'source', e.target.value)}
                  placeholder="Organic Search"
                />
              </div>
              <div className="col-span-3">
                <Input
                  label="Visitors"
                  type="number"
                  value={source.visitors}
                  onChange={(e) => updateTrafficSource(source.id, 'visitors', e.target.value)}
                  placeholder="12458"
                />
              </div>
              <div className="col-span-3">
                <Input
                  label="Percentage %"
                  type="number"
                  value={source.percentage}
                  onChange={(e) => updateTrafficSource(source.id, 'percentage', e.target.value)}
                  placeholder="42"
                  min="0"
                  max="100"
                />
              </div>
              <div className="col-span-1 flex items-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteTrafficSource(source.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Active Campaigns */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Active Campaigns</CardTitle>
              <CardDescription className="mt-1">
                Currently running campaigns with progress tracking
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={addActiveCampaign}>
              <Plus className="mr-2 h-3 w-3" />
              Add Campaign
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {activeCampaigns.map((campaign) => (
            <div key={campaign.id} className="grid grid-cols-12 gap-4 items-end p-4 border border-gray-100 rounded-lg">
              <div className="col-span-5">
                <Input
                  label="Campaign Name"
                  value={campaign.name}
                  onChange={(e) => updateActiveCampaign(campaign.id, 'name', e.target.value)}
                  placeholder="Summer Collection Launch"
                />
              </div>
              <div className="col-span-3">
                <Input
                  label="Status"
                  value={campaign.status}
                  onChange={(e) => updateActiveCampaign(campaign.id, 'status', e.target.value)}
                  placeholder="In Progress"
                />
              </div>
              <div className="col-span-3">
                <Input
                  label="Progress %"
                  type="number"
                  value={campaign.progress}
                  onChange={(e) => updateActiveCampaign(campaign.id, 'progress', e.target.value)}
                  placeholder="75"
                  min="0"
                  max="100"
                />
              </div>
              <div className="col-span-1 flex items-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteActiveCampaign(campaign.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* SEO Visibility */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>SEO Visibility Metrics</CardTitle>
              <CardDescription className="mt-1">
                Search engine optimization performance indicators
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={addSeoMetric}>
              <Plus className="mr-2 h-3 w-3" />
              Add Metric
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {seoMetrics.map((metric) => (
            <div key={metric.id} className="grid grid-cols-12 gap-4 items-end p-4 border border-gray-100 rounded-lg">
              <div className="col-span-5">
                <Input
                  label="Metric Name"
                  value={metric.metric}
                  onChange={(e) => updateSeoMetric(metric.id, 'metric', e.target.value)}
                  placeholder="Domain Authority"
                />
              </div>
              <div className="col-span-3">
                <Input
                  label="Value"
                  type="number"
                  value={metric.value}
                  onChange={(e) => updateSeoMetric(metric.id, 'value', e.target.value)}
                  placeholder="68"
                />
              </div>
              <div className="col-span-3">
                <Input
                  label="Trend"
                  value={metric.trend}
                  onChange={(e) => updateSeoMetric(metric.id, 'trend', e.target.value)}
                  placeholder="+3"
                />
              </div>
              <div className="col-span-1 flex items-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteSeoMetric(metric.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Additional Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Settings</CardTitle>
          <CardDescription className="mt-1">
            Other configuration options
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Company Name"
            defaultValue="RPR Flow"
            placeholder="Your company name"
          />
          <Input
            label="Contact Email"
            type="email"
            defaultValue="contact@rprflow.com"
            placeholder="contact@example.com"
          />
          <Textarea
            label="About"
            defaultValue="Operations Hub for managing projects, assets, and campaigns."
            placeholder="Brief description of your organization"
          />
        </CardContent>
      </Card>
    </div>
  )
}
