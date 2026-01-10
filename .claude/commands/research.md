---
description: Deep codebase exploration and pattern understanding
arguments:
  question:
    description: Research question or exploration goal
    required: true
---

# Research Command

Thoroughly explore the codebase to answer questions and find patterns.

## Usage

```
/research <question>
```

**Examples:**
```bash
/research How does the prompt optimization work?
/research Where is the Gemini API called?
/research What patterns are used for error handling?
/research How are images saved and named?
```

## Instructions

When the user invokes `/research <question>`:

### Step 1: Parse the Question

Identify:
- **Subject**: What are we researching?
- **Scope**: Specific file, component, or entire codebase?
- **Depth**: Overview or detailed implementation?

### Step 2: Check Knowledge Base First

```bash
# The answer might already be documented
grep -r "{keywords}" .claude/knowledge-base/
```

If found in KB, return the documented answer with file reference.

### Step 3: Search Codebase

Use multiple search strategies:

```bash
# Find files by pattern
ls -la /Users/jneaimimacmini/dev/apps/offers/*.py

# Search for keywords
grep -r "{keyword}" /Users/jneaimimacmini/dev/apps/offers/ --include="*.py"

# Search for function/class names
grep -r "def {name}\|class {name}" /Users/jneaimimacmini/dev/apps/offers/
```

### Step 4: Read Relevant Files

Read files that match the search:
- Focus on the most relevant sections
- Note file paths and line numbers
- Extract key code patterns

### Step 5: Synthesize Findings

Combine findings into a coherent answer.

## Output Format

```markdown
## Research Results

**Question**: {original question}

---

### Summary
[1-2 sentence direct answer to the question]

### Key Files
| File | Line | Description |
|------|------|-------------|
| `generate-image.py` | 234 | Main API call location |
| `generate-image.py` | 156 | Error handling |

### Patterns Found

#### [Pattern Name]
```python
# Relevant code snippet (brief)
```

[Explanation of the pattern]

### Architecture Notes
[Any architectural insights discovered]

### Related Knowledge Base Entries
- [Entry Title](path/to/entry.md) - relevance
- Or: "None found - consider documenting with `/kb-add`"

### Recommendations
[If applicable, suggest next steps or improvements]

---

### KB Gap Identified?
📝 If this research revealed something valuable not in the KB:
"This finding should be documented. Run `/kb-add` to create an entry."
```

## Research Depth Levels

### Quick (default)
- Search for direct matches
- Read 1-2 most relevant files
- Return concise answer

### Deep (for complex questions)
- Search across entire codebase
- Read all related files
- Map dependencies and relationships
- Return comprehensive analysis

Trigger deep research when:
- Question involves multiple components
- User asks "how does X work with Y"
- Question asks about architecture

## Context Efficiency

### Minimize Token Usage
- Don't read entire files - focus on relevant sections
- Quote only essential code snippets
- Summarize patterns rather than showing all instances

### Maximize Value
- Always include file paths with line numbers
- Note gaps in documentation
- Suggest follow-up actions

## Integration with Other Commands

Research often leads to:
- `/kb-add` - Document findings
- `/plan` - Plan implementation based on research
- `/review` - Review code against discovered patterns

## Error Handling

### Question Too Vague
If the question is too broad:
```markdown
Your question is quite broad. Could you be more specific?

For example, instead of "How does it work?" try:
- "How does prompt optimization work?"
- "Where is the Gemini API called?"
- "What happens when rate limits are hit?"
```

### No Results Found
If search yields nothing:
```markdown
I couldn't find relevant code for "{question}".

**Suggestions:**
- Check if the feature exists yet
- Try searching with different keywords
- Look at the project structure: `tree -L 2`
```

### Large Codebase Warning
If many files match:
```markdown
Found {count} matching files. Focusing on the most relevant:
1. [Primary file] - Main implementation
2. [Secondary file] - Helper/utility
3. [Config file] - Configuration

For exhaustive search, narrow your question.
```

## Common Failure Modes

| Failure | Cause | Recovery |
|---------|-------|----------|
| Too many results | Vague keyword | Use more specific terms |
| No results | Typo or wrong term | Check spelling, try synonyms |
| Wrong files | Keyword too generic | Add context (e.g., "gemini api" not just "api") |
| Incomplete answer | Question too complex | Break into smaller questions |
