# Implementation Guide - Quick Start

**Reference**: See `ARCHITECTURE-SPEC.md` for full details

---

## Current Status

- [x] Phase 0: Specification documented
- [ ] Phase 1: Foundation
- [ ] Phase 2: Skills
- [ ] Phase 3: Commands
- [ ] Phase 4: Agent Optimization
- [ ] Phase 5: Integration & Polish

---

## Starting a New Session

Copy and paste this to start implementing:

```
I'm continuing work on the Claude Code Enhancement Architecture for the offers project.

Please read:
1. .claude/ARCHITECTURE-SPEC.md - Full specification
2. .claude/IMPLEMENTATION-GUIDE.md - This file (current status)

Current phase: [PHASE NUMBER]
Task: [SPECIFIC TASK FROM PHASE]
```

---

## Phase 1: Foundation

### Commands to Create Directory Structure

```bash
# Run these commands to create the structure
mkdir -p .claude/commands
mkdir -p .claude/skills/plan-framework/templates
mkdir -p .claude/skills/kb-framework/templates
mkdir -p .claude/knowledge-base/api
mkdir -p .claude/knowledge-base/generation
mkdir -p .claude/knowledge-base/general
mkdir -p .claude/implementation-plans/templates
mkdir -p .claude/implementation-plans/active
mkdir -p .claude/implementation-plans/completed
```

### Files to Create

| File | Source in ARCHITECTURE-SPEC.md |
|------|--------------------------------|
| knowledge-base/README.md | Section: "knowledge-base/README.md" |
| knowledge-base/_index.md | Section: "knowledge-base/_index.md" |
| implementation-plans/README.md | Based on knowledge-base/README.md pattern |
| PLAN_TEMPLATE.md | Section: "PLAN_TEMPLATE.md" |
| ISSUE_TEMPLATE.md | Section: "ISSUE_TEMPLATE.md" |

### Validation Checklist

- [ ] All directories created
- [ ] knowledge-base/README.md exists and explains search
- [ ] knowledge-base/_index.md has tag structure
- [ ] PLAN_TEMPLATE.md has all sections
- [ ] ISSUE_TEMPLATE.md has all sections

---

## Phase 2: Skills

### Files to Create

| File | Description |
|------|-------------|
| skills/plan-framework/instructions.md | Planning methodology |
| skills/plan-framework/templates/PLAN_TEMPLATE.md | Copy from Phase 1 |
| skills/kb-framework/instructions.md | KB methodology |
| skills/kb-framework/templates/ISSUE_TEMPLATE.md | Copy from Phase 1 |

### Content Sources

- **plan-framework instructions**: See ARCHITECTURE-SPEC.md → "3.1 plan-framework Skill"
- **kb-framework instructions**: See ARCHITECTURE-SPEC.md → "3.2 kb-framework Skill"

### Validation Checklist

- [ ] plan-framework/instructions.md complete
- [ ] kb-framework/instructions.md complete
- [ ] Templates accessible in skill directories

---

## Phase 3: Commands

### Priority Order

1. `/kb` - Most immediately useful (search)
2. `/kb-add` - Complements /kb
3. `/create-plan` - **Primary planning** (extracts requirements, confirms with user, comprehensive)
4. `/plan` - Quick planning for simple tasks
5. `/research` - Codebase exploration
6. `/implement` - Plan execution
7. `/review` - Quality checks

### Key Difference: /create-plan vs /plan

| Command | Use When | Process |
|---------|----------|---------|
| `/create-plan` | Complex features, after discussion | Extracts requirements → Confirms with user → Research → Generate |
| `/plan` | Simple tasks, clear requirements | Direct planning (no confirmation step) |

**Recommendation**: Use `/create-plan` for most work - the confirmation step prevents misunderstandings.

### File Format

Each command is a `.md` file in `.claude/commands/` with:

```markdown
---
description: Brief description shown in /help
arguments:
  arg_name:
    description: What this argument does
    required: true/false
allowed-tools: Read, Write, Glob, Grep, Task, AskUserQuestion
---

# Command Name

[Instructions for Claude on how to handle this command]
```

### Content Sources

- See ARCHITECTURE-SPEC.md → "Command: /create-plan" for the comprehensive planning command
- See ARCHITECTURE-SPEC.md → "Command: /kb" for search command example
- Agent prompts in ARCHITECTURE-SPEC.md → "1. Agents" section

### Validation Checklist

- [ ] /kb command works
- [ ] /kb-add command works
- [ ] /create-plan command works (with user confirmation flow)
- [ ] /plan command works
- [ ] /research command works
- [ ] /implement command works
- [ ] /review command works

---

## Phase 4: Agent Optimization

### Testing Tasks

Test each workflow with real tasks:

1. **Knowledge Retrieval**: `/kb` with various queries
2. **Knowledge Creation**: `/kb-add` for a real issue
3. **Planning**: `/plan` for a small feature
4. **Research**: `/research` about existing code
5. **Implementation**: `/implement` a simple plan

### Refinement Areas

- Agent prompt clarity
- Output format consistency
- Context efficiency
- Error handling

---

## Phase 5: Integration & Polish

### End-to-End Tests

1. `/create-plan` after discussing a feature → extracts requirements → confirms → creates plan
2. `/implement <plan>` → executes plan
3. `/kb-add` → documents any issues found
4. `/kb <query>` → finds documented issues
5. `/research <question>` → finds patterns and references KB

### Documentation

- [ ] Update CLAUDE.md to reference new capabilities
- [ ] Create "getting started" section
- [ ] Document command usage examples

---

## Quick Reference

### Directory Structure

```
.claude/
├── ARCHITECTURE-SPEC.md    # Full specification
├── IMPLEMENTATION-GUIDE.md # This file
├── commands/               # /command definitions
├── skills/
│   ├── plan-framework/    # Planning methodology
│   ├── kb-framework/      # KB methodology
│   └── nano-banana-pro/   # Existing (keep)
├── knowledge-base/        # Issues & solutions
│   ├── api/
│   ├── generation/
│   └── general/
└── implementation-plans/  # Task plans
    ├── active/
    └── completed/
```

### Key Files in ARCHITECTURE-SPEC.md

| Section | Content |
|---------|---------|
| Architecture Overview | Visual diagram of system layers |
| Agent Prompts | All 5 agents with full prompt templates |
| Commands | 7 commands including /create-plan (comprehensive) |
| File Specs | README, templates, full command files |
| Workflows | Usage examples for planning, debugging, research |

### Command Reference

| Command | Purpose |
|---------|---------|
| `/create-plan` | **Primary** - Extract requirements, confirm, comprehensive planning |
| `/plan` | Quick planning for simple tasks |
| `/kb` | Search knowledge base |
| `/kb-add` | Document issues/solutions |
| `/research` | Deep codebase exploration |
| `/implement` | Execute implementation plans |
| `/review` | Review code against patterns |

---

## Proactive Knowledge Base Behavior

All agents are designed to **automatically document issues** during their work. This means:

### How It Works

1. **Agent encounters issue** → Searches KB first
2. **Not in KB + debugging >5 min** → Creates draft entry
3. **Solution found** → Updates draft → Finalizes entry
4. **Reports KB activity** in output summary

### Draft Entries

During debugging, agents create draft entries:
```
knowledge-base/{category}/draft-{issue-name}.md
```

These capture context **while debugging** so nothing is lost. When solved, they become final entries.

### What Gets Documented

| Trigger | Action |
|---------|--------|
| Error took >5 min to debug | Create KB entry |
| Solution required research | Document it |
| Unexpected behavior found | Document it |
| Workaround needed | Document it |

### Manual Override

You can always use `/kb-add` to manually document something, or skip documentation by telling the agent "don't document this".

---

## Context Safety (Auto-Split)

The `/implement` command automatically splits large plans to ensure they complete within context limits.

### Plan Size Thresholds

| Metric | Safe | Auto-Split |
|--------|------|------------|
| Tasks | ≤5 | >5 |
| Hours | ≤6 | >6 |

### What Happens

**Plan too large?** → Automatic split (no user action needed)

```
📐 Plan too large. Auto-splitting...

Original: FEAT-001-big-feature.md (8 tasks)

Split into:
1. FEAT-001a-big-feature-part1.md (4 tasks)
2. FEAT-001b-big-feature-part2.md (4 tasks)

Executing Part 1 now...
```

### After Part 1 Completes

```
✅ Part 1 complete

Next: /implement FEAT-001b-big-feature-part2.md
```

### Benefits

| Approach | Benefit |
|----------|---------|
| Auto-split | Every plan fits in context |
| No checkpoints | Simpler, no partial states to manage |
| Dependency analysis | Split at logical boundaries |
| Sequential execution | Clear order, no confusion |

---

## Troubleshooting

### "Command not found"

- Verify file exists in `.claude/commands/`
- Check file has correct frontmatter format
- Restart Claude Code session

### "Agent not producing expected output"

- Check agent prompt in ARCHITECTURE-SPEC.md
- Refine based on actual behavior
- Document learnings in KB

### "Context too large"

- Agents should return summaries, not full content
- KB Retriever should limit to 3 entries
- Use file paths so user can read full content if needed

### "Too many draft entries"

- Review drafts periodically: `ls knowledge-base/*/draft-*.md`
- Finalize solved ones, delete abandoned ones
- Drafts older than 7 days without updates should be reviewed

---

## Notes

Add session notes here as you implement:

### Session Log

| Date | Phase | What Was Done | Next Steps |
|------|-------|---------------|------------|
| 2026-01-07 | 0 | Created ARCHITECTURE-SPEC.md and IMPLEMENTATION-GUIDE.md | - |
| 2026-01-07 | 0 | Added /create-plan command (comprehensive planning with user confirmation) | - |
| 2026-01-07 | 0 | Added proactive KB awareness to all agents (auto-document issues) | - |
| 2026-01-07 | 0 | Added context safety: auto-split large plans (simpler than checkpoints) | Start Phase 1 |
| | | | |

---

**Last Updated**: 2026-01-07
