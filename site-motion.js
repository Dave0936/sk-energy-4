// SK Energy — shared premium motion layer. Progressive enhancement only: every page works without it.
(function () {
  if (window.__skMotion) return; window.__skMotion = true;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const ease = [0.22, 1, 0.36, 1];
  const LIME = '#CBF24C', INK = '#0E1110';
  const whenMotion = (fn) => { if (window.Motion) fn(window.Motion); else setTimeout(() => whenMotion(fn), 80); };
  const load = (src) => new Promise((r) => { const s = document.createElement('script'); s.src = src; s.onload = r; s.onerror = r; document.head.appendChild(s); });
  const css = document.createElement('style');
  css.textContent = `
  html.lenis,html.lenis body{height:auto}.lenis.lenis-smooth{scroll-behavior:auto!important}.lenis.lenis-stopped{overflow:hidden}
  .sk-curtain{position:fixed;inset:0;z-index:9999;background:${LIME};pointer-events:none;display:grid;place-items:center;transform-origin:50% 0}
  .sk-curtain img{width:clamp(180px,26vw,360px);height:auto;display:block}
  .sk-cursor{position:fixed;left:0;top:0;z-index:9998;pointer-events:none;width:12px;height:12px;margin:-6px 0 0 -6px;border-radius:50%;background:${INK};display:grid;place-items:center;transition:width .35s cubic-bezier(.22,1,.36,1),height .35s cubic-bezier(.22,1,.36,1),margin .35s cubic-bezier(.22,1,.36,1),background .3s,opacity .3s;opacity:0}
  .sk-cursor b{font:700 13px/1 'Satoshi',sans-serif;color:${INK};opacity:0;transition:opacity .2s}
  .sk-cursor.is-view{width:88px;height:88px;margin:-44px 0 0 -44px;background:${LIME}}.sk-cursor.is-view b{opacity:1}
  .sk-cursor.is-link{width:44px;height:44px;margin:-22px 0 0 -22px;background:rgba(203,242,76,.35)}
  .sk-top{position:fixed;right:clamp(14px,2vw,28px);bottom:clamp(14px,2vw,28px);z-index:40;width:52px;height:52px;border-radius:50%;border:0;background:${INK};color:${LIME};font:700 20px/1 'Satoshi',sans-serif;cursor:pointer;display:grid;place-items:center;opacity:0;transform:translateY(16px);pointer-events:none;transition:opacity .4s,transform .4s cubic-bezier(.22,1,.36,1)}
  .sk-top.on{opacity:1;transform:none;pointer-events:auto}
  .sk-progress{position:fixed;left:0;top:0;height:3px;width:100%;z-index:61;background:${INK};transform-origin:0 50%;transform:scaleX(0);pointer-events:none}
  @media (prefers-reduced-motion: reduce){.sk-curtain{display:none}}`;
  document.head.appendChild(css);

  // Page transition curtain
  const curtain = document.createElement('div'); curtain.className = 'sk-curtain'; curtain.setAttribute('aria-hidden', 'true'); curtain.innerHTML = '<img src="./assets/sk-logo-dark.svg" alt="">';
  const isInternal = (a) => {
    if (!a || a.target === '_blank' || a.hasAttribute('download')) return false;
    const href = a.getAttribute('href') || ''; if (!href || href.startsWith('#') || /^(mailto|tel):/i.test(href)) return false;
    try { const u = new URL(href, location.href); if (u.origin !== location.origin) return false; if (u.pathname === location.pathname && u.search === location.search && u.hash) return false; return /\.dc\.html$/i.test(decodeURIComponent(u.pathname)); } catch (e) { return false; }
  };
  const boot = () => {
    if (!reduced) { document.body.appendChild(curtain); whenMotion(({ animate }) => { const logo = curtain.firstChild; animate(logo, { opacity: [0, 1], transform: ['translateY(24px) scale(.96)', 'translateY(0px) scale(1)'] }, { duration: 0.4, ease }); animate(logo, { opacity: [1, 0], transform: ['translateY(0px)', 'translateY(-30px)'] }, { duration: 0.35, delay: 0.75, ease }); animate(curtain, { transform: ['scaleY(1)', 'scaleY(0)'] }, { duration: 0.8, delay: 0.9, ease: [0.76, 0, 0.24, 1] }); }); }
    document.addEventListener('click', (e) => {
      if (reduced || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target.closest && e.target.closest('a'); if (!isInternal(a)) return;
      e.preventDefault(); const href = a.href;
      whenMotion(({ animate }) => { curtain.style.transformOrigin = '50% 100%'; const logo = curtain.firstChild; logo.style.opacity = '0'; animate(curtain, { transform: ['scaleY(0)', 'scaleY(1)'] }, { duration: 0.6, ease: [0.76, 0, 0.24, 1] }); animate(logo, { opacity: [0, 1], transform: ['translateY(24px)', 'translateY(0px)'] }, { duration: 0.35, delay: 0.25, ease }).then(() => { location.href = href; }); });
    });
    addEventListener('pageshow', (e) => { if (e.persisted) { curtain.style.transform = 'scaleY(0)'; } });

    // Smooth scroll
    if (!reduced && fine) load('https://unpkg.com/lenis@1.1.13/dist/lenis.min.js').then(() => {
      if (!window.Lenis) return;
      document.documentElement.style.scrollBehavior = 'auto';
      const lenis = new window.Lenis({ duration: 1.15, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
      window.skLenis = lenis;
      const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); }; requestAnimationFrame(raf);
      document.addEventListener('click', (e) => { const a = e.target.closest && e.target.closest('a[href^="#"]'); if (!a) return; const id = a.getAttribute('href'); if (id.length < 2) return; const t = document.querySelector(id); if (!t) return; e.preventDefault(); lenis.scrollTo(t, { offset: -80 }); });
    });

    // Back to top + progress
    const top = document.createElement('button'); top.className = 'sk-top'; top.type = 'button'; top.setAttribute('aria-label', 'Back to top'); top.textContent = '↑';
    top.onclick = () => window.skLenis ? window.skLenis.scrollTo(0) : scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
    document.body.appendChild(top);
    const prog = document.createElement('div'); prog.className = 'sk-progress'; prog.setAttribute('aria-hidden', 'true'); document.body.appendChild(prog);
    const onScroll = () => { const h = document.documentElement.scrollHeight - innerHeight; const p = h > 0 ? scrollY / h : 0; prog.style.transform = 'scaleX(' + p.toFixed(4) + ')'; top.classList.toggle('on', scrollY > innerHeight * 1.2); };
    addEventListener('scroll', onScroll, { passive: true }); onScroll();

    // Cursor follower
    if (fine && !reduced) {
      const cur = document.createElement('div'); cur.className = 'sk-cursor'; cur.innerHTML = '<b>View</b>'; cur.setAttribute('aria-hidden', 'true'); document.body.appendChild(cur);
      let x = -100, y = -100, cx = x, cy = y;
      addEventListener('pointermove', (e) => { x = e.clientX; y = e.clientY; cur.style.opacity = '1';
        const a = e.target.closest && e.target.closest('a,button,[role="tab"],input,select,textarea,label');
        const view = a && a.tagName === 'A' && a.querySelector('img') && !a.closest('header,footer');
        cur.classList.toggle('is-view', !!view); cur.classList.toggle('is-link', !!a && !view); }, { passive: true });
      document.addEventListener('pointerleave', () => { cur.style.opacity = '0'; });
      const tick = () => { cx += (x - cx) * 0.18; cy += (y - cy) * 0.18; cur.style.transform = `translate3d(${cx}px,${cy}px,0)`; requestAnimationFrame(tick); }; tick();
    }
    fills(); safety();
    scan(); new MutationObserver(() => { clearTimeout(scan.t); scan.t = setTimeout(scan, 120); }).observe(document.body, { childList: true, subtree: true });
    marquees();
  };

  // Per-element enhancements (idempotent)
  function scan() {
    whenMotion((M) => {
      const { animate, inView } = M;
      // Magnetic pill buttons
      if (fine && !reduced) document.querySelectorAll('a[style*="border-radius: 300px"],button[style*="border-radius: 300px"],a[style*="border-radius:300px"],button[style*="border-radius:300px"]').forEach((el) => {
        if (el.__mag || el.closest('header')) return; el.__mag = true;
        el.addEventListener('pointermove', (e) => { const r = el.getBoundingClientRect(); const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2); el.style.translate = `${dx * 0.18}px ${dy * 0.28}px`; });
        el.addEventListener('pointerleave', () => { animate(el, { translate: '0px 0px' }, { type: 'spring', stiffness: 260, damping: 14 }); });
      });
      if (reduced) return;
      // Image wipe reveal on image containers
      document.querySelectorAll('main img').forEach((img) => {
        const box = img.closest('[data-m="parallax"]') ? img.closest('[data-m="parallax"]').parentElement : img.parentElement;
        if (!box || box.__wipe || box.closest('[data-m="hero-panel"],[data-hero-track]') || box.offsetHeight < 80) return; box.__wipe = true;
        const r = box.getBoundingClientRect(); if (r.top < innerHeight * 0.9) return;
        inView(box, () => { const a = animate(box, { clipPath: ['inset(12% 6% 12% 6%)', 'inset(0% 0% 0% 0%)'] }, { duration: 1.3, ease }); const done = () => { box.style.clipPath = ''; }; a.then(done); setTimeout(done, 1600); }, { amount: 0 });
      });
      // Count-up numbers
      document.querySelectorAll('[data-count]').forEach((el) => {
        if (el.__cnt) return; el.__cnt = true; const end = parseFloat(el.dataset.count); const suf = el.dataset.suffix || '';
        inView(el, () => { animate(0, end, { duration: 1.6, ease, onUpdate: (v) => { el.textContent = (end % 1 ? v.toFixed(1) : Math.round(v)) + suf; } }); }, { amount: 0.5 });
      });
    });
  }

  // Safety net: never leave reveal elements hidden once they're on screen
  function safety() {
    const io = new IntersectionObserver((ents) => ents.forEach((en) => { if (!en.isIntersecting) return; const el = en.target; setTimeout(() => { if (parseFloat(getComputedStyle(el).opacity) < 0.05 || el.style.clipPath) { el.style.opacity = '1'; el.style.transform = 'none'; el.style.clipPath = ''; } }, 1600); io.unobserve(el); }));
    const find = () => document.querySelectorAll('[data-m="reveal"],[data-m="hero"],main h1,main h2').forEach((el) => { if (el.__safe) return; el.__safe = true; io.observe(el); });
    find(); setInterval(find, 1500);
  }

  // Scroll-scrubbed statement fill: words go from lime to ink (highlighted words settle on deep lime)
  function fills() {
    const els = [];
    const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
    const FROM = hex('#CBF24C'), TO = hex('#0E1110'), HI = hex('#A8CC2A');
    const mix = (a, b, t) => 'rgb(' + a.map((v, i) => Math.round(v + (b[i] - v) * t)).join(',') + ')';
    const prep = (el) => {
      if (el.__fill || !el.textContent.trim()) return; el.__fill = true;
      const walk = (node, hi) => { Array.from(node.childNodes).forEach((n) => {
        if (n.nodeType === 3) { const parts = n.textContent.split(/(\s+)/); const frag = document.createDocumentFragment();
          parts.forEach((p) => { if (!p) return; if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(p)); return; } const w = document.createElement('span'); w.textContent = p; w.dataset.w = hi ? 'hi' : ''; frag.appendChild(w); });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) { const c = getComputedStyle(n).color.replace(/\s/g, ''); const isHi = hi || c === 'rgb(168,204,42)' || c === 'rgb(203,242,76)'; if (isHi) n.style.color = ''; walk(n, isHi); }
      }); };
      walk(el, false); el.__words = Array.from(el.querySelectorAll('span[data-w]')); els.push(el);
    };
    const paint = () => { els.forEach((el) => { const r = el.getBoundingClientRect(); const start = innerHeight * 0.88, end = innerHeight * 0.35;
      const p = reduced ? 1 : Math.min(1, Math.max(0, (start - r.top) / Math.max(1, (start - end) + r.height * 0.6))); const n = el.__words.length;
      el.__words.forEach((w, i) => { const t = Math.min(1, Math.max(0, p * (n + 3) - i) / 3); w.style.color = mix(FROM, w.dataset.w ? HI : TO, t); }); }); };
    const find = () => { document.querySelectorAll('[data-fill]').forEach(prep); paint(); };
    setTimeout(find, 300); setInterval(find, 1500);
    addEventListener('scroll', () => requestAnimationFrame(paint), { passive: true }); addEventListener('resize', paint);
  }

  // Scroll-velocity marquees: [data-marquee] > [data-marquee-track] containing two identical halves
  function marquees() {
    const items = []; let last = scrollY, vel = 0;
    const find = () => document.querySelectorAll('[data-marquee-track]').forEach((t) => { if (t.__mq) return; t.__mq = { x: 0, dir: t.closest('[data-marquee]').dataset.marquee === 'right' ? 1 : -1 }; items.push(t); });
    find(); setInterval(find, 1000);
    const tick = () => {
      const s = scrollY; vel += ((s - last) - vel) * 0.1; last = s;
      items.forEach((t) => { const st = t.__mq; const half = t.scrollWidth / 2 || 1; const speed = reduced ? 0 : (0.6 + Math.min(6, Math.abs(vel) * 0.25)); st.x += st.dir * speed; if (st.x <= -half) st.x += half; if (st.x > 0) st.x -= half; t.style.transform = `translate3d(${st.x}px,0,0) skewX(${reduced ? 0 : Math.max(-8, Math.min(8, -vel * 0.15))}deg)`; });
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
