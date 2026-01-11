# UC-002 작업 수정 (Edit Task) 구현 문서

## 문서 정보
| 항목 | 내용 |
|------|------|
| 문서 ID | IMPL-UC-002 |
| 유스 케이스 | UC-002: 작업 수정 |
| 상태 | ✅ 구현 완료 |

## 1. 개요
UC-002 기능이 이미 구현되어 있습니다.

## 2. 구현 아키텍처
- TaskFormDialog.tsx - add/edit 모드 통합
- TaskCard.tsx - 편집 버튼 + stopPropagation
- Quadrant.tsx - onEditTask 전달
- EisenhowerMatrix.tsx - edit 상태 관리

## 3. 핵심 구현

### EisenhowerMatrix.tsx
```typescript
const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
const [editingTask, setEditingTask] = useState<Task | null>(null);
function handleEditTask(task: Task) { setEditingTask(task); setIsEditDialogOpen(true); }
return <TaskFormDialog mode="edit" open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} initialData={editingTask} />;
```

### TaskCard.tsx (드래그 방지)
```typescript
onClick={(e) => {
  e.stopPropagation();
  onEdit?.(task);
}}
onKeyDown={(e) => e.stopPropagation()}
```

### Zustand Store (updateTask)
```typescript
updateTask: (id, updates) => set((state) => ({
  tasks: state.tasks.map((task) =>
    task.id === id
      ? { ...task, ...updates, updatedAt: new Date().toISOString() }
      : task
  ),
})),
```

### 폼 검증 (Zod)
```typescript
taskFormSchema = z.object({
  title: z.string().min(1, "작업 제목은 필수입니다"),
  description: z.string().optional(),
  quadrant: z.enum(["DO", "PLAN", "DELEGATE", "DELETE"]),
  priority: z.enum(["high", "medium", "low", "none"]),
  dueDate: z.string().optional(),
})
```

## 4. 검증 결과
| 항목 | 결과 |
|------|------|
| 빌드 | ✅ 성공 |
| 편집 버튼 → 대화상자 | ✅ |
| 데이터 pre-fill | ✅ |
| 드래그 방지 | ✅ |

### 폼 데이터 동기화
```typescript
useEffect(() => {
  if (open) {
    form.reset({
      title: initialData?.title || "",
      description: initialData?.description || "",
      quadrant: initialData?.quadrant || "DO",
      priority: initialData?.priority || "medium",
      dueDate: initialData?.dueDate,
    });
  }
}, [open, initialData, form]);
```

**최종 업데이트**: 2026년 1월 11일
**문서 상태**: ✅ 구현 완료
