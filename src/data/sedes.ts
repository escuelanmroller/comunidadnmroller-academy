export interface ClaseSede {
  dia: string;
  hora: string;
  disciplina: string;
}

export interface Sede {
  id: string;
  nombre: string;
  direccion: string;
  area: string;
  lat: number;
  lng: number;
  mapsUrl: string;
  alquiler?: boolean;
  // Si alquiler=true y esto está definido, el alquiler solo aplica esos días
  // (excepción puntual, ej. Vicente López). Sin definir = todos los días de la sede.
  alquilerDias?: string[];
  // Excepción más fina que alquilerDias: el alquiler aplica solo en estos turnos
  // puntuales, no en todo el día (ej. Rosedal, donde depende del profe de cada
  // turno). Si está definido, tiene prioridad sobre alquilerDias.
  alquilerHorarios?: { dia: string; hora: string }[];
  clases: ClaseSede[];
}

// Etiqueta unificada para los 3 niveles (según flyer Diciembre 2025)
export const NIVEL_UNIFICADO = "Inicial · Princip. · Inter.";

// Niveles separados: Inicial por un lado, Principiante + Intermedio unificados por otro
export const NIVEL_INICIAL = "Inicial";
export const NIVEL_PRINCIP_INTER = "Princip. · Inter.";

// Expande una disciplina en los badges a mostrar.
// Si es el nivel unificado, devuelve los dos badges de nivel separados.
export const expandirNivel = (disciplina?: string): string[] => {
  if (!disciplina) return [];
  if (disciplina === NIVEL_UNIFICADO) return [NIVEL_INICIAL, NIVEL_PRINCIP_INTER];
  return [disciplina];
};

// Coordenadas aproximadas de cada sede en CABA / GBA Norte
export const sedes: Sede[] = [
  {
    id: "rosedal",
    nombre: "Rosedal Palermo",
    direccion: "Infanta Isabel 555, Palermo",
    area: "CABA",
    lat: -34.5736,
    lng: -58.4156,
    mapsUrl: "https://maps.app.goo.gl/wsKfFUGqciPhAbup7",
    alquiler: true,
    // El alquiler acá va por turno, no por día: en jueves y sábado hay clases
    // a otras horas que no tienen el servicio.
    alquilerHorarios: [
      { dia: "Miércoles", hora: "19:00" },
      { dia: "Jueves", hora: "19:00" },
      { dia: "Sábado", hora: "10:00" },
      { dia: "Sábado", hora: "18:00" },
    ],
    clases: [
      { dia: "Martes", hora: "09:00", disciplina: NIVEL_UNIFICADO },
      { dia: "Martes", hora: "18:00", disciplina: "KIDS" },
      { dia: "Martes", hora: "19:00", disciplina: NIVEL_UNIFICADO },
      { dia: "Martes", hora: "20:00", disciplina: "Slalom" },
      { dia: "Miércoles", hora: "19:00", disciplina: NIVEL_UNIFICADO },
      { dia: "Jueves", hora: "18:00", disciplina: "KIDS" },
      { dia: "Jueves", hora: "19:00", disciplina: NIVEL_UNIFICADO },
      { dia: "Jueves", hora: "19:00", disciplina: "Slalom" },
      { dia: "Jueves", hora: "20:00", disciplina: "Rampas" },
      { dia: "Sábado", hora: "10:00", disciplina: NIVEL_UNIFICADO },
      { dia: "Sábado", hora: "17:00", disciplina: "Slalom" },
      { dia: "Sábado", hora: "18:00", disciplina: NIVEL_UNIFICADO },
      { dia: "Sábado", hora: "19:00", disciplina: "Frenadas" },
      { dia: "Domingo", hora: "10:00", disciplina: NIVEL_UNIFICADO },
    ],
  },
  {
    id: "puerto-madero",
    nombre: "Puerto Madero",
    direccion: "Juana Manso y Martha Lynch",
    area: "CABA",
    lat: -34.6118,
    lng: -58.3631,
    mapsUrl: "https://maps.app.goo.gl/QKdHNpXbNSwK9yRh9",
    alquiler: true,
    // Alquiler solo los martes (con Vladi) — el sábado da clase Andy, que no ofrece el servicio.
    alquilerDias: ["Martes"],
    clases: [
      { dia: "Martes", hora: "18:00", disciplina: NIVEL_UNIFICADO },
      { dia: "Martes", hora: "19:00", disciplina: NIVEL_UNIFICADO },
      { dia: "Martes", hora: "19:00", disciplina: "Slalom" },
      { dia: "Sábado", hora: "10:00", disciplina: NIVEL_UNIFICADO },
      { dia: "Sábado", hora: "11:00", disciplina: "Urbano" },
    ],
  },
  {
    id: "caballito",
    nombre: "Caballito (P. Rivadavia)",
    direccion: "Monumento a Bolívar, Parque Rivadavia",
    area: "CABA",
    lat: -34.6189,
    lng: -58.4359,
    mapsUrl: "https://maps.app.goo.gl/PoyVBEq58EbUdtM59",
    alquiler: true,
    // Alquiler solo en estos 2 turnos puntuales (Lunes y Martes 19h) — el resto
    // de los horarios de la sede no tiene el servicio.
    alquilerHorarios: [
      { dia: "Lunes", hora: "19:00" },
      { dia: "Martes", hora: "19:00" },
    ],
    clases: [
      { dia: "Lunes", hora: "19:00", disciplina: NIVEL_UNIFICADO },
      { dia: "Lunes", hora: "20:00", disciplina: "Frenadas" },
      { dia: "Martes", hora: "19:00", disciplina: NIVEL_UNIFICADO },
      { dia: "Martes", hora: "20:00", disciplina: "Urbano" },
      { dia: "Martes", hora: "20:00", disciplina: "Frenadas" },
      { dia: "Jueves", hora: "19:00", disciplina: NIVEL_UNIFICADO },
      { dia: "Jueves", hora: "20:00", disciplina: "Frenadas" },
      { dia: "Domingo", hora: "09:00", disciplina: NIVEL_UNIFICADO },
      { dia: "Domingo", hora: "09:00", disciplina: "Urbano" },
      { dia: "Domingo", hora: "10:00", disciplina: NIVEL_UNIFICADO },
    ],
  },
  {
    id: "vicente-lopez",
    nombre: "Vicente López",
    direccion: "Playón Río Vicente López",
    area: "GBA Norte",
    lat: -34.5158,
    lng: -58.4699,
    mapsUrl: "https://maps.app.goo.gl/spbof6ndxcJgAog56",
    alquiler: true,
    // Alquiler solo sábado — el miércoles no ofrece el servicio.
    alquilerDias: ["Sábado"],
    clases: [
      { dia: "Miércoles", hora: "19:00", disciplina: NIVEL_UNIFICADO },
      { dia: "Sábado", hora: "09:00", disciplina: NIVEL_UNIFICADO },
      { dia: "Sábado", hora: "09:00", disciplina: "Slalom" },
    ],
  },
  {
    id: "belgrano",
    nombre: "Belgrano (Pista para patinar)",
    direccion: "Castañeda 2020",
    area: "CABA",
    lat: -34.5502288,
    lng: -58.4381483,
    mapsUrl: "https://maps.app.goo.gl/dsH8yNW1eVqrGhLFA",
    clases: [
      { dia: "Miércoles", hora: "19:00", disciplina: NIVEL_UNIFICADO },
      { dia: "Viernes", hora: "18:00", disciplina: "Slalom" },
      { dia: "Viernes", hora: "19:00", disciplina: NIVEL_UNIFICADO },
    ],
  },
  {
    id: "belgrano-skate-park",
    nombre: "Belgrano Converse Park",
    direccion: "Castañeda 2020, CABA",
    area: "CABA",
    lat: -34.5507951,
    lng: -58.4386438,
    mapsUrl: "https://maps.app.goo.gl/sgrKxCFS1yX5PaLv6",
    clases: [
      { dia: "Miércoles", hora: "20:00", disciplina: "Rampas" },
      { dia: "Viernes", hora: "20:00", disciplina: "Rampas" },
    ],
  },
  {
    id: "villa-luro",
    nombre: "Villa Luro",
    direccion: "Av. Rivadavia 9300",
    area: "CABA",
    lat: -34.6385,
    lng: -58.5012,
    mapsUrl: "https://maps.app.goo.gl/Q1jrrWT8Rcvr7xR58",
    clases: [
      { dia: "Jueves", hora: "19:00", disciplina: NIVEL_UNIFICADO },
      { dia: "Jueves", hora: "20:00", disciplina: "Skatepark" },
    ],
  },
  {
    id: "colegiales",
    nombre: "Colegiales",
    direccion: "Plaza Clemente",
    area: "CABA",
    lat: -34.5816669,
    lng: -58.4441793,
    mapsUrl: "https://maps.app.goo.gl/kDamFzD1s24roMmm7",
    alquiler: true,
    // Alquiler solo Viernes 19h (reactivado 16-sep-2026) — no en el otro
    // turno del viernes (20h Frenadas, disciplina especial) ni en Miércoles.
    alquilerHorarios: [{ dia: "Viernes", hora: "19:00" }],
    clases: [
      { dia: "Miércoles", hora: "19:00", disciplina: NIVEL_UNIFICADO },
      { dia: "Viernes", hora: "19:00", disciplina: NIVEL_UNIFICADO },
      { dia: "Viernes", hora: "20:00", disciplina: "Frenadas" },
      { dia: "Miércoles", hora: "20:00", disciplina: "Slalom Inicial" },
    ],
  },
  {
    id: "plaza-la-pampa",
    nombre: "Plaza La Pampa",
    direccion: "Av. Gaona y Gavilán",
    area: "CABA",
    lat: -34.6131,
    lng: -58.4630,
    mapsUrl: "https://maps.app.goo.gl/n3egc4dPJRSDRCPG7",
    alquiler: true,
    clases: [
      { dia: "Sábado", hora: "09:00", disciplina: NIVEL_UNIFICADO },
      { dia: "Domingo", hora: "09:00", disciplina: NIVEL_UNIFICADO },
    ],
  },
  {
    id: "devoto",
    nombre: "Devoto",
    direccion: "Plaza Arenales",
    area: "CABA",
    lat: -34.5985,
    lng: -58.5099,
    mapsUrl: "https://maps.app.goo.gl/45fnmEEHSHPAu4gg7",
    alquiler: true,
    clases: [
      { dia: "Martes", hora: "19:00", disciplina: NIVEL_UNIFICADO },
      { dia: "Viernes", hora: "19:00", disciplina: NIVEL_UNIFICADO },
    ],
  },
  {
    id: "villa-real",
    nombre: "Villa Real",
    direccion: "Plaza Las Toscaneras",
    area: "CABA",
    lat: -34.6204,
    lng: -58.5247,
    mapsUrl: "https://maps.app.goo.gl/mxt7d3g3SUkRtkms7",
    alquiler: true,
    clases: [
      { dia: "Miércoles", hora: "18:00", disciplina: NIVEL_UNIFICADO },
      { dia: "Miércoles", hora: "19:00", disciplina: NIVEL_UNIFICADO },
      { dia: "Sábado", hora: "10:30", disciplina: NIVEL_UNIFICADO },
      { dia: "Sábado", hora: "11:30", disciplina: "Urbano" },
      { dia: "Sábado", hora: "11:30", disciplina: "Slalom Inicial" },
    ],
  },
  {
    id: "facultad-medicina",
    nombre: "Facultad de Medicina",
    direccion: "Paraguay 2155, Recoleta",
    area: "CABA",
    lat: -34.598356,
    lng: -58.3982251,
    mapsUrl: "https://maps.app.goo.gl/VtfkVCWiwq3Ewjk8A",
    alquiler: true,
    // Alquiler solo domingo (con Rondina Guillermo) — el viernes da clase Charly, que no ofrece el servicio.
    alquilerDias: ["Domingo"],
    clases: [
      { dia: "Viernes", hora: "19:00", disciplina: NIVEL_UNIFICADO },
      { dia: "Domingo", hora: "10:00", disciplina: NIVEL_UNIFICADO },
    ],
  },
];

export const ordenDias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

// Única fuente de verdad de "esta clase puntual incluye alquiler de equipo".
// Sin alquilerHorarios ni alquilerDias, vale para todas las clases de la sede.
export const claseTieneAlquiler = (sede: Sede, clase: ClaseSede): boolean => {
  if (!sede.alquiler) return false;
  if (sede.alquilerHorarios?.length) {
    return sede.alquilerHorarios.some((h) => h.dia === clase.dia && h.hora === clase.hora);
  }
  if (sede.alquilerDias?.length) return sede.alquilerDias.includes(clase.dia);
  return true;
};

const listarDias = (dias: string[]) =>
  dias.length <= 1
    ? (dias[0] ?? "").toLowerCase()
    : `${dias.slice(0, -1).join(", ")} y ${dias[dias.length - 1]}`.toLowerCase();

// Cruza las clases que una página REALMENTE muestra contra las reglas de
// alquiler de la sede. Hace falta porque SportClub sobrescribe los horarios de
// cada sede: decir "Alquiler disponible" mirando solo `sede.alquiler`, sin ver
// QUÉ horarios se están listando, manda socios a un turno que no tiene servicio
// (ej. Vicente López miércoles). Devuelve `hay: false` si ninguno de los
// horarios mostrados tiene alquiler, y un `resumen` para el chip.
export const alquilerEnClases = (sede: Sede, clases: ClaseSede[] = sede.clases) => {
  const con = sede.alquiler ? clases.filter((c) => claseTieneAlquiler(sede, c)) : [];
  if (con.length === 0) return { hay: false, resumen: null as string | null };
  if (con.length === clases.length) return { hay: true, resumen: null as string | null };
  // Solo se pueden nombrar los días en los que TODOS los turnos mostrados tienen
  // alquiler; si un día queda a medias, nombrarlo sería mentir.
  const diasCompletos = ordenDias.filter((d) => {
    const delDia = clases.filter((c) => c.dia === d);
    return delDia.length > 0 && delDia.every((c) => claseTieneAlquiler(sede, c));
  });
  const cubiertos = clases.filter((c) => diasCompletos.includes(c.dia)).length;
  return {
    hay: true,
    resumen: cubiertos === con.length ? listarDias(diasCompletos) : "algunos horarios",
  };
};

// Ordena las clases de cada sede por día (Lunes→Domingo) y dentro del día por hora ascendente.
sedes.forEach((s) => {
  s.clases.sort((a, b) => {
    const d = ordenDias.indexOf(a.dia) - ordenDias.indexOf(b.dia);
    if (d !== 0) return d;
    return a.hora.localeCompare(b.hora);
  });
});

export const disciplinaColor: Record<string, string> = {
  Slalom: "rounded-none bg-primary/15 text-primary border border-primary/50",
  "Slalom Inicial": "rounded-none bg-primary/15 text-primary border border-primary/50",
  Frenadas: "rounded-none bg-primary/10 text-primary border border-primary/40 border-dashed",
  Urbano: "rounded-none bg-muted text-foreground border border-border",
  Skatepark: "rounded-none bg-amber-500/15 text-amber-300 border border-amber-500/50",
  Rampas: "rounded-none bg-amber-500/25 text-amber-200 border border-amber-500/70",
  KIDS: "rounded-none bg-violet-500/15 text-violet-300 border border-violet-500/50",
  // Niveles: pills redondeados que resaltan, cada uno con su color
  [NIVEL_INICIAL]: "rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/70 font-extrabold",
  [NIVEL_PRINCIP_INTER]: "rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/70 font-extrabold",
  [NIVEL_UNIFICADO]: "rounded-full bg-secondary/40 text-secondary-foreground border border-secondary/70",
};
