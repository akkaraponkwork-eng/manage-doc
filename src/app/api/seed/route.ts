import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getUserByUsername, createUser, ensureSheetsExist } from '@/lib/google-sheets';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  try {
    // 1. Ensure sheets exist first
    await ensureSheetsExist();

    // 2. Seed admin user
    const existing = await getUserByUsername('admin');
    if (existing) {
      return NextResponse.json({ message: 'Admin user already exists' });
    }

    const passwordHash = await bcrypt.hash('admin123', 12);
    await createUser({
      id: uuidv4(),
      username: 'admin',
      passwordHash,
      role: 'admin',
    });

    return NextResponse.json({ message: 'Admin user created. Username: admin, Password: admin123' });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: 'Failed to seed user' }, { status: 500 });
  }
}
