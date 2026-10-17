const services = {
  transactions: {
    title: 'تعقيب المعاملات',
    description: 'نراجع معك متطلبات المعاملة، ونساعد في تنظيم ملفها ومتابعة الخطوات المتاحة لدى الجهة المعنية، وفق طبيعة الإجراء والصلاحيات المطلوبة.',
    requirements: ['نوع المعاملة والجهة المعنية بها', 'الخطوة التي وصلت إليها وأي ملاحظات عامة', 'الموعد المستهدف إن وجد، دون افتراض مدة إنجاز مضمونة']
  },
  tracking: {
    title: 'متابعة الطلبات',
    description: 'نساعدك على فهم حالة الطلب وملاحظاته، ونرتب ما يلزم لاستكماله. تُراجع إمكانية المتابعة بحسب الطلب والجهة؛ الموقع ليس منصة استعلام حكومية.',
    requirements: ['نوع الطلب والجهة التي قدمته إليها', 'تاريخ التقديم بصورة عامة', 'وصف الملاحظات أو النواقص الظاهرة لديك دون بيانات حساسة']
  },
  electronic: {
    title: 'الخدمات الإلكترونية',
    description: 'مساعدة إدارية في فهم متطلبات الخدمات الرقمية وتعبئة النماذج ومراجعة البيانات. التحقق والدخول إلى الحسابات يتمان بواسطة صاحب الحساب.',
    requirements: ['اسم الخدمة أو المنصة المعنية', 'وصف الإجراء الذي تحتاج المساعدة فيه', 'أي ملاحظات عامة ظهرت أثناء الإجراء؛ لا تشارك كلمة المرور أو رمز التحقق']
  },
  documents: {
    title: 'تجهيز المستندات',
    description: 'نساعد في ترتيب المرفقات والأوراق ومراجعة قائمة المتطلبات، لتعرف ما ينقص ملفك قبل تقديمه. لا تشمل الخدمة إصدار مستندات رسمية نيابة عن الجهات.',
    requirements: ['اسم المعاملة أو الخدمة', 'قائمة المستندات التي تطلبها الجهة إن توفرت', 'وصف ما هو متوفر وما يحتاج إلى استكمال دون إرسال صور هوية في الاستفسار الأول']
  },
  appointments: {
    title: 'حجز المواعيد',
    description: 'نساعد في معرفة طريقة حجز الموعد وترتيب متطلبات الحضور، بحسب المواعيد المتاحة لدى الجهة. لا يمكن ضمان موعد غير متاح أو تجاوز إجراءات الجهة.',
    requirements: ['اسم الجهة والخدمة', 'المدينة والفترة المناسبة لك', 'أي متطلبات حضور تعرفها مسبقًا']
  },
  business: {
    title: 'خدمات الأفراد والمنشآت',
    description: 'مساندة إدارية للأفراد والمنشآت في ترتيب طلباتهم ومراجعة متطلباتها ومتابعة الخطوات المتعلقة بالخدمات العامة، بعد تحديد نطاق العمل المناسب.',
    requirements: ['هل الطلب يخص فردًا أم منشأة؟', 'نوع الخدمة والجهة المعنية', 'وصف الاحتياج والمرحلة الحالية دون معلومات مالية أو هويات']
  }
};

// Default contact number of the site; the owner can change it from /admin (saved via /api/links).
let whatsappBase = 'https://wa.me/966581092444';
function whatsappUrl(message) {
  return `${whatsappBase}?text=${encodeURIComponent(message)}`;
}

const toLatinDigits = (value) => String(value || '')
  .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
  .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)));
const digitsOnly = (value) => toLatinDigits(value).replace(/\D+/g, '');
// Saudi numbers: 05XXXXXXXX / 5XXXXXXXX / 9665XXXXXXXX / 009665XXXXXXXX -> 9665XXXXXXXX
function toInternational(value) {
  let d = digitsOnly(value);
  if (d.startsWith('00')) d = d.slice(2);
  if (/^05\d{8}$/.test(d)) d = `966${d.slice(1)}`;
  else if (/^5\d{8}$/.test(d)) d = `966${d}`;
  return d;
}
function toLocal(international) {
  return /^9665\d{8}$/.test(international) ? `0${international.slice(3)}` : international;
}
function spaced(local) {
  return /^05\d{8}$/.test(local) ? `${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6)}` : local;
}

function applyContact(contact) {
  const whatsapp = toInternational(contact.whatsapp);
  if (whatsapp.length >= 8) {
    whatsappBase = `https://wa.me/${whatsapp}`;
    for (const link of document.querySelectorAll('a[href^="https://wa.me/"]')) {
      const query = link.href.includes('?') ? link.href.slice(link.href.indexOf('?')) : '';
      link.href = `${whatsappBase}${query}`;
    }
  }
  const phone = toInternational(contact.phone);
  if (phone.length >= 8) {
    const local = toLocal(phone);
    for (const link of document.querySelectorAll('a[href^="tel:"]')) link.href = `tel:+${phone}`;
    for (const el of document.querySelectorAll('[data-phone-text]')) {
      el.textContent = el.dataset.phoneText === 'spaced' ? spaced(local) : local;
    }
  }
  const email = String(contact.email || '').trim();
  const emailLink = document.querySelector('[data-contact-email]');
  if (emailLink && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    emailLink.href = `mailto:${email}`;
    emailLink.textContent = email;
    emailLink.hidden = false;
  }
}

fetch('/api/links', { cache: 'no-store' })
  .then((res) => (res.ok ? res.json() : {}))
  .catch(() => ({}))
  .then((data) => applyContact((data && data.contact) || {}));

const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#main-nav');
menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  navigation.classList.toggle('is-open', open);
});
for (const link of navigation.querySelectorAll('a')) {
  link.addEventListener('click', () => {
    navigation.classList.remove('is-open');
    menuButton.setAttribute('aria-expanded', 'false');
  });
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && navigation.classList.contains('is-open')) {
    navigation.classList.remove('is-open');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.focus();
  }
});

const dialog = document.querySelector('#service-dialog');
for (const button of document.querySelectorAll('[data-service]')) {
  button.addEventListener('click', () => {
    const service = services[button.dataset.service];
    document.querySelector('#dialog-title').textContent = service.title;
    document.querySelector('#dialog-description').textContent = service.description;
    const list = document.querySelector('#dialog-requirements');
    list.replaceChildren(...service.requirements.map((text) => {
      const item = document.createElement('li');
      item.textContent = text;
      return item;
    }));
    document.querySelector('#dialog-whatsapp').href = whatsappUrl(`السلام عليكم، أرغب بالاستفسار عن خدمة ${service.title} لدى مكتب الوسيم للخدمات العامة.`);
    dialog.showModal();
  });
}
document.querySelector('#dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', (event) => {
  const bounds = dialog.getBoundingClientRect();
  if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) {
    dialog.close();
  }
});

document.querySelector('#request-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const service = document.querySelector('#service-choice').value;
  const description = document.querySelector('#request-description').value.trim();
  const message = `السلام عليكم، مكتب الوسيم للخدمات العامة.\nأرغب بالاستفسار عن: ${service}.${description ? `\nوصف الطلب: ${description}` : ''}\nما المتطلبات ونطاق الخدمة والتكلفة؟`;
  const url = whatsappUrl(message);
  const fallback = document.querySelector('#request-fallback');
  fallback.href = url;
  fallback.hidden = false;
  window.open(url, '_blank', 'noopener,noreferrer');
});
document.querySelector('#year').textContent = String(new Date().getFullYear());
