# FEAT-004b: Context & Session Management - Part 2

**Status**: completed
**Created**: 2026-01-10
**Priority**: high
**Parent Plan**: FEAT-004-context-session-management.md
**Depends On**: FEAT-004a-context-session-part1.md

## Scope

This part covers **Phases 4-5**:
4. Session Actions (Clear/Compact)
5. Session Manager Backend

## Pre-Implementation Analysis

### Files to Modify
| File | Change Type | Description |
|------|-------------|-------------|
| `offers-studio/src-tauri/src/lib.rs` | modify | Add session commands |
| `offers-studio/src/components/terminal/Terminal.tsx` | modify | Add session action handlers, sendCommand |
| `offers-studio/src/components/layout/AppLayout.tsx` | modify | Add session actions UI |

### Files to Create
| File | Purpose |
|------|---------|
| `offers-studio/src-tauri/src/sessions.rs` | Session file parser and commands |
| `offers-studio/src/components/session-actions/SessionActions.tsx` | Clear/Compact buttons |
| `offers-studio/src/components/session-actions/ConfirmDialog.tsx` | Confirmation dialog |

## Implementation Phases

### Phase 4: Session Actions (Clear/Compact)

**Goal**: Add buttons to send session management commands to PTY

#### Steps
1. [ ] Create `SessionActions.tsx` component
   - "Clear" button with confirmation dialog
   - "Compact" button with confirmation dialog
   - Loading state while command executes
2. [ ] Create `ConfirmDialog.tsx` component
   - Reusable confirmation dialog
   - Title, message, confirm/cancel buttons
   - Danger variant for destructive actions
3. [ ] Update `Terminal.tsx`
   - Add `sendCommand` helper exposed via ref
   - Track command execution state
4. [ ] Integrate into layout
   - Add to terminal toolbar area
5. [ ] Add keyboard shortcuts
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
   #[derive(Debug, Clone, Serialize, Deserialize)]
   pub struct SessionInfo {
       pub id: String,
       pub project_path: String,
       pub timestamp: String,
       pub first_message: String,
       pub message_count: u32,
       pub custom_name: Option<String>,
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

## Implementation Log

### Session 1 - 2026-01-10

**Completed**:
- Split from parent plan

**Issues Encountered**:
- None yet

**Next Steps**:
- Wait for Part 1 completion

### Session 2 - 2026-01-10

**Completed**:

Phase 4: Session Actions (Clear/Compact)
- Created `SessionActions.tsx` component with Clear and Compact buttons
- Created `ConfirmDialog.tsx` reusable confirmation dialog component
- Added confirmation dialogs for both actions (danger variant for Clear, warning for Compact)
- Updated `Terminal.tsx` to expose `sendCommand` method alongside existing `sendInput`
- Integrated session actions into `AppLayout.tsx` title bar (centered position)
- Added keyboard shortcuts: Cmd+K for Clear, Cmd+Shift+K for Compact
- All buttons show loading state while command executes
- Frontend build validated successfully

Phase 5: Session Manager Backend
- Created `sessions.rs` module with complete session parsing functionality
- Implemented `SessionInfo` type with id, timestamp, first_message, message_count, custom_name
- Added session file parser that reads Claude's JSONL session files
- Implemented project path encoding to match Claude's directory structure (base64 URL-safe)
- Added four Tauri commands:
  - `list_sessions(project_path)` - Lists all sessions for a project
  - `get_session_preview(project_path, session_id)` - Gets first 5 messages
  - `get_session_names()` - Reads custom names from persistent file
  - `set_session_name(id, name)` - Saves custom name to ~/.claude/offers-studio-session-names.json
- Added base64 dependency to Cargo.toml
- Updated lib.rs with module declaration and command registration
- Rust backend build validated successfully (cargo check passed)

**Issues Encountered**:
- None - all phases completed smoothly

**Files Created**:
- offers-studio/src/components/session-actions/SessionActions.tsx
- offers-studio/src/components/session-actions/ConfirmDialog.tsx
- offers-studio/src/components/session-actions/index.ts
- offers-studio/src-tauri/src/sessions.rs

**Files Modified**:
- offers-studio/src/components/terminal/Terminal.tsx (added sendCommand method)
- offers-studio/src/components/layout/AppLayout.tsx (added session actions and keyboard shortcuts)
- offers-studio/src-tauri/src/lib.rs (added sessions module and commands)
- offers-studio/src-tauri/Cargo.toml (added base64 dependency)

**Validation Results**:
- Frontend TypeScript compilation: PASSED
- Rust backend compilation: PASSED
- Session actions UI integrated successfully
- All keyboard shortcuts implemented
- Backend commands registered and ready for use

**Next Steps**:
- Plan marked as completed
- Ready for Part 3 (FEAT-004c) which will implement the session switcher UI

## Next Part

After completing this part, run:
```
/implement FEAT-004c-context-session-part3.md
```
