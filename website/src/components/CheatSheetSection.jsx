import React, { useState } from 'react'
import { FileCode2, Copy, Check, Search, BookMarked, Sparkles, AlertCircle, ArrowUpRight } from 'lucide-react'

export default function CheatSheetSection() {
  const [activeCategory, setActiveCategory] = useState('pandas')
  const [searchTerm, setSearchTerm] = useState('')
  const [copiedIndex, setCopiedIndex] = useState(null)

  const cheatSheets = {
    pandas: {
      title: 'جعبه‌ابزار و متدهای پرتکرار Pandas',
      desc: 'فرمول‌ها، متدها و الگوهای کلیدی کار با Series، DataFrame، پاکسازی داده و گروه‌بندی',
      items: [
        {
          title: 'خواندن فایل CSV با مدیریت مقادیر گمشده',
          code: `import pandas as pd\nmissing_vals = ['?', '-', 'NA', '']\ndf = pd.read_csv('Employees.csv', na_values=missing_vals)`,
          note: 'نکته امتحانی: آرگومان na_values مقادیر نامعتبر دلخواه را به NaN تبدیل می‌کند.',
          tag: 'خواندن فایل'
        },
        {
          title: 'تفاوت اساسی loc (اسمی) در برابر iloc (موقعیتی)',
          code: `# loc با برچسب و نام ستون (انتهای بازه inclusive است)\ndf.loc[0:5, ['Age', 'Salary']]\n\n# iloc با اندیس عددی سطر و ستون (انتهای بازه exclusive است)\ndf.iloc[0:5, [4, 9]]`,
          note: 'در loc بازه 0:5 شامل سطر پنجم هم می‌شود، اما در iloc سطر پنجم مشمول نمی‌شود.',
          tag: 'ایندکس‌گذاری'
        },
        {
          title: 'فیلتر شرطی چندگانه (AND و OR)',
          code: `# شرط AND با علامت &\ndf[(df['Age'] > 30) & (df['City'] == 'tehran')]\n\n# شرط OR با علامت |\ndf[(df['Degree'] == 'Master') | (df['Degree'] == 'PhD')]`,
          note: 'همیشه شروط را در پرانتز قرار دهید تا عملگرهای بیتی دچار خطای تقدم نشوند.',
          tag: 'فیلترینگ'
        },
        {
          title: 'مدیریت داده‌های گمشده: dropna و fillna',
          code: `# حذف سطرهایی که همه ستون‌های آن NaN هستند\ndf.dropna(how='all', inplace=True)\n\n# پر کردن مقادیر گمشده ستون سن با میانگین کل\nmean_age = df['Age'].mean()\ndf['Age'].fillna(mean_age, inplace=True)`,
          note: 'استفاده از inplace=True تغییرات را مستقیماً روی دیتافریم اصلی ذخیره می‌کند.',
          tag: 'پاکسازی داده'
        },
        {
          title: 'گروه‌بندی چندمتغیره و توابع تجمیعی (groupby & agg)',
          code: `# گروه‌بندی بر اساس دو ستون و محاسبه آمار چندگانه\ndf.groupby(['Gender', 'Degree'])['Salary'].agg(['count', 'min', 'max', 'mean'])`,
          note: 'متد agg امکان محاسبه همزمان چند شاخص آماری را روی یک گروه فراهم می‌سازد.',
          tag: 'تحلیل داده'
        },
        {
          title: 'شمارش مقادیر یکتا و درصد فراوانی',
          code: `# تعداد دفعات تکرار هر مقدار\ndf['Sex'].value_counts()\n\n# درصد فراوانی هر مقدار (نرمال‌شده)\ndf['Survived'].value_counts(normalize=True) * 100`,
          note: 'بهترین راه برای به دست آوردن سریع نرخ درصد بقا در تایتانیک.',
          tag: 'آمار توصیفی'
        }
      ]
    },
    numpy: {
      title: 'جعبه‌ابزار و متدهای پرکاربرد NumPy',
      desc: 'ساخت آرایه‌ها، ویژگی‌های ابعادی، برودکستینگ، محاسبات برداری و توابع ufunc',
      items: [
        {
          title: 'ساخت آرایه از لیست و ماتریس همانی',
          code: `import numpy as np\narr1 = np.array([10, 20, 30])\narr2d = np.array([[1, 2, 3], [4, 5, 6]])\neye_mat = np.eye(3) # ماتریس همانی ۳x۳`,
          note: 'آرایه‌های نام‌پای برخلاف لیست‌های پایتون همگن بوده و مصرف حافظه بسیار کمتری دارند.',
          tag: 'ساخت آرایه'
        },
        {
          title: 'توابع تولید دنباله: arange در برابر linspace',
          code: `# با گام افزایشی مشخص (step = 2)\narr_range = np.arange(0, 10, 2) # [0, 2, 4, 6, 8]\n\n# با تعداد نقاط مشخص (۵ نقطه با فواصل مساوی)\narr_lin = np.linspace(0, 1, 5) # [0.0, 0.25, 0.5, 0.75, 1.0]`,
          note: 'در linspace نقطه پایانی همیشه داخل بازه قرار دارد، اما در arange انتهای بازه حذف می‌شود.',
          tag: 'دنباله‌ها'
        },
        {
          title: 'بررسی ابعاد و تغییر شکل آرایه‌ها (shape & reshape)',
          code: `arr = np.arange(12) # ۱۲ عضو تک‌بعدی\nmatrix = arr.reshape(3, 4) # ماتریس ۳ سطر و ۴ ستون\n\nprint("ابعاد:", matrix.shape) # (3, 4)\nprint("تعداد بعد:", matrix.ndim) # 2`,
          note: 'حاصل‌ضرب ابعاد جدید حتماً باید دقیقاً برابر با تعداد عناصر اولیه باشد.',
          tag: 'ابعاد'
        },
        {
          title: 'مفهوم حیاتی axis=0 و axis=1 در محاسبات آماری',
          code: `# محاسبه مجموع عمودی (روی هر ستون)\ncol_sums = matrix.sum(axis=0)\n\n# محاسبه مجموع افقی (روی هر سطر)\nrow_sums = matrix.sum(axis=1)\n\n# میانگین کل آرایه\ntotal_mean = matrix.mean()`,
          note: 'تله امتحانی: در axis=0 بعد سطرها فشرده می‌شود؛ یعنی حاصل برای هر ستون به دست می‌آید.',
          tag: 'محاسبات برداری'
        },
        {
          title: 'بریدن پیشرفته و ماسک بولین (Boolean Masking)',
          code: `arr = np.array([12, 45, 7, 23, 90, 3])\n\n# ایجاد شرط بولین\nmask = arr > 20\n\n# استخراج المان‌های بزرگتر از ۲۰\nfiltered = arr[mask] # [45, 23, 90]`,
          note: 'ماسک‌های بولین سریع‌ترین روش فیلتر کردن مقادیر بدون استفاده از حلقه هستند.',
          tag: 'فیلترینگ'
        }
      ]
    },
    python: {
      title: 'جعبه‌ابزار مفاهیم پایه و توابع پایتون',
      desc: 'فرمت رشته‌ها، ساختارهای توالی، توابع با آرگومان‌های نامحدود و ماژول‌ها',
      items: [
        {
          title: 'فرمت‌بندی پیشرفته با f-string',
          code: `name = "Ali"\nsalary = 4500.5\nprint(f"Name: {name} | Salary: {salary:,.2f}") # جداکننده هزارگان و ۲ رقم اعشار`,
          note: 'در پایتون ۳ بهترین روش چاپ مقادیر با جداکننده و فرمت عددی f-string است.',
          tag: 'سینتکس'
        },
        {
          title: 'آرگومان‌های نامحدود *args و **kwargs در توابع',
          code: `def calculate_stats(*args, **kwargs):\n    total = sum(args)\n    title = kwargs.get('title', 'Unknown')\n    return f"{title}: {total}"\n\nprint(calculate_stats(10, 20, 30, title="Course Scores"))`,
          note: '*args به عنوان تاپل و **kwargs به صورت دیکشنری کلید-مقدار دریافت می‌شوند.',
          tag: 'توابع'
        },
        {
          title: 'توابع ناشناس Lambda و مرتب‌سازی سفارشی',
          code: `# تابع تک‌خطی توان دو\nsquare = lambda x: x ** 2\n\n# مرتب‌سازی لیست کلمات بر اساس طول کلمه\nwords = ['apple', 'cat', 'banana', 'kiwi']\nwords.sort(key=lambda w: len(w))\nprint(words) # ['cat', 'kiwi', 'apple', 'banana']`,
          note: 'لامبداها به عنوان پارامتر ورودی برای توابع sort و map بسیار محبوب هستند.',
          tag: 'لامبدا'
        },
        {
          title: 'ایجاد و استفاده از ماژول اختصاصی (الگوی m1.py)',
          code: `# در فایل m1.py:\ndef rectangle(a, b):\n    return a * b\n\n# در فایل اصلی:\nimport m1\nres = m1.rectangle(4, 8)`,
          note: 'ساختار ماژولار امکان تفکیک وظایف و سازماندهی کدهای بزرگ را فراهم می‌آورد.',
          tag: 'ماژول‌ها'
        }
      ]
    }
  }

  const currentSheet = cheatSheets[activeCategory]

  const handleCopy = (code, index) => {
    navigator.clipboard.writeText(code)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const filteredItems = currentSheet.items.filter(item => {
    if (!searchTerm) return true
    const term = searchTerm.toLowerCase()
    return item.title.toLowerCase().includes(term) ||
           item.code.toLowerCase().includes(term) ||
           item.note.toLowerCase().includes(term) ||
           item.tag.toLowerCase().includes(term)
  })

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-cyan-400" />
            <span>جعبه‌ابزار و برگه تقلب سریع درس (Cheat Sheet & Snippets)</span>
          </h2>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            مجموعه کامل مهم‌ترین متدها، توابع پرکاربرد، الگوهای کدی و تله‌های امتحانی با قابلیت کپی سریع
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="جستجوی فرمول یا متد..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pr-9 pl-4 py-2 text-xs md:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => { setActiveCategory('pandas'); setSearchTerm('') }}
          className={`px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all ${
            activeCategory === 'pandas'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          🐼 جعبه‌ابزار Pandas
        </button>

        <button
          onClick={() => { setActiveCategory('numpy'); setSearchTerm('') }}
          className={`px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all ${
            activeCategory === 'numpy'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          🔢 جعبه‌ابزار NumPy
        </button>

        <button
          onClick={() => { setActiveCategory('python'); setSearchTerm('') }}
          className={`px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all ${
            activeCategory === 'python'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          🐍 پایتون پایه و توابع
        </button>
      </div>

      {/* Grid of Cheat Sheet Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredItems.map((item, idx) => {
          const isCopied = copiedIndex === idx

          return (
            <div
              key={idx}
              className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-3.5 shadow-lg flex flex-col justify-between"
            >
              <div>
                {/* Title & Tag */}
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold text-white leading-snug">
                    {item.title}
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    {item.tag}
                  </span>
                </div>

                {/* Code Block */}
                <div className="relative rounded-xl bg-slate-950 border border-slate-800/80 p-3.5 font-mono text-xs overflow-x-auto text-cyan-300" dir="ltr">
                  <pre className="leading-relaxed whitespace-pre-wrap">{item.code}</pre>
                  <button
                    onClick={() => handleCopy(item.code, idx)}
                    className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
                    title="کپی قطعه‌کد"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Note / Exam Tip */}
              <div className="pt-2 border-t border-slate-800 flex items-start gap-2 text-xs text-slate-400">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{item.note}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
