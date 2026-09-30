'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Download, Loader2, ZoomIn, ZoomOut, Share2 } from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function PdfViewer({ fileUrl }: { fileUrl: string }) {
  const [numPages, setNumPages] = useState<number>();
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => {
      setContainerWidth(el.clientWidth);
      setIsMobile(el.clientWidth < 768);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
  }, []);

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

  const pageWidth = containerWidth > 0 ? Math.min(containerWidth - 32, 800) : undefined;

  return (
    <div className="flex flex-col h-full bg-navy-900/5">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between p-2 bg-white border-b border-navy-100 gap-2">
        {/* Page nav — desktop only */}
        {!isMobile && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPageNumber(p => Math.max(1, p - 1))}
              disabled={pageNumber <= 1}
              className="p-1.5 text-navy-600 hover:bg-navy-100 rounded-lg disabled:opacity-30"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm font-medium text-navy-700 whitespace-nowrap">
              {pageNumber} / {numPages || '-'}
            </span>
            <button
              onClick={() => setPageNumber(p => Math.min(numPages || 1, p + 1))}
              disabled={pageNumber >= (numPages || 1)}
              className="p-1.5 text-navy-600 hover:bg-navy-100 rounded-lg disabled:opacity-30"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Zoom (desktop) + Share/Download (all) */}
        <div className="flex items-center gap-1 ml-auto">
          {!isMobile && (
            <>
              <button onClick={() => setScale(s => Math.max(0.5, +(s - 0.2).toFixed(1)))} className="p-1.5 text-navy-600 hover:bg-navy-100 rounded-lg">
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-xs font-medium w-10 text-center">{Math.round(scale * 100)}%</span>
              <button onClick={() => setScale(s => Math.min(3.0, +(s + 0.2).toFixed(1)))} className="p-1.5 text-navy-600 hover:bg-navy-100 rounded-lg">
                <ZoomIn className="w-4 h-4" />
              </button>
            </>
          )}

          <button
            onClick={handleShare}
            className="ml-1 sm:ml-2 p-1.5 text-navy-600 hover:bg-navy-100 rounded-lg flex items-center gap-1 bg-navy-50"
            title="แชร์เอกสาร"
          >
            <Share2 className="w-4 h-4" />
            <span className="text-xs font-medium pr-1">แชร์</span>
          </button>

          <a
            href={fileUrl}
            target="_blank"
            download
            className="ml-1 p-1.5 text-navy-600 hover:bg-navy-100 rounded-lg flex items-center gap-1 bg-navy-50"
            title="ดาวน์โหลด"
          >
            <Download className="w-4 h-4" />
            <span className="text-xs font-medium pr-1 hidden sm:inline">โหลด</span>
          </a>
        </div>
      </div>

      {/* Content area */}
      <div ref={containerRef} className="flex-1 overflow-auto flex justify-center p-2 sm:p-4 bg-navy-50">
        {isMobile ? (
          /* Mobile: iframe — native PDF viewer, no OOM */
          <iframe
            src={`${fileUrl}#view=FitH`}
            className="w-full h-full border-0 rounded-lg shadow-sm bg-white"
            title="PDF Document Viewer"
          />
        ) : pageWidth ? (
          /* Desktop: react-pdf — full controls */
          <Document
            file={fileUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={
              <div className="flex flex-col items-center justify-center h-full text-navy-400 gap-2">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="text-sm">กำลังโหลดเอกสาร...</span>
              </div>
            }
            error={
              <div className="flex flex-col items-center justify-center h-full text-red-400 text-sm text-center px-4">
                ไม่สามารถโหลดเอกสารได้ กรุณาลองใหม่อีกครั้ง
              </div>
            }
          >
            <Page
              pageNumber={pageNumber}
              scale={scale}
              width={pageWidth}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              className="shadow-md bg-white"
            />
          </Document>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-navy-400 gap-2">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="text-sm">กำลังเตรียมแสดงผล...</span>
          </div>
        )}
      </div>
    </div>
  );
}
