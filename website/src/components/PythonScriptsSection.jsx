import React, { useState } from 'react'
import { Code2, Play, Copy, Check, Download, Terminal, Search, AlertCircle, RotateCcw, Edit3, Image as ImageIcon } from 'lucide-react'
import pythonExamples from '../data/python_examples.json'
import pythonChapters from '../data/python_chapters.json'
import { executePython } from '../utils/pythonRunner'

export default function PythonScriptsSection() {
  const [selectedChapter, setSelectedChapter] = useState('all')
  const [activeScriptId, setActiveScriptId] = useState(pythonExamples[0]?.id || '')
  const [copied, setCopied] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [runnerOutput, setRunnerOutput] = useState(null)
  const [isRunning, setIsRunning] = useState(false)
  const [activeCodeMode, setActiveCodeMode] = useState('read') // 'read' or 'edit'
  const [editableCode, setEditableCode] = useState(pythonExamples[0]?.code || '')
  const [userInputs, setUserInputs] = useState({})

  const activeScript = pythonExamples.find(s => s.id === activeScriptId) || pythonExamples[0]

  const handleSelectScript = (script) => {
    setActiveScriptId(script.id)
    setEditableCode(script.code)
    setRunnerOutput(null)
    setActiveCodeMode('read')
  }

  const filteredScripts = pythonExamples.filter(script => {
    const matchesChapter = selectedChapter === 'all' || script.chapterId === selectedChapter
    const matchesSearch = script.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          script.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          script.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          script.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchesChapter && matchesSearch
  })

  const handleCopy = () => {
    if (!activeScript) return
    const textToCopy = activeCodeMode === 'edit' ? editableCode : activeScript.code
    navigator.clipboard.writeText(textToCopy)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleResetCode = () => {
    setEditableCode(activeScript.code)
    setRunnerOutput(null)
  }

  // Real Python execution handler
  const handleRunCode = async () => {
    if (!activeScript) return
    setIsRunning(true)
    setRunnerOutput(null)

    try {
      const codeToRun = activeCodeMode === 'edit' ? editableCode : activeScript.code
      const inputVal = Object.values(userInputs).join(',') || '20'
      const result = await executePython(codeToRun, inputVal, activeScript.expectedOutput)

      setRunnerOutput({
        status: result.success ? 'success' : 'error',
        lines: [
          `Python 3.12+ [${result.engine}]`,
          `Running: ${activeScript.filename} ...`,
          `----------------------------------------`,
          ...result.logs
        ],
        plots: result.plots || []
      })
    } catch (err) {
      setRunnerOutput({
        status: 'error',
        lines: [`خطا در اجرا: ${err.message || err}`],
        plots: []
      })
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
            <Code2 className="w-6 h-6 text-emerald-400" />
            <span>نمونه کدهای آموزشی پایتون (۳۳ برنامه در ۴ فصل)</span>
          </h2>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            مجموعه کامل اسکریپت‌های کلاسی از تعاریف متغیر و حلقه‌ها تا توابع پیشرفته و ساخت ماژول‌های مستقل پایتون
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="جستجو در ۳۳ اسکریپت..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pr-9 pl-4 py-2 text-xs md:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
          />
        </div>
      </div>

      {/* Chapter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setSelectedChapter('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
            selectedChapter === 'all'
              ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          همه فصل‌ها (۳۳)
        </button>
        {pythonChapters.map(ch => (
          <button
            key={ch.id}
            onClick={() => setSelectedChapter(ch.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              selectedChapter === ch.id
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {ch.title.split(':')[0]} ({ch.folder.split('_')[0]})
          </button>
        ))}
      </div>

      {/* Main Split Layout: Scripts List & Code Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Sidebar Script List (4 cols) */}
        <div className="lg:col-span-4 rounded-2xl bg-slate-900/80 border border-slate-800 p-3 space-y-2 max-h-[750px] overflow-y-auto">
          <div className="px-2 py-1 text-xs font-semibold text-slate-400 flex items-center justify-between">
            <span>لیست اسکریپت‌ها ({filteredScripts.length})</span>
            <span className="text-[10px] text-slate-500">انتخاب جهت نمایش</span>
          </div>

          <div className="space-y-1.5">
            {filteredScripts.map(script => {
              const isActive = script.id === activeScriptId
              return (
                <div
                  key={script.id}
                  onClick={() => handleSelectScript(script)}
                  className={`cursor-pointer rounded-xl p-3 border transition-all text-right ${
                    isActive
                      ? 'bg-emerald-500/15 border-emerald-500/40 shadow-sm'
                      : 'bg-slate-950/40 hover:bg-slate-800/60 border-slate-800/80'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-bold text-emerald-400" dir="ltr">
                      {script.filename}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                      {script.lineCount} خط
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-1">
                    {script.description}
                  </p>

                  <div className="mt-2 flex items-center gap-1 overflow-hidden">
                    {script.tags.slice(0, 3).map((tag, i) => (
                      <span key={i} className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800/90 text-slate-400 whitespace-nowrap">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Code View & Runner (8 cols) */}
        <div className="lg:col-span-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden flex flex-col">
          
          {/* Code Viewer Top Bar */}
          <div className="px-5 py-3.5 bg-slate-900/95 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold">
                🐍
              </div>
              <div>
                <h3 className="text-sm font-bold text-white font-mono" dir="ltr">{activeScript.filename}</h3>
                <p className="text-xs text-slate-400">{activeScript.chapterTitle}</p>
              </div>
            </div>

            {/* Actions: Edit Mode, Copy, Run, Download */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveCodeMode(activeCodeMode === 'read' ? 'edit' : 'read')}
                className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  activeCodeMode === 'edit'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
                title="ویرایش و تغییر دستی کد در زمین بازی"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{activeCodeMode === 'edit' ? 'حالت ویرایش فعال' : 'ویرایش کد'}</span>
              </button>

              {activeCodeMode === 'edit' && (
                <button
                  onClick={handleResetCode}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
                  title="بازنشانی به کد اصلی"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}

              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'کپی شد!' : 'کپی کد'}</span>
              </button>

              <button
                onClick={handleRunCode}
                disabled={isRunning}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isRunning ? 'در حال اجرا...' : 'اجرای کد'}</span>
              </button>

              <a
                href={activeScript.downloadUrl}
                download={activeScript.filename}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="دانلود اسکریپت"
              >
                <Download className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Script Description info bar */}
          <div className="px-5 py-2.5 bg-slate-950/60 border-b border-slate-800/80 text-xs text-slate-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 font-bold">هدف برنامه:</span>
              <span>{activeScript.description}</span>
            </div>
            {activeScript.hasInput && (
              <div className="flex items-center gap-2 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
                <span className="text-amber-400 font-bold text-xs flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>ورودی input():</span>
                </span>
                <input
                  type="text"
                  value={userInputs['val'] || ''}
                  onChange={(e) => setUserInputs({ val: e.target.value })}
                  placeholder="مثلاً: 25"
                  className="bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-xs text-white w-24 font-mono focus:outline-none focus:border-amber-400"
                />
              </div>
            )}
          </div>

          {/* Code Viewer / Editor Area */}
          <div className="flex-1 bg-slate-950 p-4 overflow-x-auto text-xs md:text-sm font-mono max-h-[500px]" dir="ltr">
            {activeCodeMode === 'edit' ? (
              <textarea
                value={editableCode}
                onChange={(e) => setEditableCode(e.target.value)}
                className="w-full h-80 bg-slate-900/60 border border-slate-800 rounded-xl p-3 font-mono text-emerald-300 text-xs md:text-sm focus:outline-none focus:border-emerald-500/60 leading-6 resize-y"
                dir="ltr"
              />
            ) : (
              <pre className="flex">
                <div className="select-none text-slate-600 text-right pr-4 border-r border-slate-800 leading-6">
                  {activeScript.code.split('\n').map((_, i) => (
                    <div key={i}>{i + 1}</div>
                  ))}
                </div>

                <div className="pl-4 text-slate-200 leading-6 overflow-x-auto w-full">
                  {activeScript.code.split('\n').map((line, i) => (
                    <div key={i} className="hover:bg-slate-900/60 px-1 rounded transition-colors whitespace-pre">
                      {line || '\n'}
                    </div>
                  ))}
                </div>
              </pre>
            )}
          </div>

          {/* Terminal / Runner Output */}
          {runnerOutput && (
            <div className="bg-slate-950 border-t border-slate-800 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5 font-mono">
                  <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                  <span>OUTPUT TERMINAL</span>
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Execution Succeeded
                </span>
              </div>
              <div className="bg-black/80 rounded-xl p-3 border border-slate-800 font-mono text-xs text-emerald-400 space-y-1 overflow-x-auto" dir="ltr">
                {runnerOutput.lines.map((line, idx) => (
                  <div key={idx} className="leading-relaxed whitespace-pre-wrap">{line}</div>
                ))}
              </div>
              {runnerOutput.plots && runnerOutput.plots.length > 0 && (
                <div className="mt-3 p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                  <div className="text-amber-400 font-bold text-xs flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4" />
                    <span>نمودارهای ترسیم‌شده (Matplotlib Visualizations):</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {runnerOutput.plots.map((plotUrl, pIdx) => (
                      <div key={pIdx} className="bg-white rounded-lg p-2 shadow-md">
                        <img src={plotUrl} alt={`Matplotlib ${pIdx + 1}`} className="max-h-64 rounded object-contain mx-auto" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  )
}
