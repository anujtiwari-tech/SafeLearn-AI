interface ScanProgressProps {
  progress: number;
}

export const ScanProgress = ({ progress }: ScanProgressProps) => {
  const loadingMessages = [
    'Initializing scanner...',
    'Analyzing file structure...',
    'Checking for malware signatures...',
    'Scanning for suspicious code...',
    'Verifying file integrity...',
    'Generating security report...',
  ];
  
  const currentMessage = loadingMessages[Math.min(
    Math.floor(progress / 15),
    loadingMessages.length - 1
  )];
  
  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg p-8 text-center">
      <div className="mb-6">
        <div className="inline-block relative">
          <div className="w-20 h-20 border-4 border-indigo-200 rounded-full animate-spin border-t-indigo-600"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl">🔍</span>
          </div>
        </div>
      </div>
      
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        Scanning Your File
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6">{currentMessage}</p>
      
      {/* Progress Bar */}
      <div className="w-full max-w-md mx-auto">
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
          <span>Progress</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
      
      <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
        This usually takes 5-10 seconds
      </p>
    </div>
  );
};