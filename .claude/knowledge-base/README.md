# Knowledge Base - Offers Project

A searchable repository of issues, solutions, and patterns.

## Quick Search

```bash
# Search by keyword
grep -r "keyword" .claude/knowledge-base/**/*.md

# Search by category
ls .claude/knowledge-base/api/
ls .claude/knowledge-base/generation/
ls .claude/knowledge-base/general/

# Check tag index
cat .claude/knowledge-base/_index.md
```

## Categories

| Category | Use For |
|----------|---------|
| api/ | Gemini API errors, rate limits, auth |
| generation/ | Image generation, prompts, quality |
| general/ | UV, config, environment, dependencies |

## Adding Entries

Use `/kb-add` or copy the template:
```bash
cp .claude/knowledge-base/ISSUE_TEMPLATE.md .claude/knowledge-base/{category}/{issue-name}.md
```

## Entry Format

See `_index.md` for tag conventions and ISSUE_TEMPLATE.md for format.
