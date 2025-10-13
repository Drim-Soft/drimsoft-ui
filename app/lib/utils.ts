import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount)
}

export function formatPercentage(value: number, decimals = 1): string {
  return `${(value * 100).toFixed(decimals)}%`
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date))
}

export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function getStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    'Activo': 'text-green-600 bg-green-50 border-green-200',
    'Activa': 'text-green-600 bg-green-50 border-green-200',
    'En curso': 'text-blue-600 bg-blue-50 border-blue-200',
    'En progreso': 'text-blue-600 bg-blue-50 border-blue-200',
    'Completada': 'text-green-600 bg-green-50 border-green-200',
    'Hecho': 'text-green-600 bg-green-50 border-green-200',
    'Cerrado': 'text-gray-600 bg-gray-50 border-gray-200',
    'En riesgo': 'text-amber-600 bg-amber-50 border-amber-200',
    'Suspendida': 'text-red-600 bg-red-50 border-red-200',
    'Suspendido': 'text-red-600 bg-red-50 border-red-200',
    'Cancelado': 'text-red-600 bg-red-50 border-red-200',
    'Pendiente': 'text-amber-600 bg-amber-50 border-amber-200',
    'Por hacer': 'text-gray-600 bg-gray-50 border-gray-200',
    'En revisión': 'text-purple-600 bg-purple-50 border-purple-200',
    'Bloqueado': 'text-red-600 bg-red-50 border-red-200',
    'Aprobado': 'text-green-600 bg-green-50 border-green-200',
    'Rechazado': 'text-red-600 bg-red-50 border-red-200',
  }

  return statusColors[status] || 'text-gray-600 bg-gray-50 border-gray-200'
}

export function getPriorityColor(priority: string): string {
  const priorityColors: Record<string, string> = {
    'Baja': 'text-green-600 bg-green-50 border-green-200',
    'Media': 'text-yellow-600 bg-yellow-50 border-yellow-200',
    'Alta': 'text-orange-600 bg-orange-50 border-orange-200',
    'Crítica': 'text-red-600 bg-red-50 border-red-200',
  }

  return priorityColors[priority] || 'text-gray-600 bg-gray-50 border-gray-200'
}

export function getSeverityColor(severity: string): string {
  const severityColors: Record<string, string> = {
    'Low': 'text-green-600 bg-green-50 border-green-200',
    'Medium': 'text-yellow-600 bg-yellow-50 border-yellow-200',
    'High': 'text-orange-600 bg-orange-50 border-orange-200',
    'Critical': 'text-red-600 bg-red-50 border-red-200',
  }

  return severityColors[severity] || 'text-gray-600 bg-gray-50 border-gray-200'
}