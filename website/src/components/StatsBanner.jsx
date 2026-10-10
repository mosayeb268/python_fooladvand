import React from 'react'
import { FileText, Code2, BookOpen, Database, Layers, ArrowLeft } from 'lucide-react'
import statsData from '../data/stats.json'

export default function StatsBanner({ onSelectTab }) {
  const statCards = [
    {
      title: 'کل محتوا و سرفصل‌ها',
      value: statsData.totalItems,
      unit: 'بخش آموزشی (۰۱ تا ۲۱)',
      icon: Layers,
      color: 'from-blue-600 to-indigo-600',
      tab: 'dashboard',
      actionText: 'مشاهده نقشه راه'
    },
    {
      title: 'اسناد و کتاب‌های PDF',
      value: statsData.totalPdfs,
      unit: 'کتاب مرجع و جزوه',
      icon: FileText,
      color: 'from-rose-500 to-pink-600',
      tab: 'pdfs',
      actionText: 'مطالعه کتب و جزوات'
    },
    {
      title: 'برنامه‌های پایتون',
      value: statsData.totalScripts,
      unit: 'اسکریپت کاربردی در ۴ فصل',
      icon: Code2,
      color: 'from-emerald-500 to-teal-600',
      tab: 'scripts',
      actionText: 'مشاهده و اجرای کدها'
    },
    {
      title: 'نوت‌بوک‌های ژوپیتر',
      value: statsData.totalNotebooks,
      unit: `${statsData.totalNotebookCells} سلول اجرایی و خروجی`,
      icon: BookOpen,
      color: 'from-amber-500 to-orange-600',
      tab: 'notebooks',
      actionText: 'بررسی سلول‌های نوت‌بوک'
    },
    {
      title: 'دیتاست‌های تحلیلی CSV',
      value: statsData.totalDatasets,
      unit: `${statsData.totalDataRows} رکورد داده (Titanic & Employees)`,
      icon: Database,
      color: 'from-purple-500 to-violet-600',
      tab: 'datasets',
      actionText: 'کاوش و فیلتر داده‌ها'
    }
  ]

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800/80 p-6 md:p-8 shadow-2xl">
      {/* Decorative Glow */}
      <div className="absolute top-0 right-1/4 -mt-12 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 -mb-12 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Hero Header */}
      <div className="relative z-10 max-w-3xl mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-medium mb-3">
          <span>📚 مرجع کامل دانشگاهی - ترم ۶</span>
          <span>•</span>
          <span>Python For Data Analysis</span>
        </div>
        <h1 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
          پرتال جامع یادگیری و مستندات <span className="bg-gradient-to-l from-cyan-400 to-blue-500 bg-clip-text text-transparent">تحلیل داده با پایتون</span>
        </h1>
        <p className="mt-3 text-sm md:text-base text-slate-300 leading-relaxed">
          دسترسی یکپارچه و تعاملی به تمامی منابع درسی: کتاب‌های مرجع (Wes McKinney)، جزوات کلاسی، ۳۳ برنامه تمرینی پایتون، رندر آنلاین نوت‌بوک‌های NumPy و Pandas، و کاوش تعاملی دیتاست‌های مسافران تایتانیک و کارکنان.
        </p>
      </div>

      {/* Metric Cards Grid */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon
          return (
            <div
              key={idx}
              onClick={() => onSelectTab(card.tab)}
              className="group cursor-pointer rounded-xl bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700/50 hover:border-cyan-500/50 p-4 transition-all duration-200 hover:-translate-y-1 shadow-md hover:shadow-cyan-500/5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center text-white shadow-md`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-2xl font-black text-white group-hover:text-cyan-400 transition-colors">
                    {card.value}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-200 mb-1">{card.title}</h3>
                <p className="text-xs text-slate-400">{card.unit}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-700/50 flex items-center justify-between text-[11px] text-slate-400 group-hover:text-cyan-400 font-medium">
                <span>{card.actionText}</span>
                <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
