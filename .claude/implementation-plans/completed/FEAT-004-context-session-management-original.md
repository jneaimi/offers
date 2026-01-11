# FEAT-004: Context & Session Management

**Status**: completed
**Created**: 2026-01-10
**Priority**: high
**Complexity**: high

## Overview

Add real-time context usage tracking and session management to Offers Studio. Users will see their token consumption visualized, be able to clear/compact sessions, and resume past sessions.

### Problem
Users have no visibility into Claude's context window consumption while working. They cannot easily manage sessions (clear, compact) or resume previous work without leaving the app.

### Solution
Hybrid approach using:
1. **Statusline JSON** - Claude writes context stats to a temp file, Rust watches it
2. **PTY Commands** - Send `/clear` and `/compact` directly to terminal
3. **File System** - Read session history from `~/.claude/projects/`

## Pre-Implementation Analysis

### Existing Patterns Checked
- [x] Searched codebase for similar implementations
  - `useFileWatcher.ts` - Pattern for listening to Rust file watcher events
  - `watcher.rs` - Pattern for Rust file watching with notify crate
  - `Terminal.tsx` - Pattern for PTY commands and `sendInput` via ref
- [x] Checked knowledge-base/ for related issues
  - `ui/drag-drop-not-working-tauri.md` - Relevant for file dialog patterns
- [x] Reviewed completed plans for patterns
  - `FEAT-002b-phase2-part2-watcher.md` - File watcher pattern
  - `FEAT-003-reference-images.md` - Component integration patterns

### Files to Modify
| File | Change Type | Description |
|------|-------------|-------------|
| `offers-studio/src-tauri/src/lib.rs` | modify | Add session commands, context watcher state |
| `offers-studio/src-tauri/Cargo.toml` | modify | Add dependencies if needed |
| `offers-studio/src/components/terminal/Terminal.tsx` | modify | Add session action handlers |
| `offers-studio/src/components/layout/AppLayout.tsx` | modify | Add context bar and session manager |
| `offers-studio/src/lib/types.ts` | modify | Add session and context types |

### Files to Create
| File | Purpose |
|------|---------|
| `offers-studio/src-tauri/src/sessions.rs` | Session file parser and commands |
| `offers-studio/src-tauri/src/context_watcher.rs` | Watch statusline JSON file |
| `offers-studio/src/hooks/useContextBar.ts` | Context usage state management |
| `offers-studio/src/hooks/useSessions.ts` | Session list and management |
| `offers-studio/src/components/context-bar/ContextBar.tsx` | Context usage display |
| `offers-studio/src/components/context-bar/ContextBreakdown.tsx` | Detailed token breakdown |
| `offers-studio/src/components/session-manager/SessionManager.tsx` | Session list panel |
| `offers-studio/src/components/session-manager/SessionCard.tsx` | Individual session item |
| `offers-studio/src/components/session-manager/SessionActions.tsx` | Clear/Compact buttons |
| `~/.claude/statusline-offers-studio.sh` | Statusline script for Claude |

### Dependencies
- `notify` crate (already used for image watcher)
- `serde_json` (already used)
- `chrono` (already used)
- `dirs` crate (for home directory access)

### Risks
- Statusline may not exist if user hasn't configured Claude Code settings
- Session JSONL files format may vary between Claude Code versions
- Context window size varies by model (need to handle dynamically)

## Implementation Phases

### Phase 1: Statusline Setup Script

**Goal**: Create the statusline script that Claude Code will invoke to write context JSON

#### Steps
1. [ ] Create statusline script at user's home directory
   - Script: `~/.claude/statusline-offers-studio.sh`
   - Writes stdin to `/tmp/offers-studio-context.json`
   ```bash
   #!/bin/bash
   cat > /tmp/offers-studio-context.json
   ```
2. [ ] Add Tauri command to install/configure statusline
   - `install_statusline()` - Creates script and sets permissions
3. [ ] Add helper to check if statusline is configured
4. [ ] Frontend: Show setup prompt if statusline not configured

#### Validation
- [ ] Script exists and is executable
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
   #[derive(Debug, Serialize)]
   struct ContextUsage {
       total_input_tokens: u64,
       total_output_tokens: u64,
       context_window_size: u64,
       percentage: f64,
       current_input: u64,
       current_output: u64,
       cache_creation_tokens: u64,
       cache_read_tokens: u64,
   }
   ```
3. [ ] Add Tauri commands
   - `start_context_watcher()` - Begin watching
   - `stop_context_watcher()` - Stop watching
   - `get_current_context()` - Read current values
4. [ ] Wire up in `run()` function

#### Validation
- [ ] `context-updated` event fires when JSON file changes
- [ ] Context values parse correctly
- [ ] No crash if JSON file doesn't exist or is malformed

### Phase 3: Context Bar UI

**Goal**: Display context usage in the frontend

#### Steps
1. [ ] Add context types to `types.ts`
   ```typescript
   interface ContextUsage {
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
3. [ ] Create `ContextBar.tsx` component
   - Progress bar showing percentage
   - Color coding: green (<50%), yellow (50-80%), red (>80%)
   - Token count display (e.g., "134K / 200K")
4. [ ] Create `ContextBreakdown.tsx` component
   - Expandable details panel
   - Show input/output/cache breakdown
5. [ ] Integrate into `AppLayout.tsx`
   - Add to bottom status area
   - Make collapsible

#### Validation
- [ ] Context bar shows and updates in real-time
- [ ] Colors change based on percentage
- [ ] Breakdown panel expands/collapses
- [ ] Shows "Not configured" when statusline missing

### Phase 4: Session Actions (Clear/Compact)

**Goal**: Add buttons to send session management commands to PTY

#### Steps
1. [ ] Create `SessionActions.tsx` component
   - "Clear" button with confirmation dialog
   - "Compact" button with confirmation dialog
   - Loading state while command executes
2. [ ] Update `Terminal.tsx`
   - Add `sendCommand` helper (uses existing `sendInput`)
   - Track command execution state
3. [ ] Integrate into layout
   - Add to terminal toolbar area or as floating buttons
4. [ ] Add keyboard shortcuts
   - `Cmd+K` → Clear (with confirmation)
   - `Cmd+Shift+K` → Compact

#### Validation
- [ ] Clear button sends `/clear\n` to PTY
- [ ] Compact button sends `/compact\n` to PTY
- [ ] Confirmation dialogs prevent accidents
- [ ] Keyboard shortcuts work

### Phase 5: Session Manager Backend

**Goal**: Parse session files from Claude's project directory

#### Steps
1. [ ] Create `sessions.rs` module
2. [ ] Add session types
   ```rust
   #[derive(Debug, Serialize)]
   struct SessionInfo {
       id: String,
       project_path: String,
       timestamp: String,
       first_message: String,
       message_count: u32,
       custom_name: Option<String>,
   }
   ```
3. [ ] Implement session parsing
   - Find project directory: `~/.claude/projects/[encoded-path]/`
   - Parse JSONL files for session metadata
   - Extract first user message as preview
4. [ ] Add Tauri commands
   - `list_sessions(project_path: String)` - List all sessions
   - `get_session_preview(session_id: String)` - Get first few messages
   - `get_session_names()` - Read custom names file
   - `set_session_name(id: String, name: String)` - Save custom name
5. [ ] Custom names stored in `~/.claude/offers-studio-session-names.json`

#### Validation
- [ ] Sessions are listed correctly
- [ ] Timestamps parse properly
- [ ] First messages are extracted
- [ ] Custom names persist

### Phase 6: Session Manager UI

**Goal**: Display session list and enable resume functionality

#### Steps
1. [ ] Create `useSessions.ts` hook
   - Load sessions on mount
   - Manage current session ID
   - Handle resume logic
2. [ ] Create `SessionCard.tsx` component
   - Show date, time, preview text, message count
   - Custom name badge if set
   - Resume button
   - Rename button (opens dialog)
3. [ ] Create `SessionManager.tsx` component
   - Drawer/panel that slides in from right
   - Session list sorted by date (newest first)
   - Search/filter capability
   - Current session highlighted
4. [ ] Create `SessionNameDialog.tsx`
   - Input for custom session name
   - Save/Cancel buttons
5. [ ] Implement resume flow
   ```typescript
   async function resumeSession(sessionId: string) {
     // 1. Kill current PTY
     await invoke('kill_pty', { id: currentPtyId });
     // 2. Spawn new Claude with --resume
     await invoke('spawn_pty', {
       command: 'claude',
       args: ['--resume', sessionId],
       ...
     });
     // 3. Update state
     setCurrentSessionId(sessionId);
   }
   ```
6. [ ] Add toggle button/keyboard shortcut
   - `Cmd+S` → Toggle session manager

#### Validation
- [ ] Sessions display correctly
- [ ] Resume starts new Claude with correct session
- [ ] Custom names can be set and persist
- [ ] Panel opens/closes smoothly

### Phase 7: Integration & Polish

**Goal**: Final integration and edge case handling

#### Steps
1. [ ] Ensure context bar resets on session change
2. [ ] Handle edge cases
   - No sessions exist yet
   - Session file corrupted
   - Statusline not configured
   - PTY spawn failure
3. [ ] Add loading states throughout
4. [ ] Add error toasts for failures
5. [ ] Update OFFERS-STUDIO.md with completion status
6. [ ] Test full workflow end-to-end

#### Validation
- [ ] All features work together
- [ ] Edge cases handled gracefully
- [ ] No console errors or warnings
- [ ] App runs without crashes

## Testing Strategy

- [ ] Manual: Generate images and watch context bar update
- [ ] Manual: Clear session and verify `/clear` is sent
- [ ] Manual: Compact session and verify context reduces
- [ ] Manual: Resume old session and verify conversation loads
- [ ] Manual: Set custom session name and verify persistence
- [ ] Edge: Test with no sessions
- [ ] Edge: Test with corrupted session file
- [ ] Edge: Test with statusline not configured

## Validation Criteria

- [ ] All phases completed
- [ ] Context bar shows real-time token usage
- [ ] Clear/Compact buttons work with confirmation
- [ ] Session manager lists all past sessions
- [ ] Resume functionality spawns new PTY with correct session
- [ ] Custom session names persist across app restarts
- [ ] No regressions in existing functionality

## Implementation Log

### Session 1 - 2026-01-10

**Completed**:
- Created implementation plan
- Researched existing codebase patterns
- Split into 3 sub-plans for manageable implementation

### Session 2 - 2026-01-10

**Part 1 (FEAT-004a)**: Phases 1-3 (Statusline, Context Watcher, Context Bar UI)
- Created statusline setup script (`~/.claude/statusline-offers-studio.sh`)
- Implemented context_watcher.rs for watching statusline JSON
- Created ContextBar component with real-time token usage display
- Added useContextBar hook for state management
- Integrated into AppLayout

**Part 2 (FEAT-004b)**: Phases 4-5 (Session Actions, Backend)
- Created SessionActions component with Clear/Compact buttons
- Created ConfirmDialog component for confirmations
- Added sendCommand method to Terminal
- Created sessions.rs backend module
- Added list_sessions, get_session_names, set_session_name commands
- Integrated keyboard shortcuts (Cmd+K, Cmd+Shift+K)

**Part 3 (FEAT-004c)**: Phases 6-7 (Session Manager UI, Integration)
- Created useSessions hook for session state management
- Created SessionManager panel (slide-in from right)
- Created SessionCard and SessionNameDialog components
- Added resumeSession method to Terminal
- Added session history button and Cmd+H shortcut
- Full integration testing and polish

**Issues Encountered**:
- None significant - all phases completed successfully

**Final Status**: ✅ COMPLETE

## Rollback Plan

Each phase is independent and can be rolled back:
1. **Statusline**: Delete script, remove watcher
2. **Context bar**: Remove component, disconnect events
3. **Session actions**: Remove buttons, keyboard handlers
4. **Session manager**: Remove panel, session hooks

To fully rollback: revert to commit before Phase 4 implementation.

## Notes

- The statusline approach requires user configuration in Claude settings
- Consider adding a "first-run" wizard to guide setup
- Context window size varies by model - need to handle Sonnet (200K) vs Opus (200K) vs Haiku (200K)
- Session JSONL format documented at: https://docs.anthropic.com/en/docs/claude-code
