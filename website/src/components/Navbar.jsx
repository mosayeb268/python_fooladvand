import React from 'react'
import { BookOpen, Code2, Database, FileText, Search, Sun, Moon, Sparkles, HelpCircle, BookMarked, FileSpreadsheet } from 'lucide-react'

export default function Navbar({ activeTab, setActiveTab, onOpenSearch, isDarkMode, setIsDarkMode }) {
  const navItems = [
    { id: 'a4booklet', label: '📄 جزوه کامل A4 + محیط تعاملی', icon: FileSpreadsheet, isPrimary: true },
    { id: 'dashboard', label: 'داشبورد و نقشه راه', icon: Sparkles },
    { id: 'cheatsheet', label: 'جعبه‌ابزار و تقلب', icon: BookMarked },
    { id: 'pdfs', label: 'کتاب‌ها و جزوات', icon: FileText, count: 11 },
    { id: 'scripts', label: 'کدهای پایتون', icon: Code2, count: 33 },
    { id: 'notebooks', label: 'نوت‌بوک‌ها', icon: BookOpen, count: 4 },
    { id: 'datasets', label: 'دیتاست‌ها', icon: Database, count: 2 },
    { id: 'quiz', label: 'خودآزمایی', icon: HelpCircle, count: 8 },
  ]

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-slate-950/90 border-b border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-3 cursor-pointer shrink-0" onClick={() => setActiveTab('a4booklet')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white font-bold text-xl">
              🐍
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base md:text-lg text-white tracking-tight">PDA Course</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-medium">ترم ۶</span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">پایتون برای تحلیل داده (Python for Data Analysis)</p>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden xl:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    item.isPrimary && !isActive
                      ? 'bg-orange-600/20 text-orange-400 border border-orange-500/30 font-bold hover:bg-orange-600/30'
                      : isActive
                        ? 'bg-orange-600 text-white font-bold shadow-md shadow-orange-600/30'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                  {item.count && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isActive ? 'bg-orange-800 text-white' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {item.count}
                    </span>
                  )}
                </button>
              )
            })}
          </nav>

          {/* Action buttons (Search & Theme) */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenSearch}
              className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-400 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-lg transition-all"
              title="جستجوی سریع در کل فایل‌ها"
            >
              <Search className="w-4 h-4 text-slate-400" />
              <span className="hidden sm:inline">جستجو...</span>
              <kbd className="hidden sm:inline text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700">Ctrl+K</kbd>
            </button>

            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 text-slate-400 hover:text-slate-100 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-all"
              title={isDarkMode ? 'روشن‌سازی تم' : 'تیره‌سازی تم'}
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-400" />}
            </button>
          </div>

        </div>

        {/* Mobile / Tablet Navigation bar */}
        <div className="flex xl:hidden overflow-x-auto py-2 gap-1 border-t border-slate-900 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-orange-600 text-white font-bold'
                    : 'text-slate-400 hover:text-white bg-slate-900/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            )
          })}
        </div>

      </div>
    </header>
  )
}
