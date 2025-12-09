'use client'

import { FolderOpen, Users, Image, Calendar, TrendingUp, ArrowRight, Plus } from 'lucide-react'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

interface DashboardStats {
  stats: {
    projects: number
    assets: number
    campaigns: number
    customers: number
  }
  projectStatus: {
    active: number
    review: number
    completed: number
  }
  recentActivity: {
    id: string
    title: string
    type: string
    status: string
    time: string
  }[]
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard/stats')
      if (response.ok) {
        const result = await response.json()
        setData(result)
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const stats = [
    {
      name: 'Projects',
      value: data?.stats.projects ?? 0,
      icon: FolderOpen,
      href: '/projects'
    },
    {
      name: 'Assets',
      value: data?.stats.assets ?? 0,
      icon: Image,
      href: '/assets'
    },
    {
      name: 'Campaigns',
      value: data?.stats.campaigns ?? 0,
      icon: Calendar,
      href: '/campaigns'
    },
    {
      name: 'Customers',
      value: data?.stats.customers ?? 0,
      icon: Users,
      href: '/customers'
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin h-8 w-8 border-4 border-teal-600 rounded-full border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome back. Here's what's happening with your projects.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.name} href={stat.href}>
            <Card className="card-hover cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  {stat.name}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold">{stat.value}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Recent Activity */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Your latest updates across all projects
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data?.recentActivity && data.recentActivity.length > 0 ? (
              <div className="space-y-6">
                {data.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100">
                      {activity.type === 'Project' && <FolderOpen className="h-4 w-4" />}
                      {activity.type === 'Asset' && <Image className="h-4 w-4" />}
                      {activity.type === 'Campaign' && <Calendar className="h-4 w-4" />}
                      {activity.type === 'Customer' && <Users className="h-4 w-4" />}
                      {!['Project', 'Asset', 'Campaign', 'Customer'].includes(activity.type) && <FolderOpen className="h-4 w-4" />}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">{activity.title}</p>
                      <p className="text-xs text-muted-foreground">{activity.type}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        activity.status === 'completed' ? 'success' :
                        activity.status === 'in_progress' ? 'default' :
                        'secondary'
                      }>
                        {activity.status.replace('_', ' ')}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{activity.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center py-8 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 mb-3">
                  <FolderOpen className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-900">No recent activity</p>
                <p className="text-xs text-muted-foreground mt-1">Activity will appear here as you work</p>
              </div>
            )}
            {data?.recentActivity && data.recentActivity.length > 0 && (
              <>
                <Separator className="my-4" />
                <Button variant="ghost" className="w-full">
                  View all activity
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/projects">
              <Button variant="outline" className="w-full justify-start">
                <Plus className="mr-2 h-4 w-4" />
                New Project
              </Button>
            </Link>
            <Link href="/assets">
              <Button variant="outline" className="w-full justify-start">
                <Plus className="mr-2 h-4 w-4" />
                Upload Asset
              </Button>
            </Link>
            <Link href="/campaigns">
              <Button variant="outline" className="w-full justify-start">
                <Plus className="mr-2 h-4 w-4" />
                Create Campaign
              </Button>
            </Link>
            <Link href="/customers">
              <Button variant="outline" className="w-full justify-start">
                <Plus className="mr-2 h-4 w-4" />
                Add Customer
              </Button>
            </Link>
            <Separator className="my-4" />
            <Link href="/reports">
              <Button variant="secondary" className="w-full justify-start">
                <TrendingUp className="mr-2 h-4 w-4" />
                View Reports
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Project Status Overview */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{data?.projectStatus.active ?? 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Currently in progress
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{data?.projectStatus.review ?? 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Awaiting approval
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Completed Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{data?.projectStatus.completed ?? 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total completed
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
