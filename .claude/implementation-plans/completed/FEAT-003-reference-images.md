# FEAT-003: Offers Studio Phase 3 - Reference Images

**Status**: completed
**Created**: 2026-01-10
**Priority**: high
**Complexity**: medium

## Overview

Implement drag-and-drop reference images feature for Offers Studio, allowing users to guide AI image generation by providing style/composition references.

### Problem
Users need to generate consistent visual content (e.g., presentation slides) that match a specific style. Without reference images, each generation is independent with no style continuity.

### Solution
Add a Reference Bar component that:
1. Accepts images via drag-drop from gallery or desktop
2. Accepts images via file picker dialog
3. Displays selected references with remove capability
4. Enforces 14-image limit (Gemini API constraint)
5. Provides reference paths for image generation

## Pre-Implementation Analysis

### Existing Patterns Checked
- [x] Searched codebase for similar implementations
- [x] Checked knowledge-base/ for related issues
- [x] Reviewed completed plans for patterns

### Research Findings

**State Management Pattern (useGallery.ts)**:
- Project uses React hooks with `useState`, NOT Zustand
- Custom hooks return state + action functions
- No global state container

**Component Pattern (ImageCard.tsx)**:
- Tailwind CSS styling with dark theme (gray-800, blue-400)
- `group` class for hover states
- `aspect-square` for consistent sizing

**Layout Integration (AppLayout.tsx)**:
- Resizable panels with localStorage persistence
- Flex layout: Terminal (flex-1) | GalleryPanel (flex-none)
- Reference Bar fits naturally below terminal

**Relevant KB Entry**:
- `ui/scroll-propagation-sidebar.md` - Use `overflow-hidden` on scroll container parents

**Type System**:
- `ImageFile` type already has `metadata.reference_images` field
- Ready for reference image data

### Files to Modify

| File | Change Type | Description |
|------|-------------|-------------|
| `offers-studio/src/components/gallery/ImageCard.tsx` | modify | Add drag handlers |
| `offers-studio/src/components/layout/AppLayout.tsx` | modify | Integrate ReferenceBar |
| `offers-studio/src/lib/types.ts` | modify | Add ReferenceImage type |
| `offers-studio/package.json` | modify | Add @tauri-apps/plugin-dialog |
| `offers-studio/src-tauri/Cargo.toml` | modify | Add tauri-plugin-dialog |
| `offers-studio/src-tauri/src/lib.rs` | modify | Register dialog plugin |
| `offers-studio/src-tauri/capabilities/default.json` | modify | Add dialog permissions |

### Files to Create

| File | Purpose |
|------|---------|
| `offers-studio/src/hooks/useReferenceBar.ts` | Reference state management hook |
| `offers-studio/src/components/reference-bar/ReferenceBar.tsx` | Main container component |
| `offers-studio/src/components/reference-bar/ReferenceItem.tsx` | Individual reference thumbnail |
| `offers-studio/src/components/reference-bar/DropZone.tsx` | Visual drop indicator |

### Dependencies

**NPM Packages**:
- `@tauri-apps/plugin-dialog` - Native file picker

**Rust Crates**:
- `tauri-plugin-dialog` - Tauri dialog plugin

### Risks

1. **Drag-drop complexity**: HTML5 drag API can be finicky across platforms
2. **External file drops**: Tauri handles external drops differently than internal
3. **Path handling**: Reference paths must be within asset protocol scope
4. **State sync**: Reference bar state must be accessible to terminal for generation

## Implementation Phases

### Phase 1: Dependencies & Types

**Goal**: Set up plugin dependencies and type definitions

#### Steps

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

#### Validation
- [ ] `npm install` completes without errors
- [ ] `cargo check` passes in src-tauri/
- [ ] TypeScript compiles with new types

---

### Phase 2: Reference Hook

**Goal**: Create state management hook for reference images

#### Steps

1. [ ] Create `src/hooks/useReferenceBar.ts`:

```typescript
import { useState, useCallback, useMemo } from 'react';
import { convertFileSrc } from '@tauri-apps/api/core';
import type { ReferenceImage, ReferenceBarState } from '@/lib/types';

const MAX_REFERENCES = 14;

export function useReferenceBar() {
  const [references, setReferences] = useState<ReferenceImage[]>([]);

  const addReference = useCallback((path: string): boolean => {
    // Check limit
    if (references.length >= MAX_REFERENCES) {
      return false;
    }

    // Check duplicate
    if (references.some(r => r.path === path)) {
      return false;
    }

    const id = crypto.randomUUID();
    const filename = path.split('/').pop() || 'image';
    const thumbnailUrl = convertFileSrc(path);

    setReferences(prev => [...prev, { id, path, filename, thumbnailUrl }]);
    return true;
  }, [references.length]);

  const removeReference = useCallback((id: string) => {
    setReferences(prev => prev.filter(r => r.id !== id));
  }, []);

  const clearReferences = useCallback(() => {
    setReferences([]);
  }, []);

  const getReferencePaths = useCallback((): string[] => {
    return references.map(r => r.path);
  }, [references]);

  const canAddMore = useMemo(() =>
    references.length < MAX_REFERENCES,
    [references.length]
  );

  return {
    references,
    maxReferences: MAX_REFERENCES,
    canAddMore,
    addReference,
    removeReference,
    clearReferences,
    getReferencePaths,
  };
}
```

#### Validation
- [ ] Hook exports correctly
- [ ] TypeScript compiles without errors
- [ ] Can import from components

---

### Phase 3: Reference Components

**Goal**: Create UI components for reference bar

#### Steps

1. [ ] Create `src/components/reference-bar/ReferenceItem.tsx`:

```typescript
import { X } from 'lucide-react';
import type { ReferenceImage } from '@/lib/types';

interface ReferenceItemProps {
  reference: ReferenceImage;
  onRemove: () => void;
}

export function ReferenceItem({ reference, onRemove }: ReferenceItemProps) {
  return (
    <div className="group relative shrink-0">
      <img
        src={reference.thumbnailUrl}
        alt={reference.filename}
        className="h-12 w-12 rounded border border-gray-700 object-cover"
        title={reference.filename}
      />
      <button
        onClick={onRemove}
        className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 opacity-0 transition-opacity group-hover:opacity-100"
        title="Remove reference"
      >
        <X className="h-3 w-3 text-white" />
      </button>
    </div>
  );
}
```

2. [ ] Create `src/components/reference-bar/ReferenceBar.tsx`:

```typescript
import { Plus, Trash2 } from 'lucide-react';
import { open } from '@tauri-apps/plugin-dialog';
import { ReferenceItem } from './ReferenceItem';
import type { ReferenceImage } from '@/lib/types';

interface ReferenceBarProps {
  references: ReferenceImage[];
  maxReferences: number;
  canAddMore: boolean;
  onAdd: (path: string) => boolean;
  onRemove: (id: string) => void;
  onClear: () => void;
}

export function ReferenceBar({
  references,
  maxReferences,
  canAddMore,
  onAdd,
  onRemove,
  onClear,
}: ReferenceBarProps) {

  const handleAddFiles = async () => {
    const selected = await open({
      multiple: true,
      filters: [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'webp'] }],
    });

    if (selected) {
      const paths = Array.isArray(selected) ? selected : [selected];
      for (const path of paths) {
        if (typeof path === 'string') {
          onAdd(path);
        }
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const imagePath = e.dataTransfer.getData('text/image-path');
    if (imagePath) {
      onAdd(imagePath);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  return (
    <div
      className="flex items-center gap-2 border-t border-gray-800 bg-gray-900 px-3 py-2"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <span className="shrink-0 text-xs text-gray-400">References:</span>

      {/* Reference thumbnails */}
      <div className="flex flex-1 gap-1.5 overflow-x-auto">
        {references.map(ref => (
          <ReferenceItem
            key={ref.id}
            reference={ref}
            onRemove={() => onRemove(ref.id)}
          />
        ))}

        {references.length === 0 && (
          <span className="text-xs italic text-gray-500">
            Drag images here or click + to add
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-1">
        <button
          onClick={handleAddFiles}
          disabled={!canAddMore}
          className="rounded p-1.5 text-gray-400 hover:bg-gray-800 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          title="Add reference images"
        >
          <Plus className="h-4 w-4" />
        </button>

        {references.length > 0 && (
          <button
            onClick={onClear}
            className="rounded p-1.5 text-gray-400 hover:bg-gray-800 hover:text-red-400"
            title="Clear all references"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}

        <span className="ml-1 text-xs text-gray-500">
          ({references.length}/{maxReferences})
        </span>
      </div>
    </div>
  );
}
```

3. [ ] Create index export `src/components/reference-bar/index.ts`:

```typescript
export { ReferenceBar } from './ReferenceBar';
export { ReferenceItem } from './ReferenceItem';
```

#### Validation
- [ ] Components render without errors
- [ ] Styling matches existing gallery theme
- [ ] File picker opens native dialog

---

### Phase 4: Gallery Drag Source

**Goal**: Enable dragging images from gallery to reference bar

#### Steps

1. [ ] Update `src/components/gallery/ImageCard.tsx` to add drag handlers:

```typescript
// Add to ImageCard component
const handleDragStart = (e: React.DragEvent) => {
  e.dataTransfer.setData('text/image-path', image.path);
  e.dataTransfer.effectAllowed = 'copy';
};

// Add to the root div
<div
  className="group relative aspect-square cursor-pointer overflow-hidden rounded-lg bg-gray-800 transition-transform hover:scale-[1.02]"
  onClick={onClick}
  draggable
  onDragStart={handleDragStart}
>
```

2. [ ] Update `src/components/gallery/LatestPreview.tsx` similarly:

```typescript
// Add drag handlers to LatestPreview as well
const handleDragStart = (e: React.DragEvent) => {
  e.dataTransfer.setData('text/image-path', image.path);
  e.dataTransfer.effectAllowed = 'copy';
};
```

#### Validation
- [ ] Can drag ImageCard thumbnail
- [ ] Can drag LatestPreview image
- [ ] Drag cursor shows copy indicator

---

### Phase 5: Layout Integration

**Goal**: Integrate reference bar into app layout

#### Steps

1. [ ] Update `src/components/layout/AppLayout.tsx`:

```typescript
// Import at top
import { ReferenceBar } from '@/components/reference-bar';
import { useReferenceBar } from '@/hooks/useReferenceBar';

// Inside component, add hook
const {
  references,
  maxReferences,
  canAddMore,
  addReference,
  removeReference,
  clearReferences,
} = useReferenceBar();

// In JSX, add ReferenceBar below terminal section
<div className="flex flex-1 flex-col overflow-hidden">
  {/* Terminal */}
  <div className="flex-1 overflow-hidden">
    <Terminal onError={handleTerminalError} />
  </div>

  {/* Reference Bar */}
  <ReferenceBar
    references={references}
    maxReferences={maxReferences}
    canAddMore={canAddMore}
    onAdd={addReference}
    onRemove={removeReference}
    onClear={clearReferences}
  />
</div>
```

#### Validation
- [ ] Reference bar appears below terminal
- [ ] Layout maintains proper flex behavior
- [ ] No scroll propagation issues

---

### Phase 6: External File Drop

**Goal**: Support dragging files from desktop (Finder/Explorer)

#### Steps

1. [ ] Add Tauri file drop listener to AppLayout:

```typescript
import { listen } from '@tauri-apps/api/event';
import { useEffect } from 'react';

// Inside component
useEffect(() => {
  const unlisten = listen<{ paths: string[] }>('tauri://drag-drop', (event) => {
    const { paths } = event.payload;
    for (const path of paths) {
      // Only add image files
      const ext = path.split('.').pop()?.toLowerCase();
      if (['png', 'jpg', 'jpeg', 'webp'].includes(ext || '')) {
        addReference(path);
      }
    }
  });

  return () => {
    unlisten.then(fn => fn());
  };
}, [addReference]);
```

2. [ ] Add visual drop zone indicator (optional enhancement):

```typescript
// Track drag state
const [isDragging, setIsDragging] = useState(false);

// Listen for drag events
useEffect(() => {
  const handleDragEnter = () => setIsDragging(true);
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = () => setIsDragging(false);

  window.addEventListener('dragenter', handleDragEnter);
  window.addEventListener('dragleave', handleDragLeave);
  window.addEventListener('drop', handleDrop);

  return () => {
    window.removeEventListener('dragenter', handleDragEnter);
    window.removeEventListener('dragleave', handleDragLeave);
    window.removeEventListener('drop', handleDrop);
  };
}, []);

// Render drop zone overlay when dragging
{isDragging && (
  <div className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center bg-blue-500/10 border-2 border-dashed border-blue-500">
    <span className="text-lg text-blue-400">Drop images to add as references</span>
  </div>
)}
```

#### Validation
- [ ] Can drag image from Finder/Explorer
- [ ] Only image files are accepted
- [ ] Visual feedback during drag

---

### Phase 7: Testing & Polish

**Goal**: Comprehensive testing and UX polish

#### Steps

1. [ ] Test drag from gallery:
   - Drag ImageCard to reference bar
   - Drag LatestPreview to reference bar
   - Verify thumbnail appears
   - Verify path is correct

2. [ ] Test file picker:
   - Click + button
   - Select single file
   - Select multiple files
   - Verify all added

3. [ ] Test external drop:
   - Drag from Finder/Explorer
   - Single file
   - Multiple files
   - Non-image files (should be ignored)

4. [ ] Test limits:
   - Add 14 references
   - Verify + button disabled
   - Verify warning appears

5. [ ] Test removal:
   - Click X on reference
   - Click Clear All
   - Verify state updates

6. [ ] Test duplicate prevention:
   - Try adding same image twice
   - Should not duplicate

7. [ ] Visual polish:
   - Hover states
   - Transition animations
   - Scroll behavior for many references

#### Validation
- [ ] All test cases pass
- [ ] No console errors
- [ ] Smooth UX across all interactions

## Testing Strategy

- [ ] Fresh state: App launches with no references
- [ ] Drag from gallery: ImageCard → ReferenceBar works
- [ ] Drag latest: LatestPreview → ReferenceBar works
- [ ] File picker: Native dialog opens, files add correctly
- [ ] External drop: Desktop files add correctly
- [ ] Limit enforcement: Cannot add more than 14
- [ ] Remove single: X button removes one reference
- [ ] Clear all: Clear button removes all references
- [ ] Duplicate prevention: Same image cannot be added twice
- [ ] Build test: `npm run tauri build` succeeds

## Validation Criteria

- [ ] All phases completed
- [ ] TypeScript compiles without errors
- [ ] Reference bar displays correctly
- [ ] Drag-drop works from gallery
- [ ] File picker works
- [ ] External drop works (if Tauri supports)
- [ ] Limit of 14 enforced
- [ ] Remove/clear functionality works
- [ ] No memory leaks
- [ ] Build succeeds

## Implementation Log

### Session 1 - YYYY-MM-DD

**Completed**:
- [To be filled during implementation]

**Issues Encountered**:
- [To be filled during implementation]

**Next Steps**:
- [To be filled during implementation]

## Rollback Plan

If issues arise:
1. Remove ReferenceBar from AppLayout
2. Revert ImageCard/LatestPreview drag handlers
3. Remove useReferenceBar hook
4. Remove dialog plugin registration
5. All changes are additive; rollback is simple removal

## Notes

- Reference bar state is currently session-only (not persisted)
- Persistence can be added in Phase 4 using localStorage or tauri-plugin-store
- The `reference_images` field in ImageMetadata is already defined for future use
- Consider adding reference presets in future enhancement
