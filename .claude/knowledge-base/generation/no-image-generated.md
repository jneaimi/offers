# No Image Generated in Response

**Tags**: image-generation, response, empty-result
**Severity**: medium
**First Seen**: 2026-01-07
**Status**: resolved

## Symptoms

- Generation completes but no images saved
- Warning message about no images
- Result["images"] is empty
```
⚠️  No images generated
```
or
```
Warning: Could not extract image data from response part
```

## Root Cause

The API returned a response, but no image data could be extracted. Possible reasons:
1. Content policy violation in the prompt
2. SDK version mismatch in image extraction methods
3. Server-side generation failure
4. Invalid reference images

## Solution

### Step 1: Check Prompt Content
Ensure your prompt doesn't violate content policies:
- No explicit or violent content
- No copyrighted characters without permission
- No real person likenesses without consent

### Step 2: Try Without Reference Images
If using `--reference`, try without them first:
```bash
uv run generate-image.py --prompt "Your prompt"
```

### Step 3: Update SDK
```bash
uv add google-genai --upgrade
```

### Step 4: Try Different Model
```bash
uv run generate-image.py --prompt "Your prompt" --model pro
```

### Step 5: Check API Status
Visit https://status.cloud.google.com/ for any ongoing issues.

## Prevention

- [ ] Keep prompts within content guidelines
- [ ] Test reference images individually before batching
- [ ] Keep SDK updated
- [ ] Use simple prompts for debugging

## Related

- [Invalid Argument Error](../api/invalid-argument.md)
