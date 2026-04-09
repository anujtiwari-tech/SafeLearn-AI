interface SecurityReportProps {
  result: any;
  onScanAnother: () => void;
}

export const SecurityReport = ({ result, onScanAnother }: SecurityReportProps) => {
  const {
    filename,
    file_size_human,
    security_score,
    is_threat,
    threat_level,
    risk_indicators,
    recommendations,
    metadata,
    file_hash
  } = result;
  
  // Get color based on score
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };
  
  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-100 dark:bg-green-900/30 border-green-500';
    if (score >= 60) return 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-500';
    if (score >= 40) return 'bg-orange-100 border-orange-500';
    return 'bg-red-100 dark:bg-red-900/30 border-red-500';
  };
  
  const getStatusIcon = () => {
    if (security_score >= 80) return '✅';
    if (security_score >= 60) return '⚠️';
    if (security_score >= 40) return '🚫';
    return '❌';
  };
  
  const getStatusText = () => {
    if (security_score >= 80) return 'Safe to Open';
    if (security_score >= 60) return 'Low Risk';
    if (security_score >= 40) return 'High Risk';
    return 'Critical Threat';
  };
  
  return (
    <div className="space-y-6">
      {/* Main Status Card */}
      <div className={`rounded-lg border-2 p-6 ${getScoreBg(security_score)}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-5xl">{getStatusIcon()}</span>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-blue-500">
                {getStatusText()}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">{filename}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{file_size_human}</p>
            </div>
          </div>
          
          {/* Security Score Circle */}
          <div className="text-center">
            <div className={`w-24 h-24 rounded-full border-4 flex items-center justify-center ${
              security_score >= 80 ? 'border-green-500' :
              security_score >= 60 ? 'border-yellow-500' :
              security_score >= 40 ? 'border-orange-500' :
              'border-red-500'
            }`}>
              <div>
                <span className={`text-3xl font-bold ${getScoreColor(security_score)}`}>
                  {security_score}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">/100</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Security Score</p>
          </div>
        </div>
      </div>
      
      {/* Two Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Risk Indicators */}
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span>⚠️</span> Risk Indicators
          </h3>
          {risk_indicators && risk_indicators.length > 0 ? (
            <ul className="space-y-2">
              {risk_indicators.map((indicator: string, index: number) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <span className="text-red-500 mt-0.5">•</span>
                  {indicator}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">No risk indicators found</p>
          )}
        </div>
        
        {/* Recommendations */}
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span>💡</span> Recommendations
          </h3>
          {recommendations && recommendations.length > 0 ? (
            <ul className="space-y-2">
              {recommendations.map((rec: string, index: number) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <span className="text-green-500 mt-0.5">✓</span>
                  {rec}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">No specific recommendations</p>
          )}
        </div>
      </div>
      
      {/* File Metadata */}
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <span>📋</span> File Metadata
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Filename</p>
            <p className="font-medium text-gray-900 dark:text-white text-sm truncate">{filename}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">File Type</p>
            <p className="font-medium text-gray-900 dark:text-white text-sm">{metadata?.format || 'Unknown'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">File Size</p>
            <p className="font-medium text-gray-900 dark:text-white text-sm">{file_size_human}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">SHA256 Hash</p>
            <p className="font-medium text-gray-900 dark:text-white text-xs font-mono truncate">
              {file_hash?.substring(0, 16)}...
            </p>
          </div>
        </div>
      </div>
      
      {/* Threat Level Badge */}
      {is_threat && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🚨</span>
            <div>
              <p className="font-medium text-red-900">Threat Detected</p>
              <p className="text-sm text-red-700">
                Threat Type: <span className="font-mono">{threat_level}</span>
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Actions */}
      <div className="flex justify-center gap-4 pt-4">
        <button
          onClick={onScanAnother}
          className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
        >
          📁 Scan Another File
        </button>
        <button
          onClick={() => window.open('/dashboard', '_self')}
          className="px-6 py-3 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
        >
          📊 View Dashboard
        </button>
      </div>
    </div>
  );
};