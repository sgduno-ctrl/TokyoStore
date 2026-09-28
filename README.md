# TokyoStore — tienda de consolas y videojuegos retro japoneses

Sitio web de comercio electrónico con landing page, construido a partir del diseño en Figma
*"TokyoStore — Página de inicio"* (escritorio 1440 px y móvil 390 px).

HTML, CSS y JavaScript puros: sin frameworks ni instalaciones. Se abre directamente en el navegador.

## Páginas

| Archivo | Contenido |
|---|---|
| `index.html` | Inicio: portada con carrusel, landing page del Club, Quiénes somos (misión, visión, razón social), catálogo con filtros, compra segura, ventaja competitiva, Casual Retro, póster, plataformas, preguntas frecuentes, club, contacto y pie legal |
| `producto.html?id=…` | Ficha de cada producto |
| `carrito.html` | Carrito y pago seguro en 4 pasos: carrito → envío → pago → confirmación |
| `faq.html` | Página completa de preguntas frecuentes |
| `legal.html` | Aviso de privacidad, términos, devoluciones, envíos, seguridad, cookies y derechos legales |

## Cambiar datos de la tienda

Todos los datos del negocio están en **`assets/js/data.js`**:

- `TS_CONFIG.empresa`: razón social, RIF, dirección (Maracaibo), correo, WhatsApp y horario.
- `TS_CONFIG.tienda`: precios en dólares (USD), envío gratis, días de entrega, garantía, devoluciones, descuento del club, etc.
- `TS_PRODUCTS`: productos, precios, fotos y descripciones.

> Los datos actuales (RIF, dirección, teléfono, precios) son **de ejemplo** para el prototipo.
> Cámbialos por los reales antes de usar la tienda con clientes.

## Cómo verla

Abre `index.html` en el navegador, o levanta un servidor local:

```bash
python3 -m http.server 8000
# y abre http://localhost:8000
```

## Notas

- El pago se **simula** en el navegador; no se cobra nada. Para probar con tarjeta usa `4242 4242 4242 4242`,
  cualquier fecha futura y cualquier CVV. El cupón del club es `CLUB10`.
- Los formularios (club y contacto) validan los datos y muestran confirmación, pero no envían correos:
  para eso hace falta conectar un servicio externo.
- El carrito se guarda en el navegador (`localStorage`).
- Foto de la Mega Drive: Evan-Amos, Wikimedia Commons, dominio público.
