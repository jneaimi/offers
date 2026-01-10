import { useEffect, useRef } from 'react';
import { listen, UnlistenFn } from '@tauri-apps/api/event';
import { invoke } from '@tauri-apps/api/core';

interface UseFileWatcherOptions {
  projectPath: string;
  onNewImage?: (path: string) => void;
}

/**
 * Hook to start file watcher and listen to events from the Tauri backend
 * Uses refs for callbacks to avoid re-starting watcher on every render
 */
export function useFileWatcher({
  projectPath,
  onNewImage,
}: UseFileWatcherOptions) {
  // Use ref to store callback to avoid re-running effect when callback changes
  const onNewImageRef = useRef(onNewImage);
  onNewImageRef.current = onNewImage;

  // Start watcher and listen for events - only depends on projectPath
  useEffect(() => {
    let unlisten: UnlistenFn | undefined;
    let isCleanedUp = false;

    const setup = async () => {
      try {
        // Start the file watcher on the backend
        await invoke('start_watcher', { path: projectPath });
        console.log('File watcher started for:', projectPath);

        if (isCleanedUp) return;

        // Listen to "new-image" event from backend (payload is just the path string)
        unlisten = await listen<string>('new-image', (event) => {
          const path = event.payload;
          console.log('New image detected:', path);

          // Only handle image files (png/jpg/jpeg)
          if (/\.(png|jpe?g)$/i.test(path)) {
            onNewImageRef.current?.(path);
          }
        });
      } catch (error) {
        console.error('Failed to start file watcher:', error);
      }
    };

    setup();

    return () => {
      isCleanedUp = true;
      if (unlisten) {
        unlisten();
      }
      // Stop the watcher when component unmounts
      invoke('stop_watcher').catch(console.error);
    };
  }, [projectPath]); // Only re-run if projectPath changes
}
