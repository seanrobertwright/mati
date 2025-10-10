import { promises as fs } from 'fs';
import path from 'path';
import { createReadStream, createWriteStream } from 'fs';
import { createGzip, createGunzip } from 'zlib';
import { pipeline } from 'stream/promises';
import { getDocumentStoragePath } from '../db/env';
import { db } from '../db';
import { documents, documentVersions, directories } from '../db/schema';
import { logAudit } from './audit-logger';

interface BackupMetadata {
  timestamp: Date;
  documentCount: number;
  versionCount: number;
  totalSize: number;
  version: string;
}

/**
 * Create a backup of document storage and metadata
 */
export async function createBackup(
  backupPath: string,
  userId: string
): Promise<BackupMetadata> {
  const basePath = getDocumentStoragePath();
  const timestamp = new Date();
  const backupDir = path.join(backupPath, `backup_${timestamp.getTime()}`);

  try {
    // Create backup directory
    await fs.mkdir(backupDir, { recursive: true });

    // 1. Backup database metadata
    const [allDocuments, allVersions, allDirectories] = await Promise.all([
      db.select().from(documents),
      db.select().from(documentVersions),
      db.select().from(directories),
    ]);

    const metadata: BackupMetadata = {
      timestamp,
      documentCount: allDocuments.length,
      versionCount: allVersions.length,
      totalSize: 0,
      version: '1.0',
    };

    // Save metadata as JSON
    const metadataPath = path.join(backupDir, 'metadata.json');
    await fs.writeFile(
      metadataPath,
      JSON.stringify(
        {
          ...metadata,
          documents: allDocuments,
          versions: allVersions,
          directories: allDirectories,
        },
        null,
        2
      )
    );

    // 2. Backup files
    const filesDir = path.join(backupDir, 'files');
    await fs.mkdir(filesDir, { recursive: true });

    let totalSize = 0;
    const documentsDir = path.join(basePath, 'documents');

    // Copy all document files
    const docDirs = await fs.readdir(documentsDir);
    for (const docDir of docDirs) {
      const srcDir = path.join(documentsDir, docDir);
      const destDir = path.join(filesDir, docDir);
      await fs.mkdir(destDir, { recursive: true });

      const files = await fs.readdir(srcDir);
      for (const file of files) {
        const srcFile = path.join(srcDir, file);
        const destFile = path.join(destDir, file);
        const stats = await fs.stat(srcFile);
        totalSize += stats.size;

        // Compress and copy file
        await pipeline(
          createReadStream(srcFile),
          createGzip(),
          createWriteStream(`${destFile}.gz`)
        );
      }
    }

    metadata.totalSize = totalSize;

    // Update metadata with final size
    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));

    // Audit log
    await logAudit({
      action: 'BACKUP_CREATE',
      resourceType: 'system',
      resourceId: 'document_storage',
      userId,
      details: {
        backupPath: backupDir,
        documentCount: metadata.documentCount,
        totalSize: metadata.totalSize,
      },
    });

    return metadata;
  } catch (error) {
    console.error('Backup creation failed:', error);
    throw new Error('Failed to create backup');
  }
}

/**
 * Restore document storage from backup
 */
export async function restoreBackup(
  backupDir: string,
  userId: string,
  options: {
    overwrite?: boolean;
    verifyIntegrity?: boolean;
  } = {}
): Promise<void> {
  const basePath = getDocumentStoragePath();
  const { overwrite = false, verifyIntegrity = true } = options;

  try {
    // 1. Read backup metadata
    const metadataPath = path.join(backupDir, 'metadata.json');
    const metadataContent = await fs.readFile(metadataPath, 'utf-8');
    const backup = JSON.parse(metadataContent);

    // 2. Verify backup integrity (optional)
    if (verifyIntegrity) {
      await verifyBackupIntegrity(backupDir);
    }

    // 3. Restore files
    const filesDir = path.join(backupDir, 'files');
    const documentsDir = path.join(basePath, 'documents');

    if (overwrite) {
      // Clear existing documents if overwrite is enabled
      await fs.rm(documentsDir, { recursive: true, force: true });
      await fs.mkdir(documentsDir, { recursive: true });
    }

    const docDirs = await fs.readdir(filesDir);
    for (const docDir of docDirs) {
      const srcDir = path.join(filesDir, docDir);
      const destDir = path.join(documentsDir, docDir);
      await fs.mkdir(destDir, { recursive: true });

      const files = await fs.readdir(srcDir);
      for (const file of files) {
        if (file.endsWith('.gz')) {
          const srcFile = path.join(srcDir, file);
          const destFile = path.join(destDir, file.replace('.gz', ''));

          // Decompress and restore file
          await pipeline(
            createReadStream(srcFile),
            createGunzip(),
            createWriteStream(destFile)
          );
        }
      }
    }

    // 4. Restore database metadata (manual step - requires careful handling)
    // Note: This should be done carefully to avoid data loss
    // For now, we just log the restoration

    // Audit log
    await logAudit({
      action: 'BACKUP_RESTORE',
      resourceType: 'system',
      resourceId: 'document_storage',
      userId,
      details: {
        backupPath: backupDir,
        overwrite,
        verifyIntegrity,
        documentCount: backup.documentCount,
      },
    });
  } catch (error) {
    console.error('Backup restoration failed:', error);
    throw new Error('Failed to restore backup');
  }
}

/**
 * Verify backup integrity
 */
async function verifyBackupIntegrity(backupDir: string): Promise<void> {
  try {
    // Check metadata exists
    const metadataPath = path.join(backupDir, 'metadata.json');
    await fs.access(metadataPath);

    // Check files directory exists
    const filesDir = path.join(backupDir, 'files');
    await fs.access(filesDir);

    // Read metadata
    const metadataContent = await fs.readFile(metadataPath, 'utf-8');
    const backup = JSON.parse(metadataContent);

    // Verify file count matches metadata
    const docDirs = await fs.readdir(filesDir);
    const expectedDocCount = backup.documentCount;

    if (docDirs.length !== expectedDocCount) {
      console.warn(
        `Document count mismatch: expected ${expectedDocCount}, found ${docDirs.length}`
      );
    }

    // Additional integrity checks can be added here
    // - Verify file hashes
    // - Check file sizes
    // - Validate JSON structure
  } catch (error) {
    throw new Error('Backup integrity verification failed');
  }
}

/**
 * List available backups
 */
export async function listBackups(backupPath: string): Promise<BackupMetadata[]> {
  try {
    const entries = await fs.readdir(backupPath, { withFileTypes: true });
    const backups: BackupMetadata[] = [];

    for (const entry of entries) {
      if (entry.isDirectory() && entry.name.startsWith('backup_')) {
        const metadataPath = path.join(backupPath, entry.name, 'metadata.json');
        try {
          const content = await fs.readFile(metadataPath, 'utf-8');
          const metadata = JSON.parse(content);
          backups.push({
            ...metadata,
            timestamp: new Date(metadata.timestamp),
          });
        } catch {
          // Skip invalid backups
          continue;
        }
      }
    }

    // Sort by timestamp (newest first)
    return backups.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  } catch (error) {
    console.error('Failed to list backups:', error);
    return [];
  }
}

/**
 * Delete old backups (retention policy)
 */
export async function cleanupOldBackups(
  backupPath: string,
  retainCount: number,
  userId: string
): Promise<number> {
  try {
    const backups = await listBackups(backupPath);

    // Keep only the most recent backups
    const toDelete = backups.slice(retainCount);
    let deletedCount = 0;

    for (const backup of toDelete) {
      const backupDir = path.join(
        backupPath,
        `backup_${new Date(backup.timestamp).getTime()}`
      );
      await fs.rm(backupDir, { recursive: true, force: true });
      deletedCount++;
    }

    // Audit log
    if (deletedCount > 0) {
      await logAudit({
        action: 'BACKUP_CLEANUP',
        resourceType: 'system',
        resourceId: 'document_storage',
        userId,
        details: {
          deletedCount,
          retainCount,
        },
      });
    }

    return deletedCount;
  } catch (error) {
    console.error('Backup cleanup failed:', error);
    return 0;
  }
}

