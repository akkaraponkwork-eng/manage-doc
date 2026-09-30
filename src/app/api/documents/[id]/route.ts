import { NextResponse } from 'next/server';
import { getDocumentById, updateDocument, deleteDocument } from '@/lib/google-sheets';
import { deleteFile } from '@/lib/google-drive';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const doc = await getDocumentById(id);
    if (!doc) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json(doc);
  } catch (error) {
    console.error('Get document error:', error);
    return NextResponse.json({ error: 'Failed to get document' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    await updateDocument(id, body);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update document error:', error);
    return NextResponse.json({ error: 'Failed to update document' }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const doc = await getDocumentById(id);
    if (!doc) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Delete files from Drive
    if (doc.driveImageIds) {
      for (const imgId of doc.driveImageIds.split(',')) {
        try { await deleteFile(imgId.trim()); } catch { /* ignore if already deleted */ }
      }
    }
    if (doc.drivePdfId) {
      try { await deleteFile(doc.drivePdfId); } catch { /* ignore */ }
    }

    await deleteDocument(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete document error:', error);
    return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 });
  }
}
