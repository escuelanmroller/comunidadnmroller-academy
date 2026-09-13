import { Clock, MapPin } from "lucide-react";
import { sedes, ordenDias, disciplinaColor, expandirNivel, claseTieneAlquiler } from "@/data/sedes";

// Agrupado por sede y no por día: cada sede tiene pocos turnos con alquiler, así
// que las cards quedan parejas. Por día quedaban columnas de 8 tarjetas al lado
// de columnas de 1, y una misma sede se repetía varias veces en el mismo día.
const buildPorSede = () =>
  sedes
    .filter((s) => s.alquiler)
    .map((s) => ({
      sede: s,
      dias: ordenDias
        .map((dia) => ({
          dia,
          turnos: s.clases.filter((c) => c.dia === dia && claseTieneAlquiler(s, c)),
        }))
        .filter((d) => d.turnos.length > 0),
    }))
    .filter((x) => x.dias.length > 0);

const AlquilerHorariosGrid = () => {
  const porSede = buildPorSede();

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
      {porSede.map(({ sede, dias }) => (
        <div key={sede.id} className="bg-card border border-border rounded-lg p-4 flex flex-col">
          <div className="flex items-start gap-2 border-b border-primary/20 pb-3 mb-3">
            <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <div className="min-w-0">
              <h3 className="font-black italic text-foreground leading-tight">{sede.nombre}</h3>
              <p className="text-muted-foreground text-[11px] leading-tight">{sede.direccion}</p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {dias.map(({ dia, turnos }) => (
              <div key={dia}>
                <p className="text-[10px] font-black uppercase tracking-widest text-secondary mb-1.5">
                  {dia}
                </p>
                <div className="flex flex-col gap-1.5">
                  {turnos.map((t, i) => (
                    <div key={i} className="flex items-center gap-2 flex-wrap">
                      <span className="flex items-center gap-1 text-foreground text-xs font-bold shrink-0">
                        <Clock className="w-3 h-3 text-primary" />
                        {t.hora}
                      </span>
                      {expandirNivel(t.disciplina).map((b) => (
                        <span
                          key={b}
                          className={`inline-flex items-center px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide leading-tight break-words ${disciplinaColor[b] || ""}`}
                        >
                          {b}
                        </span>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AlquilerHorariosGrid;
