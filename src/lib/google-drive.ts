import { getDriveClient } from './google-auth';
import { getSetting } from './google-sheets';
import { Readable } from 'stream';

function bufferToStream(buffer: Buffer): Readable {
  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);
  return stream;
}

export async function uploadFile(
  buffer: Buffer,
  fileName: string,
  mimeType: string,
): Promise<string> {
  const drive = await getDriveClient();
  const folderId = (await getSetting('google_drive_folder_id')) || process.env.GOOGLE_DRIVE_FOLDER_ID!;

  const res = await drive.files.create({
    requestBody: {
      name: fileName,
      parents: [folderId],
    },
    media: {
      mimeType,
      body: bufferToStream(buffer),
    },
    supportsAllDrives: true,
    fields: 'id',
  });
  return res.data.id!;
}

export async function getFileUrl(fileId: string): Promise<string> {
  const drive = await getDriveClient();
  await drive.permissions.create({
    fileId,
    requestBody: { role: 'reader', type: 'anyone' },
    supportsAllDrives: true,
  });
  const res = await drive.files.get({
    fileId,
    supportsAllDrives: true,
    fields: 'webViewLink,webContentLink',
  });
  return res.data.webContentLink || res.data.webViewLink || '';
}

export async function deleteFile(fileId: string) {
  const drive = await getDriveClient();
  await drive.files.delete({ fileId, supportsAllDrives: true });
}

export async function getFileThumbnail(fileId: string): Promise<string> {
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w400`;
}

export async function downloadFile(fileId: string) {
  const drive = await getDriveClient();
  const res = await drive.files.get(
    { fileId, alt: 'media', supportsAllDrives: true },
    { responseType: 'stream' }
  );
  return res.data;
}
