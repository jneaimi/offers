# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI-powered image generation toolkit using Google Gemini (Nano Banana Pro) models. Primary use case is generating professional marketing visuals for "Executive AI Strategy Intensive" program targeting UAE/GCC executives.

## Commands

```bash
# Check API key and configuration status
uv run generate-image.py --status

# Test image generation with sample prompt
uv run generate-image.py --test

# Interactive setup wizard
uv run generate-image.py --setup

# Generate image (basic)
uv run generate-image.py --prompt "A sunset over mountains"

# Generate with all options
uv run generate-image.py --prompt "PROMPT" \
  --model pro \           # flash (default) or pro (4K capable)
  --aspect 16:9 \         # 1:1, 2:3, 3:2, 16:9, 21:9
  --size 4K \             # 1K, 2K (default), 4K (pro only)
  --count 3 \             # 1-10 variations
  --output ceo-marketing  # output directory
  --reference img1.jpg img2.jpg  # up to 14 reference images
```

## Architecture

```
User Request → Claude Code (genimg command)
             → Nano Banana Pro Skill (prompt optimization)
             → generate-image.py
             → Google Gemini API
             → generated_images/{prefix}_{timestamp}.png + .json metadata
```

**Key files:**
- `generate-image.py` - Main CLI utility (~730 lines)
- `.claude/skills/nano-banana-pro/` - Prompt engineering skill with ICS framework
- `.claude/commands/genimg.md` - Claude Code command integration
- `teaser_executive_ai_strategy.md` - Marketing content specifications

## Prerequisites

**UV (Python package manager)** - Install if not present:
```bash
# macOS/Linux
curl -LsSf https://astral.sh/uv/install.sh | sh

# Windows
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"

# Or with Homebrew
brew install uv
```

**Google API Key** - Required in `.env` file:
```bash
echo "GOOGLE_API_KEY=your_key_here" > .env
```
Get key at: https://aistudio.google.com/apikey

The script checks multiple fallback locations for .env: CWD → script dir → home dir.

## Prompt Engineering (ICS Framework)

Effective prompts follow **Image type + Content + Style** structure:

```
[Subject] + [Clothing/Appearance] + [Setting/Background] +
[Lighting] + [Camera/Technical] + [Mood/Style]
```

**Key techniques:**
- Include camera specs: `85mm f/1.4`, `Sony A7III`
- Specify lighting: `three-point lighting`, `golden hour`, `Rembrandt lighting`
- Film stocks for analog look: `Kodak Portra 400`, `Fuji Superia`
- Quality keywords: `8K resolution`, `hyperrealistic`, `professional quality`

Prompts under 25 words achieve ~30% higher accuracy.

## Models

| Model | API Name | Best For |
|-------|----------|----------|
| `flash` | `gemini-2.5-flash-image` | Fast iterations, drafts (max 2K) |
| `pro` | `gemini-3-pro-image-preview` | Final quality (up to 4K) |

## Output Structure

- Images: `generated_images/{prefix}_{timestamp}.png`
- Metadata: `generated_images/{prefix}_{timestamp}.json` (prompt, model, settings)
