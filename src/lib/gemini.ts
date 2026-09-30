import { GoogleGenerativeAI } from '@google/generative-ai';
import type { ExtractedFields } from './types';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function extractDocumentHeader(
  imageBase64: string,
  mimeType: string = 'image/jpeg',
): Promise<ExtractedFields> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const prompt = `คุณเป็นผู้เชี่ยวชาญในการอ่านเอกสารราชการไทย
จากภาพเอกสารนี้ ให้สกัดข้อมูลส่วนหัวของหนังสือราชการ แล้วตอบเป็น JSON เท่านั้น (ไม่ต้องมี markdown code block)

ให้ตอบในรูปแบบ JSON นี้เท่านั้น:
{
  "docNumber": "เลขที่หนังสือ (ที่)",
  "date": "วันที่ (เช่น 1 มกราคม 2567)",
  "from": "จาก (ผู้ส่ง/หน่วยงาน)",
  "to": "ถึง/เรียน (ผู้รับ)",
  "subject": "เรื่อง"
}

ถ้าไม่พบข้อมูลในช่องใด ให้ใส่ค่าว่าง ""
ตอบเป็น JSON เท่านั้น ห้ามมีข้อความอื่น`;

  const result = await model.generateContent([
    prompt,
    {
      inlineData: {
        data: imageBase64,
        mimeType,
      },
    },
  ]);

  const text = result.response.text().trim();

  // Strip markdown code block if present
  const jsonStr = text.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');

  try {
    const parsed = JSON.parse(jsonStr);
    return {
      docNumber: parsed.docNumber || '',
      subject: parsed.subject || '',
      from: parsed.from || '',
      to: parsed.to || '',
      date: parsed.date || '',
    };
  } catch {
    console.error('Failed to parse Gemini response:', text);
    return { docNumber: '', subject: '', from: '', to: '', date: '' };
  }
}
