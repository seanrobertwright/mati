'use client';

import { useState } from 'react';
import { Download, FileText, Calendar, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export type ReportType = 
  | 'document_status'
  | 'overdue_reviews'
  | 'approval_history'
  | 'change_requests'
  | 'audit_log'
  | 'compliance_summary';

export type ReportFormat = 'pdf' | 'csv' | 'xlsx';

export interface ComplianceReportOptions {
  reportType: ReportType;
  format: ReportFormat;
  dateFrom?: string;
  dateTo?: string;
  includeArchived?: boolean;
  categories?: string[];
}

interface ComplianceReportExportProps {
  /** Callback to generate and download the report */
  onExport: (options: ComplianceReportOptions) => void | Promise<void>;
  /** Whether export is currently in progress */
  isExporting?: boolean;
  /** Available document categories for filtering */
  categories?: Array<{ id: string; name: string }>;
  className?: string;
}

const REPORT_TYPES: Array<{ value: ReportType; label: string; description: string }> = [
  {
    value: 'document_status',
    label: 'Document Status Report',
    description: 'Current status of all documents',
  },
  {
    value: 'overdue_reviews',
    label: 'Overdue Reviews Report',
    description: 'Documents past their review date',
  },
  {
    value: 'approval_history',
    label: 'Approval History',
    description: 'Complete approval workflow history',
  },
  {
    value: 'change_requests',
    label: 'Change Requests Report',
    description: 'All change requests and their status',
  },
  {
    value: 'audit_log',
    label: 'Audit Log',
    description: 'Complete audit trail of all actions',
  },
  {
    value: 'compliance_summary',
    label: 'Compliance Summary',
    description: 'ISO 9001/45001 compliance metrics',
  },
];

const FORMAT_OPTIONS: Array<{ value: ReportFormat; label: string; icon: string }> = [
  { value: 'pdf', label: 'PDF Document', icon: '📄' },
  { value: 'csv', label: 'CSV Spreadsheet', icon: '📊' },
  { value: 'xlsx', label: 'Excel Workbook', icon: '📈' },
];

/**
 * ComplianceReportExport
 * 
 * Provides a UI for selecting and exporting compliance reports
 * in various formats with filtering options.
 * 
 * @example
 * ```tsx
 * <ComplianceReportExport
 *   onExport={handleExport}
 *   categories={categories}
 * />
 * ```
 */
export const ComplianceReportExport: React.FC<ComplianceReportExportProps> = ({
  onExport,
  isExporting = false,
  categories = [],
  className,
}) => {
  const [reportType, setReportType] = useState<ReportType>('compliance_summary');
  const [format, setFormat] = useState<ReportFormat>('pdf');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [includeArchived, setIncludeArchived] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const handleExport = async () => {
    const options: ComplianceReportOptions = {
      reportType,
      format,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      includeArchived,
      categories: selectedCategories.length > 0 ? selectedCategories : undefined,
    };

    await onExport(options);
  };

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  return (
    <div className={cn('rounded-lg border bg-card p-6 space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center gap-2">
        <Download className="h-5 w-5 text-muted-foreground" />
        <h3 className="font-semibold">Export Compliance Report</h3>
      </div>

      {/* Report Type Selection */}
      <div className="space-y-3">
        <Label>Report Type</Label>
        <div className="grid gap-2">
          {REPORT_TYPES.map((type) => (
            <label
              key={type.value}
              className={cn(
                'flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors',
                'hover:bg-muted/50',
                reportType === type.value
                  ? 'border-primary bg-primary/5'
                  : 'border-border'
              )}
            >
              <input
                type="radio"
                name="reportType"
                value={type.value}
                checked={reportType === type.value}
                onChange={(e) => setReportType(e.target.value as ReportType)}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="font-medium text-sm">{type.label}</div>
                <div className="text-xs text-muted-foreground">{type.description}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Format Selection */}
      <div className="space-y-3">
        <Label>Export Format</Label>
        <div className="grid grid-cols-3 gap-2">
          {FORMAT_OPTIONS.map((fmt) => (
            <button
              key={fmt.value}
              onClick={() => setFormat(fmt.value)}
              className={cn(
                'rounded-lg border p-3 transition-colors text-center',
                'hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-ring',
                format === fmt.value
                  ? 'border-primary bg-primary/5'
                  : 'border-border'
              )}
            >
              <div className="text-2xl mb-1">{fmt.icon}</div>
              <div className="text-xs font-medium">{fmt.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Date Range */}
      <div className="space-y-3">
        <Label>Date Range (Optional)</Label>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label htmlFor="dateFrom" className="text-xs text-muted-foreground">
              From
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <input
                id="dateFrom"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 pl-9 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="dateTo" className="text-xs text-muted-foreground">
              To
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <input
                id="dateTo"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 pl-9 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Categories Filter */}
      {categories.length > 0 && (
        <div className="space-y-3">
          <Label>Filter by Categories (Optional)</Label>
          <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-1">
            {categories.map((category) => (
              <label
                key={category.id}
                className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted/50 p-2 rounded"
              >
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category.id)}
                  onChange={() => handleCategoryToggle(category.id)}
                />
                <span>{category.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Additional Options */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted/50 p-2 rounded">
          <input
            type="checkbox"
            checked={includeArchived}
            onChange={(e) => setIncludeArchived(e.target.checked)}
          />
          <span>Include archived documents</span>
        </label>
      </div>

      {/* Export Button */}
      <div className="pt-4 border-t">
        <Button
          onClick={handleExport}
          disabled={isExporting}
          className="w-full gap-2"
        >
          {isExporting ? (
            <>
              <div className="h-4 w-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
              Generating Report...
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              Export Report
            </>
          )}
        </Button>
      </div>

      {/* Info */}
      <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
        <AlertCircle className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
        <p className="text-blue-900">
          Reports include data based on your selected filters and current permissions.
          Exported files are suitable for ISO compliance audits.
        </p>
      </div>
    </div>
  );
};

