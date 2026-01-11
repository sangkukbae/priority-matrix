import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Task, QuadrantType } from '@/types/task'
import { generateId } from '@/lib/utils'

interface TaskState {
  tasks: Task[]

  addTask: (task: Omit<Task, 'id' | 'order' | 'createdAt' | 'updatedAt' | 'completed'>) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => boolean
  moveTask: (id: string, quadrant: QuadrantType) => void
  reorderTasks: (quadrant: QuadrantType, activeId: string, overId: string) => void
  toggleComplete: (id: string) => void
  clearAllTasks: () => void

  getTaskById: (id: string) => Task | undefined
  getTasksByQuadrant: (quadrant: QuadrantType) => Task[]
  getTaskStats: () => Record<QuadrantType, number>
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],
      
      addTask: (taskData) => set((state) => {
        const quadrantTasks = state.tasks.filter(t => t.quadrant === taskData.quadrant)
        const newOrder = quadrantTasks.length
        return {
          tasks: [
            ...state.tasks,
            {
              ...taskData,
              id: generateId(),
              order: newOrder,
              completed: false,
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
      
      moveTask: (id, quadrant) => set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === id
            ? { ...task, quadrant, updatedAt: new Date().toISOString() }
            : task
        ),
      })),

      reorderTasks: (quadrant, activeId, overId) => set((state) => {
        const quadrantTasks = state.tasks
          .filter(t => t.quadrant === quadrant)
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
      
      clearAllTasks: () => set({ tasks: [] }),

      getTaskById: (id): Task | undefined => {
        return get().tasks.find((task) => task.id === id)
      },

      getTasksByQuadrant: (quadrant) => {
        return get().tasks
          .filter((task) => task.quadrant === quadrant)
          .sort((a, b) => a.order - b.order)
      },
      
      getTaskStats: () => {
        const tasks = get().tasks
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
    }
  )
)
