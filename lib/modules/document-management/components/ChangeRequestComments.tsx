'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, Send, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface ChangeRequestComment {
  id: string;
  userId: string;
  userName?: string;
  comment: string;
  createdAt: Date | string;
}

interface ChangeRequestCommentsProps {
  /** Array of comments to display */
  comments: ChangeRequestComment[];
  /** Current user ID for highlighting own comments */
  currentUserId?: string;
  /** Callback when a new comment is submitted */
  onAddComment?: (comment: string) => void | Promise<void>;
  /** Whether the user can add comments */
  canComment?: boolean;
  /** Whether comments are currently being loaded */
  isLoading?: boolean;
  /** Whether a new comment is being submitted */
  isSubmitting?: boolean;
  className?: string;
}

/**
 * ChangeRequestComments
 * 
 * Displays a thread of comments for a change request with ability to add new comments.
 * Supports highlighting current user's comments and shows relative timestamps.
 * 
 * @example
 * ```tsx
 * <ChangeRequestComments
 *   comments={comments}
 *   currentUserId="123"
 *   onAddComment={handleAddComment}
 *   canComment={true}
 * />
 * ```
 */
export const ChangeRequestComments: React.FC<ChangeRequestCommentsProps> = ({
  comments,
  currentUserId,
  onAddComment,
  canComment = true,
  isLoading = false,
  isSubmitting = false,
  className,
}) => {
  const [newComment, setNewComment] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newComment.trim()) {
      setError('Comment cannot be empty');
      return;
    }

    if (newComment.trim().length < 3) {
      setError('Comment must be at least 3 characters');
      return;
    }

    if (onAddComment) {
      await onAddComment(newComment.trim());
      setNewComment('');
      setError('');
    }
  };

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
      {/* Header */}
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-muted-foreground" />
        <h3 className="font-semibold">
          Discussion ({comments.length})
        </h3>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            Loading comments...
          </div>
        ) : comments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <MessageSquare className="h-12 w-12 mb-2 opacity-20" />
            <p>No comments yet</p>
            <p className="text-sm">Be the first to comment on this change request</p>
          </div>
        ) : (
          comments.map((comment) => {
            const isOwnComment = currentUserId && comment.userId === currentUserId;

            return (
              <div
                key={comment.id}
                className={cn(
                  'rounded-lg border p-4 space-y-2',
                  isOwnComment
                    ? 'border-primary/50 bg-primary/5'
                    : 'border-border bg-muted/30'
                )}
              >
                {/* Comment Header */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-muted">
                    <User className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">
                        {comment.userName || 'User'}
                      </span>
                      {isOwnComment && (
                        <span className="text-xs text-primary font-medium">
                          (You)
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatTimestamp(comment.createdAt)}
                    </div>
                  </div>
                </div>

                {/* Comment Content */}
                <div className="text-sm whitespace-pre-wrap pl-10">
                  {comment.comment}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Comment Form */}
      {canComment && onAddComment && (
        <form onSubmit={handleSubmit} className="space-y-2">
          <div className="space-y-2">
            <label htmlFor="new-comment" className="sr-only">
              Add a comment
            </label>
            <textarea
              id="new-comment"
              value={newComment}
              onChange={(e) => {
                setNewComment(e.target.value);
                setError('');
              }}
              placeholder="Add a comment..."
              rows={3}
              disabled={isSubmitting}
              className={cn(
                'flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors',
                'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
                'disabled:cursor-not-allowed disabled:opacity-50',
                error && 'border-destructive'
              )}
              aria-invalid={!!error}
              aria-describedby={error ? 'comment-error' : undefined}
            />
            {error && (
              <p id="comment-error" className="text-sm text-destructive">
                {error}
              </p>
            )}
          </div>
          <div className="flex justify-end">
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting || !newComment.trim()}
              className="gap-2"
            >
              <Send className="h-4 w-4" />
              {isSubmitting ? 'Posting...' : 'Post Comment'}
            </Button>
          </div>
        </form>
      )}

      {!canComment && (
        <div className="text-sm text-muted-foreground italic p-4 bg-muted/30 rounded-lg text-center">
          You don't have permission to comment on this change request
        </div>
      )}
    </div>
  );
};

