import React from 'react'
import { BookOpen, GraduationCap, Download, Terminal } from 'lucide-react'

export default function AboutSection({ onOpenPdf: _onOpenPdf }) {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Hero Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-blue-900/40 via-slate-900 to-cyan-900/40 border border-slate-800 p-6 md:p-10 shadow-2xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold mb-4">
          <GraduationCap className="w-4 h-4" />
          <span>راهنمای جامع دوره دانشگاهی</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-white leading-tight">
          درس پایتون برای تحلیل داده (Python for Data Analysis)
        </h2>
        <p className="mt-3 text-slate-300 text-sm md:text-base leading-relaxed">
          این پرتال وب به عنوان آرشیو کامل و محیط تعاملی یادگیری برای تمامی منابع و فایل‌های پروژه طراحی شده است. تمام ۲۱ آیتم آموزشی شامل کتب مرجع، جزوات کلاسی، ۳۳ اسکریپت پایتون، ۴ نوت‌بوک ژوپیتر و دیتاست‌های عملیاتی به صورت یکپارچه در دسترس شماست.
        </p>
      </div>

      {/* Course Syllabus & Roadmap */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-6">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-cyan-400" />
          <span>سرفصل‌ها و محورهای آموزشی دوره</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <h4 className="text-sm font-bold text-cyan-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              <span>فاز ۱: مبانی پایتون و ساختارهای توالی</span>
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              آشنایی با متغیرها، عملگرها، ورودی و خروجی با input و print، عبارات شرطی، ساختارهای List، Tuple، Set و Dictionary به همراه ۹ نمونه کد تمرینی و جزوات آموزشی.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <h4 className="text-sm font-bold text-emerald-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>فاز ۲: توابع، Lambda و ماژول‌ها</span>
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              طراحی توابع با def، انواع پارامترها و آرگومان‌ها (*args و **kwargs)، توابع بازگشتی، توابع لامبدا و ساخت ماژول‌های اختصاصی (m1.py) با ۱۸ نمونه کد پایتون.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <h4 className="text-sm font-bold text-amber-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <span>فاز ۳: محاسبات علمی با NumPy</span>
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              کار با ساختار ndarray، ابعاد، انواع داده‌ها، برش پیشرفته، محاسبات برداری، رندرسازی اعمال ماتریسی، Broadcasting و توابع آماری سریع در ۲ نوت‌بوک و جزوه تخصصی.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <h4 className="text-sm font-bold text-purple-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-400"></span>
              <span>فاز ۴: تحلیل و کاوش داده با Pandas</span>
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              تحلیل عمیق سری‌ها و دیتافریم‌ها، ایندکس‌گذاری با loc و iloc، مدیریت مقادیر گمشده (Missing Values)، گروه‌بندی (GroupBy) و تحلیل پروژه تایتانیک و کارکنان در ۲ نوت‌بوک.
            </p>
          </div>
        </div>
      </div>

      {/* How to run locally instructions */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Terminal className="w-5 h-5 text-emerald-400" />
          <span>راهنمای اجرای کدهای دوره در سیستم شخصی</span>
        </h3>

        <div className="space-y-3 text-xs md:text-sm text-slate-300 leading-relaxed">
          <p>
            برای اجرای نوت‌بوک‌ها و اسکریپت‌ها در سیستم خود، می‌توانید از نرم‌افزار <strong>VS Code</strong> به همراه اکستنشن Jupyter یا محیط <strong>JupyterLab</strong> استفاده کنید:
          </p>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-emerald-400 space-y-2" dir="ltr">
            <div># ۱. نصب کتابخانه‌های مورد نیاز پایتون:</div>
            <div>pip install numpy pandas matplotlib jupyter</div>
            <div className="pt-2"># ۲. اجرای محیط ژوپیتر لب:</div>
            <div>jupyter lab</div>
          </div>
        </div>
      </div>

      {/* Main Reference Book highlight */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold">
            کتاب مرجع اصلی
          </span>
          <h4 className="text-base font-bold text-white">Python for Data Analysis (3rd Edition - 2022)</h4>
          <p className="text-xs text-slate-400 max-w-xl">
            نوشته وس مک‌کینی (خالق پانداس). نسخه کامل PDF این کتاب به حجم ۹.۱۵ مگابایت در پرتال بارگذاری شده و به طور مستقیم قابل مشاهده و دانلود است.
          </p>
        </div>

        <a
          href="/pdfs/02-Python for Data Analysis_2022.pdf"
          download="02-Python for Data Analysis_2022.pdf"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs md:text-sm font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30 transition-all shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>دانلود کتاب مک‌کینی (PDF)</span>
        </a>
      </div>
    </div>
  )
}
