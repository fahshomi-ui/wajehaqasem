(() => {
  const preferenceKey = 'alwasim_consent_v1';
  const tagId = 'AW-18502183012';
  // Page-view conversion, sent on pages whose <body> has data-ads-conversion="page-view".
  const conversionId = 'AW-18502183012/exieCLGkuZgdEOTQw_ZE';
  let tagLoaded = false;
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  const settings = (state) => ({
    ad_storage: state,
    analytics_storage: state,
    ad_user_data: state,
    ad_personalization: state
  });
  window.gtag('consent', 'default', settings('denied'));

  function loadTag() {
    if (tagLoaded) return;
    tagLoaded = true;
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${tagId}`;
    document.head.appendChild(script);
    window.gtag('js', new Date());
    window.gtag('config', tagId);
    if (document.body && document.body.dataset.adsConversion === 'page-view') {
      window.gtag('event', 'conversion', { send_to: conversionId, value: 1.0, currency: 'USD' });
    }
  }

  function readPreference() {
    try {
      const value = localStorage.getItem(preferenceKey);
      return value === 'granted' || value === 'denied' ? value : null;
    } catch { return null; }
  }

  const banner = document.querySelector('#consent-banner');
  const preference = readPreference();
  if (preference === 'granted') {
    window.gtag('consent', 'update', settings('granted'));
    loadTag();
  }
  banner.hidden = preference !== null;

  for (const button of document.querySelectorAll('[data-consent]')) {
    button.addEventListener('click', () => {
      const choice = button.dataset.consent;
      try { localStorage.setItem(preferenceKey, choice); } catch { /* Preference applies for this visit. */ }
      window.gtag('consent', 'update', settings(choice));
      banner.hidden = true;
      if (choice === 'granted') loadTag();
      else if (tagLoaded) window.location.reload();
    });
  }
  for (const button of document.querySelectorAll('[data-consent-settings]')) {
    button.addEventListener('click', () => {
      banner.hidden = false;
      banner.querySelector('[data-consent="denied"]').focus();
    });
  }
})();
