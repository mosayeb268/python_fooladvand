import React from 'react'
import { Heart, Sparkles, BookOpen, Code2 } from 'lucide-react'

export default function Footer({ onSelectTab }) {
  return (
    <footer className="mt-20 border-t border-slate-800/80 bg-slate-950/80 py-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Left Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-cyan-500/20">
              🐍
            </div>
            <div>
              <div className="text-sm font-bold text-white">پرتال پایتون برای تحلیل داده (PDA)</div>
              <p className="text-xs text-slate-400">پروژه جامع دانشگاهی ترم ۶ • دسترسی به تمامی منابع و فایل‌ها</p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400">
            <button onClick={() => onSelectTab('dashboard')} className="hover:text-cyan-400 transition-colors">نقشه راه</button>
            <button onClick={() => onSelectTab('pdfs')} className="hover:text-rose-400 transition-colors">کتاب‌ها و جزوات (۱۱)</button>
            <button onClick={() => onSelectTab('scripts')} className="hover:text-emerald-400 transition-colors">کدهای پایتون (۳۳)</button>
            <button onClick={() => onSelectTab('notebooks')} className="hover:text-amber-400 transition-colors">نوت‌بوک‌ها (۴)</button>
            <button onClick={() => onSelectTab('datasets')} className="hover:text-purple-400 transition-colors">دیتاست‌ها (۲)</button>
            <button onClick={() => onSelectTab('about')} className="hover:text-slate-200 transition-colors">درباره دوره</button>
          </div>

          {/* Copyright badge */}
          <div className="text-xs text-slate-400 font-mono" dir="ltr">
            Python for Data Analysis • 2026
          </div>
        </div>
      </div>
    </footer>
  )
}
