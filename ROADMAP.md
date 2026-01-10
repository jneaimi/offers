# AI Image Generation Studio - Development Roadmap

## Vision

Transform the existing CLI-based image generation toolkit into a full-featured web application with:
- **Chat-first interface** powered by Claude + Gemini
- **Layer-based editing** with AI-powered manipulation
- **Professional templates** leveraging the nano-banana-pro skill
- **Natural language selection** - describe what to edit, not where to click

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           END STATE VISION                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────────────┐   │
│  │   Frontend   │    │   Backend    │    │      AI Services         │   │
│  │              │    │              │    │                          │   │
│  │  React/Next  │◄──►│ Claude Agent │◄──►│  Gemini (generation)     │   │
│  │  React-Konva │    │     SDK      │    │  SAM 2 (segmentation)    │   │
│  │  Chat UI     │    │              │    │  Your generate-image.py  │   │
│  │  Layer Panel │    │  API Routes  │    │                          │   │
│  └──────────────┘    └──────────────┘    └──────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Current Assets (Starting Point)

| Asset | Location | Purpose |
|-------|----------|---------|
| `generate-image.py` | `/generate-image.py` | Core image generation CLI (730 lines) |
| Nano Banana Pro Skill | `/.claude/skills/nano-banana-pro/` | ICS Framework, prompt engineering |
| Prompt Templates | `/.claude/skills/nano-banana-pro/prompt-templates.md` | 20+ reusable templates |
| Examples | `/.claude/skills/nano-banana-pro/examples.md` | Before/after optimizations |
| Generated Images | `/generated_images/` | Output directory with metadata |

---

## Phase Summary

| Phase | Name | Goal | Complexity |
|-------|------|------|------------|
| **1** | Chat-First Generation | Web UI wrapping existing skill | Medium |
| **2** | Canvas Workspace | Visual preview + manipulation | Low |
| **3** | Manual Layers | Text/shape overlays | Medium |
| **4** | AI Layer Editing | Chat edits selected layer | Medium |
| **5** | Smart Selection | Natural language selection | High |
| **6** | Production Polish | Version history, templates, export | High |

---

# Phase 1: Chat-First Image Generation

## Overview

Build a web frontend that provides a professional chat experience for image generation, powered by Claude Agent SDK and your existing nano-banana-pro skill.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         PHASE 1 ARCHITECTURE                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │                        Next.js Frontend                            │ │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌───────────────────┐  │ │
│  │  │  Chat Panel     │  │ Templates       │  │  Gallery          │  │ │
│  │  │  - Messages     │  │ - ICS Framework │  │  - Grid view      │  │ │
│  │  │  - Input        │  │ - Quick prompts │  │  - Metadata       │  │ │
│  │  │  - History      │  │ - Categories    │  │  - Actions        │  │ │
│  │  └─────────────────┘  └─────────────────┘  └───────────────────┘  │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                    │                                     │
│                                    ▼                                     │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │                     API Routes / Backend                           │ │
│  │  ┌─────────────────────────────────────────────────────────────┐  │ │
│  │  │  Claude Agent SDK                                           │  │ │
│  │  │  - Orchestrates conversation                                │  │ │
│  │  │  - Applies nano-banana-pro skill knowledge                  │  │ │
│  │  │  - Calls generate-image.py via Bash tool                    │  │ │
│  │  │  - Returns results to frontend                              │  │ │
│  │  └─────────────────────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## Milestones

### Milestone 1.1: Project Setup
**Goal:** Initialize Next.js project with proper structure

#### Steps:

**Step 1.1.1: Create Next.js Project**
```bash
# Commands to run
npx create-next-app@latest image-studio --typescript --tailwind --app --src-dir
cd image-studio
```

**Step 1.1.2: Install Core Dependencies**
```bash
npm install @anthropic-ai/claude-agent-sdk  # Claude Agent SDK
npm install zustand                          # State management
npm install lucide-react                     # Icons
npm install @radix-ui/react-dialog           # UI primitives
npm install class-variance-authority         # Styling
npm install clsx tailwind-merge              # Utility
```

> **Note:** The Claude Agent SDK requires Claude Code to be installed on the server.
> Install it with: `curl -fsSL https://claude.ai/install.sh | bash`

**Step 1.1.3: Set Up shadcn/ui**
```bash
npx shadcn@latest init
npx shadcn@latest add button input card scroll-area avatar
```

**Step 1.1.4: Create Folder Structure**
```
src/
├── app/
│   ├── page.tsx              # Main app
│   ├── layout.tsx            # Root layout
│   └── api/
│       └── chat/
│           └── route.ts      # Chat API endpoint
├── components/
│   ├── chat/
│   │   ├── ChatPanel.tsx
│   │   ├── MessageList.tsx
│   │   ├── MessageInput.tsx
│   │   └── Message.tsx
│   ├── templates/
│   │   ├── TemplatesSidebar.tsx
│   │   └── TemplateCard.tsx
│   ├── gallery/
│   │   ├── Gallery.tsx
│   │   └── ImageCard.tsx
│   └── ui/                   # shadcn components
├── lib/
│   ├── claude.ts             # Agent SDK wrapper
│   ├── templates.ts          # Template definitions
│   └── utils.ts
├── stores/
│   └── chat-store.ts         # Zustand store
└── types/
    └── index.ts              # TypeScript types
```

**Acceptance Criteria:**
- [ ] Next.js app runs locally on `localhost:3000`
- [ ] Tailwind CSS working
- [ ] Basic folder structure in place
- [ ] Environment variables configured (`.env.local`)

---

### Milestone 1.2: Chat UI Components
**Goal:** Build the chat interface components

#### Steps:

**Step 1.2.1: Create Chat Store (Zustand)**
```typescript
// src/stores/chat-store.ts
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  images?: string[];
  timestamp: Date;
}

interface ChatStore {
  messages: Message[];
  isLoading: boolean;
  addMessage: (message: Message) => void;
  setLoading: (loading: boolean) => void;
  clearMessages: () => void;
}
```

**Step 1.2.2: Build Message Component**
- Display user messages (right-aligned)
- Display assistant messages (left-aligned)
- Show images inline when present
- Show loading indicator

**Step 1.2.3: Build MessageList Component**
- Scrollable message container
- Auto-scroll to bottom on new messages
- Empty state with suggestions

**Step 1.2.4: Build MessageInput Component**
- Text input with send button
- Keyboard shortcut (Enter to send)
- Disabled state when loading
- Character count (optional)

**Step 1.2.5: Build ChatPanel Component**
- Combines MessageList + MessageInput
- Header with clear button
- Responsive layout

**Acceptance Criteria:**
- [ ] Can type and display messages locally
- [ ] Messages persist in Zustand store
- [ ] Loading states work correctly
- [ ] Responsive on mobile/desktop

**Research References:**
- [Image Studio](https://github.com/waiyan91/imagestudio) - Chat-style interface pattern
- [Cosmic Canvas](https://github.com/ankur-bag/Cosmic-Canvas) - Natural language prompt UI

---

### Milestone 1.3: Templates Sidebar
**Goal:** Surface your nano-banana-pro templates in the UI

#### Steps:

**Step 1.3.1: Parse Existing Templates**
Create a parser for your `prompt-templates.md` file:
```typescript
// src/lib/templates.ts
interface Template {
  id: string;
  name: string;
  category: 'executive' | 'product' | 'lifestyle' | 'abstract';
  description: string;
  prompt: string;
  variables?: string[];  // Placeholders user can fill
  suggestedSettings: {
    model: 'flash' | 'pro';
    aspectRatio: string;
    size: string;
  };
}
```

**Step 1.3.2: Template Categories from ICS Framework**
Based on your skill documentation:
- **Executive/Corporate**: UAE executives, boardrooms, professional
- **Product/Marketing**: Product shots, lifestyle contexts
- **Abstract/Conceptual**: Data visualization, AI concepts
- **Custom**: User's own prompts

**Step 1.3.3: Build TemplateCard Component**
- Template name and description
- Preview image (if available)
- Click to insert into chat
- Quick settings override

**Step 1.3.4: Build TemplatesSidebar Component**
- Category tabs/filters
- Search functionality
- Collapsible on mobile

**Step 1.3.5: ICS Framework Helper**
Show the ICS structure to guide users:
```
┌─────────────────────────────────────┐
│  ICS Framework Builder              │
│  ─────────────────────              │
│  I: Image Type    [Dropdown]        │
│  C: Content       [Text input]      │
│  S: Style         [Dropdown]        │
│                                     │
│  [Generate Prompt]                  │
└─────────────────────────────────────┘
```

**Acceptance Criteria:**
- [ ] Templates loaded from your existing files
- [ ] Categories filter correctly
- [ ] Click template → appears in chat input
- [ ] ICS helper generates structured prompts

**Research References:**
- Your existing `prompt-templates.md` (20+ templates)
- Your existing `SKILL.md` (ICS Framework definition)

---

### Milestone 1.4: Claude Agent SDK Integration
**Goal:** Connect chat to Claude with access to your skill and generate-image.py

#### Steps:

**Step 1.4.1: Create Agent Configuration**
```typescript
// src/lib/claude.ts
import { query, ClaudeAgentOptions } from "@anthropic-ai/claude-agent-sdk";

// System prompt for the image generation assistant
export const IMAGE_AGENT_SYSTEM_PROMPT = `You are an expert image generation assistant powered by the Nano Banana Pro skill. You help users create professional images using Google Gemini models.

You have access to:
- generate-image.py for image generation
- The ICS Framework (Image type + Content + Style)
- Professional prompt engineering techniques

Always optimize user prompts using the ICS framework before generating.
Keep prompts under 25 words for best results (30% accuracy boost).

When generating images, use this command:
uv run generate-image.py --prompt "YOUR_OPTIMIZED_PROMPT" --model pro --aspect 16:9
`;

// Agent options configuration
export const agentOptions: ClaudeAgentOptions = {
  allowedTools: ["Bash", "Read", "Glob"],
  systemPrompt: IMAGE_AGENT_SYSTEM_PROMPT,
  workingDirectory: process.env.PROJECT_ROOT || process.cwd(),
};

// Query function for streaming responses
export async function* streamImageGeneration(userMessage: string) {
  for await (const message of query({
    prompt: userMessage,
    options: agentOptions,
  })) {
    yield message;
  }
}
```

**Step 1.4.2: Create API Route**
```typescript
// src/app/api/chat/route.ts
import { query } from "@anthropic-ai/claude-agent-sdk";
import { agentOptions } from "@/lib/claude";

export async function POST(request: Request) {
  const { message } = await request.json();

  // Create a streaming response using Server-Sent Events
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of query({
          prompt: message,
          options: agentOptions,
        })) {
          // Handle different message types
          if ("content" in event) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: "text", content: event.content })}\n\n`)
            );
          }
          if ("result" in event) {
            // Check for generated images in the result
            const imagePaths = extractImagePaths(event.result);
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: "result", result: event.result, images: imagePaths })}\n\n`)
            );
          }
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      } catch (error) {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: "error", error: String(error) })}\n\n`)
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

// Helper to extract image paths from agent output
function extractImagePaths(result: string): string[] {
  const regex = /generated_images\/[^\s"']+\.png/g;
  return result.match(regex) || [];
}
```

**Step 1.4.2b: Authentication Options**

The SDK supports multiple authentication methods:

```typescript
// Option 1: Environment variable (recommended for production)
// Set ANTHROPIC_API_KEY in .env.local

// Option 2: Local Claude Code auth (for development)
// If you've run `claude` and logged in, the SDK uses that automatically

// Option 3: Cloud providers
// Amazon Bedrock: Set CLAUDE_CODE_USE_BEDROCK=1 + AWS credentials
// Google Vertex: Set CLAUDE_CODE_USE_VERTEX=1 + GCP credentials
```

**Step 1.4.3: Implement Streaming Response**
- Use Server-Sent Events or streaming fetch
- Show Claude's thinking/tool usage
- Display generated images when ready

**Step 1.4.4: Handle Image Generation Flow**
```
User: "Create a professional headshot for a CEO"
        ↓
Claude: Optimizes prompt using ICS Framework
        ↓
Claude: Calls `uv run generate-image.py --prompt "..." --model pro`
        ↓
Claude: Returns image path + metadata
        ↓
Frontend: Displays image in chat
```

**Step 1.4.5: Error Handling**
- API key missing
- Generation failed
- Rate limits
- Network errors

**Acceptance Criteria:**
- [ ] Chat messages reach Claude
- [ ] Claude can call generate-image.py
- [ ] Generated images display in chat
- [ ] Errors handled gracefully

**Research References:**
- [Claude Agent SDK Documentation](https://platform.claude.com/docs/en/agent-sdk/overview)
- [Visual ChatGPT](https://github.com/microsoft/visual-chatgpt) - LLM orchestrating tools pattern

---

### Milestone 1.5: Image Gallery
**Goal:** Display generated images with metadata

#### Steps:

**Step 1.5.1: Scan Generated Images Directory**
```typescript
// API route to list images
// Reads from /generated_images/
// Parses companion .json metadata files
```

**Step 1.5.2: Build ImageCard Component**
- Thumbnail preview
- Hover to show prompt
- Click to enlarge
- Download button
- "Use as reference" button

**Step 1.5.3: Build Gallery Component**
- Grid layout (responsive)
- Sort by date/name
- Filter by model/aspect ratio
- Infinite scroll or pagination

**Step 1.5.4: Image Detail Modal**
- Full-size image view
- Complete metadata display
- Copy prompt button
- Regenerate button
- Delete button

**Step 1.5.5: Gallery-Chat Integration**
- Click image → "Edit this image" action
- Sends image as reference for next generation

**Acceptance Criteria:**
- [ ] Gallery shows all generated images
- [ ] Metadata displays correctly
- [ ] Can download images
- [ ] Can use image as reference

**Research References:**
- Your existing metadata JSON format
- [Infinite Kanvas](https://github.com/fal-ai-community/infinite-kanvas) - Gallery patterns

---

### Milestone 1.6: Polish & Testing
**Goal:** Production-ready Phase 1

#### Steps:

**Step 1.6.1: Responsive Design**
- Mobile layout (chat full-width, gallery below)
- Tablet layout (sidebar + chat)
- Desktop layout (three columns)

**Step 1.6.2: Loading States**
- Skeleton loaders for gallery
- Typing indicator for chat
- Progress for generation

**Step 1.6.3: Keyboard Shortcuts**
- `Enter` - Send message
- `Ctrl+K` - Focus search
- `Escape` - Close modals

**Step 1.6.4: Local Storage**
- Save chat history
- Remember last used template
- User preferences

**Step 1.6.5: Error Boundaries**
- Graceful error handling
- Retry mechanisms
- User-friendly error messages

**Acceptance Criteria:**
- [ ] Works on mobile, tablet, desktop
- [ ] All loading states implemented
- [ ] Keyboard shortcuts work
- [ ] No console errors
- [ ] Chat history persists

---

## Phase 1 Deliverables Summary

| Component | Description | Status |
|-----------|-------------|--------|
| Chat UI | Message list, input, history | ⬜ |
| Templates Sidebar | ICS Framework, categories | ⬜ |
| Agent Integration | Claude SDK + generate-image.py | ⬜ |
| Gallery | Image grid with metadata | ⬜ |
| Polish | Responsive, loading states | ⬜ |

---

# Phase 2: Canvas Workspace

## Overview

Add a visual canvas where generated images can be viewed and manipulated, creating a split-view workspace.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         PHASE 2 LAYOUT                                   │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────┐  ┌────────────────────────────────┐ │
│  │          CANVAS                │  │           CHAT                 │ │
│  │  ┌──────────────────────────┐  │  │                                │ │
│  │  │                          │  │  │  Messages...                   │ │
│  │  │                          │  │  │                                │ │
│  │  │      Generated Image     │  │  │                                │ │
│  │  │                          │  │  │                                │ │
│  │  │                          │  │  │                                │ │
│  │  └──────────────────────────┘  │  │                                │ │
│  │                                │  │  ┌────────────────────────────┐│ │
│  │  [Zoom: 100%] [Fit] [Pan]      │  │  │ Type message...            ││ │
│  └────────────────────────────────┘  │  └────────────────────────────┘│ │
│                                      └────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

## Milestones

### Milestone 2.1: Canvas Setup
**Goal:** Initialize React-Konva canvas

#### Steps:

**Step 2.1.1: Install React-Konva**
```bash
npm install react-konva konva
```

**Step 2.1.2: Create Canvas Component**
```typescript
// src/components/canvas/Canvas.tsx
import { Stage, Layer, Image } from 'react-konva';
```

**Step 2.1.3: Implement Zoom/Pan**
- Mouse wheel zoom
- Click and drag to pan
- Fit to screen button
- Reset view button

**Step 2.1.4: Image Loading**
- Load generated image onto canvas
- Maintain aspect ratio
- Center on canvas

**Research References:**
- [React-Konva Documentation](https://konvajs.org/docs/react/)
- [react-image-editor](https://github.com/swimmingkiim/react-image-editor) - Konva-based editor
- [Filerobot Image Editor](https://github.com/scaleflex/filerobot-image-editor) - React-Konva patterns

---

### Milestone 2.2: Split View Layout
**Goal:** Resizable canvas + chat panels

#### Steps:

**Step 2.2.1: Install Resizable Panel Library**
```bash
npm install react-resizable-panels
```

**Step 2.2.2: Create Workspace Layout**
- Left panel: Canvas (resizable)
- Right panel: Chat + Templates
- Drag handle between panels
- Collapse/expand panels

**Step 2.2.3: Responsive Behavior**
- Desktop: Side-by-side
- Tablet: Tabs (Canvas | Chat)
- Mobile: Stacked with toggle

**Acceptance Criteria:**
- [ ] Canvas displays generated images
- [ ] Zoom/pan works smoothly
- [ ] Panels resize correctly
- [ ] Works on all screen sizes

---

### Milestone 2.3: Canvas-Chat Integration
**Goal:** Canvas and chat work together

#### Steps:

**Step 2.3.1: Auto-Load Generated Images**
When Claude generates an image → automatically loads on canvas

**Step 2.3.2: "Edit This" Action**
- Button on canvas: "Edit with AI"
- Opens chat with image context
- "Make the background darker"

**Step 2.3.3: Canvas State in Chat Context**
Claude knows what's on the canvas:
```
User: "Make it more vibrant"
Claude: [Knows current image, applies edit]
```

**Research References:**
- [InvokeAI Unified Canvas](https://github.com/invoke-ai/InvokeAI) - Canvas + AI integration patterns

---

### Milestone 2.4: Basic Canvas Tools
**Goal:** Essential manipulation tools

#### Steps:

**Step 2.4.1: Selection Tool**
- Click to select image
- Selection handles (resize)
- Rotation handle

**Step 2.4.2: Transform Controls**
- Resize with aspect ratio lock
- Rotate with snap angles
- Flip horizontal/vertical

**Step 2.4.3: Canvas Actions**
- Clear canvas
- Export as PNG
- Copy to clipboard

**Acceptance Criteria:**
- [ ] Can select and transform images
- [ ] Export works correctly
- [ ] Tools feel responsive

---

## Phase 2 Deliverables Summary

| Component | Description | Status |
|-----------|-------------|--------|
| React-Konva Canvas | Zoom, pan, image display | ⬜ |
| Split View Layout | Resizable panels | ⬜ |
| Canvas-Chat Link | Edit from canvas | ⬜ |
| Basic Tools | Select, transform, export | ⬜ |

---

# Phase 3: Manual Layers

## Overview

Introduce a layer system allowing users to add text, shapes, and multiple images on top of each other.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         PHASE 3 LAYOUT                                   │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌──────────┐ ┌────────────────────────┐  ┌──────────────────────────┐  │
│  │ LAYERS   │ │        CANVAS          │  │         CHAT             │  │
│  │          │ │  ┌──────────────────┐  │  │                          │  │
│  │ □ Text   │ │  │ "Executive AI"   │  │  │                          │  │
│  │ ■ Image  │ │  │                  │  │  │                          │  │
│  │ □ BG     │ │  │  [Person Image]  │  │  │                          │  │
│  │          │ │  │                  │  │  │                          │  │
│  │ [+ Add]  │ │  └──────────────────┘  │  │                          │  │
│  └──────────┘ └────────────────────────┘  └──────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

## Milestones

### Milestone 3.1: Layer Data Model
**Goal:** Define how layers are stored and managed

#### Steps:

**Step 3.1.1: Define Layer Types**
```typescript
// src/types/layers.ts
type LayerType = 'image' | 'text' | 'shape' | 'group';

interface BaseLayer {
  id: string;
  name: string;
  type: LayerType;
  visible: boolean;
  locked: boolean;
  opacity: number;
  position: { x: number; y: number };
  rotation: number;
  scale: { x: number; y: number };
}

interface ImageLayer extends BaseLayer {
  type: 'image';
  src: string;
  originalPrompt?: string;
  metadata?: ImageMetadata;
}

interface TextLayer extends BaseLayer {
  type: 'text';
  content: string;
  fontSize: number;
  fontFamily: string;
  fontWeight: string;
  color: string;
  alignment: 'left' | 'center' | 'right';
}

interface ShapeLayer extends BaseLayer {
  type: 'shape';
  shapeType: 'rectangle' | 'circle' | 'line';
  fill: string;
  stroke: string;
  strokeWidth: number;
  width: number;
  height: number;
}
```

**Step 3.1.2: Layer Store (Zustand)**
```typescript
interface LayerStore {
  layers: Layer[];
  selectedLayerId: string | null;
  addLayer: (layer: Layer) => void;
  removeLayer: (id: string) => void;
  updateLayer: (id: string, updates: Partial<Layer>) => void;
  reorderLayers: (fromIndex: number, toIndex: number) => void;
  selectLayer: (id: string | null) => void;
}
```

**Step 3.1.3: Project File Format**
```json
{
  "version": "1.0",
  "name": "My Project",
  "canvas": {
    "width": 1920,
    "height": 1080
  },
  "layers": [
    { "id": "layer_1", "type": "image", "..." : "..." },
    { "id": "layer_2", "type": "text", "..." : "..." }
  ],
  "history": []
}
```

**Research References:**
- [vue-fabric-editor](https://github.com/ikuaitu/vue-fabric-editor) - Layer data model patterns
- [yft-design](https://github.com/dromara/yft-design) - Custom Fabric.js layer hierarchy

---

### Milestone 3.2: Layer Panel UI
**Goal:** Visual layer management

#### Steps:

**Step 3.2.1: Build LayerPanel Component**
- List of layers (thumbnail + name)
- Visibility toggle (eye icon)
- Lock toggle (lock icon)
- Drag to reorder

**Step 3.2.2: Layer Actions**
- Add layer button (dropdown: image, text, shape)
- Delete layer button
- Duplicate layer
- Group/ungroup layers

**Step 3.2.3: Layer Properties Panel**
- Shows when layer selected
- Position (X, Y)
- Size (W, H)
- Rotation
- Opacity slider
- Type-specific properties

**Step 3.2.4: Drag and Drop Reordering**
```bash
npm install @dnd-kit/core @dnd-kit/sortable
```

**Acceptance Criteria:**
- [ ] Layers display in panel
- [ ] Can toggle visibility
- [ ] Can reorder by dragging
- [ ] Properties update in real-time

**Research References:**
- [LidoJS](https://github.com/lidojs/application-example) - Layer panel patterns
- [Suika](https://github.com/F-star/suika) - Professional layer UI

---

### Milestone 3.3: Text Layers
**Goal:** Add and edit text on canvas

#### Steps:

**Step 3.3.1: Text Layer Creation**
- Click "Add Text" → creates text layer
- Default text: "Double-click to edit"
- Positioned at canvas center

**Step 3.3.2: Text Editing**
- Double-click to enter edit mode
- Inline text editing on canvas
- Text selection and cursor

**Step 3.3.3: Text Styling**
- Font family dropdown
- Font size slider
- Bold, italic, underline
- Text color picker
- Text alignment

**Step 3.3.4: Text Presets**
- Heading styles
- Body text
- Caption
- Custom saved styles

**Acceptance Criteria:**
- [ ] Can add text layers
- [ ] Can edit text inline
- [ ] Styling controls work
- [ ] Text renders correctly on export

---

### Milestone 3.4: Shape Layers
**Goal:** Add basic shapes for composition

#### Steps:

**Step 3.4.1: Shape Creation**
- Rectangle tool
- Circle/ellipse tool
- Line tool

**Step 3.4.2: Shape Properties**
- Fill color
- Stroke color
- Stroke width
- Corner radius (rectangles)

**Step 3.4.3: Shape Use Cases**
- Placeholder boxes
- Highlight areas
- Decorative elements
- Masks (for future phases)

**Acceptance Criteria:**
- [ ] Can add shapes
- [ ] Shape properties editable
- [ ] Shapes layer correctly with images

---

### Milestone 3.5: Multiple Image Layers
**Goal:** Composite multiple generated images

#### Steps:

**Step 3.5.1: Add Image from Gallery**
- Drag from gallery to canvas
- Creates new image layer
- Positioned at cursor

**Step 3.5.2: Add Image from Generation**
- Generate new image
- Option: "Add as new layer" vs "Replace current"

**Step 3.5.3: Image Layer Properties**
- Crop (future: non-destructive)
- Flip horizontal/vertical
- Brightness, contrast (basic)

**Acceptance Criteria:**
- [ ] Multiple images on canvas
- [ ] Proper z-order rendering
- [ ] Export composites all layers

---

### Milestone 3.6: Save/Load Projects
**Goal:** Persist work between sessions

#### Steps:

**Step 3.6.1: Save to JSON**
- Export project as `.studio` file (JSON)
- Includes all layers and settings
- Images as base64 or file references

**Step 3.6.2: Load from JSON**
- Import `.studio` file
- Reconstruct all layers
- Validate file format

**Step 3.6.3: Auto-Save**
- Save to localStorage periodically
- Recovery on browser crash
- "Restore previous session?" prompt

**Research References:**
- [Infinite Kanvas](https://github.com/fal-ai-community/infinite-kanvas) - IndexedDB auto-save pattern

**Acceptance Criteria:**
- [ ] Can save project
- [ ] Can load project
- [ ] Auto-save works
- [ ] Recovery works

---

## Phase 3 Deliverables Summary

| Component | Description | Status |
|-----------|-------------|--------|
| Layer Data Model | Types, store, file format | ⬜ |
| Layer Panel | Visual management UI | ⬜ |
| Text Layers | Add, edit, style text | ⬜ |
| Shape Layers | Rectangles, circles, lines | ⬜ |
| Image Layers | Multiple images composited | ⬜ |
| Save/Load | Project persistence | ⬜ |

---

# Phase 4: AI Layer Editing

## Overview

Connect the layer system to AI, allowing users to select a layer and edit it through conversation.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    PHASE 4: LAYER-AWARE AI                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  User clicks "Person" layer → Layer becomes "active context"            │
│                    ↓                                                     │
│  User types: "Change their outfit to business casual"                   │
│                    ↓                                                     │
│  Claude: Understands only "Person" layer should be edited               │
│                    ↓                                                     │
│  Claude: Sends layer image to Gemini with edit instruction              │
│                    ↓                                                     │
│  Gemini: Returns edited image                                           │
│                    ↓                                                     │
│  System: Replaces layer content with new image                          │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## Milestones

### Milestone 4.1: Layer Context in Chat
**Goal:** Claude knows which layer is selected

#### Steps:

**Step 4.1.1: Extend Chat Context**
```typescript
interface ChatContext {
  selectedLayer: Layer | null;
  canvasState: {
    width: number;
    height: number;
    layerCount: number;
  };
}
```

**Step 4.1.2: Update System Prompt**
```
You are helping edit an image project with multiple layers.

Currently selected layer: {layer.name} ({layer.type})
Layer contents: {layer.description or image}

When the user asks for changes, apply them to the selected layer only
unless they specifically mention another layer or "all layers".
```

**Step 4.1.3: Layer Reference in Chat**
- Show layer thumbnail in chat when referenced
- "Editing: [Person Layer]" indicator
- Quick layer switch from chat

**Research References:**
- [InternGPT](https://github.com/OpenGVLab/InternGPT) - Context-aware editing
- [Visual ChatGPT](https://github.com/microsoft/visual-chatgpt) - Tool orchestration

---

### Milestone 4.2: AI Edit Single Layer
**Goal:** Edit only the selected image layer

#### Steps:

**Step 4.2.1: Extract Layer Image**
- Export selected layer as standalone image
- Include transparency if applicable
- Temporary file for API call

**Step 4.2.2: Send to Gemini for Editing**
```python
# Use your existing generate-image.py with reference
uv run generate-image.py \
  --prompt "Edit: Change outfit to business casual" \
  --reference layer_person.png \
  --model pro
```

**Step 4.2.3: Replace Layer Content**
- Receive edited image from Gemini
- Replace layer source
- Maintain layer position/transform
- Update layer metadata

**Step 4.2.4: Preview Before Apply**
- Show before/after comparison
- "Apply" / "Try Again" buttons
- Adjustment options

**Acceptance Criteria:**
- [ ] Can edit single layer via chat
- [ ] Other layers unaffected
- [ ] Position/transform preserved
- [ ] Undo works correctly

---

### Milestone 4.3: Edit History & Undo
**Goal:** Track changes and allow reverting

#### Steps:

**Step 4.3.1: History Stack**
```typescript
interface HistoryEntry {
  id: string;
  timestamp: Date;
  action: string;
  layerId: string;
  before: LayerState;
  after: LayerState;
}

interface HistoryStore {
  entries: HistoryEntry[];
  currentIndex: number;
  undo: () => void;
  redo: () => void;
  addEntry: (entry: HistoryEntry) => void;
}
```

**Step 4.3.2: Undo/Redo Implementation**
- Track state changes
- Keyboard shortcuts (Ctrl+Z, Ctrl+Shift+Z)
- History panel showing actions

**Step 4.3.3: Layer Version History**
- Per-layer history
- "Revert to version X" option
- Compare versions

**Acceptance Criteria:**
- [ ] Undo reverts last action
- [ ] Redo restores undone action
- [ ] History persists in session
- [ ] Per-layer history accessible

---

### Milestone 4.4: Batch Layer Operations
**Goal:** Apply edits to multiple layers

#### Steps:

**Step 4.4.1: Multi-Select Layers**
- Shift+click to select range
- Ctrl+click to add to selection
- Select all (Ctrl+A)

**Step 4.4.2: Batch Edit Commands**
```
User: "Make all text layers use Arial font"
User: "Increase brightness on all image layers"
User: "Delete all shape layers"
```

**Step 4.4.3: Layer Groups**
- Group related layers
- Edit group as unit
- Expand/collapse in panel

**Acceptance Criteria:**
- [ ] Can select multiple layers
- [ ] Batch edits apply to all selected
- [ ] Groups work correctly

---

## Phase 4 Deliverables Summary

| Component | Description | Status |
|-----------|-------------|--------|
| Layer Context | Claude knows selected layer | ⬜ |
| Single Layer Edit | Edit one layer via chat | ⬜ |
| History/Undo | Track and revert changes | ⬜ |
| Batch Operations | Edit multiple layers | ⬜ |

---

# Phase 5: Smart Selection

## Overview

Enable natural language selection - "Select the sky" creates a mask automatically, extracts to a new layer.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    PHASE 5: SMART SELECTION                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  User: "Select the person in this image"                                │
│                    ↓                                                     │
│  Claude: Calls Grounded-SAM or similar                                  │
│                    ↓                                                     │
│  SAM: Returns precise mask of person                                    │
│                    ↓                                                     │
│  System: Shows selection overlay on canvas                              │
│                    ↓                                                     │
│  User: "Extract to new layer"                                           │
│                    ↓                                                     │
│  System: Creates new layer with just the person (transparent BG)        │
│                    ↓                                                     │
│  User: "Now change the background"                                      │
│                    ↓                                                     │
│  Edits remaining layer without affecting extracted person               │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## Milestones

### Milestone 5.1: Segmentation Backend
**Goal:** Set up AI-powered image segmentation

#### Steps:

**Step 5.1.1: Choose Segmentation Approach**

**Option A: Replicate API (Easiest)**
```bash
npm install replicate
# Use hosted SAM model
```

**Option B: Self-Hosted SAM**
```bash
# Requires GPU server
pip install segment-anything
```

**Option C: Browser-Based (Transformers.js)**
```bash
npm install @xenova/transformers
# Runs entirely in browser, no server needed
```

**Step 5.1.2: Implement Segmentation Service**
```typescript
// src/lib/segmentation.ts
interface SegmentationResult {
  mask: ImageData;  // Binary mask
  confidence: number;
  boundingBox: { x: number; y: number; w: number; h: number };
}

async function segmentByText(
  image: string,
  prompt: string
): Promise<SegmentationResult[]>;

async function segmentByPoint(
  image: string,
  point: { x: number; y: number }
): Promise<SegmentationResult[]>;
```

**Step 5.1.3: Test Segmentation**
- Test with various images
- Measure latency
- Handle errors

**Research References:**
- [Grounded-Segment-Anything](https://github.com/IDEA-Research/Grounded-Segment-Anything) - Text-based selection
- [Segment Anything](https://github.com/facebookresearch/segment-anything) - Meta's SAM
- [Transformers.js](https://github.com/xenova/transformers.js) - Browser-based ML
- [sd-webui-inpaint-anything](https://github.com/Uminosachi/sd-webui-inpaint-anything) - SAM integration

---

### Milestone 5.2: Selection Visualization
**Goal:** Show selection on canvas

#### Steps:

**Step 5.2.1: Mask Overlay**
- Display mask as semi-transparent overlay
- Marching ants animation (optional)
- Clear selection button

**Step 5.2.2: Refinement Tools**
- Add to selection
- Subtract from selection
- Feather edges slider

**Step 5.2.3: Selection from Chat**
```
User: "Select the sky"
→ Shows selection overlay
User: "Add the clouds too"
→ Expands selection
User: "That's good, extract it"
→ Creates new layer
```

**Acceptance Criteria:**
- [ ] Selection visible on canvas
- [ ] Can refine selection
- [ ] Extract to new layer works

---

### Milestone 5.3: Auto Layer Extraction
**Goal:** Create layers from selections automatically

#### Steps:

**Step 5.3.1: Extract Selection**
- Apply mask to image
- Create transparent PNG
- Add as new layer
- Name based on selection prompt

**Step 5.3.2: Smart Layer Naming**
```
"Select the person" → "Person" layer
"Select the background" → "Background" layer
"Select the red car" → "Red Car" layer
```

**Step 5.3.3: Remaining Area Handling**
- Option: Keep original layer intact
- Option: Create "Background" layer from inverse mask
- Option: Replace original with extracted layers

**Research References:**
- [LayerDiffuse](https://github.com/layerdiffusion/LayerDiffuse) - Generating with layers

---

### Milestone 5.4: Click-to-Select
**Goal:** Point and click selection

#### Steps:

**Step 5.4.1: Click Handler**
- Click on canvas → get coordinates
- Send point to SAM
- Show instant selection

**Step 5.4.2: Multi-Point Selection**
- Multiple clicks to refine
- Positive points (include)
- Negative points (exclude)

**Step 5.4.3: Combination with Chat**
```
User: *clicks on person*
User: "Select this and make it the focus"
Claude: [Uses click point + instruction]
```

**Research References:**
- [InternGPT](https://github.com/OpenGVLab/InternGPT) - Pointing + language interaction

**Acceptance Criteria:**
- [ ] Click selects object
- [ ] Multi-point works
- [ ] Combined with chat

---

## Phase 5 Deliverables Summary

| Component | Description | Status |
|-----------|-------------|--------|
| Segmentation Backend | SAM or equivalent | ⬜ |
| Selection Visualization | Mask overlay on canvas | ⬜ |
| Auto Layer Extraction | Selection → Layer | ⬜ |
| Click-to-Select | Point-based selection | ⬜ |

---

# Phase 6: Production Polish

## Overview

Final polish to make the application production-ready.

## Milestones

### Milestone 6.1: Version Control
**Goal:** Time-travel through edits

#### Steps:
- Full project versioning
- Branch/fork projects
- Compare versions
- Restore any point

**Research References:**
- Git-like branching model
- Per-layer snapshots

---

### Milestone 6.2: Templates System
**Goal:** Reusable project templates

#### Steps:
- Save as template
- Template marketplace
- Industry-specific templates (Social, Print, Web)
- Auto-sizing for platforms

---

### Milestone 6.3: Export Options
**Goal:** Professional export capabilities

#### Steps:
- PNG, JPEG with quality options
- PDF export
- SVG for vector elements
- PSD-like format (layers preserved)
- Batch export

---

### Milestone 6.4: Collaboration (Optional)
**Goal:** Multi-user editing

#### Steps:
- Real-time cursors
- Layer locking
- Comments on canvas
- Share project links

**Research References:**
- [Suika](https://github.com/F-star/suika) - Yjs collaboration
- [tldraw](https://github.com/tldraw/tldraw) - Multiplayer patterns

---

### Milestone 6.5: Performance Optimization
**Goal:** Smooth experience at scale

#### Steps:
- Canvas rendering optimization
- Image lazy loading
- Worker threads for heavy operations
- Caching strategies

---

### Milestone 6.6: Accessibility
**Goal:** Usable by everyone

#### Steps:
- Keyboard navigation
- Screen reader support
- High contrast mode
- Reduced motion option

---

## Phase 6 Deliverables Summary

| Component | Description | Status |
|-----------|-------------|--------|
| Version Control | Project history | ⬜ |
| Templates | Reusable starting points | ⬜ |
| Export | Multiple formats | ⬜ |
| Collaboration | Multi-user (optional) | ⬜ |
| Performance | Optimization | ⬜ |
| Accessibility | A11y compliance | ⬜ |

---

# Research References Index

## Canvas & Layer Libraries

| Library | URL | Best For |
|---------|-----|----------|
| **React-Konva** | [konvajs.org](https://konvajs.org/docs/react/) | React integration, performance |
| **Fabric.js** | [fabricjs.com](http://fabricjs.com/) | Full-featured, extensive API |
| **PixiJS** | [github.com/pixijs/pixijs](https://github.com/pixijs/pixijs) | WebGL performance |
| **tldraw** | [github.com/tldraw/tldraw](https://github.com/tldraw/tldraw) | Infinite canvas, collaboration |

## AI Integration Examples

| Project | URL | Key Learning |
|---------|-----|--------------|
| **Visual ChatGPT** | [github.com/microsoft/visual-chatgpt](https://github.com/microsoft/visual-chatgpt) | LLM + tools architecture |
| **InternGPT** | [github.com/OpenGVLab/InternGPT](https://github.com/OpenGVLab/InternGPT) | Pointing + language |
| **Grounded-SAM** | [github.com/IDEA-Research/Grounded-Segment-Anything](https://github.com/IDEA-Research/Grounded-Segment-Anything) | Text-based selection |
| **InvokeAI** | [github.com/invoke-ai/InvokeAI](https://github.com/invoke-ai/InvokeAI) | Unified Canvas pattern |
| **Krita AI Diffusion** | [github.com/Acly/krita-ai-diffusion](https://github.com/Acly/krita-ai-diffusion) | Layers as control signals |

## Layer Editor Examples

| Project | URL | Key Learning |
|---------|-----|--------------|
| **vue-fabric-editor** | [github.com/ikuaitu/vue-fabric-editor](https://github.com/ikuaitu/vue-fabric-editor) | Complete layer system |
| **Infinite Kanvas** | [github.com/fal-ai-community/infinite-kanvas](https://github.com/fal-ai-community/infinite-kanvas) | Modern Next.js + AI |
| **react-image-editor** | [github.com/swimmingkiim/react-image-editor](https://github.com/swimmingkiim/react-image-editor) | React + Konva layers |
| **Filerobot Image Editor** | [github.com/scaleflex/filerobot-image-editor](https://github.com/scaleflex/filerobot-image-editor) | React-Konva patterns |
| **Toast UI Image Editor** | [github.com/nhn/tui.image-editor](https://github.com/nhn/tui.image-editor) | Full-featured editor |

## AI Models for Editing

| Model | URL | Use Case |
|-------|-----|----------|
| **InstructPix2Pix** | [github.com/timothybrooks/instruct-pix2pix](https://github.com/timothybrooks/instruct-pix2pix) | Text-based image editing |
| **Prompt-to-Prompt** | [github.com/google/prompt-to-prompt](https://github.com/google/prompt-to-prompt) | Attention manipulation |
| **LayerDiffuse** | [github.com/layerdiffusion/LayerDiffuse](https://github.com/layerdiffusion/LayerDiffuse) | Generate with transparency |
| **FLUX** | [github.com/black-forest-labs/flux](https://github.com/black-forest-labs/flux) | High-quality generation |
| **img2img-turbo** | [github.com/GaParmar/img2img-turbo](https://github.com/GaParmar/img2img-turbo) | Real-time editing |

## Browser-Based AI

| Library | URL | Use Case |
|---------|-----|----------|
| **Transformers.js** | [github.com/xenova/transformers.js](https://github.com/xenova/transformers.js) | Browser ML inference |
| **Web Stable Diffusion** | [github.com/mlc-ai/web-stable-diffusion](https://github.com/mlc-ai/web-stable-diffusion) | Browser image generation |

## Segmentation

| Project | URL | Use Case |
|---------|-----|----------|
| **SAM 2** | [segment-anything.com](https://segment-anything.com/) | Image & video segmentation |
| **sd-webui-inpaint-anything** | [github.com/Uminosachi/sd-webui-inpaint-anything](https://github.com/Uminosachi/sd-webui-inpaint-anything) | SAM + inpainting |

---

# Appendix A: Tech Stack Summary

## Core Stack

| Category | Technology | Why |
|----------|------------|-----|
| **Framework** | Next.js 14+ | App Router, API routes, React |
| **Language** | TypeScript | Type safety, better DX |
| **Styling** | Tailwind CSS | Utility-first, fast development |
| **UI Components** | shadcn/ui | Accessible, customizable |
| **Canvas** | React-Konva | React integration, layer support |
| **State** | Zustand | Simple, performant |
| **AI Orchestration** | Claude Agent SDK | Native tool support |
| **Image Generation** | Your generate-image.py | Already working |

## Optional Additions

| Category | Technology | When to Add |
|----------|------------|-------------|
| **Rich Text** | Slate.js or TipTap | Phase 3 text layers |
| **Drag & Drop** | @dnd-kit | Phase 3 layer reordering |
| **Panels** | react-resizable-panels | Phase 2 split view |
| **Segmentation** | Replicate API or Transformers.js | Phase 5 |
| **Collaboration** | Yjs + y-websocket | Phase 6 (optional) |

---

# Appendix B: File Structure (End State)

```
image-studio/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Main workspace
│   │   ├── layout.tsx                  # Root layout
│   │   ├── globals.css                 # Global styles
│   │   └── api/
│   │       ├── chat/
│   │       │   └── route.ts            # Chat endpoint
│   │       ├── generate/
│   │       │   └── route.ts            # Image generation
│   │       ├── gallery/
│   │       │   └── route.ts            # List images
│   │       └── segment/
│   │           └── route.ts            # Segmentation (Phase 5)
│   │
│   ├── components/
│   │   ├── chat/
│   │   │   ├── ChatPanel.tsx
│   │   │   ├── MessageList.tsx
│   │   │   ├── MessageInput.tsx
│   │   │   ├── Message.tsx
│   │   │   └── TypingIndicator.tsx
│   │   │
│   │   ├── canvas/
│   │   │   ├── Canvas.tsx
│   │   │   ├── CanvasControls.tsx
│   │   │   ├── SelectionOverlay.tsx
│   │   │   └── TransformHandles.tsx
│   │   │
│   │   ├── layers/
│   │   │   ├── LayerPanel.tsx
│   │   │   ├── LayerItem.tsx
│   │   │   ├── LayerProperties.tsx
│   │   │   ├── TextLayerEditor.tsx
│   │   │   └── ShapeLayerEditor.tsx
│   │   │
│   │   ├── templates/
│   │   │   ├── TemplatesSidebar.tsx
│   │   │   ├── TemplateCard.tsx
│   │   │   └── ICSBuilder.tsx
│   │   │
│   │   ├── gallery/
│   │   │   ├── Gallery.tsx
│   │   │   ├── ImageCard.tsx
│   │   │   └── ImageDetailModal.tsx
│   │   │
│   │   ├── workspace/
│   │   │   ├── Workspace.tsx
│   │   │   ├── Header.tsx
│   │   │   └── Toolbar.tsx
│   │   │
│   │   └── ui/                         # shadcn components
│   │
│   ├── lib/
│   │   ├── claude.ts                   # Agent SDK wrapper
│   │   ├── templates.ts                # Template definitions
│   │   ├── segmentation.ts             # SAM integration
│   │   ├── export.ts                   # Export utilities
│   │   └── utils.ts                    # General utilities
│   │
│   ├── stores/
│   │   ├── chat-store.ts               # Chat state
│   │   ├── canvas-store.ts             # Canvas state
│   │   ├── layer-store.ts              # Layer state
│   │   └── history-store.ts            # Undo/redo
│   │
│   └── types/
│       ├── index.ts                    # Shared types
│       ├── layers.ts                   # Layer types
│       ├── chat.ts                     # Chat types
│       └── project.ts                  # Project file types
│
├── public/
│   └── templates/                      # Template preview images
│
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── next.config.js
└── .env.local                          # Environment variables
```

---

# Appendix C: Environment Variables

```bash
# .env.local

# ============================================
# REQUIRED: API Keys
# ============================================

# Anthropic API Key (for Claude Agent SDK)
# Get from: https://console.anthropic.com/
# Format: sk-ant-api03-...
# NOTE: Not needed if using local Claude Code auth (run `claude` first)
ANTHROPIC_API_KEY=sk-ant-api03-...

# Google API Key (for Gemini image generation)
# Get from: https://aistudio.google.com/apikey
GOOGLE_API_KEY=...

# ============================================
# OPTIONAL: Cloud Provider Auth (pick one)
# ============================================

# Amazon Bedrock (instead of direct Anthropic API)
# CLAUDE_CODE_USE_BEDROCK=1
# AWS_ACCESS_KEY_ID=...
# AWS_SECRET_ACCESS_KEY=...
# AWS_REGION=us-east-1

# Google Vertex AI (instead of direct Anthropic API)
# CLAUDE_CODE_USE_VERTEX=1
# GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json

# ============================================
# OPTIONAL: Project Configuration
# ============================================

# Project root directory (defaults to cwd)
PROJECT_ROOT=/path/to/offers

# Output directory for generated images
OUTPUT_DIRECTORY=generated_images

# Replicate API (for SAM segmentation in Phase 5)
# Get from: https://replicate.com/account/api-tokens
# REPLICATE_API_TOKEN=...
```

**Authentication Priority:**
1. If `ANTHROPIC_API_KEY` is set → uses direct API
2. If `CLAUDE_CODE_USE_BEDROCK=1` → uses AWS Bedrock
3. If `CLAUDE_CODE_USE_VERTEX=1` → uses Google Vertex
4. Otherwise → uses local Claude Code authentication (must run `claude` first)

---

# Changelog

| Date | Version | Changes |
|------|---------|---------|
| 2026-01-07 | 1.1 | Fixed Claude Agent SDK integration code, replaced time estimates with complexity levels, improved env vars documentation |
| 2026-01-07 | 1.0 | Initial roadmap created |

---

*This roadmap is a living document. Update as you progress through phases.*
