# 레이블(Label) 기능 구현 계획

## 개요

TaskFormDialog에 레이블 선택 기능을 추가하고, TaskCard에 선택된 레이블을 컬러 막대로 표시합니다.

### 참고 이미지 분석

- **이미지 #1**: 현재 TaskFormDialog UI (작업 제목, 설명, 사분면, 우선순위, 마감일, 체크리스트)
- **이미지 #4**: Labels 섹션 - 선택된 레이블 배지와 "+" 버튼
- **이미지 #5**: Labels 팝오버 - 검색, 컬러 레이블 목록, 체크박스, 편집 버튼, 새 레이블 생성
- **이미지 #6**: TaskCard에서 레이블 - 카드 상단에 컬러 막대로 표시

---

## 1단계: 타입 정의 확장

### 파일: `src/types/task.ts`

```typescript
// 새로운 Label 인터페이스 추가
export interface Label {
  id: string
  name: string
  color: string // hex color (예: '#5BA4CF')
}

// Task 인터페이스에 labels 필드 추가
export interface Task {
  // ... 기존 필드
  labels?: string[] // Label ID 배열
}
```

### 기본 레이블 색상 (이미지 #5 참고)

```typescript
export const DEFAULT_LABEL_COLORS = [
  { name: 'green', color: '#61BD4F' },
  { name: 'dark-green', color: '#519839' },
  { name: 'olive', color: '#B3A000' },
  { name: 'orange', color: '#D29034' },
  { name: 'red', color: '#CD5A46' },
  { name: 'purple', color: '#89609E' },
  { name: 'pink', color: '#EF9FC1' },
  { name: 'blue', color: '#5BA4CF' },
] as const
```

---

## 2단계: Zod 스키마 업데이트

### 파일: `src/lib/validations/task.ts`

```typescript
export const labelSchema = z.object({
  id: z.string(),
  name: z.string().max(50, '레이블 이름은 50자 이내로 입력해주세요'),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, '올바른 색상 코드를 입력해주세요'),
})

export const taskFormSchema = z.object({
  // ... 기존 필드
  labels: z.array(z.string()).optional(), // Label ID 배열
})
```

---

## 3단계: Zustand 스토어 확장

### 파일: `src/store/taskStore.ts`

#### 새로운 상태 및 액션

```typescript
interface TaskState {
  // 기존 상태
  tasks: Task[]

  // 새로운 상태: 전역 레이블 관리
  labels: Label[]

  // 기존 액션들...

  // 새로운 레이블 관련 액션
  addLabel: (label: Omit<Label, 'id'>) => void
  updateLabel: (id: string, updates: Partial<Label>) => void
  deleteLabel: (id: string) => void
  getLabelById: (id: string) => Label | undefined
}
```

#### 초기 레이블 데이터

```typescript
const initialLabels: Label[] = [
  { id: 'label-1', name: '', color: '#61BD4F' },
  { id: 'label-2', name: '', color: '#519839' },
  { id: 'label-3', name: '', color: '#B3A000' },
  { id: 'label-4', name: '', color: '#D29034' },
  { id: 'label-5', name: '', color: '#CD5A46' },
  { id: 'label-6', name: '', color: '#89609E' },
  { id: 'label-7', name: '', color: '#EF9FC1' },
  { id: 'label-8', name: '', color: '#5BA4CF' },
]
```

---

## 4단계: shadcn/ui 컴포넌트 추가

### 필요한 컴포넌트

1. **Command** - 검색 가능한 목록 (Labels 팝오버 내부)
2. **Checkbox** - 레이블 선택 체크박스

### 설치 명령어

```bash
npx shadcn@latest add command
npx shadcn@latest add checkbox
```

---

## 5단계: LabelPicker 컴포넌트 구현

### 파일: `src/components/tasks/LabelPicker.tsx`

#### 주요 기능

1. **레이블 표시**: 선택된 레이블을 배지로 표시
2. **추가 버튼**: "+" 버튼으로 팝오버 열기
3. **검색**: 레이블 이름으로 검색
4. **선택/해제**: 체크박스로 다중 선택
5. **편집**: 연필 아이콘으로 레이블 이름 편집
6. **새 레이블 생성**: "Create a new label" 버튼

#### UI 구조 (이미지 #4, #5 참고)

```tsx
<FormField name="labels">
  <FormItem>
    <FormLabel>레이블</FormLabel>
    <div className="flex flex-wrap gap-2">
      {/* 선택된 레이블 배지들 */}
      {selectedLabels.map(label => (
        <Badge style={{ backgroundColor: label.color }}>
          {label.name || ' '}
        </Badge>
      ))}

      {/* 추가 버튼 */}
      <Popover>
        <PopoverTrigger>
          <Button size="icon"><Plus /></Button>
        </PopoverTrigger>
        <PopoverContent>
          {/* 검색 입력 */}
          <Input placeholder="Search labels..." />

          {/* 레이블 목록 */}
          {labels.map(label => (
            <div className="flex items-center gap-2">
              <Checkbox checked={isSelected(label.id)} />
              <div style={{ backgroundColor: label.color }}>
                {label.name}
              </div>
              <Button size="icon"><Pencil /></Button>
            </div>
          ))}

          {/* 새 레이블 생성 */}
          <Button>Create a new label</Button>
        </PopoverContent>
      </Popover>
    </div>
  </FormItem>
</FormField>
```

---

## 6단계: TaskFormDialog 수정

### 파일: `src/components/tasks/TaskFormDialog.tsx`

#### 변경 사항

1. 작업 제목과 설명 사이에 LabelPicker 추가
2. form defaultValues에 labels 추가
3. onSubmit에서 labels 처리

```tsx
// 작업 제목 필드 다음에 추가
<FormField
  control={form.control}
  name="labels"
  render={({ field }) => (
    <LabelPicker
      value={field.value || []}
      onChange={field.onChange}
    />
  )}
/>
```

---

## 7단계: TaskCard 수정

### 파일: `src/components/tasks/TaskCard.tsx`

#### 변경 사항 (이미지 #6 참고)

1. 카드 상단에 레이블 컬러 막대 추가
2. 기존 colorTag 로직과 병합 또는 대체

```tsx
{/* 레이블 컬러 막대 - 카드 상단 */}
{task.labels && task.labels.length > 0 && (
  <div className="flex gap-0.5 absolute top-0 left-0 right-0">
    {task.labels.map(labelId => {
      const label = getLabelById(labelId)
      return label ? (
        <div
          key={labelId}
          className="h-2 flex-1 rounded-t-sm"
          style={{ backgroundColor: label.color }}
        />
      ) : null
    })}
  </div>
)}
```

---

## 8단계: 마이그레이션 고려사항

### 기존 colorTag와의 호환성

- 기존 `colorTag` 필드는 단일 색상만 지원
- 새로운 `labels` 필드는 다중 레이블 지원
- 마이그레이션 옵션:
  1. colorTag를 labels로 자동 변환
  2. colorTag와 labels 병행 운영
  3. colorTag 폐기 (breaking change)

**권장**: colorTag를 labels로 마이그레이션하는 유틸리티 함수 추가

---

## 구현 순서 요약

| 단계 | 파일 | 작업 |
|------|------|------|
| 1 | `types/task.ts` | Label 타입 추가, Task에 labels 필드 추가 |
| 2 | `lib/validations/task.ts` | labelSchema 추가, taskFormSchema에 labels 추가 |
| 3 | `store/taskStore.ts` | labels 상태 및 CRUD 액션 추가 |
| 4 | CLI | `npx shadcn@latest add command checkbox` |
| 5 | `components/tasks/LabelPicker.tsx` | 새 컴포넌트 생성 |
| 6 | `components/tasks/TaskFormDialog.tsx` | LabelPicker 통합 |
| 7 | `components/tasks/TaskCard.tsx` | 레이블 막대 UI 추가 |
| 8 | 마이그레이션 | colorTag → labels 변환 (선택) |

---

## 예상 부작용 및 주의사항

### 1. localStorage 스키마 변경
- 기존 저장된 데이터와의 호환성 확인 필요
- 스토어의 persist 미들웨어가 자동으로 병합 처리

### 2. 드래그 앤 드롭 영향
- TaskCard 상단에 요소 추가 시 드래그 핸들 영역 확인

### 3. 성능 고려
- 레이블 목록이 많아질 경우 가상화 검토
- getLabelById 호출 최적화 (메모이제이션)

### 4. 접근성
- 체크박스에 적절한 aria-label 추가
- 색상만으로 구분하지 않도록 이름 표시 권장

---

## 테스트 체크리스트

- [ ] 새 작업 생성 시 레이블 선택 가능
- [ ] 기존 작업 편집 시 레이블 수정 가능
- [ ] TaskCard에 선택된 레이블 색상 표시
- [ ] 레이블 검색 기능 작동
- [ ] 새 레이블 생성 기능 작동
- [ ] 레이블 이름 편집 기능 작동
- [ ] localStorage에 레이블 데이터 저장/복원
- [ ] 드래그 앤 드롭 기능 정상 작동
