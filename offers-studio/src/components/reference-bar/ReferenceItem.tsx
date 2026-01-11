import { ReferenceImage } from '../../lib/types';

interface ReferenceItemProps {
  reference: ReferenceImage;
  onRemove: (id: string) => void;
}

/**
 * ReferenceItem - Individual reference thumbnail with remove button
 */
export function ReferenceItem({ reference, onRemove }: ReferenceItemProps) {
  return (
    <div className="group relative h-12 w-12 flex-shrink-0 overflow-hidden rounded border border-gray-700 bg-gray-800">
      {/* Thumbnail */}
      <img
        src={reference.thumbnailUrl}
        alt={reference.filename}
        className="h-full w-full object-cover"
        draggable={false}
      />

      {/* Remove button - shown on hover */}
      <button
        onClick={() => onRemove(reference.id)}
        className="absolute inset-0 flex items-center justify-center bg-red-600/90 opacity-0 transition-opacity hover:opacity-100 group-hover:opacity-100"
        aria-label={`Remove ${reference.filename}`}
      >
        <svg
          className="h-5 w-5 text-white"
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
    </div>
  );
}
