export interface Masterclass {
  slug: string;
  sede: string;
  sedeCorta: string;
  fechaISO: string; // ISO date for ordering
  fechaLabel: string; // e.g. "Sábado 28 de Junio"
  hora: string; // e.g. "15 hs"
  ventaHasta: string; // ISO date when ticket sales close → triggers waitlist redirect
  cupos: number; // capacidad total del encuentro (no hay tracking en vivo de vendidos)
  earlyBirdHasta: string; // ISO date — hasta acá (inclusive) rige el precio "earlyBird"
  direccion: string;
  mapsUrl: string;
  whatsappUrl: string;
  // Números crudos (no strings formateados) — la Edge Function
  // crear-preferencia-pago espera exactamente estos mismos valores para
  // cada slug/tramo; si se cambia un precio acá hay que actualizarla
  // también (no puede importar este archivo, corre en otro runtime/deploy).
  precios: {
    earlyBird: { general: number; alumnos: number };
    regular: { general: number; alumnos: number };
  };
}

const formatArs = (n: number) => `$${n.toLocaleString("es-AR")}`;

// Precio y % de descuento realmente vigentes "hoy" para una Masterclass,
// según si ya se pasó earlyBirdHasta o no. Usar esto en vez de leer
// mc.precios directamente en cualquier componente que muestre precios.
export const precioVigente = (mc: Masterclass) => {
  const esEarlyBird = Date.now() <= new Date(mc.earlyBirdHasta).getTime();
  const tier = esEarlyBird ? mc.precios.earlyBird : mc.precios.regular;
  const descuentoPct = Math.round((1 - tier.alumnos / tier.general) * 100);
  return {
    esEarlyBird,
    general: formatArs(tier.general),
    alumnos: formatArs(tier.alumnos),
    generalNum: tier.general,
    alumnosNum: tier.alumnos,
    descuentoPct,
  };
};

export const masterclasses: Masterclass[] = [
  {
    slug: "puerto-madero",
    sede: "Puerto Madero",
    sedeCorta: "Puerto Madero",
    fechaISO: "2026-08-17T15:00:00-03:00",
    fechaLabel: "Lunes 17 de Agosto",
    hora: "15 hs",
    ventaHasta: "2026-08-15T12:00:00-03:00",
    cupos: 40,
    earlyBirdHasta: "2026-08-15T12:00:00-03:00", // evento cerrado, sin tramo regular real
    direccion: "Juana Manso y Martha Lynch, Puerto Madero",
    mapsUrl: "https://maps.app.goo.gl/QKdHNpXbNSwK9yRh9",
    whatsappUrl: "https://wa.link/7vfiie",
    precios: {
      earlyBird: { general: 29000, alumnos: 20000 },
      regular: { general: 29000, alumnos: 20000 },
    },
  },
  {
    // TODO confirmar con Gumercindo: precios (se copiaron de la edición de
    // agosto como default provisorio — no vino especificado). Hora ya confirmada: 14hs.
    slug: "puerto-madero-27-septiembre",
    sede: "Puerto Madero",
    sedeCorta: "Puerto Madero",
    fechaISO: "2026-09-27T14:00:00-03:00",
    fechaLabel: "Domingo 27 de Septiembre",
    hora: "14 hs",
    ventaHasta: "2026-09-25T23:59:59-03:00", // medianoche del viernes 25-sep
    cupos: 40,
    earlyBirdHasta: "2026-09-20T23:59:59-03:00", // el 20-sep incluido es el último día del precio Early Bird
    direccion: "Olga Cossettini 1000, Puerto Madero",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Olga+Cossettini+1000%2C+Buenos+Aires",
    whatsappUrl:
      "https://wa.me/5491165920600?text=" +
      encodeURIComponent(
        "[LP-MC-NM] Hola! Quiero reservar mi lugar en la Masterclass del 27 de septiembre en Puerto Madero.",
      ),
    precios: {
      earlyBird: { general: 29000, alumnos: 20000 },
      regular: { general: 35000, alumnos: 25000 },
    },
  },
];

export const getMasterclass = (slug?: string): Masterclass | undefined => {
  if (!slug) return getProximaMasterclass();
  return masterclasses.find((m) => m.slug === slug);
};

export const getProximaMasterclass = (): Masterclass => {
  const ahora = Date.now();
  // Una masterclass se promociona hasta que cierra su venta (ventaHasta).
  // Al cerrar, todas las promos del sitio (banner, popup, footer, redirect)
  // pasan automáticamente a la siguiente.
  const vigentes = masterclasses
    .filter((m) => new Date(m.ventaHasta).getTime() > ahora)
    .sort((a, b) => a.fechaISO.localeCompare(b.fechaISO));
  return vigentes[0] ?? masterclasses[masterclasses.length - 1];
};
