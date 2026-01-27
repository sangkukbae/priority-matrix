import { useEffect, useMemo, useState } from 'react'
import { Archive, Search, X, ChevronLeft } from 'lucide-react'
import { toast } from 'sonner'
import type { Task } from '@/types/task'
import { cn } from '@/lib/utils'
import { useTaskStore } from '@/store/taskStore'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ArchiveEmptyState } from './ArchiveEmptyState'
import { ArchiveItem } from './ArchiveItem'

interface ArchivePanelProps {
  onClose: () => void
  onBack?: () => void
}

const GROUP_ORDER = ['지난 7일', '지난 30일', '더 오래됨'] as const

type ArchiveGroupKey = (typeof GROUP_ORDER)[number]

type ArchiveGroups = Record<ArchiveGroupKey, Task[]>

function groupByArchiveDate(tasks: Task[]): ArchiveGroups {
  const now = new Date()
  const groups: ArchiveGroups = {
    '지난 7일': [],
    '지난 30일': [],
    '더 오래됨': [],
  }

  tasks.forEach((task) => {
    if (!task.archivedAt) {
      groups['더 오래됨'].push(task)
      return
    }

    const diffDays = Math.floor(
      (now.getTime() - new Date(task.archivedAt).getTime()) / (1000 * 60 * 60 * 24)
    )

    if (diffDays <= 7) groups['지난 7일'].push(task)
    else if (diffDays <= 30) groups['지난 30일'].push(task)
    else groups['더 오래됨'].push(task)
  })

  return groups
}

export function ArchivePanel({ onClose, onBack }: ArchivePanelProps) {
  const tasks = useTaskStore((state) => state.tasks)
  const labels = useTaskStore((state) => state.labels)
  const restoreTask = useTaskStore((state) => state.restoreTask)
  const permanentlyDeleteTask = useTaskStore((state) => state.permanentlyDeleteTask)

  const [query, setQuery] = useState('')

  const archivedTasks = useMemo(() => {
    return tasks
      .filter((task) => task.archived)
      .sort((a, b) => {
        const dateA = a.archivedAt ? new Date(a.archivedAt).getTime() : 0
        const dateB = b.archivedAt ? new Date(b.archivedAt).getTime() : 0
        return dateB - dateA
      })
  }, [tasks])

  const filteredTasks = useMemo(() => {
    if (!query.trim()) return archivedTasks
    const lowered = query.toLowerCase()
    return archivedTasks.filter((task) => task.title.toLowerCase().includes(lowered))
  }, [archivedTasks, query])

  const groupedTasks = useMemo(() => groupByArchiveDate(filteredTasks), [filteredTasks])

  const handleRestore = (id: string) => {
    const task = tasks.find((item) => item.id === id)
    restoreTask(id)
    if (task) {
      toast.success('작업이 복원되었습니다', {
        description: `"${task.title}" 작업이 복원되었습니다.`,
      })
    }
  }

  const handleDelete = (id: string) => {
    const task = tasks.find((item) => item.id === id)
    const success = permanentlyDeleteTask(id)
    if (success) {
      toast.success('작업이 삭제되었습니다', {
        description: task ? `"${task.title}" 작업이 영구 삭제되었습니다.` : undefined,
      })
    } else {
      toast.error('삭제 실패', {
        description: '작업이 존재하지 않습니다.',
      })
    }
  }

  return (
    <div
      className="w-96 rounded-lg border border-[#DFE1E6] bg-white shadow-trello-card flex flex-col max-h-[600px]"
      role="dialog"
      aria-label="아카이브 패널"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#DFE1E6]">
        <div className="flex items-center gap-2">
          {onBack && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="h-8 w-8 rounded-sm text-[#6B778C] hover:bg-[#F4F5F7] -ml-2"
              aria-label="뒤로 가기"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
          )}
          {!onBack && <Archive className="w-5 h-5 text-[#172B4D]" />}
          <h2 className="text-base font-semibold text-[#172B4D]">아카이브</h2>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8 rounded-sm text-[#6B778C] hover:bg-[#F4F5F7]"
          aria-label="닫기"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="px-4 py-3 border-b border-[#DFE1E6]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B778C]" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="작업 제목 검색"
            className="pl-9 text-sm"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {filteredTasks.length === 0 ? (
          <ArchiveEmptyState />
        ) : (
          GROUP_ORDER.map((groupKey) => {
            const groupTasks = groupedTasks[groupKey]
            if (!groupTasks || groupTasks.length === 0) return null
            return (
              <section key={groupKey} className="space-y-2">
                <h3 className="text-xs font-semibold text-[#6B778C] uppercase tracking-wide">
                  {groupKey}
                </h3>
                <div className="space-y-2">
                  {groupTasks.map((task) => (
                    <ArchiveItem
                      key={task.id}
                      task={task}
                      labels={labels}
                      onRestore={handleRestore}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </section>
            )
          })
        )}
      </div>
    </div>
  )
}
