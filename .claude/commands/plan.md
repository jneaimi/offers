---
description: Create an implementation plan for a task (quick mode)
arguments:
  task:
    description: Description of the task to plan
    required: true
---

# Quick Plan Creation

Create a structured implementation plan for a development task.

**Note**: For complex features requiring research and user confirmation, use `/create-plan` instead.

## Usage

```
/plan <task description>
```

**Examples:**
```bash
/plan Add batch image generation support
/plan Fix rate limit handling in API calls
/plan Refactor prompt optimization logic
```

## Instructions

When the user invokes `/plan <task>`:

### Step 1: Read Framework

Invoke the plan-framework skill:
```
.claude/skills/plan-framework/instructions.md
```

### Step 2: Analyze Task

Determine:
- **Type**: FEAT / BUG / ENHANCE / REFACTOR
- **Complexity**: low / medium / high
- **Components affected**: api / generation / prompts / output

### Step 3: Search for Patterns

```bash
# Check for existing patterns
grep -r "{relevant keywords}" /Users/jneaimimacmini/dev/apps/offers/

# Check completed plans
ls .claude/implementation-plans/completed/

# Check knowledge base for related issues
grep -r "{keywords}" .claude/knowledge-base/
```

### Step 4: Determine Plan Number

```bash
# Find next available number
ls .claude/implementation-plans/active/ .claude/implementation-plans/completed/ 2>/dev/null | \
  grep -oE '(FEAT|BUG|ENHANCE)-[0-9]+' | \
  sort -t'-' -k2 -n | tail -1
```

Increment for new plan.

### Step 5: Create Plan

Use the template:
```
.claude/implementation-plans/templates/PLAN_TEMPLATE.md
```

Save to:
```
.claude/implementation-plans/active/{TYPE}-{XXX}-{short-description}.md
```

### Step 6: Fill Required Sections

- **Overview**: Problem + Solution (2-3 sentences)
- **Pre-Implementation Analysis**: Patterns found, KB issues
- **Files to Modify/Create**: With descriptions
- **Implementation Phases**: With steps and validation
- **Testing Strategy**: How to verify
- **Validation Criteria**: Definition of done

## Output Format

```markdown
## Plan Created

**File**: `.claude/implementation-plans/active/FEAT-001-batch-generation.md`
**Type**: Feature
**Phases**: 3
**Complexity**: medium

### Summary
Add batch processing capability to generate-image.py allowing users to generate multiple images from a list of prompts.

### Key Risks
- Rate limiting with multiple API requests
- Memory usage with large batches

### KB Issues Found
- [Rate Limit 429](../knowledge-base/api/rate-limit-429.md) - relevant

### Next Steps
1. Review the plan: `cat .claude/implementation-plans/active/FEAT-001-batch-generation.md`
2. Execute: `/implement FEAT-001-batch-generation.md`
```

## Plan Size Guidelines

Keep plans manageable:

| Metric | Limit |
|--------|-------|
| Tasks | ≤5 |
| Hours | ≤6 |
| Phases | ≤4 |

If larger, recommend using `/create-plan` which handles splitting.

## When to Use /plan vs /create-plan

| Use `/plan` | Use `/create-plan` |
|-------------|-------------------|
| Simple, well-defined tasks | Complex features |
| Requirements already clear | Need to extract from conversation |
| Quick prototyping | Multiple valid approaches |
| Single component | Cross-component changes |
