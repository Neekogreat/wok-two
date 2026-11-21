# Entrega al restaurante: lista de comprobación

Documento interno para quien vende la web (no se publica: `build.mjs` solo copia a `dist/` lo necesario).

## 1. Datos que debe darte el restaurante (obligatorios antes de publicar)

Se rellenan en `LEGAL`, al principio de `build.mjs`, y después `node build.mjs`. Mientras falte alguno, las páginas
legales lo muestran resaltado en amarillo y el script avisa.

- Razón social o nombre y apellidos del titular (`name`)
- NIF / CIF (`nif`)
- Email de contacto (`email`). Mejor uno del propio restaurante, no el tuyo.
- Registro Mercantil (`registry`), solo si es una sociedad inscrita
- Confirmar que el teléfono (`phone`) y la dirección son correctos

## 2. Antes de publicar

- [ ] `LEGAL` completo y la gestoría del restaurante ha leído `aviso-legal`, `privacidad` y `cookies`
- [ ] El restaurante confirma por escrito que las fotos de los platos son suyas o puede usarlas (están descargadas de Just Eat)
- [ ] «Nuestra historia» tiene texto real, o se oculta con `STORY_READY = false` (ahora muestra «[Texto provisional]»)
- [ ] `SITE_URL` es el dominio definitivo y `SITE_URL_SET = true`; solo entonces imprimir `qr.html`
- [ ] Prueba de pedido real: llega bien el WhatsApp al número del restaurante

## 3. Publicación en Netlify

1. Cuenta de Netlify **a nombre del restaurante** (o transferirla al entregar). Si el sitio queda en tu cuenta, tú serías
   «encargado del tratamiento» (RGPD art. 28) y haría falta un contrato de encargo.
2. Nuevo sitio desde el repositorio. `netlify.toml` ya indica `node build.mjs` y publicar `dist/`.
3. Dominio comprado a nombre del restaurante y apuntado al sitio. HTTPS lo pone Netlify.

## 4. Cláusulas útiles en el contrato o presupuesto

- Qué incluye el precio y qué no (cambios de carta, nuevas secciones, dominio y hosting aparte).
- El restaurante es el **responsable del tratamiento** de los datos de sus clientes. Tú no accedes a ellos: los pedidos van del
  móvil del cliente al WhatsApp del restaurante y la web no guarda nada.
- El restaurante garantiza que los textos, fotos, logotipo y marca que te facilita son suyos o tiene derecho a usarlos.
- Los textos legales son una plantilla orientativa; su validación final corresponde al restaurante y a su asesor.
- Titularidad del dominio y de la cuenta de hosting: del restaurante.
- Mantenimiento: si lo ofreces, qué cubre y cuánto cuesta.

## 5. Puntos conocidos

- El mapa de Google se carga al abrir la página y Google puede poner sus cookies; la política de cookies lo explica. La opción más
  estricta sería cargarlo solo tras un clic en «Ver mapa» o cambiarlo por un botón a Google Maps.
- Las reseñas se muestran sin nombre ni foto. Son reseñas públicas de Google Maps copiadas a mano: si el restaurante prefiere,
  se pueden quitar.
