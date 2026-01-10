import { useState, useEffect, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { convertFileSrc } from '@tauri-apps/api/core';
import { ImageFile, GalleryState } from '../lib/types';
import { useFileWatcher } from './useFileWatcher';

/**
 * Hook to manage gallery state and image loading
 */
export function useGallery(projectPath: string) {
  const [state, setState] = useState<GalleryState>({
    images: [],
    loading: true,
    error: null,
    selectedImage: null,
  });

  // Load images from backend
  const loadImages = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      const images = await invoke<ImageFile[]>('list_images', {
        projectPath,
      });

      // Convert file paths to URLs that Tauri can serve
      const imagesWithUrls = images.map((img) => ({
        ...img,
        fullUrl: convertFileSrc(img.path),
        thumbnailUrl: convertFileSrc(img.path), // Could add thumbnail generation later
        timestamp: new Date(img.timestamp),
      }));

      // Sort by timestamp descending (newest first)
      imagesWithUrls.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

      setState((prev) => ({
        ...prev,
        images: imagesWithUrls,
        loading: false,
      }));
    } catch (error) {
      console.error('Failed to load images:', error);
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load images',
      }));
    }
  }, [projectPath]);

  // Initial load
  useEffect(() => {
    loadImages();
  }, [loadImages]);

  // Listen for new images - starts the file watcher on mount
  useFileWatcher({
    projectPath,
    onNewImage: () => {
      console.log('Gallery: reloading images due to new-image event');
      loadImages();
    },
  });

  const selectImage = useCallback((image: ImageFile | null) => {
    setState((prev) => ({ ...prev, selectedImage: image }));
  }, []);

  const refresh = useCallback(() => {
    loadImages();
  }, [loadImages]);

  return {
    images: state.images,
    loading: state.loading,
    error: state.error,
    selectedImage: state.selectedImage,
    selectImage,
    refresh,
  };
}
