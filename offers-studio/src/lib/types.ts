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

export interface ReferenceImage {
  id: string;
  path: string;
  filename: string;
  thumbnailUrl?: string;
}

export interface ReferenceBarState {
  references: ReferenceImage[];
  maxReferences: number;
}

export interface ContextUsage {
  totalInputTokens: number;
  totalOutputTokens: number;
  contextWindowSize: number;
  percentage: number;
  currentInput: number;
  currentOutput: number;
  cacheCreationTokens: number;
  cacheReadTokens: number;
}

export interface SessionInfo {
  id: string;
  project_path: string;
  timestamp: string;
  first_message: string;
  message_count: number;
  custom_name?: string;
}
