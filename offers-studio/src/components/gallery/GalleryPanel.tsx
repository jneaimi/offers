import { useGallery } from '../../hooks/useGallery';
import { LatestPreview } from './LatestPreview';
import { ThumbnailGrid } from './ThumbnailGrid';
import { ImageModal } from './ImageModal';
import { revealItemInDir } from '@tauri-apps/plugin-opener';

interface GalleryPanelProps {
  projectPath: string;
  onAddToReferences?: (path: string) => void;
}

/**
 * Gallery Panel - Main container for the image gallery
 * Displays latest preview and thumbnail grid
 */
export function GalleryPanel({ projectPath, onAddToReferences }: GalleryPanelProps) {
  const { images, loading, error, selectedImage, selectImage } = useGallery(projectPath);

  const handleOpenFolder = async () => {
    try {
      const folderPath = `${projectPath}/generated_images`;
      console.log('Opening folder:', folderPath);
      // Use revealItemInDir to open folder in Finder
      await revealItemInDir(folderPath);
    } catch (err) {
      console.error('Failed to open folder:', err);
      // Try opening the project path instead if generated_images doesn't exist
      try {
        await revealItemInDir(projectPath);
      } catch (err2) {
        console.error('Failed to open project folder:', err2);
        alert(`Could not open folder: ${err}`);
      }
    }
  };

  if (loading && images.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="mb-2 text-sm text-gray-400">Loading images...</div>
          <div className="h-1 w-48 overflow-hidden rounded-full bg-gray-800">
            <div className="h-full w-1/2 animate-pulse bg-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="mb-2 text-sm text-red-400">Error loading images</div>
          <div className="text-xs text-gray-500">{error}</div>
        </div>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="mb-2 text-sm text-gray-400">No images yet</div>
          <div className="text-xs text-gray-500">
            Generate your first image to see it here
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex h-full w-full flex-col overflow-hidden bg-gray-900">
        {/* Header */}
        <div className="flex-none border-b border-gray-700 px-4 py-3">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-sm font-semibold text-gray-100">Gallery</h2>
              <p className="text-xs text-gray-500">{images.length} images</p>
            </div>
            <button
              onClick={handleOpenFolder}
              className="rounded bg-gray-800 px-2 py-1 text-xs text-gray-300 hover:bg-gray-700 hover:text-gray-100 transition-colors"
              title="Open folder in system file manager"
            >
              Open Folder
            </button>
          </div>
        </div>

        {/* Latest Preview */}
        <div className="flex-none">
          <LatestPreview
            image={images[0]}
            onView={() => selectImage(images[0])}
            onAddToReferences={onAddToReferences}
          />
        </div>

        {/* Thumbnail Grid */}
        <div className="flex-1 overflow-hidden">
          <ThumbnailGrid
            images={images}
            onSelectImage={selectImage}
            onAddToReferences={onAddToReferences}
          />
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <ImageModal image={selectedImage} onClose={() => selectImage(null)} />
      )}
    </>
  );
}
