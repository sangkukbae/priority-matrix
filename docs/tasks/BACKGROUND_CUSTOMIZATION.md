# 배경 화면 변경 기능 구현 계획

## 개요

사용자가 커스텀 이미지 URL을 입력하여 앱 배경 화면을 변경할 수 있는 기능을 구현합니다. Trello 스타일의 더보기 버튼과 드롭다운 메뉴를 통해 배경 변경 UI에 접근합니다.

### 참고 이미지 분석

- **이미지 #2**: 더보기 버튼 (⋯) - 작업 추가 버튼 옆에 위치
- **이미지 #3**: 드롭다운 메뉴 - "Change background" 메뉴 항목
- **이미지 #4**: 배경 변경 패널 - Custom 섹션에서 "+" 버튼으로 URL 입력

### 구현 목표

1. 헤더에 더보기 버튼(⋯) 추가
2. 드롭다운 메뉴에 "배경 화면 변경하기" 메뉴 추가
3. 인플레이스 URL 입력 폼 표시
4. 입력 URL 즉시 적용 및 localStorage 저장

---

## 현재 상태 분석

### 배경 이미지 현황

- **위치**: `src/App.tsx` line 30-32
- **현재 구현**: 정적 이미지 경로 하드코딩
```tsx
style={{
  backgroundImage: "url('/images/shutter-speed-3LXPDYb83MY-unsplash.jpg')",
}}
```

### 기존 정적 이미지 목록

`/public/images/` 폴더:
- national-gallery-of-art-8-eG7YJ0gEY-unsplash.jpg
- nik-iurev-Pk1MrGNquo8-unsplash.jpg
- oskar-kadaksoo-V_FR5YYMfVE-unsplash.jpg
- shutter-speed-3LXPDYb83MY-unsplash.jpg (현재 사용중)

### 관련 컴포넌트

- **App.tsx**: 배경 이미지 적용 위치
- **taskStore.ts**: Zustand persist 미들웨어 사용 (`priority-metrix-storage` 키)
- **button.tsx**: `icon` 사이즈 variant 존재 (`h-9 w-9`)
- **popover.tsx**: Radix Popover 래퍼 (인플레이스 폼에 활용 가능)

### 설치 필요 패키지

- `@radix-ui/react-dropdown-menu`: 현재 미설치 상태

---

## 1단계: shadcn/ui DropdownMenu 컴포넌트 추가

### CLI 명령어

```bash
npx shadcn@latest add dropdown-menu
```

### 생성될 파일

`src/components/ui/dropdown-menu.tsx`

### 주요 컴포넌트

```tsx
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
```

---

## 2단계: 설정 스토어 생성

### 파일: `src/store/settingsStore.ts`

별도의 설정 스토어를 생성하여 관심사를 분리합니다.

```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SettingsState {
  backgroundImage: string
  setBackgroundImage: (url: string) => void
  resetBackgroundImage: () => void
}

const DEFAULT_BACKGROUND = '/images/shutter-speed-3LXPDYb83MY-unsplash.jpg'

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      backgroundImage: DEFAULT_BACKGROUND,

      setBackgroundImage: (url: string) => set({ backgroundImage: url }),

      resetBackgroundImage: () => set({ backgroundImage: DEFAULT_BACKGROUND }),
    }),
    {
      name: 'priority-metrix-settings',
    }
  )
)
```

### 설계 결정 근거

1. **별도 스토어 분리**: taskStore와 분리하여 마이그레이션 영향 최소화
2. **persist 미들웨어**: 설정값 localStorage 자동 저장/복원
3. **기본값 상수화**: 리셋 기능 및 초기값 관리 용이

---

## 3단계: HeaderMenu 컴포넌트 구현

### 파일: `src/components/HeaderMenu.tsx`

```tsx
'use client'

import { useState } from 'react'
import { MoreHorizontal, Image as ImageIcon, X, Check } from 'lucide-react'
import { useSettingsStore } from '@/store/settingsStore'
import { cn } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Input } from '@/components/ui/input'

export function HeaderMenu() {
  const [isBackgroundFormOpen, setIsBackgroundFormOpen] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const [error, setError] = useState('')

  const { backgroundImage, setBackgroundImage } = useSettingsStore()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!imageUrl.trim()) {
      setError('이미지 URL을 입력해주세요')
      return
    }

    // 기본 URL 형식 검증
    try {
      new URL(imageUrl)
    } catch {
      setError('올바른 URL 형식이 아닙니다')
      return
    }

    setBackgroundImage(imageUrl)
    setImageUrl('')
    setError('')
    setIsBackgroundFormOpen(false)
  }

  const handleClose = () => {
    setImageUrl('')
    setError('')
    setIsBackgroundFormOpen(false)
  }

  return (
    <Popover open={isBackgroundFormOpen} onOpenChange={setIsBackgroundFormOpen}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'h-9 w-9 rounded-sm',
              'bg-[#091E420F] hover:bg-[#091E4224]',
              'text-[#42526E]'
            )}
          >
            <MoreHorizontal className="w-5 h-5" />
            <span className="sr-only">더보기 메뉴</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <PopoverTrigger asChild>
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault()
                setIsBackgroundFormOpen(true)
              }}
              className="cursor-pointer"
            >
              <ImageIcon className="w-4 h-4 mr-2" />
              배경 화면 변경하기
            </DropdownMenuItem>
          </PopoverTrigger>
        </DropdownMenuContent>
      </DropdownMenu>

      <PopoverContent
        align="end"
        side="bottom"
        className="w-80 p-4"
        onInteractOutside={handleClose}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm text-[#172B4D]">
              배경 화면 변경
            </h4>
            <button
              onClick={handleClose}
              className="p-1 hover:bg-[#091E4224] rounded"
            >
              <X className="w-4 h-4 text-[#6B778C]" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-2">
              <label
                htmlFor="background-url"
                className="text-xs font-medium text-[#6B778C]"
              >
                이미지 URL
              </label>
              <Input
                id="background-url"
                type="url"
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChange={(e) => {
                  setImageUrl(e.target.value)
                  setError('')
                }}
                className={cn(
                  'text-sm',
                  error && 'border-[#EB5A46] focus:border-[#EB5A46]'
                )}
              />
              {error && (
                <p className="text-xs text-[#EB5A46]">{error}</p>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                type="submit"
                size="sm"
                className="flex-1 bg-[#0079BF] hover:bg-[#026AA7]"
              >
                <Check className="w-4 h-4 mr-1" />
                적용
              </Button>
            </div>
          </form>

          {/* 현재 배경 미리보기 */}
          <div className="pt-2 border-t border-[#DFE1E6]">
            <p className="text-xs text-[#6B778C] mb-2">현재 배경</p>
            <div
              className="w-full h-16 rounded bg-cover bg-center border border-[#DFE1E6]"
              style={{ backgroundImage: `url('${backgroundImage}')` }}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
```

### UI/UX 설계 포인트

1. **Dropdown + Popover 조합**: 메뉴 선택 시 인플레이스 폼 표시
2. **URL 유효성 검증**: 기본적인 URL 형식 체크
3. **현재 배경 미리보기**: 변경 전 현재 설정 확인 가능
4. **에러 피드백**: 실시간 유효성 검증 메시지

---

## 4단계: App.tsx 수정

### 파일: `src/App.tsx`

#### 변경 사항

1. `useSettingsStore` 훅 import
2. `backgroundImage` 상태 구독
3. `HeaderMenu` 컴포넌트 추가
4. 정적 배경 이미지 → 동적 상태 값 사용

```tsx
import { useState, useEffect } from 'react';
import { TaskFormDialog } from '@/components/tasks/TaskFormDialog';
import { EisenhowerMatrix } from '@/components/tasks/EisenhowerMatrix';
import { HeaderMenu } from '@/components/HeaderMenu';
import { Toaster } from '@/components/ui/toast';
import { useSettingsStore } from '@/store/settingsStore';

function App() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const backgroundImage = useSettingsStore((state) => state.backgroundImage);

  // ... 기존 useEffect (단축키)

  return (
    <div
      className="min-h-screen bg-fixed bg-center bg-no-repeat bg-cover"
      style={{
        backgroundImage: `url('${backgroundImage}')`,
      }}
    >
      {/* ... */}
      <header className="...">
        <div className="flex items-center justify-between mx-auto max-w-7xl">
          {/* 로고 영역 */}

          <div className="flex items-center gap-3">
            <TaskFormDialog
              mode="add"
              open={isDialogOpen}
              onOpenChange={setIsDialogOpen}
              showTrigger={true}
            />
            {/* 더보기 메뉴 추가 */}
            <HeaderMenu />
          </div>
        </div>
      </header>
      {/* ... */}
    </div>
  );
}
```

---

## 5단계: 이미지 로드 에러 처리

### 선택적 개선사항

이미지 로드 실패 시 기본 배경으로 폴백하는 로직 추가

```tsx
// App.tsx에 추가
const [bgLoadError, setBgLoadError] = useState(false);
const resetBackgroundImage = useSettingsStore((state) => state.resetBackgroundImage);

useEffect(() => {
  setBgLoadError(false);
  const img = new Image();
  img.onerror = () => {
    setBgLoadError(true);
    resetBackgroundImage();
  };
  img.src = backgroundImage;
}, [backgroundImage]);
```

---

## 구현 순서 요약

| 단계 | 파일 | 작업 |
|------|------|------|
| 1 | CLI | `npx shadcn@latest add dropdown-menu` |
| 2 | `store/settingsStore.ts` | 새 설정 스토어 생성 |
| 3 | `components/HeaderMenu.tsx` | 더보기 메뉴 + URL 입력 폼 구현 |
| 4 | `App.tsx` | HeaderMenu 통합, 동적 배경 적용 |
| 5 | (선택) `App.tsx` | 이미지 로드 에러 처리 |

---

## 예상 부작용 및 주의사항

### 1. localStorage 신규 키 추가
- **키**: `priority-metrix-settings`
- 기존 `priority-metrix-storage`(tasks)와 분리되어 마이그레이션 영향 없음

### 2. 외부 이미지 URL 보안
- CORS 정책으로 인해 일부 URL은 로드 실패 가능
- HTTPS URL 권장 안내 필요
- 이미지 로드 실패 시 기본 배경으로 폴백

### 3. 성능 고려
- 대용량 이미지 URL 입력 시 로딩 시간 발생 가능
- `bg-fixed`로 인한 모바일 성능 이슈 (기존과 동일)

### 4. UX 고려
- URL 입력 중 실시간 미리보기는 과도한 네트워크 요청 유발
- 제출 후 적용 방식 채택

### 5. Dropdown + Popover 중첩 이슈
- Radix UI에서 드롭다운 내 포포버 중첩 시 포커스 관리 주의
- `modal={false}` 옵션 또는 별도의 상태 관리로 해결

---

## 테스트 체크리스트

- [ ] 더보기 버튼(⋯) 클릭 시 드롭다운 메뉴 표시
- [ ] "배경 화면 변경하기" 클릭 시 URL 입력 폼 표시
- [ ] 유효한 이미지 URL 입력 후 배경 즉시 변경
- [ ] 잘못된 URL 입력 시 에러 메시지 표시
- [ ] 배경 설정값 localStorage 저장 확인
- [ ] 페이지 새로고침 후 저장된 배경 유지
- [ ] 기존 기능(작업 추가, 드래그앤드롭 등) 정상 작동
- [ ] 모바일 반응형 레이아웃 확인

---

## 향후 확장 가능성

1. **사전 정의 배경 목록**: 기존 `/public/images/` 이미지 선택 UI
2. **색상 배경**: 단색 또는 그라데이션 배경 옵션
3. **Unsplash 통합**: API 연동으로 이미지 검색/선택
4. **배경 투명도 조절**: 오버레이 투명도 슬라이더
