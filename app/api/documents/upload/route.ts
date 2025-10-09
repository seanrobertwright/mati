import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/auth/server';
import { uploadFile } from '@/lib/services/file-storage';
import { createDocument } from '@/lib/db/repositories/documents';

/**
 * POST /api/documents/upload
 * 
 * Upload a new document file.
 * Handles file validation, storage, and database record creation.
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const user = await getUser();
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

    // TODO: Validate file type against allowed types

    // Upload file to storage
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const uploadResult = await uploadFile(fileBuffer, file.name, file.type);

    // Create document record in database
    // TODO: Implement createDocument repository function
    // const document = await createDocument({
    //   title: title.trim(),
    //   directoryId: directoryId || null,
    //   categoryId: categoryId || null,
    //   description: description?.trim() || null,
    //   ownerId: user.id,
    //   currentVersionId: null, // Will be set after creating version
    //   status: 'draft',
    // });

    return NextResponse.json({
      success: true,
      // document,
      file: {
        path: uploadResult.path,
        hash: uploadResult.hash,
        size: uploadResult.size,
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

