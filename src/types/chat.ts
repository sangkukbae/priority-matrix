export type ChatRole = 'user' | 'assistant'

export type ChatAvailabilityStatus = 
  | 'available'
  | 'downloading'
  | 'downloadable'
  | 'unavailable'
  | 'checking'

export interface ChatMessage {
  id: string
  role: ChatRole
  content: string
  timestamp: Date
}

export interface ChatState {
  messages: ChatMessage[]
  isOpen: boolean
  isLoading: boolean
  availabilityStatus: ChatAvailabilityStatus
  error: string | null
}

export interface ChatStore extends ChatState {
  toggleChat: () => void
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void
  updateLastMessage: (content: string) => void
  setLoading: (loading: boolean) => void
  setAvailabilityStatus: (status: ChatAvailabilityStatus) => void
  setError: (error: string | null) => void
  clearMessages: () => void
}

export interface ChatContextOptions {
  maxTasks?: number
  includeDescriptions?: boolean
  includeLabels?: boolean
}

export interface StreamChatOptions {
  systemPrompt?: string
  signal?: AbortSignal
}
