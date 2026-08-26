// Tatildokya Travels — "X people are viewing this tour" floating badge.
// This is a simulated/plausible live-visitor indicator, not a real
// concurrent-session counter (that would require realtime infrastructure
// this small business doesn't need). The number stays in a small, believable
// range and drifts slightly over time so it doesn't feel static. Self-
// contained: creates its own floating element, so no per-page HTML is
// needed — just include this script.
(function () {
  const TEXT = {
    en: (n) => `${n} people are viewing this tour`,
    tr: (n) => `${n} kişi bu turu inceliyor`,
    es: (n) => `${n} personas están viendo este tour`,
  };

  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function init() {
    const lang = (document.documentElement.lang || 'en').slice(0, 2);
    const textFn = TEXT[lang] || TEXT.en;
    let count = randomInt(4, 10);

    const el = document.createElement('div');
    el.id = 'tbc-viewer-count-badge';
    el.setAttribute('role', 'status');
    el.setAttribute('aria-live', 'polite');
    Object.assign(el.style, {
      position: 'fixed',
      left: '14px',
      bottom: '14px',
      zIndex: '9998',
      background: 'rgba(15, 23, 42, 0.92)',
      color: '#f8fafc',
      padding: '9px 14px',
      borderRadius: '999px',
      fontSize: '12.5px',
      fontWeight: '700',
      display: 'flex',
      alignItems: 'center',
      gap: '7px',
      boxShadow: '0 6px 18px rgba(0,0,0,0.25)',
      pointerEvents: 'none',
      maxWidth: 'calc(100vw - 28px)',
    });

    const dot = document.createElement('span');
    Object.assign(dot.style, {
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      background: '#22c55e',
      flex: '0 0 auto',
      boxShadow: '0 0 0 0 rgba(34,197,94,0.7)',
      animation: 'tbcViewerPulse 1.8s infinite',
    });

    const label = document.createElement('span');
    const render = () => { label.textContent = textFn(count); };
    render();

    el.appendChild(dot);
    el.appendChild(label);
    document.body.appendChild(el);

    if (!document.getElementById('tbc-viewer-count-style')) {
      const style = document.createElement('style');
      style.id = 'tbc-viewer-count-style';
      style.textContent = `
        @keyframes tbcViewerPulse {
          0% { box-shadow: 0 0 0 0 rgba(34,197,94,0.6); }
          70% { box-shadow: 0 0 0 6px rgba(34,197,94,0); }
          100% { box-shadow: 0 0 0 0 rgba(34,197,94,0); }
        }
        @media (max-width: 480px) {
          #tbc-viewer-count-badge { font-size: 11.5px !important; padding: 7px 12px !important; }
        }
      `;
      document.head.appendChild(style);
    }

    setInterval(() => {
      const delta = randomInt(-1, 1);
      count = Math.min(10, Math.max(4, count + delta));
      render();
    }, 15000 + randomInt(0, 5000));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
