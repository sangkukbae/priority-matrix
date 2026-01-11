# UC-001: 새 작업 추가 - 구현 계획서

**계획서 ID**: IMPL-UC-001  
**유스 케이스**: UC-001: 새 작업 추가  
**버전**: 1.0  
**작성일**: 2026-01-10  
**상태**: 초안 (Draft)

---

## 1. 개요

### 1.1 목적

본 문서는 UC-001 "새 작업 추가" 기능의 구현 계획을 상세히 기술합니다. 아이젠하워 매트릭스 웹 애플리케이션에서 사용자가 Trello 스타일의 깔끔한 인터페이스를 통해 새 작업을 추가할 수 있도록 구현합니다.

### 1.2 범위

| 포함 사항 | 제외 사항 |
|-----------|-----------|
| TaskFormDialog 컴포넌트 (모달) | 드래그 앤 드롭 (UC-005) |
| QuickAddForm 컴포넌트 (인라인) | 작업 수정 (UC-002) |
| Zod 검증 스키마 | 작업 삭제 (UC-003) |
| Zustand 스토어 addTask 액션 | |
| shadcn/ui DatePicker 통합 | |
| Animate UI 애니메이션 | |
| Toast/Sonner 알림 | |

### 1.3 참조 문서

| 문서 | 설명 |
|------|------|
| [PRD](../prd.md) | Product Requirements Document |
| [TRD](../trd.md) | Technical Requirements Document |
| [UC-001](../use-cases/uc-001-add-task.md) | 새 작업 추가 유스 케이스 |
| [DESIGN_SYSTEM.md](../DESIGN_SYSTEM.md) | 디자인 시스템 명세 |

---

## 2. 기술 아키텍처

### 2.1 기술 스택

| 영역 | 기술 | 버전 | 용도 |
|------|------|------|------|
| **프레임워크** | React | 18.x | UI 라이브러리 |
| **빌드 도구** | Vite | 5.x | 번들러 및 개발 서버 |
| **타입 시스템** | TypeScript | 5.x | 타입 안전성 |
| **스타일링** | Tailwind CSS | 3.x | 유틸리티 CSS |
| **UI 라이브러리** | shadcn/ui | 2.x | UI 컴포넌트 |
| **애니메이션** | Animate UI | 1.x | 컴포넌트 애니메이션 |
| **상태 관리** | Zustand | 4.x | 전역 상태 관리 |
| **폼 관리** | React Hook Form | 7.x | 폼 상태 관리 |
| **검증** | Zod | 3.x | 스키마 검증 |
| **아이콘** | Lucide React | 0.x | 아이콘 시스템 |
| **알림** | Sonner | 1.x | 토스트 알림 |

### 2.2 아키텍처 다이어그램

```
┌─────────────────────────────────────────────────────────────────┐
│                        App.tsx                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                   Header Component                         │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │           "작업 추가" Button (Trigger)              │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
│                          ↓                                       │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                TaskFormDialog (Modal)                     │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐  │  │  │
│  │  │  │  Title  │ │Quadrant │ │Priority │ │  Date   │  │  │  │
│  │  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘  │  │  │
│  │  │  ┌───────────────────────────────────────────────┐  │  │  │
│  │  │  │               Description (Textarea)          │  │  │  │
│  │  │  └───────────────────────────────────────────────┘  │  │  │
│  │  │  ┌───────────┐ ┌───────────┐                       │  │  │
│  │  │  │  [취소]   │ │  [추가]   │                       │  │  │
│  │  │  └───────────┘ └───────────┘                       │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
│                          ↓                                       │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    Zustand Store                          │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │                   addTask()                         │  │  │
│  │  │                   tasks[]                           │  │  │
│  │  │                   persist (localStorage)            │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
│                          ↓                                       │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                EisenhowerMatrix                           │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │  ┌───────────────────────────────────────────────┐  │  │  │
│  │  │  │            QuickAddForm (Inline)              │  │  │  │
│  │  │  └───────────────────────────────────────────────┘  │  │  │
│  │  │  ┌───────────────────────────────────────────────┐  │  │  │
│  │  │  │            TaskCard + Animation               │  │  │  │
│  │  │  └───────────────────────────────────────────────┘  │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. 데이터 모델

### 3.1 Task 타입 정의

```typescript
// src/types/task.ts

export type QuadrantType = 'DO' | 'PLAN' | 'DELEGATE' | 'DELETE';

export type TaskPriority = 'high' | 'medium' | 'low' | 'none';

export type ColorTag = 'green' | 'yellow' | 'blue' | 'red';

export interface Task {
  id: string;
  title: string;
  description?: string;
  quadrant: QuadrantType;
  priority: TaskPriority;
  colorTag?: ColorTag;
  dueDate?: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TaskFormData {
  title: string;
  description?: string;
  quadrant: QuadrantType;
  priority?: TaskPriority;
  dueDate?: string;
}
```

### 3.2 Zod 검증 스키마

```typescript
// src/lib/validations/task.ts

import { z } from 'zod';

export const taskFormSchema = z.object({
  title: z
    .string()
    .min(1, '작업 제목은 필수입니다')
    .max(100, '제목은 100자 이내로 입력해주세요'),
  
  description: z
    .string()
    .max(500, '설명은 500자 이내로 입력해주세요')
    .optional(),
  
  quadrant: z.enum(['DO', 'PLAN', 'DELEGATE', 'DELETE'], {
    errorMap: () => ({ message: '사분면을 선택해주세요' }),
  }),
  
  priority: z.enum(['high', 'medium', 'low', 'none']),
  
  dueDate: z
    .string()
    .optional()
    .refine(
      (date) => !date || !isNaN(Date.parse(date)),
      '올바른 날짜 형식을 입력해주세요'
    ),
});

export type TaskFormSchema = z.infer<typeof taskFormSchema>;
```

---

## 4. 파일 구조

```
priority-metrix-web/
├── src/
│   ├── components/
│   │   ├── ui/                                   # shadcn/ui 기본 컴포넌트
│   │   │   ├── button.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── form.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── popover.tsx
│   │   │   ├── calendar.tsx                     # DatePicker용
│   │   │   ├── toast.tsx (sonner)               # ToastProvider
│   │   │   └── ...
│   │   ├── tasks/
│   │   │   ├── TaskFormDialog.tsx               # 🆕 모달 폼 (UC-001)
│   │   │   ├── QuickAddForm.tsx                 # 🆕 인라인 폼 (UC-001)
│   │   │   ├── TaskCard.tsx
│   │   │   └── TaskList.tsx
│   │   ├── matrix/
│   │   │   ├── EisenhowerMatrix.tsx
│   │   │   ├── Quadrant.tsx
│   │   │   └── QuadrantHeader.tsx
│   │   └── animations/
│   │       └── AnimatedWrapper.tsx              # Animate UI 래퍼
│   ├── lib/
│   │   ├── validations/
│   │   │   └── task.ts                          # 🆕 Zod 스키마
│   │   ├── utils.ts
│   │   └── constants.ts
│   ├── store/
│   │   └── taskStore.ts                         # 🆕 Zustand 스토어
│   ├── types/
│   │   └── task.ts                              # 🆕 타입 정의
│   ├── hooks/
│   │   └── useTaskStore.ts
│   ├── App.tsx
│   └── main.tsx
├── tailwind.config.js                           # Trello 색상 설정
├── components.json                              # shadcn 설정
└── package.json
```

---

## 5. 구현 단계

### Phase 1: 프로젝트 초기화

#### 1.1 Vite 프로젝트 생성

```bash
# 프로젝트 초기화
npm create vite@latest priority-metrix-web -- --template react-ts
cd priority-metrix-web

# 의존성 설치
npm install
```

#### 1.2 Tailwind CSS 설정

```bash
# Tailwind CSS 설치
npm install -D tailwindcss@latest postcss autoprefixer
npx tailwindcss init -p
```

**tailwind.config.js (Trello 색상 포함)**

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        trello: {
          blue: '#0079BF',
          navy: '#0C3953',
          light: '#F4F5F7',
          success: '#61BD4F',
          warning: '#F2D600',
          danger: '#EB5A46',
          charcoal: '#172B4D',
          gray: '#6B778C',
          border: '#DFE1E6',
        },
        quadrant: {
          do: { bg: '#FFE2E2', text: '#8B0000', accent: '#EB5A46' },
          plan: { bg: '#E6F4EA', text: '#1E7E34', accent: '#61BD4F' },
          delegate: { bg: '#E3F2FD', text: '#0D47A1', accent: '#0079BF' },
          delete: { bg: '#F5F5F5', text: '#616161', accent: '#9E9E9E' },
        },
      },
      boxShadow: {
        'trello-card': '0 1px 0 rgba(9, 30, 66, 0.25)',
        'trello-card-hover': '0 4px 8px rgba(9, 30, 66, 0.25)',
        'trello-drag': '0 8px 16px rgba(9, 30, 66, 0.3)',
      },
      borderRadius: {
        'trello': '8px',
      },
    },
  },
  plugins: [],
};
```

#### 1.3 shadcn/ui 초기화 및 컴포넌트 설치

```bash
# shadcn/ui 초기화
npx shadcn@latest init

# 필수 컴포넌트 설치
npx shadcn@latest add button dialog form input select textarea toast popover calendar
```

#### 1.4 추가 라이브러리 설치

```bash
# 상태 관리 및 폼 라이브러리
npm install zustand react-hook-form @hookform/resolvers zod sonner lucide-react date-fns

# 애니메이션
npm install animate-ui
```

---

### Phase 2: 타입 및 검증 스키마

#### 2.1 Task 타입 정의

```typescript
// src/types/task.ts

export type QuadrantType = 'DO' | 'PLAN' | 'DELEGATE' | 'DELETE';
export type TaskPriority = 'high' | 'medium' | 'low' | 'none';
export type ColorTag = 'green' | 'yellow' | 'blue' | 'red';

export interface Task {
  id: string;
  title: string;
  description?: string;
  quadrant: QuadrantType;
  priority: TaskPriority;
  colorTag?: ColorTag;
  dueDate?: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TaskFormData {
  title: string;
  description?: string;
  quadrant: QuadrantType;
  priority?: TaskPriority;
  dueDate?: string;
}
```

#### 2.2 Zod 검증 스키마

```typescript
// src/lib/validations/task.ts

import { z } from 'zod';

export const taskFormSchema = z.object({
  title: z
    .string()
    .min(1, '작업 제목은 필수입니다')
    .max(100, '제목은 100자 이내로 입력해주세요'),
  
  description: z
    .string()
    .max(500, '설명은 500자 이내로 입력해주세요')
    .optional(),
  
  quadrant: z.enum(['DO', 'PLAN', 'DELEGATE', 'DELETE'], {
    errorMap: () => ({ message: '사분면을 선택해주세요' }),
  }),
  
  priority: z.enum(['high', 'medium', 'low', 'none']),
  
  dueDate: z
    .string()
    .optional()
    .refine(
      (date) => !date || !isNaN(Date.parse(date)),
      '올바른 날짜 형식을 입력해주세요'
    ),
});

export type TaskFormSchema = z.infer<typeof taskFormSchema>;
```

---

### Phase 3: Zustand 스토어 구현

```typescript
// src/store/taskStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Task, QuadrantType } from '@/types/task';
import { generateId } from '@/lib/utils';

interface TaskState {
  tasks: Task[];
  
  // Actions
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'completed'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  moveTask: (id: string, quadrant: QuadrantType) => void;
  toggleComplete: (id: string) => void;
  clearAllTasks: () => void;
  
  // Getters
  getTasksByQuadrant: (quadrant: QuadrantType) => Task[];
  getTaskStats: () => Record<QuadrantType, number>;
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],
      
      addTask: (taskData) => set((state) => ({
        tasks: [
          ...state.tasks,
          {
            ...taskData,
            id: generateId(),
            completed: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          } as Task,
        ],
      })),
      
      updateTask: (id, updates) => set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === id
            ? { ...task, ...updates, updatedAt: new Date().toISOString() }
            : task
        ),
      })),
      
      deleteTask: (id) => set((state) => ({
        tasks: state.tasks.filter((task) => task.id !== id),
      })),
      
      moveTask: (id, quadrant) => set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === id
            ? { ...task, quadrant, updatedAt: new Date().toISOString() }
            : task
        ),
      })),
      
      toggleComplete: (id) => set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === id
            ? { ...task, completed: !task.completed, updatedAt: new Date().toISOString() }
            : task
        ),
      })),
      
      clearAllTasks: () => set({ tasks: [] }),
      
      getTasksByQuadrant: (quadrant) => {
        return get().tasks.filter((task) => task.quadrant === quadrant);
      },
      
      getTaskStats: () => {
        const tasks = get().tasks;
        return {
          DO: tasks.filter((t) => t.quadrant === 'DO').length,
          PLAN: tasks.filter((t) => t.quadrant === 'PLAN').length,
          DELEGATE: tasks.filter((t) => t.quadrant === 'DELEGATE').length,
          DELETE: tasks.filter((t) => t.quadrant === 'DELETE').length,
        };
      },
    }),
    {
      name: 'priority-metrix-storage',
    }
  )
);
```

**유틸리티 함수**

```typescript
// src/lib/utils.ts

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(): string {
  return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function formatDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
```

---

### Phase 4: TaskFormDialog 컴포넌트 구현

#### 4.1 완전한 TaskFormDialog 구현

```tsx
// src/components/tasks/TaskFormDialog.tsx

'use client';

import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Plus, Calendar, Flag } from 'lucide-react';
import { useTaskStore } from '@/store/taskStore';
import { taskFormSchema, type TaskFormSchema } from '@/lib/validations/task';
import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Effect } from '@/components/animate-ui/primitives/effects/effect';

interface TaskFormDialogProps {
  mode?: 'add' | 'edit';
  initialData?: Partial<TaskFormSchema>;
  quadrant?: 'DO' | 'PLAN' | 'DELEGATE' | 'DELETE';
  onSuccess?: () => void;
}

const PRIORITIES = [
  { value: 'high', label: '🔴 높음', color: 'text-[#EB5A46]' },
  { value: 'medium', label: '🟡 중간', color: 'text-[#F2D600]' },
  { value: 'low', label: '🟢 낮음', color: 'text-[#61BD4F]' },
  { value: 'none', label: '⚫ 없음', color: 'text-[#9E9E9E]' },
] as const;

const QUADRANTS = [
  { value: 'DO', label: '🔴 DO (해야 할 일)', description: 'Urgent & Important' },
  { value: 'PLAN', label: '🟢 PLAN (계획할 일)', description: 'Not Urgent & Important' },
  { value: 'DELEGATE', label: '🔵 DELEGATE (위임할 일)', description: 'Urgent & Not Important' },
  { value: 'DELETE', label: '⚫ DELETE (삭제할 일)', description: 'Not Urgent & Not Important' },
] as const;

export function TaskFormDialog({
  mode = 'add',
  initialData,
  quadrant: defaultQuadrant = 'DO',
  onSuccess,
}: TaskFormDialogProps) {
  const [open, setOpen] = useState(false);
  const addTask = useTaskStore((state) => state.addTask);
  const updateTask = useTaskStore((state) => state.updateTask);

  const form = useForm<TaskFormSchema>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      quadrant: initialData?.quadrant || defaultQuadrant,
      priority: initialData?.priority || 'medium',
      dueDate: initialData?.dueDate,
    },
  });

  function onSubmit(values: TaskFormSchema) {
    if (mode === 'edit' && initialData) {
      // 수정 모드
      updateTask(initialData.id!, values);
      toast.success('작업이 수정되었습니다', {
        description: `"${values.title}" 작업이 업데이트되었습니다.`,
      });
    } else {
      // 추가 모드
      addTask(values);
      toast.success('작업이 추가되었습니다', {
        description: `"${values.title}" 작업이 ${values.quadrant} 사분면에 추가되었습니다.`,
      });
    }

    setOpen(false);
    form.reset();
    onSuccess?.();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {mode === 'add' ? (
          <Button className="bg-[#0079BF] hover:bg-[#026AA7] text-white rounded-trello">
            <Plus className="w-4 h-4 mr-2" />
            작업 추가
          </Button>
        ) : (
          <Button variant="ghost" size="sm">
            편집
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px]">
        <Effect
          slide={{ direction: 'up', offset: 30 }}
          fade
          transition={{ type: 'tween', duration: 0.25, ease: 'easeOut' }}
        >
          <DialogHeader>
            <DialogTitle>
              {mode === 'add' ? '새 작업 추가' : '작업 수정'}
            </DialogTitle>
            <DialogDescription>
              {mode === 'add'
                ? '새 작업을 추가하고 아이젠하워 매트릭스에 배치하세요.'
                : '작업 정보를 수정하세요.'}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* 작업 제목 */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>작업 제목 *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="새 작업을 입력하세요..."
                        className="border-[#DFE1E6] focus:border-[#0079BF] focus:ring-[#0079BF]/20"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 작업 설명 */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>설명</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="작업에 대한 상세 설명..."
                        className="min-h-[100px] resize-none border-[#DFE1E6] focus:border-[#0079BF] focus:ring-[#0079BF]/20"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 사분면 및 우선순위 */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="quadrant"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>사분면</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="사분면 선택" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {QUADRANTS.map((q) => (
                            <SelectItem key={q.value} value={q.value}>
                              {q.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>우선순위</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="우선순위 선택" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {PRIORITIES.map((p) => (
                            <SelectItem key={p.value} value={p.value}>
                              {p.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* 마감일 */}
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>마감일</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full pl-3 text-left font-normal border-[#DFE1E6]',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              formatDate(field.value)
                            ) : (
                              <span>마감일 선택</span>
                            )}
                            <Calendar className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={field.value ? new Date(field.value) : undefined}
                          onSelect={(date) => {
                            field.onChange(date?.toISOString());
                          }}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setOpen(false)}
                >
                  취소
                </Button>
                <Button
                  type="submit"
                  className="bg-[#0079BF] hover:bg-[#026AA7] text-white"
                >
                  {mode === 'add' ? '추가' : '저장'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </Effect>
      </DialogContent>
    </Dialog>
  );
}
```

---

### Phase 5: QuickAddForm 컴포넌트 구현

#### 5.1 빠른 추가 인라인 폼

```tsx
// src/components/tasks/QuickAddForm.tsx

'use client';

import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Plus, X } from 'lucide-react';
import { useTaskStore } from '@/store/taskStore';
import { taskFormSchema, type TaskFormSchema } from '@/lib/validations/task';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Effects } from '@/components/animate-ui/primitives/effects/effect';

interface QuickAddFormProps {
  quadrant: 'DO' | 'PLAN' | 'DELEGATE' | 'DELETE';
  onSuccess?: () => void;
}

const PRIORITIES = [
  { value: 'high', label: '🔴' },
  { value: 'medium', label: '🟡' },
  { value: 'low', label: '🟢' },
  { value: 'none', label: '⚫' },
] as const;

export function QuickAddForm({ quadrant, onSuccess }: QuickAddFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const addTask = useTaskStore((state) => state.addTask);

  const form = useForm<TaskFormSchema>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: '',
      description: '',
      quadrant,
      priority: 'medium',
      dueDate: undefined,
    },
  });

  function onSubmit(values: TaskFormSchema) {
    addTask(values);
    toast.success('작업이 추가되었습니다', {
      description: `"${values.title}"`,
    });
    form.reset();
    setIsOpen(false);
    onSuccess?.();
  }

  if (!isOpen) {
    return (
      <Effects
        slide={{ direction: 'up', offset: 20 }}
        fade
        inView
        inViewOnce
        transition={{ type: 'tween', duration: 0.3, ease: 'easeOut' }}
      >
        <Button
          variant="ghost"
          className="w-full justify-start text-[#6B778C] hover:text-[#172B4D] hover:bg-[#F4F5F7]"
          onClick={() => setIsOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          작업 추가
        </Button>
      </Effects>
    );
  }

  return (
    <Effects
      slide={{ direction: 'up', offset: 20 }}
      fade
      inView
      inViewOnce
      transition={{ type: 'tween', duration: 0.3, ease: 'easeOut' }}
      className="bg-white rounded-trello shadow-trello-card p-3"
    >
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        {/* 작업 제목 */}
        <Input
          placeholder="새 작업..."
          className="border-0 shadow-none focus:ring-0 p-0 h-auto text-sm"
          {...form.register('title')}
          autoFocus
        />
        {form.formState.errors.title && (
          <p className="text-xs text-red-500">{form.formState.errors.title.message}</p>
        )}

        {/* 선택적 필드 */}
        <div className="flex items-center gap-2">
          <Select
            defaultValue={form.watch('priority')}
            onValueChange={(value) => form.setValue('priority', value as TaskFormSchema['priority'])}
          >
            <SelectTrigger className="h-7 w-16 border-0 shadow-none bg-transparent p-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PRIORITIES.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 버튼 */}
        <div className="flex items-center gap-2 pt-2">
          <Button
            type="submit"
            size="sm"
            className="bg-[#0079BF] hover:bg-[#026AA7] text-white h-8"
          >
            추가
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8"
            onClick={() => {
              setIsOpen(false);
              form.reset();
            }}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </Effects>
  );
}
```

---

### Phase 6: 애니메이션 적용

#### 6.1 AnimatedWrapper 컴포넌트

```tsx
// src/components/animations/AnimatedWrapper.tsx

'use client';

import { Effect, Effects } from '@/components/animate-ui/primitives/effects/effect';

interface AnimatedWrapperProps {
  children: React.ReactNode;
  variant?: 'fade' | 'slide' | 'zoom' | 'blur';
  direction?: 'up' | 'down' | 'left' | 'right';
  delay?: number;
  className?: string;
}

export function AnimatedWrapper({
  children,
  variant = 'slide',
  direction = 'up',
  delay = 0,
  className = '',
}: AnimatedWrapperProps) {
  const directionMap = {
    up: { offset: 20 },
    down: { offset: -20 },
    left: { offset: 20 },
    right: { offset: -20 },
  };

  const animationProps = {
    fade: { fade: true },
    slide: { slide: { direction, offset: directionMap[direction].offset } },
    zoom: { zoom: { initialScale: 0.8, scale: 1 } },
    blur: { blur: { initialBlur: 20, blur: 0 }, fade: true },
  };

  return (
    <Effect
      {...animationProps}
      inView
      inViewOnce
      delay={delay}
      transition={{ type: 'tween', duration: 0.4, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </Effect>
  );
}

interface StaggeredListProps {
  children: React.ReactNode[];
  className?: string;
  holdDelay?: number;
}

export function StaggeredList({ children, className = '', holdDelay = 100 }: StaggeredListProps) {
  return (
    <Effects
      slide={{ direction: 'up', offset: 20 }}
      fade
      holdDelay={holdDelay}
      inView
      inViewOnce
      transition={{ type: 'tween', duration: 0.35, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </Effects>
  );
}
```

---

### Phase 7: App 통합

```tsx
// src/App.tsx

'use client';

import React, { useState } from 'react';
import { useTaskStore } from '@/store/taskStore';
import { EisenhowerMatrix } from '@/components/matrix/EisenhowerMatrix';
import { TaskFormDialog } from '@/components/tasks/TaskFormDialog';
import { AnimatedWrapper } from '@/components/animations/AnimatedWrapper';
import { Toaster } from '@/components/ui/toast'; // Sonner Provider

function App() {
  const { addTask, updateTask, deleteTask, toggleComplete } = useTaskStore();

  const handleAddTask = (data: TaskFormData) => {
    addTask(data);
  };

  const handleEditTask = (data: TaskFormData, taskId: string) => {
    updateTask(taskId, data);
  };

  return (
    <div className="min-h-screen bg-[#F4F5F7]">
      {/* Trello-style Header */}
      <AnimatedWrapper variant="slide" direction="down">
        <header className="bg-white border-b border-[#DFE1E6] px-4 py-3 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#0079BF] rounded flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9 14H7V7h3v10zm7-4h-3V7h3v6z"/>
                  </svg>
                </div>
                <h1 className="text-xl font-bold text-[#172B4D]">
                  Priority Metrix
                </h1>
              </div>
            </div>
            
            {/* 작업 추가 버튼 */}
            <TaskFormDialog mode="add" />
          </div>
        </header>
      </AnimatedWrapper>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6">
        <EisenhowerMatrix />
      </main>

      {/* Toast Provider */}
      <Toaster />
    </div>
  );
}

export default App;
```

---

## 6. 검증 규칙

| 필드 | 규칙 | 오류 메시지 | 검증 시점 |
|------|------|-------------|-----------|
| title | 필수, 1-100자 | "작업 제목은 필수입니다" / "제목은 100자 이내로 입력해주세요" | submit, blur |
| description | 선택, 최대 500자 | "설명은 500자 이내로 입력해주세요" | submit, blur |
| quadrant | 필수, enum | "사분면을 선택해주세요" | submit |
| priority | 필수, enum | - | submit |
| dueDate | 선택, 유효한 날짜 | "올바른 날짜 형식을 입력해주세요" | submit, change |

---

## 7. 성공 기준

### 7.1 기능적 성공 기준

| 기준 | 검증 방법 |
|------|----------|
| 제목 없이 제출 시 오류 메시지 표시 | 폼 제출 테스트 |
| 100자 초과 시 오류 메시지 표시 | 경계값 테스트 |
| 유효한 데이터 제출 시 작업 추가 | 스토어 상태 확인 |
| 로컬 스토리지에 데이터 영속화 | 페이지 새로고침 후 데이터 확인 |
| 마감일 선택 시 날짜 포맷正确 | DatePicker 테스트 |

### 7.2 UI/UX 성공 기준

| 기준 | 검증 방법 |
|------|----------|
| Trello Blue (#0079BF) 액션 버튼 | 색상 스펙 확인 |
| 8px border-radius 적용 | CSS 확인 |
| 모달 오픈 애니메이션 0.25s | 애니메이션 타이밍 확인 |
| 새 카드 스태거 애니메이션 | 카드 추가 테스트 |
| 입력 필드 포커스 스타일 | 포커스 상태 확인 |

### 7.3 접근성 성공 기준

| 기준 | 검증 방법 |
|------|----------|
| 키보드 네비게이션 지원 | Tab 키 이동 테스트 |
| 포커스 상태 시각적 표시 | 포커스 아웃라인 확인 |
| 스크린 리더 호환 | ARIA 속성 확인 |
| 색상 대비 4.5:1 충족 | 색상 대비 계산 |

---

## 8. 테스트 계획

### 8.1 단위 테스트

```typescript
// src/lib/validations/task.test.ts

import { taskFormSchema } from './task';

describe('taskFormSchema', () => {
  describe('title validation', () => {
    it('should reject empty title', () => {
      const result = taskFormSchema.safeParse({ title: '', quadrant: 'DO', priority: 'medium' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('작업 제목은 필수입니다');
      }
    });

    it('should reject title over 100 characters', () => {
      const longTitle = 'a'.repeat(101);
      const result = taskFormSchema.safeParse({ title: longTitle, quadrant: 'DO', priority: 'medium' });
      expect(result.success).toBe(false);
    });

    it('should accept valid title', () => {
      const result = taskFormSchema.safeParse({ title: '유효한 제목', quadrant: 'DO', priority: 'medium' });
      expect(result.success).toBe(true);
    });
  });

  describe('quadrant validation', () => {
    it('should accept valid quadrant values', () => {
      ['DO', 'PLAN', 'DELEGATE', 'DELETE'].forEach((quadrant) => {
        const result = taskFormSchema.safeParse({ title: '테스트', quadrant, priority: 'medium' });
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid quadrant', () => {
      const result = taskFormSchema.safeParse({ title: '테스트', quadrant: 'INVALID', priority: 'medium' });
      expect(result.success).toBe(false);
    });
  });
});
```

### 8.2 통합 테스트

```typescript
// src/components/tasks/TaskFormDialog.test.tsx

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskFormDialog } from './TaskFormDialog';
import { useTaskStore } from '@/store/taskStore';

// Mock zustand store
jest.mock('@/store/taskStore', () => ({
  useTaskStore: jest.fn(() => ({
    addTask: jest.fn(),
    updateTask: jest.fn(),
  })),
}));

describe('TaskFormDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should open dialog when button is clicked', async () => {
    render(<TaskFormDialog />);
    
    const addButton = screen.getByRole('button', { name: /작업 추가/i });
    fireEvent.click(addButton);
    
    expect(await screen.findByText('새 작업 추가')).toBeInTheDocument();
  });

  it('should show error when title is empty on submit', async () => {
    render(<TaskFormDialog />);
    
    const addButton = screen.getByRole('button', { name: /작업 추가/i });
    fireEvent.click(addButton);
    
    const submitButton = screen.getByRole('button', { name: /추가/i });
    fireEvent.click(submitButton);
    
    expect(await screen.findByText('작업 제목은 필수입니다')).toBeInTheDocument();
  });

  it('should call addTask with valid data', async () => {
    const mockAddTask = jest.fn();
    (useTaskStore as jest.Mock).mockReturnValue({ addTask: mockAddTask });
    
    render(<TaskFormDialog />);
    
    const addButton = screen.getByRole('button', { name: /작업 추가/i });
    await userEvent.click(addButton);
    
    const titleInput = screen.getByPlaceholderText('새 작업을 입력하세요...');
    await userEvent.type(titleInput, '새 작업');
    
    const submitButton = screen.getByRole('button', { name: /추가/i });
    await userEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockAddTask).toHaveBeenCalledWith(
        expect.objectContaining({
          title: '새 작업',
          quadrant: 'DO',
          priority: 'medium',
        })
      );
    });
  });
});
```

---

## 9. 체크리스트

### 구현 체크리스트

- [ ] **Phase 1**: 프로젝트 초기화
  - [ ] Vite 프로젝트 생성
  - [ ] Tailwind CSS 설정 (Trello 색상)
  - [ ] shadcn/ui 초기화 및 컴포넌트 설치
  - [ ] 추가 라이브러리 설치

- [ ] **Phase 2**: 타입 및 검증 스키마
  - [ ] Task 타입 정의
  - [ ] Zod 검증 스키마 작성

- [ ] **Phase 3**: Zustand 스토어
  - [ ] addTask 액션 구현
  - [ ] persist middleware 설정
  - [ ] localStorage 연동 테스트

- [ ] **Phase 4**: TaskFormDialog
  - [ ] Dialog 기반 모달 구현
  - [ ] React Hook Form + Zod 통합
  - [ ] FormField 구현 (title, description, quadrant, priority, dueDate)
  - [ ] DatePicker 통합
  - [ ] Toast 알림 연동
  - [ ] Trello 스타일 CSS 적용

- [ ] **Phase 5**: QuickAddForm
  - [ ] 인라인 폼 구현
  - [ ] 축소/확대 상태 관리
  - [ ] 빠른 추가 애니메이션

- [ ] **Phase 6**: 애니메이션
  - [ ] AnimatedWrapper 컴포넌트
  - [ ] StaggeredList 컴포넌트
  - [ ] 모달 오픈 애니메이션
  - [ ] 카드 추가 애니메이션

- [ ] **Phase 7**: 통합
  - [ ] App.tsx에 TaskFormDialog 통합
  - [ ] EisenhowerMatrix에 QuickAddForm 통합
  - [ ] 전체 앱 빌드 테스트

### 테스트 체크리스트

- [ ] 단위 테스트 (검증 스키마)
- [ ] 통합 테스트 (TaskFormDialog)
- [ ] E2E 테스트 (사용자 플로우)
- [ ] 접근성 테스트 (키보드, 스크린 리더)

---

## 10. 의존성 요약

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "typescript": "^5.0.0",
    "vite": "^5.0.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0",
    "lucide-react": "^0.300.0",
    "zustand": "^4.5.0",
    "react-hook-form": "^7.50.0",
    "@hookform/resolvers": "^3.3.0",
    "zod": "^3.22.0",
    "sonner": "^1.4.0",
    "date-fns": "^3.3.0",
    "animate-ui": "^1.0.0"
  },
  "devDependencies": {
    "@testing-library/react": "^14.0.0",
    "@testing-library/user-event": "^14.0.0",
    "vitest": "^1.0.0",
    "jest": "^29.0.0",
    "@types/node": "^20.0.0"
  }
}
```

---

## 11. 참고 자료

### 공식 문서

- [shadcn/ui Dialog](https://ui.shadcn.com/docs/components/dialog)
- [shadcn/ui Form](https://ui.shadcn.com/docs/components/form)
- [shadcn/ui Select](https://ui.shadcn.com/docs/components/select)
- [shadcn/ui Date Picker](https://ui.shadcn.com/docs/components/date-picker)
- [React Hook Form](https://react-hook-form.com/)
- [Zod](https://zod.dev/)
- [Zustand](https://zustand.docs.pmnd.rs/)
- [Sonner](https://sonner.emilkowal.ski/)
- [dnd-kit](https://docs.dndkit.com/)
- [Animate UI](https://animate-ui.com/)

### 디자인 시스템

- [Trello Design System](https://design.trello.com/)
- [Atlassian Design System](https://atlassian.design/)

---

**문서 작성일**: 2026년 1월 10일  
**문서 버전**: 1.0.0  
**문서 상태**: 초안 (Draft)

---

## 부록: 향후 확장 참고

### UC-002 (작업 수정)용 참고 사항

TaskFormDialog 컴포넌트는 `mode="edit"` prop을 통해 재사용 가능합니다:

```tsx
<TaskFormDialog
  mode="edit"
  initialData={{
    id: task.id,
    title: task.title,
    description: task.description,
    quadrant: task.quadrant,
    priority: task.priority,
    dueDate: task.dueDate,
  }}
  quadrant={task.quadrant}
/>
```

### UC-005 (작업 이동)용 dnd-kit 설정

```typescript
// 다중 컨테이너 드래그 앤 드롭 설정
import {
  DndContext,
  closestCenter,
  DragEndEvent,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
```

자세한 구현은 UC-005 구현 계획서를 참조하세요.
