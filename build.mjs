// Genera la web en español (index.html, carta.html) y en inglés (en/index.html, en/carta.html)
// a partir de menu.mjs y menu-en.mjs. Uso: node build.mjs
// Estructura, estilos y animaciones según lanubeburger.com (por petición); textos, fotos y precios de Wok Two.
import { writeFileSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
const qrcode = createRequire(import.meta.url)('./tools/qrcode.cjs'); // generador de QR (MIT, Kazuhiko Arase)
import { menu, destacados } from './menu.mjs';
import * as EN from './menu-en.mjs';

const JUSTEAT = 'https://www.just-eat.es/restaurants-wok-two-malaga/menu';
// Número de WhatsApp del restaurante que recibe los pedidos para recoger (con prefijo de país, solo dígitos, p. ej. 34600123456).
const WHATSAPP = '34688122609';
// Dirección donde se publicará la web (sin barra final). El QR de qr.html lleva a SITE_URL + '/carta.html'.
// ¡Cambiar por la real antes de imprimir el cartel! Cuando sea la definitiva, poner SITE_URL_SET = true.
const SITE_URL = 'https://www.woktwo.es';
const SITE_URL_SET = false;
const ADDRESS = 'Wok Two, Calle Cuarteles 15, 29002 Málaga';
const MAPS = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(ADDRESS);
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const split = (full) => { const i = full.indexOf(','); return i < 0 ? [full, ''] : [full.slice(0, i), full.slice(i + 1).trim()]; };
const ARROW = '<svg class="arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>';
const PIN = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>';
const LANG_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 8 6 6"/><path d="m4 14 6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="m22 22-5-10-5 10"/><path d="M14 18h6"/></svg>';

const all = menu.flatMap((c) => c.items);
const total = all.length;
const byName = Object.fromEntries(all.map((it) => [it[0], it]));
const cheapest = Math.min(...menu[0].items.map((i) => i[2]).filter((p) => p < 40));
const isDest = new Set(destacados);
// Catálogo para el carrito: [nombre en español, nombre en inglés, precio]; el número del plato es su posición.
const catalog = all.map((it) => [it[0], EN.nameEn(it[0]), it[2]]);

// Textos de cada idioma.
const L = {
  es: {
    eur: (n) => n.toFixed(2).replace('.', ',') + ' €', // espacio que no se parte: el € nunca baja solo a otra línea
    name: (s) => s, tdesc: (s) => s, cat: (c) => c.label, note: (c) => c.note,
    other: 'EN', otherLang: 'en', otherLabel: 'English version',
    title: 'Wok Two, sushi y wok en Málaga', cartaTitle: 'Carta · Wok Two, sushi y wok en Málaga',
    desc: 'Wok Two, calle Cuarteles 15, Málaga. Sushi, makis, fideos y arroces a domicilio o para recoger. Abierto todos los días, comidas y cenas.',
    cartaDesc: `La carta completa de Wok Two: ${total} platos de sushi, makis, fideos, arroces y más, con precios. Pide para recoger.`,
    skip: 'Ir al contenido', home: 'Inicio', carta: 'Carta', dest: 'Destacados', where: 'Dónde', order: 'Pide ahora', menuBtn: 'Menú', mobileNav: 'Móvil', mainNav: 'Principal',
    heroLabel: 'Portada', slides: 'Diapositivas', slide: 'Diapositiva',
    chip1: 'Málaga • Sushi &amp; Wok', tag1: 'Sushi, makis, fideos y arroces', cta1: 'Ver la carta',
    chip2: '★ Abierto todos los días', title2: (p) => `Menús de sushi desde ${p}`, tag2: 'Nigiris • Makis • Californias • Wok',
    ticker: ['Sushi', 'Wok', 'Calle Cuarteles 15', 'A domicilio', 'Para recoger', 'Nigiris', 'Makis', 'Fideos', 'Arroces'],
    specLabel: 'Nuestra especialidad', specTitle: 'Sushi y wok', more: 'Ver más',
    specs: [['Sushi', 'Bandejas de nigiris, makis y californias para compartir, de 9 a 56 piezas.'], ['Fideos', 'Salteados al wok con verduras, pollo, pato, ternera o marisco.'], ['Arroces', 'Arroz frito tres delicias, cantonés, tailandés o con bulgogi de ternera.']],
    statsLabel: 'Wok Two en cifras', stats: ['Platos en la carta', 'Secciones', 'Piezas en el Plato Grande'],
    parallax: 'Sushi y wok en el centro de Málaga',
    destLabel: 'Descubre', destTitle: 'Nuestros destacados', destList: 'Platos destacados', prev: 'Anterior', next: 'Siguiente', fullMenu: 'Ver carta completa',
    badge: 'Destacado', orderNow: 'Añadir', orderDish: (n) => `Añadir ${n} al pedido`,
    cartFab: 'Mi pedido', cartTitle: 'Tu pedido', cartClose: 'Cerrar', cartEmpty: 'Todavía no has añadido nada.', cartEmptyBtn: 'Ver la carta', cartTotal: 'Total', cartClear: 'Vaciar pedido',
    pickupInfo: 'Pedido para recoger en Calle Cuarteles 15, Málaga. Pagas en el local al recoger.', fName: 'Nombre', fPhone: 'Teléfono', fTime: 'Hora de recogida', fNotes: 'Notas (opcional)', fNotesPh: 'Alergias, sin cebolla…', send: 'Enviar pedido por WhatsApp',
    delLabel: 'A domicilio', delTitle: 'Pide desde casa', delSub: 'Te lo llevamos por Málaga, del 29001 al 29018 y al 29190. O pide y pasa a recogerlo.', pickup: 'Pasar a recoger',
    findTitle: 'Encuéntranos en Málaga', mapTitle: 'Mapa: Wok Two en la calle Cuarteles 15, Málaga', address: 'Dirección', addr: 'Calle Cuarteles, 15<br>29002 Málaga, España',
    hours: 'Horario', lunch: 'Comidas · todos los días', dinner: 'Cenas · todos los días', now: 'Ahora', statusDefault: 'Abierto todos los días, de 12:00 a 16:30 y de 19:00 a 24:00.', directions: 'Cómo llegar',
    footBlurb: 'Sushi, makis, fideos y arroces en la calle Cuarteles. Sabor auténtico en Málaga. A domicilio o para recoger.', nav: 'Navegación', contact: 'Contacto', everyDay: 'Todos los días', rights: 'Todos los derechos reservados.', visit: 'Visítanos',
    discover: 'Descubre', cartaH: 'Nuestra carta', sections: 'Secciones de la carta', more2: (l) => `Más ${l.toLowerCase()}`,
  },
  en: {
    eur: (n) => '€' + n.toFixed(2),
    name: EN.nameEn, tdesc: (s) => EN.descs[s] ?? s, cat: (c) => EN.cats[c.id] ?? c.label, note: (c) => EN.notes[c.id] ?? c.note,
    other: 'ES', otherLang: 'es', otherLabel: 'Versión en español',
    title: 'Wok Two, sushi and wok in Málaga', cartaTitle: 'Menu · Wok Two, sushi and wok in Málaga',
    desc: 'Wok Two, Calle Cuarteles 15, Málaga. Sushi, maki, noodles and rice for delivery or pickup. Open every day, lunch and dinner.',
    cartaDesc: `The full Wok Two menu: ${total} dishes of sushi, maki, noodles, rice and more, with prices. Order for pickup.`,
    skip: 'Skip to content', home: 'Home', carta: 'Menu', dest: 'Favourites', where: 'Find us', order: 'Order now', menuBtn: 'Menu', mobileNav: 'Mobile', mainNav: 'Main',
    heroLabel: 'Welcome', slides: 'Slides', slide: 'Slide',
    chip1: 'Málaga • Sushi &amp; Wok', tag1: 'Sushi, maki, noodles and rice', cta1: 'See the menu',
    chip2: '★ Open every day', title2: (p) => `Sushi set menus from ${p}`, tag2: 'Nigiri • Maki • California • Wok',
    ticker: ['Sushi', 'Wok', 'Calle Cuarteles 15', 'Delivery', 'Pickup', 'Nigiri', 'Maki', 'Noodles', 'Rice'],
    specLabel: 'Our speciality', specTitle: 'Sushi and wok', more: 'See more',
    specs: [['Sushi', 'Trays of nigiri, maki and California rolls to share, from 9 to 56 pieces.'], ['Noodles', 'Wok-tossed with vegetables, chicken, duck, beef or seafood.'], ['Rice', 'Three delights, Cantonese, Thai-style or beef bulgogi fried rice.']],
    statsLabel: 'Wok Two in numbers', stats: ['Dishes on the menu', 'Sections', 'Pieces in the Large Platter'],
    parallax: 'Sushi and wok in the heart of Málaga',
    destLabel: 'Discover', destTitle: 'Our favourites', destList: 'Favourite dishes', prev: 'Previous', next: 'Next', fullMenu: 'See the full menu',
    badge: 'Favourite', orderNow: 'Add', orderDish: (n) => `Add ${n} to the order`,
    cartFab: 'My order', cartTitle: 'Your order', cartClose: 'Close', cartEmpty: 'You have not added anything yet.', cartEmptyBtn: 'See the menu', cartTotal: 'Total', cartClear: 'Clear order',
    pickupInfo: 'Pickup order at Calle Cuarteles 15, Málaga. You pay at the restaurant when you collect it.', fName: 'Name', fPhone: 'Phone', fTime: 'Pickup time', fNotes: 'Notes (optional)', fNotesPh: 'Allergies, no onion…', send: 'Send order by WhatsApp',
    delLabel: 'Delivery', delTitle: 'Order from home', delSub: 'We deliver across Málaga, postcodes 29001 to 29018 and 29190. Or order and pick it up.', pickup: 'Pick up',
    findTitle: 'Find us in Málaga', mapTitle: 'Map: Wok Two at Calle Cuarteles 15, Málaga', address: 'Address', addr: 'Calle Cuarteles, 15<br>29002 Málaga, Spain',
    hours: 'Opening hours', lunch: 'Lunch · every day', dinner: 'Dinner · every day', now: 'Now', statusDefault: 'Open every day, 12:00 to 16:30 and 19:00 to 24:00.', directions: 'Get directions',
    footBlurb: 'Sushi, maki, noodles and rice on Calle Cuarteles. Authentic flavour in Málaga. Delivery or pickup.', nav: 'Navigation', contact: 'Contact', everyDay: 'Every day', rights: 'All rights reserved.', visit: 'Visit us',
    discover: 'Discover', cartaH: 'Our menu', sections: 'Menu sections', more2: (l) => `More ${l.toLowerCase()}`,
  },
};

// Tipografía: evita saltos de línea que descuadran el texto. Se aplica a todo el texto visible (no a atributos ni scripts):
// el número va siempre con la palabra que le sigue ("4 californias", "12,80 €"), la viñeta "•" no empieza línea y,
// en textos de 3 o más palabras, las dos últimas van juntas si son cortas (así no queda una palabra sola abajo).
// Los nombres de platos no se tocan: sus tarjetas son estrechas y ya se reparten en líneas equilibradas.
const NB = ' ';
const tidy = (txt, tag) => {
  if (!txt.trim() || txt.includes('{')) return txt;
  let out = txt.replace(/(\d) (?=\S)/g, '$1' + NB).replace(/ (•|·|–)(?= )/g, NB + '$1');
  if (!/mcard__name|row__name/.test(tag)) {
    out = out.replace(/(\S+ \S+) (\S+)(\s*)$/, (m, head, last, sp) => {
      const prev = head.split(' ').pop();
      return (prev + last).length <= 16 ? head + NB + last + sp : m;
    });
  }
  return out;
};
const typo = (html) => html.split(/(<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<head>[\s\S]*?<\/head>)/)
  .map((part, i) => (i % 2 ? part : part.replace(/(<[^>]*>)([^<>]+)(?=<)/g, (m, tag, txt) => tag + tidy(txt, tag))))
  .join('');

const V = Date.now().toString(36);                  // versión: obliga al navegador a bajar css y js nuevos
// Dirección absoluta de cada página (para canonical, hreflang, Open Graph y sitemap)
const pageUrl = (l, page) => `${SITE_URL}/${l === 'en' ? 'en/' : ''}${page === 'index.html' ? '' : page}`;
const build = (lang) => {
  const t = L[lang];
  const P = lang === 'en' ? '../' : '';              // ruta a los ficheros compartidos (css, js, imágenes)
  const OTHER = lang === 'en' ? '../' : 'en/';        // carpeta de la otra versión
  const img = (id, w) => `${P}images/${id}-${w}.jpg`;
  const mapEmbed = 'https://www.google.com/maps?q=' + encodeURIComponent(ADDRESS) + `&hl=${lang}&output=embed`;
  const nm = (full) => split(t.name(full));

  const head = (title, desc, page) => `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="theme-color" content="#b6161e">
<title>${title}</title>
<meta name="description" content="${desc}">
<link rel="canonical" href="${pageUrl(lang, page)}">
<link rel="alternate" hreflang="es" href="${pageUrl('es', page)}">
<link rel="alternate" hreflang="en" href="${pageUrl('en', page)}">
<link rel="alternate" hreflang="x-default" href="${pageUrl('es', page)}">
<link rel="icon" href="${P}favicon.svg" type="image/svg+xml">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Wok Two">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${desc}">
<meta property="og:url" content="${pageUrl(lang, page)}">
<meta property="og:image" content="${SITE_URL}/images/${byName['Menú 11, 40 unidades'][3]}-1024.jpg">
<meta property="og:locale" content="${lang === 'en' ? 'en_GB' : 'es_ES'}">
<meta name="twitter:card" content="summary_large_image">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:wght@400;500;600;700;800&family=Dela+Gothic+One&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${P}styles.css?v=${V}">
<script>document.documentElement.classList.add('js');</script>
</head>`;

  const navItems = (home) => [[home ? '#top' : 'index.html', t.home], ['carta.html', t.carta], [home ? '#destacados' : 'index.html#destacados', t.dest], [home ? '#donde' : 'index.html#donde', t.where]];
  const header = (home, page) => `<div class="progress" data-progress aria-hidden="true"></div>
<header class="nav" data-nav>
  <div class="container nav__in">
    <a class="nav__brand" href="${home ? '#top' : 'index.html'}" aria-label="Wok Two, ${t.home.toLowerCase()}">Wok Two</a>
    <nav class="nav__links" aria-label="${t.mainNav}">${navItems(home).slice(1).map(([h, x]) => `<a class="slide" href="${h}" data-text="${x}"><span>${x}</span></a>`).join('')}<a class="slide slide--lang" href="${OTHER}${page}" hreflang="${t.otherLang}" lang="${t.otherLang}" aria-label="${t.otherLabel}"><span>${LANG_ICON}${lang.toUpperCase()}</span><span class="roll-b" aria-hidden="true">${lang.toUpperCase()}</span></a></nav>
    <a class="nav__cta" href="${home ? 'carta.html' : 'carta.html'}" data-open-cart>${t.order}</a>
    <button class="burger" type="button" aria-expanded="false" aria-controls="menu" data-burger><span></span><span></span><span></span><span class="visually-hidden">${t.menuBtn}</span></button>
  </div>
</header>
<div class="menu" id="menu" data-menu hidden>
  <nav aria-label="${t.mobileNav}">${navItems(home).map(([h, x]) => `<a href="${h}">${x}</a>`).join('')}<a href="carta.html" data-open-cart>${t.order}</a><a class="menu__lang" href="${OTHER}${page}" hreflang="${t.otherLang}" lang="${t.otherLang}" aria-label="${t.otherLabel}">${LANG_ICON}${lang.toUpperCase()}</a></nav>
</div>`;

  const footer = (home) => `<footer class="foot">
  <div class="container foot__grid">
    <div class="foot__brand"><a class="foot__logo" href="${home ? '#top' : 'index.html'}">Wok Two</a><p>${t.footBlurb}</p></div>
    <div class="foot__col"><h2>${t.nav}</h2><ul>${navItems(home).slice(1).map(([h, x]) => `<li><a href="${h}">${x}</a></li>`).join('')}</ul></div>
    <div class="foot__col"><h2>${t.contact}</h2><ul><li><a href="${MAPS}" rel="noopener">C/ Cuarteles, 15</a></li><li><a href="${MAPS}" rel="noopener">29002 Málaga</a></li><li><a href="carta.html" data-open-cart>${t.order}</a></li></ul></div>
    <div class="foot__col"><h2>${t.hours}</h2><ul><li>${t.everyDay}</li><li class="num">12:00 – 16:30</li><li class="num">19:00 – 24:00</li></ul></div>
  </div>
  <div class="container foot__base"><p>© ${new Date().getFullYear()} Wok Two. ${t.rights}</p></div>
</footer>
<a class="visit" href="${home ? '#donde' : 'index.html#donde'}" data-visit>${PIN}<span>${t.visit}</span></a>`;

  // Pedido para recoger: botón flotante, panel del carrito y catálogo (cart.js los gestiona)
  const cartMarkup = `<button type="button" class="cart-fab" data-open-cart hidden><span class="cart-fab__n" data-dynamic data-cart-count>0</span><span>${t.cartFab}</span><span class="cart-fab__t num" data-dynamic data-cart-fab-total></span></button>
<dialog class="cart" id="cart" aria-labelledby="cart-title" data-wa="${WHATSAPP}">
  <form class="cart__in" novalidate>
    <header class="cart__head"><h2 id="cart-title">${t.cartTitle}</h2><button type="button" class="cart__x" data-cart-close aria-label="${t.cartClose}">×</button></header>
    <div class="cart__empty" data-cart-empty><p>${t.cartEmpty}</p><a class="cart__see" href="carta.html" data-cart-close>${t.cartEmptyBtn}</a></div>
    <ul class="cart__list" data-dynamic data-cart-list></ul>
    <div class="cart__sum" data-cart-sum><span>${t.cartTotal}</span><strong class="num" data-dynamic data-cart-total></strong></div>
    <div class="cart__fields" data-cart-fields>
      <p class="cart__info">${t.pickupInfo}</p>
      <label>${t.fName}<input name="name" autocomplete="name" required maxlength="60"></label>
      <label>${t.fPhone}<input name="phone" type="tel" autocomplete="tel" inputmode="tel" required maxlength="20"></label>
      <label>${t.fTime}<select name="time" data-dynamic data-cart-time required></select></label>
      <label>${t.fNotes}<textarea name="notes" rows="2" maxlength="200" placeholder="${t.fNotesPh}"></textarea></label>
      <p class="cart__err" role="alert" data-dynamic data-cart-err></p>
      <button type="submit" class="cart__send">${t.send}</button>
      <button type="button" class="cart__clear" data-cart-clear>${t.cartClear}</button>
    </div>
  </form>
</dialog>
<script type="application/json" id="catalog">${JSON.stringify(catalog)}</script>
`;
  const scripts = `${cartMarkup}<script src="${P}app.js?v=${V}"></script>
<script src="${P}cart.js?v=${V}"></script>
<script>document.querySelectorAll('[data-slot] img').forEach((i) => { if (i.complete && !i.naturalWidth) i.remove(); else i.addEventListener('error', () => i.remove(), { once: true }); });</script>
</body>
</html>
`;

  // Tarjeta de plato (la misma en el carrusel de destacados y en la carta).
  const card = (it, { badge = isDest.has(it[0]) } = {}) => { const [name, detail] = nm(it[0]);
    return `<article class="mcard">
  <div class="mcard__img" data-slot="dish-${it[3].slice(0, 6)}"><img src="${img(it[3], 800)}" width="800" height="600" alt="${esc(name)}${detail ? ', ' + esc(detail) : ''}" loading="lazy" decoding="async">${badge ? `<span class="mcard__badge" data-keep>${t.badge}</span>` : ''}</div>
  <div class="mcard__body">
    <div class="mcard__top"><h3 class="mcard__name">${esc(name)}</h3><span class="mcard__price num">${t.eur(it[2])}</span></div>
    <p class="mcard__desc">${esc([detail, it[1] && t.tdesc(it[1])].filter(Boolean).join('. '))}</p>
    <button type="button" class="mcard__btn" data-add="${esc(it[0])}" aria-label="${esc(t.orderDish(name))}">${t.orderNow}</button>
  </div>
</article>`; };

  // ============ Portada ============
  const slides = [
    { chip: t.chip1, title: 'Wok Two', giant: true, tag: t.tag1, cta: ['carta.html', t.cta1] },
    { chip: t.chip2, gold: true, title: t.title2(t.eur(cheapest)), tag: t.tag2, cta: ['carta.html', t.order] },
  ];
  // Japonés de adorno: dos columnas verticales que bajan sin parar, como la cinta de abajo pero de arriba a abajo
  const JP_LEFT = ['寿司', '握り', '巻き', '麺'], JP_RIGHT = ['ウォック', '炒め', '飯', '鍋'];
  const jpColumn = (side, words) => `<div class="hero__jp hero__jp--${side}" lang="ja" aria-hidden="true"><div class="hero__jp-run">${[0, 1].map(() => `<ul class="hero__jp-list">${words.map((w) => `<li>${w}</li>`).join('')}</ul>`).join('')}</div></div>`;
  const heroSlides = slides.map((s, i) => `<div class="slide-h${i === 0 ? ' is-on' : ''}" data-slide${i ? ' aria-hidden="true"' : ''}>
      <div class="hero__in">
        <span class="chip${s.gold ? ' chip--gold' : ''}">${s.chip}</span>
        ${i === 0 ? '<h1' : '<p'} class="${s.giant ? 'hero__giant' : 'hero__title'}">${s.title}${i === 0 ? '</h1>' : '</p>'}
        <p class="${s.giant ? 'hero__tag' : 'hero__tag hero__tag--s'}">${s.tag}</p>
        <a class="hero__cta" href="${s.cta[0]}"${i ? ' data-open-cart tabindex="-1"' : ''}><span>${s.cta[1]}</span>${ARROW}</a>
      </div>
    </div>`).join('\n    ');

  const specialties = [['01', 'menus', 'Menú 11, 40 unidades'], ['02', 'fideos', 'Tallarines con Pechuga de Pollo'], ['03', 'arroces', 'Arroz Frito Tres Delicias, grande']]
    .map(([n, cat, dish], i) => { const it = byName[dish]; const [title, text] = t.specs[i];
      return `<a class="spec reveal" style="--d:${(i + 1) * 0.1}s" href="carta.html#c-${cat}">
        <div class="spec__img" data-slot="spec-${n}"><img src="${img(it[3], 800)}" width="800" height="600" alt="" loading="lazy" decoding="async"><div class="spec__over" data-keep aria-hidden="true"><span>${t.more}</span></div></div>
        <div class="spec__body"><span class="spec__n" aria-hidden="true">${n}</span><h3>${title}</h3><p>${text}</p></div>
      </a>`; }).join('\n      ');

  const stats = [total, menu.length, 56].map((n, i) => `<div class="stat reveal" style="--d:${i * 0.1}s"><dd class="num" data-count="${n}">${n}</dd><dt>${t.stats[i]}</dt></div>`).join('\n        ');
  const ticker = `<ul class="ticker__list">${t.ticker.map((x) => `<li>${x}</li>`).join('')}</ul>`;
  const chev = (d) => `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${d}"/></svg>`;

  const home = `${head(t.title, t.desc, 'index.html')}
<body>
<a class="skip" href="#main">${t.skip}</a>
${header(true, 'index.html')}

<main id="main">
  <section class="hero" id="top" aria-label="${t.heroLabel}" data-hero>
    <div class="hero__glow" aria-hidden="true"></div>
    ${jpColumn('l', JP_LEFT)}
    ${jpColumn('r', JP_RIGHT)}
    <div class="hero__lanterns" aria-hidden="true"><div class="hl" style="left:3%;--y:120px;--s:1.25;--r:-3deg;--d:0s"><svg viewBox="0 0 60 118" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><rect x="17" y="2" width="26" height="8" rx="2" fill="#0a0a0a"/><path d="M17 10 C-2 18 -2 60 17 68 L43 68 C62 60 62 18 43 10 Z" fill="#fbf1dc"/><g stroke="#b6161e" stroke-opacity=".55" stroke-width="1.3" fill="none"><path d="M7 24 Q30 29 53 24"/><path d="M3 36 Q30 42 57 36"/><path d="M3 48 Q30 54 57 48"/><path d="M7 60 Q30 66 53 60"/></g><text x="30" y="48" text-anchor="middle" font-family="Dela Gothic One, Noto Sans JP, Yu Gothic, sans-serif" font-size="22" fill="#b6161e">福</text><rect x="17" y="68" width="26" height="8" rx="2" fill="#0a0a0a"/><g stroke="#0a0a0a" stroke-width="1.6"><line x1="30" y1="76" x2="30" y2="92"/></g><g stroke="#0a0a0a" stroke-width="1.2"><line x1="30" y1="88" x2="26" y2="100"/><line x1="30" y1="88" x2="30" y2="102"/><line x1="30" y1="88" x2="34" y2="100"/></g></svg></div><div class="hl" style="left:11%;--y:176px;--s:0.9;--r:4deg;--d:-1.4s"><svg viewBox="0 0 60 118" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><rect x="17" y="2" width="26" height="8" rx="2" fill="#0a0a0a"/><path d="M17 10 C-2 18 -2 60 17 68 L43 68 C62 60 62 18 43 10 Z" fill="#ffffff"/><g stroke="#b6161e" stroke-opacity=".55" stroke-width="1.3" fill="none"><path d="M7 24 Q30 29 53 24"/><path d="M3 36 Q30 42 57 36"/><path d="M3 48 Q30 54 57 48"/><path d="M7 60 Q30 66 53 60"/></g><text x="30" y="48" text-anchor="middle" font-family="Dela Gothic One, Noto Sans JP, Yu Gothic, sans-serif" font-size="22" fill="#b6161e">寿</text><rect x="17" y="68" width="26" height="8" rx="2" fill="#0a0a0a"/><g stroke="#0a0a0a" stroke-width="1.6"><line x1="30" y1="76" x2="30" y2="92"/></g><g stroke="#0a0a0a" stroke-width="1.2"><line x1="30" y1="88" x2="26" y2="100"/><line x1="30" y1="88" x2="30" y2="102"/><line x1="30" y1="88" x2="34" y2="100"/></g></svg></div><div class="hl" style="left:18.5%;--y:108px;--s:1.1;--r:-2deg;--d:-2.6s"><svg viewBox="0 0 60 118" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><rect x="17" y="2" width="26" height="8" rx="2" fill="#0a0a0a"/><path d="M17 10 C-2 18 -2 60 17 68 L43 68 C62 60 62 18 43 10 Z" fill="#f4d58d"/><g stroke="#b6161e" stroke-opacity=".55" stroke-width="1.3" fill="none"><path d="M7 24 Q30 29 53 24"/><path d="M3 36 Q30 42 57 36"/><path d="M3 48 Q30 54 57 48"/><path d="M7 60 Q30 66 53 60"/></g><text x="30" y="48" text-anchor="middle" font-family="Dela Gothic One, Noto Sans JP, Yu Gothic, sans-serif" font-size="22" fill="#b6161e">味</text><rect x="17" y="68" width="26" height="8" rx="2" fill="#0a0a0a"/><g stroke="#0a0a0a" stroke-width="1.6"><line x1="30" y1="76" x2="30" y2="92"/></g><g stroke="#0a0a0a" stroke-width="1.2"><line x1="30" y1="88" x2="26" y2="100"/><line x1="30" y1="88" x2="30" y2="102"/><line x1="30" y1="88" x2="34" y2="100"/></g></svg></div><div class="hl" style="left:7%;--y:268px;--s:0.78;--r:5deg;--d:-0.7s"><svg viewBox="0 0 60 118" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><rect x="17" y="2" width="26" height="8" rx="2" fill="#0a0a0a"/><path d="M17 10 C-2 18 -2 60 17 68 L43 68 C62 60 62 18 43 10 Z" fill="#f4d58d"/><g stroke="#b6161e" stroke-opacity=".55" stroke-width="1.3" fill="none"><path d="M7 24 Q30 29 53 24"/><path d="M3 36 Q30 42 57 36"/><path d="M3 48 Q30 54 57 48"/><path d="M7 60 Q30 66 53 60"/></g><text x="30" y="48" text-anchor="middle" font-family="Dela Gothic One, Noto Sans JP, Yu Gothic, sans-serif" font-size="22" fill="#b6161e">酒</text><rect x="17" y="68" width="26" height="8" rx="2" fill="#0a0a0a"/><g stroke="#0a0a0a" stroke-width="1.6"><line x1="30" y1="76" x2="30" y2="92"/></g><g stroke="#0a0a0a" stroke-width="1.2"><line x1="30" y1="88" x2="26" y2="100"/><line x1="30" y1="88" x2="30" y2="102"/><line x1="30" y1="88" x2="34" y2="100"/></g></svg></div><div class="hl hl--wide" style="left:25%;--y:206px;--s:0.66;--r:-4deg;--d:-3.3s"><svg viewBox="0 0 60 118" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><rect x="17" y="2" width="26" height="8" rx="2" fill="#0a0a0a"/><path d="M17 10 C-2 18 -2 60 17 68 L43 68 C62 60 62 18 43 10 Z" fill="#fbf1dc"/><g stroke="#b6161e" stroke-opacity=".55" stroke-width="1.3" fill="none"><path d="M7 24 Q30 29 53 24"/><path d="M3 36 Q30 42 57 36"/><path d="M3 48 Q30 54 57 48"/><path d="M7 60 Q30 66 53 60"/></g><text x="30" y="48" text-anchor="middle" font-family="Dela Gothic One, Noto Sans JP, Yu Gothic, sans-serif" font-size="22" fill="#b6161e">喜</text><rect x="17" y="68" width="26" height="8" rx="2" fill="#0a0a0a"/><g stroke="#0a0a0a" stroke-width="1.6"><line x1="30" y1="76" x2="30" y2="92"/></g><g stroke="#0a0a0a" stroke-width="1.2"><line x1="30" y1="88" x2="26" y2="100"/><line x1="30" y1="88" x2="30" y2="102"/><line x1="30" y1="88" x2="34" y2="100"/></g></svg></div><div class="hl hl--wide" style="left:31%;--y:112px;--s:0.8;--r:3deg;--d:-1.9s"><svg viewBox="0 0 60 118" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><rect x="17" y="2" width="26" height="8" rx="2" fill="#0a0a0a"/><path d="M17 10 C-2 18 -2 60 17 68 L43 68 C62 60 62 18 43 10 Z" fill="#ffffff"/><g stroke="#b6161e" stroke-opacity=".55" stroke-width="1.3" fill="none"><path d="M7 24 Q30 29 53 24"/><path d="M3 36 Q30 42 57 36"/><path d="M3 48 Q30 54 57 48"/><path d="M7 60 Q30 66 53 60"/></g><text x="30" y="48" text-anchor="middle" font-family="Dela Gothic One, Noto Sans JP, Yu Gothic, sans-serif" font-size="22" fill="#b6161e">祭</text><rect x="17" y="68" width="26" height="8" rx="2" fill="#0a0a0a"/><g stroke="#0a0a0a" stroke-width="1.6"><line x1="30" y1="76" x2="30" y2="92"/></g><g stroke="#0a0a0a" stroke-width="1.2"><line x1="30" y1="88" x2="26" y2="100"/><line x1="30" y1="88" x2="30" y2="102"/><line x1="30" y1="88" x2="34" y2="100"/></g></svg></div><div class="hl" style="right:3%;--y:112px;--s:1.2;--r:3deg;--d:-0.4s"><svg viewBox="0 0 60 118" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><rect x="17" y="2" width="26" height="8" rx="2" fill="#0a0a0a"/><path d="M17 10 C-2 18 -2 60 17 68 L43 68 C62 60 62 18 43 10 Z" fill="#fbf1dc"/><g stroke="#b6161e" stroke-opacity=".55" stroke-width="1.3" fill="none"><path d="M7 24 Q30 29 53 24"/><path d="M3 36 Q30 42 57 36"/><path d="M3 48 Q30 54 57 48"/><path d="M7 60 Q30 66 53 60"/></g><text x="30" y="48" text-anchor="middle" font-family="Dela Gothic One, Noto Sans JP, Yu Gothic, sans-serif" font-size="22" fill="#b6161e">旨</text><rect x="17" y="68" width="26" height="8" rx="2" fill="#0a0a0a"/><g stroke="#0a0a0a" stroke-width="1.6"><line x1="30" y1="76" x2="30" y2="92"/></g><g stroke="#0a0a0a" stroke-width="1.2"><line x1="30" y1="88" x2="26" y2="100"/><line x1="30" y1="88" x2="30" y2="102"/><line x1="30" y1="88" x2="34" y2="100"/></g></svg></div><div class="hl" style="right:11%;--y:184px;--s:0.9;--r:-4deg;--d:-2.1s"><svg viewBox="0 0 60 118" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><rect x="17" y="2" width="26" height="8" rx="2" fill="#0a0a0a"/><path d="M17 10 C-2 18 -2 60 17 68 L43 68 C62 60 62 18 43 10 Z" fill="#f4d58d"/><g stroke="#b6161e" stroke-opacity=".55" stroke-width="1.3" fill="none"><path d="M7 24 Q30 29 53 24"/><path d="M3 36 Q30 42 57 36"/><path d="M3 48 Q30 54 57 48"/><path d="M7 60 Q30 66 53 60"/></g><text x="30" y="48" text-anchor="middle" font-family="Dela Gothic One, Noto Sans JP, Yu Gothic, sans-serif" font-size="22" fill="#b6161e">酒</text><rect x="17" y="68" width="26" height="8" rx="2" fill="#0a0a0a"/><g stroke="#0a0a0a" stroke-width="1.6"><line x1="30" y1="76" x2="30" y2="92"/></g><g stroke="#0a0a0a" stroke-width="1.2"><line x1="30" y1="88" x2="26" y2="100"/><line x1="30" y1="88" x2="30" y2="102"/><line x1="30" y1="88" x2="34" y2="100"/></g></svg></div><div class="hl" style="right:18.5%;--y:104px;--s:1.1;--r:2deg;--d:-3.0s"><svg viewBox="0 0 60 118" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><rect x="17" y="2" width="26" height="8" rx="2" fill="#0a0a0a"/><path d="M17 10 C-2 18 -2 60 17 68 L43 68 C62 60 62 18 43 10 Z" fill="#ffffff"/><g stroke="#b6161e" stroke-opacity=".55" stroke-width="1.3" fill="none"><path d="M7 24 Q30 29 53 24"/><path d="M3 36 Q30 42 57 36"/><path d="M3 48 Q30 54 57 48"/><path d="M7 60 Q30 66 53 60"/></g><text x="30" y="48" text-anchor="middle" font-family="Dela Gothic One, Noto Sans JP, Yu Gothic, sans-serif" font-size="22" fill="#b6161e">福</text><rect x="17" y="68" width="26" height="8" rx="2" fill="#0a0a0a"/><g stroke="#0a0a0a" stroke-width="1.6"><line x1="30" y1="76" x2="30" y2="92"/></g><g stroke="#0a0a0a" stroke-width="1.2"><line x1="30" y1="88" x2="26" y2="100"/><line x1="30" y1="88" x2="30" y2="102"/><line x1="30" y1="88" x2="34" y2="100"/></g></svg></div><div class="hl" style="right:7%;--y:264px;--s:0.78;--r:-5deg;--d:-1.1s"><svg viewBox="0 0 60 118" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><rect x="17" y="2" width="26" height="8" rx="2" fill="#0a0a0a"/><path d="M17 10 C-2 18 -2 60 17 68 L43 68 C62 60 62 18 43 10 Z" fill="#fbf1dc"/><g stroke="#b6161e" stroke-opacity=".55" stroke-width="1.3" fill="none"><path d="M7 24 Q30 29 53 24"/><path d="M3 36 Q30 42 57 36"/><path d="M3 48 Q30 54 57 48"/><path d="M7 60 Q30 66 53 60"/></g><text x="30" y="48" text-anchor="middle" font-family="Dela Gothic One, Noto Sans JP, Yu Gothic, sans-serif" font-size="22" fill="#b6161e">寿</text><rect x="17" y="68" width="26" height="8" rx="2" fill="#0a0a0a"/><g stroke="#0a0a0a" stroke-width="1.6"><line x1="30" y1="76" x2="30" y2="92"/></g><g stroke="#0a0a0a" stroke-width="1.2"><line x1="30" y1="88" x2="26" y2="100"/><line x1="30" y1="88" x2="30" y2="102"/><line x1="30" y1="88" x2="34" y2="100"/></g></svg></div><div class="hl hl--wide" style="right:25%;--y:200px;--s:0.66;--r:4deg;--d:-2.4s"><svg viewBox="0 0 60 118" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><rect x="17" y="2" width="26" height="8" rx="2" fill="#0a0a0a"/><path d="M17 10 C-2 18 -2 60 17 68 L43 68 C62 60 62 18 43 10 Z" fill="#f4d58d"/><g stroke="#b6161e" stroke-opacity=".55" stroke-width="1.3" fill="none"><path d="M7 24 Q30 29 53 24"/><path d="M3 36 Q30 42 57 36"/><path d="M3 48 Q30 54 57 48"/><path d="M7 60 Q30 66 53 60"/></g><text x="30" y="48" text-anchor="middle" font-family="Dela Gothic One, Noto Sans JP, Yu Gothic, sans-serif" font-size="22" fill="#b6161e">味</text><rect x="17" y="68" width="26" height="8" rx="2" fill="#0a0a0a"/><g stroke="#0a0a0a" stroke-width="1.6"><line x1="30" y1="76" x2="30" y2="92"/></g><g stroke="#0a0a0a" stroke-width="1.2"><line x1="30" y1="88" x2="26" y2="100"/><line x1="30" y1="88" x2="30" y2="102"/><line x1="30" y1="88" x2="34" y2="100"/></g></svg></div><div class="hl hl--wide" style="right:31%;--y:116px;--s:0.8;--r:-3deg;--d:-0.9s"><svg viewBox="0 0 60 118" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><rect x="17" y="2" width="26" height="8" rx="2" fill="#0a0a0a"/><path d="M17 10 C-2 18 -2 60 17 68 L43 68 C62 60 62 18 43 10 Z" fill="#ffffff"/><g stroke="#b6161e" stroke-opacity=".55" stroke-width="1.3" fill="none"><path d="M7 24 Q30 29 53 24"/><path d="M3 36 Q30 42 57 36"/><path d="M3 48 Q30 54 57 48"/><path d="M7 60 Q30 66 53 60"/></g><text x="30" y="48" text-anchor="middle" font-family="Dela Gothic One, Noto Sans JP, Yu Gothic, sans-serif" font-size="22" fill="#b6161e">喜</text><rect x="17" y="68" width="26" height="8" rx="2" fill="#0a0a0a"/><g stroke="#0a0a0a" stroke-width="1.6"><line x1="30" y1="76" x2="30" y2="92"/></g><g stroke="#0a0a0a" stroke-width="1.2"><line x1="30" y1="88" x2="26" y2="100"/><line x1="30" y1="88" x2="30" y2="102"/><line x1="30" y1="88" x2="34" y2="100"/></g></svg></div></div>
    ${heroSlides}
    <div class="hero__dots" role="group" aria-label="${t.slides}">${slides.map((_, i) => `<button type="button" class="dot${i === 0 ? ' is-on' : ''}" data-dot="${i}" aria-label="${t.slide} ${i + 1}"${i === 0 ? ' aria-current="true"' : ''}></button>`).join('')}</div>
    <a class="hero__scroll" href="#especialidad"><span>Scroll</span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></a>
  </section>

  <div class="ticker" aria-hidden="true"><div class="ticker__run">${ticker}${ticker}</div></div>

  <section class="sec sec--white" id="especialidad" aria-labelledby="h-spec">
    <div class="container">
      <div class="shead reveal"><span class="label">${t.specLabel}</span><h2 class="title-xl" id="h-spec">${t.specTitle}</h2></div>
      <div class="specs">
      ${specialties}
      </div>
    </div>
  </section>

  <section class="stats-band" aria-label="${t.statsLabel}">
    <div class="container"><dl class="stats">
        ${stats}
    </dl></div>
  </section>

  <div class="parallax" data-parallax>
    <img src="${img(byName['Menú 11, 40 unidades'][3], 1024)}" width="1024" height="768" alt="" loading="lazy" decoding="async" data-parallax-img>
    <div class="parallax__veil"><p class="parallax__text reveal">${t.parallax}</p></div>
  </div>

  <section class="sec sec--black" id="destacados" aria-labelledby="h-dest">
    <div class="container">
      <div class="shead reveal"><span class="label">${t.destLabel}</span><h2 class="title-xl" id="h-dest">${t.destTitle}</h2></div>
      <div class="rail reveal" style="--d:.2s" data-rail>
        <button type="button" class="rail__arrow rail__arrow--prev" data-rail-prev aria-label="${t.prev}">${chev('m15 18-6-6 6-6')}</button>
        <div class="rail__track" data-rail-track tabindex="0" aria-label="${t.destList}">
          ${destacados.map((n) => card(byName[n], { badge: true })).join('\n          ')}
        </div>
        <button type="button" class="rail__arrow rail__arrow--next" data-rail-next aria-label="${t.next}">${chev('m9 18 6-6-6-6')}</button>
      </div>
      <div class="center reveal" style="--d:.3s"><a class="btn-outline" href="carta.html"><span>${t.fullMenu}</span>${ARROW}</a></div>
    </div>
  </section>

  <section class="sec sec--white sec--delivery" id="pedir" aria-labelledby="h-ped">
    <div class="ghost" aria-hidden="true">${lang === 'en' ? 'Delivery' : 'Domicilio'}</div>
    <div class="container">
      <div class="shead reveal"><span class="label">${t.delLabel}</span><h2 class="title-xl" id="h-ped">${t.delTitle}</h2></div>
      <p class="sub reveal" style="--d:.1s">${t.delSub}</p>
      <div class="dbtns reveal" style="--d:.2s">
        <a class="dbtn dbtn--justeat" href="${JUSTEAT}" rel="noopener"><span>Just Eat</span></a>
        <a class="dbtn dbtn--direct" href="${MAPS}" rel="noopener"><span>${t.pickup}</span></a>
      </div>
    </div>
  </section>

  <section class="sec sec--red" id="donde" aria-labelledby="h-find">
    <div class="container find">
      <div class="find__map reveal"><iframe src="${mapEmbed}" title="${t.mapTitle}" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe></div>
      <div class="find__info reveal" style="--d:.2s" id="horario">
        <h2 id="h-find">${t.findTitle}</h2>
        <div class="find__block"><strong class="tag">${t.address}</strong><p class="find__addr">${t.addr}</p></div>
        <div class="find__block"><strong class="tag">${t.hours}</strong>
          <ul class="hours">
            <li class="hours__item"><span>${t.lunch}</span><span class="num">12:00 - 16:30</span></li>
            <li class="hours__item"><span>${t.dinner}</span><span class="num">19:00 - 24:00</span></li>
          </ul>
          <p class="status" data-status aria-live="polite"><span class="status__k">${t.now}</span><span data-status-text>${t.statusDefault}</span></p>
        </div>
        <a class="btn-white" href="${MAPS}" rel="noopener"><span>${t.directions}</span>${ARROW}</a>
      </div>
    </div>
  </section>
</main>

${footer(true)}
${scripts}`;

  // ============ Carta ============
  const tabs = menu.map((c, i) => `<a href="#c-${c.id}" class="cat" data-cat="${c.id}"${i === 0 ? ' aria-current="true"' : ''}>${t.cat(c)}</a>`).join('\n        ');
  const row = (it) => { const [name, detail] = nm(it[0]); const d = [detail, it[1] && t.tdesc(it[1])].filter(Boolean).join('. ');
    return `<li class="row"><div class="row__main"><span class="row__name">${esc(name)}</span>${d ? `<span class="row__desc">${esc(d)}</span>` : ''}</div><span class="row__price num">${t.eur(it[2])}</span><button type="button" class="row__add" data-add="${esc(it[0])}" aria-label="${esc(t.orderDish(name))}">${t.orderNow}</button></li>`; };
  const panels = menu.map((c, i) => {
    const withPic = c.items.filter((i) => i[3]); const noPic = c.items.filter((i) => !i[3]); const note = t.note(c);
    return `<section class="panel${i === 0 ? ' is-open' : ''}" id="c-${c.id}" data-panel="${c.id}">
      <h2 class="panel__title">${t.cat(c)}</h2>${note ? `<p class="panel__note">${esc(note)}</p>` : ''}
      <div class="grid">
        ${withPic.map((it) => card(it)).join('\n        ')}
      </div>${noPic.length ? `
      <ul class="rows" aria-label="${esc(t.more2(t.cat(c)))}">
        ${noPic.map(row).join('\n        ')}
      </ul>` : ''}
    </section>`;
  }).join('\n    ');

  const carta = `${head(t.cartaTitle, t.cartaDesc, 'carta.html')}
<body class="page-carta">
<a class="skip" href="#main">${t.skip}</a>
${header(false, 'carta.html')}

<main id="main">
  <section class="phead" aria-labelledby="h-carta">
    <div class="container"><span class="label">${t.discover}</span><h1 class="title-xl" id="h-carta">${t.cartaH}</h1></div>
  </section>
  <div class="carta" data-carta>
    <div class="cats-bar">
      <nav class="container cats" aria-label="${t.sections}">
        ${tabs}
      </nav>
    </div>
    <div class="container panels">
    ${panels}
    </div>
    <script>(function(){var h=location.hash.slice(3),p=h&&document.querySelector('[data-panel="'+h+'"]');if(!p)return;document.querySelectorAll('.panel').forEach(function(x){x.classList.toggle('is-open',x===p)});document.querySelectorAll('.cat').forEach(function(c){if(c.dataset.cat===h)c.setAttribute('aria-current','true');else c.removeAttribute('aria-current')})})();</script>
  </div>
</main>

${footer(false)}
${scripts}`;

  return { home: typo(home), carta: typo(carta) };
};

// Cada página lleva dentro la otra versión del idioma (para cambiar de idioma sin recargar, también abriendo el archivo directamente).
const pages = { es: build('es'), en: build('en') };
const embed = (html, other) => html.replace(/<script src="[^"]*app\.js/, (m) => `<script type="text/x-alt-lang" id="alt-lang">${other.replace(/<\/script/g, '<\\/script')}</script>\n${m}`);
for (const [lang, other] of [['es', 'en'], ['en', 'es']]) {
  const dir = new URL(lang === 'en' ? './en/' : './', import.meta.url);
  mkdirSync(dir, { recursive: true });
  writeFileSync(new URL('index.html', dir), embed(pages[lang].home, pages[other].home));
  writeFileSync(new URL('carta.html', dir), embed(pages[lang].carta, pages[other].carta));
}
// ============ robots.txt y sitemap.xml (con SITE_URL) ============
writeFileSync(new URL('robots.txt', import.meta.url), ['User-agent: *', 'Allow: /', 'Disallow: /qr.html', '', `Sitemap: ${SITE_URL}/sitemap.xml`, ''].join('\n'));
const sitemapUrls = ['es', 'en'].flatMap((l) => ['index.html', 'carta.html'].map((p) => pageUrl(l, p)));
writeFileSync(new URL('sitemap.xml', import.meta.url), ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">', ...sitemapUrls.map((u) => `  <url><loc>${u}</loc></url>`), '</urlset>', ''].join('\n'));

// ============ QR de la carta: qr.svg (suelto) y qr.html (cartel para imprimir) ============
const qrUrl = SITE_URL + '/carta.html';
const qr = qrcode(0, 'Q'); qr.addData(qrUrl); qr.make();
const qn = qr.getModuleCount();
// quiet = módulos blancos alrededor del QR (4 es lo estándar; en el cartel se usa menos para que no se vea un recuadro)
const qrSvg = (cls = '', quiet = 4) => {
  const size = qn + quiet * 2; let path = '';
  for (let y = 0; y < qn; y++) for (let x = 0; x < qn; x++) if (qr.isDark(y, x)) path += `M${x + quiet} ${y + quiet}h1v1h-1z`;
  return `<svg${cls ? ` class="${cls}"` : ''} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges" role="img" aria-label="QR: ${qrUrl}"><rect width="${size}" height="${size}" fill="#fff"/><path d="${path}" fill="#0a0a0a"/></svg>`;
};
writeFileSync(new URL('qr.svg', import.meta.url), qrSvg());
writeFileSync(new URL('qr.html', import.meta.url), `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Cartel QR · Wok Two</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:wght@500;700;800&family=Dela+Gothic+One&display=swap" rel="stylesheet">
<style>
  @page { size: A4; margin: 0; }
  * { box-sizing: border-box; }
  body { margin: 0; background: #e9e6df; font-family: "Barlow", system-ui, sans-serif; color: #fff; }
  .warn { margin: 0; padding: 12px 20px; background: #ffdd57; color: #0a0a0a; font-weight: 700; font-size: 14px; text-align: center; }
  .bar { display: flex; justify-content: center; gap: 12px; padding: 16px; }
  .bar button { padding: 12px 24px; border: 3px solid #0a0a0a; background: #0a0a0a; font: 800 14px/1 "Barlow", sans-serif; letter-spacing: 1px; text-transform: uppercase; color: #fff; cursor: pointer; }
  .bar button:hover { background: #b6161e; border-color: #b6161e; }
  .poster { width: min(100%, 794px); aspect-ratio: 210 / 297; margin: 0 auto 32px; padding: 10.5% 8% 8%; display: flex; flex-direction: column; align-items: center; justify-content: space-between; text-align: center; background: #b6161e; position: relative; overflow: hidden; }
  .poster > * { position: relative; z-index: 1; }
  .jp { position: absolute !important; z-index: 0 !important; top: 50%; transform: translateY(-50%); writing-mode: vertical-rl; text-orientation: upright; font-family: "Dela Gothic One", "Noto Sans JP", "Yu Gothic", sans-serif; font-size: clamp(30px, 6.4vw, 56px); line-height: 1.05; letter-spacing: .06em; white-space: nowrap; color: rgb(255 255 255 / .14); }
  .jp--l { left: 3%; } .jp--r { right: 3%; }
  .jp-line { margin: 10px 0 0; font-family: "Dela Gothic One", "Noto Sans JP", "Yu Gothic", sans-serif; font-size: clamp(24px, 5.2vw, 44px); letter-spacing: .24em; text-shadow: 3px 3px 0 #0a0a0a; }
  .sun { position: absolute !important; z-index: 0 !important; left: 50%; top: 57%; width: 84%; aspect-ratio: 1; transform: translate(-50%, -50%); border-radius: 50%; background: radial-gradient(circle, rgb(255 255 255 / .10) 0 62%, rgb(255 255 255 / .04) 63% 100%); box-shadow: 0 0 0 3px rgb(255 255 255 / .12); }
  .lanterns { position: absolute !important; z-index: 1 !important; top: 0; left: 0; width: 100%; height: auto; pointer-events: none; }
  .welcome { position: absolute !important; z-index: 2 !important; top: 3.6%; left: 50%; transform: translateX(-50%); display: flex; align-items: center; gap: 14px; margin: 0; white-space: nowrap; font-family: "Dela Gothic One", "Noto Sans JP", "Yu Gothic", sans-serif; font-size: clamp(15px, 3vw, 25px); letter-spacing: .32em; text-shadow: 2px 2px 0 #0a0a0a; }
  .welcome::before, .welcome::after { content: ""; width: clamp(14px, 3vw, 26px); height: 3px; background: #fff; box-shadow: 2px 2px 0 #0a0a0a; }
  .hanko { position: absolute !important; z-index: 2 !important; bottom: 15%; left: 8%; padding: 10px 8px; background: #0a0a0a; border: 3px solid #fff; writing-mode: vertical-rl; text-orientation: upright; font-family: "Dela Gothic One", "Noto Sans JP", "Yu Gothic", sans-serif; font-size: clamp(20px, 4.2vw, 34px); line-height: 1.1; letter-spacing: .1em; transform: rotate(-6deg); box-shadow: 4px 4px 0 rgb(0 0 0 / .45); }
  .jp-take { font-family: "Dela Gothic One", "Noto Sans JP", "Yu Gothic", sans-serif; font-size: 1.5em; letter-spacing: .2em; line-height: 1.2; color: #fff; text-shadow: 2px 2px 0 #0a0a0a; }
  .brand { font-family: "Bebas Neue", Impact, sans-serif; font-size: clamp(64px, 14vw, 120px); line-height: .9; letter-spacing: 3px; text-transform: uppercase; text-shadow: 5px 5px 0 #0a0a0a; }
  .sub { margin: 0; font-weight: 800; font-size: clamp(13px, 2.4vw, 20px); letter-spacing: 6px; text-transform: uppercase; text-shadow: 2px 2px 0 #0a0a0a; }
  .scan { margin: 0; font-family: "Bebas Neue", Impact, sans-serif; font-size: clamp(34px, 7vw, 60px); line-height: 1; letter-spacing: 2px; text-transform: uppercase; }
  .scan small { display: block; margin-top: 6px; font-size: .55em; letter-spacing: 3px; color: rgb(255 255 255 / .85); }
  .card { width: 50%; }
  .card svg { display: block; width: 100%; height: auto; }
  .info { margin-top: 7%; display: grid; gap: 12px; font-weight: 700; font-size: clamp(13px, 2.4vw, 19px); }
  .info b { font-family: "Bebas Neue", Impact, sans-serif; font-weight: 400; font-size: 1.6em; letter-spacing: 2px; }
  .url { font-size: .8em; opacity: .85; word-break: break-all; }
  @media print {
    body { background: #fff; }
    .warn, .bar { display: none; }
    .poster { width: 210mm; height: 297mm; margin: 0; aspect-ratio: auto; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  }
</style>
</head>
<body>
${SITE_URL_SET ? '' : `<p class="warn">Dirección provisional (${qrUrl}). Antes de imprimir, pon la dirección real en SITE_URL de build.mjs y ejecuta node build.mjs.</p>`}
<div class="bar"><button type="button" onclick="print()">Imprimir cartel</button></div>
<main class="poster">
  <svg class="lanterns" viewBox="0 0 794 200" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="glow"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs><line x1="34" y1="0" x2="34" y2="22" stroke="#0a0a0a" stroke-width="1.4"/><line x1="92" y1="0" x2="92" y2="58" stroke="#0a0a0a" stroke-width="1.4"/><line x1="150" y1="0" x2="150" y2="10" stroke="#0a0a0a" stroke-width="1.4"/><line x1="58" y1="0" x2="58" y2="112" stroke="#0a0a0a" stroke-width="1.4"/><line x1="172" y1="0" x2="172" y2="92" stroke="#0a0a0a" stroke-width="1.4"/><line x1="112" y1="0" x2="112" y2="150" stroke="#0a0a0a" stroke-width="1.4"/><line x1="754" y1="0" x2="754" y2="10" stroke="#0a0a0a" stroke-width="1.4"/><line x1="690" y1="0" x2="690" y2="60" stroke="#0a0a0a" stroke-width="1.4"/><line x1="630" y1="0" x2="630" y2="24" stroke="#0a0a0a" stroke-width="1.4"/><line x1="736" y1="0" x2="736" y2="108" stroke="#0a0a0a" stroke-width="1.4"/><line x1="644" y1="0" x2="644" y2="100" stroke="#0a0a0a" stroke-width="1.4"/><line x1="702" y1="0" x2="702" y2="152" stroke="#0a0a0a" stroke-width="1.4"/><g transform="translate(34 22) rotate(-3) scale(0.92) translate(-30 8)"><line x1="30" y1="-8" x2="30" y2="14" stroke="#0a0a0a" stroke-width="1.6"/><ellipse cx="30" cy="52" rx="34" ry="38" fill="url(#glow)"/><rect x="17" y="14" width="26" height="8" rx="2" fill="#0a0a0a"/><path d="M17 22 C-2 30 -2 72 17 80 L43 80 C62 72 62 30 43 22 Z" fill="#fbf1dc"/><g stroke="#b6161e" stroke-opacity=".55" stroke-width="1.3" fill="none"><path d="M7 36 Q30 41 53 36"/><path d="M3 48 Q30 54 57 48"/><path d="M3 60 Q30 66 57 60"/><path d="M7 72 Q30 78 53 72"/></g><text x="30" y="60" text-anchor="middle" font-family="Dela Gothic One, Noto Sans JP, Yu Gothic, sans-serif" font-size="22" fill="#b6161e">福</text><rect x="17" y="80" width="26" height="8" rx="2" fill="#0a0a0a"/><line x1="30" y1="88" x2="30" y2="104" stroke="#0a0a0a" stroke-width="1.6"/><g stroke="#0a0a0a" stroke-width="1.2"><line x1="30" y1="100" x2="26" y2="112"/><line x1="30" y1="100" x2="30" y2="114"/><line x1="30" y1="100" x2="34" y2="112"/></g></g><g transform="translate(92 58) rotate(4) scale(0.7) translate(-30 8)"><line x1="30" y1="-8" x2="30" y2="14" stroke="#0a0a0a" stroke-width="1.6"/><ellipse cx="30" cy="52" rx="34" ry="38" fill="url(#glow)"/><rect x="17" y="14" width="26" height="8" rx="2" fill="#0a0a0a"/><path d="M17 22 C-2 30 -2 72 17 80 L43 80 C62 72 62 30 43 22 Z" fill="#ffffff"/><g stroke="#b6161e" stroke-opacity=".55" stroke-width="1.3" fill="none"><path d="M7 36 Q30 41 53 36"/><path d="M3 48 Q30 54 57 48"/><path d="M3 60 Q30 66 57 60"/><path d="M7 72 Q30 78 53 72"/></g><text x="30" y="60" text-anchor="middle" font-family="Dela Gothic One, Noto Sans JP, Yu Gothic, sans-serif" font-size="22" fill="#b6161e">寿</text><rect x="17" y="80" width="26" height="8" rx="2" fill="#0a0a0a"/><line x1="30" y1="88" x2="30" y2="104" stroke="#0a0a0a" stroke-width="1.6"/><g stroke="#0a0a0a" stroke-width="1.2"><line x1="30" y1="100" x2="26" y2="112"/><line x1="30" y1="100" x2="30" y2="114"/><line x1="30" y1="100" x2="34" y2="112"/></g></g><g transform="translate(150 10) rotate(-2) scale(1.05) translate(-30 8)"><line x1="30" y1="-8" x2="30" y2="14" stroke="#0a0a0a" stroke-width="1.6"/><ellipse cx="30" cy="52" rx="34" ry="38" fill="url(#glow)"/><rect x="17" y="14" width="26" height="8" rx="2" fill="#0a0a0a"/><path d="M17 22 C-2 30 -2 72 17 80 L43 80 C62 72 62 30 43 22 Z" fill="#f4d58d"/><g stroke="#b6161e" stroke-opacity=".55" stroke-width="1.3" fill="none"><path d="M7 36 Q30 41 53 36"/><path d="M3 48 Q30 54 57 48"/><path d="M3 60 Q30 66 57 60"/><path d="M7 72 Q30 78 53 72"/></g><text x="30" y="60" text-anchor="middle" font-family="Dela Gothic One, Noto Sans JP, Yu Gothic, sans-serif" font-size="22" fill="#b6161e">味</text><rect x="17" y="80" width="26" height="8" rx="2" fill="#0a0a0a"/><line x1="30" y1="88" x2="30" y2="104" stroke="#0a0a0a" stroke-width="1.6"/><g stroke="#0a0a0a" stroke-width="1.2"><line x1="30" y1="100" x2="26" y2="112"/><line x1="30" y1="100" x2="30" y2="114"/><line x1="30" y1="100" x2="34" y2="112"/></g></g><g transform="translate(58 112) rotate(5) scale(0.6) translate(-30 8)"><line x1="30" y1="-8" x2="30" y2="14" stroke="#0a0a0a" stroke-width="1.6"/><ellipse cx="30" cy="52" rx="34" ry="38" fill="url(#glow)"/><rect x="17" y="14" width="26" height="8" rx="2" fill="#0a0a0a"/><path d="M17 22 C-2 30 -2 72 17 80 L43 80 C62 72 62 30 43 22 Z" fill="#f4d58d"/><g stroke="#b6161e" stroke-opacity=".55" stroke-width="1.3" fill="none"><path d="M7 36 Q30 41 53 36"/><path d="M3 48 Q30 54 57 48"/><path d="M3 60 Q30 66 57 60"/><path d="M7 72 Q30 78 53 72"/></g><text x="30" y="60" text-anchor="middle" font-family="Dela Gothic One, Noto Sans JP, Yu Gothic, sans-serif" font-size="22" fill="#b6161e">酒</text><rect x="17" y="80" width="26" height="8" rx="2" fill="#0a0a0a"/><line x1="30" y1="88" x2="30" y2="104" stroke="#0a0a0a" stroke-width="1.6"/><g stroke="#0a0a0a" stroke-width="1.2"><line x1="30" y1="100" x2="26" y2="112"/><line x1="30" y1="100" x2="30" y2="114"/><line x1="30" y1="100" x2="34" y2="112"/></g></g><g transform="translate(172 92) rotate(-4) scale(0.52) translate(-30 8)"><line x1="30" y1="-8" x2="30" y2="14" stroke="#0a0a0a" stroke-width="1.6"/><ellipse cx="30" cy="52" rx="34" ry="38" fill="url(#glow)"/><rect x="17" y="14" width="26" height="8" rx="2" fill="#0a0a0a"/><path d="M17 22 C-2 30 -2 72 17 80 L43 80 C62 72 62 30 43 22 Z" fill="#fbf1dc"/><g stroke="#b6161e" stroke-opacity=".55" stroke-width="1.3" fill="none"><path d="M7 36 Q30 41 53 36"/><path d="M3 48 Q30 54 57 48"/><path d="M3 60 Q30 66 57 60"/><path d="M7 72 Q30 78 53 72"/></g><text x="30" y="60" text-anchor="middle" font-family="Dela Gothic One, Noto Sans JP, Yu Gothic, sans-serif" font-size="22" fill="#b6161e">喜</text><rect x="17" y="80" width="26" height="8" rx="2" fill="#0a0a0a"/><line x1="30" y1="88" x2="30" y2="104" stroke="#0a0a0a" stroke-width="1.6"/><g stroke="#0a0a0a" stroke-width="1.2"><line x1="30" y1="100" x2="26" y2="112"/><line x1="30" y1="100" x2="30" y2="114"/><line x1="30" y1="100" x2="34" y2="112"/></g></g><g transform="translate(112 150) rotate(3) scale(0.46) translate(-30 8)"><line x1="30" y1="-8" x2="30" y2="14" stroke="#0a0a0a" stroke-width="1.6"/><ellipse cx="30" cy="52" rx="34" ry="38" fill="url(#glow)"/><rect x="17" y="14" width="26" height="8" rx="2" fill="#0a0a0a"/><path d="M17 22 C-2 30 -2 72 17 80 L43 80 C62 72 62 30 43 22 Z" fill="#ffffff"/><g stroke="#b6161e" stroke-opacity=".55" stroke-width="1.3" fill="none"><path d="M7 36 Q30 41 53 36"/><path d="M3 48 Q30 54 57 48"/><path d="M3 60 Q30 66 57 60"/><path d="M7 72 Q30 78 53 72"/></g><text x="30" y="60" text-anchor="middle" font-family="Dela Gothic One, Noto Sans JP, Yu Gothic, sans-serif" font-size="22" fill="#b6161e">祭</text><rect x="17" y="80" width="26" height="8" rx="2" fill="#0a0a0a"/><line x1="30" y1="88" x2="30" y2="104" stroke="#0a0a0a" stroke-width="1.6"/><g stroke="#0a0a0a" stroke-width="1.2"><line x1="30" y1="100" x2="26" y2="112"/><line x1="30" y1="100" x2="30" y2="114"/><line x1="30" y1="100" x2="34" y2="112"/></g></g><g transform="translate(754 10) rotate(3) scale(1.0) translate(-30 8)"><line x1="30" y1="-8" x2="30" y2="14" stroke="#0a0a0a" stroke-width="1.6"/><ellipse cx="30" cy="52" rx="34" ry="38" fill="url(#glow)"/><rect x="17" y="14" width="26" height="8" rx="2" fill="#0a0a0a"/><path d="M17 22 C-2 30 -2 72 17 80 L43 80 C62 72 62 30 43 22 Z" fill="#fbf1dc"/><g stroke="#b6161e" stroke-opacity=".55" stroke-width="1.3" fill="none"><path d="M7 36 Q30 41 53 36"/><path d="M3 48 Q30 54 57 48"/><path d="M3 60 Q30 66 57 60"/><path d="M7 72 Q30 78 53 72"/></g><text x="30" y="60" text-anchor="middle" font-family="Dela Gothic One, Noto Sans JP, Yu Gothic, sans-serif" font-size="22" fill="#b6161e">旨</text><rect x="17" y="80" width="26" height="8" rx="2" fill="#0a0a0a"/><line x1="30" y1="88" x2="30" y2="104" stroke="#0a0a0a" stroke-width="1.6"/><g stroke="#0a0a0a" stroke-width="1.2"><line x1="30" y1="100" x2="26" y2="112"/><line x1="30" y1="100" x2="30" y2="114"/><line x1="30" y1="100" x2="34" y2="112"/></g></g><g transform="translate(690 60) rotate(-4) scale(0.72) translate(-30 8)"><line x1="30" y1="-8" x2="30" y2="14" stroke="#0a0a0a" stroke-width="1.6"/><ellipse cx="30" cy="52" rx="34" ry="38" fill="url(#glow)"/><rect x="17" y="14" width="26" height="8" rx="2" fill="#0a0a0a"/><path d="M17 22 C-2 30 -2 72 17 80 L43 80 C62 72 62 30 43 22 Z" fill="#f4d58d"/><g stroke="#b6161e" stroke-opacity=".55" stroke-width="1.3" fill="none"><path d="M7 36 Q30 41 53 36"/><path d="M3 48 Q30 54 57 48"/><path d="M3 60 Q30 66 57 60"/><path d="M7 72 Q30 78 53 72"/></g><text x="30" y="60" text-anchor="middle" font-family="Dela Gothic One, Noto Sans JP, Yu Gothic, sans-serif" font-size="22" fill="#b6161e">酒</text><rect x="17" y="80" width="26" height="8" rx="2" fill="#0a0a0a"/><line x1="30" y1="88" x2="30" y2="104" stroke="#0a0a0a" stroke-width="1.6"/><g stroke="#0a0a0a" stroke-width="1.2"><line x1="30" y1="100" x2="26" y2="112"/><line x1="30" y1="100" x2="30" y2="114"/><line x1="30" y1="100" x2="34" y2="112"/></g></g><g transform="translate(630 24) rotate(2) scale(0.9) translate(-30 8)"><line x1="30" y1="-8" x2="30" y2="14" stroke="#0a0a0a" stroke-width="1.6"/><ellipse cx="30" cy="52" rx="34" ry="38" fill="url(#glow)"/><rect x="17" y="14" width="26" height="8" rx="2" fill="#0a0a0a"/><path d="M17 22 C-2 30 -2 72 17 80 L43 80 C62 72 62 30 43 22 Z" fill="#ffffff"/><g stroke="#b6161e" stroke-opacity=".55" stroke-width="1.3" fill="none"><path d="M7 36 Q30 41 53 36"/><path d="M3 48 Q30 54 57 48"/><path d="M3 60 Q30 66 57 60"/><path d="M7 72 Q30 78 53 72"/></g><text x="30" y="60" text-anchor="middle" font-family="Dela Gothic One, Noto Sans JP, Yu Gothic, sans-serif" font-size="22" fill="#b6161e">福</text><rect x="17" y="80" width="26" height="8" rx="2" fill="#0a0a0a"/><line x1="30" y1="88" x2="30" y2="104" stroke="#0a0a0a" stroke-width="1.6"/><g stroke="#0a0a0a" stroke-width="1.2"><line x1="30" y1="100" x2="26" y2="112"/><line x1="30" y1="100" x2="30" y2="114"/><line x1="30" y1="100" x2="34" y2="112"/></g></g><g transform="translate(736 108) rotate(-5) scale(0.6) translate(-30 8)"><line x1="30" y1="-8" x2="30" y2="14" stroke="#0a0a0a" stroke-width="1.6"/><ellipse cx="30" cy="52" rx="34" ry="38" fill="url(#glow)"/><rect x="17" y="14" width="26" height="8" rx="2" fill="#0a0a0a"/><path d="M17 22 C-2 30 -2 72 17 80 L43 80 C62 72 62 30 43 22 Z" fill="#fbf1dc"/><g stroke="#b6161e" stroke-opacity=".55" stroke-width="1.3" fill="none"><path d="M7 36 Q30 41 53 36"/><path d="M3 48 Q30 54 57 48"/><path d="M3 60 Q30 66 57 60"/><path d="M7 72 Q30 78 53 72"/></g><text x="30" y="60" text-anchor="middle" font-family="Dela Gothic One, Noto Sans JP, Yu Gothic, sans-serif" font-size="22" fill="#b6161e">寿</text><rect x="17" y="80" width="26" height="8" rx="2" fill="#0a0a0a"/><line x1="30" y1="88" x2="30" y2="104" stroke="#0a0a0a" stroke-width="1.6"/><g stroke="#0a0a0a" stroke-width="1.2"><line x1="30" y1="100" x2="26" y2="112"/><line x1="30" y1="100" x2="30" y2="114"/><line x1="30" y1="100" x2="34" y2="112"/></g></g><g transform="translate(644 100) rotate(4) scale(0.5) translate(-30 8)"><line x1="30" y1="-8" x2="30" y2="14" stroke="#0a0a0a" stroke-width="1.6"/><ellipse cx="30" cy="52" rx="34" ry="38" fill="url(#glow)"/><rect x="17" y="14" width="26" height="8" rx="2" fill="#0a0a0a"/><path d="M17 22 C-2 30 -2 72 17 80 L43 80 C62 72 62 30 43 22 Z" fill="#f4d58d"/><g stroke="#b6161e" stroke-opacity=".55" stroke-width="1.3" fill="none"><path d="M7 36 Q30 41 53 36"/><path d="M3 48 Q30 54 57 48"/><path d="M3 60 Q30 66 57 60"/><path d="M7 72 Q30 78 53 72"/></g><text x="30" y="60" text-anchor="middle" font-family="Dela Gothic One, Noto Sans JP, Yu Gothic, sans-serif" font-size="22" fill="#b6161e">味</text><rect x="17" y="80" width="26" height="8" rx="2" fill="#0a0a0a"/><line x1="30" y1="88" x2="30" y2="104" stroke="#0a0a0a" stroke-width="1.6"/><g stroke="#0a0a0a" stroke-width="1.2"><line x1="30" y1="100" x2="26" y2="112"/><line x1="30" y1="100" x2="30" y2="114"/><line x1="30" y1="100" x2="34" y2="112"/></g></g><g transform="translate(702 152) rotate(-3) scale(0.44) translate(-30 8)"><line x1="30" y1="-8" x2="30" y2="14" stroke="#0a0a0a" stroke-width="1.6"/><ellipse cx="30" cy="52" rx="34" ry="38" fill="url(#glow)"/><rect x="17" y="14" width="26" height="8" rx="2" fill="#0a0a0a"/><path d="M17 22 C-2 30 -2 72 17 80 L43 80 C62 72 62 30 43 22 Z" fill="#ffffff"/><g stroke="#b6161e" stroke-opacity=".55" stroke-width="1.3" fill="none"><path d="M7 36 Q30 41 53 36"/><path d="M3 48 Q30 54 57 48"/><path d="M3 60 Q30 66 57 60"/><path d="M7 72 Q30 78 53 72"/></g><text x="30" y="60" text-anchor="middle" font-family="Dela Gothic One, Noto Sans JP, Yu Gothic, sans-serif" font-size="22" fill="#b6161e">喜</text><rect x="17" y="80" width="26" height="8" rx="2" fill="#0a0a0a"/><line x1="30" y1="88" x2="30" y2="104" stroke="#0a0a0a" stroke-width="1.6"/><g stroke="#0a0a0a" stroke-width="1.2"><line x1="30" y1="100" x2="26" y2="112"/><line x1="30" y1="100" x2="30" y2="114"/><line x1="30" y1="100" x2="34" y2="112"/></g></g></svg>
  <p class="welcome" lang="ja">いらっしゃいませ</p>
  
  
  <div class="sun" aria-hidden="true"></div>
  <div class="jp jp--l" lang="ja" aria-hidden="true">寿司・握り・巻き</div><div class="jp jp--r" lang="ja" aria-hidden="true">ウォック・炒め・麺</div>
  <div class="hanko" lang="ja" aria-hidden="true">美味</div>
  <div><div class="brand">Wok Two</div><p class="sub">Sushi · Wok · Málaga</p><p class="jp-line" lang="ja">ウォック・ツー</p></div>
  <p class="scan">Escanea y mira la carta<small>Scan to see the menu</small></p>
  <div class="card">${qrSvg('', 2)}</div>
  <div class="info"><span><b>Pide para recoger</b></span><span class="jp-take" lang="ja">お持ち帰り・ご注文はこちら</span><span>Calle Cuarteles 15, Málaga · Tel. 688 122 609</span><span class="url">${qrUrl.replace(/^https?:\/\//, '')}</span></div>
</main>
</body>
</html>
`);
const missing = all.map((it) => split(it[0])[0]).filter((b) => !/^Menú \d+$/.test(b) && !(b in EN.names));
console.log('Escritos index.html, carta.html, en/index.html, en/carta.html, qr.html, qr.svg:', total, 'platos', missing.length ? '\nSin traducir: ' + missing.join(', ') : '');
