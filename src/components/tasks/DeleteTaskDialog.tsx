'use client'

import React from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import type { Task } from '@/types/task'

interface DeleteTaskDialogProps {
  task: Task | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export const DeleteTaskDialog: React.FC<DeleteTaskDialogProps> = ({
  task,
  open,
  onOpenChange,
  onConfirm,
}) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-lg max-w-sm border-[#DFE1E6]">
        <AlertDialogHeader className="space-y-3">
          <AlertDialogTitle className="text-[#172B4D] text-base font-semibold">
            정말로 삭제하시겠습니까?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-[#5E6C84] text-sm">
            {task && (
              <>
                <span className="font-medium text-[#172B4D]">
                  &quot;{task.title}&quot;
                </span>
                {' '}작업이 영구적으로 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-4 flex-row sm:justify-end gap-2">
          <AlertDialogCancel className="rounded border-[#DFE1E6] bg-transparent hover:bg-[#F4F5F7] text-[#42526E] h-8 px-3 text-sm">
            취소
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              onConfirm()
            }}
            className="rounded bg-[#EB5A46] hover:bg-[#D64538] text-white h-8 px-3 text-sm font-medium focus:ring-[#EB5A46]"
          >
            삭제
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
