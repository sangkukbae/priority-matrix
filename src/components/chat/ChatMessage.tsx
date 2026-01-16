import type { ChatMessage as ChatMessageType } from '@/types/chat'
import clsx from 'clsx'
import { SafeHtmlRenderer } from '@/components/ui/SafeHtmlRenderer'
import { renderStreamdownToHtml } from '@/lib/streamdown'

interface ChatMessageProps {
  message: ChatMessageType
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user'
  const timeLabel = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className={clsx('flex w-full', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={clsx(
          'max-w-[90%] rounded-[12px] px-3.5 py-2.5 text-sm shadow-sm transition-all duration-200 border border-[var(--color-trello-border)]',
          isUser
            ? 'bg-[#E3F2FD] text-[#0D47A1] self-end'
            : 'bg-[#F4F5F7] text-[#172B4D]'
        )}
      >
        {isUser ? (
          <p className="whitespace-pre-line leading-relaxed">{message.content}</p>
        ) : (
          <SafeHtmlRenderer
            html={renderStreamdownToHtml(message.content)}
            className="chat-markdown-content"
          />
        )}
        <span className="mt-1 block text-[11px] text-[#6B778C] text-right">{timeLabel}</span>
      </div>
    </div>
  )
}
