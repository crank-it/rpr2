'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useUser, useClerk } from '@clerk/nextjs'
import {
  Home,
  FolderOpen,
  Users,
  Image as ImageIcon,
  Calendar,
  BarChart3,
  Menu,
  Settings,
  Bug,
  GraduationCap,
  LogOut,
  ChevronDown,
  UserCog,
  Bell,
  UserPlus,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { BugReportModal } from '@/components/BugReportModal'
import { UserSyncProvider } from '@/components/UserSyncProvider'
import { supabase } from '@/lib/supabase'

interface Notification {
  id: string
  type: 'user_pending' | 'user_approved' | 'user_rejected'
  message: string
  timestamp: Date
  read: boolean
  userId?: string
  userName?: string
}

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Projects', href: '/projects', icon: FolderOpen },
  { name: 'Assets', href: '/assets', icon: ImageIcon },
  { name: 'Campaigns', href: '/campaigns', icon: Calendar },
  { name: 'Customers', href: '/customers', icon: Users },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
  { name: 'Training', href: '/training', icon: GraduationCap },
]

const secondaryNavigation = [
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'User Management', href: '/user-management', icon: UserCog },
]

function NotificationDropdown({
  notifications,
  onClearAll,
  onNotificationClick
}: {
  notifications: Notification[]
  onClearAll: () => void
  onNotificationClick: (notification: Notification) => void
}) {
  const unreadCount = notifications.filter(n => !n.read).length

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'user_pending':
        return <Clock className="h-4 w-4 text-amber-500" />
      case 'user_approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'user_rejected':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <UserPlus className="h-4 w-4 text-blue-500" />
    }
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  return (
    <div className="absolute right-0 mt-2 w-80 rounded-lg bg-white shadow-lg border z-50">
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs font-medium px-1.5 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        {notifications.length > 0 && (
          <button
            onClick={onClearAll}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            Clear all
          </button>
        )}
      </div>
      <div className="max-h-80 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <Bell className="h-8 w-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No notifications</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => onNotificationClick(notification)}
              className={`px-4 py-3 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer transition-colors ${
                !notification.read ? 'bg-blue-50/50' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {getIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${!notification.read ? 'font-medium text-gray-900' : 'text-gray-700'}`}>
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatTime(notification.timestamp)}
                  </p>
                </div>
                {!notification.read && (
                  <div className="h-2 w-2 bg-blue-500 rounded-full mt-1.5" />
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function UserMenu() {
  const { user } = useUser()
  const { signOut } = useClerk()
  const [isOpen, setIsOpen] = useState(false)

  if (!user) return null

  const initials = user.fullName
    ? user.fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : user.emailAddresses[0]?.emailAddress?.slice(0, 2).toUpperCase() || 'U'

  const displayName = user.fullName || user.emailAddresses[0]?.emailAddress?.split('@')[0] || 'User'
  const email = user.emailAddresses[0]?.emailAddress || ''

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 hover:bg-gray-100 rounded-lg px-2 py-1.5 transition-colors"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-teal-400 to-teal-600 text-sm font-medium text-white overflow-hidden">
          {user.imageUrl ? (
            <img src={user.imageUrl} alt={displayName} className="h-full w-full object-cover" />
          ) : (
            initials
          )}
        </div>
        <span className="text-sm font-medium text-gray-700 hidden sm:block">{displayName}</span>
        <ChevronDown className="h-4 w-4 text-gray-500" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-56 rounded-lg bg-white shadow-lg border z-50">
            <div className="px-4 py-3 border-b">
              <p className="text-sm font-medium text-gray-900">{displayName}</p>
              <p className="text-xs text-muted-foreground truncate">{email}</p>
            </div>
            <div className="py-1">
              <button
                onClick={() => {
                  setIsOpen(false)
                  signOut({ redirectUrl: '/sign-in' })
                }}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [isBugReportOpen, setIsBugReportOpen] = useState(false)
  const [pendingUsersCount, setPendingUsersCount] = useState(0)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)

  // Fetch pending users count and create initial notification
  const fetchPendingCount = useCallback(async () => {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email')
      .eq('status', 'pending')

    if (!error && data) {
      const count = data.length
      setPendingUsersCount(count)

      // Create notification for pending users on initial load
      if (count > 0) {
        const pendingNotification: Notification = {
          id: 'pending-users-summary',
          type: 'user_pending',
          message: count === 1
            ? `${data[0]?.name || data[0]?.email || '1 user'} is waiting for approval`
            : `${count} users are waiting for approval`,
          timestamp: new Date(),
          read: false
        }
        setNotifications(prev => {
          // Remove old pending summary if exists, add new one
          const filtered = prev.filter(n => n.id !== 'pending-users-summary')
          return [pendingNotification, ...filtered]
        })
      } else {
        setPendingUsersCount(0)
        // Remove pending summary if no pending users
        setNotifications(prev => prev.filter(n => n.id !== 'pending-users-summary'))
      }
    }
  }, [])

  // Set up realtime subscriptions
  useEffect(() => {
    // Initial fetch
    fetchPendingCount()

    // Subscribe to users table changes for pending count
    const usersChannel = supabase
      .channel('sidebar-users-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'users'
        },
        (payload) => {
          // Refetch pending count on any user change
          fetchPendingCount()

          // Create notification based on the change
          const newRecord = payload.new as { id: string; name: string; status: string; email: string } | null
          const oldRecord = payload.old as { id: string; name: string; status: string; email: string } | null

          if (payload.eventType === 'INSERT' && newRecord?.status === 'pending') {
            // New user registered
            const notification: Notification = {
              id: `${Date.now()}-${newRecord.id}`,
              type: 'user_pending',
              message: `${newRecord.name || newRecord.email || 'A new user'} is waiting for approval`,
              timestamp: new Date(),
              read: false,
              userId: newRecord.id,
              userName: newRecord.name || newRecord.email
            }
            setNotifications(prev => [notification, ...prev].slice(0, 50)) // Keep last 50
          } else if (payload.eventType === 'UPDATE' && oldRecord && newRecord) {
            // Status changed
            if (oldRecord.status === 'pending' && newRecord.status === 'active') {
              const notification: Notification = {
                id: `${Date.now()}-${newRecord.id}`,
                type: 'user_approved',
                message: `${newRecord.name || newRecord.email || 'A user'} has been approved`,
                timestamp: new Date(),
                read: false,
                userId: newRecord.id,
                userName: newRecord.name || newRecord.email
              }
              setNotifications(prev => [notification, ...prev].slice(0, 50))
            } else if (oldRecord.status === 'pending' && newRecord.status === 'rejected') {
              const notification: Notification = {
                id: `${Date.now()}-${newRecord.id}`,
                type: 'user_rejected',
                message: `${newRecord.name || newRecord.email || 'A user'} has been rejected`,
                timestamp: new Date(),
                read: false,
                userId: newRecord.id,
                userName: newRecord.name || newRecord.email
              }
              setNotifications(prev => [notification, ...prev].slice(0, 50))
            }
          }
        }
      )
      .subscribe()

    // Cleanup on unmount
    return () => {
      supabase.removeChannel(usersChannel)
    }
  }, [fetchPendingCount])

  // Notification handlers
  const handleClearAllNotifications = () => {
    setNotifications([])
  }

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    setNotifications(prev =>
      prev.map(n => (n.id === notification.id ? { ...n, read: true } : n))
    )
    // Close dropdown
    setIsNotificationOpen(false)
    // Navigate to user management page
    router.push('/user-management')
  }

  const unreadNotificationsCount = notifications.filter(n => !n.read).length

  // Public routes that don't need sidebar
  const publicRoutes = ['/sign-in', '/sign-up', '/auth/callback', '/pending', '/rejected', '/deactivated', '/login', '/signup']
  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(`${route}/`))

  if (isPublicRoute) {
    return <>{children}</>
  }

  return (
    <UserSyncProvider>
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <aside className="hidden lg:flex lg:w-64 lg:flex-col border-r border-slate-300 bg-white">
          <div className="flex h-16 items-center gap-3 px-6">
            <div className="flex flex-col">
              <div className="text-xl font-light tracking-wider text-gray-900" style={{ letterSpacing: '0.1em' }}>
                RPR HAIRCARE
              </div>
              <p className="text-xs text-gray-500 mt-0.5">Operations Hub</p>
            </div>
          </div>

          <nav className="flex-1 space-y-6 p-4">
            <div className="space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`
                      flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors
                      ${isActive
                        ? 'bg-teal-50 text-teal-700 border border-teal-200'
                        : 'text-gray-700 hover:bg-gray-100'
                      }
                    `}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                )
              })}
            </div>

            <div className="space-y-1">
              {secondaryNavigation.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
                const showPendingDot = item.name === 'User Management' && pendingUsersCount > 0
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`
                      flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors relative
                      ${isActive
                        ? 'bg-teal-50 text-teal-700 border border-teal-200'
                        : 'text-gray-700 hover:bg-gray-100'
                      }
                    `}
                  >
                    <div className="relative">
                      <item.icon className="h-4 w-4" />
                      {showPendingDot && (
                        <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full animate-pulse" />
                      )}
                    </div>
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </nav>

          <Separator />

          {/* <div className="p-4">
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-xs font-medium text-gray-900">Something's not quite right?</p>
              <p className="mt-1 text-xs text-gray-500">
                Let us know so we can best help
              </p>
              <Button
                variant="outline"
                className="mt-3 w-full"
                size="sm"
                onClick={() => setIsBugReportOpen(true)}
              >
                <Bug className="mr-2 h-3 w-3" />
                Report Issue
              </Button>
            </div>
          </div> */}
        </aside>

        {/* Main Content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Header */}
          <header className="flex h-16 items-center gap-4 border-b border-slate-300 bg-white px-6">
            <Button variant="ghost" size="icon" className="lg:hidden">
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex-1" />

            {/* Notification Bell */}
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className="relative"
              >
                <Bell className="h-5 w-5" />
                {(unreadNotificationsCount > 0 || pendingUsersCount > 0) && (
                  <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full animate-pulse" />
                )}
              </Button>

              {isNotificationOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsNotificationOpen(false)}
                  />
                  <NotificationDropdown
                    notifications={notifications}
                    onClearAll={handleClearAllNotifications}
                    onNotificationClick={handleNotificationClick}
                  />
                </>
              )}
            </div>

            <UserMenu />
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto bg-gray-50">
            <div className="page-container">
              {children}
            </div>
          </main>
        </div>

        <BugReportModal
          isOpen={isBugReportOpen}
          onClose={() => setIsBugReportOpen(false)}
        />
      </div>
    </UserSyncProvider>
  )
}
