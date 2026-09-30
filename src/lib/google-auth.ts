import { google } from 'googleapis';
import { getSetting } from './google-sheets';

// Service Account — used for Google Sheets only
function getServiceAccountAuth() {
  return new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

export function getSheetsClient() {
  return google.sheets({ version: 'v4', auth: getServiceAccountAuth() });
}

// OAuth2 — used for Google Drive. Token is read from Google Sheets (Settings) at runtime.
// Falls back to GOOGLE_OAUTH_REFRESH_TOKEN env var.
export async function getDriveClient() {
  let refreshToken = process.env.GOOGLE_OAUTH_REFRESH_TOKEN || '';

  // Try to read from Settings sheet first (takes precedence over env)
  try {
    const tokenFromSheet = await getSetting('google_drive_refresh_token');
    if (tokenFromSheet) refreshToken = tokenFromSheet;
  } catch {
    // Sheets unavailable — fall back to env
  }

  if (!refreshToken) {
    throw new Error('Google Drive not connected. Go to Settings to connect.');
  }

  const oauth2 = new google.auth.OAuth2(
    process.env.GOOGLE_OAUTH_CLIENT_ID,
    process.env.GOOGLE_OAUTH_CLIENT_SECRET,
  );
  oauth2.setCredentials({ refresh_token: refreshToken });
  return google.drive({ version: 'v3', auth: oauth2 });
}
