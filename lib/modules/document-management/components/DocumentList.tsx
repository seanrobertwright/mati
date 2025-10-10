'use client';

import { useState, useMemo, useCallback } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { Document } from '@/lib/db/repositories/documents';
import { DocumentListItem } from './DocumentListItem';
import { Pagination } from './Pagination';

type SortField = 'title' | 'createdAt' | 'updatedAt' | 'status' | 'nextReviewDate';
type SortOrder = 'asc' | 'desc';

interface DocumentListProps {
  documents: Document[];
  onDocumentClick: (document: Document) => void;
  selectedDocumentId?: string;
  showCategory?: boolean;
  showOwner?: boolean;
  showStatus?: boolean;
  showReviewDate?: boolean;
  className?: string;
}

interface SortButtonProps {
  field: SortField;
  label: string;
  currentField: SortField;
  currentOrder: SortOrder;
  onSort: (field: SortField) => void;
}

const SortButton: React.FC<SortButtonProps> = ({
  field,
  label,
  currentField,
  currentOrder,
  onSort,
}) => {
  const isActive = currentField === field;

  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 gap-1"
      onClick={() => onSort(field)}
      aria-label={`Sort by ${label}${isActive ? `, currently ${currentOrder === 'asc' ? 'ascending' : 'descending'}` : ''}`}
      aria-pressed={isActive}
    >
      <span>{label}</span>
      {isActive ? (
        currentOrder === 'asc' ? (
          <ArrowUp className="h-3 w-3" aria-hidden="true" />
        ) : (
          <ArrowDown className="h-3 w-3" aria-hidden="true" />
        )
      ) : (
        <ArrowUpDown className="h-3 w-3 opacity-50" aria-hidden="true" />
      )}
    </Button>
  );
};

export const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  onDocumentClick,
  selectedDocumentId,
  showCategory = true,
  showOwner = true,
  showStatus = true,
  showReviewDate = true,
  className,
}) => {
  const [sortField, setSortField] = useState<SortField>('updatedAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const handleSort = useCallback((field: SortField) => {
    setSortField((currentField) => {
      if (currentField === field) {
        setSortOrder((currentOrder) => (currentOrder === 'asc' ? 'desc' : 'asc'));
        return currentField;
      }
      setSortOrder('asc');
      return field;
    });
  }, []);

  const { filteredAndSortedDocuments, paginatedDocuments, totalPages } = useMemo(() => {
    let filtered = documents;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (doc) =>
          doc.title.toLowerCase().includes(query) ||
          doc.description?.toLowerCase().includes(query)
      );
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'createdAt':
          aValue = a.createdAt.getTime();
          bValue = b.createdAt.getTime();
          break;
        case 'updatedAt':
          aValue = a.updatedAt.getTime();
          bValue = b.updatedAt.getTime();
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'nextReviewDate':
          aValue = a.nextReviewDate?.getTime() ?? 0;
          bValue = b.nextReviewDate?.getTime() ?? 0;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    // Paginate
    const totalPages = Math.ceil(sorted.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginated = sorted.slice(startIndex, endIndex);

    return {
      filteredAndSortedDocuments: sorted,
      paginatedDocuments: paginated,
      totalPages,
    };
  }, [documents, searchQuery, sortField, sortOrder, currentPage, pageSize]);

  // Reset to page 1 when search or sort changes
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  }, []);

  if (documents.length === 0) {
    return (
      <div className={cn('flex items-center justify-center py-12', className)}>
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            No documents in this directory
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Search and Sort Controls */}
      <div className="flex items-center gap-2 flex-wrap">
        <input
          type="search"
          placeholder="Search documents..."
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          aria-label="Search documents by title or description"
          className={cn(
            'flex-1 min-w-[200px] px-3 py-2 text-sm rounded-md border border-input',
            'bg-background ring-offset-background',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            'placeholder:text-muted-foreground'
          )}
        />

        <div className="flex items-center gap-1">
          <span className="text-sm text-muted-foreground mr-2">Sort by:</span>
          <SortButton
            field="title"
            label="Name"
            currentField={sortField}
            currentOrder={sortOrder}
            onSort={handleSort}
          />
          <SortButton
            field="updatedAt"
            label="Modified"
            currentField={sortField}
            currentOrder={sortOrder}
            onSort={handleSort}
          />
          {showStatus && (
            <SortButton
              field="status"
              label="Status"
              currentField={sortField}
              currentOrder={sortOrder}
              onSort={handleSort}
            />
          )}
          {showReviewDate && (
            <SortButton
              field="nextReviewDate"
              label="Review Date"
              currentField={sortField}
              currentOrder={sortOrder}
              onSort={handleSort}
            />
          )}
        </div>
      </div>

      {/* Document List */}
      {filteredAndSortedDocuments.length === 0 ? (
        <div className="flex items-center justify-center py-12" role="status" aria-live="polite">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              No documents match your search
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="space-y-1" role="list" aria-label="Document list">
            {paginatedDocuments.map((document) => (
              <DocumentListItem
                key={document.id}
                document={document}
                onClick={() => onDocumentClick(document)}
                isSelected={selectedDocumentId === document.id}
                showCategory={showCategory}
                showOwner={showOwner}
                showStatus={showStatus}
                showReviewDate={showReviewDate}
              />
            ))}
          </div>

          {/* Pagination */}
          {filteredAndSortedDocuments.length > pageSize && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              totalItems={filteredAndSortedDocuments.length}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
            />
          )}
        </>
      )}
    </div>
  );
};

