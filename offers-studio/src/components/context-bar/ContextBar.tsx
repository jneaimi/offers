import { useState, forwardRef, useImperativeHandle } from 'react';
import { ContextBreakdown } from './ContextBreakdown';
import { useContextBar } from '../../hooks/useContextBar';

export interface ContextBarHandle {
  resetContext: () => void;
}

export const ContextBar = forwardRef<ContextBarHandle>(function ContextBar(_props, ref) {
  const { context, statuslineConfigured, color, formattedPercentage, formattedTokens, resetContext } = useContextBar();

  // Expose resetContext to parent via ref
  useImperativeHandle(ref, () => ({
    resetContext,
  }));
  const [showBreakdown, setShowBreakdown] = useState(false);

  // If statusline is not configured, show minimal bar (context tracking is optional)
  if (!statuslineConfigured) {
    return (
      <div className="flex-none h-8 bg-gray-800/50 border-t border-gray-700 px-4 flex items-center justify-center">
        <div className="text-xs text-gray-500">
          Context tracking available • Run <code className="text-gray-400 bg-gray-700 px-1 rounded">/statusline</code> in Claude Code to enable
        </div>
      </div>
    );
  }

  // Get color classes
  const getColorClasses = () => {
    switch (color) {
      case 'red':
        return {
          text: 'text-red-400',
          bg: 'bg-red-500',
          barBg: 'bg-red-900/30',
        };
      case 'yellow':
        return {
          text: 'text-yellow-400',
          bg: 'bg-yellow-500',
          barBg: 'bg-yellow-900/30',
        };
      default:
        return {
          text: 'text-green-400',
          bg: 'bg-green-500',
          barBg: 'bg-green-900/30',
        };
    }
  };

  const colors = getColorClasses();

  return (
    <>
      <div
        className="flex-none h-10 bg-gray-800 border-t border-gray-700 px-4 flex items-center justify-between cursor-pointer hover:bg-gray-750 transition-colors"
        onClick={() => setShowBreakdown(!showBreakdown)}
      >
        <div className="flex items-center gap-3 flex-1">
          {/* Progress Bar */}
          <div className="flex-1 max-w-xs">
            <div className={`h-2 rounded-full ${colors.barBg} overflow-hidden`}>
              <div
                className={`h-full ${colors.bg} transition-all duration-300`}
                style={{ width: `${Math.min(100, context?.percentage || 0)}%` }}
              />
            </div>
          </div>

          {/* Token Count */}
          <div className="text-sm text-gray-300">
            {formattedTokens}
          </div>

          {/* Percentage */}
          <div className={`text-sm font-semibold ${colors.text}`}>
            {formattedPercentage}
          </div>
        </div>

        {/* Expand/Collapse Indicator */}
        <div className="text-xs text-gray-500">
          {showBreakdown ? '▼' : '▶'}
        </div>
      </div>

      {/* Breakdown Panel */}
      {showBreakdown && context && (
        <ContextBreakdown
          context={context}
          onClose={() => setShowBreakdown(false)}
        />
      )}
    </>
  );
});
