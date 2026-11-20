// Wok Two: pedido para recoger.
// Carrito (se guarda en el navegador), panel con el formulario y envío del pedido por WhatsApp al restaurante.
// Sin pago online por ahora: se paga en el local al recoger. Los platos y precios salen del catálogo que lleva la página (#catalog).
(() => {
  const KEY = 'woktwo-cart';
  const MAX_QTY = 20;
  const WINDOWS = [[12 * 60, 16 * 60 + 30], [19 * 60, 24 * 60]]; // comidas y cenas (hora de Madrid)
  const MIN_PREP = 30; // minutos que tarda un pedido en estar listo

  let catalog = [];
  try { catalog = JSON.parse(document.getElementById('catalog').textContent); } catch { /* sin catálogo no hay carrito */ }
  if (!catalog.length) return;

  const S = {
    es: {
      remove: (n) => `Quitar uno de ${n}`, add: (n) => `Añadir uno más de ${n}`, none: 'Hoy ya no se admiten más pedidos',
      eName: 'Escribe tu nombre.', ePhone: 'Escribe un teléfono válido.', eTime: 'Elige una hora de recogida.', eEmpty: 'Añade algún plato al pedido.',
      eWa: 'Los pedidos online todavía no están disponibles. Llámanos o pasa por el local.', ok: 'Se ha abierto WhatsApp con tu pedido: pulsa «Enviar» allí para confirmarlo.',
    },
    en: {
      remove: (n) => `Remove one ${n}`, add: (n) => `Add one more ${n}`, none: 'No more orders are accepted today',
      eName: 'Enter your name.', ePhone: 'Enter a valid phone number.', eTime: 'Choose a pickup time.', eEmpty: 'Add at least one dish to the order.',
      eWa: 'Online orders are not available yet. Please call us or visit the restaurant.', ok: 'WhatsApp has opened with your order: press “Send” there to confirm it.',
    },
  };
  const lang = () => (document.documentElement.lang === 'en' ? 'en' : 'es');
  const eur = (n) => (lang() === 'en' ? '€' + n.toFixed(2) : n.toFixed(2).replace('.', ',') + ' €');
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
  const $ = (sel) => document.querySelector(sel);

  // --- Estado ---
  const load = () => {
    try {
      const raw = JSON.parse(localStorage.getItem(KEY) || '{}');
      const out = {};
      for (const [id, q] of Object.entries(raw)) if (catalog[id] && q >= 1) out[id] = Math.min(MAX_QTY, Math.floor(q));
      return out;
    } catch { return {}; }
  };
  let cart = load();
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(cart)); } catch { /* sin almacenamiento: el carrito dura lo que dure la página */ } };
  const count = () => Object.values(cart).reduce((a, b) => a + b, 0);
  const total = () => Object.entries(cart).reduce((a, [id, q]) => a + catalog[id][2] * q, 0);
  const nameOf = (id) => catalog[id][lang() === 'en' ? 1 : 0];

  // --- Horas de recogida: cada 15 min dentro del horario, a partir de ahora + el tiempo de preparación ---
  const nowMadrid = () => {
    const p = new Intl.DateTimeFormat('es-ES', { timeZone: 'Europe/Madrid', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' }).formatToParts(new Date());
    return +p.find((x) => x.type === 'hour').value * 60 + +p.find((x) => x.type === 'minute').value;
  };
  const slots = () => {
    const earliest = Math.ceil((nowMadrid() + MIN_PREP) / 15) * 15;
    const out = [];
    for (const [a, b] of WINDOWS) for (let m = Math.max(a, earliest); m <= b - 15; m += 15) out.push(m);
    return out;
  };
  const hhmm = (m) => String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');

  // --- Pintar ---
  const render = () => {
    const n = count(), t = total();
    const fab = $('.cart-fab');
    if (fab) {
      fab.hidden = n === 0;
      fab.querySelector('[data-cart-count]').textContent = n;
      fab.querySelector('[data-cart-fab-total]').textContent = eur(t);
    }
    const dlg = $('#cart');
    if (!dlg) return;
    const s = S[lang()];
    dlg.querySelector('[data-cart-list]').innerHTML = Object.keys(cart).map((id) => {
      const nm = esc(nameOf(id));
      return `<li class="cart__item"><span class="cart__name">${nm}</span>`
        + `<span class="cart__qty"><button type="button" data-cart-dec="${id}" aria-label="${esc(s.remove(nameOf(id)))}">−</button><b>${cart[id]}</b>`
        + `<button type="button" data-cart-inc="${id}" aria-label="${esc(s.add(nameOf(id)))}">+</button></span>`
        + `<span class="cart__price num">${eur(catalog[id][2] * cart[id])}</span></li>`;
    }).join('');
    dlg.querySelector('[data-cart-total]').textContent = eur(t);
    dlg.querySelector('[data-cart-empty]').hidden = n > 0;
    dlg.querySelector('[data-cart-sum]').hidden = n === 0;
    dlg.querySelector('[data-cart-fields]').hidden = n === 0;
    // horas
    const sel = dlg.querySelector('[data-cart-time]');
    const prev = sel.value;
    const list = slots();
    sel.innerHTML = list.length
      ? list.map((m) => `<option value="${hhmm(m)}">${hhmm(m)}</option>`).join('')
      : `<option value="" disabled selected>${esc(s.none)}</option>`;
    if (prev && list.includes(+prev.slice(0, 2) * 60 + +prev.slice(3))) sel.value = prev;
  };
  const change = (id, d) => {
    const q = (cart[id] || 0) + d;
    if (q <= 0) delete cart[id]; else cart[id] = Math.min(MAX_QTY, q);
    save(); render();
  };
  const setErr = (msg) => { const e = $('[data-cart-err]'); if (e) e.textContent = msg || ''; };

  // --- Mensaje del pedido (siempre en español: lo lee el restaurante) ---
  const message = (f) => {
    const money = (n) => n.toFixed(2).replace('.', ',') + ' €';
    const lines = Object.keys(cart).map((id) => `${cart[id]} x ${catalog[id][0]} (${money(catalog[id][2] * cart[id])})`);
    return [
      '*Pedido para recoger - Wok Two*',
      `Nombre: ${f.name}`,
      `Teléfono: ${f.phone}`,
      `Recogida: hoy a las ${f.time}`,
      '',
      ...lines,
      '',
      `*Total: ${money(total())}*`,
      ...(f.notes ? [`Notas: ${f.notes}`] : []),
      'Pago en el local al recoger.',
    ].join('\n');
  };

  // --- Eventos ---
  const open = () => {
    const dlg = $('#cart');
    if (!dlg) return;
    render(); setErr('');
    const burger = document.querySelector('[data-burger][aria-expanded="true"]');
    if (burger) burger.click();
    if (!dlg.open) dlg.showModal();
  };
  const close = () => { const dlg = $('#cart'); if (dlg && dlg.open) dlg.close(); };

  document.addEventListener('click', (e) => {
    const t = e.target;
    if (!t.closest) return;
    const add = t.closest('[data-add]');
    if (add) {
      change(add.dataset.add, 1);
      add.classList.add('is-added');
      setTimeout(() => add.classList.remove('is-added'), 900);
      const fab = $('.cart-fab');
      if (fab) { fab.classList.remove('is-bump'); void fab.offsetWidth; fab.classList.add('is-bump'); }
      return;
    }
    const op = t.closest('[data-open-cart]');
    if (op) { e.preventDefault(); open(); return; }
    const cl = t.closest('[data-cart-close]');
    if (cl) {
      close();
      if (cl.matches('a') && new URL(cl.href).pathname.replace(/index\.html$/, '') === location.pathname.replace(/index\.html$/, '')) e.preventDefault();
      return;
    }
    const inc = t.closest('[data-cart-inc]'), dec = t.closest('[data-cart-dec]');
    if (inc) { change(inc.dataset.cartInc, 1); return; }
    if (dec) { change(dec.dataset.cartDec, -1); return; }
    if (t.closest('[data-cart-clear]')) { cart = {}; save(); render(); setErr(''); return; }
    if (t.id === 'cart') close(); // clic en el fondo oscuro
  });

  document.addEventListener('submit', (e) => {
    const form = e.target.closest && e.target.closest('#cart form');
    if (!form) return;
    e.preventDefault();
    const s = S[lang()];
    const dlg = $('#cart');
    const f = { name: form.name.value.trim(), phone: form.phone.value.trim(), time: form.time.value, notes: form.notes.value.trim() };
    const wa = (dlg.dataset.wa || '').replace(/\D/g, '');
    if (!count()) return setErr(s.eEmpty);
    if (f.name.length < 2) { form.name.focus(); return setErr(s.eName); }
    if (f.phone.replace(/\D/g, '').length < 9) { form.phone.focus(); return setErr(s.ePhone); }
    if (!f.time) return setErr(s.eTime);
    if (!/^\d{9,15}$/.test(wa)) return setErr(s.eWa);
    setErr(s.ok);
    window.open(`https://wa.me/${wa}?text=${encodeURIComponent(message(f))}`, '_blank', 'noopener');
  });

  // Al cambiar de idioma, se vuelven a pintar nombres e importes
  new MutationObserver(render).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  // Si se abre el carrito en otra pestaña, se sincroniza
  addEventListener('storage', (e) => { if (e.key === KEY) { cart = load(); render(); } });
  addEventListener('pageshow', () => { cart = load(); render(); });
  render();
})();
