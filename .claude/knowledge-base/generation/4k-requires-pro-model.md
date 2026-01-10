# 4K Size Requires Pro Model

**Tags**: image-generation, model, size, configuration
**Severity**: low
**First Seen**: 2026-01-07
**Status**: resolved

## Symptoms

- Warning message when requesting 4K with flash model
- Model automatically switched to pro
```
Warning: 4K only available with Pro model. Switching to Pro...
```

## Root Cause

The Gemini 2.5 Flash Image model (flash) only supports up to 2K resolution. 4K resolution requires the Gemini 3 Pro Image Preview model (pro).

## Solution

### Option 1: Use Pro Model Explicitly
```bash
uv run generate-image.py --prompt "Your prompt" --model pro --size 4K
```

### Option 2: Use 2K with Flash Model
If you don't need 4K quality:
```bash
uv run generate-image.py --prompt "Your prompt" --model flash --size 2K
```

### Model Comparison

| Feature | Flash | Pro |
|---------|-------|-----|
| Max Size | 2K | 4K |
| Speed | Fast | Slower |
| Quality | Good | Best |
| Use Case | Drafts, iterations | Final output |

## Prevention

- [ ] Set default model to "pro" in config if you frequently need 4K
- [ ] Run `uv run generate-image.py --setup` to configure defaults
- [ ] Remember: 4K = Pro model always

## Related

- [Image Size Configuration](./image-size-config.md)
