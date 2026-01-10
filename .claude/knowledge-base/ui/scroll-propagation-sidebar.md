# Scroll Propagation in Nested Scroll Containers

**Issue ID**: KB-UI-001
**Category**: UI/Components
**Severity**: Medium
**Status**: Resolved

## Problem

When implementing nested scroll containers (e.g., a scrollable sidebar within a scrollable page), scroll events can propagate from the inner container to the outer container. This causes both containers to scroll simultaneously, creating poor UX.

### Symptoms

- Scrolling inside a sidebar or nested component also scrolls the main page
- Mouse wheel events are not contained within the intended scroll area
- Users cannot scroll through content without triggering parent scrolling

### Example

```tsx
// PROBLEMATIC: Scroll events propagate to parent
<div className="page-container overflow-y-auto">
  <div className="sidebar">
    <ScrollArea>
      {/* Scrolling here also scrolls the page */}
    </ScrollArea>
  </div>
</div>
```

## Root Cause

The issue occurs when:
1. Radix UI ScrollArea viewport lacks explicit overflow constraints
2. Parent containers don't establish scroll boundaries
3. Height propagation is not enforced through the component tree

## Solution

Implement multi-layer scroll containment using CSS overflow properties:

### 1. Fix the ScrollArea Component

Add `overflow-hidden` and height enforcement to the ScrollArea viewport:

```tsx
// components/ui/scroll-area.tsx
<ScrollAreaPrimitive.Viewport
  className="size-full rounded-[inherit] overflow-hidden [&>div]:!h-full focus-visible:ring-ring/50 transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:outline-1"
>
  {children}
</ScrollAreaPrimitive.Viewport>
```

Key changes:
- `overflow-hidden` - Contains scroll events within viewport
- `[&>div]:!h-full` - Ensures inner content respects height boundaries

### 2. Add Container-Level Boundary

Add `overflow-hidden` to the immediate parent container:

```tsx
// components/templates/TemplatesSidebar.tsx
<div className="flex h-full w-72 flex-col overflow-hidden border-r ...">
  <ScrollArea className="flex-1">
    {/* Content */}
  </ScrollArea>
</div>
```

### Pattern for Future Implementations

When creating nested scroll containers, follow this defensive pattern:

```tsx
<div className="overflow-hidden h-[specific-height]">
  <ScrollArea className="h-full">
    <div className="space-y-4">
      {/* Scrollable content */}
    </div>
  </ScrollArea>
</div>
```

Key principles:
- **Parent**: `overflow-hidden` + explicit height
- **ScrollArea**: `h-full` or `flex-1`
- **Content**: Natural sizing (no height constraints)

## Implementation Details

**Fixed in**: BUG-003-sidebar-scroll-propagation.md
**Date**: 2026-01-07
**Files Modified**:
- `image-studio/src/components/ui/scroll-area.tsx` (line 21)
- `image-studio/src/components/templates/TemplatesSidebar.tsx` (line 90)

## Testing

After applying the fix, verify:

1. Scroll inside the nested component with mouse wheel
2. Verify parent container does not scroll
3. Check both collapsed and expanded states
4. Test in light and dark modes
5. Verify no regressions in other components using ScrollArea

## Related Patterns in Codebase

Other successful scroll containment implementations:
- `ImageDetailModal.tsx:63,69` - Modal with scrollable content
- `Gallery.tsx:133` - Gallery scroll area
- `ChatPanel.tsx:83` - Chat message list
- `page.tsx:100` - Main content area

## Prevention

To avoid this issue in future components:

1. Always use `overflow-hidden` on scroll container parents
2. Ensure ScrollArea has explicit height constraints
3. Test scroll behavior in nested layouts
4. Consider using the multi-layer defensive approach

## Alternative Approaches (Not Recommended)

1. **JavaScript event.stopPropagation()** - More complex, less performant
2. **Body scroll lock** - Too aggressive, breaks other interactions
3. **Pure CSS without Radix ScrollArea** - Loses cross-browser scrollbar styling

## References

- Implementation Plan: `.claude/implementation-plans/completed/BUG-003-sidebar-scroll-propagation.md`
- Radix UI ScrollArea: https://www.radix-ui.com/primitives/docs/components/scroll-area
- CSS Overflow: https://developer.mozilla.org/en-US/docs/Web/CSS/overflow
