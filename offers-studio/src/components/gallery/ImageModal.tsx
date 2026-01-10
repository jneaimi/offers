import { useEffect } from 'react';
import { ImageFile } from '../../lib/types';

interface ImageModalProps {
  image: ImageFile;
  onClose: () => void;
}

/**
 * ImageModal - Full-screen image viewer with metadata
 */
export function ImageModal({ image, onClose }: ImageModalProps) {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
      onClick={onClose}
    >
      {/* Modal Content */}
      <div
        className="relative flex h-full w-full max-w-6xl flex-col p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-gray-800/80 text-gray-300 transition-colors hover:bg-gray-700 hover:text-white"
          aria-label="Close"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Image */}
        <div className="flex flex-1 items-center justify-center overflow-hidden">
          <img
            src={image.fullUrl}
            alt={image.metadata?.prompt || 'Generated image'}
            className="max-h-full max-w-full rounded-lg object-contain shadow-2xl"
          />
        </div>

        {/* Metadata Panel */}
        <div className="mt-4 rounded-lg bg-gray-800/80 p-4">
          <div className="grid gap-3">
            {/* Prompt */}
            {image.metadata?.prompt && (
              <div>
                <h3 className="mb-1 text-xs font-medium text-gray-400">Prompt</h3>
                <p className="text-sm text-gray-200">{image.metadata.prompt}</p>
              </div>
            )}

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs md:grid-cols-4">
              <div>
                <h4 className="mb-1 font-medium text-gray-400">Model</h4>
                <p className="text-gray-200">{image.metadata?.model || 'Unknown'}</p>
              </div>

              <div>
                <h4 className="mb-1 font-medium text-gray-400">Aspect Ratio</h4>
                <p className="text-gray-200">
                  {image.metadata?.aspect_ratio || 'N/A'}
                </p>
              </div>

              <div>
                <h4 className="mb-1 font-medium text-gray-400">Size</h4>
                <p className="text-gray-200">{image.metadata?.size || 'N/A'}</p>
              </div>

              <div>
                <h4 className="mb-1 font-medium text-gray-400">Generated</h4>
                <p className="text-gray-200">
                  {image.timestamp.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Generation Time */}
            {image.metadata?.generation_time && (
              <div className="text-xs">
                <span className="text-gray-400">Generation time:</span>{' '}
                <span className="text-gray-200">
                  {image.metadata.generation_time.toFixed(2)}s
                </span>
              </div>
            )}

            {/* Reference Images */}
            {image.metadata?.reference_images &&
              image.metadata.reference_images.length > 0 && (
                <div>
                  <h4 className="mb-1 text-xs font-medium text-gray-400">
                    Reference Images
                  </h4>
                  <p className="text-xs text-gray-200">
                    {image.metadata.reference_images.length} reference
                    {image.metadata.reference_images.length !== 1 ? 's' : ''}
                  </p>
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}
