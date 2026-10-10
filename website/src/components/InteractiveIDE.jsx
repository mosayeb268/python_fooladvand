import React, { useState, useRef, useEffect } from 'react'
import {
  Terminal, Play, Trash2, Copy, Check, Download,
  Maximize2, Minimize2, ZoomIn, ZoomOut, Database,
  Image as ImageIcon, Layers, X
} from 'lucide-react'
import { executePython, evaluateReplExpression } from '../utils/pythonRunner'
import pythonExamples from '../data/python_examples.json'

const DEFAULT_CODE = `# به استودیو تعاملی و مفسر پایتون خوش آمدید!
# این محیط همانند یک IDE حرفه‌ای دارای ترمینال زنده و ورودی درجا (Interactive input) است.

name = input("نام خود را وارد کنید: ")
age = int(input("سن خود را وارد کنید: "))

print(f"\\nسلام {name} عزیز! خوش آمدید.")
print(f"سال آینده شما {age + 1} ساله خواهید بود.")
`

const M1_CODE = `# ماژول کمکی اشکال هندسی (m1.py)
def rectangle(a, b):
    """محاسبه مساحت مستطیل"""
    return a * b

def triangle(l, h):
    """محاسبه مساحت مثلث"""
    return (l * h) / 2

def cube(l, w, h):
    """محاسبه حجم مکعب"""
    return l * w * h

print("ماژول هندسی m1 با موفقیت بارگذاری شد.")
`

const DATASET_SAMPLE_CODE = `# تحلیل سریع دیتاست پرسنلی (Employees.csv)
import pandas as pd
import numpy as np

# خواندن مستقیم فایل از فایل‌سیستم مجازی Pyodide
df = pd.read_csv('16-Employees.csv')
print("نمایش ۵ سطر نخست کارکنان:")
print(df.head())

print("\\nمشخصات آماری حقوق و سابقه:")
print(df[['Workday', 'Salary']].describe())
`

export default function InteractiveIDE({
  code: externalCode,
  setCode: externalSetCode,
  onClose,
  isOpen = true,
  isEmbedded = false
}) {
  // Tabs & Files state
  const [activeFile, setActiveFile] = useState('main.py')
  const [files, setFiles] = useState({
    'main.py': externalCode || DEFAULT_CODE,
    'm1.py': M1_CODE,
    'analysis.py': DATASET_SAMPLE_CODE
  })

  // Sync external code when prop updates
  const [prevExternalCode, setPrevExternalCode] = useState(externalCode)
  if (externalCode !== undefined && externalCode !== null && externalCode !== prevExternalCode) {
    setPrevExternalCode(externalCode)
    setFiles(prev => ({ ...prev, 'main.py': externalCode }))
  }

  const currentCode = files[activeFile] || ''
  const setCurrentCode = (newCode) => {
    setFiles(prev => ({ ...prev, [activeFile]: newCode }))
    if (activeFile === 'main.py' && externalSetCode) {
      externalSetCode(newCode)
    }
  }

  // Terminal & Execution state
  const [activeTab, setActiveTab] = useState('terminal') // 'terminal' | 'plots' | 'variables' | 'files'
  const [logs, setLogs] = useState([
    { type: 'system', text: 'Python 3.12+ WebAssembly Environment (Pyodide Engine)' },
    { type: 'info', text: 'کنسول تعاملی آماده اجراست. برای اجرای برنامه روی [اجرای کد] یا کلید [Ctrl+Enter] کلیک کنید.' }
  ])
  const [plots, setPlots] = useState([])
  const [variables, setVariables] = useState([])
  const [isRunning, setIsRunning] = useState(false)
  const [copied, setCopied] = useState(false)
  const [fontSize, setFontSize] = useState(13) // px
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 })

  // Interactive Inline Input state
  const [isWaitingInput, setIsWaitingInput] = useState(false)
  const [inputPromptText, setInputPromptText] = useState('')
  const [inputFieldValue, setInputFieldValue] = useState('')
  const inputResolverRef = useRef(null)
  const inputFieldRef = useRef(null)

  // REPL interactive command state
  const [replInput, setReplInput] = useState('')

  // Terminal container scroll ref
  const terminalScrollRef = useRef(null)
  const editorTextareaRef = useRef(null)

  // Scroll terminal to bottom when new logs or inputs arrive
  useEffect(() => {
    if (terminalScrollRef.current) {
      terminalScrollRef.current.scrollTop = terminalScrollRef.current.scrollHeight
    }
  }, [logs, isWaitingInput])

  // Focus input field when waiting for interactive input
  useEffect(() => {
    if (isWaitingInput && inputFieldRef.current) {
      inputFieldRef.current.focus()
    }
  }, [isWaitingInput])

  // Real-time interactive input prompt handler
  const handleTerminalInputPrompt = (promptText) => {
    return new Promise((resolve) => {
      setIsWaitingInput(true)
      setInputPromptText(promptText || '')
      setInputFieldValue('')
      inputResolverRef.current = resolve
    })
  }

  // User submits inline input from terminal
  const handleSubmitTerminalInput = (e) => {
    if (e) e.preventDefault()
    if (!isWaitingInput) return

    const enteredText = inputFieldValue
    setIsWaitingInput(false)

    // Echo the prompt + entered value in terminal log
    setLogs(prev => [
      ...prev,
      { type: 'input_echo', text: `${inputPromptText}${enteredText}` }
    ])

    if (inputResolverRef.current) {
      inputResolverRef.current(enteredText)
      inputResolverRef.current = null
    }
  }

  // Run Python Code
  const handleRun = async () => {
    if (isRunning) return
    setIsRunning(true)
    setActiveTab('terminal')
    setPlots([])

    setLogs(prev => [
      ...prev,
      { type: 'cmd', text: `>>> python ${activeFile}` }
    ])

    try {
      const result = await executePython(currentCode, {
        onInputPrompt: handleTerminalInputPrompt
      })

      if (result.success) {
        setLogs(prev => [
          ...prev,
          ...result.logs.map(l => ({ type: 'stdout', text: l })),
          { type: 'success', text: `[Process finished with exit code 0]` }
        ])
      } else {
        setLogs(prev => [
          ...prev,
          ...result.logs.map(l => ({ type: 'stderr', text: l }))
        ])
      }

      if (result.plots && result.plots.length > 0) {
        setPlots(result.plots)
        setActiveTab('plots')
      }

      if (result.variables && result.variables.length > 0) {
        setVariables(result.variables)
      }
    } catch (err) {
      setLogs(prev => [
        ...prev,
        { type: 'stderr', text: `Fatal Error: ${err.message || err}` }
      ])
    } finally {
      setIsRunning(false)
      setIsWaitingInput(false)
    }
  }

  // Handle REPL Command
  const handleReplSubmit = async (e) => {
    e.preventDefault()
    if (!replInput.trim() || isRunning) return

    const cmd = replInput.trim()
    setReplInput('')
    setLogs(prev => [...prev, { type: 'cmd', text: `>>> ${cmd}` }])

    const res = await evaluateReplExpression(cmd)
    if (res.success) {
      setLogs(prev => [...prev, { type: 'stdout', text: res.output }])
    } else {
      setLogs(prev => [...prev, { type: 'stderr', text: res.output }])
    }
  }

  // Keyboard shortcut & Tab Key handling in editor
  const handleEditorKeyDown = (e) => {
    // Ctrl + Enter to run
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      handleRun()
      return
    }

    // Tab key inserts 4 spaces
    if (e.key === 'Tab') {
      e.preventDefault()
      const textarea = e.target
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const val = textarea.value

      const newVal = val.substring(0, start) + '    ' + val.substring(end)
      setCurrentCode(newVal)

      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 4
      }, 0)
      return
    }

    // Auto-close brackets/quotes
    const pairs = { '(': ')', '[': ']', '{': '}', '"': '"', "'": "'" }
    if (pairs[e.key]) {
      const textarea = e.target
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const val = textarea.value

      if (start === end) {
        e.preventDefault()
        const newVal = val.substring(0, start) + e.key + pairs[e.key] + val.substring(end)
        setCurrentCode(newVal)
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 1
        }, 0)
      }
    }
  }

  // Update Cursor Position for Status Bar
  const handleEditorSelect = () => {
    if (!editorTextareaRef.current) return
    const selStart = editorTextareaRef.current.selectionStart
    const textBefore = currentCode.substring(0, selStart)
    const lines = textBefore.split('\n')
    setCursorPos({
      line: lines.length,
      col: lines[lines.length - 1].length + 1
    })
  }

  const handleClearTerminal = () => {
    setLogs([{ type: 'system', text: 'ترمینال پاکسازی شد.' }])
    setPlots([])
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!isOpen) return null

  const lineCount = currentCode.split('\n').length
  const linesArray = Array.from({ length: Math.max(lineCount, 1) }, (_, i) => i + 1)

  return (
    <div className={`flex flex-col bg-slate-950 text-slate-100 font-sans border border-slate-800 shadow-2xl transition-all ${
      isFullscreen
        ? 'fixed inset-0 z-50 rounded-none'
        : isEmbedded
          ? 'h-full w-full rounded-xl overflow-hidden'
          : 'fixed inset-4 sm:inset-8 z-50 rounded-2xl overflow-hidden max-h-[92vh]'
    }`}>
      
      {/* ===== 1. TOP TITLE BAR & ACTION CONTROLS ===== */}
      <div className="bg-slate-900 border-b border-slate-800 px-3 py-2 flex flex-wrap items-center justify-between gap-2 shrink-0">
        
        {/* Left: File Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto">
          {Object.keys(files).map((fileName) => {
            const isActive = activeFile === fileName
            return (
              <button
                key={fileName}
                onClick={() => setActiveFile(fileName)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-colors border ${
                  isActive
                    ? 'bg-slate-950 text-emerald-400 border-slate-700 font-bold shadow-sm'
                    : 'bg-slate-900/60 text-slate-400 border-transparent hover:text-white hover:bg-slate-800'
                }`}
              >
                <span className="text-amber-400">🐍</span>
                <span>{fileName}</span>
              </button>
            )
          })}
        </div>

        {/* Right: Actions (Run, Snippets, Layout, Close) */}
        <div className="flex items-center gap-2">
          
          {/* Quick Course Snippets Selector */}
          <select
            onChange={(e) => {
              const ex = pythonExamples.find(p => p.filename === e.target.value)
              if (ex) {
                setCurrentCode(ex.code)
              }
            }}
            className="bg-slate-950 border border-slate-700 text-slate-300 text-xs rounded-lg px-2.5 py-1.5 font-mono focus:outline-none focus:border-emerald-500 max-w-[200px] truncate"
            defaultValue=""
          >
            <option value="" disabled>-- بارگذاری نمونه‌کد دوره --</option>
            {pythonExamples.map(p => (
              <option key={p.id} value={p.filename}>
                {p.filename} ({p.title.slice(0, 24)}...)
              </option>
            ))}
          </select>

          {/* Copy Button */}
          <button
            onClick={handleCopyCode}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="کپی کد"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>

          {/* Zoom Font */}
          <button
            onClick={() => setFontSize(f => Math.min(f + 1, 20))}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
            title="بزرگ‌نمایی فونت"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setFontSize(f => Math.max(f - 1, 10))}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
            title="کوچک‌نمایی فونت"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
            title={isFullscreen ? 'خروج از تمام‌صفحه' : 'تمام‌صفحه'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Primary Action: Run Button */}
          <button
            onClick={handleRun}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-emerald-600/30 disabled:opacity-50 active:scale-95"
            title="اجرای کد (Ctrl + Enter)"
          >
            <Play className={`w-3.5 h-3.5 fill-current ${isRunning ? 'animate-spin' : ''}`} />
            <span>{isRunning ? 'در حال اجرا...' : 'اجرای کد (Ctrl+Enter)'}</span>
          </button>

          {/* Close Modal if not embedded */}
          {onClose && !isEmbedded && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
              title="بستن"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* ===== 2. MAIN SPLIT WORKSPACE (Code Editor on Left, Terminal/Tools on Right) ===== */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
        
        {/* ----- A. CODE EDITOR PANEL ----- */}
        <div className="flex-1 flex flex-col bg-slate-950 border-b lg:border-b-0 lg:border-r border-slate-800 overflow-hidden">
          
          <div className="flex-1 flex overflow-hidden">
            {/* Line Numbers Gutter */}
            <div
              className="w-12 bg-slate-900/40 select-none py-3 text-right pr-3 pl-1 font-mono text-slate-600 border-r border-slate-800/80 shrink-0 overflow-hidden"
              style={{ fontSize: `${fontSize}px`, lineHeight: `${fontSize * 1.6}px` }}
              dir="ltr"
            >
              {linesArray.map(n => (
                <div key={n} className="leading-inherit">{n}</div>
              ))}
            </div>

            {/* Code Textarea Editor */}
            <div className="flex-1 relative overflow-hidden bg-slate-950">
              <textarea
                ref={editorTextareaRef}
                value={currentCode}
                onChange={(e) => setCurrentCode(e.target.value)}
                onKeyDown={handleEditorKeyDown}
                onSelect={handleEditorSelect}
                onClick={handleEditorSelect}
                onKeyUp={handleEditorSelect}
                spellCheck="false"
                className="w-full h-full p-3 bg-transparent text-emerald-300 font-mono resize-none focus:outline-none selection:bg-emerald-500/30 whitespace-pre overflow-auto"
                style={{ fontSize: `${fontSize}px`, lineHeight: `${fontSize * 1.6}px` }}
                dir="ltr"
                placeholder="# کدهای پایتون خود را اینجا بنویسید..."
              />
            </div>
          </div>

          {/* Editor Status Bar */}
          <div className="px-3 py-1 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono select-none">
            <div className="flex items-center gap-3">
              <span className="text-emerald-400 font-bold">Python 3.12</span>
              <span>Ln {cursorPos.line}, Col {cursorPos.col}</span>
              <span>{lineCount} خط</span>
            </div>
            <div className="flex items-center gap-3">
              <span>UTF-8</span>
              <span>Spaces: 4</span>
              <span className="text-slate-500">Ctrl+Enter جهت اجرا</span>
            </div>
          </div>
        </div>

        {/* ----- B. TERMINAL & TOOLS PANEL ----- */}
        <div className="flex-1 flex flex-col bg-black/90 min-h-[280px] lg:min-h-0 overflow-hidden">
          
          {/* Output Tool Tabs */}
          <div className="bg-slate-900/90 border-b border-slate-800 px-3 py-1 flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveTab('terminal')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-mono transition-colors ${
                  activeTab === 'terminal'
                    ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>ترمینال تعاملی</span>
              </button>

              <button
                onClick={() => setActiveTab('plots')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-mono transition-colors ${
                  activeTab === 'plots'
                    ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>نمودارها ({plots.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('variables')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-mono transition-colors ${
                  activeTab === 'variables'
                    ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>متغیرهای حافظه ({variables.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('files')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-mono transition-colors ${
                  activeTab === 'files'
                    ? 'bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Database className="w-3.5 h-3.5" />
                <span>دیتاست‌ها</span>
              </button>
            </div>

            <button
              onClick={handleClearTerminal}
              className="p-1 rounded text-slate-500 hover:text-rose-400 transition-colors"
              title="پاکسازی کنسول"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* TAB 1: Real Interactive Terminal */}
          {activeTab === 'terminal' && (
            <div className="flex-1 flex flex-col overflow-hidden bg-black/95">
              
              {/* Terminal Logs View */}
              <div
                ref={terminalScrollRef}
                className="flex-1 p-3 overflow-y-auto font-mono text-xs space-y-1 select-text leading-relaxed"
                dir="ltr"
              >
                {logs.map((log, idx) => {
                  if (log.type === 'system') {
                    return <div key={idx} className="text-slate-500 italic">[{log.text}]</div>
                  }
                  if (log.type === 'cmd') {
                    return <div key={idx} className="text-cyan-400 font-bold">{log.text}</div>
                  }
                  if (log.type === 'input_echo') {
                    return <div key={idx} className="text-amber-300 font-bold">{log.text}</div>
                  }
                  if (log.type === 'stderr') {
                    return <div key={idx} className="text-rose-400 whitespace-pre-wrap">{log.text}</div>
                  }
                  if (log.type === 'success') {
                    return <div key={idx} className="text-emerald-400 text-[11px] font-bold mt-1">{log.text}</div>
                  }
                  return <div key={idx} className="text-emerald-300 whitespace-pre-wrap">{log.text}</div>
                })}

                {/* ===== THE REAL INLINE INTERACTIVE INPUT LINE ===== */}
                {isWaitingInput && (
                  <form
                    onSubmit={handleSubmitTerminalInput}
                    className="flex items-center gap-1 pt-1 text-xs font-mono animate-in fade-in duration-150"
                  >
                    <span className="text-amber-400 font-bold shrink-0">{inputPromptText || '>>> '}</span>
                    <input
                      ref={inputFieldRef}
                      type="text"
                      value={inputFieldValue}
                      onChange={(e) => setInputFieldValue(e.target.value)}
                      placeholder="مقدار ورودی را تایپ کنید و Enter بزنید..."
                      className="flex-1 bg-amber-500/10 border-b-2 border-amber-400 text-amber-200 px-2 py-0.5 outline-none font-mono text-xs selection:bg-amber-400/30"
                      autoFocus
                    />
                    <button
                      type="submit"
                      className="px-2 py-0.5 rounded bg-amber-500 hover:bg-amber-400 text-black font-bold text-[10px] transition-colors"
                    >
                      ارسال [Enter]
                    </button>
                  </form>
                )}
              </div>

              {/* REPL Quick Command Prompt (When not running) */}
              {!isRunning && !isWaitingInput && (
                <form
                  onSubmit={handleReplSubmit}
                  className="px-3 py-1.5 bg-slate-950 border-t border-slate-800/80 flex items-center gap-2 text-xs font-mono shrink-0"
                  dir="ltr"
                >
                  <span className="text-cyan-400 font-bold">{'>>>'}</span>
                  <input
                    type="text"
                    value={replInput}
                    onChange={(e) => setReplInput(e.target.value)}
                    placeholder="اجرای دستور تک‌خطی در کنسول (مثلاً: 2**10 یا pd.__version__)..."
                    className="flex-1 bg-transparent text-slate-200 outline-none text-xs font-mono placeholder:text-slate-600"
                  />
                  {replInput && (
                    <button
                      type="submit"
                      className="text-[10px] px-2 py-0.5 rounded bg-cyan-600 text-white font-bold"
                    >
                      اجرا
                    </button>
                  )}
                </form>
              )}
            </div>
          )}

          {/* TAB 2: Matplotlib Visualizations */}
          {activeTab === 'plots' && (
            <div className="flex-1 p-4 overflow-y-auto bg-slate-950 space-y-4">
              {plots.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-500 text-xs py-16">
                  <ImageIcon className="w-8 h-8 mb-2 opacity-40" />
                  <span>هنوز هیچ نموداری با Matplotlib رسم نشده است.</span>
                  <span className="text-[11px] text-slate-600 mt-1">با اجرای کدهای حاوی plt.plot() نمودارها اینجا ظاهر می‌شوند.</span>
                </div>
              ) : (
                plots.map((plotUrl, idx) => (
                  <div key={idx} className="bg-white rounded-xl p-3 shadow-lg border border-slate-700 flex flex-col items-center gap-2">
                    <img src={plotUrl} alt={`Plot ${idx + 1}`} className="max-h-80 rounded object-contain" />
                    <a
                      href={plotUrl}
                      download={`plot_${idx + 1}.png`}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>دانلود تصویر نمودار (PNG)</span>
                    </a>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: Active Variables Inspector */}
          {activeTab === 'variables' && (
            <div className="flex-1 p-3 overflow-y-auto bg-slate-950">
              {variables.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-500 text-xs py-16">
                  <Layers className="w-8 h-8 mb-2 opacity-40" />
                  <span>متغیری در حافظه ثبت نشده است. برنامه را اجرا کنید تا وضعیت متغیرها دیده شود.</span>
                </div>
              ) : (
                <table className="w-full text-xs font-mono border-collapse" dir="ltr">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 text-left">
                      <th className="py-2 px-2">نام (Variable)</th>
                      <th className="py-2 px-2">نوع (Type)</th>
                      <th className="py-2 px-2">مقدار (Value)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900">
                    {variables.map((v, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/40">
                        <td className="py-1.5 px-2 text-cyan-400 font-bold">{v.name}</td>
                        <td className="py-1.5 px-2 text-amber-400">{v.type}</td>
                        <td className="py-1.5 px-2 text-emerald-300 truncate max-w-xs">{v.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* TAB 4: Mounted Datasets Browser */}
          {activeTab === 'files' && (
            <div className="flex-1 p-4 overflow-y-auto bg-slate-950 space-y-3">
              <div className="text-xs text-slate-300 font-bold flex items-center gap-1.5 pb-2 border-b border-slate-800">
                <Database className="w-4 h-4 text-cyan-400" />
                <span>دیتاست‌ها و ماژول‌های آماده در فایل‌سیستم مجازی:</span>
              </div>

              {/* Employees.csv card */}
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3 text-xs">
                <div>
                  <div className="font-mono font-bold text-white flex items-center gap-1.5">
                    <span>📄 16-Employees.csv</span>
                    <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded">۱۰ سطر</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">دیتاست مشخصات کارکنان جهت تمرین پاکسازی NaN</p>
                </div>
                <button
                  onClick={() => {
                    setCurrentCode(DATASET_SAMPLE_CODE)
                    setActiveFile('analysis.py')
                  }}
                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                >
                  ⚡ درج کد پانداس
                </button>
              </div>

              {/* titanic.csv card */}
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3 text-xs">
                <div>
                  <div className="font-mono font-bold text-white flex items-center gap-1.5">
                    <span>📄 21-titanic.csv</span>
                    <span className="text-[10px] text-cyan-400 bg-cyan-500/10 px-1.5 py-0.2 rounded">۸۹۱ سطر</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">دیتاست جامع نرخ بقای مسافران تایتانیک</p>
                </div>
                <button
                  onClick={() => {
                    setCurrentCode(`import pandas as pd\\ndf = pd.read_csv('21-titanic.csv')\\nprint(df.info())\\nprint(df.describe())`)
                    setActiveFile('analysis.py')
                  }}
                  className="px-2.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs"
                >
                  ⚡ درج کد پانداس
                </button>
              </div>

              {/* m1.py card */}
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3 text-xs">
                <div>
                  <div className="font-mono font-bold text-white flex items-center gap-1.5">
                    <span>📄 m1.py</span>
                    <span className="text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded">ماژول کمکی</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">توابع هندسی rectangle, triangle, cube</p>
                </div>
                <button
                  onClick={() => {
                    setCurrentCode(`from m1 import rectangle, triangle\\nprint("Rectangle (4, 5):", rectangle(4, 5))\\nprint("Triangle (6, 8):", triangle(6, 8))`)
                    setActiveFile('main.py')
                  }}
                  className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs"
                >
                  ⚡ درج ایمپورت
                </button>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  )
}
