import { ImageFile } from '../../lib/types';

interface ImageCardProps {
  image: ImageFile;
  onClick: () => void;
  onAddToReferences?: (path: string) => void;
}

/**
 * ImageCard - Individual thumbnail with hover state
 */
export function ImageCard({ image, onClick, onAddToReferences }: ImageCardProps) {
  const handleAddToReferences = (e: React.MouseEvent) => {
    e.stopPropagation(); // Don't trigger onClick
    onAddToReferences?.(image.path);
  };

  return (
    <div
      className="group relative aspect-square cursor-pointer overflow-hidden rounded-lg bg-gray-800 transition-transform hover:scale-[1.02]"
      onClick={onClick}
    >
      <img
        src={image.thumbnailUrl}
        alt={image.metadata?.prompt || 'Generated image'}
        className="h-full w-full object-cover"
      />

      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
        <div className="flex h-full flex-col justify-between p-2">
          {/* Prompt Preview */}
          <p className="text-[10px] leading-tight text-white line-clamp-3">
            {image.metadata?.prompt || 'No prompt'}
          </p>

          {/* Date */}
          <div className="text-[10px] text-gray-300">
            {image.timestamp.toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Add to References Button */}
      {onAddToReferences && (
        <button
          onClick={handleAddToReferences}
          className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-blue-500 text-sm font-bold"
          title="Add to references"
        >
          +
        </button>
      )}
    </div>
  );
}
