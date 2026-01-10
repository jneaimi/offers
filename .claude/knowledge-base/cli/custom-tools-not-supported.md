# Claude CLI Custom Tools Not Supported in --print Mode

**Category**: CLI
**Severity**: Medium
**Status**: Documented
**Date**: 2026-01-07

## Issue

The Claude CLI in `--print` mode does not support custom tool definitions like the Anthropic SDK does. When using `claude --print --system-prompt`, you cannot pass custom tools that will be automatically invoked by the CLI.

## Symptoms

- Timeouts when expecting tool execution
- CLI responds with text but doesn't invoke custom tools
- No `tool_use` blocks in output even with tool definitions in system prompt

## Root Cause

The Claude CLI's `--print` mode is designed for stateless, single-turn interactions. It has its own built-in set of tools (Read, Write, Edit, Bash, etc.) but doesn't support custom tool definitions via API.

## Solution

**For hybrid auth implementation:**

1. **SDK Path** (Recommended for tool calling): Use Anthropic SDK when custom tools are needed
2. **CLI Path** (Text-only responses): Use CLI for basic chat without tool execution
3. **Manual Tool Parsing**: Parse CLI text output and manually trigger tools based on intent

### Approach: Manual Tool Parsing

```typescript
// CLI responds with text about generating an image
const response = await chatWithCli(messages);

// Parse the response for image generation intent
if (response.content.includes("generate") && response.content.includes("image")) {
  // Manually trigger image generation
  const result = await executeImageGeneration({
    prompt: extractPromptFromResponse(response.content),
    // ... other parameters
  });
}
```

## Workaround for Part 1

The current implementation in `claude-cli-handler.ts` has infrastructure for tool parsing, but it won't work automatically. For Part 1 completion:

1. CLI detection works perfectly ✓
2. CLI chat works for text responses ✓
3. Tool execution infrastructure exists ✓
4. Automatic tool invocation doesn't work (by design) ⚠️

## Recommended Path Forward

For **FEAT-002 Hybrid Auth**:
- Part 1: Mark as complete with documentation of limitation
- Part 2: Implement API integration with SDK (which supports tools properly)
- Part 3: Use CLI for simple queries, SDK for tool-heavy operations

## Alternative Solution

Use the Anthropic SDK exclusively but check for Claude CLI authentication first:
```typescript
const cliReady = await isCliReady();
if (cliReady) {
  // User has Claude CLI authenticated - could use for local session management
  // But still use SDK for actual API calls with tool support
} else {
  // Fall back to API key from env
}
```

## Related Files

- `/Users/jneaimimacmini/dev/apps/offers/image-studio/src/lib/claude-cli-handler.ts`
- `/Users/jneaimimacmini/dev/apps/offers/image-studio/src/lib/claude-cli.ts`

## References

- Claude CLI help: `claude --help`
- Built-in tools: Read, Write, Edit, Bash, Glob, Grep, Task, WebFetch
- No support for custom tool schemas in --print mode
