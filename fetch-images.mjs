// Descarga las fotos de menu.mjs a images/ (800x600, y 1200x900 para la de portada). Uso: node fetch-images.mjs
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { menu } from './menu.mjs';
const CDN = 'https://just-eat-prod-eu-res.cloudinary.com/image/upload';
mkdirSync('images', { recursive: true });
const ids = [...new Set(menu.flatMap((c) => c.items.map((i) => i[3])).filter(Boolean))];
const jobs = ids.map((id) => [id, 800, 600]);
jobs.push([menu[0].items[0][3], 1200, 900]);
let ok = 0, fail = [];
for (const [id, w, h] of jobs) {
  const f = `images/${id}-${w}.jpg`;
  if (existsSync(f)) { ok++; continue; }
  const r = await fetch(`${CDN}/c_fill,q_auto,f_jpg,w_${w},h_${h}/v1/es/dishes/49791/${id}`);
  if (!r.ok) { fail.push(id); continue; }
  writeFileSync(f, Buffer.from(await r.arrayBuffer())); ok++;
}
console.log(ok, 'descargadas', fail.length ? 'FALLOS: ' + fail : '');
