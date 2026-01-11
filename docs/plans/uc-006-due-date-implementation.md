# UC-006 마감일 설정 및 확인 (Due Date) 구현 계획서

## 문서 정보

| 항목 | 내용 |
|------|------|
| 문서 ID | IMPL-UC-006 |
| 유스 케이스 | UC-006: 마감일 설정 및 확인 |
| 작성일 | 2026-01-11 |
| 버전 | 1.0 |
| 상태 | 초안 |

---

## 1. 개요

### 1.1 목적
사용자가 작업에 마감일을 설정하거나, 설정된 마감일을 확인하는 기능

### 1.2 현재 구현 상태
| 기능 | 상태 | 설명 |
|------|------|------|
| dueDate 필드 | ✅ 완료 | Task 타입에 dueDate?: string 정의됨 |
| 마감일 설정 (대화상자) | ✅ 완료 | Calendar 컴포넌트 + Popover |
| 마감일 표시 (카드) | ⚠️ 부분 | Calendar 아이콘 + 기본 형식만 |
| **상대적 날짜 표시** | ❌ 미구현 | 오늘, 내일, N일 후 형식 |
| **마감일 상태별 색상** | ❌ 미구현 | 회색/노란색/빨간색 |
| **마감일清除 옵션** | ❌ 미구현 | Popover 내 삭제 버튼 |

### 1.3 의존성

| 라이브러리 | 버전 | 용도 |
|------------|------|------|
| date-fns | 4.x | 날짜 계산, 형식화 |
| react-day-picker | 9.x | shadcn/ui Calendar |
| shadcn/ui Popover | 2.x | 캘린더 팝업 |

---

## 2. 요구사항 분석

### 2.1 상대적 날짜 표시 규칙

| 표시 | 조건 | 예시 |
|------|------|------|
| 오늘 | 마감일 === 오늘 | "오늘" |
| 내일 | 마감일 === 내일 | "내일" |
| N일 후 | 2일 ~ 7일 후 | "3일 후", "5일 후" |
| 전체 날짜 | 7일 초과 | "2026년 1월 15일" |

### 2.2 마감일 상태별 색상

| 상태 | 색상 | 조건 | Tailwind |
|------|------|------|----------|
| 정상 | 회색 | 7일 이상 남음 | `text-gray-500` |
| 경고 | 노란색 | 3일 ~ 6일 남음 | `text-yellow-600` |
| 긴급 | 빨간색 | 3일 미만 남음 | `text-red-600` |

---

## 3. 구현 계획

### Phase 1: 날짜 유틸리티 함수 추가

#### 3.1.1 formatRelativeDate 함수

**파일**: `src/lib/utils.ts`

```typescript
import { format, differenceInDays, isToday, isTomorrow, addDays } from 'date-fns';
import { ko } from 'date-fns/locale';

/**
 * 상대적 날짜 포맷팅
 * - 오늘: "오늘"
 * - 내일: "내일"
 * - 2~7일 후: "3일 후"
 * - 7일 초과: "2026년 1월 15일"
 */
export function formatRelativeDate(dateString: string): string {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const today = new Date();
  const tomorrow = addDays(today, 1);
  
  // 오늘
  if (isToday(date)) {
    return '오늘';
  }
  
  // 내일
  if (isTomorrow(date)) {
    return '내일';
  }
  
  const daysDiff = differenceInDays(date, today);
  
  // 2일 ~ 7일 후
  if (daysDiff >= 2 && daysDiff <= 7) {
    return `${daysDiff}일 후`;
  }
  
  // 7일 초과 - 전체 날짜 형식
  return format(date, 'yyyy년 M월 d일', { locale: ko });
}
```

#### 3.1.2 getDueDateStatus 함수

**파일**: `src/lib/utils.ts`

```typescript
export type DueDateStatus = 'normal' | 'warning' | 'urgent' | 'overdue';

export function getDueDateStatus(dueDate: string): DueDateStatus {
  if (!dueDate) return 'normal';
  
  const date = new Date(dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  
  // 지난 날짜
  if (date < today) {
    return 'overdue';
  }
  
  const daysDiff = differenceInDays(date, today);
  
  // 3일 미만 = 긴급
  if (daysDiff < 3) {
    return 'urgent';
  }
  
  // 3일 ~ 6일 = 경고
  if (daysDiff < 7) {
    return 'warning';
  }
  
  // 7일 이상 = 정상
  return 'normal';
}
```

#### 3.1.3 getDueDateColor 함수

```typescript
export function getDueDateColorClass(status: DueDateStatus): string {
  switch (status) {
    case 'overdue':
    case 'urgent':
      return 'text-red-600 bg-red-50';
    case 'warning':
      return 'text-yellow-600 bg-yellow-50';
    case 'normal':
    default:
      return 'text-gray-500 bg-gray-50';
  }
}
```

### Phase 2: TaskCard 마감일 표시 개선

**파일**: `src/components/tasks/TaskCard.tsx`

```typescript
import { format, differenceInDays } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Calendar, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatRelativeDate, getDueDateStatus } from '@/lib/utils';

// ... existing code

// Due date section (수정)
{task.dueDate && (
  <div
    className={cn(
      'inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded',
      getDueDateColorClass(getDueDateStatus(task.dueDate))
    )}
  >
    <Calendar className="w-3 h-3" />
    <span>{formatRelativeDate(task.dueDate)}</span>
  </div>
)}
```

### Phase 3: TaskFormDialog 마감일 옵션 추가

**파일**: `src/components/tasks/TaskFormDialog.tsx`

```typescript
import { X } from 'lucide-react';

// ... inside Calendar Popover
<PopoverContent
  className="bg-white border border-[#DFE1E6] rounded-lg shadow-trello-card p-1"
  align="start"
>
  <div className="flex items-center justify-between px-2 py-1 border-b border-[#DFE1E6]">
    <span className="text-xs text-[#6B778C]">마감일 선택</span>
    {field.value && (
      <button
        type="button"
        onClick={() => field.onChange(undefined)}
        className="text-[#6B778C] hover:text-[#EB5A46] p-1 rounded hover:bg-[#FFE2E2]"
        aria-label="마감일 삭제"
      >
        <X className="w-3 h-3" />
      </button>
    )}
  </div>
  <CalendarComponent
    mode="single"
    selected={
      field.value
        ? new Date(new Date(field.value).setHours(0, 0, 0, 0))
        : undefined
    }
    onSelect={(date) => {
      field.onChange(date?.toISOString());
    }}
    disabled={(date) =>
      date < new Date(new Date().setHours(0, 0, 0, 0))
    }
    initialFocus
  />
</PopoverContent>
```

### Phase 4: 다크 모드 지원

**파일**: `src/lib/utils.ts`

```typescript
export function getDueDateColorClass(
  status: DueDateStatus,
  isDarkMode: boolean = false
): string {
  switch (status) {
    case 'overdue':
    case 'urgent':
      return isDarkMode 
        ? 'text-red-400 bg-red-900/30' 
        : 'text-red-600 bg-red-50';
    case 'warning':
      return isDarkMode 
        ? 'text-yellow-400 bg-yellow-900/30' 
        : 'text-yellow-600 bg-yellow-50';
    case 'normal':
    default:
      return isDarkMode 
        ? 'text-gray-400 bg-gray-800' 
        : 'text-gray-500 bg-gray-50';
  }
}
```

---

## 4. 구현 단계별 일정

| 단계 | 작업 | 소요 시간 | 산출물 |
|------|------|----------|--------|
| Phase 1 | 날짜 유틸리티 함수 | 1시간 | `formatRelativeDate`, `getDueDateStatus` |
| Phase 2 | TaskCard 표시 개선 | 1시간 | 상대적 날짜 + 색상 |
| Phase 3 | Calendar 옵션 추가 | 30분 | 삭제 버튼 |
| Phase 4 | 다크 모드 지원 | 30분 | 색상 클래스 확장 |
| **합계** | | **3시간** | |

---

## 5. 테스트 계획

### 5.1 상대적 날짜 테스트

| 입력 | 예상 결과 |
|------|----------|
| 오늘 날짜 | "오늘" |
| 내일 날짜 | "내일" |
| 3일 후 날짜 | "3일 후" |
| 7일 후 날짜 | "7일 후" |
| 8일 후 날짜 | "2026년 1월 19일" |

### 5.2 색상 상태 테스트

| 남은 일수 | 상태 | 색상 |
|----------|------|------|
| 10일 | normal | 회색 |
| 5일 | warning | 노란색 |
| 2일 | urgent | 빨간색 |
| 지난 날짜 | overdue | 빨간색 |

---

## 6. 관련 파일

### 6.1 수정 대상 파일

| 파일 경로 | 변경 사항 |
|-----------|-----------|
| `src/lib/utils.ts` | 날짜 유틸리티 함수 추가 |
| `src/components/tasks/TaskCard.tsx` | 상대적 날짜 + 색상 표시 |
| `src/components/tasks/TaskFormDialog.tsx` | 마감일 삭제 옵션 |

### 6.2 기존 의존성 (이미 설치됨)

| 라이브러리 | 용도 |
|------------|------|
| `date-fns` | 날짜 계산 |
| `react-day-picker` | Calendar 컴포넌트 |
| `shadcn/ui Popover` | 캘린더 팝업 |

---

## 7. 기술 레퍼런스

### 7.1 date-fns 함수 (Context7)

```typescript
import { format, differenceInDays, isToday, isTomorrow, addDays } from 'date-fns';
import { ko } from 'date-fns/locale';

// 상대적 날짜 계산
differenceInDays(date, today);  // 날짜 차이 계산
isToday(date);                  // 오늘 여부
isTomorrow(date);               // 내일 여부
addDays(today, 3);              // 3일 후 날짜

// 형식화
format(date, 'yyyy년 M월 d일', { locale: ko });  // 한국어 형식
```

### 7.2 shadcn/ui Calendar 패턴 (Context7)

```typescript
<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline">
      <CalendarIcon className="mr-2 h-4 w-4" />
      {date ? format(date, 'PPP') : 'Select date'}
    </Button>
  </PopoverTrigger>
  <PopoverContent className="w-auto p-0" align="start">
    <Calendar
      mode="single"
      selected={date}
      onSelect={setDate}
      disabled={(date) => date < new Date()}
      initialFocus
    />
  </PopoverContent>
</Popover>
```

---

## 8. 승인

| 역할 | 이름 | 날짜 | 서명 |
|------|------|------|------|
| 검토자 | | | |
| 승인자 | | | |

---

**작성일**: 2026년 1월 11일  
**버전**: 1.0  
**상태**: 초안
