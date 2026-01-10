# Offers Studio - Testing Guide

## PTY Integration Test (Part 3)

### Prerequisites
- Node.js and npm installed
- Rust and cargo installed
- All dependencies installed (`npm install`)

### Test Procedure

#### 1. Start Development Server
```bash
cd /Users/jneaimimacmini/dev/apps/offers/offers-studio
npm run tauri dev
```

#### 2. Verify Terminal Loads
- Application window should open
- Terminal component should be visible
- Terminal should show bash prompt

#### 3. Test User Input
Type commands and verify they execute:
```bash
echo "Hello World"
ls -la
pwd
```

Expected results:
- Commands should appear as you type
- Output should display in the terminal
- Prompt should return after each command

#### 4. Test Terminal Features
- Test arrow keys (up/down for history, left/right for cursor)
- Test Tab completion
- Test Ctrl+C to interrupt a command
- Test Ctrl+L to clear screen

#### 5. Test Terminal Resize
- Resize the application window
- Verify terminal content reflows properly
- Run `echo $COLUMNS x $LINES` to verify PTY received resize

#### 6. Test Process Termination
- Type `exit` in the terminal
- Verify process exit message appears
- Close the application
- Reopen and verify new PTY spawns

### Validation Checklist

- [ ] Terminal renders correctly with proper colors/theme
- [ ] Bash prompt appears on startup
- [ ] User input is sent to PTY (typing works)
- [ ] PTY output displays in terminal
- [ ] Terminal resize updates PTY dimensions
- [ ] Process exit is handled gracefully
- [ ] No memory leaks (check with multiple open/close cycles)
- [ ] No console errors in DevTools

### Known Issues

1. **Current Configuration**: Using bash shell instead of Claude Code for initial testing
   - TODO: Update Terminal.tsx to spawn Claude Code in production
   - TODO: Bundle project files in resources directory

2. **Path**: Currently using /tmp as working directory
   - TODO: Use resourceDir() for bundled project files

### Next Steps

After validation passes:
1. Update plan status to "completed"
2. Move plan to `.claude/implementation-plans/completed/`
3. Proceed to Part 4: File Watcher Integration
