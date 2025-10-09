'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { FileText, Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ChangeRequestStatusBadge, ChangeRequestPriorityBadge } from './ChangeRequestStatusBadge';

export interface ChangeRequest {
  id: string;
  documentId: string;
  documentTitle?: string;
  title: string;
  description: string;
  requestedBy: string;
  requestedByName?: string;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'implemented';
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdAt: Date | string;
  updatedAt: Date | string;
  commentCount?: number;
}

interface ChangeRequestListProps {
  /** Array of change requests to display */
  changeRequests: ChangeRequest[];
  /** Callback when a change request is clicked */
  onSelectChangeRequest?: (changeRequestId: string) => void;
  /** Whether the list is currently loading */
  isLoading?: boolean;
  /** Show filter controls */
  showFilters?: boolean;
  /** Show search bar */
  showSearch?: boolean;
  /** Empty state message */
  emptyMessage?: string;
  className?: string;
}

type StatusFilter = 'all' | 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'implemented';
type PriorityFilter = 'all' | 'low' | 'medium' | 'high' | 'critical';

/**
 * ChangeRequestList
 * 
 * Displays a filterable list of change requests with status, priority, and metadata.
 * Supports search, filtering, and click-to-view details.
 * 
 * @example
 * ```tsx
 * <ChangeRequestList
 *   changeRequests={requests}
 *   onSelectChangeRequest={handleSelect}
 *   showFilters
 *   showSearch
 * />
 * ```
 */
export const ChangeRequestList: React.FC<ChangeRequestListProps> = ({
  changeRequests,
  onSelectChangeRequest,
  isLoading = false,
  showFilters = false,
  showSearch = false,
  emptyMessage = 'No change requests found',
  className,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all');

  // Apply filters
  const filteredRequests = changeRequests.filter((request) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        request.title.toLowerCase().includes(query) ||
        request.description.toLowerCase().includes(query) ||
        request.documentTitle?.toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }

    // Status filter
    if (statusFilter !== 'all' && request.status !== statusFilter) {
      return false;
    }

    // Priority filter
    if (priorityFilter !== 'all' && request.priority !== priorityFilter) {
      return false;
    }

    return true;
  });

  const formatTimestamp = (date: Date | string): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    try {
      return formatDistanceToNow(dateObj, { addSuffix: true });
    } catch {
      return 'recently';
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Search and Filters */}
      {(showSearch || showFilters) && (
        <div className="space-y-3">
          {/* Search Bar */}
          {showSearch && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search change requests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          )}

          {/* Filter Controls */}
          {showFilters && (
            <div className="flex flex-wrap gap-2 items-center">
              <Filter className="h-4 w-4 text-muted-foreground" />
              
              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="submitted">Submitted</option>
                <option value="under_review">Under Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="implemented">Implemented</option>
              </select>

              {/* Priority Filter */}
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value as PriorityFilter)}
                className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm"
              >
                <option value="all">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>

              {/* Clear Filters */}
              {(statusFilter !== 'all' || priorityFilter !== 'all' || searchQuery) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setStatusFilter('all');
                    setPriorityFilter('all');
                    setSearchQuery('');
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Results Count */}
      {showFilters && (
        <div className="text-sm text-muted-foreground">
          Showing {filteredRequests.length} of {changeRequests.length} change requests
        </div>
      )}

      {/* Change Requests List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          Loading change requests...
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <FileText className="h-12 w-12 mb-3 opacity-20" />
          <p className="font-medium">{emptyMessage}</p>
          {(searchQuery || statusFilter !== 'all' || priorityFilter !== 'all') && (
            <p className="text-sm">Try adjusting your filters</p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredRequests.map((request) => (
            <button
              key={request.id}
              onClick={() => onSelectChangeRequest?.(request.id)}
              className={cn(
                'w-full text-left rounded-lg border p-4 transition-colors',
                'hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-ring',
                'space-y-2'
              )}
            >
              {/* Header Row */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 space-y-1">
                  <h3 className="font-semibold line-clamp-1">{request.title}</h3>
                  {request.documentTitle && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      {request.documentTitle}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <ChangeRequestStatusBadge status={request.status} className="text-xs" />
                  <ChangeRequestPriorityBadge priority={request.priority} className="text-xs" />
                </div>
              </div>

              {/* Description Preview */}
              <p className="text-sm text-muted-foreground line-clamp-2">
                {request.description}
              </p>

              {/* Footer Row */}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  Requested by {request.requestedByName || 'Unknown'} • {formatTimestamp(request.createdAt)}
                </span>
                {request.commentCount !== undefined && request.commentCount > 0 && (
                  <span className="flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    {request.commentCount} {request.commentCount === 1 ? 'comment' : 'comments'}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

