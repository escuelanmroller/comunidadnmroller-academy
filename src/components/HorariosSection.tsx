import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Clock, Wrench, Package, ArrowRight, X, CalendarSearch, Info } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import AlquilerSedesGrid from "@/components/alquiler/AlquilerSedesGrid";
import { NIVEL_UNIFICADO, NIVEL_INICIAL, NIVEL_PRINCIP_INTER, expandirNivel } from "@/data/sedes";
import SugerenciaTrigger from "@/components/sugerencias/SugerenciaTrigger";
// ── Tipos ──
interface ClaseEnriquecida {
  sede: string;
  hora: string;
  disciplina?: string;
}

// Niveles (pills redondeados que resaltan) y disciplinas técnicas (sharp, rojo/amber)
const badgeStyles: Record<string, string> = {
  [NIVEL_INICIAL]: "rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/70 font-extrabold",
  [NIVEL_PRINCIP_INTER]: "rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/70 font-extrabold",
  [NIVEL_UNIFICADO]: "rounded-full bg-secondary/40 text-secondary-foreground border border-secondary/70",
  Slalom: "rounded-none bg-primary/15 text-primary border border-primary/50",
  "Slalom Inicial": "rounded-none bg-primary/15 text-primary border border-primary/50",
  Frenadas: "rounded-none bg-primary/10 text-primary border border-primary/40 border-dashed",
  Urbano: "rounded-none bg-muted text-foreground border border-border",
  Skatepark: "rounded-none bg-amber-500/15 text-amber-300 border border-amber-500/50",
  Rampas: "rounded-none bg-amber-500/25 text-amber-200 border border-amber-500/70",
  KIDS: "rounded-none bg-violet-500/15 text-violet-300 border border-violet-500/50",
};

const badgeDescriptions: Record<string, string> = {
  [NIVEL_INICIAL]: "Desde cero: tu primera vez sobre rollers, sin experiencia previa.",
  [NIVEL_PRINCIP_INTER]: "Principiante e Intermedio: ya tenés base y querés seguir mejorando.",
  [NIVEL_UNIFICADO]: "Accedés con cualquier nivel: desde cero (Inicial) hasta Principiante e Intermedio.",
  "Slalom": "Técnica y flow entre conos para dominar cada movimiento.",
  "Slalom Inicial": "Primeros pasos en slalom: conos más separados y ritmo pausado.",
  "Frenadas": "Control total: aprendé a frenar seguro y moverte con confianza.",
  "Skatepark": "Desafío, adrenalina y nuevos trucos en un entorno distinto.",
  "Rampas": "Subidas, bajadas y saltos para llevar tu nivel al siguiente paso.",
  "Urbano": "La ciudad como pista: aprendé a moverte con seguridad real.",
  "KIDS": "Clases pensadas para los más chicos, a su ritmo y con juego.",
};

// ── Horarios enriquecidos con disciplina (Diciembre 2025) ──
const horarios: Record<string, ClaseEnriquecida[]> = {
  Lunes: [
    { sede: "P. Rivadavia", hora: "19:00", disciplina: NIVEL_UNIFICADO },
    { sede: "P. Rivadavia", hora: "20:00", disciplina: "Frenadas" },
  ],
  Martes: [
    { sede: "P. Rivadavia", hora: "19:00", disciplina: NIVEL_UNIFICADO },
    { sede: "Devoto", hora: "19:00", disciplina: NIVEL_UNIFICADO },
    { sede: "Puerto Madero", hora: "18:00", disciplina: NIVEL_UNIFICADO },
    { sede: "Puerto Madero", hora: "19:00", disciplina: NIVEL_UNIFICADO },
    { sede: "Rosedal Palermo", hora: "09:00", disciplina: NIVEL_UNIFICADO },
    { sede: "Rosedal Palermo", hora: "18:00", disciplina: "KIDS" },
    { sede: "Rosedal Palermo", hora: "19:00", disciplina: NIVEL_UNIFICADO },
    { sede: "Puerto Madero", hora: "19:00", disciplina: "Slalom" },
    { sede: "Rosedal Palermo", hora: "20:00", disciplina: "Slalom" },
    { sede: "P. Rivadavia", hora: "20:00", disciplina: "Urbano" },
    { sede: "P. Rivadavia", hora: "20:00", disciplina: "Frenadas" },
  ],
  Miércoles: [
    { sede: "Villa Real", hora: "18:00", disciplina: NIVEL_UNIFICADO },
    { sede: "Villa Real", hora: "19:00", disciplina: NIVEL_UNIFICADO },
    { sede: "Belgrano", hora: "19:00", disciplina: NIVEL_UNIFICADO },
    { sede: "Colegiales", hora: "19:00", disciplina: NIVEL_UNIFICADO },
    { sede: "Colegiales", hora: "20:00", disciplina: "Slalom Inicial" },
    { sede: "Rosedal Palermo", hora: "19:00", disciplina: NIVEL_UNIFICADO },
    { sede: "Belgrano Converse Park", hora: "20:00", disciplina: "Rampas" },
    { sede: "Vicente López", hora: "19:00", disciplina: NIVEL_UNIFICADO },
  ],
  Jueves: [
    { sede: "P. Rivadavia", hora: "19:00", disciplina: NIVEL_UNIFICADO },
    { sede: "Rosedal Palermo", hora: "18:00", disciplina: "KIDS" },
    { sede: "Rosedal Palermo", hora: "19:00", disciplina: NIVEL_UNIFICADO },
    { sede: "Rosedal Palermo", hora: "19:00", disciplina: "Slalom" },
    { sede: "Villa Luro", hora: "19:00", disciplina: NIVEL_UNIFICADO },
    { sede: "Rosedal Palermo", hora: "20:00", disciplina: "Rampas" },
    { sede: "Villa Luro", hora: "20:00", disciplina: "Skatepark" },
    { sede: "P. Rivadavia", hora: "20:00", disciplina: "Frenadas" },
  ],
  Viernes: [
    { sede: "Devoto", hora: "19:00", disciplina: NIVEL_UNIFICADO },
    { sede: "Belgrano", hora: "18:00", disciplina: "Slalom" },
    { sede: "Belgrano", hora: "19:00", disciplina: NIVEL_UNIFICADO },
    { sede: "Colegiales", hora: "19:00", disciplina: NIVEL_UNIFICADO },
    { sede: "Facultad de Medicina", hora: "19:00", disciplina: NIVEL_UNIFICADO },
    { sede: "Colegiales", hora: "20:00", disciplina: "Frenadas" },
    { sede: "Belgrano Converse Park", hora: "20:00", disciplina: "Rampas" },
  ],
  Sábado: [
    { sede: "Villa Real", hora: "10:30", disciplina: NIVEL_UNIFICADO },
    { sede: "Plaza La Pampa", hora: "09:00", disciplina: NIVEL_UNIFICADO },
    { sede: "Puerto Madero", hora: "10:00", disciplina: NIVEL_UNIFICADO },
    { sede: "Vicente López", hora: "09:00", disciplina: NIVEL_UNIFICADO },
    { sede: "Rosedal Palermo", hora: "10:00", disciplina: NIVEL_UNIFICADO },
    { sede: "Rosedal Palermo", hora: "17:00", disciplina: "Slalom" },
    { sede: "Rosedal Palermo", hora: "18:00", disciplina: NIVEL_UNIFICADO },
    { sede: "Vicente López", hora: "09:00", disciplina: "Slalom" },
    { sede: "Rosedal Palermo", hora: "19:00", disciplina: "Frenadas" },
    { sede: "Puerto Madero", hora: "11:00", disciplina: "Urbano" },
    { sede: "Villa Real", hora: "11:30", disciplina: "Urbano" },
    { sede: "Villa Real", hora: "11:30", disciplina: "Slalom Inicial" },
  ],
  Domingo: [
    { sede: "P. Rivadavia", hora: "09:00", disciplina: NIVEL_UNIFICADO },
    { sede: "P. Rivadavia", hora: "09:00", disciplina: "Urbano" },
    { sede: "P. Rivadavia", hora: "10:00", disciplina: NIVEL_UNIFICADO },
    { sede: "Plaza La Pampa", hora: "09:00", disciplina: NIVEL_UNIFICADO },
    { sede: "Facultad de Medicina", hora: "10:00", disciplina: NIVEL_UNIFICADO },
    { sede: "Rosedal Palermo", hora: "10:00", disciplina: NIVEL_UNIFICADO },
  ],
};

// Orden ascendente por hora dentro de cada día
Object.values(horarios).forEach((list) => list.sort((a, b) => a.hora.localeCompare(b.hora)));

const dias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

// ── Opciones de filtro ──
const ordenDisciplinas = [
  NIVEL_UNIFICADO,
  "Slalom",
  "Slalom Inicial",
  "Frenadas",
  "Urbano",
  "Skatepark",
  "Rampas",
  "KIDS",
];
const disciplinasDisponibles = ordenDisciplinas.filter((d) =>
  Object.values(horarios).some((clases) => clases.some((c) => c.disciplina === d)),
);

const TODOS = "__todos__";

// ── Identidades de autopercepción → mapean a grupos de disciplinas ──
const identidades = [
  {
    value: "arrancando",
    emoji: "🟢",
    label: "Nunca patiné o no sé por dónde empezar",
    disciplinas: [NIVEL_UNIFICADO],
  },
  {
    value: "con-base",
    emoji: "🟡",
    label: "Ya sé lo básico, quiero mejorar",
    disciplinas: [NIVEL_UNIFICADO],
  },
  {
    value: "desafio",
    emoji: "🔴",
    label: "Quiero superarme y avanzar rápido",
    disciplinas: ["Slalom", "Frenadas", "Urbano", "Skatepark", "Rampas"],
  },
];

const disciplinasPorIdentidad = (id: string): string[] =>
  identidades.find((x) => x.value === id)?.disciplinas ?? [];

type TabType = "clases" | "alquiler";

// ── Componentes de cards ──
const ClaseCard = ({ clase, size = "sm" }: { clase: ClaseEnriquecida; size?: "sm" | "md" }) => (
  <div className="bg-card rounded-lg p-3 shadow-sm border border-border hover:shadow-md transition-shadow h-full flex flex-col">
    <p className={`font-bold text-foreground leading-tight ${size === "sm" ? "text-xs" : "text-sm"}`}>
      {clase.sede}
    </p>
    <div className="flex items-center gap-1 mt-1.5">
      <Clock className={`${size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"} text-primary shrink-0`} />
      <p className={`text-muted-foreground ${size === "sm" ? "text-xs" : "text-sm"}`}>{clase.hora}</p>
    </div>
    {clase.disciplina && (
      <div className="flex flex-wrap gap-1 mt-2">
        {expandirNivel(clase.disciplina).map((b) => (
          <Tooltip key={b} delayDuration={150}>
            <TooltipTrigger asChild>
              <span
                className={`inline-flex items-center gap-0.5 px-2 py-0.5 max-w-full text-[9px] sm:text-[10px] font-bold uppercase tracking-wide leading-tight break-words cursor-default ${badgeStyles[b] || ""}`}
              >
                {b}<Info className="w-2.5 h-2.5 opacity-50 shrink-0" />
              </span>
            </TooltipTrigger>
            {badgeDescriptions[b] && (
              <TooltipContent side="top" className="max-w-xs text-xs leading-snug">
                {badgeDescriptions[b]}
              </TooltipContent>
            )}
          </Tooltip>
        ))}
      </div>
    )}
  </div>
);

// ── Card grande para vista de día único ──
const ClaseDayCard = ({ clase }: { clase: ClaseEnriquecida }) => (
  <Card className="hover:border-primary/40 hover:shadow-lg hover:scale-[1.02] transition-all duration-200 cursor-default h-full">
    <CardContent className="p-5 flex flex-col gap-3 h-full">
      {/* Hora grande y prominente */}
      <div className="flex items-center gap-2">
        <Clock className="w-4 h-4 text-primary shrink-0" />
        <span className="text-3xl font-black text-foreground tracking-tight">{clase.hora}</span>
      </div>
      {/* Sede */}
      <p className="text-sm font-semibold text-muted-foreground leading-tight">{clase.sede}</p>
      {/* Badges con tooltip */}
      {clase.disciplina && (
        <div className="flex flex-wrap gap-1.5 mt-auto">
          {expandirNivel(clase.disciplina).map((b) => (
            <Tooltip key={b} delayDuration={150}>
              <TooltipTrigger asChild>
                <span
                  className={`inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide leading-tight cursor-default ${badgeStyles[b] || ""}`}
                >
                  {b}<Info className="w-2.5 h-2.5 opacity-50 shrink-0" />
                </span>
              </TooltipTrigger>
              {badgeDescriptions[b] && (
                <TooltipContent side="top" className="max-w-xs text-xs leading-snug">
                  {badgeDescriptions[b]}
                </TooltipContent>
              )}
            </Tooltip>
          ))}
        </div>
      )}
    </CardContent>
  </Card>
);

const HorariosSection = () => {
  const { ref, isVisible } = useScrollAnimation();
  const [activeTab, setActiveTab] = useState<TabType>("clases");

  // ── Estado de filtros ──
  const [filtroDia, setFiltroDia] = useState<string>(TODOS);
  const [filtroDisciplina, setFiltroDisciplina] = useState<string>(TODOS);
  const [filtroIdentidad, setFiltroIdentidad] = useState<string>(TODOS);

  const hayFiltros = filtroDia !== TODOS || filtroDisciplina !== TODOS || filtroIdentidad !== TODOS;
  const limpiarFiltros = () => {
    setFiltroDia(TODOS);
    setFiltroDisciplina(TODOS);
    setFiltroIdentidad(TODOS);
  };

  // Clases de un día que pasan los filtros
  const clasesFiltradas = (dia: string) =>
    horarios[dia].filter((c) => {
      const pasaDisciplina =
        filtroDisciplina === TODOS || c.disciplina === filtroDisciplina;
      const pasaIdentidad =
        filtroIdentidad === TODOS ||
        disciplinasPorIdentidad(filtroIdentidad).includes(c.disciplina ?? "");
      return pasaDisciplina && pasaIdentidad;
    });

  // Días a mostrar: si se eligió un día, solo ese; si no, todos los que tengan clases tras filtrar
  const diasVisibles = useMemo(() => {
    const base = filtroDia === TODOS ? dias : dias.filter((d) => d === filtroDia);
    return base.filter((d) => clasesFiltradas(d).length > 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtroDia, filtroDisciplina, filtroIdentidad]);

  const totalResultados = diasVisibles.reduce((n, d) => n + clasesFiltradas(d).length, 0);
  // Cuántas columnas usar en desktop (máx 7) según los días visibles
  const colsDesktop = Math.min(Math.max(diasVisibles.length, 1), 7);

  return (
    <section id="horarios" className="py-24 bg-background" ref={ref}>
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-primary font-bold text-sm tracking-widest uppercase mb-2">Horarios</p>
          <h2 className="text-3xl md:text-5xl font-black italic tracking-tight text-foreground mb-4">
            Clases todos los días
          </h2>
          <p className="text-muted-foreground text-lg">
            Encontrá el horario que mejor se adapte a tu rutina
          </p>
        </div>

        {/* ── Tabs ── */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex bg-muted rounded-xl p-1.5 gap-1 flex-wrap justify-center">
            <button
              onClick={() => setActiveTab("clases")}
              className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${
                activeTab === "clases"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              📅 Todas las clases
            </button>
            <button
              onClick={() => setActiveTab("alquiler")}
              className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 flex items-center gap-2 ${
                activeTab === "alquiler"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Package className="w-4 h-4" />
              Alquiler + Clases
            </button>
          </div>
        </div>

        {/* ── TAB: Todas las clases ── */}
        {activeTab === "clases" && (
          <>
            {/* ── Filtros ── */}
            <div className="max-w-3xl mx-auto mb-8">
              <div className="flex items-center justify-center gap-2 mb-3 text-muted-foreground">
                <CalendarSearch className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold uppercase tracking-widest">Filtrar horarios</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Día */}
                <Select value={filtroDia} onValueChange={setFiltroDia}>
                  <SelectTrigger aria-label="Filtrar por día">
                    <SelectValue placeholder="Día" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value={TODOS}>Todos los días</SelectItem>
                    {dias.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Disciplina */}
                <Select value={filtroDisciplina} onValueChange={setFiltroDisciplina}>
                  <SelectTrigger aria-label="Filtrar por disciplina">
                    <SelectValue placeholder="Disciplina" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value={TODOS}>Todas las disciplinas</SelectItem>
                    {disciplinasDisponibles.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Identidad / autopercepción */}
                <Select value={filtroIdentidad} onValueChange={setFiltroIdentidad}>
                  <SelectTrigger aria-label="Filtrar por nivel">
                    <SelectValue placeholder="¿Cómo te definís?" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value={TODOS}>Cualquier nivel</SelectItem>
                    {identidades.map((id) => (
                      <SelectItem key={id.value} value={id.value}>
                        {id.emoji} {id.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Resumen + limpiar */}
              {hayFiltros && (
                <div className="flex items-center justify-center gap-3 mt-4 text-sm">
                  <span className="text-muted-foreground">
                    {totalResultados} {totalResultados === 1 ? "clase encontrada" : "clases encontradas"}
                  </span>
                  <button
                    onClick={limpiarFiltros}
                    className="inline-flex items-center gap-1.5 text-primary font-bold hover:underline"
                  >
                    <X className="w-3.5 h-3.5" />
                    Limpiar filtros
                  </button>
                </div>
              )}
            </div>

            {/* Sin resultados */}
            {diasVisibles.length === 0 ? (
              <div className="max-w-lg mx-auto text-center">
                {/* Emoji grande */}
                <p className="text-5xl mb-4">🛼</p>

                {/* Título */}
                <h3 className="text-2xl font-black italic tracking-tight text-foreground mb-2">
                  Ooops…
                </h3>
                <p className="text-foreground font-semibold mb-1">
                  Parece que no tenemos lo que estás buscando.
                </p>
                <p className="text-muted-foreground text-sm mb-6">
                  ¿Te gustaría que lo tuviéramos? Dejanos tu sugerencia — leemos todo.
                </p>

                {/* Botón buzón → abre modal de sugerencia */}
                <SugerenciaTrigger>
                  {(openSug) => (
                    <button
                      onClick={openSug}
                      className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-bold uppercase tracking-[0.12em] text-xs px-6 py-3 rounded-full hover:shadow-[0_0_24px_rgba(208,28,31,0.5)] transition-all mb-4"
                    >
                      💬 Dejar una sugerencia
                    </button>
                  )}
                </SugerenciaTrigger>

                {/* Limpiar filtros */}
                <div>
                  <button
                    onClick={limpiarFiltros}
                    className="inline-flex items-center gap-1.5 text-muted-foreground text-sm hover:text-primary transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                    Limpiar filtros y ver todo
                  </button>
                </div>
              </div>
            ) : (
              <>
                {filtroDia !== TODOS ? (
                  /* ── Vista día único: grid de cards grandes ── */
                  <div className="max-w-4xl mx-auto">
                    <p className="text-center text-muted-foreground text-xs uppercase tracking-widest mb-5">
                      📅 {filtroDia} ·{" "}
                      {totalResultados}{" "}
                      {totalResultados === 1 ? "horario disponible" : "horarios disponibles"}
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                      {clasesFiltradas(filtroDia).map((clase, j) => (
                        <ClaseDayCard key={j} clase={clase} />
                      ))}
                    </div>
                  </div>
                ) : (
                  /* ── Vista todos los días: grilla columna por día ── */
                  <>
                    {/* Desktop grid */}
                    <div
                      className="hidden lg:grid gap-1 max-w-7xl mx-auto"
                      style={{ gridTemplateColumns: `repeat(${colsDesktop}, minmax(0, 1fr))` }}
                    >
                      {diasVisibles.map((dia, i) => (
                        <div
                          key={dia}
                          className={`${isVisible ? "animate-fade-up" : "opacity-0"}`}
                          style={{ animationDelay: `${i * 0.05}s` }}
                        >
                          <div className="border-b-2 border-primary/20 pb-2 mb-3">
                            <h3 className="font-black text-foreground text-base italic tracking-tight text-center">
                              {dia}
                            </h3>
                          </div>
                          <div className="flex flex-col gap-2">
                            {clasesFiltradas(dia).map((clase, j) => (
                              <ClaseCard key={j} clase={clase} size="sm" />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Mobile grid */}
                    <div className="lg:hidden flex flex-col gap-6 max-w-lg mx-auto">
                      {diasVisibles.map((dia, i) => (
                        <div
                          key={dia}
                          className={`${isVisible ? "animate-fade-up" : "opacity-0"}`}
                          style={{ animationDelay: `${i * 0.04}s` }}
                        >
                          <div className="border-b-2 border-primary/20 pb-2 mb-3">
                            <h3 className="font-black text-foreground text-lg italic">{dia}</h3>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            {clasesFiltradas(dia).map((clase, j) => (
                              <ClaseCard key={j} clase={clase} size="md" />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* ── CTA de conversión: aparece cuando hay filtros activos con resultados ── */}
                {hayFiltros && totalResultados > 0 && (
                  <div className="mt-12 max-w-xl mx-auto">
                    <div className="relative rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-8 text-center overflow-hidden">
                      {/* Emoji decorativo de fondo */}
                      <div className="absolute -top-6 -right-6 text-8xl opacity-[0.06] select-none pointer-events-none">
                        🛼
                      </div>
                      <p className="text-primary text-[11px] font-bold uppercase tracking-widest mb-2">
                        ¿Ya encontraste tu horario?
                      </p>
                      <h3 className="text-2xl font-black italic tracking-tight text-foreground mb-1">
                        Ahora solo falta empezar
                      </h3>
                      <p className="text-muted-foreground text-sm mb-6">
                        Sin contratos, sin complicaciones. Elegí tu plan y reservá tu lugar hoy.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4">
                        <a
                          href="#planes"
                          className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground font-bold uppercase tracking-[0.12em] text-xs px-7 py-3.5 rounded-full shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:gap-3 hover:scale-105 transition-all duration-300"
                        >
                          🛼 Elegir mi plan <ArrowRight className="w-4 h-4" />
                        </a>
                        <Link
                          to="/clase-gratis"
                          className="inline-flex items-center justify-center gap-2 border border-border text-foreground font-semibold uppercase tracking-[0.1em] text-xs px-7 py-3.5 rounded-full hover:border-primary/50 hover:text-primary transition-colors"
                        >
                          Probar una clase gratis
                        </Link>
                      </div>
                      <p className="text-muted-foreground text-xs">
                        ¿Todavía dudás?{" "}
                        <a href="#planes" className="text-primary font-semibold hover:underline">
                          Hablá con nosotros →
                        </a>
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* ── TAB: Alquiler + Clases ── */}
        {activeTab === "alquiler" && (
          <div className="max-w-5xl mx-auto">
            {/* Highlight banner */}
            <div className="bg-primary/5 border border-primary/15 rounded-2xl p-6 md:p-8 mb-10 text-center">
              <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-1.5 mb-4">
                <Wrench className="w-4 h-4 text-primary" />
                <span className="text-primary font-bold text-xs uppercase tracking-widest">Servicio de alquiler</span>
              </div>
              <h3 className="text-2xl md:text-3xl font-black italic tracking-tight text-foreground mb-2">
                Sedes con alquiler de equipo + clases
              </h3>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Estas sedes ofrecen alquiler de rollers y protecciones para que puedas tomar clase sin necesidad de traer tu equipo.
              </p>
            </div>

            {/* Alquiler cards */}
            <AlquilerSedesGrid />

            {/* Nota + CTA */}
            <div className="mt-8 bg-muted rounded-xl p-5 max-w-2xl mx-auto text-center">
              <p className="text-muted-foreground text-sm mb-4">
                <strong className="text-foreground">Importante:</strong> Reservá con al menos 24hs de antelación. El alquiler tiene una tarifa estándar adicional al plan.
              </p>
              <Link
                to="/clases-de-rollers-mas-alquiler"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-bold uppercase tracking-[0.15em] text-xs px-5 py-3 rounded-full hover:gap-3 transition-all"
              >
                Ver página completa de Clases + Alquiler
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
        {/* Disclaimer */}
        <p className="text-center text-muted-foreground text-sm mt-8 border-t border-border pt-5 max-w-xl mx-auto">
          * Los horarios pueden cambiar sin previo aviso.{" "}
          <a
            href={`https://wa.me/5491165920600?text=${encodeURIComponent(
              "[LP-HOR-NM] Hola! Tengo una duda sobre un horario de las clases de Comunidad NM Roller.",
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary font-bold hover:underline"
          >
            Escribinos al WhatsApp
          </a>{" "}
          en caso de que tengas dudas u horarios limitados.
        </p>
      </div>
    </section>
  );
};

export default HorariosSection;
