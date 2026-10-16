// Both insurance buttons open WhatsApp with a ready message for the chosen type.
// Default number: 0581092444. Numbers saved from /admin (phone / WhatsApp / email) override the defaults.
(function () {
  var DEFAULT_WHATSAPP = '966581092444';

  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  function digits(value) { return String(value || '').replace(/\D+/g, ''); }

  // Saudi numbers: 05XXXXXXXX / 5XXXXXXXX / 9665XXXXXXXX / 009665XXXXXXXX -> 9665XXXXXXXX
  function toInternational(value) {
    var d = digits(value);
    if (d.indexOf('00') === 0) d = d.slice(2);
    if (/^05\d{8}$/.test(d)) d = '966' + d.slice(1);
    else if (/^5\d{8}$/.test(d)) d = '966' + d;
    return d;
  }

  function waLink(number, text) {
    return 'https://wa.me/' + number + (text ? '?text=' + encodeURIComponent(text) : '');
  }

  function applyWhatsApp(number) {
    document.querySelectorAll('.choice[data-wa-text]').forEach(function (el) {
      el.href = waLink(number, el.getAttribute('data-wa-text'));
    });
  }

  function fill(name, text, href) {
    var item = document.querySelector('[data-contact="' + name + '"]');
    if (!item || !text || !href) return;
    var link = item.querySelector('a');
    link.textContent = text;
    link.href = href;
    item.hidden = false;
  }

  applyWhatsApp(DEFAULT_WHATSAPP);

  fetch('/api/links', { cache: 'no-store' })
    .then(function (res) { return res.ok ? res.json() : {}; })
    .catch(function () { return {}; })
    .then(function (data) {
      var c = (data && data.contact) || {};
      var phone = String(c.phone || '').trim();
      var whatsapp = String(c.whatsapp || '').trim();
      var email = String(c.email || '').trim();

      var wa = toInternational(whatsapp);
      if (wa.length >= 8) {
        applyWhatsApp(wa);
        fill('whatsapp', whatsapp, waLink(wa));
      }

      var phoneDigits = digits(phone);
      if (phoneDigits) fill('phone', phone, 'tel:' + (phone.charAt(0) === '+' ? '+' : '') + phoneDigits);

      if (email) fill('email', email, 'mailto:' + email);
    });
})();
