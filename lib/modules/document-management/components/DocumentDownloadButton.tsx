'use client';

import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DocumentDownloadButtonProps {
  documentId: string;
  versionId?: string;
  fileName: string;
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  showLabel?: boolean;
  onDownloadStart?: () => void;
  onDownloadComplete?: () => void;
  onDownloadError?: (error: Error) => void;
}

/**
 * DocumentDownloadButton
 * 
 * Provides a secure download button for documents with permission checks.
 * Handles file streaming from the server and logs downloads in audit trail.
 * 
 * @example
 * ```tsx
 * <DocumentDownloadButton
 *   documentId="doc-123"
 *   fileName="safety-policy.pdf"
 *   showLabel
 * />
 * 
 * <DocumentDownloadButton
 *   documentId="doc-123"
 *   versionId="v-456"
 *   fileName="safety-policy-v2.pdf"
 *   size="sm"
 *   variant="outline"
 * />
 * ```
 */
export const DocumentDownloadButton: React.FC<DocumentDownloadButtonProps> = ({
  documentId,
  versionId,
  fileName,
  variant = 'outline',
  size = 'default',
  className,
  showLabel = true,
  onDownloadStart,
  onDownloadComplete,
  onDownloadError,
}) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      onDownloadStart?.();

      // Construct download URL
      const url = versionId
        ? `/api/documents/${documentId}/versions/${versionId}/download`
        : `/api/documents/${documentId}/download`;

      // Fetch the file
      const response = await fetch(url);

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('You do not have permission to download this document');
        } else if (response.status === 404) {
          throw new Error('Document not found');
        } else {
          throw new Error('Failed to download document');
        }
      }

      // Get the blob
      const blob = await response.blob();

      // Create download link
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      onDownloadComplete?.();
    } catch (error) {
      console.error('Download error:', error);
      onDownloadError?.(
        error instanceof Error ? error : new Error('Unknown download error')
      );
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={cn(className)}
      onClick={handleDownload}
      disabled={isDownloading}
      aria-label={`Download ${fileName}`}
    >
      {isDownloading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}
      {showLabel && (
        <span className={cn(size === 'icon' && 'sr-only')}>
          {isDownloading ? 'Downloading...' : 'Download'}
        </span>
      )}
    </Button>
  );
};

