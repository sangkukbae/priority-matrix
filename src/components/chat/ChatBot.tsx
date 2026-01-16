import { useCallback, useEffect, useRef, useState } from 'react'
import { ChatPanel } from './ChatPanel'
import { ChatHeader } from './ChatHeader'
import { ChatMessages } from './ChatMessages'
import { ChatInput } from './ChatInput'
import { ChatAvailability } from './ChatAvailability'
import { ChatFAB } from './ChatFAB'
import { useChatStore } from '@/store/chatStore'
import { getChatAvailabilityStatus, streamChatResponse } from '@/lib/chat-ai'
import { useTaskStore } from '@/store/taskStore'
import { buildPromptWithContext } from '@/lib/chat-context'

export function ChatBot() {
  const {
    messages,
    isOpen,
    isLoading,
    availabilityStatus,
    error,
    toggleChat,
    addMessage,
    updateLastMessage,
    setLoading,
    setAvailabilityStatus,
    setError,
  } = useChatStore()
  const tasks = useTaskStore((state) => state.tasks)
  const labels = useTaskStore((state) => state.labels)

  const inputRef = useRef<HTMLTextAreaElement>(null)
  const controllerRef = useRef<AbortController | null>(null)
  const [statusMessage, setStatusMessage] = useState('')

  useEffect(() => {
    let mounted = true
    getChatAvailabilityStatus().then((status) => {
      if (!mounted) return
      setAvailabilityStatus(status)
      if (status === 'unavailable') {
        setError('Chrome AI를 사용할 수 없는 환경입니다.')
      } else if (status === 'downloadable') {
        setError('Chrome AI 모델을 먼저 다운로드해야 합니다.')
      } else if (status === 'downloading') {
        setError('Chrome AI 모델이 다운로드 중입니다. 잠시 후 다시 시도해주세요.')
      }
    })

    return () => {
      mounted = false
    }
  }, [setAvailabilityStatus, setError])

  const handleClose = useCallback(() => {
    controllerRef.current?.abort()
    toggleChat()
  }, [toggleChat])

  useEffect(() => {
    if (isOpen) {
      const timeout = window.setTimeout(() => {
        inputRef.current?.focus()
      }, 50)
      return () => window.clearTimeout(timeout)
    }
    return undefined
  }, [isOpen])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        event.preventDefault()
        handleClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, handleClose])

  useEffect(() => () => controllerRef.current?.abort(), [])

  const handleToggle = () => {
    if (isOpen) {
      handleClose()
      return
    }
    toggleChat()
  }

  const handleSend = async (prompt: string) => {
    if (!prompt.trim()) return
    if (availabilityStatus !== 'available') {
      setError('Chrome AI를 사용할 수 없습니다.')
      return
    }

    controllerRef.current?.abort()
    controllerRef.current = new AbortController()

    addMessage({ role: 'user', content: prompt })
    addMessage({ role: 'assistant', content: '' })
    setLoading(true)
    setError(null)
    setStatusMessage('AI가 응답을 생성하고 있습니다...')

    try {
      const loweredPrompt = prompt.toLowerCase()
      const hasTaskReference = tasks.some((task) =>
        task.title && loweredPrompt.includes(task.title.toLowerCase())
      )
      const includeDescriptions =
        /설명|상세|자세히|내용|detail|details|explain/i.test(prompt) || hasTaskReference
      const { systemPrompt } = buildPromptWithContext(prompt, tasks, labels, { includeDescriptions })
      await streamChatResponse(
        prompt,
        (text) => updateLastMessage(text),
        controllerRef.current.signal,
        { systemPrompt }
      )
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        setStatusMessage('스트리밍이 취소되었습니다.')
      } else {
        const errorMessage = (err as Error).message || '응답 중 오류가 발생했습니다.'
        setError(errorMessage)
      }
    } finally {
      setLoading(false)
      setStatusMessage('')
    }
  }

  const handleStop = () => {
    controllerRef.current?.abort()
    setLoading(false)
  }

  const shouldDisableInput = isLoading || availabilityStatus !== 'available'

  return (
    <>
      <ChatFAB isOpen={isOpen} isLoading={isLoading} availabilityStatus={availabilityStatus} onToggle={handleToggle} />

      <ChatPanel isOpen={isOpen}>
        <ChatHeader onClose={handleClose} availabilityStatus={availabilityStatus} error={error} />
        <ChatMessages messages={messages} />
        <ChatAvailability availabilityStatus={availabilityStatus} />
        <ChatInput
          ref={inputRef}
          onSend={handleSend}
          disabled={shouldDisableInput}
          isLoading={isLoading}
          onStop={handleStop}
        />
        <div className="sr-only" aria-live="polite">
          {statusMessage || error || ''}
        </div>
      </ChatPanel>
    </>
  )
}
