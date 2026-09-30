import { NextResponse } from 'next/server';
import { getAllCategories, createCategory, deleteCategory } from '@/lib/google-sheets';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  try {
    const categories = await getAllCategories();
    return NextResponse.json(categories);
  } catch (error) {
    console.error('List categories error:', error);
    return NextResponse.json({ error: 'Failed to list categories' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name } = await request.json();
    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const cat = {
      id: uuidv4(),
      name,
      createdAt: new Date().toISOString(),
    };

    await createCategory(cat);
    return NextResponse.json(cat, { status: 201 });
  } catch (error) {
    console.error('Create category error:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }
    await deleteCategory(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete category error:', error);
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}
