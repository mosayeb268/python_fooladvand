import React, { useState } from 'react'
import { BookOpen, Copy, Check, Download, Search, Terminal, CheckCircle2, Filter, Play, Image as ImageIcon } from 'lucide-react'
import notebooksData from '../data/notebooks.json'
import { executePython } from '../utils/pythonRunner'

export default function NotebooksSection() {
  const [selectedNotebookId, setSelectedNotebookId] = useState(notebooksData[0]?.id || '')
  const [cellSearch, setCellSearch] = useState('')
  const [copiedCellIndex, setCopiedCellIndex] = useState(null)
  const [displayLimit, setDisplayLimit] = useState(25)
  const [liveOutputs, setLiveOutputs] = useState({})
  const [runningCellIdx, setRunningCellIdx] = useState(null)
  const [completedCells, setCompletedCells] = useState(() => {
    try {
      const saved = localStorage.getItem('pda_completed_cells')
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  })

  const activeNb = notebooksData.find(nb => nb.id === selectedNotebookId) || notebooksData[0]

  const toggleCellComplete = (cellIdx) => {
    const key = `${activeNb.id}_${cellIdx}`
    setCompletedCells(prev => {
      const next = { ...prev, [key]: !prev[key] }
      try {
        localStorage.setItem('pda_completed_cells', JSON.stringify(next))
      } catch {}
      return next
    })
  }

  const handleCopyCode = (code, index) => {
    navigator.clipboard.writeText(code)
    setCopiedCellIndex(index)
    setTimeout(() => setCopiedCellIndex(null), 2000)
  }

  const handleRunCell = async (cell) => {
    setRunningCellIdx(cell.index)
    try {
      const res = await executePython(cell.source)
      setLiveOutputs(prev => ({
        ...prev,
        [cell.index]: {
          logs: res.logs,
          plots: res.plots || [],
          success: res.success,
          engine: res.engine
        }
      }))
    } catch (err) {
      setLiveOutputs(prev => ({
        ...prev,
        [cell.index]: {
          logs: [`خطا: ${err.message || err}`],
          plots: [],
          success: false
        }
      }))
    } finally {
      setRunningCellIdx(null)
    }
  }

  const filteredCells = activeNb.cells.filter(cell => {
    if (!cellSearch) return true
    const term = cellSearch.toLowerCase()
    const matchesSource = cell.source.toLowerCase().includes(term)
    const matchesOutput = cell.outputs.some(out => 
      (out.text && out.text.toLowerCase().includes(term)) ||
      (out.html && out.html.toLowerCase().includes(term))
    )
    return matchesSource || matchesOutput
  })

  const visibleCells = filteredCells.slice(0, displayLimit)

  // Preset topic pills for quick exploration
  const topicShortcuts = {
    'nb-11': ['np.array', 'shape', 'arange', 'zeros', 'slicing', 'dtype'],
    'nb-13': ['broadcasting', 'sum', 'mean', 'reshape', 'ufunc', 'random'],
    'nb-15': ['Series', 'DataFrame', 'head', 'loc', 'iloc', 'describe'],
    'nb-18': ['dropna', 'fillna', 'groupby', 'titanic', 'Employees', 'value_counts']
  }

  const shortcuts = topicShortcuts[activeNb.id] || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-amber-400" />
            <span>نوت‌بوک‌های ژوپیتر (۴ فایل - ۲۱۸ سلول آموزشی)</span>
          </h2>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            مشاهده تعاملی کدهای NumPy و Pandas به همراه خروجی‌های واقعی متنی و جداول کامل دیتافریم‌های خروجی
          </p>
        </div>

        {/* Notebook Download */}
        <a
          href={activeNb.downloadUrl}
          download={activeNb.filename}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 transition-all self-start md:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>دانلود فایل {activeNb.filename}</span>
        </a>
      </div>

      {/* Notebook Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {notebooksData.map(nb => {
          const isSelected = nb.id === selectedNotebookId
          return (
            <div
              key={nb.id}
              onClick={() => {
                setSelectedNotebookId(nb.id)
                setDisplayLimit(25)
                setCellSearch('')
              }}
              className={`cursor-pointer rounded-xl p-4 border transition-all ${
                isSelected
                  ? 'bg-amber-500/15 border-amber-500/50 shadow-md shadow-amber-500/10'
                  : 'bg-slate-900/60 hover:bg-slate-800/80 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-bold text-amber-400" dir="ltr">
                  #{nb.order < 10 ? `0${nb.order}` : nb.order}
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                  {nb.totalCells} سلول
                </span>
              </div>
              <h3 className="text-sm font-bold text-white line-clamp-1">{nb.title}</h3>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">{nb.subtitle}</p>
            </div>
          )
        })}
      </div>

      {/* Active Notebook Details Banner */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white">{activeNb.title}</h3>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-800 text-amber-300" dir="ltr">
                {activeNb.filename}
              </span>
            </div>
            <p className="text-xs md:text-sm text-slate-300 mt-1">{activeNb.description}</p>
          </div>

          {/* Filter within cells */}
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="جستجوی کد در سلول‌ها..."
              value={cellSearch}
              onChange={(e) => setCellSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-9 pl-4 py-2 text-xs md:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
            />
          </div>
        </div>

        {/* Quick Topics Jump Pills */}
        <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-800/60">
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Filter className="w-3 h-3" />
            <span>فیلتر سریع کلیدواژه‌ها:</span>
          </span>
          <button
            onClick={() => setCellSearch('')}
            className={`text-[11px] px-2 py-0.5 rounded-lg border font-mono transition-colors ${
              cellSearch === '' ? 'bg-amber-500 text-slate-950 font-bold border-amber-400' : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            همه
          </button>
          {shortcuts.map(tag => (
            <button
              key={tag}
              onClick={() => setCellSearch(tag)}
              className={`text-[11px] px-2 py-0.5 rounded-lg border font-mono transition-colors ${
                cellSearch === tag ? 'bg-amber-500 text-slate-950 font-bold border-amber-400' : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Cells List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span>نمایش {Math.min(visibleCells.length, filteredCells.length)} از {filteredCells.length} سلول</span>
          {cellSearch && (
            <span className="flex items-center gap-1.5 text-amber-400">
              <span>فیلتر شده بر اساس: "{cellSearch}"</span>
              <button onClick={() => setCellSearch('')} className="underline text-[11px] text-slate-400 hover:text-white">پاک کردن</button>
            </span>
          )}
        </div>

        {visibleCells.map((cell) => {
          const isCopied = copiedCellIndex === cell.index
          const hasOutputs = cell.outputs && cell.outputs.length > 0
          const isCellDone = Boolean(completedCells[`${activeNb.id}_${cell.index}`])

          return (
            <div
              key={cell.index}
              className={`rounded-2xl border overflow-hidden shadow-lg transition-all ${
                isCellDone ? 'bg-slate-900/40 border-emerald-500/30' : 'bg-slate-900 border-slate-800'
              }`}
            >
              {/* Input Cell (Code) */}
              <div className="flex flex-col">
                <div className="px-4 py-2 bg-slate-950/70 border-b border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-mono" dir="ltr">
                    <span className="text-cyan-400 font-bold">In [{cell.execution_count ?? cell.index}]:</span>
                    <span className="text-[11px] text-slate-500">سلول #{cell.index}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleRunCell(cell)}
                      disabled={runningCellIdx === cell.index}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-colors disabled:opacity-50 shadow-sm"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>{runningCellIdx === cell.index ? 'در حال اجرا...' : 'اجرای زنده'}</span>
                    </button>

                    <button
                      onClick={() => toggleCellComplete(cell.index)}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] border transition-colors ${
                        isCellDone
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold'
                          : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                      }`}
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{isCellDone ? 'بررسی شد' : 'علامت مطالعه'}</span>
                    </button>

                    <button
                      onClick={() => handleCopyCode(cell.source, cell.index)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                    >
                      {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{isCopied ? 'کپی شد' : 'کپی'}</span>
                    </button>
                  </div>
                </div>

                {/* Code body */}
                <div className="p-4 bg-slate-950 font-mono text-xs md:text-sm text-slate-200 overflow-x-auto" dir="ltr">
                  <pre className="leading-relaxed whitespace-pre-wrap">{cell.source}</pre>
                </div>

                {/* Live execution output if user ran this cell */}
                {liveOutputs[cell.index] && (
                  <div className="border-t-2 border-emerald-500/40 bg-black/90 p-3 space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-mono text-emerald-400 font-bold flex items-center gap-1.5">
                        <Terminal className="w-3.5 h-3.5" />
                        <span>Live Execution Output ({liveOutputs[cell.index].engine || 'Pyodide'}):</span>
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] ${liveOutputs[cell.index].success ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                        {liveOutputs[cell.index].success ? 'موفقیت‌آمیز' : 'خطا'}
                      </span>
                    </div>
                    <div className="font-mono text-xs text-emerald-300 p-2.5 bg-slate-950 rounded-lg border border-slate-800 whitespace-pre-wrap" dir="ltr">
                      {liveOutputs[cell.index].logs.map((l, lIdx) => (
                        <div key={lIdx}>{l}</div>
                      ))}
                    </div>
                    {liveOutputs[cell.index].plots && liveOutputs[cell.index].plots.length > 0 && (
                      <div className="pt-2">
                        <div className="text-amber-400 text-xs font-bold mb-1 flex items-center gap-1">
                          <ImageIcon className="w-3.5 h-3.5" />
                          <span>خروجی نمودار:</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {liveOutputs[cell.index].plots.map((pUrl, pIdx) => (
                            <img key={pIdx} src={pUrl} alt="Cell plot" className="bg-white rounded p-1 max-h-56 mx-auto" />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Output Cells */}
              {hasOutputs && (
                <div className="border-t border-slate-800 bg-slate-900/60 p-4 space-y-3">
                  <div className="text-[11px] font-mono text-slate-400 font-bold" dir="ltr">
                    Out [{cell.execution_count ?? cell.index}]:
                  </div>

                  {cell.outputs.map((out, oIdx) => (
                    <div key={oIdx} className="space-y-2">
                      {/* Render HTML Tables (e.g. Pandas DataFrames) */}
                      {out.html && (
                        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/40 p-2">
                          <div
                            dangerouslySetInnerHTML={{ __html: out.html }}
                            className="text-xs"
                          />
                        </div>
                      )}

                      {/* Render Plain Text stream or execute_result */}
                      {out.text && (
                        <div className="font-mono text-xs text-amber-300/90 bg-black/60 p-3 rounded-xl border border-slate-800/80 overflow-x-auto whitespace-pre-wrap" dir="ltr">
                          {out.text}
                        </div>
                      )}

                      {/* Render Error */}
                      {out.traceback && (
                        <div className="font-mono text-xs text-rose-400 bg-rose-950/30 p-3 rounded-xl border border-rose-900/50 overflow-x-auto whitespace-pre-wrap" dir="ltr">
                          {out.traceback}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}

        {/* Load More Button */}
        {filteredCells.length > displayLimit && (
          <div className="text-center pt-4">
            <button
              onClick={() => setDisplayLimit(prev => prev + 25)}
              className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all shadow-md"
            >
              بارگذاری موارد بیشتر ({filteredCells.length - displayLimit} سلول باقی‌مانده)
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
