import { Loader2, MessageCircle, Sparkles, Download } from 'lucide-react'
import clsx from 'clsx'
import type { ChatAvailabilityStatus } from '@/types/chat'

interface ChatFABProps {
  isOpen: boolean
  isLoading: boolean
  availabilityStatus: ChatAvailabilityStatus
  onToggle: () => void
}

export function ChatFAB({ isOpen, isLoading, availabilityStatus, onToggle }: ChatFABProps) {
  const getIcon = () => {
    if (isLoading) return <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
    if (availabilityStatus === 'downloading') return <Download className="h-6 w-6 animate-pulse" aria-hidden="true" />
    if (availabilityStatus === 'unavailable' || availabilityStatus === 'downloadable') {
      return <Sparkles className="h-6 w-6" aria-hidden="true" />
    }
    return <MessageCircle className="h-6 w-6" aria-hidden="true" />
  }

  return (
    <button
      type="button"
      aria-label={isOpen ? '챗봇 닫기' : '챗봇 열기'}
      onClick={onToggle}
      className={clsx(
        'fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-[var(--shadow-trello-card-hover)] transition-all duration-200',
        'bg-[var(--color-trello-blue)] text-white flex items-center justify-center hover:shadow-[var(--shadow-trello-drag)]',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--color-trello-blue)]',
        isOpen && 'translate-y-[-2px]',
      )}
    >
      <span className="sr-only">{isOpen ? '챗봇 닫기' : '챗봇 열기'}</span>
      {getIcon()}
    </button>
  )
}
