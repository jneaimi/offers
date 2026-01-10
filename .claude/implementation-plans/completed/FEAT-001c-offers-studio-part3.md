# FEAT-001c: Offers Studio MVP - Part 3 (PTY Integration)

**Status**: completed
**Created**: 2026-01-10
**Priority**: high
**Parent Plan**: FEAT-001-offers-studio-mvp.md
**Depends On**: FEAT-001b-offers-studio-part2.md

## Overview

Spawn shell process via PTY and connect to terminal. This enables real terminal functionality.

## Phase 3: PTY Integration (Rust)

**Goal**: Spawn Claude Code process and connect to terminal

### Steps
1. [x] Add PTY dependencies to `Cargo.toml`:
   ```toml
   [dependencies]
   portable-pty = "0.8"
   uuid = { version = "1", features = ["v4"] }
   ```
2. [x] Create `src-tauri/src/pty.rs`:
   - PTY manager that spawns processes
   - Handles stdin/stdout
   - Manages process lifecycle
3. [x] Create Tauri commands in `src-tauri/src/lib.rs`:
   - `spawn_pty(command, args, cwd, cols, rows)` -> returns PTY ID
   - `write_pty(id, data)` -> write to PTY stdin
   - `resize_pty(id, cols, rows)` -> resize PTY
   - `kill_pty(id)` -> terminate PTY
4. [x] Set up Tauri event emission for PTY stdout data
5. [x] Connect frontend Terminal component to PTY commands

### Validation
- [x] `spawn_pty("bash", [], "/tmp", 80, 24)` implemented and compiles
- [x] Terminal.onData handler writes to PTY via write_pty
- [x] PTY output emits via pty-data:{id} events to terminal
- [x] Terminal resize calls resize_pty with new dimensions

## Reference

See OFFERS-STUDIO.md for PTY reference implementation.

## Implementation Log

### Session - 2026-01-10

**Completed**:
- Added portable-pty 0.8 and uuid dependencies to Cargo.toml
- Created src-tauri/src/pty.rs with PTY manager implementation
  - PtyManager struct with spawn/write/resize/kill methods
  - Event emission for PTY data (pty-data:{id}) and exit (pty-exit:{id})
  - Thread-based I/O handling for stdout
- Created Tauri commands in lib.rs:
  - spawn_pty(command, args, cwd, cols, rows) -> PTY ID
  - write_pty(id, data) -> write to stdin
  - resize_pty(id, cols, rows) -> resize terminal
  - kill_pty(id) -> terminate process
- Connected frontend Terminal component to PTY:
  - Updated Terminal.tsx to use listen() for PTY events
  - Implemented onData handler to write user input to PTY
  - Added cleanup for event listeners
  - Configured to spawn bash shell for testing
- Rust backend compiles successfully
- Frontend builds successfully with no TypeScript errors

**Issues Encountered**:
- Initial compilation errors with unused imports (PtySystem, Manager) - fixed
- Child process needed to be mutable for wait() - fixed
- Cargo not in PATH - used full path ~/.cargo/bin/cargo

**Validation Status**:
- Code compiles successfully (both Rust and TypeScript)
- All Tauri commands registered correctly
- PTY event emission implemented
- Frontend Terminal component connected to backend
- Manual testing procedure documented in TESTING.md
- Ready for runtime validation via `npm run tauri dev`

**Files Created/Modified**:
- src-tauri/Cargo.toml (added portable-pty, uuid dependencies)
- src-tauri/src/pty.rs (new file - PTY manager)
- src-tauri/src/lib.rs (added PTY commands and state)
- src/components/terminal/Terminal.tsx (connected to PTY backend)
- TESTING.md (new file - manual test procedure)

## Next Part

After completing this part, run:
```
/implement FEAT-001d-offers-studio-part4.md
```
