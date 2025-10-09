'use client';

import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AlertCircle } from 'lucide-react';

export interface ChangeRequestData {
  title: string;
  description: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
}

interface ChangeRequestFormProps {
  /** Document ID this change request is for */
  documentId: string;
  /** Document title for context */
  documentTitle?: string;
  /** Initial form data for editing existing change requests */
  initialData?: Partial<ChangeRequestData>;
  /** Callback when form is submitted */
  onSubmit: (data: ChangeRequestData) => void | Promise<void>;
  /** Callback when cancel is clicked */
  onCancel?: () => void;
  /** Whether the form is currently submitting */
  isSubmitting?: boolean;
  /** Custom submit button label */
  submitLabel?: string;
  className?: string;
}

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low', description: 'Minor improvements or suggestions' },
  { value: 'medium', label: 'Medium', description: 'Standard updates or corrections' },
  { value: 'high', label: 'High', description: 'Important changes needed soon' },
  { value: 'critical', label: 'Critical', description: 'Urgent compliance or safety issues' },
] as const;

/**
 * ChangeRequestForm
 * 
 * Form for creating or editing change requests for documents.
 * Supports priority selection and validation.
 * 
 * @example
 * ```tsx
 * <ChangeRequestForm
 *   documentId="123"
 *   documentTitle="Safety Policy"
 *   onSubmit={handleSubmit}
 *   onCancel={handleCancel}
 * />
 * ```
 */
export const ChangeRequestForm: React.FC<ChangeRequestFormProps> = ({
  documentId,
  documentTitle,
  initialData = {},
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitLabel = 'Submit Change Request',
  className,
}) => {
  const [formData, setFormData] = useState<ChangeRequestData>({
    title: initialData.title || '',
    description: initialData.description || '',
    priority: initialData.priority || 'medium',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    await onSubmit(formData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn('space-y-6', className)}
      noValidate
    >
      {/* Document Context */}
      {documentTitle && (
        <div className="rounded-lg border border-border bg-muted/50 p-4">
          <p className="text-sm font-medium text-muted-foreground">
            Change request for:
          </p>
          <p className="text-base font-semibold">{documentTitle}</p>
        </div>
      )}

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title" className="required">
          Change Request Title
        </Label>
        <Input
          id="title"
          type="text"
          value={formData.title}
          onChange={(e) => {
            setFormData((prev) => ({ ...prev, title: e.target.value }));
            setErrors((prev) => ({ ...prev, title: '' }));
          }}
          placeholder="Brief summary of the requested change"
          required
          aria-required="true"
          aria-invalid={!!errors.title}
          aria-describedby={errors.title ? 'title-error' : undefined}
          disabled={isSubmitting}
        />
        {errors.title && (
          <div className="flex items-center gap-1 text-sm text-destructive" id="title-error">
            <AlertCircle className="h-3 w-3" />
            <span>{errors.title}</span>
          </div>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description" className="required">
          Description
        </Label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => {
            setFormData((prev) => ({ ...prev, description: e.target.value }));
            setErrors((prev) => ({ ...prev, description: '' }));
          }}
          placeholder="Detailed description of what should be changed and why..."
          rows={6}
          required
          aria-required="true"
          aria-invalid={!!errors.description}
          aria-describedby={errors.description ? 'description-error' : undefined}
          disabled={isSubmitting}
          className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        />
        {errors.description && (
          <div className="flex items-center gap-1 text-sm text-destructive" id="description-error">
            <AlertCircle className="h-3 w-3" />
            <span>{errors.description}</span>
          </div>
        )}
        <p className="text-xs text-muted-foreground">
          Include specific sections, clauses, or content that needs updating.
        </p>
      </div>

      {/* Priority */}
      <div className="space-y-3">
        <Label>Priority</Label>
        <div className="grid gap-3">
          {PRIORITY_OPTIONS.map((option) => (
            <label
              key={option.value}
              className={cn(
                'flex items-start gap-3 rounded-lg border p-4 cursor-pointer transition-colors',
                'hover:bg-muted/50',
                formData.priority === option.value
                  ? 'border-primary bg-primary/5'
                  : 'border-border'
              )}
            >
              <input
                type="radio"
                name="priority"
                value={option.value}
                checked={formData.priority === option.value}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    priority: e.target.value as typeof formData.priority,
                  }))
                }
                disabled={isSubmitting}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="font-medium">{option.label}</div>
                <div className="text-sm text-muted-foreground">
                  {option.description}
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex items-center gap-2 pt-4 border-t">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : submitLabel}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
};

