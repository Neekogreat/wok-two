// Genera index.html a partir de menu.mjs. Uso: node build.mjs
import { writeFileSync } from 'node:fs';
import { menu, destacados } from './menu.mjs';

const JUSTEAT = 'https://www.just-eat.es/restaurants-wok-two-malaga/menu';
const MAPS = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('Wok Two, Calle Cuarteles 15, 29002 Málaga');
const CDN = 'https://just-eat-prod-eu-res.cloudinary.com/image/upload';
const img = (id, w) => `images/${id}-${w}.jpg`;
const heroId = menu[0].items[0][3];
const srcset = (id) => id === heroId ? `${img(id, 800)} 800w, ${img(id, 1200)} 1200w` : '';
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const eur = (n) => n.toFixed(2).replace('.', ',') + ' €';
const split = (full) => { const i = full.indexOf(','); return i < 0 ? [full, ''] : [full.slice(0, i), full.slice(i + 1).trim()]; };

const all = menu.flatMap((c) => c.items.map((it) => ({ cat: c.label, it })));
const total = all.length;
const byName = Object.fromEntries(all.map(({ it }) => [it[0], it]));
const prices = menu[0].items.map((i) => i[2]);
const cheapest = Math.min(...prices.filter((p) => p < 40));
const hero = menu[0].items[0];

const photo = (it, slot, sizes, extra = '') => {
  const [name] = split(it[0]);
  return `<div class="photo" data-slot="${slot}" data-alt="Foto propia de ${esc(name)}"><img src="${img(it[3], 800)}"${srcset(it[3]) ? ` srcset="${srcset(it[3])}" sizes="${sizes}"` : ''} width="800" height="600" alt="${esc(name)}" ${extra}></div>`;
};

const rail = destacados.map((n) => {
  const it = byName[n]; const [name, detail] = split(it[0]);
  return `<li class="mat mat--small">${photo(it, 'rail-' + it[3].slice(0, 4), '(min-width: 60rem) 24vw, 70vw', 'loading="lazy" decoding="async"')}
      <p class="mat__cap"><span class="mat__name">${esc(name)}</span><span class="num">${eur(it[2])}</span></p>${detail ? `<p class="mat__sub">${esc(detail)}</p>` : ''}</li>`;
}).join('\n    ');

const tabs = menu.map((c, i) => `<a href="#c-${c.id}" class="cat" data-cat="${c.id}"${i === 0 ? ' aria-current="true"' : ''}><span>${c.label}</span><span class="num cat__n">${c.items.length}</span></a>`).join('\n        ');

const panels = menu.map((c, ci) => `<section class="panel" id="c-${c.id}" data-panel="${c.id}"${ci ? '' : ''}>
        <h3 class="panel__title">${c.label}</h3>${c.note ? `<p class="panel__note">${esc(c.note)}</p>` : ''}
        <ul class="rows">
${c.items.map((it) => { const [name, detail] = split(it[0]); const meta = [detail, ''].filter(Boolean)[0] || '';
  return `          <li class="row"${it[3] ? ` data-img="${it[3]}"` : ''} data-name="${esc(name)}" data-price="${eur(it[2])}">
            <div class="row__main"><span class="row__name">${esc(name)}</span>${meta ? `<span class="row__meta">${esc(meta)}</span>` : ''}${it[1] ? `<span class="row__desc">${esc(it[1])}</span>` : ''}</div>
            <span class="row__price num">${eur(it[2])}</span>
          </li>`; }).join('\n')}
        </ul>
      </section>`).join('\n      ');

const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Wok Two, sushi y wok en Málaga</title>
<meta name="description" content="Wok Two, calle Cuarteles 15, Málaga. Sushi, makis, fideos y arroces a domicilio o para recoger. Abierto todos los días, comidas y cenas.">
<link rel="preconnect" href="https://api.fontshare.com"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://api.fontshare.com/v2/css?f[]=sentient@300,400&display=swap" rel="stylesheet"><link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400&display=swap" rel="stylesheet">
<link rel="stylesheet" href="styles.css">
<script>document.documentElement.classList.add('js');</script>
</head>
<body>
<a class="skip" href="#carta">Ir a la carta</a>
<header class="nav">
  <div class="container nav__in">
    <a class="nav__brand" href="#top" aria-label="Wok Two, inicio">Wok Two</a>
    <nav class="nav__links" aria-label="Principal"><a href="#carta">Carta</a><a href="#horario">Horario</a><a href="#pedir">Dónde</a></nav>
    <a class="btn btn--nav" href="${JUSTEAT}" rel="noopener">Pedir en Just Eat</a>
  </div>
</header>

<main id="top">
  <section class="hero" aria-labelledby="h-hero">
    <div class="container hero__grid">
      <div class="hero__text">
        <h1 id="h-hero">Sushi y wok en la calle Cuarteles</h1>
        <p class="lead">Menús desde ${eur(cheapest)}, a domicilio por Málaga o para recoger.</p>
        <div class="actions"><a class="btn" href="${JUSTEAT}" rel="noopener">Pedir en Just Eat</a><a class="link" href="#carta">Ver la carta</a></div>
      </div>
      <figure class="mat hero__mat">
        ${photo(hero, 'hero', '(min-width: 60rem) 55vw, 100vw', 'fetchpriority="high"')}
        <figcaption class="mat__cap"><span class="mat__name">Menú 1, 12 unidades</span><span class="num">${eur(hero[2])}</span></figcaption>
      </figure>
    </div>
  </section>

  <section class="sec" aria-labelledby="h-dest">
    <div class="container">
      <div class="head head--split"><h2 id="h-dest">Los cinco destacados</h2><p class="lead">Los que Just Eat marca como destacados en nuestra carta.</p></div>
      <ul class="rail" tabindex="0" aria-label="Platos destacados">
    ${rail}
      </ul>
    </div>
  </section>

  <section class="sec sec--statement" aria-labelledby="h-st">
    <div class="container">
      <h2 class="statement" id="h-st">Menús de 9 a 56 piezas, desde ${eur(cheapest)}.</h2>
      <div class="st__foot">
        <p class="pencil"><span class="pencil__rule" aria-hidden="true"></span>Plato Grande, 56 unidades, ${eur(47)}</p>
        <p class="wall dropcap">Los hay de nigiris, de makis, de californias y de todo un poco. El Plato Grande es el más completo de la carta.</p>
      </div>
    </div>
  </section>

  <section class="sec sec--carta" id="carta" aria-labelledby="h-carta">
    <div class="container">
      <div class="head head--split"><h2 id="h-carta">La carta</h2><p class="lead">${total} platos en ${menu.length} secciones. Elige una y recorre la lista.</p></div>
      <div class="carta" data-carta>
        <nav class="cats" aria-label="Secciones de la carta">
        ${tabs}
        </nav>
        <div class="panels">
      ${panels}
        </div>
        <aside class="carta__print" aria-hidden="true">
          <figure class="mat mat--small">
            <div class="photo" data-slot="carta-print" data-alt="Foto del plato seleccionado en la carta"><img src="${img(hero[3], 800)}" alt="" width="800" height="600" loading="lazy" decoding="async"></div>
            <figcaption class="mat__cap"><span class="mat__name" data-print-name>Menú 1</span><span class="num" data-print-price>${eur(hero[2])}</span></figcaption>
          </figure>
        </aside>
      </div>
    </div>
  </section>

  <section class="sec" id="horario" aria-labelledby="h-hor">
    <div class="container hor">
      <div class="hor__head">
        <h2 id="h-hor">Abierto todos los días</h2>
        <p class="lead">Comidas y cenas, de lunes a domingo. Las horas de entrega pueden variar.</p>
      </div>
      <div class="hor__body">
        <dl class="times">
          <div class="times__row"><dt>Comidas</dt><dd class="num">12:00 a 16:30</dd></div>
          <div class="times__row"><dt>Cenas</dt><dd class="num">19:00 a 23:30</dd></div>
        </dl>
        <p class="status" data-status aria-live="polite"><span class="status__k">Ahora</span><span data-status-text>Abierto todos los días, de 12:00 a 16:30 y de 19:00 a 23:30.</span></p>
        <p class="zone">Repartimos en los códigos postales del 29001 al 29018 y en el 29190.</p>
      </div>
    </div>
  </section>

  <section class="sec sec--band" id="pedir" aria-labelledby="h-ped">
    <div class="container ped">
      <h2 class="statement statement--s" id="h-ped">Pide a domicilio o pasa a recoger.</h2>
      <div class="ped__side">
        <address class="addr"><span class="addr__k">Dirección</span>Calle Cuarteles, 15<br>29002 Málaga</address>
        <div class="actions"><a class="btn" href="${JUSTEAT}" rel="noopener">Pedir en Just Eat</a><a class="link" href="${MAPS}" rel="noopener">Cómo llegar</a></div>
      </div>
    </div>
  </section>
</main>

<footer class="foot">
  <div class="container foot__in">
    <p class="foot__brand">Wok Two</p>
    <nav class="foot__links" aria-label="Pie de página"><a href="#carta">Carta</a><a href="#horario">Horario</a><a href="${JUSTEAT}" rel="noopener">Just Eat</a><a href="#top">Arriba</a></nav>
    <p class="foot__addr">Calle Cuarteles, 15, 29002 Málaga</p>
    <p class="foot__credit" data-credits>Fotografías: Wok Two.</p>
  </div>
</footer>

<script src="app.js"></script>
<script>window.hallmarkSlots = (m) => { for (const [k, v] of Object.entries(m)) { const s = document.querySelector(\`[data-slot="\${k}"]\`); if (!s) continue; const im = new Image(); im.src = typeof v === 'string' ? v : v.src; im.alt = (typeof v === 'object' && v.alt) || s.dataset.alt || ''; s.querySelectorAll(':scope > img').forEach((o) => o.remove()); s.prepend(im); } };
document.querySelectorAll('[data-slot] img').forEach((i) => { if (i.complete && !i.naturalWidth) i.remove(); else i.addEventListener('error', () => i.remove(), { once: true }); });</script>
</body>
</html>
`;
writeFileSync(new URL('./index.html', import.meta.url), html);
console.log('index.html escrito:', total, 'platos');
