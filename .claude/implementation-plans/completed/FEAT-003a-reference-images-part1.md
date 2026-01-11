# FEAT-003a: Reference Images - Part 1 (Dependencies & Components)

**Status**: completed
**Created**: 2026-01-10
**Priority**: high
**Parent Plan**: FEAT-003-reference-images.md

## Overview

Part 1 of Reference Images implementation: Set up dependencies, types, hook, and UI components.

## Phases Included

- Phase 1: Dependencies & Types
- Phase 2: Reference Hook
- Phase 3: Reference Components

## Pre-Implementation Context

**State Management Pattern**: React hooks with `useState`, NOT Zustand
**Component Pattern**: Tailwind CSS with dark theme (gray-800, blue-400), `group` for hover
**Layout**: Resizable panels with localStorage persistence

## Phase 1: Dependencies & Types

**Goal**: Set up plugin dependencies and type definitions

### Steps

1. [ ] Add `@tauri-apps/plugin-dialog` to package.json:
   ```bash
   cd offers-studio && npm install @tauri-apps/plugin-dialog
   ```

2. [ ] Add `tauri-plugin-dialog` to Cargo.toml:
   ```toml
   [dependencies]
   tauri-plugin-dialog = "2"
   ```

3. [ ] Register plugin in `src-tauri/src/lib.rs`:
   ```rust
   .plugin(tauri_plugin_dialog::init())
   ```

4. [ ] Add dialog permissions to `capabilities/default.json`:
   ```json
   "dialog:default",
   "dialog:allow-open"
   ```

5. [ ] Add ReferenceImage type to `src/lib/types.ts`:
   ```typescript
   export interface ReferenceImage {
     id: string;
     path: string;
     filename: string;
     thumbnailUrl?: string;
   }

   export interface ReferenceBarState {
     references: ReferenceImage[];
     maxReferences: number;
   }
   ```

### Validation
- [ ] `npm install` completes without errors
- [ ] `cargo check` passes in src-tauri/
- [ ] TypeScript compiles with new types

---

## Phase 2: Reference Hook

**Goal**: Create state management hook for reference images

### Steps

1. [ ] Create `src/hooks/useReferenceBar.ts` with the following implementation:
   - useState for references array
   - addReference function (with limit check and duplicate prevention)
   - removeReference function
   - clearReferences function
   - getReferencePaths function
   - canAddMore computed value
   - MAX_REFERENCES = 14

### Validation
- [ ] Hook exports correctly
- [ ] TypeScript compiles without errors
- [ ] Can import from components

---

## Phase 3: Reference Components

**Goal**: Create UI components for reference bar

### Steps

1. [ ] Create `src/components/reference-bar/ReferenceItem.tsx`:
   - Display thumbnail image (h-12 w-12)
   - Hover remove button (X icon, red background)
   - Group hover state for remove visibility

2. [ ] Create `src/components/reference-bar/ReferenceBar.tsx`:
   - Accept props: references, maxReferences, canAddMore, onAdd, onRemove, onClear
   - File picker using `@tauri-apps/plugin-dialog` open()
   - Drop handler for internal drag-drop (text/image-path)
   - Layout: label | thumbnails | actions (add/clear/count)

3. [ ] Create index export `src/components/reference-bar/index.ts`

### Validation
- [ ] Components render without errors
- [ ] Styling matches existing gallery theme
- [ ] File picker opens native dialog

---

## Validation Criteria (Part 1)

- [ ] All Phase 1-3 steps completed
- [ ] TypeScript compiles without errors
- [ ] Hook can be imported and used
- [ ] Components can be imported
- [ ] `cargo check` passes
- [ ] `npm run build` succeeds (or no build errors)

## Next Part

After completing Part 1, run:
```
/implement FEAT-003b-reference-images-part2.md
```

Part 2 includes:
- Phase 4: Gallery Drag Source
- Phase 5: Layout Integration
- Phase 6: External File Drop
- Phase 7: Testing & Polish

## Implementation Log

### Session 1 - 2026-01-10

**Completed**:
- Phase 1: Dependencies & Types
  - Installed @tauri-apps/plugin-dialog npm package (v2)
  - Added tauri-plugin-dialog to Cargo.toml
  - Registered plugin in src-tauri/src/lib.rs
  - Added dialog permissions (dialog:default, dialog:allow-open) to capabilities/default.json
  - Added ReferenceImage and ReferenceBarState types to src/lib/types.ts
  - Validated: cargo check passed, TypeScript compilation successful

- Phase 2: Reference Hook
  - Created src/hooks/useReferenceBar.ts with full state management
  - Implemented addReference with limit checking (MAX_REFERENCES = 14) and duplicate prevention
  - Implemented removeReference, clearReferences, getReferencePaths functions
  - Added canAddMore computed property
  - Validated: TypeScript compilation successful, hook exports correctly

- Phase 3: Reference Components
  - Created src/components/reference-bar/ directory
  - Implemented ReferenceItem.tsx with thumbnail display and hover remove button
  - Implemented ReferenceBar.tsx with:
    - File picker integration using @tauri-apps/plugin-dialog open()
    - Drag-drop handler for internal drag from gallery (text/image-path)
    - Visual feedback for drag states
    - Layout: label | drop zone with thumbnails | actions (count/add/clear)
  - Created index.ts export file
  - Validated: TypeScript compilation successful, npm run build successful

**Validation Results**:
- ✓ All Phase 1-3 steps completed
- ✓ TypeScript compiles without errors (npx tsc --noEmit)
- ✓ Hook can be imported and used
- ✓ Components can be imported
- ✓ cargo check passes (1.15s)
- ✓ npm run build succeeds (1.27s, 602KB bundle)

**Issues Encountered**:
- None. All phases completed successfully without errors.

**Files Created/Modified**:
- package.json (added @tauri-apps/plugin-dialog)
- src-tauri/Cargo.toml (added tauri-plugin-dialog)
- src-tauri/src/lib.rs (registered dialog plugin)
- src-tauri/capabilities/default.json (added dialog permissions)
- src/lib/types.ts (added ReferenceImage, ReferenceBarState interfaces)
- src/hooks/useReferenceBar.ts (new file - state management hook)
- src/components/reference-bar/ReferenceItem.tsx (new file)
- src/components/reference-bar/ReferenceBar.tsx (new file)
- src/components/reference-bar/index.ts (new file)
