# API Quota Exhausted (429 Rate Limit)

**Tags**: gemini-api, rate-limit, quota, 429
**Severity**: medium
**First Seen**: 2026-01-07
**Status**: resolved

## Symptoms

- Image generation fails with 429 error
- Error message contains "RESOURCE_EXHAUSTED" or "quota"
- Multiple rapid requests trigger the error
```
ERROR: Quota Exhausted

You've exceeded your API quota.
Wait a few minutes or check your billing at:
  https://console.cloud.google.com/billing
```

## Root Cause

Gemini API has rate limits that restrict how many requests can be made per minute. Making too many requests in rapid succession (e.g., batch generation without delays) triggers this limit.

## Solution

### Option 1: Wait and Retry
Wait 1-2 minutes before retrying. The quota resets automatically.

### Option 2: Add Delays Between Requests
When generating multiple images, add a delay between requests:

```python
import time

for prompt in prompts:
    result = generate_image(prompt, ...)
    time.sleep(2)  # 2-second delay between requests
```

### Option 3: Check Billing
If quota issues persist, you may need to upgrade your Google Cloud billing plan:
1. Go to https://console.cloud.google.com/billing
2. Check your current usage and limits
3. Upgrade if necessary

## Prevention

- [ ] Add delays when generating multiple images in sequence
- [ ] Use `--count` flag wisely (start with small counts)
- [ ] Monitor usage in Google Cloud Console
- [ ] Consider using Pro model strategically (may have different limits)

## Related

- [Invalid API Key](./invalid-api-key.md)
- [Permission Denied](./permission-denied.md)
