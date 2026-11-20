// Wok Two: pestañas de la carta, lámina que sigue a la fila y estado de apertura. Sin JS, todo se ve apilado.
(() => {
  const src = (id) => `images/${id}-800.jpg`;

  // --- Carta: pestañas ---
  const carta = document.querySelector('[data-carta]');
  if (carta) {
    const cats = [...carta.querySelectorAll('.cat')];
    const panels = [...carta.querySelectorAll('.panel')];
    const list = carta.querySelector('.cats');
    list.setAttribute('role', 'tablist');
    list.setAttribute('aria-orientation', window.matchMedia('(max-width: 60rem)').matches ? 'horizontal' : 'vertical');
    cats.forEach((c) => { c.setAttribute('role', 'tab'); c.removeAttribute('aria-current'); c.id = 'tab-' + c.dataset.cat; c.setAttribute('aria-controls', 'c-' + c.dataset.cat); });
    panels.forEach((p) => { p.setAttribute('role', 'tabpanel'); p.setAttribute('aria-labelledby', 'tab-' + p.dataset.panel); });

    const panelsBox = carta.querySelector('.panels');
    const nav = document.querySelector('.nav');
    const narrow = window.matchMedia('(max-width: 60rem)');
    const still = window.matchMedia('(prefers-reduced-motion: reduce)');

    // Al cambiar de sección, la lista nueva puede ser mucho más corta: si el principio de la carta
    // quedó por encima de la pantalla, se vuelve a él para no aterrizar en el apartado siguiente.
    const keepInView = () => {
      const offset = (nav ? nav.offsetHeight : 0) + (narrow.matches ? list.offsetHeight : 0) + 16;
      const top = panelsBox.getBoundingClientRect().top + window.scrollY - offset;
      if (window.scrollY > top + 1) window.scrollTo({ top, behavior: still.matches ? 'auto' : 'smooth' });
    };
    // En móvil la barra de secciones se desplaza en horizontal: la pestaña activa siempre a la vista.
    const revealTab = (c) => {
      if (list.scrollWidth <= list.clientWidth) return;
      const l = c.offsetLeft - list.offsetLeft, r = l + c.offsetWidth;
      if (l < list.scrollLeft || r > list.scrollLeft + list.clientWidth) list.scrollTo({ left: l - 16, behavior: still.matches ? 'auto' : 'smooth' });
    };

    const show = (id, { focus = false, user = false } = {}) => {
      cats.forEach((c) => { const on = c.dataset.cat === id; c.setAttribute('aria-selected', on); c.tabIndex = on ? 0 : -1; if (on) { if (focus) c.focus({ preventScroll: true }); revealTab(c); } });
      panels.forEach((p) => p.classList.toggle('is-open', p.dataset.panel === id));
      const first = carta.querySelector('.panel.is-open .row[data-img]');
      if (first) setPrint(first);
      if (user) keepInView();
    };
    cats.forEach((c, i) => {
      c.addEventListener('click', (e) => { e.preventDefault(); show(c.dataset.cat, { user: true }); history.replaceState(null, '', '#c-' + c.dataset.cat); });
      c.addEventListener('keydown', (e) => {
        const k = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
        const go = (n) => { e.preventDefault(); show(cats[n].dataset.cat, { focus: true, user: true }); };
        if (k) go((i + k + cats.length) % cats.length);
        if (e.key === 'Home') go(0);
        if (e.key === 'End') go(cats.length - 1);
      });
    });

    // --- Lámina que sigue a la fila ---
    const slot = carta.querySelector('.carta__print .photo');
    const img = slot && slot.querySelector('img');
    const pn = carta.querySelector('[data-print-name]');
    const pp = carta.querySelector('[data-print-price]');
    let current = '';
    function setPrint(row) {
      if (!img || !row.dataset.img || row.dataset.img === current) return;
      const id = (current = row.dataset.img);
      carta.querySelectorAll('.row.is-on').forEach((r) => r.classList.remove('is-on'));
      row.classList.add('is-on');
      // El pie cambia cuando la foto nueva ya está cargada, para que nombre y foto nunca se desfasen.
      const next = new Image();
      next.onload = () => {
        if (id !== current) return;
        img.src = next.src;
        if (pn) pn.textContent = row.dataset.name;
        if (pp) pp.textContent = row.dataset.price;
      };
      next.src = src(id);
    }
    carta.querySelectorAll('.row').forEach((r) => r.addEventListener('mouseenter', () => setPrint(r)));

    // Un enlace directo a una sección (#c-fideos) abre esa sección.
    const fromHash = () => { const id = location.hash.replace('#c-', ''); return cats.some((c) => c.dataset.cat === id) ? id : null; };
    show(fromHash() || cats[0].dataset.cat);
    window.addEventListener('hashchange', () => { const id = fromHash(); if (id) show(id, { user: true }); });
  }

  // --- Estado de apertura (hora de Madrid) ---
  const st = document.querySelector('[data-status]');
  if (st) {
    const txt = st.querySelector('[data-status-text]');
    const parts = new Intl.DateTimeFormat('es-ES', { timeZone: 'Europe/Madrid', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' }).formatToParts(new Date());
    const m = +parts.find((p) => p.type === 'hour').value * 60 + +parts.find((p) => p.type === 'minute').value;
    const T = (h, mi) => h * 60 + mi;
    const [l1, l2, d1, d2] = [T(12, 0), T(16, 30), T(19, 0), T(23, 30)];
    let state = 'closed', msg;
    if (m >= l1 && m < l2) { state = 'open'; msg = 'Abierto, servimos hasta las 16:30.'; }
    else if (m >= d1 && m < d2) { state = 'open'; msg = 'Abierto, servimos hasta las 23:30.'; }
    else if (m < l1) msg = 'Cerrado, abrimos a las 12:00.';
    else if (m < d1) msg = 'Cerrado, abrimos a las 19:00.';
    else msg = 'Cerrado, mañana abrimos a las 12:00.';
    st.dataset.state = state;
    txt.textContent = msg;
  }
})();
