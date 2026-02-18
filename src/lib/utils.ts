import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount)
}

export function formatDate(date: string): string {
    return new Intl.DateTimeFormat('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    }).format(new Date(date))
}

export function formatRelativeTime(date: string): string {
    const now = new Date()
    const then = new Date(date)
    const diffMs = now.getTime() - then.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return formatDate(date)
}

export function getInitials(name: string): string {
    return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
}

export const SUBJECTS = [
    'Mathematics',
    'Physics',
    'Chemistry',
    'Biology',
    'Computer Science',
    'English',
    'History',
    'Geography',
    'Economics',
    'Accountancy',
    'Business Studies',
    'Political Science',
    'Sociology',
    'Psychology',
    'Philosophy',
    'Statistics',
    'Engineering',
    'Medicine',
    'Law',
    'Other',
]

export const STATUS_COLORS: Record<string, string> = {
    open: 'bg-green-500/20 text-green-400 border-green-500/30',
    accepted: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    solved: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    expired: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
}

export const MODE_LABELS: Record<string, string> = {
    text: 'Written Answer',
    call: 'Live Call',
    both: 'Text or Call',
}
