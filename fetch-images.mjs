// Descarga las fotos de menu.mjs a images/ en calidad alta (q_90): 800x600 todas y 1024x768 (tamaño original, el máximo que hay) la foto grande. Uso: node fetch-images.mjs
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { menu } from './menu.mjs';
const CDN = 'https://just-eat-prod-eu-res.cloudinary.com/image/upload';
const dir = new URL('./images/', import.meta.url);
mkdirSync(dir, { recursive: true });
const items = menu.flatMap((c) => c.items);
const ids = [...new Set(items.map((i) => i[3]).filter(Boolean))];
// Solo la foto grande de la franja con parallax (y de la imagen para compartir en redes) se baja a 1024x768.
const big = ['Menú 11, 40 unidades'].map((n) => items.find((i) => i[0] === n)?.[3]).filter(Boolean);
const jobs = [...ids.map((id) => [id, 800, 600]), ...big.map((id) => [id, 1024, 768])];
let ok = 0, fail = [];
for (const [id, w, h] of jobs) {
  const f = new URL(`${id}-${w}.jpg`, dir);
  if (existsSync(f)) { ok++; continue; }
  const r = await fetch(`${CDN}/c_fill,q_90,f_jpg,w_${w},h_${h}/v1/es/dishes/49791/${id}`);
  if (!r.ok) { fail.push(id); continue; }
  writeFileSync(f, Buffer.from(await r.arrayBuffer())); ok++;
}
console.log(ok, 'fotos listas', fail.length ? 'FALLOS: ' + fail : '');
