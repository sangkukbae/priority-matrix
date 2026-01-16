import { create } from 'zustand'
import type { ChatStore, ChatMessage, ChatAvailabilityStatus } from '@/types/chat'
import { generateId } from '@/lib/utils'

const baseState = {
  messages: [] as ChatMessage[],
  isOpen: false,
  isLoading: false,
  availabilityStatus: 'checking' as ChatAvailabilityStatus,
  error: null as string | null,
}

export const useChatStore = create<ChatStore>((set) => ({
  ...baseState,

  toggleChat: () =>
    set((state) => ({
      ...state,
      isOpen: !state.isOpen,
    })),

  addMessage: (message) =>
    set((state) => ({
      ...state,
      messages: [
        ...state.messages,
        {
          ...message,
          id: generateId(),
          timestamp: new Date(),
        } satisfies ChatMessage,
      ],
    })),

  updateLastMessage: (content) =>
    set((state) => {
      if (state.messages.length === 0) return state
      const updated = [...state.messages]
      const lastIndex = updated.length - 1
      updated[lastIndex] = { ...updated[lastIndex], content }
      return { ...state, messages: updated }
    }),

  setLoading: (loading) => set((state) => ({ ...state, isLoading: loading })),

  setAvailabilityStatus: (status) => set((state) => ({ ...state, availabilityStatus: status })),

  setError: (error) => set((state) => ({ ...state, error })),

  clearMessages: () => set((state) => ({ ...state, messages: [] })),
}))
