// Reads the settings saved from /admin:
//  - one link applied to both insurance choice buttons
//  - optional contact details (phone, WhatsApp, email) shown in the contact section
(function () {
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  var settingsPromise = fetch('/api/links', { cache: 'no-store' })
    .then(function (res) { return res.ok ? res.json() : {}; })
    .catch(function () { return {}; })
    .then(function (data) { return data || {}; });

  // ---- Choice buttons ----
  var buttons = document.querySelectorAll('.choice');
  buttons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      settingsPromise.then(function (data) {
        if (data.link) window.location.href = data.link;
      });
    });
  });

  // ---- Contact details ----
  function digits(value) { return String(value || '').replace(/\D+/g, ''); }

  // Saudi numbers: 05XXXXXXXX / 5XXXXXXXX / 9665XXXXXXXX / 009665XXXXXXXX -> 9665XXXXXXXX
  function toInternational(value) {
    var d = digits(value);
    if (d.indexOf('00') === 0) d = d.slice(2);
    if (/^05\d{8}$/.test(d)) d = '966' + d.slice(1);
    else if (/^5\d{8}$/.test(d)) d = '966' + d;
    return d;
  }

  function fill(name, text, href) {
    var item = document.querySelector('[data-contact="' + name + '"]');
    if (!item) return;
    var link = item.querySelector('a');
    if (!text || !href) { item.hidden = true; return; }
    link.textContent = text;
    link.href = href;
    item.hidden = false;
  }

  settingsPromise.then(function (data) {
    var c = data.contact || {};
    var phone = String(c.phone || '').trim();
    var whatsapp = String(c.whatsapp || '').trim();
    var email = String(c.email || '').trim();

    var phoneDigits = digits(phone);
    fill('phone', phone, phoneDigits ? 'tel:' + (phone.charAt(0) === '+' ? '+' : '') + phoneDigits : '');

    var wa = toInternational(whatsapp);
    fill('whatsapp', whatsapp, wa ? 'https://wa.me/' + wa : '');

    fill('email', email, email ? 'mailto:' + email : '');
  });
})();
