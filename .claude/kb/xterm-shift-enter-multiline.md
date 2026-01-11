# xterm.js Shift+Enter for Multiline Input

## Problem

When using xterm.js as a terminal emulator (e.g., in a Tauri app), Shift+Enter doesn't work for multiline input in Claude Code CLI. Both Enter and Shift+Enter send the same character (`\r` carriage return), causing immediate submission instead of inserting a newline.

## Root Cause

xterm.js is a terminal emulator that follows standard terminal behavior:
- Enter sends `\r` (carriage return)
- Shift+Enter also sends `\r` by default (no differentiation)

Claude Code CLI expects the **kitty keyboard protocol** sequence for Shift+Enter to insert a newline without submitting.

## Solution

Use `attachCustomKeyEventHandler` to intercept Shift+Enter and send the kitty keyboard protocol sequence instead:

```typescript
// After term.open(), add:
term.attachCustomKeyEventHandler((event) => {
  if (event.key === 'Enter' && event.shiftKey) {
    if (event.type === 'keydown' && ptyIdRef.current) {
      invoke('write_pty', { id: ptyIdRef.current, data: '\x1b[13;2u' });
    }
    return false; // Block ALL Shift+Enter events from xterm
  }
  return true; // Let xterm handle other keys
});
```

## Key Points

1. **Block all event types**: Return `false` for all Shift+Enter events (keydown, keypress, keyup), not just keydown. Otherwise, xterm processes the keypress and sends `\r` after you've already sent the newline sequence, causing a "newline then immediate submit" behavior.

2. **Only send on keydown**: Send the escape sequence only on `keydown` to avoid duplicate sends.

3. **Kitty keyboard protocol**: The sequence `\x1b[13;2u` means:
   - `\x1b[` - CSI (Control Sequence Introducer)
   - `13` - Key code for Enter
   - `;2` - Modifier 2 (Shift)
   - `u` - Terminator for kitty protocol

## Tags

- xterm.js
- terminal
- keyboard
- shift-enter
- multiline
- kitty-protocol
- tauri
- claude-code

## Related Files

- `offers-studio/src/components/terminal/Terminal.tsx`
