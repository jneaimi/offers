---
description: Create a comprehensive implementation plan from conversation context
arguments:
  plan_name:
    description: Optional plan name (e.g., FEAT-batch-generation)
    required: false
allowed-tools: Read, Write, Glob, Grep, Bash, Task, TodoWrite, AskUserQuestion
---

# Create Implementation Plan

Transform your conversation into a comprehensive, AI-executable implementation plan.

**This is the recommended way to create plans** - it extracts requirements from the conversation, confirms with the user, then generates a comprehensive plan.

## Usage

```
/create-plan [plan-name]
```

**Examples:**
```bash
/create-plan FEAT-batch-generation
/create-plan BUG-rate-limit-handling
/create-plan ENHANCE-prompt-optimization
```

---

## Phase 1: Context Extraction

### Step 1.1: Summarize Conversation

Extract from the current conversation:

```markdown
## Extracted Requirements

### Feature Overview
- **Title**: [Feature name]
- **Type**: Feature | Bug Fix | Enhancement | Refactor
- **Component**: [api | generation | prompts | output | general]

### Problem Statement
[What problem are we solving?]

### Requirements
1. [Requirement 1]
2. [Requirement 2]
3. [Requirement 3]

### Constraints/Decisions Made
- [Any decisions made during conversation]
- [Technical constraints discussed]

### Out of Scope
- [What was explicitly excluded]
```

### Step 1.2: Detect Feature Type

Analyze the requirements to identify which integrations are needed:

```javascript
AskUserQuestion({
  questions: [
    {
      header: "Feature Type",
      question: "Which integrations does this feature need?",
      options: [
        { label: "Gemini API", description: "Calls Gemini API (rate limits, auth, models)" },
        { label: "Image Pipeline", description: "Modifies image generation pipeline" },
        { label: "Prompt Engineering", description: "Changes prompt construction/optimization" },
        { label: "Output Handling", description: "Changes how images are saved/named/organized" }
      ],
      multiSelect: true
    }
  ]
})
```

**Feature Type Flags** (set based on analysis):
- `uses_gemini_api`: true if making API calls (watch for rate limits, error handling)
- `modifies_pipeline`: true if changing the generation flow
- `changes_prompts`: true if modifying prompt construction
- `changes_output`: true if modifying file saving/naming

### Step 1.3: User Confirmation

Use AskUserQuestion to confirm requirements:

```javascript
AskUserQuestion({
  questions: [
    {
      header: "Requirements",
      question: "I've extracted these requirements. Are they correct?",
      options: [
        { label: "Yes, proceed", description: "Requirements are accurate" },
        { label: "Need edits", description: "I'll provide corrections" }
      ],
      multiSelect: false
    }
  ]
})
```

If user needs edits, incorporate their feedback before proceeding.

---

## Phase 2: Comprehensive Research

### Step 2.1: Search Codebase

```bash
# Find relevant files
grep -r "{feature keywords}" /Users/jneaimimacmini/dev/apps/offers/

# Check existing patterns
ls -la /Users/jneaimimacmini/dev/apps/offers/*.py
```

### Step 2.2: Check Knowledge Base

```bash
# Search for related issues
grep -r "{keywords}" .claude/knowledge-base/
```

Document:
- Relevant KB entries found
- Potential issues to watch for

### Step 2.3: Check Completed Plans

```bash
# Find similar completed plans
ls .claude/implementation-plans/completed/ | grep -i "{component}\|{feature}"
```

Document:
- Similar patterns used
- Lessons learned

---

## Phase 3: Task Breakdown

### Step 3.1: Gap Analysis

Based on research, identify what needs to be done:

| Gap | Solution Type | Pattern From |
|-----|---------------|--------------|
| [missing piece] | Extend existing | [file path] |
| [missing piece] | New code | [pattern file] |

Apply minimal change hierarchy:
1. Configuration change
2. One-line fix
3. Function addition
4. File modification
5. New file (following pattern)
6. New module (justify if needed)

### Step 3.2: Task Sizing

Break into tasks of 1-4 hours each:

- **API tasks** (Gemini integration, error handling)
- **Pipeline tasks** (generation flow modifications)
- **Prompt tasks** (prompt construction changes)
- **Output tasks** (file handling, naming)
- **Testing tasks** (validation, edge cases)

Each task must have:
- Clear acceptance criteria
- Pattern file to follow (if applicable)
- Risk considerations

### Step 3.3: Dependency Ordering

Order tasks by dependencies:
```
Config → API → Pipeline → Prompts → Output → Testing
```

---

## Phase 4: Generate Plan

### Step 4.1: Determine Plan Number

```bash
# Find next available plan number
ls .claude/implementation-plans/active/ .claude/implementation-plans/completed/ 2>/dev/null | \
  grep -oE '(FEAT|BUG|ENHANCE)-[0-9]+' | \
  sort -t'-' -k2 -n | tail -1
```

Increment for new plan.

### Step 4.2: Create Plan File

Write to: `.claude/implementation-plans/active/{PLAN-ID}-{name}.md`

Use template from: `.claude/implementation-plans/templates/PLAN_TEMPLATE.md`

### Step 4.3: Generate Summary

Output summary for user:

```markdown
## Plan Created Successfully

**File**: `.claude/implementation-plans/active/{PLAN-ID}.md`

### Summary
- **Tasks**: {count} tasks
- **Complexity**: {low | medium | high}
- **Risk Level**: {low | medium | high}

### Integrations Detected
- ✅ Gemini API (rate limit handling included)
- ✅ Image Pipeline modifications
- etc.

### Research Highlights
- **Similar patterns**: {what was found}
- **KB issues**: {count or "None"}
- **Risks identified**: {list}

### Next Steps
1. Review the plan and adjust if needed
2. Run `/implement {PLAN-ID}` to execute
```

---

## Context Management

### For Long Conversations

If the conversation is very long:

1. **Extract key points only** - Not replicate entire conversation
2. **Summarize decisions** - Capture what was decided, not the discussion
3. **Reference conversation** - Note that details came from conversation
4. **Ask for confirmation** - Verify extracted requirements before proceeding

### Self-Contained Output

The generated plan contains ALL context needed for implementation:
- Requirements from conversation
- Research findings
- Patterns to follow
- Known issues from KB

This means the **plan is self-contained** - a new session can implement it without needing the original conversation.

---

## Error Handling

### Missing Information

If critical information is missing from conversation:

```javascript
AskUserQuestion({
  questions: [
    {
      header: "Missing Info",
      question: "What {specific detail} should be used?",
      options: [
        { label: "Option A", description: "..." },
        { label: "Option B", description: "..." }
      ]
    }
  ]
})
```

### High-Risk Changes

If the feature affects core functionality:

```markdown
⚠️ **High-Risk Change Detected**

This change affects core functionality: {what}

Recommendations:
1. Add extra testing tasks
2. Consider backup/rollback approach
3. Test with small inputs first

Proceed with plan creation? [Yes / Add more safeguards / Cancel]
```
