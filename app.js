// Wok Two: comportamientos de la web (como lanubeburger.com, por petición).
// Cabecera que se oculta al bajar, barra de progreso, menú móvil, hero con dos diapositivas, aparición al hacer scroll,
// cifras que cuentan, parallax, carrusel de destacados, pestañas de la carta y estado de apertura.
// Sin JS todo se ve: el hero muestra su primera diapositiva y la carta se ve entera, sección tras sección.
(() => {
// --- Estado de apertura (hora de Madrid) ---
const status = () => {
const st = document.querySelector('[data-status]');
if (st) {
  const txt = st.querySelector('[data-status-text]');
  const parts = new Intl.DateTimeFormat('es-ES', { timeZone: 'Europe/Madrid', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' }).formatToParts(new Date());
  const m = +parts.find((p) => p.type === 'hour').value * 60 + +parts.find((p) => p.type === 'minute').value;
  const T = (h, mi) => h * 60 + mi;
  const [l1, l2, d1, d2] = [T(12, 0), T(16, 30), T(19, 0), T(24, 0)];
  const en = document.documentElement.lang === 'en';
  const M = en
    ? ['Open, serving until 16:30.', 'Open, serving until 24:00.', 'Closed, we open at 12:00.', 'Closed, we open at 19:00.', 'Closed, we open tomorrow at 12:00.']
    : ['Abierto, servimos hasta las 16:30.', 'Abierto, servimos hasta las 24:00.', 'Cerrado, abrimos a las 12:00.', 'Cerrado, abrimos a las 19:00.', 'Cerrado, mañana abrimos a las 12:00.'];
  let msg;
  if (m >= l1 && m < l2) msg = M[0];
  else if (m >= d1 && m < d2) msg = M[1];
  else if (m < l1) msg = M[2];
  else if (m < d1) msg = M[3];
  else msg = M[4];
  txt.textContent = msg;
}
};

let ctl;
const boot = (instant = false) => {
  ctl?.abort(); ctl = new AbortController(); const sig = { signal: ctl.signal };
  // Como en la web de referencia, las animaciones se muestran siempre, también con "reducir movimiento" activado en el sistema.
  const still = { matches: false };

  // --- Cabecera, barra de progreso y parallax: un solo manejador de scroll por frame ---
  const nav = document.querySelector('[data-nav]');
  const bar = document.querySelector('[data-progress]');
  const px = document.querySelector('[data-parallax]');
  const pxImg = px && px.querySelector('[data-parallax-img]');
  const menu = document.querySelector('[data-menu]');
  let lastY = scrollY, queued = false;
  // La barra pegada de la carta (categorías) sigue la posición REAL del borde de abajo de la cabecera en cada fotograma mientras esta
  // se mueve (aparece, se esconde, se encoge): así no puede quedar ningún hueco entre las dos.
  let navB = -1, navRun = 0, navUntil = 0;
  const trackNav = () => {
    navRun = 0;
    if (!nav) return;
    const b = Math.max(0, nav.getBoundingClientRect().bottom);
    if (b !== navB) { navB = b; document.documentElement.style.setProperty('--nav-b', b.toFixed(2) + 'px'); }
    if (performance.now() < navUntil) navRun = requestAnimationFrame(trackNav);
  };
  const kickNav = () => { navUntil = performance.now() + 600; if (!navRun) navRun = requestAnimationFrame(trackNav); };
  const onFrame = () => {
    queued = false;
    const y = scrollY, max = document.documentElement.scrollHeight - innerHeight;
    if (bar) bar.style.transform = `scaleX(${max > 0 ? Math.min(y / max, 1) : 0})`;
    if (nav) {
      nav.classList.toggle('is-scrolled', y > 50);
      const menuOpen = menu && menu.classList.contains('is-open');
      // Se esconde al bajar pasada la portada y vuelve en cuanto se sube.
      nav.classList.toggle('is-hidden', !menuOpen && y > lastY && y > 300);
      kickNav();
    }
    if (pxImg && !still.matches) {
      const r = px.getBoundingClientRect();
      if (r.bottom > 0 && r.top < innerHeight) {
        const off = (innerHeight / 2 - (r.top + r.height / 2)) * 0.15;
        pxImg.style.transform = `translateY(${Math.max(-90, Math.min(90, off))}px)`;
      }
    }
    lastY = y;
  };
  const ask = () => { if (!queued) { queued = true; requestAnimationFrame(onFrame); } };
  addEventListener('scroll', ask, { passive: true, signal: ctl.signal }); addEventListener('resize', ask, sig); onFrame();

  // --- Foto del plato: al pulsarla se abre grande; se cierra pulsando en cualquier sitio o con Escape ---
  let zoom;
  document.addEventListener('click', (e) => {
    const im = e.target.closest && e.target.closest('.mcard__img > img'); if (!im) return;
    if (!zoom) {
      zoom = document.createElement('dialog'); zoom.className = 'zoom';
      zoom.innerHTML = '<img alt=""><button type="button" class="zoom__x" aria-label="' + (document.documentElement.lang === 'en' ? 'Close' : 'Cerrar') + '">×</button>';
      zoom.addEventListener('click', () => zoom.close());
      document.body.append(zoom);
    }
    const z = zoom.querySelector('img'); z.src = im.currentSrc || im.src; z.alt = im.alt;
    zoom.showModal();
  }, sig);

  // --- Móvil: la descripción de cada plato se muestra al pulsar el botón ---
  document.addEventListener('click', (e) => {
    const b = e.target.closest && e.target.closest('.desc-toggle'); if (!b) return;
    const open = b.parentElement.classList.toggle('is-open');
    b.setAttribute('aria-expanded', open); b.textContent = open ? b.dataset.hide : b.dataset.show;
  }, sig);

  // --- Enlaces de la cabecera: al pulsar, el texto vuelve a rodar hacia arriba (como en el hover) ---
  // Si el enlace lleva a otra página, se espera un instante para que se vea el giro antes de cambiar.
  // Compara páginas sin fijarse en index.html ni en .html (hay servidores que las quitan: /carta en vez de /carta.html)
  const norm = (p) => p.replace(/(^|\/)index\.html$/, '$1').replace(/\.html$/, '').replace(/\/+$/, '');
  document.addEventListener('click', (e) => {
    // Un enlace de la cabecera o del menú a la página en la que ya estás (sin #): no hace nada.
    const nl = e.target.closest && e.target.closest('.nav a, .menu a');
    if (nl && nl.href && !nl.hash && !nl.hasAttribute('hreflang')) {
      const u = new URL(nl.href);
      if (u.origin === location.origin && u.search === '' && norm(u.pathname) === norm(location.pathname)) { e.preventDefault(); return; }
    }
    const a = e.target.closest && e.target.closest('.slide');
    if (!a || a.hasAttribute('hreflang')) return; // el botón de idioma no repite el giro al pulsar: ya rodó con el hover
    a.classList.remove('is-roll'); void a.offsetWidth; a.classList.add('is-roll');
    const go = a.href && !a.hasAttribute('hreflang') && !e.defaultPrevented && !e.button && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey
      && norm(new URL(a.href).pathname) !== norm(location.pathname);
    if (go) { e.preventDefault(); setTimeout(() => { location.href = a.href; }, 320); }
  }, { signal: ctl.signal });

  // --- Menú móvil ---
  const burger = document.querySelector('[data-burger]');
  if (burger && menu) {
    const set = (open) => {
      burger.setAttribute('aria-expanded', open);
      if (open) { menu.hidden = false; requestAnimationFrame(() => menu.classList.add('is-open')); }
      else { menu.classList.remove('is-open'); setTimeout(() => { if (!menu.classList.contains('is-open')) menu.hidden = true; }, 800); }
      document.body.style.overflow = open ? 'hidden' : '';
    };
    burger.addEventListener('click', () => set(burger.getAttribute('aria-expanded') !== 'true'));
    menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => set(false)));
    addEventListener('keydown', (e) => { if (e.key === 'Escape' && menu.classList.contains('is-open')) { set(false); burger.focus(); } }, sig);
  }

  // --- Hero: dos diapositivas que se alternan cada 6 s; las barras de abajo eligen una ---
  const hero = document.querySelector('[data-hero]');
  if (hero) {
    const slides = [...hero.querySelectorAll('[data-slide]')];
    const dots = [...hero.querySelectorAll('[data-dot]')];
    let cur = 0, timer = 0;
    const show = (n) => {
      cur = (n + slides.length) % slides.length;
      slides.forEach((s, i) => {
        const on = i === cur; s.classList.toggle('is-on', on);
        s.toggleAttribute('aria-hidden', !on);
        s.querySelectorAll('a').forEach((a) => { if (on) a.removeAttribute('tabindex'); else a.tabIndex = -1; });
      });
      dots.forEach((d, i) => { d.classList.toggle('is-on', i === cur); if (i === cur) d.setAttribute('aria-current', 'true'); else d.removeAttribute('aria-current'); });
    };
    const restart = () => { clearInterval(timer); if (!still.matches) timer = setInterval(() => { if (!document.hidden) show(cur + 1); }, 6000); };
    dots.forEach((d, i) => d.addEventListener('click', () => { show(i); restart(); }));
    hero.addEventListener('focusin', () => clearInterval(timer));
    hero.addEventListener('focusout', (e) => { if (!hero.contains(e.relatedTarget)) restart(); });
    restart();
    ctl.signal.addEventListener('abort', () => clearInterval(timer));
  }

  // --- Aparición al hacer scroll y cifras que cuentan ---
  const reveals = document.querySelectorAll('.reveal');
  const counters = document.querySelectorAll('[data-count]');
  if (instant) { reveals.forEach((el) => el.classList.add('visible')); counters.forEach((el) => { el.textContent = el.dataset.count; }); }
  else if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
    }), { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    reveals.forEach((el) => io.observe(el));
    if (!still.matches) {
      const count = (el) => {
        const end = +el.dataset.count, t0 = performance.now(), D = 2000;
        const step = (t) => { const p = Math.min((t - t0) / D, 1); el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); };
        requestAnimationFrame(step);
      };
      const co = new IntersectionObserver((entries) => entries.forEach((e) => { if (e.isIntersecting) { count(e.target); co.unobserve(e.target); } }), { threshold: 0.5 });
      counters.forEach((el) => { el.textContent = '0'; co.observe(el); });
    }
  } else reveals.forEach((el) => el.classList.add('visible'));

  // --- Carrusel de destacados: flechas que avanzan una tarjeta ---
  const rail = document.querySelector('[data-rail]');
  if (rail) {
    const track = rail.querySelector('[data-rail-track]');
    const prev = rail.querySelector('[data-rail-prev]'), next = rail.querySelector('[data-rail-next]');
    const stepW = () => { const c = track.firstElementChild; return c ? c.getBoundingClientRect().width + 24 : 300; };
    const sync = () => { prev.disabled = track.scrollLeft <= 2; next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2; };
    prev.addEventListener('click', () => track.scrollBy({ left: -stepW(), behavior: still.matches ? 'auto' : 'smooth' }));
    next.addEventListener('click', () => track.scrollBy({ left: stepW(), behavior: still.matches ? 'auto' : 'smooth' }));
    track.addEventListener('scroll', sync, { passive: true }); addEventListener('resize', sync, sig); sync();
  }

  // --- Carta: pestañas ---
  const carta = document.querySelector('[data-carta]');
  if (carta) {
    const cats = [...carta.querySelectorAll('.cat')];
    const panels = [...carta.querySelectorAll('.panel')];
    const list = carta.querySelector('.cats');
    const panelsBox = carta.querySelector('.panels');

    list.setAttribute('role', 'tablist'); list.setAttribute('aria-orientation', 'horizontal');
    cats.forEach((c) => { c.setAttribute('role', 'tab'); c.removeAttribute('aria-current'); c.id = 'tab-' + c.dataset.cat; c.setAttribute('aria-controls', 'c-' + c.dataset.cat); });
    panels.forEach((p) => { p.setAttribute('role', 'tabpanel'); p.setAttribute('aria-labelledby', 'tab-' + p.dataset.panel); });

    // Al cambiar de sección, si el principio de la carta quedó por encima, se vuelve a él.
    const keepInView = () => {
      const navH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-b')) || 0;
      const top = panelsBox.getBoundingClientRect().top + scrollY - carta.querySelector('.cats-bar').offsetHeight - navH - 16;
      if (scrollY > top + 1) scrollTo({ top, behavior: still.matches ? 'auto' : 'smooth' });
    };
    const revealTab = (c) => {
      if (list.scrollWidth <= list.clientWidth) return;
      const l = c.offsetLeft - list.offsetLeft, r = l + c.offsetWidth;
      if (l < list.scrollLeft || r > list.scrollLeft + list.clientWidth) list.scrollTo({ left: l - 16, behavior: still.matches ? 'auto' : 'smooth' });
    };
    const show = (id, { focus = false, user = false } = {}) => {
      cats.forEach((c) => { const on = c.dataset.cat === id; c.setAttribute('aria-selected', on); c.tabIndex = on ? 0 : -1; if (on) { if (focus) c.focus({ preventScroll: true }); revealTab(c); } });
      panels.forEach((p) => p.classList.toggle('is-open', p.dataset.panel === id));
      if (user) keepInView();
    };
    cats.forEach((c, i) => {
      c.addEventListener('click', (e) => { e.preventDefault(); show(c.dataset.cat, { user: true }); history.replaceState(null, '', '#c-' + c.dataset.cat); });
      c.addEventListener('keydown', (e) => {
        const k = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
        const to = (n) => { e.preventDefault(); show(cats[n].dataset.cat, { focus: true, user: true }); };
        if (k) to((i + k + cats.length) % cats.length);
        if (e.key === 'Home') to(0);
        if (e.key === 'End') to(cats.length - 1);
      });
    });
    // Un enlace directo a una sección (carta.html#c-fideos) abre esa sección.
    const fromHash = () => { const id = location.hash.replace('#c-', ''); return cats.some((c) => c.dataset.cat === id) ? id : null; };
    show(fromHash() || cats[0].dataset.cat);
    addEventListener('hashchange', () => { const id = fromHash(); if (id) show(id, { user: true }); }, sig);
  }

  status();

  // Imágenes que no cargan: se quitan para que se vea el hueco de color.
  document.querySelectorAll('[data-slot] img').forEach((i) => { if (i.complete && !i.naturalWidth) i.remove(); else i.addEventListener('error', () => i.remove(), { once: true }); });
};
// Foto de las dos versiones (antes de que el JS toque nada): cada página lleva dentro la otra, así no hace falta fetch y funciona también abriendo el archivo directamente.
const box = document.getElementById('alt-lang');
const cur = document.documentElement.lang, other = cur === 'en' ? 'es' : 'en';
const docs = {};
if (box) {
  const mine = document.documentElement.cloneNode(true); mine.querySelector('#alt-lang').remove();
  docs[cur] = '<!doctype html>' + mine.outerHTML;
  docs[other] = box.textContent.split('<\\/script').join('</script');
}
boot();

// --- Cambio de idioma sin recargar: cada página lleva dentro la otra versión; se cambia el contenido y se conserva el scroll ---
// (no usa fetch, así que también funciona abriendo el archivo directamente, sin servidor)
if (box) {
  // La dirección no cambia al cambiar de idioma: al abrir o recargar la página siempre sale en español.
  const swap = (lang, url) => {
    try {
      const doc = new DOMParser().parseFromString(docs[lang], 'text/html');
      // Las rutas relativas de esa versión (../images/…, carta.html…) se pasan a absolutas respecto a su propia página.
      const abs = (el, attr) => { const v = el.getAttribute(attr); if (v && !/^(#|[a-z][a-z0-9+.-]*:|\/\/)/i.test(v)) el.setAttribute(attr, new URL(v, url).href); };
      doc.body.querySelectorAll('[href]').forEach((el) => abs(el, 'href'));
      doc.body.querySelectorAll('[src]').forEach((el) => abs(el, 'src'));
      const y = scrollY;
      const apply = () => {
        document.documentElement.lang = doc.documentElement.lang;
        document.title = doc.title;
        const d = document.querySelector('meta[name="description"]'), nd = doc.querySelector('meta[name="description"]');
        if (d && nd) d.content = nd.content;
        // Se cambian solo los textos y enlaces: la página, el scroll, las imágenes y las animaciones no se tocan.
        // Si alguna parte no tiene la misma estructura (p. ej. una imagen quitada), se sustituye solo esa parte.
        let replaced = false;
        const kids = (n) => [...n.childNodes].filter((c) => c.nodeName !== 'SCRIPT' && c.nodeType !== 8 && !(c.nodeType === 3 && !c.nodeValue.trim()));
        const sync = (a, b) => {
          if (a.nodeType !== b.nodeType || a.nodeName !== b.nodeName) return false;
          if (a.nodeType === 3) { if (a.nodeValue !== b.nodeValue) a.nodeValue = b.nodeValue; return true; }
          if (a.nodeType !== 1) return true;
          if (a.hasAttribute('data-dynamic')) return true; // lo pinta cart.js (carrito, horas…)
          for (const n of ['href', 'alt', 'aria-label', 'data-text', 'title', 'lang', 'hreflang', 'content']) {
            const v = b.getAttribute(n);
            if (v !== null && a.getAttribute(n) !== v) a.setAttribute(n, v);
          }
          if (a.hasAttribute('src') && b.hasAttribute('src') && a.src !== b.getAttribute('src')) a.setAttribute('src', b.getAttribute('src'));
          const ka = kids(a), kb = kids(b);
          if (ka.length !== kb.length) return false;
          ka.forEach((c, i) => { if (!sync(c, kb[i])) { c.replaceWith(document.importNode(kb[i], true)); replaced = true; } });
          return true;
        };
        if (!sync(document.body, doc.body)) { location.href = url; return; }
        document.body.style.overflow = '';
        status();
        if (replaced) boot(true);
        scrollTo(0, y);
      };
      apply();
    } catch (err) { console.error('Cambio de idioma sin recarga falló, se recarga la página:', err); location.href = url; }
  };
  addEventListener('click', (e) => {
    const a = e.target.closest && e.target.closest('a[hreflang]');
    if (!a || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    const lang = a.getAttribute('hreflang'), url = a.href.split('#')[0];
    swap(lang, url);
  });
}
})();
