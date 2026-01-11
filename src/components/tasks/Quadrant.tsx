import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { TaskCard } from './TaskCard'
import { QuickAddForm } from './QuickAddForm'
import type { Task, QuadrantType } from '@/types/task'
import { cn } from '@/lib/utils'

const MAX_TASKS_PER_QUADRANT = 10

interface QuadrantProps {
  id: QuadrantType
  title: string
  tasks: Task[]
  taskCount: number
  onEditTask: (task: Task) => void
  onDeleteTask: (taskId: string) => void
  onToggleComplete: (taskId: string) => void
}

const quadrantColors = {
  DO: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    header: 'bg-red-100 text-red-800',
    accent: 'bg-red-500',
  },
  PLAN: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    header: 'bg-blue-100 text-blue-800',
    accent: 'bg-blue-500',
  },
  DELEGATE: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    header: 'bg-yellow-100 text-yellow-800',
    accent: 'bg-yellow-500',
  },
  DELETE: {
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    header: 'bg-gray-100 text-gray-800',
    accent: 'bg-gray-500',
  },
}

export function Quadrant({
  id,
  title,
  tasks,
  taskCount,
  onEditTask,
  onDeleteTask,
  onToggleComplete,
}: QuadrantProps) {
  const { setNodeRef, isOver } = useDroppable({ id })

  const colors = quadrantColors[id]

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex flex-col rounded-xl border-2 transition-all duration-200',
        colors.bg,
        colors.border,
        isOver && 'ring-2 ring-trello-blue ring-offset-2 scale-[1.02]',
      )}
    >
      {/* Quadrant header */}
      <div
        className={cn(
          'flex items-center justify-between px-4 py-3 rounded-t-xl',
          colors.header,
        )}
      >
        <div className="flex items-center gap-2">
          <div className={cn('w-3 h-3 rounded-full', colors.accent)} />
          <h2 className="font-semibold text-sm">{title}</h2>
        </div>
        <span
          className={cn(
            'px-2 py-0.5 rounded-full text-xs font-medium',
            'bg-white/50',
          )}
        >
          {taskCount}
        </span>
      </div>

      {/* Task list area */}
      <div className="flex-1 p-3 space-y-2 min-h-[200px]">
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
              onToggleComplete={onToggleComplete}
            />
          ))}
        </SortableContext>

        {/* Empty state */}
        {tasks.length === 0 && (
          <div
            className={cn(
              'flex items-center justify-center py-8 text-sm',
              'text-gray-400 border-2 border-dashed border-gray-300 rounded-lg',
              isOver && 'border-trello-blue bg-trello-blue/5',
            )}
          >
            여기에 작업 추가
          </div>
        )}
      </div>

      {/* Quick add form */}
      <div className="p-3 pt-0">
        {taskCount >= MAX_TASKS_PER_QUADRANT ? (
          <div className="text-xs text-[#6B778C] text-center py-2">
            작업은 최대 10개 이상 추가할 수 없습니다.
          </div>
        ) : (
          <QuickAddForm quadrant={id} />
        )}
      </div>
    </div>
  )
}
