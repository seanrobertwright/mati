'use client';

import { useState, useCallback, useRef } from 'react';
import { Upload, X, AlertCircle, RefreshCw, CheckCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { validateFile } from '../validation';

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

interface FileWithStatus {
  file: File;
  status: UploadStatus;
  progress: number;
  error?: string;
  retryCount: number;
}

interface FileUploadWithRetryProps {
  onUpload: (file: File) => Promise<void>;
  maxRetries?: number;
  maxFileSize?: number;
  allowedTypes?: readonly string[];
  multiple?: boolean;
  className?: string;
  onSuccess?: (file: File) => void;
  onError?: (file: File, error: string) => void;
}

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

export const FileUploadWithRetry: React.FC<FileUploadWithRetryProps> = ({
  onUpload,
  maxRetries = MAX_RETRIES,
  maxFileSize,
  allowedTypes,
  multiple = false,
  className,
  onSuccess,
  onError,
}) => {
  const [files, setFiles] = useState<FileWithStatus[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileValidation = useCallback((file: File): string | null => {
    const validation = validateFile(file, { maxSize: maxFileSize, allowedTypes });
    if (!validation.valid) {
      return validation.error || 'File validation failed';
    }
    return null;
  }, [maxFileSize, allowedTypes]);

  const uploadFile = useCallback(async (
    fileWithStatus: FileWithStatus,
    retryCount: number = 0
  ): Promise<void> => {
    const fileId = files.findIndex(f => f.file === fileWithStatus.file);
    
    // Update status to uploading
    setFiles(prev => prev.map((f, i) => 
      i === fileId ? { ...f, status: 'uploading' as UploadStatus, progress: 0 } : f
    ));

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setFiles(prev => prev.map((f, i) => 
          i === fileId && f.status === 'uploading'
            ? { ...f, progress: Math.min(f.progress + 10, 90) }
            : f
        ));
      }, 200);

      await onUpload(fileWithStatus.file);

      clearInterval(progressInterval);

      // Success
      setFiles(prev => prev.map((f, i) => 
        i === fileId ? { ...f, status: 'success' as UploadStatus, progress: 100 } : f
      ));

      onSuccess?.(fileWithStatus.file);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';

      if (retryCount < maxRetries) {
        // Retry after delay
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * (retryCount + 1)));
        
        setFiles(prev => prev.map((f, i) => 
          i === fileId ? { ...f, retryCount: retryCount + 1 } : f
        ));

        return uploadFile(fileWithStatus, retryCount + 1);
      } else {
        // Max retries reached
        setFiles(prev => prev.map((f, i) => 
          i === fileId 
            ? { ...f, status: 'error' as UploadStatus, error: errorMessage }
            : f
        ));

        onError?.(fileWithStatus.file, errorMessage);
      }
    }
  }, [files, onUpload, maxRetries, onSuccess, onError]);

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const filesArray = Array.from(newFiles);
    
    const validatedFiles: FileWithStatus[] = filesArray.map(file => {
      const error = handleFileValidation(file);
      return {
        file,
        status: error ? ('error' as UploadStatus) : ('idle' as UploadStatus),
        progress: 0,
        error,
        retryCount: 0,
      };
    });

    setFiles(prev => multiple ? [...prev, ...validatedFiles] : validatedFiles);

    // Auto-upload valid files
    validatedFiles.forEach(fileWithStatus => {
      if (!fileWithStatus.error) {
        uploadFile(fileWithStatus);
      }
    });
  }, [handleFileValidation, uploadFile, multiple]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(e.target.files);
    }
  }, [addFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  }, [addFiles]);

  const handleRetry = useCallback((index: number) => {
    const fileWithStatus = files[index];
    if (fileWithStatus) {
      setFiles(prev => prev.map((f, i) => 
        i === index ? { ...f, status: 'idle' as UploadStatus, error: undefined } : f
      ));
      uploadFile(fileWithStatus);
    }
  }, [files, uploadFile]);

  const handleRemove = useCallback((index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleBrowse = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer',
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-primary/50'
        )}
        onClick={handleBrowse}
      >
        <Upload className={cn(
          'mx-auto h-12 w-12 mb-4',
          isDragging ? 'text-primary' : 'text-muted-foreground'
        )} />
        <p className="text-sm font-medium mb-1">
          {isDragging ? 'Drop files here' : 'Drag and drop files here'}
        </p>
        <p className="text-xs text-muted-foreground mb-4">
          or click to browse
        </p>
        <Button type="button" variant="outline" size="sm">
          Browse Files
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple={multiple}
        onChange={handleFileInput}
        className="hidden"
        accept={allowedTypes?.join(',')}
      />

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((fileWithStatus, index) => (
            <div
              key={`${fileWithStatus.file.name}-${index}`}
              className="flex items-center gap-3 p-3 rounded-lg border bg-card"
            >
              {/* Status Icon */}
              <div className="shrink-0">
                {fileWithStatus.status === 'uploading' && (
                  <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                )}
                {fileWithStatus.status === 'success' && (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
                {fileWithStatus.status === 'error' && (
                  <AlertCircle className="h-5 w-5 text-destructive" />
                )}
                {fileWithStatus.status === 'idle' && (
                  <Upload className="h-5 w-5 text-muted-foreground" />
                )}
              </div>

              {/* File Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {fileWithStatus.file.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {(fileWithStatus.file.size / 1024 / 1024).toFixed(2)} MB
                </p>

                {/* Progress Bar */}
                {fileWithStatus.status === 'uploading' && (
                  <div className="mt-2 h-1 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${fileWithStatus.progress}%` }}
                    />
                  </div>
                )}

                {/* Error Message */}
                {fileWithStatus.error && (
                  <p className="text-xs text-destructive mt-1">
                    {fileWithStatus.error}
                    {fileWithStatus.retryCount > 0 && ` (Retry ${fileWithStatus.retryCount}/${maxRetries})`}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-1 shrink-0">
                {fileWithStatus.status === 'error' && fileWithStatus.retryCount < maxRetries && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRetry(index)}
                    className="h-8 w-8 p-0"
                  >
                    <RefreshCw className="h-4 w-4" />
                    <span className="sr-only">Retry upload</span>
                  </Button>
                )}
                {fileWithStatus.status !== 'uploading' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemove(index)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Remove file</span>
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

