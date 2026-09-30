/* =========================================================================
   TokyoStore — comportamiento del sitio (sin dependencias)
   ========================================================================= */
(function () {
  'use strict';

  var CFG = window.TS_CONFIG;
  var PRODUCTS = window.TS_PRODUCTS;
  var CATS = window.TS_CATEGORIES;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* precios en dólares: $219 · $1.234 · $21,90 (centavos solo si hay) */
  function fmt(n) { return '$' + Number(n).toLocaleString('es-VE', { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 }); }
  function byId(id) { for (var i = 0; i < PRODUCTS.length; i++) if (PRODUCTS[i].id === id) return PRODUCTS[i]; return null; }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function norm(s) { return String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }

  /* ---------- almacenamiento seguro ---------- */
  var store = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* modo privado */ } }
  };

  /* ---------- datos de la empresa en el HTML ---------- */
  function bindConfig() {
    var e = CFG.empresa, t = CFG.tienda;
    var map = {
      razonSocial: e.razonSocial, nit: e.nit, matricula: e.matricula, direccion: e.direccion,
      direccionCorta: e.direccionCorta, correo: e.correo, whatsapp: e.whatsapp, horario: e.horario,
      horarioCorto: e.horarioCorto, pais: t.pais, moneda: t.moneda, impuestos: t.impuestos,
      envioGratis: fmt(t.envioGratisDesde), costoEnvio: fmt(t.costoEnvio),
      entrega: t.entregaMin + ' a ' + t.entregaMax, diasDevolucion: t.diasDevolucion,
      diasReembolso: t.diasReembolso, diasGarantia: t.diasGarantia, premioMes: t.premioMes, regaloClub: t.regaloClub,
      cuotas: t.cuotas, pasarela: t.pasarela, actualizacion: t.actualizacion
    };
    $$('[data-cfg]').forEach(function (el) { var k = el.getAttribute('data-cfg'); if (map[k] != null) el.textContent = map[k]; });
    $$('[data-href="correo"]').forEach(function (a) { a.href = 'mailto:' + e.correo; });
    $$('[data-href="whatsapp"]').forEach(function (a) { a.href = e.whatsappLink; });
  }

  /* =======================================================================
     CARRITO
     ======================================================================= */
  var Cart = {
    items: function () { return store.get('ts_cart', []).filter(function (it) { return byId(it.id); }); },
    save: function (items) { store.set('ts_cart', items); Cart.render(); document.dispatchEvent(new CustomEvent('cart:change')); },
    count: function () { return Cart.items().reduce(function (a, it) { return a + it.qty; }, 0); },
    subtotal: function () { return Cart.items().reduce(function (a, it) { return a + byId(it.id).price * it.qty; }, 0); },
    add: function (id, qty) {
      var items = Cart.items(), found = false;
      items.forEach(function (it) { if (it.id === id) { it.qty = Math.min(9, it.qty + (qty || 1)); found = true; } });
      if (!found) items.push({ id: id, qty: Math.min(9, qty || 1) });
      Cart.save(items);
    },
    setQty: function (id, qty) {
      var items = Cart.items().map(function (it) { if (it.id === id) it.qty = Math.max(1, Math.min(9, qty)); return it; });
      Cart.save(items);
    },
    remove: function (id) { Cart.save(Cart.items().filter(function (it) { return it.id !== id; })); },
    clear: function () { Cart.save([]); },
    render: function () {
      var n = Cart.count();
      $$('.cart-count').forEach(function (el) {
        if (el.textContent !== String(n)) { el.textContent = n; el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); }
      });
      $$('[data-cart-label]').forEach(function (el) { el.textContent = n === 1 ? '1 artículo' : n + ' artículos'; });
      $$('[data-cart-total]').forEach(function (el) { el.textContent = fmt(Cart.subtotal()); });
      $$('.cart-btn, .icon-btn.cart').forEach(function (a) { a.setAttribute('aria-label', 'Carrito, ' + (n === 1 ? '1 artículo' : n + ' artículos')); });
    }
  };
  window.TSCart = Cart;

  /* ---------- toast ---------- */
  var toastTimer;
  function toast(msg, withLink) {
    var t = $('#toast');
    if (!t) return;
    t.innerHTML = '<span>' + esc(msg) + '</span>' + (withLink ? '<a href="carrito.html">Ver carrito</a>' : '');
    t.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('is-on'); }, 2800);
  }

  /* Botones "Añadir" en cualquier página */
  document.addEventListener('click', function (ev) {
    var b = ev.target.closest('[data-add]');
    if (!b) return;
    ev.preventDefault();
    var p = byId(b.getAttribute('data-add'));
    if (!p) return;
    var qty = 1;
    var q = b.getAttribute('data-qty-from');
    if (q) { var o = $(q); if (o) qty = parseInt(o.textContent, 10) || 1; }
    Cart.add(p.id, qty);
    toast(p.name + ' se añadió al carrito', true);
  });

  /* =======================================================================
     TARJETAS DE PRODUCTO
     ======================================================================= */
  function imgClass(p) { return 'card__img' + (p.fit === 'cover' ? ' card__img--cover' : p.fit === 'round' ? ' card__img--round' : ''); }
  function priceTag(p) {
    return '<span class="card__price' + (p.oldPrice ? ' card__price--sale' : '') + '">' +
      (p.oldPrice ? '<s>' + fmt(p.oldPrice) + '</s>' : '') + '<span>' + fmt(p.price) + '</span></span>';
  }
  function cardHTML(p, lazy) {
    var featured = p.featured;
    return '<article class="card' + (featured ? ' card--featured' : '') + '" style="--card-bg:' + p.bg + ';--card-circle:' + p.circle + ';--card-mbg:' + p.mbg + '" data-id="' + p.id + '"' + (p.mpick ? ' data-mpick' : '') + '>' +
      '<div class="card__photo">' +
        '<span class="card__circle" aria-hidden="true"></span>' +
        '<img class="' + imgClass(p) + '" src="' + p.img + '" alt="' + esc(p.name) + '" width="' + p.w + '" height="' + p.h + '"' + (lazy ? ' loading="lazy"' : '') + ' decoding="async">' +
        '<span class="tag card__tag">' + p.region + '</span>' +
        '<span class="card__kana" aria-hidden="true">' + p.kana + '</span>' +
        (featured ? '<span class="stamp" aria-hidden="true"><span class="stamp__jp">注目</span><span class="stamp__en">DESTACADO</span></span>' : '') +
      '</div>' +
      '<div class="card__body">' +
        '<div class="card__info">' +
          '<span class="card__region-m">' + p.region + '</span>' +
          '<p class="card__cat">' + CATS[p.cat].label + '</p>' +
          '<h3 class="card__name"><a href="producto.html?id=' + p.id + '">' + esc(p.name) + '</a></h3>' +
          '<p class="card__desc">' + esc(p.desc) + '</p>' +
        '</div>' +
        priceTag(p) +
        '<button class="btn card__add" type="button" data-add="' + p.id + '" aria-label="Añadir ' + esc(p.name) + ' al carrito">Añadir +</button>' +
      '</div>' +
    '</article>';
  }

  /* =======================================================================
     CATÁLOGO (inicio)
     ======================================================================= */
  function initCatalog() {
    var grid = $('#grid');
    if (!grid) return;
    var state = { cat: 'todo', platform: null, offers: false, q: '' };
    var params = new URLSearchParams(location.search);
    if (params.get('plataforma')) state.platform = params.get('plataforma');
    if (params.get('ofertas')) state.offers = true;
    if (params.get('q')) state.q = params.get('q');
    if (params.get('cat') && CATS[params.get('cat')]) state.cat = params.get('cat');

    var filterBar = $('#catalogFilter'), filterTxt = $('#catalogFilterText'), empty = $('#catalogEmpty'), more = $('#catalogMore');
    var mq = window.matchMedia('(max-width: 767px)');

    function list() {
      return PRODUCTS.filter(function (p) {
        if (state.cat !== 'todo' && p.cat !== state.cat) return false;
        if (state.platform && p.platform !== state.platform) return false;
        if (state.offers && !p.oldPrice) return false;
        if (state.q) {
          var hay = norm(p.name + ' ' + p.platform + ' ' + p.cat + ' ' + p.desc + ' ' + p.region);
          var ok = norm(state.q).split(/\s+/).every(function (w) { return hay.indexOf(w) > -1; });
          if (!ok) return false;
        }
        return true;
      });
    }

    function render() {
      var items = list();
      grid.innerHTML = items.map(function (p, i) { return cardHTML(p, i > 3); }).join('');
      $$('.tab', $('#tabs')).forEach(function (t) { t.setAttribute('aria-selected', String(t.getAttribute('data-cat') === state.cat)); });
      var parts = [];
      if (state.platform) parts.push(state.platform);
      if (state.offers) parts.push('Ofertas');
      if (state.q) parts.push('“' + state.q + '”');
      filterBar.classList.toggle('is-on', parts.length > 0);
      filterTxt.textContent = parts.join(' · ');
      empty.classList.toggle('is-on', items.length === 0);
      var picks = items.filter(function (p) { return p.mpick; }).length;
      var collapsed = mq.matches && !state.expanded && picks >= 2 && items.length > picks;
      grid.classList.toggle('is-collapsed', collapsed);
      more.hidden = !collapsed;
      $$('.quicknav a').forEach(function (a) { a.classList.toggle('is-active', a.getAttribute('data-q') === (state.offers ? 'ofertas' : 'catalogo')); });
      $$('.nav__sale').forEach(function (a) { a.classList.toggle('is-active', !!state.offers); });
    }

    function syncURL() {
      var u = new URLSearchParams();
      if (state.cat !== 'todo') u.set('cat', state.cat);
      if (state.platform) u.set('plataforma', state.platform);
      if (state.offers) u.set('ofertas', '1');
      if (state.q) u.set('q', state.q);
      var s = u.toString();
      history.replaceState(null, '', location.pathname + (s ? '?' + s : '') + '#catalogo');
    }

    function go(scroll) { render(); syncURL(); if (scroll) $('#catalogo').scrollIntoView({ block: 'start' }); }

    $('#tabs').addEventListener('click', function (e) {
      var t = e.target.closest('.tab'); if (!t) return;
      state.cat = t.getAttribute('data-cat'); go(false);
    });
    $('#tabs').addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      var tabs = $$('.tab', this), i = tabs.indexOf(document.activeElement);
      if (i < 0) return;
      var n = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
      n.focus(); n.click();
    });
    $('#catalogFilterClear').addEventListener('click', function () { state.platform = null; state.offers = false; state.q = ''; go(false); });
    $('#catalogEmptyClear').addEventListener('click', function () { state.platform = null; state.offers = false; state.q = ''; state.cat = 'todo'; go(false); });
    more.addEventListener('click', function () { state.expanded = true; render(); });
    mq.addEventListener ? mq.addEventListener('change', render) : mq.addListener(render);

    /* Enlaces que filtran: chips, línea de tiempo, ofertas, buscador */
    document.addEventListener('click', function (e) {
      var a = e.target.closest('[data-filter]');
      if (!a) return;
      e.preventDefault();
      var f = a.getAttribute('data-filter'), v = a.getAttribute('data-value');
      state.platform = null; state.offers = false; state.q = ''; state.cat = 'todo';
      if (f === 'plataforma') state.platform = v;
      if (f === 'ofertas') state.offers = true;
      if (f === 'region') state.q = v;
      if (f === 'todo') { /* sin filtro */ }
      closeDrawer();
      go(true);
    });

    window.TSCatalogSearch = function (q) { state.platform = null; state.offers = false; state.cat = 'todo'; state.q = q; go(true); };
    render();
    if (location.hash === '#catalogo' && location.search) setTimeout(function () { $('#catalogo').scrollIntoView(); }, 50);
  }

  /* =======================================================================
     BUSCADOR
     ======================================================================= */
  function initSearch() {
    $$('[data-search]').forEach(function (form) {
      var input = $('input', form), box = $('.search__results', form), idx = -1;
      function hits(q) {
        q = norm(q.trim());
        if (!q) return [];
        return PRODUCTS.filter(function (p) {
          var hay = norm(p.name + ' ' + p.platform + ' ' + p.kana + ' ' + CATS[p.cat].tab + ' ' + p.region);
          return q.split(/\s+/).every(function (w) { return hay.indexOf(w) > -1; });
        }).slice(0, 5);
      }
      function draw() {
        var q = input.value, h = hits(q);
        idx = -1;
        if (!q.trim()) { box.classList.remove('is-open'); box.innerHTML = ''; input.setAttribute('aria-expanded', 'false'); return; }
        box.innerHTML = (h.length ? h.map(function (p, i) {
          return '<a class="search__hit" role="option" id="' + form.id + '-o' + i + '" href="producto.html?id=' + p.id + '"><img src="' + p.img + '" alt="" width="48" height="48"><div><b>' + esc(p.name) + '</b><span>' + fmt(p.price) + '</span></div></a>';
        }).join('') : '<p class="search__empty">No encontramos “' + esc(q) + '”. Prueba con una consola: Saturn, Dreamcast…</p>') +
          '<a class="search__all" href="index.html?q=' + encodeURIComponent(q) + '#catalogo">Ver todos los resultados</a>';
        box.classList.add('is-open');
        input.setAttribute('aria-expanded', 'true');
      }
      input.addEventListener('input', draw);
      input.addEventListener('focus', draw);
      input.addEventListener('keydown', function (e) {
        var opts = $$('.search__hit', box);
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          if (!opts.length) return;
          e.preventDefault();
          idx = (idx + (e.key === 'ArrowDown' ? 1 : -1) + opts.length) % opts.length;
          opts.forEach(function (o, i) { o.classList.toggle('is-focus', i === idx); });
          input.setAttribute('aria-activedescendant', opts[idx].id);
        } else if (e.key === 'Escape') { box.classList.remove('is-open'); input.blur(); }
      });
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var opts = $$('.search__hit', box);
        if (idx > -1 && opts[idx]) { location.href = opts[idx].href; return; }
        var q = input.value.trim();
        if (!q) return;
        if (window.TSCatalogSearch) { window.TSCatalogSearch(q); box.classList.remove('is-open'); closeMSearch(); input.blur(); }
        else location.href = 'index.html?q=' + encodeURIComponent(q) + '#catalogo';
      });
      document.addEventListener('click', function (e) { if (!form.contains(e.target)) box.classList.remove('is-open'); });
    });

    var ms = $('#msearch');
    $$('[data-open-search]').forEach(function (b) {
      b.addEventListener('click', function () { ms.classList.add('is-open'); $('input', ms).focus(); lockScroll(true); });
    });
    $$('[data-close-search]').forEach(function (b) { b.addEventListener('click', closeMSearch); });
  }
  function closeMSearch() { var ms = $('#msearch'); if (ms && ms.classList.contains('is-open')) { ms.classList.remove('is-open'); lockScroll(false); } }
  function lockScroll(on) { document.documentElement.style.overflow = on ? 'hidden' : ''; }

  /* =======================================================================
     MENÚ MÓVIL
     ======================================================================= */
  var lastFocus;
  function openDrawer() {
    var d = $('#drawer'); if (!d) return;
    lastFocus = document.activeElement;
    d.classList.add('is-open'); lockScroll(true);
    $('.drawer__close', d).focus();
    $$('[data-open-menu]').forEach(function (b) { b.setAttribute('aria-expanded', 'true'); });
  }
  function closeDrawer() {
    var d = $('#drawer'); if (!d || !d.classList.contains('is-open')) return;
    d.classList.remove('is-open'); lockScroll(false);
    $$('[data-open-menu]').forEach(function (b) { b.setAttribute('aria-expanded', 'false'); });
    if (lastFocus) lastFocus.focus();
  }
  function initDrawer() {
    $$('[data-open-menu]').forEach(function (b) { b.addEventListener('click', openDrawer); });
    $$('[data-close-menu]').forEach(function (b) { b.addEventListener('click', closeDrawer); });
    $$('#drawer a').forEach(function (a) { a.addEventListener('click', closeDrawer); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { closeDrawer(); closeMSearch(); }
      if (e.key === 'Tab') {
        var d = $('#drawer');
        if (!d || !d.classList.contains('is-open')) return;
        var f = $$('a, button', $('.drawer__panel', d)), first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }

  /* =======================================================================
     PORTADA: carrusel 01 / 02 / 03
     ======================================================================= */
  var SLIDES = [
    { id: 'sega-dreamcast', l1: 'El futuro de 1998,', l2: 'ahora en tu sala.', text: 'Consolas Dreamcast importadas de Japón, con sus discos y controles originales.', vertical: 'ドリームキャスト', caption: 'SEGA DREAMCAST', img: 'assets/img/sega-dreamcast.webp', platform: 'Dreamcast' },
    { id: 'super-famicom', l1: 'La magia de 1990,', l2: 'ahora en tu sala.', text: 'Super Famicom japonesas con dos controles, listas para tus cartuchos favoritos.', vertical: 'スーパーファミコン', caption: 'NINTENDO SUPER FAMICOM', img: 'assets/img/super-famicom.webp', platform: 'Super Famicom' },
    { id: 'playstation-scph-1000', l1: 'La joya de 1994,', l2: 'ahora en tu sala.', text: 'El primer modelo de PlayStation, directo de Japón y probado con juegos reales.', vertical: 'プレイステーション', caption: 'SONY PLAYSTATION SCPH-1000', img: 'assets/img/playstation.webp', platform: 'PlayStation' }
  ];
  function initHero() {
    var hero = $('#hero');
    if (!hero) return;
    var tabs = $$('.slide-tab', hero), cur = 0, timer = null;
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    function show(i, user) {
      if (i === cur && !user) return;
      var s = SLIDES[i];
      hero.classList.add('is-swapping');
      setTimeout(function () {
        $('.hero__title .l1', hero).textContent = s.l1;
        $('.hero__title .l2', hero).textContent = s.l2;
        $('.hero__text', hero).textContent = s.text;
        $('.hero__vertical', hero).textContent = s.vertical;
        $('.hero__caption', hero).textContent = s.caption;
        $$('[data-hero-img]', hero).forEach(function (im) { im.src = s.img; im.alt = byId(s.id).name; });
        $('[data-hero-cta]', hero).setAttribute('data-value', s.platform);
        hero.classList.remove('is-swapping');
      }, 260);
      cur = i;
      tabs.forEach(function (t, k) { t.setAttribute('aria-selected', String(k === i)); t.tabIndex = k === i ? 0 : -1; });
    }
    function next() { show((cur + 1) % SLIDES.length); }
    function play() { if (reduce) return; stop(); hero.classList.add('is-autoplay'); timer = setInterval(next, 7000); }
    function stop() { clearInterval(timer); timer = null; hero.classList.remove('is-autoplay'); }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { stop(); show(i, true); });
      t.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); var n = (i + (e.key === 'ArrowRight' ? 1 : SLIDES.length - 1)) % SLIDES.length; tabs[n].focus(); stop(); show(n, true); }
      });
    });
    hero.addEventListener('focusin', stop);
    play();
  }

  /* =======================================================================
     ACORDEONES (FAQ)
     ======================================================================= */
  function initAccordions() {
    $$('.acc__btn').forEach(function (b) {
      b.addEventListener('click', function () {
        var item = b.closest('.acc__item'), open = !item.classList.contains('is-open');
        item.classList.toggle('is-open', open);
        b.setAttribute('aria-expanded', String(open));
        $('.acc__sign', b).textContent = open ? '–' : '+';
      });
    });
  }

  /* =======================================================================
     FORMULARIOS (club, contacto)
     ======================================================================= */
  var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  function setError(input, msg) {
    input.setAttribute('aria-invalid', msg ? 'true' : 'false');
    var id = input.id + '-err', el = document.getElementById(id);
    if (!el && msg) { el = document.createElement('p'); el.className = 'field-error'; el.id = id; input.insertAdjacentElement('afterend', el); }
    if (el) el.textContent = msg || '';
    if (msg) input.setAttribute('aria-describedby', id); else input.removeAttribute('aria-describedby');
  }
  function validate(form) {
    var ok = true, first = null;
    $$('input, select, textarea', form).forEach(function (f) {
      if (f.type === 'hidden' || f.disabled || f.closest('[hidden]')) return;
      var v = f.value.trim(), msg = '';
      if (f.required && !v) msg = f.getAttribute('data-msg') || 'Este campo es obligatorio.';
      else if (f.type === 'email' && v && !EMAIL.test(v)) msg = 'Escribe un correo válido, por ejemplo nombre@correo.com.';
      else if (f.pattern && v && !new RegExp('^(?:' + f.pattern + ')$').test(v)) msg = f.getAttribute('data-msg') || 'Revisa este dato.';
      if (f.type === 'checkbox' && f.required && !f.checked) msg = f.getAttribute('data-msg') || 'Debes aceptar para continuar.';
      if (!(f.type === 'email' && form.hasAttribute('data-simple'))) setError(f, msg);
      if (msg) { ok = false; if (!first) first = f; }
    });
    if (first) first.focus();
    return ok;
  }
  window.TSValidate = validate;

  function initForms() {
    $$('form[data-club]').forEach(function (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var msg = $('.form-msg', form.closest('[data-form-wrap]') || form);
        var email = $('input[type=email]', form);
        if (!EMAIL.test(email.value.trim())) {
          email.setAttribute('aria-invalid', 'true');
          msg.className = 'form-msg is-error';
          msg.textContent = 'Escribe un correo válido para participar en el sorteo.';
          email.focus();
          return;
        }
        if (!form.hasAttribute('data-simple') && !validate(form)) return;
        email.setAttribute('aria-invalid', 'false');
        store.set('ts_club', { email: email.value.trim(), at: Date.now() });
        msg.className = 'form-msg is-ok';
        msg.innerHTML = '¡Listo, ya estás dentro! Participas en el <b>sorteo de este mes</b> y tu primera compra llevará <b>' + CFG.tienda.regaloClub + '</b>.';
        form.reset();
      });
    });
    var contact = $('#contactForm');
    if (contact) contact.addEventListener('submit', function (e) {
      e.preventDefault();
      var msg = $('.form-msg', contact);
      if (!validate(contact)) { msg.className = 'form-msg is-error'; msg.textContent = 'Revisa los campos marcados.'; return; }
      msg.className = 'form-msg is-ok';
      msg.textContent = '¡Gracias! Recibimos tu mensaje y te responderemos en menos de 24 horas hábiles.';
      contact.reset();
    });
    $$('.input').forEach(function (f) { f.addEventListener('input', function () { if (f.getAttribute('aria-invalid') === 'true') setError(f, ''); }); });
  }

  /* =======================================================================
     AVISO DE COOKIES
     ======================================================================= */
  function initCookies() {
    var c = $('#cookies');
    if (!c) return;
    if (!store.get('ts_cookies', null)) setTimeout(function () { c.classList.add('is-on'); }, 600);
    $$('[data-cookies]', c).forEach(function (b) {
      b.addEventListener('click', function () { store.set('ts_cookies', { choice: b.getAttribute('data-cookies'), at: Date.now() }); c.classList.remove('is-on'); });
    });
    $$('[data-cookie-settings]').forEach(function (b) { b.addEventListener('click', function (e) { e.preventDefault(); c.classList.add('is-on'); $('button', c).focus(); }); });
  }

  /* =======================================================================
     FICHA DE PRODUCTO
     ======================================================================= */
  function initProduct() {
    var root = $('#product');
    if (!root) return;
    var p = byId(new URLSearchParams(location.search).get('id'));
    if (!p) { $('#productNotFound').hidden = false; root.hidden = true; document.title = 'Producto no encontrado · TokyoStore'; return; }
    document.title = p.name + ' · TokyoStore';
    var meta = document.querySelector('meta[name=description]'); if (meta) meta.content = p.long;
    $('#crumbName').textContent = p.name;
    $('#crumbCat').textContent = CATS[p.cat].tab;
    $('#crumbCat').href = 'index.html?cat=' + p.cat + '#catalogo';
    var t = CFG.tienda;
    var photo = $('.product__photo', root);
    photo.style.setProperty('--card-bg', p.featured ? '#16161A' : p.bg);
    photo.style.setProperty('--card-circle', p.circle);
    root.classList.toggle('product--dark', !!p.featured);
    $('.product__photo-in', root).innerHTML = '<span class="card__circle" aria-hidden="true"></span><img class="' + imgClass(p) + '" src="' + p.img + '" alt="' + esc(p.name) + '" width="' + p.w + '" height="' + p.h + '">';
    $('.card__tag', root).textContent = p.region;
    $('.card__kana', root).textContent = p.kana;
    $('#pCat').textContent = CATS[p.cat].label;
    $('#pName').textContent = p.name;
    $('#pDesc').textContent = p.desc;
    $('#pPrice').outerHTML = priceTag(p).replace('class="card__price', 'id="pPrice" class="card__price');
    $('#pLong').textContent = p.long;
    $('#pEstado').textContent = p.estado;
    $('#pRegion').textContent = p.region === 'NTSC-J' ? 'NTSC-J (Japón) · 100 V — te asesoramos con el transformador' : 'Japón (JP) · requiere consola japonesa o adaptador';
    $('#pPlat').textContent = p.platform;
    $('#pIncluye').innerHTML = p.incluye.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('');
    $('#pGarantia').textContent = (p.cat === 'juego' ? 30 : t.diasGarantia) + ' días de garantía TokyoStore';
    $('#pAdd').setAttribute('data-add', p.id);
    var qty = $('#pQty');
    $$('[data-q]', root).forEach(function (b) {
      b.addEventListener('click', function () { var v = parseInt(qty.textContent, 10) + parseInt(b.getAttribute('data-q'), 10); qty.textContent = Math.max(1, Math.min(9, v)); });
    });
    var rel = PRODUCTS.filter(function (x) { return x.id !== p.id && !x.featured && (x.platform === p.platform || x.cat === p.cat); }).slice(0, 4);
    if (rel.length < 4) PRODUCTS.forEach(function (x) { if (rel.length < 4 && x.id !== p.id && !x.featured && rel.indexOf(x) < 0) rel.push(x); });
    $('#related').innerHTML = rel.map(function (x) { return cardHTML(x, true); }).join('');
  }

  /* =======================================================================
     LEGAL / FAQ: índice activo
     ======================================================================= */
  function initIndex() {
    var idx = $('[data-spy]');
    if (!idx || !('IntersectionObserver' in window)) return;
    var links = $$('a', idx), map = {};
    links.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          links.forEach(function (a) { a.classList.remove('is-active'); a.removeAttribute('aria-current'); });
          var a = map[en.target.id]; if (a) { a.classList.add('is-active'); a.setAttribute('aria-current', 'true'); }
        }
      });
    }, { rootMargin: '-20% 0px -70% 0px' });
    Object.keys(map).forEach(function (id) { var s = document.getElementById(id); if (s) io.observe(s); });
  }

  /* ---------- inicio ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    bindConfig();
    Cart.render();
    if ($('.sticky-cart')) document.body.classList.add('has-sticky');
    initDrawer();
    initSearch();
    initHero();
    initCatalog();
    initAccordions();
    initForms();
    initCookies();
    initProduct();
    initIndex();
    window.addEventListener('storage', function (e) { if (e.key === 'ts_cart') Cart.render(); });
  });

  window.TS = { fmt: fmt, byId: byId, esc: esc, store: store, toast: toast, validate: validate, setError: setError };
})();
