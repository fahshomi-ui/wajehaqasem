# اختر نوع التأمين

صفحة لاختيار نوع تأمين السيارة (**التأمين ضد الغير** و**التأمين الشامل**)، مع **لوحة تحكم** على `/admin` لتغيير رابط الزرّين من مكان واحد بدون تعديل الكود أو إعادة النشر.

## الملفات

| الملف | الوصف |
| --- | --- |
| `public/index.html` | الصفحة الرئيسية |
| `public/styles.css` | التنسيقات (خط Cairo، تصميم متجاوب) |
| `public/app.js` | يقرأ الرابط المحفوظ ويطبّقه على الزرّين |
| `public/admin/index.html` | لوحة التحكم (محمية بكلمة سر) |
| `netlify/functions/links.mjs` | دالة Netlify لقراءة وحفظ الرابط (`/api/links`) باستخدام Netlify Blobs |
| `netlify.toml` | إعدادات النشر على Netlify |

## النشر على Netlify

1. من Netlify اختر **Add new site → Import an existing project → GitHub** واختر هذا المستودع.
2. الإعدادات تُقرأ تلقائياً من `netlify.toml` (لا حاجة لـ Build command، و Publish directory = `public`).
3. أضف متغير البيئة **`ADMIN_PASSWORD`** (كلمة سر لوحة التحكم):
   - إما أثناء الإعداد من زر **Add environment variables**،
   - أو بعد النشر من **Site configuration → Environment variables → Add a variable**، ثم **Deploys → Trigger deploy → Deploy site** حتى يتم تفعيلها.
4. اضغط **Deploy**.

## تغيير رابط الأزرار

1. افتح `https://اسم-موقعك.netlify.app/admin`
2. أدخل كلمة السر (قيمة `ADMIN_PASSWORD`).
3. اكتب الرابط واضغط **حفظ الرابط** — يتغيّر رابط الزرّين فوراً.
4. لإلغاء الرابط اترك الحقل فارغاً واحفظ (الأزرار لن تفتح أي شيء).

لتغيير كلمة السر: عدّل قيمة `ADMIN_PASSWORD` في Netlify ثم أعد النشر.

## التشغيل محلياً

```bash
npm install
ADMIN_PASSWORD=test netlify dev
```

ثم افتح `http://localhost:8888` و `http://localhost:8888/admin`.
