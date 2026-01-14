# 마감일 UI 버튼 스타일 개선 가이드

## 개요

`TaskFormDialog.tsx`의 마감일 선택 UI를 현재 Popover Trigger 스타일에서 버튼 형식으로 개선하고, 마감일 상태 배지를 추가합니다.

---

## 현재 상태 vs 목표 상태

### 현재 상태 (AS-IS)
```
┌─────────────────────────────────────┐
│ 마감일                              │
│ ┌─────────────────────────────────┐ │
│ │ 2026년 1월 13일              📅 │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```
- 전체 너비를 사용하는 Popover 트리거
- 캘린더 아이콘만 표시
- 마감일 상태 정보 없음

### 목표 상태 (TO-BE)
```
┌─────────────────────────────────────┐
│ 마감일                              │
│ ┌───────────────────────────────┬─┐ │
│ │ 1월 15, 9:02 AM │ 곧 마감 │ ▼ │ │
│ └───────────────────────────────┴─┘ │
└─────────────────────────────────────┘
```
- 컴팩트한 버튼 스타일
- 마감 상태 배지 (곧 마감, 마감 지남 등)
- 드롭다운 아이콘 (ChevronDown)

---

## 근본 원인 분석

### 1. 현재 코드 구조 (`TaskFormDialog.tsx:359-413`)

```tsx
<FormField
  control={form.control}
  name="dueDate"
  render={({ field }) => (
    <FormItem className="flex flex-col">
      <FormLabel>마감일</FormLabel>
      <Popover>
        <PopoverTrigger asChild>
          <FormControl>
            <button
              type="button"
              className={cn(
                'trello-date-picker',
                'w-full px-3 py-2 text-left',  // ← 전체 너비
                'bg-[#FAFBFC] border border-[#DFE1E6] rounded',
                // ...
              )}
            >
              {field.value ? formatDate(field.value) : <span>마감일 선택</span>}
              <Calendar className="w-4 h-4 ml-auto opacity-50" />  // ← 캘린더 아이콘만
            </button>
          </FormControl>
        </PopoverTrigger>
        {/* ... */}
      </Popover>
    </FormItem>
  )}
/>
```

### 2. 개선이 필요한 부분

| 항목 | 현재 | 개선 필요 |
|------|------|-----------|
| 버튼 스타일 | 입력 필드 스타일 | 버튼 컴포넌트 스타일 |
| 날짜 포맷 | `2026년 1월 13일` | `1월 15일, 9:02 AM` (간결) |
| 상태 표시 | 없음 | 배지 (곧 마감, 마감 지남 등) |
| 아이콘 | Calendar (오른쪽) | ChevronDown (드롭다운 표시) |
| 레이아웃 | 전체 너비 | 컴팩트 (내용에 맞춤) |

---

## DESIGN_SYSTEM.md 기반 스타일 가이드

### 색상 시스템

| 상태 | 배경색 | 텍스트색 | 설명 |
|------|--------|----------|------|
| 기본 | `#FAFBFC` | `#172B4D` | 마감일 설정됨 |
| 곧 마감 (3일 이내) | `#F2D600` (Warning) | `#172B4D` | 주의 필요 |
| 마감 지남 | `#EB5A46` (Danger) | `#FFFFFF` | 긴급 |
| 오늘 마감 | `#F2D600` | `#172B4D` | 오늘 처리 필요 |
| 미설정 | `transparent` | `#6B778C` | 마감일 없음 |

### 버튼 스타일 (Trello 기준)

```css
/* DESIGN_SYSTEM.md - 6.2 보조 버튼 */
.btn-secondary {
  background-color: transparent;
  color: #42526E;
  border-radius: 8px;
  transition: background-color 0.2s ease;
}

.btn-secondary:hover {
  background-color: #F4F5F7;
}
```

### 배지 스타일

```css
.due-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 3px;
  font-size: 12px;
  font-weight: 500;
}

.due-badge-warning {
  background-color: #F2D600;
  color: #172B4D;
}

.due-badge-danger {
  background-color: #EB5A46;
  color: #FFFFFF;
}
```

---

## 단계별 구현 계획

### Step 1: 마감일 상태 유틸리티 함수 추가

**파일**: `src/lib/utils.ts`

```typescript
// 마감일 상태 타입
export type DueDateStatus = 'overdue' | 'today' | 'soon' | 'normal' | 'none';

// 마감일 상태 계산 함수
export function getDueDateStatus(dateString: string | undefined): DueDateStatus {
  if (!dateString) return 'none';

  const dueDate = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  dueDate.setHours(0, 0, 0, 0);

  const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'overdue';
  if (diffDays === 0) return 'today';
  if (diffDays <= 3) return 'soon';
  return 'normal';
}

// 마감일 상태 라벨
export function getDueDateLabel(status: DueDateStatus): string {
  const labels: Record<DueDateStatus, string> = {
    overdue: '마감 지남',
    today: '오늘 마감',
    soon: '곧 마감',
    normal: '',
    none: '',
  };
  return labels[status];
}

// 간결한 날짜 포맷
export function formatDateCompact(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric',
  });
}
```

---

### Step 2: 마감일 버튼 컴포넌트 생성 (선택적)

**파일**: `src/components/ui/DueDateButton.tsx` (신규)

```tsx
'use client';

import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getDueDateStatus, getDueDateLabel, formatDateCompact, type DueDateStatus } from '@/lib/utils';

interface DueDateButtonProps {
  value?: string;
  onClick?: () => void;
  className?: string;
}

const statusStyles: Record<DueDateStatus, { badge: string; text: string }> = {
  overdue: {
    badge: 'bg-[#EB5A46] text-white',
    text: 'text-[#EB5A46]',
  },
  today: {
    badge: 'bg-[#F2D600] text-[#172B4D]',
    text: 'text-[#172B4D]',
  },
  soon: {
    badge: 'bg-[#F2D600] text-[#172B4D]',
    text: 'text-[#172B4D]',
  },
  normal: {
    badge: '',
    text: 'text-[#172B4D]',
  },
  none: {
    badge: '',
    text: 'text-[#6B778C]',
  },
};

export function DueDateButton({ value, onClick, className }: DueDateButtonProps) {
  const status = getDueDateStatus(value);
  const label = getDueDateLabel(status);
  const styles = statusStyles[status];

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-2',
        'px-3 py-2 rounded-trello',
        'bg-[#091E420F] hover:bg-[#091E4224]',
        'transition-colors duration-200',
        'text-sm font-medium',
        styles.text,
        className
      )}
    >
      <span>{value ? formatDateCompact(value) : '마감일 설정'}</span>

      {label && (
        <span
          className={cn(
            'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
            styles.badge
          )}
        >
          {label}
        </span>
      )}

      <ChevronDown className="w-4 h-4 opacity-60" />
    </button>
  );
}
```

---

### Step 3: TaskFormDialog 수정

**파일**: `src/components/tasks/TaskFormDialog.tsx`

#### 3.1 Import 추가

```diff
- import { Plus, Calendar, X, Check } from 'lucide-react';
+ import { Plus, Calendar, X, Check, ChevronDown } from 'lucide-react';
```

```diff
- import { formatDate } from '@/lib/utils';
+ import { formatDate, formatDateCompact, getDueDateStatus, getDueDateLabel } from '@/lib/utils';
```

#### 3.2 마감일 FormField 수정 (약 359-413줄)

**수정 전**:
```tsx
<FormField
  control={form.control}
  name="dueDate"
  render={({ field }) => (
    <FormItem className="flex flex-col">
      <FormLabel className="text-sm font-medium text-[#172B4D]">
        마감일
      </FormLabel>
      <Popover>
        <PopoverTrigger asChild>
          <FormControl>
            <button
              type="button"
              className={cn(
                'trello-date-picker',
                'w-full px-3 py-2 text-left',
                'bg-[#FAFBFC] border border-[#DFE1E6] rounded',
                'text-sm text-[#172B4D]',
                'hover:bg-[#F4F5F7]',
                'focus:bg-white focus:border-[#0079BF] focus:ring-2 focus:ring-[#0079BF]/20 focus:outline-none',
                'transition-all duration-200',
                !field.value && 'text-[#9E9E9E]'
              )}
            >
              {field.value ? (
                formatDate(field.value)
              ) : (
                <span>마감일 선택</span>
              )}
              <Calendar className="w-4 h-4 ml-auto opacity-50" />
            </button>
          </FormControl>
        </PopoverTrigger>
        {/* ... */}
      </Popover>
    </FormItem>
  )}
/>
```

**수정 후**:
```tsx
<FormField
  control={form.control}
  name="dueDate"
  render={({ field }) => {
    const status = getDueDateStatus(field.value);
    const statusLabel = getDueDateLabel(status);

    // 상태별 스타일
    const badgeStyles = {
      overdue: 'bg-[#EB5A46] text-white',
      today: 'bg-[#F2D600] text-[#172B4D]',
      soon: 'bg-[#F2D600] text-[#172B4D]',
      normal: '',
      none: '',
    };

    return (
      <FormItem className="flex flex-col">
        <FormLabel className="text-sm font-medium text-[#172B4D]">
          마감일
        </FormLabel>
        <Popover>
          <PopoverTrigger asChild>
            <FormControl>
              <button
                type="button"
                className={cn(
                  'inline-flex items-center gap-2',
                  'w-full px-3 py-2 text-left',
                  'bg-[#091E420F] hover:bg-[#091E4224]',
                  'border border-transparent rounded-trello',
                  'text-sm font-medium text-[#172B4D]',
                  'focus:bg-[#091E4224] focus:border-[#0079BF] focus:ring-2 focus:ring-[#0079BF]/20 focus:outline-none',
                  'transition-all duration-200',
                  !field.value && 'text-[#6B778C]'
                )}
              >
                <span className="flex-1">
                  {field.value ? formatDateCompact(field.value) : '마감일 설정'}
                </span>

                {statusLabel && (
                  <span
                    className={cn(
                      'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
                      badgeStyles[status]
                    )}
                  >
                    {statusLabel}
                  </span>
                )}

                <ChevronDown className="w-4 h-4 opacity-60 flex-shrink-0" />
              </button>
            </FormControl>
          </PopoverTrigger>
          <PopoverContent
            className="bg-white border border-[#DFE1E6] rounded-lg shadow-trello-card p-1"
            align="start"
          >
            <CalendarComponent
              mode="single"
              selected={
                field.value ? new Date(field.value) : undefined
              }
              onSelect={date => {
                field.onChange(date?.toISOString());
              }}
              disabled={date => date < today}
              weekStartsOn={1}
              className="border-0"
            />
          </PopoverContent>
        </Popover>
        <FormMessage className="text-xs text-[#EB5A46]" />
      </FormItem>
    );
  }}
/>
```

---

### Step 4: utils.ts 함수 추가

**파일**: `src/lib/utils.ts`

기존 `formatDate` 함수 아래에 추가:

```typescript
// 마감일 상태 타입
export type DueDateStatus = 'overdue' | 'today' | 'soon' | 'normal' | 'none';

// 마감일 상태 계산
export function getDueDateStatus(dateString: string | undefined): DueDateStatus {
  if (!dateString) return 'none';

  const dueDate = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  dueDate.setHours(0, 0, 0, 0);

  const diffDays = Math.ceil(
    (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays < 0) return 'overdue';
  if (diffDays === 0) return 'today';
  if (diffDays <= 3) return 'soon';
  return 'normal';
}

// 마감일 상태 라벨 (한국어)
export function getDueDateLabel(status: DueDateStatus): string {
  const labels: Record<DueDateStatus, string> = {
    overdue: '마감 지남',
    today: '오늘 마감',
    soon: '곧 마감',
    normal: '',
    none: '',
  };
  return labels[status];
}

// 간결한 날짜 포맷
export function formatDateCompact(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric',
    weekday: 'short',
  });
}
```

---

## 부작용 분석 및 대응

### 1. 기존 기능 영향

| 영역 | 영향도 | 설명 | 대응 |
|------|--------|------|------|
| TaskCard 표시 | 없음 | TaskFormDialog만 수정 | - |
| 폼 제출 | 없음 | field.value 구조 동일 | - |
| 캘린더 기능 | 없음 | PopoverContent 내부 동일 | - |
| 반응형 레이아웃 | 낮음 | 버튼 너비 변경 | flex-1로 유지 |

### 2. 스타일 충돌 가능성

| 요소 | 위험 | 대응 |
|------|------|------|
| `rounded-trello` | Tailwind 설정 필요 | `tailwind.config.js` 확인 |
| `bg-[#091E420F]` | Trello 스타일 색상 | DESIGN_SYSTEM.md 준수 |
| 배지 색상 | Warning/Danger 색상 사용 | 기존 팔레트 활용 |

### 3. 접근성 고려

| 항목 | 현재 | 개선 |
|------|------|------|
| 색상 대비 | 미확인 | WCAG AA 4.5:1 이상 보장 |
| 스크린 리더 | 날짜만 읽힘 | aria-label에 상태 포함 |
| 키보드 접근 | 지원됨 | 기존 Popover 동작 유지 |

---

## 검증 방법

### 테스트 1: 마감일 상태 표시

1. `npm run dev` 실행
2. "작업 추가" 버튼 클릭
3. 마감일을 다양한 날짜로 설정:
   - **오늘**: "오늘 마감" 노란색 배지 표시
   - **내일~3일 후**: "곧 마감" 노란색 배지 표시
   - **4일 후 이상**: 배지 없음
   - **과거 날짜** (수정 시): "마감 지남" 빨간색 배지 표시

### 테스트 2: 버튼 스타일

1. 마감일 버튼 호버
2. **예상 결과**:
   - 배경색 `#091E4224`로 변경
   - 부드러운 전환 효과 (0.2s)

### 테스트 3: 폼 제출 데이터

1. 마감일 설정 후 작업 추가
2. **예상 결과**: localStorage에 ISO 형식 날짜 저장 확인

### 테스트 4: 반응형 레이아웃

1. 다이얼로그를 좁은 너비로 조정
2. **예상 결과**: 버튼이 전체 너비를 유지하며 배지가 올바르게 표시

---

## 구현 순서

1. **Step 1**: `src/lib/utils.ts`에 유틸리티 함수 추가
2. **Step 2**: `TaskFormDialog.tsx` import 수정
3. **Step 3**: dueDate FormField 코드 교체
4. **Step 4**: 테스트 및 검증
5. **Step 5**: (선택) 별도 `DueDateButton.tsx` 컴포넌트 분리

---

## 참고 자료

### shadcn/ui Date Picker 패턴

```tsx
// Context7에서 수집한 표준 패턴
<Popover>
  <PopoverTrigger asChild>
    <Button
      variant="outline"
      className="w-[280px] justify-start text-left font-normal"
    >
      <CalendarIcon />
      {date ? format(date, "PPP") : <span>Pick a date</span>}
    </Button>
  </PopoverTrigger>
  <PopoverContent className="w-auto p-0">
    <Calendar mode="single" selected={date} onSelect={setDate} />
  </PopoverContent>
</Popover>
```

### 관련 문서

- [DESIGN_SYSTEM.md](../../DESIGN_SYSTEM.md) - Trello 스타일 가이드
- [shadcn/ui Date Picker](https://ui.shadcn.com/docs/components/date-picker)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

**작성일**: 2026-01-14
**관련 파일**:
- `src/components/tasks/TaskFormDialog.tsx`
- `src/lib/utils.ts`
- `src/components/ui/calendar.tsx`
- `src/components/ui/popover.tsx`
- `DESIGN_SYSTEM.md`
