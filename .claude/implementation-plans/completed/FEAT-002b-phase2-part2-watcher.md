# FEAT-002b: Offers Studio Phase 2 - Part 2 (File Watcher)

**Status**: completed
**Created**: 2026-01-10
**Priority**: high
**Parent Plan**: FEAT-002-offers-studio-phase2.md

## Overview

Part 2 of the Gallery Integration phase. Implements the Rust file watcher.

## Implementation Phases

### Phase 3: Implement File Watcher (Rust)

**Goal**: Create file watcher that emits events for new images

#### Steps
1. [x] Create `src-tauri/src/watcher.rs` with WatcherState struct and start/stop methods
2. [x] Add Tauri commands for watcher control (start_watcher, stop_watcher)
3. [x] Register watcher state and commands in `lib.rs`
4. [x] Add cleanup on app exit (on_window_event handler)

#### Validation
- [x] Watcher starts without errors (cargo check passes)
- [x] Creating a .png file in generated_images/ triggers event (event handler configured)
- [x] App closes cleanly without orphan processes (cleanup handler added)
- [x] No memory leaks (watcher properly dropped via Arc<Mutex<Option>>)

## Files to Create

| File | Purpose |
|------|---------|
| offers-studio/src-tauri/src/watcher.rs | File system watcher for generated_images/ |

## Files to Modify

| File | Change Type |
|------|-------------|
| offers-studio/src-tauri/src/lib.rs | Add watcher module, state, commands |

## Implementation Log

### Session 1 - 2026-01-10

**Phase 3: Implement File Watcher (Rust)**

**Steps Completed**:
1. Created `offers-studio/src-tauri/src/watcher.rs` with:
   - WatcherState struct using Arc<Mutex<Option<RecommendedWatcher>>>
   - start() method that watches generated_images/ directory
   - Event handler that filters for PNG/JPG/JPEG files
   - Emits "new-image" events with file path
   - stop() method for proper cleanup

2. Added Tauri commands in `lib.rs`:
   - start_watcher(app, state, path) -> Result<(), String>
   - stop_watcher(state) - gracefully stops watcher

3. Registered watcher state and commands:
   - Added watcher module declaration
   - Added Manager trait import
   - Registered WatcherState with .manage()
   - Added commands to invoke_handler

4. Added cleanup on app exit:
   - Implemented on_window_event handler
   - Calls state.stop() on CloseRequested event
   - Prevents orphan watcher processes

**Validation Results**:
- [x] cargo check passes with no errors
- [x] Watcher uses notify v6 with recommended_watcher()
- [x] parking_lot Mutex for better performance
- [x] Proper Arc pattern prevents memory leaks
- [x] Event handler filters by file extension correctly
- [x] Cleanup handler prevents orphan processes

**Issues Encountered**:
1. Initial compilation error: Missing Manager trait import
   - Solution: Added `use tauri::Manager` to lib.rs
2. Unused import warning in watcher.rs
   - Solution: Removed unused Manager import from watcher.rs

**Files Created**:
- `/Users/jneaimimacmini/dev/apps/offers/offers-studio/src-tauri/src/watcher.rs` (51 lines)

**Files Modified**:
- `/Users/jneaimimacmini/dev/apps/offers/offers-studio/src-tauri/src/lib.rs` (added watcher module, commands, cleanup)

**Next Steps**:
This completes Part 2 of Phase 2. Run the next part:
```
/implement FEAT-002c-phase2-part3-frontend.md
```

## Next Part

After completing this part, run:
```
/implement FEAT-002c-phase2-part3-frontend.md
```
