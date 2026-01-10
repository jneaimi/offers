# Claude Code Enhancement Architecture Specification

**Project**: Offers (AI Image Generation Toolkit)
**Version**: 1.0
**Created**: 2026-01-07
**Status**: Specification (Not Yet Implemented)

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Architecture Overview](#architecture-overview)
3. [Component Details](#component-details)
   - [Agents](#1-agents)
   - [Commands](#2-commands)
   - [Skills](#3-skills)
   - [Persistent Storage](#4-persistent-storage)
4. [Directory Structure](#directory-structure)
5. [Implementation Phases](#implementation-phases)
6. [File Specifications](#file-specifications)
7. [Workflow Examples](#workflow-examples)
8. [Adaptation Guidelines](#adaptation-guidelines)
9. [References](#references)

---

## Executive Summary

This specification defines a modular system for enhancing Claude Code's capabilities through:

- **Agents**: Specialized subagents for focused tasks (research, planning, knowledge management)
- **Commands**: User-facing entry points for quick invocation
- **Skills**: Domain knowledge and templates invoked by agents
- **Persistent Storage**: Knowledge base and implementation plans that survive sessions

### Goals

1. **Context Efficiency**: Agents work in isolation, reducing token usage
2. **Knowledge Persistence**: Issues and solutions documented for future sessions
3. **Structured Planning**: Implementation plans prevent mistakes and track progress
4. **Reusability**: Components can be adapted for other projects
5. **Discoverability**: Commands make capabilities easily accessible

### Origin

This architecture is adapted from two frameworks developed for the BMP project:
- Implementation Plans Framework (`/Users/jneaimimacmini/dev/apps/bmp-project/implementation-plans/README.md`)
- Knowledge Base Framework (`/Users/jneaimimacmini/dev/apps/bmp-project/knowledge-base/README.md`)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                            COMMANDS                                 │
│   User-facing entry points (slash commands)                         │
│   ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐      │
│   │  /plan  │ │   /kb   │ │ /kb-add │ │/research│ │/implement│      │
│   └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘      │
└────────┼───────────┼───────────┼───────────┼───────────┼────────────┘
         │           │           │           │           │
         ▼           ▼           ▼           ▼           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                             AGENTS                                  │
│   Specialized autonomous workers                                    │
│   ┌─────────────┐ ┌─────────────┐ ┌─────────────┐                  │
│   │  Planner    │ │ Researcher  │ │ Implementer │                  │
│   │  Agent      │ │   Agent     │ │   Agent     │                  │
│   └──────┬──────┘ └──────┬──────┘ └──────┬──────┘                  │
│          │               │               │                          │
│          │    ┌──────────┴──────────┐    │                          │
│          │    ▼                     ▼    │                          │
│          │ ┌─────────────┐ ┌─────────────┐                          │
│          │ │KB Retriever │ │ KB Creator  │                          │
│          │ │   Agent     │ │   Agent     │                          │
│          │ └─────────────┘ └─────────────┘                          │
│          │         │               │                                │
└──────────┼─────────┼───────────────┼────────────────────────────────┘
           │         │               │
           ▼         ▼               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                             SKILLS                                  │
│   Domain knowledge, templates, methodologies                        │
│   ┌───────────────────┐     ┌───────────────────┐                  │
│   │  plan-framework   │     │   kb-framework    │                  │
│   │  - Templates      │     │   - Templates     │                  │
│   │  - Checklists     │     │   - Conventions   │                  │
│   │  - Phases         │     │   - Search guide  │                  │
│   └─────────┬─────────┘     └─────────┬─────────┘                  │
└─────────────┼─────────────────────────┼─────────────────────────────┘
              │                         │
              ▼                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       PERSISTENT STORAGE                            │
│   Files that survive across sessions                                │
│   ┌───────────────────┐     ┌───────────────────┐                  │
│   │  knowledge-base/  │     │implementation-plans│                  │
│   │  - Issues         │     │  - Active plans   │                  │
│   │  - Solutions      │     │  - Completed      │                  │
│   │  - Patterns       │     │  - Templates      │                  │
│   └───────────────────┘     └───────────────────┘                  │
└─────────────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **User** invokes a command (e.g., `/plan add batch processing`)
2. **Command** spawns appropriate agent(s)
3. **Agent** may call other agents (e.g., researcher calls kb-retriever)
4. **Agent** uses skills for domain knowledge and templates
5. **Agent** reads/writes to persistent storage
6. **Agent** returns summary to main conversation
7. **User** sees result with minimal context consumption

---

## Component Details

### 1. Agents

Agents are specialized subagents spawned via the Task tool. Each agent has:
- A focused purpose
- Specific tools it should use
- A defined output format
- Knowledge of which skills to invoke

#### 1.1 Planner Agent

**Purpose**: Create structured implementation plans for tasks

**Capabilities**:
- Analyze task requirements
- Search for existing patterns (via researcher)
- Check for known issues (via kb-retriever)
- Create implementation plan using template
- Break complex tasks into phases
- Define validation criteria

**Input**: Task description from user
**Output**: Implementation plan file path + summary

**Prompt Template**:
```
You are the Planner Agent for the offers project. Your role is to create
structured implementation plans that can be executed autonomously.

TASK: {user_task_description}

WORKFLOW:
1. First, understand the task scope
2. Search the codebase for existing patterns (use Glob, Grep, Read)
3. Check knowledge-base/ for related issues
4. Check implementation-plans/completed/ for similar past work
5. Read the plan-framework skill for templates and methodology
6. Create a new plan in implementation-plans/active/

OUTPUT:
- Create the plan file
- Return a summary including:
  - Plan file path
  - Number of phases
  - Key risks identified
  - Estimated complexity (low/medium/high)
  - KB entries referenced (if any)

IMPORTANT:
- Use the PLAN_TEMPLATE.md from the plan-framework skill
- Be specific with file paths and code snippets
- Include validation criteria for each phase
- Reference existing code patterns

KNOWLEDGE BASE AWARENESS:
- BEFORE planning: Search knowledge-base/ for related issues that might affect this task
- Include relevant KB entries in the plan's "Known Issues" section
- If the task relates to a previously documented issue, link to it
- Note any potential gotchas from KB in the risk assessment
```

#### 1.2 Researcher Agent

**Purpose**: Deep codebase exploration and pattern understanding

**Capabilities**:
- Search codebase using Glob, Grep, Read
- Understand architecture and patterns
- Coordinate with kb-retriever for known issues
- Synthesize findings into actionable insights

**Input**: Research question or exploration goal
**Output**: Comprehensive answer with file references

**Prompt Template**:
```
You are the Researcher Agent for the offers project. Your role is to
thoroughly explore the codebase to answer questions and find patterns.

QUESTION: {research_question}

WORKFLOW:
1. Identify what you're looking for
2. Check knowledge-base/ FIRST for documented answers
3. Use Glob to find relevant files by pattern
4. Use Grep to search for keywords/patterns
5. Read relevant files to understand implementation
6. Synthesize findings

OUTPUT FORMAT:
## Summary
[1-2 sentence answer]

## Key Files
- `path/to/file.py:line` - Description of relevance

## Patterns Found
[Describe patterns, conventions, or architecture]

## Related Knowledge Base Entries
[List any relevant KB entries found, or "None - consider documenting this"]

## Recommendations
[If applicable, suggest next steps]

IMPORTANT:
- Always include file paths with line numbers
- Quote relevant code snippets (keep brief)
- Note any gaps or areas needing documentation

KNOWLEDGE BASE AWARENESS:
- BEFORE searching code: Check knowledge-base/ - the answer might already be documented
- If you discover something useful that's NOT in the KB, note it:
  "📝 KB Gap: This pattern/answer should be documented"
- If research took significant effort, suggest creating a KB entry
- Always report KB entries found (or gaps) in your output
```

#### 1.3 Implementer Agent

**Purpose**: Execute implementation plans step by step

**Capabilities**:
- Read and parse implementation plans
- Execute phases in order
- Track progress using TodoWrite
- Validate each phase before proceeding
- Handle errors and document issues

**Input**: Path to implementation plan
**Output**: Completion status + any issues encountered

**Prompt Template**:
```
You are the Implementer Agent for the offers project. Your role is to
execute implementation plans autonomously and thoroughly.

PLAN: {plan_file_path}

WORKFLOW:
1. Read the entire implementation plan
2. Verify all prerequisites are met
3. Use TodoWrite to track progress
4. Execute each phase in order:
   a. Mark phase as in_progress
   b. Execute all steps in the phase
   c. Run validation criteria
   d. Mark phase as completed (only if validation passes)
5. If errors occur:
   a. Document in the plan's Implementation Log
   b. Check knowledge-base/ for solutions
   c. If unresolved, stop and report

OUTPUT:
- Update the plan file with Implementation Log
- Return summary:
  - Phases completed
  - Any issues encountered
  - Files created/modified
  - Next steps (if incomplete)
  - KB entries created/referenced

IMPORTANT:
- Never skip validation steps
- Document everything in the plan's Implementation Log
- Create KB entries for new issues discovered
- Move plan to completed/ only when ALL phases pass

KNOWLEDGE BASE AWARENESS (CRITICAL):
- BEFORE starting: Check knowledge-base/ for issues related to this plan
- DURING implementation: If you encounter an error:
  1. Search KB for existing solution
  2. If not found and debugging takes >5 minutes, create DRAFT KB entry:
     - File: knowledge-base/{category}/draft-{issue-name}.md
     - Include: Symptoms, error messages, what you've tried
  3. When you solve it, UPDATE the draft entry with the solution
  4. Rename from draft-{name}.md to {name}.md
- AFTER completion: Report all KB entries created/updated

PROACTIVE DOCUMENTATION TRIGGERS:
- Error message you had to Google/research → Document it
- Workaround you had to figure out → Document it
- Something that wasn't obvious from the code → Document it
- Pattern you wish you'd known earlier → Document it

PLAN SIZE AWARENESS:
- Plans should have ≤5 tasks and ≤6 hours estimated
- If plan is larger, it should have been auto-split by /implement
- Focus on completing the current plan fully
- Report completion so user knows to run next part (if split)
```

#### 1.4 KB Retriever Agent

**Purpose**: Fast, context-efficient knowledge base search

**Capabilities**:
- Search knowledge-base/ by keywords, tags, categories
- Return only relevant entries
- Summarize findings concisely

**Input**: Search query or error message
**Output**: Relevant KB entries (summarized)

**Prompt Template**:
```
You are the KB Retriever Agent for the offers project. Your role is to
quickly find relevant knowledge base entries without consuming much context.

QUERY: {search_query}

WORKFLOW:
1. Parse the query for keywords
2. Search knowledge-base/_index.md for tag matches
3. Use Glob to find files in relevant categories
4. Use Grep to search file contents
5. Read only the most relevant files (max 3)
6. Summarize findings

OUTPUT FORMAT:
## Matches Found: {count}

### [Entry Title]
**File**: knowledge-base/category/filename.md
**Relevance**: [Why this matches]
**Solution Summary**: [1-2 sentence summary of the solution]

[Repeat for each match, max 3]

## No Match Actions
[If no matches, suggest:
- Keywords to try
- Whether to document with /kb-add]

IMPORTANT:
- Be concise - minimize context usage
- Only read files that are likely relevant
- Return file paths so user can read full entries if needed
```

### Proactive Knowledge Base Documentation

All agents are designed to **proactively capture knowledge** during their work. This creates a self-learning system where debugging effort is never wasted.

#### Documentation Lifecycle

```
┌─────────────────────────────────────────────────────────────────────┐
│  1. ISSUE ENCOUNTERED                                               │
│     Agent encounters error/problem during work                      │
│                         │                                           │
│                         ▼                                           │
│  2. KB SEARCH                                                       │
│     Agent searches knowledge-base/ for existing solution            │
│         │                           │                               │
│         ▼                           ▼                               │
│     FOUND                       NOT FOUND                           │
│     └─► Apply solution          └─► Continue to step 3              │
│                                                                     │
│                         │                                           │
│                         ▼                                           │
│  3. CREATE DRAFT ENTRY (if debugging >5 min)                        │
│     File: knowledge-base/{category}/draft-{issue-name}.md           │
│     Contains: Symptoms, error messages, what's been tried           │
│                         │                                           │
│                         ▼                                           │
│  4. SOLVE THE ISSUE                                                 │
│     Agent continues debugging until solution found                  │
│                         │                                           │
│                         ▼                                           │
│  5. UPDATE DRAFT → FINAL                                            │
│     Add: Root cause, solution, prevention steps                     │
│     Rename: draft-{name}.md → {name}.md                             │
│                         │                                           │
│                         ▼                                           │
│  6. REPORT                                                          │
│     Agent includes KB entries in output summary                     │
└─────────────────────────────────────────────────────────────────────┘
```

#### Documentation Triggers

Agents should document when:

| Trigger | Why Document |
|---------|--------------|
| Error took >5 minutes to debug | Future time savings |
| Solution required research/Googling | Not obvious from code |
| Workaround was needed | Others will hit this |
| Behavior was unexpected | Prevent confusion |
| Pattern wasn't documented | Fill knowledge gap |

#### Draft Entry Format

```markdown
# [DRAFT] Issue Title

**Tags**: tag1, tag2
**Severity**: medium
**First Seen**: {date}
**Status**: investigating

## Symptoms
- [Error message observed]
- [Behavior seen]

## What I've Tried
- [Attempt 1] - Result
- [Attempt 2] - Result

## Notes
[Any observations during debugging]

---
**TODO**: Add solution when found, then remove [DRAFT] from title and rename file
```

---

#### 1.5 KB Creator Agent

**Purpose**: Document new issues and solutions

**Capabilities**:
- Create properly formatted KB entries
- Apply correct tags and categories
- Link to related entries and plans
- Update _index.md

**Input**: Issue description, symptoms, solution
**Output**: Created KB entry path

**Prompt Template**:
```
You are the KB Creator Agent for the offers project. Your role is to
document issues and solutions for future reference.

ISSUE DETAILS:
{issue_description}

MODE: {new | update_draft | finalize_draft}

WORKFLOW:

For NEW entries:
1. Determine the appropriate category:
   - api/ - Gemini API, rate limits, authentication
   - generation/ - Image generation, prompts, models
   - general/ - Cross-cutting concerns
2. Read kb-framework skill for template and conventions
3. Create the entry file with all sections:
   - Title, Tags, Severity, Status
   - Symptoms (exact error messages)
   - Root Cause
   - Solution (copy-pasteable)
   - Prevention
   - Related entries
4. Update knowledge-base/_index.md with new tags
5. Link to any related implementation plans

For DRAFT entries (issue not yet solved):
1. Create file: knowledge-base/{category}/draft-{issue-name}.md
2. Include: Symptoms, error messages, what's been tried
3. Set status to "investigating"
4. Note: "Solution pending - will update when resolved"

For FINALIZING drafts (solution found):
1. Read the existing draft file
2. Add: Root Cause, Solution, Prevention sections
3. Update status to "resolved"
4. Rename: draft-{name}.md → {name}.md
5. Update _index.md with tags

OUTPUT:
- Created/updated file path
- Tags applied
- Related entries linked
- Status (draft | finalized)

IMPORTANT:
- Include EXACT error messages in Symptoms
- Solution must be copy-pasteable
- Prevention should have actionable checklist items
- Use lowercase-hyphenated filenames
- Drafts are valuable - they capture context while debugging
```

---

### 2. Commands

Commands are user-invocable shortcuts stored in `.claude/commands/`. Each command is a markdown file that defines how to handle the invocation.

#### 2.1 /create-plan Command (Primary Planning Command)

**File**: `.claude/commands/create-plan.md`
**Purpose**: Create a comprehensive implementation plan from conversation context
**Usage**: `/create-plan [plan-name]`

**This is the recommended way to create plans** - it extracts requirements from the conversation, confirms with the user, then generates a comprehensive plan.

**Behavior** (4 Phases):

**Phase 1: Context Extraction**
1. Extract requirements from current conversation
2. Detect feature type (what integrations needed)
3. Confirm with user using AskUserQuestion

**Phase 2: Comprehensive Research**
1. Spawn Researcher Agent
2. Search codebase for existing patterns
3. Check knowledge-base for related issues
4. Check completed plans for similar work

**Phase 3: Task Breakdown**
1. Gap analysis (what exists vs. what's needed)
2. Apply minimal change hierarchy
3. Size tasks (2-8 hours each)
4. Order by dependencies

**Phase 4: Generate Plan**
1. Create plan file with all gathered context
2. Include specialized sections based on feature type
3. Return summary with next steps

**Feature Type Detection for Offers Project**:
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

**User Confirmation**:
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

#### 2.2 /plan Command (Quick Planning)

**File**: `.claude/commands/plan.md`
**Purpose**: Quick plan creation for simple tasks (skips confirmation)
**Usage**: `/plan <task description>`

**Use this for**:
- Simple, well-defined tasks
- When you've already discussed requirements
- Quick prototyping

**Behavior**:
1. Invoke the plan-framework skill
2. Spawn the Planner Agent with the task
3. Return the plan summary and file path

**Note**: For complex features, use `/create-plan` instead.

#### 2.3 /kb Command

**File**: `.claude/commands/kb.md`
**Purpose**: Search the knowledge base
**Usage**: `/kb <search query>`

**Behavior**:
1. Spawn the KB Retriever Agent
2. Return matching entries summarized
3. Suggest /kb-add if no matches

#### 2.4 /kb-add Command

**File**: `.claude/commands/kb-add.md`
**Purpose**: Document a new issue/solution
**Usage**: `/kb-add` (interactive) or `/kb-add <description>`

**Behavior**:
1. Invoke the kb-framework skill
2. Spawn the KB Creator Agent
3. Guide through creating the entry
4. Return the created file path

#### 2.5 /research Command

**File**: `.claude/commands/research.md`
**Purpose**: Deep codebase exploration
**Usage**: `/research <question>`

**Behavior**:
1. Spawn the Researcher Agent
2. Agent coordinates with KB Retriever
3. Return comprehensive findings

#### 2.6 /implement Command

**File**: `.claude/commands/implement.md`
**Purpose**: Execute an implementation plan (auto-splits if too large)
**Usage**: `/implement <plan-path>` or `/implement` (lists active plans)

**Behavior**:

**Step 1: Locate & Validate Plan**
1. Find plan in implementation-plans/active/
2. Verify required sections exist (phases, validation criteria)

**Step 2: Plan Size Check → Auto-Split if Too Large**

```
| Metric        | Safe  | Too Large (Auto-Split) |
|---------------|-------|------------------------|
| Tasks         | ≤5    | >5                     |
| Hours         | ≤6    | >6                     |
```

**If TOO LARGE → Automatic Split:**
```
📐 Plan too large for single session. Auto-splitting...

Original: FEAT-001-big-feature.md (8 tasks, 12 hours)

Split into:
1. FEAT-001a-big-feature-part1.md (4 tasks, 6 hours)
2. FEAT-001b-big-feature-part2.md (4 tasks, 6 hours)

Executing Part 1 now...
```

The command will:
1. Analyze task dependencies
2. Split at logical boundaries
3. Create separate plan files (part1, part2, etc.)
4. Archive original as `{name}-original.md`
5. Execute first part immediately
6. Report which parts remain

**Step 3: Execute Plan**
1. Spawn Implementer Agent
2. Track progress with TodoWrite
3. Validate after each task
4. Move to completed/ when done

**Step 4: Handle Outcomes**

**On Success:**
```
✅ Plan implemented successfully

Plan: {Plan ID}
- Tasks Completed: X/X
- Files Modified: {count}
- KB Entries Created: {count}
- Plan moved to: completed/

Remaining plans: {list if split, or "None"}
```

**On Failure:**
```
❌ Plan implementation failed at: {Task}
Error: {description}
Recovery: {steps}

To retry: /implement {plan-file}
```

#### 2.7 /review Command

**File**: `.claude/commands/review.md`
**Purpose**: Review current work against project patterns
**Usage**: `/review` or `/review <file-path>`

**Behavior**:
1. Spawn the Researcher Agent
2. Compare against project conventions
3. Check for common issues from KB
4. Return recommendations

---

### 3. Skills

Skills provide domain knowledge and templates. They are invoked by agents when specialized knowledge is needed.

#### 3.1 plan-framework Skill

**Location**: `.claude/skills/plan-framework/`
**Purpose**: Implementation planning methodology

**Contents**:
```
plan-framework/
├── instructions.md      # Methodology and guidelines
└── templates/
    └── PLAN_TEMPLATE.md # Standard plan format
```

**Key Sections in instructions.md**:
- When to create plans (vs. just doing the task)
- Pre-implementation analysis checklist
- Phase breakdown guidelines
- Validation criteria best practices
- Progress tracking with TodoWrite
- Handling blocked/failed phases

#### 3.2 kb-framework Skill

**Location**: `.claude/skills/kb-framework/`
**Purpose**: Knowledge base documentation methodology

**Contents**:
```
kb-framework/
├── instructions.md       # Methodology and guidelines
└── templates/
    └── ISSUE_TEMPLATE.md # Standard issue format
```

**Key Sections in instructions.md**:
- When to create KB entries
- Category selection guide
- Tag conventions
- Writing effective symptoms (exact errors)
- Writing copy-pasteable solutions
- Linking related entries

---

### 4. Persistent Storage

#### 4.1 Knowledge Base

**Location**: `.claude/knowledge-base/`
**Purpose**: Store issues, solutions, and patterns

**Structure**:
```
knowledge-base/
├── README.md           # Search guide and conventions
├── _index.md           # Tag-based quick reference
├── api/                # Gemini API issues
│   └── *.md
├── generation/         # Image generation issues
│   └── *.md
└── general/            # Cross-cutting concerns
    └── *.md
```

**Categories for Offers Project**:
| Category | Use For |
|----------|---------|
| `api/` | Gemini API errors, rate limits, authentication, model issues |
| `generation/` | Image generation failures, prompt issues, quality problems |
| `general/` | UV, dependencies, configuration, environment |

#### 4.2 Implementation Plans

**Location**: `.claude/implementation-plans/`
**Purpose**: Store task plans and track progress

**Structure**:
```
implementation-plans/
├── README.md           # Usage guide
├── templates/
│   └── PLAN_TEMPLATE.md
├── active/             # Plans currently being worked on
│   └── *.md
└── completed/          # Successfully completed plans
    └── *.md
```

---

## Directory Structure

Complete directory structure for the offers project:

```
/Users/jneaimimacmini/dev/apps/offers/
├── .claude/
│   ├── ARCHITECTURE-SPEC.md      # This file
│   ├── settings.json             # Project settings (if needed)
│   │
│   ├── commands/                 # User-invocable commands
│   │   ├── plan.md              # /plan command
│   │   ├── kb.md                # /kb command
│   │   ├── kb-add.md            # /kb-add command
│   │   ├── research.md          # /research command
│   │   ├── implement.md         # /implement command
│   │   └── review.md            # /review command
│   │
│   ├── skills/                   # Domain knowledge
│   │   ├── plan-framework/
│   │   │   ├── instructions.md
│   │   │   └── templates/
│   │   │       └── PLAN_TEMPLATE.md
│   │   ├── kb-framework/
│   │   │   ├── instructions.md
│   │   │   └── templates/
│   │   │       └── ISSUE_TEMPLATE.md
│   │   └── nano-banana-pro/      # Existing skill (keep)
│   │       └── ...
│   │
│   ├── knowledge-base/           # Persistent issue storage
│   │   ├── README.md
│   │   ├── _index.md
│   │   ├── api/
│   │   ├── generation/
│   │   └── general/
│   │
│   └── implementation-plans/     # Task plans
│       ├── README.md
│       ├── templates/
│       │   └── PLAN_TEMPLATE.md
│       ├── active/
│       └── completed/
│
├── CLAUDE.md                     # Existing project instructions
├── generate-image.py             # Existing main script
└── ...                           # Other existing files
```

---

## Implementation Phases

### Phase 1: Foundation (Start Here)

**Goal**: Create the directory structure and core documentation

**Tasks**:
1. [ ] Create directory structure
   ```bash
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

2. [ ] Create knowledge-base/README.md (search guide)
3. [ ] Create knowledge-base/_index.md (tag index)
4. [ ] Create implementation-plans/README.md (usage guide)
5. [ ] Create PLAN_TEMPLATE.md
6. [ ] Create ISSUE_TEMPLATE.md

**Validation**:
- All directories exist
- README files explain purpose and usage
- Templates are complete and usable

**Estimated Effort**: 1 session

---

### Phase 2: Skills

**Goal**: Create the two core skills with instructions and templates

**Tasks**:
1. [ ] Create plan-framework/instructions.md
   - When to create plans
   - Pre-implementation checklist
   - Phase guidelines
   - Validation best practices

2. [ ] Create kb-framework/instructions.md
   - When to create entries
   - Category guide
   - Tag conventions
   - Writing guidelines

3. [ ] Copy templates to skill directories

**Validation**:
- Skills can be invoked manually
- Instructions are clear and actionable
- Templates work for real examples

**Estimated Effort**: 1 session

---

### Phase 3: Commands

**Goal**: Create user-invocable commands

**Tasks**:
1. [ ] Create /kb command (most immediately useful)
2. [ ] Create /kb-add command
3. [ ] Create /plan command
4. [ ] Create /research command
5. [ ] Create /implement command
6. [ ] Create /review command

**Validation**:
- Each command can be invoked with /command-name
- Commands produce expected behavior
- Help text is clear

**Estimated Effort**: 1-2 sessions

---

### Phase 4: Agent Optimization

**Goal**: Refine agent prompts based on real usage

**Tasks**:
1. [ ] Test each agent with real tasks
2. [ ] Refine prompts based on results
3. [ ] Add error handling guidance
4. [ ] Document common failure modes
5. [ ] Create example KB entries from real issues

**Validation**:
- Agents complete tasks successfully
- Output format is consistent
- Context usage is efficient

**Estimated Effort**: Ongoing (1-2 sessions initially)

---

### Phase 5: Integration & Polish

**Goal**: Ensure all components work together smoothly

**Tasks**:
1. [ ] Test complete workflows (e.g., /plan → /implement)
2. [ ] Add cross-references between components
3. [ ] Create "getting started" documentation
4. [ ] Document adaptation guidelines for other projects
5. [ ] Archive this spec as "implemented"

**Validation**:
- End-to-end workflows succeed
- Documentation is complete
- System is ready for daily use

**Estimated Effort**: 1 session

---

## File Specifications

### knowledge-base/README.md

```markdown
# Knowledge Base - Offers Project

A searchable repository of issues, solutions, and patterns.

## Quick Search

\`\`\`bash
# Search by keyword
grep -r "keyword" .claude/knowledge-base/**/*.md

# Search by category
ls .claude/knowledge-base/api/
ls .claude/knowledge-base/generation/
ls .claude/knowledge-base/general/

# Check tag index
cat .claude/knowledge-base/_index.md
\`\`\`

## Categories

| Category | Use For |
|----------|---------|
| api/ | Gemini API errors, rate limits, auth |
| generation/ | Image generation, prompts, quality |
| general/ | UV, config, environment, dependencies |

## Adding Entries

Use `/kb-add` or copy the template:
\`\`\`bash
cp .claude/knowledge-base/ISSUE_TEMPLATE.md .claude/knowledge-base/{category}/{issue-name}.md
\`\`\`

## Entry Format

See `_index.md` for tag conventions and ISSUE_TEMPLATE.md for format.
```

### knowledge-base/_index.md

```markdown
# Knowledge Base Index

## Tags

### By Component
- `gemini-api` - Gemini API issues
- `image-generation` - Generation process
- `prompt` - Prompt engineering
- `uv` - UV package manager

### By Error Type
- `rate-limit` - Rate limiting errors
- `timeout` - Timeout errors
- `auth` - Authentication errors
- `validation` - Input validation errors

### By Severity
- `critical` - Blocks all work
- `high` - Significant impact
- `medium` - Workaround available
- `low` - Minor inconvenience

## Quick Reference

### Most Common Issues
1. [Rate Limit Exceeded](api/rate-limit-exceeded.md) - `429` errors
2. [Invalid API Key](api/invalid-api-key.md) - Auth failures

### Recent Additions
- (entries will be listed here)
```

### ISSUE_TEMPLATE.md

```markdown
# [Short Descriptive Title]

**Tags**: tag1, tag2, tag3
**Severity**: critical | high | medium | low
**First Seen**: YYYY-MM-DD
**Status**: resolved | workaround | investigating
**Related Plans**: FEAT-XXX (if applicable)

## Symptoms

- [What you observe - be specific]
- [Exact error message]
\`\`\`
Paste exact error output here
\`\`\`

## Root Cause

[1-2 sentences explaining WHY this happens]

## Solution

[Step-by-step solution - must be copy-pasteable]

\`\`\`python
# Code fix if applicable
\`\`\`

## Prevention

- [ ] [Checklist item to prevent recurrence]
- [ ] [Another preventive measure]

## Related

- [Link to related KB entry](../category/entry.md)
- [Link to implementation plan](../../implementation-plans/completed/FEAT-XXX.md)
```

### PLAN_TEMPLATE.md

```markdown
# [FEAT/BUG]-XXX: [Short Title]

**Status**: draft | active | blocked | completed
**Created**: YYYY-MM-DD
**Priority**: low | medium | high | critical
**Complexity**: low | medium | high

## Overview

[2-3 sentences describing what this plan accomplishes]

### Problem
[What problem does this solve?]

### Solution
[High-level approach]

## Pre-Implementation Analysis

### Existing Patterns Checked
- [ ] Searched codebase for similar implementations
- [ ] Checked knowledge-base/ for related issues
- [ ] Reviewed completed plans for patterns

### Files to Modify
| File | Change Type | Description |
|------|-------------|-------------|
| path/to/file.py | modify | Add new function |

### Files to Create
| File | Purpose |
|------|---------|
| path/to/new.py | New module for X |

### Dependencies
- [List any dependencies or prerequisites]

### Risks
- [Potential issues to watch for]

## Implementation Phases

### Phase 1: [Name]

**Goal**: [What this phase accomplishes]

#### Steps
1. [ ] Step one with specific details
2. [ ] Step two with file paths
3. [ ] Step three with code snippets if helpful

#### Validation
- [ ] [How to verify this phase is complete]
- [ ] [Test command to run]

### Phase 2: [Name]

[Same structure as Phase 1]

## Testing Strategy

- [ ] [Test case 1]
- [ ] [Test case 2]
- [ ] Manual verification: [description]

## Validation Criteria

- [ ] All phases completed
- [ ] Tests pass
- [ ] No regressions

## Implementation Log

### Session 1 - YYYY-MM-DD

**Completed**:
- [What was done]

**Issues Encountered**:
- [Any problems and how resolved]

**Next Steps**:
- [What remains]

## Rollback Plan

[How to undo if needed]

## Notes

[Any additional context or decisions made]
```

### Command: /create-plan (commands/create-plan.md)

```markdown
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

## Usage

\`\`\`
/create-plan [plan-name]
\`\`\`

**Examples:**
\`\`\`bash
/create-plan FEAT-batch-generation
/create-plan BUG-rate-limit-handling
/create-plan ENHANCE-prompt-optimization
\`\`\`

---

## Phase 1: Context Extraction

### Step 1.1: Summarize Conversation

Extract from the current conversation:

\`\`\`markdown
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
\`\`\`

### Step 1.2: Detect Feature Type

Analyze the requirements to identify which integrations are needed:

\`\`\`javascript
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
\`\`\`

**Feature Type Flags** (set based on analysis):
- \`uses_gemini_api\`: true if making API calls (watch for rate limits, error handling)
- \`modifies_pipeline\`: true if changing the generation flow
- \`changes_prompts\`: true if modifying prompt construction
- \`changes_output\`: true if modifying file saving/naming

### Step 1.3: User Confirmation

Use AskUserQuestion to confirm requirements:

\`\`\`javascript
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
\`\`\`

If user needs edits, incorporate their feedback before proceeding.

---

## Phase 2: Comprehensive Research

### Step 2.1: Spawn Research Agent

\`\`\`javascript
Task({
  subagent_type: "researcher",
  description: "Research feature implementation",
  prompt: \`Research implementation for: {feature_name}

Component: {component}
Requirements:
{extracted requirements from Phase 1}

Provide comprehensive analysis:
1. Search codebase for existing patterns
2. Check knowledge-base/ for related issues
3. Check implementation-plans/completed/ for similar work
4. Identify files that will need modification
5. Note any risks or gotchas\`
})
\`\`\`

### Step 2.2: Check Completed Plans

\`\`\`bash
# Find similar completed plans
ls .claude/implementation-plans/completed/ | grep -i "{component}\|{feature}"
\`\`\`

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

Break into tasks of 1-4 hours each for this project:

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
\`\`\`
Config → API → Pipeline → Prompts → Output → Testing
\`\`\`

---

## Phase 4: Generate Plan

### Step 4.1: Determine Plan Number

\`\`\`bash
# Find next available plan number
ls .claude/implementation-plans/active/ .claude/implementation-plans/completed/ 2>/dev/null | \
  grep -oE '(FEAT|BUG|ENHANCE)-[0-9]+' | \
  sort -t'-' -k2 -n | tail -1
\`\`\`

Increment for new plan.

### Step 4.2: Create Plan File

Write to: \`.claude/implementation-plans/active/{PLAN-ID}-{name}.md\`

### Step 4.3: Generate Summary

Output summary for user:

\`\`\`markdown
## Plan Created Successfully

**File**: \`.claude/implementation-plans/active/{PLAN-ID}.md\`

### Summary
- **Tasks**: {count} tasks
- **Total Effort**: {hours} hours
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
2. Update status to "Active" when ready
3. Run \`/implement {PLAN-ID}\` to execute
\`\`\`

---

## Context Management

### For Long Conversations

If the conversation is very long, the command will:

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

\`\`\`javascript
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
\`\`\`

### High-Risk Changes

If the feature affects core functionality:

\`\`\`markdown
⚠️ **High-Risk Change Detected**

This change affects core functionality: {what}

Recommendations:
1. Add extra testing tasks
2. Consider backup/rollback approach
3. Test with small inputs first

Proceed with plan creation? [Yes / Add more safeguards / Cancel]
\`\`\`
```

---

### Command: /kb (commands/kb.md)

```markdown
---
description: Search the knowledge base for issues and solutions
arguments:
  query:
    description: Search terms or error message
    required: true
---

# Knowledge Base Search

Search the project knowledge base for relevant issues and solutions.

## Instructions

When the user invokes `/kb <query>`:

1. Parse the query for keywords
2. Search `.claude/knowledge-base/_index.md` for tag matches
3. Use Glob to find files: `.claude/knowledge-base/**/*.md`
4. Use Grep to search file contents for query terms
5. Read the most relevant files (max 3)
6. Return summarized findings

## Output Format

\`\`\`
## Knowledge Base Search Results

**Query**: {query}
**Matches**: {count}

### [Entry Title]
**File**: .claude/knowledge-base/category/file.md
**Tags**: tag1, tag2
**Summary**: [1-2 sentence summary of the solution]

---

[If no matches]
No matching entries found. Consider:
- Try different keywords: [suggestions]
- Document this issue with `/kb-add`
\`\`\`

## Examples

- `/kb rate limit` - Find rate limiting issues
- `/kb "429 error"` - Search for specific error
- `/kb gemini timeout` - Find timeout-related issues
```

### Command: /implement (commands/implement.md)

```markdown
---
description: Execute an implementation plan (auto-splits if too large)
arguments:
  plan_file:
    description: Plan filename or path (searches in active/)
    required: false
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, Task, TodoWrite
---

# Implement Plan

Execute an implementation plan. Automatically splits large plans to ensure completion within context limits.

## Usage

\`\`\`
/implement [plan-file]
\`\`\`

If no plan-file provided, lists active plans.

## Step 1: Locate Plan

\`\`\`bash
# List active plans
ls .claude/implementation-plans/active/

# Find specific plan
ls .claude/implementation-plans/active/ | grep -i "{plan-file}"
\`\`\`

## Step 2: Validate Plan Structure

Required sections:
- [ ] Metadata (Plan ID, Status)
- [ ] Tasks/Phases with descriptions
- [ ] Validation criteria

## Step 3: Plan Size Check → Auto-Split

**CRITICAL**: Large plans are automatically split to prevent context exhaustion.

### Thresholds

| Metric | Safe | Auto-Split |
|--------|------|------------|
| Tasks | ≤5 | >5 |
| Hours | ≤6 | >6 |

### Auto-Split Logic

**If plan exceeds thresholds:**

1. **Analyze dependencies** between tasks
2. **Find split points** at logical boundaries:
   - Between phases
   - After completed dependencies
   - At natural breakpoints
3. **Create sub-plans**:
   - `{plan-id}a-{name}-part1.md`
   - `{plan-id}b-{name}-part2.md`
   - etc.
4. **Archive original**: `{plan-id}-{name}-original.md`
5. **Execute first part** immediately

### Split Output

\`\`\`
📐 Plan too large for single session. Auto-splitting...

Original: FEAT-001-add-batch-processing.md
- Tasks: 8 (limit: 5)
- Hours: 10 (limit: 6)

Analyzing task dependencies...

Split into:
┌─────────────────────────────────────────────────┐
│ FEAT-001a-add-batch-processing-part1.md         │
│ Tasks 1-4: Setup, API integration, core logic   │
│ Estimated: 5 hours                              │
├─────────────────────────────────────────────────┤
│ FEAT-001b-add-batch-processing-part2.md         │
│ Tasks 5-8: Output handling, testing, cleanup    │
│ Estimated: 5 hours                              │
│ Depends on: Part 1 completion                   │
└─────────────────────────────────────────────────┘

Original archived: FEAT-001-add-batch-processing-original.md

Executing Part 1 now...
\`\`\`

## Step 4: Execute Plan

Spawn Implementer Agent:

\`\`\`javascript
Task({
  subagent_type: "implementer",
  description: "Execute plan {Plan ID}",
  prompt: \`Execute: {plan-path}

EXECUTION:
1. Read entire plan
2. Use TodoWrite to track each task
3. Execute tasks in order
4. Validate after each task
5. Check KB for related issues
6. Document any new issues found
7. Move to completed/ when ALL tasks done
8. Report remaining parts (if split plan)

KB INTEGRATION:
- Check KB before starting
- Create draft entries for issues encountered
- Finalize drafts when solved
- Report all KB activity\`
})
\`\`\`

## Step 5: Handle Results

### On Success
\`\`\`
✅ Plan implemented successfully

Plan: {Plan ID}
Tasks Completed: X/X
Files Modified: {count}
KB Entries: {created/updated}

Plan moved to: implementation-plans/completed/

Next: Run /implement FEAT-001b-add-batch-processing-part2.md
\`\`\`

### On Failure
\`\`\`
❌ Implementation failed

Failed at: Task {X} - {title}
Error: {description}

Recovery:
1. {specific step}
2. {specific step}

To retry: /implement {plan-file}
\`\`\`

## Split Plan Naming Convention

| Original | Part 1 | Part 2 | Archived |
|----------|--------|--------|----------|
| FEAT-001-name.md | FEAT-001a-name-part1.md | FEAT-001b-name-part2.md | FEAT-001-name-original.md |

## Context Safety Summary

| Approach | Benefit |
|----------|---------|
| Auto-split | Every plan fits in context |
| No checkpoints | Simpler, no partial states |
| Dependency analysis | Split at safe points |
| Sequential parts | Clear execution order |
```

---

### Command: /plan (commands/plan.md)

```markdown
---
description: Create an implementation plan for a task
arguments:
  task:
    description: Description of the task to plan
    required: true
---

# Create Implementation Plan

Create a structured implementation plan for a development task.

## Instructions

When the user invokes `/plan <task>`:

1. Invoke the plan-framework skill for methodology
2. Search the codebase for existing patterns related to the task
3. Check knowledge-base/ for related issues
4. Check implementation-plans/completed/ for similar past work
5. Create a new plan using PLAN_TEMPLATE.md
6. Save to implementation-plans/active/

## Plan Creation Process

### 1. Analyze the Task
- What is the goal?
- What files will be affected?
- What are the risks?

### 2. Pre-Implementation Analysis
- Search for existing patterns
- Check for known issues
- Identify dependencies

### 3. Break into Phases
- Each phase should be independently verifiable
- Include specific file paths and code
- Define clear validation criteria

### 4. Create the Plan File
- Name format: `FEAT-XXX-short-description.md` or `BUG-XXX-short-description.md`
- Use sequential numbering (check existing plans for next number)
- Fill all template sections

## Output Format

\`\`\`
## Plan Created

**File**: .claude/implementation-plans/active/FEAT-XXX-description.md
**Phases**: {count}
**Complexity**: low | medium | high
**Key Risks**: [list any identified risks]

### Summary
[2-3 sentence summary of the plan]

### Next Steps
Run `/implement FEAT-XXX-description.md` to execute this plan.
\`\`\`
```

---

## Workflow Examples

### Example 1: Planning and Implementing a Feature

```
User: /plan Add support for batch image generation

[Claude spawns Planner Agent]
[Planner searches codebase, checks KB, creates plan]

Claude: ## Plan Created

**File**: .claude/implementation-plans/active/FEAT-001-batch-generation.md
**Phases**: 3
**Complexity**: medium
**Key Risks**: Rate limiting with multiple requests

### Summary
Add batch processing capability to generate-image.py allowing users
to generate multiple images from a list of prompts in a single command.

### Next Steps
Run `/implement FEAT-001-batch-generation.md` to execute this plan.

---

User: /implement FEAT-001-batch-generation.md

[Claude spawns Implementer Agent]
[Implementer reads plan, executes phases, tracks with TodoWrite]

Claude: ## Implementation Progress

**Plan**: FEAT-001-batch-generation.md
**Status**: Completed

### Phases Completed
1. ✅ Add batch argument parsing
2. ✅ Implement batch processing logic
3. ✅ Add progress reporting

### Files Modified
- generate-image.py (added batch_generate function)

### Validation
- ✅ Single image generation still works
- ✅ Batch of 3 images generates successfully
- ✅ Progress displayed correctly

Plan moved to completed/
```

### Example 2: Documenting an Issue

```
User: I spent 30 minutes debugging a rate limit issue. The API returns
429 after about 10 requests. /kb-add

[Claude spawns KB Creator Agent]

Claude: I'll help document this issue. Let me gather some details:

1. **Error Message**: What exact error did you see?

User: "Resource exhausted: 429 Too Many Requests"

Claude: 2. **Solution**: How did you resolve it?

User: Added a 2-second delay between requests using time.sleep(2)

Claude: ## Knowledge Base Entry Created

**File**: .claude/knowledge-base/api/rate-limit-429.md
**Tags**: gemini-api, rate-limit, 429
**Severity**: medium

### Entry Summary
Gemini API returns 429 after ~10 rapid requests. Solution: Add
2-second delay between requests.

Entry is now searchable via `/kb rate limit` or `/kb 429`.
```

### Example 3: Researching the Codebase

```
User: /research How does the prompt optimization in nano-banana-pro work?

[Claude spawns Researcher Agent]
[Researcher explores codebase, checks KB]

Claude: ## Research Results

### Summary
The nano-banana-pro skill uses an ICS (Image-Content-Style) framework
for prompt optimization, breaking prompts into structured components.

### Key Files
- `.claude/skills/nano-banana-pro/instructions.md:45` - ICS framework definition
- `generate-image.py:234` - Prompt passed to Gemini API

### Pattern Found
Prompts are structured as:
```
[Subject] + [Appearance] + [Setting] + [Lighting] + [Camera] + [Style]
```

Quality keywords like "8K resolution" and camera specs like "85mm f/1.4"
are recommended for best results.

### Related KB Entries
None found. Consider documenting the ICS framework with `/kb-add`.
```

---

## Adaptation Guidelines

This architecture can be adapted for other projects by:

### 1. Modify Categories
Change knowledge-base categories to match the project:
```
# For a web app:
knowledge-base/
├── api/          → backend/
├── generation/   → frontend/
└── general/      → general/
```

### 2. Update Skills
Replace project-specific content in skills:
- plan-framework: Update checklist items
- kb-framework: Update category guide

### 3. Adjust Agent Prompts
Modify agent prompts to reference project-specific:
- File patterns
- Naming conventions
- Technology stack

### 4. Keep Structure
The overall structure (commands → agents → skills → storage) is project-agnostic and should be preserved.

---

## References

### Source Frameworks
- BMP Implementation Plans: `/Users/jneaimimacmini/dev/apps/bmp-project/implementation-plans/README.md`
- BMP Knowledge Base: `/Users/jneaimimacmini/dev/apps/bmp-project/knowledge-base/README.md`

### Claude Code Documentation
- Commands: `.claude/commands/` directory
- Skills: `.claude/skills/` directory
- Task tool: Spawns subagents for specialized work

### Project Context
- Offers CLAUDE.md: `/Users/jneaimimacmini/dev/apps/offers/CLAUDE.md`
- Generate script: `/Users/jneaimimacmini/dev/apps/offers/generate-image.py`

---

## Changelog

### v1.0 (2026-01-07)
- Initial specification created
- Defined 5 agents, 6 commands, 2 skills
- Created 5 implementation phases
- Documented all file specifications

---

**End of Specification**
