import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// @ts-ignore
import api from '../../api/axios';
import { FileUpload } from './scan/FileUpload';
import { ScanProgress } from './scan/ScanProgress';
import { SecurityReport } from './scan/SecurityReport';
import { ScanHistory } from './scan/ScanHistory';

export default function ManualScan() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/auth');
    } else {
      setUser(JSON.parse(userData));
    }
  }, [navigate]);
  const [activeTab, setActiveTab] = useState<'upload' | 'history'>('upload');
  
  // Scan state
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanResult, setScanResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Handle file upload and scan
  const handleFileScan = useCallback(async (file: File) => {
    setIsScanning(true);
    setScanProgress(0);
    setScanResult(null);
    setError(null);
    
    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setScanProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);
      
      // Upload and scan file
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post('/scan/file', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      clearInterval(progressInterval);
      setScanProgress(100);
      
      // Show result after brief delay
      setTimeout(() => {
        setScanResult(response.data);
        setIsScanning(false);
      }, 500);
      
    } catch (err: any) {
      console.error('Scan error:', err);
      setError(err.response?.data?.detail || 'Failed to scan file');
      setIsScanning(false);
      setScanProgress(0);
    }
  }, []);
  
  // Reset scan
  const handleReset = () => {
    setScanResult(null);
    setError(null);
    setScanProgress(0);
  };
  
  return (
    <div className="max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">📁 Manual File Scan</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Upload files to check for security threats before opening or sharing
        </p>
      </div>
      
      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200 dark:border-slate-700">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('upload')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'upload'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-300 hover:border-gray-300'
              }`}
            >
              📤 Upload & Scan
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'history'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-300 hover:border-gray-300'
              }`}
            >
              📜 Scan History
            </button>
          </nav>
        </div>
      </div>
      
      {/* Content */}
      {activeTab === 'upload' ? (
        <div className="space-y-6">
          {/* Info Banner */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">ℹ️</span>
              <div>
                <h3 className="font-medium text-blue-900">How It Works</h3>
                <ul className="mt-2 text-sm text-blue-800 space-y-1">
                  <li>• Upload any file (PDF, DOC, images, etc.)</li>
                  <li>• Our AI scans for malware, suspicious code, and threats</li>
                  <li>• Get a security score and detailed report</li>
                  <li>• Files are NOT stored - only analyzed and deleted</li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* File Upload */}
          {!scanResult && !isScanning && (
            <FileUpload 
              onFileSelect={handleFileScan}
              error={error}
              onReset={handleReset}
            />
          )}
          
          {/* Scan Progress */}
          {isScanning && (
            <ScanProgress progress={scanProgress} />
          )}
          
          {/* Security Report */}
          {scanResult && (
            <SecurityReport 
              result={scanResult}
              onScanAnother={handleReset}
            />
          )}
          
          {/* Supported File Types */}
          <div className="bg-gray-50 dark:bg-slate-800/50 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Supported File Types</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { ext: '.PDF', icon: '📄', label: 'Documents' },
                { ext: '.DOC/DOCX', icon: '📝', label: 'Word Files' },
                { ext: '.JPG/PNG', icon: '🖼️', label: 'Images' },
                { ext: '.TXT', icon: '📃', label: 'Text Files' },
                { ext: '.ZIP', icon: '📦', label: 'Archives' },
                { ext: '.EXE', icon: '⚠️', label: 'Executables' },
              ].map((type) => (
                <div key={type.ext} className="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 rounded-lg border">
                  <span className="text-2xl">{type.icon}</span>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{type.ext}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{type.label}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              Maximum file size: 10MB
            </p>
          </div>
        </div>
      ) : (
        <ScanHistory />
      )}
    </div>
  );
}