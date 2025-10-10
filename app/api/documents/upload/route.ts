import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/auth/server';
import { saveToTemp, storeFile } from '@/lib/services/file-storage';
import { createDocument, createDocumentVersion } from '@/lib/db/repositories/documents';
import { logDocumentAction, AuditActions } from '@/lib/db/repositories/audit-log';

/**
 * POST /api/documents/upload
 * 
 * Upload a new document file.
 * Handles file validation, storage, and database record creation.
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const title = formData.get('title') as string | null;
    const directoryId = formData.get('directoryId') as string | null;
    const categoryId = formData.get('categoryId') as string | null;
    const description = formData.get('description') as string | null;

    // Validate file
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate title
    if (!title || title.trim().length === 0) {
      return NextResponse.json(
        { error: 'Document title is required' },
        { status: 400 }
      );
    }

    // Validate file size (100MB default limit)
    const maxSize = parseInt(process.env.MAX_FILE_SIZE || '104857600', 10); // 100MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File size exceeds maximum limit of ${maxSize / 1024 / 1024}MB` },
        { status: 400 }
      );
    }

    // Save file to temp storage
    const tempPath = await saveToTemp(file);

    // Create document record in database
    const document = await createDocument({
      title: title.trim(),
      directoryId: directoryId || null,
      categoryId: categoryId || null,
      description: description?.trim() || null,
    }, user);

    // Store file permanently and get file info
    const fileResult = await storeFile(
      tempPath,
      document.id,
      1, // version number
      file.name,
      user.id
    );

    // Create document version record
    const version = await createDocumentVersion(
      document.id,
      {
        filePath: fileResult.filePath,
        fileName: fileResult.fileName,
        fileHash: fileResult.fileHash,
        fileSize: fileResult.fileSize,
        mimeType: fileResult.mimeType,
        versionNumber: 1,
        uploadedBy: user.id,
      },
      user,
      true // update current version
    );

    // Log the upload action
    await logDocumentAction(
      AuditActions.DOCUMENT_CREATED,
      user.id,
      document.id,
      { 
        title: document.title,
        fileName: fileResult.fileName,
        fileSize: fileResult.fileSize,
        versionId: version.id 
      }
    );

    return NextResponse.json({
      success: true,
      document: {
        ...document,
        currentVersion: version,
      },
    }, {
      status: 201,
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Document upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload document' },
      { status: 500 }
    );
  }
}

/**
 * Rate limiting and security headers
 */
export const runtime = 'nodejs';
export const maxDuration = 60; // 60 seconds for large file uploads

