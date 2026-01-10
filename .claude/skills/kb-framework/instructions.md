# Knowledge Base Framework - Instructions

A methodology for documenting issues, solutions, and patterns for future reference.

## When to Create Entries

### Create an Entry When:
- Issue took **>5 minutes to debug**
- Solution required **research or Googling**
- A **workaround** was needed
- Behavior was **unexpected**
- Pattern **wasn't documented**
- Error message was **cryptic**

### Skip Documentation When:
- Issue was trivial (typo, obvious fix)
- Solution is already well-documented online
- Issue is one-time and won't recur

## Documentation Triggers

| Trigger | Why Document |
|---------|--------------|
| Debugging took >5 minutes | Future time savings |
| Had to research/Google | Not obvious from code |
| Needed a workaround | Others will hit this |
| Behavior was unexpected | Prevent confusion |
| Pattern wasn't documented | Fill knowledge gap |

## Category Selection Guide

### Categories for Offers Project

| Category | Use For | Examples |
|----------|---------|----------|
| `api/` | Gemini API issues | Rate limits, auth errors, model responses |
| `generation/` | Image generation | Quality issues, prompt failures, output problems |
| `general/` | Cross-cutting concerns | UV, dependencies, config, environment |

### Choosing the Right Category

Ask: "Where would I look for this issue?"

- API returns error → `api/`
- Image looks wrong → `generation/`
- Can't run the script → `general/`

## Tag Conventions

### Standard Tags

**By Component:**
- `gemini-api` - Gemini API issues
- `image-generation` - Generation process
- `prompt` - Prompt engineering
- `uv` - UV package manager

**By Error Type:**
- `rate-limit` - Rate limiting errors
- `timeout` - Timeout errors
- `auth` - Authentication errors
- `validation` - Input validation errors

**By Severity:**
- `critical` - Blocks all work
- `high` - Significant impact
- `medium` - Workaround available
- `low` - Minor inconvenience

### Tagging Best Practices

- Use **2-4 tags** per entry
- Include at least one **component** tag
- Include **severity** tag
- Add **error type** if applicable

Example: `gemini-api, rate-limit, medium`

## Writing Guidelines

### Symptoms Section

**Be specific and exact:**

✅ Good:
```markdown
## Symptoms
- API returns HTTP 429 after approximately 10 requests
- Error message: "Resource exhausted: 429 Too Many Requests"
- Occurs when generating images in rapid succession
```

❌ Bad:
```markdown
## Symptoms
- API stops working
- Too many requests error
```

### Include Exact Error Messages

Always paste the **exact** error output:

```markdown
## Symptoms
```
google.api_core.exceptions.ResourceExhausted: 429 Resource has been
exhausted (e.g. check quota).
```
```

### Root Cause Section

Explain **WHY** the issue happens:

✅ Good:
```markdown
## Root Cause
Gemini API has a rate limit of ~10 requests per minute for the free tier.
Rapid successive calls exhaust this quota.
```

❌ Bad:
```markdown
## Root Cause
Too many requests.
```

### Solution Section

Must be **copy-pasteable**:

✅ Good:
```markdown
## Solution

Add a delay between API requests:

```python
import time

for prompt in prompts:
    result = generate_image(prompt)
    time.sleep(2)  # 2-second delay between requests
```

Or use the `--delay` flag:
```bash
uv run generate-image.py --prompt "..." --delay 2
```
```

❌ Bad:
```markdown
## Solution
Add some delay between requests.
```

### Prevention Section

Include **actionable checklist items**:

```markdown
## Prevention

- [ ] When generating multiple images, always use `--delay 2`
- [ ] Check current quota before batch operations
- [ ] Consider using the `--batch` flag which handles rate limiting
```

## Draft Entry Workflow

For issues not yet solved, use draft entries:

### 1. Create Draft

```markdown
# [DRAFT] Rate Limit Issue with Batch Generation

**Tags**: gemini-api, rate-limit
**Severity**: medium
**First Seen**: 2026-01-07
**Status**: investigating

## Symptoms
- API returns 429 after ~10 requests
- Occurs during batch generation

## What I've Tried
- Added 1 second delay - still fails
- Reduced batch size to 5 - still fails

## Notes
Investigating optimal delay value...

---
**TODO**: Add solution when found, then remove [DRAFT] and rename file
```

### 2. Finalize When Solved

1. Add Root Cause, Solution, Prevention sections
2. Update Status to "resolved"
3. Remove `[DRAFT]` from title
4. Rename file: `draft-rate-limit.md` → `rate-limit-429.md`
5. Update `_index.md` with tags

## File Naming

Use lowercase-hyphenated names:

```
{descriptive-name}.md
```

Examples:
- `rate-limit-429.md`
- `invalid-api-key.md`
- `image-quality-low-resolution.md`

For drafts:
- `draft-rate-limit-issue.md`

## Updating the Index

After creating an entry, update `_index.md`:

```markdown
### Most Common Issues
1. [Rate Limit Exceeded](api/rate-limit-429.md) - `429` errors
2. [Invalid API Key](api/invalid-api-key.md) - Auth failures
3. [NEW ENTRY HERE]

### Recent Additions
- 2026-01-07: [Rate Limit 429](api/rate-limit-429.md)
```

## Linking Related Entries

Connect related documentation:

```markdown
## Related

- [Batch Processing Rate Limits](../api/batch-rate-limits.md)
- [Implementation Plan: FEAT-001](../../implementation-plans/completed/FEAT-001-batch.md)
```

## Template Usage

Use `ISSUE_TEMPLATE.md` for all new entries.

Required sections:
- Title with tags
- Symptoms (with exact errors)
- Root Cause
- Solution (copy-pasteable)
- Prevention (checklist)

## Quick Reference

### Creating a New Entry

1. Determine category: `api/`, `generation/`, or `general/`
2. Copy template: `cp ISSUE_TEMPLATE.md {category}/{name}.md`
3. Fill all sections
4. Update `_index.md`

### Searching Entries

```bash
# By keyword
grep -r "rate limit" .claude/knowledge-base/

# By tag
grep -r "Tags:.*rate-limit" .claude/knowledge-base/

# By category
ls .claude/knowledge-base/api/
```

### Entry Quality Checklist

- [ ] Title is descriptive
- [ ] Tags are appropriate (2-4)
- [ ] Severity is set
- [ ] Symptoms include exact error messages
- [ ] Root cause explains WHY
- [ ] Solution is copy-pasteable
- [ ] Prevention has actionable items
- [ ] Index is updated

## Common Errors and Recovery

### Entry Creation Errors

| Error | Cause | Solution |
|-------|-------|----------|
| "Duplicate entry" | Similar issue exists | Search first, update existing entry instead |
| "Wrong category" | Misclassified issue | Move file to correct category directory |
| "Missing sections" | Incomplete template | Add all required sections |
| "Vague symptoms" | Not specific enough | Include exact error messages |

### Search Errors

| Error | Cause | Solution |
|-------|-------|----------|
| "No results" | Wrong keywords | Try synonyms, error codes |
| "Too many results" | Vague search | Add more specific terms |
| "Entry outdated" | Old information | Update entry with current solution |

### Recovery Patterns

**When KB entry doesn't help:**
```
1. Entry may be outdated - check First Seen date
2. Your context may differ - check Symptoms match
3. Solution may need updating - edit with new info
4. Create new entry if fundamentally different
```

**When entry conflicts with reality:**
```
1. Don't delete - may help others
2. Add "Status: outdated" if superseded
3. Create new entry with current solution
4. Link old to new: "See also: [Updated Solution]"
```

## Maintenance Tasks

### Periodic Review
- Remove draft entries older than 30 days without solutions
- Merge duplicate entries
- Update solutions that have better approaches
- Archive entries for deprecated features

### Quality Improvements
- Add missing error messages to Symptoms
- Make Solutions more copy-pasteable
- Add Prevention checklists
- Cross-link Related entries
