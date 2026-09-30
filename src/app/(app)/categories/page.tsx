'use client';

import { useEffect, useState } from 'react';
import { FolderOpen, Plus, Trash2, Loader2 } from 'lucide-react';
import type { CategoryRecord } from '@/lib/types';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch {
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setAdding(true);
    try {
      await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim() }),
      });
      setNewName('');
      fetchCategories();
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('ต้องการลบหมวดหมู่นี้หรือไม่?')) return;
    setDeleting(id);
    try {
      await fetch('/api/categories', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      fetchCategories();
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-navy-900">หมวดหมู่</h1>
        <p className="text-navy-500 text-sm mt-1">จัดการหมวดหมู่เอกสาร</p>
      </div>

      {/* Add form */}
      <form onSubmit={handleAdd} className="bg-white rounded-2xl border border-navy-100 shadow-sm p-4 mb-6">
        <div className="flex gap-3">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="ชื่อหมวดหมู่ใหม่..."
            className="flex-1 px-4 py-2.5 bg-navy-50 border border-navy-100 rounded-xl text-navy-800 placeholder-navy-400 focus:outline-none focus:ring-2 focus:ring-navy-300"
          />
          <button
            type="submit"
            disabled={adding || !newName.trim()}
            className="px-5 py-2.5 bg-gradient-to-r from-navy-500 to-navy-700 hover:from-navy-400 hover:to-navy-600 text-white font-medium rounded-xl shadow-lg shadow-navy-500/20 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
          >
            {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            เพิ่ม
          </button>
        </div>
      </form>

      {/* List */}
      <div className="bg-white rounded-2xl border border-navy-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-8 h-8 border-3 border-navy-300 border-t-navy-600 rounded-full animate-spin" />
          </div>
        ) : categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-navy-400">
            <FolderOpen className="w-10 h-10 mb-2 opacity-50" />
            <p className="text-sm">ยังไม่มีหมวดหมู่</p>
          </div>
        ) : (
          <div className="divide-y divide-navy-50">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-navy-50/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-navy-100 rounded-lg flex items-center justify-center">
                    <FolderOpen className="w-4 h-4 text-navy-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-navy-800">{cat.name}</p>
                    <p className="text-xs text-navy-400">
                      {cat.createdAt ? new Date(cat.createdAt).toLocaleDateString('th-TH') : ''}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(cat.id)}
                  disabled={deleting === cat.id}
                  className="p-2 text-navy-400 hover:text-red-500 hover:bg-red-50 rounded-lg cursor-pointer disabled:opacity-50"
                >
                  {deleting === cat.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
