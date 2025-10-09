'use client';

import { useState } from 'react';
import { Clock, Download, RotateCcw, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { DocumentDownloadButton } from './DocumentDownloadButton';

export interface DocumentVersion {
  id: string;
  versionNumber: number;
  fileName: string;
  fileSize: number;
  fileHash: string;
  uploadedBy: string; // User ID
  uploadedByName?: string; // User display name
  notes?: string;
  createdAt: Date | string;
  isCurrent?: boolean;
}

interface DocumentVersionHistoryProps {
  documentId: string;
  versions: DocumentVersion[];
  currentVersionId?: string;
  canRevert?: boolean;
  onRevert?: (versionId: string) => void | Promise<void>;
  onCompare?: (versionId1: string, versionId2: string) => void;
  className?: string;
}

/**
 * DocumentVersionHistory
 * 
 * Displays complete version history for a document with download and revert capabilities.
 * Shows version metadata, uploader info, and allows comparing versions.
 * 
 * @example
 * ```tsx
 * <DocumentVersionHistory
 *   documentId="doc-123"
 *   versions={versions}
 *   currentVersionId="v-456"
 *   canRevert={true}
 *   onRevert={handleRevert}
 * />
 * ```
 */
export const DocumentVersionHistory: React.FC<DocumentVersionHistoryProps> = ({
  documentId,
  versions,
  currentVersionId,
  canRevert = false,
  onRevert,
  onCompare,
  className,
}) => {
  const [reverting, setReverting] = useState<string | null>(null);
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);

  const handleRevert = async (versionId: string) => {
    if (!onRevert) return;

    try {
      setReverting(versionId);
      await onRevert(versionId);
    } finally {
      setReverting(null);
    }
  };

  const handleCompareSelect = (versionId: string) => {
    setSelectedForCompare((prev) => {
      if (prev.includes(versionId)) {
        return prev.filter((id) => id !== versionId);
      }
      if (prev.length >= 2) {
        return [prev[1], versionId];
      }
      return [...prev, versionId];
    });
  };

  const handleCompare = () => {
    if (selectedForCompare.length === 2 && onCompare) {
      onCompare(selectedForCompare[0], selectedForCompare[1]);
      setSelectedForCompare([]);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Sort versions by version number descending (newest first)
  const sortedVersions = [...versions].sort(
    (a, b) => b.versionNumber - a.versionNumber
  );

  return (
    <div className={cn('space-y-4', className)}>
      {/* Compare Actions */}
      {onCompare && selectedForCompare.length > 0 && (
        <div className="flex items-center justify-between p-3 bg-primary/5 border border-primary/20 rounded-lg">
          <p className="text-sm">
            {selectedForCompare.length === 1
              ? 'Select another version to compare'
              : 'Two versions selected'}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedForCompare([])}
            >
              Clear
            </Button>
            {selectedForCompare.length === 2 && (
              <Button size="sm" onClick={handleCompare}>
                Compare
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Version List */}
      <div className="space-y-2">
        {sortedVersions.map((version, index) => {
          const isCurrent = version.id === currentVersionId || version.isCurrent;
          const isSelected = selectedForCompare.includes(version.id);

          return (
            <div
              key={version.id}
              className={cn(
                'border rounded-lg p-4 transition-colors',
                isCurrent && 'border-primary bg-primary/5',
                isSelected && 'ring-2 ring-primary',
                !isCurrent && !isSelected && 'bg-card'
              )}
            >
              <div className="flex items-start justify-between gap-4">
                {/* Version Info */}
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-medium">
                      Version {version.versionNumber}
                    </h4>
                    {isCurrent && (
                      <Badge variant="default" className="text-xs">
                        Current
                      </Badge>
                    )}
                    {index === 0 && !isCurrent && (
                      <Badge variant="secondary" className="text-xs">
                        Latest
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span>
                        {version.uploadedByName || `User ${version.uploadedBy}`}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{formatDate(version.createdAt)}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <Download className="h-3 w-3" />
                      <span>
                        {version.fileName} ({formatFileSize(version.fileSize)})
                      </span>
                    </div>
                  </div>

                  {version.notes && (
                    <p className="text-xs text-muted-foreground italic border-l-2 border-muted pl-2">
                      {version.notes}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <DocumentDownloadButton
                    documentId={documentId}
                    versionId={version.id}
                    fileName={version.fileName}
                    size="sm"
                    variant="outline"
                    showLabel={false}
                  />

                  {canRevert && !isCurrent && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRevert(version.id)}
                      disabled={reverting === version.id}
                      aria-label={`Revert to version ${version.versionNumber}`}
                    >
                      {reverting === version.id ? (
                        'Reverting...'
                      ) : (
                        <>
                          <RotateCcw className="h-4 w-4" />
                          <span className="sr-only">Revert</span>
                        </>
                      )}
                    </Button>
                  )}

                  {onCompare && (
                    <Button
                      variant={isSelected ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleCompareSelect(version.id)}
                      disabled={
                        selectedForCompare.length === 2 &&
                        !selectedForCompare.includes(version.id)
                      }
                    >
                      {isSelected ? 'Selected' : 'Compare'}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {sortedVersions.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">No version history available</p>
          </div>
        )}
      </div>
    </div>
  );
};

