import React, { useState } from 'react'
import { FileText, Download, Eye, Search } from 'lucide-react'
import pdfsData from '../data/pdfs.json'

export default function PdfSection({ onOpenPdf }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const categories = [
    { id: 'all', label: 'همه اسناد (۱۱)' },
    { id: 'کتاب اصلی', label: 'کتاب اصلی وس مک‌کینی' },
    { id: 'منابع و مراجع', label: 'منابع و رفرنس‌ها' },
    { id: 'جزوه کلاسی', label: 'جزوات جلسات' },
    { id: 'مفاهیم زبان پایتون', label: 'توالی‌ها و توابع پایتون' },
    { id: 'سرفصل‌ها', label: 'سرفصل‌های نام‌پای و پانداس' },
    { id: 'پروژه‌های کاربردی', label: 'تمرینات دیتاست‌ها' },
  ]

  const filteredPdfs = pdfsData.filter(pdf => {
    const matchesSearch = pdf.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          pdf.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          pdf.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          pdf.topics.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))
    
    if (selectedCategory === 'all') return matchesSearch
    return matchesSearch && (pdf.category === selectedCategory)
  })

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-rose-400" />
            <span>کتاب‌ها، جزوات و مستندات PDF (۱۱ فایل)</span>
          </h2>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            شامل رفرنس اصلی ۳rd Edition پایتون برای تحلیل داده، جزوات کلاسی، مباحث تخصصی توابع و نام‌پای، و تمرینات دیتاست‌ها
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="جستجو در کتاب‌ها و جزوات..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pr-9 pl-4 py-2 text-xs md:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500/50 transition-colors"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              selectedCategory === cat.id
                ? 'bg-rose-500 text-white font-bold shadow-md shadow-rose-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid of PDF Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredPdfs.map((pdf) => (
          <div
            key={pdf.id}
            className="group rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-rose-500/40 p-5 transition-all duration-200 hover:-translate-y-1 shadow-lg flex flex-col justify-between"
          >
            <div>
              {/* Top row: Order badge and Category badge */}
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-rose-400 border border-slate-700">
                  شماره #{pdf.order < 10 ? `0${pdf.order}` : pdf.order}
                </span>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20 font-medium">
                  {pdf.category}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-base font-bold text-white group-hover:text-rose-400 transition-colors leading-snug">
                {pdf.title}
              </h3>

              {/* Description */}
              <p className="text-xs text-slate-300 mt-2.5 leading-relaxed">
                {pdf.description}
              </p>

              {/* Topics tags */}
              <div className="mt-4 flex flex-wrap gap-1.5">
                {pdf.topics.map((t, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center text-[10px] px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 border border-slate-700/60"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Bottom info & Actions */}
            <div className="mt-5 pt-4 border-t border-slate-800/80">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-3 font-mono" dir="ltr">
                <span className="text-slate-500 text-[11px] truncate max-w-[180px]">{pdf.filename}</span>
                <span className="text-rose-400/80 font-bold">{pdf.sizeFormatted}</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onOpenPdf(pdf)}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-200 hover:text-rose-300 border border-slate-700 hover:border-rose-500/40 text-xs font-medium transition-all"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>مطالعه آنلاین</span>
                </button>

                <a
                  href={`/pdfs/${pdf.filename}`}
                  download={pdf.filename}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-sm shadow-rose-600/30 transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>دانلود فایل</span>
                </a>
              </div>
            </div>

          </div>
        ))}
      </div>
    </div>
  )
}
