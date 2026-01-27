# Archive Feature Implementation Guide

## Overview

작업(Task)을 아카이브하여 보관하고, 필요시 복원 또는 영구 삭제할 수 있는 기능을 구현합니다.

## Requirements

### 1. TaskFormDialog 더보기 버튼
- 편집 모드에서 다이얼로그 헤더에 더보기(⋯) 버튼 추가
- 드롭다운 메뉴에 "아카이브" 옵션 포함

### 2. 앱 헤더 아카이브 메뉴
- 기존 더보기 메뉴에 "아카이브" 항목 추가
- "배경 화면 변경하기" 메뉴 위에 위치

### 3. 아카이브 패널
- 인플레이스 슬라이드인 패널
- 검색 기능
- 날짜별 그룹핑 (지난 7일, 지난 30일, 더 오래됨)
- 각 아이템에 복원/삭제 버튼

---

## Step 1: Data Model Changes

### File: `src/types/task.ts`

Task 인터페이스에 두 필드 추가:

```typescript
export interface Task {
  id: string
  title: string
  description?: string
  quadrant: QuadrantType
  priority: TaskPriority
  labels?: string[]
  colorTag?: ColorTag
  dueDate?: string
  checklist?: ChecklistItem[]
  completed: boolean
  order: number
  createdAt: string
  updatedAt: string
  // NEW FIELDS
  archived: boolean        // 아카이브 여부 (기본값: false)
  archivedAt?: string      // 아카이브 시점 (ISO timestamp)
}
```

---

## Step 2: Store Updates

### File: `src/store/taskStore.ts`

#### 2.1 Interface 확장

```typescript
interface TaskState {
  // ... existing ...

  // NEW METHODS
  archiveTask: (id: string) => void
  restoreTask: (id: string) => void
  permanentlyDeleteTask: (id: string) => boolean
  getArchivedTasks: () => Task[]
}
```

#### 2.2 새 메서드 구현

```typescript
archiveTask: (id) => set((state) => ({
  tasks: state.tasks.map((task) =>
    task.id === id
      ? {
          ...task,
          archived: true,
          archivedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      : task
  ),
})),

restoreTask: (id) => set((state) => {
  const task = state.tasks.find(t => t.id === id)
  if (!task) return state

  // 원래 사분면의 끝에 추가
  const quadrantTasks = state.tasks.filter(
    t => t.quadrant === task.quadrant && !t.archived
  )
  const newOrder = quadrantTasks.length

  return {
    tasks: state.tasks.map((t) =>
      t.id === id
        ? {
            ...t,
            archived: false,
            archivedAt: undefined,
            order: newOrder,
            updatedAt: new Date().toISOString(),
          }
        : t
    ),
  }
}),

permanentlyDeleteTask: (id) => {
  const taskExists = get().tasks.some((task) => task.id === id)
  if (!taskExists) return false
  set((state) => ({
    tasks: state.tasks.filter((task) => task.id !== id),
  }))
  return true
},

getArchivedTasks: () => {
  return get().tasks
    .filter((task) => task.archived)
    .sort((a, b) => {
      const dateA = a.archivedAt ? new Date(a.archivedAt).getTime() : 0
      const dateB = b.archivedAt ? new Date(b.archivedAt).getTime() : 0
      return dateB - dateA  // 최신순
    })
}
```

#### 2.3 기존 메서드 수정

```typescript
// getTasksByQuadrant - 아카이브 제외
getTasksByQuadrant: (quadrant) => {
  return get().tasks
    .filter((task) => task.quadrant === quadrant && !task.archived)
    .sort((a, b) => a.order - b.order)
}

// getTaskStats - 아카이브 제외
getTaskStats: () => {
  const tasks = get().tasks.filter(t => !t.archived)
  return {
    DO: tasks.filter((t) => t.quadrant === 'DO').length,
    PLAN: tasks.filter((t) => t.quadrant === 'PLAN').length,
    DELEGATE: tasks.filter((t) => t.quadrant === 'DELEGATE').length,
    DELETE: tasks.filter((t) => t.quadrant === 'DELETE').length,
  }
}
```

#### 2.4 마이그레이션 (v1 → v2)

```typescript
{
  name: 'priority-metrix-storage',
  version: 2,  // 1에서 2로 증가
  migrate: (persistedState: any, version) => {
    // ... existing migration code ...

    // NEW: v1 -> v2 마이그레이션
    if (version < 2) {
      persistedState.tasks = (persistedState.tasks || []).map((task: Task) => ({
        ...task,
        archived: task.archived ?? false,
      }))
    }

    return persistedState
  },
}
```

---

## Step 3: Archive UI Components

### File: `src/components/archive/ArchiveEmptyState.tsx`

```typescript
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
```

### File: `src/components/archive/ArchiveItem.tsx`

Props:
- `task: Task`
- `onRestore: (id: string) => void`
- `onDelete: (id: string) => void`
- `labels: Label[]` (레이블 색상 표시용)

표시 요소:
- 레이블 색상 바
- 제목
- 마감일 (있는 경우)
- 체크리스트 진행률 (있는 경우)
- "Archived" 배지
- 복원/삭제 버튼

### File: `src/components/archive/ArchivePanel.tsx`

Props:
- `open: boolean`
- `onOpenChange: (open: boolean) => void`

기능:
- 검색 입력 (제목 필터링)
- 날짜 그룹핑 유틸리티 함수
- 스크롤 가능한 아이템 리스트
- 닫기 버튼

날짜 그룹핑 로직:
```typescript
function groupByArchiveDate(tasks: Task[]): Record<string, Task[]> {
  const now = new Date()
  const groups: Record<string, Task[]> = {
    '지난 7일': [],
    '지난 30일': [],
    '더 오래됨': [],
  }

  tasks.forEach(task => {
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
```

---

## Step 4: Integration

### File: `src/components/HeaderMenu.tsx`

#### 4.1 Props 추가

```typescript
interface HeaderMenuProps {
  onArchiveOpen?: () => void
}

export function HeaderMenu({ onArchiveOpen }: HeaderMenuProps) {
```

#### 4.2 아카이브 메뉴 아이템 추가

"배경 화면 변경하기" 위에 추가:

```typescript
import { Archive } from 'lucide-react'

// DropdownMenuContent 내부, 기존 메뉴 아이템 위에:
<DropdownMenuItem
  onSelect={event => {
    event.preventDefault()
    setIsMenuOpen(false)
    onArchiveOpen?.()
  }}
  className="cursor-pointer rounded-md px-3 py-2 text-sm font-medium text-[#172B4D] hover:bg-[#F4F5F7] focus:bg-[#F4F5F7]"
>
  <Archive className="w-4 h-4 mr-2 text-[#172B4D]" />
  아카이브
</DropdownMenuItem>
```

### File: `src/components/tasks/TaskFormDialog.tsx`

#### 4.3 더보기 드롭다운 추가 (편집 모드에서만)

```typescript
import { MoreHorizontal, Archive } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

// store에서 archiveTask 가져오기
const archiveTask = useTaskStore(state => state.archiveTask)

// 핸들러 추가
const handleArchive = () => {
  if (initialData?.id) {
    archiveTask(initialData.id)
    toast.success('작업이 아카이브되었습니다', {
      description: `"${form.getValues('title')}" 작업이 아카이브에 보관되었습니다.`,
    })
    setOpen(false)
  }
}

// DialogHeader 수정
<DialogHeader className="px-6 pt-6 pb-4 border-b border-[#DFE1E6] sticky top-0 bg-white z-10">
  <div className="flex items-start justify-between">
    <div>
      <DialogTitle className="text-lg font-semibold text-[#172B4D]">
        {mode === 'add' ? '새 작업 추가' : '작업 수정'}
      </DialogTitle>
      <DialogDescription className="text-sm text-[#6B778C] mt-1">
        {mode === 'add'
          ? '새 작업을 추가하고 아이젠하워 매트릭스에 배치하세요.'
          : '작업 정보를 수정하세요.'}
      </DialogDescription>
    </div>

    {mode === 'edit' && initialData?.id && (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-sm text-[#6B778C] hover:bg-[#F4F5F7]"
          >
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem
            onClick={handleArchive}
            className="cursor-pointer text-sm"
          >
            <Archive className="w-4 h-4 mr-2" />
            아카이브
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )}
  </div>
</DialogHeader>
```

### File: `src/App.tsx`

#### 4.4 ArchivePanel 상태 관리

```typescript
import { ArchivePanel } from '@/components/archive/ArchivePanel'

// 상태 추가
const [isArchiveOpen, setIsArchiveOpen] = useState(false)

// HeaderMenu에 props 전달
<HeaderMenu onArchiveOpen={() => setIsArchiveOpen(true)} />

// ArchivePanel 렌더링 (ChatBot 전에)
<ArchivePanel open={isArchiveOpen} onOpenChange={setIsArchiveOpen} />
```

---

## Step 5: Icon Reference

사용할 lucide-react 아이콘:
- `Archive` - 아카이브 메뉴/버튼
- `ArchiveRestore` 또는 `Undo2` - 복원 버튼
- `Trash2` - 삭제 버튼
- `X` - 닫기 버튼
- `Search` - 검색 입력
- `MoreHorizontal` - 더보기 버튼

---

## Step 6: Styling Reference

기존 디자인 시스템 따르기:
- 배경: `bg-white`, `bg-[#F4F5F7]`
- 테두리: `border-[#DFE1E6]`
- 텍스트: `text-[#172B4D]`, `text-[#6B778C]`
- 호버: `hover:bg-[#F4F5F7]`
- 포커스: `focus:ring-[#0079BF]`
- 그림자: `shadow-trello-card`
- 라운딩: `rounded-lg`, `rounded-sm`

---

## Verification Checklist

- [ ] 기존 localStorage 데이터 마이그레이션 정상 동작
- [ ] TaskFormDialog에서 아카이브 버튼 클릭 시 태스크 아카이브됨
- [ ] 아카이브된 태스크가 사분면에서 사라짐
- [ ] 앱 헤더 메뉴에서 아카이브 패널 열림
- [ ] 아카이브 패널에서 검색 동작
- [ ] 날짜 그룹핑 올바르게 표시
- [ ] 복원 버튼 클릭 시 원래 사분면에 복원
- [ ] 삭제 버튼 클릭 시 영구 삭제
- [ ] 드래그앤드롭 정상 동작 (아카이브 태스크 제외됨)
- [ ] 태스크 카운트 정확함 (아카이브 태스크 제외됨)

---

## Potential Issues & Solutions

| Issue | Solution |
|-------|----------|
| 복원 시 order 충돌 | 사분면 끝에 추가 (newOrder = quadrantTasks.length) |
| DnD에 아카이브 태스크 포함 | getTasksByQuadrant에서 자동 제외 |
| 마이그레이션 실패 | 안전한 기본값 사용 (archived: false) |
| 검색 성능 | 클라이언트 사이드 필터링 (MVP), 필요시 debounce 추가 |
