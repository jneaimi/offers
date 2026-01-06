# Nano Banana Pro Examples

Real-world examples showing prompt optimization based on Google DeepMind's 2025 best practices.

## Photography Examples

### Example 1: Product Shot

**❌ Original Request:**
"I need a picture of a coffee mug for my website, make it look nice and professional with good lighting and maybe some coffee in it and a nice background"

**✅ Optimized Prompt:**
"Ceramic coffee mug on oak table. Steam rising. Soft morning light. Shallow depth f/2.8. Commercial product photography."

**Why Better:**
- Reduced from 28 to 17 words (30% better accuracy)
- Specific photography terms (depth, lighting)
- Clear composition and setting
- Professional quality indicators

**Parameters:**
- Model: `pro`
- Size: `4K`
- Aspect: `1:1` (product catalog)

---

### Example 2: Portrait Photography

**❌ Original Request:**
"Take a photo of a businesswoman who looks confident and professional, maybe in an office or something corporate, with nice lighting that makes her look good"

**✅ Optimized Prompt:**
"Professional woman portrait. Navy blazer. Soft window light. 85mm f/1.4. Confident expression. Corporate headshot."

**Why Better:**
- From 26 to 17 words
- Photography-specific lens and aperture
- Defined lighting type
- Clear subject and styling

**Parameters:**
- Model: `pro`
- Size: `4K`
- Aspect: `2:3` (portrait orientation)

---

### Example 3: Food Photography

**❌ Original Request:**
"A delicious looking burger with all the toppings and fries on the side, on a nice plate, with good lighting to show all the details"

**✅ Optimized Prompt:**
"Gourmet burger with fries. Rustic wood board. Side dramatic lighting. 45-degree angle. Food magazine quality."

**Why Better:**
- From 24 to 17 words
- Specific angle and lighting direction
- Quality benchmark (magazine)
- Clear composition

**Parameters:**
- Model: `pro`
- Size: `4K`
- Aspect: `3:2` (food photography standard)

---

## Design & Branding Examples

### Example 4: Logo Design

**❌ Original Request:**
"Design a logo for my eco-friendly cleaning products company, should look modern and clean and maybe have green colors and look trustworthy and professional"

**✅ Optimized Prompt:**
"Eco cleaning logo. Minimalist leaf symbol. Forest green and white. Geometric modern. Vector-ready."

**Why Better:**
- From 26 to 14 words
- ICS Framework applied (Image: logo, Content: eco cleaning, Style: minimalist)
- Specific color palette
- Design medium specified (vector)

**Parameters:**
- Model: `pro`
- Size: `2K`
- Aspect: `1:1` (logo format)

---

### Example 5: Social Media Graphic

**❌ Original Request:**
"Make an Instagram post about time management tips with some clocks or calendars and make it colorful and eye-catching so people will want to read it"

**✅ Optimized Prompt:**
"Time management infographic. Modern flat design. Vibrant coral and teal. Clock icon hierarchy. Instagram optimized."

**Why Better:**
- From 25 to 16 words
- Specific design style (flat design)
- Named color scheme
- Platform optimized

**Parameters:**
- Model: `pro`
- Size: `2K`
- Aspect: `1:1` (Instagram feed)

---

## Artistic Examples

### Example 6: Digital Art

**❌ Original Request:**
"Create a fantasy landscape with mountains and a castle and maybe some magical elements like glowing lights and a dramatic sky with sunset or something mystical"

**✅ Optimized Prompt:**
"Fantasy castle on mountain peak. Magical aurora sky. Glowing crystals. Cinematic wide shot. Digital matte painting."

**Why Better:**
- From 27 to 17 words
- Camera angle specified (wide shot)
- Art medium defined (matte painting)
- Focused magical element (aurora, crystals)

**Parameters:**
- Model: `pro`
- Size: `4K`
- Aspect: `16:9` (cinematic)

---

### Example 7: Character Design

**❌ Original Request:**
"Design a sci-fi character, maybe a space explorer or soldier, with futuristic armor and weapons, cool looking and detailed with interesting colors"

**✅ Optimized Prompt:**
"Sci-fi soldier character. Sleek armor design. Neon blue accents. Full body. Character concept sheet."

**Why Better:**
- From 24 to 15 words
- Clear view type (full body)
- Image type specified (concept sheet)
- Defined color accent

**Parameters:**
- Model: `pro`
- Size: `4K`
- Aspect: `2:3` (character sheet)

---

## Technical Examples

### Example 8: Infographic

**❌ Original Request:**
"Make an infographic explaining the water cycle with clouds and rain and evaporation and all the steps, make it educational and easy to understand with labels"

**✅ Optimized Prompt:**
"Water cycle diagram. Clean modern style. Blue gradient. Numbered steps. Educational poster."

**Why Better:**
- From 24 to 13 words
- Image type clear (diagram/poster)
- Visual hierarchy specified (numbered steps)
- Color theme defined

**Parameters:**
- Model: `pro`
- Size: `4K`
- Aspect: `2:3` (poster format)

---

### Example 9: Architecture

**❌ Original Request:**
"Create a blueprint or floor plan of a modern house with open concept living room and kitchen, maybe 3 bedrooms and nice flow between rooms"

**✅ Optimized Prompt:**
"Modern house floor plan. Open concept. 3 bedrooms. Clean architectural drawing. Top-down blueprint."

**Why Better:**
- From 25 to 14 words
- Specific view (top-down)
- Clear drawing style (architectural)
- Concise feature list

**Parameters:**
- Model: `pro`
- Size: `4K`
- Aspect: `16:9` (blueprint format)

---

## Reference Image Examples

### Example 10: Product with References

**Original Request:**
"Use my product photos to create a new shot of the sneaker in a different environment"

**✅ Optimized Prompt with References:**
"Using reference sneaker images: lifestyle shot on urban street. Wet pavement. Golden hour. Maintain exact branding."

**Reference Images:**
- 3 product photos showing different angles
- Logo close-up for brand consistency

**Why Better:**
- Clear reference role defined
- New environment specified
- Lighting and mood detailed
- Brand consistency requirement

**Parameters:**
- Model: `pro`
- Size: `4K`
- Aspect: `16:9` (lifestyle shot)
- Reference: `--reference sneaker1.jpg sneaker2.jpg sneaker3.jpg`

---

### Example 11: Character Consistency

**Original Request:**
"Make another image of this character but in a different pose"

**✅ Optimized Prompt with References:**
"Using character references: show hero in action pose. Dynamic leap. Dramatic lighting. Maintain costume details."

**Reference Images:**
- 2-3 character shots from different angles

**Why Better:**
- Action clearly defined
- Consistency requirement stated
- Lighting and composition specified
- Maintains character integrity

**Parameters:**
- Model: `pro`
- Size: `4K`
- Aspect: `2:3` (character focus)
- Reference: `--reference char1.jpg char2.jpg`

---

## Advanced Scenarios

### Example 12: Style Transfer

**❌ Original Request:**
"Apply this painting style to a new image of a city street"

**✅ Optimized Prompt:**
"City street scene. Apply impressionist style from reference. Warm color palette. Busy afternoon atmosphere."

**Reference Images:**
- 1 impressionist painting for style

**Why Better:**
- Scene clearly described
- Style application explicit
- Mood and timing specified
- Composition hint

**Parameters:**
- Model: `pro`
- Size: `4K`
- Aspect: `3:2`
- Reference: `--reference style-example.jpg`

---

### Example 13: Complex Composition

**❌ Original Request:**
"Combine the product from image A with the background from image B and the lighting from image C"

**✅ Optimized Prompt:**
"Multi-image composition: Product from A, environment from B, lighting from C. Seamless integration. Commercial quality."

**Reference Images:**
- Product photo
- Background environment
- Lighting reference

**Why Better:**
- Clear role for each reference
- Integration quality specified
- Professional standard set

**Parameters:**
- Model: `pro`
- Size: `4K`
- Aspect: `16:9`
- Reference: `--reference product.jpg bg.jpg lighting.jpg`

---

## Common Mistakes to Avoid

### ❌ Mistake 1: Keyword Dumping
"professional, high-quality, beautiful, stunning, amazing, photorealistic, 4K, ultra-detailed, perfect lighting"

**Why Bad:** No actual scene description, just quality adjectives

### ❌ Mistake 2: Style Conflicts
"Photorealistic watercolor illustration with 3D render style and cartoon elements"

**Why Bad:** Conflicting visual styles reduce quality and coherence

### ❌ Mistake 3: Too Verbose
"I want you to create an image that shows a beautiful landscape with mountains in the background and a lake in the foreground with trees around it and maybe some wildlife like deer or birds and make sure the lighting is nice like during sunset with warm colors and make it look very realistic and professional like something you would see in a nature magazine"

**Why Bad:** 65 words! Research shows 30% worse results than under 25 words

### ❌ Mistake 4: No Composition Info
"A person standing somewhere nice"

**Why Bad:** No camera angle, lighting, setting, or style guidance

---

## Quick Reference: Prompt Formula

**Basic Formula:**
```
[Subject] + [Action/State] + [Setting] + [Lighting] + [Camera/Angle] + [Style/Quality]
```

**Keep Under 25 Words** = 30% Better Accuracy

**Example Application:**
- Subject: "Ceramic coffee mug"
- Action/State: "Steam rising"
- Setting: "Oak table"
- Lighting: "Soft morning light"
- Camera: "Shallow depth f/2.8"
- Style: "Commercial product photography"

**Result:** "Ceramic coffee mug on oak table. Steam rising. Soft morning light. Shallow depth f/2.8. Commercial product photography."

✅ 17 words, all elements covered, optimized for Nano Banana Pro
