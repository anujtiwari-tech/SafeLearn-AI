import { useState, useRef } from 'react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  error: string | null;
  onReset: () => void;
}

export const FileUpload = ({ onFileSelect, error, onReset }: FileUploadProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };
  
  const handleFile = (file: File) => {
    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size exceeds 10MB limit');
      return;
    }
    
    setSelectedFile(file);
  };
  
  const handleScan = () => {
    if (selectedFile) {
      onFileSelect(selectedFile);
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
          dragActive
            ? 'border-indigo-500 bg-indigo-50'
            : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={handleChange}
          accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.zip,.exe"
        />
        
        <div className="space-y-4">
          <div className="text-6xl">📁</div>
          <div>
            <p className="text-lg font-medium text-gray-900">
              {selectedFile ? selectedFile.name : 'Drop your file here'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              or click to browse (max 10MB)
            </p>
          </div>
          
          {selectedFile && (
            <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
              <span>📄 {selectedFile.name}</span>
              <span>📏 {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedFile(null);
                  if (inputRef.current) inputRef.current.value = '';
                }}
                className="text-red-600 hover:text-red-700 font-medium"
              >
                ✕ Remove
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          ⚠️ {error}
        </div>
      )}
      
      {/* Scan Button */}
      {selectedFile && (
        <div className="flex justify-center gap-4">
          <button
            onClick={handleScan}
            className="px-8 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
          >
            🔍 Scan File
          </button>
          <button
            onClick={onReset}
            className="px-8 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};