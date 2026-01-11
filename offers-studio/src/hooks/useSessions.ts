import { useState, useEffect, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { SessionInfo } from '@/lib/types';

export function useSessions(projectPath: string) {
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Load sessions from backend
  const loadSessions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Get sessions list
      const sessionsList = await invoke<SessionInfo[]>('list_sessions', {
        projectPath,
      });

      // Get custom names
      const customNames = await invoke<Record<string, string>>('get_session_names');

      // Merge custom names into sessions
      const sessionsWithNames = sessionsList.map((session) => ({
        ...session,
        custom_name: customNames[session.id] || undefined,
      }));

      setSessions(sessionsWithNames);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      console.error('Failed to load sessions:', err);
    } finally {
      setLoading(false);
    }
  }, [projectPath]);

  // Load sessions on mount
  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  // Filter sessions based on search query
  const filteredSessions = sessions.filter((session) => {
    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();
    return (
      session.custom_name?.toLowerCase().includes(query) ||
      session.first_message.toLowerCase().includes(query) ||
      session.id.toLowerCase().includes(query)
    );
  });

  // Set custom name for a session
  const setSessionName = useCallback(async (sessionId: string, name: string) => {
    try {
      await invoke('set_session_name', { sessionId, name });

      // Update local state
      setSessions((prev) =>
        prev.map((session) =>
          session.id === sessionId
            ? { ...session, custom_name: name }
            : session
        )
      );
    } catch (err) {
      console.error('Failed to set session name:', err);
      throw err;
    }
  }, []);

  return {
    sessions: filteredSessions,
    allSessions: sessions,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    loadSessions,
    setSessionName,
  };
}
