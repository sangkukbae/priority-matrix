import { forwardRef, useState } from 'react'
import { Send, Square } from 'lucide-react'
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

    const isStopButton = isLoading && onStop
    const handleButtonClick = isStopButton ? onStop : handleSubmit
    // If loading, button is enabled (for stop). If not loading, follow disabled prop or empty value.
    const isButtonDisabled = isStopButton ? false : (disabled || !value.trim())

    return (
      <div className="border-t border-[var(--color-trello-border)] bg-[#FFFFFF] p-4 space-y-3">
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
            placeholder={isLoading ? "AI가 응답을 생성하고 있습니다..." : "무엇을 도와드릴까요? (Shift+Enter로 줄바꿈)"}
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
            onClick={handleButtonClick}
            className={clsx(
              'inline-flex items-center justify-center rounded-[12px] px-3.5 py-3 h-[48px] min-w-[48px]',
              'transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
              isStopButton
                ? 'bg-[#EBECF0] text-[#172B4D] hover:bg-[#DFE1E6] focus-visible:ring-[#8590A2]'
                : 'bg-[var(--color-trello-blue)] text-white shadow-[var(--shadow-trello-card)] hover:shadow-[var(--shadow-trello-card-hover)] focus-visible:ring-[var(--color-trello-blue)]',
              isButtonDisabled && 'opacity-60 cursor-not-allowed'
            )}
            aria-label={isStopButton ? "생성 중지" : "메시지 전송"}
            disabled={isButtonDisabled}
          >
            {isStopButton ? (
              <Square className="h-4 w-4 fill-current" aria-hidden="true" />
            ) : (
              <Send className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>
    )
  },
)

ChatInput.displayName = 'ChatInput'
