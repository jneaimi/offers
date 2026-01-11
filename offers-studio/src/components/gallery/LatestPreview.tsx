import { ImageFile } from '../../lib/types';

interface LatestPreviewProps {
  image: ImageFile;
  onView: () => void;
  onAddToReferences?: (path: string) => void;
}

/**
 * LatestPreview - Large preview of the most recent image
 */
export function LatestPreview({ image, onView, onAddToReferences }: LatestPreviewProps) {
  const handleAddToReferences = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToReferences?.(image.path);
  };

  return (
    <div className="border-b border-gray-700 p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-xs font-medium text-gray-400">Latest</h3>
        <div className="flex items-center gap-2">
          {onAddToReferences && (
            <button
              onClick={handleAddToReferences}
              className="text-xs text-green-400 hover:text-green-300 transition-colors"
            >
              + Reference
            </button>
          )}
          <button
            onClick={onView}
            className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
          >
            View Full
          </button>
        </div>
      </div>

      <div
        className="group relative aspect-video cursor-pointer overflow-hidden rounded-lg bg-gray-800"
        onClick={onView}
      >
        <img
          src={image.fullUrl}
          alt={image.metadata?.prompt || 'Generated image'}
          className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
        />

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100">
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <p className="text-xs text-white line-clamp-2">
              {image.metadata?.prompt || 'No prompt'}
            </p>
          </div>
        </div>
      </div>

      {/* Metadata */}
      <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
        <span>{image.timestamp.toLocaleDateString()}</span>
        <span>{image.metadata?.model || 'Unknown'}</span>
      </div>
    </div>
  );
}
