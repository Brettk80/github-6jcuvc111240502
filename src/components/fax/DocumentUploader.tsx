import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileUp, X, MoveUp, MoveDown, File, Eye, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import DocumentOptimizationWarning from './DocumentOptimizationWarning';
import DocumentPreview from './DocumentPreview';
import { analyzePdfDocument } from '../../lib/pdfAnalyzer';
import { createPdfPreview } from '../../lib/pdfPreview';

interface UploadedFile {
  id: string;
  file: File;
  progress: number;
  optimizationIssues?: {
    hasColorContent: boolean;
    hasBackgroundElements: boolean;
    hasLargeImages: boolean;
    pageCount: number;
  };
  previewUrl?: string;
}

interface DocumentUploaderProps {
  onDocumentsUploaded: (files: File[]) => void;
  existingDocuments?: File[];
  onUploadingChange?: (isUploading: boolean) => void;
  onNext: () => void;
  onBack?: () => void;
  onStartOver: () => void;
}

const DocumentUploader: React.FC<DocumentUploaderProps> = ({
  onDocumentsUploaded,
  existingDocuments = [],
  onUploadingChange,
  onNext,
  onBack,
  onStartOver
}) => {
  const [files, setFiles] = useState<UploadedFile[]>(() =>
    existingDocuments.map(file => ({
      id: Math.random().toString(36).substring(7),
      file,
      progress: 100
    }))
  );
  const [previewFile, setPreviewFile] = useState<UploadedFile | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const uploadedFilesRef = useRef<File[]>([]);

  useEffect(() => {
    const processExistingFiles = async () => {
      const updatedFiles = await Promise.all(
        files.map(async (file) => {
          if (file.file.type === 'application/pdf' && !file.previewUrl) {
            try {
              const [optimizationIssues, previewResult] = await Promise.all([
                analyzePdfDocument(file.file),
                createPdfPreview(file.file)
              ]);
              return {
                ...file,
                optimizationIssues,
                previewUrl: previewResult.dataUrl
              };
            } catch (error) {
              console.error('Error processing file:', error);
            }
          }
          return file;
        })
      );
      setFiles(updatedFiles);
    };

    if (files.some(f => f.file.type === 'application/pdf' && !f.previewUrl)) {
      processExistingFiles();
    }
  }, [files]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const duplicates = acceptedFiles.filter(newFile =>
      files.some(existingFile => existingFile.file.name === newFile.name)
    );

    if (duplicates.length > 0) {
      duplicates.forEach(file => {
        toast.error(`File "${file.name}" already exists`);
      });
      return;
    }

    setIsUploading(true);
    onUploadingChange?.(true);

    const processFile = async (file: File): Promise<UploadedFile> => {
      const id = Math.random().toString(36).substring(7);
      let optimizationIssues;
      let previewUrl;

      if (file.type === 'application/pdf') {
        try {
          const [issues, previewResult] = await Promise.all([
            analyzePdfDocument(file),
            createPdfPreview(file)
          ]);
          optimizationIssues = issues;
          previewUrl = previewResult.dataUrl;
        } catch (error) {
          console.error('Error analyzing PDF:', error);
        }
      }

      return {
        id,
        file,
        progress: 0,
        optimizationIssues,
        previewUrl
      };
    };

    const newFiles = await Promise.all(acceptedFiles.map(processFile));
    setFiles(prev => [...prev, ...newFiles]);

    // Simulate upload progress
    newFiles.forEach(uploadFile => {
      let progress = 0;
      const interval = setInterval(() => {
        if (progress >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          onUploadingChange?.(false);
          return;
        }
        progress += 10;
        setFiles(prev =>
          prev.map(f =>
            f.id === uploadFile.id ? { ...f, progress } : f
          )
        );
      }, 200);
    });
  }, [files, onUploadingChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    onDropRejected: (rejectedFiles) => {
      rejectedFiles.forEach(({ file, errors }) => {
        if (errors[0]?.code === 'file-too-large') {
          toast.error(`${file.name} is too large. Max size is 10MB`);
        } else if (errors[0]?.code === 'file-invalid-type') {
          toast.error(`${file.name} is not a supported file type`);
        }
      });
    }
  });

  const removeFile = useCallback((id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  }, []);

  const moveFile = useCallback((id: string, direction: 'up' | 'down') => {
    setFiles(prev => {
      const index = prev.findIndex(f => f.id === id);
      if (
        (direction === 'up' && index === 0) ||
        (direction === 'down' && index === prev.length - 1)
      ) {
        return prev;
      }

      const newFiles = [...prev];
      const offset = direction === 'up' ? -1 : 1;
      [newFiles[index], newFiles[index + offset]] = [newFiles[index + offset], newFiles[index]];
      return newFiles;
    });
  }, []);

  useEffect(() => {
    const currentFiles = files.map(f => f.file);
    if (JSON.stringify(currentFiles) !== JSON.stringify(uploadedFilesRef.current)) {
      uploadedFilesRef.current = currentFiles;
      onDocumentsUploaded(currentFiles);
    }
  }, [files, onDocumentsUploaded]);

  return (
    <div className="space-y-6">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
      >
        <input {...getInputProps()} />
        <FileUp className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600">
          Drag & drop your fax documents here, or click to select files
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Supported formats: PDF, DOC, DOCX (Max 10MB)
        </p>
      </div>

      <div className="space-y-4">
        {files.map((uploadedFile, index) => (
          <React.Fragment key={uploadedFile.id}>
            <motion.div
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="bg-white rounded-lg border p-4 flex items-center gap-4"
            >
              <File className="h-8 w-8 text-blue-500 flex-shrink-0" />
              <div className="flex-grow min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {uploadedFile.file.name}
                </p>
                {uploadedFile.progress < 100 && (
                  <div className="mt-1 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 transition-all duration-500"
                      style={{ width: `${uploadedFile.progress}%` }}
                    />
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {uploadedFile.progress === 100 && uploadedFile.previewUrl && (
                  <button
                    onClick={() => setPreviewFile(uploadedFile)}
                    className="p-1 text-gray-400 hover:text-blue-500"
                    title="Preview document"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={() => moveFile(uploadedFile.id, 'up')}
                  disabled={index === 0}
                  className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                  title="Move up"
                >
                  <MoveUp className="h-4 w-4" />
                </button>
                <button
                  onClick={() => moveFile(uploadedFile.id, 'down')}
                  disabled={index === files.length - 1}
                  className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                  title="Move down"
                >
                  <MoveDown className="h-4 w-4" />
                </button>
                <button
                  onClick={() => removeFile(uploadedFile.id)}
                  className="p-1 text-gray-400 hover:text-red-500"
                  title="Remove document"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
            {uploadedFile.optimizationIssues && (
              <DocumentOptimizationWarning
                fileName={uploadedFile.file.name}
                issues={uploadedFile.optimizationIssues}
                onPreview={() => setPreviewFile(uploadedFile)}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {previewFile && (
        <DocumentPreview
          file={previewFile.file}
          onClose={() => setPreviewFile(null)}
          onDownload={() => {
            // Add download handler
          }}
        />
      )}

      <div className="mt-8 flex items-center justify-between pt-6 border-t border-gray-200">
        <div className="flex items-center space-x-4">
          {onBack && (
            <button
              onClick={onBack}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </button>
          )}

          <button
            onClick={onStartOver}
            className="text-sm text-red-600 hover:text-red-700 font-medium"
          >
            Start Over
          </button>
        </div>

        <motion.button
          onClick={onNext}
          disabled={files.length === 0 || isUploading}
          animate={files.length > 0 && !isUploading ? {
            boxShadow: [
              "0 0 0 0 rgba(59, 130, 246, 0)",
              "0 0 0 8px rgba(59, 130, 246, 0.2)",
              "0 0 0 0 rgba(59, 130, 246, 0)"
            ]
          } : {}}
          transition={{ duration: 2, repeat: Infinity }}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          Continue
        </motion.button>
      </div>
    </div>
  );
};

export default DocumentUploader;