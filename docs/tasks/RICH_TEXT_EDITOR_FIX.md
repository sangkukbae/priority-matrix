# RichTextEditor 툴바 기능 문제 해결 가이드

## 문제 현상
`TaskFormDialog.tsx`의 설명(description) 필드에서 사용되는 RichTextEditor의 다음 툴바 버튼이 정상 동작하지 않음:
- Bullet List (글머리 기호 목록)
- Ordered List (번호 목록)
- Link (링크)

---

## 근본 원인 분석

### 1. 리스트 기능 문제 - CSS 스타일 누락

**원인**: TipTap 에디터는 `prose` 클래스를 사용하지만 `@tailwindcss/typography` 플러그인이 설치되지 않음

**증거**:
- `src/components/ui/RichTextEditor.tsx:324-325`:
  ```javascript
  class: "prose prose-sm max-w-none focus:outline-none min-h-[80px] px-3 py-2 text-sm text-[#172B4D]"
  ```
- `package.json`에 `@tailwindcss/typography` 없음
- `tailwind.config.js`의 `plugins` 배열이 비어있음

**결과**: 리스트 명령어(`toggleBulletList`, `toggleOrderedList`)는 실행되어 HTML이 생성되지만, CSS 스타일이 없어 bullets/numbers가 표시되지 않음

---

### 2. Link 버튼 문제 - 컴포넌트 중첩 충돌

**원인**: `Popover`의 `PopoverTrigger` 내부에 `ToolbarButton`이 중첩되어 클릭 이벤트가 충돌

**문제 코드** (`src/components/ui/RichTextEditor.tsx:232-240`):
```jsx
<Popover open={showLinkInput} onOpenChange={setShowLinkInput}>
  <PopoverTrigger asChild>
    <ToolbarButton
      onClick={() => setShowLinkInput(true)}  // ← 불필요한 onClick
      isActive={editor.isActive("link")}
      title="링크"
    >
      <LinkIcon className="w-4 h-4" />
    </ToolbarButton>
  </PopoverTrigger>
  ...
</Popover>
```

**문제점**:
1. `PopoverTrigger`의 `asChild`가 자식의 클릭 이벤트를 가로챔
2. `ToolbarButton`의 `onClick`이 추가로 실행되어 상태 충돌 발생
3. `ToolbarButton`은 내부적으로 `<button>`을 렌더링하므로 Radix Popover와 호환성 문제

---

### 3. 패키지 버전 충돌 (부차적 문제)

**원인**:
```
tiptap-extension-font-size@1.2.0
  └── @tiptap/extension-text-style@2.27.2 (peer dependency)

프로젝트 설치:
  └── @tiptap/extension-text-style@3.15.3
```

**영향**: TipTap v3에서는 `FontSize`가 `@tiptap/extension-text-style`에 이미 포함되어 있어 별도 패키지가 불필요

---

## 단계별 해결 방법

### Step 1: 리스트 CSS 스타일 추가

**파일**: `src/index.css`

**수정 내용**: 파일 끝에 다음 CSS 추가

```css
/* TipTap Editor List Styles */
.ProseMirror ul {
  list-style-type: disc;
  padding-left: 1.5rem;
  margin: 0.5rem 0;
}

.ProseMirror ol {
  list-style-type: decimal;
  padding-left: 1.5rem;
  margin: 0.5rem 0;
}

.ProseMirror li {
  margin: 0.25rem 0;
}

.ProseMirror li p {
  margin: 0;
}

/* 중첩 리스트 스타일 */
.ProseMirror ul ul {
  list-style-type: circle;
}

.ProseMirror ul ul ul {
  list-style-type: square;
}

/* 링크 스타일 (에디터 내부용) */
.ProseMirror a {
  color: #0079BF;
  text-decoration: underline;
  cursor: pointer;
}

.ProseMirror a:hover {
  color: #026AA7;
}
```

---

### Step 2: Link 버튼 구조 수정

**파일**: `src/components/ui/RichTextEditor.tsx`

**수정 위치**: 232-294줄 (Link Popover 섹션)

**수정 전**:
```jsx
<Popover open={showLinkInput} onOpenChange={setShowLinkInput}>
  <PopoverTrigger asChild>
    <ToolbarButton
      onClick={() => setShowLinkInput(true)}
      isActive={editor.isActive("link")}
      title="링크"
    >
      <LinkIcon className="w-4 h-4" />
    </ToolbarButton>
  </PopoverTrigger>
  ...
</Popover>
```

**수정 후**:
```jsx
<Popover open={showLinkInput} onOpenChange={setShowLinkInput}>
  <PopoverTrigger asChild>
    <button
      type="button"
      title="링크"
      className={cn(
        "p-2 rounded transition-all duration-200 flex items-center justify-center",
        "hover:bg-[#DFE1E6]",
        editor.isActive("link") ? "bg-[#DFE1E6] text-[#0079BF]" : "text-[#5E6C84]",
        "w-8 h-8"
      )}
    >
      <LinkIcon className="w-4 h-4" />
    </button>
  </PopoverTrigger>
  <PopoverContent
    className="bg-white border border-[#DFE1E6] rounded-lg shadow-trello-card p-3"
    align="start"
    style={{ width: "280px" }}
  >
    {/* 기존 PopoverContent 내용 유지 */}
  </PopoverContent>
</Popover>
```

**핵심 변경사항**:
1. `ToolbarButton` 대신 직접 `<button>` 요소 사용
2. `onClick` 핸들러 제거 (Popover가 자동으로 처리)
3. 동일한 스타일 클래스 적용

---

### Step 3: 패키지 정리 (선택사항)

**실행 명령어**:
```bash
npm uninstall tiptap-extension-font-size
```

**이유**: TipTap v3의 `@tiptap/extension-text-style`에 `FontSize`가 이미 포함되어 있음

**참고**: 현재 import가 이미 올바르게 되어 있으므로 코드 수정 불필요
```javascript
import { TextStyle, FontFamily, FontSize } from "@tiptap/extension-text-style"
```

---

## 검증 방법

### 테스트 1: Bullet List
1. `npm run dev` 실행
2. "작업 추가" 버튼 클릭
3. 설명 필드에 텍스트 입력
4. Bullet List 버튼 (≡ 아이콘) 클릭
5. **예상 결과**: 텍스트 앞에 • 글머리 기호 표시

### 테스트 2: Ordered List
1. 설명 필드에 텍스트 입력
2. Ordered List 버튼 (1. 2. 3. 아이콘) 클릭
3. **예상 결과**: 텍스트 앞에 1. 2. 3. 번호 표시

### 테스트 3: Link
1. 설명 필드에 텍스트 입력 후 선택
2. Link 버튼 (🔗 아이콘) 클릭
3. **예상 결과**: URL 입력 팝오버 표시
4. URL 입력 후 "적용" 클릭
5. **예상 결과**: 선택한 텍스트에 파란색 밑줄 링크 스타일 적용

---

## 대안: @tailwindcss/typography 플러그인 설치

리스트 스타일을 수동으로 추가하는 대신 공식 플러그인을 사용할 수 있음:

```bash
npm install -D @tailwindcss/typography
```

`tailwind.config.js` 수정:
```javascript
export default {
  // ...
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
```

**장점**: 더 풍부한 타이포그래피 스타일 제공
**단점**: 추가 의존성, prose 클래스의 기본 스타일이 프로젝트 디자인과 충돌할 수 있음

---

## 참고 자료

- [TipTap StarterKit 문서](https://tiptap.dev/docs/editor/extensions/functionality/starterkit)
- [TipTap List Extensions](https://tiptap.dev/docs/editor/extensions/nodes/bullet-list)
- [TipTap Link Extension](https://tiptap.dev/docs/editor/extensions/marks/link)
- [Radix UI Popover](https://www.radix-ui.com/primitives/docs/components/popover)

---

**작성일**: 2026-01-11
**관련 파일**:
- `src/components/ui/RichTextEditor.tsx`
- `src/components/tasks/TaskFormDialog.tsx`
- `src/index.css`
