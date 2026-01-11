import { useState } from 'react';
import { ConfirmDialog } from './ConfirmDialog';

export interface SessionActionsProps {
  onClear: () => void;
  onCompact: () => void;
  isExecuting?: boolean;
}

export function SessionActions({ onClear, onCompact, isExecuting = false }: SessionActionsProps) {
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showCompactConfirm, setShowCompactConfirm] = useState(false);

  const handleClearClick = () => {
    setShowClearConfirm(true);
  };

  const handleClearConfirm = () => {
    setShowClearConfirm(false);
    onClear();
  };

  const handleCompactClick = () => {
    setShowCompactConfirm(true);
  };

  const handleCompactConfirm = () => {
    setShowCompactConfirm(false);
    onCompact();
  };

  return (
    <>
      <div className="flex items-center gap-2">
        {/* Clear Button */}
        <button
          onClick={handleClearClick}
          disabled={isExecuting}
          className="px-3 py-1.5 rounded bg-red-600/80 hover:bg-red-600 text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          title="Clear session (Cmd+K)"
        >
          <span className="text-base">🗑️</span>
          <span>Clear</span>
        </button>

        {/* Compact Button */}
        <button
          onClick={handleCompactClick}
          disabled={isExecuting}
          className="px-3 py-1.5 rounded bg-blue-600/80 hover:bg-blue-600 text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          title="Compact session (Cmd+Shift+K)"
        >
          <span className="text-base">🗜️</span>
          <span>Compact</span>
        </button>

        {/* Loading indicator */}
        {isExecuting && (
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <div className="animate-spin w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full" />
            <span>Processing...</span>
          </div>
        )}
      </div>

      {/* Clear Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showClearConfirm}
        title="Clear Session?"
        message="This will clear the current Claude Code session. All context and history will be removed. This action cannot be undone."
        confirmLabel="Clear Session"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={handleClearConfirm}
        onCancel={() => setShowClearConfirm(false)}
      />

      {/* Compact Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showCompactConfirm}
        title="Compact Session?"
        message="This will compact the current Claude Code session. The AI will summarize the conversation history to save tokens while preserving important context."
        confirmLabel="Compact Session"
        cancelLabel="Cancel"
        variant="warning"
        onConfirm={handleCompactConfirm}
        onCancel={() => setShowCompactConfirm(false)}
      />
    </>
  );
}
