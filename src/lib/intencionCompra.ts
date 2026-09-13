// Intención de compra — puente entre el CTA de precios y /pago-confirmado.
//
// Los links de Mercado Pago (mpago.la) no arrastran el querystring hasta el
// back_url, así que `?plan=…&origen=…` se pierde en el viaje de ida y vuelta.
// Guardamos la intención acá antes de redirigir y la recuperamos al volver.

const KEY = "nm_intencion_compra";
const TTL_MS = 6 * 60 * 60 * 1000; // 6 h: cubre un pago demorado sin ensuciar visitas futuras

export type Origen = "nm" | "clases-alquiler";

export type IntencionCompra = {
  plan: string;
  origen: Origen;
};

export const guardarIntencionCompra = (intencion: IntencionCompra) => {
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...intencion, ts: Date.now() }));
  } catch {
    // Modo incógnito o storage lleno: seguimos igual, /pago-confirmado usa sus defaults.
  }
};

export const leerIntencionCompra = (): IntencionCompra | null => {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const { plan, origen, ts } = JSON.parse(raw);
    if (!ts || Date.now() - ts > TTL_MS) {
      localStorage.removeItem(KEY);
      return null;
    }
    if (origen !== "nm" && origen !== "clases-alquiler") return null;
    return { plan: typeof plan === "string" ? plan : "", origen };
  } catch {
    return null;
  }
};

export const limpiarIntencionCompra = () => {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // no-op
  }
};
