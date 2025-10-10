import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';
import { getDocumentStoragePath, getMaxDocumentSize } from '../db/env';
import { logAudit } from './audit-logger';

export interface FileUploadResult {
  filePath: string;
  fileName: string;
  fileHash: string;
  fileSize: number;
  mimeType: string;
}

export interface FileValidationOptions {
  maxSize?: number;
  allowedMimeTypes?: string[];
}

/**
 * Initialize file storage directories
 */
export async function initializeFileStorage(): Promise<void> {
  const basePath = getDocumentStoragePath();

  try {
    // Create base directory if it doesn't exist
    await fs.mkdir(basePath, { recursive: true });

    // Create subdirectories
    await fs.mkdir(path.join(basePath, 'documents'), { recursive: true });
    await fs.mkdir(path.join(basePath, 'temp'), { recursive: true });

    console.log('File storage initialized at:', basePath);
  } catch (error) {
    console.error('Error initializing file storage:', error);
    throw new Error('Failed to initialize file storage');
  }
}

/**
 * Calculate SHA-256 hash of a file
 */
async function calculateFileHash(filePath: string): Promise<string> {
  try {
    const fileBuffer = await fs.readFile(filePath);
    const hashSum = crypto.createHash('sha256');
    hashSum.update(fileBuffer);
    return hashSum.digest('hex');
  } catch (error) {
    console.error('Error calculating file hash:', error);
    throw new Error('Failed to calculate file hash');
  }
}

/**
 * Validate file before upload
 */
export async function validateFile(
  file: File,
  options?: FileValidationOptions
): Promise<void> {
  const maxSize = options?.maxSize || getMaxDocumentSize();

  // Check file size
  if (file.size > maxSize) {
    throw new Error(
      `File size (${formatBytes(file.size)}) exceeds maximum allowed size (${formatBytes(maxSize)})`
    );
  }

  // Check MIME type if allowedTypes specified
  if (options?.allowedMimeTypes && options.allowedMimeTypes.length > 0) {
    if (!options.allowedMimeTypes.includes(file.type)) {
      throw new Error(
        `File type ${file.type} is not allowed. Allowed types: ${options.allowedMimeTypes.join(', ')}`
      );
    }
  }

  // Check for empty file
  if (file.size === 0) {
    throw new Error('Cannot upload empty file');
  }
}

/**
 * Save uploaded file to temp directory
 */
export async function saveToTemp(file: File): Promise<string> {
  const basePath = getDocumentStoragePath();
  const tempDir = path.join(basePath, 'temp');
  const tempFileName = `${crypto.randomUUID()}_${sanitizeFileName(file.name)}`;
  const tempPath = path.join(tempDir, tempFileName);

  try {
    // Read file as array buffer and write to temp
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(tempPath, buffer);

    return tempPath;
  } catch (error) {
    console.error('Error saving file to temp:', error);
    throw new Error('Failed to save file to temporary location');
  }
}

/**
 * Store file permanently in document storage
 */
export async function storeFile(
  tempFilePath: string,
  documentId: string,
  versionNumber: number,
  originalFileName: string,
  userId?: string
): Promise<FileUploadResult> {
  const basePath = getDocumentStoragePath();
  const documentDir = path.join(basePath, 'documents', documentId);

  try {
    // Ensure document directory exists
    await fs.mkdir(documentDir, { recursive: true });

    // Calculate file hash
    const fileHash = await calculateFileHash(tempFilePath);

    // Get file stats
    const stats = await fs.stat(tempFilePath);

    // Get file extension
    const ext = path.extname(originalFileName);

    // Create permanent filename with version and hash
    const permanentFileName = `v${versionNumber}_${fileHash.substring(0, 16)}${ext}`;
    const permanentPath = path.join(documentDir, permanentFileName);

    // Move file from temp to permanent location
    await fs.rename(tempFilePath, permanentPath);

    // Determine MIME type (you may want to use a library like 'mime-types' for this)
    const mimeType = getMimeType(ext);

    const result = {
      filePath: path.relative(basePath, permanentPath),
      fileName: sanitizeFileName(originalFileName),
      fileHash,
      fileSize: stats.size,
      mimeType,
    };

    // Audit log
    await logAudit({
      action: 'FILE_UPLOAD',
      resourceType: 'document',
      resourceId: documentId,
      userId: userId || 'system',
      details: {
        fileName: result.fileName,
        fileSize: result.fileSize,
        fileHash: result.fileHash,
        version: versionNumber,
      },
    });

    return result;
  } catch (error) {
    // Clean up temp file if it still exists
    try {
      await fs.unlink(tempFilePath);
    } catch {}

    console.error('Error storing file:', error);
    throw new Error('Failed to store file permanently');
  }
}

/**
 * Retrieve file from storage
 */
export async function getFile(filePath: string, userId?: string, documentId?: string): Promise<Buffer> {
  const basePath = getDocumentStoragePath();
  const fullPath = path.join(basePath, filePath);

  try {
    // Enhanced security check
    validateFilePath(fullPath, basePath);

    // Verify file exists and is a file (not a directory)
    const stats = await fs.stat(fullPath);
    if (!stats.isFile()) {
      throw new Error('Path is not a file');
    }

    // Audit log
    await logAudit({
      action: 'FILE_DOWNLOAD',
      resourceType: 'document',
      resourceId: documentId || 'unknown',
      userId: userId || 'system',
      details: {
        filePath,
        fileSize: stats.size,
      },
    });

    // Read and return file
    return await fs.readFile(fullPath);
  } catch (error) {
    console.error('Error retrieving file:', error);
    throw new Error('Failed to retrieve file');
  }
}

/**
 * Verify file integrity
 */
export async function verifyFileIntegrity(
  filePath: string,
  expectedHash: string
): Promise<boolean> {
  const basePath = getDocumentStoragePath();
  const fullPath = path.join(basePath, filePath);

  try {
    const actualHash = await calculateFileHash(fullPath);
    return actualHash === expectedHash;
  } catch (error) {
    console.error('Error verifying file integrity:', error);
    return false;
  }
}

/**
 * Delete file from storage
 */
export async function deleteFile(filePath: string, userId?: string, documentId?: string): Promise<void> {
  const basePath = getDocumentStoragePath();
  const fullPath = path.join(basePath, filePath);

  try {
    // Enhanced security check
    validateFilePath(fullPath, basePath);

    // Verify file exists and is a file (not a directory)
    const stats = await fs.stat(fullPath);
    if (!stats.isFile()) {
      throw new Error('Path is not a file');
    }

    // Audit log before deletion
    await logAudit({
      action: 'FILE_DELETE',
      resourceType: 'document',
      resourceId: documentId || 'unknown',
      userId: userId || 'system',
      details: {
        filePath,
        fileSize: stats.size,
      },
    });

    await fs.unlink(fullPath);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw new Error('Failed to delete file');
  }
}

/**
 * Clean up temp files older than specified age (in hours)
 */
export async function cleanupTempFiles(olderThanHours = 24): Promise<number> {
  const basePath = getDocumentStoragePath();
  const tempDir = path.join(basePath, 'temp');
  const cutoffTime = Date.now() - olderThanHours * 60 * 60 * 1000;

  let deletedCount = 0;

  try {
    const files = await fs.readdir(tempDir);

    for (const file of files) {
      const filePath = path.join(tempDir, file);
      const stats = await fs.stat(filePath);

      if (stats.mtimeMs < cutoffTime) {
        await fs.unlink(filePath);
        deletedCount++;
      }
    }

    return deletedCount;
  } catch (error) {
    console.error('Error cleaning up temp files:', error);
    return deletedCount;
  }
}

/**
 * Find orphaned files (files without database records)
 */
export async function findOrphanedFiles(
  documentIds: string[]
): Promise<string[]> {
  const basePath = getDocumentStoragePath();
  const documentsDir = path.join(basePath, 'documents');
  const orphaned: string[] = [];

  try {
    const dirs = await fs.readdir(documentsDir);

    for (const dir of dirs) {
      if (!documentIds.includes(dir)) {
        orphaned.push(dir);
      }
    }

    return orphaned;
  } catch (error) {
    console.error('Error finding orphaned files:', error);
    return [];
  }
}

/**
 * Get storage statistics
 */
export async function getStorageStats(): Promise<{
  totalSize: number;
  documentCount: number;
  tempFileCount: number;
}> {
  const basePath = getDocumentStoragePath();
  const documentsDir = path.join(basePath, 'documents');
  const tempDir = path.join(basePath, 'temp');

  let totalSize = 0;
  let documentCount = 0;
  let tempFileCount = 0;

  try {
    // Count documents
    const docDirs = await fs.readdir(documentsDir);
    documentCount = docDirs.length;

    // Calculate total size of all documents
    for (const docDir of docDirs) {
      const docPath = path.join(documentsDir, docDir);
      const files = await fs.readdir(docPath);

      for (const file of files) {
        const filePath = path.join(docPath, file);
        const stats = await fs.stat(filePath);
        totalSize += stats.size;
      }
    }

    // Count temp files
    const tempFiles = await fs.readdir(tempDir);
    tempFileCount = tempFiles.length;

    return {
      totalSize,
      documentCount,
      tempFileCount,
    };
  } catch (error) {
    console.error('Error getting storage stats:', error);
    throw new Error('Failed to get storage statistics');
  }
}

/**
 * Sanitize filename to prevent path traversal and invalid characters
 * Enhanced security with stricter validation
 */
function sanitizeFileName(fileName: string): string {
  // Remove path components and directory traversal attempts
  let baseName = path.basename(fileName);
  
  // Remove any remaining path separators or traversal attempts
  baseName = baseName.replace(/\.\./g, '');
  baseName = baseName.replace(/[/\\]/g, '_');
  
  // Replace invalid characters (Windows + Unix)
  baseName = baseName.replace(/[<>:"|?*\x00-\x1F]/g, '_');
  
  // Remove leading/trailing dots and spaces
  baseName = baseName.trim().replace(/^\.+|\.+$/g, '');
  
  // Ensure filename is not empty after sanitization
  if (!baseName || baseName === '') {
    baseName = `file_${Date.now()}`;
  }
  
  // Limit filename length (255 bytes for most filesystems)
  const maxLength = 255;
  if (baseName.length > maxLength) {
    const ext = path.extname(baseName);
    const nameWithoutExt = baseName.slice(0, baseName.length - ext.length);
    baseName = nameWithoutExt.slice(0, maxLength - ext.length) + ext;
  }

  return baseName;
}

/**
 * Validate file path to prevent path traversal attacks
 * @throws Error if path is invalid or attempts traversal
 */
function validateFilePath(filePath: string, basePath: string): void {
  const resolvedPath = path.resolve(filePath);
  const resolvedBasePath = path.resolve(basePath);

  // Ensure path is within base directory
  if (!resolvedPath.startsWith(resolvedBasePath)) {
    throw new Error('Invalid file path: Path traversal attempt detected');
  }

  // Check for suspicious patterns
  if (filePath.includes('..') || filePath.includes('~')) {
    throw new Error('Invalid file path: Suspicious pattern detected');
  }

  // Ensure path doesn't contain null bytes
  if (filePath.includes('\0')) {
    throw new Error('Invalid file path: Null byte detected');
  }
}

/**
 * Get MIME type from file extension
 */
function getMimeType(ext: string): string {
  const mimeTypes: Record<string, string> = {
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.xls': 'application/vnd.ms-excel',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.ppt': 'application/vnd.ms-powerpoint',
    '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    '.txt': 'text/plain',
    '.csv': 'text/csv',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.zip': 'application/zip',
    '.rar': 'application/x-rar-compressed',
    '.7z': 'application/x-7z-compressed',
  };

  return mimeTypes[ext.toLowerCase()] || 'application/octet-stream';
}

/**
 * Format bytes to human-readable string
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

