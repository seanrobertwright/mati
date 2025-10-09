/**
 * Validation schemas for document management
 * Uses Zod for runtime type validation
 */

import { z } from 'zod';

// File validation constants
export const FILE_SIZE_LIMITS = {
  MAX_SIZE: 100 * 1024 * 1024, // 100MB default
  MIN_SIZE: 1, // 1 byte minimum
} as const;

export const ALLOWED_FILE_TYPES = {
  documents: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/csv',
  ],
  images: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
  ],
  archives: [
    'application/zip',
    'application/x-rar-compressed',
    'application/x-7z-compressed',
  ],
} as const;

export const ALL_ALLOWED_TYPES = [
  ...ALLOWED_FILE_TYPES.documents,
  ...ALLOWED_FILE_TYPES.images,
  ...ALLOWED_FILE_TYPES.archives,
] as const;

// Document metadata validation
export const documentMetadataSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(255, 'Title must be less than 255 characters')
    .trim(),
  
  description: z
    .string()
    .max(2000, 'Description must be less than 2000 characters')
    .trim()
    .optional(),
  
  categoryId: z
    .string()
    .uuid('Invalid category ID')
    .optional()
    .nullable(),
  
  directoryId: z
    .string()
    .uuid('Invalid directory ID')
    .optional()
    .nullable(),
  
  effectiveDate: z
    .string()
    .datetime('Invalid date format')
    .or(z.date())
    .optional(),
  
  reviewFrequencyDays: z
    .number()
    .int('Review frequency must be a whole number')
    .min(1, 'Review frequency must be at least 1 day')
    .max(3650, 'Review frequency cannot exceed 10 years')
    .optional(),
  
  ownerId: z
    .string()
    .uuid('Invalid owner ID')
    .optional(),
});

export type DocumentMetadata = z.infer<typeof documentMetadataSchema>;

// File upload validation
export const fileUploadSchema = z.object({
  file: z.custom<File>((file) => {
    if (!(file instanceof File)) {
      return false;
    }
    return true;
  }, 'Invalid file'),
  
  documentId: z
    .string()
    .uuid('Invalid document ID')
    .optional(),
});

// Enhanced file validation with size and type checks
export function validateFile(file: File, options?: {
  maxSize?: number;
  allowedTypes?: readonly string[];
}): { valid: boolean; error?: string } {
  const maxSize = options?.maxSize ?? FILE_SIZE_LIMITS.MAX_SIZE;
  const allowedTypes = options?.allowedTypes ?? ALL_ALLOWED_TYPES;

  // Check file size
  if (file.size < FILE_SIZE_LIMITS.MIN_SIZE) {
    return {
      valid: false,
      error: 'File is empty or corrupted',
    };
  }

  if (file.size > maxSize) {
    const maxSizeMB = Math.round(maxSize / (1024 * 1024));
    const fileSizeMB = Math.round(file.size / (1024 * 1024));
    return {
      valid: false,
      error: `File size (${fileSizeMB}MB) exceeds maximum allowed size (${maxSizeMB}MB)`,
    };
  }

  // Check file type
  if (!allowedTypes.includes(file.type as any)) {
    return {
      valid: false,
      error: `File type "${file.type}" is not allowed. Please upload a supported file format.`,
    };
  }

  // Check file extension matches MIME type (basic security check)
  const extension = file.name.split('.').pop()?.toLowerCase();
  const mimeExtensionMap: Record<string, string[]> = {
    'application/pdf': ['pdf'],
    'application/msword': ['doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['docx'],
    'application/vnd.ms-excel': ['xls'],
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['xlsx'],
    'text/plain': ['txt'],
    'text/csv': ['csv'],
    'image/jpeg': ['jpg', 'jpeg'],
    'image/png': ['png'],
    'image/gif': ['gif'],
    'image/webp': ['webp'],
  };

  const expectedExtensions = mimeExtensionMap[file.type];
  if (expectedExtensions && extension && !expectedExtensions.includes(extension)) {
    return {
      valid: false,
      error: `File extension ".${extension}" does not match file type "${file.type}"`,
    };
  }

  return { valid: true };
}

// Directory validation
export const directorySchema = z.object({
  name: z
    .string()
    .min(1, 'Directory name is required')
    .max(255, 'Directory name must be less than 255 characters')
    .trim()
    .regex(/^[^/\\:*?"<>|]+$/, 'Directory name contains invalid characters'),
  
  parentId: z
    .string()
    .uuid('Invalid parent directory ID')
    .optional()
    .nullable(),
});

export type DirectoryInput = z.infer<typeof directorySchema>;

// Change request validation
export const changeRequestSchema = z.object({
  documentId: z
    .string()
    .uuid('Invalid document ID'),
  
  title: z
    .string()
    .min(1, 'Title is required')
    .max(255, 'Title must be less than 255 characters')
    .trim(),
  
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(5000, 'Description must be less than 5000 characters')
    .trim(),
  
  priority: z
    .enum(['low', 'medium', 'high', 'critical'])
    .default('medium'),
});

export type ChangeRequestInput = z.infer<typeof changeRequestSchema>;

// Comment validation
export const commentSchema = z.object({
  changeRequestId: z
    .string()
    .uuid('Invalid change request ID'),
  
  content: z
    .string()
    .min(1, 'Comment cannot be empty')
    .max(2000, 'Comment must be less than 2000 characters')
    .trim(),
});

export type CommentInput = z.infer<typeof commentSchema>;

// Approval validation
export const approvalSchema = z.object({
  documentId: z
    .string()
    .uuid('Invalid document ID'),
  
  action: z
    .enum(['approve', 'reject']),
  
  notes: z
    .string()
    .max(1000, 'Notes must be less than 1000 characters')
    .trim()
    .optional(),
});

export type ApprovalInput = z.infer<typeof approvalSchema>;

// Permission validation
export const permissionSchema = z.object({
  documentId: z
    .string()
    .uuid('Invalid document ID'),
  
  userId: z
    .string()
    .uuid('Invalid user ID'),
  
  role: z
    .enum(['owner', 'approver', 'reviewer', 'viewer']),
});

export type PermissionInput = z.infer<typeof permissionSchema>;

// Search and filter validation
export const documentSearchSchema = z.object({
  query: z
    .string()
    .max(500, 'Search query too long')
    .trim()
    .optional(),
  
  categories: z
    .array(z.string())
    .optional(),
  
  statuses: z
    .array(z.enum([
      'draft',
      'pending_review',
      'pending_approval',
      'approved',
      'under_review',
      'archived',
      'overdue',
    ]))
    .optional(),
  
  ownerIds: z
    .array(z.string().uuid())
    .optional(),
  
  dateFrom: z
    .string()
    .datetime()
    .or(z.date())
    .optional(),
  
  dateTo: z
    .string()
    .datetime()
    .or(z.date())
    .optional(),
  
  dateField: z
    .enum(['created', 'effective', 'nextReview'])
    .optional(),
});

export type DocumentSearchInput = z.infer<typeof documentSearchSchema>;

// Helper function to format validation errors
export function formatZodError(error: z.ZodError): string {
  const firstError = error.errors[0];
  if (firstError) {
    return firstError.message;
  }
  return 'Validation error';
}

// Helper function to validate and return friendly error messages
export function validateWithMessage<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: formatZodError(error) };
    }
    return { success: false, error: 'Validation failed' };
  }
}

