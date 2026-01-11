# TaskFormDialog 체크리스트 문제 해결 가이드

## 문제 현상
`TaskFormDialog.tsx`의 체크리스트 섹션에서:
1. 체크박스를 클릭해도 아무런 반응 없음 (체크 표시 안됨)
2. 인풋 필드 디자인이 다른 폼 요소와 어울리지 않음

---

## 근본 원인 분석

### 1. 체크박스 반응 없음 - React Hook Form 상태 구독 문제

**문제 코드** (`src/components/tasks/TaskFormDialog.tsx:414-436`):
```jsx
<button
  type="button"
  className={cn(
    'flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center',
    'transition-colors duration-200',
    form.getValues(`checklist.${index}.completed`)  // ← 문제 1: 구독 없음
      ? 'bg-[#61BD4F] border-[#61BD4F] text-white'
      : 'border-[#DFE1E6] hover:border-[#0079BF]'
  )}
  onClick={() => {
    const current = form.getValues(`checklist.${index}.completed`);  // ← 문제 2
    form.setValue(`checklist.${index}.completed`, !current);
  }}
>
  {form.getValues(`checklist.${index}.completed`) && (  // ← 문제 3: 구독 없음
    <Check className="w-3 h-3" />
  )}
</button>
```

**원인 분석**:
| 메서드 | 동작 | 리렌더링 |
|--------|------|----------|
| `form.getValues()` | 현재 값만 읽음 (스냅샷) | ❌ 트리거 안됨 |
| `form.watch()` | 값 변경 구독 | ✅ 자동 리렌더링 |
| `form.setValue()` | 값 변경 | 구독자에게만 알림 |

**결과**: `setValue()`로 값을 변경해도 `getValues()`를 사용하는 부분은 리렌더링되지 않아 UI가 업데이트되지 않음

---

### 2. 디자인 불일치 - DESIGN_SYSTEM.md 기준 미충족

**현재 구현 vs DESIGN_SYSTEM.md 권장**:

| 요소 | 현재 | 권장 (Trello 스타일) |
|------|------|---------------------|
| 체크박스 크기 | `w-4 h-4` (16px) | `w-5 h-5` (20px) - 터치 영역 확대 |
| 체크박스 모서리 | `rounded` (4px) | `rounded-sm` (2px) - 더 샤프한 느낌 |
| 아이템 컨테이너 | 플랫 디자인 | `shadow-trello-card` 적용 |
| 호버 효과 | 없음 | 배경색 변경 (`#F4F5F7`) |

---

## 단계별 해결 방법

### Step 1: 체크박스 상태 구독 수정

**파일**: `src/components/tasks/TaskFormDialog.tsx`

**수정 내용**: `form.getValues()` → `form.watch()` 변경

#### 1.1 checklist 전체 watch 추가 (약 106번 줄 근처)

```jsx
// 기존 코드 (useFieldArray 아래에 추가)
const { fields, append, remove } = useFieldArray({
  control: form.control,
  name: 'checklist',
});

// 추가할 코드
const watchedChecklist = form.watch('checklist');
```

#### 1.2 체크박스 className 수정 (약 419번 줄)

**수정 전**:
```jsx
className={cn(
  'flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center',
  'transition-colors duration-200',
  form.getValues(`checklist.${index}.completed`)
    ? 'bg-[#61BD4F] border-[#61BD4F] text-white'
    : 'border-[#DFE1E6] hover:border-[#0079BF]'
)}
```

**수정 후**:
```jsx
className={cn(
  'flex-shrink-0 w-5 h-5 rounded-sm border-2 flex items-center justify-center',
  'transition-all duration-200 cursor-pointer',
  watchedChecklist?.[index]?.completed
    ? 'bg-[#61BD4F] border-[#61BD4F] text-white'
    : 'border-[#DFE1E6] hover:border-[#0079BF] hover:bg-[#F4F5F7]'
)}
```

#### 1.3 onClick 핸들러 수정 (약 423번 줄)

**수정 전**:
```jsx
onClick={() => {
  const current = form.getValues(`checklist.${index}.completed`);
  form.setValue(`checklist.${index}.completed`, !current);
}}
```

**수정 후**:
```jsx
onClick={() => {
  const current = watchedChecklist?.[index]?.completed ?? false;
  form.setValue(`checklist.${index}.completed`, !current);
}}
```

#### 1.4 체크 아이콘 조건 수정 (약 433번 줄)

**수정 전**:
```jsx
{form.getValues(`checklist.${index}.completed`) && (
  <Check className="w-3 h-3" />
)}
```

**수정 후**:
```jsx
{watchedChecklist?.[index]?.completed && (
  <Check className="w-3.5 h-3.5" />
)}
```

---

### Step 2: 인풋 필드 취소선 조건 수정 (약 445번 줄)

**수정 전**:
```jsx
className={cn(
  'flex-1 border-0 bg-transparent',
  'text-sm text-[#172B4D] placeholder:text-[#9E9E9E]',
  'focus:outline-none focus:ring-0 p-0',
  form.getValues(`checklist.${index}.completed`) &&
    'line-through text-[#6B778C]'
)}
```

**수정 후**:
```jsx
className={cn(
  'flex-1 border-0 bg-transparent',
  'text-sm text-[#172B4D] placeholder:text-[#9E9E9E]',
  'focus:outline-none focus:ring-0 p-0',
  watchedChecklist?.[index]?.completed &&
    'line-through text-[#6B778C]'
)}
```

---

### Step 3: 아이템 컨테이너 디자인 개선 (약 406번 줄)

**수정 전**:
```jsx
<div
  key={field.id}
  className={cn(
    'flex items-center gap-2',
    'px-3 py-2',
    'bg-[#FAFBFC] border border-[#DFE1E6] rounded',
    'transition-all duration-200',
    'focus-within:bg-white focus-within:border-[#0079BF] focus-within:ring-2 focus-within:ring-[#0079BF]/20'
  )}
>
```

**수정 후**:
```jsx
<div
  key={field.id}
  className={cn(
    'flex items-center gap-3',
    'px-3 py-2.5',
    'bg-white border border-[#DFE1E6] rounded-lg',
    'shadow-sm hover:shadow-md',
    'transition-all duration-200',
    'focus-within:border-[#0079BF] focus-within:ring-2 focus-within:ring-[#0079BF]/20',
    watchedChecklist?.[index]?.completed && 'bg-[#F4F5F7] opacity-75'
  )}
>
```

---

## 전체 수정 코드 요약

```jsx
// 1. watch 추가 (useFieldArray 아래)
const watchedChecklist = form.watch('checklist');

// 2. 체크리스트 아이템 렌더링
{fields.map((field, index) => (
  <div
    key={field.id}
    className={cn(
      'flex items-center gap-3',
      'px-3 py-2.5',
      'bg-white border border-[#DFE1E6] rounded-lg',
      'shadow-sm hover:shadow-md',
      'transition-all duration-200',
      'focus-within:border-[#0079BF] focus-within:ring-2 focus-within:ring-[#0079BF]/20',
      watchedChecklist?.[index]?.completed && 'bg-[#F4F5F7] opacity-75'
    )}
  >
    {/* 체크박스 */}
    <button
      type="button"
      className={cn(
        'flex-shrink-0 w-5 h-5 rounded-sm border-2 flex items-center justify-center',
        'transition-all duration-200 cursor-pointer',
        watchedChecklist?.[index]?.completed
          ? 'bg-[#61BD4F] border-[#61BD4F] text-white'
          : 'border-[#DFE1E6] hover:border-[#0079BF] hover:bg-[#F4F5F7]'
      )}
      onClick={() => {
        const current = watchedChecklist?.[index]?.completed ?? false;
        form.setValue(`checklist.${index}.completed`, !current);
      }}
    >
      {watchedChecklist?.[index]?.completed && (
        <Check className="w-3.5 h-3.5" />
      )}
    </button>

    {/* 텍스트 입력 */}
    <Input
      {...form.register(`checklist.${index}.text`)}
      placeholder={`체크리스트 항목 ${index + 1}`}
      className={cn(
        'flex-1 border-0 bg-transparent',
        'text-sm text-[#172B4D] placeholder:text-[#9E9E9E]',
        'focus:outline-none focus:ring-0 p-0',
        watchedChecklist?.[index]?.completed &&
          'line-through text-[#6B778C]'
      )}
      onKeyDown={e => handleChecklistKeyDown(e, index)}
    />

    {/* 삭제 버튼 */}
    <button
      type="button"
      className="flex-shrink-0 p-1 text-[#6B778C] hover:text-[#EB5A46] hover:bg-[#FFE2E2] rounded transition-colors"
      onClick={() => remove(index)}
    >
      <X className="w-3 h-3" />
    </button>
  </div>
))}
```

---

## 검증 방법

### 테스트 1: 체크박스 토글
1. `npm run dev` 실행
2. "작업 추가" 버튼 클릭
3. "항목 추가" 버튼으로 체크리스트 항목 생성
4. 체크박스 클릭
5. **예상 결과**:
   - 체크박스에 ✓ 표시
   - 녹색 배경 (`#61BD4F`)
   - 텍스트에 취소선 적용

### 테스트 2: 체크박스 해제
1. 체크된 체크박스 다시 클릭
2. **예상 결과**:
   - 체크 표시 제거
   - 흰색 배경으로 복귀
   - 취소선 제거

### 테스트 3: 폼 제출 시 데이터 확인
1. 체크리스트 항목 추가 및 일부 체크
2. "추가" 버튼 클릭
3. **예상 결과**: 체크 상태가 저장된 작업 생성

### 테스트 4: 디자인 일관성
1. 체크리스트 아이템 호버
2. **예상 결과**:
   - 그림자 증가 효과
   - 체크박스 테두리 색상 변경

---

## 참고 자료

- [React Hook Form - watch](https://react-hook-form.com/docs/useform/watch)
- [React Hook Form - getValues vs watch](https://react-hook-form.com/docs/useform/getvalues)
- [DESIGN_SYSTEM.md](../../DESIGN_SYSTEM.md) - Trello 스타일 가이드

---

**작성일**: 2026-01-11
**관련 파일**:
- `src/components/tasks/TaskFormDialog.tsx`
- `DESIGN_SYSTEM.md`
