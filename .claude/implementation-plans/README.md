# Implementation Plans - Offers Project

Structured task plans for tracking progress and ensuring systematic implementation.

## Usage

### Creating Plans

Use `/plan <task>` or `/create-plan <name>` to generate a plan:
```bash
/plan Add batch image generation support
/create-plan FEAT-batch-processing
```

### Executing Plans

Use `/implement <plan-file>` to execute:
```bash
/implement FEAT-001-batch-generation.md
```

### Listing Plans

```bash
# Active plans
ls .claude/implementation-plans/active/

# Completed plans
ls .claude/implementation-plans/completed/
```

## Directory Structure

```
implementation-plans/
├── README.md           # This file
├── templates/
│   └── PLAN_TEMPLATE.md
├── active/             # Plans currently being worked on
│   └── *.md
└── completed/          # Successfully completed plans
    └── *.md
```

## Plan Naming Convention

- Features: `FEAT-XXX-short-description.md`
- Bug fixes: `BUG-XXX-short-description.md`
- Enhancements: `ENHANCE-XXX-short-description.md`

Use sequential numbering (check existing plans for next number).

## Plan Lifecycle

1. **Draft**: Initial creation, requirements gathering
2. **Active**: Ready for implementation
3. **Blocked**: Waiting on external dependency
4. **Completed**: All phases validated, moved to completed/

## Size Guidelines

Plans should have:
- ≤5 tasks
- ≤6 hours estimated effort

Larger plans are automatically split by `/implement`.

## Common Failure Modes & Recovery

### Planning Failures

| Issue | Symptom | Recovery |
|-------|---------|----------|
| Plan too vague | Steps unclear, "implement feature" | Break into specific, testable steps |
| Missing validation | No way to verify completion | Add test commands, expected outputs |
| Wrong scope | Plan covers too much | Split into multiple plans |
| Missing dependencies | Steps fail due to prerequisites | Add dependency check as Phase 0 |

### Execution Failures

| Issue | Symptom | Recovery |
|-------|---------|----------|
| File not found | Edit fails | Verify path, create file if needed |
| Test failure | Validation step fails | Fix code, update test, or adjust criteria |
| API error | Generation fails | Check KB for known issues (`/kb error`) |
| Context exhausted | Agent stops mid-plan | Plan auto-splits, re-run remaining part |
| Blocked by bug | Cannot proceed | Mark blocked, create BUG plan |

### Recovery Workflow

```
1. Check Implementation Log in plan file
2. Identify failed step
3. Search KB: /kb {error keywords}
4. If known issue: Apply documented solution
5. If new issue: /kb-add to document
6. Fix the issue
7. Re-run: /implement {plan-file}
```

## Integration with Knowledge Base

During implementation:
- **Before starting**: Check KB for related issues
- **On error**: Search KB for solutions
- **After solving**: Document new issues found
- **On completion**: Report KB entries created/referenced

## Best Practices

### Writing Good Plans

1. **Specific file paths**: Not "update the config" but "edit `generate-image.py:45`"
2. **Testable steps**: Each step should have a way to verify completion
3. **Ordered dependencies**: Steps that depend on others come later
4. **Reasonable scope**: One logical unit of work per plan

### Executing Plans

1. **Read the entire plan** before starting
2. **Use TodoWrite** to track progress visibly
3. **Validate after each phase** before proceeding
4. **Document issues** in the Implementation Log
5. **Check KB** when errors occur
