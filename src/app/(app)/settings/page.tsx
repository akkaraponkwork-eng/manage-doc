'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Settings, HardDrive, CheckCircle, AlertCircle, Loader2, ExternalLink, RefreshCw } from 'lucide-react';

function SettingsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session } = useSession();
  const role = (session?.user as Record<string, unknown>)?.role;

  const [driveStatus, setDriveStatus] = useState<'loading' | 'connected' | 'disconnected'>('loading');
  const [driveAccount, setDriveAccount] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    if (session && role !== 'admin') {
      router.push('/dashboard');
    }
  }, [session, role, router]);

  const justConnected = searchParams.get('drive_connected') === 'true';
  const driveError = searchParams.get('drive_error');

  useEffect(() => {
    if (role !== 'admin') return;
    fetch('/api/settings/drive-status')
      .then((r) => r.json())
      .then((data) => {
        setDriveStatus(data.connected ? 'connected' : 'disconnected');
        setDriveAccount(data.account || null);
      })
      .catch(() => setDriveStatus('disconnected'));
  }, []);

  const handleConnect = () => {
    setConnecting(true);
    window.location.href = '/api/auth/google-drive/connect';
  };

  if (role !== 'admin') return null;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-navy-900 flex items-center gap-2">
          <Settings className="w-6 h-6" />
          ตั้งค่าระบบ
        </h1>
        <p className="text-navy-500 text-sm mt-1">จัดการการเชื่อมต่อและการตั้งค่าต่าง ๆ</p>
      </div>

      {/* Success / Error banners */}
      {justConnected && (
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-3 rounded-xl mb-6">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          เชื่อม Google Drive สำเร็จแล้ว! ตอนนี้สามารถอัพโหลดไฟล์ได้เลยครับ
        </div>
      )}
      {driveError && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-6">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          เกิดข้อผิดพลาด: {driveError} — กรุณาลองอีกครั้ง
        </div>
      )}

      {/* Google Drive Card */}
      <div className="bg-white rounded-2xl border border-navy-100 shadow-sm p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
              driveStatus === 'connected' ? 'bg-emerald-50' : 'bg-navy-50'
            }`}>
              <HardDrive className={`w-6 h-6 ${
                driveStatus === 'connected' ? 'text-emerald-500' : 'text-navy-400'
              }`} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-navy-900">Google Drive</h2>
              <p className="text-xs text-navy-500 mt-0.5">สำหรับเก็บไฟล์รูปภาพและ PDF ของเอกสาร</p>
            </div>
          </div>

          {/* Status badge */}
          {driveStatus === 'loading' ? (
            <div className="flex items-center gap-1.5 text-xs text-navy-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              กำลังตรวจสอบ...
            </div>
          ) : driveStatus === 'connected' ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full">
              <CheckCircle className="w-3.5 h-3.5" />
              เชื่อมต่อแล้ว
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-navy-400 bg-navy-50 px-3 py-1.5 rounded-full">
              <AlertCircle className="w-3.5 h-3.5" />
              ยังไม่ได้เชื่อมต่อ
            </span>
          )}
        </div>

        {driveStatus === 'connected' && driveAccount && (
          <div className="mt-4 flex items-center gap-2 text-xs text-navy-500 bg-navy-50 rounded-xl px-3 py-2">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
            เชื่อมต่อกับบัญชี: <span className="font-medium text-navy-700">{driveAccount}</span>
          </div>
        )}

        <div className="mt-5 flex gap-3">
          <button
            onClick={handleConnect}
            disabled={connecting}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-navy-500 to-navy-700 hover:from-navy-400 hover:to-navy-600 text-white text-sm font-semibold rounded-xl shadow-lg shadow-navy-500/20 disabled:opacity-50 cursor-pointer transition-all"
          >
            {connecting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                กำลังเชื่อมต่อ...
              </>
            ) : driveStatus === 'connected' ? (
              <>
                <RefreshCw className="w-4 h-4" />
                เปลี่ยนบัญชี
              </>
            ) : (
              <>
                <ExternalLink className="w-4 h-4" />
                เชื่อม Google Drive
              </>
            )}
          </button>
        </div>

        <p className="mt-4 text-xs text-navy-400">
          เมื่อกดปุ่ม ระบบจะนำไปยังหน้า Google เพื่อขอสิทธิ์เข้าถึง Drive — โทเค็นจะถูกเก็บใน Google Sheets อย่างปลอดภัย
        </p>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-navy-500">กำลังโหลดการตั้งค่า...</div>}>
      <SettingsContent />
    </Suspense>
  );
}
