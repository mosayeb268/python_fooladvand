import os
import json
import csv
import glob
import subprocess
import sys

print("Generating enhanced and coherent course data...")

# 1. PDFs Metadata with Cross-references (relatedItems)
pdfs_meta = [
    {
        "id": "pdf-01",
        "order": 1,
        "filename": "01-PDA_ReferenceBooks.pdf",
        "title": "کتاب‌ها و مراجع درس پایتون برای تحلیل داده",
        "category": "منابع و مراجع",
        "description": "فهرست و معرفی کتاب‌های معتبر و مراجع رسمی درس تحلیل داده با پایتون (PDA)، سرفصل‌های مطالعاتی و کتب پیشنهادی جهت تعمیق یادگیری.",
        "topics": ["مراجع معتبر پایتون", "کتاب‌های تحلیل داده", "منابع Pandas و NumPy", "نقشه یادگیری PDA"],
        "sizeFormatted": "168 KB",
        "badge": "مرجع",
        "relatedItems": ["02-Python for Data Analysis_2022.pdf", "03-booklet_PDA_Session1.pdf"]
    },
    {
        "id": "pdf-02",
        "order": 2,
        "filename": "02-Python for Data Analysis_2022.pdf",
        "title": "کتاب مرجع اصلی: Python for Data Analysis (3rd Edition)",
        "category": "کتاب اصلی",
        "description": "کتاب مرجع اصلی درس تألیف وس مک‌کینی (خالق و توسعه‌دهنده اصلی کتابخانه Pandas)، چاپ ۲۰۲۲ ویرایش سوم. شامل آموزش کامل کار با NumPy، Pandas و مصورسازی داده.",
        "topics": ["Wes McKinney", "Pandas Core Concepts", "NumPy Essentials", "Data Wrangling", "Time Series Analysis"],
        "sizeFormatted": "9.15 MB",
        "badge": "کتاب رفرنس",
        "relatedItems": ["10-NumPy.pdf", "14-Pandas_TableOfContents.pdf", "15-pandas_1.ipynb", "18-pandas_2.ipynb"]
    },
    {
        "id": "pdf-03",
        "order": 3,
        "filename": "03-booklet_PDA_Session1.pdf",
        "title": "جزوه جلسه اول: مفاهیم پایه و مقدمات پایتون",
        "category": "جزوه کلاسی",
        "description": "یادداشت‌ها و جزوه آموزشی جلسه نخست دوره: آشنایی با محیط پایتون، متغیرها، انواع داده‌ها، عملگرهای محاسباتی و منطقی و سینتکس پایه.",
        "topics": ["مقدمات پایتون", "تعریف متغیرها", "عملگرهای ریاضی و منطقی", "دستورات خروجی و ورودی"],
        "sizeFormatted": "158 KB",
        "badge": "جلسه ۱",
        "relatedItems": ["05-Examples_Python_1", "04-Sequences_in_Python.pdf"]
    },
    {
        "id": "pdf-04",
        "order": 4,
        "filename": "04-Sequences_in_Python.pdf",
        "title": "جزوه ساختارهای توالی در پایتون (Sequences)",
        "category": "مفاهیم زبان پایتون",
        "description": "بررسی جامع ساختمان‌داده‌های توالی و مجموعه‌ای در پایتون شامل لیست‌ها (List)، تاپل‌ها (Tuple)، رشته‌ها (String)، مجموعه‌ها (Set) و دیکشنری‌ها (Dictionary).",
        "topics": ["لیست‌ها (List)", "تاپل‌ها (Tuple)", "دیکشنری‌ها (Dict)", "مجموعه‌ها (Set)", "برش و ایندکس‌گذاری (Slicing)"],
        "sizeFormatted": "139 KB",
        "badge": "ساختارهای داده",
        "relatedItems": ["06-Examples_Python_2", "07-Function_Parameter_Argument.pdf"]
    },
    {
        "id": "pdf-07",
        "order": 7,
        "filename": "07-Function_Parameter_Argument.pdf",
        "title": "جزوه توابع، پارامترها و آرگومان‌ها در پایتون",
        "category": "مفاهیم زبان پایتون",
        "description": "آموزش دقیق ساختار توابع در پایتون، انواع پارامترها (موقعیتی، کلیدواژه‌ای، پیش‌فرض)، ارسال آرگومان‌های متغیر (*args و **kwargs) و برگرداندن مقادیر.",
        "topics": ["تعریف توابع با def", "Default Parameters", "Keyword Arguments", "*args و **kwargs", "Scope و حوزه متغیرها"],
        "sizeFormatted": "261 KB",
        "badge": "توابع",
        "relatedItems": ["08-Examples_Python_3", "09-Examples_Python_4"]
    },
    {
        "id": "pdf-10",
        "order": 10,
        "filename": "10-NumPy.pdf",
        "title": "جزوه جامع کتابخانه نام‌پای (NumPy)",
        "category": "کتابخانه‌های تحلیل داده",
        "description": "آموزش کامل محاسبات علمی با NumPy، کار با آرایه‌های چندبعدی (ndarray)، اعمال برداری، اعمال ماتریسی، ابعاد و توابع ریاضی با سرعت بالا.",
        "topics": ["ساختار ndarray", "اعمال برداری (Vectorization)", "اعمال ریاضی و ماتریسی", "برش و فیلترینگ آرایه"],
        "sizeFormatted": "420 KB",
        "badge": "NumPy",
        "relatedItems": ["11-numpy_1.ipynb", "12-NumPy_TableOfContents.pdf", "13-numpy_2.ipynb"]
    },
    {
        "id": "pdf-12",
        "order": 12,
        "filename": "12-NumPy_TableOfContents.pdf",
        "title": "فهرست و سرفصل‌های مباحث نام‌پای (NumPy TOC)",
        "category": "سرفصل‌ها",
        "description": "فهرست مدون و سرفصل‌های موضوعی تدریس‌شده در بخش کتابخانه نام‌پای به همراه ساختار تمرینات و مباحث تخصصی.",
        "topics": ["سرفصل‌های نام‌پای", "توابع پرکاربرد np", "تغییر شکل و ابعاد (Reshape)", "محاسبات تجمعی"],
        "sizeFormatted": "177 KB",
        "badge": "سرفصل",
        "relatedItems": ["10-NumPy.pdf", "11-numpy_1.ipynb", "13-numpy_2.ipynb"]
    },
    {
        "id": "pdf-14",
        "order": 14,
        "filename": "14-Pandas_TableOfContents.pdf",
        "title": "فهرست و سرفصل‌های کتابخانه پانداس (Pandas TOC)",
        "category": "سرفصل‌ها",
        "description": "چارت و فهرست تفصیلی مباحث تدریس‌شده در بخش کتابخانه پانداس شامل ساختارهای داده Series و DataFrame، پاکسازی داده و تجمیع اطلاعات.",
        "topics": ["ساختار Series", "ساختار DataFrame", "روش‌های ایندکس‌گذاری (loc, iloc)", "فیلترینگ داده‌ها"],
        "sizeFormatted": "390 KB",
        "badge": "سرفصل",
        "relatedItems": ["15-pandas_1.ipynb", "17-Pandas_Titles_1.pdf", "18-pandas_2.ipynb"]
    },
    {
        "id": "pdf-17",
        "order": 17,
        "filename": "17-Pandas_Titles_1.pdf",
        "title": "عناوین و تمرینات بخش اول پانداس (Pandas Titles 1)",
        "category": "تمرینات کلاسی",
        "description": "مسائل و تمرینات دسته‌بندی‌شده پیرامون کار با دیتافریم‌های پانداس، متدهای جستجو، شرط‌گذاری و فیلتر کردن ردیف‌ها و ستون‌ها.",
        "topics": ["تمرینات پایه‌ای پانداس", "کار با ستون‌ها", "فیلترینگ شرطی", "متدهای آماری توصیفی"],
        "sizeFormatted": "144 KB",
        "badge": "تمرینات ۱",
        "relatedItems": ["15-pandas_1.ipynb", "16-Employees.csv"]
    },
    {
        "id": "pdf-19",
        "order": 19,
        "filename": "19-Pandas_Titles(Employees).pdf",
        "title": "عناوین تمرینات پانداس با دیتاست کارکنان (Employees)",
        "category": "پروژه‌های کاربردی",
        "description": "مجموعه پرسش‌ها و سوالات تحلیلی روی دیتاست کارمندان (Employees.csv) جهت بررسی حقوق، شهر، سابقه، تخصص، و سن افراد با کدهای پانداس.",
        "topics": ["تحلیل دیتاست Employees", "گروه‌بندی حقوق و دستمزد", "مدیریت مقادیر گمشده (NaN)", "تحلیل‌های تجمیعی"],
        "sizeFormatted": "153 KB",
        "badge": "دیتاست Employees",
        "relatedItems": ["16-Employees.csv", "18-pandas_2.ipynb"]
    },
    {
        "id": "pdf-20",
        "order": 20,
        "filename": "20-Pandas_Titles(titanic).pdf",
        "title": "عناوین تمرینات و تحلیل پیشرفته پانداس با دیتاست تایتانیک (Titanic)",
        "category": "پروژه‌های کاربردی",
        "description": "صورت مسائل و سوالات تحلیلی دنیای واقعی روی دیتاست مشهور تایتانیک (titanic.csv) شامل نرخ بقا، دسته‌بندی بر اساس کلاس بلیت، سن، جنسیت و کرایه.",
        "topics": ["تحلیل بقای مسافران Titanic", "گروه‌بندی با groupby", "محاسبه درصدها و میانگین‌ها", "تمیزسازی و بازتولید ویژگی‌ها"],
        "sizeFormatted": "165 KB",
        "badge": "دیتاست Titanic",
        "relatedItems": ["21-titanic.csv", "18-pandas_2.ipynb"]
    }
]

# 2. Python Script Examples with Real Outputs & Descriptions
python_chapters = [
    {
        "folder": "05-Examples_Python_1",
        "id": "chapter-1",
        "order": 5,
        "title": "فصل ۱: ورودی/خروجی، محاسبات و عبارات شرطی",
        "desc": "نمونه کدهای پایه‌ای شامل دریافت ورودی با input، فرمت‌بندی خروجی با f-string، محاسبات هندسی، شرط‌های if-elif-else."
    },
    {
        "folder": "06-Examples_Python_2",
        "id": "chapter-2",
        "order": 6,
        "title": "فصل ۲: لیست‌ها، حلقه‌ها و ساختارهای داده",
        "desc": "الگوهای کاربردی کار با حلقه‌های for و while، کار با لیست‌ها، تاپل‌ها، دیکشنری‌ها، پیدا کردن ماکسیمم، مجموع ارقام و ارجاع شیء."
    },
    {
        "folder": "08-Examples_Python_3",
        "id": "chapter-3",
        "order": 8,
        "title": "فصل ۳: توابع، آرگومان‌های پیشرفته و Lambda",
        "desc": "تعریف توابع اختصاصی، انواع شیوه ارسال پارامترها (*args و **kwargs)، محاسبه BMI، سرعت و توابع لامبدا."
    },
    {
        "folder": "09-Examples_Python_4",
        "id": "chapter-4",
        "order": 9,
        "title": "فصل ۴: ماژول‌ها و الگوهای پیشرفته پایتون",
        "desc": "طراحی و واردسازی ماژول اختصاصی m1.py، توابع بازگشتی (فاکتوریل)، مرتب‌سازی بر اساس طول کلمه و حوزه متغیرها."
    }
]

example_details = {
    "1-1.py": {
        "desc": "دریافت دو عدد از کاربر و نمایش حاصل‌جمع با ساختار f-string و جداکننده‌های سفارشی",
        "inputs": "x=15, y=25",
        "expectedOut": "x=15 @@@ y=25 @@@ x+y=40"
    },
    "1-2.py": {
        "desc": "محاسبه مساحت و محیط دایره با دریافت شعاع با استفاده از عدد پی در کتابخانه math",
        "inputs": "r=15",
        "expectedOut": "Masahat=706.8583470577034 , Mohit=94.24777960769379"
    },
    "1-3.py": {
        "desc": "دریافت عدد صحیح و چاپ مقدار آن در خروجی",
        "inputs": "x=15",
        "expectedOut": "x=15"
    },
    "1-4.py": {
        "desc": "تشخیص زوج یا فرد بودن عدد ورودی با عملگر باقیمانده (%) و ساختار شرطی if-else",
        "inputs": "x=15",
        "expectedOut": "Adad 15 *fard* ast."
    },
    "1-5.py": {
        "desc": "ماشین‌حساب ساده ۴ عمل اصلی (+, -, *, /) با دریافت دو عدد و عملگر",
        "inputs": "x=15, y=25, op=+",
        "expectedOut": "15 + 25 = 40"
    },
    "1-6.py": {
        "desc": "بررسی علامت عدد ورودی (نامنفی Non-Negative یا منفی)",
        "inputs": "x=15",
        "expectedOut": "Non-Negative"
    },
    "1-7.py": {
        "desc": "شمارش تعداد ارقام موجود در یک رشته متنی ورودی با پیمایش کاراکترها",
        "inputs": "text='Test 123'",
        "expectedOut": "Tedad Argham Matn hast=3"
    },
    "1-8.py": {
        "desc": "پیدا کردن بزرگترین عدد بین سه عدد ورودی با ساختارهای مقایسه‌ای",
        "inputs": "a=12, b=45, c=20",
        "expectedOut": "Bozorgtarin adad: 45"
    },
    "1-9.py": {
        "desc": "محاسبه عبارت ریاضی سری توانی متغیرها با حلقه و فرمول",
        "inputs": "x=2, n=3",
        "expectedOut": "hasel ebarat ba x=2 va n=3 barabar ast ba 15"
    },
    "2-1.py": {
        "desc": "پیمایش اعداد و چاپ دنباله با حلقه و فیلتر شروط",
        "inputs": "بدون ورودی مستقیم",
        "expectedOut": "3 5 7 11 13"
    },
    "2-2.py": {
        "desc": "دریافت متوالی اعداد تا ورود شرط خاتمه و محاسبه مجموع و میانگین",
        "inputs": "دنباله اعداد",
        "expectedOut": "Majmoo=... Miangin=..."
    },
    "2-3.py": {
        "desc": "محاسبه مجموع ارقام یک عدد صحیح (Sum of digits)",
        "inputs": "n=15",
        "expectedOut": "Hasel Argham Adad 15 hast=6"
    },
    "2-4.py": {
        "desc": "پیدا کردن بیشترین و کمترین مقدار در یک دنباله",
        "inputs": "اعداد ورودی",
        "expectedOut": "Max=... Min=..."
    },
    "2-5.py": {
        "desc": "حلقه با دریافت تاییدیه ادامه کاربر (y/n) و محاسبه حاصل‌جمع اعداد فرد",
        "inputs": "adad=15, edame=n",
        "expectedOut": "Hasel Adad Fard hast=15"
    },
    "2-6.py": {
        "desc": "محاسبه مجموع اعداد مشخص با حلقه for",
        "inputs": "بدون ورودی",
        "expectedOut": "s=30"
    },
    "2-7.py": {
        "desc": "محاسبه دنباله حسابی و نمایش مجموع",
        "inputs": "بدون ورودی",
        "expectedOut": "s=500"
    },
    "2-8.py": {
        "desc": "محاسبه مجموع مکعبات دو عدد (a^3 + b^3)",
        "inputs": "بدون ورودی (مقادیر داخلی ۲ و ۶)",
        "expectedOut": "Majmoe Mokaabat 2 va 6 hast=224"
    },
    "2-9.py": {
        "desc": "تعریف تابع با بازگرداندن چند مقدار همزمان (Multiple Return Values)",
        "inputs": "بدون ورودی",
        "expectedOut": "r1=12\nr2=35"
    },
    "2-10.py": {
        "desc": "بررسی تفاوت حوزه دید متغیر محلی و متغیر عمومی (Scope: Local vs Global)",
        "inputs": "بدون ورودی",
        "expectedOut": "x=5\nx=10\nx=5"
    },
    "2-11.py": {
        "desc": "رفتار ارجاع و حافظه در لیست‌های پایتون (Pass by Reference / Mutability)",
        "inputs": "بدون ورودی",
        "expectedOut": "x=[44, 55, 66]\nx=[44, 99, 66]\nx=[44, 99, 66]"
    },
    "3-1.py": {
        "desc": "تعریف تابع ماکسیمم برای پیدا کردن بزرگترین عدد از بین سه متغیر",
        "inputs": "۳ عدد",
        "expectedOut": "Max: بزرگترین عدد ورودی"
    },
    "3-2.py": {
        "desc": "محاسبه شاخص توده بدنی (BMI) با دریافت قد و وزن در قالب تابع",
        "inputs": "ghad, vazn",
        "expectedOut": "BMI=..."
    },
    "3-3.py": {
        "desc": "تابع Min/Max با پشتیبانی از پارامترهای اختیاری و پیش‌فرض",
        "inputs": "بدون ورودی",
        "expectedOut": "Min=-5\nMin=9"
    },
    "3-4.py": {
        "desc": "محاسبه نسبت سرعت، مسافت و زمان و برگرداندن نتیجه در قالب یک Dictionary",
        "inputs": "بدون ورودی",
        "expectedOut": "{'rate': 120, 'distance': 400, 'time': 3.3333333333333335}"
    },
    "3-5.py": {
        "desc": "استفاده از آرگومان‌های نامحدود موقعیتی (*args) در تابع جهت دریافت مقادیر دلخواه",
        "inputs": "بدون ورودی",
        "expectedOut": "345\n-2"
    },
    "3-6.py": {
        "desc": "استفاده از آرگومان‌های کلیدواژه‌ای نامحدود (**kwargs) جهت ثبت مشخصات دانشجو",
        "inputs": "بدون ورودی",
        "expectedOut": "stno=140233\nyear=1403\ngrades=(12, 18, 17)\nterm=2\ngender='male'"
    },
    "3-7.py": {
        "desc": "ترکیب توابع محاسباتی و ارزیابی مقادیر پیچیده",
        "inputs": "بدون ورودی",
        "expectedOut": "68"
    },
    "4-1.py": {
        "desc": "ارسال توابع به عنوان پارامتر و استفاده از عبارات لامبدا (Lambda Expressions)",
        "inputs": "x=10, y=20",
        "expectedOut": "res2=850\nres3=850"
    },
    "4-2.py": {
        "desc": "مرتب‌سازی لیست رشته‌ها بر اساس طول کلمات با ارسال تابع len به آرگومان key",
        "inputs": "بدون ورودی",
        "expectedOut": "text=['ab', 'bcd', 'cdcd', 'cmh', 'ddddd', 'eeee', 'kooo']"
    },
    "4-3.py": {
        "desc": "توابع تودرتو (Nested Functions) و ترتیب فراخوانی پشته تابع",
        "inputs": "بدون ورودی",
        "expectedOut": "I like python programming.\nI am in function2\nAfter calling function2"
    },
    "4-4.py": {
        "desc": "پیاده‌سازی تابع بازگشتی فاکتوریل (Recursive Factorial - محاسبه ۵ فاکتوریل)",
        "inputs": "بدون ورودی (n=5)",
        "expectedOut": "120"
    },
    "4-5.py": {
        "desc": "وارد کردن و استفاده از توابع ماژول سفارشی m1.py جهت محاسبه مساحت اشکال",
        "inputs": "بدون ورودی",
        "expectedOut": "rectangle(4,8)=32"
    },
    "m1.py": {
        "desc": "ماژول سفارشی هندسه شامل توابع rectangle(a,b)، square(a) و circle(r)",
        "inputs": "ماژول کمکی (کتابخانه)",
        "expectedOut": "توابع آماده فراخوانی در فایل‌های دیگر"
    }
}

python_examples = []
for ch in python_chapters:
    folder = ch["folder"]
    files = sorted(os.listdir(folder))
    for f in files:
        if not f.endswith('.py'):
            continue
        filepath = os.path.join(folder, f)
        with open(filepath, 'r', encoding='utf-8', errors='ignore') as fp:
            code = fp.read()
        
        info = example_details.get(f, {
            "desc": f"نمونه کد آموزشی {f}",
            "inputs": "متغیر",
            "expectedOut": "خروجی موفق"
        })
        has_input = "input(" in code
        
        tags = []
        if "input(" in code: tags.append("ورودی کاربر")
        if "print(" in code: tags.append("چاپ خروجی")
        if "if " in code or "elif " in code: tags.append("دستور شرطی")
        if "for " in code or "while " in code: tags.append("حلقه")
        if "def " in code: tags.append("تابع")
        if "lambda" in code: tags.append("لامبدا")
        if "import " in code: tags.append("ماژول")
        if "math" in code: tags.append("ریاضیات")
        if "[" in code and "]" in code: tags.append("لیست")
        if "{" in code and "}" in code: tags.append("دیکشنری")
        if not tags: tags = ["پایتون"]

        python_examples.append({
            "id": f"{ch['id']}-{f.replace('.', '_')}",
            "filename": f,
            "chapterId": ch["id"],
            "chapterFolder": folder,
            "chapterTitle": ch["title"],
            "description": info["desc"],
            "sampleInputs": info["inputs"],
            "expectedOutput": info["expectedOut"],
            "code": code,
            "lineCount": len(code.splitlines()),
            "hasInput": has_input,
            "tags": tags,
            "downloadUrl": f"/scripts/{folder}/{f}"
        })

# 3. Notebooks Metadata and parsed content
notebook_info = {
    "11-numpy_1.ipynb": {
        "id": "nb-11",
        "order": 11,
        "title": "آموزش گام‌به‌گام NumPy (بخش اول)",
        "subtitle": "ایجاد آرایه‌ها، ابعاد، ایندکس‌گذاری و برش آرایه‌های چندبعدی",
        "description": "نوت‌بوک تمرینی بخش ۱ نام‌پای شامل ساخت انواع آرایه‌های تک‌بعدی و دوبعدی با np.array، np.arange، np.zeros، ماتریس‌های همانی، ویژگی‌های shape و ndim، و برش پیشرفته (Slicing).",
        "topics": ["np.array", "ndim & shape", "np.arange", "np.zeros & np.ones", "Array Indexing & Slicing"],
        "relatedItems": ["10-NumPy.pdf", "12-NumPy_TableOfContents.pdf", "13-numpy_2.ipynb"]
    },
    "13-numpy_2.ipynb": {
        "id": "nb-13",
        "order": 13,
        "title": "آموزش پیشرفته NumPy (بخش دوم)",
        "subtitle": "محاسبات برداری، اعمال ریاضی، آمار و توابع جامع (Ufuncs)",
        "description": "نوت‌بوک تمرینی بخش ۲ نام‌پای با ۶۲ سلول کد شامل عملیات ریاضی برداری، پخش ماتریسی (Broadcasting)، متدهای آماری sum، mean، std بر روی محورهای مختلف (axis)، و فیلترینگ با ماسک بولین.",
        "topics": ["Broadcasting", "Universal Functions (ufunc)", "Aggregations (sum, mean, std)", "Boolean Masking", "Reshaping"],
        "relatedItems": ["10-NumPy.pdf", "11-numpy_1.ipynb", "15-pandas_1.ipynb"]
    },
    "15-pandas_1.ipynb": {
        "id": "nb-15",
        "order": 15,
        "title": "مفاهیم پایه و دیتافریم‌ها در Pandas (بخش اول)",
        "subtitle": "ساختارهای Series و DataFrame، ایندکس‌گذاری و کاوش داده",
        "description": "نوت‌بوک تمرینی بخش ۱ پانداس با ۷۷ سلول کد شامل ساخت انواع سری‌ها و دیتافریم‌ها، بررسی متدهای head و tail و info، استخراج سطرها و ستون‌ها با loc و iloc، و فیلترهای شرطی.",
        "topics": ["pd.Series", "pd.DataFrame", "head() & tail()", "loc vs iloc", "فیلترینگ و استخراج ستون‌ها"],
        "relatedItems": ["14-Pandas_TableOfContents.pdf", "16-Employees.csv", "17-Pandas_Titles_1.pdf", "18-pandas_2.ipynb"]
    },
    "18-pandas_2.ipynb": {
        "id": "nb-18",
        "order": 18,
        "title": "تحلیل کاربردی و پاکسازی داده با Pandas (بخش دوم)",
        "subtitle": "تحلیل دیتاست‌های Titanic و Employees، مدیریت داده‌های گمشده و GroupBy",
        "description": "نوت‌بوک تمرینی بخش ۲ پانداس با ۴۷ سلول کد و جداول خروجی متعدد شامل کار مستقیم بر روی دیتاسِت‌های titanic.csv و Employees.csv، پاکسازی مقادیر NaN با dropna و fillna، و تحلیل‌های گروه‌بندی با groupby.",
        "topics": ["تحلیل Titanic و Employees", "مدیریت مقادیر گمشده (NaN)", "گروه‌بندی (groupby)", "تحلیل‌های آماری ترکیبی", "پاکسازی داده"],
        "relatedItems": ["16-Employees.csv", "19-Pandas_Titles(Employees).pdf", "20-Pandas_Titles(titanic).pdf", "21-titanic.csv"]
    }
}

notebooks_data = []
for f, meta in notebook_info.items():
    if not os.path.exists(f):
        continue
    with open(f, 'r', encoding='utf-8', errors='ignore') as fp:
        raw_nb = json.load(fp)
    
    cells = []
    code_count = 0
    markdown_count = 0
    for idx, c in enumerate(raw_nb.get('cells', [])):
        c_type = c.get('cell_type', 'code')
        if c_type == 'code':
            code_count += 1
        else:
            markdown_count += 1
        
        src = c.get('source', '')
        if isinstance(src, list):
            src = ''.join(src)
        
        clean_outputs = []
        for out in c.get('outputs', []):
            o_type = out.get('output_type', '')
            out_obj = {'output_type': o_type}
            if o_type == 'stream':
                text_stream = out.get('text', '')
                if isinstance(text_stream, list):
                    text_stream = ''.join(text_stream)
                out_obj['text'] = text_stream
            elif o_type in ['execute_result', 'display_data']:
                data = out.get('data', {})
                if 'text/html' in data:
                    h = data['text/html']
                    out_obj['html'] = ''.join(h) if isinstance(h, list) else h
                if 'text/plain' in data:
                    t = data['text/plain']
                    out_obj['text'] = ''.join(t) if isinstance(t, list) else t
            elif o_type == 'error':
                out_obj['ename'] = out.get('ename', '')
                out_obj['evalue'] = out.get('evalue', '')
                trace = out.get('traceback', [])
                out_obj['traceback'] = '\n'.join(trace) if isinstance(trace, list) else str(trace)
            clean_outputs.append(out_obj)

        cells.append({
            'index': idx + 1,
            'cell_type': c_type,
            'execution_count': c.get('execution_count'),
            'source': src,
            'outputs': clean_outputs
        })

    notebooks_data.append({
        'id': meta['id'],
        'order': meta['order'],
        'filename': f,
        'title': meta['title'],
        'subtitle': meta['subtitle'],
        'description': meta['description'],
        'topics': meta['topics'],
        'relatedItems': meta.get('relatedItems', []),
        'totalCells': len(cells),
        'codeCells': code_count,
        'markdownCells': markdown_count,
        'downloadUrl': f"/notebooks/{f}",
        'cells': cells
    })

# 4. Parse CSV Datasets & Aggregations
def parse_csv_file(filepath, meta):
    rows = []
    columns = []
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as fp:
        reader = csv.reader(fp)
        try:
            columns = [c.strip() for c in next(reader)]
        except StopIteration:
            return None
        for row in reader:
            if not row:
                continue
            row_dict = {}
            for col_idx, col_name in enumerate(columns):
                val = row[col_idx].strip() if col_idx < len(row) else ''
                row_dict[col_name] = val
            rows.append(row_dict)

    col_stats = []
    for col in columns:
        vals = [r[col] for r in rows if r[col] not in ['', '?', '-']]
        null_count = sum(1 for r in rows if r[col] in ['', '?', '-'])
        numeric_vals = []
        for v in vals:
            try:
                numeric_vals.append(float(v))
            except ValueError:
                pass
        is_numeric = len(numeric_vals) > 0 and len(numeric_vals) == len(vals)
        stat = {
            'name': col,
            'nonNullCount': len(vals),
            'nullCount': null_count,
            'isNumeric': is_numeric
        }
        if is_numeric and numeric_vals:
            stat['min'] = round(min(numeric_vals), 2)
            stat['max'] = round(max(numeric_vals), 2)
            stat['mean'] = round(sum(numeric_vals) / len(numeric_vals), 2)
        else:
            unique_vals = list(set(vals))
            stat['uniqueCount'] = len(unique_vals)
            stat['sampleValues'] = unique_vals[:5]
        col_stats.append(stat)

    return {
        'id': meta['id'],
        'order': meta['order'],
        'filename': meta['filename'],
        'title': meta['title'],
        'description': meta['description'],
        'relatedItems': meta.get('relatedItems', []),
        'rowCount': len(rows),
        'columnCount': len(columns),
        'columns': columns,
        'columnStats': col_stats,
        'downloadUrl': f"/datasets/{meta['filename']}",
        'sampleRows': rows
    }

datasets_data = [
    parse_csv_file("16-Employees.csv", {
        "id": "ds-employees",
        "order": 16,
        "filename": "16-Employees.csv",
        "title": "دیتاست مشخصات کارکنان (Employees)",
        "description": "دیتاست آموزشی ۱۰ ردیفه شامل اطلاعات پرسنلی کارکنان همراه با مقادیر گمشده عمداً درج‌شده جهت تمرین تکنیک‌های پاکسازی داده در پانداس.",
        "relatedItems": ["17-Pandas_Titles_1.pdf", "18-pandas_2.ipynb", "19-Pandas_Titles(Employees).pdf"]
    }),
    parse_csv_file("21-titanic.csv", {
        "id": "ds-titanic",
        "order": 21,
        "filename": "21-titanic.csv",
        "title": "دیتاست مسافران کشتی تایتانیک (Titanic)",
        "description": "دیتاست معروف و استاندارد مسافران کشتی تایتانیک با ۸۹۱ رکورد داده واقعی شامل اطلاعات نجات‌یافتگان، رده سنی، کلاس بلیت مسافران و کرایه پرداختی.",
        "relatedItems": ["18-pandas_2.ipynb", "20-Pandas_Titles(titanic).pdf"]
    })
]

# 5. Course Timeline items (01 to 21) with full links
timeline_items = [
    {"num": "01", "type": "pdf", "title": "کتاب‌ها و مراجع درس", "file": "01-PDA_ReferenceBooks.pdf", "category": "منابع", "related": ["02", "03"]},
    {"num": "02", "type": "pdf", "title": "کتاب مرجع Python for Data Analysis (ویرایش ۳)", "file": "02-Python for Data Analysis_2022.pdf", "category": "کتاب اصلی", "related": ["10", "14", "15", "18"]},
    {"num": "03", "type": "pdf", "title": "جزوه جلسه ۱: مقدمات و سینتکس پایتون", "file": "03-booklet_PDA_Session1.pdf", "category": "جزوه", "related": ["04", "05"]},
    {"num": "04", "type": "pdf", "title": "آموزش ساختارهای توالی (Sequences)", "file": "04-Sequences_in_Python.pdf", "category": "ساختار داده", "related": ["06"]},
    {"num": "05", "type": "scripts", "title": "نمونه کدهای سری ۱: ورودی/خروجی و شروط (۹ برنامه)", "file": "05-Examples_Python_1", "category": "کد پایتون", "related": ["03", "04"]},
    {"num": "06", "type": "scripts", "title": "نمونه کدهای سری ۲: لیست‌ها و حلقه‌ها (۱۱ برنامه)", "file": "06-Examples_Python_2", "category": "کد پایتون", "related": ["04", "07"]},
    {"num": "07", "type": "pdf", "title": "آموزش جامع توابع، پارامترها و آرگومان‌ها", "file": "07-Function_Parameter_Argument.pdf", "category": "توابع", "related": ["08", "09"]},
    {"num": "08", "type": "scripts", "title": "نمونه کدهای سری ۳: توابع و عبارات Lambda (۷ برنامه)", "file": "08-Examples_Python_3", "category": "کد پایتون", "related": ["07", "09"]},
    {"num": "09", "type": "scripts", "title": "نمونه کدهای سری ۴: ماژول‌ها و توابع پیشرفته (۶ برنامه)", "file": "09-Examples_Python_4", "category": "کد پایتون", "related": ["07", "08"]},
    {"num": "10", "type": "pdf", "title": "جزوه آموزشی کتابخانه محاسباتی NumPy", "file": "10-NumPy.pdf", "category": "نام‌پای", "related": ["11", "12", "13"]},
    {"num": "11", "type": "notebook", "title": "نوت‌بوک تمرینی نام‌پای ۱ (۳۲ سلول)", "file": "11-numpy_1.ipynb", "category": "ژوپیتر", "related": ["10", "12", "13"]},
    {"num": "12", "type": "pdf", "title": "سرفصل‌ها و نقشه مباحث نام‌پای (NumPy TOC)", "file": "12-NumPy_TableOfContents.pdf", "category": "سرفصل", "related": ["10", "11", "13"]},
    {"num": "13", "type": "notebook", "title": "نوت‌بوک تمرینی نام‌پای ۲ (۶۲ سلول)", "file": "13-numpy_2.ipynb", "category": "ژوپیتر", "related": ["10", "11", "12"]},
    {"num": "14", "type": "pdf", "title": "سرفصل‌ها و نقشه مباحث پانداس (Pandas TOC)", "file": "14-Pandas_TableOfContents.pdf", "category": "سرفصل", "related": ["15", "17", "18"]},
    {"num": "15", "type": "notebook", "title": "نوت‌بوک تمرینی پانداس ۱ (۷۷ سلول)", "file": "15-pandas_1.ipynb", "category": "ژوپیتر", "related": ["14", "16", "17", "18"]},
    {"num": "16", "type": "dataset", "title": "دیتاست تمرینی کارکنان (Employees.csv)", "file": "16-Employees.csv", "category": "دیتاست", "related": ["15", "17", "18", "19"]},
    {"num": "17", "type": "pdf", "title": "عناوین و تمرینات سری اول پانداس", "file": "17-Pandas_Titles_1.pdf", "category": "تمرین", "related": ["15", "16"]},
    {"num": "18", "type": "notebook", "title": "نوت‌بوک تمرینی پانداس ۲ (۴۷ سلول)", "file": "18-pandas_2.ipynb", "category": "ژوپیتر", "related": ["16", "19", "20", "21"]},
    {"num": "19", "type": "pdf", "title": "تمرینات تحلیل داده روی دیتاست کارمندان", "file": "19-Pandas_Titles(Employees).pdf", "category": "پروژه", "related": ["16", "18"]},
    {"num": "20", "type": "pdf", "title": "تمرینات تحلیل داده پیشرفته روی دیتاست تایتانیک", "file": "20-Pandas_Titles(titanic).pdf", "category": "پروژه", "related": ["18", "21"]},
    {"num": "21", "type": "dataset", "title": "دیتاست مسافران تایتانیک (titanic.csv - ۸۹۱ سطر)", "file": "21-titanic.csv", "category": "دیتاست", "related": ["18", "20"]}
]

# 6. Interactive Quiz Dataset for Knowledge Checking (خودآزمایی)
quiz_questions = [
    {
        "id": "q1",
        "question": "تفاوت اصلی و اساسی بین متدهای loc و iloc در کتابخانه Pandas چیست؟",
        "options": [
            "متد loc بر اساس نام و برچسب‌های ایندکس (Label-based) کار می‌کند در حالی که iloc بر اساس اندیس‌های عددی و موقعیت (Position-based) عمل می‌کند.",
            "متد loc فقط برای سطرهای دیتافریم است و متد iloc فقط برای ستون‌ها کاربرد دارد.",
            "متد iloc داده‌ها را به صورت خودکار مرتب می‌کند اما loc داده‌ها را بدون تغییر حفظ می‌کند.",
            "هیچ تفاوتی بین آنها وجود ندارد و صرفاً نام‌های جایگزین یکدیگر هستند."
        ],
        "correctIndex": 0,
        "explanation": "در پانداس متد loc بر اساس نام واقعی سطرها یا ستون‌ها کار می‌کند (مثلاً df.loc[:, 'Age']) و انتهای بازه در آن مشمول (Inclusive) است؛ در حالی که iloc بر اساس ایندکس‌های عدد صحیح ۰ تا n کار کرده و مانند برش‌های پایتون انتهای آن Exclusive است."
    },
    {
        "id": "q2",
        "question": "در کتابخانه NumPy، تعیین پارامتر axis=0 در تابعی مانند arr.sum(axis=0) چه مفهومی دارد؟",
        "options": [
            "محاسبه مجموع در امتداد سطرها (به سمت پایین در هر ستون) انجام شده و بعد سطرها فشرده می‌شود.",
            "محاسبه مجموع به صورت افقی روی هر سطر انجام می‌شود.",
            "کل عناصر آرایه به صورت یکجا و اسکالر با هم جمع می‌شوند.",
            "محاسبه فقط برای سطرهای زوج آرایه انجام می‌شود."
        ],
        "correctIndex": 0,
        "explanation": "در نام‌پای axis=0 یعنی عملیات در راستای عمودی (سطر به سطر به پایین) روی مقادیر هر ستون اجرا می‌شود و در نهایت برای هر ستون یک مجموع به دست می‌آید."
    },
    {
        "id": "q3",
        "question": "رفتار دستور df.dropna(how='all') در دیتافریم‌های پانداس چگونه است؟",
        "options": [
            "فقط سطرهایی را حذف می‌کند که تمام ستون‌های آن سطر تهی یا NaN باشند.",
            "هر سطری که حداقل یک مقدار گم‌شده یا NaN داشته باشد بلافاصله حذف می‌شود.",
            "تمامی مقادیر عددی صفر را از دیتافریم پاک می‌کند.",
            "کل جدول دیتافریم را به طور کامل خالی می‌کند."
        ],
        "correctIndex": 0,
        "explanation": "حالت پیش‌فرض dropna با how='any' است که در صورت وجود حتی یک مقدار NaN آن سطر را حذف می‌کند، اما how='all' سخت‌گیرانه‌تر بوده و تنها زمانی سطر را حذف می‌کند که کل مقادیر آن تهی باشد."
    },
    {
        "id": "q4",
        "question": "مفهوم ویژگی Broadcasting در آرایه‌های محاسباتی NumPy چیست؟",
        "options": [
            "توانایی نام‌پای در انجام عملیات حسابی بین آرایه‌هایی با شکل‌ها و ابعاد سازگار بدون کپی فیزیکی داده در حافظه.",
            "ارسال هم‌زمان مقادیر ماتریس به مانیتور و خروجی وب.",
            "تبدیل خودکار مقادیر عددی صحیح به اعداد مختلط.",
            "پخش زنده مقادیر نوت‌بوک به سایر کاربران شبکه."
        ],
        "correctIndex": 0,
        "explanation": "برودکستینگ به نام‌پای اجازه می‌دهد عملیات حسابی بین آرایه‌های با ابعاد متفاوت (مانند جمع یک عدد ثابت اسکالر با یک ماتریس ۲بعدی) را با سرعت فوق‌العاده C و بدون مصرف حافظه اضافی انجام دهد."
    },
    {
        "id": "q5",
        "question": "در پایتون، کاربرد عملگرهای *args و **kwargs در تعریف یک تابع چیست؟",
        "options": [
            "*args آرگومان‌های موقعیتی نامحدود را به صورت تاپل دریافت می‌کند و **kwargs آرگومان‌های کلیدواژه‌ای را به صورت دیکشنری دریافت می‌نماید.",
            "هر دو جهت ضرب و توان‌رسانی مقادیر ورودی درون هدر تابع استفاده می‌شوند.",
            "*args برای توابع بازگشتی است و **kwargs برای توابع لامبدا.",
            "فقط برای دریافت متغیرهای بولین به کار می‌روند."
        ],
        "correctIndex": 0,
        "explanation": "با استفاده از *args می‌توان هر تعداد پارامتر بدون نام دلخواه (به فرم تاپل) و با **kwargs هر تعداد پارامتر نام‌دار نامحدود (به فرم دیکشنری کلید و مقدار) به تابع ارسال کرد."
    },
    {
        "id": "q6",
        "question": "دستور df.groupby('Pclass')['Survived'].mean() در تحلیل دیتاست تایتانیک چه آماری تولید می‌کند؟",
        "options": [
            "نرخ و درصد بقای مسافران را به تفکیک سه کلاس بلیت مسافران محاسبه می‌کند.",
            "تعداد کل مسافران نجات‌یافته را بر تعداد کل قایق‌ها تقسیم می‌کند.",
            "میانگین سن مسافران نجات‌یافته در هر کلاس بلیت را برمی‌گرداند.",
            "میانگین کرایه بلیت مسافران فوت شده را نشان می‌دهد."
        ],
        "correctIndex": 0,
        "explanation": "ستون Survived دارای مقادیر 0 (فوت شده) و 1 (نجات‌یافته) است، بنابراین میانگین آن برای هر گروه دقیقا برابر با نسبت و نرخ درصد بقای مسافران آن گروه است (مثلاً کلاس ۱ بیشترین درصد بقا را داشت)."
    },
    {
        "id": "q7",
        "question": "تفاوت ساختار داده تاپل (Tuple) و لیست (List) در چیست؟",
        "options": [
            "لیست‌ها تغییرپذیر (Mutable) هستند در حالی که تاپل‌ها پس از تعریف غیرقابل تغییر (Immutable) می‌باشند.",
            "تاپل‌ها فقط مقادیر متنی قبول می‌کنند ولی لیست‌ها فقط اعداد.",
            "لیست‌ها با پرانتز و تاپل‌ها با براکت تعریف می‌شوند.",
            "سرعت پیمایش لیست‌ها به مراتب بیشتر از تاپل‌ها است."
        ],
        "correctIndex": 0,
        "explanation": "تاپل‌ها به دلیل ایمیوتبل بودن در حافظه محافظت شده و به عنوان کلید دیکشنری قابل استفاده هستند، اما عناصر لیست را می‌توان در هر لحظه ویرایش، حذف یا اضافه کرد."
    },
    {
        "id": "q8",
        "question": "تابع ناشناس Lambda در پایتون چه ویژگی بارزی دارد؟",
        "options": [
            "یک تابع تک‌خطی بدون نیاز به دستور def است که می‌تواند هر تعداد آرگومان داشته باشد اما فقط یک عبارت محاسباتی را برمی‌گرداند.",
            "تابعی است که فقط با ماژول ریاضی math کار می‌کند.",
            "یک تابع مخصوص چاپ گرافیکی است و مقدار عددی برنمی‌گرداند.",
            "حلقه‌های تکرار نامحدود درون پایتون ایجاد می‌کند."
        ],
        "correctIndex": 0,
        "explanation": "لامبداها توابع بی‌نام تک‌خطی با سینتکس lambda x, y: x + y هستند و بیشتر به عنوان آرگومان ورودی برای توابعی مانند sort، map و filter به کار می‌روند."
    }
]

# Write all JSON files
out_dir = os.path.join("website", "src", "data")
os.makedirs(out_dir, exist_ok=True)

with open(os.path.join(out_dir, "pdfs.json"), 'w', encoding='utf-8') as f:
    json.dump(pdfs_meta, f, ensure_ascii=False, indent=2)

with open(os.path.join(out_dir, "python_chapters.json"), 'w', encoding='utf-8') as f:
    json.dump(python_chapters, f, ensure_ascii=False, indent=2)

with open(os.path.join(out_dir, "python_examples.json"), 'w', encoding='utf-8') as f:
    json.dump(python_examples, f, ensure_ascii=False, indent=2)

with open(os.path.join(out_dir, "notebooks.json"), 'w', encoding='utf-8') as f:
    json.dump(notebooks_data, f, ensure_ascii=False, indent=2)

with open(os.path.join(out_dir, "datasets.json"), 'w', encoding='utf-8') as f:
    json.dump(datasets_data, f, ensure_ascii=False, indent=2)

with open(os.path.join(out_dir, "timeline.json"), 'w', encoding='utf-8') as f:
    json.dump(timeline_items, f, ensure_ascii=False, indent=2)

with open(os.path.join(out_dir, "quiz.json"), 'w', encoding='utf-8') as f:
    json.dump(quiz_questions, f, ensure_ascii=False, indent=2)

stats = {
    "totalItems": 21,
    "totalPdfs": len(pdfs_meta),
    "totalScripts": len(python_examples),
    "totalNotebooks": len(notebooks_data),
    "totalNotebookCells": sum(nb['totalCells'] for nb in notebooks_data),
    "totalDatasets": len(datasets_data),
    "totalDataRows": sum(ds['rowCount'] for ds in datasets_data),
    "totalQuizQuestions": len(quiz_questions)
}

with open(os.path.join(out_dir, "stats.json"), 'w', encoding='utf-8') as f:
    json.dump(stats, f, ensure_ascii=False, indent=2)

print("Data upgrade complete! Stats:", stats)
