# Wok Two

Web del restaurante Wok Two (calle Cuarteles 15, Málaga): portada, carta con precios, pedido para recoger
por WhatsApp, versión en español e inglés y cartel con QR para imprimir. Es una web estática: no hace falta
servidor ni dependencias, solo Node.js (18 o superior) para generar las páginas.

## Generar la web

```
node build.mjs
```

Genera `index.html`, `carta.html`, `en/index.html`, `en/carta.html`, `qr.html`, `qr.svg`, `robots.txt` y
`sitemap.xml`. Los HTML **no se editan a mano**: se vuelven a crear cada vez. Para verla, abre `index.html`.

## Qué se toca y dónde

| Quiero cambiar… | Dónde |
|---|---|
| Precios, platos, descripciones, fotos | `menu.mjs` (y `menu-en.mjs` para el inglés) |
| Textos de la web, enlaces | `build.mjs` (diccionarios `L.es` y `L.en`) |
| Horario (web, aviso de abierto/cerrado y horas de recogida) | `HOURS` en `build.mjs` |
| «Nuestra historia» (texto y foto) | textos `story` en `L.es`/`L.en` y foto en `images/`; para ocultarla, `STORY_READY = false` en `build.mjs` |
| Número de WhatsApp que recibe los pedidos | `WHATSAPP` en `build.mjs` |
| Dirección de la web (QR, canonical, sitemap, redes) | `SITE_URL` en `build.mjs`; al ser la definitiva, `SITE_URL_SET = true` |
| Estilos | `styles.css` |
| Comportamiento (menú, carrusel, pestañas de la carta, abierto/cerrado) | `app.js` |
| Carrito y pedido | `cart.js` |

Después de cambiar algo, ejecuta `node build.mjs`.

## Fotos

Las fotos de los platos están en `images/` (descargadas de Just Eat, calidad alta). Si se añade un plato con foto
en `menu.mjs`, `node fetch-images.mjs` la descarga.

## Cartel QR

`qr.html` es un cartel A4 listo para imprimir (en Chrome o Edge: «Imprimir», papel A4, escala 100 % y
«Gráficos de fondo» activado). El QR lleva a `SITE_URL + '/carta.html'`. **No imprimir hasta poner la dirección real.**

## Pedidos

El cliente elige platos, rellena nombre, teléfono y hora de recogida, y se abre WhatsApp con el pedido escrito.
No hay pago online: se paga en el local. Las horas de recogida respetan el horario (`HOURS` en `build.mjs`) y dejan 30 minutos de preparación.
