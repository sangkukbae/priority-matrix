import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Task, QuadrantType, Label } from '@/types/task'
import { DEFAULT_LABEL_COLORS } from '@/types/task'
import { generateId } from '@/lib/utils'

interface TaskState {
  tasks: Task[]
  labels: Label[]

  addTask: (task: Omit<Task, 'id' | 'order' | 'createdAt' | 'updatedAt' | 'completed' | 'archived' | 'archivedAt'>) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => boolean
  archiveTask: (id: string) => void
  restoreTask: (id: string) => void
  permanentlyDeleteTask: (id: string) => boolean
  moveTask: (id: string, quadrant: QuadrantType) => void
  reorderTasks: (quadrant: QuadrantType, activeId: string, overId: string) => void
  toggleComplete: (id: string) => void
  clearAllTasks: () => void

  addLabel: (label: Omit<Label, 'id'>) => void
  updateLabel: (id: string, updates: Partial<Label>) => void
  deleteLabel: (id: string) => void
  getLabelById: (id: string) => Label | undefined

  getTaskById: (id: string) => Task | undefined
  getTasksByQuadrant: (quadrant: QuadrantType) => Task[]
  getArchivedTasks: () => Task[]
  getTaskStats: () => Record<QuadrantType, number>
}

type PersistedTaskState = {
  tasks?: Task[]
  labels?: Label[]
} & Record<string, unknown>

const isPersistedTaskState = (value: unknown): value is PersistedTaskState =>
  typeof value === 'object' && value !== null

const initialLabels: Label[] = DEFAULT_LABEL_COLORS.map((item, index) => ({
  id: `label-${index + 1}`,
  name: '',
  color: item.color,
}))

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],
      labels: initialLabels,
      
      addTask: (taskData) => set((state) => {
        const quadrantTasks = state.tasks.filter(
          t => t.quadrant === taskData.quadrant && !t.archived
        )
        const newOrder = quadrantTasks.length
        return {
          tasks: [
            ...state.tasks,
            {
              ...taskData,
              id: generateId(),
              order: newOrder,
              completed: false,
              archived: false,
              archivedAt: undefined,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            } as Task,
          ],
        }
      }),
      
      updateTask: (id, updates) => set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === id
            ? { ...task, ...updates, updatedAt: new Date().toISOString() }
            : task
        ),
      })),
      
      deleteTask: (id): boolean => {
        const taskExists = get().tasks.some((task) => task.id === id)

        if (!taskExists) {
          console.warn(`Task with id ${id} not found`)
          return false
        }

        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        }))

        return true
      },

      archiveTask: (id) => set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === id
            ? {
                ...task,
                archived: true,
                archivedAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              }
            : task
        ),
      })),

      restoreTask: (id) => set((state) => {
        const task = state.tasks.find(t => t.id === id)
        if (!task) return state

        const quadrantTasks = state.tasks.filter(
          t => t.quadrant === task.quadrant && !t.archived
        )
        const newOrder = quadrantTasks.length

        return {
          tasks: state.tasks.map((t) =>
            t.id === id
              ? {
                  ...t,
                  archived: false,
                  archivedAt: undefined,
                  order: newOrder,
                  updatedAt: new Date().toISOString(),
                }
              : t
          ),
        }
      }),

      permanentlyDeleteTask: (id) => {
        const taskExists = get().tasks.some((task) => task.id === id)
        if (!taskExists) return false
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        }))
        return true
      },
      
      moveTask: (id, quadrant) => set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === id && !task.archived
            ? { ...task, quadrant, updatedAt: new Date().toISOString() }
            : task
        ),
      })),

      reorderTasks: (quadrant, activeId, overId) => set((state) => {
        const quadrantTasks = state.tasks
          .filter(t => t.quadrant === quadrant && !t.archived)
          .sort((a, b) => a.order - b.order)

        const activeIndex = quadrantTasks.findIndex(t => t.id === activeId)
        const overIndex = quadrantTasks.findIndex(t => t.id === overId)

        if (activeIndex === -1 || overIndex === -1 || activeIndex === overIndex) {
          return state
        }

        const reorderedTasks = [...quadrantTasks]
        const [movedTask] = reorderedTasks.splice(activeIndex, 1)
        reorderedTasks.splice(overIndex, 0, movedTask)

        return {
          tasks: state.tasks.map(task => {
            if (task.quadrant !== quadrant) return task
            const newIndex = reorderedTasks.findIndex(t => t.id === task.id)
            return newIndex >= 0 ? { ...task, order: newIndex } : task
          }),
        }
      }),
      
      toggleComplete: (id) => set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === id
            ? { ...task, completed: !task.completed, updatedAt: new Date().toISOString() }
            : task
        ),
      })),
      
      clearAllTasks: () => set({ tasks: [], labels: initialLabels }),

      addLabel: (labelData) => set((state) => ({
        labels: [
          ...state.labels,
          { ...labelData, id: generateId() },
        ],
      })),

      updateLabel: (id, updates) => set((state) => ({
        labels: state.labels.map((label) =>
          label.id === id ? { ...label, ...updates } : label
        ),
        tasks: state.tasks.map((task) =>
          task.labels?.includes(id)
            ? { ...task, updatedAt: new Date().toISOString() }
            : task
        ),
      })),

      deleteLabel: (id) => set((state) => ({
        labels: state.labels.filter((label) => label.id !== id),
        tasks: state.tasks.map((task) => ({
          ...task,
          labels: task.labels?.filter((labelId) => labelId !== id),
        })),
      })),

      getLabelById: (id) => {
        return get().labels.find((label) => label.id === id)
      },

      getTaskById: (id): Task | undefined => {
        return get().tasks.find((task) => task.id === id)
      },

      getTasksByQuadrant: (quadrant) => {
        return get().tasks
          .filter((task) => task.quadrant === quadrant && !task.archived)
          .sort((a, b) => a.order - b.order)
      },

      getArchivedTasks: () => {
        return get().tasks
          .filter((task) => task.archived)
          .sort((a, b) => {
            const dateA = a.archivedAt ? new Date(a.archivedAt).getTime() : 0
            const dateB = b.archivedAt ? new Date(b.archivedAt).getTime() : 0
            return dateB - dateA
          })
      },
      
      getTaskStats: () => {
        const tasks = get().tasks.filter(t => !t.archived)
        return {
          DO: tasks.filter((t) => t.quadrant === 'DO').length,
          PLAN: tasks.filter((t) => t.quadrant === 'PLAN').length,
          DELEGATE: tasks.filter((t) => t.quadrant === 'DELEGATE').length,
          DELETE: tasks.filter((t) => t.quadrant === 'DELETE').length,
        }
      },
    }),
    {
      name: 'priority-metrix-storage',
      version: 2,
      migrate: (persistedState, version) => {
        if (!isPersistedTaskState(persistedState)) {
          return { tasks: [], labels: initialLabels }
        }

        let nextState: PersistedTaskState = { ...persistedState }

        const labels = nextState.labels ? [...nextState.labels] : [...initialLabels]
        nextState.labels = labels

        if (version < 1) {
          const colorTagToColor: Record<string, string> = {
            green: '#61BD4F',
            yellow: '#F2D600',
            blue: '#0079BF',
            red: '#EB5A46',
          }

          const labelsByColor = new Map<string, string>()
          const nextLabelId = () => `label-${labelsByColor.size + 1}`

          labels.forEach((label: Label) => {
            labelsByColor.set(label.color, label.id)
          })

          const tasks = (nextState.tasks || []).map((task: Task) => {
            if (!task.colorTag) return task
            const mappedColor = colorTagToColor[task.colorTag]
            if (!mappedColor) return { ...task, labels: [] }

            if (!labelsByColor.has(mappedColor)) {
              const newId = nextLabelId()
              labels.push({ id: newId, name: '', color: mappedColor })
              labelsByColor.set(mappedColor, newId)
            }

            const labelId = labelsByColor.get(mappedColor)
            return {
              ...task,
              labels: labelId ? [labelId] : [],
              colorTag: undefined,
            }
          })

          nextState = {
            ...nextState,
            tasks,
          }
        }

        if (version < 2) {
          nextState.tasks = (nextState.tasks || []).map((task: Task) => ({
            ...task,
            archived: task.archived ?? false,
            archivedAt: task.archivedAt,
          }))
        }

        return nextState
      },
    }
  )
)
