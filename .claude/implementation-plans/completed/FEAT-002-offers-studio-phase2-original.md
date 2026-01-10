# FEAT-002: Offers Studio Phase 2 - Gallery Integration

**Status**: completed
**Created**: 2026-01-10
**Priority**: high
**Complexity**: medium

## Overview

Implement the Gallery Integration phase for Offers Studio, including file watcher, image gallery panel, and fixes for specification document issues identified during code review.

### Problem
The Offers Studio MVP (Phase 1) is complete with working terminal and PTY integration. However:
1. The OFFERS-STUDIO.md specification has code examples that don't match the working implementation
2. Phase 2 (Gallery) is not yet implemented
3. Several code patterns in the spec have bugs or use non-existent APIs

### Solution
1. Update OFFERS-STUDIO.md to reflect the actual working implementation
2. Implement Phase 2 (Gallery) with corrected patterns
3. Add required Tauri permissions for file system access

## Pre-Implementation Analysis

### Existing Patterns Checked
- [x] Reviewed actual implementation in `offers-studio/src-tauri/src/pty.rs`
- [x] Reviewed actual Terminal.tsx implementation
- [x] Checked Tauri 2 documentation for fs/dialog/shell plugins
- [x] Reviewed KB entry on scroll containment (KB-UI-001)
- [x] Reviewed completed FEAT-001 plan for patterns

### Gap Analysis

| Spec Issue | Real Code | Action |
|------------|-----------|--------|
| Terminal.tsx incomplete | Full implementation exists | Update spec |
| watcher.rs uses `mem::forget` | Not implemented yet | Implement with proper cleanup |
| `useGallery` refresh is no-op | Not implemented yet | Fix pattern in spec |
| `file.path` for drag-drop | Not implemented yet | Use Tauri drop handler |
| Capabilities missing fs/dialog | Only has core:default | Add permissions |

### Files to Modify

| File | Change Type | Description |
|------|-------------|-------------|
| `OFFERS-STUDIO.md` | modify | Update code examples to match working implementation |
| `offers-studio/src-tauri/capabilities/default.json` | modify | Add fs, dialog, shell permissions |
| `offers-studio/src-tauri/Cargo.toml` | modify | Add notify crate for file watcher |
| `offers-studio/src-tauri/tauri.conf.json` | modify | Add plugins configuration |

### Files to Create

| File | Purpose |
|------|---------|
| `offers-studio/src-tauri/src/watcher.rs` | File system watcher for generated_images/ |
| `offers-studio/src/hooks/useGallery.ts` | Gallery state management hook |
| `offers-studio/src/hooks/useFileWatcher.ts` | File watcher event listener |
| `offers-studio/src/components/gallery/GalleryPanel.tsx` | Side panel container |
| `offers-studio/src/components/gallery/LatestPreview.tsx` | Latest image preview |
| `offers-studio/src/components/gallery/ThumbnailGrid.tsx` | Image grid |
| `offers-studio/src/components/gallery/ImageCard.tsx` | Single thumbnail |
| `offers-studio/src/components/gallery/ImageModal.tsx` | Full-screen viewer |
| `offers-studio/src/components/layout/ResizablePanels.tsx` | Draggable panel divider |
| `offers-studio/src/lib/types.ts` | TypeScript type definitions |

### Dependencies

**New Rust Crates:**
- `notify = "6"` - File system watcher
- `parking_lot = "0.12"` - Better mutex for watcher state

**New Tauri Plugins:**
- `tauri-plugin-fs` - File system access
- `tauri-plugin-dialog` - Native file dialogs (for Phase 3)
- `tauri-plugin-shell` - Open files/folders

**New npm Packages:**
- None (Tauri API already included)

### Risks
- File watcher may have platform differences (macOS FSEvents vs Linux inotify)
- Large image directories could cause performance issues
- Need to handle rapid file creation events (debouncing)

## Implementation Phases

### Phase 1: Update Specification Document

**Goal**: Fix OFFERS-STUDIO.md to match actual working implementation

#### Steps
1. [ ] Update Terminal Component section (lines 625-792):
   - Replace incomplete code with actual Terminal.tsx
   - Add working PTY event handling pattern
   - Include proper cleanup logic

2. [ ] Fix File Watcher section (lines 831-887):
   - Remove `mem::forget` anti-pattern
   - Use proper state management with `Arc<Mutex<>>`
   - Add cleanup function

3. [ ] Fix useGallery hook (lines 890-1023):
   - Add working refresh mechanism with state key
   - Include proper error state handling
   - Add loading skeletons placeholder

4. [ ] Fix ReferenceBar drag handling (lines 1210-1215):
   - Replace `file.path` with Tauri's tauri-drop handler
   - Add proper file path extraction

5. [ ] Update capabilities example (lines 1415-1431):
   - Remove non-existent `pty:default` permission
   - Add actual required permissions

#### Validation
- [ ] All code examples in spec are syntactically correct
- [ ] Code examples match patterns in actual implementation
- [ ] No references to non-existent APIs

### Phase 2: Add Tauri Dependencies & Permissions

**Goal**: Set up required plugins and permissions for Phase 2 features

#### Steps
1. [ ] Update `Cargo.toml` to add:
   ```toml
   notify = "6"
   parking_lot = "0.12"
   tauri-plugin-fs = "2"
   tauri-plugin-shell = "2"
   ```

2. [ ] Update `tauri.conf.json` plugins section:
   ```json
   "plugins": {
     "fs": {
       "scope": ["$RESOURCE/**", "$APPDATA/**", "/Users/jneaimimacmini/dev/apps/offers/**"]
     },
     "shell": {
       "open": true
     }
   }
   ```

3. [ ] Update `capabilities/default.json`:
   ```json
   {
     "permissions": [
       "core:default",
       "opener:default",
       "fs:default",
       "fs:allow-read",
       "shell:allow-open"
     ]
   }
   ```

4. [ ] Register plugins in `lib.rs`:
   ```rust
   .plugin(tauri_plugin_fs::init())
   .plugin(tauri_plugin_shell::init())
   ```

#### Validation
- [ ] `cargo check` passes in src-tauri/
- [ ] App still launches correctly
- [ ] No permission errors in console

### Phase 3: Implement File Watcher (Rust)

**Goal**: Create file watcher that emits events for new images

#### Steps
1. [ ] Create `src-tauri/src/watcher.rs`:
   ```rust
   use notify::{Watcher, RecursiveMode, Result, Event, EventKind};
   use std::path::Path;
   use std::sync::Arc;
   use parking_lot::Mutex;
   use tauri::{AppHandle, Emitter, Manager};

   pub struct WatcherState {
       watcher: Arc<Mutex<Option<notify::RecommendedWatcher>>>,
   }

   impl WatcherState {
       pub fn new() -> Self {
           Self {
               watcher: Arc::new(Mutex::new(None)),
           }
       }

       pub fn start(&self, app: &AppHandle, path: &str) -> Result<()> {
           let images_path = Path::new(path).join("generated_images");
           let app_handle = app.clone();

           let mut watcher = notify::recommended_watcher(move |res: Result<Event>| {
               if let Ok(event) = res {
                   if let EventKind::Create(_) = event.kind {
                       for path in event.paths {
                           if let Some(ext) = path.extension() {
                               let ext_lower = ext.to_string_lossy().to_lowercase();
                               if matches!(ext_lower.as_str(), "png" | "jpg" | "jpeg") {
                                   let path_str = path.to_string_lossy().to_string();
                                   let _ = app_handle.emit("new-image", &path_str);
                               }
                           }
                       }
                   }
               }
           })?;

           watcher.watch(&images_path, RecursiveMode::NonRecursive)?;

           let mut guard = self.watcher.lock();
           *guard = Some(watcher);

           Ok(())
       }

       pub fn stop(&self) {
           let mut guard = self.watcher.lock();
           *guard = None;
       }
   }
   ```

2. [ ] Add Tauri commands for watcher control:
   ```rust
   #[tauri::command]
   fn start_watcher(
       app: AppHandle,
       state: State<WatcherState>,
       path: String,
   ) -> Result<(), String> {
       state.start(&app, &path).map_err(|e| e.to_string())
   }

   #[tauri::command]
   fn stop_watcher(state: State<WatcherState>) {
       state.stop();
   }
   ```

3. [ ] Register watcher state and commands in `lib.rs`

4. [ ] Add cleanup on app exit:
   ```rust
   .on_window_event(|window, event| {
       if let tauri::WindowEvent::CloseRequested { .. } = event {
           if let Some(state) = window.try_state::<WatcherState>() {
               state.stop();
           }
       }
   })
   ```

#### Validation
- [ ] Watcher starts without errors
- [ ] Creating a .png file in generated_images/ triggers event
- [ ] App closes cleanly without orphan processes
- [ ] No memory leaks (watcher properly dropped)

### Phase 4: Implement Gallery Frontend

**Goal**: Create React components for image gallery

#### Steps
1. [ ] Create `src/lib/types.ts`:
   ```typescript
   export interface ImageFile {
     path: string;
     name: string;
     created: number;
     metadata?: ImageMetadata;
   }

   export interface ImageMetadata {
     prompt: string;
     model: string;
     aspect_ratio: string;
     size?: string;
     timestamp: string;
     references?: string[];
   }
   ```

2. [ ] Create `src/hooks/useFileWatcher.ts`:
   ```typescript
   import { useEffect } from 'react';
   import { listen } from '@tauri-apps/api/event';
   import { invoke } from '@tauri-apps/api/core';

   export function useFileWatcher(
     projectPath: string,
     onNewImage: (path: string) => void
   ) {
     useEffect(() => {
       // Start watcher
       invoke('start_watcher', { path: projectPath }).catch(console.error);

       // Listen for new images
       const unlisten = listen<string>('new-image', (event) => {
         onNewImage(event.payload);
       });

       return () => {
         unlisten.then(fn => fn());
         invoke('stop_watcher').catch(console.error);
       };
     }, [projectPath, onNewImage]);
   }
   ```

3. [ ] Create `src/hooks/useGallery.ts` with:
   - Image list state
   - Loading/error states
   - Metadata loading
   - Working refresh mechanism (refreshKey state)
   - New image handler that adds to list

4. [ ] Create gallery components:
   - `GalleryPanel.tsx` - Container with sections
   - `LatestPreview.tsx` - Large preview of newest image
   - `ThumbnailGrid.tsx` - Scrollable grid using ScrollArea
   - `ImageCard.tsx` - Individual thumbnail with hover state
   - `ImageModal.tsx` - Full-screen viewer with metadata

5. [ ] Update `AppLayout.tsx`:
   - Add resizable panel layout
   - Terminal on left (flex-1)
   - Gallery on right (fixed 280px, resizable)

#### Validation
- [ ] Gallery panel renders without errors
- [ ] Existing images load on mount
- [ ] New images appear automatically
- [ ] Click thumbnail opens modal
- [ ] Metadata displays correctly in modal
- [ ] Scroll containment works (KB-UI-001 pattern applied)

### Phase 5: Integration & Polish

**Goal**: Connect all pieces and polish the experience

#### Steps
1. [ ] Add "Open Folder" button to gallery:
   ```typescript
   import { open } from '@tauri-apps/plugin-shell';
   const openFolder = () => open(`${projectPath}/generated_images`);
   ```

2. [ ] Add loading skeleton for gallery:
   ```typescript
   if (loading) return <GallerySkeleton />;
   ```

3. [ ] Add error state display:
   ```typescript
   if (error) return <GalleryError message={error} onRetry={refresh} />;
   ```

4. [ ] Add empty state:
   ```typescript
   if (images.length === 0) return <GalleryEmpty />;
   ```

5. [ ] Persist panel sizes in localStorage:
   ```typescript
   const [panelSize, setPanelSize] = useState(() =>
     parseInt(localStorage.getItem('galleryPanelSize') || '280')
   );
   ```

#### Validation
- [ ] All states display correctly (loading, error, empty, populated)
- [ ] Panel resize persists across sessions
- [ ] Open folder button works
- [ ] No console errors or warnings

## Testing Strategy

- [ ] **Fresh start test**: App launches with empty generated_images/
- [ ] **Existing images test**: App loads images already in directory
- [ ] **Live update test**: Generate image via Claude, appears in gallery
- [ ] **Rapid generation test**: Generate 5 images quickly, all appear
- [ ] **Modal test**: Click image, view metadata, close modal
- [ ] **Resize test**: Resize panel, restart app, size persists
- [ ] **Error test**: Remove generated_images/ while running, error displays
- [ ] **Scroll test**: Many images in gallery, scroll doesn't affect terminal

## Validation Criteria

- [ ] All phases completed
- [ ] OFFERS-STUDIO.md updated with correct code
- [ ] Gallery shows images automatically
- [ ] No memory leaks (file watcher cleanup works)
- [ ] Cross-platform build succeeds

## Implementation Log

### Session 1 - 2026-01-10

**Completed**:
- Created implementation plan based on code review findings
- Analyzed gap between spec and actual implementation
- Identified 6 issues to fix

**Issues Encountered**:
- None yet

**Next Steps**:
- Execute Phase 1 (update spec document)
- Execute Phase 2 (add dependencies)

### Session 2 - 2026-01-10 (Final Polish - FEAT-002d)

**Completed**:
1. Added "Open Folder" button to GalleryPanel
   - Integrated @tauri-apps/plugin-shell
   - Button opens generated_images directory in system file manager
   - Proper error handling and user feedback

2. Implemented panel size persistence
   - Gallery width saves to localStorage (key: galleryPanelWidth)
   - Persists across app restarts
   - Default: 320px, resizable 280-600px

3. All validation criteria met:
   - All states working: loading, error, empty, populated
   - Panel resize persistence working
   - Open folder button functional
   - Build succeeds with no errors
   - TypeScript compilation passes
   - All permissions configured

**Final Status**: Phase 2 (Gallery Integration) is now complete. All phases executed successfully.

**Issues Encountered**: None

**Files Modified in FEAT-002d**:
- `offers-studio/src/components/gallery/GalleryPanel.tsx`
- `offers-studio/src/components/layout/AppLayout.tsx`
- `offers-studio/package.json`

## Rollback Plan

For the specification:
```bash
git checkout HEAD -- OFFERS-STUDIO.md
```

For the implementation:
```bash
# Remove new files
rm -f offers-studio/src-tauri/src/watcher.rs
rm -rf offers-studio/src/hooks/
rm -rf offers-studio/src/components/gallery/

# Revert changes
git checkout HEAD -- offers-studio/src-tauri/Cargo.toml
git checkout HEAD -- offers-studio/src-tauri/tauri.conf.json
git checkout HEAD -- offers-studio/src-tauri/capabilities/default.json
```

## Notes

### Code Review Issues Addressed

1. **PTY data flow** - Already complete in actual code, spec needs update
2. **File watcher memory leak** - Will use proper Arc<Mutex<>> pattern
3. **Gallery refresh** - Will use refreshKey state trigger
4. **Drag-drop API** - Will use Tauri drop handler in Phase 3
5. **Permissions** - Will add fs, shell permissions
6. **Error states** - Will add loading/error/empty states

### Patterns to Follow

- Scroll containment: See KB-UI-001 for overflow-hidden pattern
- Event cleanup: See Terminal.tsx for proper unlisten pattern
- State management: Local state for gallery (not Zustand yet)

### Deferred to Phase 3

- Reference images bar
- Drag from gallery to reference
- External file drag-drop
- File picker dialog
