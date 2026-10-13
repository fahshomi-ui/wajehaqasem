// Reads the single link saved from /admin and applies it to both choice buttons.
(function () {
  var buttons = document.querySelectorAll('.choice');
  if (!buttons.length) return;

  var linkPromise = fetch('/api/links', { cache: 'no-store' })
    .then(function (res) { return res.ok ? res.json() : {}; })
    .then(function (data) { return (data && data.link) || ''; })
    .catch(function () { return ''; });

  buttons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      linkPromise.then(function (url) {
        if (url) window.location.href = url;
      });
    });
  });
})();
