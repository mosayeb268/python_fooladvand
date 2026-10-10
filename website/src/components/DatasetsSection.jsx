import React, { useState, useMemo } from 'react'
import { Database, Download, Search, ArrowUpDown, ChevronLeft, ChevronRight, BarChart3, Table, PieChart, TrendingUp, Sparkles } from 'lucide-react'
import datasetsData from '../data/datasets.json'

export default function DatasetsSection() {
  const [selectedDatasetId, setSelectedDatasetId] = useState(datasetsData[0]?.id || '')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortColumn, setSortColumn] = useState(null)
  const [sortDirection, setSortDirection] = useState('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(15)
  const [activeTab, setActiveTab] = useState('table') // 'table', 'stats', 'viz'
  const [genderFilter, setGenderFilter] = useState('all') // for Titanic & Employees
  const [survivedFilter, setSurvivedFilter] = useState('all') // for Titanic

  const activeDataset = datasetsData.find(d => d.id === selectedDatasetId) || datasetsData[0]

  // Filtered and Sorted rows
  const filteredAndSortedRows = useMemo(() => {
    let rows = [...activeDataset.sampleRows]

    // Specific filters
    if (activeDataset.id === 'ds-titanic') {
      if (genderFilter !== 'all') {
        rows = rows.filter(r => r['Sex'] === genderFilter)
      }
      if (survivedFilter !== 'all') {
        rows = rows.filter(r => r['Survived'] === survivedFilter)
      }
    } else if (activeDataset.id === 'ds-employees') {
      if (genderFilter !== 'all') {
        rows = rows.filter(r => r['Gender'] === genderFilter)
      }
    }

    // Global Search
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      rows = rows.filter(row => {
        return Object.values(row).some(val => 
          String(val).toLowerCase().includes(term)
        )
      })
    }

    // Sort
    if (sortColumn) {
      rows.sort((a, b) => {
        const valA = a[sortColumn] ?? ''
        const valB = b[sortColumn] ?? ''

        const numA = parseFloat(valA)
        const numB = parseFloat(valB)
        if (!isNaN(numA) && !isNaN(numB)) {
          return sortDirection === 'asc' ? numA - numB : numB - numA
        }

        return sortDirection === 'asc'
          ? String(valA).localeCompare(String(valB))
          : String(valB).localeCompare(String(valA))
      })
    }

    return rows
  }, [activeDataset, searchTerm, sortColumn, sortDirection, genderFilter, survivedFilter])

  const totalPages = Math.ceil(filteredAndSortedRows.length / pageSize) || 1
  const displayedRows = filteredAndSortedRows.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const handleSort = (col) => {
    if (sortColumn === col) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(col)
      setSortDirection('asc')
    }
  }

  const isMissingValue = (val) => {
    return val === '' || val === '?' || val === '-' || val === null || val === undefined
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
            <Database className="w-6 h-6 text-purple-400" />
            <span>دیتاست‌های تحلیلی پروژه (۲ فایل CSV - ۹۰۱ سطر داده)</span>
          </h2>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            کاوش، جستجو، مرتب‌سازی و مصورسازی داده‌های Employees و Titanic مورد استفاده در نوت‌بوک‌ها
          </p>
        </div>

        {/* Download CSV button */}
        <a
          href={activeDataset.downloadUrl}
          download={activeDataset.filename}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-600/20 transition-all self-start md:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>دانلود دیتاست ({activeDataset.filename})</span>
        </a>
      </div>

      {/* Dataset Selection Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {datasetsData.map(ds => {
          const isSelected = ds.id === selectedDatasetId
          return (
            <div
              key={ds.id}
              onClick={() => {
                setSelectedDatasetId(ds.id)
                setCurrentPage(1)
                setSearchTerm('')
                setSortColumn(null)
                setGenderFilter('all')
                setSurvivedFilter('all')
              }}
              className={`cursor-pointer rounded-2xl p-5 border transition-all ${
                isSelected
                  ? 'bg-purple-500/15 border-purple-500/50 shadow-lg shadow-purple-500/10'
                  : 'bg-slate-900/60 hover:bg-slate-800/80 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-bold text-purple-400" dir="ltr">
                  #{ds.order} - {ds.filename}
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-200">
                  {ds.rowCount} سطر • {ds.columnCount} ستون
                </span>
              </div>
              <h3 className="text-base font-bold text-white">{ds.title}</h3>
              <p className="text-xs text-slate-300 mt-1 line-clamp-2">{ds.description}</p>
            </div>
          )
        })}
      </div>

      {/* Dataset View Toolbar */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Sub tabs: Table vs Column Stats vs Visualizations */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setActiveTab('table')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'table'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>جدول داده</span>
          </button>

          <button
            onClick={() => setActiveTab('viz')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'viz'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <PieChart className="w-3.5 h-3.5" />
            <span>نمودارهای تحلیلی</span>
          </button>

          <button
            onClick={() => setActiveTab('stats')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'stats'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>دیکشنری ستون‌ها</span>
          </button>

          <button
            onClick={() => setActiveTab('exercises')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'exercises'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>تمرینات و پرسش‌های کلاسی</span>
          </button>
        </div>

        {/* Quick Filters */}
        {activeTab === 'table' && (
          <div className="flex items-center gap-2 flex-wrap">
            {/* Titanic survived filter */}
            {activeDataset.id === 'ds-titanic' && (
              <select
                value={survivedFilter}
                onChange={(e) => {
                  setSurvivedFilter(e.target.value)
                  setCurrentPage(1)
                }}
                className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none"
              >
                <option value="all">همه وضعیت‌های بقا</option>
                <option value="1">نجات‌یافتگان (Survived = 1)</option>
                <option value="0">فوت‌شدگان (Survived = 0)</option>
              </select>
            )}

            {/* Gender filter */}
            <select
              value={genderFilter}
              onChange={(e) => {
                setGenderFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none"
            >
              <option value="all">همه جنسیت‌ها</option>
              <option value={activeDataset.id === 'ds-titanic' ? 'female' : 'female'}>خانم‌ها (Female)</option>
              <option value={activeDataset.id === 'ds-titanic' ? 'male' : 'male'}>آقایان (Male)</option>
            </select>

            <div className="relative w-full md:w-56">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                placeholder="جستجو در سطرها..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-9 pl-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value))
                setCurrentPage(1)
              }}
              className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none"
            >
              <option value={10}>۱۰ سطر</option>
              <option value={15}>۱۵ سطر</option>
              <option value={25}>۲۵ سطر</option>
              <option value={50}>۵۰ سطر</option>
            </select>
          </div>
        )}
      </div>

      {/* VIEW 1: Table */}
      {activeTab === 'table' && (
        <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto max-h-[600px]" dir="ltr">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="sticky top-0 bg-slate-950 text-slate-300 uppercase tracking-wider font-mono border-b border-slate-800 z-10">
                <tr>
                  <th className="py-3 px-3 w-12 text-center text-slate-500">#</th>
                  {activeDataset.columns.map(col => {
                    const isSorted = sortColumn === col
                    return (
                      <th
                        key={col}
                        onClick={() => handleSort(col)}
                        className="py-3 px-4 font-bold text-purple-300 hover:text-white cursor-pointer select-none transition-colors"
                      >
                        <div className="flex items-center gap-1.5">
                          <span>{col}</span>
                          <ArrowUpDown className={`w-3 h-3 ${isSorted ? 'text-purple-400' : 'text-slate-600'}`} />
                        </div>
                      </th>
                    )
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {displayedRows.length === 0 ? (
                  <tr>
                    <td colSpan={activeDataset.columns.length + 1} className="py-8 text-center text-slate-500 text-xs">
                      هیچ رکوردی منطبق با فیلتر یا جستجوی شما یافت نشد.
                    </td>
                  </tr>
                ) : (
                  displayedRows.map((row, rIdx) => {
                    const actualIndex = (currentPage - 1) * pageSize + rIdx + 1
                    return (
                      <tr key={rIdx} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-2.5 px-3 text-center text-slate-500 text-[11px] bg-slate-950/30">
                          {actualIndex}
                        </td>
                        {activeDataset.columns.map(col => {
                          const val = row[col]
                          const isMissing = isMissingValue(val)
                          return (
                            <td key={col} className="py-2.5 px-4 whitespace-nowrap text-slate-300">
                              {isMissing ? (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                  <span>{val === '' ? 'NaN' : val}</span>
                                </span>
                              ) : (
                                <span>{val}</span>
                              )}
                            </td>
                          )
                        })}
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Bar */}
          <div className="px-5 py-3 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <div>
              نمایش {(currentPage - 1) * pageSize + 1} تا {Math.min(currentPage * pageSize, filteredAndSortedRows.length)} از {filteredAndSortedRows.length} سطر
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <span className="px-3 py-1 font-mono text-white font-bold">
                {currentPage} / {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: Data Visualizations (نمودارها) */}
      {activeTab === 'viz' && (
        <div className="space-y-6">
          {activeDataset.id === 'ds-titanic' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Chart 1: Survival Rate */}
              <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <span>نرخ بقای کلی مسافران تایتانیک</span>
                  </h4>
                  <span className="text-xs text-slate-400 font-mono">۸۹۱ مسافر</span>
                </div>

                <div className="space-y-3 pt-2">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-emerald-400 font-bold">نجات‌یافتگان (Survived = 1)</span>
                      <span className="font-mono text-slate-300">۳۴۲ نفر (۳۸.۴٪)</span>
                    </div>
                    <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: '38.4%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-rose-400 font-bold">فوت‌شدگان (Survived = 0)</span>
                      <span className="font-mono text-slate-300">۵۴۹ نفر (۶۱.۶٪)</span>
                    </div>
                    <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                      <div className="h-full bg-rose-500 rounded-full" style={{ width: '61.6%' }} />
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-400 pt-2 border-t border-slate-800 leading-relaxed">
                  تحلیل در پانداس: <code className="text-cyan-400">df['Survived'].value_counts(normalize=True)</code>
                </p>
              </div>

              {/* Chart 2: Survival by Gender */}
              <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-cyan-400" />
                    <span>درصد بقا بر اساس جنسیت (Gender)</span>
                  </h4>
                  <span className="text-xs text-slate-400 font-mono">groupby('Sex')</span>
                </div>

                <div className="space-y-3 pt-2">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-pink-400 font-bold">بانوان (Female)</span>
                      <span className="font-mono text-slate-300">۲۳۳ از ۳۱۴ (۷۴.۲٪ بقا)</span>
                    </div>
                    <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                      <div className="h-full bg-pink-500 rounded-full" style={{ width: '74.2%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-blue-400 font-bold">آقایان (Male)</span>
                      <span className="font-mono text-slate-300">۱۰۹ از ۵۷۷ (۱۸.۹٪ بقا)</span>
                    </div>
                    <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: '18.9%' }} />
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-400 pt-2 border-t border-slate-800 leading-relaxed">
                  تحلیل در پانداس: <code className="text-cyan-400">df.groupby('Sex')['Survived'].mean()</code>
                </p>
              </div>

              {/* Chart 3: Pclass distribution */}
              <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-xl md:col-span-2">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-amber-400" />
                  <span>توزیع مسافران بر اساس کلاس بلیت (Pclass 1, 2, 3)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-center">
                    <span className="text-xs text-slate-400">کلاس ۱ (لوکس)</span>
                    <div className="text-xl font-bold text-amber-400 font-mono">۲۱۶ مسافر</div>
                    <span className="text-[11px] text-slate-500">۲۴.۲٪ مسافران</span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-center">
                    <span className="text-xs text-slate-400">کلاس ۲ (متوسط)</span>
                    <div className="text-xl font-bold text-cyan-400 font-mono">۱۸۴ مسافر</div>
                    <span className="text-[11px] text-slate-500">۲۰.۶٪ مسافران</span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-center">
                    <span className="text-xs text-slate-400">کلاس ۳ (اقتصادی)</span>
                    <div className="text-xl font-bold text-purple-400 font-mono">۴۹۱ مسافر</div>
                    <span className="text-[11px] text-slate-500">۵۵.۱٪ مسافران</span>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            /* Employees charts */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Salary by City */}
              <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-xl">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span>میانگین حقوق بر اساس شهر (Salary by City)</span>
                </h4>

                <div className="space-y-3 pt-2 text-xs">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-300">خرم‌آباد (Khorramabad)</span>
                      <span className="font-mono text-emerald-400 font-bold">۵,۸۰۰</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: '100%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-300">تهران (Tehran)</span>
                      <span className="font-mono text-cyan-400 font-bold">۴,۶۳۳</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden">
                      <div className="h-full bg-cyan-500 rounded-full" style={{ width: '80%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-300">کاشان (Kashan)</span>
                      <span className="font-mono text-amber-400 font-bold">۴,۵۰۰</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: '77%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-300">یزد (Yazd)</span>
                      <span className="font-mono text-purple-400 font-bold">۴,۳۰۰</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500 rounded-full" style={{ width: '74%' }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Degrees distribution */}
              <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-xl">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-purple-400" />
                  <span>توزیع مدرک تحصیلی پرسنل (Degree)</span>
                </h4>

                <div className="grid grid-cols-3 gap-3 pt-4">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                    <span className="text-xs text-slate-400">کارشناسی</span>
                    <div className="text-lg font-bold text-purple-400 font-mono">۴ نفر</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                    <span className="text-xs text-slate-400">کارشناسی ارشد</span>
                    <div className="text-lg font-bold text-cyan-400 font-mono">۳ نفر</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                    <span className="text-xs text-slate-400">دکتری</span>
                    <div className="text-lg font-bold text-amber-400 font-mono">۲ نفر</div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 leading-relaxed mt-4">
                  نکته آموزشی: ۱ رکورد دارای مقدار خالی (NaN) در ستون مدرک است که جهت تمرین متد fillna در نظر گرفته شده است.
                </div>
              </div>

            </div>
          )}
        </div>
      )}

      {/* VIEW 3: Stats / Column Dictionary View */}
      {activeTab === 'stats' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeDataset.columnStats.map(stat => (
            <div key={stat.name} className="rounded-xl bg-slate-900 border border-slate-800 p-4 space-y-3 shadow-md">
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm font-bold text-purple-400" dir="ltr">{stat.name}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${stat.isNumeric ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'bg-slate-800 text-slate-400'}`}>
                  {stat.isNumeric ? 'عددی (Numeric)' : 'متنی (Categorical)'}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">مقادیر موجود:</span>
                  <span className="font-mono font-bold">{stat.nonNullCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">مقادیر گمشده / تهی:</span>
                  <span className={`font-mono font-bold ${stat.nullCount > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
                    {stat.nullCount}
                  </span>
                </div>

                {stat.isNumeric ? (
                  <>
                    <div className="flex justify-between">
                      <span className="text-slate-400">میانگین (Mean):</span>
                      <span className="font-mono">{stat.mean}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">دامنه (Min - Max):</span>
                      <span className="font-mono" dir="ltr">{stat.min} ~ {stat.max}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between">
                      <span className="text-slate-400">تعداد مقادیر یکتا:</span>
                      <span className="font-mono">{stat.uniqueCount}</span>
                    </div>
                    <div className="pt-1 text-[11px] text-slate-400">
                      نمونه‌ها: <span className="text-slate-300 font-mono" dir="ltr">{stat.sampleValues?.join(', ')}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VIEW 4: Solved Exercises & Homework (تمرینات حل‌شده کلاسی) */}
      {activeTab === 'exercises' && (
        <div className="space-y-5">
          <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-500/30 text-xs text-purple-200 flex items-center justify-between">
            <span>مسائل و تمرینات رسمی تدریس‌شده در جلسات کلاسی و جزوات مربوط به {activeDataset.title}:</span>
            <span className="font-mono text-[11px] bg-purple-900/60 px-2 py-0.5 rounded text-purple-300">
              {activeDataset.id === 'ds-employees' ? 'جزوه شماره ۱۹' : 'جزوه شماره ۲۰'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {activeDataset.id === 'ds-employees' ? (
              <>
                <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-3 shadow-lg">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white">۱. مدیریت کاراکترهای گم‌شده تعمدی (?, -)</h4>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-cyan-400">Data Cleaning</span>
                  </div>
                  <p className="text-xs text-slate-300">شناسایی و تبدیل مقادیر غیرمعتبر علامت سوال و خط فاصله به NaN استاندارد پانداس:</p>
                  <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300 overflow-x-auto" dir="ltr">
{`missing_chars = ['?', '-', '']
df = pd.read_csv('Employees.csv', na_values=missing_chars)
print(df.isnull().sum())`}
                  </pre>
                  <div className="p-2.5 rounded-lg bg-black/50 border border-slate-800 text-[11px] font-mono text-emerald-400" dir="ltr">
                    Age: 1, City: 1, Degree: 1, Speciality: 1
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-3 shadow-lg">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white">۲. میانگین حقوق به تفکیک مدرک تحصیلی</h4>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-purple-400">GroupBy</span>
                  </div>
                  <p className="text-xs text-slate-300">گروه‌بندی بر اساس Degree و محاسبه میانگین حقوق (Salary):</p>
                  <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300 overflow-x-auto" dir="ltr">
{`df.groupby('Degree')['Salary'].mean()`}
                  </pre>
                  <div className="p-2.5 rounded-lg bg-black/50 border border-slate-800 text-[11px] font-mono text-emerald-400" dir="ltr">
                    Bachelor: 4000.0, Master: 4700.0, PhD: 5800.0
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-3 shadow-lg">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white">۳. محاسبه آمار چندگانه سن با agg</h4>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-amber-400">Aggregation</span>
                  </div>
                  <p className="text-xs text-slate-300">محاسبه همزمان کمترین، بیشترین، میانگین و تعداد بر اساس جنسیت:</p>
                  <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300 overflow-x-auto" dir="ltr">
{`df.groupby('Gender')['Age'].agg(['min', 'max', 'mean', 'count'])`}
                  </pre>
                  <div className="p-2.5 rounded-lg bg-black/50 border border-slate-800 text-[11px] font-mono text-emerald-400" dir="ltr">
                    female: [25.0, 50.0, 37.5, 2] | male: [0.0, 41.0, 25.6, 5]
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-3 shadow-lg">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white">۴. پر کردن داده‌های گمشده سن با میانگین</h4>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-rose-400">Imputation</span>
                  </div>
                  <p className="text-xs text-slate-300">استفاده از متد fillna جهت جایگزینی مقدار خالی سن زهرا فرهادی:</p>
                  <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300 overflow-x-auto" dir="ltr">
{`mean_val = df['Age'].mean()
df['Age'].fillna(mean_val, inplace=True)`}
                  </pre>
                  <div className="p-2.5 rounded-lg bg-black/50 border border-slate-800 text-[11px] font-mono text-emerald-400" dir="ltr">
                    مقدار سطر سوم (zahra farhadi) با ۲۸.۹ جایگزین شد.
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-3 shadow-lg">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white">۱. نرخ بقای کل مسافران تایتانیک</h4>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-cyan-400">Value Counts</span>
                  </div>
                  <p className="text-xs text-slate-300">محاسبه سریع درصد مسافران نجات‌یافته و فوت‌شده:</p>
                  <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300 overflow-x-auto" dir="ltr">
{`df['Survived'].value_counts(normalize=True) * 100`}
                  </pre>
                  <div className="p-2.5 rounded-lg bg-black/50 border border-slate-800 text-[11px] font-mono text-emerald-400" dir="ltr">
                    0 (فوت شده): 61.62% | 1 (نجات‌یافته): 38.38%
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-3 shadow-lg">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white">۲. مقایسه نرخ بقای بانوان در برابر آقایان</h4>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-pink-400">Gender Analysis</span>
                  </div>
                  <p className="text-xs text-slate-300">بررسی اثر سیاست «ابتدا زنان و کودکان» در میزان نجات‌یافتگان:</p>
                  <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300 overflow-x-auto" dir="ltr">
{`df.groupby('Sex')['Survived'].mean() * 100`}
                  </pre>
                  <div className="p-2.5 rounded-lg bg-black/50 border border-slate-800 text-[11px] font-mono text-emerald-400" dir="ltr">
                    female: 74.20% | male: 18.89%
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-3 shadow-lg">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white">۳. نرخ بقا بر اساس کلاس بلیت و جنسیت</h4>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-amber-400">Multi Groupby</span>
                  </div>
                  <p className="text-xs text-slate-300">تحلیل بقا همزمان با دو متغیر Pclass و Sex:</p>
                  <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300 overflow-x-auto" dir="ltr">
{`df.groupby(['Pclass', 'Sex'])['Survived'].mean() * 100`}
                  </pre>
                  <div className="p-2.5 rounded-lg bg-black/50 border border-slate-800 text-[11px] font-mono text-emerald-400" dir="ltr">
                    Class 1: F 96.8% M 36.9% | Class 2: F 92.1% M 15.7% | Class 3: F 50.0% M 13.5%
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-3 shadow-lg">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white">۴. میانگین کرایه پرداختی مسافران بر اساس کلاس</h4>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-purple-400">Fare Stats</span>
                  </div>
                  <p className="text-xs text-slate-300">مقایسه هزینه بلیت پرداخت‌شده در سه کلاس مسافران:</p>
                  <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300 overflow-x-auto" dir="ltr">
{`df.groupby('Pclass')['Fare'].mean()`}
                  </pre>
                  <div className="p-2.5 rounded-lg bg-black/50 border border-slate-800 text-[11px] font-mono text-emerald-400" dir="ltr">
                    Class 1: 84.15$ | Class 2: 20.66$ | Class 3: 13.67$
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
