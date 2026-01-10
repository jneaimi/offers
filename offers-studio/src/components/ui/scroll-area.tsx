import { ReactNode, forwardRef } from 'react';

interface ScrollAreaProps {
  children: ReactNode;
  className?: string;
}

/**
 * ScrollArea component with proper scroll containment
 * Following KB-UI-001 pattern for preventing scroll propagation
 */
export const ScrollArea = forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ children, className = '' }, ref) => {
    return (
      <div
        ref={ref}
        className={`overflow-hidden ${className}`}
      >
        <div className="h-full overflow-y-auto overflow-x-hidden">
          {children}
        </div>
      </div>
    );
  }
);

ScrollArea.displayName = 'ScrollArea';
