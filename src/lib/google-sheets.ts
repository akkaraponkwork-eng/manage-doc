import { getSheetsClient } from './google-auth';
import type { DocumentRecord, CategoryRecord, UserRecord } from './types';

const SHEET_ID = process.env.GOOGLE_SHEET_ID!;

// ---------------------------------------------------------------------------
// Generic helpers
// ---------------------------------------------------------------------------

async function getRows(range: string): Promise<string[][]> {
  const sheets = getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range,
  });
  return (res.data.values as string[][]) || [];
}

async function appendRow(sheet: string, values: string[]) {
  const sheets = getSheetsClient();
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: `${sheet}!A:A`,
    valueInputOption: 'RAW',
    requestBody: { values: [values] },
  });
}

async function updateRow(sheet: string, rowIndex: number, values: string[]) {
  const sheets = getSheetsClient();
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `${sheet}!A${rowIndex}:${String.fromCharCode(64 + values.length)}${rowIndex}`,
    valueInputOption: 'RAW',
    requestBody: { values: [values] },
  });
}

async function deleteRow(sheet: string, rowIndex: number) {
  const sheets = getSheetsClient();
  // Get the sheetId (gid) for the named sheet
  const meta = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
  const sheetMeta = meta.data.sheets?.find(
    (s) => s.properties?.title === sheet,
  );
  if (!sheetMeta?.properties?.sheetId && sheetMeta?.properties?.sheetId !== 0)
    return;

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId: sheetMeta.properties.sheetId,
              dimension: 'ROWS',
              startIndex: rowIndex - 1, // 0-indexed
              endIndex: rowIndex,
            },
          },
        },
      ],
    },
  });
}

// ---------------------------------------------------------------------------
// Setup & Initialization
// ---------------------------------------------------------------------------

export async function ensureSheetsExist() {
  const sheets = getSheetsClient();
  const meta = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
  const existingTitles = meta.data.sheets?.map(s => s.properties?.title) || [];
  
  const requiredSheets = ['Documents', 'Categories', 'Users', 'Settings'];
  const missingSheets = requiredSheets.filter(title => !existingTitles.includes(title));
  
  // 1. Create missing sheets
  if (missingSheets.length > 0) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: {
        requests: missingSheets.map(title => ({
          addSheet: {
            properties: { title }
          }
        }))
      }
    });
  }

  // 2. Setup Headers (Schema) if sheet is empty
  const schemas: Record<string, string[]> = {
    'Documents': ['id', 'docNumber', 'subject', 'from', 'to', 'date', 'category', 'driveImageIds', 'drivePdfId', 'createdAt', 'createdBy'],
    'Categories': ['id', 'name', 'createdAt'],
    'Users': ['id', 'username', 'passwordHash', 'role'],
    'Settings': ['key', 'value'],
  };

  for (const sheetName of requiredSheets) {
    // Check if sheet has any data
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${sheetName}!A1:Z1`,
    });
    
    // If empty, add headers and format them
    if (!res.data.values || res.data.values.length === 0) {
      // Add headers
      await sheets.spreadsheets.values.append({
        spreadsheetId: SHEET_ID,
        range: `${sheetName}!A1`,
        valueInputOption: 'RAW',
        requestBody: { values: [schemas[sheetName]] },
      });

      // Format header row (bold, background color)
      // We need to fetch sheetId again because we might have just created it
      const updatedMeta = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
      const sheetId = updatedMeta.data.sheets?.find(s => s.properties?.title === sheetName)?.properties?.sheetId;
      
      if (sheetId !== undefined) {
        await sheets.spreadsheets.batchUpdate({
          spreadsheetId: SHEET_ID,
          requestBody: {
            requests: [
              {
                repeatCell: {
                  range: {
                    sheetId: sheetId,
                    startRowIndex: 0,
                    endRowIndex: 1,
                    startColumnIndex: 0,
                    endColumnIndex: schemas[sheetName].length,
                  },
                  cell: {
                    userEnteredFormat: {
                      backgroundColor: { red: 0.9, green: 0.9, blue: 0.9 },
                      textFormat: { bold: true },
                    }
                  },
                  fields: 'userEnteredFormat(backgroundColor,textFormat)'
                }
              },
              {
                updateSheetProperties: {
                  properties: {
                    sheetId: sheetId,
                    gridProperties: { frozenRowCount: 1 } // Freeze header row
                  },
                  fields: 'gridProperties.frozenRowCount'
                }
              }
            ]
          }
        });
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Documents
// ---------------------------------------------------------------------------

const DOC_COLUMNS = [
  'id', 'docNumber', 'subject', 'from', 'to', 'date',
  'category', 'driveImageIds', 'drivePdfId', 'createdAt', 'createdBy',
] as const;

function rowToDocument(row: string[]): DocumentRecord {
  const doc: Record<string, string> = {};
  DOC_COLUMNS.forEach((col, i) => {
    doc[col] = row[i] || '';
  });
  return doc as unknown as DocumentRecord;
}

export async function getAllDocuments(): Promise<DocumentRecord[]> {
  const rows = await getRows('Documents!A:K');
  return rows.filter(r => r[0] !== 'id').map(rowToDocument);
}

export async function getDocumentById(id: string): Promise<DocumentRecord | null> {
  const docs = await getAllDocuments();
  return docs.find((d) => d.id === id) || null;
}

export async function createDocument(doc: DocumentRecord) {
  const values = DOC_COLUMNS.map((col) => doc[col]);
  await appendRow('Documents', values);
}

export async function updateDocument(id: string, updates: Partial<DocumentRecord>) {
  const rows = await getRows('Documents!A:K');
  const idx = rows.findIndex((r) => r[0] === id && r[0] !== 'id');
  if (idx === -1) throw new Error('Document not found');

  const existing = rowToDocument(rows[idx]);
  const merged = { ...existing, ...updates };
  const values = DOC_COLUMNS.map((col) => merged[col]);
  await updateRow('Documents', idx + 1, values); // +1 because rows array is 0-indexed and sheet is 1-indexed (and we read from A1)
}

export async function deleteDocument(id: string) {
  const rows = await getRows('Documents!A:K');
  const idx = rows.findIndex((r) => r[0] === id && r[0] !== 'id');
  if (idx === -1) throw new Error('Document not found');
  await deleteRow('Documents', idx + 1);
}

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

export async function getAllCategories(): Promise<CategoryRecord[]> {
  const rows = await getRows('Categories!A:C');
  return rows.filter(r => r[0] !== 'id').map((r) => ({ id: r[0], name: r[1], createdAt: r[2] || '' }));
}

export async function createCategory(cat: CategoryRecord) {
  await appendRow('Categories', [cat.id, cat.name, cat.createdAt]);
}

export async function deleteCategory(id: string) {
  const rows = await getRows('Categories!A:C');
  const idx = rows.findIndex((r) => r[0] === id && r[0] !== 'id');
  if (idx === -1) throw new Error('Category not found');
  await deleteRow('Categories', idx + 1);
}

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

export async function getUserByUsername(username: string): Promise<UserRecord | null> {
  const rows = await getRows('Users!A:D');
  const row = rows.find((r) => r[1] === username);
  if (!row) return null;
  return { id: row[0], username: row[1], passwordHash: row[2], role: (row[3] as 'admin' | 'user') || 'user' };
}

export async function getAllUsers(): Promise<UserRecord[]> {
  const rows = await getRows('Users!A:D');
  return rows
    .filter((r) => r[0] !== 'id')
    .map((r) => ({
      id: r[0],
      username: r[1],
      passwordHash: r[2],
      role: (r[3] as 'admin' | 'user') || 'user',
    }));
}

export async function createUser(user: UserRecord) {
  await appendRow('Users', [user.id, user.username, user.passwordHash, user.role]);
}

export async function deleteUser(id: string) {
  const rows = await getRows('Users!A:D');
  const idx = rows.findIndex((r) => r[0] === id && r[0] !== 'id');
  if (idx === -1) throw new Error('User not found');
  await deleteRow('Users', idx + 1);
}

// ---------------------------------------------------------------------------
// Settings (key-value store)
// ---------------------------------------------------------------------------

export async function getSetting(key: string): Promise<string | null> {
  const rows = await getRows('Settings!A:B');
  const row = rows.find((r) => r[0] === key);
  return row ? (row[1] ?? null) : null;
}

export async function setSetting(key: string, value: string) {
  const sheets = getSheetsClient();
  const rows = await getRows('Settings!A:B');
  const idx = rows.findIndex((r) => r[0] === key);

  if (idx === -1) {
    // Append new key
    await appendRow('Settings', [key, value]);
  } else {
    // Update existing key (idx+1 because sheet rows are 1-indexed)
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `Settings!A${idx + 1}:B${idx + 1}`,
      valueInputOption: 'RAW',
      requestBody: { values: [[key, value]] },
    });
  }
}

