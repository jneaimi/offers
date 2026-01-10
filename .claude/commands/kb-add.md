---
description: Document a new issue or solution in the knowledge base
arguments:
  description:
    description: Brief description of the issue (optional, will prompt if not provided)
    required: false
---

# Add Knowledge Base Entry

Document a new issue, solution, or pattern for future reference.

## Usage

```
/kb-add [description]
```

**Examples:**
```bash
/kb-add                           # Interactive mode
/kb-add Rate limit after 10 requests
/kb-add "API key validation error"
```

## Instructions

When the user invokes `/kb-add`:

### Step 1: Gather Information

If description not provided, ask:

```
I'll help document this issue. Please provide:

1. **What happened?** (error message or unexpected behavior)
2. **What was the solution?** (how did you fix it)
3. **Category**: api | generation | general
```

### Step 2: Determine Category

| Category | Use When |
|----------|----------|
| `api/` | Gemini API errors, rate limits, authentication |
| `generation/` | Image quality, prompt issues, output problems |
| `general/` | UV, dependencies, config, environment |

### Step 3: Extract Details

From the user's description, identify:
- **Title**: Short descriptive name
- **Tags**: 2-4 relevant tags
- **Severity**: critical / high / medium / low
- **Symptoms**: What was observed (exact errors)
- **Root Cause**: Why it happened
- **Solution**: How to fix it
- **Prevention**: How to avoid it

### Step 4: Create Entry

Read the kb-framework skill for template:
```
.claude/skills/kb-framework/instructions.md
.claude/skills/kb-framework/templates/ISSUE_TEMPLATE.md
```

Create the entry file:
```
.claude/knowledge-base/{category}/{lowercase-hyphenated-name}.md
```

### Step 5: Update Index

Add entry to `.claude/knowledge-base/_index.md`:
- Add to "Recent Additions" section
- Add to "Most Common Issues" if high-severity

## Output Format

```markdown
## Knowledge Base Entry Created

**File**: `.claude/knowledge-base/api/rate-limit-429.md`
**Tags**: gemini-api, rate-limit, medium
**Category**: api

### Entry Summary
Gemini API returns 429 after ~10 rapid requests. Solution: Add 2-second delay between requests.

---

Entry is now searchable via `/kb rate limit` or `/kb 429`.
```

## Draft Mode

If the issue isn't solved yet, create a draft entry:

```markdown
# [DRAFT] Issue Title

**Status**: investigating
...

**TODO**: Add solution when found
```

File naming: `draft-{issue-name}.md`

When solved, finalize by:
1. Adding solution sections
2. Removing `[DRAFT]` prefix
3. Renaming file (remove `draft-` prefix)
4. Updating status to `resolved`

## Quality Checklist

Before creating the entry, verify:
- [ ] Title is descriptive
- [ ] Exact error message included
- [ ] Solution is copy-pasteable
- [ ] Tags are appropriate
- [ ] Severity matches impact
