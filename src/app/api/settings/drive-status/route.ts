import { NextResponse } from 'next/server';
import { getSetting } from '@/lib/google-sheets';
import { getDriveClient } from '@/lib/google-auth';

export async function GET() {
  try {
    const token = await getSetting('google_drive_refresh_token');
    if (!token) {
      return NextResponse.json({ connected: false });
    }

    // Try fetching user info to verify token is still valid
    try {
      const drive = await getDriveClient();
      const aboutRes = await drive.about.get({ fields: 'user' });
      const email = aboutRes.data.user?.emailAddress || null;
      return NextResponse.json({ connected: true, account: email });
    } catch {
      return NextResponse.json({ connected: true, account: null });
    }
  } catch {
    return NextResponse.json({ connected: false });
  }
}
