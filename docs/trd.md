# 아이젠하워 매트릭스 웹 애플리케이션 TRD (Technical Requirements Document) - MVP 버전

## 1. 기술 스택 개요

### 1.1 핵심 기술 스택

| 영역 | 기술 | 버전 | 용도 |
|------|------|------|------|
| **프레임워크** | React | 18.x | UI 라이브러리 |
| **빌드 도구** | Vite | 5.x | 번들러 및 개발 서버 |
| **타입 시스템** | TypeScript | 5.x | 타입 안전성 |
| **스타일링** | Tailwind CSS | 3.x | 유틸리티 CSS |
| **UI 라이브러리** | shadcn/ui | 2.x | UI 컴포넌트 |
| **애니메이션** | Animate UI + Motion | 1.x | 컴포넌트 애니메이션 |
| **상태 관리** | Zustand | 4.x | 전역 상태 관리 |
| **드래그 앤 드롭** | @dnd-kit/core | 6.x | 드래그 앤 드롭 기능 |
| **아이콘** | Lucide React | 0.x | 아이콘 시스템 |
| **패키지 관리** | pnpm | 8.x | 의존성 관리 |

### 1.2 의존성 설치

```bash
# 프로젝트 초기화
npm create vite@latest priority-metrix-web -- --template react-ts
cd priority-metrix-web

# Tailwind CSS 설치
npm install -D tailwindcss@latest postcss autoprefixer
npx tailwindcss init -p

# shadcn/ui 초기화
npx shadcn@latest init

# 필수 shadcn/ui 컴포넌트 설치
npx shadcn@latest add button card dialog input label textarea toast

# Animate UI 설치
npx shadcn@latest add @animate-ui/primitives-effects-effect
npx shadcn@latest add @animate-ui/primitives-effects-effects

# 상태 관리 및 기능 라이브러리
npm install zustand @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities clsx tailwind-merge lucide-react date-fns
```

---

## 2. 디자인 시스템 (Trello 벤치마킹)

### 2.1 색상 팔레트 (Trello/Atlassian 기반)

```typescript
// src/lib/colors.ts

export const colors = {
  // Primary Colors
  primary: {
    blue: '#0079BF',      // Trello Blue
    navy: '#0C3953',      // Dark Navy
  },
  
  // Background Colors
  background: {
    light: '#F4F5F7',     // Light Gray Background
    card: '#FFFFFF',      // White Card
    dark: '#222222',      // Dark Background
  },
  
  // Semantic Colors
  success: '#61BD4F',    // Green
  warning: '#F2D600',    // Yellow
  danger: '#EB5A46',     // Red
  
  // Text Colors
  text: {
    primary: '#172B4D',   // Charcoal
    secondary: '#6B778C', // Gray
    inverse: '#FFFFFF',   // White
  },
  
  // Quadrant Colors (Trello Style)
  quadrant: {
    DO: {
      bg: '#FFE2E2',
      text: '#8B0000',
      accent: '#EB5A46',
    },
    PLAN: {
      bg: '#E6F4EA',
      text: '#1E7E34',
      accent: '#61BD4F',
    },
    DELEGATE: {
      bg: '#E3F2FD',
      text: '#0D47A1',
      accent: '#0079BF',
    },
    DELETE: {
      bg: '#F5F5F5',
      text: '#616161',
      accent: '#9E9E9E',
    },
  },
};
```

### 2.2 Tailwind 색상 설정 (tailwind.config.js)

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Trello Colors
        trello: {
          blue: '#0079BF',
          navy: '#0C3953',
          light: '#F4F5F7',
          success: '#61BD4F',
          warning: '#F2D600',
          danger: '#EB5A46',
          charcoal: '#172B4D',
          gray: '#6B778C',
        },
        // Quadrant Colors
        quadrant: {
          do: {
            bg: 'rgb(255, 226, 226)',
            text: 'rgb(139, 0, 0)',
            accent: '#EB5A46',
          },
          plan: {
            bg: 'rgb(230, 244, 234)',
            text: 'rgb(30, 126, 52)',
            accent: '#61BD4F',
          },
          delegate: {
            bg: 'rgb(227, 242, 253)',
            text: 'rgb(13, 71, 161)',
            accent: '#0079BF',
          },
          delete: {
            bg: 'rgb(245, 245, 245)',
            text: 'rgb(97, 97, 97)',
            accent: '#9E9E9E',
          },
        },
      },
      boxShadow: {
        // Trello-style shadows
        'trello-card': '0 1px 0 rgba(9, 30, 66, 0.25)',
        'trello-card-hover': '0 4px 8px rgba(9, 30, 66, 0.25)',
        'trello-drag': '0 8px 16px rgba(9, 30, 66, 0.3)',
      },
      borderRadius: {
        'trello': '8px',
      },
      transitionTimingFunction: {
        'trello': 'ease',
        'trello-spring': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      transitionDuration: {
        'trello': '200ms',
      },
    },
  },
  plugins: [],
};
```

### 2.3 Trello 스타일 카드 컴포넌트

```typescript
// src/components/ui/trello-card.tsx
import React from 'react';
import { cn } from '@/lib/utils';

interface TrelloCardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  draggable?: boolean;
}

export function TrelloCard({ 
  children, 
  className, 
  hoverable = true,
  draggable = false 
}: TrelloCardProps) {
  return (
    <div
      className={cn(
        // Base styles (Trello style)
        'bg-white rounded-trello shadow-trello',
        'transition-all duration-trello ease-trello',
        // Hover effects
        hoverable && 'hover:bg-gray-50 hover:shadow-trello-card-hover',
        // Active/click effect
        'active:scale-[0.98] active:duration-75',
        // Draggable styles
        draggable && 'cursor-grab active:cursor-grabbing',
        className
      )}
    >
      {children}
    </div>
  );
}
```

---

## 3. 프로젝트 구조 (MVP)

```
priority-metrix-web/
├── public/
│   ├── favicon.ico
│   └── manifest.json
├── src/
│   ├── components/
│   │   ├── ui/                       # shadcn/ui 기본 컴포넌트
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx              # Trello 스타일 카드
│   │   │   ├── dialog.tsx
│   │   │   ├── input.tsx
│   │   │   ├── textarea.tsx
│   │   │   └── toast.tsx
│   │   ├── animations/               # Animate UI 애니메이션
│   │   │   └── AnimatedWrapper.tsx
│   │   ├── matrix/                   # 매트릭스 관련
│   │   │   ├── EisenhowerMatrix.tsx
│   │   │   ├── Quadrant.tsx
│   │   │   └── QuadrantHeader.tsx
│   │   ├── tasks/                    # 작업 관련
│   │   │   ├── TaskCard.tsx          # Trello 스타일 작업 카드
│   │   │   ├── TaskForm.tsx
│   │   │   └── TaskList.tsx
│   │   ├── layout/                   # 레이아웃
│   │   │   ├── Header.tsx
│   │   │   └── Layout.tsx
│   │   └── common/                   # 공통
│   │       └── Modal.tsx
│   ├── hooks/
│   │   ├── useLocalStorage.ts
│   │   └── useTaskStore.ts
│   ├── lib/
│   │   ├── utils.ts
│   │   ├── constants.ts
│   │   └── colors.ts                 # 색상 팔레트
│   ├── store/
│   │   └── taskStore.ts
│   ├── types/
│   │   └── task.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── index.html
├── package.json
├── pnpm-lock.yaml
├── tailwind.config.js                # Tailwind 설정 (Trello 색상)
├── tsconfig.json
├── vite.config.ts
└── components.json
```

---

## 4. 데이터 모델 (MVP)

### 4.1 타입 정의 (src/types/task.ts)

```typescript
export type QuadrantType = 'DO' | 'PLAN' | 'DELEGATE' | 'DELETE';
export type TaskPriority = 'high' | 'medium' | 'low' | 'none';
export type ColorTag = 'green' | 'yellow' | 'blue' | 'red';

export interface Task {
  id: string;
  title: string;
  description?: string;
  quadrant: QuadrantType;
  priority: TaskPriority;
  colorTag?: ColorTag;
  dueDate?: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TaskFormData {
  title: string;
  description?: string;
  quadrant: QuadrantType;
  priority?: TaskPriority;
  dueDate?: string;
}
```

---

## 5. 상태 관리 (MVP)

### 5.1 Zustand 스토어 (src/store/taskStore.ts)

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Task, QuadrantType } from '@/types/task';
import { generateId } from '@/lib/utils';

interface TaskState {
  tasks: Task[];
  
  // Actions
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'completed'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  moveTask: (id: string, quadrant: QuadrantType) => void;
  toggleComplete: (id: string) => void;
  clearAllTasks: () => void;
  
  // Getters
  getTasksByQuadrant: (quadrant: QuadrantType) => Task[];
  getTaskStats: () => Record<QuadrantType, number>;
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],
      
      addTask: (taskData) => set((state) => ({
        tasks: [
          ...state.tasks,
          {
            ...taskData,
            id: generateId(),
            completed: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          } as Task,
        ],
      })),
      
      updateTask: (id, updates) => set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === id
            ? { ...task, ...updates, updatedAt: new Date().toISOString() }
            : task
        ),
      })),
      
      deleteTask: (id) => set((state) => ({
        tasks: state.tasks.filter((task) => task.id !== id),
      })),
      
      moveTask: (id, quadrant) => set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === id
            ? { ...task, quadrant, updatedAt: new Date().toISOString() }
            : task
        ),
      })),
      
      toggleComplete: (id) => set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === id
            ? { ...task, completed: !task.completed, updatedAt: new Date().toISOString() }
            : task
        ),
      })),
      
      clearAllTasks: () => set({ tasks: [] }),
      
      getTasksByQuadrant: (quadrant) => {
        return get().tasks.filter((task) => task.quadrant === quadrant);
      },
      
      getTaskStats: () => {
        const tasks = get().tasks;
        return {
          DO: tasks.filter((t) => t.quadrant === 'DO').length,
          PLAN: tasks.filter((t) => t.quadrant === 'PLAN').length,
          DELEGATE: tasks.filter((t) => t.quadrant === 'DELEGATE').length,
          DELETE: tasks.filter((t) => t.quadrant === 'DELETE').length,
        };
      },
    }),
    {
      name: 'priority-metrix-storage',
    }
  )
);
```

---

## 6. Animate UI 애니메이션 (MVP)

### 6.1 애니메이션 래퍼 컴포넌트 (src/components/animations/AnimatedWrapper.tsx)

```typescript
'use client';

import { Effect, Effects } from '@/components/animate-ui/primitives/effects/effect';

interface AnimatedWrapperProps {
  children: React.ReactNode;
  variant?: 'fade' | 'slide' | 'zoom' | 'blur';
  direction?: 'up' | 'down' | 'left' | 'right';
  delay?: number;
  className?: string;
}

export function AnimatedWrapper({ 
  children, 
  variant = 'slide', 
  direction = 'up',
  delay = 0,
  className = '' 
}: AnimatedWrapperProps) {
  const directionMap = {
    up: { offset: 20 },
    down: { offset: -20 },
    left: { offset: 20 },
    right: { offset: -20 },
  };

  const animationProps = {
    fade: { fade: true },
    slide: { slide: { direction, offset: directionMap[direction].offset } },
    zoom: { zoom: { initialScale: 0.8, scale: 1 } },
    blur: { blur: { initialBlur: 20, blur: 0 }, fade: true },
  };

  return (
    <Effect
      {...animationProps}
      inView
      inViewOnce
      delay={delay}
      className={className}
    >
      {children}
    </Effect>
  );
}

interface StaggeredListProps {
  children: React.ReactNode[];
  className?: string;
}

export function StaggeredList({ children, className = '' }: StaggeredListProps) {
  return (
    <Effects
      slide={{ direction: 'up', offset: 20 }}
      fade
      zoom={{ initialScale: 0.9, scale: 1 }}
      holdDelay={100}
      inView
      inViewOnce
      className={className}
    >
      {children}
    </Effects>
  );
}
```

---

## 7. 핵심 컴포넌트 (MVP)

### 7.1 Trello 스타일 TaskCard (src/components/tasks/TaskCard.tsx)

```typescript
'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, Flag, Edit2, Trash2, CheckCircle2, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TrelloCard } from '@/components/ui/trello-card';
import type { Task } from '@/types/task';
import { formatDate } from '@/lib/utils';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onToggleComplete: (id: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ 
  task, 
  onEdit, 
  onDelete, 
  onToggleComplete 
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Trello-style priority colors
  const priorityColors = {
    high: 'text-[#EB5A46]',   // Trello Red
    medium: 'text-[#F2D600]', // Trello Yellow
    low: 'text-[#61BD4F]',    // Trello Green
    none: 'text-[#9E9E9E]',   // Gray
  };

  const colorTagColors = {
    green: 'border-l-[#61BD4F]',
    yellow: 'border-l-[#F2D600]',
    blue: 'border-l-[#0079BF]',
    red: 'border-l-[#EB5A46]',
  };

  return (
    <TrelloCard
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      draggable
      className={`
        ${colorTagColors[task.colorTag || 'blue']}
        ${isDragging ? 'shadow-trello-drag opacity-50' : ''}
        mb-3 p-4 border-l-4
      `}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-3 flex-1">
          <button
            onClick={() => onToggleComplete(task.id)}
            className="mt-0.5 text-[#9E9E9E] hover:text-[#61BD4F] transition-colors duration-200"
          >
            {task.completed ? (
              <CheckCircle2 className="w-5 h-5 text-[#61BD4F]" />
            ) : (
              <Circle className="w-5 h-5" />
            )}
          </button>
          <div className="flex-1 min-w-0">
            <h4 className={`font-medium text-[#172B4D] ${
              task.completed ? 'line-through text-[#97A0AF]' : ''
            }`}>
              {task.title}
            </h4>
            {task.description && (
              <p className="text-sm text-[#6B778C] mt-1 line-clamp-2">
                {task.description}
              </p>
            )}
          </div>
        </div>
        <Flag className={`w-4 h-4 ${priorityColors[task.priority]}`} />
      </div>

      {task.dueDate && (
        <div className="flex items-center gap-1 mt-3 text-xs text-[#6B778C]">
          <Calendar className="w-3.5 h-3.5" />
          <span>{formatDate(task.dueDate)}</span>
        </div>
      )}

      <div className="flex justify-end gap-1 mt-3 pt-3 border-t border-[#DFE1E6]">
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(task);
          }}
          className="h-8 w-8 p-0 text-[#6B778C] hover:text-[#0079BF] hover:bg-[#E6F2FF]"
        >
          <Edit2 className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(task.id);
          }}
          className="h-8 w-8 p-0 text-[#6B778C] hover:text-[#EB5A46] hover:bg-[#FFEBE6]"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </TrelloCard>
  );
};
```

### 7.2 EisenhowerMatrix (src/components/matrix/EisenhowerMatrix.tsx)

```typescript
'use client';

import React from 'react';
import { useTaskStore } from '@/store/taskStore';
import { Quadrant } from './Quadrant';
import { AnimatedWrapper } from '@/components/animations/AnimatedWrapper';
import type { QuadrantType } from '@/types/task';

// Trello-style quadrant configuration
const QUADRANT_CONFIG: Record<QuadrantType, { 
  title: string; 
  subtitle: string; 
  color: string;
  bgColor: string;
  borderColor: string;
}> = {
  DO: {
    title: '해야 할 일',
    subtitle: 'Urgent & Important',
    color: 'text-[#8B0000]',
    bgColor: 'bg-[#FFE2E2]',
    borderColor: 'border-[#EB5A46]',
  },
  PLAN: {
    title: '계획해야 할 일',
    subtitle: 'Not Urgent & Important',
    color: 'text-[#1E7E34]',
    bgColor: 'bg-[#E6F4EA]',
    borderColor: 'border-[#61BD4F]',
  },
  DELEGATE: {
    title: '위임할 일',
    subtitle: 'Urgent & Not Important',
    color: 'text-[#0D47A1]',
    bgColor: 'bg-[#E3F2FD]',
    borderColor: 'border-[#0079BF]',
  },
  DELETE: {
    title: '삭제할 일',
    subtitle: 'Not Urgent & Not Important',
    color: 'text-[#616161]',
    bgColor: 'bg-[#F5F5F5]',
    borderColor: 'border-[#9E9E9E]',
  },
};

export const EisenhowerMatrix: React.FC = () => {
  const { getTasksByQuadrant } = useTaskStore();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
      {(['DO', 'PLAN', 'DELEGATE', 'DELETE'] as QuadrantType[]).map((quadrant, index) => {
        const config = QUADRANT_CONFIG[quadrant];
        const tasks = getTasksByQuadrant(quadrant);

        return (
          <AnimatedWrapper
            key={quadrant}
            variant="slide"
            direction={index % 2 === 0 ? 'right' : 'left'}
            delay={index * 100}
          >
            <Quadrant
              type={quadrant}
              config={config}
              tasks={tasks}
            />
          </AnimatedWrapper>
        );
      })}
    </div>
  );
};
```

---

## 8. 유틸리티 함수 (MVP)

### 8.1 src/lib/utils.ts

```typescript
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(): string {
  return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function formatDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatRelativeDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  const today = new Date();
  const diffTime = date.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return '오늘';
  if (diffDays === 1) return '내일';
  if (diffDays === -1) return '어제';
  if (diffDays > 0 && diffDays <= 7) return `${diffDays}일 후`;
  if (diffDays < 0 && diffDays >= -7) return `${Math.abs(diffDays)}일 전`;
  
  return formatDate(dateString);
}
```

---

## 9. 메인 앱 컴포넌트 (MVP)

### 9.1 App.tsx (Trello 스타일 헤더)

```typescript
'use client';

import React, { useState } from 'react';
import { useTaskStore } from '@/store/taskStore';
import { EisenhowerMatrix } from '@/components/matrix/EisenhowerMatrix';
import { TaskForm } from '@/components/tasks/TaskForm';
import { AnimatedWrapper } from '@/components/animations/AnimatedWrapper';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import type { TaskFormData, Task } from '@/types/task';

function App() {
  const { addTask, updateTask, deleteTask, toggleComplete } = useTaskStore();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleAddTask = (data: TaskFormData) => {
    addTask(data);
    setIsAddDialogOpen(false);
  };

  const handleEditTask = (data: TaskFormData) => {
    if (editingTask) {
      updateTask(editingTask.id, data);
      setEditingTask(null);
      setIsEditDialogOpen(false);
    }
  };

  const handleEditClick = (task: Task) => {
    setEditingTask(task);
    setIsEditDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F4F5F7]">
      {/* Trello-style Header */}
      <AnimatedWrapper variant="slide" direction="down">
        <header className="bg-white border-b border-[#DFE1E6] px-4 py-3 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Logo */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#0079BF] rounded flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9 14H7V7h3v10zm7-4h-3V7h3v6z"/>
                  </svg>
                </div>
                <h1 className="text-xl font-bold text-[#172B4D]">
                  Priority Metrix
                </h1>
              </div>
            </div>
            
            {/* Action Button - Trello Style */}
            <Button 
              onClick={() => setIsAddDialogOpen(true)}
              className="bg-[#0079BF] hover:bg-[#026AA7] text-white rounded-trello px-4 py-2 transition-colors duration-200"
            >
              <Plus className="w-4 h-4 mr-2" />
              작업 추가
            </Button>
          </div>
        </header>
      </AnimatedWrapper>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6">
        <EisenhowerMatrix />
      </main>

      {/* Dialogs */}
      <TaskForm
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSubmit={handleAddTask}
        mode="add"
      />

      {editingTask && (
        <TaskForm
          open={isEditDialogOpen}
          onOpenChange={(open) => {
            setIsEditDialogOpen(open);
            if (!open) setEditingTask(null);
          }}
          onSubmit={handleEditTask}
          initialData={{
            title: editingTask.title,
            description: editingTask.description,
            quadrant: editingTask.quadrant,
            priority: editingTask.priority,
            dueDate: editingTask.dueDate,
          }}
          mode="edit"
        />
      )}
    </div>
  );
}

export default App;
```

---

## 10. 기능 체크리스트 (MVP)

### 10.1 필수 기능

| 기능 | 상태 | 우선순위 |
|------|------|----------|
| 4분면 아이젠하워 매트릭스 UI | ✅ | P0 |
| Trello 스타일 카드 디자인 | ✅ | P0 |
| 작업 추가 (CRUD - Create) | ✅ | P0 |
| 작업 수정 (CRUD - Update) | ✅ | P0 |
| 작업 삭제 (CRUD - Delete) | ✅ | P0 |
| 작업 완료 토글 | ✅ | P0 |
| 작업 드래그 앤 드롭 이동 | ✅ | P0 |
| 로컬 스토리지 영속화 | ✅ | P0 |
| Animate UI 스태거 애니메이션 | ✅ | P0 |
| 반응형 레이아웃 | ✅ | P0 |
| 다크 모드 지원 | ✅ | P1 |
| 작업 우선순위 색상 표시 | ✅ | P1 |
| 마감일 표시 | ✅ | P1 |

### 10.2 Trello 디자인 요소

| 요소 | 구현 여부 | 설명 |
|------|----------|------|
| ✅ Trello Blue (#0079BF) | 액션 버튼, 하이라이트 |
| ✅ 8px border-radius | 모든 카드와 버튼 |
| ✅ Trello-style shadows | 기본/호버/드래그 상태 |
| ✅ 깔끔한 흰색 카드 | 작업 카드 디자인 |
| ✅ 부드러운 전환 (0.2s ease) | 모든 인터랙션 |
| ✅ Hover 효과 | 그림자 증가, 색상 변화 |

---

## 11. 승인

| 역할 | 이름 | 날짜 | 서명 |
|------|------|------|------|
| Tech Lead | TBD | TBD | _____________ |
| Developer | TBD | TBD | _____________ |

---

**문서 작성일**: 2026년 1월 10일  
**문서 버전**: 1.0.0 (MVP)  
**문서 상태**: 초안 (Draft)  
**디자인 벤치마킹**: Trello Design System (https://design.trello.com/)
