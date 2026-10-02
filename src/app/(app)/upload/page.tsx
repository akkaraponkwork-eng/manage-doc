'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Upload as UploadIcon, X, Loader2, Image as ImageIcon,
  FileText, Save, PenLine, ChevronDown,
} from 'lucide-react';
import type { ExtractedFields, CategoryRecord } from '@/lib/types';

export default function UploadPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [fields, setFields] = useState<ExtractedFields>({
    docNumber: '', subject: '', from: '', to: '', date: new Date().toISOString().split('T')[0],
  });
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [fromSuggestions, setFromSuggestions] = useState<string[]>([]);
  const [toSuggestions, setToSuggestions] = useState<string[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/categories').then((r) => r.json()).then((data) => {
      if (Array.isArray(data)) setCategories(data);
    });
    fetch('/api/documents').then((r) => r.json()).then((data) => {
      if (Array.isArray(data)) {
        setFromSuggestions([...new Set<string>(data.map((d) => d.from).filter(Boolean))]);
        setToSuggestions([...new Set<string>(data.map((d) => d.to).filter(Boolean))]);
      }
    });
  }, []);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files).filter((f) => f.type.startsWith('image/') || f.type === 'application/pdf');
    if (newFiles.length === 0) return;

    const hasPdf = newFiles.some(f => f.type === 'application/pdf');
    
    if (hasPdf) {
      const pdfFile = newFiles.find(f => f.type === 'application/pdf')!;
      setImages([pdfFile]);
      const reader = new FileReader();
      reader.onload = (e) => setPreviews([e.target?.result as string]);
      reader.readAsDataURL(pdfFile);
    } else {
      setImages((prev) => {
        const noPdf = prev.filter(f => f.type !== 'application/pdf');
        return [...noPdf, ...newFiles];
      });

      for (const file of newFiles) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreviews((prev) => {
            const noPdf = prev.filter(p => !p.startsWith('data:application/pdf'));
            return [...noPdf, e.target?.result as string];
          });
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const removeImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
    setPreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    setUploading(true);
    setError('');

    try {
      let imageIds: string[] = [];
      let pdfId = '';

      // Upload images if any exist
      if (images.length > 0) {
        const formData = new FormData();
        for (const img of images) {
          formData.append('images', img);
        }

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!uploadRes.ok) throw new Error('Upload failed');
        const uploadData = await uploadRes.json();
        imageIds = uploadData.imageIds;
        pdfId = uploadData.pdfId;
      }

      // Save document metadata
      const docRes = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...fields,
          category,
          driveImageIds: imageIds.join(','),
          drivePdfId: pdfId,
          createdBy: session?.user?.name || '',
        }),
      });

      if (!docRes.ok) throw new Error('Save failed');

      router.push('/documents');
    } catch {
      setError('เกิดข้อผิดพลาดในการบันทึก กรุณาลองใหม่');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-navy-900">เพิ่มเอกสาร</h1>
        <p className="text-navy-500 text-sm mt-1">กรอกข้อมูลและอัพโหลดไฟล์เอกสาร</p>
      </div>

      <div className="space-y-4 animate-fade-in-up">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        <div className="bg-white rounded-2xl border border-navy-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <PenLine className="w-5 h-5 text-navy-500" />
            <h2 className="text-lg font-semibold text-navy-900">กรอกข้อมูลเอกสาร</h2>
          </div>

          <div className="space-y-4">
            <FormField label="ที่ (เลขที่หนังสือ)" value={fields.docNumber} onChange={(v) => setFields({ ...fields, docNumber: v })} />
            <FormField label="เรื่อง" value={fields.subject} onChange={(v) => setFields({ ...fields, subject: v })} />
            <ComboField label="จาก" value={fields.from} onChange={(v) => setFields({ ...fields, from: v })} suggestions={fromSuggestions} />
            <ComboField label="ถึง / เรียน" value={fields.to} onChange={(v) => setFields({ ...fields, to: v })} suggestions={toSuggestions} />
            <FormField label="วันที่" type="date" value={fields.date} onChange={(v) => setFields({ ...fields, date: v })} />

            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1.5">หมวดหมู่</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 bg-navy-50 border border-navy-100 rounded-xl text-navy-800 focus:outline-none focus:ring-2 focus:ring-navy-300"
              >
                <option value="">เลือกหมวดหมู่</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Image upload */}
        <div className="bg-white rounded-2xl border border-navy-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <ImageIcon className="w-5 h-5 text-navy-500" />
            <h2 className="text-lg font-semibold text-navy-900">แนบไฟล์รูปภาพ (บังคับ)</h2>
          </div>
          
          {/* Hidden inputs */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,application/pdf"
            multiple
            onChange={(e) => { handleFiles(e.target.files); e.target.value = ''; }}
            className="hidden"
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) => { handleFiles(e.target.files); e.target.value = ''; }}
            className="hidden"
          />

          {/* Upload buttons */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-navy-200 rounded-2xl p-5 hover:border-navy-400 hover:bg-navy-50/50 transition-all cursor-pointer"
            >
              <div className="inline-flex items-center justify-center w-10 h-10 bg-navy-100 rounded-xl">
                <UploadIcon className="w-5 h-5 text-navy-500" />
              </div>
              <p className="text-sm font-medium text-navy-700">ถ่ายภาพ</p>
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('upload-zone-active'); }}
              onDragLeave={(e) => e.currentTarget.classList.remove('upload-zone-active')}
              onDrop={(e) => { e.preventDefault(); e.currentTarget.classList.remove('upload-zone-active'); handleFiles(e.dataTransfer.files); }}
              className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-navy-200 rounded-2xl p-5 hover:border-navy-400 hover:bg-navy-50/50 transition-all cursor-pointer"
            >
              <div className="inline-flex items-center justify-center w-10 h-10 bg-navy-100 rounded-xl">
                <ImageIcon className="w-5 h-5 text-navy-500" />
              </div>
              <p className="text-sm font-medium text-navy-700">เลือกจาก Gallery</p>
            </button>
          </div>

          {previews.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {previews.map((src, i) => (
                <div key={i} className="relative group rounded-xl overflow-hidden border border-navy-100">
                  {src.startsWith('data:application/pdf') ? (
                    <div className="w-full h-32 flex flex-col items-center justify-center bg-navy-50 text-navy-400">
                      <FileText className="w-8 h-8 mb-2" />
                      <span className="text-[10px] truncate px-2 w-full text-center">PDF File</span>
                    </div>
                  ) : (
                    <img src={src} alt={`page ${i + 1}`} className="w-full h-32 object-cover" />
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); removeImage(i); }}
                    className="absolute top-1 right-1 p-1.5 bg-black/50 text-white rounded-full shadow-sm hover:bg-red-500 transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={uploading || !fields.subject.trim() || images.length === 0}
          className="w-full py-3 bg-gradient-to-r from-navy-500 to-navy-700 hover:from-navy-400 hover:to-navy-600 text-white font-semibold rounded-xl shadow-lg shadow-navy-500/20 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
        >
          {uploading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              กำลังบันทึก...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              บันทึกเอกสาร
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function FormField({ label, value, onChange, type = 'text' }: {
  label: string; value: string; onChange: (v: string) => void; type?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-navy-700 mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2.5 bg-navy-50 border border-navy-100 rounded-xl text-navy-800 placeholder-navy-400 focus:outline-none focus:ring-2 focus:ring-navy-300"
        placeholder={`กรอก${label}`}
      />
    </div>
  );
}

function ComboField({ label, value, onChange, suggestions }: {
  label: string; value: string; onChange: (v: string) => void; suggestions: string[];
}) {
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = value
    ? suggestions.filter((s) => s.toLowerCase().includes(value.toLowerCase()) && s !== value)
    : suggestions;

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const select = (s: string) => { onChange(s); setOpen(false); setHighlighted(-1); };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) { setOpen(true); return; }
    if (e.key === 'Escape') { setOpen(false); setHighlighted(-1); return; }
    if (e.key === 'ArrowDown') setHighlighted((h) => Math.min(h + 1, filtered.length - 1));
    if (e.key === 'ArrowUp') setHighlighted((h) => Math.max(h - 1, 0));
    if (e.key === 'Enter' && highlighted >= 0) { e.preventDefault(); select(filtered[highlighted]); }
  };

  return (
    <div ref={containerRef} className="relative">
      <label className="block text-sm font-medium text-navy-700 mb-1.5">{label}</label>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => { onChange(e.target.value); setOpen(true); setHighlighted(-1); }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          autoComplete="off"
          className="w-full px-4 py-2.5 pr-10 bg-navy-50 border border-navy-100 rounded-xl text-navy-800 placeholder-navy-400 focus:outline-none focus:ring-2 focus:ring-navy-300"
          placeholder={`กรอก${label}`}
        />
        <button
          type="button"
          tabIndex={-1}
          onMouseDown={(e) => { e.preventDefault(); setOpen((o) => !o); }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-400 hover:text-navy-600"
        >
          <ChevronDown className={`w-4 h-4 transition-transform duration-150 ${open ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {open && filtered.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full bg-white border border-navy-100 rounded-xl shadow-lg overflow-hidden max-h-52 overflow-y-auto">
          {filtered.map((s, i) => (
            <li
              key={s}
              onMouseDown={(e) => { e.preventDefault(); select(s); }}
              onMouseEnter={() => setHighlighted(i)}
              className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${
                i === highlighted ? 'bg-navy-100 text-navy-900' : 'text-navy-700 hover:bg-navy-50'
              }`}
            >
              {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
