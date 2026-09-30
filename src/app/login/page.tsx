'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FileText, Lock, User, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await signIn('credentials', {
      username,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 px-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-navy-700/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-navy-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md animate-fade-in-up">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-navy-400 to-navy-600 rounded-2xl shadow-lg shadow-navy-500/25 mb-4">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">ระบบจัดเก็บเอกสารราชการ</h1>
          <p className="text-navy-300 mt-1 text-sm">เข้าสู่ระบบเพื่อจัดการเอกสาร</p>
        </div>

        {/* Login Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-navy-200 mb-1.5">
                ชื่อผู้ใช้
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-navy-400 focus:outline-none focus:ring-2 focus:ring-navy-400 focus:border-transparent"
                  placeholder="กรอกชื่อผู้ใช้"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-navy-200 mb-1.5">
                รหัสผ่าน
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-navy-400 focus:outline-none focus:ring-2 focus:ring-navy-400 focus:border-transparent"
                  placeholder="กรอกรหัสผ่าน"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-300 text-sm px-4 py-2.5 rounded-xl">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-gradient-to-r from-navy-500 to-navy-600 hover:from-navy-400 hover:to-navy-500 text-white font-semibold rounded-xl shadow-lg shadow-navy-500/25 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  กำลังเข้าสู่ระบบ...
                </>
              ) : (
                'เข้าสู่ระบบ'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
