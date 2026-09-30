'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Users, Plus, Trash2, Loader2, Shield, User, Eye, EyeOff } from 'lucide-react';

interface UserItem {
  id: string;
  username: string;
  role: 'admin' | 'user';
}

export default function AdminPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const role = (session?.user as Record<string, unknown>)?.role;

  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'user'>('user');
  const [adding, setAdding] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (session && role !== 'admin') {
      router.push('/dashboard');
    }
  }, [session, role, router]);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      if (!res.ok) throw new Error();
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (role === 'admin') fetchUsers();
  }, [role]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;
    setAdding(true);
    setError('');
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password, role: newRole }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'เกิดข้อผิดพลาด');
        return;
      }
      setUsername('');
      setPassword('');
      setNewRole('user');
      setShowForm(false);
      fetchUsers();
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (name === session?.user?.name) {
      alert('ไม่สามารถลบบัญชีตัวเองได้');
      return;
    }
    if (!confirm(`ต้องการลบผู้ใช้ "${name}" หรือไม่?`)) return;
    setDeleting(id);
    try {
      await fetch('/api/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      fetchUsers();
    } finally {
      setDeleting(null);
    }
  };

  if (role !== 'admin') return null;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">จัดการผู้ใช้</h1>
          <p className="text-navy-500 text-sm mt-1">เพิ่ม/ลบบัญชีผู้ใช้งานระบบ</p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setError(''); }}
          className="px-4 py-2.5 bg-gradient-to-r from-navy-500 to-navy-700 hover:from-navy-400 hover:to-navy-600 text-white font-medium rounded-xl shadow-lg shadow-navy-500/20 flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          เพิ่มผู้ใช้
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <form onSubmit={handleAdd} className="bg-white rounded-2xl border border-navy-100 shadow-sm p-5 mb-6 animate-fade-in-up">
          <h2 className="text-sm font-semibold text-navy-700 mb-4">เพิ่มผู้ใช้ใหม่</h2>

          {error && (
            <div className="mb-4 px-4 py-2.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-navy-500 mb-1">ชื่อผู้ใช้</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="username"
                className="w-full px-4 py-2.5 bg-navy-50 border border-navy-100 rounded-xl text-navy-800 placeholder-navy-400 focus:outline-none focus:ring-2 focus:ring-navy-300"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-navy-500 mb-1">รหัสผ่าน</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="password"
                  className="w-full px-4 py-2.5 bg-navy-50 border border-navy-100 rounded-xl text-navy-800 placeholder-navy-400 focus:outline-none focus:ring-2 focus:ring-navy-300 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-400 hover:text-navy-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-navy-500 mb-1">สิทธิ์</label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setNewRole('user')}
                  className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border cursor-pointer transition-all ${
                    newRole === 'user'
                      ? 'bg-navy-100 border-navy-300 text-navy-700'
                      : 'bg-white border-navy-100 text-navy-400 hover:border-navy-200'
                  }`}
                >
                  <User className="w-4 h-4 inline mr-1.5" />
                  ผู้ใช้ทั่วไป
                </button>
                <button
                  type="button"
                  onClick={() => setNewRole('admin')}
                  className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border cursor-pointer transition-all ${
                    newRole === 'admin'
                      ? 'bg-amber-50 border-amber-300 text-amber-700'
                      : 'bg-white border-navy-100 text-navy-400 hover:border-navy-200'
                  }`}
                >
                  <Shield className="w-4 h-4 inline mr-1.5" />
                  ผู้ดูแลระบบ
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-5">
            <button
              type="button"
              onClick={() => { setShowForm(false); setError(''); }}
              className="px-4 py-2.5 text-sm text-navy-500 hover:text-navy-700 cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={adding || !username.trim() || !password.trim()}
              className="px-5 py-2.5 bg-gradient-to-r from-navy-500 to-navy-700 hover:from-navy-400 hover:to-navy-600 text-white font-medium rounded-xl shadow-lg shadow-navy-500/20 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              สร้างบัญชี
            </button>
          </div>
        </form>
      )}

      {/* User list */}
      <div className="bg-white rounded-2xl border border-navy-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-8 h-8 border-3 border-navy-300 border-t-navy-600 rounded-full animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-navy-400">
            <Users className="w-10 h-10 mb-2 opacity-50" />
            <p className="text-sm">ยังไม่มีผู้ใช้</p>
          </div>
        ) : (
          <div className="divide-y divide-navy-50">
            {users.map((u) => (
              <div
                key={u.id}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-navy-50/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                    u.role === 'admin'
                      ? 'bg-amber-100 text-amber-600'
                      : 'bg-navy-100 text-navy-500'
                  }`}>
                    {u.role === 'admin' ? <Shield className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-navy-800">{u.username}</p>
                    <p className={`text-xs ${u.role === 'admin' ? 'text-amber-500' : 'text-navy-400'}`}>
                      {u.role === 'admin' ? 'ผู้ดูแลระบบ' : 'ผู้ใช้ทั่วไป'}
                    </p>
                  </div>
                </div>
                {u.username !== session?.user?.name && (
                  <button
                    onClick={() => handleDelete(u.id, u.username)}
                    disabled={deleting === u.id}
                    className="p-2 text-navy-400 hover:text-red-500 hover:bg-red-50 rounded-lg cursor-pointer disabled:opacity-50"
                  >
                    {deleting === u.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
