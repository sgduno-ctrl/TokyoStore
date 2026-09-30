/* =========================================================================
   TokyoStore — datos de la tienda
   Todo lo que cambia con el negocio real (empresa, precios, políticas)
   está aquí. Precios en dólares (USD). Los valores son de EJEMPLO para el prototipo: cámbialos por
   los reales antes de publicar la tienda.
   ========================================================================= */

window.TS_CONFIG = {
  empresa: {
    razonSocial: 'TokyoStore Retro, C.A.',
    nit: 'RIF J-41258736-5',
    matricula: 'Registro Mercantil Primero del estado Zulia · Tomo 12-A, N.º 34',
    direccion: 'Av. 5 de Julio con calle 3Y, Local 104, sector Bellas Artes, Maracaibo, estado Zulia, Venezuela',
    direccionCorta: 'Av. 5 de Julio, Local 104, Maracaibo',
    correo: 'hola@tokyostore.com',
    whatsapp: '+58 414 555 0123',
    whatsappLink: 'https://wa.me/584145550123',
    horario: 'Lunes a sábado · 9:00 a. m. a 6:00 p. m.',
    horarioCorto: '9:00 a. m. a 6:00 p. m.'
  },
  tienda: {
    pais: 'Venezuela',
    moneda: 'dólares estadounidenses (USD)',
    impuestos: 'IVA incluido',
    envioGratisDesde: 75,
    costoEnvio: 4,
    entregaMin: 2,
    entregaMax: 5,
    diasDevolucion: 30,
    diasReembolso: 15,
    diasGarantia: 90,
    premioMes: 'un juego japonés de colección',   // premio del sorteo mensual del club
    regaloClub: 'un regalo sorpresa retro',        // va en la primera compra de cada miembro
    cuotas: 'Sí, hasta 12 cuotas',
    pasarela: 'una pasarela de pagos certificada PCI DSS',
    actualizacion: '27 de septiembre de 2026'
  }
};

/* Productos del catálogo.
   bg / circle: colores de la tarjeta y del círculo (tomados del Figma).
   fit: 'photo' (recorte sin fondo), 'cover' (carátula girada) o 'round' (foto en círculo). */
window.TS_PRODUCTS = [
  {
    id: 'sega-dreamcast', mpick: true, name: 'Sega Dreamcast', cat: 'consola', platform: 'Dreamcast',
    region: 'NTSC-J', kana: 'ドリームキャスト', desc: 'Con control y cables · Probada',
    price: 219, img: 'assets/img/sega-dreamcast.webp', w: 380, h: 203, fit: 'photo',
    bg: '#16161A', circle: 'rgba(30,63,160,.9)', mbg: '#DDE5F4', featured: true,
    long: 'La última consola de Sega, importada de Japón en su versión original NTSC-J. Revisada, limpiada y probada con juegos reales antes de salir de nuestra bodega.',
    incluye: ['Consola Sega Dreamcast (HKT-3000)', 'Control original con VMU', 'Cable de video AV y cable de corriente', 'Transformador 110 V → 100 V recomendado'],
    estado: 'Usado · Muy buen estado'
  },
  {
    id: 'sega-saturn', name: 'Sega Saturn (blanca)', cat: 'consola', platform: 'Sega Saturn',
    region: 'NTSC-J', kana: 'セガサターン', desc: 'Con control y cables',
    price: 199, img: 'assets/img/sega-saturn.webp', w: 745, h: 406, fit: 'photo',
    bg: '#EDE4D3', circle: 'rgba(255,255,255,.9)', mbg: '#EDE4D3',
    long: 'El modelo blanco de la Sega Saturn, exclusivo del mercado japonés. Lee discos originales japoneses y viene lista para conectar.',
    incluye: ['Consola Sega Saturn blanca (HST-3220)', 'Control original', 'Cable AV y cable de corriente'],
    estado: 'Usado · Buen estado'
  },
  {
    id: 'mega-drive', name: 'Mega Drive', cat: 'consola', platform: 'Mega Drive',
    region: 'NTSC-J', kana: 'メガドライブ', desc: 'Con control · Salida AV',
    price: 129, oldPrice: 149, img: 'assets/img/mega-drive.webp', w: 760, h: 363, fit: 'photo',
    bg: '#F1DDD8', circle: 'rgba(233,167,156,.9)', mbg: '#F1DDD8',
    long: 'La Mega Drive japonesa de primera generación, con su clásico acabado negro y dorado. Salida AV para conectar a cualquier televisor.',
    incluye: ['Consola Mega Drive (HAA-2510)', 'Control de 3 botones', 'Cable AV y fuente de poder'],
    estado: 'Usado · Buen estado'
  },
  {
    id: 'playstation-scph-1000', mpick: true, name: 'PlayStation SCPH-1000', cat: 'consola', platform: 'PlayStation',
    region: 'NTSC-J', kana: 'プレステ', desc: 'Primer modelo · Probada',
    price: 159, img: 'assets/img/playstation.webp', w: 760, h: 318, fit: 'photo',
    bg: '#E3E6EE', circle: 'rgba(185,199,230,.9)', mbg: '#E3E6EE',
    long: 'El primer modelo de PlayStation lanzado en Japón en 1994, muy buscado por coleccionistas por su salida S-Video y su audio de alta calidad.',
    incluye: ['Consola PlayStation SCPH-1000', 'Control original', 'Cable AV y cable de corriente'],
    estado: 'Usado · Muy buen estado'
  },
  {
    id: 'super-famicom', name: 'Super Famicom', cat: 'consola', platform: 'Super Famicom',
    region: 'NTSC-J', kana: 'スーファミ', desc: 'Con dos controles',
    price: 139, img: 'assets/img/super-famicom.webp', w: 760, h: 337, fit: 'photo',
    bg: '#ECE6F4', circle: 'rgba(211,195,236,.9)', mbg: '#ECE6F4',
    long: 'La Super Famicom original japonesa, con dos controles para jugar de a dos desde el primer día.',
    incluye: ['Consola Super Famicom (SHVC-001)', 'Dos controles originales', 'Cable AV y fuente de poder'],
    estado: 'Usado · Buen estado'
  },
  {
    id: 'virtua-fighter-2', name: 'Virtua Fighter 2', cat: 'juego', platform: 'Sega Saturn',
    region: 'JP', kana: 'バーチャ', desc: 'Saturn · Caja y manual',
    price: 24, img: 'assets/img/virtua-fighter-2.webp', w: 440, h: 618, fit: 'cover',
    bg: '#F4E6DA', circle: 'rgba(242,184,168,.9)', mbg: '#F4E6DA',
    long: 'El clásico de peleas en 3D de Sega AM2 para Sega Saturn. Disco original con caja y manual.',
    incluye: ['Disco original', 'Caja', 'Manual'],
    estado: 'Usado · Muy buen estado'
  },
  {
    id: 'jet-set-radio', name: 'Jet Set Radio', cat: 'juego', platform: 'Dreamcast',
    region: 'JP', kana: 'ジェット', desc: 'Dreamcast · Caja y manual',
    price: 59, img: 'assets/img/jet-set-radio.webp', w: 460, h: 455, fit: 'cover',
    bg: '#F7EDCF', circle: 'rgba(246,213,138,.9)', mbg: '#F7EDCF',
    long: 'Patines, grafiti y una banda sonora legendaria. Edición original para Dreamcast con caja y manual.',
    incluye: ['Disco original', 'Caja', 'Manual'],
    estado: 'Usado · Buen estado'
  },
  {
    id: 'chrono-trigger', mpick: true, name: 'Chrono Trigger', cat: 'juego', platform: 'Super Famicom',
    region: 'JP', kana: 'クロノ', desc: 'Super Famicom · Cartucho',
    price: 55, img: 'assets/img/chrono-trigger.webp', w: 568, h: 333, fit: 'photo',
    bg: '#E8E3F2', circle: 'rgba(211,195,236,.9)', mbg: '#E8E3F2',
    long: 'Uno de los mejores RPG de la historia, en su cartucho original japonés para Super Famicom.',
    incluye: ['Cartucho original', 'Caja'],
    estado: 'Usado · Muy buen estado'
  },
  {
    id: 'panzer-dragoon-2', name: 'Panzer Dragoon II Zwei', cat: 'juego', platform: 'Sega Saturn',
    region: 'JP', kana: 'パンツァー', desc: 'Saturn · Con caja',
    price: 65, img: 'assets/img/panzer-dragoon-2.webp', w: 460, h: 410, fit: 'cover',
    bg: '#DFE7F2', circle: 'rgba(185,199,230,.9)', mbg: '#DFE7F2',
    long: 'El shooter sobre rieles más querido de la Saturn, en su edición japonesa original con caja.',
    incluye: ['Disco original', 'Caja'],
    estado: 'Usado · Buen estado'
  },
  {
    id: 'control-dreamcast', mpick: true, name: 'Control Dreamcast', cat: 'accesorio', platform: 'Dreamcast',
    region: 'JP', kana: 'コントローラ', desc: 'Original · Probado',
    price: 29, img: 'assets/img/control-dreamcast.webp', w: 480, h: 480, fit: 'round',
    bg: '#EDEFF3', circle: 'rgba(246,201,160,.9)', mbg: '#EDEFF3',
    long: 'Control oficial de Dreamcast, revisado botón por botón y con los gatillos analógicos calibrados.',
    incluye: ['Control original Sega (HKT-7700)'],
    estado: 'Usado · Muy buen estado'
  },
  {
    id: 'control-sega-saturn', name: 'Control Sega Saturn', cat: 'accesorio', platform: 'Sega Saturn',
    region: 'JP', kana: 'パッド', desc: 'Original · Probado',
    price: 27, oldPrice: 32, img: 'assets/img/control-saturn.webp', w: 561, h: 600, fit: 'photo',
    bg: '#F0EBE1', circle: 'rgba(228,220,203,.9)', mbg: '#F0EBE1',
    long: 'El control de Saturn considerado por muchos el mejor para juegos de pelea. Original y probado.',
    incluye: ['Control original Sega Saturn'],
    estado: 'Nuevo en empaque'
  },
  {
    id: 'memory-card-playstation', name: 'Memory card PlayStation', cat: 'accesorio', platform: 'PlayStation',
    region: 'JP', kana: 'メモリー', desc: '15 bloques · Original',
    price: 12, img: 'assets/img/memory-card.webp', w: 357, h: 560, fit: 'photo',
    bg: '#E6E6EA', circle: 'rgba(201,205,214,.9)', mbg: '#E6E6EA',
    long: 'Tarjeta de memoria de 15 bloques para guardar tus partidas de PlayStation.',
    incluye: ['Memory card de 15 bloques'],
    estado: 'Nuevo en empaque'
  }
];

window.TS_CATEGORIES = {
  consola: { label: 'CONSOLA · 本体', tab: 'Consolas' },
  juego: { label: 'JUEGO · ソフト', tab: 'Juegos' },
  accesorio: { label: 'ACCESORIO · 周辺機器', tab: 'Accesorios' }
};
