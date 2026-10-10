import React, { useState } from 'react'
import { Terminal, Play, Copy, Check, Trash2, X, Image as ImageIcon } from 'lucide-react'
import { executePython } from '../utils/pythonRunner'

export default function InteractiveIDE({ code, setCode, onClose, isOpen }) {
  const [outputLines, setOutputLines] = useState([
    'Python 3.12+ (WebAssembly / Pyodide Engine)',
    'کنسول آماده اجرای واقعی کدهای پایتون و تحلیل داده (NumPy / Pandas)...',
    'روی دکمه "اجرای کد پایتون" یا کلید [Ctrl + Enter] کلیک کنید.'
  ])
  const [outputPlots, setOutputPlots] = useState([])
  const [isRunning, setIsRunning] = useState(false)
  const [userInput, setUserInput] = useState('')
  const [copied, setCopied] = useState(false)
  const [engineTag, setEngineTag] = useState('آماده اجرا')

  // Real execution handler
  const handleRun = async () => {
    if (isRunning) return
    setIsRunning(true)
    setOutputPlots([])
    setOutputLines([
      '>>> در حال ارسال به مفسر پایتون...',
      '----------------------------------------'
    ])

    try {
      const result = await executePython(code, userInput)
      setEngineTag(result.engine || 'پایتون ۳')
      setOutputLines([
        `>>> اجرای برنامه پایان یافت [${result.engine}]`,
        '----------------------------------------',
        ...result.logs
      ])
      if (result.plots && result.plots.length > 0) {
        setOutputPlots(result.plots)
      }
    } catch (err) {
      setOutputLines([
        '>>> خطای سیستمی:',
        String(err.message || err)
      ])
    } finally {
      setIsRunning(false)
    }
  }

  // Keyboard shortcut: Ctrl + Enter to run code (Tablet keyboard cover & desktop)
  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      handleRun()
    }
  }

  const handleClearOutput = () => {
    setOutputLines(['ترمینال پاکسازی شد.'])
    setOutputPlots([])
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!isOpen) return null

  return (
    <div className="flex flex-col h-full bg-slate-950 border-r border-slate-800 shadow-2xl text-xs font-sans">
      
      {/* IDE Top Bar */}
      <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-white text-xs">کنسول و IDE تعاملی پایتون</h3>
            <p className="text-[10px] text-emerald-400 font-mono">{engineTag}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCopyCode}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="کپی کد"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
              title="بستن پنل IDE"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Code Editor Area */}
      <div className="flex-1 flex flex-col min-h-[220px] p-3 space-y-2 bg-slate-950">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span className="font-mono text-emerald-400 font-bold">کد پایتون (قابل ویرایش):</span>
          <span className="text-[10px] text-slate-500">{code.split('\n').length} خط | کلید سریع: Ctrl+Enter</span>
        </div>

        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 w-full p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-emerald-300 font-mono text-xs focus:outline-none focus:border-emerald-500/50 leading-5 resize-none selection:bg-emerald-500/30"
          dir="ltr"
          placeholder="# کد پایتون خود را بنویسید (NumPy, Pandas, Matplotlib پشتیبانی می‌شوند)..."
        />

        {/* Input parameter helper if script uses input() */}
        {code.includes('input(') && (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-900 border border-slate-800 text-[11px]">
            <span className="text-amber-400 font-bold">ورودی شبیه‌ساز input():</span>
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="مقادیر ورودی (در صورت چند ورودی با کاما جدا کنید)..."
              className="flex-1 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>
        )}

        {/* Action Button: Run Code */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={handleRun}
            disabled={isRunning}
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isRunning ? 'در حال اجرای کد در مفسر پایتون...' : 'اجرای کد پایتون (Ctrl+Enter)'}</span>
          </button>
        </div>
      </div>

      {/* Terminal Output Area */}
      <div className="h-56 sm:h-64 bg-black/90 border-t border-slate-800 p-3 flex flex-col">
        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
          <span className="flex items-center gap-1 font-mono font-bold text-slate-300">
            <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'}`} />
            <span>خروجی ترمینال (Terminal Output)</span>
          </span>
          <button
            onClick={handleClearOutput}
            className="text-[10px] text-slate-500 hover:text-slate-300 flex items-center gap-1 transition-colors"
          >
            <Trash2 className="w-3 h-3" />
            <span>پاک کردن</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto font-mono text-[11px] text-emerald-400/95 space-y-1 p-2 bg-black/60 rounded-lg border border-slate-900" dir="ltr">
          {outputLines.map((line, idx) => (
            <div key={idx} className="leading-relaxed whitespace-pre-wrap">{line}</div>
          ))}

          {/* Render Matplotlib plots if any */}
          {outputPlots.length > 0 && (
            <div className="pt-2 space-y-2 border-t border-slate-800">
              <div className="text-amber-400 font-bold text-[10px] flex items-center gap-1">
                <ImageIcon className="w-3 h-3" />
                <span>نمودارهای ترسیم‌شده (Matplotlib Visualizations):</span>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {outputPlots.map((plotUrl, pIdx) => (
                  <div key={pIdx} className="bg-white rounded-lg p-1.5 shadow-md inline-block">
                    <img src={plotUrl} alt={`Matplotlib Plot ${pIdx + 1}`} className="max-h-60 rounded object-contain mx-auto" />
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
