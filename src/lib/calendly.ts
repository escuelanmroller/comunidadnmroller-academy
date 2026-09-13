// URL del calendario de pago presencial, con atribución por UTM.
//
// El formulario de Calendly ya pregunta "Agendaste turno vía...", pero eso es lo que la
// persona declara. Los UTM registran desde qué página del sitio abrió el calendario, que
// es un dato distinto y objetivo. Calendly los guarda en el campo `tracking` del invitado.
//
// OJO con el alcance: esto solo cubre a quien abre el calendario desde el sitio. Quien
// llega por WhatsApp o por el link directo no va a tener UTM nunca — para esos casos la
// respuesta declarada sigue siendo la única fuente. No son sustitutos.

const BASE = 'https://calendly.com/nmroller/beneficio-pago-efectivo';

export type UbicacionCalendly = 'planes-home' | 'clases-alquiler';

export const calendlyUrl = (ubicacion: UbicacionCalendly) =>
  `${BASE}?utm_source=sitio&utm_medium=popup&utm_campaign=${ubicacion}`;
