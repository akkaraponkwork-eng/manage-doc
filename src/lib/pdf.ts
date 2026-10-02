import { PDFDocument } from 'pdf-lib';
import sharp from 'sharp';

export async function generatePdfFromImages(
  images: { buffer: Buffer; mimeType: string }[],
): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();

  for (const img of images) {
    // Auto-rotate based on EXIF orientation (fixes portrait photos from phones)
    const rotatedBuffer = await sharp(img.buffer).rotate().jpeg({ quality: 90 }).toBuffer();
    const embeddedImage = await pdfDoc.embedJpg(rotatedBuffer);

    const { width, height } = embeddedImage;

    // Scale to fit A4 (595 x 842 points) while maintaining aspect ratio
    const a4Width = 595;
    const a4Height = 842;
    const scale = Math.min(a4Width / width, a4Height / height, 1);
    const scaledWidth = width * scale;
    const scaledHeight = height * scale;

    const page = pdfDoc.addPage([a4Width, a4Height]);
    page.drawImage(embeddedImage, {
      x: (a4Width - scaledWidth) / 2,
      y: (a4Height - scaledHeight) / 2,
      width: scaledWidth,
      height: scaledHeight,
    });
  }

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
