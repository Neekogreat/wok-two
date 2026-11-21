// Textos de las páginas legales (aviso legal, privacidad y cookies), en español e inglés.
// Los datos del titular salen de LEGAL en build.mjs. Plantilla orientativa: la gestoría del restaurante debe revisarla.
// Uso: legalPages(lang, LEGAL, hosting) -> { slug: { title, desc, body } }
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
// Un dato pendiente de rellenar (empieza por "[") sale resaltado en amarillo.
const v = (s) => (String(s).startsWith('[') ? `<mark>${esc(s)}</mark>` : esc(s));

export const pendingLegal = (LEGAL) => Object.entries(LEGAL).filter(([, x]) => String(x).startsWith('[')).map(([k]) => k);

const month = (ym, lang) => {
  const [y, m] = ym.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString(lang === 'en' ? 'en-GB' : 'es-ES', { month: 'long', year: 'numeric' });
};

export function legalPages(lang, LEGAL, hosting = 'Netlify, Inc.') {
  const id = `<ul>
    <li>${lang === 'en' ? 'Name / company name' : 'Titular'}: ${v(LEGAL.name)}</li>
    <li>${lang === 'en' ? 'Tax ID (NIF/CIF)' : 'NIF / CIF'}: ${v(LEGAL.nif)}</li>
    <li>${lang === 'en' ? 'Address' : 'Domicilio'}: ${v(LEGAL.address)}</li>
    <li>Email: ${v(LEGAL.email)}</li>
    <li>${lang === 'en' ? 'Phone' : 'Teléfono'}: ${v(LEGAL.phone)}</li>${LEGAL.registry ? `\n    <li>${lang === 'en' ? 'Commercial register' : 'Registro Mercantil'}: ${v(LEGAL.registry)}</li>` : ''}
  </ul>`;
  const upd = (lang === 'en' ? 'Last updated: ' : 'Última actualización: ') + month(LEGAL.updated, lang);

  if (lang === 'en') {
    return {
      'aviso-legal.html': {
        title: 'Legal notice',
        desc: 'Legal notice of the Wok Two website.',
        body: `<p class="legal__upd">${upd}</p>
<h2>1. Website owner</h2>
<p>In compliance with article 10 of Spanish Law 34/2002 on information society services (LSSI-CE), the owner of this website is:</p>
${id}
<h2>2. Purpose and use</h2>
<p>This website presents the Wok Two restaurant (menu, prices, opening hours and location) and lets you prepare a pickup order and send it to the restaurant by WhatsApp. Using it means you accept this notice. Please use it lawfully and in good faith.</p>
<h2>3. Pickup orders</h2>
<p>An order sent through the website is a request: it is only confirmed once the restaurant accepts it. Payment is made at the restaurant when you collect the order. Prices are in euros and include taxes.</p>
<h2>4. Allergies and intolerances</h2>
<p>If you have an allergy or intolerance, tell the restaurant staff before ordering. The descriptions on this website are for guidance only.</p>
<h2>5. Intellectual property</h2>
<p>The texts, design, logo and photographs of this website belong to the owner or are used with permission of their holders. They may not be copied, distributed or modified without prior written authorisation.</p>
<h2>6. Reviews and third-party links</h2>
<p>The reviews shown were published on Google Maps and are reproduced without identifying their authors. The website links to third-party services (Just Eat, Google Maps, WhatsApp); the owner is not responsible for their content or policies.</p>
<h2>7. Liability</h2>
<p>The owner works to keep the information accurate and up to date (menu, prices, hours) but does not guarantee it is free of errors. In case of discrepancy, the information given at the restaurant prevails.</p>
<h2>8. Governing law</h2>
<p>This notice is governed by Spanish law. Disputes will be heard by the courts that apply under consumer protection rules.</p>`,
      },
      'privacidad.html': {
        title: 'Privacy policy',
        desc: 'How Wok Two handles the personal data of its website visitors and pickup orders.',
        body: `<p class="legal__upd">${upd}</p>
<h2>1. Who is responsible for your data</h2>
${id}
<p>Questions or requests about your data: ${v(LEGAL.email)}.</p>
<h2>2. What we collect and why</h2>
<table>
  <tr><th>Purpose</th><th>Data</th><th>Legal basis</th></tr>
  <tr><td>Preparing and handling your pickup order</td><td>Name, phone number, pickup time, dishes and notes</td><td>Taking steps at your request before entering a contract / performing it (GDPR art. 6.1.b)</td></tr>
  <tr><td>Allergies or intolerances you write in the notes</td><td>Health data you choose to provide</td><td>Your explicit consent, given by writing them (GDPR art. 9.2.a). You can leave the field empty</td></tr>
  <tr><td>Operating and securing the website</td><td>IP address and technical data in server logs</td><td>Legitimate interest in the secure operation of the site (GDPR art. 6.1.f)</td></tr>
</table>
<p>The website has no user accounts, no newsletter and no analytics or advertising trackers.</p>
<h2>3. How your order travels</h2>
<p>This website does not store your order on any server. When you press “Send order by WhatsApp”, WhatsApp opens on your device with the order already written, and <strong>you</strong> send it. From then on, WhatsApp (Meta) handles the message under its own privacy policy, and the restaurant receives it on its WhatsApp number.</p>
<h2>4. How long we keep it</h2>
<p>Order data is kept only as long as needed to prepare and deliver the order and, afterwards, for the period in which legal liabilities may arise. Data in server logs is kept for the short period set by the hosting provider.</p>
<h2>5. Who receives your data</h2>
<ul>
  <li><strong>${esc(hosting)}</strong>, website hosting (United States). It may process visitors’ IP addresses in server logs, with the safeguards the GDPR requires for international transfers.</li>
  <li><strong>Meta (WhatsApp)</strong>, when you send an order.</li>
  <li><strong>Google</strong>, if you view the embedded map (see the <a href="cookies.html">cookie policy</a>).</li>
</ul>
<p>We do not sell your data or use it for marketing.</p>
<h2>6. Your rights</h2>
<p>You can ask for access, rectification, erasure, restriction, objection and portability by writing to ${v(LEGAL.email)}, attaching proof of your identity. If you think your rights have not been respected, you can complain to the Spanish Data Protection Agency (<a href="https://www.aepd.es" rel="noopener">www.aepd.es</a>).</p>`,
      },
      'cookies.html': {
        title: 'Cookie policy',
        desc: 'Which cookies and similar technologies the Wok Two website uses.',
        body: `<p class="legal__upd">${upd}</p>
<h2>1. What they are</h2>
<p>Cookies and similar technologies store or read information on your device when you visit a website.</p>
<h2>2. What this website uses</h2>
<table>
  <tr><th>What</th><th>Purpose</th><th>Type</th></tr>
  <tr><td>Browser local storage, key <code>woktwo-cart</code></td><td>Remembers the dishes in your order while you browse the menu</td><td>Own, technical, strictly necessary. It never leaves your device. Use “Clear order” or clear your browser data to remove it</td></tr>
  <tr><td>Embedded Google Maps (“Find us” section)</td><td>Shows the restaurant’s location</td><td>Third party (Google). When it loads, Google may receive your IP address and set its own cookies. See <a href="https://policies.google.com/technologies/cookies" rel="noopener">Google’s cookie policy</a></td></tr>
</table>
<p>The website does not use analytics, advertising or social media cookies. Fonts are served from this website itself, not from third parties.</p>
<h2>3. How to manage them</h2>
<p>You can block or delete cookies in your browser settings. Blocking Google’s cookies may stop the map from displaying.</p>`,
      },
    };
  }

  return {
    'aviso-legal.html': {
      title: 'Aviso legal',
      desc: 'Aviso legal de la web de Wok Two.',
      body: `<p class="legal__upd">${upd}</p>
<h2>1. Titular del sitio web</h2>
<p>En cumplimiento del artículo 10 de la Ley 34/2002, de servicios de la sociedad de la información y de comercio electrónico (LSSI-CE), se informa de que el titular de esta web es:</p>
${id}
<h2>2. Objeto y condiciones de uso</h2>
<p>Esta web presenta el restaurante Wok Two (carta, precios, horario y ubicación) y permite preparar un pedido para recoger y enviarlo al restaurante por WhatsApp. Su uso implica la aceptación de este aviso. Te pedimos un uso lícito y de buena fe.</p>
<h2>3. Pedidos para recoger</h2>
<p>El pedido enviado desde la web es una solicitud: queda confirmado cuando el restaurante lo acepta. El pago se hace en el local al recoger el pedido. Los precios están en euros e incluyen impuestos.</p>
<h2>4. Alergias e intolerancias</h2>
<p>Si tienes alguna alergia o intolerancia, díselo al personal del restaurante antes de pedir. Las descripciones de la carta son orientativas.</p>
<h2>5. Propiedad intelectual e industrial</h2>
<p>Los textos, el diseño, el logotipo y las fotografías de esta web pertenecen al titular o se usan con autorización de sus titulares. No se pueden copiar, distribuir ni modificar sin autorización previa y por escrito.</p>
<h2>6. Opiniones y enlaces a terceros</h2>
<p>Las opiniones mostradas se publicaron en Google Maps y se reproducen sin identificar a sus autores. La web enlaza a servicios de terceros (Just Eat, Google Maps, WhatsApp); el titular no se responsabiliza de su contenido ni de sus políticas.</p>
<h2>7. Responsabilidad</h2>
<p>El titular procura que la información (carta, precios, horario) sea correcta y esté actualizada, pero no garantiza que esté libre de errores. Si hay alguna diferencia, prevalece lo que se indique en el local.</p>
<h2>8. Legislación aplicable</h2>
<p>Este aviso se rige por la ley española. Las controversias se someterán a los juzgados y tribunales que correspondan conforme a la normativa de protección de consumidores y usuarios.</p>`,
    },
    'privacidad.html': {
      title: 'Política de privacidad',
      desc: 'Cómo trata Wok Two los datos personales de quienes visitan la web y hacen pedidos para recoger.',
      body: `<p class="legal__upd">${upd}</p>
<h2>1. Responsable del tratamiento</h2>
${id}
<p>Para cualquier duda o petición sobre tus datos: ${v(LEGAL.email)}.</p>
<h2>2. Qué datos tratamos y para qué</h2>
<table>
  <tr><th>Finalidad</th><th>Datos</th><th>Base legal</th></tr>
  <tr><td>Preparar y gestionar tu pedido para recoger</td><td>Nombre, teléfono, hora de recogida, platos y notas</td><td>Aplicar medidas precontractuales a petición tuya / ejecutar el contrato (RGPD, art. 6.1.b)</td></tr>
  <tr><td>Alergias o intolerancias que escribas en las notas</td><td>Datos de salud que decides facilitar</td><td>Tu consentimiento explícito, que das al escribirlas (RGPD, art. 9.2.a). Puedes dejar el campo vacío</td></tr>
  <tr><td>Funcionamiento y seguridad de la web</td><td>Dirección IP y datos técnicos de los registros del servidor</td><td>Interés legítimo en el funcionamiento seguro del sitio (RGPD, art. 6.1.f)</td></tr>
</table>
<p>La web no tiene cuentas de usuario ni boletín, y no usa analítica ni rastreadores publicitarios.</p>
<h2>3. Cómo viaja tu pedido</h2>
<p>Esta web no guarda tu pedido en ningún servidor. Al pulsar «Enviar pedido por WhatsApp», se abre WhatsApp en tu dispositivo con el pedido ya escrito y <strong>eres tú</strong> quien lo envía. Desde ese momento, WhatsApp (Meta) trata el mensaje según su propia política de privacidad, y el restaurante lo recibe en su número de WhatsApp.</p>
<h2>4. Cuánto tiempo los conservamos</h2>
<p>Los datos del pedido se conservan solo el tiempo necesario para prepararlo y entregarlo y, después, durante el plazo en que pudieran surgir responsabilidades legales. Los registros del servidor se conservan el breve plazo que fije el proveedor de alojamiento.</p>
<h2>5. Quién recibe tus datos</h2>
<ul>
  <li><strong>${esc(hosting)}</strong>, alojamiento de la web (Estados Unidos). Puede tratar las direcciones IP de los visitantes en sus registros, con las garantías que el RGPD exige para las transferencias internacionales.</li>
  <li><strong>Meta (WhatsApp)</strong>, cuando envías un pedido.</li>
  <li><strong>Google</strong>, si ves el mapa incrustado (consulta la <a href="cookies.html">política de cookies</a>).</li>
</ul>
<p>No vendemos tus datos ni los usamos para enviarte publicidad.</p>
<h2>6. Tus derechos</h2>
<p>Puedes ejercer tus derechos de acceso, rectificación, supresión, limitación, oposición y portabilidad escribiendo a ${v(LEGAL.email)} e indicando tu identidad. Si crees que no hemos atendido tus derechos, puedes reclamar ante la Agencia Española de Protección de Datos (<a href="https://www.aepd.es" rel="noopener">www.aepd.es</a>).</p>`,
    },
    'cookies.html': {
      title: 'Política de cookies',
      desc: 'Qué cookies y tecnologías similares usa la web de Wok Two.',
      body: `<p class="legal__upd">${upd}</p>
<h2>1. Qué son</h2>
<p>Las cookies y tecnologías similares guardan o leen información en tu dispositivo cuando visitas una web.</p>
<h2>2. Qué usa esta web</h2>
<table>
  <tr><th>Qué</th><th>Para qué</th><th>Tipo</th></tr>
  <tr><td>Almacenamiento local del navegador, clave <code>woktwo-cart</code></td><td>Recordar los platos de tu pedido mientras navegas por la carta</td><td>Propia, técnica y necesaria. No sale de tu dispositivo. Se borra con «Vaciar pedido» o borrando los datos del navegador</td></tr>
  <tr><td>Mapa de Google Maps incrustado (sección «Encuéntranos»)</td><td>Mostrar la ubicación del restaurante</td><td>De terceros (Google). Al cargarse, Google puede recibir tu dirección IP y usar sus propias cookies. Consulta la <a href="https://policies.google.com/technologies/cookies" rel="noopener">política de cookies de Google</a></td></tr>
</table>
<p>La web no usa cookies de analítica, publicidad ni redes sociales. Las fuentes de letra se sirven desde la propia web, no desde terceros.</p>
<h2>3. Cómo gestionarlas</h2>
<p>Puedes bloquear o eliminar las cookies en los ajustes de tu navegador. Si bloqueas las de Google, es posible que el mapa no se muestre.</p>`,
    },
  };
}
