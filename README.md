# Offers - AI Image Generation Toolkit

Generate professional-quality images using Google Gemini (Nano Banana Pro) models with optimized prompting techniques.

## Prerequisites

### 1. Install UV (Python Package Manager)

**macOS/Linux:**
```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

**Windows:**
```powershell
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
```

**Homebrew:**
```bash
brew install uv
```

### 2. Get a Google API Key

1. Visit https://aistudio.google.com/apikey
2. Create a new API key
3. Create a `.env` file in the project root:
   ```bash
   echo "GOOGLE_API_KEY=your_key_here" > .env
   ```

## Quick Start

```bash
# Clone the repository
git clone https://github.com/jneaimi/offers.git
cd offers

# Verify setup
uv run generate-image.py --status

# Test generation
uv run generate-image.py --test

# Generate your first image
uv run generate-image.py --prompt "A sunset over mountains"
```

## Usage

### Basic Generation

```bash
uv run generate-image.py --prompt "Your image description"
```

### Full Options

```bash
uv run generate-image.py \
  --prompt "Professional headshot" \
  --model pro \              # flash (default) or pro (4K capable)
  --aspect 1:1 \             # 1:1, 2:3, 3:2, 16:9, 21:9
  --size 4K \                # 1K, 2K (default), 4K (pro only)
  --count 3 \                # Generate 1-10 variations
  --output my_images \       # Output directory
  --reference photo.jpg      # Reference image(s) for consistency
```

### Options Reference

| Option | Short | Values | Default | Description |
|--------|-------|--------|---------|-------------|
| `--prompt` | `-p` | text | required | Image description |
| `--model` | `-m` | `flash`, `pro` | `flash` | Model selection |
| `--aspect` | `-a` | `1:1`, `2:3`, `3:2`, `16:9`, `21:9` | `1:1` | Aspect ratio |
| `--size` | `-s` | `1K`, `2K`, `4K` | `2K` | Image size (4K needs pro) |
| `--count` | `-c` | 1-10 | `1` | Number of variations |
| `--output` | `-o` | path | `generated_images` | Output directory |
| `--reference` | `-r` | paths | - | Reference images (up to 14) |
| `--prefix` | | string | `generated` | Filename prefix |
| `--no-text` | | flag | - | Skip text description |
| `--no-metadata` | | flag | - | Skip JSON metadata |

### Utility Commands

```bash
# Check configuration status
uv run generate-image.py --status

# Run test generation
uv run generate-image.py --test

# Interactive setup wizard
uv run generate-image.py --setup
```

## Models

| Model | Best For | Max Size |
|-------|----------|----------|
| `flash` | Fast iterations, drafts | 2K |
| `pro` | Final quality, detailed images | 4K |

## Prompt Tips

For best results, structure prompts with: **Subject + Setting + Lighting + Style**

```
Professional headshot. Navy suit, white shirt. Modern office background.
Soft natural window light. Shot on 85mm f/1.4 lens. Sharp focus.
```

Include technical details:
- Camera specs: `85mm f/1.4`, `Sony A7III`
- Lighting: `golden hour`, `three-point lighting`, `Rembrandt lighting`
- Quality: `8K resolution`, `professional quality`

## Output

Generated files are saved to `generated_images/` (or custom directory):
- `{prefix}_{timestamp}.png` - The generated image
- `{prefix}_{timestamp}.json` - Metadata (prompt, settings, model)

## Troubleshooting

**"No GOOGLE_API_KEY found"**
```bash
echo "GOOGLE_API_KEY=your_key" > .env
```

**"API_KEY_INVALID"**
- Get a new key at https://aistudio.google.com/apikey

**"uv: command not found"**
- Install UV using the commands in Prerequisites section

**Poor quality results**
- Use `--model pro --size 4K` for best quality
- Add technical photography terms to your prompt
- Be specific about lighting and composition

## License

MIT
