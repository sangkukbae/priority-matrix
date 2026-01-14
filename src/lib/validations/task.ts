import { z } from 'zod'

export const QUADRANT_ENUM = ['DO', 'PLAN', 'DELEGATE', 'DELETE'] as const
export const PRIORITY_ENUM = ['high', 'medium', 'low', 'none'] as const

export const checklistItemSchema = z.object({
  id: z.string(),
  text: z.string().min(1, '체크리스트 항목은 빈칸일 수 없습니다'),
  completed: z.boolean(),
})

export const labelSchema = z.object({
  id: z.string(),
  name: z.string().max(50, '레이블 이름은 50자 이내로 입력해주세요'),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, '올바른 색상 코드를 입력해주세요'),
})

export const taskFormSchema = z.object({
  title: z
    .string()
    .min(1, '작업 제목은 필수입니다')
    .max(100, '제목은 100자 이내로 입력해주세요'),
  
  description: z
    .string()
    .max(500, '설명은 500자 이내로 입력해주세요')
    .optional(),
  
  quadrant: z.enum(QUADRANT_ENUM),
  
  priority: z.enum(PRIORITY_ENUM),
  
  dueDate: z
    .string()
    .optional()
    .refine(
      (date) => !date || !isNaN(Date.parse(date)),
      '올바른 날짜 형식을 입력해주세요'
    ),

  checklist: z.array(checklistItemSchema).optional(),
  labels: z.array(z.string()).optional(),
})

export type TaskFormSchema = z.infer<typeof taskFormSchema>
