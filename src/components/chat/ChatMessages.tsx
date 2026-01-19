import { useEffect, useRef } from 'react'
import type { ChatMessage as ChatMessageType } from '@/types/chat'
import { ChatMessage } from './ChatMessage'

interface ChatMessagesProps {
  messages: ChatMessageType[]
  isLoading?: boolean
}

export function ChatMessages({ messages, isLoading }: ChatMessagesProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [messages])

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto px-5 py-4 space-y-3 bg-[#FFFFFF]"
      role="log"
      aria-live="polite"
    >
      {messages.length === 0 ? (
        <p className="text-sm text-[#6B778C]">안녕하세요! 궁금한 내용을 물어보세요.</p>
      ) : (
        messages.map((message, index) => (
          <ChatMessage
            key={message.id}
            message={message}
            isLoading={isLoading && index === messages.length - 1}
          />
        ))
      )}
    </div>
  )
}
