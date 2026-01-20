# 챗봇 멀티턴 대화 컨텍스트 유지 구현

## 문제 요약

현재 Priority Metrix 챗봇은 **매 요청마다 새로운 Chrome AI 세션을 생성**하여 이전 대화 히스토리가 AI에게 전달되지 않음. 사용자가 "답변을 불렛 리스트 형식으로 작성하라"라고 후속 질문 시, AI가 이전 대화(요약 요청)의 맥락을 모르고 엉뚱한 답변을 생성.

### 문제 시나리오

```
사용자: 아래 내용을 간결하게 요약하라. [멘토링 안내 텍스트]
챗봇: [요약 결과 제공]

사용자: 답변을 불렛 리스트 형식으로 작성하라.
챗봇: (이전 맥락을 모르고) 현재 등록된 작업 목록을 나열... ❌
```

## 해결 방안

Chrome AI Prompt API의 `initialPrompts`에 이전 대화 히스토리를 포함하여 멀티턴 대화 지원:

```javascript
const session = await LanguageModel.create({
  initialPrompts: [
    { role: 'system', content: systemPrompt },      // 시스템 프롬프트
    { role: 'user', content: '이전 질문' },           // 대화 히스토리
    { role: 'assistant', content: '이전 답변' },
    // ...
  ],
});
```

---

## 구현 단계

### 1. 타입 정의 확장

**파일**: `src/types/chat.ts`

```typescript
// AI 프롬프트용 타입 추가
export type AIPromptRole = 'system' | 'user' | 'assistant'

export interface AIPromptMessage {
  role: AIPromptRole
  content: string
}

// StreamChatOptions 확장
export interface StreamChatOptions {
  systemPrompt?: string
  signal?: AbortSignal
  conversationHistory?: AIPromptMessage[]  // 추가
  maxHistoryMessages?: number              // 추가
}
```

### 2. 대화 히스토리 유틸리티 추가

**파일**: `src/lib/chat-context.ts`

```typescript
import type { ChatMessage, AIPromptMessage } from '@/types/chat'

const MAX_CHARS_FOR_HISTORY = 8000  // ~2000 토큰

export function buildConversationHistory(
  messages: ChatMessage[],
  maxMessages: number = 10
): AIPromptMessage[] {
  // 완료된 메시지만 필터링 (빈 content 제외)
  const completedMessages = messages.filter(
    (m) => m.content && m.content.trim().length > 0
  )

  // 최근 메시지 추출
  let recentMessages = completedMessages.slice(-maxMessages)

  // 토큰 제한을 위한 문자 수 확인 및 truncation
  let totalChars = recentMessages.reduce((sum, m) => sum + m.content.length, 0)

  while (totalChars > MAX_CHARS_FOR_HISTORY && recentMessages.length > 2) {
    recentMessages = recentMessages.slice(2)  // 가장 오래된 user+assistant 쌍 제거
    totalChars = recentMessages.reduce((sum, m) => sum + m.content.length, 0)
  }

  return recentMessages.map((m) => ({
    role: m.role as 'user' | 'assistant',
    content: m.content,
  }))
}
```

### 3. AI 스트리밍 레이어 수정

**파일**: `src/lib/chat-ai.ts`

#### 3.1 `streamWithLanguageModel` 함수 시그니처 수정

```typescript
async function streamWithLanguageModel(
  prompt: string,
  onUpdate: (text: string) => void,
  signal?: AbortSignal,
  systemPrompt?: string,
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>  // 추가
): Promise<string>
```

#### 3.2 `initialPrompts` 빌드 로직 수정

```typescript
// 시스템 프롬프트 + 대화 히스토리로 initialPrompts 구성
const initialPrompts: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [];

if (systemPrompt) {
  initialPrompts.push({ role: 'system', content: systemPrompt });
}

if (conversationHistory && conversationHistory.length > 0) {
  initialPrompts.push(...conversationHistory);
}

if (initialPrompts.length > 0) {
  sessionOptions.initialPrompts = initialPrompts;
}
```

#### 3.3 `streamChatResponse` 함수 수정

```typescript
export async function streamChatResponse(
  prompt: string,
  onUpdate: (text: string) => void,
  signal?: AbortSignal,
  options?: StreamChatOptions
): Promise<string> {
  const conversationHistory = options?.conversationHistory;  // 대화 히스토리 추출

  // LanguageModel API 호출 시 히스토리 전달
  return await streamWithLanguageModel(
    prompt,
    onUpdate,
    resolvedSignal,
    options?.systemPrompt,
    conversationHistory  // 추가
  );
}
```

### 4. ChatBot 컴포넌트 수정

**파일**: `src/components/chat/ChatBot.tsx`

#### 4.1 import 추가

```typescript
import { buildConversationHistory } from '@/lib/chat-context'
```

#### 4.2 `handleSend` 함수 수정

```typescript
const handleSend = async (prompt: string) => {
  // ... 검증 로직 ...

  // 새 메시지 추가 전에 대화 히스토리 추출
  const conversationHistory = buildConversationHistory(messages, 10)

  addMessage({ role: 'user', content: prompt })
  addMessage({ role: 'assistant', content: '' })

  // ... 시스템 프롬프트 빌드 ...

  await streamChatResponse(
    prompt,
    (text) => updateLastMessage(text),
    controllerRef.current.signal,
    {
      systemPrompt,
      conversationHistory  // 대화 히스토리 전달
    }
  )
}
```

---

## 수정 파일 요약

| 파일 | 변경 사항 |
|------|----------|
| `src/types/chat.ts` | `AIPromptMessage`, `AIPromptRole` 타입 추가, `StreamChatOptions` 확장 |
| `src/lib/chat-context.ts` | `buildConversationHistory()` 유틸리티 함수 추가 |
| `src/lib/chat-ai.ts` | `streamWithLanguageModel`, `streamChatResponse` 함수에 히스토리 파라미터 추가 |
| `src/components/chat/ChatBot.tsx` | `handleSend`에서 대화 히스토리 추출 및 전달 |

---

## 토큰 관리 전략

- Gemini Nano 컨텍스트 윈도우: ~6k 토큰 (~24k 문자)
- 시스템 프롬프트 + 작업 컨텍스트: ~2000 토큰
- 대화 히스토리: ~2000 토큰 (최대 10개 메시지)
- 현재 프롬프트: ~500 토큰
- 응답 생성: ~1500 토큰

---

## 검증 방법

### 테스트 시나리오 1: 멀티턴 컨텍스트

1. 사용자: "아래 내용을 간결하게 요약해줘: [긴 텍스트]"
2. AI: [요약 결과]
3. 사용자: "불렛 리스트 형식으로 다시 작성해줘"
4. **예상 결과**: AI가 이전 요약을 불렛 리스트로 재포맷 (작업 목록 나열 아님)

### 테스트 시나리오 2: 작업 참조

1. 사용자: "해야 할 일에 어떤 작업이 있어?"
2. AI: "해야 할 일에는 '믹스패널 제거', '상담 요약 변경'이 있습니다."
3. 사용자: "그 중 우선순위가 높은 건?"
4. **예상 결과**: AI가 2번에서 언급한 작업 중 우선순위 높은 것 식별

### 테스트 명령어

```bash
npm run dev
# 브라우저에서 챗봇 열고 위 시나리오 테스트
```

---

## 참고 자료

- [Chrome AI Prompt API - Multi-turn Conversations](https://developer.chrome.com/docs/ai/prompt-api)
- [Chrome AI Session Management Best Practices](https://developer.chrome.com/docs/ai/session-management)
