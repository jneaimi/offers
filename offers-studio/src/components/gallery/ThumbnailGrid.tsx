import { ImageFile } from '../../lib/types';
import { ScrollArea } from '../ui/scroll-area';
import { ImageCard } from './ImageCard';

interface ThumbnailGridProps {
  images: ImageFile[];
  onSelectImage: (image: ImageFile) => void;
  onAddToReferences?: (path: string) => void;
}

/**
 * ThumbnailGrid - Scrollable grid of image thumbnails
 * Uses KB-UI-001 scroll containment pattern
 */
export function ThumbnailGrid({ images, onSelectImage, onAddToReferences }: ThumbnailGridProps) {
  // Skip the first image as it's shown in LatestPreview
  const gridImages = images.slice(1);

  if (gridImages.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <p className="text-xs text-gray-500">No more images</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-hidden">
      <ScrollArea className="h-full">
        <div className="p-4">
          <h3 className="mb-3 text-xs font-medium text-gray-400">Recent</h3>
          <div className="grid grid-cols-2 gap-3">
            {gridImages.map((image) => (
              <ImageCard
                key={image.path}
                image={image}
                onClick={() => onSelectImage(image)}
                onAddToReferences={onAddToReferences}
              />
            ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
