import React, { useState, useEffect } from 'react'
import { FileText, Code2, BookOpen, Database, Filter, ExternalLink, CheckCircle2, Circle, Link2, Sparkles, Layers, ListOrdered, Calendar } from 'lucide-react'
import timelineData from '../data/timeline.json'

export default function TimelineRoadmap({ onSelectContent }) {
  const [activeFilter, setActiveFilter] = useState('all')
  const [viewMode, setViewMode] = useState('phases') // 'phases' or 'grid'
  const [completedItems, setCompletedItems] = useState(() => {
    try {
      const saved = localStorage.getItem('pda_completed_items')
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  })

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('pda_completed_items', JSON.stringify(completedItems))
    } catch {
      // ignore
    }
  }, [completedItems])

  const toggleComplete = (num, e) => {
    e.stopPropagation()
    setCompletedItems(prev => ({
      ...prev,
      [num]: !prev[num]
    }))
  }

  const completedCount = Object.values(completedItems).filter(Boolean).length
  const progressPercent = Math.round((completedCount / timelineData.length) * 100)

  // 5 Academic Learning Phases
  const learningPhases = [
    {
      id: 'phase-1',
      title: 'فاز ۱: الفبای پایتون و ساختمان‌داده‌های توالی',
      subtitle: 'هفته‌های ۱ تا ۳ • ورود به پایتون، متغیرها، شرط‌ها، لیست، تاپل و دیکشنری',
      color: 'from-blue-600 to-cyan-600',
      itemNums: ['01', '02', '03', '04', '05', '06']
    },
    {
      id: 'phase-2',
      title: 'فاز ۲: توابع، Lambda، حوزه متغیرها و ساخت ماژول‌ها',
      subtitle: 'هفته‌های ۴ و ۵ • پارامترهای نامحدود *args و **kwargs، بازگشت و ماژول m1.py',
      color: 'from-emerald-600 to-teal-600',
      itemNums: ['07', '08', '09']
    },
    {
      id: 'phase-3',
      title: 'فاز ۳: محاسبات علمی و ماتریسی با کتابخانه NumPy',
      subtitle: 'هفته‌های ۶ تا ۸ • ساخت ndarray، برودکستینگ، ابعاد و توابع ریاضی برداری',
      color: 'from-amber-600 to-orange-600',
      itemNums: ['10', '11', '12', '13']
    },
    {
      id: 'phase-4',
      title: 'فاز ۴: تحلیل و مهندسی داده با کتابخانه Pandas',
      subtitle: 'هفته‌های ۹ تا ۱۱ • ساختارهای Series و DataFrame، برش با loc/iloc و فیلترینگ',
      color: 'from-purple-600 to-indigo-600',
      itemNums: ['14', '15', '17']
    },
    {
      id: 'phase-5',
      title: 'فاز ۵: پاکسازی داده و تحلیل دنیای واقعی (Employees & Titanic)',
      subtitle: 'هفته‌های ۱۲ به بعد • مدیریت مقادیر NaN با dropna/fillna، groupby و حل پروژه‌ها',
      color: 'from-rose-600 to-pink-600',
      itemNums: ['16', '18', '19', '20', '21']
    }
  ]

  const filterOptions = [
    { id: 'all', label: 'همه آیتم‌ها (۲۱)', count: 21 },
    { id: 'pdf', label: 'کتاب‌ها و جزوات (۱۱)', count: 11, icon: FileText },
    { id: 'scripts', label: 'کدهای پایتون (۴ پوشه - ۳۳ فایل)', count: 4, icon: Code2 },
    { id: 'notebook', label: 'نوت‌بوک‌های ژوپیتر (۴)', count: 4, icon: BookOpen },
    { id: 'dataset', label: 'دیتاست‌ها (۲)', count: 2, icon: Database },
  ]

  const filteredItems = timelineData.filter(item => {
    if (activeFilter === 'all') return true
    return item.type === activeFilter
  })

  const getTypeBadge = (type) => {
    switch (type) {
      case 'pdf':
        return { label: 'سند PDF', bg: 'bg-rose-500/10 text-rose-400 border-rose-500/20', icon: FileText }
      case 'scripts':
        return { label: 'کد پایتون (.py)', bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', icon: Code2 }
      case 'notebook':
        return { label: 'ژوپیتر (.ipynb)', bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20', icon: BookOpen }
      case 'dataset':
        return { label: 'دیتاست (.csv)', bg: 'bg-purple-500/10 text-purple-400 border-purple-500/20', icon: Database }
      default:
        return { label: 'محتوا', bg: 'bg-slate-500/10 text-slate-400 border-slate-500/20', icon: FileText }
    }
  }

  // Render Card Component
  const renderItemCard = (item) => {
    const badge = getTypeBadge(item.type)
    const BadgeIcon = badge.icon
    const isDone = Boolean(completedItems[item.num])

    return (
      <div
        key={item.num}
        onClick={() => onSelectContent(item)}
        className={`group cursor-pointer rounded-2xl border p-4 sm:p-5 transition-all duration-200 hover:-translate-y-0.5 shadow-md flex flex-col justify-between ${
          isDone
            ? 'bg-slate-900/40 border-emerald-500/30'
            : 'bg-slate-900/80 hover:bg-slate-800/80 border-slate-800 hover:border-cyan-500/40'
        }`}
      >
        <div>
          {/* Top row: Order, completion check, and type badge */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700">
                #{item.num}
              </span>
              <button
                onClick={(e) => toggleComplete(item.num, e)}
                className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border transition-all ${
                  isDone
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold'
                    : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-white'
                }`}
                title={isDone ? 'علامت به عنوان مطالعه نشده' : 'علامت به عنوان مطالعه شده'}
              >
                {isDone ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <Circle className="w-3 h-3" />}
                <span>{isDone ? 'مطالعه شد' : 'تکمیل نشده'}</span>
              </button>
            </div>

            <span className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border ${badge.bg}`}>
              <BadgeIcon className="w-3 h-3" />
              <span>{badge.label}</span>
            </span>
          </div>

          {/* Title */}
          <h3 className={`text-sm font-bold transition-colors line-clamp-2 ${isDone ? 'text-slate-300' : 'text-white group-hover:text-cyan-400'}`}>
            {item.title}
          </h3>

          {/* Filename */}
          <p className="text-xs text-slate-400 mt-2 font-mono truncate" dir="ltr">
            {item.file}
          </p>

          {/* Related Items Cross-References */}
          {item.related && item.related.length > 0 && (
            <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <Link2 className="w-2.5 h-2.5" />
                <span>مرتبط:</span>
              </span>
              {item.related.map(relNum => (
                <span
                  key={relNum}
                  onClick={(e) => {
                    e.stopPropagation()
                    const target = timelineData.find(t => t.num === relNum)
                    if (target) onSelectContent(target)
                  }}
                  className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 hover:bg-cyan-500/20 text-cyan-300 hover:text-cyan-200 border border-slate-700 cursor-pointer transition-colors"
                >
                  #{relNum}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 group-hover:text-cyan-400 font-medium">
          <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800/60 text-slate-300">
            {item.category}
          </span>
          <span className="inline-flex items-center gap-1 text-[11px]">
            <span>مشاهده در بخش مربوطه</span>
            <ExternalLink className="w-3 h-3" />
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      
      {/* Progress Bar Card */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-lg space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">پیگیری پیشرفت یادگیری شما در دوره:</h3>
            <span className="text-xs text-slate-400">({completedCount} از {timelineData.length} بخش تکمیل شده)</span>
          </div>
          <span className="font-mono text-xs font-black text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-lg border border-cyan-500/20">
            {progressPercent}٪ تکمیل شده
          </span>
        </div>

        {/* Progress bar track */}
        <div className="w-full h-2.5 rounded-full bg-slate-950 border border-slate-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-l from-cyan-400 to-blue-500 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Section Header & View Mode Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
            <span>نقشه راه و ساختار جامع دوره (آیتم‌های ۰۱ تا ۲۱)</span>
          </h2>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            سیر یادگیری گام‌به‌گام از منابع اولیه و سینتکس پایه تا کار حرفه‌ای با نام‌پای و تحلیل داده‌های تایتانیک با پانداس
          </p>
        </div>

        {/* View Mode Toggle: Phases vs All Grid */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 self-start md:self-auto">
          <button
            onClick={() => setViewMode('phases')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'phases'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>سیر ۵ فاز دانشگاهی</span>
          </button>

          <button
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'grid'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ListOrdered className="w-3.5 h-3.5" />
            <span>فهرست عددی (۰۱ تا ۲۱)</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: Guided Learning Phases */}
      {viewMode === 'phases' ? (
        <div className="space-y-8">
          {learningPhases.map((phase, pIdx) => {
            const phaseItems = timelineData.filter(item => phase.itemNums.includes(item.num))
            const phaseCompleted = phaseItems.filter(item => completedItems[item.num]).length

            return (
              <div key={phase.id} className="rounded-3xl bg-slate-900/60 border border-slate-800/80 p-5 sm:p-6 space-y-4 shadow-xl">
                {/* Phase Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${phase.color} flex items-center justify-center text-white font-bold text-sm shadow-md`}>
                      {pIdx + 1}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">{phase.title}</h3>
                      <p className="text-xs text-slate-400">{phase.subtitle}</p>
                    </div>
                  </div>

                  <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 font-mono self-start sm:self-auto">
                    {phaseCompleted} از {phaseItems.length} مطالعه شد
                  </span>
                </div>

                {/* Phase Items Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {phaseItems.map(item => renderItemCard(item))}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* VIEW 2: Grid with Filter Pills */
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            {filterOptions.map(opt => (
              <button
                key={opt.id}
                onClick={() => setActiveFilter(opt.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeFilter === opt.id
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map(item => renderItemCard(item))}
          </div>
        </div>
      )}

    </div>
  )
}
