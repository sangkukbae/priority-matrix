# AI Chatbot Feature Implementation Plan

**작성일**: 2026년 1월 15일
**상태**: 계획 중

## 개요

Chrome 내장 Gemini Nano AI와 Vercel AI SDK를 활용한 챗봇 기능 구현 계획서입니다.
우측 하단 플로팅 버튼을 통해 채팅 UI를 노출하고, 스트리밍 형태로 AI 응답을 제공합니다.

## 기술 스택

### 핵심 라이브러리
- **chrome-ai**: Chrome 내장 Gemini Nano를 위한 Vercel AI SDK 프로바이더
- **ai (Vercel AI SDK)**: AI 스트리밍 및 텍스트 생성
- **@ai-sdk/react**: React 통합 훅 (useCompletion, useChat)

### Chrome Gemini Nano API
- **LanguageModel.availability()**: 모델 가용성 확인
- **LanguageModel.create()**: 세션 생성
- **session.promptStreaming()**: 스트리밍 응답

### 브라우저 요구사항
- Chrome 버전 127 이상 (Dev/Canary 채널)
- 플래그 활성화 필요:
  - `chrome://flags/#prompt-api-for-gemini-nano` → Enabled
  - `chrome://flags/#optimization-guide-on-device-model` → Enabled BypassPerfRequirement
- 하드웨어: 22GB 이상 디스크 공간, GPU 4GB+ VRAM 또는 CPU 16GB+ RAM

## UI/UX 디자인 (DESIGN_SYSTEM.md 기반)

### 1. 플로팅 액션 버튼 (FAB)
```css
/* Trello 스타일 기반 */
position: fixed;
bottom: 24px;  /* lg spacing */
right: 24px;
width: 56px;
height: 56px;
background: #0079BF;  /* Trello Blue */
border-radius: 50%;
box-shadow: 0 4px 8px rgba(9, 30, 66, 0.25);  /* trello-card-hover */
transition: all 0.2s ease;
```

### 2. 채팅 패널
```css
position: fixed;
bottom: 96px;  /* FAB 위 */
right: 24px;
width: 380px;
max-height: 500px;
background: #FFFFFF;
border-radius: 8px;  /* rounded-trello */
box-shadow: 0 8px 16px rgba(9, 30, 66, 0.3);  /* trello-drag */
```

### 3. 색상 팔레트
| 요소 | 색상 | HEX |
|------|------|-----|
| 헤더 배경 | Trello Blue | `#0079BF` |
| 헤더 텍스트 | White | `#FFFFFF` |
| 사용자 메시지 배경 | Light Blue | `#E3F2FD` |
| AI 메시지 배경 | Light Gray | `#F4F5F7` |
| 입력 필드 배경 | FAFBFC | `#FAFBFC` |
| 입력 필드 포커스 | Trello Blue | `#0079BF` |

### 4. 애니메이션
| 이벤트 | 시간 | 이징 |
|--------|------|------|
| 패널 열기/닫기 | 0.25s | ease-out |
| 메시지 등장 | 0.2s | ease |
| FAB 호버 | 0.2s | ease |

## 아키텍처

### 컴포넌트 구조
```
src/components/chat/
├── ChatBot.tsx           # 메인 컨테이너 (상태 관리)
├── ChatFAB.tsx           # 플로팅 액션 버튼
├── ChatPanel.tsx         # 채팅 패널 컨테이너
├── ChatHeader.tsx        # 패널 헤더 (제목, 닫기 버튼)
├── ChatMessages.tsx      # 메시지 목록 렌더링
├── ChatMessage.tsx       # 개별 메시지 컴포넌트
├── ChatInput.tsx         # 입력 필드 + 전송 버튼
└── ChatAvailability.tsx  # AI 가용성 상태 표시
```

### 타입 정의
```typescript
// src/types/chat.ts
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatState {
  messages: ChatMessage[];
  isOpen: boolean;
  isLoading: boolean;
  isAvailable: boolean | null;  // null = 확인 중
  error: string | null;
}
```

### Zustand 스토어
```typescript
// src/store/chatStore.ts
// 참고: localStorage 저장 없음 - 세션 동안만 메시지 유지
interface ChatStore extends ChatState {
  // Actions
  toggleChat: () => void;
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  updateLastMessage: (content: string) => void;
  setLoading: (loading: boolean) => void;
  setAvailability: (available: boolean) => void;
  setError: (error: string | null) => void;
  clearMessages: () => void;
}
```

### 폴백 처리
Chrome AI가 지원되지 않는 브라우저에서는 FAB 버튼을 표시하고,
클릭 시 브라우저 요구사항 안내 메시지를 표시합니다.

## 구현 단계

### Phase 1: 기반 설정
1. 의존성 설치
   ```bash
   npm install chrome-ai ai @ai-sdk/react
   npm install -D @types/dom-chromium-ai
   ```
2. 타입 정의 파일 생성 (`src/types/chat.ts`)
3. Zustand 스토어 생성 (`src/store/chatStore.ts`)

### Phase 2: UI 컴포넌트 구현
1. ChatFAB 컴포넌트 (플로팅 버튼)
2. ChatPanel 컴포넌트 (패널 레이아웃)
3. ChatHeader 컴포넌트 (헤더)
4. ChatMessages 컴포넌트 (메시지 목록)
5. ChatMessage 컴포넌트 (개별 메시지)
6. ChatInput 컴포넌트 (입력 필드)

### Phase 3: AI 통합
1. Chrome AI 가용성 확인 로직
2. streamText를 활용한 스트리밍 응답 처리
3. 에러 핸들링 및 폴백 UI

### Phase 4: 통합 및 테스트
1. App.tsx에 ChatBot 컴포넌트 통합
2. 반응형 레이아웃 조정
3. 접근성 (키보드 네비게이션, 스크린 리더)
4. 다크 모드 지원

## 코드 예시

### 스트리밍 구현 (chrome-ai 사용)
```typescript
import { streamText } from 'ai';
import { chromeai } from 'chrome-ai';

async function generateResponse(prompt: string, onChunk: (text: string) => void) {
  const { textStream } = await streamText({
    model: chromeai(),
    prompt,
  });

  let fullText = '';
  for await (const chunk of textStream) {
    fullText += chunk;
    onChunk(fullText);
  }

  return fullText;
}
```

### 가용성 확인
```typescript
async function checkAvailability(): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  // Chrome AI API 확인
  if ('LanguageModel' in window) {
    const availability = await (window as any).LanguageModel.availability();
    return availability === 'available';
  }

  return false;
}
```

## 파일 변경 목록

### 새로 생성
- `src/types/chat.ts`
- `src/store/chatStore.ts`
- `src/components/chat/ChatBot.tsx`
- `src/components/chat/ChatFAB.tsx`
- `src/components/chat/ChatPanel.tsx`
- `src/components/chat/ChatHeader.tsx`
- `src/components/chat/ChatMessages.tsx`
- `src/components/chat/ChatMessage.tsx`
- `src/components/chat/ChatInput.tsx`
- `src/components/chat/ChatAvailability.tsx`
- `src/components/chat/index.ts`

### 수정
- `src/App.tsx` - ChatBot 컴포넌트 추가
- `package.json` - 의존성 추가

## 제한 사항 및 고려 사항

### 브라우저 호환성
- Chrome 127+ (Dev/Canary) 필요
- Safari, Firefox 미지원
- 폴백 UI 필요 (AI 비가용 시 안내 메시지)

### Gemini Nano 제한
- 요약, 분류, 재작성에 최적화
- 정확한 사실 정보 쿼리에는 적합하지 않음
- toolCall/functionCall 미지원

### 성능
- 모델 다운로드 시간 (최초 사용 시)
- GPU/CPU 리소스 사용
- 로컬 스토리지 22GB+ 필요

## 참고 자료

- [Chrome Built-in AI Documentation](https://developer.chrome.com/docs/ai/built-in)
- [Chrome Prompt API](https://developer.chrome.com/docs/ai/prompt-api)
- [Vercel AI SDK](https://ai-sdk.dev/docs/introduction)
- [chrome-ai GitHub](https://github.com/jeasonstudio/chrome-ai)
- [@built-in-ai/core](https://ai-sdk.dev/providers/community-providers/built-in-ai)
- [AI SDK 6 Announcement](https://vercel.com/blog/ai-sdk-6)
