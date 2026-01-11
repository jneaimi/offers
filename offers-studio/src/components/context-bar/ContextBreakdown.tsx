import { ContextUsage } from '../../lib/types';

interface ContextBreakdownProps {
  context: ContextUsage;
  onClose: () => void;
}

export function ContextBreakdown({ context, onClose }: ContextBreakdownProps) {
  // Format large numbers with commas
  const formatNumber = (num: number): string => {
    return num.toLocaleString();
  };

  // Calculate total tokens
  const totalTokens = context.totalInputTokens + context.totalOutputTokens;

  return (
    <div className="flex-none bg-gray-850 border-t border-gray-700 p-4 animate-slideDown">
      <div className="max-w-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-200">
            Context Breakdown
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-300 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          {/* Total Tokens */}
          <div className="bg-gray-800 rounded p-3">
            <div className="text-gray-400 mb-1">Total Tokens</div>
            <div className="text-lg font-semibold text-gray-100">
              {formatNumber(totalTokens)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {context.percentage.toFixed(2)}% of {formatNumber(context.contextWindowSize)}
            </div>
          </div>

          {/* Input Tokens */}
          <div className="bg-gray-800 rounded p-3">
            <div className="text-gray-400 mb-1">Input Tokens</div>
            <div className="text-lg font-semibold text-blue-400">
              {formatNumber(context.totalInputTokens)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Current: {formatNumber(context.currentInput)}
            </div>
          </div>

          {/* Output Tokens */}
          <div className="bg-gray-800 rounded p-3">
            <div className="text-gray-400 mb-1">Output Tokens</div>
            <div className="text-lg font-semibold text-purple-400">
              {formatNumber(context.totalOutputTokens)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Current: {formatNumber(context.currentOutput)}
            </div>
          </div>

          {/* Cache Tokens */}
          <div className="bg-gray-800 rounded p-3">
            <div className="text-gray-400 mb-1">Cache Tokens</div>
            <div className="text-lg font-semibold text-green-400">
              {formatNumber(context.cacheCreationTokens + context.cacheReadTokens)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Created: {formatNumber(context.cacheCreationTokens)} | Read: {formatNumber(context.cacheReadTokens)}
            </div>
          </div>
        </div>

        {/* Context Window Usage Bar */}
        <div className="mt-4 bg-gray-800 rounded p-3">
          <div className="text-gray-400 mb-2 text-xs">Context Window Usage</div>
          <div className="h-4 bg-gray-700 rounded-full overflow-hidden relative">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
              style={{ width: `${Math.min(100, context.percentage)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0</span>
            <span>{formatNumber(context.contextWindowSize)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
