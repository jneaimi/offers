/**
 * Type definitions for Offers Studio
 */

export interface ImageMetadata {
  prompt: string;
  model: string;
  timestamp: string;
  aspect_ratio?: string;
  size?: string;
  generation_time?: number;
  reference_images?: string[];
}

export interface ImageFile {
  path: string;
  filename: string;
  timestamp: Date;
  metadata?: ImageMetadata;
  thumbnailUrl?: string;
  fullUrl?: string;
}

export interface GalleryState {
  images: ImageFile[];
  loading: boolean;
  error: string | null;
  selectedImage: ImageFile | null;
}

export interface FileWatcherEvent {
  event_type: 'created' | 'modified' | 'deleted';
  path: string;
  timestamp: string;
}
