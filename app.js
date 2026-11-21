// Wok Two: comportamientos de la web (como lanubeburger.com, por petición).
// Cabecera que se oculta al bajar, barra de progreso, menú móvil, hero con dos diapositivas, aparición al hacer scroll,
// cifras que cuentan, parallax, carrusel de destacados, pestañas de la carta y estado de apertura.
// Sin JS todo se ve: el hero muestra su primera diapositiva y la carta se ve entera, sección tras sección.
// Con "reducir movimiento" activado en el sistema no hay movimiento automático (diapositivas, cifras, parallax, scroll suave).
(() => {
const root = document.documentElement;
const en = root.lang === 'en';
const still = matchMedia('(prefers-reduced-motion: reduce)');
const smooth = () => (still.matches ? 'auto' : 'smooth');

// --- Utilidades que también usa cart.js (se carga después) ---
// Compara páginas sin fijarse en index.html ni en .html (hay servidores que las quitan: /carta en vez de /carta.html)
const norm = (p) => p.replace(/(^|\/)index\.html$/, '$1').replace(/\.html$/, '').replace(/\/+$/, '');
// Minutos desde medianoche en Málaga, sea cual sea la zona horaria del visitante
const nowMadrid = () => {
  const p = new Intl.DateTimeFormat('es-ES', { timeZone: 'Europe/Madrid', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' }).formatToParts(new Date());
  return +p.find((x) => x.type === 'hour').value * 60 + +p.find((x) => x.type === 'minute').value;
};
const hhmm = (m) => String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
// Horario (sale de HOURS en build.mjs): [[inicio, fin], …] en minutos
const hours = (root.dataset.hours || '').split(',').filter(Boolean)
  .map((r) => r.split('-').map((t) => { const [h, m] = t.split(':'); return h * 60 + +m; }));
window.WokTwo = { norm, nowMadrid, hhmm, hours };

// --- Estado de apertura (hora de Madrid) ---
const txt = document.querySelector('[data-status-text]');
if (txt && hours.length) {
  const m = nowMadrid();
  const open = hours.find(([a, b]) => m >= a && m < b);
  const next = hours.find(([a]) => m < a);
  txt.textContent = open ? (en ? `Open, serving until ${hhmm(open[1])}.` : `Abierto, servimos hasta las ${hhmm(open[1])}.`)
    : next ? (en ? `Closed, we open at ${hhmm(next[0])}.` : `Cerrado, abrimos a las ${hhmm(next[0])}.`)
    : (en ? `Closed, we open tomorrow at ${hhmm(hours[0][0])}.` : `Cerrado, mañana abrimos a las ${hhmm(hours[0][0])}.`);
}

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
  const b = Math.max(0, nav.getBoundingClientRect().bottom);
  if (b !== navB) { navB = b; root.style.setProperty('--nav-b', b.toFixed(2) + 'px'); }
  if (performance.now() < navUntil) navRun = requestAnimationFrame(trackNav);
};
const kickNav = () => { navUntil = performance.now() + 600; if (!navRun) navRun = requestAnimationFrame(trackNav); };
const onFrame = () => {
  queued = false;
  const y = scrollY, max = root.scrollHeight - innerHeight;
  if (bar) bar.style.transform = `scaleX(${max > 0 ? Math.min(y / max, 1) : 0})`;
  if (nav) {
    nav.classList.toggle('is-scrolled', y > 50);
    const menuOpen = menu && menu.classList.contains('is-open');
    // Se esconde al bajar pasada la portada y vuelve en cuanto se sube.
    nav.classList.toggle('is-hidden', !menuOpen && y > lastY && y > 300);
    kickNav();
  }
  if (pxImg) {
    const r = px.getBoundingClientRect();
    const off = still.matches ? 0 : (innerHeight / 2 - (r.top + r.height / 2)) * 0.15;
    if (r.bottom > 0 && r.top < innerHeight) pxImg.style.transform = `translateY(${Math.max(-90, Math.min(90, off))}px)`;
  }
  lastY = y;
};
const ask = () => { if (!queued) { queued = true; requestAnimationFrame(onFrame); } };
addEventListener('scroll', ask, { passive: true }); addEventListener('resize', ask); onFrame();

// --- Clics: foto ampliada, descripción plegable (móvil) y enlaces de la cabecera ---
let zoom;
document.addEventListener('click', (e) => {
  const t = e.target;
  if (!t.closest) return;

  // Foto del plato: al pulsarla se abre grande; se cierra pulsando en cualquier sitio o con Escape
  const im = t.closest('.mcard__img > img, .story__photo img');
  if (im) {
    if (!zoom) {
      zoom = document.createElement('dialog'); zoom.className = 'zoom';
      zoom.innerHTML = `<img alt=""><button type="button" class="zoom__x" aria-label="${en ? 'Close' : 'Cerrar'}">×</button>`;
      zoom.addEventListener('click', () => zoom.close());
      document.body.append(zoom);
    }
    const z = zoom.querySelector('img'); z.src = im.currentSrc || im.src; z.alt = im.alt;
    zoom.showModal();
    return;
  }

  // Móvil: la descripción de cada plato se muestra al pulsar el botón
  const b = t.closest('.desc-toggle');
  if (b) {
    const open = b.parentElement.classList.toggle('is-open');
    b.setAttribute('aria-expanded', open); b.textContent = open ? b.dataset.hide : b.dataset.show;
    return;
  }

  // Un enlace de la cabecera o del menú a la página en la que ya estás (sin #): no hace nada.
  const nl = t.closest('.nav a, .menu a');
  if (nl && nl.href && !nl.hash && !nl.hasAttribute('hreflang')) {
    const u = new URL(nl.href);
    if (u.origin === location.origin && u.search === '' && norm(u.pathname) === norm(location.pathname)) { e.preventDefault(); return; }
  }
  // Al pulsar un enlace de la cabecera, el texto vuelve a rodar hacia arriba (como en el hover).
  // El botón de idioma no: ya rodó con el hover.
  const a = t.closest('.slide');
  if (a && !a.hasAttribute('hreflang')) { a.classList.remove('is-roll'); void a.offsetWidth; a.classList.add('is-roll'); }
});

// --- Cambio de idioma: se va a la misma sección en el otro idioma (portada: #donde…; carta: la pestaña abierta) ---
document.querySelectorAll('a[hreflang]').forEach((a) => a.addEventListener('click', () => { a.hash = location.hash; }));

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
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && menu.classList.contains('is-open')) { set(false); burger.focus(); } });
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
  still.addEventListener('change', restart);
  restart();
}

// --- Aparición al hacer scroll y cifras que cuentan ---
const reveals = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
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
    document.querySelectorAll('[data-count]').forEach((el) => { el.textContent = '0'; co.observe(el); });
  }
} else reveals.forEach((el) => el.classList.add('visible'));

// --- Carrusel de destacados: flechas que avanzan una tarjeta ---
const rail = document.querySelector('[data-rail]');
if (rail) {
  const track = rail.querySelector('[data-rail-track]');
  const prev = rail.querySelector('[data-rail-prev]'), next = rail.querySelector('[data-rail-next]');
  const stepW = () => { const c = track.firstElementChild; return c ? c.getBoundingClientRect().width + 24 : 300; };
  const sync = () => { prev.disabled = track.scrollLeft <= 2; next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2; };
  prev.addEventListener('click', () => track.scrollBy({ left: -stepW(), behavior: smooth() }));
  next.addEventListener('click', () => track.scrollBy({ left: stepW(), behavior: smooth() }));
  track.addEventListener('scroll', sync, { passive: true }); addEventListener('resize', sync); sync();
}

// --- Móvil: puntos bajo las filas que se deslizan, para saber cuántos elementos hay y en cuál estás ---
const addDots = (scroller, after) => {
  const items = [...scroller.children];
  if (items.length < 2) return;
  const dots = document.createElement('div');
  dots.className = 'dots'; dots.setAttribute('aria-hidden', 'true');
  dots.innerHTML = items.map(() => '<i></i>').join('');
  after.after(dots);
  const ds = [...dots.children];
  const update = () => {
    const w = scroller.clientWidth; if (!w) return;
    const mid = scroller.scrollLeft + w / 2;
    let best = 0, bd = Infinity;
    items.forEach((el, i) => { const d = Math.abs(el.offsetLeft - scroller.offsetLeft + el.offsetWidth / 2 - mid); if (d < bd) { bd = d; best = i; } });
    ds.forEach((d, i) => d.classList.toggle('is-on', i === best));
  };
  scroller.addEventListener('scroll', update, { passive: true }); addEventListener('resize', update); update();
};
const railTrack = document.querySelector('[data-rail-track]');
if (railTrack) addDots(railTrack, railTrack.closest('[data-rail]'));
document.querySelectorAll('.panel .grid, .specs, .reviews').forEach((g) => addDots(g, g));

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
    const navH = parseFloat(getComputedStyle(root).getPropertyValue('--nav-b')) || 0;
    const top = panelsBox.getBoundingClientRect().top + scrollY - carta.querySelector('.cats-bar').offsetHeight - navH - 16;
    if (scrollY > top + 1) scrollTo({ top, behavior: smooth() });
  };
  const revealTab = (c) => {
    if (list.scrollWidth <= list.clientWidth) return;
    const l = c.offsetLeft - list.offsetLeft, r = l + c.offsetWidth;
    if (l < list.scrollLeft || r > list.scrollLeft + list.clientWidth) list.scrollTo({ left: l - 16, behavior: smooth() });
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
  addEventListener('hashchange', () => { const id = fromHash(); if (id) show(id, { user: true }); });
}

// Imágenes que no cargan: se quitan para que se vea el hueco de color.
document.querySelectorAll('[data-slot] img').forEach((i) => { if (i.complete && !i.naturalWidth) i.remove(); else i.addEventListener('error', () => i.remove(), { once: true }); });
})();
