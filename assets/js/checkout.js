/* =========================================================================
   TokyoStore — carrito y proceso de pago (4 pasos)
   Prototipo: el pago se simula en el navegador, no se cobra nada.
   ========================================================================= */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  document.addEventListener('DOMContentLoaded', function () {
    var TS = window.TS, Cart = window.TSCart, T = window.TS_CONFIG.tienda;
    var list = $('#cartList'), empty = $('#cartEmpty');
    var shipPanel = $('#panelShip'), payPanel = $('#panelPay'), payBtn = $('#payBtn');
    var ship = TS.store.get('ts_ship', null);
    var coupon = TS.store.get('ts_coupon', null);
    if (!coupon && TS.store.get('ts_club', null)) coupon = T.codigoClub;

    function step() {
      if (!Cart.count()) return 1;
      if (!ship) return 2;
      return 3;
    }

    function totals() {
      var sub = Cart.subtotal();
      var disc = coupon ? Math.round(sub * T.descuentoClub / 100) : 0;
      var shipCost = sub === 0 || sub - disc >= T.envioGratisDesde ? 0 : T.costoEnvio;
      return { sub: sub, disc: disc, ship: shipCost, total: sub - disc + shipCost };
    }

    function renderList() {
      var items = Cart.items();
      empty.hidden = items.length > 0;
      list.innerHTML = items.map(function (it) {
        var p = TS.byId(it.id);
        return '<div class="cart-item" data-id="' + p.id + '">' +
          '<div class="cart-item__img"><img src="' + p.img + '" alt="" width="' + p.w + '" height="' + p.h + '"' + (p.fit === 'round' ? ' class="is-round"' : '') + '></div>' +
          '<div><b><a href="producto.html?id=' + p.id + '">' + TS.esc(p.name) + '</a></b><small>' + p.region + ' · ' + TS.esc(p.desc) + '</small>' +
          '<button class="cart-item__rm" type="button" data-rm aria-label="Eliminar ' + TS.esc(p.name) + ' del carrito">Eliminar</button></div>' +
          '<div class="qty" role="group" aria-label="Cantidad de ' + TS.esc(p.name) + '"><button type="button" data-d="-1" aria-label="Quitar uno"' + (it.qty <= 1 ? ' aria-disabled="true"' : '') + '>–</button><span aria-live="polite">' + it.qty + '</span><button type="button" data-d="1" aria-label="Añadir uno">+</button></div>' +
          '<p class="cart-item__price">' + TS.fmt(p.price * it.qty) + '</p></div>';
      }).join('');
    }

    function renderSummary() {
      var t = totals();
      $('#sumSub').textContent = TS.fmt(t.sub);
      $('#sumShip').textContent = t.sub === 0 ? '—' : t.ship === 0 ? 'Gratis' : TS.fmt(t.ship);
      $('#sumDisc').textContent = coupon ? '– ' + TS.fmt(t.disc) + ' (' + T.descuentoClub + '%)' : 'Sin aplicar';
      $('#sumDiscRow').classList.toggle('is-off', !coupon);
      $('#sumTotal').textContent = TS.fmt(t.total);
      var s = step();
      payBtn.disabled = s < 3;
      payBtn.setAttribute('aria-disabled', String(s < 3));
      if (coupon) $('#coupon').value = coupon;
    }

    function renderSteps(done) {
      var s = done ? 4 : step();
      $$('.co-step').forEach(function (li) {
        var n = +li.getAttribute('data-step');
        li.classList.toggle('is-done', n < s);
        li.classList.toggle('is-current', n === s);
        $('i', li).textContent = n < s ? '✓' : n;
        if (n === s) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current');
      });
    }

    function renderPanels() {
      var s = step();
      shipPanel.classList.toggle('is-locked', s < 2);
      shipPanel.classList.toggle('is-done', !!ship && s >= 2);
      payPanel.classList.toggle('is-locked', s < 3);
      if (ship) {
        $('#shipSummary').textContent = 'Envío a: ' + ship.nombre + ' · ' + ship.direccion + ' · ' + ship.ciudad;
        ['nombre', 'documento', 'email', 'celular', 'direccion', 'ciudad', 'notas'].forEach(function (k) { var f = $('#shipForm [name=' + k + ']'); if (f && ship[k] != null) f.value = ship[k]; });
      }
    }

    function render() { renderList(); renderSummary(); renderPanels(); renderSteps(); }

    /* Cantidades y eliminar */
    list.addEventListener('click', function (e) {
      var row = e.target.closest('.cart-item'); if (!row) return;
      var id = row.getAttribute('data-id');
      if (e.target.closest('[data-rm]')) {
        var name = TS.byId(id).name;
        Cart.remove(id);
        TS.toast(name + ' se eliminó del carrito');
        var next = $('.cart-item [data-rm]') || $('#cartEmpty a'); if (next) next.focus();
        return;
      }
      var d = e.target.closest('[data-d]');
      if (d) {
        var it = Cart.items().filter(function (x) { return x.id === id; })[0];
        Cart.setQty(id, it.qty + (+d.getAttribute('data-d')));
        var again = $('.cart-item[data-id="' + id + '"] [data-d="' + d.getAttribute('data-d') + '"]'); if (again) again.focus();
      }
    });
    document.addEventListener('cart:change', render);

    /* Paso 2: envío */
    $('#shipForm').addEventListener('submit', function (e) {
      e.preventDefault();
      if (!TS.validate(this)) return;
      var fd = new FormData(this); ship = {};
      fd.forEach(function (v, k) { ship[k] = String(v).trim(); });
      TS.store.set('ts_ship', ship);
      render();
      $('#p-num').focus();
    });
    $('#shipEdit').addEventListener('click', function () {
      ship = null; TS.store.set('ts_ship', null); render(); $('#s-name').focus();
    });

    /* Paso 3: método de pago */
    function method() { return ($('input[name=metodo]:checked') || {}).value; }
    $$('input[name=metodo]').forEach(function (r) {
      r.addEventListener('change', function () {
        var m = method();
        $('#cardFields').hidden = m !== 'tarjeta';
        $('#payPaypal').hidden = m !== 'paypal';
        $('#payTransfer').hidden = m !== 'transferencia';
        $$('#cardFields .input').forEach(function (f) { f.disabled = m !== 'tarjeta'; });
      });
    });

    /* Formato de tarjeta y vencimiento */
    $('#p-num').addEventListener('input', function () {
      var v = this.value.replace(/\D/g, '').slice(0, 19);
      this.value = v.replace(/(.{4})/g, '$1 ').trim();
    });
    $('#p-exp').addEventListener('input', function () {
      var v = this.value.replace(/\D/g, '').slice(0, 4);
      this.value = v.length > 2 ? v.slice(0, 2) + ' / ' + v.slice(2) : v;
    });
    $('#p-cvv').addEventListener('input', function () { this.value = this.value.replace(/\D/g, '').slice(0, 4); });

    function luhn(num) {
      var s = 0, alt = false;
      for (var i = num.length - 1; i >= 0; i--) { var n = +num[i]; if (alt) { n *= 2; if (n > 9) n -= 9; } s += n; alt = !alt; }
      return num.length >= 13 && s % 10 === 0;
    }
    function checkCard() {
      var ok = TS.validate($('#payForm'));
      if (!ok) return false;
      var num = $('#p-num').value.replace(/\D/g, '');
      if (!luhn(num)) { TS.setError($('#p-num'), 'El número de tarjeta no es válido. Para probar usa 4242 4242 4242 4242.'); $('#p-num').focus(); return false; }
      var m = $('#p-exp').value.match(/^(\d{2}) \/ (\d{2})$/);
      var now = new Date(), valid = false;
      if (m) { var mm = +m[1], yy = 2000 + +m[2]; valid = mm >= 1 && mm <= 12 && (yy > now.getFullYear() || (yy === now.getFullYear() && mm >= now.getMonth() + 1)); }
      if (!valid) { TS.setError($('#p-exp'), 'La tarjeta está vencida o la fecha no es válida.'); $('#p-exp').focus(); return false; }
      return true;
    }

    /* Cupón */
    $('#couponForm').addEventListener('submit', function (e) {
      e.preventDefault();
      var v = $('#coupon').value.trim().toUpperCase(), msg = $('#couponMsg');
      if (!v) { coupon = null; TS.store.set('ts_coupon', null); msg.textContent = 'Cupón retirado.'; renderSummary(); return; }
      if (v === T.codigoClub) { coupon = v; TS.store.set('ts_coupon', v); msg.textContent = '¡Cupón aplicado! ' + T.descuentoClub + '% de descuento.'; }
      else { msg.textContent = 'Ese código no existe. Únete al club para recibir el tuyo.'; }
      renderSummary();
    });

    /* Pagar */
    payBtn.addEventListener('click', function () {
      var msg = $('#payMsg');
      msg.textContent = '';
      if (step() < 3) { msg.textContent = step() === 1 ? 'Tu carrito está vacío.' : 'Completa los datos de envío.'; return; }
      var m = method();
      if (m === 'tarjeta' && !checkCard()) { msg.textContent = 'Revisa los datos de la tarjeta.'; return; }
      payBtn.disabled = true;
      payBtn.lastChild.textContent = 'Procesando pago…';
      setTimeout(function () { finish(m); }, 900);
    });

    function finish(m) {
      var t = totals();
      var order = 'TS-' + String(Date.now()).slice(-6);
      $('#orderNo').textContent = order;
      var name = ship.nombre.split(' ')[0];
      $('#confirmTitle').textContent = '¡Gracias, ' + name + '!';
      $('#confirmText').textContent = m === 'transferencia'
        ? 'Reservamos tus productos por 24 horas. Cuando recibamos la transferencia te enviamos la confirmación a ' + ship.email + ' y el número de seguimiento.'
        : 'Pagaste ' + TS.fmt(t.total) + '. Te enviamos la confirmación a ' + ship.email + ' y, cuando despachemos, el número de seguimiento.';
      if (m === 'transferencia') {
        var tr = $('#confirmTransfer');
        tr.hidden = false;
        tr.innerHTML = '<b>Datos para la transferencia</b>Titular: ' + TS.esc(window.TS_CONFIG.empresa.razonSocial) + ' · ' + TS.esc(window.TS_CONFIG.empresa.nit) + '<br>Cuenta de ahorros (ejemplo): 000-000000-00<br>Valor: ' + TS.fmt(t.total) + ' · Referencia: ' + order;
      }
      TS.store.set('ts_last_order', { order: order, total: t.total, at: Date.now() });
      TS.store.set('ts_ship', null);
      TS.store.set('ts_coupon', null);
      Cart.clear();
      $('#checkout').hidden = true;
      $('#confirmation').hidden = false;
      renderSteps(true);
      window.scrollTo(0, 0);
      $('#confirmTitle').focus();
    }

    $$('#cardFields .input').forEach(function (f) { f.disabled = false; });
    render();
  });
})();
