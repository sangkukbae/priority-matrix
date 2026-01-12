# UC-005: 작업 사분면 간 이동 구현 계획

**문서 ID**: PLAN-UC-005  
**버전**: 1.0  
**작성일**: 2026-01-11  
**작성자**: Sisyphus AI Agent

---

## 1. 개요

### 1.1 목적
본 문서는 UC-005 (작업 사분면 간 이동) 유스 케이스의 구현 계획을 기술합니다. 아이젠하워 매트릭스에서 드래그 앤 드롭을 사용하여 작업을 한 사분면에서 다른 사분면으로 이동하는 기능을 구현합니다.

### 1.2 참조 문서
- UC-005 Use Case: `docs/use-cases/uc-005-move-task.md`
- Design System: `DESIGN_SYSTEM.md`
- @dnd-kit Documentation: https://docs.dndkit.com/

### 1.3 현재 상태
**✅ 부분 구현 완료** - 기본 드래그 앤 드롭 기능은 이미 구현되어 있습니다:
- `TaskCard.tsx`: 드래그 가능한 작업 카드
- `Quadrant.tsx`: 드롭존 사분면
- `EisenhowerMatrix.tsx`: DnD 컨텍스트 및 핸들러

---

## 2. 요구 사항 분석

### 2.1 기능 요구 사항

| 요구사항 ID | 설명 | 우선순위 |
|------------|------|----------|
| FR-001 | 작업 카드를 드래그하여 다른 사분면으로 이동 가능 | High |
| FR-002 | 드래그 중 작업 카드가 들린 형태로 표시 | High |
| FR-003 | 목표 사분면이 드래그 중 하이라이트로 표시 | High |
| FR-004 | 드롭 시 작업의 quadrant 값 업데이트 | High |
| FR-005 | 로컬 스토리지에 변경사항 영속화 | High |
| FR-006 | 키보드 네비게이션 지원 (탭, 스페이스, 화살표) | Medium |
| FR-007 | 드래그 취소 시 원래 위치로 복귀 | Low |

### 2.2 비기능 요구 사항

| 요구사항 ID | 설명 | 측정 기준 |
|------------|------|----------|
| NFR-001 | 애니메이션 smoothness | 200ms transition |
| NFR-002 | 접근성 (WCAG 2.1 AA) | 키보드 완전 지원 |
| NFR-003 | 성능 | 60fps 애니메이션 |

---

## 3. 기술 설계

### 3.1 아키텍처

```
EisenhowerMatrix (DndContext)
├── DndContext (센서, 충돌 탐지)
├── Quadrant (4개 - DO, PLAN, DELEGATE, DELETE)
│   ├── useDroppable (드롭존)
│   └── SortableContext (정렬 가능 컨텍스트)
└── TaskCard (드래그 가능 아이템)
    └── useSortable (드래그 핸들)
```

### 3.2 @dnd-kit 컴포넌트 구성

```tsx
// 핵심 컴포넌트 임포트
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'

import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
```

### 3.3 센서 구성

```tsx
const sensors = useSensors(
  useSensor(PointerSensor, {
    activationConstraint: {
      distance: 8, // 8px 이상 드래그해야 활성화
    },
  }),
  useSensor(KeyboardSensor, {
    coordinateGetter: sortableKeyboardCoordinates,
  })
)
```

### 3.4 충돌 탐지 알고리즘

```tsx
collisionDetection={closestCenter}
```

`closestCenter`는 Trello 스타일 인터페이스에 적합합니다.

---

## 4. 구현 상세

### 4.1 현재 구현된 코드 분석

**`EisenhowerMatrix.tsx`** - 이미 구현됨
```tsx
function handleDragEnd(event: DragEndEvent) {
  const { active, over } = event
  setActiveTask(null)

  if (!over) return

  const activeTaskId = active.id as string
  const overQuadrantId = over.id as QuadrantType

  const task = tasks.find((t) => t.id === activeTaskId)
  if (!task) return

  if (task.quadrant !== overQuadrantId) {
    moveTask(activeTaskId, overQuadrantId)
    toast.success('작업 이동됨', {
      description: `"${task.title}" → ${quadrantConfig[overQuadrantId].title}`,
    })
  }
}
```

### 4.2 개선이 필요한 부분

| 파일 | 현재 상태 | 개선 필요 항목 |
|------|----------|---------------|
| `TaskCard.tsx` | ✅ 기본 구현 | 키보드 접근성 향상 |
| `Quadrant.tsx` | ✅ 기본 구현 | 드롭존 시각적 피드백 개선 |
| `EisenhowerMatrix.tsx` | ✅ 기본 구현 | 애니메이션 최적화 |

### 4.3 구현되어야 할 기능

#### 4.3.1 키보드 네비게이션

```tsx
// KeyboardSensor가 화살표 키로 이동 지원
function handleDragEnd(event: DragEndEvent) {
  const { active, over } = event
  
  if (over && active.id !== over.id) {
    const activeTask = tasks.find(t => t.id === active.id)
    const overQuadrant = over.id as QuadrantType
    
    if (activeTask && activeTask.quadrant !== overQuadrant) {
      moveTask(active.id as string, overQuadrant)
    }
  }
}
```

#### 4.3.2 드롭존 하이라이트

```tsx
// Quadrant.tsx에서
const { setNodeRef, isOver } = useDroppable({ id: quadrant.id })

<div 
  ref={setNodeRef}
  className={cn(
    'rounded-xl border-2 transition-all',
    isOver && 'ring-2 ring-trello-blue ring-offset-2 scale-[1.02]',
    isOver && colors.bg // 하이라이트 배경
  )}
>
```

#### 4.3.3 드래그 오버레이

```tsx
<DragOverlay>
  {activeTask ? (
    <div className="transform rotate-2 opacity-90">
      <TaskCard task={activeTask} />
    </div>
  ) : null}
</DragOverlay>
```

---

## 5. Task Store 연동

### 5.1 기존 메서드

```tsx
// taskStore.ts
moveTask: (id: string, quadrant: QuadrantType) => void
```

### 5.2 구현 로직

```tsx
function handleDragEnd(event: DragEndEvent) {
  const { active, over } = event
  
  if (!over) {
    // ALT-02: 잘못된 드롭 - 원래 위치로 복귀
    setActiveTask(null)
    return
  }

  const taskId = active.id as string
  const targetQuadrant = over.id as QuadrantType
  const task = tasks.find(t => t.id === taskId)

  if (task && task.quadrant !== targetQuadrant) {
    // FR-004: quadrant 값 업데이트
    moveTask(taskId, targetQuadrant)
    
    // POST-02, POST-03: 양쪽 사분면 카운트 자동 업데이트 (getTaskStats)
    // POST-05: 로컬 스토리지에 저장 (zustand persist middleware)
    
    toast.success('작업 이동됨', {
      description: `"${task.title}" → ${quadrantConfig[targetQuadrant].title}`
    })
  }
  
  setActiveTask(null)
}
```

---

## 6. 테스트 계획

### 6.1 단위 테스트

| 테스트 항목 | 예상 결과 |
|------------|----------|
| 작업 드래그 후 드롭 | 작업이 새 사분면에 표시됨 |
| 같은 사분면 내 드래그 | 순서만 변경 ( quadrants 내 ) |
| 유효하지 않은 드롭 | 작업이 원래 위치에 유지 |
| 키보드 이동 | 화살표 키로 작업 이동 가능 |

### 6.2 통합 테스트

- 로컬 스토리지 persistence 확인
- 새로고침 후 데이터 유지 확인
- 여러 작업 동시 이동 시 상태 일관성

---

## 7. 구현 체크리스트

### 7.1 완료된 항목 ✅

- [x] @dnd-kit 패키지 설치
- [x] TaskCard 컴포넌트 (useSortable)
- [x] Quadrant 컴포넌트 (useDroppable)
- [x] EisenhowerMatrix 컴포넌트 (DndContext)
- [x] moveTask store 메서드
- [x] DragOverlay 구현
- [x] Toast 알림

### 7.2 개선 필요 항목 🔄

- [ ] 키보드 네비게이션 완전 지원
- [ ] 드롭존 하이라이트 애니메이션 개선
- [ ] accessibility 속성 보강 (ARIA)

---

## 8. 리스크 및 완화

| 리스크 | 영향 | 완화 방안 |
|--------|------|----------|
| 모바일 터치 미지원 | Low | PointerSensor가 터치 기본 지원 |
| 성능 저하 | Medium | 사용하지 않는 애니메이션 비활성화 |
| 접근성 부족 | Medium | 키보드 센서 완전 구현 |

---

## 9. 마일스톤

| 마일스톤 | 내용 | 예상 완료 |
|---------|------|----------|
| M1 | 기본 드래그 앤 드롭 | 완료 |
| M2 | 키보드 접근성 | 0.5 day |
| M3 | 시각적 피드백 최적화 | 0.25 day |
| M4 | 테스트 및 버그 수정 | 0.25 day |

---

## 10. 참고 자료

- @dnd-kit Documentation: https://docs.dndkit.com/
- Trello Design System: https://design.trello.com/
- WCAG 2.1 Guidelines: https://www.w3.org/WAI/WCAG21/quickref/
