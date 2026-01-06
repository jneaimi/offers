# Nano Banana Pro Skill

Expert-guided image generation using Gemini 3 Pro Image (Nano Banana Pro) with research-backed best practices from Google DeepMind's 2025 guidelines.

## What is This Skill?

This skill automatically enhances your image generation requests by applying professional prompt engineering techniques specifically optimized for **Gemini 3 Pro Image (Nano Banana Pro)**.

## How It Works

### Automatic Activation

The skill is automatically invoked when you:
- Request high-quality or professional image generation
- Mention "Nano Banana Pro" or "Gemini 3 Pro Image"
- Ask for help optimizing image prompts
- Want to use reference images or maintain character consistency
- Need specific photography, design, or artistic styles

### What It Does

1. **Analyzes** your request to understand intent
2. **Optimizes** your prompt using ICS Framework and photography principles
3. **Generates** the image with optimal parameters (model: pro, size: 4K)
4. **Explains** the prompt choices and offers refinement options

## Research-Backed Techniques

### 1. ICS Framework
- **I**mage type (photo, illustration, diagram)
- **C**ontent (subject, action, context)
- **S**tyle (artistic direction, medium)

### 2. 25-Word Rule
Google DeepMind's 2025 study shows prompts under 25 words achieve **30% higher accuracy** for composition.

### 3. Photography Language
Professional terms like:
- Camera: "85mm f/1.4", "wide-angle", "macro shot"
- Lighting: "golden hour", "Rembrandt lighting", "soft diffused"
- Composition: "rule of thirds", "shallow depth of field", "bokeh"

### 4. Quality Modifiers
Strategic use of terms like "high-quality", "professional", "4K", "commercial-grade"

## Files in This Skill

- **SKILL.md** - Main skill definition and workflow
- **prompt-templates.md** - Ready-to-use templates for different use cases
- **examples.md** - Before/after prompt optimizations with explanations
- **README.md** - This file

## Example Usage

### Simple Request
```
You: "Create a product photo of a smartwatch"

Skill: [Optimizes to]
"Smartwatch on marble surface. Studio lighting. White background. Macro lens. 4K product photography."

Parameters: --model pro --size 4K --aspect 1:1
```

### Complex Request
```
You: "Generate a professional portrait with nice lighting"

Skill: [Optimizes to]
"Professional portrait. Navy blazer. Soft window light. 85mm f/1.4. Confident expression. Corporate headshot."

Parameters: --model pro --size 4K --aspect 2:3
```

### With Reference Images
```
You: "Use these product photos to create a lifestyle shot in nature"

Skill: [Optimizes to]
"Using product references: lifestyle shot in forest setting. Natural sunlight. Maintain exact branding. Environmental context."

Parameters: --model pro --size 4K --aspect 16:9 --reference product1.jpg product2.jpg
```

## Supported Use Cases

### Photography
- Product photography
- Portraits and headshots
- Food photography
- Lifestyle shots
- Architectural photography

### Design & Branding
- Logo design
- Infographics
- Social media graphics
- Marketing materials
- Brand visuals

### Artistic
- Digital art and illustrations
- Character design
- Concept art
- Environmental scenes
- Abstract compositions

### Technical
- Diagrams and flowcharts
- Blueprints and schematics
- Educational illustrations
- Data visualizations
- Technical drawings

## Reference Image Support

The skill leverages Nano Banana Pro's ability to use up to **14 reference images**:
- Up to 6 object/product images for high-fidelity consistency
- Up to 5 human images for character consistency
- Style transfer and composition blending

## Sources & Research

Based on official 2025 documentation and best practices:

1. **Google Blog**: [Nano Banana Pro Prompting Tips](https://blog.google/products/gemini/prompting-tips-nano-banana-pro/)
2. **Atlabs AI**: [Ultimate Nano Banana Pro Guide](https://www.atlabs.ai/blog/the-ultimate-nano-banana-pro-prompting-guide-mastering-gemini-3-pro-image)
3. **Google Developers**: [Gemini Image Generation Best Results](https://developers.googleblog.com/en/how-to-prompt-gemini-2-5-flash-image-generation-for-the-best-results/)
4. **Google DeepMind**: [Gemini 3 Pro Image Model](https://deepmind.google/models/gemini-image/pro/)
5. **Google AI**: [Imagen Prompt Guide](https://ai.google.dev/gemini-api/docs/imagen-prompt-guide)

## Tips for Best Results

### ✅ DO:
- Be specific about subject, setting, and style
- Mention desired camera angles or lighting
- Specify aspect ratio based on use case
- Use reference images when consistency matters
- Request iterations if needed

### ❌ DON'T:
- Mix conflicting visual styles
- Use vague descriptions
- Create prompts over 25 words without structure
- Forget to specify the type of image (photo vs. illustration)
- Ignore composition and framing

## Integration with generate-image.py

This skill works seamlessly with your `generate-image.py` script:

```bash
# The skill automatically generates commands like:
uv run generate-image.py \
  --prompt "Optimized prompt here" \
  --model pro \
  --size 4K \
  --aspect 16:9
```

## Testing the Skill

Try these example requests to see the skill in action:

1. **Product Shot**: "Create a professional photo of wireless earbuds"
2. **Portrait**: "Generate a corporate headshot of a confident professional"
3. **Food**: "Make a magazine-quality photo of a gourmet burger"
4. **Logo**: "Design a minimalist logo for a tech startup"
5. **Art**: "Create a cyberpunk city scene at night"

The skill will optimize each prompt and generate the image using best practices.

## Customization

You can modify the templates and examples in:
- `prompt-templates.md` - Add your own templates
- `examples.md` - Add more before/after examples
- `SKILL.md` - Adjust the workflow or parameters

## Version

Created: January 2026
Based on: Google DeepMind 2025 Research & Guidelines
Model: Gemini 3 Pro Image (Nano Banana Pro)
