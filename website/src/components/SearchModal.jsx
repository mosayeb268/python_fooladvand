import React, { useState, useEffect } from 'react'
import { Search, X, FileText, Code2, BookOpen, Database, ArrowLeft } from 'lucide-react'
import pdfsData from '../data/pdfs.json'
import pythonExamples from '../data/python_examples.json'
import notebooksData from '../data/notebooks.json'
import datasetsData from '../data/datasets.json'

export default function SearchModal({ isOpen, onClose, onSelectResult }) {
  const [query, setQuery] = useState('')

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        if (isOpen) onClose()
        else {
          // handled by parent or opened
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const q = query.toLowerCase().trim()

  // Search PDFs
  const matchingPdfs = q ? pdfsData.filter(p => 
    p.title.toLowerCase().includes(q) ||
    p.filename.toLowerCase().includes(q) ||
    p.description.toLowerCase().includes(q) ||
    p.topics.some(t => t.toLowerCase().includes(q))
  ) : []

  // Search Scripts
  const matchingScripts = q ? pythonExamples.filter(s =>
    s.filename.toLowerCase().includes(q) ||
    s.description.toLowerCase().includes(q) ||
    s.code.toLowerCase().includes(q) ||
    s.tags.some(t => t.toLowerCase().includes(q))
  ) : []

  // Search Notebooks
  const matchingNotebooks = q ? notebooksData.filter(nb =>
    nb.title.toLowerCase().includes(q) ||
    nb.filename.toLowerCase().includes(q) ||
    nb.subtitle.toLowerCase().includes(q) ||
    nb.topics.some(t => t.toLowerCase().includes(q)) ||
    nb.cells.some(c => c.source.toLowerCase().includes(q))
  ) : []

  // Search Datasets
  const matchingDatasets = q ? datasetsData.filter(d =>
    d.title.toLowerCase().includes(q) ||
    d.filename.toLowerCase().includes(q) ||
    d.description.toLowerCase().includes(q) ||
    d.columns.some(col => col.toLowerCase().includes(q))
  ) : []

  const totalResults = matchingPdfs.length + matchingScripts.length + matchingNotebooks.length + matchingDatasets.length

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 md:pt-24 p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        
        {/* Search Input Bar */}
        <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-cyan-400 shrink-0" />
          <input
            type="text"
            placeholder="جستجو در کل فایل‌ها، کدهای پایتون، نوت‌بوک‌ها و دیتاست‌ها..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent text-sm md:text-base text-white placeholder-slate-500 focus:outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          )}
          <button onClick={onClose} className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white text-xs px-2 py-1">
            Esc
          </button>
        </div>

        {/* Results List */}
        <div className="p-4 overflow-y-auto space-y-4">
          {!query && (
            <div className="py-8 text-center text-slate-500 text-xs">
              کلمه مورد نظر خود را تایپ کنید (مثلاً: <span className="text-cyan-400">DataFrame</span>، <span className="text-emerald-400">lambda</span>، <span className="text-amber-400">titanic</span>، <span className="text-rose-400">NumPy</span>)
            </div>
          )}

          {query && totalResults === 0 && (
            <div className="py-8 text-center text-slate-500 text-xs">
              هیچ نتیجه‌ای برای "{query}" یافت نشد.
            </div>
          )}

          {/* Notebooks results */}
          {matchingNotebooks.length > 0 && (
            <div>
              <div className="text-xs font-bold text-amber-400 mb-2 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                <span>نوت‌بوک‌های ژوپیتر ({matchingNotebooks.length})</span>
              </div>
              <div className="space-y-1.5">
                {matchingNotebooks.map(nb => (
                  <div
                    key={nb.id}
                    onClick={() => {
                      onSelectResult('notebooks', nb.id)
                      onClose()
                    }}
                    className="p-3 rounded-xl bg-slate-950/60 hover:bg-amber-500/10 border border-slate-800 hover:border-amber-500/30 cursor-pointer flex items-center justify-between transition-colors"
                  >
                    <div>
                      <div className="text-xs font-bold text-white">{nb.title}</div>
                      <div className="text-[11px] text-slate-400">{nb.subtitle}</div>
                    </div>
                    <ArrowLeft className="w-4 h-4 text-amber-400" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Python Scripts results */}
          {matchingScripts.length > 0 && (
            <div>
              <div className="text-xs font-bold text-emerald-400 mb-2 flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5" />
                <span>اسکریپت‌های پایتون ({matchingScripts.length})</span>
              </div>
              <div className="space-y-1.5">
                {matchingScripts.slice(0, 5).map(s => (
                  <div
                    key={s.id}
                    onClick={() => {
                      onSelectResult('scripts', s.id)
                      onClose()
                    }}
                    className="p-3 rounded-xl bg-slate-950/60 hover:bg-emerald-500/10 border border-slate-800 hover:border-emerald-500/30 cursor-pointer flex items-center justify-between transition-colors"
                  >
                    <div>
                      <div className="text-xs font-bold text-white font-mono" dir="ltr">{s.filename}</div>
                      <div className="text-[11px] text-slate-400">{s.description}</div>
                    </div>
                    <ArrowLeft className="w-4 h-4 text-emerald-400" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PDFs results */}
          {matchingPdfs.length > 0 && (
            <div>
              <div className="text-xs font-bold text-rose-400 mb-2 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                <span>اسناد و کتاب‌های PDF ({matchingPdfs.length})</span>
              </div>
              <div className="space-y-1.5">
                {matchingPdfs.map(p => (
                  <div
                    key={p.id}
                    onClick={() => {
                      onSelectResult('pdfs', p)
                      onClose()
                    }}
                    className="p-3 rounded-xl bg-slate-950/60 hover:bg-rose-500/10 border border-slate-800 hover:border-rose-500/30 cursor-pointer flex items-center justify-between transition-colors"
                  >
                    <div>
                      <div className="text-xs font-bold text-white">{p.title}</div>
                      <div className="text-[11px] text-slate-400 font-mono" dir="ltr">{p.filename}</div>
                    </div>
                    <ArrowLeft className="w-4 h-4 text-rose-400" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Datasets results */}
          {matchingDatasets.length > 0 && (
            <div>
              <div className="text-xs font-bold text-purple-400 mb-2 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5" />
                <span>دیتاست‌ها ({matchingDatasets.length})</span>
              </div>
              <div className="space-y-1.5">
                {matchingDatasets.map(d => (
                  <div
                    key={d.id}
                    onClick={() => {
                      onSelectResult('datasets', d.id)
                      onClose()
                    }}
                    className="p-3 rounded-xl bg-slate-950/60 hover:bg-purple-500/10 border border-slate-800 hover:border-purple-500/30 cursor-pointer flex items-center justify-between transition-colors"
                  >
                    <div>
                      <div className="text-xs font-bold text-white">{d.title}</div>
                      <div className="text-[11px] text-slate-400 font-mono" dir="ltr">{d.filename}</div>
                    </div>
                    <ArrowLeft className="w-4 h-4 text-purple-400" />
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  )
}
