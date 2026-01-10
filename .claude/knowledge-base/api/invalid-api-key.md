# Invalid or Expired API Key

**Tags**: gemini-api, auth, api-key, 401
**Severity**: critical
**First Seen**: 2026-01-07
**Status**: resolved

## Symptoms

- Image generation fails immediately
- Error message contains "API_KEY_INVALID" or "API key expired"
- No images are generated
```
ERROR: Invalid or Expired API Key

Your Google API key is invalid or has expired.

To fix this:
  1. Go to: https://aistudio.google.com/apikey
  2. Create a new API key (or regenerate existing one)
  3. Update your .env file: GOOGLE_API_KEY=new_key_here
```

## Root Cause

The API key in your `.env` file is either:
1. Incorrectly copied (missing characters, extra whitespace)
2. Has been revoked or expired
3. Was created for a different project
4. Has reached its usage limit

## Solution

### Step 1: Verify Current Key Location
```bash
# Check which .env file is being used
uv run generate-image.py --status
```

### Step 2: Create New API Key
1. Go to https://aistudio.google.com/apikey
2. Click "Create API Key"
3. Copy the new key (make sure to copy the ENTIRE key)

### Step 3: Update .env File
```bash
# Edit .env file in project directory
echo "GOOGLE_API_KEY=your_new_key_here" > .env
```

### Step 4: Verify
```bash
# Test the new key
uv run generate-image.py --test
```

## Prevention

- [ ] Store API keys securely (never commit to git)
- [ ] Use environment-specific .env files
- [ ] Set up API key rotation reminders
- [ ] Check `--status` output when issues occur

## Related

- [API Key Not Found](./api-key-not-found.md)
- [Permission Denied](./permission-denied.md)
