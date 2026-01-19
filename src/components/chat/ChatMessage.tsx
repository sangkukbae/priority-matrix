import type { ChatMessage as ChatMessageType } from '@/types/chat'
import clsx from 'clsx'
import { SafeHtmlRenderer } from '@/components/ui/SafeHtmlRenderer'
import { renderStreamdownToHtml } from '@/lib/streamdown'
import { Copy, Check } from 'lucide-react'
import { useState } from 'react'

interface ChatMessageProps {
  message: ChatMessageType
  isLoading?: boolean
}

export function ChatMessage({ message, isLoading }: ChatMessageProps) {
  const isUser = message.role === 'user'
  const timeLabel = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })

  const [isCopied, setIsCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const showLoading = !isUser && isLoading && !message.content

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
        ) : showLoading ? (
          <div className="flex items-center gap-1 h-6">
            <span className="w-1.5 h-1.5 bg-[#6B778C] rounded-full animate-bounce [animation-delay:-0.3s]" />
            <span className="w-1.5 h-1.5 bg-[#6B778C] rounded-full animate-bounce [animation-delay:-0.15s]" />
            <span className="w-1.5 h-1.5 bg-[#6B778C] rounded-full animate-bounce" />
          </div>
        ) : (
          <SafeHtmlRenderer
            html={renderStreamdownToHtml(message.content)}
            className="chat-markdown-content"
          />
        )}
        <div className={clsx('mt-1 flex items-center', isUser ? 'justify-end' : 'justify-between gap-2')}>
          {!isUser && !showLoading && (
            <button
              onClick={handleCopy}
              className="text-[#6B778C] hover:text-[#172B4D] transition-colors p-0.5 rounded hover:bg-black/5"
              aria-label="메시지 복사"
              title="메시지 복사"
            >
              {isCopied ? <Check size={14} /> : <Copy size={14} />}
            </button>
          )}
          <span className={clsx('text-[11px] text-[#6B778C]', showLoading && 'ml-auto')}>{timeLabel}</span>
        </div>
      </div>
    </div>
  )
}
