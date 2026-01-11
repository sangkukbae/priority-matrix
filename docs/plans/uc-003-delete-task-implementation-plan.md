# UC-003: 작업 삭제 (Delete Task) 구현 계획서

## 1. 개요

| 항목 | 내용 |
|------|------|
| **문서 ID** | IMPL-UC-003 |
| **유스 케이스** | UC-003: 작업 삭제 |
| **작성일** | 2026-01-10 |
| **버전** | 1.0 |
| **상태** | 계획 |

### 1.1 목표
사용자가 작업을 안전하게 삭제할 수 있는 기능 구현. 삭제 전 확인 대화상자를 통해 실수를 방지하고, 삭제 완료 시 토스트 알림으로 피드백 제공.

### 1.2 참조 문서
- `trd.md`: 기술 요구사항 문서
- `DESIGN_SYSTEM.md`: 디자인 시스템 가이드
- `use-cases/uc-003-delete-task.md`: 유스케이스 명세

---

## 2. 기술 스택 및 의존성

### 2.1 필수 의존성 (TRD 기준)

| 패키지 | 버전 | 용도 |
|--------|------|------|
| React | 18.x | UI 라이브러리 |
| TypeScript | 5.x | 타입 안전성 |
| Zustand | 4.x | 상태 관리 (deleteTask 액션) |
| shadcn/ui | 2.x | AlertDialog, Toast 컴포넌트 |
| Tailwind CSS | 3.x | 스타일링 |
| Lucide React | 0.x | Trash2 아이콘 |
| sonner | latest | Toast 알림 시스템 |

### 2.2 신규 설치 필요 컴포넌트

```bash
# AlertDialog 컴포넌트 설치
npx shadcn@latest add alert-dialog

# Sonner (Toast) 컴포넌트 설치
npx shadcn@latest add sonner
```

---

## 3. 구현 단계

### Phase 1: 기반 컴포넌트 설치 및 설정

#### Step 1.1: AlertDialog 컴포넌트 설치
```bash
npx shadcn@latest add alert-dialog
```

**예상 결과**: `src/components/ui/alert-dialog.tsx` 생성

#### Step 1.2: Sonner (Toast) 설치 및 설정
```bash
npx shadcn@latest add sonner
```

**예상 결과**: 
- `src/components/ui/sonner.tsx` 생성
- `sonner` 패키지 설치

#### Step 1.3: Toaster Provider 설정

**파일**: `src/App.tsx` 또는 `src/main.tsx`

```tsx
import { Toaster } from "@/components/ui/sonner"

function App() {
  return (
    <>
      {/* 기존 컴포넌트 */}
      <Toaster />
    </>
  )
}
```

---

### Phase 2: 삭제 확인 대화상자 컴포넌트 구현

#### Step 2.1: DeleteTaskDialog 컴포넌트 생성

**파일**: `src/components/tasks/DeleteTaskDialog.tsx`

```tsx
'use client';

import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { Task } from '@/types/task';

interface DeleteTaskDialogProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export const DeleteTaskDialog: React.FC<DeleteTaskDialogProps> = ({
  task,
  open,
  onOpenChange,
  onConfirm,
}) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>정말로 삭제하시겠습니까?</AlertDialogTitle>
          <AlertDialogDescription>
            {task && (
              <>
                <span className="font-medium text-[#172B4D]">"{task.title}"</span>
                {' '}작업이 영구적으로 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-trello">취소</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-[#EB5A46] hover:bg-[#D64538] text-white rounded-trello"
          >
            삭제
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
```

#### Step 2.2: 스타일 가이드 (DESIGN_SYSTEM.md 기준)

| 요소 | 스타일 | HEX |
|------|--------|-----|
| 삭제 버튼 배경 | Danger Red | `#EB5A46` |
| 삭제 버튼 호버 | Danger Hover | `#D64538` |
| 취소 버튼 | Secondary | 기본 shadcn 스타일 |
| border-radius | trello | `8px` |
| 제목 텍스트 | Charcoal | `#172B4D` |

---

### Phase 3: Zustand Store deleteTask 액션 구현

#### Step 3.1: taskStore.ts 수정

**파일**: `src/store/taskStore.ts`

```tsx
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Task, QuadrantType } from '@/types/task';
import { generateId } from '@/lib/utils';

interface TaskState {
  tasks: Task[];
  
  // Actions
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'completed'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => boolean; // 반환값: 삭제 성공 여부
  moveTask: (id: string, quadrant: QuadrantType) => void;
  toggleComplete: (id: string) => void;
  clearAllTasks: () => void;
  
  // Getters
  getTaskById: (id: string) => Task | undefined;
  getTasksByQuadrant: (quadrant: QuadrantType) => Task[];
  getTaskStats: () => Record<QuadrantType, number>;
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],
      
      // ... 기존 액션들 ...
      
      deleteTask: (id: string): boolean => {
        const taskExists = get().tasks.some((task) => task.id === id);
        
        if (!taskExists) {
          console.warn(`Task with id ${id} not found`);
          return false;
        }
        
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        }));
        
        return true;
      },
      
      getTaskById: (id: string): Task | undefined => {
        return get().tasks.find((task) => task.id === id);
      },
      
      // ... 기존 getters ...
    }),
    {
      name: 'priority-metrix-storage',
    }
  )
);
```

#### Step 3.2: 삭제 성공/실패 처리 로직

| 시나리오 | 반환값 | 후속 처리 |
|----------|--------|-----------|
| 정상 삭제 | `true` | 성공 토스트 표시 |
| 존재하지 않는 작업 | `false` | 오류 토스트 표시 |

---

### Phase 4: TaskCard 컴포넌트 삭제 버튼 연결

#### Step 4.1: TaskCard.tsx 수정

**파일**: `src/components/tasks/TaskCard.tsx`

삭제 버튼 클릭 시 DeleteTaskDialog 트리거:

```tsx
// TaskCard.tsx 내 삭제 버튼 부분
<Button
  variant="ghost"
  size="sm"
  onClick={(e) => {
    e.stopPropagation();
    onDelete(task.id); // 상위 컴포넌트로 삭제 요청 전달
  }}
  className="h-8 w-8 p-0 text-[#6B778C] hover:text-[#EB5A46] hover:bg-[#FFEBE6]"
>
  <Trash2 className="w-4 h-4" />
</Button>
```

#### Step 4.2: Quadrant 또는 상위 컴포넌트에서 삭제 로직 관리

**파일**: `src/components/matrix/Quadrant.tsx` 또는 `src/App.tsx`

```tsx
import { useState } from 'react';
import { toast } from 'sonner';
import { useTaskStore } from '@/store/taskStore';
import { DeleteTaskDialog } from '@/components/tasks/DeleteTaskDialog';
import type { Task } from '@/types/task';

// 상태 관리
const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
const { deleteTask, getTaskById } = useTaskStore();

// 삭제 버튼 클릭 핸들러
const handleDeleteClick = (taskId: string) => {
  const task = getTaskById(taskId);
  if (task) {
    setTaskToDelete(task);
    setIsDeleteDialogOpen(true);
  }
};

// 삭제 확인 핸들러
const handleConfirmDelete = () => {
  if (taskToDelete) {
    const success = deleteTask(taskToDelete.id);
    
    if (success) {
      toast.success('삭제되었습니다', {
        description: `"${taskToDelete.title}" 작업이 삭제되었습니다.`,
      });
    } else {
      toast.error('삭제 실패', {
        description: '작업이 존재하지 않습니다.',
      });
    }
    
    setTaskToDelete(null);
    setIsDeleteDialogOpen(false);
  }
};

// JSX
<DeleteTaskDialog
  task={taskToDelete}
  open={isDeleteDialogOpen}
  onOpenChange={setIsDeleteDialogOpen}
  onConfirm={handleConfirmDelete}
/>
```

---

### Phase 5: 애니메이션 적용

#### Step 5.1: 삭제 시 카드 페이드아웃 애니메이션

**DESIGN_SYSTEM.md 기준 애니메이션 스펙:**
- 전환 시간: 0.3s
- 이징: ease-out
- 효과: 페이드 + 스케일 다운

**구현 방식 (Animate UI 또는 CSS)**:

```tsx
// CSS 방식 (Tailwind)
// TaskCard에 삭제 상태 추가
const [isDeleting, setIsDeleting] = useState(false);

// 삭제 시
const handleDelete = () => {
  setIsDeleting(true);
  setTimeout(() => {
    onDelete(task.id);
  }, 300); // 애니메이션 완료 후 실제 삭제
};

// 클래스
className={cn(
  'transition-all duration-300 ease-out',
  isDeleting && 'opacity-0 scale-95 pointer-events-none'
)}
```

#### Step 5.2: Animate UI 사용 시 (선택적)

```tsx
import { Effect } from '@/components/animate-ui/primitives/effects/effect';

// AnimatedWrapper로 감싸기
<Effect
  fade
  zoom={{ initialScale: 1, scale: 0.95 }}
  // exit 애니메이션 활용
>
  <TaskCard ... />
</Effect>
```

---

### Phase 6: 예외 처리 및 에러 핸들링

#### Step 6.1: 예외 상황 처리

| 예외 코드 | 상황 | 처리 방법 |
|-----------|------|-----------|
| EXC-01 | 작업이 이미 삭제됨 | "작업이 존재하지 않습니다" 토스트 |
| EXC-02 | 로컬 스토리지 오류 | 오류 로깅 + 재시도 옵션 토스트 |

```tsx
// 로컬 스토리지 오류 처리
try {
  const success = deleteTask(taskToDelete.id);
  // ...
} catch (error) {
  console.error('Delete task error:', error);
  toast.error('저장 오류', {
    description: '데이터 저장 중 오류가 발생했습니다. 다시 시도해주세요.',
    action: {
      label: '재시도',
      onClick: () => handleConfirmDelete(),
    },
  });
}
```

---

## 4. 파일 구조

```
src/
├── components/
│   ├── ui/
│   │   ├── alert-dialog.tsx    # [신규] shadcn AlertDialog
│   │   └── sonner.tsx          # [신규] Sonner Toast
│   ├── tasks/
│   │   ├── TaskCard.tsx        # [수정] 삭제 버튼 연결
│   │   └── DeleteTaskDialog.tsx # [신규] 삭제 확인 대화상자
│   └── matrix/
│       └── Quadrant.tsx        # [수정] 삭제 로직 관리
├── store/
│   └── taskStore.ts            # [수정] deleteTask 액션 개선
└── App.tsx                     # [수정] Toaster 추가
```

---

## 5. 테스트 계획

### 5.1 단위 테스트

| 테스트 케이스 | 입력 | 예상 결과 |
|---------------|------|-----------|
| deleteTask 성공 | 유효한 task.id | tasks 배열에서 제거, true 반환 |
| deleteTask 실패 | 존재하지 않는 id | false 반환, console.warn |
| getTaskById | 유효한 id | Task 객체 반환 |
| getTaskById | 무효한 id | undefined 반환 |

### 5.2 통합 테스트

| 시나리오 | 단계 | 예상 결과 |
|----------|------|-----------|
| 정상 삭제 흐름 | 삭제 버튼 → 대화상자 → 확인 | 카드 제거 + 성공 토스트 |
| 삭제 취소 | 삭제 버튼 → 대화상자 → 취소 | 대화상자 닫힘, 카드 유지 |
| 외부 클릭 취소 | 대화상자 외부 클릭 | 대화상자 닫힘, 카드 유지 |

### 5.3 E2E 테스트 시나리오

```typescript
// Playwright 테스트 예시
test('작업 삭제 흐름', async ({ page }) => {
  // 1. 작업 카드의 삭제 버튼 클릭
  await page.click('[data-testid="task-delete-btn"]');
  
  // 2. 확인 대화상자 표시 확인
  await expect(page.getByText('정말로 삭제하시겠습니까?')).toBeVisible();
  
  // 3. 삭제 버튼 클릭
  await page.click('button:has-text("삭제")');
  
  // 4. 토스트 메시지 확인
  await expect(page.getByText('삭제되었습니다')).toBeVisible();
  
  // 5. 카드가 사라졌는지 확인
  await expect(page.getByTestId('task-card')).not.toBeVisible();
});
```

---

## 6. 접근성 (WCAG 2.1 AA)

| 항목 | 구현 방법 |
|------|-----------|
| 키보드 네비게이션 | AlertDialog는 기본적으로 Tab/Enter/Escape 지원 |
| 포커스 관리 | 대화상자 열릴 때 첫 번째 버튼으로 포커스 이동 |
| 스크린 리더 | AlertDialogTitle, AlertDialogDescription 활용 |
| 색상 대비 | 4.5:1 이상 (DESIGN_SYSTEM.md 준수) |

---

## 7. 구현 체크리스트

### Phase 1: 기반 설정
- [ ] AlertDialog 컴포넌트 설치
- [ ] Sonner Toast 설치
- [ ] Toaster Provider 추가

### Phase 2: 삭제 대화상자
- [ ] DeleteTaskDialog 컴포넌트 생성
- [ ] Trello 스타일 적용 (색상, border-radius)

### Phase 3: Store 수정
- [ ] deleteTask 액션 개선 (반환값 추가)
- [ ] getTaskById getter 추가

### Phase 4: 컴포넌트 연결
- [ ] TaskCard 삭제 버튼 연결
- [ ] 상위 컴포넌트에서 삭제 로직 관리
- [ ] 토스트 알림 연결

### Phase 5: 애니메이션
- [ ] 카드 삭제 시 페이드아웃 애니메이션

### Phase 6: 예외 처리
- [ ] 존재하지 않는 작업 처리
- [ ] 로컬 스토리지 오류 처리

### Phase 7: 테스트
- [ ] 단위 테스트 작성
- [ ] 통합 테스트 수행
- [ ] E2E 테스트 (선택)

---

## 8. 예상 소요 시간

| Phase | 예상 시간 |
|-------|-----------|
| Phase 1: 기반 설정 | 15분 |
| Phase 2: 삭제 대화상자 | 30분 |
| Phase 3: Store 수정 | 20분 |
| Phase 4: 컴포넌트 연결 | 45분 |
| Phase 5: 애니메이션 | 30분 |
| Phase 6: 예외 처리 | 20분 |
| Phase 7: 테스트 | 60분 |
| **총계** | **약 3.5시간** |

---

## 9. 승인

| 역할 | 이름 | 날짜 | 서명 |
|------|------|------|------|
| Tech Lead | TBD | TBD | _____________ |
| Developer | TBD | TBD | _____________ |

---

**문서 작성일**: 2026년 1월 10일  
**문서 버전**: 1.0  
**상태**: 계획 (Draft)
