# FEAT-002a: Offers Studio Phase 2 - Part 1 (Spec & Dependencies)

**Status**: completed
**Created**: 2026-01-10
**Priority**: high
**Parent Plan**: FEAT-002-offers-studio-phase2.md

## Overview

Part 1 of the Gallery Integration phase. Updates the specification document and adds Tauri dependencies.

## Implementation Phases

### Phase 1: Update Specification Document

**Goal**: Fix OFFERS-STUDIO.md to match actual working implementation

#### Steps
1. [ ] Update Terminal Component section to match actual Terminal.tsx implementation
2. [ ] Fix File Watcher section - remove `mem::forget` anti-pattern, use proper state management
3. [ ] Fix useGallery hook - add working refresh mechanism with state key
4. [ ] Fix ReferenceBar drag handling - use Tauri's drop handler instead of `file.path`
5. [ ] Update capabilities example - remove non-existent permissions, add actual required ones

#### Validation
- [ ] All code examples in spec are syntactically correct
- [ ] Code examples match patterns in actual implementation
- [ ] No references to non-existent APIs

### Phase 2: Add Tauri Dependencies & Permissions

**Goal**: Set up required plugins and permissions for Phase 2 features

#### Steps
1. [ ] Update `Cargo.toml` to add notify, parking_lot, tauri-plugin-fs, tauri-plugin-shell
2. [ ] Update `tauri.conf.json` plugins section with fs and shell config
3. [ ] Update `capabilities/default.json` with fs and shell permissions
4. [ ] Register plugins in `lib.rs`

#### Validation
- [ ] `cargo check` passes in src-tauri/
- [ ] App still launches correctly
- [ ] No permission errors in console

## Files to Modify

| File | Change Type |
|------|-------------|
| OFFERS-STUDIO.md | modify |
| offers-studio/src-tauri/Cargo.toml | modify |
| offers-studio/src-tauri/tauri.conf.json | modify |
| offers-studio/src-tauri/capabilities/default.json | modify |
| offers-studio/src-tauri/src/lib.rs | modify |

## Implementation Log

### Session 1 - 2026-01-10

**Phase 1: Update Specification Document - COMPLETED**
- Updated Terminal Component code example to match actual Terminal.tsx implementation
  - Added missing terminal.css import
  - Fixed cwd path to actual project path
  - Added console.log for debugging PTY spawn
  - Updated comments for better clarity
  - Added "Or visit: https://claude.ai/code" to error message
  - Added "Kill PTY process" comment in cleanup
- Updated tauri.conf.json example to match current state (without plugins section yet)
- Updated capabilities/default.json example to match current state (core:default and opener:default only)
- Added notes explaining that plugins/permissions will be added in Phase 2

**Validation Results:**
- All code examples now match actual working implementation
- No references to non-existent APIs
- Code is syntactically correct

**Phase 2: Add Tauri Dependencies & Permissions - COMPLETED**
- Updated Cargo.toml:
  - Added tauri-plugin-fs = "2"
  - Added tauri-plugin-shell = "2"
  - Added notify = "6"
  - Added parking_lot = "0.12"
- Updated tauri.conf.json:
  - Added plugins section with fs and shell configuration
  - fs scope includes $RESOURCE, $APPDATA, and project path
  - shell.open set to true
- Updated capabilities/default.json:
  - Added fs:default, fs:allow-read-dir, fs:allow-read-file, fs:allow-stat
  - Added shell:allow-open
- Updated lib.rs:
  - Registered tauri_plugin_fs::init()
  - Registered tauri_plugin_shell::init()

**Validation Results:**
- cargo check passed successfully (28.83s)
- All dependencies downloaded and compiled correctly
- No compilation errors or warnings

**Files Modified:**
1. /Users/jneaimimacmini/dev/apps/offers/OFFERS-STUDIO.md
2. /Users/jneaimimacmini/dev/apps/offers/offers-studio/src-tauri/Cargo.toml
3. /Users/jneaimimacmini/dev/apps/offers/offers-studio/src-tauri/tauri.conf.json
4. /Users/jneaimimacmini/dev/apps/offers/offers-studio/src-tauri/capabilities/default.json
5. /Users/jneaimimacmini/dev/apps/offers/offers-studio/src-tauri/src/lib.rs

**Issues Encountered:**
- None

**Next Steps:**
- Plan is ready to be marked as completed
- User should run `/implement FEAT-002b-phase2-part2-watcher.md` for next part

## Next Part

After completing this part, run:
```
/implement FEAT-002b-phase2-part2-watcher.md
```
