---
description: Expert-guided image generation using Gemini 3 Pro Image (Nano Banana Pro) with professional prompting techniques. Use this skill when users want to generate high-quality, professional images with optimal prompting strategies, reference images, or need guidance on best practices for AI image generation.
---

# Nano Banana Pro Expert

I'm a specialized skill for generating professional-quality images using **Gemini 3 Pro Image (Nano Banana Pro)** with research-backed best practices from Google DeepMind's 2025 guidelines and community-tested prompt patterns.

## Prerequisites

Before generating images, ensure:

1. **API Key** is configured in `.env` file:
   ```
   GOOGLE_API_KEY=your_key_here
   ```
   Get your key at: https://aistudio.google.com/apikey

2. **Check status** with:
   ```bash
   uv run generate-image.py --status
   ```

## Command Syntax

```bash
uv run generate-image.py --prompt "YOUR PROMPT" [OPTIONS]
```

### Required
- `--prompt` or `-p` — Text description of desired image

### Options
| Flag | Short | Values | Default | Description |
|------|-------|--------|---------|-------------|
| `--model` | `-m` | `flash`, `pro` | `flash` | Model to use (pro = 4K capable) |
| `--aspect` | `-a` | `1:1`, `2:3`, `3:2`, `16:9`, `21:9` | `1:1` | Aspect ratio |
| `--size` | `-s` | `1K`, `2K`, `4K` | `2K` | Image size (4K requires pro) |
| `--output` | `-o` | directory path | `generated_images` | Output directory |
| `--count` | `-c` | 1-10 | `1` | Number of variations |
| `--reference` | `-r` | image paths | — | Reference images (up to 14) |
| `--prefix` | | string | `generated` | Output filename prefix |
| `--no-text` | | flag | — | Skip text description |
| `--no-metadata` | | flag | — | Skip metadata JSON |

## Prompt Categories & Examples

### 1. Professional Portraits & Headshots

**Business Headshot:**
```
Professional high-resolution profile photo. Navy blue business suit, white shirt.
Shot on Sony A7III with 85mm f/1.4 lens. Classic three-point lighting setup with
soft key light at 45 degrees. Shallow depth of field, soft bokeh. 8K resolution.
```

**Emotional Film Portrait:**
```
Cinematic emotional portrait shot on Kodak Portra 400 film. Urban street coffee
shop window at golden hour. Warm amber tones, subtle film grain. Natural catchlights
in eyes. Chest-up framing with ample headroom.
```

**Spotlight Portrait:**
```
Hyperrealistic portrait against completely black background. Narrow beam spotlight
focused only on center of face. High falloff shadow, sharp dramatic edges.
High-contrast only in lit portion. Visible skin texture with natural pores.
```

### 2. Product & E-commerce Photography

**Product Isolation:**
```
Professional product photography. Clean white background with soft gradient shadow.
Studio lighting with large softbox overhead. Sharp focus throughout. Commercial
quality, 4K resolution. Subtle reflection on surface.
```

**Virtual Try-On Style:**
```
Fashion e-commerce photo. Model wearing [ITEM]. Clean studio setup, full-body shot.
Even lighting, no harsh shadows. Neutral expression, professional pose.
White seamless background.
```

### 3. Marketing & Conceptual

**Corporate Metaphor:**
```
Business executive in suit standing at foggy crossroads. Multiple glowing pathways
ahead representing choices. Golden compass light illuminating one clear direction.
Cinematic wide-angle. Moody corporate aesthetic.
```

**Tech Innovation Visual:**
```
Futuristic holographic interface floating in dark space. Blue and cyan glow.
Human hand reaching toward interactive elements. Shallow depth of field.
Corporate technology aesthetic. 8K ultra-detailed.
```

### 4. Interior Design & Architecture

**Room Visualization:**
```
Modern minimalist living room interior. Floor-to-ceiling windows, natural daylight.
Scandinavian furniture, warm wood tones, white walls. Wide-angle architectural
photography. Professional real estate quality.
```

**Floor Plan to Render:**
```
Convert floor plan to photorealistic 3D interior visualization. Multiple perspective
views. Modern contemporary style. Natural lighting through windows.
Furniture and decor included.
```

### 5. Creative & Artistic

**Isometric Diorama:**
```
3D isometric diorama of [SCENE]. Miniature world aesthetic. Soft even lighting.
Tilt-shift photography effect. Vibrant colors, detailed textures.
Clean white background.
```

**Retro Aesthetic:**
```
1990s-style photograph using direct front flash. Harsh flash with bright blown-out
highlights. Subtle film grain, retro color grading. Nostalgic disposable camera
aesthetic. Natural imperfections.
```

### 6. Social Media Content

**Viral Thumbnail:**
```
YouTube thumbnail style. Exaggerated surprised expression. Bold text overlay space
on right. Bright saturated colors. High contrast. Eye-catching composition.
Clean background with subtle gradient.
```

**Instagram Portrait:**
```
Lifestyle Instagram photo. Golden hour natural lighting. Casual authentic moment.
Warm color grading. Shallow depth of field background blur.
Square 1:1 composition.
```

## Advanced Prompt Techniques

### Technical Photography Specifications

Include these elements for professional results:

**Camera & Lens:**
- `85mm f/1.4 lens` — Classic portrait compression
- `35mm f/1.8` — Environmental portraits
- `24mm wide-angle` — Architectural, landscapes
- `Sony A7III`, `Canon 5D Mark IV` — Adds realism cues

**Lighting Setups:**
- `Three-point lighting` — Key, fill, rim lights
- `Rembrandt lighting` — Classic portrait shadow pattern
- `Golden hour` — Warm natural outdoor light
- `Soft diffused lighting` — Even, shadowless
- `Narrow beam spotlight` — Dramatic isolation

**Film Stocks (for analog aesthetics):**
- `Kodak Portra 400` — Warm skin tones, soft contrast
- `Fuji Superia` — Cooler tones, punchy colors
- `Ilford HP5` — Classic black and white grain

### Structural Prompt Patterns

**Layered Description (most effective):**
```
[Subject] + [Clothing/Appearance] + [Setting/Background] +
[Lighting] + [Camera/Technical] + [Mood/Style]
```

**JSON-Structured Prompts** (for complex compositions):
```json
{
  "subject": "young professional woman",
  "attire": "navy blazer, white blouse",
  "setting": "modern office with city view",
  "lighting": "natural window light, soft fill",
  "camera": "85mm f/2.0, shallow DOF",
  "mood": "confident, approachable",
  "style": "corporate lifestyle photography"
}
```

### Face Preservation (with reference images)

When using `--reference` to maintain facial features:
```
Keep the facial features of the person in the uploaded image exactly consistent.
Maintain exact facial structure, identity, and key features.
[Then add your styling instructions...]
```

### Negative Instructions

Specify what to avoid:
```
Professional headshot. Clean background.
Avoid: harsh shadows, unnatural skin smoothing, oversaturation,
busy backgrounds, lens distortion.
```

## Pro Tips from Community

### Contrast Creates Impact
Combine unexpected elements: "angel face but devil body" or "ancient architecture with futuristic lighting"

### Background Detail Adds Authenticity
Specific backgrounds ("cluttered vanity with lip glosses," "white subway tile walls") create more believable images than generic descriptions.

### Emotion Through Lighting
"Narrow beam spotlight with high falloff shadow" creates mystery. "Soft wrap-around light" suggests warmth and approachability.

### Texture Specification
Include material details: "subtle wool texture," "individual threads visible," "natural skin texture with visible pores" for hyperrealism.

### Micro-Detail Keywords
Unlock model capabilities with: "natural catchlights in eyes," "micro-details of hair," "subtle film grain," "pores and skin texture"

## Aspect Ratio Guide

| Ratio | Use Case | Best For |
|-------|----------|----------|
| `1:1` | Social media, avatars | Instagram, profile pics |
| `16:9` | Web headers, presentations | YouTube, LinkedIn banners |
| `3:2` | Photography, prints | Standard photo prints |
| `2:3` | Portrait, stories | Instagram stories, posters |
| `21:9` | Cinematic, ultra-wide | Film stills, panoramic |

## Quality Checklist

Before generating, ensure your prompt includes:

- [ ] **Subject** — Clear description of main element
- [ ] **Style** — Photo, illustration, render, etc.
- [ ] **Lighting** — Natural, studio, dramatic, etc.
- [ ] **Composition** — Framing, angle, depth
- [ ] **Technical** — Camera specs if photorealistic
- [ ] **Mood** — Emotional tone or atmosphere

## Troubleshooting

### API Key Issues

**"API key expired" or "API_KEY_INVALID"**
```bash
uv run generate-image.py --status
# Get new key at: https://aistudio.google.com/apikey
```

**"No GOOGLE_API_KEY found"**
```bash
echo "GOOGLE_API_KEY=your_key_here" > .env
```

### Generation Issues

**"INVALID_ARGUMENT"**
- Check prompt for content policy violations
- Simplify complex prompts
- Try different aspect ratio/size

**Poor quality results**
- Add technical specifications (lens, lighting)
- Use `--model pro --size 4K` for best quality
- Be more specific about style and mood

### Quick Diagnostics
```bash
uv run generate-image.py --status   # Check configuration
uv run generate-image.py --test     # Test generation
```

## Models

| Model | Name | Best For | Max Size |
|-------|------|----------|----------|
| `flash` | Gemini 2.5 Flash Image | Fast iterations, drafts | 2K |
| `pro` | Gemini 3 Pro Image | Final quality, 4K output | 4K |

## Sources & Research

- [awesome-nanobanana-pro](https://github.com/ZeroLu/awesome-nanobanana-pro) — Community prompt collection
- [Google Blog: Nano Banana Pro Tips](https://blog.google/products/gemini/prompting-tips-nano-banana-pro/)
- [Google Developers: Gemini Image Best Practices](https://developers.googleblog.com/en/how-to-prompt-gemini-2-5-flash-image-generation-for-the-best-results/)
- [Google AI: Imagen Prompt Guide](https://ai.google.dev/gemini-api/docs/imagen-prompt-guide)
