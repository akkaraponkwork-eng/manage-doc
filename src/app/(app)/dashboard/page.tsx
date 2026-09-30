'use client';

import { useEffect, useState } from 'react';
import { FileText, FolderOpen, Calendar, TrendingUp, Clock, Loader2 } from 'lucide-react';
import type { DocumentRecord, CategoryRecord } from '@/lib/types';
import dynamic from 'next/dynamic';
import Modal from '@/components/Modal';

const PdfViewer = dynamic(() => import('@/components/PdfViewer'), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center h-full text-navy-400 gap-2">
      <Loader2 className="w-6 h-6 animate-spin" />
      <span className="text-sm">กำลังโหลดตัวอ่าน PDF...</span>
    </div>
  ),
});

interface Stats {
  total: number;
  thisMonth: number;
  categories: { name: string; count: number }[];
  recent: DocumentRecord[];
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<DocumentRecord | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [docsRes, catsRes] = await Promise.all([
          fetch('/api/documents'),
          fetch('/api/categories'),
        ]);
        const docs: DocumentRecord[] = await docsRes.json();
        const cats: CategoryRecord[] = await catsRes.json();

        const now = new Date();
        const thisMonth = docs.filter((d) => {
          const created = new Date(d.createdAt);
          return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
        });

        const catCounts = cats.map((c) => ({
          name: c.name,
          count: docs.filter((d) => d.category === c.name).length,
        }));

        setStats({
          total: docs.length,
          thisMonth: thisMonth.length,
          categories: catCounts,
          recent: docs.slice(0, 5),
        });
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-3 border-navy-300 border-t-navy-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-navy-900">แดชบอร์ด</h1>
        <p className="text-navy-500 text-sm mt-1">ภาพรวมเอกสารราชการในระบบ</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8 stagger-children">
        <StatsCard
          icon={<FileText className="w-5 h-5" />}
          label="เอกสารทั้งหมด"
          value={stats?.total || 0}
          color="blue"
        />
        <StatsCard
          icon={<Calendar className="w-5 h-5" />}
          label="เดือนนี้"
          value={stats?.thisMonth || 0}
          color="emerald"
        />
        <StatsCard
          icon={<FolderOpen className="w-5 h-5" />}
          label="หมวดหมู่"
          value={stats?.categories.length || 0}
          color="amber"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category breakdown */}
        <div className="bg-white rounded-2xl border border-navy-100 shadow-sm p-6 animate-fade-in-up">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-navy-500" />
            <h2 className="text-lg font-semibold text-navy-900">เอกสารแยกตามหมวดหมู่</h2>
          </div>
          {stats?.categories.length ? (
            <div className="space-y-3">
              {stats.categories.map((cat) => (
                <div key={cat.name} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-navy-700">{cat.name}</span>
                      <span className="text-xs text-navy-400">{cat.count} รายการ</span>
                    </div>
                    <div className="w-full bg-navy-100 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-navy-400 to-navy-600 h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${stats.total > 0 ? (cat.count / stats.total) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-navy-400 text-sm">ยังไม่มีหมวดหมู่</p>
          )}
        </div>

        {/* Recent documents */}
        <div className="bg-white rounded-2xl border border-navy-100 shadow-sm p-6 animate-fade-in-up">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-navy-500" />
            <h2 className="text-lg font-semibold text-navy-900">เอกสารล่าสุด</h2>
          </div>
          {stats?.recent.length ? (
            <div className="space-y-3">
              {stats.recent.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => setSelectedDoc(doc)}
                  className="flex items-start gap-3 p-3 rounded-xl hover:bg-navy-50 transition-colors cursor-pointer"
                >
                  <div className="w-8 h-8 bg-navy-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <FileText className="w-4 h-4 text-navy-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-navy-800 truncate">{doc.subject || 'ไม่มีเรื่อง'}</p>
                    <p className="text-xs text-navy-400 mt-0.5">
                      {doc.docNumber && `${doc.docNumber} · `}
                      {doc.date || new Date(doc.createdAt).toLocaleDateString('th-TH')}
                    </p>
                  </div>
                  {doc.category && (
                    <span className="text-xs bg-navy-100 text-navy-600 px-2 py-0.5 rounded-full flex-shrink-0">
                      {doc.category}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-navy-400 text-sm">ยังไม่มีเอกสาร</p>
          )}
        </div>
      </div>

      {/* View Modal */}
      {selectedDoc && (
        <Modal onClose={() => setSelectedDoc(null)} title="รายละเอียดเอกสาร" size="4xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 h-[75vh] md:h-[70vh]">
            <div className="hidden md:block space-y-4 overflow-y-auto pr-2">
              <Field label="ที่" value={selectedDoc.docNumber} />
              <Field label="เรื่อง" value={selectedDoc.subject} />
              <Field label="จาก" value={selectedDoc.from} />
              <Field label="ถึง" value={selectedDoc.to} />
              <Field label="วันที่" value={selectedDoc.date} />
              <Field label="หมวดหมู่" value={selectedDoc.category} />
              <Field label="วันที่บันทึก" value={new Date(selectedDoc.createdAt).toLocaleString('th-TH')} />
            </div>
            
            <div className="col-span-1 md:col-span-2 h-full bg-navy-50 rounded-xl overflow-hidden border border-navy-100 flex flex-col">
              {selectedDoc.drivePdfId ? (
                <PdfViewer fileUrl={`/api/documents/${selectedDoc.id}/pdf`} />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-navy-400 text-sm">
                  ไม่มีไฟล์แนบ
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function StatsCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: 'blue' | 'emerald' | 'amber';
}) {
  const colorMap = {
    blue: 'from-navy-500 to-navy-700 shadow-navy-500/20',
    emerald: 'from-emerald-500 to-emerald-700 shadow-emerald-500/20',
    amber: 'from-amber-500 to-amber-700 shadow-amber-500/20',
  };

  return (
    <div className="bg-white rounded-2xl border border-navy-100 shadow-sm p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 bg-gradient-to-br ${colorMap[color]} rounded-xl flex items-center justify-center text-white shadow-lg`}>
          {icon}
        </div>
        <div>
          <p className="text-sm text-navy-500">{label}</p>
          <p className="text-2xl font-bold text-navy-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-navy-400">{label}</p>
      <p className="text-sm font-medium text-navy-900">{value || '-'}</p>
    </div>
  );
}
