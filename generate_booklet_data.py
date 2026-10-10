import os
import json

print("Compiling interactive booklet chapters data...")

with open('website/src/data/python_examples.json', 'r', encoding='utf-8') as f:
    scripts = json.load(f)

with open('website/src/data/notebooks.json', 'r', encoding='utf-8') as f:
    notebooks = json.load(f)

with open('website/src/data/datasets.json', 'r', encoding='utf-8') as f:
    datasets = json.load(f)

with open('website/src/data/quiz.json', 'r', encoding='utf-8') as f:
    quiz_questions = json.load(f)

# Helper to find scripts by chapter
def get_scripts_by_chapter(ch_id):
    return [s for s in scripts if s['chapterId'] == ch_id]

booklet_chapters = [
    {
        "id": "ch-intro",
        "num": "۰",
        "title": "مقدمه و مراجع درس پایتون برای تحلیل داده",
        "subtitle": "نقشه راه، ساختار دوره دانشگاهی ترم ۶ و معرفی کتب مرجع اصلی",
        "badge": "مراجع دوره",
        "color": "from-cyan-500 to-blue-600",
        "sections": [
            {
                "id": "sec-welcome",
                "title": "۱. درباره دوره و اهداف آموزشی",
                "content": """به جزوه آموزشی تعاملی درس «پایتون برای تحلیل داده (Python for Data Analysis)» خوش آمدید!
این جزوه به گونه‌ای طراحی شده است که شما بتوانید تمام مباحث ترم ۶ دانشگاه را از صفر به صورت گام‌به‌گام و مرتب مطالعه کنید. در کنار متن درس، تمام ۳۳ برنامه آموزشی، ۴ نوت‌بوک ژوپیتر و ۲ دیتاست واقعی با قابلیت اجرای زنده در IDE یکپارچه تعبیه شده‌اند.

🎯 **اهداف این دوره:**
• یادگیری اصولی پایتون ۳ و ساختارهای داده اصلی (لیست، تاپل، ست و دیکشنری)
• تسلط بر تعریف توابع ماژولار، متغیرهای متغیر و عبارات Lambda
• محاسبات ماتریسی سریع و برداری با کتابخانه NumPy
• تحلیل، دستکاری و پاکسازی داده‌ها (Data Cleaning) با کتابخانه قدرتمند Pandas
• مهندسی و کاوش داده روی دیتاست‌های واقعی جهان از جمله تایتانیک و آمار پرسنلی""",
                "type": "text"
            },
            {
                "id": "sec-refs",
                "title": "۲. کتب و مراجع رسمی تدریس‌شده (فایل‌های ۰۱ و ۰۲)",
                "content": """در این دوره از دو منبع استاندارد استفاده می‌شود:

📚 **کتاب اول: Python for Data Analysis (3rd Edition - 2022)**
تألیف: وس مک‌کینی (Wes McKinney - خالق پانداس)
این کتاب، مرجع جهانی علم داده با پایتون است. نسخه کامل این کتاب با حجم ۹.۱۵ مگابایت به صورت PDF در پرتال قرار گرفته است و تمامی سرفصل‌های نام‌پای و پانداس بر اساس فصول ۴ تا ۷ این کتاب تنظیم شده‌اند.

📚 **کتاب دوم: لیست کتب تکمیلی و راهنمای مراجع**
فایل `01-PDA_ReferenceBooks.pdf` که راهنمای مطالعه برای دانشجویان است.""",
                "type": "resource",
                "pdfLinks": [
                    {"name": "01-PDA_ReferenceBooks.pdf", "title": "فهرست مراجع درس", "size": "168 KB"},
                    {"name": "02-Python for Data Analysis_2022.pdf", "title": "کتاب اصلی وس مک‌کینی (PDF)", "size": "9.15 MB"}
                ]
            }
        ]
    },
    {
        "id": "ch-basics",
        "num": "۱",
        "title": "مبانی پایتون، ورودی/خروجی و دستورات شرطی",
        "subtitle": "متغیرها، عملگرها، تبدیل نوع، فرمت‌بندی f-string و ساختارهای تصمیم‌گیری",
        "badge": "فصل ۱ • پایه",
        "color": "from-emerald-500 to-teal-600",
        "sourcePdfs": ["03-booklet_PDA_Session1.pdf"],
        "sections": [
            {
                "id": "sec-syntax",
                "title": "۱. مفاهیم پایه، متغیرها و انواع داده (جزوه جلسه ۱)",
                "content": """در پایتون متغیرها بدون نیاز به تعیین نوع صریح تعریف می‌شوند (Dynamic Typing). 
دستور `input()` همواره خروجی را به صورت رشته (str) دریافت می‌کند، بنابراین برای انجام محاسبات ریاضی باید از توابع تبدیل نوع نظیر `int()` یا `float()` استفاده شود.

برای نمایش خروجی‌های زیبا و پیشرفته، بهترین و مدرن‌ترین روش استفاده از **f-string** است:
`print(f"مقدار: {x} | نتیجه: {s}")`""",
                "type": "text"
            },
            {
                "id": "sec-scripts-1",
                "title": "۲. نمونه کدهای عملی فصل ۱ (اسکریپت‌های ۱-۱ تا ۱-۹)",
                "content": "نمونه کدهای زیر را مطالعه کرده و با کلیک روی دکمه «⚡ ارسال به IDE»، آن‌ها را مستقیماً در کنسول تعاملی اجرا و دستکاری کنید:",
                "type": "scripts_group",
                "scripts": get_scripts_by_chapter("chapter-1")
            }
        ]
    },
    {
        "id": "ch-sequences",
        "num": "۲",
        "title": "ساختارهای توالی و داده‌های پیشرفته (Sequences)",
        "subtitle": "لیست‌ها (List)، تاپل‌ها (Tuple)، دیکشنری‌ها (Dictionary) و حلقه‌های تکرار",
        "badge": "فصل ۲ • توالی‌ها",
        "color": "from-blue-500 to-indigo-600",
        "sourcePdfs": ["04-Sequences_in_Python.pdf"],
        "sections": [
            {
                "id": "sec-seq-theory",
                "title": "۱. مقایسه انواع ساختارهای توالی در پایتون",
                "content": """چهار ساختمان داده اصلی توالی در پایتون عبارتند از:

۱. **لیست (List):** با `[]` تعریف می‌شود. تغییرپذیر (Mutable) است و عناصر می‌توانند اضافه یا حذف شوند.
۲. **تاپل (Tuple):** با `()` تعریف می‌شود. غیرقابل تغییر (Immutable) است و امنیت داده بالایی دارد.
۳. **دیکشنری (Dictionary):** با `{}` و به صورت کلید:مقدار تعریف می‌شود و دسترسی با کلید با پیچیدگی زمانی O(1) انجام می‌شود.
۴. **مجموعه (Set):** عناصر یکتا و بدون تکرار را ذخیره می‌کند.

حلقه‌های `for` و `while` به ما اجازه می‌دهند این ساختارها را پیمایش کرده، مقادیر ماکسیمم/مینیمم را پیدا کنیم و محاسبات تجمعی انجام دهیم.""",
                "type": "text"
            },
            {
                "id": "sec-scripts-2",
                "title": "۲. نمونه کدهای عملی فصل ۲ (اسکریپت‌های ۲-۱ تا ۲-۱۱)",
                "content": "الگوهای کاربردی کار با لیست‌ها، متدهای append، حذف، مجموع ارقام و بررسی رفتار ارجاع در حافظه:",
                "type": "scripts_group",
                "scripts": get_scripts_by_chapter("chapter-2")
            }
        ]
    },
    {
        "id": "ch-functions",
        "num": "۳",
        "title": "توابع، آرگومان‌ها، Lambda و ماژول‌ها",
        "subtitle": "تعریف توابع با def، پارامترهای نامحدود *args و **kwargs، بازگشت و ماژول m1.py",
        "badge": "فصل ۳ • توابع",
        "color": "from-amber-500 to-orange-600",
        "sourcePdfs": ["07-Function_Parameter_Argument.pdf"],
        "sections": [
            {
                "id": "sec-func-theory",
                "title": "۱. تئوری توابع و آرگومان‌های پیشرفته",
                "content": """توابع در پایتون با کلمه کلیدی `def` تعریف می‌شوند.
مفاهیم پیشرفته پارامترها عبارتند از:
• **Default Arguments:** مقادیری که در صورت عدم ارسال از سوی کاربر استفاده می‌شوند (`def f(x=10):`).
• **Positional Variable Arguments (*args):** دریافت تعداد دلخواه آرگومان موقعیتی به صورت تاپل (Tuple).
• **Keyword Variable Arguments (**kwargs):** دریافت تعداد دلخواه آرگومان نام‌دار به صورت دیکشنری (Dictionary).
• **توابع لامبدا (Lambda):** توابع تک‌خطی بدون نام (`lambda x: x ** 2`) برای محاسبات سریع و استفاده در `sort`.
• **ماژول‌ها:** ذخیره توابع در یک فایل مجزا (مانند `m1.py`) و فراخوانی با `import m1`.""",
                "type": "text"
            },
            {
                "id": "sec-scripts-3",
                "title": "۲. نمونه کدهای عملی فصل ۳ و ۴ (اسکریپت‌های ۳-۱ تا ۴-۵ و m1.py)",
                "content": "نمونه‌های عملی توابع، فاکتوریل بازگشتی، ماژول هندسی m1 و مرتب‌سازی با کلید تابع:",
                "type": "scripts_group",
                "scripts": get_scripts_by_chapter("chapter-3") + get_scripts_by_chapter("chapter-4")
            }
        ]
    },
    {
        "id": "ch-numpy",
        "num": "۴",
        "title": "محاسبات ماتریسی و علمی با NumPy",
        "subtitle": "آرایه‌های چندبعدی ndarray، ابعاد، ایندکس‌گذاری، برودکستینگ و آمار برداری",
        "badge": "فصل ۴ • نام‌پای",
        "color": "from-cyan-600 to-blue-700",
        "sourcePdfs": ["10-NumPy.pdf", "12-NumPy_TableOfContents.pdf"],
        "sections": [
            {
                "id": "sec-numpy-theory",
                "title": "۱. مقدمه و چرایی استفاده از NumPy",
                "content": """کتابخانه **NumPy (Numerical Python)** هسته مرکزی اکوسیستم تحلیل داده پایتون است.
مزایای اصلی نسبت به لیست‌های معمولی:
۱. سرعت فوق‌العاده بالا به دلیل پیاده‌سازی هسته با زبان C.
۲. همگن بودن داده‌ها (همه عناصر دارای یک `dtype` یکسان هستند).
۳. قابلیت **Vectorization** (محاسبات روی کل آرایه بدون نیاز به حلقه `for`).
۴. مشخصه **Broadcasting** (سازگار کردن خودکار ابعاد در عملیات ریاضی).

⚠️ **نکته بسیار مهم امتحانی درباره محورها (axis):**
• `axis=0`: عملیات در امتداد سطرها (به سمت پایین) روی هر ستون انجام می‌شود.
• `axis=1`: عملیات در امتداد ستون‌ها (به سمت افقی) روی هر سطر انجام می‌شود.""",
                "type": "text"
            },
            {
                "id": "sec-nb-11",
                "title": "۲. نوت‌بوک تمرینی نام‌پای ۱ (۳۲ سلول - ساخت آرایه‌ها و اسلایس)",
                "content": "سلول‌های آموزشی زیر مراحل ساخت آرایه‌ها، ابعاد shape و ndim، توابع arange و zeros و برش چندبعدی را آموزش می‌دهند:",
                "type": "notebook_embed",
                "notebookId": "nb-11"
            },
            {
                "id": "sec-nb-13",
                "title": "۳. نوت‌بوک تمرینی نام‌پای ۲ (۶۲ سلول - محاسبات برداری، آمار و برودکستینگ)",
                "content": "سلول‌های پیشرفته نام‌پای شامل اعمال ریاضی، پخش ماتریسی، reshape و توابع آماری sum، mean و ماسک بولین:",
                "type": "notebook_embed",
                "notebookId": "nb-13"
            }
        ]
    },
    {
        "id": "ch-pandas",
        "num": "۵",
        "title": "تحلیل، کاوش و مهندسی داده با Pandas",
        "subtitle": "ساختارهای Series و DataFrame، برش با loc و iloc، فیلترهای شرطی و توابع آماری",
        "badge": "فصل ۵ • پانداس",
        "color": "from-purple-600 to-indigo-700",
        "sourcePdfs": ["14-Pandas_TableOfContents.pdf", "17-Pandas_Titles_1.pdf"],
        "sections": [
            {
                "id": "sec-pandas-theory",
                "title": "۱. ساختارهای داده Series و DataFrame",
                "content": """کتابخانه Pandas دارای دو ساختار داده بنیادی است:
• **Series:** یک آرایه یک‌بعدی برچسب‌دار (Labelled 1D Array).
• **DataFrame:** یک جدول داده دوبعدی با سطرها و ستون‌های نام‌دار.

🔍 **تفاوت حیاتی loc در برابر iloc:**
• `df.loc[row_label, col_label]`: بر اساس **نام و برچسب** سطر و ستون کار می‌کند و انتهای بازه inclusive است.
• `df.iloc[row_idx, col_idx]`: بر اساس **موقعیت عددی** کار می‌کند و انتهای بازه exclusive است (مانند برش‌های پایتون).""",
                "type": "text"
            },
            {
                "id": "sec-nb-15",
                "title": "۲. نوت‌بوک تمرینی پانداس ۱ (۷۷ سلول آموزشی و ۲۳ خروجی جدول دیتافریم)",
                "content": "مطالعه گام‌به‌گام نحوه ایجاد Series، DataFrame، متدهای head و info، انتخاب ستون‌ها و فیلترینگ شرطی:",
                "type": "notebook_embed",
                "notebookId": "nb-15"
            }
        ]
    },
    {
        "id": "ch-projects",
        "num": "۶",
        "title": "کار با دیتاست‌های واقعی و پروژه‌ها (Employees & Titanic)",
        "subtitle": "پاکسازی مقادیر گمشده (NaN)، گروه‌بندی (groupby)، جداول تعاملی و تحلیل نرخ بقا",
        "badge": "فصل ۶ • پروژه‌ها",
        "color": "from-rose-600 to-pink-700",
        "sourcePdfs": ["19-Pandas_Titles(Employees).pdf", "20-Pandas_Titles(titanic).pdf"],
        "sections": [
            {
                "id": "sec-cleaning-theory",
                "title": "۱. مفاهیم پاکسازی داده‌ها (Handling Missing Values)",
                "content": """در دنیای واقعی داده‌ها همیشه تمیز نیستند!
در دیتاست کارکنان (`16-Employees.csv`) مقادیری به شکل `?` و `-` وجود دارند. برای حل این مشکل:
`df = pd.read_csv('Employees.csv', na_values=['?', '-'])`

متدهای کلیدی مدیریت داده‌های گمشده:
• `df.isnull().sum()`: شمارش تعداد مقادیر خالی در هر ستون.
• `df.dropna(how='all')`: حذف سطرهایی که تمام ستون‌های آنها تهی است.
• `df['Age'].fillna(df['Age'].mean())`: جایگزینی مقادیر خالی با میانگین کل.""",
                "type": "text"
            },
            {
                "id": "sec-nb-18",
                "title": "۲. نوت‌بوک تمرینی پانداس ۲ (۴۷ سلول تحلیلی و ۲۸ جدول خروجی)",
                "content": "تحلیل کاربردی دو دیتاست Employees و Titanic به همراه توابع groupby و محاسبات تجمیعی:",
                "type": "notebook_embed",
                "notebookId": "nb-18"
            },
            {
                "id": "sec-dataset-explorer",
                "title": "۳. کاوشگر تعاملی دیتاست‌ها و نمودارهای بصری",
                "content": "جداول زیر داده‌های کامل و آمار هر دو دیتاست را با قابلیت جستجو، سورت و صفحه‌بندی نشان می‌دهند:",
                "type": "datasets_interactive"
            }
        ]
    },
    {
        "id": "ch-quiz",
        "num": "۷",
        "title": "خودآزمایی و جمع‌بندی نهایی درس (PDA Quiz)",
        "subtitle": "سنجش تسلط بر کلیه مباحث با سوالات استاندارد آزمون دانشگاه و پاسخ تشریحی",
        "badge": "فصل ۷ • آزمون",
        "color": "from-purple-500 to-violet-600",
        "sections": [
            {
                "id": "sec-quiz-hub",
                "title": "آزمون سنجش مهارت ۸ سوالی",
                "content": "با پاسخ به این سوالات، آمادگی خود را برای امتحان پایان‌ترم بسنجید:",
                "type": "quiz_embed"
            }
        ]
    }
]

out_path = os.path.join("website", "src", "data", "booklet_chapters.json")
with open(out_path, 'w', encoding='utf-8') as f:
    json.dump(booklet_chapters, f, ensure_ascii=False, indent=2)

print("Generated booklet_chapters.json with", len(booklet_chapters), "chapters!")
