import React, { useState, useEffect } from 'react'
import { BookOpen, Code2, Terminal, Play, Copy, Check, Download, ExternalLink, Bookmark, ChevronDown, ChevronRight, Layers, Sparkles, HelpCircle, FileText, ArrowUp, PanelLeftClose, PanelLeft, ZoomIn, ZoomOut, CheckCircle2 } from 'lucide-react'
import bookletChapters from '../data/booklet_chapters.json'
import InteractiveIDE from './InteractiveIDE'
import QuizSection from './QuizSection'
import DatasetsSection from './DatasetsSection'

export default function BookletView({ onOpenPdf }) {
  const [activeChapterId, setActiveChapterId] = useState(bookletChapters[0]?.id || '')
  const [ideCode, setIdeCode] = useState(
    `# به محیط تعاملی پایتون خوش آمدید!\nx = 15\ny = 25\ns = x + y\nprint(f"x={x} , y={y} , x+y={s}")`
  )
  const [isIdeOpen, setIsIdeOpen] = useState(true)
  const [fontSizeLevel, setFontSizeLevel] = useState(1) // 0: small, 1: normal, 2: large
  const [copiedScriptId, setCopiedScriptId] = useState(null)
  const [showTocDrawer, setShowTocDrawer] = useState(false)

  // Send script code to IDE and auto-open IDE panel
  const handleSendToIde = (code) => {
    setIdeCode(code)
    setIsIdeOpen(true)
  }

  const handleCopyScript = (code, id) => {
    navigator.clipboard.writeText(code)
    setCopiedScriptId(id)
    setTimeout(() => setCopiedScriptId(null), 2000)
  }

  const scrollToChapter = (chId) => {
    setActiveChapterId(chId)
    setShowTocDrawer(false)
    const el = document.getElementById(chId)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const fontClasses = [
    'text-xs leading-5',     // small
    'text-sm leading-6',     // normal
    'text-base leading-7',   // large
  ]

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 flex flex-col xl:flex-row">
      
      {/* 1. PDF Bookmarks Sidebar (فهرست سرفصل‌های جزوه) */}
      <aside className={`fixed inset-y-0 right-0 z-40 w-72 bg-slate-900/95 backdrop-blur-md border-l border-slate-800 p-4 transform transition-transform duration-200 xl:translate-x-0 xl:static xl:w-72 xl:h-[calc(100vh-4rem)] xl:sticky xl:top-16 overflow-y-auto ${
        showTocDrawer ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-cyan-400" />
            <h3 className="font-bold text-xs text-white">فهرست سرفصل‌های جزوه</h3>
          </div>
          <button
            onClick={() => setShowTocDrawer(false)}
            className="xl:hidden text-slate-400 hover:text-white text-xs px-2 py-1 rounded bg-slate-800"
          >
            بستن
          </button>
        </div>

        {/* Chapters navigation list */}
        <nav className="space-y-1.5">
          {bookletChapters.map((ch) => {
            const isActive = activeChapterId === ch.id
            return (
              <button
                key={ch.id}
                onClick={() => scrollToChapter(ch.id)}
                className={`w-full text-right p-2.5 rounded-xl text-xs transition-all flex items-start gap-2.5 ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 font-bold shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 shrink-0 mt-0.5">
                  فصل {ch.num}
                </span>
                <span className="leading-snug line-clamp-2">{ch.title}</span>
              </button>
            )
          })}
        </nav>
      </aside>

      {/* 2. Main Booklet Reader Canvas (متن پیوسته جزوه آموزشی) */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 space-y-12 max-w-4xl mx-auto">
        
        {/* Reader Control Header Bar */}
        <div className="sticky top-16 z-20 backdrop-blur-md bg-slate-950/90 py-3 px-4 rounded-2xl border border-slate-800 flex items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowTocDrawer(true)}
              className="xl:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-cyan-400"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>فهرست جزوه</span>
            </button>
            <span className="text-xs font-bold text-white hidden sm:inline">جزوه جامع تحلیل داده با پایتون (ترم ۶)</span>
          </div>

          {/* Reader Controls: Font Size, IDE Toggle */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-900 rounded-lg border border-slate-800 p-0.5">
              <button
                onClick={() => setFontSizeLevel(Math.max(fontSizeLevel - 1, 0))}
                className="px-2 py-1 text-slate-400 hover:text-white text-xs font-bold"
                title="کوچک‌نمایی قلم"
              >
                A-
              </button>
              <span className="text-[10px] text-slate-500 px-1 border-x border-slate-800 font-mono">
                {fontSizeLevel === 0 ? 'کوچک' : fontSizeLevel === 1 ? 'عادی' : 'بزرگ'}
              </span>
              <button
                onClick={() => setFontSizeLevel(Math.min(fontSizeLevel + 1, 2))}
                className="px-2 py-1 text-slate-400 hover:text-white text-xs font-bold"
                title="بزرگ‌نمایی قلم"
              >
                A+
              </button>
            </div>

            <button
              onClick={() => setIsIdeOpen(!isIdeOpen)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                isIdeOpen
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-900 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/10'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>{isIdeOpen ? 'بستن IDE' : 'باز کردن IDE'}</span>
            </button>
          </div>
        </div>

        {/* Chapters Content Flow (پیوسته از اول تا آخر) */}
        {bookletChapters.map((chapter) => (
          <section
            key={chapter.id}
            id={chapter.id}
            className="rounded-3xl bg-slate-900/60 border border-slate-800/90 p-5 sm:p-8 space-y-6 shadow-xl"
          >
            {/* Chapter Header */}
            <div className="pb-4 border-b border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-slate-800 text-cyan-400 border border-slate-700">
                  فصل {chapter.num}
                </span>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                  {chapter.badge}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                {chapter.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                {chapter.subtitle}
              </p>
            </div>

            {/* Chapter Sections */}
            <div className="space-y-8">
              {chapter.sections.map((section) => (
                <div key={section.id} className="space-y-4">
                  <h3 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    <span>{section.title}</span>
                  </h3>

                  {/* Section Text */}
                  {section.content && (
                    <div className={`text-slate-300 whitespace-pre-wrap ${fontClasses[fontSizeLevel]}`}>
                      {section.content}
                    </div>
                  )}

                  {/* Resource / PDF links */}
                  {section.type === 'resource' && section.pdfLinks && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      {section.pdfLinks.map((pdf, pIdx) => (
                        <div
                          key={pIdx}
                          className="rounded-xl bg-slate-950 p-4 border border-slate-800 flex items-center justify-between gap-3 shadow-md"
                        >
                          <div className="flex items-center gap-2.5">
                            <FileText className="w-5 h-5 text-rose-400 shrink-0" />
                            <div>
                              <div className="text-xs font-bold text-white">{pdf.title}</div>
                              <div className="text-[10px] text-slate-500 font-mono" dir="ltr">{pdf.name} ({pdf.size})</div>
                            </div>
                          </div>
                          <a
                            href={`/pdfs/${pdf.name}`}
                            download={pdf.name}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-rose-300 text-xs transition-colors shrink-0"
                            title="دانلود PDF"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Scripts Group (Code Examples with "Send to IDE" button) */}
                  {section.type === 'scripts_group' && section.scripts && (
                    <div className="space-y-4 pt-2">
                      {section.scripts.map((script) => (
                        <div
                          key={script.id}
                          className="rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-lg transition-all"
                        >
                          {/* Script Header Bar */}
                          <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-emerald-400" dir="ltr">
                                {script.filename}
                              </span>
                              <span className="text-[11px] text-slate-300">
                                • {script.description}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleSendToIde(script.code)}
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md shadow-emerald-600/20"
                                title="بارگذاری کد در IDE و اجرای زنده"
                              >
                                <Play className="w-3 h-3 fill-current" />
                                <span>⚡ انتقال به IDE و اجرا</span>
                              </button>

                              <button
                                onClick={() => handleCopyScript(script.code, script.id)}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors text-xs"
                                title="کپی کد"
                              >
                                {copiedScriptId === script.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>

                          {/* Code Body */}
                          <div className="p-4 font-mono text-xs text-slate-200 overflow-x-auto bg-slate-950/80" dir="ltr">
                            <pre className="leading-relaxed whitespace-pre-wrap">{script.code}</pre>
                          </div>

                          {/* Expected Output */}
                          {script.expectedOutput && (
                            <div className="px-4 py-2 bg-black/60 border-t border-slate-900 font-mono text-[11px] text-emerald-400/90" dir="ltr">
                              <span className="text-slate-500 font-sans">خروجی نمونه: </span>
                              {script.expectedOutput}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Notebook Embed (Cells Preview) */}
                  {section.type === 'notebook_embed' && (
                    <div className="space-y-3 pt-2">
                      {/* Banner */}
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                        <span className="text-slate-300">
                          نوت‌بوک تمرینی تدریس‌شده: <strong className="text-amber-400 font-mono">{section.notebookId}.ipynb</strong>
                        </span>
                        <a
                          href={`/notebooks/${section.notebookId === 'nb-11' ? '11-numpy_1.ipynb' : section.notebookId === 'nb-13' ? '13-numpy_2.ipynb' : section.notebookId === 'nb-15' ? '15-pandas_1.ipynb' : '18-pandas_2.ipynb'}`}
                          download
                          className="inline-flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 font-bold"
                        >
                          <Download className="w-3 h-3" />
                          <span>دانلود فایل .ipynb</span>
                        </a>
                      </div>

                      {/* Display cells summary note */}
                      <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/20 text-xs text-amber-200/90 leading-relaxed">
                        سلول‌های کامل کد و جداول خروجی پانداس این نوت‌بوک در تب اختصاصی نوت‌بوک‌ها با تمام ۲۱۸ سلول قابل مشاهده و کاوش کامل است.
                      </div>
                    </div>
                  )}

                  {/* Datasets Interactive Explorer */}
                  {section.type === 'datasets_interactive' && (
                    <div className="pt-2">
                      <DatasetsSection />
                    </div>
                  )}

                  {/* Quiz Embed */}
                  {section.type === 'quiz_embed' && (
                    <div className="pt-2">
                      <QuizSection />
                    </div>
                  )}

                </div>
              ))}
            </div>
          </section>
        ))}

        {/* Back to top button */}
        <div className="text-center pt-8">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-bold transition-all shadow-md"
          >
            <ArrowUp className="w-4 h-4" />
            <span>بازگشت به ابتدای جزوه</span>
          </button>
        </div>

      </main>

      {/* 3. Docked Interactive Python IDE (محیط اجرای زنده پایتون در کنار جزوه) */}
      {isIdeOpen && (
        <div className="w-full xl:w-96 xl:h-[calc(100vh-4rem)] xl:sticky xl:top-16 border-t xl:border-t-0 xl:border-r border-slate-800 shrink-0">
          <InteractiveIDE
            code={ideCode}
            setCode={setIdeCode}
            onClose={() => setIsIdeOpen(false)}
            isOpen={isIdeOpen}
          />
        </div>
      )}

    </div>
  )
}
