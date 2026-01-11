export type QuadrantType = 'DO' | 'PLAN' | 'DELEGATE' | 'DELETE'

export type TaskPriority = 'high' | 'medium' | 'low' | 'none'

export type ColorTag = 'green' | 'yellow' | 'blue' | 'red'

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
}
