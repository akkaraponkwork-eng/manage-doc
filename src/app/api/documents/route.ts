import { NextResponse } from 'next/server';
import { getAllDocuments, createDocument } from '@/lib/google-sheets';
import type { DocumentRecord } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';

    let docs = await getAllDocuments();

    if (category) {
      docs = docs.filter((d) => d.category === category);
    }

    if (search) {
      const q = search.toLowerCase();
      docs = docs.filter(
        (d) =>
          d.subject.toLowerCase().includes(q) ||
          d.from.toLowerCase().includes(q) ||
          d.to.toLowerCase().includes(q) ||
          d.docNumber.toLowerCase().includes(q) ||
          d.date.toLowerCase().includes(q),
      );
    }

    // Sort by createdAt descending
    docs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json(docs);
  } catch (error) {
    console.error('List documents error:', error);
    return NextResponse.json({ error: 'Failed to list documents' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const doc: DocumentRecord = {
      id: uuidv4(),
      docNumber: body.docNumber || '',
      subject: body.subject || '',
      from: body.from || '',
      to: body.to || '',
      date: body.date || '',
      category: body.category || '',
      driveImageIds: body.driveImageIds || '',
      drivePdfId: body.drivePdfId || '',
      createdAt: new Date().toISOString(),
      createdBy: body.createdBy || '',
    };

    await createDocument(doc);
    return NextResponse.json(doc, { status: 201 });
  } catch (error) {
    console.error('Create document error:', error);
    return NextResponse.json({ error: 'Failed to create document' }, { status: 500 });
  }
}
