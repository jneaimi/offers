# UV Package Manager Not Installed

**Tags**: uv, installation, dependencies
**Severity**: critical
**First Seen**: 2026-01-07
**Status**: resolved

## Symptoms

- Command `uv run` fails
- Error: "uv: command not found" or similar
- Cannot run the generate-image.py script

```bash
$ uv run generate-image.py --test
bash: uv: command not found
```

## Root Cause

UV (a fast Python package manager) is not installed on the system. This project uses UV for dependency management and script execution.

## Solution

### macOS/Linux
```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

### macOS with Homebrew
```bash
brew install uv
```

### Windows
```powershell
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
```

### Verify Installation
```bash
uv --version
```

### After Installation
Restart your terminal and run:
```bash
uv run generate-image.py --status
```

UV will automatically install all required dependencies on first run.

## Prevention

- [ ] Document UV as a prerequisite in README
- [ ] Include installation instructions in onboarding docs
- [ ] Consider adding a shell script wrapper that checks for UV

## Related

- [Python Dependencies Missing](./python-dependencies-missing.md)
