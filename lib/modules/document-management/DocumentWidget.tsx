'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FileText, ChevronRight, AlertTriangle, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { WidgetProps } from '@/lib/safety-framework';

interface DocumentStats {
  totalDocuments: number;
  pendingApproval: number;
  overdueReviews: number;
  recentActivity: number;
}

/**
 * DocumentWidget
 * 
 * Dashboard widget for the Document Management module.
 * Displays key metrics and quick access to the module.
 */
const DocumentWidget: React.FC<WidgetProps> = ({ moduleId }) => {
  const [stats, setStats] = useState<DocumentStats>({
    totalDocuments: 0,
    pendingApproval: 0,
    overdueReviews: 0,
    recentActivity: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch actual stats from API
    // For now, using placeholder data
    const loadStats = async () => {
      try {
        // Simulated API call
        await new Promise(resolve => setTimeout(resolve, 500));
        setStats({
          totalDocuments: 0,
          pendingApproval: 0,
          overdueReviews: 0,
          recentActivity: 0,
        });
      } catch (error) {
        console.error('Failed to load document stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, []);

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-48 bg-muted rounded" />
          <div className="grid grid-cols-3 gap-4">
            <div className="h-16 bg-muted rounded" />
            <div className="h-16 bg-muted rounded" />
            <div className="h-16 bg-muted rounded" />
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Document Management</h3>
        </div>
        <Link href={`/dashboard/${moduleId}`}>
          <Button variant="ghost" size="sm" className="gap-1">
            View All
            <ChevronRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        {/* Total Documents */}
        <div className="space-y-1">
          <div className="text-2xl font-bold">{stats.totalDocuments}</div>
          <div className="text-xs text-muted-foreground">Documents</div>
        </div>

        {/* Pending Approval */}
        <div className="space-y-1">
          <div className="flex items-center gap-1">
            <div className="text-2xl font-bold">{stats.pendingApproval}</div>
            {stats.pendingApproval > 0 && (
              <Clock className="h-4 w-4 text-yellow-600" />
            )}
          </div>
          <div className="text-xs text-muted-foreground">Pending</div>
        </div>

        {/* Overdue Reviews */}
        <div className="space-y-1">
          <div className="flex items-center gap-1">
            <div className="text-2xl font-bold">{stats.overdueReviews}</div>
            {stats.overdueReviews > 0 && (
              <AlertTriangle className="h-4 w-4 text-red-600" />
            )}
          </div>
          <div className="text-xs text-muted-foreground">Overdue</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="pt-3 border-t space-y-2">
        <Link href={`/dashboard/${moduleId}`}>
          <Button variant="outline" size="sm" className="w-full justify-start gap-2">
            <FileText className="h-4 w-4" />
            Browse Documents
          </Button>
        </Link>
      </div>
    </Card>
  );
};

export default DocumentWidget;

