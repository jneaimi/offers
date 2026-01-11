import { useState, useEffect } from 'react';

interface SessionNameDialogProps {
  isOpen: boolean;
  currentName?: string;
  onSave: (name: string) => void;
  onCancel: () => void;
}

export function SessionNameDialog({
  isOpen,
  currentName = '',
  onSave,
  onCancel,
}: SessionNameDialogProps) {
  const [name, setName] = useState(currentName);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setName(currentName);
    setError(null);
  }, [currentName, isOpen]);

  const handleSave = () => {
    // Validate name
    const trimmedName = name.trim();
    if (trimmedName.length === 0) {
      setError('Name cannot be empty');
      return;
    }
    if (trimmedName.length > 50) {
      setError('Name must be 50 characters or less');
      return;
    }

    onSave(trimmedName);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-xl w-full max-w-md p-6">
        {/* Title */}
        <h2 className="text-lg font-semibold text-gray-100 mb-4">
          Rename Session
        </h2>

        {/* Input */}
        <div className="mb-4">
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError(null);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Enter session name..."
            className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500"
            autoFocus
          />
          {error && (
            <div className="mt-2 text-sm text-red-400">
              {error}
            </div>
          )}
        </div>

        {/* Character count */}
        <div className="text-xs text-gray-500 mb-4">
          {name.length} / 50 characters
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
