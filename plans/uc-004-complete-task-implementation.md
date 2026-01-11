# UC-004 작업 완료 처리 (Complete Task) 구현 계획서

## 문서 정보

| 항목 | 내용 |
|------|------|
| **문서 ID** | IMPL-UC-004 |
| **유스 케이스** | UC-004: 작업 완료 처리 |
| **작성일** | 2026-01-10 |
| **버전** | 1.0 |
| **상태** | 초안 |

---

## 1. 개요

### 1.1 목적

작업 완료 처리를 통해 사용자가 작업의 완료 상태를 토글할 수 있는 기능을 구현합니다. 완료된 작업은 시각적으로 구분되어 표시되고, 다시 클릭하여 미완료 상태로 변경할 수 있습니다.

### 1.2 범위

- TaskCard 컴포넌트의 완료 토글 버튼 구현
- Zustand 스토어 `toggleComplete` 액션 활용
- Trello 스타일의 완료/미완료 상태 시각적 구분
- 로컬 스토리지 영속화 (기존 persist 활용)
- 접근성 (WCAG 2.1 AA) 준수

### 1.3 의존성

| 라이브러리 | 버전 | 용도 |
|------------|------|------|
| React | 18.x | UI 프레임워크 |
| shadcn/ui | 2.x | Button 컴포넌트 |
| Zustand | 4.x | 전역 상태 관리 |
| Lucide React | 0.x | Circle, CheckCircle2 아이콘 |
| @dnd-kit/core | 6.x | 드래그 앤 드롭 (버블링 방지) |

### 1.4 참조 문서

- [TRD (Technical Requirements Document)](../trd.md)
- [Design System](../DESIGN_SYSTEM.md)
- [UC-004: 작업 완료 처리](../use-cases/uc-004-complete-task.md)
- [UC-002: 작업 수정](../use-cases/uc-002-edit-task.md) - 편집 버튼 통합 패턴 참조

---

## 2. 기술 설계

### 2.1 컴포넌트 구조

```
src/components/tasks/
├── TaskCard.tsx              # 완료 토글 버튼 포함 (수정)
├── TaskList.tsx              # 작업 목록 렌더링 (기존)
└── TaskForm.tsx              # 작업 폼 (참조, 수정 없음)

src/store/
└── taskStore.ts              # toggleComplete 액션 (기존 정의됨)
```

### 2.2 데이터 흐름

```
┌─────────────┐    클릭     ┌──────────────────┐
│  TaskCard   │ ─────────▶ │ toggleComplete() │
│  (-circle)  │            │ (Zustand Action) │
└─────────────┘            └────────┬─────────┘
                                    │ 상태 변경
                                    ▼
                           ┌──────────────────┐
                           │ Persist Middleware│
                           │ (localStorage)    │
                           └──────────────────┘
                                    │
                                    ▼
                           ┌──────────────────┐
                           │ React 재렌더링   │
                           │ 시각적 상태 변경  │
                           └──────────────────┘
```

### 2.3 상태 전환 명세

| 현재 상태 | 동작 | 다음 상태 | 시각적 변화 |
|-----------|------|-----------|-------------|
| 미완료 | 버튼 클릭 | 완료 | 원형 → 체크 아이콘, 취소선 적용 |
| 완료 | 버튼 클릭 | 미완료 | 체크 → 원형 아이콘, 취소선 제거 |

---

## 3. 상세 구현 명세

### 3.1 TaskCard 완료 토글 버튼

**파일**: `src/components/tasks/TaskCard.tsx`

```typescript
'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Circle, CheckCircle2, Calendar, Flag, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TrelloCard } from '@/components/ui/trello-card';
import type { Task } from '@/types/task';
import { cn, formatDate } from '@/lib/utils';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onToggleComplete: (id: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onEdit,
  onDelete,
  onToggleComplete,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Trello-style priority colors
  const priorityColors = {
    high: 'text-[#EB5A46]',   // Trello Red
    medium: 'text-[#F2D600]', // Trello Yellow
    low: 'text-[#61BD4F]',    // Trello Green
    none: 'text-[#9E9E9E]',   // Gray
  };

  const colorTagColors = {
    green: 'border-l-[#61BD4F]',
    yellow: 'border-l-[#F2D600]',
    blue: 'border-l-[#0079BF]',
    red: 'border-l-[#EB5A46]',
  };

  return (
    <TrelloCard
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      draggable
      className={cn(
        colorTagColors[task.colorTag || 'blue'],
        isDragging ? 'shadow-trello-drag opacity-50' : '',
        'mb-3 p-4 border-l-4'
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-3 flex-1">
          {/* 완료 토글 버튼 */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleComplete(task.id);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onToggleComplete(task.id);
              }
            }}
            className="mt-0.5 text-[#9E9E9E] hover:text-[#61BD4F] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#0079BF]/50 rounded-full"
            aria-label={task.completed ? '미완료로 변경' : '완료로 변경'}
            tabIndex={0}
          >
            {task.completed ? (
              <CheckCircle2 className="w-5 h-5 text-[#61BD4F]" />
            ) : (
              <Circle className="w-5 h-5" />
            )}
          </button>

          {/* 작업 제목 */}
          <div className="flex-1 min-w-0">
            <h4 className={cn(
              'font-medium text-[#172B4D]',
              task.completed ? 'line-through text-[#97A0AF]' : ''
            )}>
              {task.title}
            </h4>
            {task.description && (
              <p className="text-sm text-[#6B778C] mt-1 line-clamp-2">
                {task.description}
              </p>
            )}
          </div>
        </div>

        {/* 우선순위 아이콘 */}
        <Flag className={cn('w-4 h-4', priorityColors[task.priority || 'none'])} />
      </div>

      {/* 마감일 표시 */}
      {task.dueDate && (
        <div className="flex items-center gap-1 mt-3 text-xs text-[#6B778C]">
          <Calendar className="w-3.5 h-3.5" />
          <span>{formatDate(task.dueDate)}</span>
        </div>
      )}

      {/* 작업 관리 버튼 (편집, 삭제) */}
      <div className="flex justify-end gap-1 mt-3 pt-3 border-t border-[#DFE1E6]">
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(task);
          }}
          onPointerDown={(e) => e.stopPropagation()}
          className="h-8 w-8 p-0 text-[#6B778C] hover:text-[#0079BF] hover:bg-[#E6F2FF]"
          aria-label="작업 편집"
        >
          <Edit2 className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(task.id);
          }}
          onPointerDown={(e) => e.stopPropagation()}
          className="h-8 w-8 p-0 text-[#6B778C] hover:text-[#EB5A46] hover:bg-[#FFEBE6]"
          aria-label="작업 삭제"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </TrelloCard>
  );
};
```

### 3.2 Zustand Store toggleComplete 액션

**파일**: `src/store/taskStore.ts` (기존 정의)

```typescript
toggleComplete: (id) => set((state) => ({
  tasks: state.tasks.map((task) =>
    task.id === id
      ? {
          ...task,
          completed: !task.completed,
          updatedAt: new Date().toISOString(),
        }
      : task
  ),
})),
```

### 3.3 Quadrant 컴포넌트 (TaskCard 통합)

**파일**: `src/components/matrix/Quadrant.tsx`

```typescript
'use client';

import React from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { TaskCard } from '@/components/tasks/TaskCard';
import { QuadrantHeader } from './QuadrantHeader';
import type { QuadrantType, Task } from '@/types/task';

interface QuadrantProps {
  type: QuadrantType;
  config: {
    title: string;
    subtitle: string;
    color: string;
    bgColor: string;
    borderColor: string;
  };
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onToggleComplete: (id: string) => void;
}

export const Quadrant: React.FC<QuadrantProps> = ({
  type,
  config,
  tasks,
  onEdit,
  onDelete,
  onToggleComplete,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: type,
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        config.bgColor,
        'border-2',
        config.borderColor,
        'rounded-trello',
        'transition-colors duration-200',
        isOver && 'ring-2 ring-[#0079BF] ring-offset-2'
      )}
    >
      <QuadrantHeader title={config.title} subtitle={config.subtitle} />

      <div className="p-3 min-h-[200px]">
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleComplete={onToggleComplete}
            />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div className="flex items-center justify-center h-32 text-[#6B778C] text-sm">
            작업이 없습니다
          </div>
        )}
      </div>
    </div>
  );
};
```

---

## 4. UI/UX 명세

### 4.1 완료 상태별 시각적 구분

**미완료 상태:**
```
┌─────────────────────────────────────┐
│ ○ │ 작업 제목                        │
│   │ 설명이 여기에 표시됩니다...      │
│   │ 📅 2026년 1월 15일              │
├─────────────────────────────────────┤
│                    [✏️]  [🗑️]       │
└─────────────────────────────────────┘
```

**완료 상태:**
```
┌─────────────────────────────────────┐
│ ✓ │ ~~작업 제목~~                    │
│   │ 설명이 여기에 표시됩니다...      │
├─────────────────────────────────────┤
│                    [✏️]  [🗑️]       │
└─────────────────────────────────────┘
```

### 4.2 Trello 디자인 토큰 (완료 기능)

| 요소 | 미완료 상태 | 완료 상태 | Tailwind 클래스 |
|------|-------------|-----------|-----------------|
| 아이콘 | 원형 (회색) | 체크 원형 (녹색) | `text-[#9E9E9E]` → `text-[#61BD4F]` |
| 제목 | 기본 스타일 | 취소선 + 연한 회색 | `text-[#172B4D]` → `line-through text-[#97A0AF]` |
| 카드 배경 | 흰색 | 약간 투명 | `bg-white` → `opacity-75` |

### 4.3 애니메이션 명세

| 이벤트 | 전환 시간 | 이징 | 설명 |
|--------|-----------|------|------|
| 완료 토글 | 0.2s | ease | 아이콘 전환, 취소선 적용/제거 |
| 드래그 중 | 0.15s | ease-out | 그림자 증가, 투명도 감소 |
| 드래그 종료 | 0.3s | spring | 원위치 복귀 |

### 4.4 접근성 명세 (WCAG 2.1 AA)

| 항목 | 요구사항 | 구현 방법 |
|------|----------|-----------|
| 키보드 접근 | Tab으로 버튼 접근 | `tabIndex={0}` |
| 포커스 표시 | 시각적 포커스 링 | `focus:ring-2 focus:ring-[#0079BF]/50` |
| 스크린 리더 | 상태 변경 알림 | `aria-label` 동적 변경 |
| 색상 대비 | 4.5:1 이상 | `#61BD4F` on `#FFFFFF` = 3.2:1 ⚠️ 아이콘 변경 필요 |

**색상 대비 문제 대응:**
- 녹색 아이콘 `#61BD4F`의 대비율이 충분하지 않으므로, 완료 시 어두운 녹색 `#2E7D32` 또는 진한 녹색 `#1B5E20` 사용

---

## 5. 구현 단계

### Phase 1: TaskCard 완료 토글 버튼 구현 (1.5시간)

| 단계 | 작업 | 산출물 |
|------|------|--------|
| 1.1 | Circle/CheckCircle2 아이콘 import | 아이콘 컴포넌트 |
| 1.2 | 완료 토글 버튼 렌더링 로직 | 버튼 요소 |
| 1.3 | 완료/미완료 시각적 상태 적용 | 스타일 변경 |
| 1.4 | stopPropagation 이벤트 처리 | 드래그 방지 |

### Phase 2: Zustand Store toggleComplete 연동 (0.5시간)

| 단계 | 작업 | 산출물 |
|------|------|--------|
| 2.1 | toggleComplete 액션 정의 확인 | 스토어 코드 |
| 2.2 | onToggleComplete 콜백 prop 추가 | TaskCard props |
| 2.3 | App.tsx에서 toggleComplete 호출 | 상태 연동 |

### Phase 3: Quadrant 통합 (1시간)

| 단계 | 작업 | 산출물 |
|------|------|--------|
| 3.1 | Quadrant.tsx에 onToggleComplete 전달 | props 전달 |
| 3.2 | EisenhowerMatrix에서 onToggleComplete 전달 | 부모 → 자식 |

### Phase 4: 접근성 및 테스트 (1시간)

| 단계 | 작업 | 산출물 |
|------|------|--------|
| 4.1 | aria-label 동적 변경 | 접근성 속성 |
| 4.2 | 키보드 이벤트 처리 | Enter/Space 지원 |
| 4.3 | 포커스 스타일 적용 | focus-visible |

### Phase 5: 다크 모드 지원 (0.5시간)

| 단계 | 작업 | 산출물 |
|------|------|--------|
| 5.1 | 다크 모드 색상 확인 | 색상 팔레트 |
| 5.2 | 다크 모드 스타일 적용 | dark: 클래스 |

---

## 6. 테스트 계획

### 6.1 기능 테스트 케이스

| TC-ID | 테스트 케이스 | 예상 결과 | 상태 |
|-------|--------------|-----------|------|
| TC-001 | 미완료 작업의 원형 버튼 클릭 | 완료 상태로 변경, 체크 아이콘 표시 | - |
| TC-002 | 완료 작업의 체크 버튼 클릭 | 미완료 상태로 변경, 원형 아이콘 표시 | - |
| TC-003 | 완료된 작업에 취소선 적용 | 제목에 line-through 적용 | - |
| TC-004 | 드래그 중 완료 토글 버튼 클릭 | 드래그 취소 후 완료 상태 변경 | - |
| TC-005 | 로컬 스토리지 새로고침 | 완료 상태 유지 | - |
| TC-006 | 다른 탭에서 상태 변경 | 실시간 동기화 (Zustand persist) | - |

### 6.2 접근성 테스트

| 항목 | 테스트 방법 | 기준 |
|------|------------|------|
| 키보드 네비게이션 | Tab → Enter/Space | 버튼 활성화 |
| 포커스 표시 | Tab 이동 시 | 시각적 링 표시 |
| 스크린 리더 | NVDA/VoiceOver | 상태 변경 알림 |
| 색상 대비 | WCAG 검사기 | 4.5:1 이상 |

### 6.3 시각적 회귀 테스트

| 항목 | 확인 사항 |
|------|-----------|
| 미완료 상태 | 회색 원형 아이콘, 기본 제목 스타일 |
| 완료 상태 | 녹색 체크 아이콘, 취소선, 연한 투명도 |
| 호버 상태 | 아이콘 색상 변경, 커서 변경 |
| 드래그 상태 | 그림자 증가, 회전 효과 |

---

## 7. 예상 일정

| 단계 | 소요 시간 | 누적 시간 |
|------|----------|-----------|
| Phase 1: TaskCard 완료 토글 버튼 | 1.5시간 | 1.5시간 |
| Phase 2: Zustand Store 연동 | 0.5시간 | 2시간 |
| Phase 3: Quadrant 통합 | 1시간 | 3시간 |
| Phase 4: 접근성 및 테스트 | 1시간 | 4시간 |
| Phase 5: 다크 모드 지원 | 0.5시간 | **4.5시간** |

---

## 8. 위험 요소 및 대응

| 위험 | 영향 | 확률 | 대응 방안 |
|------|------|------|-----------|
| dnd-kit 드래그와 버튼 클릭 충돌 | 중간 | 높음 | `onPointerDown={(e) => e.stopPropagation()}` 적용 |
| 색상 대비율 부족 (완료 아이콘) | 낮음 | 중간 | `#1B5E20` 사용 또는 아이콘 내부 색상 변경 |
| Zustand persist 동기화 지연 | 낮음 | 낮음 | `persist.onRehydrateStorage`로 상태 확인 |

---

## 9. 파일 생성/수정 목록

| 파일 경로 | 설명 | 작업 유형 |
|-----------|------|-----------|
| `src/components/tasks/TaskCard.tsx` | 완료 토글 버튼 및 상태 스타일 | **수정** |
| `src/components/matrix/Quadrant.tsx` | onToggleComplete props 전달 | **수정** |
| `src/components/matrix/EisenhowerMatrix.tsx` | onToggleComplete 전달 | **수정** |
| `src/App.tsx` | toggleComplete 스토어 호출 | **수정** |
| `src/store/taskStore.ts` | toggleComplete 액션 (기존 확인) | 확인のみ |

---

## 10. 기술 레퍼런스 (Context7 수집)

### 10.1 Zustand toggle/boolean state 패턴

```typescript
// 불리언 상태 토글
toggleComplete: (id) => set((state) => ({
  tasks: state.tasks.map((task) =>
    task.id === id
      ? { ...task, completed: !task.completed, updatedAt: new Date().toISOString() }
      : task
  ),
})),
```

### 10.2 shadcn/ui Button 접근성

```typescript
// 아이콘 버튼 (ghost variant)
<Button
  variant="ghost"
  size="sm"
  className="h-8 w-8 p-0"
  aria-label="작업 완료 토글"
>
  <CheckCircle2 className="w-4 h-4" />
</Button>
```

### 10.3 dnd-kit 드래그 방지

```typescript
// 버튼 클릭 시 드래그 방지
<Button
  onClick={handleComplete}
  onPointerDown={(e) => e.stopPropagation()}
>
  완료
</Button>
```

### 10.4 Zustand Persist 동기화

```typescript
// Zustand persist로 자동 동기화 (TRD에서 정의됨)
persist(
  (set) => ({
    tasks: [],
    toggleComplete: (id) => set((state) => {/* ... */}),
  }),
  {
    name: 'priority-metrix-storage', // localStorage 키
  }
)
```

---

## 11. 승인

| 역할 | 이름 | 날짜 | 서명 |
|------|------|------|------|
| 검토자 | | | |
| 승인자 | | | |

---

**문서 작성일**: 2026년 1월 10일  
**문서 버전**: 1.0  
**문서 상태**: 초안
