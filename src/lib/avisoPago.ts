// Tiempo mínimo que se muestra el aviso "volvé a esta web después de pagar"
// antes de saltar a Mercado Pago (ver AvisoVolverDelPago).
export const AVISO_PAGO_MS = 3000;

export const esperarAvisoPago = () => new Promise<void>((resolve) => setTimeout(resolve, AVISO_PAGO_MS));
