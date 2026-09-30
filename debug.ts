import { getSheetsClient } from './src/lib/google-auth';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function debug() {
  try {
    const sheets = getSheetsClient();
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'Users!A1:D',
    });
    console.log('SHEET DATA:', JSON.stringify(res.data.values, null, 2));
  } catch (e) {
    console.error(e);
  }
}
debug();
