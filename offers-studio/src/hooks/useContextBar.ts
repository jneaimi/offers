import { useEffect, useRef, useState } from 'react';
import { listen, UnlistenFn } from '@tauri-apps/api/event';
import { invoke } from '@tauri-apps/api/core';
import { ContextUsage } from '../lib/types';

interface UseContextBarOptions {
  enabled?: boolean;
  projectPath?: string;
}

interface ContextBarData {
  context: ContextUsage | null;
  statuslineConfigured: boolean;
  color: 'green' | 'yellow' | 'red';
  formattedPercentage: string;
  formattedTokens: string;
  resetContext: () => void;
}

/**
 * Hook to manage context bar state and listen to context updates from Tauri backend
 */
export function useContextBar({ enabled = true, projectPath = '/Users/jneaimimacmini/dev/apps/offers' }: UseContextBarOptions = {}): ContextBarData {
  const [context, setContext] = useState<ContextUsage | null>(null);
  const [statuslineConfigured, setStatuslineConfigured] = useState<boolean>(false);
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

  useEffect(() => {
    let unlisten: UnlistenFn | undefined;
    let isCleanedUp = false;

    const setup = async () => {
      try {
        // Check if statusline is configured
        let configured = await invoke<boolean>('check_statusline');

        // If not configured, try to auto-configure
        if (!configured) {
          try {
            await invoke('install_statusline');
            await invoke('configure_claude_statusline');
            configured = await invoke<boolean>('check_statusline');
            console.log('Auto-configured statusline for context tracking');
          } catch (autoConfigErr) {
            console.warn('Could not auto-configure statusline:', autoConfigErr);
          }
        }

        setStatuslineConfigured(configured);

        if (!configured || !enabledRef.current) {
          return;
        }

        // Start the context watcher with project path
        await invoke('start_context_watcher', { projectPath });
        console.log('Context watcher started for project:', projectPath);

        if (isCleanedUp) return;

        // Try to get current context
        const currentContext = await invoke<ContextUsage | null>('get_current_context');
        if (currentContext) {
          setContext(currentContext);
        }

        // Listen to "context-updated" event from backend
        unlisten = await listen<ContextUsage>('context-updated', (event) => {
          console.log('Context updated:', event.payload);
          setContext(event.payload);
        });
      } catch (error) {
        console.error('Failed to start context watcher:', error);
      }
    };

    setup();

    return () => {
      isCleanedUp = true;
      if (unlisten) {
        unlisten();
      }
      // Stop the watcher when component unmounts
      invoke('stop_context_watcher').catch(console.error);
    };
  }, []); // Empty dependency array - only run once on mount

  // Calculate color based on percentage
  const getColor = (): 'green' | 'yellow' | 'red' => {
    if (!context) return 'green';
    const pct = context.percentage;
    if (pct >= 80) return 'red';
    if (pct >= 50) return 'yellow';
    return 'green';
  };

  // Format percentage
  const formattedPercentage = context
    ? `${context.percentage.toFixed(1)}%`
    : '0%';

  // Format token count (e.g., "134K / 200K")
  const formatTokens = (tokens: number): string => {
    if (tokens >= 1000000) {
      return `${(tokens / 1000000).toFixed(1)}M`;
    } else if (tokens >= 1000) {
      return `${Math.round(tokens / 1000)}K`;
    }
    return tokens.toString();
  };

  const formattedTokens = context
    ? `${formatTokens(context.totalInputTokens + context.totalOutputTokens)} / ${formatTokens(context.contextWindowSize)}`
    : '0 / 0';

  // Reset context (called when session is cleared)
  const resetContext = () => {
    setContext(null);
  };

  return {
    context,
    statuslineConfigured,
    color: getColor(),
    formattedPercentage,
    formattedTokens,
    resetContext,
  };
}
