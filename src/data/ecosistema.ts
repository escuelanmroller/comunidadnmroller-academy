const wa = (numero: string, mensaje: string) => `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;

const WA_NM = "5491165920600";
const WA_FLYFREE = "5491151097151";

export type ItemEcosistema = {
  id: string;
  titulo: string;
  descripcion: string;
  href: string;
  /** "interno" navega dentro de la app; "externo" abre otra pestaña. */
  tipo: "interno" | "externo";
  cta: string;
  icono: "instructor" | "comunidad" | "alquiler" | "venta" | "tienda" | "cursos" | "mastery" | "mentoria" | "empresa" | "franquicias" | "importacion";
};

export const ECOSISTEMA: ItemEcosistema[] = [
  {
    id: "instructor",
    titulo: "Instructor de Roller",
    descripcion: "Formación para enseñar patinaje con el método NM Roller.",
    href: "/academy",
    tipo: "interno",
    cta: "Ver programas",
    icono: "instructor",
  },
  {
    id: "comunidad",
    titulo: "NM Comunidad",
    descripcion: "Clases de patinaje, sedes y beneficios para la comunidad.",
    href: "https://comunidadnmroller.com",
    tipo: "externo",
    cta: "Conocer",
    icono: "comunidad",
  },
  {
    id: "alquiler",
    titulo: "Servicio de Alquiler de Roller",
    descripcion: "Alquilá el equipo en la sede y empezá sin comprar.",
    href: "https://comunidadnmroller.com/clases-de-rollers-mas-alquiler",
    tipo: "externo",
    cta: "Ver alquiler",
    icono: "alquiler",
  },
  {
    id: "venta",
    titulo: "Venta de Patines Fly Free",
    descripcion: "Asesoramiento para elegir tus patines y protecciones.",
    href: wa(WA_FLYFREE, "[ACADEMY-FF-VENTA] Hola! Vengo de NM Academy y quiero asesoramiento para elegir mis patines."),
    tipo: "externo",
    cta: "Consultar",
    icono: "venta",
  },
  {
    id: "tienda",
    titulo: "Fly Free Urban · Tienda",
    descripcion: "Tienda online de rollers, protecciones y accesorios.",
    href: "https://www.flyfreeurban.com",
    tipo: "externo",
    cta: "Ir a la tienda",
    icono: "tienda",
  },
  {
    id: "cursos",
    titulo: "Aprendé Patinando · Cursos Virtuales",
    descripcion: "Cursos online para aprender a patinar a tu ritmo.",
    href: "https://aprendepatinando.comunidadnmroller.com",
    tipo: "externo",
    cta: "Ver cursos",
    icono: "cursos",
  },
  {
    id: "mastery",
    titulo: "Roller Mastery · Academia de Instructores",
    descripcion: "Academia para formar instructores de roller.",
    href: wa(WA_NM, "[ACADEMY-MASTERY] Hola! Vengo de NM Academy y quiero info sobre Roller Mastery."),
    tipo: "externo",
    cta: "Consultar",
    icono: "mastery",
  },
  {
    id: "mentoria-comunicacion",
    titulo: "Mentoría de Comunicación",
    descripcion: "Mentoría para comunicar mejor tu proyecto.",
    href: wa(WA_NM, "[ACADEMY-MENTORIA-COM] Hola! Vengo de NM Academy y quiero info sobre la Mentoría de Comunicación."),
    tipo: "externo",
    cta: "Consultar",
    icono: "mentoria",
  },
  {
    id: "mentoria-360",
    titulo: "Mentoría 360 para Empresas",
    descripcion: "Acompañamiento integral para hacer crecer tu empresa.",
    href: wa(WA_NM, "[ACADEMY-MENTORIA-360] Hola! Vengo de NM Academy y quiero info sobre la Mentoría 360 para Empresas."),
    tipo: "externo",
    cta: "Consultar",
    icono: "empresa",
  },
  {
    id: "franquicias",
    titulo: "Franquicias NM Roller y Fly Free Urban",
    descripcion: "Sumate a la red y abrí tu propia sede.",
    href: wa(WA_NM, "[ACADEMY-FRANQUICIAS] Hola! Vengo de NM Academy y quiero info sobre las franquicias."),
    tipo: "externo",
    cta: "Consultar",
    icono: "franquicias",
  },
  {
    id: "importacion",
    titulo: "Servicio de Importación de Marcas",
    descripcion: "Consultanos por importación de marcas de patinaje.",
    href: wa(WA_NM, "[ACADEMY-IMPORTACION] Hola! Vengo de NM Academy y quiero info sobre el servicio de importación de marcas."),
    tipo: "externo",
    cta: "Consultar",
    icono: "importacion",
  },
];

// Para sumar más contenido a la pantalla final alcanza con agregar elementos acá.
// Sin videos por ahora: la sección "Mirá lo que hacemos" se oculta sola cuando no hay nada para mostrar.
// Formato: { titulo: "...", youtubeId: "..." }. (El video "Ruta de Aprendizaje NM Roller" era RZd_UWVEx74.)
export const VIDEOS: { titulo: string; youtubeId: string }[] = [];

export const NOTAS_TV: { titulo: string; medio?: string; url: string }[] = [];

export const WEB_PERSONAL: { titulo: string; url: string } | null = null;

export const INSTAGRAMS = [
  { usuario: "@roller_nm", url: "https://www.instagram.com/roller_nm/" },
  { usuario: "@flyfreeurban", url: "https://www.instagram.com/flyfreeurban/" },
];
