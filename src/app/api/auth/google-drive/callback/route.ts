import { NextResponse } from 'next/server';
import { setSetting, ensureSheetsExist } from '@/lib/google-sheets';
import { google } from 'googleapis';

const CLIENT_ID = process.env.GOOGLE_OAUTH_CLIENT_ID!;
const CLIENT_SECRET = process.env.GOOGLE_OAUTH_CLIENT_SECRET!;
const REDIRECT_URI = `${process.env.NEXTAUTH_URL}/api/auth/google-drive/callback`;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error || !code) {
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/settings?drive_error=${error || 'no_code'}`);
  }

  try {
    // Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });

    const tokens = await tokenRes.json();

    if (!tokens.refresh_token) {
      throw new Error('No refresh_token in response: ' + JSON.stringify(tokens));
    }

    // Ensure Settings sheet exists, then save token
    await ensureSheetsExist();
    await setSetting('google_drive_refresh_token', tokens.refresh_token);

    // Now initialize Drive client to create/find a folder automatically
    const oauth2 = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET);
    oauth2.setCredentials({ refresh_token: tokens.refresh_token });
    const drive = google.drive({ version: 'v3', auth: oauth2 });

    const folderName = 'Manage-Doc-Uploads';
    // Search for existing folder
    const searchRes = await drive.files.list({
      q: `mimeType='application/vnd.google-apps.folder' and name='${folderName}' and trashed=false`,
      fields: 'files(id)',
      spaces: 'drive',
    });

    let folderId = searchRes.data.files?.[0]?.id;

    // Create if not found
    if (!folderId) {
      const createRes = await drive.files.create({
        requestBody: {
          name: folderName,
          mimeType: 'application/vnd.google-apps.folder',
        },
        fields: 'id',
      });
      folderId = createRes.data.id!;
    }

    // Save folder ID to settings
    await setSetting('google_drive_folder_id', folderId);

    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/settings?drive_connected=true`);
  } catch (err) {
    console.error('Drive OAuth callback error:', err);
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/settings?drive_error=token_exchange_failed`);
  }
}
