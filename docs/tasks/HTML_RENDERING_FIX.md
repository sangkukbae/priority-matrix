# TaskCard HTML 렌더링 문제 해결 가이드

## 문제 현상

`TaskCard.tsx`에서 TipTap 리치 텍스트 에디터로 작성한 description이 HTML 태그 그대로 표시됨:

```
<ul><li><p>기존 vercel에서 환경 변수 관리하던 것을 parameter store로 이관 시킴</p></li></ul><p></p>
```

**예상 결과**: 글머리 기호가 적용된 리스트 형태로 표시
**실제 결과**: HTML 태그가 텍스트로 노출

---

## 근본 원인 분석

### 데이터 흐름

```
RichTextEditor.tsx
├─ TipTap useEditor()
└─ onUpdate: editor.getHTML()  ──→ HTML 문자열 반환
   │                               예: "<p><strong>중요</strong></p>"
   │
   └─→ TaskFormDialog.tsx
       └─ form.control에 저장
          └─ Zustand taskStore
             └─ localStorage
                │
                └─→ TaskCard.tsx
                    └─ {task.description}
                       └─ React 기본 렌더링 (XSS 방지로 HTML 이스케이프)
                          → "<p><strong>중요</strong></p>" 텍스트로 표시
```

### 원인 요약

1. **TipTap 에디터** (`src/components/ui/RichTextEditor.tsx`):
   - `editor.getHTML()`이 HTML 문자열 반환
   - description 필드에 `<p>`, `<ul>`, `<li>`, `<strong>`, `<a>` 등 태그 포함

2. **TaskCard.tsx** (라인 182-186):
   ```tsx
   {task.description && (
     <p className="text-xs text-[#6B778C] mb-3 line-clamp-2">
       {task.description}
     </p>
   )}
   ```
   - React는 XSS 공격 방지를 위해 기본적으로 HTML을 이스케이프 처리
   - `{task.description}` → HTML 태그가 순수 텍스트로 변환됨

3. **보안 고려**:
   - 사용자 입력 HTML을 그대로 렌더링하면 XSS 공격에 취약
   - 안전한 렌더링을 위해 HTML sanitization 필요

---

## 해결 방안

### 권장 방안: DOMPurify를 사용한 안전한 HTML 렌더링

**DOMPurify 선택 이유:**
- 업계 표준 XSS 방지 라이브러리 (Google, Facebook 등 사용)
- 경량 (~7KB gzipped)
- 활발한 유지보수와 보안 업데이트
- 허용 태그/속성을 세밀하게 제어 가능

---

## 단계별 해결 방법

### Step 1: DOMPurify 설치

```bash
npm install dompurify
npm install --save-dev @types/dompurify
```

---

### Step 2: HTML Sanitizer 유틸리티 생성

**파일**: `src/lib/sanitize.ts`

```typescript
import DOMPurify from 'dompurify'

// TipTap 에디터 출력에 맞는 허용 태그
const ALLOWED_TAGS = [
  'p', 'br', 'strong', 'b', 'em', 'i', 's', 'strike', 'del',
  'code', 'ul', 'ol', 'li', 'a', 'span'
]

const ALLOWED_ATTR = ['href', 'target', 'rel', 'class', 'style']

// 허용할 스타일 속성 (폰트 관련만)
const ALLOWED_STYLES = ['font-family', 'font-size']

/**
 * HTML 문자열을 안전하게 sanitize
 * XSS 공격을 방지하면서 TipTap 포매팅 유지
 */
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
    FORBID_CONTENTS: ['script', 'style', 'iframe'],
  })
}

// DOMPurify 후처리 훅: 링크 보안 강화
DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  // 모든 링크에 target="_blank" rel="noopener noreferrer" 강제
  if (node.tagName === 'A') {
    node.setAttribute('target', '_blank')
    node.setAttribute('rel', 'noopener noreferrer')
  }

  // 인라인 스타일은 폰트 관련만 허용
  if (node.hasAttribute('style')) {
    const style = node.getAttribute('style') || ''
    const sanitizedStyles = style
      .split(';')
      .filter((s) => {
        const prop = s.split(':')[0]?.trim().toLowerCase()
        return ALLOWED_STYLES.includes(prop)
      })
      .join(';')

    if (sanitizedStyles) {
      node.setAttribute('style', sanitizedStyles)
    } else {
      node.removeAttribute('style')
    }
  }
})
```

---

### Step 3: SafeHtmlRenderer 컴포넌트 생성

**파일**: `src/components/ui/SafeHtmlRenderer.tsx`

```typescript
import { sanitizeHtml } from '@/lib/sanitize'
import { cn } from '@/lib/utils'

interface SafeHtmlRendererProps {
  html: string
  className?: string
}

/**
 * HTML 문자열을 안전하게 렌더링하는 컴포넌트
 * DOMPurify로 sanitize한 후 렌더링하여 XSS 방지
 */
export function SafeHtmlRenderer({ html, className }: SafeHtmlRendererProps) {
  const sanitizedHtml = sanitizeHtml(html)

  return (
    <div
      className={cn('safe-html-content', className)}
      // DOMPurify로 sanitize된 안전한 HTML만 렌더링
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  )
}
```

**보안 참고**: `dangerouslySetInnerHTML`은 DOMPurify로 sanitize된 HTML에만 사용됩니다.

---

### Step 4: CSS 스타일 추가

**파일**: `src/index.css` (파일 끝에 추가)

```css
/* SafeHtmlRenderer - 렌더링된 HTML 콘텐츠 스타일 */
.safe-html-content {
  /* 문단 간격 */
  & p {
    margin: 0;
  }

  & p + p {
    margin-top: 0.25rem;
  }

  /* 리스트 스타일 */
  & ul {
    list-style-type: disc;
    padding-left: 1rem;
    margin: 0.25rem 0;
  }

  & ol {
    list-style-type: decimal;
    padding-left: 1rem;
    margin: 0.25rem 0;
  }

  & li {
    margin: 0;
  }

  & li p {
    margin: 0;
  }

  /* 텍스트 포매팅 */
  & strong,
  & b {
    font-weight: 600;
  }

  & em,
  & i {
    font-style: italic;
  }

  & s,
  & strike,
  & del {
    text-decoration: line-through;
  }

  & code {
    background-color: #f4f5f7;
    padding: 0.125rem 0.25rem;
    border-radius: 3px;
    font-family: monospace;
    font-size: 0.85em;
  }

  /* 링크 스타일 (디자인 시스템 색상) */
  & a {
    color: #0079bf;
    text-decoration: underline;
  }

  & a:hover {
    color: #026aa7;
  }
}

/* TaskCard용 컴팩트 스타일 (line-clamp 호환) */
.safe-html-content-compact {
  /* 블록 요소를 인라인으로 변환하여 line-clamp 작동 */
  & p,
  & ul,
  & ol,
  & li {
    display: inline;
  }

  & ul::before,
  & ol::before {
    content: ' ';
  }

  & li::before {
    content: '• ';
  }

  & li + li::before {
    content: ' • ';
  }
}
```

---

### Step 5: TaskCard 수정

**파일**: `src/components/tasks/TaskCard.tsx`

**수정 위치**: 상단 import 및 라인 182-186

**변경 전**:
```tsx
{task.description && (
  <p className="text-xs text-[#6B778C] mb-3 line-clamp-2">
    {task.description}
  </p>
)}
```

**변경 후**:
```tsx
// 상단에 import 추가
import { SafeHtmlRenderer } from '@/components/ui/SafeHtmlRenderer'

// 라인 182-186 수정
{task.description && (
  <div className="text-xs text-[#6B778C] mb-3 line-clamp-2">
    <SafeHtmlRenderer
      html={task.description}
      className="safe-html-content-compact"
    />
  </div>
)}
```

---

## 검증 방법

### 테스트 1: 기존 데이터 렌더링
1. `npm run dev` 실행
2. 기존에 HTML 태그가 보이던 태스크 확인
3. **예상 결과**: 포매팅이 적용된 상태로 표시 (굵게, 리스트 등)

### 테스트 2: 새 태스크 생성
1. "작업 추가" 버튼 클릭
2. 설명 필드에서:
   - 텍스트 입력 후 **굵게** 적용
   - Bullet List 생성
   - 링크 추가
3. 저장 후 TaskCard 확인
4. **예상 결과**: 모든 포매팅이 올바르게 표시됨

### 테스트 3: Line Clamp 동작
1. 긴 설명 입력 (여러 줄)
2. TaskCard에서 2줄까지만 표시되고 말줄임표(...) 적용 확인

### 테스트 4: 빌드 검증
```bash
npm run build
```
**예상 결과**: TypeScript 컴파일 및 빌드 성공

---

## 보안 고려사항

| 위협 | 대응 방안 |
|------|----------|
| XSS 스크립트 주입 | DOMPurify가 `<script>` 태그 및 이벤트 핸들러 제거 |
| 악성 iframe | FORBID_CONTENTS에 iframe 포함 |
| 위험한 링크 | 모든 링크에 `rel="noopener noreferrer"` 강제 |
| 스타일 기반 공격 | font-family, font-size만 허용 |
| 데이터 속성 남용 | ALLOW_DATA_ATTR: false |

---

## 대안: Plain Text 추출

포매팅 없이 순수 텍스트만 표시하고 싶은 경우:

**`src/lib/utils.ts`에 추가**:
```typescript
export function stripHtmlTags(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  return doc.body.textContent || ''
}
```

**TaskCard에서 사용**:
```tsx
import { stripHtmlTags } from '@/lib/utils'

{task.description && (
  <p className="text-xs text-[#6B778C] mb-3 line-clamp-2">
    {stripHtmlTags(task.description)}
  </p>
)}
```

**장점**: 추가 의존성 없음
**단점**: 모든 포매팅 손실

---

## 참고 자료

- [DOMPurify GitHub](https://github.com/cure53/DOMPurify)
- [TipTap getHTML() 문서](https://tiptap.dev/docs/editor/api/editor#gethtml)
- [OWASP XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)

---

**작성일**: 2026-01-12
**관련 파일**:
- `src/components/tasks/TaskCard.tsx`
- `src/components/ui/RichTextEditor.tsx`
- `src/lib/sanitize.ts` (신규)
- `src/components/ui/SafeHtmlRenderer.tsx` (신규)
- `src/index.css`
