import { NextResponse } from 'next/server';
import { getSheetsClient } from '@/lib/google-auth';

export async function GET() {
  try {
    const sheets = getSheetsClient();
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'Users!A1:Z10',
    });
    
    return NextResponse.json({
      sheetData: res.data.values || []
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message });
  }
}
