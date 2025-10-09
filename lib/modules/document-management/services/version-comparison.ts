import { getDocumentVersions, getDocumentVersion } from '@/lib/db/repositories/documents';
import type { DocumentVersion } from '@/lib/db/repositories/documents';

export interface VersionComparison {
  oldVersion: DocumentVersion;
  newVersion: DocumentVersion;
  versionDiff: number;
  timeBetween: number; // in milliseconds
  daysBetween: number;
  sizeChange: number; // in bytes
  sizeChangePercent: number;
  hashChanged: boolean;
  uploadedBy: {
    old: string;
    new: string;
    sameUser: boolean;
  };
}

/**
 * Compare two document versions
 */
export async function compareVersions(
  versionId1: string,
  versionId2: string
): Promise<VersionComparison | null> {
  try {
    const [version1, version2] = await Promise.all([
      getDocumentVersion(versionId1),
      getDocumentVersion(versionId2),
    ]);

    if (!version1 || !version2) {
      return null;
    }

    // Ensure versions are from same document
    if (version1.documentId !== version2.documentId) {
      throw new Error('Versions must be from the same document');
    }

    // Determine which is old and new
    const [oldVersion, newVersion] =
      version1.versionNumber < version2.versionNumber
        ? [version1, version2]
        : [version2, version1];

    const timeBetween = newVersion.createdAt.getTime() - oldVersion.createdAt.getTime();
    const daysBetween = Math.floor(timeBetween / (1000 * 60 * 60 * 24));
    const sizeChange = newVersion.fileSize - oldVersion.fileSize;
    const sizeChangePercent =
      oldVersion.fileSize > 0
        ? (sizeChange / oldVersion.fileSize) * 100
        : 0;

    return {
      oldVersion,
      newVersion,
      versionDiff: newVersion.versionNumber - oldVersion.versionNumber,
      timeBetween,
      daysBetween,
      sizeChange,
      sizeChangePercent,
      hashChanged: oldVersion.fileHash !== newVersion.fileHash,
      uploadedBy: {
        old: oldVersion.uploadedBy,
        new: newVersion.uploadedBy,
        sameUser: oldVersion.uploadedBy === newVersion.uploadedBy,
      },
    };
  } catch (error) {
    console.error('Error comparing versions:', error);
    throw error instanceof Error ? error : new Error('Failed to compare versions');
  }
}

/**
 * Get version history summary for a document
 */
export interface VersionHistorySummary {
  totalVersions: number;
  currentVersion: number;
  firstVersion: DocumentVersion;
  latestVersion: DocumentVersion;
  averageTimeBetweenVersions: number; // in days
  totalSizeChange: number; // in bytes
  uniqueContributors: number;
  versionsByUser: Record<string, number>;
}

export async function getVersionHistorySummary(
  documentId: string
): Promise<VersionHistorySummary | null> {
  try {
    const versions = await getDocumentVersions(documentId);

    if (versions.length === 0) {
      return null;
    }

    const firstVersion = versions[versions.length - 1];
    const latestVersion = versions[0];

    // Calculate average time between versions
    let totalTimeDiff = 0;
    for (let i = 0; i < versions.length - 1; i++) {
      const timeDiff =
        versions[i].createdAt.getTime() - versions[i + 1].createdAt.getTime();
      totalTimeDiff += timeDiff;
    }
    const averageTimeBetweenVersions =
      versions.length > 1
        ? totalTimeDiff / (versions.length - 1) / (1000 * 60 * 60 * 24)
        : 0;

    // Calculate total size change
    const totalSizeChange = latestVersion.fileSize - firstVersion.fileSize;

    // Count versions by user
    const versionsByUser: Record<string, number> = {};
    const uniqueUsers = new Set<string>();

    versions.forEach((version) => {
      versionsByUser[version.uploadedBy] =
        (versionsByUser[version.uploadedBy] || 0) + 1;
      uniqueUsers.add(version.uploadedBy);
    });

    return {
      totalVersions: versions.length,
      currentVersion: latestVersion.versionNumber,
      firstVersion,
      latestVersion,
      averageTimeBetweenVersions,
      totalSizeChange,
      uniqueContributors: uniqueUsers.size,
      versionsByUser,
    };
  } catch (error) {
    console.error('Error getting version history summary:', error);
    throw new Error('Failed to get version history summary');
  }
}

/**
 * Find version by hash (detect if content was uploaded before)
 */
export async function findVersionByHash(
  documentId: string,
  fileHash: string
): Promise<DocumentVersion | null> {
  try {
    const versions = await getDocumentVersions(documentId);
    return versions.find((v) => v.fileHash === fileHash) || null;
  } catch (error) {
    console.error('Error finding version by hash:', error);
    throw new Error('Failed to find version by hash');
  }
}

/**
 * Check if a new file is duplicate of existing version
 */
export async function isDuplicateVersion(
  documentId: string,
  fileHash: string
): Promise<{ isDuplicate: boolean; existingVersion?: DocumentVersion }> {
  try {
    const existingVersion = await findVersionByHash(documentId, fileHash);

    return {
      isDuplicate: existingVersion !== null,
      existingVersion: existingVersion || undefined,
    };
  } catch (error) {
    console.error('Error checking duplicate version:', error);
    throw new Error('Failed to check duplicate version');
  }
}

/**
 * Get version timeline (chronological list with metadata)
 */
export interface VersionTimelineEntry {
  version: DocumentVersion;
  isCurrentVersion: boolean;
  changesSince: {
    previousVersion?: DocumentVersion;
    timeSince?: number; // milliseconds
    daysSince?: number;
    sizeChange?: number;
  };
}

export async function getVersionTimeline(
  documentId: string,
  currentVersionId?: string
): Promise<VersionTimelineEntry[]> {
  try {
    const versions = await getDocumentVersions(documentId);

    return versions.map((version, index) => {
      const previousVersion = versions[index + 1];
      const changesSince: VersionTimelineEntry['changesSince'] = {};

      if (previousVersion) {
        const timeSince =
          version.createdAt.getTime() - previousVersion.createdAt.getTime();
        changesSince.previousVersion = previousVersion;
        changesSince.timeSince = timeSince;
        changesSince.daysSince = Math.floor(
          timeSince / (1000 * 60 * 60 * 24)
        );
        changesSince.sizeChange =
          version.fileSize - previousVersion.fileSize;
      }

      return {
        version,
        isCurrentVersion: currentVersionId
          ? version.id === currentVersionId
          : index === 0,
        changesSince,
      };
    });
  } catch (error) {
    console.error('Error getting version timeline:', error);
    throw new Error('Failed to get version timeline');
  }
}

/**
 * Get version statistics
 */
export interface VersionStatistics {
  totalVersions: number;
  averageFileSize: number;
  minFileSize: number;
  maxFileSize: number;
  averageDaysBetweenVersions: number;
  mostActiveContributor: {
    userId: string;
    versionCount: number;
  } | null;
  versionFrequency: {
    last7Days: number;
    last30Days: number;
    last90Days: number;
  };
}

export async function getVersionStatistics(
  documentId: string
): Promise<VersionStatistics> {
  try {
    const versions = await getDocumentVersions(documentId);

    if (versions.length === 0) {
      return {
        totalVersions: 0,
        averageFileSize: 0,
        minFileSize: 0,
        maxFileSize: 0,
        averageDaysBetweenVersions: 0,
        mostActiveContributor: null,
        versionFrequency: {
          last7Days: 0,
          last30Days: 0,
          last90Days: 0,
        },
      };
    }

    // File size stats
    const fileSizes = versions.map((v) => v.fileSize);
    const averageFileSize =
      fileSizes.reduce((a, b) => a + b, 0) / fileSizes.length;
    const minFileSize = Math.min(...fileSizes);
    const maxFileSize = Math.max(...fileSizes);

    // Time between versions
    let totalDays = 0;
    for (let i = 0; i < versions.length - 1; i++) {
      const days =
        (versions[i].createdAt.getTime() - versions[i + 1].createdAt.getTime()) /
        (1000 * 60 * 60 * 24);
      totalDays += days;
    }
    const averageDaysBetweenVersions =
      versions.length > 1 ? totalDays / (versions.length - 1) : 0;

    // Most active contributor
    const contributorCounts: Record<string, number> = {};
    versions.forEach((v) => {
      contributorCounts[v.uploadedBy] =
        (contributorCounts[v.uploadedBy] || 0) + 1;
    });

    let mostActiveContributor: { userId: string; versionCount: number } | null =
      null;
    let maxCount = 0;
    for (const [userId, count] of Object.entries(contributorCounts)) {
      if (count > maxCount) {
        maxCount = count;
        mostActiveContributor = { userId, versionCount: count };
      }
    }

    // Version frequency
    const now = new Date();
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const last90Days = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    const versionFrequency = {
      last7Days: versions.filter((v) => v.createdAt >= last7Days).length,
      last30Days: versions.filter((v) => v.createdAt >= last30Days).length,
      last90Days: versions.filter((v) => v.createdAt >= last90Days).length,
    };

    return {
      totalVersions: versions.length,
      averageFileSize,
      minFileSize,
      maxFileSize,
      averageDaysBetweenVersions,
      mostActiveContributor,
      versionFrequency,
    };
  } catch (error) {
    console.error('Error getting version statistics:', error);
    throw new Error('Failed to get version statistics');
  }
}

