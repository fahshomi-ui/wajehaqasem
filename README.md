# اختر نوع التأمين

صفحة ثابتة (HTML + CSS) لاختيار نوع تأمين السيارة: **التأمين ضد الغير** أو **التأمين الشامل**.

## الملفات

| الملف | الوصف |
| --- | --- |
| `index.html` | الصفحة الرئيسية |
| `styles.css` | التنسيقات (خط Cairo، تصميم متجاوب) |
| `shield.svg` | أيقونة الدرع |
| `favicon.svg` | أيقونة المتصفح |
| `netlify.toml` | إعدادات النشر على Netlify |

## النشر على Netlify

1. من لوحة Netlify اختر **Add new site → Import an existing project**.
2. اربط حساب GitHub واختر المستودع `wajehaqasem`.
3. اترك **Build command** فارغاً، و **Publish directory** = `.`
4. اضغط **Deploy**.

## التشغيل محلياً

```bash
python3 -m http.server 8080
```

ثم افتح `http://localhost:8080`.

## الأزرار

الخياران حالياً أزرار (`<button>`) بدون أي رابط. لإضافة رابط لاحقاً، حوّل الزر إلى `<a class="choice" href="...">` داخل `index.html`.
