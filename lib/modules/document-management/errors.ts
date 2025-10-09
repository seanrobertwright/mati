/**
 * Friendly error messages and error handling utilities
 */

export class DocumentManagementError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'DocumentManagementError';
  }
}

export const ERROR_CODES = {
  // File errors
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  FILE_TYPE_NOT_ALLOWED: 'FILE_TYPE_NOT_ALLOWED',
  FILE_UPLOAD_FAILED: 'FILE_UPLOAD_FAILED',
  FILE_NOT_FOUND: 'FILE_NOT_FOUND',
  FILE_CORRUPTED: 'FILE_CORRUPTED',

  // Document errors
  DOCUMENT_NOT_FOUND: 'DOCUMENT_NOT_FOUND',
  DOCUMENT_ALREADY_EXISTS: 'DOCUMENT_ALREADY_EXISTS',
  DOCUMENT_LOCKED: 'DOCUMENT_LOCKED',
  DOCUMENT_VERSION_CONFLICT: 'DOCUMENT_VERSION_CONFLICT',

  // Permission errors
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',

  // Validation errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  REQUIRED_FIELD_MISSING: 'REQUIRED_FIELD_MISSING',

  // Workflow errors
  INVALID_STATE_TRANSITION: 'INVALID_STATE_TRANSITION',
  APPROVAL_REQUIRED: 'APPROVAL_REQUIRED',
  CANNOT_DELETE_APPROVED_DOCUMENT: 'CANNOT_DELETE_APPROVED_DOCUMENT',

  // System errors
  DATABASE_ERROR: 'DATABASE_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];

const ERROR_MESSAGES: Record<ErrorCode, string> = {
  // File errors
  FILE_TOO_LARGE: 'The file you selected is too large. Please choose a smaller file.',
  FILE_TYPE_NOT_ALLOWED: 'This file type is not supported. Please choose a different file format.',
  FILE_UPLOAD_FAILED: 'Failed to upload the file. Please try again.',
  FILE_NOT_FOUND: 'The requested file could not be found.',
  FILE_CORRUPTED: 'The file appears to be corrupted or invalid.',

  // Document errors
  DOCUMENT_NOT_FOUND: 'The requested document could not be found.',
  DOCUMENT_ALREADY_EXISTS: 'A document with this name already exists in this location.',
  DOCUMENT_LOCKED: 'This document is currently locked and cannot be edited.',
  DOCUMENT_VERSION_CONFLICT: 'This document has been modified by another user. Please refresh and try again.',

  // Permission errors
  UNAUTHORIZED: 'You must be logged in to perform this action.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  INSUFFICIENT_PERMISSIONS: 'You do not have sufficient permissions to access this document.',

  // Validation errors
  VALIDATION_ERROR: 'The information you provided is invalid. Please check and try again.',
  INVALID_INPUT: 'Some of the information you provided is not valid.',
  REQUIRED_FIELD_MISSING: 'Please fill in all required fields.',

  // Workflow errors
  INVALID_STATE_TRANSITION: 'This action is not allowed for documents in this state.',
  APPROVAL_REQUIRED: 'This document requires approval before it can be published.',
  CANNOT_DELETE_APPROVED_DOCUMENT: 'Approved documents cannot be deleted. Please archive instead.',

  // System errors
  DATABASE_ERROR: 'A database error occurred. Please try again later.',
  NETWORK_ERROR: 'A network error occurred. Please check your connection and try again.',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again later.',
};

export function getErrorMessage(code: ErrorCode): string {
  return ERROR_MESSAGES[code] || ERROR_MESSAGES.UNKNOWN_ERROR;
}

export function createError(code: ErrorCode, details?: Record<string, any>): DocumentManagementError {
  const message = getErrorMessage(code);
  return new DocumentManagementError(message, code, undefined, details);
}

/**
 * Convert various error types to friendly user messages
 */
export function toUserFriendlyError(error: unknown): string {
  if (error instanceof DocumentManagementError) {
    return error.message;
  }

  if (error instanceof Error) {
    // Map common error patterns to friendly messages
    const message = error.message.toLowerCase();

    if (message.includes('network') || message.includes('fetch')) {
      return getErrorMessage(ERROR_CODES.NETWORK_ERROR);
    }

    if (message.includes('unauthorized') || message.includes('401')) {
      return getErrorMessage(ERROR_CODES.UNAUTHORIZED);
    }

    if (message.includes('forbidden') || message.includes('403')) {
      return getErrorMessage(ERROR_CODES.FORBIDDEN);
    }

    if (message.includes('not found') || message.includes('404')) {
      return getErrorMessage(ERROR_CODES.DOCUMENT_NOT_FOUND);
    }

    if (message.includes('validation') || message.includes('invalid')) {
      return getErrorMessage(ERROR_CODES.VALIDATION_ERROR);
    }

    // Return the original message for development
    if (process.env.NODE_ENV === 'development') {
      return error.message;
    }
  }

  return getErrorMessage(ERROR_CODES.UNKNOWN_ERROR);
}

/**
 * Log error for debugging while showing friendly message to user
 */
export function handleError(error: unknown, context?: string): string {
  console.error(`[Document Management${context ? ` - ${context}` : ''}]:`, error);
  return toUserFriendlyError(error);
}

/**
 * Retry logic for async operations
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  options: {
    maxRetries?: number;
    delayMs?: number;
    onRetry?: (attempt: number, error: Error) => void;
  } = {}
): Promise<T> {
  const { maxRetries = 3, delayMs = 1000, onRetry } = options;

  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < maxRetries) {
        onRetry?.(attempt + 1, lastError);
        await new Promise(resolve => setTimeout(resolve, delayMs * (attempt + 1)));
      }
    }
  }

  throw lastError || new Error('Operation failed after retries');
}

