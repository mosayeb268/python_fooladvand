import React, { useState, useEffect, useMemo } from 'react'
import {
  Terminal, Play, Copy, Check, Printer,
  X, Download, CheckCircle2, XCircle,
  RotateCcw, ZoomIn, ArrowUp, Database,
  Image as ImageIcon, Columns, Maximize2
} from 'lucide-react'
import pythonExamples from '../data/python_examples.json'
import datasetsData from '../data/datasets.json'
import quizQuestions from '../data/quiz.json'
import pdfsData from '../data/pdfs.json'
import { executePython, initPyodide } from '../utils/pythonRunner'

export default function A4BookletView({ onOpenPdf }) {
  // IDE State
  const [isIdeOpen, setIsIdeOpen] = useState(false)
  const [isIdeDocked, setIsIdeDocked] = useState(false)
  const [ideCode, setIdeCode] = useState(
    `# به کنسول تعاملی پایتون خوش آمدید!\nx = 15\ny = 25\ns = x + y\nprint(f"x={x} @@@ y={y} @@@ x+y={s}")`
  )
  const [ideOutput, setIdeOutput] = useState([
    'Python 3.12+ Interactive Terminal (NumPy / Pandas Ready)',
    'کنسول آماده اجرای واقعی کدهای جزوه و رسم نمودارها است.',
    'روی دکمه "⚡ اجرای زنده در کنسول" هر مثال کلیک کنید.'
  ])
  const [idePlots, setIdePlots] = useState([])
  const [isRunning, setIsRunning] = useState(false)
  const [userInputVal, setUserInputVal] = useState('20')
  const [copiedId, setCopiedId] = useState(null)
  const [engineTag, setEngineTag] = useState('آماده اجرا')

  // Reading & Display State
  const [fontSizeClass, setFontSizeClass] = useState('text-base') // 'text-sm' | 'text-base' | 'text-lg'
  const [searchFilter, setSearchFilter] = useState('')

  // Dataset Table State: Employees
  const [empSearch, setEmpSearch] = useState('')
  const [empDegreeFilter, setEmpDegreeFilter] = useState('all')

  // Dataset Table State: Titanic
  const [titanicSexFilter, setTitanicSexFilter] = useState('all')
  const [titanicClassFilter, setTitanicClassFilter] = useState('all')
  const [titanicSurvFilter, setTitanicSurvFilter] = useState('all')
  const [titanicSearch, setTitanicSearch] = useState('')
  const [titanicPage, setTitanicPage] = useState(1)

  // Quiz State
  const [quizAnswers, setQuizAnswers] = useState({})

  // Pre-init Pyodide in background
  useEffect(() => {
    initPyodide().then(p => {
      if (p) setEngineTag('🟢 پایتون ۳ (Pyodide WASM آماده)')
    })
  }, [])

  // Datasets extraction
  const employeesDataset = datasetsData.find(d => d.id === 'ds-employees') || datasetsData[0]
  const titanicDataset = datasetsData.find(d => d.id === 'ds-titanic') || datasetsData[1]

  // Filter Employees rows
  const filteredEmployeesRows = useMemo(() => {
    if (!employeesDataset || !employeesDataset.sampleRows) return []
    return employeesDataset.sampleRows.filter(row => {
      const matchDegree = empDegreeFilter === 'all' || row.Degree === empDegreeFilter
      const matchSearch = !empSearch || Object.values(row).some(v => String(v).toLowerCase().includes(empSearch.toLowerCase()))
      return matchDegree && matchSearch
    })
  }, [employeesDataset, empSearch, empDegreeFilter])

  // Filter Titanic rows
  const filteredTitanicRows = useMemo(() => {
    if (!titanicDataset || !titanicDataset.sampleRows) return []
    return titanicDataset.sampleRows.filter(row => {
      const matchSex = titanicSexFilter === 'all' || row.Sex === titanicSexFilter
      const matchClass = titanicClassFilter === 'all' || String(row.Pclass) === titanicClassFilter
      const matchSurv = titanicSurvFilter === 'all' || String(row.Survived) === titanicSurvFilter
      const matchSearch = !titanicSearch || (row.Name && String(row.Name).toLowerCase().includes(titanicSearch.toLowerCase()))
      return matchSex && matchClass && matchSurv && matchSearch
    })
  }, [titanicDataset, titanicSexFilter, titanicClassFilter, titanicSurvFilter, titanicSearch])

  const displayedTitanicRows = filteredTitanicRows.slice((titanicPage - 1) * 8, titanicPage * 8)
  const totalTitanicPages = Math.ceil(filteredTitanicRows.length / 8) || 1

  // Quiz score computation
  const quizScore = useMemo(() => {
    let score = 0
    quizQuestions.forEach(q => {
      if (quizAnswers[q.id] === q.correctIndex) score++
    })
    return score
  }, [quizAnswers])

  // Real execution handler via pythonRunner
  const handleRunInIde = async (code, filename = 'اسکریپت پایتون', expectedOutput = null) => {
    setIdeCode(code)
    setIsIdeOpen(true)
    setIsRunning(true)
    setIdePlots([])
    setIdeOutput([
      `>>> در حال اجرای [${filename}] ...`,
      `----------------------------------------`
    ])

    try {
      const result = await executePython(code, userInputVal, expectedOutput)
      setEngineTag(result.engine || 'پایتون ۳')
      setIdeOutput([
        `>>> اجرای برنامه [${filename}] پایان یافت.`,
        `[موتور: ${result.engine}]`,
        `----------------------------------------`,
        ...result.logs
      ])
      if (result.plots && result.plots.length > 0) {
        setIdePlots(result.plots)
      }
    } catch (err) {
      setIdeOutput([
        `>>> خطا در اجرای [${filename}]:`,
        String(err.message || err)
      ])
    } finally {
      setIsRunning(false)
    }
  }

  const handleCopy = (code, id) => {
    navigator.clipboard.writeText(code)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleFontSizeCycle = () => {
    if (fontSizeClass === 'text-sm') setFontSizeClass('text-base')
    else if (fontSizeClass === 'text-base') setFontSizeClass('text-lg')
    else setFontSizeClass('text-sm')
  }

  return (
    <div className={`booklet-wrapper bg-slate-300 dark:bg-slate-900 py-6 px-2 sm:px-4 text-slate-800 transition-colors font-sans ${fontSizeClass}`}>
      
      {/* ===== Floating Action Controls (چاپ، IDE، فهرست و بالا رفتن) ===== */}
      <div className="fixed bottom-6 left-6 z-50 flex flex-col gap-2.5 print:hidden">
        <button
          onClick={() => setIsIdeOpen(!isIdeOpen)}
          className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold px-4 py-3 rounded-full shadow-2xl shadow-emerald-900/40 border border-emerald-400/30 transition-all hover:-translate-y-1 text-xs sm:text-sm"
          title="کنسول زنده اجرای پایتون"
        >
          <Terminal className="w-4 h-4" />
          <span>{isIdeOpen ? 'بستن کنسول IDE' : '💻 کنسول پایتون (IDE)'}</span>
        </button>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold px-4 py-3 rounded-full shadow-2xl shadow-amber-900/40 border border-amber-400/30 transition-all hover:-translate-y-1 text-xs sm:text-sm"
          title="چاپ جزوه یا ذخیره به صورت PDF تمیز و خوانا"
        >
          <Printer className="w-4 h-4" />
          <span>🖨️ چاپ جزوه / ذخیره PDF</span>
        </button>

        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="w-11 h-11 self-end bg-slate-800 hover:bg-slate-700 text-white rounded-full flex items-center justify-center shadow-lg transition-transform hover:-translate-y-1 text-xs"
          title="بازگشت به ابتدای صفحه"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      </div>

      {/* ===== Interactive Python IDE Drawer / Modal (با پشتیبانی از حالت تبلت و داک کناری) ===== */}
      {isIdeOpen && (
        <div className={`z-50 bg-slate-950 text-slate-100 border-2 border-emerald-500/50 shadow-2xl overflow-hidden flex flex-col print:hidden transition-all duration-200 ${
          isIdeDocked
            ? 'fixed top-16 left-0 bottom-0 w-full sm:w-[480px] border-r-2 border-t-0 border-b-0 border-l-0 rounded-none'
            : 'fixed bottom-20 left-4 sm:left-8 w-full max-w-lg rounded-2xl max-h-[660px] animate-in fade-in slide-in-from-bottom duration-200'
        }`}>
          {/* IDE Header */}
          <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isRunning ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'}`} />
              <div>
                <h4 className="font-bold text-xs text-white">کنسول تعاملی و اجرای پایتون ۳</h4>
                <p className="text-[10px] text-emerald-400/90 font-mono">{engineTag}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsIdeDocked(!isIdeDocked)}
                className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs"
                title={isIdeDocked ? 'تغییر به حالت شناور' : 'داک کردن به گوشه صفحه (مناسب تبلت)'}
              >
                {isIdeDocked ? <Maximize2 className="w-3.5 h-3.5" /> : <Columns className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => {
                  setIdeOutput(['ترمینال پاکسازی شد.'])
                  setIdePlots([])
                }}
                className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs"
                title="پاکسازی خروجی"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsIdeOpen(false)}
                className="p-1 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 text-xs"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Snippet Selector */}
          <div className="px-3 py-1.5 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between gap-2 text-[11px]">
            <span className="text-slate-400 shrink-0 font-medium">کدهای آماده:</span>
            <select
              onChange={(e) => {
                const ex = pythonExamples.find(p => p.filename === e.target.value)
                if (ex) {
                  setIdeCode(ex.code)
                  handleRunInIde(ex.code, ex.filename, ex.expectedOutput)
                }
              }}
              className="flex-1 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs font-mono focus:outline-none"
              defaultValue=""
            >
              <option value="" disabled>-- انتخاب یک اسکریپت از ۳۳ کد دوره --</option>
              {pythonExamples.map(p => (
                <option key={p.id} value={p.filename}>
                  {p.filename} — {p.description.slice(0, 38)}...
                </option>
              ))}
            </select>
          </div>

          {/* Code Editor */}
          <div className="p-3 bg-slate-950 flex flex-col space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="font-mono text-emerald-400 font-bold">محیط ویرایش کد پایتون:</span>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-500 hidden sm:inline">[Ctrl+Enter]</span>
                <button
                  onClick={() => handleCopy(ideCode, 'ide')}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1"
                >
                  {copiedId === 'ide' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>کپی</span>
                </button>
                <button
                  onClick={() => handleRunInIde(ideCode, 'کد سفارشی')}
                  disabled={isRunning}
                  className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all shadow-md disabled:opacity-50"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>{isRunning ? 'در حال اجرا...' : 'اجرای کد'}</span>
                </button>
              </div>
            </div>

            <textarea
              value={ideCode}
              onChange={(e) => setIdeCode(e.target.value)}
              onKeyDown={(e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                  e.preventDefault()
                  handleRunInIde(ideCode, 'کد کاربر')
                }
              }}
              className="w-full h-36 bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 font-mono text-xs text-emerald-300 focus:outline-none focus:border-emerald-500/60 leading-5 resize-none"
              dir="ltr"
              placeholder="# کدهای پایتون را بنویسید (NumPy, Pandas, Matplotlib پشتیبانی می‌شوند)..."
            />

            {ideCode.includes('input(') && (
              <div className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px]">
                <span className="text-amber-400 font-bold">ورودی شبیه‌ساز input():</span>
                <input
                  type="text"
                  value={userInputVal}
                  onChange={(e) => setUserInputVal(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded px-2 py-0.5 text-white font-mono text-xs"
                  placeholder="مقدار ورودی کاربر..."
                />
              </div>
            )}
          </div>

          {/* Terminal Output */}
          <div className="flex-1 min-h-[160px] max-h-56 bg-black/95 border-t border-slate-800 p-3 overflow-y-auto font-mono text-[11px] text-emerald-400 space-y-1 select-text" dir="ltr">
            {ideOutput.map((l, idx) => (
              <div key={idx} className="whitespace-pre-wrap">{l}</div>
            ))}
            {idePlots.length > 0 && (
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <div className="text-amber-400 font-bold text-[10px] flex items-center gap-1">
                  <ImageIcon className="w-3 h-3" />
                  <span>نمودارهای ترسیم‌شده (Matplotlib Visualizations):</span>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {idePlots.map((plotUrl, pIdx) => (
                    <div key={pIdx} className="bg-white rounded-lg p-1.5 shadow-md">
                      <img src={plotUrl} alt="Plot" className="max-h-52 rounded object-contain mx-auto" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== A4 PAGE CONTAINER (عین استراکچر تمپلیت با تمام بهبودها) ===== */}
      <div className="page bg-white max-w-[215mm] mx-auto p-5 sm:p-9 shadow-2xl rounded-sm print:shadow-none print:p-0 print:max-w-full">
        
        {/* ===== سربرگ اصلی و نوار ابزار بالا ===== */}
        <div className="main-title text-center mb-6 pb-4 border-b-4 border-double border-orange-600">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-bold mb-2">
            <span>🎓 دانشگاه — دوره کارشناسی ترم ۶</span>
            <span>•</span>
            <span>پاییز ۱۴۰۵</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2.5 leading-snug">
            جزوه و مستندات جامع درس پایتون برای تحلیل داده (PDA)
          </h1>
          
          <p className="subtitle text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl mx-auto">
            پوشش ۱۰۰٪ تمام ۲۱ سرفصل رسمی: کتابخانه محاسباتی <strong>NumPy</strong> | پردازش داده با <strong>Pandas</strong> | 
            تحلیل پروژه‌های عملی <strong>Titanic</strong> و <strong>Employees</strong> | 
            همراه با کنسول تعاملی اجرای زنده و آزمون تست‌های پایان‌ترم
          </p>

          {/* Quick Toolbar */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 mt-4 pt-3 border-t border-slate-200 text-xs print:hidden">
            <button
              onClick={() => setIsIdeOpen(!isIdeOpen)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-sm"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>کنسول اجرای پایتون</span>
            </button>

            <button
              onClick={handleFontSizeCycle}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold border border-slate-300 transition-all"
              title="تغییر سایز قلم جزوه"
            >
              <ZoomIn className="w-3.5 h-3.5" />
              <span>اندازه قلم متن</span>
            </button>

            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-bold transition-all shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>چاپ استاندارد A4</span>
            </button>

            <div className="relative">
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="جستجو در متن جزوه..."
                className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-500 w-36 sm:w-48"
              />
              {searchFilter && (
                <button
                  onClick={() => setSearchFilter('')}
                  className="absolute left-2 top-1.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ===== فهرست مطالب (گرید دو ستونه استاندارد تمپلیت) ===== */}
        <div className="toc bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-300 rounded-xl p-4 sm:p-5 mb-6">
          <div className="toc-title text-base font-bold text-slate-800 pb-2 mb-3 border-b-2 border-orange-600 inline-block">
            📋 فهرست ۱۵ اسلاید و سرفصل آموزشی جزوه
          </div>
          <ul className="toc-list grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 list-none p-0 m-0 text-xs sm:text-sm">
            <li><a href="#s1" className="text-slate-700 hover:text-orange-600 font-medium">▸ ۱. مراجع و کتب رسمی درس (اقلام ۰۱ و ۰۲)</a></li>
            <li><a href="#s2" className="text-slate-700 hover:text-orange-600 font-medium">▸ ۲. مبانی پایتون و عملگرها (جزوه ۱ - فایل ۰۳)</a></li>
            <li><a href="#s3" className="text-slate-700 hover:text-orange-600 font-medium">▸ ۳. کدهای سری ۱: ورودی، خروجی و شرط‌ها (فایل ۰۵)</a></li>
            <li><a href="#s4" className="text-slate-700 hover:text-orange-600 font-medium">▸ ۴. ساختارهای توالی (لیست، تاپل، ست - فایل ۰۴)</a></li>
            <li><a href="#s5" className="text-slate-700 hover:text-orange-600 font-medium">▸ ۵. کدهای سری ۲: لیست‌ها و حلقه‌ها (فایل ۰۶)</a></li>
            <li><a href="#s6" className="text-slate-700 hover:text-orange-600 font-medium">▸ ۶. توابع، پارامترها و *args/**kwargs (فایل ۰۷)</a></li>
            <li><a href="#s7" className="text-slate-700 hover:text-orange-600 font-medium">▸ ۷. کدهای سری ۳ و ۴: Lambda و ماژول m1 (فایل ۰۸ و ۰۹)</a></li>
            <li><a href="#s8" className="text-slate-700 hover:text-orange-600 font-medium">▸ ۸. محاسبات ماتریسی با NumPy (فایل‌های ۱۰ تا ۱۳)</a></li>
            <li><a href="#s9" className="text-slate-700 hover:text-orange-600 font-medium">▸ ۹. کاوش داده و دیتافریم‌ها با Pandas (فایل‌های ۱۴، ۱۵، ۱۷)</a></li>
            <li><a href="#s10" className="text-slate-700 hover:text-orange-600 font-medium">▸ ۱۰. پروژه ۱: پاکسازی دیتاست Employees (فایل ۱۶ و ۱۹)</a></li>
            <li><a href="#s11" className="text-slate-700 hover:text-orange-600 font-medium">▸ ۱۱. پروژه ۲: تحلیل فاجعه تایتانیک (فایل ۱۸، ۲۰، ۲۱)</a></li>
            <li><a href="#s12" className="text-slate-700 hover:text-orange-600 font-medium">▸ ۱۲. جدول فرمول‌ها و متدهای پرکاربرد پانداس و نام‌پای</a></li>
            <li><a href="#s13" className="text-slate-700 hover:text-orange-600 font-medium">▸ ۱۳. چالش‌های درس و تله‌های امتحانی دانشجویان</a></li>
            <li><a href="#s14" className="text-slate-700 hover:text-orange-600 font-medium">▸ ۱۴. آزمون خودآزمایی و تست‌های تعاملی با پاسخ تشریحی</a></li>
            <li><a href="#s15" className="text-slate-700 hover:text-orange-600 font-medium">▸ ۱۵. جمع‌بندی و نتیجه‌گیری پایانی دوره</a></li>
          </ul>
        </div>

        {/* ===== اسلاید ۱: مراجع و کتب رسمی ===== */}
        <section className="slide border border-slate-300 rounded-xl mb-6 shadow-sm overflow-hidden" id="s1">
          <div className="slide-header bg-gradient-to-r from-slate-900 to-slate-800 text-white p-3.5 px-5 flex items-center gap-3.5 border-b-4 border-orange-600">
            <div className="slide-number bg-gradient-to-r from-orange-600 to-amber-500 text-white w-9 h-9 rounded-full flex items-center justify-center font-bold text-base shrink-0">۱</div>
            <h2 className="slide-title text-base sm:text-lg font-bold m-0">مراجع و کتاب‌های رسمی تدریس‌شده (فایل‌های ۰۱ و ۰۲)</h2>
          </div>
          <div className="slide-body p-5 leading-relaxed text-slate-700 space-y-3">
            <p>
              درس تحلیل داده با پایتون (Python for Data Analysis) یکی از دروس پایه‌ای و بسیار کاربردی حوزه علوم داده و مهندسی کامپیوتر است. 
              در این دوره آموزشی از دو مرجع اصلی و رسمی استفاده شده است:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-3">
              <div className="p-4 rounded-xl border border-orange-200 bg-orange-50/60 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-900 text-sm">کتاب مرجع اصلی وس مک‌کینی</span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-orange-200 text-orange-900">۹.۱۵ مگابایت</span>
                  </div>
                  <p className="text-xs text-slate-600 mb-2 leading-relaxed">
                    <strong>Python for Data Analysis (3rd Edition - 2022)</strong> تألیف وس مک‌کینی (خالق اصلی کتابخانه Pandas). 
                    پوشش کامل ساختارهای NumPy، کار با داده‌های سری زمانی، متدهای پاکسازی داده و تجسم آماری.
                  </p>
                </div>
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-orange-200/80">
                  <a href="/pdfs/02-Python for Data Analysis_2022.pdf" download className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold transition-all shadow-sm">
                    <Download className="w-3.5 h-3.5" />
                    <span>دانلود مستقیم کتاب PDF</span>
                  </a>
                  {onOpenPdf && (
                    <button
                      onClick={() => onOpenPdf(pdfsData.find(p => p.filename === '02-Python for Data Analysis_2022.pdf'))}
                      className="px-2.5 py-1.5 rounded-lg bg-white border border-orange-300 text-orange-900 text-xs font-bold hover:bg-orange-100"
                    >
                      مشاهده در مرورگر
                    </button>
                  )}
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-900 text-sm">فهرست مراجع تکمیلی درس</span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-200 text-slate-800">171 KB</span>
                  </div>
                  <p className="text-xs text-slate-600 mb-2 leading-relaxed">
                    <strong>01-PDA_ReferenceBooks.pdf:</strong> شامل لیست کتب تکمیلی دانشگاهی، دوره‌های پیشنهادی و منابع مطالعاتی کمکی برای آمادگی امتحانات و تسلط بیشتر بر فریم‌ورک‌های داده.
                  </p>
                </div>
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-200">
                  <a href="/pdfs/01-PDA_ReferenceBooks.pdf" download className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all shadow-sm">
                    <Download className="w-3.5 h-3.5" />
                    <span>دانلود فهرست مراجع</span>
                  </a>
                  {onOpenPdf && (
                    <button
                      onClick={() => onOpenPdf(pdfsData.find(p => p.filename === '01-PDA_ReferenceBooks.pdf'))}
                      className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100"
                    >
                      مشاهده در مرورگر
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== اسلاید ۲: مبانی پایتون (جزوه جلسه ۱ - فایل ۰۳) ===== */}
        <section className="slide border border-slate-300 rounded-xl mb-6 shadow-sm overflow-hidden" id="s2">
          <div className="slide-header bg-gradient-to-r from-slate-900 to-slate-800 text-white p-3.5 px-5 flex items-center gap-3.5 border-b-4 border-orange-600">
            <div className="slide-number bg-gradient-to-r from-orange-600 to-amber-500 text-white w-9 h-9 rounded-full flex items-center justify-center font-bold text-base shrink-0">۲</div>
            <h2 className="slide-title text-base sm:text-lg font-bold m-0">مبانی پایتون، متغیرها و سینتکس پایه (جزوه جلسه اول - فایل ۰۳)</h2>
          </div>
          <div className="slide-body p-5 leading-relaxed text-slate-700 space-y-4">
            <p>
              پایتون زبانی با نوع‌گذاری پویا (Dynamically Typed) و مفسری است. در جلسه اول درس، مفاهیم متغیرها، عملگرهای ریاضی و فرمت‌بندی خروجی‌ها تدریس شدند:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <strong className="text-amber-900 block mb-1">۱. ورودی و تبدیل نوع (Casting)</strong>
                تابع <code>input()</code> ورودی را رشته (str) دریافت می‌کند. برای محاسبات باید به <code>int()</code> یا <code>float()</code> تبدیل شود.
              </div>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <strong className="text-amber-900 block mb-1">۲. فرمت‌بندی با f-string</strong>
                سینتکس مدرن <code>{`f"x={x} y={y}"`}</code> بالاترین کارایی و خوانایی را جهت نمایش خروجی‌های ترکیبی فراهم می‌سازد.
              </div>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <strong className="text-amber-900 block mb-1">۳. ساختار شرطی if-elif-else</strong>
                پایتون بلوک‌های کد را با فاصله‌گذاری و تورفتگی (Indentation - ۴ فاصله) شناسایی می‌کند و فاقد کروشه باز و بسته است.
              </div>
            </div>

            <div className="table-wrap border border-slate-300 rounded-lg overflow-hidden my-2">
              <table className="req-table w-full text-xs border-collapse text-right">
                <thead>
                  <tr className="bg-slate-900 text-white">
                    <th className="p-2.5">عملگر</th>
                    <th className="p-2.5">نام و عملکرد</th>
                    <th className="p-2.5">مثال پایتون</th>
                    <th className="p-2.5">نتیجه خروجی</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr className="even:bg-slate-50"><td className="p-2 font-mono font-bold" dir="ltr">//</td><td>تقسیم صحیح (Floor Division)</td><td className="font-mono" dir="ltr">7 // 2</td><td className="font-mono text-emerald-700 font-bold" dir="ltr">3</td></tr>
                  <tr className="even:bg-slate-50"><td className="p-2 font-mono font-bold" dir="ltr">**</td><td>توان‌رسانی (Exponentiation)</td><td className="font-mono" dir="ltr">2 ** 3</td><td className="font-mono text-emerald-700 font-bold" dir="ltr">8</td></tr>
                  <tr className="even:bg-slate-50"><td className="p-2 font-mono font-bold" dir="ltr">%</td><td>باقیمانده تقسیم (Modulo)</td><td className="font-mono" dir="ltr">7 % 3</td><td className="font-mono text-emerald-700 font-bold" dir="ltr">1</td></tr>
                  <tr className="even:bg-slate-50"><td className="p-2 font-mono font-bold" dir="ltr">in</td><td>بررسی عضویت در توالی</td><td className="font-mono" dir="ltr">'a' in 'pda'</td><td className="font-mono text-emerald-700 font-bold" dir="ltr">True</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ===== اسلاید ۳: کدهای سری اول (فایل ۰۵ - کدهای ۱-۱ تا ۱-۹) ===== */}
        <section className="slide border border-slate-300 rounded-xl mb-6 shadow-sm overflow-hidden" id="s3">
          <div className="slide-header bg-gradient-to-r from-slate-900 to-slate-800 text-white p-3.5 px-5 flex items-center gap-3.5 border-b-4 border-orange-600">
            <div className="slide-number bg-gradient-to-r from-orange-600 to-amber-500 text-white w-9 h-9 rounded-full flex items-center justify-center font-bold text-base shrink-0">۳</div>
            <h2 className="slide-title text-base sm:text-lg font-bold m-0">مجموعه کدهای سری ۱: ورودی، خروجی و شرط‌ها (پوشه ۰۵ - ۹ برنامه کامل)</h2>
          </div>
          <div className="slide-body p-5 space-y-4 leading-relaxed text-slate-700">
            <p>تمامی ۹ اسکریپت پوشه ۰۵ همراه با توضیح، خروجی و امکان اجرای زنده در کنسول تعاملی:</p>
            
            <div className="space-y-3">
              {pythonExamples.filter(s => s.chapterFolder === '05-Examples_Python_1').map(s => (
                <div key={s.id} className="border border-slate-300 rounded-xl p-3.5 bg-slate-50">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <span className="font-mono text-xs font-bold text-slate-900 px-2.5 py-1 rounded bg-slate-200 border border-slate-300" dir="ltr">{s.filename}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleRunInIde(s.code, s.filename, s.expectedOutput)}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>⚡ اجرای زنده در کنسول</span>
                      </button>
                      <button
                        onClick={() => handleCopy(s.code, s.id)}
                        className="p-1.5 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs"
                        title="کپی کد"
                      >
                        {copiedId === s.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 mb-2 font-medium">{s.description}</p>
                  <pre className="bg-slate-900 text-emerald-300 p-3 rounded-lg text-xs font-mono overflow-x-auto leading-5" dir="ltr">{s.code}</pre>
                  {s.expectedOutput && (
                    <div className="mt-2 text-[11px] font-mono text-slate-600 bg-slate-200/70 p-2 rounded border border-slate-300" dir="ltr">
                      <span className="text-slate-500 font-sans font-bold">نمونه خروجی استاندارد: </span>{s.expectedOutput}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== اسلاید ۴: ساختارهای توالی (جزوه توالی‌ها - فایل ۰۴) ===== */}
        <section className="slide border border-slate-300 rounded-xl mb-6 shadow-sm overflow-hidden" id="s4">
          <div className="slide-header bg-gradient-to-r from-slate-900 to-slate-800 text-white p-3.5 px-5 flex items-center gap-3.5 border-b-4 border-orange-600">
            <div className="slide-number bg-gradient-to-r from-orange-600 to-amber-500 text-white w-9 h-9 rounded-full flex items-center justify-center font-bold text-base shrink-0">۴</div>
            <h2 className="slide-title text-base sm:text-lg font-bold m-0">ساختارهای داده و توالی در پایتون (Sequences - جزوه فایل ۰۴)</h2>
          </div>
          <div className="slide-body p-5 leading-relaxed text-slate-700 space-y-3">
            <p>
              در جزوه شماره ۴، چهار ساختار اصلی داده پایتون با بررسی تفاوت‌های حافظه، سرعت و تغییرپذیری تحلیل شده‌اند:
            </p>
            <div className="table-wrap border border-slate-300 rounded-lg overflow-hidden my-3">
              <table className="req-table w-full text-xs sm:text-sm border-collapse text-right">
                <thead>
                  <tr className="bg-slate-900 text-white">
                    <th className="p-2.5">ساختار</th>
                    <th className="p-2.5">سینتکس</th>
                    <th className="p-2.5">تغییرپذیری (Mutability)</th>
                    <th className="p-2.5">متدهای پرکاربرد</th>
                    <th className="p-2.5">کاربرد در علم داده</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr className="even:bg-slate-50"><td className="p-2.5 font-bold">List (لیست)</td><td className="p-2.5 font-mono" dir="ltr">[1, 2, 3]</td><td><span className="tag tag-fr">Mutable</span></td><td className="font-mono text-xs" dir="ltr">append, pop, sort, extend</td><td>نگهداری ردیف‌های ورودی</td></tr>
                  <tr className="even:bg-slate-50"><td className="p-2.5 font-bold">Tuple (تاپل)</td><td className="p-2.5 font-mono" dir="ltr">(1, 2, 3)</td><td><span className="tag tag-nfr">Immutable</span></td><td className="font-mono text-xs" dir="ltr">count, index</td><td>کلید دیکشنری، ابعاد shape</td></tr>
                  <tr className="even:bg-slate-50"><td className="p-2.5 font-bold">Dictionary (دیکشنری)</td><td className="p-2.5 font-mono" dir="ltr">{`{'a': 1}`}</td><td><span className="tag tag-fr">Mutable</span></td><td className="font-mono text-xs" dir="ltr">keys, values, items, get</td><td>ساخت ستون‌های DataFrame</td></tr>
                  <tr className="even:bg-slate-50"><td className="p-2.5 font-bold">Set (مجموعه)</td><td className="p-2.5 font-mono" dir="ltr">{`{1, 2, 3}`}</td><td><span className="tag tag-fr">Mutable</span></td><td className="font-mono text-xs" dir="ltr">add, union, intersection</td><td>حذف مقادیر تکراری</td></tr>
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-slate-100 rounded-lg border border-slate-300 text-xs leading-relaxed">
              <strong>فرمول جادویی Slicing در پایتون:</strong> <code>sequence[start : stop : step]</code><br/>
              نکته: در صورتی که <code>step</code> برابر ۱- باشد، توالی معکوس می‌شود (<code>s[::-1]</code>).
            </div>
          </div>
        </section>

        {/* ===== اسلاید ۵: کدهای سری دوم (فایل ۰۶ - کدهای ۲-۱ تا ۲-۱۱) ===== */}
        <section className="slide border border-slate-300 rounded-xl mb-6 shadow-sm overflow-hidden" id="s5">
          <div className="slide-header bg-gradient-to-r from-slate-900 to-slate-800 text-white p-3.5 px-5 flex items-center gap-3.5 border-b-4 border-orange-600">
            <div className="slide-number bg-gradient-to-r from-orange-600 to-amber-500 text-white w-9 h-9 rounded-full flex items-center justify-center font-bold text-base shrink-0">۵</div>
            <h2 className="slide-title text-base sm:text-lg font-bold m-0">مجموعه کدهای سری ۲: لیست‌ها، حلقه‌ها و ساختارهای داده (پوشه ۰۶ - ۱۱ برنامه)</h2>
          </div>
          <div className="slide-body p-5 space-y-4 leading-relaxed text-slate-700">
            <p>تمام ۱۱ اسکریپت پوشه ۰۶ شامل پیمایش لیست‌ها، حلقه‌های while، مجموع ارقام و رفتار ارجاع در حافظه:</p>
            <div className="space-y-3">
              {pythonExamples.filter(s => s.chapterFolder === '06-Examples_Python_2').map(s => (
                <div key={s.id} className="border border-slate-300 rounded-xl p-3.5 bg-slate-50">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <span className="font-mono text-xs font-bold text-slate-900 px-2.5 py-1 rounded bg-slate-200 border border-slate-300" dir="ltr">{s.filename}</span>
                    <button
                      onClick={() => handleRunInIde(s.code, s.filename, s.expectedOutput)}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>⚡ اجرای زنده در کنسول</span>
                    </button>
                  </div>
                  <p className="text-xs text-slate-600 mb-2 font-medium">{s.description}</p>
                  <pre className="bg-slate-900 text-emerald-300 p-3 rounded-lg text-xs font-mono overflow-x-auto leading-5" dir="ltr">{s.code}</pre>
                  {s.expectedOutput && (
                    <div className="mt-2 text-[11px] font-mono text-slate-600 bg-slate-200/70 p-2 rounded border border-slate-300" dir="ltr">
                      <span className="text-slate-500 font-sans font-bold">نمونه خروجی: </span>{s.expectedOutput}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== اسلاید ۶: توابع و پارامترها (جزوه توابع - فایل ۰۷) ===== */}
        <section className="slide border border-slate-300 rounded-xl mb-6 shadow-sm overflow-hidden" id="s6">
          <div className="slide-header bg-gradient-to-r from-slate-900 to-slate-800 text-white p-3.5 px-5 flex items-center gap-3.5 border-b-4 border-orange-600">
            <div className="slide-number bg-gradient-to-r from-orange-600 to-amber-500 text-white w-9 h-9 rounded-full flex items-center justify-center font-bold text-base shrink-0">۶</div>
            <h2 className="slide-title text-base sm:text-lg font-bold m-0">توابع، پارامترها و آرگومان‌ها (جزوه تخصصی فایل ۰۷)</h2>
          </div>
          <div className="slide-body p-5 leading-relaxed text-slate-700 space-y-3">
            <p>در جزوه شماره ۷، ساختار توابع و تکنیک‌های ارسال آرگومان تشریح شده است:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                <strong className="text-slate-900 block">Default Parameters</strong>
                پارامترهایی که در صورت عدم ارسال مقدار، یک مقدار پیش‌فرض به خود می‌گیرند. این پارامترها همواره باید در سمت راست تعریف شوند.
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                <strong className="text-slate-900 block">آرگومان‌های نامحدود (*args)</strong>
                امکان دریافت هر تعداد آرگومان موقعیتی به فرم یک تاپل <code>tuple</code> درون تابع.
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                <strong className="text-slate-900 block">آرگومان‌های نام‌دار (**kwargs)</strong>
                امکان دریافت هر تعداد آرگومان کلیدواژه‌ای به فرم یک دیکشنری <code>dict</code> درون تابع.
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                <strong className="text-slate-900 block">حوزه دید متغیرها (Scope)</strong>
                متغیرهای محلی (Local) درون تابع فقط در همان بلاک معتبرند؛ مگر اینکه با کلیدواژه <code>global</code> سراسری شوند.
              </div>
            </div>
          </div>
        </section>

        {/* ===== اسلاید ۷: کدهای سری ۳ و ۴ (فایل‌های ۰۸ و ۰۹ - ۱۳ برنامه) ===== */}
        <section className="slide border border-slate-300 rounded-xl mb-6 shadow-sm overflow-hidden" id="s7">
          <div className="slide-header bg-gradient-to-r from-slate-900 to-slate-800 text-white p-3.5 px-5 flex items-center gap-3.5 border-b-4 border-orange-600">
            <div className="slide-number bg-gradient-to-r from-orange-600 to-amber-500 text-white w-9 h-9 rounded-full flex items-center justify-center font-bold text-base shrink-0">۷</div>
            <h2 className="slide-title text-base sm:text-lg font-bold m-0">کدهای سری ۳ و ۴: توابع، Lambda، بازگشت و ماژول m1 (۱۳ برنامه کامل)</h2>
          </div>
          <div className="slide-body p-5 space-y-4 leading-relaxed text-slate-700">
            <p>شامل برنامه‌های ۳-۱ تا ۳-۷ (توابع و لامبدا) و ۴-۱ تا ۴-۵ و ماژول هندسی m1.py:</p>
            <div className="space-y-3">
              {pythonExamples.filter(s => s.chapterFolder === '08-Examples_Python_3' || s.chapterFolder === '09-Examples_Python_4').map(s => (
                <div key={s.id} className="border border-slate-300 rounded-xl p-3.5 bg-slate-50">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <span className="font-mono text-xs font-bold text-slate-900 px-2.5 py-1 rounded bg-slate-200 border border-slate-300" dir="ltr">{s.filename}</span>
                    <button
                      onClick={() => handleRunInIde(s.code, s.filename, s.expectedOutput)}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>⚡ اجرای زنده در کنسول</span>
                    </button>
                  </div>
                  <p className="text-xs text-slate-600 mb-2 font-medium">{s.description}</p>
                  <pre className="bg-slate-900 text-emerald-300 p-3 rounded-lg text-xs font-mono overflow-x-auto leading-5" dir="ltr">{s.code}</pre>
                  {s.expectedOutput && (
                    <div className="mt-2 text-[11px] font-mono text-slate-600 bg-slate-200/70 p-2 rounded border border-slate-300" dir="ltr">
                      <span className="text-slate-500 font-sans font-bold">نمونه خروجی: </span>{s.expectedOutput}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== اسلاید ۸: محاسبات ماتریسی با NumPy (فایل‌های ۱۰ تا ۱۳) ===== */}
        <section className="slide border border-slate-300 rounded-xl mb-6 shadow-sm overflow-hidden" id="s8">
          <div className="slide-header bg-gradient-to-r from-slate-900 to-slate-800 text-white p-3.5 px-5 flex items-center gap-3.5 border-b-4 border-orange-600">
            <div className="slide-number bg-gradient-to-r from-orange-600 to-amber-500 text-white w-9 h-9 rounded-full flex items-center justify-center font-bold text-base shrink-0">۸</div>
            <h2 className="slide-title text-base sm:text-lg font-bold m-0">محاسبات ماتریسی و علمی با NumPy (فایل‌های ۱۰، ۱۱، ۱۲ و ۱۳)</h2>
          </div>
          <div className="slide-body p-5 leading-relaxed text-slate-700 space-y-4">
            <p>
              کتابخانه NumPy ستون فقرات محاسبات عددی در پایتون است. در جزوه شماره ۱۰ و نوت‌بوک‌های ۱۱ و ۱۳ مفاهیم زیر تدریس شده است:
            </p>
            
            <div className="table-wrap border border-slate-300 rounded-lg overflow-hidden my-3">
              <table className="req-table w-full text-xs sm:text-sm border-collapse text-right">
                <thead>
                  <tr className="bg-slate-900 text-white">
                    <th className="p-2.5">مبحث و متد</th>
                    <th className="p-2.5">نمونه کد NumPy</th>
                    <th className="p-2.5">توضیح عملکرد</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr className="even:bg-slate-50"><td className="p-2.5 font-bold">ساخت آرایه ndarray</td><td className="p-2.5 font-mono" dir="ltr">np.array([1, 2, 3])</td><td>آرایه همگن با مصرف حافظه بهینه</td></tr>
                  <tr className="even:bg-slate-50"><td className="p-2.5 font-bold">دنباله عددی با گام</td><td className="p-2.5 font-mono" dir="ltr">np.arange(0, 10, 2)</td><td>تولید آرایه [0, 2, 4, 6, 8]</td></tr>
                  <tr className="even:bg-slate-50"><td className="p-2.5 font-bold">نقاط مساوی linspace</td><td className="p-2.5 font-mono" dir="ltr">np.linspace(0, 1, 5)</td><td>تولید ۵ نقطه با فواصل مساوی</td></tr>
                  <tr className="even:bg-slate-50"><td className="p-2.5 font-bold">تغییر ابعاد reshape</td><td className="p-2.5 font-mono" dir="ltr">arr.reshape(3, 4)</td><td>تبدیل ۱۲ عنصر به ماتریس ۳x۴</td></tr>
                  <tr className="even:bg-slate-50"><td className="p-2.5 font-bold">محاسبه در راستای محورها</td><td className="p-2.5 font-mono" dir="ltr">arr.sum(axis=0)</td><td>جمع عمودی مقادیر هر ستون</td></tr>
                  <tr className="even:bg-slate-50"><td className="p-2.5 font-bold">پخش ماتریسی Broadcasting</td><td className="p-2.5 font-mono" dir="ltr">mat + 10</td><td>جمع اسکالر با کل ماتریس بدون کپی داده</td></tr>
                </tbody>
              </table>
            </div>

            {/* Live Runnable NumPy Cells */}
            <div className="p-4 bg-sky-50/70 border border-sky-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sky-950 text-xs">کد نمونه قابل اجرا از نوت‌بوک 11-numpy_1.ipynb:</span>
                <button
                  onClick={() => handleRunInIde(
                    `import numpy as np\narr = np.arange(1, 10).reshape(3, 3)\nprint("Original Matrix:\\n", arr)\nprint("Column Sums (axis=0):", arr.sum(axis=0))\nprint("Row Sums (axis=1):", arr.sum(axis=1))`,
                    '11-numpy_1.ipynb'
                  )}
                  className="px-2.5 py-1 rounded bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold"
                >
                  ⚡ تست این کد در IDE
                </button>
              </div>
              <pre className="bg-slate-900 text-sky-300 p-2.5 rounded-lg text-xs font-mono" dir="ltr">
{`import numpy as np
arr = np.arange(1, 10).reshape(3, 3)
print("Column Sums (axis=0):", arr.sum(axis=0))
print("Row Sums (axis=1):", arr.sum(axis=1))`}
              </pre>
            </div>

            <div className="p-3 bg-slate-100 rounded-lg border border-slate-300 flex items-center justify-between text-xs">
              <span>نوت‌بوک‌های تمرینی تدریس‌شده: <strong>11-numpy_1.ipynb (۳۲ سلول)</strong> و <strong>13-numpy_2.ipynb (۶۲ سلول)</strong></span>
              <a href="/notebooks/11-numpy_1.ipynb" download className="text-orange-600 font-bold hover:underline">دانلود نوت‌بوک ۱۱</a>
            </div>
          </div>
        </section>

        {/* ===== اسلاید ۹: کاوش داده با Pandas (فایل‌های ۱۴، ۱۵ و ۱۷) ===== */}
        <section className="slide border border-slate-300 rounded-xl mb-6 shadow-sm overflow-hidden" id="s9">
          <div className="slide-header bg-gradient-to-r from-slate-900 to-slate-800 text-white p-3.5 px-5 flex items-center gap-3.5 border-b-4 border-orange-600">
            <div className="slide-number bg-gradient-to-r from-orange-600 to-amber-500 text-white w-9 h-9 rounded-full flex items-center justify-center font-bold text-base shrink-0">۹</div>
            <h2 className="slide-title text-base sm:text-lg font-bold m-0">کاوش و مهندسی داده با Pandas (فایل‌های ۱۴، ۱۵ و ۱۷)</h2>
          </div>
          <div className="slide-body p-5 leading-relaxed text-slate-700 space-y-4">
            <p>
              کتابخانه Pandas ساختارهای داده Series (یک‌بعدی برچسب‌دار) و DataFrame (جدول دوبعدی) را ارائه می‌دهد.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl border border-orange-200 bg-orange-50">
                <strong className="text-orange-950 block font-bold mb-1">متد loc (Label-based)</strong>
                بر اساس نام ستون‌ها و برچسب سطرها عمل می‌کند (<code>df.loc[0:5, 'Age']</code>).<br/>
                <span className="text-orange-800 font-bold mt-1 inline-block">نکته کلیدی: انتهای بازه در loc حتماً شامل می‌شود (Inclusive).</span>
              </div>
              <div className="p-3.5 rounded-xl border border-sky-200 bg-sky-50">
                <strong className="text-sky-950 block font-bold mb-1">متد iloc (Position-based)</strong>
                بر اساس اندیس‌های عددی ۰ تا n کار می‌کند (<code>df.iloc[0:5, 3]</code>).<br/>
                <span className="text-sky-800 font-bold mt-1 inline-block">نکته کلیدی: مانند برش‌های پایتون انتهای بازه حذف می‌شود (Exclusive).</span>
              </div>
            </div>

            {/* Pandas runnable code */}
            <div className="p-4 bg-orange-50/70 border border-orange-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-orange-950 text-xs">کد نمونه از نوت‌بوک 15-pandas_1.ipynb:</span>
                <button
                  onClick={() => handleRunInIde(
                    `import pandas as pd\ndata = {'Name': ['Ali', 'Sara', 'Reza'], 'Age': [25, 30, 22], 'Salary': [5000, 7200, 4800]}\ndf = pd.DataFrame(data)\nprint("DataFrame:\\n", df)\nprint("\\nMean Salary:", df['Salary'].mean())`,
                    '15-pandas_1.ipynb'
                  )}
                  className="px-2.5 py-1 rounded bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold"
                >
                  ⚡ تست این کد در IDE
                </button>
              </div>
              <pre className="bg-slate-900 text-amber-300 p-2.5 rounded-lg text-xs font-mono" dir="ltr">
{`import pandas as pd
data = {'Name': ['Ali', 'Sara', 'Reza'], 'Age': [25, 30, 22], 'Salary': [5000, 7200, 4800]}
df = pd.DataFrame(data)
print("Mean Salary:", df['Salary'].mean())`}
              </pre>
            </div>
          </div>
        </section>

        {/* ===== اسلاید ۱۰: پروژه ۱ - دیتاست کارکنان (فایل ۱۶ و ۱۹) با جدول داده زنده ===== */}
        <section className="slide border border-slate-300 rounded-xl mb-6 shadow-sm overflow-hidden" id="s10">
          <div className="slide-header bg-gradient-to-r from-slate-900 to-slate-800 text-white p-3.5 px-5 flex items-center gap-3.5 border-b-4 border-orange-600">
            <div className="slide-number bg-gradient-to-r from-orange-600 to-amber-500 text-white w-9 h-9 rounded-full flex items-center justify-center font-bold text-base shrink-0">۱۰</div>
            <h2 className="slide-title text-base sm:text-lg font-bold m-0">پروژه ۱: پاکسازی و تحلیل دیتاست کارکنان (فایل‌های ۱۶، ۱۸ و ۱۹)</h2>
          </div>
          <div className="slide-body p-5 space-y-4 leading-relaxed text-slate-700">
            <p>
              دیتاست <code>Employees.csv</code> شامل ۱۰ سطر اطلاعات پرسنلی با مقادیر گمشده تعمدی (<code>?</code> و <code>-</code>) جهت تمرین تکنیک‌های پاکسازی داده در پانداس است:
            </p>

            {/* LIVE INTERACTIVE TABLE OF EMPLOYEES */}
            <div className="border border-slate-300 rounded-xl p-3 bg-white space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-orange-600" />
                  <span className="font-bold text-xs text-slate-900">جدول داده واقعی Employees.csv (۱۰ رکورد):</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <input
                    type="text"
                    value={empSearch}
                    onChange={(e) => setEmpSearch(e.target.value)}
                    placeholder="جستجو در نام، مدرک، شهر..."
                    className="border border-slate-300 rounded px-2 py-0.5 text-xs bg-slate-50 focus:outline-none"
                  />
                  <select
                    value={empDegreeFilter}
                    onChange={(e) => setEmpDegreeFilter(e.target.value)}
                    className="border border-slate-300 rounded px-2 py-0.5 text-xs bg-slate-50 focus:outline-none"
                  >
                    <option value="all">همه مدارک</option>
                    <option value="bachelor">کارشناسی (bachelor)</option>
                    <option value="master">کارشناسی ارشد (master)</option>
                    <option value="phd">دکتری (phd)</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-right border-collapse">
                  <thead>
                    <tr className="bg-slate-800 text-white">
                      <th className="p-2 border">ID</th>
                      <th className="p-2 border">نام</th>
                      <th className="p-2 border">خانوادگی</th>
                      <th className="p-2 border">جنسیت</th>
                      <th className="p-2 border">سن</th>
                      <th className="p-2 border">شهر</th>
                      <th className="p-2 border">مدرک</th>
                      <th className="p-2 border">حقوق</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredEmployeesRows.map((row, idx) => (
                      <tr key={idx} className="even:bg-slate-50 hover:bg-amber-50">
                        <td className="p-2 border font-mono font-bold" dir="ltr">{row.ID}</td>
                        <td className="p-2 border">{row.Name}</td>
                        <td className="p-2 border">{row.Family}</td>
                        <td className="p-2 border">{row.Gender}</td>
                        <td className="p-2 border font-mono">
                          {row.Age === '?' || row.Age === '-' ? (
                            <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 font-bold" title="مقدار گمشده">NaN ({row.Age})</span>
                          ) : row.Age}
                        </td>
                        <td className="p-2 border">{row.City}</td>
                        <td className="p-2 border font-mono">{row.Degree}</td>
                        <td className="p-2 border font-mono text-emerald-700 font-bold" dir="ltr">
                          {row.Salary === '?' || row.Salary === '-' ? (
                            <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-800">NaN</span>
                          ) : `$${row.Salary}`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Solved exercises on Employees */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-orange-50 border border-orange-200">
                <div className="flex items-center justify-between mb-1">
                  <strong className="text-orange-900 block">۱. تبدیل مقادیر نامعتبر به NaN:</strong>
                  <button
                    onClick={() => handleRunInIde(`import pandas as pd\ndf = pd.read_csv('Employees.csv', na_values=['?', '-'])\nprint(df.isna().sum())`, 'Employees Task 1')}
                    className="text-[10px] bg-orange-600 text-white px-2 py-0.5 rounded font-bold"
                  >
                    اجرا
                  </button>
                </div>
                <pre className="font-mono bg-white p-2 rounded border border-orange-200 text-[11px]" dir="ltr">{`df = pd.read_csv('Employees.csv', na_values=['?', '-'])`}</pre>
              </div>

              <div className="p-3 rounded-lg bg-orange-50 border border-orange-200">
                <div className="flex items-center justify-between mb-1">
                  <strong className="text-orange-900 block">۲. پر کردن سن با میانگین کل:</strong>
                  <button
                    onClick={() => handleRunInIde(`import pandas as pd\ndf = pd.read_csv('Employees.csv', na_values=['?', '-'])\ndf['Age'].fillna(df['Age'].mean(), inplace=True)\nprint("Cleaned Ages:\\n", df[['Name', 'Age']])`, 'Employees Task 2')}
                    className="text-[10px] bg-orange-600 text-white px-2 py-0.5 rounded font-bold"
                  >
                    اجرا
                  </button>
                </div>
                <pre className="font-mono bg-white p-2 rounded border border-orange-200 text-[11px]" dir="ltr">{`df['Age'].fillna(df['Age'].mean(), inplace=True)`}</pre>
              </div>

              <div className="p-3 rounded-lg bg-orange-50 border border-orange-200">
                <div className="flex items-center justify-between mb-1">
                  <strong className="text-orange-900 block">۳. میانگین حقوق بر اساس مدرک:</strong>
                  <button
                    onClick={() => handleRunInIde(`import pandas as pd\ndf = pd.read_csv('Employees.csv', na_values=['?', '-'])\nprint(df.groupby('Degree')['Salary'].mean())`, 'Employees Task 3')}
                    className="text-[10px] bg-orange-600 text-white px-2 py-0.5 rounded font-bold"
                  >
                    اجرا
                  </button>
                </div>
                <pre className="font-mono bg-white p-2 rounded border border-orange-200 text-[11px]" dir="ltr">{`df.groupby('Degree')['Salary'].mean()`}</pre>
              </div>

              <div className="p-3 rounded-lg bg-orange-50 border border-orange-200">
                <div className="flex items-center justify-between mb-1">
                  <strong className="text-orange-900 block">۴. آمار چندگانه سن پرسنل:</strong>
                  <button
                    onClick={() => handleRunInIde(`import pandas as pd\ndf = pd.read_csv('Employees.csv', na_values=['?', '-'])\nprint(df.groupby('Gender')['Age'].agg(['min', 'max', 'mean']))`, 'Employees Task 4')}
                    className="text-[10px] bg-orange-600 text-white px-2 py-0.5 rounded font-bold"
                  >
                    اجرا
                  </button>
                </div>
                <pre className="font-mono bg-white p-2 rounded border border-orange-200 text-[11px]" dir="ltr">{`df.groupby('Gender')['Age'].agg(['min', 'max', 'mean'])`}</pre>
              </div>
            </div>
          </div>
        </section>

        {/* ===== اسلاید ۱۱: پروژه ۲ - تحلیل فاجعه تایتانیک (فایل ۱۸، ۲۰ و ۲۱) با نمودار و کاوشگر زنده ===== */}
        <section className="slide border border-slate-300 rounded-xl mb-6 shadow-sm overflow-hidden" id="s11">
          <div className="slide-header bg-gradient-to-r from-slate-900 to-slate-800 text-white p-3.5 px-5 flex items-center gap-3.5 border-b-4 border-orange-600">
            <div className="slide-number bg-gradient-to-r from-orange-600 to-amber-500 text-white w-9 h-9 rounded-full flex items-center justify-center font-bold text-base shrink-0">۱۱</div>
            <h2 className="slide-title text-base sm:text-lg font-bold m-0">پروژه ۲: تحلیل پیشرفته فاجعه تایتانیک (فایل‌های ۱۸، ۲۰ و ۲۱)</h2>
          </div>
          <div className="slide-body p-5 space-y-4 leading-relaxed text-slate-700">
            <p>
              دیتاست <code>titanic.csv</code> با ۸۹۱ رکورد مسافران واقعی کشتی تایتانیک جهت تحلیل شانس بقا مورد استفاده قرار گرفته است:
            </p>

            {/* Visual Survival Rate Indicator Bars */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                <span className="text-xs text-slate-500 block mb-1">نرخ بقای کلی مسافران</span>
                <span className="text-xl font-extrabold text-blue-600">۳۸.۳۸٪</span>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-2">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: '38.38%' }} />
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                <span className="text-xs text-slate-500 block mb-1">بقای بانوان (Female)</span>
                <span className="text-xl font-extrabold text-emerald-600">۷۴.۲۰٪</span>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-2">
                  <div className="bg-emerald-600 h-full rounded-full" style={{ width: '74.2%' }} />
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                <span className="text-xs text-slate-500 block mb-1">بقای آقایان (Male)</span>
                <span className="text-xl font-extrabold text-rose-600">۱۸.۸۹٪</span>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-2">
                  <div className="bg-rose-600 h-full rounded-full" style={{ width: '18.89%' }} />
                </div>
              </div>
            </div>

            {/* Interactive Titanic Explorer */}
            <div className="border border-slate-300 rounded-xl p-3 bg-white space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-blue-600" />
                  <span className="font-bold text-slate-900">کاوشگر مسافران تایتانیک ({filteredTitanicRows.length} مورد یافت شد):</span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="text"
                    value={titanicSearch}
                    onChange={(e) => setTitanicSearch(e.target.value)}
                    placeholder="جستجوی نام مسافر..."
                    className="border border-slate-300 rounded px-2 py-0.5 bg-slate-50 text-xs focus:outline-none"
                  />
                  <select
                    value={titanicSexFilter}
                    onChange={(e) => setTitanicSexFilter(e.target.value)}
                    className="border border-slate-300 rounded px-2 py-0.5 bg-slate-50 focus:outline-none"
                  >
                    <option value="all">جنسیت: همه</option>
                    <option value="female">بانوان (female)</option>
                    <option value="male">آقایان (male)</option>
                  </select>
                  <select
                    value={titanicClassFilter}
                    onChange={(e) => setTitanicClassFilter(e.target.value)}
                    className="border border-slate-300 rounded px-2 py-0.5 bg-slate-50 focus:outline-none"
                  >
                    <option value="all">کلاس: همه</option>
                    <option value="1">کلاس ۱ (لوکس)</option>
                    <option value="2">کلاس ۲ (متوسط)</option>
                    <option value="3">کلاس ۳ (عادی)</option>
                  </select>
                  <select
                    value={titanicSurvFilter}
                    onChange={(e) => setTitanicSurvFilter(e.target.value)}
                    className="border border-slate-300 rounded px-2 py-0.5 bg-slate-50 focus:outline-none"
                  >
                    <option value="all">وضعیت: همه</option>
                    <option value="1">نجات‌یافته (1)</option>
                    <option value="0">فوت‌شده (0)</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-right border-collapse">
                  <thead>
                    <tr className="bg-slate-800 text-white">
                      <th className="p-2 border">کد</th>
                      <th className="p-2 border">نام مسافر</th>
                      <th className="p-2 border">کلاس</th>
                      <th className="p-2 border">جنسیت</th>
                      <th className="p-2 border">سن</th>
                      <th className="p-2 border">کرایه</th>
                      <th className="p-2 border">وضعیت بقا</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {displayedTitanicRows.map((r, i) => (
                      <tr key={i} className="even:bg-slate-50 hover:bg-sky-50">
                        <td className="p-2 border font-mono" dir="ltr">{r.PassengerId}</td>
                        <td className="p-2 border font-mono text-[11px]" dir="ltr">{r.Name}</td>
                        <td className="p-2 border font-bold">کلاس {r.Pclass}</td>
                        <td className="p-2 border">{r.Sex === 'female' ? 'زن' : 'مرد'}</td>
                        <td className="p-2 border font-mono">{r.Age || 'نامشخص'}</td>
                        <td className="p-2 border font-mono text-emerald-700" dir="ltr">${Number(r.Fare).toFixed(2)}</td>
                        <td className="p-2 border">
                          {String(r.Survived) === '1' ? (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">نجات‌یافته</span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold text-[10px]">فوت‌شده</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalTitanicPages > 1 && (
                <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
                  <span>صفحه {titanicPage} از {totalTitanicPages}</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setTitanicPage(Math.max(1, titanicPage - 1))}
                      disabled={titanicPage === 1}
                      className="px-2 py-0.5 rounded bg-slate-200 disabled:opacity-40"
                    >
                      قبلی
                    </button>
                    <button
                      onClick={() => setTitanicPage(Math.min(totalTitanicPages, titanicPage + 1))}
                      disabled={titanicPage === totalTitanicPages}
                      className="px-2 py-0.5 rounded bg-slate-200 disabled:opacity-40"
                    >
                      بعدی
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Solved Titanic tasks */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                <div className="flex items-center justify-between mb-1">
                  <strong className="text-blue-900 block">۱. نرخ بقای کلی مسافران:</strong>
                  <button
                    onClick={() => handleRunInIde(`import pandas as pd\ndf = pd.read_csv('titanic.csv')\nprint(df['Survived'].value_counts(normalize=True) * 100)`, 'Titanic Task 1')}
                    className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded font-bold"
                  >
                    اجرا
                  </button>
                </div>
                <pre className="font-mono bg-white p-2 rounded border border-blue-200 text-[11px]" dir="ltr">{`df['Survived'].value_counts(normalize=True) * 100`}</pre>
                <span className="text-[11px] text-slate-600 mt-1 block">نتیجه: ۳۸.۳۸٪ نجات‌یافته در برابر ۶۱.۶۲٪ فوت‌شده</span>
              </div>

              <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                <div className="flex items-center justify-between mb-1">
                  <strong className="text-blue-900 block">۲. مقایسه نرخ بقای بانوان در برابر آقایان:</strong>
                  <button
                    onClick={() => handleRunInIde(`import pandas as pd\ndf = pd.read_csv('titanic.csv')\nprint(df.groupby('Sex')['Survived'].mean() * 100)`, 'Titanic Task 2')}
                    className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded font-bold"
                  >
                    اجرا
                  </button>
                </div>
                <pre className="font-mono bg-white p-2 rounded border border-blue-200 text-[11px]" dir="ltr">{`df.groupby('Sex')['Survived'].mean() * 100`}</pre>
                <span className="text-[11px] text-slate-600 mt-1 block">نتیجه: بانوان ۷۴.۲٪ | آقایان ۱۸.۹٪</span>
              </div>

              <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                <div className="flex items-center justify-between mb-1">
                  <strong className="text-blue-900 block">۳. نرخ بقا به تفکیک کلاس بلیت و جنسیت:</strong>
                  <button
                    onClick={() => handleRunInIde(`import pandas as pd\ndf = pd.read_csv('titanic.csv')\nprint(df.groupby(['Pclass', 'Sex'])['Survived'].mean() * 100)`, 'Titanic Task 3')}
                    className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded font-bold"
                  >
                    اجرا
                  </button>
                </div>
                <pre className="font-mono bg-white p-2 rounded border border-blue-200 text-[11px]" dir="ltr">{`df.groupby(['Pclass', 'Sex'])['Survived'].mean() * 100`}</pre>
                <span className="text-[11px] text-slate-600 mt-1 block">نتیجه: زنان کلاس ۱ با ۹۶.۸٪ بالاترین بقا را داشتند</span>
              </div>

              <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                <div className="flex items-center justify-between mb-1">
                  <strong className="text-blue-900 block">۴. میانگین کرایه پرداختی مسافران:</strong>
                  <button
                    onClick={() => handleRunInIde(`import pandas as pd\ndf = pd.read_csv('titanic.csv')\nprint(df.groupby('Pclass')['Fare'].mean())`, 'Titanic Task 4')}
                    className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded font-bold"
                  >
                    اجرا
                  </button>
                </div>
                <pre className="font-mono bg-white p-2 rounded border border-blue-200 text-[11px]" dir="ltr">{`df.groupby('Pclass')['Fare'].mean()`}</pre>
                <span className="text-[11px] text-slate-600 mt-1 block">کلاس ۱: ۸۴.۱ دلار | کلاس ۲: ۲۰.۶ | کلاس ۳: ۱۳.۶</span>
              </div>
            </div>
          </div>
        </section>

        {/* ===== اسلاید ۱۲: جدول نیازمندی‌ها و فرمول‌ها (عین جدول FR تمپلیت) ===== */}
        <section className="slide border border-slate-300 rounded-xl mb-6 shadow-sm overflow-hidden" id="s12">
          <div className="slide-header bg-gradient-to-r from-slate-900 to-slate-800 text-white p-3.5 px-5 flex items-center gap-3.5 border-b-4 border-orange-600">
            <div className="slide-number bg-gradient-to-r from-orange-600 to-amber-500 text-white w-9 h-9 rounded-full flex items-center justify-center font-bold text-base shrink-0">۱۲</div>
            <h2 className="slide-title text-base sm:text-lg font-bold m-0">جدول جامع متدها و توابع پرکاربرد پانداس و نام‌پای</h2>
          </div>
          <div className="slide-body p-5">
            <div className="table-wrap border border-slate-300 rounded-lg overflow-hidden">
              <div className="table-scroll overflow-x-auto">
                <table className="req-table w-full text-xs sm:text-sm border-collapse text-right">
                  <thead>
                    <tr className="bg-slate-900 text-white">
                      <th className="p-2.5 w-20">کد</th>
                      <th className="p-2.5">شرح دستور و کارکرد در پایتون</th>
                      <th className="p-2.5 w-24">دسته‌بندی</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr className="even:bg-slate-50"><td className="code-cell font-mono font-bold p-2.5" dir="ltr">M-01</td><td>خواندن فایل با مشخص‌سازی کاراکترهای گمشده <code>na_values</code></td><td><span className="tag tag-fr">ورودی داده</span></td></tr>
                    <tr className="even:bg-slate-50"><td className="code-cell font-mono font-bold p-2.5" dir="ltr">M-02</td><td>انتخاب بر اساس نام و لیبل ستون‌ها با <code>loc</code> (شامل انتهای بازه)</td><td><span className="tag tag-fr">ایندکس</span></td></tr>
                    <tr className="even:bg-slate-50"><td className="code-cell font-mono font-bold p-2.5" dir="ltr">M-03</td><td>انتخاب بر اساس موقعیت عددی با <code>iloc</code> (حذف انتهای بازه)</td><td><span className="tag tag-fr">ایندکس</span></td></tr>
                    <tr className="even:bg-slate-50"><td className="code-cell font-mono font-bold p-2.5" dir="ltr">M-04</td><td>حذف سطرهای تماماً تهی با <code>dropna(how='all')</code></td><td><span className="tag tag-nfr">پاکسازی</span></td></tr>
                    <tr className="even:bg-slate-50"><td className="code-cell font-mono font-bold p-2.5" dir="ltr">M-05</td><td>پر کردن داده‌های گمشده با میانگین <code>fillna</code></td><td><span className="tag tag-nfr">پاکسازی</span></td></tr>
                    <tr className="even:bg-slate-50"><td className="code-cell font-mono font-bold p-2.5" dir="ltr">M-06</td><td>گروه‌بندی چندمتغیره و آمار چندگانه با <code>groupby.agg</code></td><td><span className="tag tag-fr">تجمیع</span></td></tr>
                    <tr className="even:bg-slate-50"><td className="code-cell font-mono font-bold p-2.5" dir="ltr">M-07</td><td>محاسبه در راستای عمودی ستون‌ها با <code>axis=0</code> در نام‌پای</td><td><span className="tag tag-fr">نام‌پای</span></td></tr>
                    <tr className="even:bg-slate-50"><td className="code-cell font-mono font-bold p-2.5" dir="ltr">M-08</td><td>محاسبه در راستای افقی سطرها با <code>axis=1</code> در نام‌پای</td><td><span className="tag tag-fr">نام‌پای</span></td></tr>
                    <tr className="even:bg-slate-50"><td className="code-cell font-mono font-bold p-2.5" dir="ltr">M-09</td><td>تولید بازه نقاط مساوی با <code>np.linspace(start, stop, num)</code></td><td><span className="tag tag-fr">نام‌پای</span></td></tr>
                    <tr className="even:bg-slate-50"><td className="code-cell font-mono font-bold p-2.5" dir="ltr">M-10</td><td>نمایش مشخصات آماری کل با <code>df.describe()</code></td><td><span className="tag tag-fr">اکتشاف داده</span></td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* ===== اسلاید ۱۳: چالش‌های درس و تله‌های امتحانی (عین گرید تمپلیت) ===== */}
        <section className="slide border border-slate-300 rounded-xl mb-6 shadow-sm overflow-hidden" id="s13">
          <div className="slide-header bg-gradient-to-r from-slate-900 to-slate-800 text-white p-3.5 px-5 flex items-center gap-3.5 border-b-4 border-orange-600">
            <div className="slide-number bg-gradient-to-r from-orange-600 to-amber-500 text-white w-9 h-9 rounded-full flex items-center justify-center font-bold text-base shrink-0">۱۳</div>
            <h2 className="slide-title text-base sm:text-lg font-bold m-0">چالش‌های درس و تله‌های امتحانی دانشجویان</h2>
          </div>
          <div className="slide-body p-5">
            <div className="challenge-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div className="challenge bg-gradient-to-br from-amber-50 to-orange-50 border-r-4 border-orange-600 rounded-lg p-3 text-xs leading-relaxed text-slate-800">
                <strong className="text-orange-950 block font-bold mb-1">تفاوت loc و iloc</strong>
                در loc انتهای بازه inclusive است ولی در iloc انتهای بازه حذف می‌شود.
              </div>
              <div className="challenge bg-gradient-to-br from-amber-50 to-orange-50 border-r-4 border-orange-600 rounded-lg p-3 text-xs leading-relaxed text-slate-800">
                <strong className="text-orange-950 block font-bold mb-1">تله محورها (axis=0/1)</strong>
                در نام‌پای axis=0 یعنی عملیات عمودی سطر به سطر، نه افقی روی هر سطر!
              </div>
              <div className="challenge bg-gradient-to-br from-amber-50 to-orange-50 border-r-4 border-orange-600 rounded-lg p-3 text-xs leading-relaxed text-slate-800">
                <strong className="text-orange-950 block font-bold mb-1">رفتار inplace=True</strong>
                فراموش کردن inplace باعث می‌شود دیتافریم اصلی تغییری نکند.
              </div>
              <div className="challenge bg-gradient-to-br from-amber-50 to-orange-50 border-r-4 border-orange-600 rounded-lg p-3 text-xs leading-relaxed text-slate-800">
                <strong className="text-orange-950 block font-bold mb-1">پرانتز در فیلترهای چندگانه</strong>
                همیشه شروط & و | را درون پرانتز بگذارید تا خطای اولویت عملگر رخ ندهد.
              </div>
              <div className="challenge bg-gradient-to-br from-amber-50 to-orange-50 border-r-4 border-orange-600 rounded-lg p-3 text-xs leading-relaxed text-slate-800">
                <strong className="text-orange-950 block font-bold mb-1">آرگومان‌های *args و **kwargs</strong>
                آرگومان *args تاپل است در حالی که **kwargs دیکشنری کلید-مقدار است.
              </div>
              <div className="challenge bg-gradient-to-br from-amber-50 to-orange-50 border-r-4 border-orange-600 rounded-lg p-3 text-xs leading-relaxed text-slate-800">
                <strong className="text-orange-950 block font-bold mb-1">تفاوت arange و linspace</strong>
                در linspace نقطه پایانی حتماً داخل خروجی هست، ولی در arange خیر.
              </div>
            </div>
          </div>
        </section>

        {/* ===== اسلاید ۱۴: آزمون خودآزمایی تعاملی (تمام ۸ سوال استاندارد) ===== */}
        <section className="slide border border-slate-300 rounded-xl mb-6 shadow-sm overflow-hidden" id="s14">
          <div className="slide-header bg-gradient-to-r from-slate-900 to-slate-800 text-white p-3.5 px-5 flex items-center gap-3.5 border-b-4 border-orange-600">
            <div className="slide-number bg-gradient-to-r from-orange-600 to-amber-500 text-white w-9 h-9 rounded-full flex items-center justify-center font-bold text-base shrink-0">۱۴</div>
            <h2 className="slide-title text-base sm:text-lg font-bold m-0">آزمون خودآزمایی و تست‌های تعاملی پایان‌ترم (۸ سوال کامل)</h2>
          </div>
          <div className="slide-body p-5 space-y-4 text-sm">
            
            {/* Quiz Header with Score */}
            <div className="p-3 bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-200 rounded-xl flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 block">وضعیت آزمون شما:</span>
                <span className="text-xs text-slate-600">
                  {Object.keys(quizAnswers).length} از {quizQuestions.length} سوال پاسخ داده شده
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-orange-600 text-white rounded-full font-bold text-xs">
                  نمره: {quizScore} از {quizQuestions.length} ({Math.round((quizScore / quizQuestions.length) * 100)}٪)
                </span>
                <button
                  onClick={() => setQuizAnswers({})}
                  className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-bold"
                  title="آزمون مجدد"
                >
                  شروع مجدد
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {quizQuestions.map((q, qIdx) => {
                const userAns = quizAnswers[q.id]
                const hasAnswered = userAns !== undefined
                const isCorrect = userAns === q.correctIndex

                return (
                  <div key={q.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                    <div className="font-bold text-slate-900 text-xs sm:text-sm">
                      {qIdx + 1}. {q.question}
                    </div>
                    <div className="space-y-1.5 pt-1">
                      {q.options.map((opt, oIdx) => {
                        let optStyle = 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'
                        if (hasAnswered) {
                          if (oIdx === q.correctIndex) optStyle = 'bg-emerald-100 border-emerald-400 text-emerald-900 font-bold'
                          else if (oIdx === userAns) optStyle = 'bg-rose-100 border-rose-400 text-rose-900'
                        }
                        return (
                          <button
                            key={oIdx}
                            onClick={() => setQuizAnswers({ ...quizAnswers, [q.id]: oIdx })}
                            className={`w-full text-right p-2.5 rounded-lg border text-xs transition-all flex items-center justify-between ${optStyle}`}
                          >
                            <span>{oIdx + 1}) {opt}</span>
                            {hasAnswered && oIdx === q.correctIndex && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                            {hasAnswered && oIdx === userAns && !isCorrect && <XCircle className="w-4 h-4 text-rose-600 shrink-0" />}
                          </button>
                        )
                      })}
                    </div>
                    {hasAnswered && (
                      <div className="text-[11px] p-2.5 rounded bg-slate-200/80 text-slate-800 leading-relaxed mt-2 border-r-4 border-orange-500">
                        <strong>نکته تشریحی استاد: </strong>{q.explanation}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ===== اسلاید ۱۵: نتیجه‌گیری (عین استراکچر تمپلیت) ===== */}
        <section className="slide border border-slate-300 rounded-xl mb-6 shadow-sm overflow-hidden" id="s15">
          <div className="slide-header bg-gradient-to-r from-slate-900 to-slate-800 text-white p-3.5 px-5 flex items-center gap-3.5 border-b-4 border-orange-600">
            <div className="slide-number bg-gradient-to-r from-orange-600 to-amber-500 text-white w-9 h-9 rounded-full flex items-center justify-center font-bold text-base shrink-0">۱۵</div>
            <h2 className="slide-title text-base sm:text-lg font-bold m-0">جمع‌بندی و نقشه راه پیش‌رو</h2>
          </div>
          <div className="slide-body p-5">
            <div className="conclusion bg-gradient-to-br from-blue-50 to-sky-50 border border-sky-200 border-r-4 border-r-sky-600 rounded-xl p-5 text-slate-800 text-sm leading-relaxed">
              <blockquote className="bg-white/80 border-r-4 border-sky-500 p-3 my-2.5 rounded-r-lg italic text-slate-700 font-mono text-xs" dir="ltr">
                <p>"Data analysis is not just about writing code; it is about asking the right questions from data and turning raw observations into actionable intelligence." — Wes McKinney</p>
              </blockquote>
              <p className="mt-3">
                یادگیری ترکیب <strong>NumPy</strong> و <strong>Pandas</strong> نقطه شروع و پیش‌نیاز حیاتی ورود به دنیای 
                <strong>هوش مصنوعی (AI)</strong>، <strong>یادگیری ماشین (Machine Learning)</strong> و 
                <strong>مهندسی داده‌های بزرگ (Big Data)</strong> است. تسلط بر تمیزسازی داده‌های ناقص، گروه‌بندی آماری، و فهم ماتریس‌ها 
                شما را برای آزمون دانشگاه و بازار کار به عنوان یک تحلیل‌گر حرفه‌ای آماده می‌سازد.
              </p>
            </div>
          </div>
        </section>

      </div>

    </div>
  )
}
