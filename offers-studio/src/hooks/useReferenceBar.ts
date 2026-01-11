import { useState, useCallback } from 'react';
import { convertFileSrc } from '@tauri-apps/api/core';
import { ReferenceImage } from '../lib/types';

const MAX_REFERENCES = 14;

/**
 * Hook to manage reference images for image generation
 */
export function useReferenceBar() {
  const [references, setReferences] = useState<ReferenceImage[]>([]);

  /**
   * Add a reference image
   * Returns true if added, false if limit reached or duplicate
   */
  const addReference = useCallback((path: string): boolean => {
    // Check if we've reached the limit
    if (references.length >= MAX_REFERENCES) {
      return false;
    }

    // Check for duplicates
    if (references.some((ref) => ref.path === path)) {
      return false;
    }

    // Extract filename from path
    const filename = path.split('/').pop() || path.split('\\').pop() || 'unknown';

    // Create new reference
    const newReference: ReferenceImage = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      path,
      filename,
      thumbnailUrl: convertFileSrc(path),
    };

    setReferences((prev) => [...prev, newReference]);
    return true;
  }, [references]);

  /**
   * Remove a reference image by ID
   */
  const removeReference = useCallback((id: string) => {
    setReferences((prev) => prev.filter((ref) => ref.id !== id));
  }, []);

  /**
   * Clear all reference images
   */
  const clearReferences = useCallback(() => {
    setReferences([]);
  }, []);

  /**
   * Get array of reference paths for API calls
   */
  const getReferencePaths = useCallback((): string[] => {
    return references.map((ref) => ref.path);
  }, [references]);

  /**
   * Check if we can add more references
   */
  const canAddMore = references.length < MAX_REFERENCES;

  return {
    references,
    maxReferences: MAX_REFERENCES,
    addReference,
    removeReference,
    clearReferences,
    getReferencePaths,
    canAddMore,
  };
}
