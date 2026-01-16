# AI 챗봇 컨텍스트 인식 기능 구현 계획

**작성일**: 2026년 1월 16일
**상태**: 계획 완료
**관련 파일**: CHATBOT_FEATURE.md (기존 챗봇 구현)

## 개요

AI 챗봇이 현재 페이지의 작업 데이터를 컨텍스트로 사용하여 사용자 질문의 의도를 파악하고 문맥에 맞게 정확하게 답변하도록 개선합니다.

### 현재 문제

사용자가 "해야 할 일에는 어떤 작업이 있어?"라고 물었을 때, 챗봇이 실제 작업 데이터("우유 사기")를 참조하지 않고 일반적인 AI 도우미 응답을 출력합니다.

### 목표

- 작업 스토어의 실제 데이터를 AI 프롬프트에 주입
- 사분면별 작업 목록, 우선순위, 마감일 등 정확한 정보 제공
- 한국어로 자연스럽게 응답

## 기술 조사

### Chrome Built-in AI (Gemini Nano)

Chrome Prompt API는 `initialPrompts`를 통해 시스템 프롬프트를 지원합니다:

```javascript
const session = await LanguageModel.create({
  initialPrompts: [
    { role: 'system', content: '시스템 지시사항' },
    { role: 'user', content: '이전 질문' },
    { role: 'assistant', content: '이전 답변' }
  ]
});
```

참고: [Chrome Built-in AI Documentation](https://developer.chrome.com/docs/ai/built-in)

### Vercel AI SDK

`streamText` 함수에서 `system` 파라미터를 통해 시스템 프롬프트를 제공합니다:

```typescript
const { textStream } = await streamText({
  model: builtInAI(),
  system: '당신은 작업 관리 도우미입니다...',
  prompt: userMessage
});
```

참고: [Vercel AI SDK Documentation](https://ai-sdk.dev/docs/introduction)

### 컨텍스트 엔지니어링

2025년 기준, AI 애플리케이션 개발에서 프롬프트 엔지니어링보다 컨텍스트 엔지니어링이 더 중요해졌습니다:

- **프롬프트 엔지니어링**: "어떻게" 질문할 것인가
- **컨텍스트 엔지니어링**: "무엇을" 제공할 것인가 (데이터, 상태, 메모리)

참고:
- [Context Engineering Guide](https://www.promptingguide.ai/guides/context-engineering-guide)
- [The Context-Aware Conversational AI Framework](https://promptengineering.org/the-context-aware-conversational-ai-framework/)

## 아키텍처 설계

### 컨텍스트 빌더 패턴

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   TaskStore     │───▶│  ChatContext     │───▶│   chat-ai.ts    │
│   (Zustand)     │    │  Builder         │    │   streamChat    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                      │                       │
         ▼                      ▼                       ▼
   tasks, labels      formatTaskContext()      streamChatResponse()
   getTasksByQuadrant buildSystemPrompt()      + systemPrompt
```

### 컴포넌트 통합

```
ChatBot.tsx
├── useTaskStore() ──────────────────┐
│   - tasks                          │
│   - labels                         │
│                                    ▼
├── handleSend(prompt)         chat-context.ts
│   └── buildPromptWithContext()    ├── SYSTEM_PROMPT_KO
│       └── streamChatResponse()    ├── formatTaskContext()
│                                   └── buildSystemPrompt()
└── chat-ai.ts
    └── streamChatResponse(prompt, onUpdate, signal, { systemPrompt })
```

## 시스템 프롬프트 설계

### 한국어 시스템 프롬프트

```typescript
export const SYSTEM_PROMPT_KO = `당신은 Priority Metrix 작업 관리 앱의 AI 어시스턴트입니다.

## 역할
- 사용자의 작업(태스크) 관련 질문에 정확하게 답변합니다
- 현재 작업 목록을 기반으로 실제 데이터를 제공합니다
- 작업 관리에 대한 조언과 제안을 합니다

## 아이젠하워 매트릭스 사분면
- 해야 할 일 (DO): 긴급하고 중요한 작업 - 즉시 처리해야 함
- 계획할 일 (PLAN): 긴급하지 않지만 중요한 작업 - 일정을 계획해야 함
- 위임할 일 (DELEGATE): 긴급하지만 중요하지 않은 작업 - 다른 사람에게 위임
- 삭제할 일 (DELETE): 긴급하지도 중요하지도 않은 작업 - 제거 고려

## 우선순위 레벨
- 높음 (high): 가장 먼저 처리해야 하는 작업
- 중간 (medium): 적절한 시기에 처리할 작업
- 낮음 (low): 여유가 있을 때 처리할 작업
- 없음 (none): 우선순위 미지정

## 지침
- 항상 한국어로 답변합니다
- 작업에 대한 질문에는 아래 제공된 실제 데이터를 기반으로 답변합니다
- 작업이 없는 경우 "현재 등록된 작업이 없습니다"라고 명확히 알려줍니다
- 간결하고 친근한 톤으로 답변합니다
- 작업 추가/수정/삭제는 직접 할 수 없으며, 사용자에게 UI를 통해 하도록 안내합니다

## 현재 작업 상태
{TASK_CONTEXT}`;
```

### 컨텍스트 포맷 예시

```
총 작업: 8개 (완료: 2개)

[해야 할 일] 3개
1. "우유 사기" - 우선순위: 중간
2. "보고서 제출" - 우선순위: 높음, 마감일: 2026-01-17 [완료]
3. "회의 준비" - 우선순위: 높음

[계획할 일] 2개
1. "운동 시작" - 우선순위: 없음
2. "책 읽기" - 우선순위: 낮음

[위임할 일] 2개
1. "자료 정리" - 우선순위: 낮음
2. "이메일 회신" - 우선순위: 중간

[삭제할 일] 1개
1. "오래된 파일 정리" - 우선순위: 없음
```

## 구현 계획

### Phase 1: 컨텍스트 빌더 모듈 생성

#### 파일: `src/lib/chat-context.ts`

```typescript
import { Task, Label, QuadrantType, TaskPriority } from '@/types/task';

// 한국어 매핑
const QUADRANT_NAMES_KO: Record<QuadrantType, string> = {
  DO: '해야 할 일',
  PLAN: '계획할 일',
  DELEGATE: '위임할 일',
  DELETE: '삭제할 일'
};

const PRIORITY_NAMES_KO: Record<TaskPriority, string> = {
  high: '높음',
  medium: '중간',
  low: '낮음',
  none: '없음'
};

export interface ChatContextOptions {
  maxTasks?: number;           // 기본값: 50
  includeDescriptions?: boolean; // 기본값: false (토큰 절약)
  includeLabels?: boolean;     // 기본값: true
}

/**
 * 작업 목록을 AI 컨텍스트용 문자열로 포맷
 */
export function formatTaskContext(
  tasks: Task[],
  labels: Label[],
  options?: ChatContextOptions
): string;

/**
 * 시스템 프롬프트에 작업 컨텍스트 주입
 */
export function buildSystemPrompt(taskContext: string): string;

/**
 * 사용자 메시지와 컨텍스트를 결합한 완전한 프롬프트 생성
 */
export function buildPromptWithContext(
  userMessage: string,
  tasks: Task[],
  labels: Label[],
  options?: ChatContextOptions
): { systemPrompt: string; userPrompt: string };
```

### Phase 2: 타입 정의 확장

#### 파일: `src/types/chat.ts` (수정)

```typescript
// 기존 타입에 추가

export interface ChatContextOptions {
  maxTasks?: number;
  includeDescriptions?: boolean;
  includeLabels?: boolean;
}

export interface StreamChatOptions {
  systemPrompt?: string;
  signal?: AbortSignal;
}
```

### Phase 3: AI 통합 계층 수정

#### 파일: `src/lib/chat-ai.ts` (수정)

**변경 1**: `streamChatResponse` 시그니처 확장

```typescript
// Before (Line 166-170)
export async function streamChatResponse(
  prompt: string,
  onUpdate: (text: string) => void,
  signal?: AbortSignal
): Promise<string>

// After
export async function streamChatResponse(
  prompt: string,
  onUpdate: (text: string) => void,
  signal?: AbortSignal,
  options?: { systemPrompt?: string }
): Promise<string>
```

**변경 2**: Chrome LanguageModel API에 initialPrompts 추가

```typescript
// streamWithLanguageModel 함수 수정
async function streamWithLanguageModel(
  prompt: string,
  onUpdate: (text: string) => void,
  signal?: AbortSignal,
  systemPrompt?: string
): Promise<string> {
  // ...

  const sessionOptions: any = {
    monitor: (m: LanguageModelMonitor) => { /* ... */ }
  };

  // 시스템 프롬프트가 있으면 initialPrompts 추가
  if (systemPrompt) {
    sessionOptions.initialPrompts = [
      { role: 'system', content: systemPrompt }
    ];
  }

  const session = await lm.create(sessionOptions);
  // ...
}
```

**변경 3**: Vercel AI SDK fallback에 system 추가

```typescript
// Line 180-184 수정
const { textStream } = await streamText({
  model,
  system: options?.systemPrompt,  // 추가
  prompt,
  abortSignal: signal,
});
```

### Phase 4: 컴포넌트 통합

#### 파일: `src/components/chat/ChatBot.tsx` (수정)

```typescript
// 추가 imports
import { useTaskStore } from '@/store/taskStore';
import { buildPromptWithContext } from '@/lib/chat-context';

export function ChatBot() {
  // 기존 hooks...

  // 작업 스토어에서 데이터 가져오기
  const tasks = useTaskStore((state) => state.tasks);
  const labels = useTaskStore((state) => state.labels);

  const handleSend = async (prompt: string) => {
    // 기존 validation...

    addMessage({ role: 'user', content: prompt });
    addMessage({ role: 'assistant', content: '' });
    setLoading(true);

    try {
      // 컨텍스트 빌드
      const { systemPrompt } = buildPromptWithContext(prompt, tasks, labels);

      controllerRef.current = new AbortController();

      await streamChatResponse(
        prompt,  // 사용자 메시지는 그대로 유지 (UI 표시용)
        (text) => updateLastMessage(text),
        controllerRef.current.signal,
        { systemPrompt }  // 시스템 프롬프트 전달
      );
    } catch (error) {
      // 기존 에러 핸들링...
    }
    // ...
  };

  // ...
}
```

## 파일 변경 요약

### 새로 생성
| 파일 | 목적 |
|------|------|
| `src/lib/chat-context.ts` | 컨텍스트 빌더 모듈 |

### 수정
| 파일 | 변경 내용 |
|------|-----------|
| `src/lib/chat-ai.ts` | systemPrompt 옵션 추가, initialPrompts 지원 |
| `src/components/chat/ChatBot.tsx` | taskStore 연동, 컨텍스트 빌드 |
| `src/types/chat.ts` | ChatContextOptions, StreamChatOptions 타입 추가 |

## 테스트 시나리오

### 기본 질문 테스트

| 질문 | 예상 응답 |
|------|----------|
| "해야 할 일에 어떤 작업이 있어?" | 실제 DO 사분면 작업 목록 |
| "총 작업이 몇 개야?" | 전체 작업 수와 완료 수 |
| "완료된 작업 보여줘" | completed: true인 작업들 |
| "가장 급한 일이 뭐야?" | 높은 우선순위 + 가까운 마감일 작업 |
| "내일 마감인 작업 있어?" | 해당 날짜 dueDate 작업 |
| "계획할 일은 몇 개야?" | PLAN 사분면 작업 수 |

### 엣지 케이스 테스트

| 상황 | 예상 동작 |
|------|----------|
| 작업 없음 | "현재 등록된 작업이 없습니다" |
| 특정 사분면 비어있음 | "해야 할 일에 등록된 작업이 없습니다" |
| 50개 초과 작업 | 최근 50개만 표시, 나머지 생략 안내 |

## 검증 방법

1. 개발 서버 실행
   ```bash
   npm run dev
   ```

2. 테스트 작업 추가
   - "해야 할 일"에 "우유 사기" 작업 추가
   - 우선순위: 중간

3. 챗봇 질문
   - "해야 할 일에 어떤 작업이 있어?"
   - 응답에 "우유 사기"가 포함되어야 함

4. 추가 검증
   - 다른 사분면에 작업 추가 후 관련 질문
   - 작업 삭제 후 반영 확인
   - 우선순위/마감일 변경 후 반영 확인

## 제한 사항

### Gemini Nano 한계
- 복잡한 추론이나 정확한 사실 정보에 적합하지 않음
- 요약, 분류, 재작성에 최적화
- 토큰 컨텍스트 윈도우 제한 (약 6k 토큰)

### 토큰 최적화
- 작업 설명(description)은 기본적으로 제외
- 최대 50개 작업으로 제한
- 긴 제목은 50자로 잘라냄

### 브라우저 요구사항
- Chrome 127+ (Dev/Canary)
- 특정 플래그 활성화 필요
- 22GB+ 디스크 공간

## 참고 자료

- [Chrome Built-in AI Documentation](https://developer.chrome.com/docs/ai/built-in)
- [Chrome Prompt API](https://developer.chrome.com/docs/ai/prompt-api)
- [Vercel AI SDK](https://ai-sdk.dev/docs/introduction)
- [Context Engineering Guide](https://www.promptingguide.ai/guides/context-engineering-guide)
- [Gemini Nano in Chrome 137: notes for AI Engineers](https://www.swyx.io/gemini-nano)
- [Context Engineering: The Definitive 2025 Guide](https://www.flowhunt.io/blog/context-engineering/)
