# API Key Not Found

**Tags**: gemini-api, auth, api-key, configuration
**Severity**: critical
**First Seen**: 2026-01-07
**Status**: resolved

## Symptoms

- Script fails immediately on startup
- Error message about missing API key
- No generation is attempted
```
ERROR: API Key Not Found

No GOOGLE_API_KEY or GEMINI_API_KEY found.

To fix this, either:
  1. Create a .env file with: GOOGLE_API_KEY=your_key_here
  2. Export directly: export GOOGLE_API_KEY=your_key_here

Get your API key at: https://aistudio.google.com/apikey
```

## Root Cause

The script looks for API keys in environment variables, which can be set via:
1. `.env` file in the current directory
2. `.env` file in the script directory
3. `.env` file in home directory
4. Shell environment variables

None of these locations have a valid `GOOGLE_API_KEY` or `GEMINI_API_KEY` set.

## Solution

### Option 1: Create .env File (Recommended)
```bash
# In the project directory
echo "GOOGLE_API_KEY=your_key_here" > .env
```

### Option 2: Export in Shell
```bash
# For current session only
export GOOGLE_API_KEY=your_key_here

# Or add to ~/.bashrc or ~/.zshrc for persistence
echo 'export GOOGLE_API_KEY=your_key_here' >> ~/.zshrc
```

### Option 3: Create in Home Directory
```bash
# Global .env file
echo "GOOGLE_API_KEY=your_key_here" > ~/.env
```

### Getting an API Key
1. Go to https://aistudio.google.com/apikey
2. Click "Create API Key"
3. Select a project (or create new)
4. Copy the generated key

### Verify Setup
```bash
uv run generate-image.py --status
```

## Prevention

- [ ] Include `.env.example` in project with placeholder key
- [ ] Add `.env` to `.gitignore` to prevent accidental commits
- [ ] Document API key setup in project README
- [ ] Use `--status` to check configuration before generating

## Related

- [Invalid API Key](./invalid-api-key.md)
