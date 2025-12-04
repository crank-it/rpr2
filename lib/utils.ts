import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

export function formatDateTime(date: Date | string) {
  return new Date(date).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    DRAFT: 'bg-gray-100 text-gray-800 border-gray-200',
    IN_PROGRESS: 'bg-blue-100 text-blue-800 border-blue-200',
    REVIEW: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    APPROVED: 'bg-green-100 text-green-800 border-green-200',
    COMPLETED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    ARCHIVED: 'bg-slate-100 text-slate-800 border-slate-200'
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

export function getPriorityColor(priority: string) {
  const colors: Record<string, string> = {
    LOW: 'text-slate-500',
    MEDIUM: 'text-blue-500',
    HIGH: 'text-orange-500',
    URGENT: 'text-red-500'
  }
  return colors[priority] || 'text-slate-500'
}

export function getCustomerTypeColor(type: string) {
  const colors: Record<string, string> = {
    SALON: 'bg-purple-100 text-purple-800 border-purple-200',
    DISTRIBUTOR: 'bg-blue-100 text-blue-800 border-blue-200',
    CORPORATE: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    VIP: 'bg-amber-100 text-amber-800 border-amber-200'
  }
  return colors[type] || 'bg-gray-100 text-gray-800'
}
