import { NextResponse } from 'next/server';
import { getDocumentById } from '@/lib/google-sheets';
import { downloadFile } from '@/lib/google-drive';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const doc = await getDocumentById(id);
    if (!doc || !doc.drivePdfId) {
      return new NextResponse('Not found', { status: 404 });
    }

    const stream = await downloadFile(doc.drivePdfId);
    
    // Convert Node stream to Web stream
    const webStream = new ReadableStream({
      start(controller) {
        stream.on('data', (chunk) => controller.enqueue(chunk));
        stream.on('end', () => controller.close());
        stream.on('error', (err) => controller.error(err));
      },
      cancel() {
        stream.destroy();
      }
    });

    return new NextResponse(webStream, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="document-${id}.pdf"`,
      },
    });
  } catch (error) {
    console.error('PDF download error:', error);
    return new NextResponse('Error downloading PDF', { status: 500 });
  }
}
