import { useState } from 'react';
import { open } from '@tauri-apps/plugin-dialog';
import { ReferenceImage } from '../../lib/types';
import { ReferenceItem } from './ReferenceItem';

interface ReferenceBarProps {
  references: ReferenceImage[];
  maxReferences: number;
  canAddMore: boolean;
  onAdd: (path: string) => boolean;
  onRemove: (id: string) => void;
  onClear: () => void;
  onSendToTerminal?: (text: string) => void;
}

/**
 * ReferenceBar - Horizontal bar for managing reference images
 */
export function ReferenceBar({
  references,
  maxReferences,
  canAddMore,
  onAdd,
  onRemove,
  onClear,
  onSendToTerminal,
}: ReferenceBarProps) {
  const [isDragging, setIsDragging] = useState(false);

  /**
   * Send references to Claude via terminal
   */
  const handleSendToTerminal = () => {
    if (!onSendToTerminal || references.length === 0) return;

    // Format the reference paths for Claude
    const paths = references.map((ref) => ref.path).join(' ');
    const message = `Use these reference images for the next image generation: --reference ${paths}\n`;
    onSendToTerminal(message);
  };

  /**
   * Handle file picker for adding references
   */
  const handleAddClick = async () => {
    if (!canAddMore) return;

    try {
      const selected = await open({
        multiple: true,
        filters: [
          {
            name: 'Images',
            extensions: ['png', 'jpg', 'jpeg', 'webp'],
          },
        ],
      });

      if (selected) {
        const paths = Array.isArray(selected) ? selected : [selected];
        paths.forEach((path) => {
          if (typeof path === 'string') {
            const added = onAdd(path);
            if (!added) {
              console.warn(`Could not add reference: ${path}`);
            }
          }
        });
      }
    } catch (error) {
      console.error('Failed to open file picker:', error);
    }
  };

  /**
   * Handle drag over for internal drag-drop
   */
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
    setIsDragging(true);
  };

  /**
   * Handle drag leave
   */
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  /**
   * Handle drop for internal drag-drop from gallery
   */
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (!canAddMore) return;

    // Try both data formats
    const imagePath = e.dataTransfer.getData('text/image-path') ||
                      e.dataTransfer.getData('text/plain');

    console.log('Drop received, imagePath:', imagePath);

    if (imagePath && imagePath.startsWith('/')) {
      const added = onAdd(imagePath);
      if (!added) {
        console.warn('Could not add reference - limit reached or duplicate');
      }
    } else {
      console.warn('Invalid or empty image path received:', imagePath);
    }
  };

  return (
    <div
      className={`flex items-center gap-3 border-b border-gray-700 px-4 py-2 transition-colors ${
        isDragging ? 'bg-blue-900/30' : 'bg-gray-800'
      }`}
      onDragOver={handleDragOver}
      onDragEnter={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Label */}
      <div className="text-sm font-medium text-gray-300">
        References:
      </div>

      {/* Drop zone for thumbnails */}
      <div
        className={`flex flex-1 items-center gap-2 rounded border-2 border-dashed px-3 py-1 transition-colors ${
          isDragging
            ? 'border-blue-400 bg-blue-900/20'
            : 'border-gray-600 bg-gray-900/50'
        }`}
      >
        {references.length === 0 ? (
          <div className="flex-1 text-center text-xs text-gray-500">
            Drop images here or click Add
          </div>
        ) : (
          <div className="flex flex-1 items-center gap-2 overflow-x-auto">
            {references.map((ref) => (
              <ReferenceItem key={ref.id} reference={ref} onRemove={onRemove} />
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Count indicator */}
        <div className="text-xs text-gray-400">
          {references.length}/{maxReferences}
        </div>

        {/* Add button */}
        <button
          onClick={handleAddClick}
          disabled={!canAddMore}
          className="rounded bg-blue-600 px-3 py-1 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          Add
        </button>

        {/* Send to Claude button */}
        {references.length > 0 && onSendToTerminal && (
          <button
            onClick={handleSendToTerminal}
            className="rounded bg-green-600 px-3 py-1 text-sm font-medium text-white transition-colors hover:bg-green-500"
            title="Send references to Claude for image generation"
          >
            Send to Claude
          </button>
        )}

        {/* Clear button */}
        {references.length > 0 && (
          <button
            onClick={onClear}
            className="rounded bg-gray-700 px-3 py-1 text-sm font-medium text-white transition-colors hover:bg-gray-600"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
