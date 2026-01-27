# Vercel Streamdown 마이그레이션 계획

**작성일**: 2026년 1월 21일
**상태**: 계획 중

## 개요

현재 커스텀 마크다운 렌더링 라이브러리(`src/lib/streamdown.ts`)를 Vercel의 공식 [streamdown](https://github.com/vercel/streamdown) 라이브러리로 교체합니다. 이를 통해 스트리밍 최적화, 코드 하이라이팅, 불완전 마크다운 처리 등의 기능을 확보합니다.

## 배경

### 현재 문제점
1. 커스텀 `renderStreamdownToHtml()` 함수는 HTML 문자열을 반환하여 innerHTML로 렌더링
2. 별도의 DOMPurify 라이브러리로 XSS 방지 처리 필요
3. 스트리밍 중 불완전한 마크다운(예: `**bold` 닫히지 않음) 처리 미흡
4. 코드 신택스 하이라이팅 미지원

### Vercel Streamdown 장점
- React 컴포넌트 기반 직접 렌더링 (innerHTML 불필요)
- rehype-harden 내장으로 XSS 방지 자동 처리
- `remend` 라이브러리로 불완전한 마크다운 우아하게 처리
- Shiki 기반 코드 하이라이팅 내장
- `isAnimating` prop으로 스트리밍 상태 시각화

## 기술 비교

| 기능 | 현재 (커스텀) | Vercel Streamdown |
|------|--------------|-------------------|
| 렌더링 방식 | HTML 문자열 + innerHTML | React 컴포넌트 |
| XSS 방지 | DOMPurify (별도) | rehype-harden (내장) |
| 불완전 마크다운 | 미지원 | remend 라이브러리 내장 |
| 코드 하이라이팅 | 미지원 | Shiki 내장 |
| 스트리밍 최적화 | 없음 | isAnimating prop |
| GFM 테이블 | 미지원 | remark-gfm 내장 |
| 수학 수식 | 미지원 | KaTeX 지원 |
| 다이어그램 | 미지원 | Mermaid 지원 (선택적) |

### 현재 지원 마크다운 문법

`src/lib/streamdown.ts`에서 지원하는 문법:

| 문법 | 예시 | 렌더링 |
|------|------|--------|
| 코드 블록 | ` ```python\ncode``` ` | `<pre><code class="language-python">` |
| 인라인 코드 | `` `code` `` | `<code>code</code>` |
| 링크 | `[텍스트](url)` | `<a href="url">` |
| URL 자동 링크 | `https://example.com` | `<a href="...">` |
| 볼드 | `**텍스트**` | `<strong>` |
| 이탤릭 | `*텍스트*` | `<em>` |
| 취소선 | `~~텍스트~~` | `<del>` |
| 헤딩 | `# ~ ######` | `<h1> ~ <h6>` |
| 인용 | `> 텍스트` | `<blockquote>` |
| 순서 없는 목록 | `- item` | `<ul><li>` |
| 순서 있는 목록 | `1. item` | `<ol><li>` |

## 아키텍처

### 현재 데이터 흐름

```
ChatMessage.tsx
  └─ message.content (마크다운 문자열)
     └─ renderStreamdownToHtml() [lib/streamdown.ts]
        └─ HTML 문자열 반환
           └─ SafeHtmlRenderer
              └─ sanitizeHtml() [lib/sanitize.ts]
                 └─ DOMPurify 처리
```

### 변경 후 데이터 흐름

```
ChatMessage.tsx
  └─ message.content (마크다운 문자열)
     └─ <Streamdown> 컴포넌트
        └─ React 컴포넌트 직접 렌더링
           └─ rehype-harden (내장 보안)
```

## 영향 범위

### 수정 대상 파일
| 파일 | 변경 내용 |
|------|----------|
| `package.json` | streamdown 의존성 추가 |
| `src/index.css` | Tailwind source 추가, 스타일 조정 |
| `src/components/chat/ChatMessage.tsx` | Streamdown 컴포넌트로 교체 |
| `src/lib/streamdown.ts` | 삭제 또는 `.legacy.ts`로 보관 |

### 유지 대상 파일
| 파일 | 이유 |
|------|------|
| `src/lib/sanitize.ts` | TaskCard에서 TipTap HTML 렌더링에 사용 |
| `src/components/ui/SafeHtmlRenderer.tsx` | TaskCard에서 계속 사용 |

## 구현 단계

### Phase 1: 패키지 설치 및 환경 설정

**Step 1.1: 패키지 설치**
```bash
npm i streamdown
```

**Step 1.2: Tailwind CSS 설정**

`src/index.css` 상단에 추가:
```css
@source "../node_modules/streamdown/dist/*.js";
```

### Phase 2: ChatMessage.tsx 수정

**Step 2.1: import 변경**

변경 전:
```tsx
import { SafeHtmlRenderer } from '@/components/ui/SafeHtmlRenderer'
import { renderStreamdownToHtml } from '@/lib/streamdown'
```

변경 후:
```tsx
import { Streamdown } from 'streamdown'
```

**Step 2.2: 렌더링 로직 수정**

변경 전:
```tsx
<SafeHtmlRenderer
  html={renderStreamdownToHtml(message.content)}
  className="chat-markdown-content"
/>
```

변경 후:
```tsx
<Streamdown
  mode="streaming"
  isAnimating={isLoading}
  className="chat-markdown-content"
>
  {message.content}
</Streamdown>
```

### Phase 3: CSS 스타일 조정

`src/index.css`의 `.chat-markdown-content` 스타일 유지 및 필요시 Streamdown data 속성 스타일 추가:

```css
.chat-markdown-content {
  & p { line-height: 1.5; }
  & ul, & ol { margin: 0.25rem 0; }

  /* Streamdown 코드 블록 스타일 오버라이드 (필요시) */
  & pre {
    background-color: #f4f5f7;
    padding: 0.5rem 0.75rem;
    border-radius: 6px;
    overflow-x: auto;
    margin: 0.35rem 0;
  }
}
```

### Phase 4: 레거시 코드 정리

1. `src/lib/streamdown.ts`를 `src/lib/streamdown.legacy.ts`로 이름 변경 (롤백 대비)
2. 안정화 확인 후 삭제

### Phase 5: 빌드 및 테스트

```bash
npm run build
npm run lint
npm run dev
```

## 선택적 플러그인 설정

### 코드 하이라이팅 테마 커스터마이징

```tsx
<Streamdown
  mode="streaming"
  isAnimating={isLoading}
  shikiTheme={['github-light', 'github-dark']}
>
  {message.content}
</Streamdown>
```

### 수학 수식 지원 (KaTeX)

```tsx
import 'katex/dist/katex.min.css'

<Streamdown mode="streaming">
  {message.content}
</Streamdown>
```

## 테스트 체크리스트

### 기능 테스트
- [ ] 기본 텍스트 렌더링
- [ ] **볼드**, *이탤릭*, ~~취소선~~ 렌더링
- [ ] 코드 블록 렌더링 (언어별 하이라이팅)
- [ ] 인라인 코드 렌더링
- [ ] 링크 클릭 동작 (새 탭 오픈)
- [ ] 순서 있는/없는 목록 렌더링
- [ ] 헤딩(h1~h6) 렌더링
- [ ] 인용문 렌더링

### 스트리밍 테스트
- [ ] AI 응답 스트리밍 시 깜빡임 없이 렌더링
- [ ] 불완전한 마크다운 처리 (예: `**bold` 닫히지 않음)
- [ ] isAnimating 상태에 따른 시각적 피드백

### 통합 테스트
- [ ] 복사 기능 동작 (마크다운 원본 텍스트 복사)
- [ ] 모바일 반응형 레이아웃
- [ ] 빌드 성공 (`npm run build`)
- [ ] 린트 통과 (`npm run lint`)

## 롤백 계획

마이그레이션 후 문제 발생 시:

1. `src/lib/streamdown.legacy.ts` → `src/lib/streamdown.ts` 복원
2. `ChatMessage.tsx`에서 import 및 렌더링 로직 원복
3. `npm uninstall streamdown` 실행
4. `src/index.css`에서 Tailwind source 라인 제거

## 참고 자료

- [Vercel Streamdown GitHub](https://github.com/vercel/streamdown)
- [Streamdown 공식 문서](https://streamdown.ai/docs)
- [react-markdown에서 마이그레이션](https://streamdown.ai/docs/migration)
- [프로젝트 CHATBOT_FEATURE.md](./CHATBOT_FEATURE.md)
