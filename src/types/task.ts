export type QuadrantType = 'DO' | 'PLAN' | 'DELEGATE' | 'DELETE'

export type TaskPriority = 'high' | 'medium' | 'low' | 'none'

export type ColorTag = 'green' | 'yellow' | 'blue' | 'red'

export interface Label {
  id: string
  name: string
  color: string
}

export const DEFAULT_LABEL_COLORS = [
  { name: 'green', color: '#61BD4F' },
  { name: 'dark-green', color: '#519839' },
  { name: 'olive', color: '#B3A000' },
  { name: 'orange', color: '#D29034' },
  { name: 'red', color: '#CD5A46' },
  { name: 'purple', color: '#89609E' },
  { name: 'pink', color: '#EF9FC1' },
  { name: 'blue', color: '#5BA4CF' },
] as const

export interface ChecklistItem {
  id: string
  text: string
  completed: boolean
}

export interface Task {
  id: string
  title: string
  description?: string
  quadrant: QuadrantType
  priority: TaskPriority
  labels?: string[]
  colorTag?: ColorTag
  dueDate?: string
  checklist?: ChecklistItem[]
  completed: boolean
  order: number
  createdAt: string
  updatedAt: string
}

export interface TaskFormData {
  title: string
  description?: string
  quadrant: QuadrantType
  priority?: TaskPriority
  dueDate?: string
  checklist?: ChecklistItem[]
  labels?: string[]
}
