# FEAT-004a: Context & Session Management - Part 1

**Status**: completed
**Created**: 2026-01-10
**Priority**: high
**Parent Plan**: FEAT-004-context-session-management.md

## Scope

This part covers **Phases 1-3**:
1. Statusline Setup Script
2. Context Watcher (Rust Backend)
3. Context Bar UI

## Pre-Implementation Analysis

### Files to Modify
| File | Change Type | Description |
|------|-------------|-------------|
| `offers-studio/src-tauri/src/lib.rs` | modify | Add context watcher state and commands |
| `offers-studio/src-tauri/Cargo.toml` | modify | Add deps if needed (dirs crate) |
| `offers-studio/src/components/layout/AppLayout.tsx` | modify | Add context bar |
| `offers-studio/src/lib/types.ts` | modify | Add context types |

### Files to Create
| File | Purpose |
|------|---------|
| `offers-studio/src-tauri/src/context_watcher.rs` | Watch statusline JSON file |
| `offers-studio/src/hooks/useContextBar.ts` | Context usage state management |
| `offers-studio/src/components/context-bar/ContextBar.tsx` | Context usage display |
| `offers-studio/src/components/context-bar/ContextBreakdown.tsx` | Detailed token breakdown |

## Implementation Phases

### Phase 1: Statusline Setup Script

**Goal**: Create the statusline script that Claude Code will invoke to write context JSON

#### Steps
1. [ ] Create Tauri command to install/configure statusline
   - `install_statusline()` - Creates script at `~/.claude/statusline-offers-studio.sh` and sets permissions
   - Script writes stdin to `/tmp/offers-studio-context.json`
   ```bash
   #!/bin/bash
   cat > /tmp/offers-studio-context.json
   ```
2. [ ] Add Tauri command to check if statusline is configured
   - `check_statusline()` - Returns bool
3. [ ] Add Tauri command to get statusline script path
   - `get_statusline_path()` - Returns the path for user to configure

#### Validation
- [ ] Script exists and is executable after install
- [ ] Running `echo '{"test":1}' | ~/.claude/statusline-offers-studio.sh` writes to temp file
- [ ] App detects when statusline is not configured

### Phase 2: Context Watcher (Rust Backend)

**Goal**: Watch the statusline JSON file and emit events when it changes

#### Steps
1. [ ] Create `context_watcher.rs` module
   - `ContextWatcherState` struct (similar to `WatcherState`)
   - Watch `/tmp/offers-studio-context.json`
   - Parse JSON and emit `context-updated` event
2. [ ] Add context types to lib.rs
   ```rust
   #[derive(Debug, Clone, Serialize, Deserialize)]
   pub struct ContextUsage {
       pub total_input_tokens: u64,
       pub total_output_tokens: u64,
       pub context_window_size: u64,
       pub percentage: f64,
       pub current_input: u64,
       pub current_output: u64,
       pub cache_creation_tokens: u64,
       pub cache_read_tokens: u64,
   }
   ```
3. [ ] Add Tauri commands
   - `start_context_watcher()` - Begin watching
   - `stop_context_watcher()` - Stop watching
   - `get_current_context()` - Read current values
4. [ ] Wire up state in `run()` function

#### Validation
- [ ] `context-updated` event fires when JSON file changes
- [ ] Context values parse correctly
- [ ] No crash if JSON file doesn't exist or is malformed

### Phase 3: Context Bar UI

**Goal**: Display context usage in the frontend

#### Steps
1. [ ] Add context types to `types.ts`
   ```typescript
   export interface ContextUsage {
     totalInputTokens: number;
     totalOutputTokens: number;
     contextWindowSize: number;
     percentage: number;
     currentInput: number;
     currentOutput: number;
     cacheCreationTokens: number;
     cacheReadTokens: number;
   }
   ```
2. [ ] Create `useContextBar.ts` hook
   - Listen to `context-updated` event
   - Store current context state
   - Calculate percentage and color
   - Start/stop watcher on mount/unmount
3. [ ] Create `ContextBar.tsx` component
   - Progress bar showing percentage
   - Color coding: green (<50%), yellow (50-80%), red (>80%)
   - Token count display (e.g., "134K / 200K")
   - Compact/minimal design for status area
4. [ ] Create `ContextBreakdown.tsx` component
   - Expandable details panel
   - Show input/output/cache breakdown
   - Triggered by clicking on ContextBar
5. [ ] Integrate into `AppLayout.tsx`
   - Add to bottom status area (near terminal)
   - Show "Setup Required" if statusline not configured

#### Validation
- [ ] Context bar shows and updates in real-time
- [ ] Colors change based on percentage
- [ ] Breakdown panel expands/collapses
- [ ] Shows "Setup Required" when statusline missing

## Implementation Log

### Session 1 - 2026-01-10

**Completed**:
- Split from parent plan
- Phase 1: Statusline Setup Script
  - Added `dirs` crate to Cargo.toml
  - Created `install_statusline()`, `check_statusline()`, and `get_statusline_path()` Tauri commands
  - Script installs to `~/.claude/statusline-offers-studio.sh`
  - Script writes stdin to `/tmp/offers-studio-context.json`
  - Proper Unix permissions handling (755 on Unix systems)
- Phase 2: Context Watcher (Rust Backend)
  - Created `context_watcher.rs` module
  - Implemented `ContextWatcherState` with notify watcher
  - Watches `/tmp/offers-studio-context.json` for changes
  - Emits `context-updated` events to frontend
  - Added `start_context_watcher()`, `stop_context_watcher()`, `get_current_context()` commands
  - Integrated cleanup in window close handler
- Phase 3: Context Bar UI
  - Added `ContextUsage` type to `types.ts`
  - Created `useContextBar` hook with auto-start/stop watcher
  - Created `ContextBar` component with progress bar and color coding
  - Created `ContextBreakdown` component with detailed token breakdown
  - Integrated into `AppLayout.tsx` below ReferenceBar
  - Shows "Setup Required" state when statusline not configured
  - Includes "Install Script" and "Get Path" buttons for easy setup

**Issues Encountered**:
- None - implementation went smoothly

**Next Steps**:
- Test the implementation
- Move plan to completed/
- Run `/implement FEAT-004b-context-session-part2.md` for session management

## Next Part

After completing this part, run:
```
/implement FEAT-004b-context-session-part2.md
```
