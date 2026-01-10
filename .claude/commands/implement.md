---
description: Execute an implementation plan using the implementer agent
arguments:
  plan_file:
    description: Plan filename or path (searches in active/)
    required: false
allowed-tools: Read, Glob, Grep, Bash, Task, TodoWrite
---

# Implement Plan

Execute an implementation plan using the **implementer agent** for better context management.

## Usage

```
/implement [plan-file]
```

---

## Step 1: Locate Plan

### If No Argument Provided

List active plans and ask user to choose:
```bash
ls .claude/implementation-plans/active/
```

### If Argument Provided

Find the plan file:
```bash
ls .claude/implementation-plans/active/ | grep -i "{plan-file}"
```

Read the plan to verify it exists and check its structure.

---

## Step 2: Plan Size Check → Auto-Split (if needed)

Count tasks in the plan:
```bash
grep -c "^\s*[0-9]*\. \[ \]" {plan-file}
grep -c "^\- \[ \]" {plan-file}
```

**If total tasks > 5**: Split the plan into parts BEFORE spawning the agent:
1. Analyze phase dependencies
2. Create sub-plans at logical boundaries (e.g., `FEAT-001a-part1.md`, `FEAT-001b-part2.md`)
3. Archive original as `{name}-original.md`
4. Pass the first sub-plan to the agent

---

## Step 3: Spawn Implementer Agent

**CRITICAL**: Use the Task tool to spawn the implementer agent:

```
Task(
  subagent_type: "implementer",
  description: "Implement {plan-name}",
  prompt: "Execute this implementation plan step by step:

Plan file: {full-path-to-plan}

Instructions:
1. Read the plan file completely
2. Create todos from the plan phases using TodoWrite
3. Execute each phase in order:
   - Mark task as in_progress before starting
   - Execute all steps in the phase
   - Run validation criteria
   - Mark task as completed only if validation passes
4. Update the Implementation Log section in the plan file after each phase
5. If errors occur:
   - Check .claude/knowledge-base/ for similar issues
   - If debugging takes >5 min, create a draft KB entry
   - Report the error clearly
6. On completion:
   - Update plan status to 'completed'
   - Move plan to .claude/implementation-plans/completed/
   - Report summary of files modified
"
)
```

---

## Step 4: Report Results

After the agent completes, summarize:

### On Success
```markdown
✅ **Plan implemented successfully**

**Plan**: {plan-name}
**Agent**: implementer
**Tasks Completed**: X/Y

**Next**: {if split plan exists: "Run `/implement {next-part}`" else: "Done!"}
```

### On Failure
```markdown
❌ **Implementation failed**

**Failed at**: {phase/step from agent output}
**Error**: {error message}

**Recovery**:
1. Review agent output above
2. Fix the issue
3. Re-run: `/implement {plan-file}`
```

---

## Why Use the Agent?

| Approach | Benefit |
|----------|---------|
| Implementer agent | Runs in subprocess with own context |
| Auto-split | Prevents context exhaustion |
| Agent isolation | Main conversation stays lightweight |
| Progress tracking | Agent uses TodoWrite internally |

---

## Split Plan Naming

| Original | Part 1 | Part 2 | Archived |
|----------|--------|--------|----------|
| FEAT-001-name.md | FEAT-001a-name-part1.md | FEAT-001b-name-part2.md | FEAT-001-name-original.md |
