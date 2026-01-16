import type { ReactNode } from 'react'
import clsx from 'clsx'

interface ChatPanelProps {
  isOpen: boolean
  children: ReactNode
}

export function ChatPanel({ isOpen, children }: ChatPanelProps) {
  if (!isOpen) return null

  return (
    <div
      className={clsx(
        'fixed right-4 bottom-24 sm:right-6 w-[calc(100%-32px)] sm:w-[380px] max-h-[70vh] sm:max-h-[500px]',
        'bg-white shadow-[0_8px_18px_rgba(9,30,66,0.14)] rounded-[var(--radius-trello)]',
        'border border-[var(--color-trello-border)] flex flex-col overflow-hidden transition-all duration-200 ease-out'
      )}
      aria-label="AI 챗봇 패널"
    >
      {children}
    </div>
  )
}
