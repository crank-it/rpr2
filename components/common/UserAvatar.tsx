'use client'

import { useEffect, useState } from 'react'

interface UserAvatarProps {
  userId: string
  size?: 'sm' | 'md' | 'lg'
  showName?: boolean
}

interface User {
  id: string
  name: string | null
  email: string | null
  image_url: string | null
  status: string
}

export function UserAvatar({ userId, size = 'md', showName = false }: UserAvatarProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch(`/api/users?id=${userId}`)
        if (response.ok) {
          const users = await response.json()
          setUser(users[0] || null)
        }
      } catch (error) {
        console.error('Failed to fetch user:', error)
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      fetchUser()
    } else {
      setLoading(false)
    }
  }, [userId])

  const sizeClasses = {
    sm: 'h-6 w-6 text-xs',
    md: 'h-8 w-8 text-sm',
    lg: 'h-10 w-10 text-base'
  }

  const getInitials = (name: string | null, email: string | null) => {
    if (name) {
      return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
    if (email) {
      return email[0].toUpperCase()
    }
    return '?'
  }

  const getDisplayName = () => {
    if (!user) return 'Unknown User'
    if (user.status === 'deactivated') return 'Deactivated User'
    return user.name || user.email || 'Unknown User'
  }

  if (loading) {
    return (
      <div className={`${sizeClasses[size]} rounded-full bg-gray-200 animate-pulse`} />
    )
  }

  const displayName = getDisplayName()
  const initials = getInitials(user?.name || null, user?.email || null)
  const isDeactivated = user?.status === 'deactivated'

  // Generate a color based on user ID
  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-yellow-500',
    'bg-indigo-500',
    'bg-red-500',
    'bg-teal-500'
  ]
  const colorIndex = userId ? userId.charCodeAt(0) % colors.length : 0
  const bgColor = isDeactivated ? 'bg-gray-400' : colors[colorIndex]

  return (
    <div className="flex items-center gap-2">
      {user?.image_url ? (
        <img
          src={user.image_url}
          alt={displayName}
          className={`${sizeClasses[size]} rounded-full object-cover ${isDeactivated ? 'opacity-50' : ''}`}
        />
      ) : (
        <div
          className={`${sizeClasses[size]} ${bgColor} rounded-full flex items-center justify-center text-white font-medium ${isDeactivated ? 'opacity-50' : ''}`}
        >
          {initials}
        </div>
      )}
      {showName && (
        <span className={`text-sm ${isDeactivated ? 'text-gray-500 italic' : 'text-gray-700'}`}>
          {displayName}
        </span>
      )}
    </div>
  )
}
