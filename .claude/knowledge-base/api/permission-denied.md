# Permission Denied Error

**Tags**: gemini-api, auth, permission, access
**Severity**: high
**First Seen**: 2026-01-07
**Status**: resolved

## Symptoms

- API call fails with permission error
- Error message contains "PERMISSION_DENIED"
- API key is valid but generation fails
```
ERROR: Permission Denied

Your API key doesn't have access to image generation.
Ensure image generation is enabled in your Google AI project.
```

## Root Cause

The API key is valid, but:
1. Image generation is not enabled for this API key
2. The Google Cloud project doesn't have the required APIs enabled
3. The API key has restricted permissions that don't include Gemini image generation

## Solution

### Step 1: Check API Key Permissions
1. Go to https://console.cloud.google.com/apis/credentials
2. Find your API key
3. Check if it has any restrictions that might block Gemini

### Step 2: Enable Required APIs
1. Go to https://console.cloud.google.com/apis/library
2. Search for "Generative Language API" or "Gemini API"
3. Enable the API for your project

### Step 3: Create Unrestricted Key (for testing)
1. Go to https://aistudio.google.com/apikey
2. Create a new API key (these are typically unrestricted)
3. Update your `.env` file with the new key

### Step 4: Verify
```bash
uv run generate-image.py --test
```

## Prevention

- [ ] Use API keys from AI Studio (fewer restrictions)
- [ ] Keep a testing key separate from production
- [ ] Verify API access before deploying
- [ ] Check Google Cloud Console for API quotas and limits

## Related

- [Invalid API Key](./invalid-api-key.md)
- [Rate Limit 429](./rate-limit-429.md)
