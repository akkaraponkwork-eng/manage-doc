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
    const imageBuffers: { buffer: Buffer; mimeType: string; name: string }[] = [];

    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const mimeType = file.type || 'image/jpeg';
      imageBuffers.push({ buffer, mimeType, name: file.name });
    }

    // Upload original images to Drive in parallel
    const uploadPromises = imageBuffers.map(img => uploadFile(img.buffer, img.name, img.mimeType));
    
    // Generate PDF and upload it in parallel with image uploads
    const pdfPromise = generatePdfFromImages(imageBuffers).then(pdfBuffer => 
      uploadFile(pdfBuffer, `document_${Date.now()}.pdf`, 'application/pdf')
    );

    // Await all uploads to finish
    const [imageIds, pdfId] = await Promise.all([
      Promise.all(uploadPromises),
      pdfPromise
    ]);

    return NextResponse.json({ imageIds, pdfId });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload files' },
      { status: 500 },
    );
  }
}
