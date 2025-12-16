'use client'

import { FolderOpen, Users, Image, Calendar } from 'lucide-react'
import { useState, useEffect } from 'react'
import Link from 'next/link'

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
      name: 'Customers',
      value: data?.stats.customers ?? 0,
      icon: Users,
      href: '/customers'
    },
    {
      name: 'Campaigns',
      value: data?.stats.campaigns ?? 0,
      icon: Calendar,
      href: '/campaigns'
    },
    {
      name: 'Assets',
      value: data?.stats.assets ?? 0,
      icon: Image,
      href: '/assets'
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-6 w-6 border-2 border-solid border-foreground border-r-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-6 py-16">

        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-normal text-foreground tracking-tight mb-3">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Welcome back
          </p>
        </div>

        {/* Stats - Clean grid */}
        <div className="grid grid-cols-4 gap-12 mb-20">
          {stats.map((stat) => (
            <Link key={stat.name} href={stat.href} className="group text-center">
              <div className="mb-4 transition-opacity group-hover:opacity-60">
                <stat.icon className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
              </div>
              <div className="text-3xl font-light text-foreground mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">
                {stat.name}
              </div>
            </Link>
          ))}
        </div>

        {/* Recent Activity */}
        {data?.recentActivity && data.recentActivity.length > 0 && (
          <div>
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-8">
              Recent Activity
            </h2>
            <div className="space-y-0">
              {data.recentActivity.map((activity, index) => (
                <div key={activity.id}>
                  <div className="py-6">
                    <div className="flex items-baseline justify-between gap-8">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-medium text-foreground mb-1">
                          {activity.title}
                        </h3>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span>{activity.type}</span>
                          <span>·</span>
                          <span>{activity.time}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {index < data.recentActivity.length - 1 && (
                    <div className="h-px bg-border" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {(!data?.recentActivity || data.recentActivity.length === 0) && (
          <div className="text-center py-16">
            <p className="text-sm text-muted-foreground mb-8">
              No recent activity
            </p>
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
            >
              Get started with your first project
            </Link>
          </div>
        )}

      </div>
    </div>
  )
}
