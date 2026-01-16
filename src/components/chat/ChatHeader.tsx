import { X, ShieldCheck, AlertTriangle, Download, Loader2 } from 'lucide-react'
import clsx from 'clsx'
import type { ChatAvailabilityStatus } from '@/types/chat'

interface ChatHeaderProps {
  onClose: () => void
  availabilityStatus: ChatAvailabilityStatus
  error: string | null
}

export function ChatHeader({ onClose, availabilityStatus, error }: ChatHeaderProps) {
  const getStatusDisplay = () => {
    switch (availabilityStatus) {
      case 'available':
        return { label: '사용 가능', icon: <ShieldCheck className="h-4 w-4" aria-hidden="true" />, color: 'bg-[#E3F2FD] text-[#0D47A1] border-[#B3D4F5]' }
      case 'downloading':
        return { label: '다운로드 중', icon: <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />, color: 'bg-[#FFF3E0] text-[#E65100] border-[#FFB74D]' }
      case 'downloadable':
        return { label: '다운로드 필요', icon: <Download className="h-4 w-4" aria-hidden="true" />, color: 'bg-[#FFF3E0] text-[#E65100] border-[#FFB74D]' }
      case 'checking':
        return { label: '확인 중', icon: <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />, color: 'bg-[#F4F5F7] text-[#42526E] border-[#DFE1E6]' }
      default:
        return { label: '사용 불가', icon: <AlertTriangle className="h-4 w-4" aria-hidden="true" />, color: 'bg-[#FFE2E2] text-[#8B0000] border-[#EB5A46]' }
    }
  }

  const status = getStatusDisplay()

  return (
    <header className="flex items-center justify-between px-5 py-4 bg-white text-[#172B4D] border-b border-[var(--color-trello-border)]">
      <div className="flex items-center gap-3">
        <h2 className="text-base font-semibold">AI 챗봇</h2>
        <span
          className={clsx(
            'px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 border',
            status.color
          )}
          aria-label={`가용성: ${status.label}`}
        >
          {status.icon}
          {status.label}
        </span>
      </div>

      <button
        type="button"
        onClick={onClose}
        aria-label="챗봇 닫기"
        className="p-2 rounded-md text-[#42526E] hover:bg-[#F4F5F7] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-trello-blue)]"
      >
        <X className="h-5 w-5" aria-hidden="true" />
      </button>
      {error ? (
        <span className="sr-only" aria-live="assertive">{error}</span>
      ) : null}
    </header>
  )
}
