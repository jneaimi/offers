import { ReactNode, useState, useEffect } from 'react';
import { GalleryPanel } from '../gallery/GalleryPanel';

interface AppLayoutProps {
  children: ReactNode;
  projectName?: string;
  projectPath?: string;
  onConnectionChange?: (connected: boolean) => void;
}

export function AppLayout({
  children,
  projectName = 'Offers',
  projectPath = '/Users/jneaimimacmini/dev/apps/offers',
  onConnectionChange
}: AppLayoutProps) {
  const [connected, setConnected] = useState(false);
  const [galleryWidth, setGalleryWidth] = useState(() => {
    const saved = localStorage.getItem('galleryPanelWidth');
    return saved ? parseInt(saved, 10) : 320;
  });
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    // Assume connected on mount (PTY initialization happens in Terminal component)
    setConnected(true);
    onConnectionChange?.(true);
  }, [onConnectionChange]);

  // Persist gallery width to localStorage
  useEffect(() => {
    localStorage.setItem('galleryPanelWidth', galleryWidth.toString());
  }, [galleryWidth]);

  // Handle resizing
  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = window.innerWidth - e.clientX;
      setGalleryWidth(Math.max(280, Math.min(600, newWidth)));
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-900">
      {/* Title Bar */}
      <div className="flex-none h-12 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold text-gray-100">
            Offers Studio
          </h1>
          <span className="text-sm text-gray-400">
            {projectName}
          </span>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className={`text-sm ${connected ? 'text-green-400' : 'text-red-400'}`}>
            {connected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      {/* Main Content Area - Resizable Layout */}
      <div className="flex-1 overflow-hidden flex">
        {/* Terminal / Main Content */}
        <div className="flex-1 overflow-hidden">
          {children}
        </div>

        {/* Resize Handle */}
        <div
          className={`w-1 cursor-col-resize bg-gray-700 hover:bg-blue-500 transition-colors ${
            isResizing ? 'bg-blue-500' : ''
          }`}
          onMouseDown={() => setIsResizing(true)}
        />

        {/* Gallery Panel */}
        <div
          className="flex-none overflow-hidden"
          style={{ width: `${galleryWidth}px` }}
        >
          <GalleryPanel projectPath={projectPath} />
        </div>
      </div>
    </div>
  );
}
