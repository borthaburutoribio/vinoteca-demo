/* Vinoteca — carta desde planilla, caja de seis, regalo, maridaje, envíos y pedido por WhatsApp. */
(() => {
  const V = Object.assign({}, window.VINOTECA || {});
  // vista rápida por URL: ?n=Nombre&b=Barrio&w=549...&c=7a1f33&d=Dirección&ig=usuario
  const q = new URLSearchParams(location.search);
  if (q.get('n')) V.nombre = q.get('n');
  if (q.get('b')) V.barrio = q.get('b');
  if (q.get('d')) V.direccion = q.get('d');
  if (q.get('w')) V.whatsapp = q.get('w').replace(/\D/g, '');
  if (q.get('ig')) V.instagram = q.get('ig').replace('@', '');
  if (q.get('c')) V.color = '#' + q.get('c').replace('#', '');
  if (q.get('demo') === '0') V.demo = false;

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const money = n => '$' + Math.round(n).toLocaleString('es-AR');
  const store = { get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} } };
  const CAP = (V.caja && V.caja.botellas) || 6;
  const DESC = (V.caja && V.caja.descuento) || 0;
  const wa = txt => `https://wa.me/${V.whatsapp}?text=${encodeURIComponent(txt)}`;

  /* ── marca: nombre, color y datos ── */
  document.documentElement.style.setProperty('--vino', V.color || '#7a1f33');
  $$('[data-f]').forEach(el => { const v = V[el.dataset.f]; if (v) el.textContent = v; });
  $$('[data-f-href]').forEach(el => { el.href = V[el.dataset.fHref] || '#'; });
  $$('[data-wa-plain]').forEach(el => { el.href = wa(`Hola ${V.nombre}, quería hacer una consulta.`); });
  $$('[data-f-wa]').forEach(el => { const n = String(V.whatsapp).replace(/^549?/, ''); el.textContent = n.length >= 10 ? `${n.slice(0, 2)} ${n.slice(2, 6)}-${n.slice(6)}` : n; });
  $$('[data-ig]').forEach(el => { el.href = 'https://instagram.com/' + V.instagram; el.textContent = '@' + V.instagram; });
  $$('[data-mail]').forEach(el => { el.href = 'mailto:' + V.mail; });
  $$('[data-cap]').forEach(el => { el.textContent = CAP; });
  $$('[data-desc]').forEach(el => { el.textContent = DESC; });
  $$('[data-demo]').forEach(el => { el.hidden = !V.demo; });
  document.title = `${V.nombre} · Vinoteca en ${V.barrio}, armá tu caja y pedí por WhatsApp`;
  const hoursTxt = (V.horario || []).map(h => `${h[0]}: ${h[1]}`);
  $$('[data-hours]').forEach(el => { el.innerHTML = hoursTxt.join('<br>') + `<br>${V.direccion}, ${V.barrio}`; });
  $$('[data-hours-lines]').forEach(el => { el.textContent = hoursTxt.join(' · '); });
  if (V.pagos) $$('[data-faq-pago]').forEach(el => { el.textContent = `${V.pagos.join(', ').replace(/, ([^,]*)$/, ' o $1')}. Lo elegís en el pedido y te confirmamos el total por WhatsApp.`; });
  if (V.envioGratisDesde) $$('[data-faq-env]').forEach(el => { el.textContent += ` Desde ${money(V.envioGratisDesde)} el envío es sin cargo.`; });
  // el nombre como etiqueta: más largo, más chico
  $$('[data-fit]').forEach(el => { const L = (V.nombre || '').length; if (L > 12) el.style.fontSize = `clamp(2.6rem, ${Math.max(3.2, 7 - (L - 12) * 0.22)}vw + 1rem, ${Math.max(4.2, 8.25 - (L - 12) * 0.28)}rem)`; });
  // franja de la etiqueta
  const stripe = $('.stripe'); if (stripe) stripe.innerHTML = '<span></span>'.repeat(80);
  // schema LocalBusiness
  const ld = document.createElement('script'); ld.type = 'application/ld+json';
  ld.textContent = JSON.stringify({ '@context': 'https://schema.org', '@type': 'LiquorStore', name: V.nombre, telephone: '+' + V.whatsapp,
    address: { '@type': 'PostalAddress', streetAddress: V.direccion, addressLocality: V.barrio, addressRegion: 'CABA', addressCountry: 'AR' },
    openingHours: (V.horario || []).map(h => h.join(' ')), url: location.href.split('?')[0] });
  document.head.appendChild(ld);

  /* ── estado ── */
  let WINES = [];
  let box = store.get('vino-caja', {});       // id → cantidad
  let gift = store.get('vino-regalo', null);
  const capColor = t => ({ Tinto: 'var(--cap-tinto)', Blanco: 'var(--cap-blanco)', Rosado: 'var(--cap-rosado)', Espumante: 'var(--cap-esp)' }[t] || 'var(--cap-tinto)');
  const capHex = t => ({ Tinto: V.color, Blanco: '#e7d9a8', Rosado: '#d9a0a6', Espumante: '#b59c5c' }[t] || V.color);
  const count = () => Object.values(box).reduce((a, b) => a + b, 0);
  const byId = id => WINES.find(w => w.id === id);

  /* ── planilla CSV ── */
  function parseCSV(t) {
    const rows = []; let row = [], cell = '', inQ = false;
    for (let i = 0; i < t.length; i++) {
      const c = t[i];
      if (inQ) { if (c === '"' && t[i + 1] === '"') { cell += '"'; i++; } else if (c === '"') inQ = false; else cell += c; }
      else if (c === '"') inQ = true; else if (c === ',') { row.push(cell); cell = ''; }
      else if (c === '\n' || c === '\r') { if (c === '\r' && t[i + 1] === '\n') i++; row.push(cell); rows.push(row); row = []; cell = ''; }
      else cell += c;
    }
    if (cell || row.length) { row.push(cell); rows.push(row); }
    const head = rows.shift().map(h => h.trim().toLowerCase());
    return rows.filter(r => r.some(x => x.trim())).map(r => Object.fromEntries(head.map((h, i) => [h, (r[i] || '').trim()])));
  }
  async function loadWines() {
    const srcs = [V.planilla, 'vinos.csv'].filter(Boolean);
    for (const s of srcs) {
      try {
        const r = await fetch(s, { cache: 'no-store' }); if (!r.ok) continue;
        return parseCSV(await r.text()).map(w => ({ ...w, id: String(w.id || w.nombre), precio: +String(w.precio).replace(/[^\d]/g, '') || 0,
          maridaje: (w.maridaje || '').toLowerCase().split(/[|,;]/).map(x => x.trim()).filter(Boolean), destacado: /^s/i.test(w.destacado || ''), stock: !/^n/i.test(w.stock || 'si') }))
          .filter(w => w.nombre && w.stock);
      } catch (e) { /* sigue con la próxima fuente */ }
    }
    return [];
  }

  /* ── carta ── */
  let fTipo = '', fMax = Infinity;
  const ORDER = ['Tinto', 'Blanco', 'Rosado', 'Espumante'];
  const GNAME = { Tinto: 'Tintos', Blanco: 'Blancos', Rosado: 'Rosados', Espumante: 'Espumantes' };
  function renderMenu() {
    const m = $('[data-menu]'); if (!m) return;
    const list = WINES.filter(w => (!fTipo || w.tipo === fTipo) && w.precio <= fMax);
    if (!list.length) { m.innerHTML = '<p class="menu-empty">No hay vinos con ese filtro. Probá con un precio más alto.</p>'; return; }
    const tipos = [...new Set([...ORDER, ...list.map(w => w.tipo)])].filter(t => list.some(w => w.tipo === t));
    m.innerHTML = tipos.map(t => `<div class="group"><h3>${GNAME[t] || t}</h3>${list.filter(w => w.tipo === t).sort((a, b) => a.precio - b.precio).map(w => `
      <button type="button" class="item${box[w.id] ? ' in' : ''}" data-add="${w.id}" aria-label="Sumar ${w.nombre} a la caja, ${money(w.precio)}">
        <span class="item-q">${box[w.id] || ''}</span><span class="item-n">${w.nombre}</span><span class="item-p">${money(w.precio)}</span>
        <span class="item-d">${w.bodega} · ${w.varietal} · ${w.region}</span></button>`).join('')}</div>`).join('');
  }
  $$('.chip').forEach(b => b.addEventListener('click', () => { $$('.chip').forEach(x => x.classList.toggle('on', x === b)); fTipo = b.dataset.tipo; renderMenu(); }));
  const rng = $('[data-max]');
  function setupRange() {
    if (!rng || !WINES.length) return;
    const mx = Math.ceil(Math.max(...WINES.map(w => w.precio)) / 2500) * 2500, mn = Math.floor(Math.min(...WINES.map(w => w.precio)) / 2500) * 2500;
    rng.max = mx; rng.min = mn; rng.value = mx; $('[data-max-label]').textContent = money(mx);
    rng.addEventListener('input', () => { fMax = +rng.value; $('[data-max-label]').textContent = money(fMax); renderMenu(); });
  }
  document.addEventListener('click', e => {
    const a = e.target.closest('[data-add]'); if (!a) return;
    add(a.dataset.add, a);
  });

  /* ── caja ── */
  function add(id, from) {
    box[id] = (box[id] || 0) + 1; save();
    $$('.crate-btn, .dock').forEach(el => { el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); });
    if (from) { from.classList.add('in'); }
  }
  function save() { store.set('vino-caja', box); renderAll(); }
  function totals() {
    const sub = Object.entries(box).reduce((a, [id, n]) => a + (byId(id)?.precio || 0) * n, 0);
    const boxes = Math.floor(count() / CAP);
    const off = boxes && DESC ? Object.entries(box).flatMap(([id, n]) => Array(n).fill(byId(id)?.precio || 0)).sort((a, b) => b - a).slice(0, boxes * CAP).reduce((a, b) => a + b, 0) * DESC / 100 : 0;
    const env = gift && gift.env ? (V.regalo.find(r => r[0] === gift.env)?.[1] || 0) : 0;
    return { sub, off, boxes, env };
  }
  const SLOTS = [[60, 70], [165, 70], [270, 70], [60, 160], [165, 160], [270, 160]];
  function renderCrate() {
    const svg = $('[data-crate]'); if (!svg) return;
    const bottles = Object.entries(box).flatMap(([id, n]) => Array(n).fill(byId(id))).filter(Boolean);
    const inBox = bottles.length % CAP === 0 && bottles.length ? bottles.slice(-CAP) : bottles.slice(bottles.length - (bottles.length % CAP));
    let s = '<rect class="wood2" x="0" y="0" width="330" height="230"/><rect class="wood" x="10" y="10" width="310" height="210"/>' +
      '<rect class="wood2" x="10" y="113" width="310" height="5"/><rect class="wood2" x="111" y="10" width="5" height="210"/><rect class="wood2" x="214" y="10" width="5" height="210"/>';
    SLOTS.forEach(([x, y], i) => {
      const w = inBox[i];
      s += `<g class="slot-g"><circle class="hole" cx="${x}" cy="${y}" r="38"/>` +
        `<g class="bottle${w ? ' on' : ''}"><circle cx="${x}" cy="${y}" r="34" fill="#1b1414"/><circle cx="${x}" cy="${y}" r="24" fill="${w ? capHex(w.tipo) : '#000'}"/>` +
        `<circle cx="${x}" cy="${y}" r="9" fill="rgba(0,0,0,.25)"/>${w ? `<title>${w.nombre}</title>` : ''}</g></g>`;
    });
    svg.innerHTML = s;
  }
  function renderAll() {
    const n = count(), t = totals();
    $$('[data-count]').forEach(el => { el.textContent = n; });
    $$('[data-total]').forEach(el => { el.textContent = money(t.sub - t.off); });
    const filled = n % CAP === 0 && n ? CAP : n % CAP;
    $$('.crate-mini').forEach(c => [...c.children].forEach((i, k) => i.classList.toggle('on', k < filled)));
    const off = $('[data-off]');
    if (off) { off.classList.toggle('ok', t.boxes > 0); off.textContent = t.boxes ? `Caja completa: ${DESC}% menos (${money(t.off)}).` + (n % CAP ? ` Vas por la botella ${n % CAP} de la próxima.` : '') : `Te faltan ${CAP - n} para la caja completa y el ${DESC}% de descuento.`; }
    $$('.dock').forEach(d => d.classList.toggle('show', n > 0 || !!gift));
    $$('.item').forEach(b => { const id = b.dataset.add; b.classList.toggle('in', !!box[id]); const qn = $('.item-q', b); if (qn) qn.textContent = box[id] || ''; });
    renderCrate(); renderOrder();
  }
  $$('[data-fill]').forEach(b => b.addEventListener('click', () => {
    const n = count(), need = n % CAP ? CAP - n % CAP : CAP;
    const pool = [...WINES].sort((a, c) => (c.destacado - a.destacado) || (a.precio - c.precio)).filter(w => !box[w.id]);
    const src = pool.length >= need ? pool : [...WINES];
    for (let i = 0; i < need; i++) { const w = src[i % src.length]; box[w.id] = (box[w.id] || 0) + 1; }
    save();
  }));

  /* ── vino de la semana ── */
  let weekWine = null;
  function renderWeek(tipo) {
    const w = WINES.find(x => x.tipo === tipo && x.destacado) || WINES.find(x => x.tipo === tipo); if (!w) return;
    weekWine = w;
    $('#week-name').textContent = w.nombre; $('[data-week-desc]').textContent = w.nota || '';
    $('[data-week-meta]').textContent = `Lo que estamos abriendo esta semana · ${w.bodega} · ${w.region} · ${money(w.precio)}`;
    $('[data-week-ask]').href = wa(`Hola, quería preguntar por el ${w.nombre} (${money(w.precio)}).`);
    $$('[data-week]').forEach(b => b.setAttribute('aria-selected', b.dataset.week === tipo));
    $('.capsule circle:last-child').style.fill = capHex(w.tipo);
  }
  $$('[data-week]').forEach(b => b.addEventListener('click', () => renderWeek(b.dataset.week)));
  $('[data-week-add]')?.addEventListener('click', e => weekWine && add(weekWine.id, e.currentTarget));

  /* ── regalo ── */
  const gf = $('[data-gift]');
  if (gf) {
    const sel = $('[data-env]', gf);
    sel.innerHTML = (V.regalo || []).map(r => `<option value="${r[0]}">${r[0]}${r[1] ? ' · ' + money(r[1]) : ' · sin cargo'}</option>`).join('');
    const sync = () => {
      $('[data-card-to]').textContent = gf.para.value ? 'Para ' + gf.para.value : 'Para Martina';
      $('[data-card-msg]').textContent = gf.msg.value || 'Feliz cumple. Este es para abrir en el balcón.';
      $('[data-card-from]').textContent = gf.de.value || 'Juan y Sofi';
    };
    if (gift) { gf.para.value = gift.para || ''; gf.msg.value = gift.msg || ''; gf.de.value = gift.de || ''; sel.value = gift.env; }
    gf.addEventListener('input', sync); sync();
    gf.addEventListener('submit', e => {
      e.preventDefault();
      gift = { para: gf.para.value.trim(), msg: gf.msg.value.trim(), de: gf.de.value.trim(), env: sel.value };
      store.set('vino-regalo', gift); renderAll();
      $('[data-gift-ok]').textContent = count() ? 'Listo, el regalo va con tu pedido.' : 'Listo. Ahora sumá los vinos desde la carta.';
    });
  }

  /* ── maridaje ── */
  const WHY = { Malbec: 'fruta y taninos que se bancan la grasa', 'Cabernet Franc': 'herbal, corta lo pesado', 'Cabernet Sauvignon': 'taninos firmes para la carne', Bonarda: 'jugoso y sin vueltas', Blend: 'redondo, le gusta a todos', 'Pinot Noir': 'liviano, no tapa el plato', Merlot: 'suave, acompaña sin pelear', Torrontés: 'aromático y seco, va con lo especiado', Chardonnay: 'cremoso, va con salsas', 'Sauvignon Blanc': 'fresco y ácido, como un limón', Rosado: 'fresco para picar algo' };
  $$('[data-dish]').forEach(b => b.addEventListener('click', () => {
    $$('[data-dish]').forEach(x => x.setAttribute('aria-pressed', x === b));
    const d = b.dataset.dish;
    const list = WINES.filter(w => w.maridaje.includes(d)).sort((a, c) => (c.destacado - a.destacado) || (a.precio - c.precio));
    const picks = [list[0], list[Math.floor(list.length / 2)], list[list.length - 1]].filter((w, i, a) => w && a.indexOf(w) === i);
    $('[data-picks]').innerHTML = picks.length ? picks.map(w => `<div class="pick"><span class="pick-cap" style="background:${capColor(w.tipo)}"></span><span class="pick-n">${w.nombre} · ${money(w.precio)}</span><span class="pick-w">${w.tipo === 'Espumante' ? 'burbuja que limpia la boca' : (WHY[w.varietal] || w.nota)}</span><button type="button" data-add="${w.id}">Sumar</button></div>`).join('')
      : '<p class="picks-empty">Para eso hoy no tenemos sugerencia. Escribinos y te recomendamos.</p>';
  }));

  /* ── envíos ── */
  const envTxt = e => e[1] === null ? `<b>${e[0]}</b>: ${e[2]}.` : `<b>${e[0]}</b>: ${e[1] ? money(e[1]) : 'sin cargo'}, llega ${e[2]}.`;
  const bsel = $('[data-env-barrio]'), osel = $('[data-order-barrio]');
  const envOpts = (V.envios || []).map((e, i) => `<option value="${i}">${e[0]}</option>`).join('');
  if (bsel) {
    bsel.innerHTML = envOpts;
    $('[data-env-table] tbody').innerHTML = (V.envios || []).map((e, i) => `<tr data-i="${i}"><td>${e[0]}</td><td>${e[1] === null ? 'a coordinar' : e[1] ? money(e[1]) : 'sin cargo'}</td><td>${e[2]}</td></tr>`).join('');
    const upd = () => { const e = V.envios[bsel.value]; $('[data-env-res]').innerHTML = envTxt(e) + (V.envioGratisDesde && e[1] ? ` Gratis desde ${money(V.envioGratisDesde)}.` : ''); $$('[data-env-table] tr[data-i]').forEach(r => r.classList.toggle('sel', r.dataset.i === bsel.value)); if (osel) osel.value = bsel.value; store.set('vino-barrio', bsel.value); renderOrder(); };
    bsel.value = store.get('vino-barrio', '0'); bsel.addEventListener('change', upd); upd();
  }
  if (osel) { osel.innerHTML = envOpts; osel.value = store.get('vino-barrio', '0'); osel.addEventListener('change', () => { if (bsel) { bsel.value = osel.value; bsel.dispatchEvent(new Event('change')); } else renderOrder(); }); }
  const psel = $('[data-order-pago]'); if (psel) psel.innerHTML = (V.pagos || []).map(p => `<option>${p}</option>`).join('');

  /* ── pedido ── */
  const dlg = $('[data-order]');
  function envCost(sub) { const e = (V.envios || [])[osel ? osel.value : 0]; if (!e || e[1] === null) return null; return V.envioGratisDesde && sub >= V.envioGratisDesde ? 0 : e[1]; }
  function renderOrder() {
    const ul = $('[data-order-items]'); if (!ul) return;
    const ids = Object.keys(box).filter(id => box[id] > 0 && byId(id));
    ul.innerHTML = ids.length ? ids.map(id => { const w = byId(id); return `<li><span>${w.nombre}</span><span class="qty"><button type="button" data-dec="${id}" aria-label="Quitar una">−</button><b>${box[id]}</b><button type="button" data-inc="${id}" aria-label="Sumar una">+</button></span><span class="op">${money(w.precio * box[id])}</span></li>`; }).join('')
      : '<li class="order-empty">Todavía no sumaste vinos. Tocá cualquiera de la carta.</li>';
    const g = $('[data-order-gift]');
    if (g) { g.hidden = !gift; if (gift) g.textContent = `Regalo: ${gift.env}${gift.para ? ' · para ' + gift.para : ''}${gift.msg ? ` · tarjeta: "${gift.msg}"` : ''}${gift.de ? ' · de ' + gift.de : ''}`; }
    const t = totals(), ec = envCost(t.sub - t.off);
    const rows = [['Vinos', money(t.sub)]];
    if (t.off) rows.push([`Caja completa (${DESC}%)`, '−' + money(t.off)]);
    if (t.env) rows.push(['Envoltorio', money(t.env)]);
    rows.push(['Envío', ec === null ? 'a coordinar' : ec ? money(ec) : 'sin cargo']);
    const tot = t.sub - t.off + t.env + (ec || 0);
    $('[data-order-sum]').innerHTML = rows.map(r => `<dt>${r[0]}</dt><dd>${r[1]}</dd>`).join('') + `<dt class="tot">Total</dt><dd class="tot">${money(tot)}</dd>`;
  }
  document.addEventListener('click', e => {
    const inc = e.target.closest('[data-inc]'), dec = e.target.closest('[data-dec]');
    if (inc) { box[inc.dataset.inc]++; save(); }
    if (dec) { box[dec.dataset.dec]--; if (box[dec.dataset.dec] <= 0) delete box[dec.dataset.dec]; save(); }
    if (e.target.closest('[data-open-order]')) { renderOrder(); dlg.showModal ? dlg.showModal() : dlg.setAttribute('open', ''); }
  });
  $('[data-send]')?.addEventListener('click', () => {
    const f = $('[data-order-form]'), t = totals(), ec = envCost(t.sub - t.off), e = V.envios[osel.value];
    const lines = Object.keys(box).filter(id => byId(id)).map(id => `• ${box[id]} × ${byId(id).nombre} (${money(byId(id).precio * box[id])})`);
    if (!lines.length && !gift) { $('.order-empty')?.classList.add('bump'); return; }
    let m = `Hola ${V.nombre}, quiero hacer este pedido:\n\n${lines.join('\n')}`;
    if (t.off) m += `\n\nCaja completa: ${DESC}% menos (−${money(t.off)})`;
    if (gift) m += `\n\nEs para regalo: ${gift.env}${gift.para ? `\nPara: ${gift.para}` : ''}${gift.msg ? `\nTarjeta: "${gift.msg}"` : ''}${gift.de ? `\nDe: ${gift.de}` : ''}`;
    m += `\n\nEnvío a ${e[0]}: ${ec === null ? 'a coordinar' : ec ? money(ec) : 'sin cargo'}`;
    m += `\nPago: ${f.pago.value}`;
    m += `\nTotal estimado: ${money(t.sub - t.off + t.env + (ec || 0))}`;
    if (f.nombre.value) m += `\n\nSoy ${f.nombre.value}.`;
    if (f.cuando.value) m += ` Me queda bien: ${f.cuando.value}.`;
    window.open(wa(m), '_blank', 'noopener');
  });

  /* ── empresas ── */
  $('[data-corp]')?.addEventListener('submit', e => {
    e.preventDefault(); const f = e.currentTarget;
    window.open(wa(`Hola ${V.nombre}, quería pedir opciones de cajas para empresa.\nNombre: ${f.nombre.value}\nEmpresa: ${f.empresa.value || '-'}\nCantidad de cajas: ${f.cant.value || '-'}\nPresupuesto por caja: ${f.pres.value || '-'}`), '_blank', 'noopener');
  });

  /* ── planilla de muestra ── */
  function renderPlanilla() {
    const tb = $('[data-pl]'); if (!tb) return;
    const rows = WINES.slice(0, 7);
    tb.innerHTML = rows.map((w, i) => `<tr><td>${w.nombre}</td><td>${w.bodega}</td><td>${w.tipo}</td><td class="${i === 2 ? 'hl' : ''}" data-pl-price="${i}">${w.precio}</td><td>${w.maridaje.join('|')}</td><td>si</td></tr>`).join('');
  }

  /* ── compartir ── */
  $('[data-share]')?.addEventListener('click', async () => {
    const d = { title: V.nombre, text: `${V.nombre}: armá tu caja de vinos`, url: location.href };
    try { if (navigator.share) await navigator.share(d); else { await navigator.clipboard.writeText(location.href); $('[data-share]').textContent = 'Link copiado'; } } catch {}
  });

  /* ── días que cruzan: hero que cambia de luz ── */
  const imgs = $$('.hero-room img'); let hi = 0, timer;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function cycle() { imgs[hi].classList.remove('on'); hi = (hi + 1) % imgs.length; imgs[hi].classList.add('on'); }
  if (imgs.length > 1 && !reduce) { timer = setInterval(cycle, 5600); document.addEventListener('visibilitychange', () => { clearInterval(timer); if (!document.hidden) timer = setInterval(cycle, 5600); }); }

  /* ── fila de momentos ── */
  const row = $('[data-mom-row]'), bar = $('[data-mom-bar]');
  if (row) {
    const upd = () => { const max = row.scrollWidth - row.clientWidth; bar.style.width = (max > 0 ? 18 + 82 * row.scrollLeft / max : 100) + '%'; };
    row.addEventListener('scroll', upd, { passive: true }); upd();
    $$('[data-mom]').forEach(b => b.addEventListener('click', () => row.scrollBy({ left: +b.dataset.mom * 312, behavior: reduce ? 'auto' : 'smooth' })));
  }

  /* ── entradas ── */
  const groups = ['.week-text > *', '.tool-txt > *', '.mom-row li', '.tile', '.acc details', '.coupon-l > *', '.coupon-r > *', '.places li', '.pl-text > *', '.foot-links ul'];
  groups.forEach(sel => $$(sel).forEach((el, i) => { if (!el.classList.contains('rv')) { el.classList.add('rv'); el.style.transitionDelay = `${(i % 6) * 75}ms`; } }));
  const io = 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('.rv').forEach(el => io ? io.observe(el) : el.classList.add('in'));

  /* ── arranque ── */
  loadWines().then(ws => {
    WINES = ws;
    Object.keys(box).forEach(id => { if (!byId(id)) delete box[id]; });
    setupRange(); renderMenu(); renderWeek('Tinto'); renderPlanilla(); renderAll();
    $$('[data-tiles] [data-region]').forEach(t => { const rs = t.dataset.region.split('|'); const n = WINES.filter(w => rs.includes(w.region)).length; const el = $('[data-n]', t); if (el) el.textContent = `${n} en carta`; });
    $$('[data-tiles] [data-tipo-n]').forEach(t => { const n = WINES.filter(w => w.tipo === t.dataset.tipoN).length; const el = $('[data-n]', t); if (el) el.textContent = `${n} en carta`; });
    if (!WINES.length) $('[data-menu]').innerHTML = '<p class="menu-empty">No pudimos cargar la carta. Escribinos por WhatsApp y te la pasamos.</p>';
  });
})();
