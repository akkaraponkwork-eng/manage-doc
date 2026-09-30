export interface DocumentRecord {
  id: string;
  docNumber: string;   // ที่
  subject: string;     // เรื่อง
  from: string;        // จาก
  to: string;          // ถึง
  date: string;        // วันที่
  category: string;
  driveImageIds: string;  // comma-separated
  drivePdfId: string;
  createdAt: string;
  createdBy: string;
}

export interface CategoryRecord {
  id: string;
  name: string;
  createdAt: string;
}

export interface UserRecord {
  id: string;
  username: string;
  passwordHash: string;
  role: 'admin' | 'user';
}

export interface ExtractedFields {
  docNumber: string;
  subject: string;
  from: string;
  to: string;
  date: string;
}
