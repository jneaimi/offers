# Offers Studio

A native desktop application that wraps Claude Code with project-specific visual enhancements for AI-powered image generation and professional presentations.

---

## Table of Contents

1. [Implementation Status](#implementation-status)
2. [Overview](#overview)
3. [Core Concept](#core-concept)
4. [Target Users](#target-users)
5. [Features](#features)
6. [Architecture](#architecture)
7. [Tech Stack](#tech-stack)
8. [Project Structure](#project-structure)
9. [User Experience](#user-experience)
10. [Implementation Details](#implementation-details)
11. [Build & Distribution](#build--distribution)
12. [Prerequisites](#prerequisites)
13. [App Icon & Branding](#app-icon--branding)
14. [Roadmap](#roadmap)

---

## Implementation Status

| Phase | Status | Description |
|-------|--------|-------------|
| **Phase 1: Core Shell** | ✅ Complete | Terminal + PTY + Claude Code integration |
| **Phase 2: Gallery** | ✅ Complete | File watcher + image gallery panel |
| **Phase 3: References** | 🔲 Not Started | Drag-and-drop reference images |
| **Phase 4: Polish** | 🔲 Not Started | Keyboard shortcuts, settings, themes |
| **Phase 5: Distribution** | 🔲 Not Started | Code signing, packaging, auto-update |

**Last Updated**: 2026-01-10

### How to Run (MVP)

```bash
cd offers-studio
./run.sh
```

Requires: Node.js 22+, Rust/Cargo, Claude Code installed

---

## Overview

**Offers Studio** is a native desktop application built with Tauri that provides a seamless Claude Code experience enhanced with visual panels specifically designed for the "Offers" image generation project.

### What It Is

- A **desktop application** (macOS, Windows, Linux)
- **Claude Code as the primary interface** - full chat/conversation experience
- **Visual side panels** that augment the chat (image gallery, previews)
- **Pre-packaged project** with all skills, commands, and scripts ready to use

### What It's NOT

- NOT a replacement for Claude Code
- NOT a form/button-driven UI that replaces conversation
- NOT a limited subset of Claude Code features
- NOT a web app or browser-based tool

---

## Core Concept

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│   User installs "Offers Studio.app"                                         │
│                         │                                                   │
│                         ▼                                                   │
│   ┌─────────────────────────────────────────────────────────────────────┐  │
│   │                                                                     │  │
│   │   Desktop Window                                                    │  │
│   │   ┌─────────────────────────────────────┐  ┌─────────────────────┐ │  │
│   │   │                                     │  │                     │ │  │
│   │   │      Claude Code Terminal           │  │   Image Gallery     │ │  │
│   │   │      (Full chat experience)         │  │   (Auto-updates)    │ │  │
│   │   │                                     │  │                     │ │  │
│   │   │   - Natural conversation            │  │   - Latest preview  │ │  │
│   │   │   - All commands work               │  │   - Thumbnail grid  │ │  │
│   │   │   - All skills available            │  │   - Click to view   │ │  │
│   │   │   - Full Claude Code power          │  │   - Drag to chat    │ │  │
│   │   │                                     │  │                     │ │  │
│   │   └─────────────────────────────────────┘  └─────────────────────┘ │  │
│   │                                                                     │  │
│   └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### The Key Insight

Users want to **chat** with Claude to brainstorm, create, and iterate. The conversation IS the interface. Visual panels simply provide:

1. **Immediate feedback** when images are generated
2. **Quick access** to browse previous generations
3. **Drag-and-drop** to use images as references in chat

---

## Target Users

### Primary Users

- **Marketing professionals** creating visual content
- **Executives** needing presentations and materials
- **Content creators** generating images for campaigns
- **Teams** working on the "Executive AI Strategy" program

### User Requirements

- Must have **Claude Code installed** (or bundled with app)
- **Google API key** for Gemini image generation
- macOS, Windows, or Linux desktop

### User Persona

> "I want to open an app, chat naturally about what I need, and see the images appear as they're generated. I don't want to fill out forms or click through menus - I want to have a conversation and get results."

---

## Features

### Primary Feature: Claude Code Terminal

The main interface is a **full Claude Code terminal** that provides:

| Feature | Description |
|---------|-------------|
| Natural conversation | Chat with Claude about ideas, strategy, content |
| All commands | `/genimg`, `/review`, `/commit`, `/kb`, etc. |
| All skills | Nano Banana Pro prompt engineering, all project skills |
| Full context | CLAUDE.md, project files, conversation history |
| Keyboard shortcuts | All Claude Code shortcuts work |
| MCP tools | Browser automation, Greptile, IDE integration |

### Secondary Feature: Image Gallery Panel

A side panel that **automatically updates** when images are generated:

| Feature | Description |
|---------|-------------|
| Latest preview | Shows most recently generated image prominently |
| Thumbnail grid | Browse all images in `generated_images/` |
| Auto-refresh | Detects new files instantly via file watcher |
| Click to enlarge | View full-size image in modal |
| Metadata display | Shows prompt, model, settings from JSON |
| Drag to terminal | Drag image path into chat for reference |
| Open folder | Quick access to output directory |

### Reference Images Feature

A key capability for image generation is using **reference images** to guide the output:

| Feature | Description |
|---------|-------------|
| Drag from gallery | Drag any thumbnail directly into the terminal as reference |
| Drag from desktop | Drop external images into a reference zone |
| Reference picker | Button to open file dialog for selecting references |
| Reference preview | Shows selected reference images before generation |
| Multi-reference | Support up to 14 reference images per generation |
| Clear references | Quick button to clear all selected references |

### Tertiary Features

| Feature | Description |
|---------|-------------|
| Status bar | Project name, API status, model, image count |
| Image modal | Full-screen image preview with metadata |
| Settings | Theme, panel sizes, gallery preferences |
| Keyboard shortcuts | Toggle panels, focus terminal, etc. |
| Error boundaries | Graceful handling of terminal/component crashes |
| Loading states | Skeleton loaders for gallery and large directories |

---

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Offers Studio (Tauri)                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    React Frontend                        │   │
│  │  ┌─────────────────────┐  ┌─────────────────────────┐   │   │
│  │  │  Terminal Component │  │   Gallery Component     │   │   │
│  │  │  (xterm.js)         │  │   (React)               │   │   │
│  │  │                     │  │                         │   │   │
│  │  │  - Renders terminal │  │  - Displays images      │   │   │
│  │  │  - Handles input    │  │  - Responds to events   │   │   │
│  │  │  - ANSI colors      │  │  - Modal preview        │   │   │
│  │  │                     │  │  - Drag for references  │   │   │
│  │  └──────────┬──────────┘  └────────────┬────────────┘   │   │
│  │             │                          │                 │   │
│  │  ┌──────────┴──────────────────────────┴────────────┐   │   │
│  │  │            Reference Images Bar                   │   │   │
│  │  │  [img1] [img2] [img3]  [+ Add]  [Clear All]      │   │   │
│  │  └──────────────────────────────────────────────────┘   │   │
│  │             │    Tauri Events          │                 │   │
│  │             ▼                          ▼                 │   │
│  └─────────────────────────────────────────────────────────┘   │
│                            │                                    │
│  ┌─────────────────────────┼────────────────────────────────┐  │
│  │                    Rust Backend                          │  │
│  │  ┌─────────────────────┐  ┌─────────────────────────┐   │  │
│  │  │   PTY Manager       │  │   File Watcher          │   │  │
│  │  │   (portable-pty)    │  │   (notify crate)        │   │  │
│  │  │                     │  │                         │   │  │
│  │  │  - Spawns claude    │  │  - Watches directory    │   │  │
│  │  │  - Manages I/O      │  │  - Emits events         │   │  │
│  │  │  - Handles resize   │  │  - Filters .png/.json   │   │  │
│  │  └─────────────────────┘  └─────────────────────────┘   │  │
│  │                                                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                    Bundled Project Files                        │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  .claude/skills/nano-banana-pro/   (Prompt engineering) │   │
│  │  .claude/commands/                  (Custom commands)    │   │
│  │  generate-image.py                  (Image generation)   │   │
│  │  CLAUDE.md                          (Project context)    │   │
│  │  generated_images/                  (Output directory)   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow

```
User types in terminal
        │
        ▼
┌───────────────────┐
│  xterm.js         │ ──► Renders to screen
│  (Frontend)       │
└───────┬───────────┘
        │ stdin
        ▼
┌───────────────────┐
│  PTY Process      │ ──► Runs in project directory
│  (Rust Backend)   │
└───────┬───────────┘
        │ spawns
        ▼
┌───────────────────┐
│  Claude Code      │ ──► Full Claude Code experience
│  (CLI)            │
└───────┬───────────┘
        │ generates
        ▼
┌───────────────────┐
│  generated_images/│ ──► Image files + metadata
│  (File System)    │
└───────┬───────────┘
        │ detected by
        ▼
┌───────────────────┐
│  File Watcher     │ ──► Emits "new-image" event
│  (Rust Backend)   │
└───────┬───────────┘
        │ event
        ▼
┌───────────────────┐
│  Gallery Panel    │ ──► Updates UI automatically
│  (Frontend)       │
└───────────────────┘
```

---

## Tech Stack

### Core Framework

| Technology | Purpose | Version |
|------------|---------|---------|
| **Tauri 2** | Desktop app framework | ^2.0 |
| **React 18** | Frontend UI | ^18.0 |
| **TypeScript** | Type safety | ^5.0 |
| **Rust** | Backend (PTY, file watcher) | 1.75+ |

### Frontend Libraries

| Library | Purpose | Package |
|---------|---------|---------|
| **xterm.js** | Terminal emulator | `@xterm/xterm` |
| **xterm-addon-fit** | Auto-resize terminal | `@xterm/addon-fit` |
| **xterm-addon-webgl** | GPU-accelerated rendering | `@xterm/addon-webgl` |
| **Tailwind CSS** | Styling | `tailwindcss` |
| **shadcn/ui** | UI components | `shadcn/ui` |
| **Zustand** | State management | `zustand` |
| **Lucide React** | Icons | `lucide-react` |

### Rust Crates

| Crate | Purpose |
|-------|---------|
| **tauri** | App framework (with `protocol-asset` feature) |
| **portable-pty** | PTY management (spawn, read, write, resize) |
| **uuid** | Unique PTY ID generation |
| **notify** | File system watcher for gallery auto-refresh |
| **parking_lot** | Thread-safe mutex for watcher state |
| **chrono** | Timestamp formatting for image metadata |
| **serde** | Serialization |
| **serde_json** | JSON parsing for image metadata |

### Tauri Plugins

| Plugin | Purpose | Status |
|--------|---------|--------|
| `tauri-plugin-opener` | Open files/URLs (bundled) | ✅ Used |
| `tauri-plugin-fs` | File system access | ✅ Used |
| `tauri-plugin-shell` | Shell command execution | ✅ Used |
| `tauri-plugin-dialog` | Native file dialogs | Phase 3 |
| `tauri-plugin-store` | Persistent settings | Phase 4 |

*Note: PTY functionality is implemented directly with the `portable-pty` crate rather than a Tauri plugin for better control over UTF-8 handling.*

---

## Project Structure

```
offers-studio/
├── src/                              # React Frontend
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppLayout.tsx         # Main layout container
│   │   │   ├── ResizablePanels.tsx   # Draggable panel divider
│   │   │   └── StatusBar.tsx         # Bottom status bar
│   │   │
│   │   ├── terminal/
│   │   │   ├── Terminal.tsx          # xterm.js wrapper component
│   │   │   ├── TerminalToolbar.tsx   # Terminal title/controls
│   │   │   └── useTerminal.ts        # Terminal hook
│   │   │
│   │   ├── gallery/
│   │   │   ├── GalleryPanel.tsx      # Side panel container
│   │   │   ├── LatestPreview.tsx     # Large preview of latest image
│   │   │   ├── ThumbnailGrid.tsx     # Grid of image thumbnails
│   │   │   ├── ImageCard.tsx         # Single thumbnail card (draggable)
│   │   │   └── ImageModal.tsx        # Full-screen image viewer
│   │   │
│   │   ├── references/
│   │   │   ├── ReferenceBar.tsx      # Bottom bar showing selected references
│   │   │   ├── ReferencePreview.tsx  # Single reference thumbnail with remove
│   │   │   ├── DropZone.tsx          # Drop zone for external images
│   │   │   └── useReferences.ts      # Reference images state hook
│   │   │
│   │   └── ui/                       # shadcn/ui components
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── dialog.tsx
│   │       ├── scroll-area.tsx
│   │       └── tooltip.tsx
│   │
│   ├── hooks/
│   │   ├── usePty.ts                 # PTY connection management
│   │   ├── useFileWatcher.ts         # File system event listener
│   │   ├── useGallery.ts             # Gallery state and operations
│   │   ├── useImageMetadata.ts       # Parse JSON metadata files
│   │   └── useSettings.ts            # App settings management
│   │
│   ├── stores/
│   │   ├── appStore.ts               # Global app state (Zustand)
│   │   ├── galleryStore.ts           # Gallery images state
│   │   ├── referenceStore.ts         # Reference images state (max 14)
│   │   └── settingsStore.ts          # User preferences
│   │
│   ├── lib/
│   │   ├── utils.ts                  # Utility functions
│   │   ├── constants.ts              # App constants
│   │   └── types.ts                  # TypeScript types
│   │
│   ├── styles/
│   │   ├── globals.css               # Global styles + Tailwind
│   │   └── terminal.css              # Terminal-specific styles
│   │
│   ├── App.tsx                       # Root component
│   └── main.tsx                      # React entry point
│
├── src-tauri/                        # Rust Backend
│   ├── src/
│   │   ├── main.rs                   # Tauri entry point
│   │   ├── lib.rs                    # Library exports
│   │   ├── pty.rs                    # PTY process management
│   │   ├── watcher.rs                # File system watcher
│   │   ├── commands.rs               # Tauri commands
│   │   └── state.rs                  # App state management
│   │
│   ├── capabilities/
│   │   └── default.json              # Tauri permissions
│   │
│   ├── icons/                        # App icons (all sizes)
│   │   ├── icon.icns                 # macOS
│   │   ├── icon.ico                  # Windows
│   │   └── icon.png                  # Linux
│   │
│   ├── Cargo.toml                    # Rust dependencies
│   ├── tauri.conf.json               # Tauri configuration
│   └── build.rs                      # Build script
│
├── project/                          # Bundled Project Files
│   ├── .claude/
│   │   ├── skills/
│   │   │   └── nano-banana-pro/
│   │   │       ├── SKILL.md
│   │   │       ├── prompt-templates.md
│   │   │       └── examples.md
│   │   │
│   │   ├── commands/
│   │   │   ├── genimg.md
│   │   │   ├── review.md
│   │   │   └── ...
│   │   │
│   │   └── settings.json
│   │
│   ├── generate-image.py             # Image generation script
│   ├── CLAUDE.md                     # Project context
│   ├── .env.example                  # API key template
│   └── generated_images/             # Output directory
│       └── .gitkeep
│
├── package.json                      # Node.js dependencies
├── tsconfig.json                     # TypeScript config
├── tailwind.config.js                # Tailwind config
├── vite.config.ts                    # Vite config
└── README.md                         # User documentation
```

---

## User Experience

### First Launch

```
┌─────────────────────────────────────────────────────────────────┐
│  Offers Studio                                      [─] [□] [×] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                         │   │
│  │   Welcome to Offers Studio!                             │   │
│  │                                                         │   │
│  │   Checking requirements...                              │   │
│  │   ✓ Claude Code found                                   │   │
│  │   ✓ Project files loaded                                │   │
│  │   ⚠ Google API key not configured                       │   │
│  │                                                         │   │
│  │   To generate images, add your API key:                 │   │
│  │   1. Get key at: https://aistudio.google.com/apikey     │   │
│  │   2. Create .env file with: GOOGLE_API_KEY=your_key     │   │
│  │                                                         │   │
│  │   [Configure Now]  [Skip for Now]                       │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Main Interface

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Offers Studio                                               [─] [□] [×]   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌───────────────────────────────────────────────────────┐  ┌────────────┐ │
│  │ Claude Code                                       [⚙] │  │  Preview   │ │
│  ├───────────────────────────────────────────────────────┤  ├────────────┤ │
│  │                                                       │  │            │ │
│  │  claude > Ready to help with your project.            │  │  ┌──────┐  │ │
│  │                                                       │  │  │      │  │ │
│  │  You have access to:                                  │  │  │ IMG  │  │ │
│  │  • Nano Banana Pro skill for image generation         │  │  │      │  │ │
│  │  • /genimg command for quick generation               │  │  └──────┘  │ │
│  │  • generate-image.py for advanced options             │  │  Latest    │ │
│  │                                                       │  │  image     │ │
│  │  What would you like to create today?                 │  ├────────────┤ │
│  │                                                       │  │  Gallery   │ │
│  │  >                                                    │  │  ┌──┐ ┌──┐ │ │
│  │                                                       │  │  │  │ │  │ │ │
│  │                                                       │  │  └──┘ └──┘ │ │
│  │                                                       │  │  ┌──┐ ┌──┐ │ │
│  │                                                       │  │  │  │ │  │ │ │
│  │                                                       │  │  └──┘ └──┘ │ │
│  │                                                       │  │            │ │
│  │                                                       │  │ [Open Dir] │ │
│  └───────────────────────────────────────────────────────┘  └────────────┘ │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  References: [img1.png ×] [img2.png ×]  [+ Add]  [Clear] (2/14)     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│  Project: offers │ Claude Code: ✓ │ API: ✓ │ Images: 14 │ Refs: 2         │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Typical Workflow

**Step 1: User starts a conversation**

```
> I need to create a marketing presentation for UAE executives
  about AI strategy. Let's brainstorm the structure first.
```

**Step 2: Claude responds with ideas**

```
Claude: Great! Here's a suggested structure for your presentation:

1. **The Challenge** - AI adoption gaps in GCC enterprises
2. **The Solution** - Executive AI Strategy Intensive program
3. **Key Benefits** - ROI, competitive advantage, leadership
4. **Program Details** - Format, duration, outcomes
5. **Call to Action** - Registration and next steps

Would you like me to start generating visuals for any of these slides?
```

**Step 3: User requests image generation**

```
> Yes! Let's create the first slide. Make it dramatic with Dubai
  skyline at night, showing the contrast between traditional
  business and AI-powered future.
```

**Step 4: Claude generates image**

```
Claude: I'll create that dramatic opening slide for you.

Generating with gemini-3-pro-image-preview...
Prompt: Professional 16:9 presentation slide...
Aspect ratio: 16:9, Size: 4K

✅ Image saved: generated_images/slide1_challenge_20260110_142356.png
   Metadata: generated_images/slide1_challenge_20260110_142356.json
```

**Step 5: Gallery auto-updates**

The side panel immediately shows the new image. User can:
- See the image in the preview area
- Click to view full-size
- Continue the conversation for more slides

**Step 6: User iterates**

```
> This looks great! Can you make the skyline more prominent
  and add some subtle AI-themed elements like neural network
  patterns in the sky?
```

### Reference Images Workflow

**Method 1: Drag from Gallery**

1. User sees a generated image they want to use as reference
2. Drag the thumbnail from the gallery panel
3. Drop it into the Reference Bar at the bottom
4. The reference appears as a thumbnail with an × to remove

**Method 2: Add External Images**

1. Click the **[+ Add]** button in the Reference Bar
2. Native file dialog opens (supports .jpg, .png, .webp)
3. Select one or multiple images
4. Images are copied to a temp folder and added to references

**Method 3: Drag from Desktop**

1. Drag image files from Finder/Explorer
2. Drop onto the application window (drop zone highlights)
3. Images are added to the Reference Bar

**Using References in Generation**

```
> Create a new slide that matches the style of my reference images.
  Use the same color palette and composition but with the topic
  "AI ROI Calculator"
```

Claude automatically detects references in the Reference Bar and includes them:

```
Claude: I see you have 2 reference images selected. I'll use those
to match the style for your new slide.

Generating with gemini-3-pro-image-preview...
Prompt: Professional 16:9 presentation slide...
References: 2 images
Aspect ratio: 16:9, Size: 4K

✅ Image saved: generated_images/slide_roi_20260110_143012.png
```

**Reference Limits**

- Maximum 14 reference images at once
- Reference Bar shows count: `(2/14)`
- Warning appears when limit reached
- Clear All button removes all references

---

## Implementation Details

### 1. Terminal Component (xterm.js)

```tsx
// src/components/terminal/Terminal.tsx
import { useEffect, useRef, useState } from 'react';
import { Terminal as XTerm } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebglAddon } from '@xterm/addon-webgl';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import '@xterm/xterm/css/xterm.css';
import '@/styles/terminal.css';

interface TerminalProps {
  onError?: (error: Error) => void;
}

function TerminalInner({ onError }: TerminalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<XTerm | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    let ptyId: string | null = null;
    let isCleanedUp = false;

    // Initialize terminal
    const term = new XTerm({
      fontFamily: '"JetBrains Mono", "Fira Code", monospace',
      fontSize: 14,
      lineHeight: 1.2,
      cursorBlink: true,
      cursorStyle: 'block',
      scrollback: 5000,
      theme: {
        background: '#1a1b26',
        foreground: '#a9b1d6',
        cursor: '#c0caf5',
        selectionBackground: '#33467c',
        black: '#32344a',
        red: '#f7768e',
        green: '#9ece6a',
        yellow: '#e0af68',
        blue: '#7aa2f7',
        magenta: '#ad8ee6',
        cyan: '#449dab',
        white: '#787c99',
      },
    });

    // Load addons
    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);

    try {
      term.loadAddon(new WebglAddon());
    } catch (e) {
      console.warn('WebGL addon failed, using canvas renderer');
    }

    // Mount terminal
    term.open(containerRef.current);
    fitAddon.fit();

    // Get project path from bundled resources
    async function initPty() {
      try {
        // Set working directory to the offers project root
        const cwd = '/Users/jneaimimacmini/dev/apps/offers';

        // Ensure terminal is properly sized before spawning
        fitAddon.fit();
        const cols = term.cols;
        const rows = term.rows;
        console.log(`Spawning PTY with size: ${cols}x${rows}`);

        // Spawn Claude Code CLI
        const id = await invoke<string>('spawn_pty', {
          command: 'claude',
          args: [],
          cwd,
          cols,
          rows,
        });

        if (isCleanedUp) {
          // Component unmounted during async operation
          await invoke('kill_pty', { id });
          return;
        }

        ptyId = id;
        setConnectionError(null);

        // Set up data listener for PTY output
        const unlistenData = await listen<string>(`pty-data:${id}`, (event) => {
          term.write(event.payload);
        });

        // Set up exit listener
        const unlistenExit = await listen(`pty-exit:${id}`, () => {
          term.write('\r\n\x1b[33mProcess exited\x1b[0m\r\n');
        });

        // Handle user input from terminal
        // Filter out mouse escape sequences to prevent spurious input
        term.onData((data) => {
          if (ptyId) {
            // Skip mouse event sequences (ESC [ M, ESC [ <, ESC [ t)
            // These can cause empty lines when clicking in the terminal
            if (data.startsWith('\x1b[M') ||
                data.startsWith('\x1b[<') ||
                data.startsWith('\x1b[t') ||
                data.match(/^\x1b\[\d+;\d+[MmRt]$/)) {
              return; // Ignore mouse events
            }
            invoke('write_pty', { id: ptyId, data }).catch(console.error);
          }
        });

        // Store cleanup functions
        if (isCleanedUp) {
          unlistenData();
          unlistenExit();
        } else {
          // Store in ref for cleanup
          terminalRef.current = term;
          (terminalRef.current as any).unlistenData = unlistenData;
          (terminalRef.current as any).unlistenExit = unlistenExit;
        }

      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to start terminal';
        setConnectionError(message);
        onError?.(new Error(message));

        // Check if this is a "command not found" error (Claude Code not installed)
        const errorStr = message.toLowerCase();
        if (errorStr.includes('not found') || errorStr.includes('no such file')) {
          term.write('\r\n\x1b[31mError: Claude Code not found\x1b[0m\r\n');
          term.write('\r\nPlease install Claude Code:\r\n');
          term.write('  \x1b[36mnpm install -g @anthropic-ai/claude-code\x1b[0m\r\n');
          term.write('\r\nOr visit: \x1b[36mhttps://claude.ai/code\x1b[0m\r\n');
        } else {
          term.write(`\r\n\x1b[31mError: ${message}\x1b[0m\r\n`);
          term.write('\r\nPlease ensure Claude Code is installed and accessible\r\n');
        }
      }
    }

    initPty();

    // Handle window resize with debounce
    let resizeTimeout: ReturnType<typeof setTimeout> | null = null;
    const handleResize = () => {
      if (resizeTimeout) clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        fitAddon.fit();
        if (ptyId) {
          invoke('resize_pty', { id: ptyId, cols: term.cols, rows: term.rows })
            .catch(console.error);
        }
      }, 100);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(containerRef.current);
    window.addEventListener('resize', handleResize);

    terminalRef.current = term;

    // Cleanup
    return () => {
      isCleanedUp = true;
      if (resizeTimeout) clearTimeout(resizeTimeout);
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);

      // Unlisten from events
      if (terminalRef.current) {
        const unlisten = (terminalRef.current as any).unlistenData;
        const unlistenExit = (terminalRef.current as any).unlistenExit;
        if (unlisten) unlisten();
        if (unlistenExit) unlistenExit();
      }

      // Kill PTY process
      if (ptyId) {
        invoke('kill_pty', { id: ptyId }).catch(console.error);
      }

      term.dispose();
    };
  }, [onError]);

  return (
    <div className="h-full w-full relative">
      <div
        ref={containerRef}
        className="h-full w-full bg-[#1a1b26]"
      />
      {connectionError && (
        <div className="absolute top-2 right-2 bg-red-900/80 text-red-200 px-3 py-1 rounded text-sm">
          Connection Error
        </div>
      )}
    </div>
  );
}

// Wrap with error boundary for crash protection
export function Terminal(props: TerminalProps) {
  return (
    <ErrorBoundary
      fallback={
        <div className="h-full w-full flex items-center justify-center bg-gray-900 text-gray-400">
          <div className="text-center">
            <p className="text-lg mb-2">Terminal crashed</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Reload App
            </button>
          </div>
        </div>
      }
    >
      <TerminalInner {...props} />
    </ErrorBoundary>
  );
}
```

```tsx
// src/components/ErrorBoundary.tsx
import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Component error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}
```

### 2. File Watcher (Rust)

```rust
// src-tauri/src/watcher.rs
use notify::{Watcher, RecursiveMode, Result, Event, EventKind};
use std::path::Path;
use std::sync::Arc;
use parking_lot::Mutex;
use tauri::{AppHandle, Emitter, Manager};

/// File watcher state - stored in Tauri's managed state
/// Uses Arc<Mutex<>> for thread-safe access from event handlers
pub struct WatcherState {
    watcher: Arc<Mutex<Option<notify::RecommendedWatcher>>>,
}

impl WatcherState {
    pub fn new() -> Self {
        Self {
            watcher: Arc::new(Mutex::new(None)),
        }
    }

    /// Start watching the generated_images directory for new files
    pub fn start(&self, app: &AppHandle, project_path: &str) -> Result<()> {
        let images_path = Path::new(project_path).join("generated_images");
        let app_handle = app.clone();

        // Create watcher with event handler
        let mut watcher = notify::recommended_watcher(move |res: Result<Event>| {
            if let Ok(event) = res {
                if let EventKind::Create(_) = event.kind {
                    for path in event.paths {
                        if let Some(ext) = path.extension() {
                            let ext_lower = ext.to_string_lossy().to_lowercase();
                            if matches!(ext_lower.as_str(), "png" | "jpg" | "jpeg") {
                                let path_str = path.to_string_lossy().to_string();
                                let _ = app_handle.emit("new-image", &path_str);
                            }
                        }
                    }
                }
            }
        })?;

        // Start watching BEFORE storing (avoids borrow issues)
        watcher.watch(&images_path, RecursiveMode::NonRecursive)?;

        // Store in state for lifecycle management
        let mut guard = self.watcher.lock();
        *guard = Some(watcher);

        Ok(())
    }

    /// Stop watching and clean up resources
    pub fn stop(&self) {
        let mut guard = self.watcher.lock();
        *guard = None; // Drops the watcher, stopping the watch
    }
}
```

### 3. Gallery Hook (React)

```typescript
// src/hooks/useGallery.ts
import { useEffect, useState, useCallback } from 'react';
import { listen } from '@tauri-apps/api/event';
import { readDir, readTextFile, stat } from '@tauri-apps/plugin-fs';

interface ImageFile {
  path: string;
  name: string;
  created: number;
  metadata?: ImageMetadata;
}

interface ImageMetadata {
  prompt: string;
  model: string;
  aspect_ratio: string;
  size?: string;
  timestamp: string;
  references?: string[];
}

// Load metadata from companion JSON file
async function loadMetadata(imagePath: string): Promise<ImageMetadata | undefined> {
  try {
    const jsonPath = imagePath.replace(/\.(png|jpg|jpeg)$/i, '.json');
    const content = await readTextFile(jsonPath);
    return JSON.parse(content);
  } catch {
    return undefined; // No metadata file or parse error
  }
}

// Get file creation time
async function getFileCreated(path: string): Promise<number> {
  try {
    const info = await stat(path);
    return info.mtime?.getTime() || Date.now();
  } catch {
    return Date.now();
  }
}

export function useGallery(projectPath: string) {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Use refreshKey to trigger re-fetch when refresh() is called
  const [refreshKey, setRefreshKey] = useState(0);

  // Load a single image with metadata
  const loadImageWithMetadata = useCallback(async (
    imagesPath: string,
    name: string
  ): Promise<ImageFile> => {
    const path = `${imagesPath}/${name}`;
    const [created, metadata] = await Promise.all([
      getFileCreated(path),
      loadMetadata(path),
    ]);
    return { path, name, created, metadata };
  }, []);

  // Load existing images on mount or when refresh is triggered
  useEffect(() => {
    async function loadImages() {
      setLoading(true);
      setError(null);

      try {
        const imagesPath = `${projectPath}/generated_images`;
        const entries = await readDir(imagesPath);

        const imageNames = entries
          .filter(entry => {
            const name = entry.name?.toLowerCase() || '';
            return name.endsWith('.png') || name.endsWith('.jpg') || name.endsWith('.jpeg');
          })
          .map(entry => entry.name || '');

        // Load all images with metadata in parallel
        const imageFiles = await Promise.all(
          imageNames.map(name => loadImageWithMetadata(imagesPath, name))
        );

        // Sort by creation time (newest first)
        imageFiles.sort((a, b) => b.created - a.created);

        setImages(imageFiles);
      } catch (err) {
        console.error('Failed to load images:', err);
        setError(err instanceof Error ? err.message : 'Failed to load images');
      } finally {
        setLoading(false);
      }
    }

    loadImages();
  }, [projectPath, loadImageWithMetadata, refreshKey]); // refreshKey triggers reload

  // Listen for new images
  useEffect(() => {
    const unlisten = listen<string>('new-image', async (event) => {
      const path = event.payload;
      const name = path.split('/').pop() || '';

      // Load metadata for the new image
      const [created, metadata] = await Promise.all([
        getFileCreated(path),
        loadMetadata(path),
      ]);

      setImages(prev => [{
        path,
        name,
        created,
        metadata,
      }, ...prev]);
    });

    return () => {
      unlisten.then(fn => fn());
    };
  }, []);

  // Refresh function for manual reload - increments key to trigger effect
  const refresh = useCallback(() => {
    setRefreshKey(k => k + 1);
  }, []);

  return { images, loading, error, refresh };
}
```

### 4. Gallery Panel Component

```tsx
// src/components/gallery/GalleryPanel.tsx
import { useGallery } from '@/hooks/useGallery';
import { LatestPreview } from './LatestPreview';
import { ThumbnailGrid } from './ThumbnailGrid';
import { ImageModal } from './ImageModal';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FolderOpen } from 'lucide-react';
import { open } from '@tauri-apps/plugin-shell';

interface GalleryPanelProps {
  projectPath: string;
}

export function GalleryPanel({ projectPath }: GalleryPanelProps) {
  const { images, loading } = useGallery(projectPath);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const latestImage = images[0];

  const openFolder = async () => {
    await open(`${projectPath}/generated_images`);
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 border-l border-gray-800">
      {/* Latest Preview */}
      <div className="p-3 border-b border-gray-800">
        <h3 className="text-xs font-medium text-gray-400 mb-2">Preview</h3>
        {latestImage ? (
          <LatestPreview
            image={latestImage}
            onClick={() => setSelectedImage(latestImage.path)}
          />
        ) : (
          <div className="aspect-video bg-gray-800 rounded flex items-center justify-center">
            <span className="text-gray-500 text-sm">No images yet</span>
          </div>
        )}
      </div>

      {/* Thumbnail Grid */}
      <div className="flex-1 overflow-hidden">
        <div className="p-3">
          <h3 className="text-xs font-medium text-gray-400 mb-2">
            Gallery ({images.length})
          </h3>
        </div>
        <ThumbnailGrid
          images={images}
          onSelect={(path) => setSelectedImage(path)}
        />
      </div>

      {/* Open Folder Button */}
      <div className="p-3 border-t border-gray-800">
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={openFolder}
        >
          <FolderOpen className="w-4 h-4 mr-2" />
          Open Folder
        </Button>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <ImageModal
          imagePath={selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </div>
  );
}
```

### 5. Reference Images Store & Components

```typescript
// src/stores/referenceStore.ts
import { create } from 'zustand';

interface ReferenceImage {
  id: string;
  path: string;
  name: string;
  thumbnail?: string; // Base64 thumbnail for display
}

interface ReferenceStore {
  references: ReferenceImage[];
  maxReferences: number;
  addReference: (path: string) => Promise<boolean>;
  removeReference: (id: string) => void;
  clearAll: () => void;
  getReferencePaths: () => string[];
}

export const useReferenceStore = create<ReferenceStore>((set, get) => ({
  references: [],
  maxReferences: 14,

  addReference: async (path: string) => {
    const { references, maxReferences } = get();

    if (references.length >= maxReferences) {
      return false; // At limit
    }

    // Check if already added
    if (references.some(r => r.path === path)) {
      return false;
    }

    const id = crypto.randomUUID();
    const name = path.split('/').pop() || 'image';

    set(state => ({
      references: [...state.references, { id, path, name }]
    }));

    return true;
  },

  removeReference: (id: string) => {
    set(state => ({
      references: state.references.filter(r => r.id !== id)
    }));
  },

  clearAll: () => {
    set({ references: [] });
  },

  getReferencePaths: () => {
    return get().references.map(r => r.path);
  },
}));
```

```tsx
// src/components/references/ReferenceBar.tsx
import { useReferenceStore } from '@/stores/referenceStore';
import { ReferencePreview } from './ReferencePreview';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { open } from '@tauri-apps/plugin-dialog';

export function ReferenceBar() {
  const { references, maxReferences, addReference, clearAll } = useReferenceStore();

  const handleAddFiles = async () => {
    const selected = await open({
      multiple: true,
      filters: [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'webp'] }],
    });

    if (selected) {
      const paths = Array.isArray(selected) ? selected : [selected];
      for (const path of paths) {
        await addReference(path);
      }
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();

    // Handle files from gallery (internal drag)
    const imagePath = e.dataTransfer.getData('text/image-path');
    if (imagePath) {
      await addReference(imagePath);
      return;
    }

    // Handle files from desktop (external drag)
    // Note: For external file drops, use Tauri's onDrop listener instead
    // Browser's File API doesn't provide full paths for security reasons
    // See: https://v2.tauri.app/develop/file-drops/
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  return (
    <div
      className="flex items-center gap-2 p-2 bg-gray-900 border-t border-gray-800"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <span className="text-xs text-gray-400 shrink-0">References:</span>

      {/* Reference thumbnails */}
      <div className="flex gap-1 flex-1 overflow-x-auto">
        {references.map(ref => (
          <ReferencePreview key={ref.id} reference={ref} />
        ))}

        {references.length === 0 && (
          <span className="text-xs text-gray-500 italic">
            Drag images here or click + to add
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleAddFiles}
          disabled={references.length >= maxReferences}
          title="Add reference images"
        >
          <Plus className="w-4 h-4" />
        </Button>

        {references.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAll}
            title="Clear all references"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}

        <span className="text-xs text-gray-500">
          ({references.length}/{maxReferences})
        </span>
      </div>
    </div>
  );
}
```

```tsx
// src/components/references/ReferencePreview.tsx
import { useReferenceStore } from '@/stores/referenceStore';
import { X } from 'lucide-react';
import { convertFileSrc } from '@tauri-apps/api/core';

interface ReferencePreviewProps {
  reference: {
    id: string;
    path: string;
    name: string;
  };
}

export function ReferencePreview({ reference }: ReferencePreviewProps) {
  const removeReference = useReferenceStore(state => state.removeReference);

  // Convert file path to URL that can be displayed
  const imageSrc = convertFileSrc(reference.path);

  return (
    <div className="relative group shrink-0">
      <img
        src={imageSrc}
        alt={reference.name}
        className="w-10 h-10 object-cover rounded border border-gray-700"
        title={reference.name}
      />
      <button
        onClick={() => removeReference(reference.id)}
        className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full
                   flex items-center justify-center opacity-0 group-hover:opacity-100
                   transition-opacity"
        title="Remove reference"
      >
        <X className="w-3 h-3 text-white" />
      </button>
    </div>
  );
}
```

```tsx
// src/components/gallery/ImageCard.tsx (updated with drag support)
import { convertFileSrc } from '@tauri-apps/api/core';

interface ImageCardProps {
  image: {
    path: string;
    name: string;
  };
  onSelect: () => void;
}

export function ImageCard({ image, onSelect }: ImageCardProps) {
  const imageSrc = convertFileSrc(image.path);

  const handleDragStart = (e: React.DragEvent) => {
    // Set the image path for the reference bar to receive
    e.dataTransfer.setData('text/image-path', image.path);
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div
      className="cursor-pointer rounded overflow-hidden border border-gray-700
                 hover:border-blue-500 transition-colors"
      onClick={onSelect}
      draggable
      onDragStart={handleDragStart}
    >
      <img
        src={imageSrc}
        alt={image.name}
        className="w-full aspect-square object-cover"
        loading="lazy"
      />
    </div>
  );
}
```

### 6. Tauri Configuration

```json
// src-tauri/tauri.conf.json
{
  "$schema": "https://schema.tauri.app/config/2",
  "productName": "Offers Studio",
  "version": "0.1.0",
  "identifier": "com.offers.studio",
  "build": {
    "beforeDevCommand": "npm run dev",
    "devUrl": "http://localhost:1420",
    "beforeBuildCommand": "npm run build",
    "frontendDist": "../dist"
  },
  "app": {
    "windows": [
      {
        "title": "Offers Studio",
        "width": 1200,
        "height": 800
      }
    ],
    "security": {
      "csp": "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' asset: https://asset.localhost data:",
      "assetProtocol": {
        "enable": true,
        "scope": [
          "$RESOURCE/**",
          "$APPDATA/**",
          "/Users/jneaimimacmini/dev/apps/offers/**"
        ]
      }
    }
  },
  "bundle": {
    "active": true,
    "targets": "all",
    "icon": [
      "icons/32x32.png",
      "icons/128x128.png",
      "icons/128x128@2x.png",
      "icons/icon.icns",
      "icons/icon.ico"
    ]
  },
  "plugins": {}
}
```

> **Note**: The `assetProtocol` configuration is required for displaying local images in the gallery. The CSP must include `img-src 'self' asset: https://asset.localhost data:` to allow loading images via `convertFileSrc()`. Additionally, `tauri` in `Cargo.toml` must have the `protocol-asset` feature enabled.

### 7. Permissions

```json
// src-tauri/capabilities/default.json
{
  "$schema": "../gen/schemas/desktop-schema.json",
  "identifier": "default",
  "description": "Capability for the main window",
  "windows": ["main"],
  "permissions": [
    "core:default",
    "opener:default",
    "fs:default",
    {
      "identifier": "fs:allow-read-dir",
      "allow": [
        { "path": "$RESOURCE/**" },
        { "path": "$APPDATA/**" },
        { "path": "/Users/jneaimimacmini/dev/apps/offers/**" }
      ]
    },
    {
      "identifier": "fs:allow-read-file",
      "allow": [
        { "path": "$RESOURCE/**" },
        { "path": "$APPDATA/**" },
        { "path": "/Users/jneaimimacmini/dev/apps/offers/**" }
      ]
    },
    {
      "identifier": "fs:allow-stat",
      "allow": [
        { "path": "$RESOURCE/**" },
        { "path": "$APPDATA/**" },
        { "path": "/Users/jneaimimacmini/dev/apps/offers/**" }
      ]
    },
    "shell:allow-open"
  ]
}
```

> **Note**: PTY functionality is implemented with the `portable-pty` Rust crate, not a Tauri plugin, so no PTY permission is needed. The PTY commands (`spawn_pty`, `write_pty`, etc.) are custom Tauri commands. The fs permissions use scoped access to restrict file system operations to specific directories.

---

## Build & Distribution

### Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run tauri dev
```

### Production Build

```bash
# Build for current platform
npm run tauri build

# Output locations:
# macOS:   src-tauri/target/release/bundle/macos/Offers Studio.app
# Windows: src-tauri/target/release/bundle/msi/Offers Studio.msi
# Linux:   src-tauri/target/release/bundle/appimage/Offers Studio.AppImage
```

### Cross-Platform Builds

```bash
# Build for macOS (from macOS)
npm run tauri build -- --target universal-apple-darwin

# Build for Windows (from Windows or cross-compile)
npm run tauri build -- --target x86_64-pc-windows-msvc

# Build for Linux (from Linux)
npm run tauri build -- --target x86_64-unknown-linux-gnu
```

### Distribution

| Platform | Format | Distribution |
|----------|--------|--------------|
| macOS | `.app` / `.dmg` | Direct download, Homebrew cask |
| Windows | `.exe` / `.msi` | Direct download, Windows Store |
| Linux | `.AppImage` / `.deb` | Direct download, Flatpak, Snap |

---

## Prerequisites

### For Users

| Requirement | Details |
|-------------|---------|
| **Claude Code** | Must be installed and authenticated |
| **Google API Key** | For Gemini image generation |
| **Operating System** | macOS 10.15+, Windows 10+, Linux (glibc 2.31+) |

### Claude Code Installation Check

The app checks for Claude Code on startup:

```rust
// src-tauri/src/commands.rs
#[tauri::command]
fn check_claude_code() -> Result<bool, String> {
    match std::process::Command::new("claude")
        .arg("--version")
        .output()
    {
        Ok(output) => Ok(output.status.success()),
        Err(_) => Ok(false),
    }
}
```

### First-Run Setup

If Claude Code is not found, the app shows installation instructions:

1. Install Claude Code: `npm install -g @anthropic-ai/claude-code`
2. Authenticate: `claude auth login`
3. Restart Offers Studio

---

## App Icon & Branding

### Icon Design: Sparkle Frame

The Offers Studio icon uses a "Sparkle Frame" concept that represents:
- **Image frame**: The creative/visual output aspect
- **AI sparkle**: The intelligent, generative capability
- **Dark theme**: Matches the Tokyo Night terminal aesthetic

### Source Files

| File | Purpose | Location |
|------|---------|----------|
| **Source PNG** | Original generated icon | `generated_images/offers-studio-icon.png` |
| **macOS** | .icns format (all sizes) | `offers-studio/src-tauri/icons/icon.icns` |
| **Windows** | .ico format | `offers-studio/src-tauri/icons/icon.ico` |
| **Linux** | .png format | `offers-studio/src-tauri/icons/icon.png` |

### Color Palette

| Element | Color | Hex |
|---------|-------|-----|
| Frame | Indigo Blue | `#7aa2f7` |
| Sparkle | Warm Gold | `#e0af68` |
| Background | Dark Slate | `#1a1b26` |
| Glow | Blue tint | `#7aa2f7` @ 30% |

### Icon Generation Process

Icons were generated using the project's own AI image generation pipeline:

```bash
uv run generate-image.py --prompt "Minimalist app icon design: stylized rounded rectangle frame in indigo blue with 3-point AI sparkle accent in warm gold, dark slate background, clean vector style" --model pro --aspect 1:1
```

### Required Sizes (Tauri)

For full platform support, generate these sizes from the source:

| Size | Platform | File |
|------|----------|------|
| 32x32 | All | `32x32.png` |
| 128x128 | All | `128x128.png` |
| 256x256 | macOS/Windows | `128x128@2x.png` |
| 512x512 | macOS | Part of `.icns` |
| 1024x1024 | macOS | Part of `.icns` |

Use a tool like `tauri icon` or [makeappicon.com](https://makeappicon.com) to generate all sizes from the source PNG.

---

## Roadmap

### Phase 1: Core Shell (MVP) ✅ COMPLETE

- [x] Project planning and documentation
- [x] Tauri 2 project setup with React + TypeScript + Tailwind
- [x] Terminal component with xterm.js (Tokyo Night theme)
- [x] PTY integration with portable-pty crate
- [x] UTF-8 boundary handling for proper Unicode support
- [x] Claude Code process spawning with correct working directory
- [x] Basic window layout with title bar and status indicator
- [x] Error handling for Claude Code not installed
- [x] Debounced resize handling
- [x] Mouse event filtering to prevent spurious input

### Phase 2: Gallery Integration ✅ COMPLETE

- [x] File system watcher with proper cleanup (no memory leaks)
- [x] Gallery panel component with image grid
- [x] Image preview/modal with metadata display
- [x] Auto-refresh on new images
- [x] Metadata loading from companion JSON files
- [x] Loading/error/empty states
- [x] Open folder button (shell plugin)
- [x] Resizable gallery panel with localStorage persistence
- [x] Asset protocol configuration for displaying local images
- [x] Integrate app icon (all sizes generated in `src-tauri/icons/`)

### Phase 3: Reference Images

- [ ] Reference images store (Zustand)
- [ ] Reference bar component with thumbnails
- [ ] Drag from gallery to reference bar
- [ ] Drag from desktop (external files)
- [ ] File picker dialog for adding references
- [ ] Reference limit enforcement (14 max)
- [ ] Clear all / remove individual references

### Phase 4: Polish & Features

- [ ] Resizable panels with persist state
- [ ] Keyboard shortcuts (toggle panels, focus terminal)
- [ ] Settings/preferences with persistence
- [ ] Theme customization
- [ ] Window state persistence (size, position)

### Phase 5: Distribution

- [x] App icon design (Sparkle Frame concept - see [App Icon & Branding](#app-icon--branding))
- [x] Generate icon sizes for all platforms (32x32, 128x128, 256x256, .icns, .ico)
- [ ] macOS code signing and notarization
- [ ] Windows code signing
- [ ] Auto-update mechanism (Tauri updater)
- [ ] Installation guides for all platforms
- [ ] DMG/MSI/AppImage packaging

### Future Enhancements

- [ ] Multiple project support (project switcher)
- [ ] Session history/restore
- [ ] Cloud sync for templates and preferences
- [ ] Team collaboration features
- [ ] Plugin system for extensions
- [ ] Image comparison tool (before/after)
- [ ] Batch generation with queue
- [ ] Export presentations (PDF/PPTX)

---

## References

### Tauri Documentation
- [Tauri v2 Documentation](https://v2.tauri.app/)
- [tauri-plugin-pty](https://github.com/Tnze/tauri-plugin-pty)
- [Embedding External Binaries](https://v2.tauri.app/develop/sidecar/)

### xterm.js Documentation
- [xterm.js](https://xtermjs.org/)
- [xterm.js Addons](https://xtermjs.org/docs/guides/using-addons/)

### Example Projects
- [tauri-terminal](https://github.com/marc2332/tauri-terminal)
- [terraphim-liquid-glass-terminal](https://github.com/terraphim/terraphim-liquid-glass-terminal)

### Rust Crates
- [portable-pty](https://docs.rs/portable-pty/latest/portable_pty/)
- [notify](https://docs.rs/notify/latest/notify/)

---

## License

[Your License Here]

---

## Contributing

[Contributing Guidelines]
