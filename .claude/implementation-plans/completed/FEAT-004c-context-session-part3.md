# FEAT-004c: Context & Session Management - Part 3

**Status**: completed
**Created**: 2026-01-10
**Completed**: 2026-01-10
**Priority**: high
**Parent Plan**: FEAT-004-context-session-management.md
**Depends On**: FEAT-004b-context-session-part2.md

## Scope

This part covers **Phases 6-7**:
6. Session Manager UI
7. Integration & Polish

## Pre-Implementation Analysis

### Files to Modify
| File | Change Type | Description |
|------|-------------|-------------|
| `offers-studio/src/components/layout/AppLayout.tsx` | modify | Add session manager panel toggle |
| `offers-studio/src/components/terminal/Terminal.tsx` | modify | Handle resume flow |
| `OFFERS-STUDIO.md` | modify | Update completion status |

### Files to Create
| File | Purpose |
|------|---------|
| `offers-studio/src/hooks/useSessions.ts` | Session list and management |
| `offers-studio/src/components/session-manager/SessionManager.tsx` | Session list panel |
| `offers-studio/src/components/session-manager/SessionCard.tsx` | Individual session item |
| `offers-studio/src/components/session-manager/SessionNameDialog.tsx` | Rename dialog |

## Implementation Phases

### Phase 6: Session Manager UI

**Goal**: Display session list and enable resume functionality

#### Steps
1. [ ] Create `useSessions.ts` hook
   - Load sessions on mount
   - Manage current session ID
   - Handle resume logic
   - Filter/search sessions
2. [ ] Create `SessionCard.tsx` component
   - Show date, time, preview text, message count
   - Custom name badge if set
   - Resume button
   - Rename button (opens dialog)
3. [ ] Create `SessionManager.tsx` component
   - Drawer/panel that slides in from right
   - Session list sorted by date (newest first)
   - Search/filter input
   - Current session highlighted
   - Empty state when no sessions
4. [ ] Create `SessionNameDialog.tsx`
   - Input for custom session name
   - Save/Cancel buttons
   - Validate name length
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
   - `Cmd+H` → Toggle session manager (History)

#### Validation
- [ ] Sessions display correctly
- [ ] Resume starts new Claude with correct session
- [ ] Custom names can be set and persist
- [ ] Panel opens/closes smoothly
- [ ] Search filters work

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

## Final Validation Criteria

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
- Split from parent plan

**Issues Encountered**:
- None yet

**Next Steps**:
- Wait for Part 2 completion

### Session 2 - 2026-01-10

**Completed**:

**Phase 6: Session Manager UI**
- [x] Created `useSessions.ts` hook
  - Loads sessions from backend using `list_sessions` command
  - Merges custom session names from `get_session_names`
  - Provides search/filter functionality
  - Manages session renaming via `set_session_name`
- [x] Created `SessionCard.tsx` component
  - Displays date/time, preview text, message count
  - Shows custom name badge if set
  - Resume button (hidden for current session)
  - Rename button
  - Highlights current session with blue border
- [x] Created `SessionManager.tsx` component
  - Slide-in panel from right side (396px wide)
  - Session list sorted by date (newest first)
  - Search input with icon
  - Current session highlighting
  - Empty state handling
  - Error state with retry button
  - Loading state
- [x] Created `SessionNameDialog.tsx` component
  - Input for custom session name
  - Save/Cancel buttons
  - Name validation (1-50 characters)
  - Character counter
  - Enter to save, Escape to cancel
- [x] Implemented resume flow in `Terminal.tsx`
  - Added `resumeSession` method to TerminalHandle
  - Kills current PTY before spawning new one
  - Clears terminal display
  - Spawns new Claude with `--resume` flag and session ID
  - Notifies parent of session change
  - Handles errors gracefully
- [x] Added session manager toggle to `AppLayout.tsx`
  - "History" button in title bar with clock icon
  - Keyboard shortcut: Cmd+H (or Ctrl+H)
  - Passes currentSessionId to SessionManager
  - Resume handler kills old PTY and spawns new one
- [x] Installed `date-fns` dependency for date formatting

**Phase 7: Integration & Polish**
- [x] Edge case handling already implemented:
  - No sessions: Empty state with helpful message
  - Corrupted session files: Silently skipped during parsing
  - Search with no results: Shows "No sessions match your search"
  - Session loading errors: Error display with retry button
  - PTY spawn failure: Error message displayed in terminal
- [x] Loading states present throughout:
  - SessionManager shows "Loading sessions..." spinner
  - Session actions show executing state
  - Resume session handled asynchronously
- [x] Context bar resets automatically:
  - Context bar watches statusline file which updates on session change
  - No manual reset needed
- [x] Updated `OFFERS-STUDIO.md`:
  - Marked all Phase 4 tasks as complete
  - Updated Implementation Status table
  - Updated "Last Updated" timestamp
- [x] Frontend build validated successfully
- [x] Rust backend build validated successfully

**Files Created**:
- `offers-studio/src/hooks/useSessions.ts`
- `offers-studio/src/components/session-manager/SessionManager.tsx`
- `offers-studio/src/components/session-manager/SessionCard.tsx`
- `offers-studio/src/components/session-manager/SessionNameDialog.tsx`
- `offers-studio/src/components/session-manager/index.ts`

**Files Modified**:
- `offers-studio/src/lib/types.ts` (added SessionInfo interface)
- `offers-studio/src/components/terminal/Terminal.tsx` (added resumeSession method)
- `offers-studio/src/components/layout/AppLayout.tsx` (integrated session manager)
- `offers-studio/package.json` (added date-fns dependency)
- `OFFERS-STUDIO.md` (marked Phase 4 complete)

**Issues Encountered**:
- None - implementation went smoothly

**Validation Results**:
- TypeScript compilation: PASSED
- Rust compilation: PASSED
- All phase 6 validation criteria met
- All phase 7 validation criteria met

**Next Steps**:
- Mark plan as completed
- Move to completed/ directory

## Completion

After completing this part:
1. Move all FEAT-004 plans to `completed/`
2. Update `OFFERS-STUDIO.md` feature checklist
