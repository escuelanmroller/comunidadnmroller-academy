import { useState } from "react";
import { Clock, Package, X } from "lucide-react";
import { Sede, claseTieneAlquiler } from "@/data/sedes";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import UpgradeNivelCallout from "@/components/UpgradeNivelCallout";

const DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

const TODOS = "__todos__";
const PERFIL_AVANZADO = "desafio";

// Perfiles de autopercepción (mismo estilo que el filtro de la Home / Clase Gratis).
// El beneficio cubre inicial y principiante; el perfil avanzado dispara la guía de upgrade.
const PERFILES = [
  { value: "arrancando", emoji: "🟢", label: "Nunca patiné o no sé por dónde empezar" },
  { value: "con-base", emoji: "🟡", label: "Ya sé lo básico, quiero mejorar" },
  { value: PERFIL_AVANZADO, emoji: "🔴", label: "Quiero superarme y avanzar rápido" },
];

interface ClaseDia {
  sede: string;
  hora: string;
  alquiler: boolean;
}

const HorariosSportclub = ({
  sedesBeneficio,
  nivelLabel,
}: {
  sedesBeneficio: Sede[];
  nivelLabel: string;
}) => {
  const [filtroDia, setFiltroDia] = useState(TODOS);
  const [filtroPerfil, setFiltroPerfil] = useState(TODOS);

  const hayFiltros = filtroDia !== TODOS || filtroPerfil !== TODOS;
  const limpiarFiltros = () => {
    setFiltroDia(TODOS);
    setFiltroPerfil(TODOS);
  };

  // Reorganiza los horarios del beneficio (que vienen por sede) en una grilla por día
  const porDia: Record<string, ClaseDia[]> = {};
  DIAS.forEach((d) => (porDia[d] = []));
  sedesBeneficio.forEach((s) =>
    s.clases.forEach((c) => {
      if (porDia[c.dia]) porDia[c.dia].push({ sede: s.nombre, hora: c.hora, alquiler: claseTieneAlquiler(s, c) });
    }),
  );
  // Ordena por hora dentro de cada día
  Object.values(porDia).forEach((list) => list.sort((a, b) => a.hora.localeCompare(b.hora)));

  const diasConClases = DIAS.filter((d) => porDia[d].length > 0);
  const diasVisibles =
    filtroDia === TODOS ? diasConClases : diasConClases.filter((d) => d === filtroDia);
  const cols = Math.min(Math.max(diasVisibles.length, 1), 7);

  const ClaseCard = ({ clase }: { clase: ClaseDia }) => (
    <div className="bg-card rounded-lg p-3 border border-border">
      <p className="font-bold text-foreground text-xs leading-tight">{clase.sede}</p>
      <div className="flex items-center gap-1 mt-1.5">
        <Clock className="w-3 h-3 text-primary shrink-0" />
        <p className="text-muted-foreground text-xs">{clase.hora} hs</p>
      </div>
      <div className="flex flex-wrap gap-1 mt-2">
        <span className="inline-block text-[9px] font-bold uppercase tracking-wide leading-tight rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/60 px-2 py-0.5">
          {nivelLabel}
        </span>
        {clase.alquiler && (
          <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wide leading-tight rounded-full bg-secondary/15 text-secondary border border-secondary/50 px-2 py-0.5">
            <Package className="w-2.5 h-2.5" /> Alquiler
          </span>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto mt-16 border border-[#F5B800]/25 bg-[#F5B800]/[0.04] p-5 md:p-8">
      <span className="inline-flex items-center gap-1.5 bg-[#F5B800] text-[#111] text-[10px] md:text-[11px] font-black uppercase tracking-[0.18em] px-3 py-1 mb-4">
        Beneficio SportClub · Clases bonificadas
      </span>
      <h3 className="font-display italic uppercase text-2xl md:text-3xl font-black mb-2">
        Tu grilla <span className="text-[#F5B800]">horaria</span>
      </h3>
      <div className="flex flex-wrap items-baseline gap-3 mb-3">
        <span className="font-display italic uppercase font-black text-xl md:text-2xl line-through text-foreground/30">
          $35.000 la clase
        </span>
        <span className="font-display italic uppercase font-black text-xl md:text-2xl text-[#F5B800]">
          Para socios: $0
        </span>
      </div>
      <p className="text-foreground/70 text-sm mb-8 max-w-2xl">
        Como socio con plan habilitado, todas las clases de nivel inicial y principiante
        están <strong className="text-foreground">incluidas en tu membresía</strong>.
        Las sedes con{" "}
        <span className="inline-flex items-center gap-1 text-secondary font-bold uppercase text-[11px]">
          <Package className="w-3 h-3" /> Alquiler
        </span>{" "}
        ofrecen equipo con <strong>50% OFF</strong> para socios.
      </p>

      {/* Filtros: día + perfil */}
      <div className="flex flex-wrap items-center gap-3 mb-8">
        <Select value={filtroDia} onValueChange={setFiltroDia}>
          <SelectTrigger className="w-48 rounded-none bg-background border-border">
            <SelectValue placeholder="Todos los días" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={TODOS}>Todos los días</SelectItem>
            {DIAS.map((d) => (
              <SelectItem key={d} value={d}>{d}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filtroPerfil} onValueChange={setFiltroPerfil}>
          <SelectTrigger className="w-64 rounded-none bg-background border-border">
            <SelectValue placeholder="Cualquier nivel" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={TODOS}>Cualquier nivel</SelectItem>
            {PERFILES.map((p) => (
              <SelectItem key={p.value} value={p.value}>
                {p.emoji} {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {hayFiltros && (
          <button
            onClick={limpiarFiltros}
            className="inline-flex items-center gap-1.5 text-xs text-primary font-bold hover:underline"
          >
            <X className="w-3 h-3" /> Limpiar
          </button>
        )}
      </div>

      {filtroPerfil === PERFIL_AVANZADO ? (
        <UpgradeNivelCallout variant="sportclub" />
      ) : (
        <>
          {/* Desktop: columna por día */}
          <div
            className="hidden lg:grid gap-2"
            style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
          >
            {diasVisibles.map((dia) => (
              <div key={dia}>
                <div className="border-b-2 border-primary/20 pb-2 mb-3">
                  <h4 className="font-black text-foreground text-base italic tracking-tight text-center">
                    {dia}
                  </h4>
                </div>
                <div className="flex flex-col gap-2">
                  {porDia[dia].map((clase, i) => (
                    <ClaseCard key={i} clase={clase} />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Mobile: bloque por día */}
          <div className="lg:hidden flex flex-col gap-6">
            {diasVisibles.map((dia) => (
              <div key={dia}>
                <div className="border-b-2 border-primary/20 pb-2 mb-3">
                  <h4 className="font-black text-foreground text-lg italic">{dia}</h4>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {porDia[dia].map((clase, i) => (
                    <ClaseCard key={i} clase={clase} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <p className="text-center text-foreground/40 text-xs mt-8">
        * Los horarios pueden cambiar sin previo aviso. Cupos limitados por sede.
      </p>
    </div>
  );
};

export default HorariosSportclub;
