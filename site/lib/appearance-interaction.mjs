// Keep this self-contained: it runs in the head before any framework downloads.
export function installAppearanceInteraction() {
  if (window.__archiveAppearanceInstalled) return;
  window.__archiveAppearanceInstalled = true;
  const root = document.documentElement;
  // Labels/icons follow the root theme through CSS, leaving React's server DOM
  // intact until hydration; editing its text here would trigger a recovery reset.
  const style = document.createElement('style');
  style.textContent = `
    .appearance-toggle>span,.appearance-toggle>svg{display:none!important}
    .appearance-toggle::after{content:'Dark'}
    html[lang^="zh"] .appearance-toggle::after{content:'深色'}
    html[data-theme="dark"] .appearance-toggle::after{content:'Light'}
    html[lang^="zh"][data-theme="dark"] .appearance-toggle::after{content:'浅色'}
    .appearance-toggle::before{content:'';display:block;width:17px;height:17px;flex-shrink:0;background:currentColor;mask:center/contain no-repeat url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' d='M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6.25 6.25 0 0 0 8.268 8.268c.344-.215.825-.004.803.401'/%3E%3C/svg%3E")}
    html[data-theme="dark"] .appearance-toggle::before{mask-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Ccircle fill='none' stroke='black' stroke-width='2' cx='12' cy='12' r='4'/%3E%3Cpath fill='none' stroke='black' stroke-width='2' stroke-linecap='round' d='M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42'/%3E%3C/svg%3E")}
  `;
  document.head.appendChild(style);
  function syncButtons() {
    const dark = root.dataset.theme === 'dark';
    const zh = root.lang.startsWith('zh');
    for (const button of document.querySelectorAll('.appearance-toggle')) {
      const label = dark ? (zh ? '切换为浅色模式' : 'Switch to light mode') : (zh ? '切换为深色模式' : 'Switch to dark mode');
      button.setAttribute('aria-label', label);
      button.setAttribute('title', label);

    }
  }
  function apply(theme) {
    root.dataset.theme = theme;
    root.classList.toggle('dark', theme === 'dark');
    syncButtons();
    window.dispatchEvent(new Event('archive-appearance-change'));
  }
  document.addEventListener('click', (event) => {
    const button = event.target instanceof Element ? event.target.closest('button.appearance-toggle') : null;
    if (!button || button.disabled) return;
    // Own the event before React can queue/replay it during late hydration.
    event.preventDefault();
    event.stopImmediatePropagation();
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    apply(next);
    try { localStorage.setItem('archive-appearance', next); } catch {}
    try { sessionStorage.removeItem('archive-preview-theme'); } catch {}
    const url = new URL(window.location.href);
    if (['light', 'dark'].includes(url.searchParams.get('preview-theme'))) {
      url.searchParams.delete('preview-theme');
      window.history.replaceState(window.history.state, '', url.pathname + url.search + url.hash);
      window.dispatchEvent(new Event('archive-search'));
    }
  }, true);
  window.addEventListener('storage', (event) => {
    if (event.key === 'archive-appearance' || event.key === null) apply(event.newValue === 'dark' ? 'dark' : 'light');
  });
  document.addEventListener('DOMContentLoaded', syncButtons, {once:true});
}

export const appearanceInteraction = `(${installAppearanceInteraction.toString()})();`;

// Stream the small controller into existing pre-rendered pages without rebuilding
// or re-uploading the research corpus. Also used by the isolated hotfix release.
export function withAppearanceInteraction(response) {
  if (response.status !== 200 || !response.headers.get('content-type')?.includes('text/html')) return response;
  const headers = new Headers(response.headers);
  headers.delete('content-length');
  headers.delete('etag');
  headers.set('X-Archive-Appearance', 'early-interaction-v1');
  return new HTMLRewriter().on('head', {
    element(head) { head.append(`<script>${appearanceInteraction}</script>`, {html:true}); }
  }).transform(new Response(response.body, {status:response.status, headers}));
}
