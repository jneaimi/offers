# Claude Code Statusline Configuration

**Status**: resolved
**Severity**: medium
**Tags**: claude-code, statusline, configuration, context-tracking
**Created**: 2026-01-11
**Last Updated**: 2026-01-11

## Symptoms

- Statusline script is never invoked by Claude Code
- Context bar shows 0/0 0% even after chatting
- Temp file (`/tmp/offers-studio-context.json`) is never created
- No debug log entries appear

## Error Messages

No explicit error - the script simply isn't called.

## Root Cause

**Incorrect settings.json format**. The statusline setting requires:
1. camelCase property name: `statusLine` (not `statusline`)
2. Object structure with `type` and `command` fields (not a string path)

**Wrong format:**
```json
{
  "statusline": "/path/to/script.sh"
}
```

**Correct format:**
```json
{
  "statusLine": {
    "type": "command",
    "command": "/path/to/script.sh"
  }
}
```

## Solution

### 1. Fix settings.json

Update `~/.claude/settings.json`:

```json
{
  "statusLine": {
    "type": "command",
    "command": "/Users/yourusername/.claude/statusline.sh"
  }
}
```

### 2. Create statusline script

The script receives JSON via stdin with nested fields:

```bash
#!/bin/bash
# ~/.claude/statusline.sh

INPUT=$(cat)

# Extract nested fields
MODEL=$(echo "$INPUT" | jq -r '.model.display_name // "Claude"')
INPUT_TOKENS=$(echo "$INPUT" | jq -r '.context_window.total_input_tokens // 0')
OUTPUT_TOKENS=$(echo "$INPUT" | jq -r '.context_window.total_output_tokens // 0')
CONTEXT_SIZE=$(echo "$INPUT" | jq -r '.context_window.context_window_size // 200000')

# Output status line (first line of stdout is displayed)
echo "$MODEL | Tokens: $((INPUT_TOKENS + OUTPUT_TOKENS)) / $CONTEXT_SIZE"
```

### 3. JSON Field Structure

Claude passes this JSON structure to the script via stdin:

```json
{
  "model": {
    "display_name": "Claude Opus 4"
  },
  "context_window": {
    "context_window_size": 200000,
    "total_input_tokens": 50000,
    "total_output_tokens": 10000,
    "current_usage": {
      "input_tokens": 5000,
      "cache_creation_input_tokens": 1000,
      "cache_read_input_tokens": 500
    }
  },
  "workspace": {
    "current_dir": "/path/to/project"
  }
}
```

### 4. Transform for External Use

To write transformed data for other apps to consume:

```bash
#!/bin/bash
INPUT=$(cat)

# Transform to flat structure and write to file
echo "$INPUT" | jq '{
  totalInputTokens: (.context_window.total_input_tokens // 0),
  totalOutputTokens: (.context_window.total_output_tokens // 0),
  contextWindowSize: (.context_window.context_window_size // 200000),
  percentage: ((((.context_window.total_input_tokens // 0) + (.context_window.total_output_tokens // 0)) / (.context_window.context_window_size // 200000)) * 100)
}' > /tmp/context-data.json

# Still output status line for Claude
echo "Status line text here"
```

### 5. Restart Claude Code

After updating settings, **completely restart Claude Code** (quit and reopen). The new instance will read the updated settings.

## Prevention

- Always use camelCase for Claude Code settings (`statusLine`, not `statusline`)
- Check official docs: https://code.claude.com/docs/en/statusline
- Test script manually before configuring:
  ```bash
  echo '{"model":{"display_name":"Test"}}' | ./statusline.sh
  ```

## Known Issues

- **Cumulative tokens bug**: `total_input_tokens` and `total_output_tokens` are session totals (all tokens ever), not current context window contents
- See: https://github.com/anthropics/claude-code/issues/13783

## Related Resources

- [Official Docs](https://code.claude.com/docs/en/statusline)
- [ccstatusline](https://github.com/sirmalloc/ccstatusline) - Community statusline tool
- [ccusage](https://ccusage.com/guide/statusline) - Usage tracking tool

## Verification

Test your configuration:

```bash
# Check if script is being called (after Claude sends a message)
cat /tmp/offers-studio-statusline-debug.log

# Check output format
cat /tmp/offers-studio-context.json
```

## Tags Index

- `claude-code` - Claude Code CLI configuration
- `statusline` - Statusline feature
- `configuration` - Settings/config issues
- `context-tracking` - Token/context usage tracking
