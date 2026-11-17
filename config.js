/* ─────────────────────────────────────────────────────────────
   CONFIGURACIÓN DE LA VINOTECA — lo único que se toca para cada cliente.
   (Los vinos se cargan en la planilla: vinos.csv o una Google Sheet publicada.)
   Para una vista rápida sin tocar nada: ?n=Nombre&b=Barrio&w=5491100000000&c=7a1f33
   ───────────────────────────────────────────────────────────── */
window.VINOTECA = {
  demo: true,                       // muestra la franja "Muestra de Tranquera Digital"
  nombre: 'Tu Vinoteca',            // va grande, como etiqueta
  barrio: 'Recoleta',
  direccion: 'Av. Ejemplo 1234',
  ciudad: 'Ciudad de Buenos Aires',
  mapa: 'https://www.google.com/maps/search/?api=1&query=Recoleta+Buenos+Aires',
  whatsapp: '5491100000000',        // celular con 549 adelante, sin espacios
  instagram: 'tuvinoteca',
  mail: 'hola@tuvinoteca.com.ar',
  horario: [['Lunes a sábado', '10 a 21 h'], ['Domingos', '11 a 15 h']],
  color: '#7a1f33',                 // el color de la marca (etiqueta, botones)
  desde: '',                        // año de apertura, si lo quieren mostrar

  // Planilla de vinos. Vacío = usa vinos.csv. Para Google Sheets:
  // Archivo → Compartir → Publicar en la web → CSV, y pegar el link acá.
  planilla: '',

  caja: { botellas: 6, descuento: 10 },        // % de descuento por caja completa (A CONFIRMAR con cada local)
  regalo: [                                    // envoltorios y su precio (A CONFIRMAR)
    ['Bolsa de regalo con moño', 0],
    ['Caja de cartón con viruta', 3500],
    ['Caja de madera con tapa', 12000],
  ],
  envios: [                                    // barrio, costo, cuándo llega (A CONFIRMAR)
    ['Recoleta', 0, 'en el día si pedís antes de las 17'],
    ['Barrio Norte', 0, 'en el día si pedís antes de las 17'],
    ['Retiro', 3000, 'en el día'],
    ['Palermo', 3500, 'en el día'],
    ['Almagro y Balvanera', 4000, 'al día siguiente'],
    ['Belgrano y Colegiales', 4500, 'al día siguiente'],
    ['Caballito y Villa Crespo', 4500, 'al día siguiente'],
    ['Núñez y Saavedra', 5500, 'al día siguiente'],
    ['Resto de CABA', null, 'lo coordinamos por WhatsApp'],
  ],
  envioGratisDesde: 60000,
  pagos: ['Efectivo', 'Transferencia', 'Mercado Pago', 'Tarjeta de débito o crédito'],
};
