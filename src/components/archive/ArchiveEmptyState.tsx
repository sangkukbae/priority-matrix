import { Archive } from 'lucide-react'

export function ArchiveEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Archive className="w-12 h-12 text-[#6B778C] mb-4" />
      <p className="text-sm font-medium text-[#172B4D]">
        아카이브된 작업이 없습니다
      </p>
      <p className="text-xs text-[#6B778C] mt-1">
        작업을 아카이브하면 여기에 표시됩니다
      </p>
    </div>
  )
}
