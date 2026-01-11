import { SessionInfo } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';

interface SessionCardProps {
  session: SessionInfo;
  isCurrent: boolean;
  onResume: (sessionId: string) => void;
  onRename: (sessionId: string) => void;
}

export function SessionCard({ session, isCurrent, onResume, onRename }: SessionCardProps) {
  // Parse timestamp from session.timestamp (format: YYYY-MM-DD HH:MM:SS)
  const parseTimestamp = (timestampStr: string) => {
    try {
      // Parse YYYY-MM-DD HH:MM:SS format
      const date = new Date(timestampStr.replace(' ', 'T'));
      if (!isNaN(date.getTime())) {
        return date;
      }
    } catch (e) {
      console.error('Failed to parse timestamp:', e);
    }
    return new Date();
  };

  const timestamp = parseTimestamp(session.timestamp);
  const timeAgo = formatDistanceToNow(timestamp, { addSuffix: true });

  return (
    <div
      className={`p-3 rounded-lg border transition-colors ${
        isCurrent
          ? 'bg-blue-900/30 border-blue-500'
          : 'bg-gray-800 border-gray-700 hover:border-gray-600'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          {session.custom_name ? (
            <div>
              <div className="text-sm font-semibold text-gray-100 truncate">
                {session.custom_name}
              </div>
              <div className="text-xs text-gray-500 truncate">
                {timeAgo}
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-400 truncate">
              {timeAgo}
            </div>
          )}
        </div>

        {isCurrent && (
          <div className="flex-none">
            <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded-full">
              Current
            </span>
          </div>
        )}
      </div>

      {/* Preview Text */}
      <div className="text-sm text-gray-300 mb-2 line-clamp-2">
        {session.first_message}
      </div>

      {/* Metadata */}
      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
        <span>{session.message_count} messages</span>
        <span className="font-mono text-xs">{session.id.substring(0, 8)}</span>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {!isCurrent && (
          <button
            onClick={() => onResume(session.id)}
            className="flex-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
          >
            Resume
          </button>
        )}
        <button
          onClick={() => onRename(session.id)}
          className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm rounded transition-colors"
        >
          Rename
        </button>
      </div>
    </div>
  );
}
