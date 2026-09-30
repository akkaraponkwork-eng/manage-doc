import { NextResponse } from 'next/server';
import { uploadFile } from '@/lib/google-drive';
import { generatePdfFromImages } from '@/lib/pdf';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('images') as File[];

    if (!files.length) {
      return NextResponse.json({ error: 'No images provided' }, { status: 400 });
    }

    const imageIds: string[] = [];
    let pdfId = '';

    // Check if direct PDF upload
    if (files.length === 1 && files[0].type === 'application/pdf') {
      const buffer = Buffer.from(await files[0].arrayBuffer());
      pdfId = await uploadFile(buffer, files[0].name, 'application/pdf');
      return NextResponse.json({ imageIds, pdfId });
    }

    // Otherwise handle as images
    const imageBuffers: { buffer: Buffer; mimeType: string }[] = [];

    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const mimeType = file.type || 'image/jpeg';

      // Upload original image to Drive
      const imageId = await uploadFile(buffer, file.name, mimeType);
      imageIds.push(imageId);
      imageBuffers.push({ buffer, mimeType });
    }

    // Generate PDF from all images
    const pdfBuffer = await generatePdfFromImages(imageBuffers);
    pdfId = await uploadFile(pdfBuffer, `document_${Date.now()}.pdf`, 'application/pdf');

    return NextResponse.json({ imageIds, pdfId });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload files' },
      { status: 500 },
    );
  }
}
