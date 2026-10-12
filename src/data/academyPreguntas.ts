import {
  ETIQUETAS_RESPUESTAS,
  OPCIONES_CONOCISTE,
  OPCIONES_COSTO,
  OPCIONES_PRESUPUESTO,
  OPCIONES_REINVERTIRIA,
  OPCIONES_UTILIDAD,
} from "./academy";

export type TipoPregunta = "text" | "email" | "tel" | "number" | "textarea" | "opciones" | "multi" | "escala" | "anio";

export type Pregunta = {
  id?: string;
  clave: string;
  etiqueta: string;
  tipo: TipoPregunta;
  opciones: string[];
  requerida: boolean;
  placeholder: string | null;
  paso: number;
  paso_titulo: string;
  paso_bajada: string | null;
  orden: number;
  /** Las "fijas" se guardan en columnas de la tabla: no se pueden quitar ni cambiar de clave. */
  fija: boolean;
  activa: boolean;
};

export type Campo = {
  key: string;
  label: string;
  tipo: TipoPregunta;
  requerido?: boolean;
  placeholder?: string;
  opciones?: string[];
};

export type Paso = { titulo: string; bajada?: string; campos: Campo[] };

export const TIPOS_LABEL: Record<TipoPregunta, string> = {
  text: "Texto corto",
  textarea: "Texto largo (desarrollo)",
  opciones: "Elegir una opción",
  multi: "Selección múltiple",
  escala: "Escala (botones 1 a 5)",
  anio: "Año (lista desplegable)",
  number: "Número",
  email: "Email",
  tel: "Teléfono / WhatsApp",
};

/** Tipos que se pueden elegir al crear una pregunta nueva. */
export const TIPOS_NUEVA: TipoPregunta[] = ["text", "textarea", "opciones", "multi", "escala", "anio", "number"];

export const TIPOS_CON_OPCIONES: TipoPregunta[] = ["opciones", "multi", "escala"];

/** Preguntas fijas cuyo tipo se puede cambiar (el resto queda atado a su validación). */
export const FIJAS_TIPO_EDITABLE: Record<string, TipoPregunta[]> = {
  anos_patinando: ["text", "opciones", "anio"],
};

/** Preguntas fijas cuya obligatoriedad no se puede sacar (la base las necesita). */
export const FIJAS_OBLIGATORIAS = ["nombre_apellido", "email", "whatsapp", "pais_ciudad", "edad"];

export const anosDisponibles = (): string[] => {
  const actual = new Date().getFullYear();
  return Array.from({ length: actual - 1969 }, (_, i) => String(actual - i));
};

const L = (k: string) => ETIQUETAS_RESPUESTAS[k];

type Def = [clave: string, etiqueta: string, tipo: TipoPregunta, extra?: Partial<Pregunta>];

const PASOS_DEF: { titulo: string; bajada?: string; preguntas: Def[] }[] = [
  {
    titulo: "Empecemos por vos",
    bajada: "Con estos datos te vamos a contactar.",
    preguntas: [
      ["nombre_apellido", "Nombre y apellido", "text", { requerida: true, fija: true, placeholder: "Ej: Juan Pérez" }],
      ["email", "Email", "email", { requerida: true, fija: true, placeholder: "juan@email.com" }],
      ["whatsapp", "WhatsApp (con código de tu país)", "tel", { requerida: true, fija: true, placeholder: "+54 9 11 1234 5678" }],
    ],
  },
  {
    titulo: "¿De dónde sos?",
    preguntas: [
      ["pais_ciudad", "País y ciudad", "text", { requerida: true, fija: true, placeholder: "Buenos Aires, Argentina" }],
      ["edad", "Edad", "number", { requerida: true, fija: true, placeholder: "30" }],
      ["instagram", "Instagram (opcional)", "text", { fija: true, placeholder: "@usuario" }],
    ],
  },
  {
    titulo: "Tu camino en el patín",
    preguntas: [
      ["anos_patinando", "¿Hace cuánto tiempo patinás?", "text", { fija: true, placeholder: "Ej: 5 años" }],
      ["costo_aprender", L("costo_aprender"), "opciones", { opciones: OPCIONES_COSTO }],
      ["como_me_conociste", "¿Cómo me conociste? (podés marcar más de una)", "multi", { fija: true, opciones: OPCIONES_CONOCISTE }],
    ],
  },
  {
    titulo: "Tu nivel",
    preguntas: [
      ["nivel", L("nivel"), "textarea", { requerida: true, placeholder: "Ej: intermedio, me interesa freestyle y slalom" }],
      ["experiencia", L("experiencia"), "textarea"],
      ["frecuencia_practica", L("frecuencia_practica"), "text", { placeholder: "Ej: 3 veces por semana" }],
    ],
  },
  {
    titulo: "Tu motivación",
    preguntas: [
      ["motivacion", L("motivacion"), "textarea", { requerida: true }],
      ["otros_objetivos", L("otros_objetivos"), "textarea"],
      ["frase_identidad", L("frase_identidad"), "text"],
    ],
  },
  {
    titulo: "Cómo enseñarías",
    bajada: "Contanos cómo actuarías en una clase real.",
    preguntas: [
      ["alumno_miedo", L("alumno_miedo"), "textarea"],
      ["ritmos_aprendizaje", L("ritmos_aprendizaje"), "textarea"],
      ["caida_alumno", L("caida_alumno"), "textarea"],
    ],
  },
  {
    titulo: "Tu compromiso",
    preguntas: [
      ["manejo_frustracion", L("manejo_frustracion"), "textarea"],
      ["tiempo_tecnicas", L("tiempo_tecnicas"), "textarea"],
      ["mantenerse_informado", L("mantenerse_informado"), "textarea"],
    ],
  },
  {
    titulo: "Tu futuro como instructor",
    preguntas: [
      ["importancia_equipo", L("importancia_equipo"), "textarea"],
      ["invertir_futuro", L("invertir_futuro"), "textarea"],
      ["mensaje_yo_18", L("mensaje_yo_18"), "text"],
    ],
  },
  {
    titulo: "Tu inversión",
    preguntas: [
      ["presupuesto", L("presupuesto"), "opciones", { requerida: true, opciones: OPCIONES_PRESUPUESTO }],
      ["reinvertiria", L("reinvertiria"), "opciones", { opciones: OPCIONES_REINVERTIRIA }],
      ["utilidad_encuesta", L("utilidad_encuesta"), "escala", { opciones: OPCIONES_UTILIDAD }],
    ],
  },
];

/** Preguntas de origen: se usan si la base no responde, y son la semilla de la tabla `academy_preguntas`. */
export const PREGUNTAS_DEFAULT: Pregunta[] = PASOS_DEF.flatMap((p, i) =>
  p.preguntas.map(([clave, etiqueta, tipo, extra], j) => ({
    clave,
    etiqueta,
    tipo,
    opciones: [],
    requerida: false,
    placeholder: null,
    fija: false,
    activa: true,
    ...extra,
    paso: i + 1,
    paso_titulo: p.titulo,
    paso_bajada: p.bajada ?? null,
    orden: j + 1,
  })),
);

export const ordenarPreguntas = (preguntas: Pregunta[]) =>
  [...preguntas].sort((a, b) => a.paso - b.paso || a.orden - b.orden);

/** Agrupa las preguntas activas en pasos para el formulario. */
export const armarPasos = (preguntas: Pregunta[]): Paso[] => {
  const pasos = new Map<number, Paso>();
  ordenarPreguntas(preguntas.filter((p) => p.activa)).forEach((p) => {
    if (!pasos.has(p.paso)) pasos.set(p.paso, { titulo: p.paso_titulo, bajada: p.paso_bajada ?? undefined, campos: [] });
    pasos.get(p.paso)!.campos.push({
      key: p.clave,
      label: p.etiqueta,
      tipo: p.tipo,
      requerido: p.requerida,
      placeholder: p.placeholder ?? undefined,
      opciones: p.opciones,
    });
  });
  return [...pasos.entries()].sort((a, b) => a[0] - b[0]).map(([, paso]) => paso);
};
