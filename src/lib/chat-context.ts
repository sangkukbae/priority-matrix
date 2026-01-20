import type { AIPromptMessage, ChatContextOptions, ChatMessage } from '@/types/chat'
import type { Label, QuadrantType, Task, TaskPriority } from '@/types/task'

export const SYSTEM_PROMPT_KO = `당신은 Priority Metrix 작업 관리 앱의 AI 어시스턴트입니다.

## 역할
- 사용자의 작업(태스크) 관련 질문에 정확하게 답변합니다
- 현재 작업 목록을 기반으로 실제 데이터를 제공합니다
- 작업 관리에 대한 조언과 제안을 합니다

## 아이젠하워 매트릭스 사분면
- 해야 할 일 (DO): 긴급하고 중요한 작업 - 즉시 처리해야 함
- 계획할 일 (PLAN): 긴급하지 않지만 중요한 작업 - 일정을 계획해야 함
- 위임할 일 (DELEGATE): 긴급하지만 중요하지 않은 작업 - 다른 사람에게 위임
- 삭제할 일 (DELETE): 긴급하지도 중요하지도 않은 작업 - 제거 고려

## 우선순위 레벨
- 높음 (high): 가장 먼저 처리해야 하는 작업
- 중간 (medium): 적절한 시기에 처리할 작업
- 낮음 (low): 여유가 있을 때 처리할 작업
- 없음 (none): 우선순위 미지정

## 지침
- 항상 한국어로 답변합니다
- 작업에 대한 질문에는 아래 제공된 실제 데이터를 기반으로 답변합니다
- 작업이 없는 경우 "현재 등록된 작업이 없습니다"라고 명확히 알려줍니다
- 간결하고 친근한 톤으로 답변합니다
- 작업 추가/수정/삭제는 직접 할 수 없으며, 사용자에게 UI를 통해 하도록 안내합니다

## 현재 작업 상태
{TASK_CONTEXT}`

const QUADRANT_NAMES_KO: Record<QuadrantType, string> = {
  DO: '해야 할 일',
  PLAN: '계획할 일',
  DELEGATE: '위임할 일',
  DELETE: '삭제할 일',
}

const PRIORITY_NAMES_KO: Record<TaskPriority, string> = {
  high: '높음',
  medium: '중간',
  low: '낮음',
  none: '없음',
}

const QUADRANT_ORDER: QuadrantType[] = ['DO', 'PLAN', 'DELEGATE', 'DELETE']

const DEFAULT_OPTIONS: Required<ChatContextOptions> = {
  maxTasks: 50,
  includeDescriptions: false,
  includeLabels: true,
}

const MAX_CHARS_FOR_HISTORY = 8000

function normalizeOptions(options?: ChatContextOptions): Required<ChatContextOptions> {
  return { ...DEFAULT_OPTIONS, ...options }
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  const sliceLength = Math.max(0, maxLength - 3)
  return `${text.slice(0, sliceLength)}...`
}

function stripHtml(html: string): string {
  if (!html) return ''
  if (typeof document === 'undefined') {
    return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  }
  const container = document.createElement('div')
  container.innerHTML = html
  return (container.textContent || '').replace(/\s+/g, ' ').trim()
}

function formatDueDate(dueDate?: string): string {
  if (!dueDate) return ''
  if (dueDate.includes('T')) {
    return dueDate.split('T')[0]
  }
  return dueDate
}

function resolveLabelNames(task: Task, labelsById: Map<string, Label>): string[] {
  if (!task.labels?.length) return []
  const names = task.labels
    .map((id) => labelsById.get(id))
    .filter((label): label is Label => Boolean(label))
    .map((label) => {
      const trimmed = label.name?.trim()
      if (trimmed) return trimmed
      if (label.color) return label.color
      return ''
    })
    .filter((name) => name.length > 0)
  return Array.from(new Set(names))
}

function formatTaskLine(task: Task, labelsById: Map<string, Label>, options: Required<ChatContextOptions>): string {
  const title = truncateText(task.title, 50)
  const priorityKey = task.priority ?? 'none'
  const priority = PRIORITY_NAMES_KO[priorityKey] ?? PRIORITY_NAMES_KO.none
  const parts: string[] = [`우선순위: ${priority}`]

  const dueDate = formatDueDate(task.dueDate)
  if (dueDate) {
    parts.push(`마감일: ${dueDate}`)
  }

  if (options.includeLabels) {
    const labelNames = resolveLabelNames(task, labelsById)
    if (labelNames.length > 0) {
      parts.push(`라벨: ${labelNames.join(', ')}`)
    }
  }

  if (options.includeDescriptions && task.description?.trim()) {
    const description = stripHtml(task.description.trim())
    if (description) {
      parts.push(`설명: ${truncateText(description, 120)}`)
    }
  }

  const suffix = task.completed ? ' [완료]' : ''
  return `"${title}" - ${parts.join(', ')}${suffix}`
}

export function formatTaskContext(
  tasks: Task[],
  labels: Label[],
  options?: ChatContextOptions
): string {
  if (!tasks.length) {
    return '현재 등록된 작업이 없습니다.'
  }

  const resolvedOptions = normalizeOptions(options)
  const totalCount = tasks.length
  const completedCount = tasks.filter((task) => task.completed).length

  const labelsById = new Map(labels.map((label) => [label.id, label]))
  const sortedTasks = [...tasks].sort((a, b) => {
    const quadrantDiff = QUADRANT_ORDER.indexOf(a.quadrant) - QUADRANT_ORDER.indexOf(b.quadrant)
    if (quadrantDiff !== 0) return quadrantDiff
    const orderDiff = (a.order ?? 0) - (b.order ?? 0)
    if (orderDiff !== 0) return orderDiff
    return a.createdAt.localeCompare(b.createdAt)
  })

  const visibleTasks = sortedTasks.slice(0, resolvedOptions.maxTasks)
  const hiddenCount = Math.max(0, totalCount - visibleTasks.length)

  const countsByQuadrant = QUADRANT_ORDER.reduce<Record<QuadrantType, number>>((acc, quadrant) => {
    acc[quadrant] = tasks.filter((task) => task.quadrant === quadrant).length
    return acc
  }, {
    DO: 0,
    PLAN: 0,
    DELEGATE: 0,
    DELETE: 0,
  })

  const tasksByQuadrant = QUADRANT_ORDER.reduce<Record<QuadrantType, Task[]>>((acc, quadrant) => {
    acc[quadrant] = visibleTasks.filter((task) => task.quadrant === quadrant)
    return acc
  }, {
    DO: [],
    PLAN: [],
    DELEGATE: [],
    DELETE: [],
  })

  const lines: string[] = [
    `총 작업: ${totalCount}개 (완료: ${completedCount}개)`,
  ]

  if (hiddenCount > 0) {
    lines.push(`표시 제한: 총 ${totalCount}개 중 ${visibleTasks.length}개만 표시 (나머지 ${hiddenCount}개 생략)`)
  }

  lines.push('')

  QUADRANT_ORDER.forEach((quadrant) => {
    lines.push(`[${QUADRANT_NAMES_KO[quadrant]}] ${countsByQuadrant[quadrant]}개`)
    const quadrantTasks = tasksByQuadrant[quadrant]
    if (quadrantTasks.length === 0) {
      lines.push('등록된 작업 없음')
    } else {
      quadrantTasks.forEach((task, index) => {
        lines.push(`${index + 1}. ${formatTaskLine(task, labelsById, resolvedOptions)}`)
      })
    }
    lines.push('')
  })

  return lines.join('\n').trim()
}

export function buildSystemPrompt(taskContext: string): string {
  return SYSTEM_PROMPT_KO.replace('{TASK_CONTEXT}', taskContext)
}

export function buildPromptWithContext(
  userMessage: string,
  tasks: Task[],
  labels: Label[],
  options?: ChatContextOptions
): { systemPrompt: string; userPrompt: string } {
  const taskContext = formatTaskContext(tasks, labels, options)
  return {
    systemPrompt: buildSystemPrompt(taskContext),
    userPrompt: userMessage,
  }
}

export function buildConversationHistory(
  messages: ChatMessage[],
  maxMessages: number = 10
): AIPromptMessage[] {
  const completedMessages = messages.filter(
    (message) => message.content && message.content.trim().length > 0
  )

  let recentMessages = completedMessages.slice(-maxMessages)

  while (recentMessages.length > 0 && recentMessages[0].role === 'assistant') {
    recentMessages = recentMessages.slice(1)
  }

  if (recentMessages.length > 0 && recentMessages[recentMessages.length - 1].role === 'user') {
    recentMessages = recentMessages.slice(0, -1)
  }

  let totalChars = recentMessages.reduce((sum, message) => sum + message.content.length, 0)

  while (totalChars > MAX_CHARS_FOR_HISTORY && recentMessages.length > 2) {
    recentMessages = recentMessages.slice(2)
    totalChars = recentMessages.reduce((sum, message) => sum + message.content.length, 0)
  }

  return recentMessages.map((message) => ({
    role: message.role,
    content: message.content,
  }))
}
