import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, Clock, ExternalLink, Loader2, X } from "lucide-react";
import { sedes, Sede, disciplinaColor, ordenDias, expandirNivel, claseTieneAlquiler, alquilerEnClases } from "@/data/sedes";
import SedeDetalleDialog from "./SedeDetalleDialog";

const COL_DEFAULT = "#D01C1F";
const COL_ACTIVE = "#62C3BF";
const COL_GRATIS = "#3FB950";

const markerSvg = (fill: string) => {
  const stroke = "#111111";
  return (
    "data:image/svg+xml;charset=UTF-8," +
    encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="48" viewBox="0 0 40 48">
        <path d="M20 47 L8 28 A14 14 0 1 1 32 28 Z" fill="${fill}" stroke="${stroke}" stroke-width="2.5"/>
        <circle cx="20" cy="18" r="5" fill="${stroke}"/>
      </svg>
    `)
  );
};

const makeIcon = (fill: string, big: boolean) =>
  L.icon({
    iconUrl: markerSvg(fill),
    iconSize: big ? [48, 56] : [40, 48],
    iconAnchor: big ? [24, 55] : [20, 47],
    className: "nm-sede-marker",
  });

const SedesMapa = ({
  sedesList = sedes,
  sidebarTitle = "Encontrá la tuya",
  gratisIds,
  soloAlquiler = false,
}: {
  sedesList?: Sede[];
  sidebarTitle?: string;
  gratisIds?: string[];
  // Modo de vista de la landing "Clases + Alquiler": muestra únicamente los
  // turnos que incluyen alquiler, en vez de todas las clases de la sede. Sin
  // esto la gente lee "14 clases" y asume que las 14 tienen el servicio.
  soloAlquiler?: boolean;
} = {}) => {
  const gratisSet = gratisIds ? new Set(gratisIds) : null;
  const clasesDe = (sede: Sede) =>
    soloAlquiler ? sede.clases.filter((c) => claseTieneAlquiler(sede, c)) : sede.clases;
  const isGratis = (id: string) => !!gratisSet && gratisSet.has(id);
  const iconFor = (id: string, active: boolean) => {
    if (gratisSet) return makeIcon(gratisSet.has(id) ? COL_GRATIS : COL_DEFAULT, active);
    return makeIcon(active ? COL_ACTIVE : COL_DEFAULT, active);
  };
  const mapDivRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<globalThis.Map<string, L.Marker>>(new globalThis.Map());
  const roRef = useRef<ResizeObserver | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedSede, setSelectedSede] = useState<Sede | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // init map once
  useEffect(() => {
    if (!mapDivRef.current || mapRef.current) return;
    try {
      // Touch-primary devices (phones + tablets): map stays static so page scroll
      // is not blocked. Desktop keeps drag-to-pan but not scroll-wheel zoom.
      const isTouchPrimary =
        typeof window !== "undefined" &&
        window.matchMedia("(hover: none) and (pointer: coarse)").matches;

      const map = L.map(mapDivRef.current, {
        zoomControl: true,
        scrollWheelZoom: false,
        touchZoom: true,          // pinch-to-zoom siempre activo; no bloquea el scroll de página
        dragging: !isTouchPrimary, // dragging con dedo desactivado en mobile para no bloquear scroll
        doubleClickZoom: false,
        attributionControl: true,
      });
      mapRef.current = map;

      // Tiles oscuros CARTO Dark Matter — requiere API key desde sep-2026 (free tier, 5M req/mes)
      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png?key=cb1_2rl4_1_0c1b7e1b0ed927c899a81e58",
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: "abcd",
          maxZoom: 19,
        },
      ).addTo(map);

      const bounds = L.latLngBounds(
        sedesList.map((s) => [s.lat, s.lng] as [number, number]),
      );

      // Vista inicial segura (centro de Buenos Aires). El encuadre real se
      // calcula cuando el contenedor ya tiene tamaño, vía ResizeObserver,
      // para evitar que fitBounds se vaya al zoom máximo con ancho 0.
      map.setView([-34.6037, -58.4], 11);

      const applyView = () => {
        map.invalidateSize();
        if (sedesList.length === 1) {
          map.setView([sedesList[0].lat, sedesList[0].lng], 14);
        } else {
          // maxZoom 13: evita over-zoom cuando hay pocas sedes cercanas.
          // minZoom 11: evita que el mapa quede muy alejado con todas las sedes.
          map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
          if (map.getZoom() < 11) map.setZoom(11);
        }
      };

      const ro = new ResizeObserver(() => {
        const el = mapDivRef.current;
        if (el && el.clientWidth > 0 && el.clientHeight > 0) {
          applyView();
          ro.disconnect();
        }
      });
      ro.observe(mapDivRef.current);
      roRef.current = ro;

      sedesList.forEach((sede) => {
        const marker = L.marker([sede.lat, sede.lng], {
          icon: iconFor(sede.id, false),
          title: sede.nombre,
        }).addTo(map);

        marker.on("mouseover", () => setHoveredId(sede.id));
        marker.on("click", () => {
          setSelectedSede(sede);
          setDialogOpen(true);
          // El "mouseover" ya disparó la hover card antes del clic (el mouse
          // pasa por encima del pin al clickearlo) — sin esto queda flotando
          // arriba del diálogo, mismo problema que el botón "Ver detalle".
          setHoveredId(null);
        });

        markersRef.current.set(sede.id, marker);
      });

      setReady(true);
    } catch (e: any) {
      setError(e?.message ?? "No se pudo cargar el mapa");
    }

    return () => {
      roRef.current?.disconnect();
      roRef.current = null;
      mapRef.current?.remove();
      mapRef.current = null;
      markersRef.current.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // update marker icons when hovered changes
  useEffect(() => {
    markersRef.current.forEach((marker, id) => {
      const active = id === hoveredId;
      marker.setIcon(iconFor(id, active));
      marker.setZIndexOffset(active ? 1000 : 0);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hoveredId]);

  const focusSede = (sede: Sede) => {
    setHoveredId(sede.id);
    mapRef.current?.setView([sede.lat, sede.lng], 14, { animate: true });
  };
  const hoveredSede = hoveredId ? sedesList.find((s) => s.id === hoveredId) ?? null : null;

  return (
    <div className="max-w-7xl mx-auto">
      {gratisSet && (
        <div className="flex flex-wrap items-center gap-5 mb-4">
          <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-foreground/70">
            <span className="w-3 h-3 rounded-full" style={{ background: COL_GRATIS }} /> Gratis
          </span>
          <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-foreground/70">
            <span className="w-3 h-3 rounded-full" style={{ background: COL_DEFAULT }} /> Con seña bonificable
          </span>
        </div>
      )}
      <div className="grid lg:grid-cols-[280px_1fr] gap-4">
      {/* Sidebar lista */}
      <aside className="bg-card border border-border max-h-[560px] overflow-y-auto">
        <div className="sticky top-0 bg-card border-b border-border px-4 py-3 z-10">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            {sedesList.length} sedes
          </p>
          <h3 className="text-foreground font-black italic text-lg leading-tight">{sidebarTitle}</h3>
        </div>
        <ul>
          {sedesList.map((sede) => (

            <li key={sede.id}>
              <button
                // Sin onMouseLeave a propósito: la hover card se renderiza lejos
                // (esquina del mapa), así que limpiar acá la hacía desaparecer
                // justo cuando el mouse iba hacia ella. Se cierra con su propia X.
                onMouseEnter={() => setHoveredId(sede.id)}
                onClick={() => focusSede(sede)}
                className={`w-full text-left px-4 py-3 border-b border-border transition-colors flex items-start gap-2.5 ${
                  hoveredId === sede.id ? "bg-primary/10" : "hover:bg-muted/40"
                }`}
              >
                <MapPin
                  className={`w-4 h-4 mt-0.5 shrink-0 transition-colors ${
                    hoveredId === sede.id ? "text-secondary" : "text-primary"
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-foreground text-sm font-bold leading-tight truncate">
                    {sede.nombre}
                  </p>
                  <p className="text-muted-foreground text-[11px] truncate">{sede.direccion}</p>
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {gratisSet && (
                      <span
                        className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full border ${
                          isGratis(sede.id)
                            ? "text-[#3FB950] border-[#3FB950]/50"
                            : "text-primary border-primary/50"
                        }`}
                      >
                        {isGratis(sede.id) ? "Gratis" : "Con seña"}
                      </span>
                    )}
                    {/* En modo alquiler el badge "solo X" sobra: los horarios que
                        se listan YA son los del servicio. Se cruza contra
                        sede.clases (que en SportClub viene sobrescrito con sus
                        propios horarios) para no marcar "Alquiler" en una sede
                        cuyos horarios mostrados no lo tienen. */}
                    {!soloAlquiler && alquilerEnClases(sede).hay && (
                      <span className="text-[8px] font-bold uppercase tracking-wider text-secondary border border-secondary/40 px-1.5 py-0.5 rounded-full">
                        Alquiler{alquilerEnClases(sede).resumen ? ` · solo ${alquilerEnClases(sede).resumen}` : ""}
                      </span>
                    )}
                    <span
                      className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full border ${
                        soloAlquiler
                          ? "text-secondary border-secondary/40"
                          : "text-muted-foreground border-border"
                      }`}
                    >
                      {soloAlquiler
                        ? `${clasesDe(sede).length} con alquiler`
                        : `${sede.clases.length} clases`}
                    </span>
                  </div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </aside>

      {/* Mapa */}
      <div className="relative">
        <div
          ref={mapDivRef}
          className="w-full h-[560px] bg-[#111] border border-border z-0"
        />

        {!ready && !error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground gap-2 bg-card">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <p className="text-xs uppercase tracking-widest">Cargando mapa…</p>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center text-center p-4 bg-card">
            <p className="text-muted-foreground text-sm">{error}</p>
          </div>
        )}

        {/* Floating hover card — solo desktop (md+). En mobile solo se muestra el dialog. */}
        {hoveredSede && (
          <div className="hidden md:block absolute top-4 right-4 w-72 bg-card border border-primary/40 shadow-2xl shadow-primary/20 p-4 pointer-events-auto animate-fade-up z-[400]">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <h4 className="text-foreground font-black italic text-base leading-tight">
                  {hoveredSede.nombre}
                </h4>
                <p className="text-muted-foreground text-[11px]">{hoveredSede.direccion}</p>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                {gratisSet && (
                  <span
                    className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full border ${
                      isGratis(hoveredSede.id)
                        ? "text-[#3FB950] border-[#3FB950]/50"
                        : "text-primary border-primary/50"
                    }`}
                  >
                    {isGratis(hoveredSede.id) ? "Gratis" : "Con seña"}
                  </span>
                )}
                {!soloAlquiler && alquilerEnClases(hoveredSede).hay && (
                  <span className="text-[8px] font-bold uppercase tracking-wider text-secondary border border-secondary/40 px-1.5 py-0.5 rounded-full text-right">
                    Alquiler{alquilerEnClases(hoveredSede).resumen ? ` · solo ${alquilerEnClases(hoveredSede).resumen}` : ""}
                  </span>
                )}
                <button
                  onClick={() => setHoveredId(null)}
                  aria-label="Cerrar"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {clasesDe(hoveredSede).length > 0 ? (
              <>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-3 mb-1.5">
                  {soloAlquiler ? "Turnos con alquiler" : "Próximos horarios"}
                </p>
                <div className="space-y-1">
                  {ordenDias
                    .map((d) => ({ d, c: clasesDe(hoveredSede).filter((x) => x.dia === d) }))
                    .filter((x) => x.c.length > 0)
                    // Filtrados quedan pocos días, así que en modo alquiler se muestran todos.
                    .slice(0, soloAlquiler ? undefined : 2)
                    .map(({ d, c }) => (
                      <div key={d} className="flex items-start gap-2 text-xs">
                        <span className="text-secondary font-bold w-16 shrink-0">{d}</span>
                        <div className="flex flex-wrap gap-1">
                          {c.slice(0, 3).map((cl, i) => (
                            <span
                              key={i}
                              className="flex items-center gap-1 text-foreground bg-background border border-border px-1.5 py-0.5"
                            >
                              <Clock className="w-2.5 h-2.5 text-primary" />
                              {cl.hora}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>

                <div className="flex flex-wrap gap-1 mt-3">
                  {Array.from(new Set(clasesDe(hoveredSede).flatMap((c) => expandirNivel(c.disciplina)))).map((d) => (
                    <span
                      key={d}
                      className={`text-[8px] font-bold uppercase tracking-wide px-1.5 py-0.5 ${
                        disciplinaColor[d] || "rounded-full bg-muted text-foreground"
                      }`}
                    >
                      {d}
                    </span>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-muted-foreground text-xs italic mt-2">Sin clases regulares.</p>
            )}

            <button
              onClick={() => {
                setSelectedSede(hoveredSede);
                setDialogOpen(true);
                // Sin esto, la hover card queda flotando arriba del diálogo
                // (su visibilidad depende de hoveredId, no de dialogOpen).
                setHoveredId(null);
              }}
              className="mt-3 w-full text-[10px] font-bold uppercase tracking-[0.18em] text-foreground bg-primary hover:bg-primary/90 py-2 transition-colors flex items-center justify-center gap-1.5"
            >
              Ver detalle <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

        <SedeDetalleDialog
          sede={selectedSede}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          soloAlquiler={soloAlquiler}
        />
      </div>
    </div>
  );
};

export default SedesMapa;
