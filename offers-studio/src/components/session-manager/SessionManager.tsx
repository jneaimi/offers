import { useState, useEffect } from 'react';
import { useSessions } from '@/hooks/useSessions';
import { SessionCard } from './SessionCard';
import { SessionNameDialog } from './SessionNameDialog';

interface SessionManagerProps {
  isOpen: boolean;
  onClose: () => void;
  projectPath: string;
  currentSessionId?: string | null;
  onResumeSession: (sessionId: string) => void;
}

export function SessionManager({
  isOpen,
  onClose,
  projectPath,
  currentSessionId,
  onResumeSession,
}: SessionManagerProps) {
  const {
    sessions,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    loadSessions,
    setSessionName,
  } = useSessions(projectPath);

  // Refresh sessions when panel opens
  useEffect(() => {
    if (isOpen) {
      loadSessions();
    }
  }, [isOpen, loadSessions]);

  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [renameSessionId, setRenameSessionId] = useState<string | null>(null);
  const [renameCurrentName, setRenameCurrentName] = useState('');

  const handleRename = (sessionId: string) => {
    const session = sessions.find((s) => s.id === sessionId);
    setRenameSessionId(sessionId);
    setRenameCurrentName(session?.custom_name || '');
    setRenameDialogOpen(true);
  };

  const handleSaveRename = async (name: string) => {
    if (renameSessionId) {
      try {
        await setSessionName(renameSessionId, name);
        setRenameDialogOpen(false);
        setRenameSessionId(null);
      } catch (err) {
        console.error('Failed to rename session:', err);
        alert('Failed to rename session');
      }
    }
  };

  const handleCancelRename = () => {
    setRenameDialogOpen(false);
    setRenameSessionId(null);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 w-96 bg-gray-900 border-l border-gray-700 z-50 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex-none p-4 border-b border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-100">
              Session History
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={loadSessions}
                disabled={loading}
                className="p-1 hover:bg-gray-800 rounded transition-colors disabled:opacity-50"
                aria-label="Refresh"
                title="Refresh sessions"
              >
                <svg className={`w-5 h-5 text-gray-400 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-800 rounded transition-colors"
                aria-label="Close"
              >
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search sessions..."
              className="w-full px-3 py-2 pl-9 bg-gray-800 border border-gray-700 rounded text-gray-100 placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500"
            />
            <svg
              className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading && (
            <div className="text-center py-8 text-gray-400">
              Loading sessions...
            </div>
          )}

          {error && (
            <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 mb-4">
              <div className="text-red-400 text-sm font-semibold mb-1">
                Error loading sessions
              </div>
              <div className="text-red-300 text-xs">
                {error}
              </div>
              <button
                onClick={loadSessions}
                className="mt-2 px-3 py-1 bg-red-700 hover:bg-red-600 text-white text-xs rounded transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {!loading && !error && sessions.length === 0 && (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-2">
                {searchQuery ? 'No sessions match your search' : 'No sessions yet'}
              </div>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-sm text-blue-400 hover:text-blue-300"
                >
                  Clear search
                </button>
              )}
            </div>
          )}

          {!loading && !error && sessions.length > 0 && (
            <div className="space-y-3">
              {sessions.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  isCurrent={session.id === currentSessionId}
                  onResume={onResumeSession}
                  onRename={handleRename}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-none p-4 border-t border-gray-700 bg-gray-800/50">
          <div className="text-xs text-gray-500">
            {sessions.length} session{sessions.length !== 1 ? 's' : ''} total
          </div>
        </div>
      </div>

      {/* Rename Dialog */}
      <SessionNameDialog
        isOpen={renameDialogOpen}
        currentName={renameCurrentName}
        onSave={handleSaveRename}
        onCancel={handleCancelRename}
      />
    </>
  );
}
