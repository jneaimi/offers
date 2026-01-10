---
description: Search the knowledge base for issues and solutions
arguments:
  query:
    description: Search terms or error message
    required: true
---

# Knowledge Base Search

Search the project knowledge base for relevant issues and solutions.

## Usage

```
/kb <search query>
```

**Examples:**
```bash
/kb rate limit
/kb "429 error"
/kb gemini timeout
/kb api key
/kb uv installation
```

## Instructions

When the user invokes `/kb <query>`:

### Step 1: Parse Query
Extract keywords from the query. Handle:
- Quoted phrases: `"exact match"`
- Error codes: `429`, `401`, `RESOURCE_EXHAUSTED`
- Component names: `gemini`, `prompt`, `generation`, `api`
- Common variations: `rate-limit` = `rate limit` = `ratelimit`

### Step 2: Search Index First
Check `.claude/knowledge-base/_index.md` for quick tag matches:
```
Use Grep tool with pattern matching for keywords in _index.md
```

### Step 3: Search KB Files
Use Grep to search across all KB entries:
```
Use Grep tool to find files matching keywords in .claude/knowledge-base/
```

**Search Order:**
1. Exact match in tags
2. Match in title
3. Match in symptoms/error messages
4. Match in solution content

### Step 4: Read Relevant Files
Read the most relevant files (max 3) to extract:
- Title (first H1)
- Tags (from metadata)
- Severity
- Solution summary (first 1-2 sentences from Solution section)

### Step 5: Return Formatted Results

## Output Format

```markdown
## Knowledge Base Search Results

**Query**: {query}
**Matches**: {count}

---

### [Entry Title]
**File**: `.claude/knowledge-base/category/file.md`
**Tags**: tag1, tag2
**Severity**: critical | high | medium | low
**Summary**: [1-2 sentence summary of the solution]

---

### [Entry Title 2]
...
```

### If No Matches Found
```markdown
## Knowledge Base Search Results

**Query**: {query}
**Matches**: 0

No matching entries found.

**Suggestions:**
- Try alternative keywords: {suggest related terms}
- Search by error code if you have one
- Check categories manually:
  - `api/` - API and authentication issues
  - `generation/` - Image generation issues
  - `general/` - Setup and configuration

**Create new entry?**
Run `/kb-add` to document this issue for future reference.
```

## Search Tips

| Query Type | Example | Searches |
|------------|---------|----------|
| Keyword | `rate limit` | File contents |
| Error code | `429` | Error messages |
| Tag | `gemini-api` | Tags in entries |
| Component | `generation` | Category + contents |
| Error text | `RESOURCE_EXHAUSTED` | Symptoms section |

## Error Handling

### Empty KB
If no entries exist yet:
```
The knowledge base is empty. Start documenting issues with /kb-add.
```

### Invalid Query
If query is too short (< 2 chars):
```
Please provide a more specific search term.
```

## Context Efficiency

- Use Grep's `files_with_matches` mode first to find candidate files
- Only read full content of matching files (max 3)
- Return summaries, not full content
- Provide file paths for user to read more if needed
- Prioritize by severity (critical/high entries first)
