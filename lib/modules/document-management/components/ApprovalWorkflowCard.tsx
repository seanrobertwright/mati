'use client';

import { CheckCircle, Clock, XCircle, FileEdit, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type DocumentStatus =
  | 'draft'
  | 'pending_review'
  | 'pending_approval'
  | 'approved'
  | 'under_review'
  | 'archived';

interface ApprovalStage {
  id: string;
  name: string;
  status: 'completed' | 'current' | 'pending' | 'skipped';
  completedBy?: string;
  completedAt?: Date | string;
  notes?: string;
}

interface ApprovalWorkflowCardProps {
  documentStatus: DocumentStatus;
  currentStage?: 'draft' | 'review' | 'approval' | 'approved';
  reviewer?: {
    id: string;
    name: string;
    completedAt?: Date | string;
    status?: 'pending' | 'approved' | 'changes_requested';
  };
  approver?: {
    id: string;
    name: string;
    completedAt?: Date | string;
    status?: 'pending' | 'approved' | 'rejected';
  };
  className?: string;
}

const statusIcons = {
  completed: <CheckCircle className="h-5 w-5 text-green-600" />,
  current: <Clock className="h-5 w-5 text-blue-600" />,
  pending: <Clock className="h-5 w-5 text-gray-400" />,
  skipped: <XCircle className="h-5 w-5 text-gray-400" />,
};

/**
 * ApprovalWorkflowCard
 * 
 * Displays the current approval workflow stage with visual progress indicator.
 * Shows three-stage workflow: Draft → Review → Approval → Approved
 * 
 * @example
 * ```tsx
 * <ApprovalWorkflowCard
 *   documentStatus="pending_review"
 *   currentStage="review"
 *   reviewer={{ id: "1", name: "John Doe", status: "pending" }}
 * />
 * ```
 */
export const ApprovalWorkflowCard: React.FC<ApprovalWorkflowCardProps> = ({
  documentStatus,
  currentStage,
  reviewer,
  approver,
  className,
}) => {
  const getStages = (): ApprovalStage[] => {
    const stages: ApprovalStage[] = [];

    // Draft stage
    stages.push({
      id: 'draft',
      name: 'Draft',
      status:
        documentStatus === 'draft'
          ? 'current'
          : ['pending_review', 'pending_approval', 'approved', 'under_review'].includes(
              documentStatus
            )
          ? 'completed'
          : 'pending',
    });

    // Review stage
    stages.push({
      id: 'review',
      name: 'Review',
      status:
        documentStatus === 'pending_review'
          ? 'current'
          : documentStatus === 'draft'
          ? 'pending'
          : reviewer?.status === 'changes_requested'
          ? 'skipped'
          : 'completed',
      completedBy: reviewer?.name,
      completedAt: reviewer?.completedAt,
    });

    // Approval stage
    stages.push({
      id: 'approval',
      name: 'Approval',
      status:
        documentStatus === 'pending_approval'
          ? 'current'
          : documentStatus === 'approved' || documentStatus === 'under_review'
          ? 'completed'
          : 'pending',
      completedBy: approver?.name,
      completedAt: approver?.completedAt,
    });

    // Approved stage
    stages.push({
      id: 'approved',
      name: 'Approved',
      status:
        documentStatus === 'approved' || documentStatus === 'under_review'
          ? 'completed'
          : 'pending',
    });

    return stages;
  };

  const stages = getStages();

  const formatDate = (date: Date | string | undefined): string => {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className={cn('border rounded-lg p-6 bg-card', className)}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-1">Approval Workflow</h3>
        <p className="text-sm text-muted-foreground">
          Track document progress through approval stages
        </p>
      </div>

      {/* Progress Stages */}
      <div className="space-y-6">
        {stages.map((stage, index) => {
          const isLast = index === stages.length - 1;
          const statusColor =
            stage.status === 'completed'
              ? 'bg-green-100 border-green-300'
              : stage.status === 'current'
              ? 'bg-blue-100 border-blue-300'
              : stage.status === 'skipped'
              ? 'bg-red-100 border-red-300'
              : 'bg-gray-100 border-gray-300';

          return (
            <div key={stage.id} className="relative">
              <div className="flex items-start gap-4">
                {/* Stage Icon */}
                <div
                  className={cn(
                    'flex-shrink-0 w-10 h-10 rounded-full border-2 flex items-center justify-center',
                    statusColor
                  )}
                >
                  {statusIcons[stage.status]}
                </div>

                {/* Stage Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-medium">{stage.name}</h4>
                    {stage.status === 'current' && (
                      <Badge variant="default" className="text-xs">
                        Current
                      </Badge>
                    )}
                    {stage.status === 'completed' && (
                      <Badge
                        variant="outline"
                        className="text-xs bg-green-100 text-green-800 border-green-300"
                      >
                        Completed
                      </Badge>
                    )}
                    {stage.status === 'skipped' && (
                      <Badge
                        variant="outline"
                        className="text-xs bg-red-100 text-red-800 border-red-300"
                      >
                        Changes Requested
                      </Badge>
                    )}
                  </div>

                  {/* Completion Info */}
                  {stage.completedBy && (
                    <p className="text-xs text-muted-foreground">
                      {stage.completedBy}
                      {stage.completedAt && ` • ${formatDate(stage.completedAt)}`}
                    </p>
                  )}

                  {/* Current Stage Info */}
                  {stage.status === 'current' && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {stage.id === 'draft' && 'Document is being authored'}
                      {stage.id === 'review' &&
                        reviewer &&
                        `Awaiting review from ${reviewer.name}`}
                      {stage.id === 'approval' &&
                        approver &&
                        `Awaiting approval from ${approver.name}`}
                    </p>
                  )}
                </div>
              </div>

              {/* Connector Line */}
              {!isLast && (
                <div className="absolute left-5 top-10 bottom-0 w-0.5 bg-border -mb-6" />
              )}
            </div>
          );
        })}
      </div>

      {/* Status Summary */}
      <div className="mt-6 pt-6 border-t">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Current Status:</span>
          <span className="font-medium text-foreground">
            {documentStatus === 'draft' && 'In Draft'}
            {documentStatus === 'pending_review' && 'Pending Review'}
            {documentStatus === 'pending_approval' && 'Pending Approval'}
            {documentStatus === 'approved' && 'Approved'}
            {documentStatus === 'under_review' && 'Under Review'}
            {documentStatus === 'archived' && 'Archived'}
          </span>
        </div>
      </div>
    </div>
  );
};

