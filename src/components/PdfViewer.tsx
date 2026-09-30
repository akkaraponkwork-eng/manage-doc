'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Download, Loader2, ZoomIn, ZoomOut, Share2 } from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function PdfViewer({ fileUrl }: { fileUrl: string }) {
  const [numPages, setNumPages] = useState<number>();
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setPageNumber(1);
  }

  const [containerWidth, setContainerWidth] = useState<number>();

  return (
    <div className="flex flex-col h-full bg-navy-900/5">
      {/* PDF Controls */}
      <div className="flex flex-wrap items-center justify-between p-2 bg-white border-b border-navy-100 gap-2">
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setPageNumber(p => Math.max(1, p - 1))}
            disabled={pageNumber <= 1}
            className="p-1 sm:p-1.5 text-navy-600 hover:bg-navy-100 rounded-lg disabled:opacity-30"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <span className="text-xs sm:text-sm font-medium text-navy-700 whitespace-nowrap">
            {pageNumber} / {numPages || '-'}
          </span>
          <button
            onClick={() => setPageNumber(p => Math.min(numPages || 1, p + 1))}
            disabled={pageNumber >= (numPages || 1)}
            className="p-1 sm:p-1.5 text-navy-600 hover:bg-navy-100 rounded-lg disabled:opacity-30"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setScale(s => Math.max(0.5, s - 0.2))} className="p-1 sm:p-1.5 text-navy-600 hover:bg-navy-100 rounded-lg hidden sm:block">
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs font-medium w-8 sm:w-10 text-center hidden sm:block">{Math.round(scale * 100)}%</span>
          <button onClick={() => setScale(s => Math.min(3.0, s + 0.2))} className="p-1 sm:p-1.5 text-navy-600 hover:bg-navy-100 rounded-lg hidden sm:block">
            <ZoomIn className="w-4 h-4" />
          </button>
          
          <button
            onClick={async () => {
              if (navigator.share) {
                try {
                  const absoluteUrl = window.location.origin + fileUrl;
                  await navigator.share({
                    title: 'แชร์เอกสาร',
                    url: absoluteUrl
                  });
                } catch (err) {
                  console.error('Error sharing', err);
                }
              } else {
                const absoluteUrl = window.location.origin + fileUrl;
                navigator.clipboard.writeText(absoluteUrl);
                alert('คัดลอกลิงก์เรียบร้อยแล้ว');
              }
            }}
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
            className="ml-1 sm:ml-2 p-1.5 text-navy-600 hover:bg-navy-100 rounded-lg flex items-center gap-1 bg-navy-50"
            title="ดาวน์โหลด"
          >
            <Download className="w-4 h-4" />
            <span className="text-xs font-medium pr-1 hidden sm:inline">โหลด</span>
          </a>
        </div>
      </div>
      
      {/* PDF Document Container */}
      <div 
        className="flex-1 overflow-auto flex justify-center p-4 bg-navy-50"
        ref={(el) => {
          if (el && !containerWidth) {
            setContainerWidth(el.clientWidth);
          }
        }}
      >
        {containerWidth ? (
          containerWidth < 768 ? (
            <iframe 
              src={`${fileUrl}#view=FitH`}
              className="w-full h-full border-0 rounded-lg shadow-sm bg-white"
              title="PDF Document Viewer"
            />
          ) : (
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
                  ไม่สามารถโหลดเอกสารได้ (อาจมีปัญหาการเชื่อมต่อ หรือไฟล์ใหญ่เกินไป)
                </div>
              }
            >
              <Page
                pageNumber={pageNumber}
                scale={scale}
                width={Math.min(containerWidth - 32, 800)}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                className="shadow-md bg-white"
              />
            </Document>
          )
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
