'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { FileText, Search, Filter, Download, Calendar, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface AuditLogEntry {
  id: string;
  documentId: string;
  documentTitle: string;
  userId: string;
  userName?: string;
  action: string;
  details?: string;
  timestamp: Date | string;
  ipAddress?: string;
  metadata?: Record<string, unknown>;
}

interface DocumentAuditLogViewerProps {
  /** Array of audit log entries */
  auditLogs: AuditLogEntry[];
  /** Callback when export is clicked */
  onExport?: () => void;
  /** Whether the data is currently loading */
  isLoading?: boolean;
  /** Show filter controls */
  showFilters?: boolean;
  className?: string;
}

type ActionFilter = 'all' | 'created' | 'updated' | 'approved' | 'deleted' | 'viewed';

/**
 * DocumentAuditLogViewer
 * 
 * Displays a filterable audit log of all document-related actions
 * for compliance and security tracking.
 * 
 * @example
 * ```tsx
 * <DocumentAuditLogViewer
 *   auditLogs={logs}
 *   onExport={handleExport}
 *   showFilters
 * />
 * ```
 */
export const DocumentAuditLogViewer: React.FC<DocumentAuditLogViewerProps> = ({
  auditLogs,
  onExport,
  isLoading = false,
  showFilters = true,
  className,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<ActionFilter>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [userFilter, setUserFilter] = useState('');

  // Apply filters
  const filteredLogs = auditLogs.filter((log) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        log.documentTitle.toLowerCase().includes(query) ||
        log.action.toLowerCase().includes(query) ||
        log.userName?.toLowerCase().includes(query) ||
        log.details?.toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }

    // Action filter
    if (actionFilter !== 'all') {
      if (!log.action.toLowerCase().includes(actionFilter)) {
        return false;
      }
    }

    // User filter
    if (userFilter) {
      const matchesUser = log.userName?.toLowerCase().includes(userFilter.toLowerCase());
      if (!matchesUser) return false;
    }

    // Date range filter
    if (dateFrom) {
      const logDate = typeof log.timestamp === 'string' ? new Date(log.timestamp) : log.timestamp;
      if (logDate < new Date(dateFrom)) return false;
    }
    if (dateTo) {
      const logDate = typeof log.timestamp === 'string' ? new Date(log.timestamp) : log.timestamp;
      const endDate = new Date(dateTo);
      endDate.setHours(23, 59, 59, 999);
      if (logDate > endDate) return false;
    }

    return true;
  });

  const formatTimestamp = (date: Date | string): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    try {
      return format(dateObj, 'PPpp');
    } catch {
      return 'Unknown time';
    }
  };

  const getActionColor = (action: string): string => {
    const actionLower = action.toLowerCase();
    if (actionLower.includes('created') || actionLower.includes('uploaded')) {
      return 'text-blue-700 bg-blue-50';
    }
    if (actionLower.includes('approved')) {
      return 'text-green-700 bg-green-50';
    }
    if (actionLower.includes('deleted') || actionLower.includes('rejected')) {
      return 'text-red-700 bg-red-50';
    }
    if (actionLower.includes('updated') || actionLower.includes('modified')) {
      return 'text-orange-700 bg-orange-50';
    }
    return 'text-gray-700 bg-gray-50';
  };

  if (isLoading) {
    return (
      <div className={cn('rounded-lg border bg-card p-6', className)}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-32 bg-muted rounded" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-muted rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('rounded-lg border bg-card p-6 space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-semibold">Audit Log</h3>
          {filteredLogs.length > 0 && (
            <span className="text-sm text-muted-foreground">
              ({filteredLogs.length} {filteredLogs.length === 1 ? 'entry' : 'entries'})
            </span>
          )}
        </div>
        {onExport && filteredLogs.length > 0 && (
          <Button variant="outline" size="sm" onClick={onExport} className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        )}
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Filter Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            {/* Action Filter */}
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value as ActionFilter)}
              className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
            >
              <option value="all">All Actions</option>
              <option value="created">Created</option>
              <option value="updated">Updated</option>
              <option value="approved">Approved</option>
              <option value="deleted">Deleted</option>
              <option value="viewed">Viewed</option>
            </select>

            {/* User Filter */}
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Filter by user..."
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Date From */}
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              placeholder="From date"
            />

            {/* Date To */}
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              placeholder="To date"
            />
          </div>

          {/* Clear Filters */}
          {(searchQuery || actionFilter !== 'all' || userFilter || dateFrom || dateTo) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setActionFilter('all');
                setUserFilter('');
                setDateFrom('');
                setDateTo('');
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>
      )}

      {/* Audit Log Entries */}
      {filteredLogs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <FileText className="h-12 w-12 mb-2 opacity-20" />
          <p className="font-medium">No audit logs found</p>
          {(searchQuery || actionFilter !== 'all' || userFilter || dateFrom || dateTo) && (
            <p className="text-sm">Try adjusting your filters</p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredLogs.map((log) => (
            <div
              key={log.id}
              className="rounded-lg border p-4 hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                {/* Main Info */}
                <div className="flex-1 space-y-2">
                  {/* Action */}
                  <div className="flex items-center gap-2">
                    <span className={cn('px-2 py-1 rounded text-xs font-medium', getActionColor(log.action))}>
                      {log.action}
                    </span>
                  </div>

                  {/* Document */}
                  <div className="text-sm">
                    <span className="text-muted-foreground">Document: </span>
                    <span className="font-medium">{log.documentTitle}</span>
                  </div>

                  {/* Details */}
                  {log.details && (
                    <div className="text-sm text-muted-foreground">
                      {log.details}
                    </div>
                  )}

                  {/* Meta Info */}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {log.userName || 'Unknown User'}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatTimestamp(log.timestamp)}
                    </span>
                    {log.ipAddress && (
                      <>
                        <span>•</span>
                        <span>IP: {log.ipAddress}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

