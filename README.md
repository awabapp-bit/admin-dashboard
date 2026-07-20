# منصة أواب الإلكترونية — لوحة تحكم المسؤول

هذا موقع مستقل بالكامل عن موقع المستخدم (مش نفس المستودع، مش نفس الاستضافة بالضرورة). يشتركان فقط في نفس مشروع Firebase (نفس قاعدة البيانات وقواعد الحماية).

| الملف | الوظيفة |
|---|---|
| `index.html` | دخول المسؤول (نقطة الدخول) — admin / 123 |
| `home.html` | كل المسابقات + إحصائيات |
| `add-competition.html` | إضافة مسابقة جديدة |
| `competition.html?id=...` | إدارة محاضرات مسابقة |
| `lesson.html` | محاضرة: فيديوهات متعددة + اختبارات متعددة |
| `users.html` | الحسابات: بحث/عرض/إعادة تعيين/حظر |
| `user-detail.html` | تفاصيل حساب + إرسال رابط استرجاع كلمة مرور |
| `participants.html` | مشتركو مسابقة معيّنة ونقاطهم |

## الملفات المطلوبة بجانب الصفحات (كل حاجة في نفس المستوى، مفيش مجلدات فرعية)
```
awab-admin-site/
├── logo.png
├── style.css
├── firebase-config.js
├── icons.js
├── admin-shell.js
└── *.html (index, home, add-competition, competition, lesson, users, user-detail, participants)
```

## ⚠️ قبل الاستخدام
1. Firebase Console ← Authentication ← Settings ← Authorized domains ← أضف نطاق نشر هذا الموقع.
2. Firebase Console ← Realtime Database ← Rules ← الصق محتوى `firebase-rules.json` المرفق.

## مهم: رابط موقع المستخدم
زر "عرض الموقع" في شريط التنقل، وزر "العودة لموقع المنصة" في صفحة الدخول، بيشاورا حاليًا على:
```
https://awabapp-bit.github.io/awab-user-site/
```
لو الرابط الفعلي لموقع المستخدم بعد النشر مختلف عن ده، حدّثه في مكانين:
- `admin-shell.js` → أول سطر فيه `const USER_SITE_URL = '...'`
- `index.html` → رابط "العودة لموقع المنصة" أسفل الفورم

## دخول المسؤول
اسم المستخدم `admin` وكلمة المرور `123` — الجلسة محفوظة تلقائيًا بعد أول دخول.

## النشر
ارفع محتويات هذا المجلد كاملة (بما فيها `css/` و`js/` و`logo.png`) كموقع مستقل تمامًا عن موقع المستخدم.
