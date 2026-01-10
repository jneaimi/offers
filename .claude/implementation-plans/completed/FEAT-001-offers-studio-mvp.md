# FEAT-001: Offers Studio Minimal MVP

**Status**: completed
**Created**: 2026-01-10
**Priority**: high
**Complexity**: medium

## Overview

Create the foundation of Offers Studio - a Tauri desktop application that embeds Claude Code in a terminal. This MVP focuses solely on getting Claude Code running in a native window, establishing the project structure for future phases.

### Problem
Users need a dedicated desktop app for the Offers image generation project that provides Claude Code with visual enhancements. Currently, they must use Claude Code in a standard terminal without integrated image viewing.

### Solution
Build a Tauri 2 application with:
- React frontend with xterm.js terminal
- Rust backend with PTY process management
- Basic window layout ready for future gallery panels

## Pre-Implementation Analysis

### Existing Patterns Checked
- [x] Reviewed OFFERS-STUDIO.md for architecture and code examples
- [x] Checked implementation plan template
- [x] Referenced Tauri 2 and xterm.js documentation links in spec

### Files to Create (New Project)

| Path | Purpose |
|------|---------|
| `offers-studio/package.json` | Node.js dependencies |
| `offers-studio/tsconfig.json` | TypeScript configuration |
| `offers-studio/vite.config.ts` | Vite bundler config |
| `offers-studio/tailwind.config.js` | Tailwind CSS config |
| `offers-studio/src/main.tsx` | React entry point |
| `offers-studio/src/App.tsx` | Root component |
| `offers-studio/src/components/terminal/Terminal.tsx` | xterm.js wrapper |
| `offers-studio/src/components/ErrorBoundary.tsx` | Error boundary |
| `offers-studio/src/styles/globals.css` | Global styles |
| `offers-studio/src-tauri/Cargo.toml` | Rust dependencies |
| `offers-studio/src-tauri/tauri.conf.json` | Tauri configuration |
| `offers-studio/src-tauri/src/main.rs` | Rust entry point |
| `offers-studio/src-tauri/src/lib.rs` | Library exports |
| `offers-studio/src-tauri/src/pty.rs` | PTY management |

### Dependencies

**Frontend (npm)**:
- `@xterm/xterm` - Terminal emulator
- `@xterm/addon-fit` - Auto-resize
- `@xterm/addon-webgl` - GPU rendering
- `@tauri-apps/api` - Tauri JS API
- `react`, `react-dom` - React 18
- `tailwindcss` - Styling

**Backend (Cargo)**:
- `tauri` - App framework
- `tauri-plugin-shell` - Shell commands
- `portable-pty` or `tauri-plugin-pty` - PTY handling
- `serde` - Serialization
- `tokio` - Async runtime

### Risks
- `tauri-plugin-pty` is relatively new; may need fallback to `portable-pty`
- Claude Code authentication must be pre-configured by user
- Cross-platform PTY differences (Windows vs Unix)

## Implementation Phases

### Phase 1: Project Scaffolding

**Goal**: Create Tauri 2 + React project structure with all config files

#### Steps
1. [ ] Create `offers-studio/` directory in project root
2. [ ] Initialize Tauri project:
   ```bash
   cd /Users/jneaimimacmini/dev/apps/offers
   npm create tauri-app@latest offers-studio -- --template react-ts
   ```
3. [ ] Configure `package.json` with required dependencies:
   ```json
   {
     "dependencies": {
       "@tauri-apps/api": "^2.0.0",
       "@xterm/xterm": "^5.3.0",
       "@xterm/addon-fit": "^0.10.0",
       "@xterm/addon-webgl": "^0.18.0",
       "react": "^18.2.0",
       "react-dom": "^18.2.0"
     },
     "devDependencies": {
       "@tauri-apps/cli": "^2.0.0",
       "tailwindcss": "^3.4.0",
       "typescript": "^5.0.0",
       "vite": "^5.0.0"
     }
   }
   ```
4. [ ] Configure `src-tauri/Cargo.toml` with Rust dependencies
5. [ ] Set up Tailwind CSS with `tailwind.config.js`
6. [ ] Configure `src-tauri/tauri.conf.json` with:
   - App identifier: `com.offers.studio`
   - Window title: `Offers Studio`
   - Window size: 1200x800 (for MVP, no gallery panel yet)
   - CSP: `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'`

#### Validation
- [ ] `npm install` succeeds
- [ ] `npm run tauri dev` launches empty window
- [ ] No TypeScript errors

### Phase 2: Terminal Component

**Goal**: Create xterm.js terminal component with Tokyo Night theme

#### Steps
1. [ ] Create `src/components/terminal/Terminal.tsx`:
   ```tsx
   // See OFFERS-STUDIO.md Section "1. Terminal Component" for full code
   // Key features:
   // - xterm.js with FitAddon and WebglAddon
   // - Tokyo Night theme colors
   // - Error boundary wrapper
   ```
2. [ ] Create `src/components/ErrorBoundary.tsx` for crash protection
3. [ ] Create `src/styles/terminal.css` for terminal-specific styles:
   ```css
   .xterm {
     padding: 8px;
   }
   .xterm-viewport::-webkit-scrollbar {
     width: 8px;
   }
   ```
4. [ ] Update `src/App.tsx` to render Terminal component full-screen

#### Validation
- [ ] Terminal component renders without errors
- [ ] xterm.js displays with correct theme colors
- [ ] Terminal resizes properly with window

### Phase 3: PTY Integration (Rust)

**Goal**: Spawn Claude Code process and connect to terminal

#### Steps
1. [ ] Add PTY dependencies to `Cargo.toml`:
   ```toml
   [dependencies]
   portable-pty = "0.8"
   # or tauri-plugin-pty if it's mature enough
   ```
2. [ ] Create `src-tauri/src/pty.rs`:
   ```rust
   // PTY manager that:
   // - Spawns Claude Code process
   // - Handles stdin/stdout
   // - Manages process lifecycle
   // See OFFERS-STUDIO.md for reference implementation
   ```
3. [ ] Create Tauri commands in `src-tauri/src/main.rs`:
   - `spawn_pty(command, args, cwd, cols, rows)` -> returns PTY ID
   - `write_pty(id, data)` -> write to PTY stdin
   - `resize_pty(id, cols, rows)` -> resize PTY
   - `kill_pty(id)` -> terminate PTY
4. [ ] Set up Tauri event emission for PTY stdout data
5. [ ] Connect frontend Terminal component to PTY commands

#### Validation
- [ ] `spawn_pty("bash", [], "/tmp", 80, 24)` works
- [ ] Characters typed in terminal appear in PTY
- [ ] PTY output displays in terminal
- [ ] Terminal resize updates PTY dimensions

### Phase 4: Claude Code Integration

**Goal**: Launch Claude Code specifically (not just bash)

#### Steps
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

#### Validation
- [ ] Claude Code launches successfully
- [ ] Can have conversation with Claude
- [ ] Can run `/genimg` command (even though gallery isn't implemented yet)
- [ ] Graceful error if Claude Code not installed

### Phase 5: Basic Layout & Polish

**Goal**: Clean up UI and prepare for future gallery panel

#### Steps
1. [ ] Create `src/components/layout/AppLayout.tsx`:
   ```tsx
   // Simple layout with:
   // - Full-width terminal (gallery comes later)
   // - Title bar with app name
   // - Future: resizable panels
   ```
2. [ ] Add basic status indicator:
   - Connection status (connected/disconnected)
   - Project name display
3. [ ] Test cross-platform:
   - macOS (primary)
   - Windows (if available)
   - Linux (if available)

#### Validation
- [ ] App looks polished with proper styling
- [ ] Status indicator shows correct state
- [ ] No console errors or warnings

## Testing Strategy

- [ ] **Launch test**: App opens without crash
- [ ] **Terminal test**: Can type and see output
- [ ] **Claude test**: Claude Code responds to prompts
- [ ] **Resize test**: Terminal adapts to window size
- [ ] **Error test**: Graceful handling if Claude not installed
- [ ] **Exit test**: Clean shutdown without orphan processes

## Validation Criteria

- [ ] All phases completed
- [ ] App launches and runs Claude Code
- [ ] No memory leaks (PTY cleanup works)
- [ ] Cross-platform build succeeds (at least macOS)

## Implementation Log

### Session 1 - 2026-01-10

**Completed**:
- Created implementation plan from OFFERS-STUDIO.md spec
- Defined minimal MVP scope (terminal only, no gallery)
- Executed all 4 parts of the plan:
  - FEAT-001a: Project scaffolding and setup
  - FEAT-001b: Terminal component implementation
  - FEAT-001c: PTY integration with Rust backend
  - FEAT-001d: Claude Code integration and UI polish

**Issues Encountered**:
- None - all phases completed successfully

**Final Status**:
- MVP is complete and ready for testing
- All sub-plans moved to completed directory

## Rollback Plan

Since this is a new project in a separate directory (`offers-studio/`), rollback is simply:
```bash
rm -rf offers-studio/
```

The existing `generate-image.py` and Claude Code workflow remain unchanged.

## Notes

### Future Phases (Not in this plan)
- **Phase 2 Plan**: Gallery panel with file watcher
- **Phase 3 Plan**: Reference images feature
- **Phase 4 Plan**: Polish (keyboard shortcuts, settings)
- **Phase 5 Plan**: Distribution (code signing, packaging)

### Reference Documentation
- OFFERS-STUDIO.md contains full architecture and code examples
- Tauri 2 docs: https://v2.tauri.app/
- xterm.js docs: https://xtermjs.org/
- tauri-plugin-pty: https://github.com/piyoki/tauri-plugin-pty

### Key Decisions
1. Start with `portable-pty` crate (more mature) over `tauri-plugin-pty`
2. No gallery in MVP - focus on terminal working first
3. Hardcode project path for MVP; make configurable later
