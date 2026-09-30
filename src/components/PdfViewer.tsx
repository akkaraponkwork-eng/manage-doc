'use client';

import { Download, Share2 } from 'lucide-react';

export default function PdfViewer({ fileUrl }: { fileUrl: string }) {
  const handleShare = async () => {
    const absoluteUrl = window.location.origin + fileUrl;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'แชร์เอกสาร', url: absoluteUrl });
      } catch { /* user cancelled */ }
    } else {
      navigator.clipboard.writeText(absoluteUrl);
      alert('คัดลอกลิงก์เรียบร้อยแล้ว');
    }
  };

  return (
    <div className="flex flex-col h-full bg-navy-900/5">
      {/* Controls */}
      <div className="flex items-center justify-end p-2 bg-white border-b border-navy-100 gap-1">
        <button
          onClick={handleShare}
          className="p-1.5 text-navy-600 hover:bg-navy-100 rounded-lg flex items-center gap-1 bg-navy-50"
          title="แชร์เอกสาร"
        >
          <Share2 className="w-4 h-4" />
          <span className="text-xs font-medium pr-1">แชร์</span>
        </button>

        <a
          href={fileUrl}
          target="_blank"
          download
          className="p-1.5 text-navy-600 hover:bg-navy-100 rounded-lg flex items-center gap-1 bg-navy-50"
          title="ดาวน์โหลด"
        >
          <Download className="w-4 h-4" />
          <span className="text-xs font-medium pr-1">โหลด</span>
        </a>
      </div>

      {/* PDF iframe */}
      <iframe
        src={`${fileUrl}#view=FitH`}
        className="flex-1 w-full border-0 bg-white"
        title="PDF Document Viewer"
      />
    </div>
  );
}
