import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Calendar, CheckCircle2, Circle, Flag } from 'lucide-react'
import { format } from 'date-fns'
import type { Task } from '@/types/task'
import { cn } from '@/lib/utils'
import { SafeHtmlRenderer } from '@/components/ui/SafeHtmlRenderer'
import { useTaskStore } from '@/store/taskStore'

interface TaskCardProps {
  task: Task
  onEdit?: (task: Task) => void
  onDelete?: (taskId: string) => void
  onToggleComplete?: (taskId: string) => void
}

const priorityConfig = {
  high: { color: 'text-red-600', icon: Flag, label: '높음' },
  medium: { color: 'text-yellow-600', icon: Flag, label: '중간' },
  low: { color: 'text-blue-600', icon: Flag, label: '낮음' },
  none: { color: 'text-gray-400', icon: Flag, label: '없음' },
}

export function TaskCard({
  task,
  onEdit,
  onDelete,
  onToggleComplete,
}: TaskCardProps) {
  const getLabelById = useTaskStore((state) => state.getLabelById)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const priority = priorityConfig[task.priority]
  const PriorityIcon = priority.icon

  const labelColors = task.labels
    ?.map((id) => getLabelById(id))
    .filter(Boolean)
    .map((label) => label!.color)

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onEdit?.(task)
    }
    if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault()
      onDelete?.(task.id)
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className={cn(
        'group relative bg-white rounded-lg',
        'border border-[#DFE1E6]',
        'transition-all duration-200 ease',
        'cursor-grab active:cursor-grabbing',
        'focus:outline-none focus:ring-2 focus:ring-[#0079BF] focus:ring-offset-1',
        'hover:bg-[#F4F5F7]',
        isDragging && 'opacity-50 scale-105 z-50 rotate-2',
        task.completed && 'opacity-60',
      )}
      role="button"
      aria-label={`${task.title}${task.completed ? ' (완료됨)' : ''}`}
    >
      {labelColors && labelColors.length > 0 && (
        <div className="flex gap-1 px-3 pt-3 pb-1">
          {labelColors.map((color, idx) => (
            <div
              key={`${color}-${idx}`}
              className="h-2 flex-1 rounded-full"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      )}

      {!labelColors?.length && task.colorTag && (
        <div
          className={cn(
            'absolute left-0 top-0 bottom-0 w-1 rounded-l-lg',
            task.colorTag === 'green' && 'bg-[#61BD4F]',
            task.colorTag === 'yellow' && 'bg-[#F2D600]',
            task.colorTag === 'blue' && 'bg-[#0079BF]',
            task.colorTag === 'red' && 'bg-[#EB5A46]',
          )}
        />
      )}

      <div className="p-3 pl-4">
        {/* Header: Title and actions */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3
            className={cn(
              'font-medium text-[#172B4D] text-sm leading-snug',
              task.completed && 'line-through text-[#6B778C]',
            )}
          >
            {task.title}
          </h3>

          {/* Action buttons - shown on hover */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onToggleComplete?.(task.id)
              }}
              onKeyDown={(e) => e.stopPropagation()}
              className={cn(
                'p-1 rounded transition-colors',
                task.completed
                  ? 'text-[#61BD4F]'
                  : 'text-[#6B778C] hover:text-[#61BD4F] hover:bg-[#E6F4EA]',
              )}
              aria-label={task.completed ? '미완료로 표시' : '완료로 표시'}
            >
              {task.completed ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <Circle className="w-4 h-4" />
              )}
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation()
                onEdit?.(task)
              }}
              onKeyDown={(e) => e.stopPropagation()}
              className={cn(
                'p-1 rounded transition-colors',
                'text-[#6B778C] hover:text-[#0079BF] hover:bg-[#E3F2FD]',
              )}
              aria-label="수정"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete?.(task.id)
              }}
              onKeyDown={(e) => e.stopPropagation()}
              className={cn(
                'p-1 rounded transition-colors',
                'text-[#6B778C] hover:text-[#EB5A46] hover:bg-[#FFE2E2]',
              )}
              aria-label="삭제"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Description */}
        {task.description && (
          <div className="text-xs text-[#6B778C] mb-3 line-clamp-2">
            <SafeHtmlRenderer
              html={task.description}
              className="safe-html-content-compact"
            />
          </div>
        )}

        {/* Footer: Priority and due date */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Priority badge */}
            {task.priority !== 'none' && (
              <span
                className={cn(
                  'inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium',
                  priority.color,
                  'bg-current/10',
                )}
              >
                <PriorityIcon className="w-3 h-3" />
                {priority.label}
              </span>
            )}
          </div>

          {/* Due date */}
          {task.dueDate && (
            <div
              className={cn(
                'inline-flex items-center gap-1 text-xs',
                'text-[#6B778C]',
              )}
            >
              <Calendar className="w-3 h-3" />
              <span>{format(new Date(task.dueDate), 'MMM d')}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
