'use client';

import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface DocumentMetadata {
  title: string;
  description?: string;
  categoryId?: string;
  effectiveDate?: string;
  reviewFrequencyDays?: number;
}

interface DocumentMetadataFormProps {
  initialData?: Partial<DocumentMetadata>;
  onSubmit: (data: DocumentMetadata) => void | Promise<void>;
  onCancel?: () => void;
  categories?: Array<{ id: string; name: string; defaultReviewFrequencyDays?: number }>;
  isSubmitting?: boolean;
  submitLabel?: string;
  className?: string;
}

const REVIEW_FREQUENCY_PRESETS = [
  { label: 'No review required', value: 0 },
  { label: 'Every 30 days', value: 30 },
  { label: 'Every 60 days', value: 60 },
  { label: 'Every 90 days', value: 90 },
  { label: 'Every 180 days', value: 180 },
  { label: 'Every year', value: 365 },
  { label: 'Custom', value: -1 },
];

/**
 * DocumentMetadataForm
 * 
 * Form for editing document metadata including title, category, review frequency.
 * Used in both document upload and document editing workflows.
 * 
 * @example
 * ```tsx
 * <DocumentMetadataForm
 *   initialData={{ title: 'Safety Policy' }}
 *   categories={categories}
 *   onSubmit={handleSave}
 *   onCancel={handleCancel}
 * />
 * ```
 */
export const DocumentMetadataForm: React.FC<DocumentMetadataFormProps> = ({
  initialData = {},
  onSubmit,
  onCancel,
  categories = [],
  isSubmitting = false,
  submitLabel = 'Save',
  className,
}) => {
  const [formData, setFormData] = useState<DocumentMetadata>({
    title: initialData.title || '',
    description: initialData.description || '',
    categoryId: initialData.categoryId || '',
    effectiveDate: initialData.effectiveDate || '',
    reviewFrequencyDays: initialData.reviewFrequencyDays ?? undefined,
  });

  const [reviewFrequencyPreset, setReviewFrequencyPreset] = useState<number>(() => {
    const current = formData.reviewFrequencyDays ?? 0;
    const preset = REVIEW_FREQUENCY_PRESETS.find((p) => p.value === current);
    return preset ? current : -1;
  });

  const [customReviewDays, setCustomReviewDays] = useState<string>(
    reviewFrequencyPreset === -1 ? String(formData.reviewFrequencyDays || '') : ''
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleCategoryChange = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    setFormData((prev) => ({
      ...prev,
      categoryId,
      // Auto-fill review frequency from category default if not already set
      reviewFrequencyDays:
        prev.reviewFrequencyDays === undefined && category?.defaultReviewFrequencyDays
          ? category.defaultReviewFrequencyDays
          : prev.reviewFrequencyDays,
    }));

    // Update preset selection if it matches
    if (category?.defaultReviewFrequencyDays !== undefined) {
      const matchingPreset = REVIEW_FREQUENCY_PRESETS.find(
        (p) => p.value === category.defaultReviewFrequencyDays
      );
      if (matchingPreset) {
        setReviewFrequencyPreset(matchingPreset.value);
      }
    }
  };

  const handleReviewFrequencyPresetChange = (value: number) => {
    setReviewFrequencyPreset(value);
    if (value === -1) {
      // Custom - don't change the actual value yet
      setCustomReviewDays(String(formData.reviewFrequencyDays || ''));
    } else {
      setFormData((prev) => ({
        ...prev,
        reviewFrequencyDays: value || undefined,
      }));
    }
  };

  const handleCustomReviewDaysChange = (value: string) => {
    setCustomReviewDays(value);
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue > 0) {
      setFormData((prev) => ({
        ...prev,
        reviewFrequencyDays: numValue,
      }));
    } else if (value === '') {
      setFormData((prev) => ({
        ...prev,
        reviewFrequencyDays: undefined,
      }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (reviewFrequencyPreset === -1 && customReviewDays) {
      const num = parseInt(customReviewDays, 10);
      if (isNaN(num) || num <= 0) {
        newErrors.reviewFrequencyDays = 'Review frequency must be a positive number';
      }
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
      className={cn('space-y-4', className)}
      noValidate
    >
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title" className="required">
          Title
        </Label>
        <Input
          id="title"
          type="text"
          value={formData.title}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, title: e.target.value }))
          }
          placeholder="Enter document title"
          required
          aria-required="true"
          aria-invalid={!!errors.title}
          aria-describedby={errors.title ? 'title-error' : undefined}
          disabled={isSubmitting}
        />
        {errors.title && (
          <p id="title-error" className="text-sm text-destructive">
            {errors.title}
          </p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, description: e.target.value }))
          }
          placeholder="Optional description"
          rows={3}
          disabled={isSubmitting}
          className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      {/* Category */}
      {categories.length > 0 && (
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <select
            id="category"
            value={formData.categoryId}
            onChange={(e) => handleCategoryChange(e.target.value)}
            disabled={isSubmitting}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Effective Date */}
      <div className="space-y-2">
        <Label htmlFor="effectiveDate">Effective Date</Label>
        <Input
          id="effectiveDate"
          type="date"
          value={formData.effectiveDate}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, effectiveDate: e.target.value }))
          }
          disabled={isSubmitting}
        />
        <p className="text-xs text-muted-foreground">
          When this document becomes effective. Used to calculate review dates.
        </p>
      </div>

      {/* Review Frequency */}
      <div className="space-y-2">
        <Label htmlFor="reviewFrequency">Review Frequency</Label>
        <select
          id="reviewFrequency"
          value={reviewFrequencyPreset}
          onChange={(e) =>
            handleReviewFrequencyPresetChange(Number(e.target.value))
          }
          disabled={isSubmitting}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        >
          {REVIEW_FREQUENCY_PRESETS.map((preset) => (
            <option key={preset.value} value={preset.value}>
              {preset.label}
            </option>
          ))}
        </select>

        {/* Custom review frequency input */}
        {reviewFrequencyPreset === -1 && (
          <div className="space-y-2">
            <Input
              id="customReviewDays"
              type="number"
              min="1"
              value={customReviewDays}
              onChange={(e) => handleCustomReviewDaysChange(e.target.value)}
              placeholder="Enter number of days"
              aria-invalid={!!errors.reviewFrequencyDays}
              aria-describedby={
                errors.reviewFrequencyDays ? 'review-error' : undefined
              }
              disabled={isSubmitting}
            />
            {errors.reviewFrequencyDays && (
              <p id="review-error" className="text-sm text-destructive">
                {errors.reviewFrequencyDays}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex items-center gap-2 pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {submitLabel}
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

