interface ProgressBarProps {
  progress: string;
  className?: string;
}

export function ProgressBar({ progress, className = '' }: ProgressBarProps) {
  // Try to extract percentage from progress text
  // Formats: "50%", "downloading 50%", "50.5%", etc.
  const percentMatch = progress.match(/(\d+(?:\.\d+)?)\s*%/);
  const percentage = percentMatch ? parseFloat(percentMatch[1]) : 0;

  // Try to extract loading information
  const isDownloading = /download|loading|fetching/i.test(progress);
  const isComplete = /complete|loaded|ready|success/i.test(progress);

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex justify-between items-center text-sm">
        <span className="text-gray-700 font-mono truncate">{progress}</span>
        {percentage > 0 && (
          <span className="text-indigo-600 font-semibold ml-2">{percentage.toFixed(0)}%</span>
        )}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            isComplete
              ? 'bg-green-500'
              : isDownloading
              ? 'bg-indigo-600'
              : 'bg-blue-500'
          }`}
          style={{
            width: `${Math.min(Math.max(percentage, 0), 100)}%`,
            transition: 'width 0.3s ease-in-out',
          }}
        >
          {percentage > 0 && (
            <div className="h-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
          )}
        </div>
      </div>
    </div>
  );
}
