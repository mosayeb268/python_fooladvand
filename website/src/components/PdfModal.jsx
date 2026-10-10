import React, { useEffect } from 'react'
import { X, Download, ExternalLink, FileText } from 'lucide-react'

export default function PdfModal({ pdf, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  if (!pdf) return null

  const pdfUrl = `/pdfs/${pdf.filename}`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl h-[92vh] flex flex-col rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900/90 border-b border-slate-800">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="truncate">
              <h3 className="text-sm md:text-base font-bold text-white truncate">{pdf.title}</h3>
              <p className="text-xs text-slate-400 font-mono truncate" dir="ltr">{pdf.filename} ({pdf.sizeFormatted})</p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <a
              href={pdfUrl}
              download={pdf.filename}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>دانلود PDF</span>
            </a>

            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors hidden sm:inline-flex"
              title="باز کردن در تب جداگانه"
            >
              <ExternalLink className="w-4 h-4" />
            </a>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="بستن"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PDF Viewer Body */}
        <div className="flex-1 w-full bg-slate-950 relative">
          <iframe
            src={`${pdfUrl}#toolbar=1`}
            title={pdf.title}
            className="w-full h-full border-none"
          />
        </div>

        {/* Footer info */}
        <div className="px-5 py-2.5 bg-slate-900/70 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2 overflow-x-auto">
            <span className="text-slate-300 font-medium">موضوعات کلیدی:</span>
            {pdf.topics?.map((topic, i) => (
              <span key={i} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px] whitespace-nowrap">
                {topic}
              </span>
            ))}
          </div>
          <span className="hidden md:inline text-[11px] text-slate-500">برای خروج کلید Esc را بزنید</span>
        </div>

      </div>
    </div>
  )
}
