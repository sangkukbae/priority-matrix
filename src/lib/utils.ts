import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateId(): string {
  return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export function formatDate(dateString: string): string {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export type DueDateStatus = 'overdue' | 'today' | 'soon' | 'normal' | 'none'

export function getDueDateStatus(dateString: string | undefined): DueDateStatus {
  if (!dateString) return 'none'

  const dueDate = new Date(dateString)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  dueDate.setHours(0, 0, 0, 0)

  const diffDays = Math.ceil(
    (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  )

  if (diffDays < 0) return 'overdue'
  if (diffDays === 0) return 'today'
  if (diffDays <= 3) return 'soon'
  return 'normal'
}

export function getDueDateLabel(status: DueDateStatus): string {
  const labels: Record<DueDateStatus, string> = {
    overdue: '마감 지남',
    today: '오늘 마감',
    soon: '곧 마감',
    normal: '',
    none: '',
  }
  return labels[status]
}

export function formatDateCompact(dateString: string): string {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric',
    weekday: 'short',
  })
}
