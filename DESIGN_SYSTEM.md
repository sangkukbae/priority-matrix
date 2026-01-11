# Priority Metrix - Design System

**디자인 벤치마킹**: Trello Design System (https://design.trello.com/)

## 1. 색상 팔레트

### 1.1 핵심 색상

| 용도 | 색상명 | HEX | RGB | 샘플 |
|------|--------|-----|-----|------|
| **주 색상 (Primary)** | Trello Blue | `#0079BF` | rgb(0, 121, 191) | ■ |
| **어두운 강조 (Dark)** | Navy | `#0C3953` | rgb(12, 57, 83) | ■ |
| **배경 (Background)** | Light Gray | `#F4F5F7` | rgb(244, 245, 247) | ■ |
| **카드 배경 (Card)** | White | `#FFFFFF` | rgb(255, 255, 255) | ■ |
| **성공 (Success)** | Green | `#61BD4F` | rgb(97, 189, 79) | ■ |
| **경고 (Warning)** | Yellow | `#F2D600` | rgb(242, 214, 0) | ■ |
| **위험 (Danger)** | Red | `#EB5A46` | rgb(235, 90, 70) | ■ |
| **텍스트 기본** | Charcoal | `#172B4D` | rgb(23, 43, 77) | ■ |
| **텍스트 보조** | Gray | `#6B778C` | rgb(107, 119, 140) | ■ |
| **보더** | Light Gray | `#DFE1E6` | rgb(223, 225, 230) | ■ |

### 1.2 사분면별 색상

| 사분면 | 배경색 | 텍스트색 | 포인트 컬러 | HEX |
|--------|--------|----------|-------------|-----|
| **DO (해야 할 일)** | #FFE2E2 | #8B0000 | #EB5A46 | ■ |
| **PLAN (계획할 일)** | #E6F4EA | #1E7E34 | #61BD4F | ■ |
| **DELEGATE (위임할 일)** | #E3F2FD | #0D47A1 | #0079BF | ■ |
| **DELETE (삭제할 일)** | #F5F5F5 | #616161 | #9E9E9E | ■ |

## 2. 카드 디자인 스펙

### 2.1 Trello 스타일 카드

```css
.task-card {
  background-color: #FFFFFF;
  border-radius: 8px;
  box-shadow: 0 1px 0 rgba(9, 30, 66, 0.25);
  transition: all 0.2s ease;
  cursor: pointer;
}

.task-card:hover {
  background-color: #F4F5F7;
  box-shadow: 0 4px 8px rgba(9, 30, 66, 0.25);
}

.task-card:active {
  transform: scale(0.98);
  transition: transform 0.1s ease;
}

/* 드래그 중일 때 */
.task-card.dragging {
  box-shadow: 0 8px 16px rgba(9, 30, 66, 0.3);
  opacity: 0.8;
  transform: rotate(2deg);
}
```

### 2.2 Tailwind CSS 클래스

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        trello: {
          blue: '#0079BF',
          navy: '#0C3953',
          light: '#F4F5F7',
          success: '#61BD4F',
          warning: '#F2D600',
          danger: '#EB5A46',
          charcoal: '#172B4D',
          gray: '#6B778C',
          border: '#DFE1E6',
        },
      },
      boxShadow: {
        'trello-card': '0 1px 0 rgba(9, 30, 66, 0.25)',
        'trello-card-hover': '0 4px 8px rgba(9, 30, 66, 0.25)',
        'trello-drag': '0 8px 16px rgba(9, 30, 66, 0.3)',
      },
      borderRadius: {
        'trello': '8px',
      },
      transitionTimingFunction: {
        'trello': 'ease',
      },
      transitionDuration: {
        'trello': '200ms',
      },
    },
  },
}
```

## 3. 간격 시스템 (8px Grid)

| 간격 | 크기 | Tailwind | 용도 |
|------|------|----------|------|
| xs | 4px | `p-1`, `gap-1` | 아이콘 내부 여백 |
| sm | 8px | `p-2`, `gap-2` | 카드 내부 패딩 |
| md | 16px | `p-4`, `gap-4` | 카드 간격, 섹션 패딩 |
| lg | 24px | `p-6`, `gap-6` | 섹션 간격 |
| xl | 32px | `p-8`, `gap-8` | 메인 섹션 간격 |

## 4. 타이포그래피

| 요소 | 폰트 | 크기 | 무게 | 행간 | Tailwind |
|------|------|------|------|------|----------|
| **제목 1** | Inter / Noto Sans KR | 24px | Bold | 1.3 | `text-2xl font-bold` |
| **제목 2** | Inter / Noto Sans KR | 18px | SemiBold | 1.4 | `text-lg font-semibold` |
| **본문** | Inter / Noto Sans KR | 14px | Regular | 1.5 | `text-sm` |
| **캡션** | Inter / Noto Sans KR | 12px | Regular | 1.4 | `text-xs` |
| **사분면 헤더** | Inter / Noto Sans KR | 16px | Bold | 1.3 | `text-base font-bold` |

## 5. 애니메이션 명세

| 이벤트 | 전환 시간 | 이징 | 설명 |
|--------|-----------|------|------|
| Hover 상태 변경 | 0.2s | ease | 그림자, 색상 변화 |
| 드래그 시작 | 0.15s | ease-out | 카드가 들리는 효과 |
| 드래그 종료 | 0.3s | spring | 원위치 복귀 |
| 모달 오픈 | 0.25s | ease-out | 페이드 + 스케일 |
| 카드 추가 | 0.3s | ease-out | 스태거 효과 |

## 6. 버튼 스타일 (Trello)

### 6.1 주 버튼 (Primary)

```css
.btn-primary {
  background-color: #0079BF;  /* Trello Blue */
  color: #FFFFFF;
  border-radius: 8px;
  transition: background-color 0.2s ease;
}

.btn-primary:hover {
  background-color: #026AA7;
}
```

### 6.2 보조 버튼 (Secondary)

```css
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

### 6.3 위험 버튼 (Danger)

```css
.btn-danger {
  background-color: #EB5A46;
  color: #FFFFFF;
  border-radius: 8px;
}

.btn-danger:hover {
  background-color: #D64538;
}
```

## 7. 입력 필드 스타일 (Trello)

```css
.input-field {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #DFE1E6;
  border-radius: 3px;
  background-color: #FAFBFC;
  transition: all 0.2s ease;
}

.input-field:focus {
  border-color: #0079BF;
  box-shadow: 0 0 0 2px rgba(0, 121, 191, 0.2);
  outline: none;
  background-color: #FFFFFF;
}

.input-field::placeholder {
  color: #9E9E9E;
}
```

## 8. 아이콘 시스템

**Lucide React** 아이콘 사용 (Trello와 유사한 스타일)

| 기능 | 아이콘 | 크기 |
|------|--------|------|
| 추가 | Plus | 16px |
| 편집 | Edit2 | 16px |
| 삭제 | Trash2 | 16px |
| 완료 | CheckCircle2 / Circle | 16px |
| 우선순위 | Flag | 16px |
| 마감일 | Calendar | 16px |
| 설정 | Settings | 16px |

## 9. 다크 모드 색상

| 요소 | 라이트 모드 | 다크 모드 |
|------|-------------|-----------|
| 배경 | `#F4F5F7` | `#222222` |
| 카드 | `#FFFFFF` | `#2D2D2D` |
| 텍스트 | `#172B4D` | `#FFFFFF` |
| 보더 | `#DFE1E6` | `#404040` |
| 주 버튼 | `#0079BF` | `#0079BF` (유지) |

## 10. 접근성 (WCAG 2.1 AA)

- 색상 대비 최소 4.5:1 보장
- 포커스 상태 시각적 표시
- 키보드 네비게이션 지원
- 스크린 리더 호환

## 11. 참고 자료

- **Trello Design System**: https://design.trello.com/
- **Atlassian Design System**: https://atlassian.design/
- **Tailwind CSS**: https://tailwindcss.com/
- **Lucide Icons**: https://lucide.dev/

---

**문서 작성일**: 2026년 1월 10일  
**버전**: 1.0  
**상태**: 초안
