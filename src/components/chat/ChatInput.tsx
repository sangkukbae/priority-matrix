import { forwardRef, useState } from 'react'
import { Send, Loader2, Square } from 'lucide-react'
import clsx from 'clsx'

interface ChatInputProps {
  onSend: (value: string) => void
  disabled: boolean
  isLoading: boolean
  onStop?: () => void
}

export const ChatInput = forwardRef<HTMLTextAreaElement, ChatInputProps>(
  ({ onSend, disabled, isLoading, onStop }, ref) => {
    const [value, setValue] = useState('')

    const handleSubmit = () => {
      const trimmed = value.trim()
      if (!trimmed) return
      onSend(trimmed)
      setValue('')
    }

    return (
      <div className="border-t border-[var(--color-trello-border)] bg-[#FFFFFF] p-4 space-y-3">
        {isLoading ? (
          <div className="flex items-center gap-2 text-xs text-[#6B778C]" aria-live="polite">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            <span>AI가 응답을 생성하고 있습니다...</span>
            {onStop && (
              <button
                type="button"
                onClick={onStop}
                className="ml-auto inline-flex items-center gap-1 text-[#42526E] hover:text-[#172B4D]"
              >
                <Square className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="text-xs">중지</span>
              </button>
            )}
          </div>
        ) : null}

        <div className="flex items-end gap-3">
          <textarea
            ref={ref}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSubmit()
              }
            }}
            aria-label="메시지 입력"
            placeholder="무엇을 도와드릴까요? (Shift+Enter로 줄바꿈)"
            className={clsx(
              'flex-1 resize-none rounded-[12px] border border-[var(--color-trello-border)] bg-[#FAFBFC] text-sm text-[#172B4D]',
              'px-3.5 py-3 shadow-inner focus:outline-none focus:ring-2 focus:ring-[var(--color-trello-blue)]',
              'min-h-[72px] max-h-[140px]',
              disabled && 'opacity-60 cursor-not-allowed'
            )}
            disabled={disabled}
          />
          <button
            type="button"
            onClick={handleSubmit}
            className={clsx(
              'inline-flex items-center justify-center rounded-[12px] bg-[var(--color-trello-blue)] text-white px-3.5 py-3 h-[48px] min-w-[48px]',
              'shadow-[var(--shadow-trello-card)] hover:shadow-[var(--shadow-trello-card-hover)] transition-colors duration-200',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--color-trello-blue)]',
              disabled && 'opacity-60 cursor-not-allowed'
            )}
            aria-label="메시지 전송"
            disabled={disabled}
          >
            <Send className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    )
  },
)

ChatInput.displayName = 'ChatInput'
