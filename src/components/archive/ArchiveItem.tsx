import { useMemo } from 'react'
import { Calendar, CheckCircle2, Trash2, Undo2 } from 'lucide-react'
import type { Label, Task } from '@/types/task'
import { formatDateCompact } from '@/lib/utils'

interface ArchiveItemProps {
  task: Task
  onRestore: (id: string) => void
  onDelete: (id: string) => void
  labels: Label[]
}

export function ArchiveItem({ task, onRestore, onDelete, labels }: ArchiveItemProps) {
  const labelMap = useMemo(() => new Map(labels.map((label) => [label.id, label.color])), [labels])
  const labelColors = useMemo(() => {
    if (!task.labels?.length) return []
    return task.labels
      .map((id) => labelMap.get(id))
      .filter((color): color is string => Boolean(color))
  }, [task.labels, labelMap])

  const checklistTotal = task.checklist?.length ?? 0
  const checklistCompleted = task.checklist?.filter((item) => item.completed).length ?? 0

  return (
    <div className="rounded-lg border border-[#DFE1E6] bg-white p-3 shadow-sm">
      {labelColors.length > 0 && (
        <div className="flex gap-1 pb-2">
          {labelColors.map((color, idx) => (
            <div
              key={`${task.id}-label-${idx}`}
              className="h-2 flex-1 rounded-full"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      )}

      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-medium text-[#172B4D] break-words">
              {task.title}
            </h4>
            <span className="rounded-full bg-[#091E420F] px-2 py-0.5 text-[10px] font-semibold text-[#6B778C]">
              Archived
            </span>
          </div>

          {task.dueDate && (
            <div className="mt-1 flex items-center gap-1 text-xs text-[#6B778C]">
              <Calendar className="h-3.5 w-3.5" />
              <span>{formatDateCompact(task.dueDate)}</span>
            </div>
          )}

          {checklistTotal > 0 && (
            <div className="mt-1 flex items-center gap-1 text-xs text-[#6B778C]">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>
                {checklistCompleted}/{checklistTotal}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onRestore(task.id)}
            className="rounded-md p-1 text-[#6B778C] transition-colors hover:bg-[#E3F2FD] hover:text-[#0079BF]"
            aria-label="복원"
          >
            <Undo2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(task.id)}
            className="rounded-md p-1 text-[#6B778C] transition-colors hover:bg-[#FFE2E2] hover:text-[#EB5A46]"
            aria-label="영구 삭제"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
