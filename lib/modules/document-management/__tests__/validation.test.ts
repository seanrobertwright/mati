/**
 * Unit tests for document management validation schemas
 * 
 * To run these tests:
 * 1. Install Vitest: npm install -D vitest @vitest/ui
 * 2. Add test script to package.json: "test": "vitest"
 * 3. Run: npm test
 */

import { describe, it, expect } from 'vitest';
import {
  documentMetadataSchema,
  directorySchema,
  changeRequestSchema,
  commentSchema,
  approvalSchema,
  permissionSchema,
  validateFile,
  validateWithMessage,
  FILE_SIZE_LIMITS,
} from '../validation';

describe('Document Metadata Validation', () => {
  it('should validate valid document metadata', () => {
    const validData = {
      title: 'Test Document',
      description: 'Test description',
      categoryId: '123e4567-e89b-12d3-a456-426614174000',
      reviewFrequencyDays: 30,
    };

    const result = documentMetadataSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should reject empty title', () => {
    const invalidData = {
      title: '',
      description: 'Test description',
    };

    const result = documentMetadataSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('required');
    }
  });

  it('should reject title longer than 255 characters', () => {
    const invalidData = {
      title: 'a'.repeat(256),
    };

    const result = documentMetadataSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('255');
    }
  });

  it('should reject invalid UUID for categoryId', () => {
    const invalidData = {
      title: 'Test',
      categoryId: 'not-a-uuid',
    };

    const result = documentMetadataSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should reject review frequency less than 1', () => {
    const invalidData = {
      title: 'Test',
      reviewFrequencyDays: 0,
    };

    const result = documentMetadataSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should reject review frequency greater than 3650', () => {
    const invalidData = {
      title: 'Test',
      reviewFrequencyDays: 3651,
    };

    const result = documentMetadataSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should trim whitespace from title', () => {
    const data = {
      title: '  Test Document  ',
    };

    const result = documentMetadataSchema.parse(data);
    expect(result.title).toBe('Test Document');
  });
});

describe('Directory Validation', () => {
  it('should validate valid directory', () => {
    const validData = {
      name: 'Test Directory',
      parentId: '123e4567-e89b-12d3-a456-426614174000',
    };

    const result = directorySchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should reject empty directory name', () => {
    const invalidData = {
      name: '',
    };

    const result = directorySchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should reject directory name with invalid characters', () => {
    const invalidCharacters = ['/', '\\', ':', '*', '?', '"', '<', '>', '|'];
    
    invalidCharacters.forEach(char => {
      const invalidData = {
        name: `Test${char}Directory`,
      };

      const result = directorySchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  it('should accept directory name without parent', () => {
    const validData = {
      name: 'Root Directory',
      parentId: null,
    };

    const result = directorySchema.safeParse(validData);
    expect(result.success).toBe(true);
  });
});

describe('Change Request Validation', () => {
  it('should validate valid change request', () => {
    const validData = {
      documentId: '123e4567-e89b-12d3-a456-426614174000',
      title: 'Update document',
      description: 'This is a test description that is long enough',
      priority: 'medium' as const,
    };

    const result = changeRequestSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should reject description shorter than 10 characters', () => {
    const invalidData = {
      documentId: '123e4567-e89b-12d3-a456-426614174000',
      title: 'Update',
      description: 'Short',
    };

    const result = changeRequestSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should default priority to medium', () => {
    const data = {
      documentId: '123e4567-e89b-12d3-a456-426614174000',
      title: 'Update',
      description: 'This is a valid description',
    };

    const result = changeRequestSchema.parse(data);
    expect(result.priority).toBe('medium');
  });

  it('should reject invalid priority values', () => {
    const invalidData = {
      documentId: '123e4567-e89b-12d3-a456-426614174000',
      title: 'Update',
      description: 'This is a valid description',
      priority: 'urgent',
    };

    const result = changeRequestSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});

describe('Comment Validation', () => {
  it('should validate valid comment', () => {
    const validData = {
      changeRequestId: '123e4567-e89b-12d3-a456-426614174000',
      content: 'This is a comment',
    };

    const result = commentSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should reject empty comment', () => {
    const invalidData = {
      changeRequestId: '123e4567-e89b-12d3-a456-426614174000',
      content: '',
    };

    const result = commentSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should reject comment longer than 2000 characters', () => {
    const invalidData = {
      changeRequestId: '123e4567-e89b-12d3-a456-426614174000',
      content: 'a'.repeat(2001),
    };

    const result = commentSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});

describe('Approval Validation', () => {
  it('should validate approve action', () => {
    const validData = {
      documentId: '123e4567-e89b-12d3-a456-426614174000',
      action: 'approve' as const,
      notes: 'Looks good',
    };

    const result = approvalSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should validate reject action', () => {
    const validData = {
      documentId: '123e4567-e89b-12d3-a456-426614174000',
      action: 'reject' as const,
      notes: 'Needs revision',
    };

    const result = approvalSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should reject invalid action', () => {
    const invalidData = {
      documentId: '123e4567-e89b-12d3-a456-426614174000',
      action: 'pending',
    };

    const result = approvalSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should allow approval without notes', () => {
    const validData = {
      documentId: '123e4567-e89b-12d3-a456-426614174000',
      action: 'approve' as const,
    };

    const result = approvalSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });
});

describe('Permission Validation', () => {
  it('should validate valid permission', () => {
    const validData = {
      documentId: '123e4567-e89b-12d3-a456-426614174000',
      userId: '223e4567-e89b-12d3-a456-426614174001',
      role: 'owner' as const,
    };

    const result = permissionSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should validate all role types', () => {
    const roles = ['owner', 'approver', 'reviewer', 'viewer'] as const;
    
    roles.forEach(role => {
      const validData = {
        documentId: '123e4567-e89b-12d3-a456-426614174000',
        userId: '223e4567-e89b-12d3-a456-426614174001',
        role,
      };

      const result = permissionSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  it('should reject invalid role', () => {
    const invalidData = {
      documentId: '123e4567-e89b-12d3-a456-426614174000',
      userId: '223e4567-e89b-12d3-a456-426614174001',
      role: 'admin',
    };

    const result = permissionSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});

describe('File Validation', () => {
  it('should validate PDF file', () => {
    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    const result = validateFile(file);
    
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('should validate Word document', () => {
    const file = new File(['test content'], 'test.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });
    const result = validateFile(file);
    
    expect(result.valid).toBe(true);
  });

  it('should reject empty file', () => {
    const file = new File([], 'test.pdf', { type: 'application/pdf' });
    const result = validateFile(file);
    
    expect(result.valid).toBe(false);
    expect(result.error).toContain('empty');
  });

  it('should reject file exceeding size limit', () => {
    const largeContent = new Array(FILE_SIZE_LIMITS.MAX_SIZE + 1).fill('a').join('');
    const file = new File([largeContent], 'test.pdf', { type: 'application/pdf' });
    const result = validateFile(file);
    
    expect(result.valid).toBe(false);
    expect(result.error).toContain('size');
  });

  it('should reject unsupported file type', () => {
    const file = new File(['test'], 'test.exe', { type: 'application/x-msdownload' });
    const result = validateFile(file);
    
    expect(result.valid).toBe(false);
    expect(result.error).toContain('not allowed');
  });

  it('should validate file with custom size limit', () => {
    const content = new Array(50 * 1024 * 1024).fill('a').join(''); // 50MB
    const file = new File([content], 'test.pdf', { type: 'application/pdf' });
    
    const result = validateFile(file, { maxSize: 10 * 1024 * 1024 }); // 10MB limit
    expect(result.valid).toBe(false);
  });

  it('should detect extension mismatch', () => {
    const file = new File(['test'], 'test.pdf', { type: 'image/jpeg' });
    const result = validateFile(file);
    
    expect(result.valid).toBe(false);
    expect(result.error).toContain('extension');
  });
});

describe('validateWithMessage Helper', () => {
  it('should return success for valid data', () => {
    const result = validateWithMessage(documentMetadataSchema, {
      title: 'Test Document',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe('Test Document');
    }
  });

  it('should return error message for invalid data', () => {
    const result = validateWithMessage(documentMetadataSchema, {
      title: '',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeTruthy();
      expect(typeof result.error).toBe('string');
    }
  });

  it('should format first error from Zod', () => {
    const result = validateWithMessage(documentMetadataSchema, {
      title: '',
      reviewFrequencyDays: -1,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeTruthy();
    }
  });
});

