import { useEffect, useRef, useState } from 'react';
import { Terminal as XTerm } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebglAddon } from '@xterm/addon-webgl';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import '@xterm/xterm/css/xterm.css';
import '@/styles/terminal.css';

interface TerminalProps {
  onError?: (error: Error) => void;
}

function TerminalInner({ onError }: TerminalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<XTerm | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    let ptyId: string | null = null;
    let isCleanedUp = false;

    // Initialize terminal
    const term = new XTerm({
      fontFamily: '"JetBrains Mono", "Fira Code", monospace',
      fontSize: 14,
      lineHeight: 1.2,
      cursorBlink: true,
      cursorStyle: 'block',
      scrollback: 5000,
      theme: {
        background: '#1a1b26',
        foreground: '#a9b1d6',
        cursor: '#c0caf5',
        selectionBackground: '#33467c',
        black: '#32344a',
        red: '#f7768e',
        green: '#9ece6a',
        yellow: '#e0af68',
        blue: '#7aa2f7',
        magenta: '#ad8ee6',
        cyan: '#449dab',
        white: '#787c99',
      },
    });

    // Load addons
    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);

    try {
      term.loadAddon(new WebglAddon());
    } catch (e) {
      console.warn('WebGL addon failed, using canvas renderer');
    }

    // Mount terminal
    term.open(containerRef.current);
    fitAddon.fit();

    // Get project path from bundled resources
    async function initPty() {
      try {
        // Set working directory to the offers project root
        const cwd = '/Users/jneaimimacmini/dev/apps/offers';

        // Ensure terminal is properly sized before spawning
        fitAddon.fit();
        const cols = term.cols;
        const rows = term.rows;
        console.log(`Spawning PTY with size: ${cols}x${rows}`);

        // Spawn Claude Code CLI
        const id = await invoke<string>('spawn_pty', {
          command: 'claude',
          args: [],
          cwd,
          cols,
          rows,
        });

        if (isCleanedUp) {
          // Component unmounted during async operation
          await invoke('kill_pty', { id });
          return;
        }

        ptyId = id;
        setConnectionError(null);

        // Set up data listener for PTY output
        const unlistenData = await listen<string>(`pty-data:${id}`, (event) => {
          term.write(event.payload);
        });

        // Set up exit listener
        const unlistenExit = await listen(`pty-exit:${id}`, () => {
          term.write('\r\n\x1b[33mProcess exited\x1b[0m\r\n');
        });

        // Handle user input from terminal
        // Filter out mouse escape sequences to prevent spurious input
        term.onData((data) => {
          if (ptyId) {
            // Skip mouse event sequences (ESC [ M, ESC [ <, ESC [ t)
            // These can cause empty lines when clicking in the terminal
            if (data.startsWith('\x1b[M') ||
                data.startsWith('\x1b[<') ||
                data.startsWith('\x1b[t') ||
                data.match(/^\x1b\[\d+;\d+[MmRt]$/)) {
              return; // Ignore mouse events
            }
            invoke('write_pty', { id: ptyId, data }).catch(console.error);
          }
        });

        // Store cleanup functions
        if (isCleanedUp) {
          unlistenData();
          unlistenExit();
        } else {
          // Store in ref for cleanup
          terminalRef.current = term;
          (terminalRef.current as any).unlistenData = unlistenData;
          (terminalRef.current as any).unlistenExit = unlistenExit;
        }

      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to start terminal';
        setConnectionError(message);
        onError?.(new Error(message));

        // Check if this is a "command not found" error (Claude Code not installed)
        const errorStr = message.toLowerCase();
        if (errorStr.includes('not found') || errorStr.includes('no such file')) {
          term.write('\r\n\x1b[31mError: Claude Code not found\x1b[0m\r\n');
          term.write('\r\nPlease install Claude Code:\r\n');
          term.write('  \x1b[36mnpm install -g @anthropic-ai/claude-code\x1b[0m\r\n');
          term.write('\r\nOr visit: \x1b[36mhttps://claude.ai/code\x1b[0m\r\n');
        } else {
          term.write(`\r\n\x1b[31mError: ${message}\x1b[0m\r\n`);
          term.write('\r\nPlease ensure Claude Code is installed and accessible\r\n');
        }
      }
    }

    initPty();

    // Handle window resize with debounce
    let resizeTimeout: ReturnType<typeof setTimeout> | null = null;
    const handleResize = () => {
      if (resizeTimeout) clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        fitAddon.fit();
        if (ptyId) {
          invoke('resize_pty', { id: ptyId, cols: term.cols, rows: term.rows })
            .catch(console.error);
        }
      }, 100);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(containerRef.current);
    window.addEventListener('resize', handleResize);

    terminalRef.current = term;

    // Cleanup
    return () => {
      isCleanedUp = true;
      if (resizeTimeout) clearTimeout(resizeTimeout);
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);

      // Unlisten from events
      if (terminalRef.current) {
        const unlisten = (terminalRef.current as any).unlistenData;
        const unlistenExit = (terminalRef.current as any).unlistenExit;
        if (unlisten) unlisten();
        if (unlistenExit) unlistenExit();
      }

      // Kill PTY process
      if (ptyId) {
        invoke('kill_pty', { id: ptyId }).catch(console.error);
      }

      term.dispose();
    };
  }, [onError]);

  return (
    <div className="h-full w-full relative">
      <div
        ref={containerRef}
        className="h-full w-full bg-[#1a1b26]"
      />
      {connectionError && (
        <div className="absolute top-2 right-2 bg-red-900/80 text-red-200 px-3 py-1 rounded text-sm">
          Connection Error
        </div>
      )}
    </div>
  );
}

// Wrap with error boundary for crash protection
export function Terminal(props: TerminalProps) {
  return (
    <ErrorBoundary
      fallback={
        <div className="h-full w-full flex items-center justify-center bg-gray-900 text-gray-400">
          <div className="text-center">
            <p className="text-lg mb-2">Terminal crashed</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Reload App
            </button>
          </div>
        </div>
      }
    >
      <TerminalInner {...props} />
    </ErrorBoundary>
  );
}
