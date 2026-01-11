# HTML5 Drag-Drop Not Working in Tauri Webview

**Tags**: ui, tauri, drag-drop, webview
**Severity**: medium
**First Seen**: 2026-01-10
**Status**: resolved
**Related Plans**: FEAT-003-reference-images

## Symptoms

- HTML5 drag-and-drop from gallery images to reference bar does not work
- `onDragStart` handler never fires (no console logs appear)
- `draggable={true}` attribute has no effect
- Drag cursor doesn't appear when attempting to drag images
- No errors in console - events simply don't fire

```
// Expected console output that never appears:
"Drag started with path: /path/to/image.png"
```

## Root Cause

Tauri's webview (WebKit on macOS, WebView2 on Windows) does not reliably support HTML5 drag-and-drop for internal element dragging. The native webview captures or blocks drag events before they reach the React/JavaScript layer.

Attempted fixes that did NOT work:
- `draggable={true}` (explicit boolean)
- `pointer-events-none` on child elements
- `e.stopPropagation()` on drag handlers
- Disabling native image drag with `draggable={false}` on `<img>`

**Note**: External file drops FROM the desktop DO work via Tauri's native `tauri://drag-drop` event, but internal element-to-element drag doesn't.

## Solution

Replace drag-and-drop with click-based UI:

### 1. Add Click Handler to Source Component

```tsx
// ImageCard.tsx
interface ImageCardProps {
  image: ImageFile;
  onClick: () => void;
  onAddToReferences?: (path: string) => void;  // New prop
}

export function ImageCard({ image, onClick, onAddToReferences }: ImageCardProps) {
  const handleAddToReferences = (e: React.MouseEvent) => {
    e.stopPropagation(); // Don't trigger onClick
    onAddToReferences?.(image.path);
  };

  return (
    <div className="group relative" onClick={onClick}>
      {/* Image content */}

      {/* Add button - appears on hover */}
      {onAddToReferences && (
        <button
          onClick={handleAddToReferences}
          className="absolute top-1 right-1 h-6 w-6 rounded-full bg-blue-600
                     text-white opacity-0 group-hover:opacity-100"
          title="Add to references"
        >
          +
        </button>
      )}
    </div>
  );
}
```

### 2. Pass Callback Through Component Hierarchy

```tsx
// GalleryPanel.tsx
interface GalleryPanelProps {
  projectPath: string;
  onAddToReferences?: (path: string) => void;
}

// ThumbnailGrid.tsx
<ImageCard
  image={image}
  onClick={() => onSelectImage(image)}
  onAddToReferences={onAddToReferences}
/>
```

### 3. Connect to State Management

```tsx
// AppLayout.tsx
<GalleryPanel
  projectPath={projectPath}
  onAddToReferences={referenceBar.addReference}
/>
```

### Alternative: Keep External Drops Working

External file drops from Finder/Explorer still work via Tauri events:

```tsx
// AppLayout.tsx
useEffect(() => {
  const unlisten = listen<string[]>('tauri://drag-drop', (event) => {
    const files = event.payload;
    files.forEach((filePath) => {
      if (isImageFile(filePath)) {
        addReference(filePath);
      }
    });
  });
  return () => { unlisten.then(fn => fn()); };
}, [addReference]);
```

## Prevention

- [ ] For Tauri apps, prefer click-based UX over drag-and-drop for internal elements
- [ ] Test drag-drop early in development on all target platforms
- [ ] Use Tauri's native `tauri://drag-drop` for external file drops
- [ ] Document known webview limitations in project README

## Related

- [Scroll Propagation in Sidebar](./scroll-propagation-sidebar.md) - Another Tauri webview UI issue
- [FEAT-003 Reference Images Plan](../../implementation-plans/completed/FEAT-003-reference-images.md)
