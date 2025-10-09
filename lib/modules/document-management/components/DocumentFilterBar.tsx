'use client';

import { useState, useCallback } from 'react';
import { 
  Search, 
  Filter, 
  X, 
  Calendar,
  User,
  Tag,
  FileText,
  Save,
  Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

export type DocumentStatus = 'draft' | 'pending_review' | 'pending_approval' | 'approved' | 'under_review' | 'archived' | 'overdue';
export type DocumentCategory = 'policy' | 'procedure' | 'work_instruction' | 'form' | 'record' | 'other';

export interface DocumentFilters {
  searchQuery: string;
  categories: DocumentCategory[];
  statuses: DocumentStatus[];
  ownerIds: string[];
  dateRange?: {
    from?: Date;
    to?: Date;
    field: 'created' | 'effective' | 'nextReview';
  };
}

export interface FilterPreset {
  id: string;
  name: string;
  filters: DocumentFilters;
}

interface DocumentFilterBarProps {
  filters: DocumentFilters;
  onFiltersChange: (filters: DocumentFilters) => void;
  presets?: FilterPreset[];
  onSavePreset?: (name: string, filters: DocumentFilters) => void;
  onDeletePreset?: (presetId: string) => void;
  onLoadPreset?: (preset: FilterPreset) => void;
  availableOwners?: Array<{ id: string; name: string }>;
  className?: string;
}

const CATEGORY_LABELS: Record<DocumentCategory, string> = {
  policy: 'Policy',
  procedure: 'Procedure',
  work_instruction: 'Work Instruction',
  form: 'Form',
  record: 'Record',
  other: 'Other',
};

const STATUS_LABELS: Record<DocumentStatus, string> = {
  draft: 'Draft',
  pending_review: 'Pending Review',
  pending_approval: 'Pending Approval',
  approved: 'Approved',
  under_review: 'Under Review',
  archived: 'Archived',
  overdue: 'Overdue',
};

export const DocumentFilterBar: React.FC<DocumentFilterBarProps> = ({
  filters,
  onFiltersChange,
  presets = [],
  onSavePreset,
  onDeletePreset,
  onLoadPreset,
  availableOwners = [],
  className,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showSavePreset, setShowSavePreset] = useState(false);
  const [presetName, setPresetName] = useState('');

  const handleSearchChange = useCallback((value: string) => {
    onFiltersChange({ ...filters, searchQuery: value });
  }, [filters, onFiltersChange]);

  const handleCategoryToggle = useCallback((category: DocumentCategory) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter(c => c !== category)
      : [...filters.categories, category];
    onFiltersChange({ ...filters, categories: newCategories });
  }, [filters, onFiltersChange]);

  const handleStatusToggle = useCallback((status: DocumentStatus) => {
    const newStatuses = filters.statuses.includes(status)
      ? filters.statuses.filter(s => s !== status)
      : [...filters.statuses, status];
    onFiltersChange({ ...filters, statuses: newStatuses });
  }, [filters, onFiltersChange]);

  const handleOwnerToggle = useCallback((ownerId: string) => {
    const newOwners = filters.ownerIds.includes(ownerId)
      ? filters.ownerIds.filter(o => o !== ownerId)
      : [...filters.ownerIds, ownerId];
    onFiltersChange({ ...filters, ownerIds: newOwners });
  }, [filters, onFiltersChange]);

  const handleDateRangeChange = useCallback((field: 'created' | 'effective' | 'nextReview', from?: string, to?: string) => {
    onFiltersChange({
      ...filters,
      dateRange: {
        field,
        from: from ? new Date(from) : undefined,
        to: to ? new Date(to) : undefined,
      },
    });
  }, [filters, onFiltersChange]);

  const handleClearFilters = useCallback(() => {
    onFiltersChange({
      searchQuery: '',
      categories: [],
      statuses: [],
      ownerIds: [],
    });
  }, [onFiltersChange]);

  const handleSavePreset = useCallback(() => {
    if (presetName.trim() && onSavePreset) {
      onSavePreset(presetName.trim(), filters);
      setPresetName('');
      setShowSavePreset(false);
    }
  }, [presetName, filters, onSavePreset]);

  const activeFilterCount = 
    filters.categories.length + 
    filters.statuses.length + 
    filters.ownerIds.length +
    (filters.dateRange ? 1 : 0);

  return (
    <div className={cn('space-y-3', className)}>
      {/* Search and Quick Actions */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search documents by title or description..."
            value={filters.searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
          />
          {filters.searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
              onClick={() => handleSearchChange('')}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Clear search</span>
            </Button>
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="gap-2"
        >
          <Filter className="h-4 w-4" />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 min-w-5 px-1">
              {activeFilterCount}
            </Badge>
          )}
        </Button>

        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="gap-2"
          >
            <X className="h-4 w-4" />
            <span>Clear</span>
          </Button>
        )}
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="rounded-lg border bg-card p-4 space-y-4">
          {/* Category Filter */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Category
            </Label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                <Button
                  key={value}
                  variant={filters.categories.includes(value as DocumentCategory) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleCategoryToggle(value as DocumentCategory)}
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Status
            </Label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(STATUS_LABELS).map(([value, label]) => (
                <Button
                  key={value}
                  variant={filters.statuses.includes(value as DocumentStatus) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleStatusToggle(value as DocumentStatus)}
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>

          {/* Owner Filter */}
          {availableOwners.length > 0 && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Owner
              </Label>
              <div className="flex flex-wrap gap-2">
                {availableOwners.map((owner) => (
                  <Button
                    key={owner.id}
                    variant={filters.ownerIds.includes(owner.id) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleOwnerToggle(owner.id)}
                  >
                    {owner.name}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Date Range Filter */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Date Range
            </Label>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <select
                  value={filters.dateRange?.field || 'created'}
                  onChange={(e) => handleDateRangeChange(
                    e.target.value as 'created' | 'effective' | 'nextReview',
                    filters.dateRange?.from?.toISOString().split('T')[0],
                    filters.dateRange?.to?.toISOString().split('T')[0]
                  )}
                  className={cn(
                    'flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm',
                    'ring-offset-background focus-visible:outline-none focus-visible:ring-2',
                    'focus-visible:ring-ring focus-visible:ring-offset-2'
                  )}
                >
                  <option value="created">Created Date</option>
                  <option value="effective">Effective Date</option>
                  <option value="nextReview">Next Review Date</option>
                </select>
              </div>
              <div className="space-y-2 sm:col-span-2 grid gap-2 sm:grid-cols-2">
                <Input
                  type="date"
                  value={filters.dateRange?.from?.toISOString().split('T')[0] || ''}
                  onChange={(e) => handleDateRangeChange(
                    filters.dateRange?.field || 'created',
                    e.target.value,
                    filters.dateRange?.to?.toISOString().split('T')[0]
                  )}
                  placeholder="From"
                />
                <Input
                  type="date"
                  value={filters.dateRange?.to?.toISOString().split('T')[0] || ''}
                  onChange={(e) => handleDateRangeChange(
                    filters.dateRange?.field || 'created',
                    filters.dateRange?.from?.toISOString().split('T')[0],
                    e.target.value
                  )}
                  placeholder="To"
                />
              </div>
            </div>
          </div>

          {/* Presets */}
          {(presets.length > 0 || onSavePreset) && (
            <div className="pt-2 border-t space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Saved Filters</Label>
                {onSavePreset && activeFilterCount > 0 && (
                  <Dialog open={showSavePreset} onOpenChange={setShowSavePreset}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="gap-2">
                        <Save className="h-4 w-4" />
                        Save Current
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Save Filter Preset</DialogTitle>
                        <DialogDescription>
                          Give your filter preset a name to save it for later use.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="preset-name">Preset Name</Label>
                          <Input
                            id="preset-name"
                            value={presetName}
                            onChange={(e) => setPresetName(e.target.value)}
                            placeholder="e.g., Overdue Policies"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowSavePreset(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleSavePreset} disabled={!presetName.trim()}>
                          Save Preset
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
              {presets.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {presets.map((preset) => (
                    <div key={preset.id} className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onLoadPreset?.(preset)}
                        className="gap-2"
                      >
                        <Filter className="h-3 w-3" />
                        {preset.name}
                      </Button>
                      {onDeletePreset && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeletePreset(preset.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Trash2 className="h-3 w-3" />
                          <span className="sr-only">Delete preset</span>
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Active Filters Summary */}
      {activeFilterCount > 0 && !showAdvanced && (
        <div className="flex flex-wrap gap-2">
          {filters.categories.map((category) => (
            <Badge key={category} variant="secondary" className="gap-1">
              {CATEGORY_LABELS[category]}
              <button
                onClick={() => handleCategoryToggle(category)}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {filters.statuses.map((status) => (
            <Badge key={status} variant="secondary" className="gap-1">
              {STATUS_LABELS[status]}
              <button
                onClick={() => handleStatusToggle(status)}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {filters.ownerIds.map((ownerId) => {
            const owner = availableOwners.find(o => o.id === ownerId);
            return owner ? (
              <Badge key={ownerId} variant="secondary" className="gap-1">
                {owner.name}
                <button
                  onClick={() => handleOwnerToggle(ownerId)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ) : null;
          })}
          {filters.dateRange && (
            <Badge variant="secondary" className="gap-1">
              {filters.dateRange.from?.toLocaleDateString()} - {filters.dateRange.to?.toLocaleDateString()}
              <button
                onClick={() => onFiltersChange({ ...filters, dateRange: undefined })}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

