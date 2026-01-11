# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Priority Metrix is an Eisenhower Matrix task management web application. Tasks are organized across 4 quadrants based on urgency/importance: DO, PLAN, DELEGATE, DELETE. The UI is entirely in Korean.

## Development Commands

```bash
npm run dev      # Start Vite dev server with HMR
npm run build    # TypeScript compile + Vite build
npm run lint     # ESLint check
npm run preview  # Preview production build
```

## Tech Stack

- **React 19** with TypeScript
- **Vite** for build tooling
- **Zustand** for state management (with localStorage persistence)
- **@dnd-kit** for drag-and-drop
- **shadcn/ui** (Radix UI + Tailwind CSS) for components
- **TipTap** for rich text editing
- **React Hook Form + Zod** for form handling/validation
- **Lucide React** for icons

## Architecture

### State Management
Single Zustand store at `src/store/taskStore.ts` manages all task state. Data persists to localStorage under key `priority-metrix-storage`. No backend API.

Key store methods:
- `addTask`, `updateTask`, `deleteTask`, `moveTask`, `reorderTasks`, `toggleComplete`
- `getTasksByQuadrant(quadrant)` - returns sorted tasks for a quadrant

### Component Hierarchy
```
App.tsx
└── EisenhowerMatrix.tsx (orchestrates DndContext + manages edit/delete dialogs)
    ├── Quadrant.tsx × 4 (droppable zones with SortableContext)
    │   ├── TaskCard.tsx[] (sortable/draggable items)
    │   └── QuickAddForm.tsx (inline task creation)
    ├── TaskFormDialog.tsx (full edit modal)
    └── DeleteTaskDialog.tsx
```

### Type System
Core types in `src/types/task.ts`:
- `QuadrantType`: `'DO' | 'PLAN' | 'DELEGATE' | 'DELETE'`
- `TaskPriority`: `'high' | 'medium' | 'low' | 'none'`
- `Task`: Main task interface with id, title, description, quadrant, priority, dueDate, checklist, completed, order, timestamps

### Path Alias
`@/*` maps to `src/*` (configured in tsconfig and vite.config)

## Key Patterns

### Drag-and-Drop
Uses @dnd-kit with two operation types:
1. Cross-quadrant moves (changes task.quadrant)
2. Within-quadrant reordering (updates task.order)

### Form Validation
Zod schemas in `src/lib/validations/task.ts` with React Hook Form integration.

### Constraints
- Maximum 10 tasks per quadrant (enforced in UI)
- Title max 100 chars, description max 500 chars

## Design System

See `DESIGN_SYSTEM.md` for detailed specs. Key points:
- Trello-inspired design (colors, shadows, animations)
- 8px grid spacing system
- Quadrant-specific colors (DO=red tint, PLAN=green, DELEGATE=blue, DELETE=gray)
- Custom Tailwind theme with `trello-*` color palette and `shadow-trello-*` utilities
