import { NextResponse } from 'next/server';

const CLIENT_ID = process.env.GOOGLE_OAUTH_CLIENT_ID!;
const REDIRECT_URI = `${process.env.NEXTAUTH_URL}/api/auth/google-drive/callback`;

export async function GET() {
  const url =
    `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${encodeURIComponent(CLIENT_ID)}` +
    `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
    `&response_type=code` +
    `&scope=${encodeURIComponent('https://www.googleapis.com/auth/drive')}` +
    `&access_type=offline` +
    `&prompt=consent`;

  return NextResponse.redirect(url);
}
