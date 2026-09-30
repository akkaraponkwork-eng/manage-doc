'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import {
  LayoutDashboard,
  FileText,
  Upload,
  FolderOpen,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Users,
  FilePlus,
  Settings,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'แดชบอร์ด', icon: LayoutDashboard },
  { href: '/documents', label: 'เอกสาร', icon: FileText },
  { href: '/upload', label: 'เพิ่มเอกสาร', icon: FilePlus },
  { href: '/categories', label: 'หมวดหมู่', icon: FolderOpen },
];

const adminNavItems = [
  { href: '/admin', label: 'จัดการผู้ใช้', icon: Users },
  { href: '/settings', label: 'ตั้งค่าระบบ', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-navy-950/95 backdrop-blur-xl border-b border-white/5 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => setMobileOpen(true)}
          className="text-navy-300 hover:text-white p-1 -ml-1 cursor-pointer"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-3">
          <span className="font-semibold text-white text-sm">จัดเก็บเอกสาร</span>
          <div className="w-8 h-8 bg-gradient-to-br from-navy-400 to-navy-600 rounded-lg flex items-center justify-center">
            <FileText className="w-4 h-4 text-white" />
          </div>
        </div>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full z-50 w-64 bg-navy-950 border-r border-white/5 flex flex-col transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        {/* Brand */}
        <div className="px-6 py-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-navy-400 to-navy-600 rounded-xl flex items-center justify-center shadow-lg shadow-navy-500/20">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-white text-sm leading-tight">ระบบจัดเก็บ</h1>
              <p className="text-navy-400 text-xs">เอกสารราชการ</p>
            </div>
          </div>
          {/* Close button on mobile */}
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden text-navy-400 hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-navy-700/50 text-white shadow-lg shadow-navy-500/10'
                    : 'text-navy-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-navy-300' : 'text-navy-500 group-hover:text-navy-300'}`} />
                <span className="flex-1">{item.label}</span>
                {isActive && <ChevronRight className="w-4 h-4 text-navy-400" />}
              </Link>
            );
          })}

          {/* Admin-only items */}
          {(session?.user as Record<string, unknown>)?.role === 'admin' && (
            <>
              <div className="pt-3 pb-1 px-3">
                <p className="text-xs font-medium text-navy-600 uppercase tracking-wider">ผู้ดูแล</p>
              </div>
              {adminNavItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                      isActive
                        ? 'bg-navy-700/50 text-white shadow-lg shadow-navy-500/10'
                        : 'text-navy-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-navy-300' : 'text-navy-500 group-hover:text-navy-300'}`} />
                    <span className="flex-1">{item.label}</span>
                    {isActive && <ChevronRight className="w-4 h-4 text-navy-400" />}
                  </Link>
                );
              })}
            </>
          )}
        </nav>

        {/* User / Logout */}
        <div className="px-3 py-4 border-t border-white/5">
          <div className="px-3 py-2 mb-2">
            <p className="text-xs text-navy-400">เข้าสู่ระบบในนาม</p>
            <p className="text-sm font-medium text-white truncate">
              {session?.user?.name || 'ผู้ใช้'}
            </p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-navy-400 hover:bg-red-500/10 hover:text-red-400 w-full transition-all cursor-pointer"
          >
            <LogOut className="w-5 h-5" />
            ออกจากระบบ
          </button>
        </div>
      </aside>
    </>
  );
}
