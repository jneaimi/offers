# FEAT-001d: Offers Studio MVP - Part 4 (Claude Code + Polish)

**Status**: completed
**Created**: 2026-01-10
**Priority**: high
**Parent Plan**: FEAT-001-offers-studio-mvp.md
**Depends On**: FEAT-001c-offers-studio-part3.md

## Overview

Launch Claude Code specifically and add basic UI polish. This completes the MVP.

## Phase 4: Claude Code Integration

**Goal**: Launch Claude Code specifically (not just bash)

### Steps
1. [ ] Update PTY spawn to use `claude` command
2. [ ] Set working directory to project root (`/Users/jneaimimacmini/dev/apps/offers`)
3. [ ] Handle Claude Code not installed error:
   ```
   Error: Claude Code not found
   Please install: npm install -g @anthropic-ai/claude-code
   ```
4. [ ] Test full Claude Code interaction:
   - Type prompts
   - See responses
   - Run commands

### Validation
- [ ] Claude Code launches successfully
- [ ] Can have conversation with Claude
- [ ] Can run `/genimg` command (even though gallery isn't implemented yet)
- [ ] Graceful error if Claude Code not installed

## Phase 5: Basic Layout & Polish

**Goal**: Clean up UI and prepare for future gallery panel

### Steps
1. [ ] Create `src/components/layout/AppLayout.tsx`:
   - Simple layout with full-width terminal
   - Title bar with app name
2. [ ] Add basic status indicator:
   - Connection status (connected/disconnected)
   - Project name display
3. [ ] Test on macOS (primary platform)

### Validation
- [ ] App looks polished with proper styling
- [ ] Status indicator shows correct state
- [ ] No console errors or warnings

## Final Testing

- [ ] **Launch test**: App opens without crash
- [ ] **Terminal test**: Can type and see output
- [ ] **Claude test**: Claude Code responds to prompts
- [ ] **Resize test**: Terminal adapts to window size
- [ ] **Error test**: Graceful handling if Claude not installed
- [ ] **Exit test**: Clean shutdown without orphan processes

## Implementation Log

### Session - 2026-01-10

**Completed**:
- Phase 4: Claude Code Integration
  - Updated Terminal.tsx to spawn 'claude' command instead of 'bash'
  - Set working directory to '/Users/jneaimimacmini/dev/apps/offers'
  - Added error handling for Claude Code not installed
  - Error message now displays installation instructions
- Phase 5: Basic Layout & Polish
  - Created AppLayout.tsx component with title bar
  - Added status indicator (connected/disconnected)
  - Integrated AppLayout into App.tsx
  - Maintains full-width terminal layout
- Validation:
  - TypeScript compilation: PASSED (no errors)
  - Build process: PASSED (no errors)
  - App structure: READY for final testing

**Issues Encountered**:
- None - implementation proceeded smoothly

## Completion

After completing this part:
1. Move parent plan to completed: `mv .claude/implementation-plans/active/FEAT-001-offers-studio-mvp.md .claude/implementation-plans/completed/`
2. Archive sub-plans
