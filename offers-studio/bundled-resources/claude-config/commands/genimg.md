---
allowed-tools: Bash(uv:*), Read
argument-hint: "<prompt>" [--model flash|pro] [--aspect 1:1|16:9|etc] [--size 1K|2K|4K] [--count N]
description: Generate AI images using Gemini Nano Banana models via generate-image.py
---

# Generate Image with Gemini

I'll generate an image using `generate-image.py` with Gemini's Nano Banana models.

**Arguments provided:** $ARGUMENTS

## Workflow

1. Parse prompt and parameters from arguments
2. Run: `uv run generate-image.py --prompt "PROMPT" [OPTIONS]`
3. Display the generated image using Read tool
4. Show file path and offer variations

## Options Reference

| Option | Values | Default | Notes |
|--------|--------|---------|-------|
| `--model` `-m` | `flash`, `pro` | `flash` | `pro` required for 4K |
| `--aspect` `-a` | `1:1`, `2:3`, `3:2`, `16:9`, `21:9` | `1:1` | |
| `--size` `-s` | `1K`, `2K`, `4K` | `2K` | 4K requires `pro` |
| `--count` `-c` | 1-10 | `1` | Generate variations |
| `--output` `-o` | path | `generated_images` | Output directory |
| `--reference` `-r` | image paths | — | Up to 14 images |

## Examples

```bash
# Basic
uv run generate-image.py --prompt "A sunset over mountains"

# High quality
uv run generate-image.py --prompt "Product photo" --model pro --size 4K

# Widescreen
uv run generate-image.py --prompt "Banner" --aspect 16:9

# Multiple variations
uv run generate-image.py --prompt "Logo" --count 3
```

## Troubleshooting

If API key errors occur:
```bash
uv run generate-image.py --status
```

Generating your image now...
