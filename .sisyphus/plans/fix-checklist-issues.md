# Work Plan: Fix TaskFormDialog Checklist Issues

## Metadata
- **Created**: 2026-01-11
- **Status**: Ready for Implementation
- **Priority**: High (User-facing bug)
- **Estimated Time**: 30-45 minutes
- **Complexity**: Low (well-documented fix)

---

## Problem Summary

### Issues Identified
1. **Checkbox Toggle Not Working**: `form.getValues()` doesn't trigger re-renders, so UI doesn't update when checkbox is clicked
2. **Design Inconsistency**: Checklist items don't follow Trello design system specs

### Root Cause
- `form.getValues()` reads snapshot values without subscription → no re-render on change
- `form.setValue()` notifies subscribers → components using `watch()` update
- Design misaligned with `DESIGN_SYSTEM.md` specifications

---

## Technical Context

### Current Implementation
- **File**: `src/components/tasks/TaskFormDialog.tsx`
- **Lines**: 106-109 (useFieldArray), 403-459 (checklist rendering)
- **Form Library**: React Hook Form v7.70.0
- **State Management**: Zustand (localStorage persistence)

### React Hook Form Methods Comparison

| Method | Purpose | Triggers Re-render | Use Case |
|--------|---------|-------------------|----------|
| `getValues()` | Read current value snapshot | ❌ No | Event handlers, validation logic |
| `watch()` | Subscribe to value changes | ✅ Yes | UI display, conditional styling |
| `setValue()` | Update form value | Only notifies subscribers | Setting values from user input |

### Design System Specifications (from `DESIGN_SYSTEM.md`)

| Element | Current | Required | Tailwind |
|---------|---------|----------|----------|
| Checkbox size | `w-4 h-4` (16px) | `w-5 h-5` (20px) | Touch-friendly |
| Checkbox radius | `rounded` (4px) | `rounded-sm` (2px) | Sharper corners |
| Checkbox border | `border` (1px) | `border-2` (2px) | Better visibility |
| Container bg | `bg-[#FAFBFC]` | `bg-white` | Card style |
| Container shadow | None | `shadow-sm hover:shadow-md` | Trello card effect |
| Hover effect | Limited | Full hover states | Interactive feel |

---

## Implementation Plan

### Phase 1: Fix React Hook Form State Subscription

**Objective**: Replace `getValues()` with `watch()` for reactive UI updates

#### Step 1.1: Add checklist watch subscription
- **Location**: `src/components/tasks/TaskFormDialog.tsx`
- **Line**: After `useFieldArray` hook (after line 109)
- **Action**: Add `const watchedChecklist = form.watch('checklist');`

**Code change**:
```typescript
// Around line 109, after useFieldArray
const { fields, append, remove } = useFieldArray({
  control: form.control,
  name: 'checklist',
});

// ADD THIS LINE
const watchedChecklist = form.watch('checklist');
```

#### Step 1.2: Update checkbox button className
- **Location**: Lines 416-422
- **Action**: Replace `form.getValues()` with `watchedChecklist?.[index]?.completed`, update styles

**Before**:
```tsx
className={cn(
  'flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center',
  'transition-colors duration-200',
  form.getValues(`checklist.${index}.completed`)
    ? 'bg-[#61BD4F] border-[#61BD4F] text-white'
    : 'border-[#DFE1E6] hover:border-[#0079BF]'
)}
```

**After**:
```tsx
className={cn(
  'flex-shrink-0 w-5 h-5 rounded-sm border-2 flex items-center justify-center',
  'transition-all duration-200 cursor-pointer',
  watchedChecklist?.[index]?.completed
    ? 'bg-[#61BD4F] border-[#61BD4F] text-white'
    : 'border-[#DFE1E6] hover:border-[#0079BF] hover:bg-[#F4F5F7]'
)}
```

#### Step 1.3: Update checkbox onClick handler
- **Location**: Lines 423-431
- **Action**: Use `watchedChecklist` with null coalescing

**Before**:
```tsx
onClick={() => {
  const current = form.getValues(`checklist.${index}.completed`);
  form.setValue(`checklist.${index}.completed`, !current);
}}
```

**After**:
```tsx
onClick={() => {
  const current = watchedChecklist?.[index]?.completed ?? false;
  form.setValue(`checklist.${index}.completed`, !current);
}}
```

#### Step 1.4: Update check icon display condition
- **Location**: Lines 433-435
- **Action**: Use `watchedChecklist` and adjust icon size

**Before**:
```tsx
{form.getValues(`checklist.${index}.completed`) && (
  <Check className="w-3 h-3" />
)}
```

**After**:
```tsx
{watchedChecklist?.[index]?.completed && (
  <Check className="w-3.5 h-3.5" />
)}
```

#### Step 1.5: Update input field completed styling
- **Location**: Lines 445-447
- **Action**: Use `watchedChecklist` for strikethrough condition

**Before**:
```tsx
form.getValues(`checklist.${index}.completed`) &&
  'line-through text-[#6B778C]'
```

**After**:
```tsx
watchedChecklist?.[index]?.completed &&
  'line-through text-[#6B778C]'
```

---

### Phase 2: Apply Trello Design System

#### Step 2.1: Update checklist item container
- **Location**: Lines 404-413
- **Action**: Apply Trello card styling with shadows and hover effects

**Before**:
```tsx
<div
  key={field.id}
  className={cn(
    'flex items-center gap-2',
    'px-3 py-2',
    'bg-[#FAFBFC] border border-[#DFE1E6] rounded',
    'transition-all duration-200',
    'focus-within:bg-white focus-within:border-[#0079BF] focus-within:ring-2 focus-within:ring-[#0079BF]/20'
  )}
>
```

**After**:
```tsx
<div
  key={field.id}
  className={cn(
    'flex items-center gap-3',
    'px-3 py-2.5',
    'bg-white border border-[#DFE1E6] rounded-lg',
    'shadow-sm hover:shadow-md',
    'transition-all duration-200',
    'focus-within:border-[#0079BF] focus-within:ring-2 focus-within:ring-[#0079BF]/20',
    watchedChecklist?.[index]?.completed && 'bg-[#F4F5F7] opacity-75'
  )}
>
```

**Design Changes**:
- `gap-2` → `gap-3` (more spacing)
- `py-2` → `py-2.5` (vertical padding)
- `bg-[#FAFBFC]` → `bg-white` (card background)
- `rounded` → `rounded-lg` (8px radius per design system)
- Added `shadow-sm hover:shadow-md` (Trello card shadows)
- Added `watchedChecklist?.[index]?.completed && 'bg-[#F4F5F7] opacity-75'` (completed state styling)

---

## Verification Plan

### Manual Testing (No test infrastructure available)

#### Test 1: Checkbox Toggle Functionality
1. Run `npm run dev`
2. Click "작업 추가" (Add Task) button
3. Click "항목 추가" (Add Item) button to create checklist item
4. Click checkbox button
5. **Expected**:
   - ✓ Check icon appears
   - Background changes to green `#61BD4F`
   - Text has strikethrough
   - Input color changes to gray `#6B778C`
6. Click checkbox again
7. **Expected**:
   - ✓ Check icon disappears
   - Background returns to white
   - Strikethrough removed
   - Text color returns to `#172B4D`

#### Test 2: Multiple Checklist Items
1. Add 3-4 checklist items
2. Check/uncheck different items
3. **Expected**:
   - Each checkbox toggles independently
   - States don't interfere with each other
   - All items update correctly

#### Test 3: Form Persistence
1. Create task with checked items
2. Submit form (click "추가")
3. Open the task again (edit mode)
4. **Expected**:
   - Checklist items present
   - Checked states preserved

#### Test 4: Visual Design Validation
1. Hover over checklist item container
2. **Expected**:
   - Shadow increases (`shadow-sm` → `shadow-md`)
3. Hover over unchecked checkbox
4. **Expected**:
   - Border color changes to `#0079BF`
   - Background changes to `#F4F5F7`

#### Test 5: Keyboard Navigation
1. Type in checklist item input
2. Press Enter
3. **Expected**:
   - New checklist item created
   - Focus moves to new input
4. Press Backspace in empty input
5. **Expected**:
   - Empty item removed

---

## Implementation Checklist

- [ ] **Phase 1.1**: Add `watchedChecklist` variable after `useFieldArray`
- [ ] **Phase 1.2**: Update checkbox button className (lines 416-422)
- [ ] **Phase 1.3**: Update checkbox onClick handler (lines 423-431)
- [ ] **Phase 1.4**: Update check icon condition (lines 433-435)
- [ ] **Phase 1.5**: Update input field styling condition (lines 445-447)
- [ ] **Phase 2.1**: Update checklist item container (lines 404-413)
- [ ] **Verification**: Run `npm run dev` and complete all manual tests
- [ ] **Verification**: Run `npm run lint` to ensure no lint errors
- [ ] **Verification**: Run `npm run build` to ensure TypeScript compilation passes

---

## Success Criteria

### Functional
- [ ] Clicking checkbox immediately shows visual feedback (checkmark, color change)
- [ ] Toggling checkbox updates form state correctly
- [ ] Form submission preserves checklist completion states
- [ ] Keyboard shortcuts (Enter, Backspace) work correctly

### Design
- [ ] Checklist items match Trello design system specs
- [ ] Checkbox size is `w-5 h-5` (20px)
- [ ] Checkbox radius is `rounded-sm` (2px)
- [ ] Container has shadow with hover effect
- [ ] Completed items have grayed-out appearance

### Code Quality
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] Code follows existing patterns in codebase
- [ ] Changes are minimal and focused

---

## Risk Assessment

### Low Risk
- **Well-documented fix**: Issue document provides exact code changes
- **No breaking changes**: Only affects checklist UI, not data model
- **Local scope**: Changes confined to single component

### Mitigation
- Manual testing before commit
- Run lint and build to catch TypeScript errors
- Keep changes minimal (only what's documented)

---

## Additional Notes

### Performance Considerations
- `form.watch('checklist')` subscribes to entire checklist array
- For large checklists (10+ items), consider watching individual items
- Current implementation is acceptable given constraint (max 10 tasks per quadrant, typical checklist < 10 items)

### Future Improvements
- Add test infrastructure (Vitest + React Testing Library)
- Create reusable `ChecklistItem` component
- Implement drag-and-drop reordering for checklist items

---

## References

- [TaskFormDialog Source](src/components/tasks/TaskFormDialog.tsx)
- [Issue Document](docs/tasks/CHECKLIST_FIX.md)
- [Design System](DESIGN_SYSTEM.md)
- [React Hook Form - watch()](https://react-hook-form.com/docs/useform/watch)
- [React Hook Form - useFieldArray](https://react-hook-form.com/docs/usefieldarray)

---

## Next Steps

After implementation:
1. Run verification tests
2. Document any edge cases discovered
3. Consider adding test coverage if time permits
