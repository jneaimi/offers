# CLAUDE.md - GenImage Studio

AI-powered image generation using Google Gemini (Nano Banana Pro) models.

## Quick Start

```bash
# Generate an image
uv run generate-image.py --prompt "A sunset over mountains"

# Check status
uv run generate-image.py --status
```

## Commands

```bash
# Basic generation
uv run generate-image.py --prompt "PROMPT"

# Full options
uv run generate-image.py --prompt "PROMPT" \
  --model pro \           # flash (default) or pro (4K capable)
  --aspect 16:9 \         # 1:1, 2:3, 3:2, 16:9, 21:9
  --size 4K \             # 1K, 2K (default), 4K (pro only)
  --count 3 \             # 1-10 variations
  --output my-images \    # output directory
  --reference img1.jpg img2.jpg  # up to 14 reference images
```

## Models

| Model | Best For |
|-------|----------|
| `flash` | Fast iterations, drafts (max 2K) |
| `pro` | Final quality (up to 4K) |

## Prompt Engineering (ICS Framework)

Effective prompts follow **Image type + Content + Style**:

```
[Subject] + [Setting/Background] + [Lighting] + [Camera/Technical] + [Mood/Style]
```

**Tips:**
- Include camera specs: `85mm f/1.4`, `Sony A7III`
- Specify lighting: `golden hour`, `Rembrandt lighting`
- Quality keywords: `8K resolution`, `hyperrealistic`
- Keep prompts under 25 words for best results

## Output

Images saved to `generated_images/` with metadata JSON files.

## Prerequisites

- **UV**: `curl -LsSf https://astral.sh/uv/install.sh | sh`
- **Google API Key**: Add to `.env` file
