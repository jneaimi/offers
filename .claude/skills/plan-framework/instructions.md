# Plan Framework - Instructions

A methodology for creating structured, AI-executable implementation plans.

## When to Create Plans

### Create a Plan When:
- Task has **3+ distinct steps**
- Task touches **multiple files**
- Task involves **risk** (could break existing functionality)
- Task requires **research** before implementation
- You want to **document decisions** for future reference
- Task will span **multiple sessions**

### Skip Planning When:
- Single-line or few-line fixes
- Typos, obvious bugs, small tweaks
- Task has very specific, detailed instructions already
- Pure research/exploration (use `/research` instead)

## Pre-Implementation Checklist

Before creating a plan, complete this analysis:

### 1. Understand the Task
- [ ] What is the goal?
- [ ] What are the acceptance criteria?
- [ ] What is out of scope?

### 2. Search Existing Patterns
- [ ] Search codebase for similar implementations
- [ ] Check `implementation-plans/completed/` for related past work
- [ ] Identify code patterns to follow

### 3. Check Knowledge Base
- [ ] Search `knowledge-base/` for related issues
- [ ] Note any gotchas or known problems
- [ ] Include relevant KB entries in plan's "Known Issues" section

### 4. Identify Risks
- [ ] What could go wrong?
- [ ] What existing functionality might break?
- [ ] Are there rate limits or API constraints?

## Phase Guidelines

### Breaking Tasks into Phases

Each phase should be:
- **Independently verifiable** - Can validate completion
- **Focused** - One logical unit of work
- **Sequential** - Clear order of execution

### Phase Structure

```markdown
### Phase N: [Descriptive Name]

**Goal**: [Single sentence describing what this phase accomplishes]

#### Steps
1. [ ] Specific action with file path
2. [ ] Another action with code snippet if helpful
3. [ ] Final action for this phase

#### Validation
- [ ] How to verify this phase is complete
- [ ] Command to run or check to perform
```

### Recommended Phase Breakdown

| Project Type | Typical Phases |
|--------------|----------------|
| New Feature | Setup → Core Logic → Integration → Testing |
| Bug Fix | Reproduce → Diagnose → Fix → Verify |
| Refactor | Analyze → Extract → Replace → Validate |
| API Integration | Auth → Endpoints → Error Handling → Testing |

## Validation Best Practices

### Every Phase Needs Validation
- Don't mark a phase complete without validation
- Validation should be **observable** (command output, file exists, etc.)
- Include **rollback** if validation fails

### Types of Validation

| Type | Example |
|------|---------|
| Command | `uv run generate-image.py --test` |
| File Check | Verify `output.png` exists |
| Code Check | Function returns expected value |
| Manual | "Image displays correctly" |

### Validation Criteria Examples

```markdown
#### Validation
- [ ] `uv run generate-image.py --status` shows API connected
- [ ] Generated image saved to `generated_images/`
- [ ] No error messages in output
- [ ] Existing tests still pass
```

## Plan Size Limits

Keep plans manageable for single-session execution:

| Metric | Limit |
|--------|-------|
| Tasks | ≤5 |
| Estimated Hours | ≤6 |
| Phases | ≤4 |

**If exceeding limits**: The `/implement` command will auto-split.

## Progress Tracking

### Using TodoWrite

During implementation, track progress with TodoWrite:
- Mark task `in_progress` before starting
- Mark `completed` immediately after finishing
- Only one task should be `in_progress` at a time

### Implementation Log

Update the plan's Implementation Log after each session:

```markdown
## Implementation Log

### Session 1 - 2026-01-07

**Completed**:
- Phase 1: Setup complete
- Phase 2: Steps 1-2 done

**Issues Encountered**:
- Rate limit hit after 10 requests - added 2s delay

**Next Steps**:
- Complete Phase 2, Step 3
- Begin Phase 3
```

## Handling Blocked/Failed Phases

### When Blocked

1. Document what's blocking in the plan
2. Check knowledge-base for solutions
3. If unresolved, update status to "blocked"
4. Report to user with specific blocker

### When Failed

1. **Don't skip** - fix the issue first
2. Check KB for known solutions
3. If new issue, create draft KB entry
4. Update Implementation Log with details
5. Either retry or escalate to user

## Template Usage

Use `templates/PLAN_TEMPLATE.md` for all new plans.

Required sections:
- Overview (Problem + Solution)
- Pre-Implementation Analysis
- Implementation Phases (with validation)
- Testing Strategy
- Validation Criteria

## File Naming

```
{TYPE}-{NUMBER}-{short-description}.md
```

| Type | Use For |
|------|---------|
| FEAT | New features |
| BUG | Bug fixes |
| ENHANCE | Improvements to existing features |
| REFACTOR | Code restructuring |

Examples:
- `FEAT-001-batch-generation.md`
- `BUG-002-rate-limit-handling.md`
- `ENHANCE-003-prompt-optimization.md`

## Integration with Knowledge Base

### Before Planning
- Search KB for related issues
- Reference relevant entries in plan

### During Implementation
- Check KB when encountering errors
- Create draft KB entries for new issues
- Finalize drafts when solutions found

### After Completion
- Document lessons learned
- Update KB if new patterns discovered

## Common Errors and Solutions

### Planning Errors

| Error | Cause | Solution |
|-------|-------|----------|
| "Plan too vague" | Steps not specific | Add file paths, code snippets |
| "Missing validation" | No way to verify | Add test commands or checks |
| "Scope too large" | Too many tasks | Split into multiple plans |
| "Circular dependency" | Steps depend on each other | Reorder or combine steps |

### Execution Errors

| Error | Cause | Solution |
|-------|-------|----------|
| "File not found" | Wrong path | Verify path exists, use Glob |
| "Test failed" | Code issue | Debug, fix, re-validate |
| "API error" | Rate limit/auth | Check KB, add delays |
| "Context exhausted" | Plan too large | Let auto-split handle it |

### Recovery Patterns

**When a step fails:**
```
1. Don't proceed to next step
2. Update Implementation Log with error
3. Search KB: /kb {error}
4. If known: Apply solution
5. If new: Create draft KB entry
6. Fix issue
7. Re-validate current step
8. Continue to next step
```

**When blocked by external issue:**
```
1. Update plan status to "blocked"
2. Document blocker in Implementation Log
3. Create BUG plan if code issue
4. Notify user with specific blocker
5. Provide workaround if available
```
