# 마감일 캘린더 기본값 및 날짜 제한 개선 가이드

## 문제 현상

`TaskFormDialog.tsx`의 마감일 선택 캘린더에서:
1. 과거 날짜가 선택 가능한 상태로 보임 (실제로는 이미 비활성화됨)
2. 새 작업 추가 시 오늘 날짜가 기본 선택되지 않음 ("마감일 선택" placeholder 표시)

---

## 현재 구현 상태 분석

### 과거 날짜 비활성화 (이미 구현됨)

**파일**: `src/components/tasks/TaskFormDialog.tsx`

**라인 88-92**: `today` 변수 정의
```typescript
const today = useMemo(() => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}, []);
```

**라인 377**: 과거 날짜 비활성화
```typescript
<CalendarComponent
  mode="single"
  selected={field.value ? new Date(field.value) : undefined}
  onSelect={date => {
    field.onChange(date?.toISOString());
  }}
  disabled={date => date < today}  // ← 과거 날짜 비활성화
  weekStartsOn={1}
  className="border-0"
/>
```

**결과**: `date < today` 조건으로 인해 오늘 이전 날짜는 선택 불가 (회색으로 표시)

---

### 오늘 날짜 기본 선택 (미구현)

**현재 상태** (라인 96-104):
```typescript
const form = useForm<TaskFormSchema>({
  resolver: zodResolver(taskFormSchema),
  defaultValues: {
    title: initialData?.title || '',
    description: initialData?.description || '',
    quadrant: initialData?.quadrant || defaultQuadrant,
    priority: initialData?.priority || 'medium',
    dueDate: initialData?.dueDate,  // ← 기본값 없음 (undefined)
    checklist: initialData?.checklist || [],
  },
});
```

**결과**: 새 작업 추가 시 마감일이 선택되지 않은 상태로 시작

---

## 단계별 해결 방법

### Step 1: 오늘 날짜 기본 선택 구현

**파일**: `src/components/tasks/TaskFormDialog.tsx`

**수정 위치**: 라인 101

**변경 전**:
```typescript
dueDate: initialData?.dueDate,
```

**변경 후**:
```typescript
dueDate: initialData?.dueDate || new Date().toISOString(),
```

**또는 새 작업 추가 시에만 기본값 설정**:
```typescript
dueDate: initialData?.dueDate ?? (mode === 'add' ? new Date().toISOString() : undefined),
```

---

### Step 2: form.reset()에서도 동일하게 적용

**수정 위치**: 라인 113-123 (useEffect 내부)

**변경 전**:
```typescript
useEffect(() => {
  if (open) {
    form.reset({
      title: initialData?.title || '',
      description: initialData?.description || '',
      quadrant: initialData?.quadrant || defaultQuadrant,
      priority: initialData?.priority || 'medium',
      dueDate: initialData?.dueDate,
      checklist: initialData?.checklist || [],
    });
  }
}, [open, initialData, defaultQuadrant, form]);
```

**변경 후**:
```typescript
useEffect(() => {
  if (open) {
    form.reset({
      title: initialData?.title || '',
      description: initialData?.description || '',
      quadrant: initialData?.quadrant || defaultQuadrant,
      priority: initialData?.priority || 'medium',
      dueDate: initialData?.dueDate || new Date().toISOString(),
      checklist: initialData?.checklist || [],
    });
  }
}, [open, initialData, defaultQuadrant, form]);
```

---

### Step 3: 날짜 비활성화 조건 확인

현재 `disabled={date => date < today}`는 오늘 **이전** 날짜만 비활성화합니다.

**오늘 포함 비활성화가 필요한 경우**:
```typescript
disabled={date => date < today}  // 오늘은 선택 가능
// 또는
disabled={date => date <= today}  // 오늘도 비활성화 (마감일이 내일부터여야 하는 경우)
```

---

## 전체 수정 코드

```typescript
// 라인 96-104: defaultValues 수정
const form = useForm<TaskFormSchema>({
  resolver: zodResolver(taskFormSchema),
  defaultValues: {
    title: initialData?.title || '',
    description: initialData?.description || '',
    quadrant: initialData?.quadrant || defaultQuadrant,
    priority: initialData?.priority || 'medium',
    dueDate: initialData?.dueDate || new Date().toISOString(),  // 오늘 날짜 기본값
    checklist: initialData?.checklist || [],
  },
});

// 라인 113-123: useEffect의 form.reset 수정
useEffect(() => {
  if (open) {
    form.reset({
      title: initialData?.title || '',
      description: initialData?.description || '',
      quadrant: initialData?.quadrant || defaultQuadrant,
      priority: initialData?.priority || 'medium',
      dueDate: initialData?.dueDate || new Date().toISOString(),  // 오늘 날짜 기본값
      checklist: initialData?.checklist || [],
    });
  }
}, [open, initialData, defaultQuadrant, form]);
```

---

## 검증 방법

### 테스트 1: 새 작업 추가 시 기본 날짜
1. `npm run dev` 실행
2. "작업 추가" 버튼 클릭
3. **예상 결과**: 마감일 필드에 오늘 날짜가 표시됨 (예: "2026년 1월 12일")

### 테스트 2: 과거 날짜 비활성화
1. 마감일 필드 클릭하여 캘린더 열기
2. **예상 결과**:
   - 오늘 이전 날짜 (1-11일) 회색으로 비활성화
   - 클릭해도 선택되지 않음

### 테스트 3: 오늘 및 미래 날짜 선택
1. 캘린더에서 오늘 날짜 (12일) 클릭
2. **예상 결과**: 정상 선택됨
3. 미래 날짜 (13일 이후) 클릭
4. **예상 결과**: 정상 선택됨

### 테스트 4: 기존 작업 수정
1. 기존 작업의 수정 버튼 클릭
2. **예상 결과**: 기존에 설정된 마감일이 표시됨 (오늘 날짜로 덮어쓰지 않음)

### 테스트 5: 빌드 검증
```bash
npm run build
```
**예상 결과**: TypeScript 컴파일 및 빌드 성공

---

## Calendar 컴포넌트 스타일 참고

**파일**: `src/components/ui/calendar.tsx`

```typescript
// 비활성화된 날짜 스타일 (라인 43)
day_disabled: 'text-[#9E9E9E] opacity-50',

// 오늘 날짜 스타일 (라인 41)
day_today: 'bg-[#F4F5F7] text-[#172B4D] font-semibold',

// 선택된 날짜 스타일 (라인 39-40)
day_selected: '!bg-[#0079BF] !text-white hover:!bg-[#0079BF] hover:!text-white font-semibold',
```

---

## 고려사항

### 마감일 필수 여부

현재 마감일은 선택사항입니다. 기본값으로 오늘 날짜를 설정하면:
- **장점**: 사용자가 마감일을 항상 인식하게 됨
- **단점**: 마감일 없이 작업을 추가하려면 명시적으로 삭제해야 함

마감일 삭제 기능이 필요하다면 추가 UI 구현 필요:
```tsx
{field.value && (
  <button
    type="button"
    onClick={() => field.onChange(undefined)}
    className="text-xs text-[#6B778C] hover:text-[#EB5A46]"
  >
    마감일 삭제
  </button>
)}
```

---

## 참고 자료

- [react-day-picker 문서](https://react-day-picker.js.org/)
- [date-fns 한국어 로케일](https://date-fns.org/docs/I18n)

---

**작성일**: 2026-01-12
**관련 파일**:
- `src/components/tasks/TaskFormDialog.tsx`
- `src/components/ui/calendar.tsx`
