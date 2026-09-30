'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Search, Filter, FileText, Trash2, Edit3, Eye, X,
  ChevronLeft, ChevronRight, Download, Loader2,
  ArrowUpDown, ArrowUp, ArrowDown
} from 'lucide-react';
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

export default function DocumentsPage() {
  const [pageSize, setPageSize] = useState(10);
  const [docs, setDocs] = useState<DocumentRecord[]>([]);
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState<keyof DocumentRecord>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedDoc, setSelectedDoc] = useState<DocumentRecord | null>(null);
  const [editDoc, setEditDoc] = useState<DocumentRecord | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchDocs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (categoryFilter) params.set('category', categoryFilter);
      const res = await fetch(`/api/documents?${params}`);
      const data = await res.json();
      setDocs(Array.isArray(data) ? data : []);
    } catch {
      setDocs([]);
    } finally {
      setLoading(false);
    }
  }, [search, categoryFilter]);

  useEffect(() => {
    fetch('/api/categories').then((r) => r.json()).then((data) => {
      setCategories(Array.isArray(data) ? data : []);
    });
  }, []);

  useEffect(() => {
    const timer = setTimeout(fetchDocs, 300);
    return () => clearTimeout(timer);
  }, [fetchDocs]);

  const sortedDocs = [...docs].sort((a, b) => {
    let valA: string | number = a[sortField] || '';
    let valB: string | number = b[sortField] || '';
    
    // Sort dates properly
    if (sortField === 'createdAt' || sortField === 'date') {
      valA = new Date(valA as string).getTime();
      valB = new Date(valB as string).getTime();
    }
    
    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sortedDocs.length / pageSize);
  const paginated = sortedDocs.slice((page - 1) * pageSize, page * pageSize);

  const handleSort = (field: keyof DocumentRecord) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc'); // Default to desc for new field
    }
  };

  const SortIcon = ({ field }: { field: keyof DocumentRecord }) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 ml-1 opacity-30 group-hover:opacity-100 transition-opacity" />;
    return sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 ml-1 text-navy-600" /> : <ArrowDown className="w-3 h-3 ml-1 text-navy-600" />;
  };

  const handleDelete = async (id: string) => {
    if (!confirm('ต้องการลบเอกสารนี้หรือไม่?')) return;
    setDeleting(id);
    await fetch(`/api/documents/${id}`, { method: 'DELETE' });
    setDeleting(null);
    fetchDocs();
  };

  const handleUpdate = async () => {
    if (!editDoc) return;
    await fetch(`/api/documents/${editDoc.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editDoc),
    });
    setEditDoc(null);
    fetchDocs();
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-navy-900">เอกสาร</h1>
        <p className="text-navy-500 text-sm mt-1">รายการเอกสารราชการทั้งหมดในระบบ</p>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-2xl border border-navy-100 shadow-sm p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="ค้นหาจาก เรื่อง, จาก, ถึง, เลขที่..."
              className="w-full pl-10 pr-4 py-2.5 bg-navy-50 border border-navy-100 rounded-xl text-navy-800 placeholder-navy-400 focus:outline-none focus:ring-2 focus:ring-navy-300"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
            <select
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
              className="pl-10 pr-8 py-2.5 bg-navy-50 border border-navy-100 rounded-xl text-navy-800 focus:outline-none focus:ring-2 focus:ring-navy-300 appearance-none cursor-pointer"
            >
              <option value="">ทุกหมวดหมู่</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-navy-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-3 border-navy-300 border-t-navy-600 rounded-full animate-spin" />
          </div>
        ) : paginated.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-navy-400">
            <FileText className="w-12 h-12 mb-2 opacity-50" />
            <p>ไม่พบเอกสาร</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-navy-50/50 border-b border-navy-100">
                    <th className="text-center px-4 py-3 text-xs font-semibold text-navy-500 uppercase w-16 select-none">ลำดับ</th>
                    <th 
                      onClick={() => handleSort('docNumber')} 
                      className="text-left px-4 py-3 text-xs font-semibold text-navy-500 uppercase cursor-pointer hover:bg-navy-100/50 group select-none"
                    >
                      <div className="flex items-center">ที่ <SortIcon field="docNumber" /></div>
                    </th>
                    <th 
                      onClick={() => handleSort('subject')} 
                      className="text-left px-4 py-3 text-xs font-semibold text-navy-500 uppercase cursor-pointer hover:bg-navy-100/50 group select-none"
                    >
                      <div className="flex items-center">เรื่อง <SortIcon field="subject" /></div>
                    </th>
                    <th 
                      onClick={() => handleSort('from')} 
                      className="text-left px-4 py-3 text-xs font-semibold text-navy-500 uppercase cursor-pointer hover:bg-navy-100/50 group select-none"
                    >
                      <div className="flex items-center">จาก <SortIcon field="from" /></div>
                    </th>
                    <th 
                      onClick={() => handleSort('date')} 
                      className="text-left px-4 py-3 text-xs font-semibold text-navy-500 uppercase cursor-pointer hover:bg-navy-100/50 group select-none"
                    >
                      <div className="flex items-center">วันที่ <SortIcon field="date" /></div>
                    </th>
                    <th 
                      onClick={() => handleSort('category')} 
                      className="text-left px-4 py-3 text-xs font-semibold text-navy-500 uppercase cursor-pointer hover:bg-navy-100/50 group select-none"
                    >
                      <div className="flex items-center">หมวด <SortIcon field="category" /></div>
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-navy-500 uppercase">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-50">
                  {paginated.map((doc, index) => (
                    <tr key={doc.id} onClick={() => setSelectedDoc(doc)} className="hover:bg-navy-50/50 transition-colors cursor-pointer">
                      <td className="px-4 py-3 text-center text-sm text-navy-500 font-medium">{(page - 1) * pageSize + index + 1}</td>
                      <td className="px-4 py-3 text-sm text-navy-600 whitespace-nowrap">{doc.docNumber || '-'}</td>
                      <td className="px-4 py-3 text-sm text-navy-800 font-medium max-w-xs truncate">{doc.subject || '-'}</td>
                      <td className="px-4 py-3 text-sm text-navy-600 max-w-[150px] truncate">{doc.from || '-'}</td>
                      <td className="px-4 py-3 text-sm text-navy-600 whitespace-nowrap">{doc.date || '-'}</td>
                      <td className="px-4 py-3">
                        {doc.category && (
                          <span className="text-xs bg-navy-100 text-navy-600 px-2 py-0.5 rounded-full">
                            {doc.category}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={(e) => { e.stopPropagation(); setSelectedDoc(doc); }} className="p-1.5 text-navy-400 hover:text-navy-600 hover:bg-navy-100 rounded-lg cursor-pointer" title="ดู">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); setEditDoc({ ...doc }); }} className="p-1.5 text-navy-400 hover:text-navy-600 hover:bg-navy-100 rounded-lg cursor-pointer" title="แก้ไข">
                            <Edit3 className="w-4 h-4" />
                          </button>
                          {doc.drivePdfId && (
                            <a
                              href={`/api/documents/${doc.id}/pdf`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="p-1.5 text-navy-400 hover:text-navy-600 hover:bg-navy-100 rounded-lg"
                              title="ดู / ดาวน์โหลด PDF"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                          )}
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(doc.id); }}
                            disabled={deleting === doc.id}
                            className="p-1.5 text-navy-400 hover:text-red-500 hover:bg-red-50 rounded-lg cursor-pointer disabled:opacity-50"
                            title="ลบ"
                          >
                            {deleting === doc.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Sort Header */}
            <div className="md:hidden bg-navy-50/50 border-b border-navy-100 px-4 py-2.5 flex items-center gap-4 overflow-x-auto text-xs font-semibold text-navy-500 uppercase whitespace-nowrap">
              <span className="text-navy-400 mr-2 font-normal">เรียงตาม:</span>
              <button onClick={() => handleSort('date')} className="flex items-center gap-1 cursor-pointer hover:text-navy-700">
                วันที่ <SortIcon field="date" />
              </button>
              <button onClick={() => handleSort('docNumber')} className="flex items-center gap-1 cursor-pointer hover:text-navy-700">
                เลขที่ <SortIcon field="docNumber" />
              </button>
              <button onClick={() => handleSort('subject')} className="flex items-center gap-1 cursor-pointer hover:text-navy-700">
                เรื่อง <SortIcon field="subject" />
              </button>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-navy-50">
              {paginated.map((doc, index) => (
                <div key={doc.id} onClick={() => setSelectedDoc(doc)} className="p-4 hover:bg-navy-50/50 cursor-pointer">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-navy-800 text-sm truncate">
                        <span className="text-navy-400 mr-2">{(page - 1) * pageSize + index + 1}.</span>
                        {doc.subject || 'ไม่มีเรื่อง'}
                      </p>
                      <p className="text-xs text-navy-500 mt-0.5">{doc.docNumber || '-'} · {doc.date || '-'}</p>
                      <p className="text-xs text-navy-400 mt-0.5">จาก: {doc.from || '-'}</p>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button onClick={(e) => { e.stopPropagation(); setSelectedDoc(doc); }} className="p-1.5 text-navy-400 hover:text-navy-600 rounded-lg cursor-pointer">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(doc.id); }} className="p-1.5 text-navy-400 hover:text-red-500 rounded-lg cursor-pointer">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
              <div className="flex flex-wrap items-center justify-between px-4 py-3 border-t border-navy-100 gap-2">
                <div className="flex items-center gap-3">
                  <p className="text-xs text-navy-500">
                    แสดง {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, sortedDocs.length)} จาก {sortedDocs.length}
                  </p>
                  <select
                    value={pageSize}
                    onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                    className="pl-2 pr-6 py-1 text-xs bg-navy-50 border border-navy-100 rounded-lg text-navy-700 focus:outline-none focus:ring-2 focus:ring-navy-300 appearance-none cursor-pointer"
                  >
                    <option value={10}>10 รายการ</option>
                    <option value={20}>20 รายการ</option>
                    <option value={50}>50 รายการ</option>
                    <option value={100}>100 รายการ</option>
                  </select>
                </div>
                {totalPages > 1 && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-1.5 text-navy-400 hover:text-navy-600 hover:bg-navy-100 rounded-lg disabled:opacity-30 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm text-navy-600 px-2">{page}/{totalPages}</span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-1.5 text-navy-400 hover:text-navy-600 hover:bg-navy-100 rounded-lg disabled:opacity-30 cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                )}
              </div>
          </>
        )}
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

      {/* Edit Modal */}
      {editDoc && (
        <Modal onClose={() => setEditDoc(null)} title="แก้ไขเอกสาร">
          <div className="space-y-3">
            <EditField label="ที่" value={editDoc.docNumber} onChange={(v) => setEditDoc({ ...editDoc, docNumber: v })} />
            <EditField label="เรื่อง" value={editDoc.subject} onChange={(v) => setEditDoc({ ...editDoc, subject: v })} />
            <EditField label="จาก" value={editDoc.from} onChange={(v) => setEditDoc({ ...editDoc, from: v })} />
            <EditField label="ถึง" value={editDoc.to} onChange={(v) => setEditDoc({ ...editDoc, to: v })} />
            <EditField label="วันที่" type="date" value={editDoc.date} onChange={(v) => setEditDoc({ ...editDoc, date: v })} />
            <div>
              <label className="block text-xs font-medium text-navy-500 mb-1">หมวดหมู่</label>
              <select
                value={editDoc.category}
                onChange={(e) => setEditDoc({ ...editDoc, category: e.target.value })}
                className="w-full px-3 py-2 bg-navy-50 border border-navy-100 rounded-xl text-sm text-navy-800 focus:outline-none focus:ring-2 focus:ring-navy-300"
              >
                <option value="">ไม่มีหมวดหมู่</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setEditDoc(null)} className="px-4 py-2 text-sm text-navy-600 hover:bg-navy-100 rounded-xl cursor-pointer">
                ยกเลิก
              </button>
              <button onClick={handleUpdate} className="px-4 py-2 text-sm bg-navy-600 hover:bg-navy-700 text-white rounded-xl cursor-pointer">
                บันทึก
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}


function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-navy-400">{label}</p>
      <p className="text-sm text-navy-800 mt-0.5">{value || '-'}</p>
    </div>
  );
}

function EditField({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label className="block text-xs font-medium text-navy-500 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 bg-navy-50 border border-navy-100 rounded-xl text-sm text-navy-800 focus:outline-none focus:ring-2 focus:ring-navy-300"
      />
    </div>
  );
}

