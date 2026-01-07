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

### 7. Character & Figure Design

**Chibi/Q-Version:**
```
Transform photo into cute 3D chibi character. Enlarged head, small body.
Soft pastel colors. Smooth matte finish. Studio lighting. White background.
```

**Anime Figure:**
```
Create anime-style figure based on attached character photo. Accurately reproduce
full body posture, facial expression, and clothing style. PVC figure aesthetic.
Display base included.
```

**Bobblehead:**
```
Convert selfie to bobblehead figure. Oversized head on spring neck. Cartoonified
features. Glossy finish. Mounted on circular base. Product photography style.
```

### 8. Miniature & Diorama

**Tilt-Shift Miniature:**
```
Tilt-shift photography effect. [SCENE] as miniature world. 45-degree bird's-eye view.
Soft focus edges. Vibrant saturated colors. Tiny scale aesthetic.
```

**Keycap Diorama:**
```
Translucent artisan keycap containing miniature [SCENE]. Resin-encased world.
Soft internal glow. Studio lighting. Product photography. 1:1 aspect ratio.
```

**Crystal Ball Scene:**
```
Clear crystal ball containing miniature [SCENE]. Mystical glow from within.
Reflections on glass surface. Dark moody background. Macro photography style.
```

### 9. Object Transformations

**Glass/Crystal Version:**
```
[OBJECT] rendered as transparent glass sculpture. Iridescent effects.
Chromatic aberration. Studio HDRI lighting. High contrast. Floating on white.
```

**Enamel Pin Design:**
```
[SUBJECT] as enamel pin. Gold metal outline. Glossy colored sections.
Hard enamel finish. Slight 3D depth. Product shot on fabric background.
```

**Mechanical/Steampunk:**
```
[OBJECT] reimagined with steampunk aesthetic. Brass gears, copper pipes,
glass components. Victorian industrial. Detailed mechanical parts. Warm lighting.
```

### 10. Surreal & Conceptual

**Double Exposure:**
```
Double exposure portrait. [PERSON] silhouette merged with [LANDSCAPE].
Blended imagery. Artistic photography. Muted earth tones. Ethereal mood.
```

**Cloud Formation:**
```
[SUBJECT] formed entirely by white clouds. Floating in blue sky above [LANDMARK].
Photorealistic clouds. Natural daylight. Wide-angle perspective.
```

**Pencil-to-Reality:**
```
Pencil sketch of [SUBJECT A] interacting with [SUBJECT B]. Subject A is
hand-drawn grayscale. Subject B is photorealistic full-color. Blended seamlessly.
```

### 11. Fashion & Street Style

**Ultra-Realistic Street Fashion:**
```
Street fashion portrait. Young woman in beige oversized jacket, baggy olive jeans.
Warm afternoon sunlight. Urban background with bokeh. Shot on Sony A7IV, 85mm f/1.4.
Instagram aesthetic. 8K resolution.
```

**High-Fashion Editorial:**
```
Editorial fashion portrait. Woman in elegant evening gown, red lipstick, smoky eye.
Luxury car interior setting. Cinematic lighting, shallow depth of field.
Editorial-grade, fashion magazine quality.
```

**Y2K Vintage Aesthetic:**
```
Y2K fashion photo. Direct flash, paparazzi vibe. Early-2000s styling.
Red digital timestamp in corner. Film grain, soft contrast, warm highlights.
Nostalgic disposable camera look.
```

### 12. Cinematic & Atmospheric

**Cyberpunk Character:**
```
Cyberpunk assassin in neon-lit alley. Rain-soaked streets, holographic signs.
Cinematic realism, shallow depth of field. Neo-noir atmosphere.
Shot on Arri Alexa, anamorphic lens. 4K cinematic.
```

**Wong Kar-wai Stillness:**
```
Intimate portrait with Wong Kar-wai aesthetic. Melancholic mood, warm color grading.
Soft focus, dreamy bokeh. Film grain texture. Nostalgic, contemplative atmosphere.
```

**2AM Tokyo Vibe:**
```
Late night balcony selfie. Tokyo cityscape bokeh in background. Neon reflections.
Relaxed pose, authentic expression. Moody aesthetic, film grain.
Natural available light. Raw, unfiltered look.
```

### 13. Mirror & Reflection Shots

**Bathroom Mirror Selfie:**
```
Mirror selfie in modern bathroom. White subway tiles, soft diffused lighting.
Phone visible in reflection. Accurate mirror physics. Film grain, moody aesthetic.
Authentic casual pose. Instagram-ready composition.
```

### 14. Presentation & Slide Graphics

**Professional Business Slide:**
```
Professional 16:9 slide design. Clean white background, modern typography.
Structured sections with clear headings. Space for charts and icons.
Corporate blue color scheme. Business presentation aesthetic.
```

**Technical Blueprint:**
```
Technical blueprint style 16:9 slide. Diagrams with annotated labels.
Structured grid layout. Measurement lines and callouts.
Dark blue background, white/cyan linework. Engineering aesthetic.
```

**Editorial Infographic:**
```
Modern editorial infographic style. 16:9 format. Visual story layout.
Strong headline, multiple sections. Clean flat illustrations and icons.
Bold typography. Magazine-quality design.
```

**Sketchnote Style:**
```
Sketchnote style 16:9 slide. Hand-drawn doodle aesthetic.
Colorful icons and arrows. Whimsical typography.
Playful illustrations. Educational yet engaging.
```

### 15. Infographics & Data Visualization

**Statistical Data Infographic:**
```
Modern data infographic. Large bold numbers as focal points. Supporting icons.
Clean minimal layout. [Color scheme] palette. Percentage bars and metrics.
White background. Professional data visualization style.
```

**Timeline Infographic:**
```
Horizontal timeline infographic. [Topic] chronology from [start] to [end].
Connected milestone points. Icons for each event. Color-coded periods.
Clean modern design. Clear date labels. Visual progression.
```

**Comparison Infographic:**
```
Side-by-side comparison infographic. [Item A] vs [Item B].
Two-column layout with matching categories. Check/cross icons.
Contrasting colors for each side. Clear visual hierarchy.
```

**Process Flow Infographic:**
```
Step-by-step process infographic. [Number] stages with numbered circles.
Connecting arrows between steps. Icon for each stage.
Vertical or horizontal flow. Color gradient progression.
```

**Pie/Donut Chart Visualization:**
```
Modern donut chart infographic. [Topic] breakdown by percentage.
Bold center statistic. Color-coded segments with labels.
Clean legend. Flat design style. Data visualization aesthetic.
```

**Bar Chart Infographic:**
```
Horizontal bar chart infographic. [Topic] comparison data.
Gradient colored bars. Value labels on each bar. Ranked order.
Clean grid lines. Modern minimal style. Clear axis labels.
```

**Map-Based Infographic:**
```
Geographic data infographic. [Region] map with data overlay.
Color-coded regions by value. Legend with scale. Key statistics callout.
Clean cartographic style. Data markers for points of interest.
```

**Icon Grid Infographic:**
```
Icon-based statistics infographic. Grid of [number] human/object icons.
Highlighted portion showing percentage. Large statistic number.
Minimal design. Single accent color. Visual ratio representation.
```

**Hierarchical Infographic:**
```
Pyramid/hierarchy infographic. [Topic] levels from top to bottom.
Layered sections with labels. Size indicates importance.
Color gradient from top to base. Clean geometric shapes.
```

**List Infographic:**
```
Numbered list infographic. Top [number] [topic]. Large numbers as design elements.
Icon beside each item. Brief description text. Alternating background colors.
Modern editorial style. Easy-to-scan layout.
```

### 16. Social Media Graphics

**Quote Card:**
```
Wide quote card featuring [person/topic]. [Color] background with [font style] text.
Gradient portrait on left side. Quote text prominent. Author attribution below.
Social media share-ready. Elegant typography.
```

**YouTube Thumbnail:**
```
YouTube thumbnail. [Subject] with exaggerated [expression]. Bold text "[TITLE]"
on [position]. Bright saturated colors. High contrast. Eye-catching composition.
Face taking 40% of frame. Clean gradient background.
```

**Instagram Carousel:**
```
Instagram carousel slide [number] of [total]. [Topic] content.
Consistent [color] brand palette. Bold headline. Supporting text.
Swipe indicator. Square 1:1 format. Clean modern design.
```

### 17. Comic & Storyboard

**Comic Panel:**
```
Comic book panel. [Scene description]. Bold black outlines. Halftone dot shading.
Speech bubble with "[dialogue]". Dynamic action lines. Vibrant pop colors.
Classic comic book style.
```

**Manga Panel:**
```
Manga panel. [Character] in [action/emotion]. Black and white with screentones.
Speed lines for motion. Expressive eyes. Japanese manga aesthetic.
Right-to-left reading format.
```

**Storyboard Frame:**
```
Film storyboard frame. [Shot type]: [scene description].
Rough sketch style. Arrow indicating camera movement.
Aspect ratio markers. Scene number and description box. Pre-production aesthetic.
```

### 18. Game Assets

**Game Character Sprite:**
```
2D game character sprite. [Character description]. Pixel art style.
[Number]-color palette. Transparent background. Idle pose.
Retro platformer aesthetic. Clean pixel edges.
```

**Game Item Icon:**
```
Game item icon. [Item type] for RPG inventory. Glossy rendered style.
Gold border frame. Slight 3D depth. Dark background.
64x64 pixel dimensions. Mobile game aesthetic.
```

**Game Environment Tile:**
```
Tileable game texture. [Environment type] surface. Seamless edges.
Top-down perspective. [Art style]. Consistent lighting.
Game-ready asset. Square format.
```

### 19. E-commerce & Product

**Product Hero Shot:**
```
E-commerce hero image. [Product] floating on gradient background.
Dramatic lighting with soft shadows. Multiple angles reflection.
4K commercial quality. Clean isolated product photography.
```

**Lifestyle Product Shot:**
```
Lifestyle product photography. [Product] in use context.
[Setting] environment. Natural lighting. Aspirational mood.
Model interaction optional. Brand-elevating composition.
```

**Product Flat Lay:**
```
Flat lay product arrangement. [Products] on [surface].
Top-down 90-degree angle. Styled props and accessories.
Cohesive color story. Instagram-worthy composition.
```

### 20. Traditional Art Styles

**Ukiyo-e Japanese:**
```
Ukiyo-e woodblock print style. [Subject] in traditional Japanese art aesthetic.
Bold outlines, flat color areas. Wave patterns and nature elements.
Edo period artistic style. Vintage paper texture.
```

**Art Nouveau:**
```
Art Nouveau style illustration. [Subject] with flowing organic lines.
Decorative floral borders. Muted earth tones with gold accents.
Alphonse Mucha inspired. Elegant feminine aesthetic.
```

**Bauhaus Poster:**
```
Bauhaus design style. [Subject] using geometric shapes.
Primary colors: red, blue, yellow on white/black.
Sans-serif typography. Modernist aesthetic. 1920s avant-garde.
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

### Common Negative Prompts

Use these to improve quality by specifying what NOT to generate:

**Quality Issues:**
```
Avoid: blurry, low quality, pixelated, jpeg artifacts, noise, grainy
```

**Anatomical Problems:**
```
Avoid: extra fingers, bad anatomy, distorted hands, missing limbs, mutated
```

**Skin/Texture Issues:**
```
Avoid: plastic skin, doll-like, oversmoothed, waxy, uncanny valley
```

**Style Conflicts:**
```
Avoid: cartoon, illustration, painting, 3D render, CGI, anime (when photorealistic)
```

**Unwanted Elements:**
```
Avoid: watermark, text, logo, signature, border, frame
```

### Character Preservation Techniques

When maintaining facial identity across generations:

**Strong Identity Lock:**
```
Keep facial features 100% identical to reference. Do NOT change the face.
Maintain exact bone structure, eye shape, nose, and distinguishing features.
[Then add your scene/style instructions...]
```

**Subtle Variations Allowed:**
```
Preserve core facial identity from reference. Allow natural expression changes.
Maintain recognizable likeness while adapting to new pose/lighting.
```

**Multi-Reference Consistency:**
```
Using multiple reference images: maintain consistent identity across all.
Face from ref1, pose inspiration from ref2, lighting style from ref3.
Seamless integration, single unified character.
```

### JSON-Formatted Specifications

For precise material and lighting control:
```json
{
  "lighting": "studio HDRI, high intensity, angled top-left",
  "material": "glass with transparent and iridescent effects",
  "post_processing": "chromatic aberration, glow, high contrast",
  "background": "pure white, soft gradient shadow"
}
```

### Placeholder Variables

Use brackets for reusable prompts:
- `[SUBJECT]` — Main element to generate
- `[STYLE]` — Visual aesthetic
- `[LANDMARK]` — Specific location
- `[MATERIAL]` — Surface/texture type

### Material & Texture Descriptors

**Surface finishes:**
- `smooth polished` — Reflective, mirror-like
- `matte finish` — Non-reflective, soft
- `glossy chrome` — Metallic, shiny
- `tactile felt` — Fabric-like texture
- `frosted glass` — Translucent, diffused

**Material types:**
- `hard enamel` — Glossy filled sections
- `brushed metal` — Directional texture
- `resin-encased` — Clear plastic embedding
- `ceramic glaze` — Pottery finish

### Atmosphere & Mood Keywords

**Emotional Tones:**
- `melancholic` — Sad, reflective, bittersweet
- `ethereal` — Otherworldly, dreamy, floating
- `intimate` — Close, personal, vulnerable
- `raw` — Unfiltered, honest, gritty
- `nostalgic` — Wistful, reminiscent, vintage feel
- `contemplative` — Thoughtful, quiet, introspective

**Cinematic References:**
- `Wong Kar-wai stillness` — Saturated colors, longing, urban romance
- `Blade Runner neo-noir` — Neon, rain, dystopian
- `Wes Anderson symmetry` — Centered, pastel, quirky
- `Terrence Malick golden hour` — Natural light, poetic, wandering

**Atmosphere Descriptors:**
- `moody` — Low-key lighting, shadows, tension
- `dreamy` — Soft focus, hazy, romantic
- `gritty` — Textured, urban, realistic
- `serene` — Calm, peaceful, balanced
- `dramatic` — High contrast, intense, bold
- `whimsical` — Playful, fantastical, light

### Extended Technical Specifications

**Resolution & Quality:**
- `8K resolution` — Maximum detail
- `4K DSLR quality` — Professional standard
- `64K ultra-detailed` — Extreme close-up capable

**Aperture Settings:**
- `f/1.4` — Very shallow DOF, dreamy bokeh
- `f/2.0` — Shallow DOF, subject isolation
- `f/2.8` — Moderate DOF, balanced
- `f/8` — Deep DOF, landscapes/architecture
- `f/16` — Maximum sharpness throughout

**Lighting Timestamps:**
- `golden hour` — 1 hour after sunrise/before sunset
- `blue hour` — 20-30 min after sunset
- `high noon` — Harsh overhead, strong shadows
- `2am vibe` — Artificial light, neon, moody
- `bright morning` — Fresh, clean, energetic

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

- [YouMind Awesome Prompts](https://github.com/YouMind-OpenLab/awesome-nano-banana-pro-prompts) — 4,039 multilingual prompts
- [NoteGPT Slides Prompts](https://notegpt.io/blog/nano-banana-pro-slides-prompts) — 20 presentation templates
- [promptgather.io Spreadsheet](https://docs.google.com/spreadsheets/d/1GAp_yaqAX9y_K8lnGQw9pe_BTpHZehoonaxi4whEQIE/) — 900+ curated prompts with categories
- [awesome-nano-banana](https://github.com/JimmyLv/awesome-nano-banana) — 100 curated prompt cases comparing Gemini & GPT-4o
- [awesome-nanobanana-pro](https://github.com/ZeroLu/awesome-nanobanana-pro) — Community prompt collection
- [Google Blog: Nano Banana Pro Tips](https://blog.google/products/gemini/prompting-tips-nano-banana-pro/)
- [Google Developers: Gemini Image Best Practices](https://developers.googleblog.com/en/how-to-prompt-gemini-2-5-flash-image-generation-for-the-best-results/)
- [Google AI: Imagen Prompt Guide](https://ai.google.dev/gemini-api/docs/imagen-prompt-guide)
