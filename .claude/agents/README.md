# Agents

Specialized subagents spawned via the Task tool for focused, context-efficient work.

## Overview

Agents are autonomous workers that handle specific tasks. They:
- Work in isolation (reduced context usage)
- Have focused capabilities with **explicit tool permissions**
- Return structured output
- Coordinate with other agents when needed

## Agent File Format

Each agent file includes frontmatter defining its capabilities:

```yaml
---
name: agent-name
description: What the agent does and when to use it
model: sonnet | opus | haiku
tools: Read, Glob, Grep, Write, Edit, Bash, TodoWrite
---
```

## Available Agents

| Agent | Model | Tools | Purpose |
|-------|-------|-------|---------|
| [planner](planner.md) | sonnet | Read, Glob, Grep, Write, TodoWrite | Create implementation plans |
| [researcher](researcher.md) | sonnet | Read, Glob, Grep | Deep codebase exploration |
| [implementer](implementer.md) | sonnet | Read, Write, Edit, Glob, Grep, Bash, TodoWrite | Execute plans autonomously |
| [kb-retriever](kb-retriever.md) | haiku | Read, Glob, Grep | Fast knowledge base search |
| [kb-creator](kb-creator.md) | sonnet | Read, Write, Edit, Glob, Grep | Document issues/solutions |

## Tool Permissions

| Tool | planner | researcher | implementer | kb-retriever | kb-creator |
|------|---------|------------|-------------|--------------|------------|
| Read | ✅ | ✅ | ✅ | ✅ | ✅ |
| Glob | ✅ | ✅ | ✅ | ✅ | ✅ |
| Grep | ✅ | ✅ | ✅ | ✅ | ✅ |
| Write | ✅ | ❌ | ✅ | ❌ | ✅ |
| Edit | ❌ | ❌ | ✅ | ❌ | ✅ |
| Bash | ❌ | ❌ | ✅ | ❌ | ❌ |
| TodoWrite | ✅ | ❌ | ✅ | ❌ | ❌ |

**Why these restrictions?**
- **researcher** is read-only - it explores and reports, never modifies
- **kb-retriever** is read-only and uses haiku for speed
- **planner** can write plans but not edit existing code
- **implementer** has full access to execute plans
- **kb-creator** can create/edit KB entries only

## How Agents Work

```
┌─────────────────────────────────────────────────────────────────────┐
│                            COMMANDS                                 │
│   /plan, /research, /implement, /kb, /kb-add                        │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         TASK TOOL                                   │
│   Spawns agent with specific prompt                                 │
│   Task({ subagent_type: "...", prompt: "..." })                     │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                           AGENT                                     │
│   Works autonomously using tools                                    │
│   Returns structured result                                         │
└─────────────────────────────────────────────────────────────────────┘
```

## Spawning Agents

### From Commands

Commands in `.claude/commands/` invoke agents via the Task tool:

```javascript
Task({
  subagent_type: "Plan",           // Or "Explore", "general-purpose"
  description: "Brief description",
  prompt: `Full agent prompt with context...`
})
```

### Agent Type Mapping

| Agent | subagent_type | Model |
|-------|---------------|-------|
| Planner | `Plan` | sonnet (default) |
| Researcher | `Explore` | sonnet (default) |
| Implementer | `general-purpose` | sonnet (default) |
| KB Retriever | `Explore` | haiku (faster) |
| KB Creator | `general-purpose` | sonnet (default) |

## Agent Coordination

Agents can coordinate with each other:

```
/plan "Add batch processing"
    │
    ├──► Planner Agent
    │       ├──► Researcher Agent (find patterns)
    │       └──► KB Retriever Agent (check known issues)
    │
    └──► Returns: Plan file path + summary
```

## Knowledge Base Integration

All agents are "KB-aware":

1. **Before work**: Check KB for existing solutions
2. **During work**: Create draft entries for issues taking >5 min
3. **After work**: Report KB entries created/referenced

## Adding New Agents

1. Create `{agent-name}.md` in this directory
2. Include:
   - Purpose and capabilities
   - Input/Output specification
   - Full agent prompt
   - Usage examples
   - Expected output format
3. Update this README

## Best Practices

- **Keep prompts focused**: Each agent should have a single responsibility
- **Include project context**: Reference key files and structures
- **Define output format**: Agents return structured data to main conversation
- **Enable coordination**: Agents can spawn other agents when needed
- **Track KB activity**: All agents should report KB entries used/created
