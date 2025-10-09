'use client';

import { useState, useEffect } from 'react';
import { FileText, Download, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { DocumentDownloadButton } from './DocumentDownloadButton';

interface DocumentViewerProps {
  documentId: string;
  versionId?: string;
  fileName: string;
  mimeType: string;
  fileSize?: number;
  autoLoad?: boolean;
  className?: string;
}

const PREVIEWABLE_TYPES = {
  pdf: ['application/pdf'],
  image: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'],
  text: ['text/plain', 'text/html', 'text/css', 'text/javascript'],
  // Future: add more types as needed
};

/**
 * DocumentViewer
 * 
 * Displays in-browser previews for supported file types (PDF, images, text).
 * Falls back to download button for unsupported types.
 * 
 * @example
 * ```tsx
 * <DocumentViewer
 *   documentId="doc-123"
 *   fileName="safety-policy.pdf"
 *   mimeType="application/pdf"
 *   autoLoad
 * />
 * ```
 */
export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  documentId,
  versionId,
  fileName,
  mimeType,
  fileSize,
  autoLoad = false,
  className,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(autoLoad);

  const getViewerType = (): 'pdf' | 'image' | 'text' | 'unsupported' => {
    if (PREVIEWABLE_TYPES.pdf.includes(mimeType)) return 'pdf';
    if (PREVIEWABLE_TYPES.image.includes(mimeType)) return 'image';
    if (PREVIEWABLE_TYPES.text.includes(mimeType)) return 'text';
    return 'unsupported';
  };

  const viewerType = getViewerType();
  const isPreviewable = viewerType !== 'unsupported';

  useEffect(() => {
    if (showPreview && isPreviewable && !previewUrl) {
      loadPreview();
    }

    // Cleanup blob URL on unmount
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [showPreview, isPreviewable]);

  const loadPreview = async () => {
    try {
      setLoading(true);
      setError(null);

      const url = versionId
        ? `/api/documents/${documentId}/versions/${versionId}/download`
        : `/api/documents/${documentId}/download`;

      const response = await fetch(url);

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('You do not have permission to view this document');
        } else if (response.status === 404) {
          throw new Error('Document not found');
        } else {
          throw new Error('Failed to load preview');
        }
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      setPreviewUrl(objectUrl);
    } catch (err) {
      console.error('Preview error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load preview');
    } finally {
      setLoading(false);
    }
  };

  const handleShowPreview = () => {
    setShowPreview(true);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className={cn('border rounded-lg bg-card overflow-hidden', className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-muted/50">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex-shrink-0">
            <FileText className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{fileName}</p>
            {fileSize && (
              <p className="text-xs text-muted-foreground">
                {formatFileSize(fileSize)}
              </p>
            )}
          </div>
        </div>

        <DocumentDownloadButton
          documentId={documentId}
          versionId={versionId}
          fileName={fileName}
          size="sm"
          variant="outline"
        />
      </div>

      {/* Content */}
      <div className="p-4">
        {error && (
          <div className="flex items-start gap-2 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-destructive">
                Preview Error
              </p>
              <p className="text-sm text-destructive/80 mt-1">{error}</p>
            </div>
          </div>
        )}

        {!showPreview && isPreviewable && !error && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm text-muted-foreground mb-4">
              Preview available for this document
            </p>
            <Button onClick={handleShowPreview}>Load Preview</Button>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {showPreview && previewUrl && !loading && !error && (
          <>
            {viewerType === 'pdf' && (
              <div className="w-full h-[600px]">
                <iframe
                  src={previewUrl}
                  className="w-full h-full border-0 rounded"
                  title={`PDF viewer: ${fileName}`}
                />
              </div>
            )}

            {viewerType === 'image' && (
              <div className="flex justify-center">
                <img
                  src={previewUrl}
                  alt={fileName}
                  className="max-w-full h-auto rounded"
                />
              </div>
            )}

            {viewerType === 'text' && (
              <div className="w-full max-h-[600px] overflow-auto">
                <iframe
                  src={previewUrl}
                  className="w-full min-h-[400px] border-0 rounded bg-white"
                  title={`Text viewer: ${fileName}`}
                />
              </div>
            )}
          </>
        )}

        {!isPreviewable && !error && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm text-muted-foreground mb-2">
              Preview not available for this file type
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              {mimeType}
            </p>
            <DocumentDownloadButton
              documentId={documentId}
              versionId={versionId}
              fileName={fileName}
            />
          </div>
        )}
      </div>
    </div>
  );
};

