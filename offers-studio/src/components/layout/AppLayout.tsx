import { useState, useEffect, useRef, useCallback } from 'react';
import { listen } from '@tauri-apps/api/event';
import { GalleryPanel } from '../gallery/GalleryPanel';
import { ReferenceBar } from '../reference-bar';
import { ContextBar, ContextBarHandle } from '../context-bar';
import { SessionActions } from '../session-actions';
import { SessionManager } from '../session-manager';
import { useReferenceBar } from '../../hooks/useReferenceBar';
import { Terminal, TerminalHandle } from '../terminal/Terminal';

interface AppLayoutProps {
  projectName?: string;
  projectPath: string;
  onConnectionChange?: (connected: boolean) => void;
}

export function AppLayout({
  projectName = 'GenImage Studio',
  projectPath,
  onConnectionChange
}: AppLayoutProps) {
  const terminalRef = useRef<TerminalHandle>(null);
  const contextBarRef = useRef<ContextBarHandle>(null);
  const [connected, setConnected] = useState(false);
  const [galleryWidth, setGalleryWidth] = useState(() => {
    const saved = localStorage.getItem('galleryPanelWidth');
    return saved ? parseInt(saved, 10) : 320;
  });
  const [isResizing, setIsResizing] = useState(false);
  const [isDraggingExternal, setIsDraggingExternal] = useState(false);
  const [isSessionCommandExecuting, setIsSessionCommandExecuting] = useState(false);
  const [isSessionManagerOpen, setIsSessionManagerOpen] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  // Reference bar state
  const referenceBar = useReferenceBar();

  // Send text to terminal (for reference bar integration)
  const sendToTerminal = useCallback((text: string) => {
    terminalRef.current?.sendInput(text);
  }, []);

  // Session action handlers
  const handleClearSession = useCallback(() => {
    setIsSessionCommandExecuting(true);
    terminalRef.current?.sendCommand('/clear');
    // Reset context bar to show fresh state
    contextBarRef.current?.resetContext();
    // Reset executing state after a short delay
    setTimeout(() => setIsSessionCommandExecuting(false), 1000);
  }, []);

  const handleCompactSession = useCallback(() => {
    setIsSessionCommandExecuting(true);
    terminalRef.current?.sendCommand('/compact');
    // Reset executing state after a short delay
    setTimeout(() => setIsSessionCommandExecuting(false), 1000);
  }, []);

  // Resume session handler
  const handleResumeSession = useCallback(async (sessionId: string) => {
    try {
      await terminalRef.current?.resumeSession(sessionId);
      setCurrentSessionId(sessionId);
      setIsSessionManagerOpen(false);
    } catch (error) {
      console.error('Failed to resume session:', error);
      alert('Failed to resume session. Check console for details.');
    }
  }, []);

  // Session change handler
  const handleSessionChange = useCallback((sessionId: string | null) => {
    setCurrentSessionId(sessionId);
  }, []);

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

  // Keyboard shortcuts for session actions and session manager
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K (or Ctrl+K on Windows/Linux) - Clear session
      if ((e.metaKey || e.ctrlKey) && e.key === 'k' && !e.shiftKey) {
        e.preventDefault();
        handleClearSession();
      }
      // Cmd+Shift+K (or Ctrl+Shift+K) - Compact session
      if ((e.metaKey || e.ctrlKey) && e.key === 'K' && e.shiftKey) {
        e.preventDefault();
        handleCompactSession();
      }
      // Cmd+H (or Ctrl+H) - Toggle session manager (History)
      if ((e.metaKey || e.ctrlKey) && e.key === 'h') {
        e.preventDefault();
        setIsSessionManagerOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleClearSession, handleCompactSession]);

  // Handle external file drops from desktop (Tauri)
  useEffect(() => {
    const unlisten = listen<string[]>('tauri://drag-drop', (event) => {
      const files = event.payload;
      const imageExtensions = ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.bmp'];

      files.forEach((filePath) => {
        const isImage = imageExtensions.some((ext) =>
          filePath.toLowerCase().endsWith(ext)
        );

        if (isImage) {
          referenceBar.addReference(filePath);
        }
      });

      setIsDraggingExternal(false);
    });

    return () => {
      unlisten.then((fn) => fn());
    };
  }, [referenceBar]);

  // Handle visual feedback for external drag
  useEffect(() => {
    const handleDragEnter = () => setIsDraggingExternal(true);
    const handleDragLeave = (e: DragEvent) => {
      // Only hide if leaving the window entirely
      if (e.clientX === 0 && e.clientY === 0) {
        setIsDraggingExternal(false);
      }
    };
    const handleDrop = () => setIsDraggingExternal(false);

    window.addEventListener('dragenter', handleDragEnter);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('drop', handleDrop);

    return () => {
      window.removeEventListener('dragenter', handleDragEnter);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('drop', handleDrop);
    };
  }, []);

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-900 relative">
      {/* External Drag Overlay */}
      {isDraggingExternal && (
        <div className="absolute inset-0 z-50 bg-blue-500/20 backdrop-blur-sm border-4 border-dashed border-blue-400 flex items-center justify-center pointer-events-none">
          <div className="bg-gray-900/90 px-8 py-6 rounded-lg border-2 border-blue-400">
            <div className="text-center">
              <div className="text-4xl mb-3">📁</div>
              <div className="text-lg font-semibold text-blue-400 mb-1">
                Drop images here
              </div>
              <div className="text-sm text-gray-400">
                Add to reference images (max 14)
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Title Bar */}
      <div className="flex-none h-12 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold text-gray-100">
            GenImage Studio
          </h1>
          <span className="text-sm text-gray-400">
            {projectName}
          </span>
        </div>

        {/* Center: Session Actions */}
        <div className="flex-1 flex items-center justify-center">
          <SessionActions
            onClear={handleClearSession}
            onCompact={handleCompactSession}
            isExecuting={isSessionCommandExecuting}
          />
        </div>

        {/* Right: Status Indicator and Session Manager Toggle */}
        <div className="flex items-center gap-4">
          {/* Status Indicator */}
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className={`text-sm ${connected ? 'text-green-400' : 'text-red-400'}`}>
              {connected ? 'Connected' : 'Disconnected'}
            </span>
          </div>

          {/* Session Manager Toggle */}
          <button
            onClick={() => setIsSessionManagerOpen((prev) => !prev)}
            className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors text-sm flex items-center gap-2"
            title="Session History (Cmd+H)"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            History
          </button>
        </div>
      </div>

      {/* Main Content Area - Resizable Layout */}
      <div className="flex-1 overflow-hidden flex">
        {/* Terminal / Main Content with Reference Bar */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Terminal */}
          <div className="flex-1 overflow-hidden">
            <Terminal ref={terminalRef} projectPath={projectPath} onSessionChange={handleSessionChange} />
          </div>

          {/* Reference Bar */}
          <ReferenceBar
            references={referenceBar.references}
            maxReferences={referenceBar.maxReferences}
            onAdd={referenceBar.addReference}
            onRemove={referenceBar.removeReference}
            onClear={referenceBar.clearReferences}
            canAddMore={referenceBar.canAddMore}
            onSendToTerminal={sendToTerminal}
          />

          {/* Context Bar */}
          <ContextBar ref={contextBarRef} />
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
          <GalleryPanel
            projectPath={projectPath}
            onAddToReferences={referenceBar.addReference}
          />
        </div>
      </div>

      {/* Session Manager */}
      <SessionManager
        isOpen={isSessionManagerOpen}
        onClose={() => setIsSessionManagerOpen(false)}
        projectPath={projectPath}
        currentSessionId={currentSessionId}
        onResumeSession={handleResumeSession}
      />
    </div>
  );
}
