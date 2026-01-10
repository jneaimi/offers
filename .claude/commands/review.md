---
description: Review code against project patterns and known issues
arguments:
  target:
    description: File path or "recent" for recently modified files
    required: false
---

# Review Command

Review code against project patterns, conventions, and known issues.

## Usage

```
/review [target]
```

**Examples:**
```bash
/review                          # Review recent changes
/review generate-image.py        # Review specific file
/review recent                   # Review recently modified files
```

## Instructions

When the user invokes `/review`:

### Step 1: Identify Target

**If no target specified:**
Check for recent changes:
```bash
# Find recently modified files
find /Users/jneaimimacmini/dev/apps/offers -name "*.py" -mtime -1
```

**If target specified:**
- Single file: Review that file
- "recent": Review files modified in last 24 hours
- Directory: Review all relevant files in directory

### Step 2: Read Project Patterns

Check existing codebase for patterns:
```bash
# Main script patterns
head -100 /Users/jneaimimacmini/dev/apps/offers/generate-image.py
```

Note:
- Error handling patterns
- Naming conventions
- Code organization
- Documentation style

### Step 3: Check Knowledge Base

Search for related issues:
```bash
grep -r "{file or feature keywords}" .claude/knowledge-base/
```

Identify:
- Known issues that might apply
- Patterns to follow/avoid
- Previous problems with similar code

### Step 4: Analyze Code

Review the target code for:

#### Code Quality
- [ ] Clear variable/function names
- [ ] Appropriate error handling
- [ ] No hardcoded values that should be configurable
- [ ] Proper type hints (if used in project)

#### Project Patterns
- [ ] Follows existing code organization
- [ ] Uses established patterns for API calls
- [ ] Consistent with project style

#### Known Issues
- [ ] Doesn't repeat documented mistakes
- [ ] Handles known edge cases
- [ ] Implements recommended practices from KB

#### Security & Safety
- [ ] No exposed secrets/API keys
- [ ] Input validation where needed
- [ ] Safe file operations

### Step 5: Generate Review

## Output Format

```markdown
## Code Review

**Target**: {file or "recent changes"}
**Files Reviewed**: {count}

---

### Summary
[1-2 sentence overall assessment]

### ✅ Good Practices Found
- [Specific positive finding with line reference]
- [Another positive finding]

### ⚠️ Suggestions
| Location | Issue | Recommendation |
|----------|-------|----------------|
| `file.py:42` | Hardcoded timeout | Use config variable |
| `file.py:78` | No error handling | Add try/except for API call |

### 🔴 Issues (if any)
- **[Critical]** `file.py:23` - API key exposed in code
- **[High]** `file.py:56` - Missing rate limit handling (see KB: rate-limit-429.md)

### KB Entries Referenced
- [Rate Limit 429](knowledge-base/api/rate-limit-429.md) - Relevant to API calls
- None found for {topic} - consider `/kb-add`

### Recommendations
1. [Specific actionable recommendation]
2. [Another recommendation]

---

**Overall**: ✅ Approved | ⚠️ Approved with suggestions | 🔴 Changes requested
```

## Review Checklist by File Type

### Python Files (.py)
- [ ] Imports organized (stdlib, third-party, local)
- [ ] Functions have docstrings (if complex)
- [ ] Error handling for external calls
- [ ] No bare except clauses
- [ ] Proper resource cleanup (files, connections)

### Configuration Files
- [ ] No hardcoded secrets
- [ ] Sensible defaults
- [ ] Comments for non-obvious settings

### Markdown Files
- [ ] Accurate and up-to-date
- [ ] Code examples work
- [ ] Links are valid

## Integration with KB

### During Review
- Reference relevant KB entries for issues found
- Note if code repeats a documented mistake
- Suggest KB entries for new patterns discovered

### After Review
If significant patterns discovered:
```markdown
📝 **KB Gap Identified**
This review found patterns not in the knowledge base:
- {pattern description}

Consider running `/kb-add` to document.
```

## Context Efficiency

### Focus Areas
- Only read relevant sections of large files
- Prioritize recently changed code
- Skip auto-generated or vendored code

### Output Brevity
- Limit to most important findings
- Group similar issues
- Provide file:line references for details
