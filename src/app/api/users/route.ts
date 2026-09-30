import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUserByUsername, createUser } from '@/lib/google-sheets';
import { getAllUsers, deleteUser } from '@/lib/google-sheets';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as Record<string, unknown>)?.role;
  if (!session || role !== 'admin') return null;
  return session;
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const users = await getAllUsers();
    // Strip password hashes before sending
    const safe = users.map(({ id, username, role }) => ({ id, username, role }));
    return NextResponse.json(safe);
  } catch (error) {
    console.error('List users error:', error);
    return NextResponse.json({ error: 'Failed to list users' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { username, password, role } = await request.json();
    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    const existing = await getUserByUsername(username);
    if (existing) {
      return NextResponse.json({ error: 'Username already exists' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = {
      id: uuidv4(),
      username,
      passwordHash,
      role: (role === 'admin' ? 'admin' : 'user') as 'admin' | 'user',
    };

    await createUser(user);
    return NextResponse.json({ id: user.id, username: user.username, role: user.role }, { status: 201 });
  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }
    await deleteUser(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
