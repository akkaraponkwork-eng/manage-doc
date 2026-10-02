# Manage Doc (ระบบจัดการและสารบรรณเอกสาร)

ระบบจัดการเอกสารอิเล็กทรอนิกส์ (Document Management System) พัฒนาด้วย Next.js (App Router) เชื่อมต่อ Google Sheets สำหรับจัดเก็บฐานข้อมูล และ Google Drive สำหรับจัดเก็บไฟล์เอกสารและรูปภาพ พร้อมฟีเจอร์แปลงภาพถ่ายจากมือถือเป็นเอกสาร PDF มาตรฐาน (A4) และรองรับ Progressive Web App (PWA)

---

## ✨ จุดเด่นและฟีเจอร์หลัก (Key Features)

- 📸 **อัพโหลด & ถ่ายภาพจากโทรศัพท์ (Mobile-Ready)**
  - แยกปุ่มถ่ายภาพด้วยกล้องมือถือโดยตรง และเลือกรูปจาก Gallery ทีละหลายรูป
  - **Auto-rotate EXIF Orientation**: หมุนภาพถ่ายแนวตั้งให้อัตโนมัติด้วย `sharp` ป้องกันปัญหาภาพหมุนผิดทิศใน PDF
  - รวมรูปถ่ายหลายรูปแปลงเป็นเอกสาร PDF ขนาด A4 เดียวกันด้วย `pdf-lib`
  - รองรับการอัพโหลดไฟล์ PDF ตรง
- 🔍 **ระบบค้นหาและจัดการเอกสาร (Document Management)**
  - ค้นหาด่วนตามเลขที่หนังสือ, เรื่อง, หน่วยงานต้นทาง (จาก), ผู้รับ (ถึง), หรือวันที่
  - ตัวกรองแยกตามหมวดหมู่เอกสาร
  - พรีวิวและเปิดอ่านเอกสาร PDF ในตัว (PDF Viewer) รองรับการแชร์และดาวน์โหลด
- 💡 **Smart Combobox / Autocomplete**
  - แนะนำหน่วยงานต้นทาง ("จาก") และผู้รับ ("ถึง / เรียน") จากประวัติเอกสารเดิมที่เคยบันทึก
  - รองรับ Keyboard navigation (ลูกศรขึ้น-ลง, Enter, Escape) และตัวกรองแบบ Real-time
- 🗂️ **จัดการหมวดหมู่ (Categories)**
  - เพิ่ม แก้ไข และลบหมวดหมู่เอกสารตามโครงสร้างหน่วยงาน
- 👥 **ระบบสิทธิ์และการเข้าใช้งาน (Authentication & Roles)**
  - ตรวจสอบสิทธิ์ผ่าน NextAuth.js (Credentials Provider)
  - แบ่งระดับผู้ใช้: `admin` และ `user`
- ☁️ **Serverless Data & Cloud Storage**
  - **Database**: ใช้ Google Sheets API บันทึกข้อมูลและประวัติเอกสาร ไม่ต้องตั้ง Database Server แยก
  - **File Storage**: ใช้ Google Drive API บันทึกไฟล์รูปต้นฉบับและไฟล์ PDF รวม
- 📱 **Progressive Web App (PWA)**
  - ติดตั้งลงบนหน้าจอมือถือ (iOS / Android) และแท็บเล็ตได้เสมือนแอปพลิเคชัน

---

## 🛠️ เทคโนโลยีที่ใช้ (Tech Stack)

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **Core / UI**: React 19, TypeScript, Tailwind CSS v4, Lucide React
- **Authentication**: NextAuth.js, bcryptjs
- **Image & PDF Processing**: `sharp`, `pdf-lib`, `react-pdf`
- **Cloud & Database**: Google Sheets API v4, Google Drive API v3 (`googleapis`)
- **PWA**: `@ducanh2912/next-pwa`

---

## 📁 โครงสร้างโปรเจกต์ (Project Structure)

```text
manage-doc/
├── public/                 # ไอคอนและ PWA manifest
├── src/
│   ├── app/
│   │   ├── (app)/          # หน้าหลักหลังเข้าสู่ระบบ
│   │   │   ├── admin/      # หน้าจัดการผู้ใช้ (Admin)
│   │   │   ├── categories/ # จัดการหมวดหมู่
│   │   │   ├── dashboard/  # สรุปภาพรวมและสถิติ
│   │   │   ├── documents/  # รายการเอกสารทั้งหมด ค้นหา กรอง พรีวิว
│   │   │   ├── settings/   # ตั้งค่าและการเชื่อมต่อ Google Drive
│   │   │   └── upload/     # หน้าบันทึกเอกสารและอัพโหลดไฟล์
│   │   ├── api/            # API Routes (Documents, Categories, Upload, Auth, Drive)
│   │   ├── login/          # หน้าเข้าสู่ระบบ
│   │   └── layout.tsx
│   ├── components/         # Reusable UI Components (เช่น PdfViewer)
│   └── lib/                # Business logic, Google APIs, PDF generation, Types
│       ├── auth.ts         # NextAuth configuration
│       ├── google-auth.ts  # Google Service Account & OAuth2 client
│       ├── google-drive.ts # ฟังก์ชันอัพโหลด/ดาวน์โหลด Drive
│       ├── google-sheets.ts# CRUD เอกสารและหมวดหมู่บน Sheets
│       ├── pdf.ts          # รวมรูปแปลงเป็น PDF (A4) และ EXIF auto-rotate
│       └── types.ts        # Type definitions
├── next.config.ts
└── package.json
```

---

## ⚙️ การตั้งค่าสภาพแวดล้อม (Environment Variables)

สร้างไฟล์ `.env.local` ในโฟลเดอร์ root ของโปรเจกต์:

```env
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_key

# Google Sheets (Database) - Service Account
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project-id.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgk...-----END PRIVATE KEY-----\n"
GOOGLE_SHEET_ID=your_google_spreadsheet_id

# Google Drive (Storage) - OAuth 2.0 Credentials
GOOGLE_OAUTH_CLIENT_ID=your_oauth_client_id.apps.googleusercontent.com
GOOGLE_OAUTH_CLIENT_SECRET=your_oauth_client_secret
GOOGLE_DRIVE_FOLDER_ID=your_target_google_drive_folder_id

# Optional: Initial Refresh Token (หรือกด Connect ผ่านหน้า Settings)
GOOGLE_OAUTH_REFRESH_TOKEN=
```

---

## 🚀 เริ่มต้นใช้งาน (Getting Started)

### 1. ติดตั้ง Dependencies
```bash
npm install
```

### 2. รันในโหมด Development
```bash
npm run dev
```
เปิดเบราว์เซอร์ไปที่: [http://localhost:3000](http://localhost:3000)

> **💡 สำหรับทดสอบผ่านโทรศัพท์ในเครือข่ายเดียวกัน (LAN/Wi-Fi):**
> ตรวจสอบ IP เครื่องโฮสต์ (เช่น `http://192.168.1.X:3000`) โดย `next.config.ts` ได้กำหนด `allowedDevOrigins` รองรับการเชื่อมต่อข้ามอุปกรณ์ไว้แล้ว

### 3. ตรวจสอบ Lint & Type-checking
```bash
npm run lint
npx tsc --noEmit
```

### 4. Build สำหรับ Production
```bash
npm run build
npm start
```

---

## 📄 โครงสร้างข้อมูลใน Google Sheets

ระบบจะใช้งาน Google Spreadsheet โดยแบ่ง Sheet ย่อยดังนี้:
1. **`Documents`**: เก็บรหัสเอกสาร, เลขที่หนังสือ, เรื่อง, จาก, ถึง, วันที่, หมวดหมู่, `driveImageIds`, `drivePdfId`, ผู้สร้าง
2. **`Categories`**: เก็บรายการหมวดหมู่เอกสาร
3. **`Users`**: เก็บบัญชีผู้ใช้งาน (`username`, `passwordHash`, `role`)
4. **`Settings`**: เก็บการตั้งค่าระบบ (เช่น `google_drive_refresh_token`)
