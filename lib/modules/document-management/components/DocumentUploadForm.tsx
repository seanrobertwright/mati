'use client';

import { useState, useRef } from 'react';
import { Upload, X, FileText, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { DocumentMetadataForm, type DocumentMetadata } from './DocumentMetadataForm';

interface DocumentUploadFormProps {
  directoryId?: string;
  onUploadComplete?: (documentId: string) => void;
  onCancel?: () => void;
  categories?: Array<{ id: string; name: string; defaultReviewFrequencyDays?: number }>;
  maxFileSizeMB?: number;
  allowedFileTypes?: string[];
  className?: string;
}

interface UploadState {
  file: File | null;
  uploading: boolean;
  uploadProgress: number;
  error: string | null;
}

const DEFAULT_MAX_FILE_SIZE_MB = 100;
const DEFAULT_ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'image/png',
  'image/jpeg',
];

/**
 * DocumentUploadForm
 * 
 * Complete form for uploading new documents with file selection and metadata.
 * Handles file validation, upload progress, and metadata collection.
 * 
 * @example
 * ```tsx
 * <DocumentUploadForm
 *   directoryId="dir-123"
 *   categories={categories}
 *   onUploadComplete={(docId) => console.log('Uploaded:', docId)}
 *   onCancel={() => setShowUpload(false)}
 * />
 * ```
 */
export const DocumentUploadForm: React.FC<DocumentUploadFormProps> = ({
  directoryId,
  onUploadComplete,
  onCancel,
  categories = [],
  maxFileSizeMB = DEFAULT_MAX_FILE_SIZE_MB,
  allowedFileTypes = DEFAULT_ALLOWED_TYPES,
  className,
}) => {
  const [uploadState, setUploadState] = useState<UploadState>({
    file: null,
    uploading: false,
    uploadProgress: 0,
    error: null,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const validateFile = (file: File): string | null => {
    // Check file size
    const maxBytes = maxFileSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      return `File size exceeds ${maxFileSizeMB}MB limit`;
    }

    // Check file type
    if (!allowedFileTypes.includes(file.type)) {
      return 'File type not allowed';
    }

    return null;
  };

  const handleFileSelect = (file: File) => {
    const error = validateFile(file);
    if (error) {
      setUploadState({
        file: null,
        uploading: false,
        uploadProgress: 0,
        error,
      });
      return;
    }

    setUploadState({
      file,
      uploading: false,
      uploadProgress: 0,
      error: null,
    });
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      // For now, handle only the first file
      // TODO: Support multiple file uploads in future
      handleFileSelect(files[0]);
    }
  };

  const handleRemoveFile = () => {
    setUploadState({
      file: null,
      uploading: false,
      uploadProgress: 0,
      error: null,
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleMetadataSubmit = async (metadata: DocumentMetadata) => {
    if (!uploadState.file) {
      setUploadState((prev) => ({ ...prev, error: 'Please select a file' }));
      return;
    }

    try {
      setUploadState((prev) => ({ ...prev, uploading: true, error: null }));

      // Create FormData
      const formData = new FormData();
      formData.append('file', uploadState.file);
      formData.append('title', metadata.title);
      if (metadata.description) {
        formData.append('description', metadata.description);
      }
      if (metadata.categoryId) {
        formData.append('categoryId', metadata.categoryId);
      }
      if (metadata.effectiveDate) {
        formData.append('effectiveDate', metadata.effectiveDate);
      }
      if (metadata.reviewFrequencyDays !== undefined) {
        formData.append('reviewFrequencyDays', String(metadata.reviewFrequencyDays));
      }
      if (directoryId) {
        formData.append('directoryId', directoryId);
      }

      // Upload with progress tracking
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          setUploadState((prev) => ({ ...prev, uploadProgress: progress }));
        }
      });

      const uploadPromise = new Promise<string>((resolve, reject) => {
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText);
              resolve(response.documentId);
            } catch (e) {
              reject(new Error('Invalid server response'));
            }
          } else {
            try {
              const response = JSON.parse(xhr.responseText);
              reject(new Error(response.error || 'Upload failed'));
            } catch (e) {
              reject(new Error(`Upload failed with status ${xhr.status}`));
            }
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Network error during upload'));
        });

        xhr.addEventListener('abort', () => {
          reject(new Error('Upload cancelled'));
        });

        xhr.open('POST', '/api/documents/upload');
        xhr.send(formData);
      });

      const documentId = await uploadPromise;
      onUploadComplete?.(documentId);
    } catch (error) {
      console.error('Upload error:', error);
      setUploadState((prev) => ({
        ...prev,
        uploading: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      }));
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* File Upload Area */}
      {!uploadState.file ? (
        <div
          className={cn(
            'relative border-2 border-dashed rounded-lg p-8 transition-colors',
            dragActive
              ? 'border-primary bg-primary/5'
              : 'border-border bg-card hover:border-primary/50'
          )}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileInputChange}
            className="sr-only"
            id="file-upload"
            aria-label="Upload file"
          />
          
          <label
            htmlFor="file-upload"
            className="flex flex-col items-center cursor-pointer"
          >
            <Upload className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm font-medium mb-1">
              Drop file here or click to browse
            </p>
            <p className="text-xs text-muted-foreground">
              Maximum file size: {maxFileSizeMB}MB
            </p>
          </label>
        </div>
      ) : (
        <div className="border rounded-lg p-4 bg-card">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 p-2 rounded-md bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{uploadState.file.name}</p>
              <p className="text-xs text-muted-foreground">
                {formatFileSize(uploadState.file.size)}
              </p>
              
              {uploadState.uploading && (
                <div className="mt-2">
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${uploadState.uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Uploading... {uploadState.uploadProgress}%
                  </p>
                </div>
              )}
            </div>

            {!uploadState.uploading && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRemoveFile}
                aria-label="Remove file"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Error Message */}
      {uploadState.error && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
          <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
          <p className="text-sm text-destructive">{uploadState.error}</p>
        </div>
      )}

      {/* Metadata Form */}
      {uploadState.file && !uploadState.uploading && (
        <div className="border-t pt-6">
          <h3 className="text-sm font-medium mb-4">Document Information</h3>
          <DocumentMetadataForm
            initialData={{ title: uploadState.file.name.replace(/\.[^/.]+$/, '') }}
            categories={categories}
            onSubmit={handleMetadataSubmit}
            onCancel={onCancel}
            isSubmitting={uploadState.uploading}
            submitLabel="Upload Document"
          />
        </div>
      )}

      {/* Simple Cancel Button (when no file selected) */}
      {!uploadState.file && onCancel && (
        <div className="flex justify-end">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
};

