import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { listarTurnos, listarPlanesEfectivo, type Turno } from "@/lib/panelVentasApi";
import ResumenVentas from "@/components/panel-ventas/ResumenVentas";
import TurnosTable from "@/components/panel-ventas/TurnosTable";
import ConfirmarPagoDialog from "@/components/panel-ventas/ConfirmarPagoDialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, LogOut, RefreshCw, Settings } from "lucide-react";

const FILTROS_ESTADO = [
  { value: "todos", label: "Todos" },
  { value: "pendiente", label: "Pendientes" },
  { value: "pagado", label: "Pagados" },
  { value: "no_show", label: "No se presentó" },
  { value: "no_pago", label: "Vino y no pagó" },
  { value: "reprogramado", label: "Reprogramaron" },
  { value: "cancelado", label: "Cancelados" },
] as const;

// Rango hacia atrás; hacia adelante siempre se traen los próximos 14 días.
const RANGOS_DIAS = [
  { value: "30", label: "Últimos 30 días" },
  { value: "60", label: "Últimos 60 días" },
  { value: "90", label: "Últimos 90 días" },
  { value: "180", label: "Últimos 180 días" },
] as const;

const PanelVentas = () => {
  const queryClient = useQueryClient();
  const [filtroEstado, setFiltroEstado] = useState<(typeof FILTROS_ESTADO)[number]["value"]>("todos");
  const [rangoDias, setRangoDias] = useState<(typeof RANGOS_DIAS)[number]["value"]>("60");
  const [turnoSeleccionado, setTurnoSeleccionado] = useState<Turno | null>(null);

  const { data: turnos = [], isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["turnos-efectivo", rangoDias],
    queryFn: () => {
      const desde = new Date(Date.now() - Number(rangoDias) * 24 * 60 * 60 * 1000).toISOString();
      return listarTurnos({ desde });
    },
  });

  const { data: planes = [] } = useQuery({
    queryKey: ["planes-efectivo"],
    queryFn: () => listarPlanesEfectivo(),
  });

  const turnosFiltrados = useMemo(() => {
    if (filtroEstado === "todos") return turnos;
    return turnos.filter((t) => t.estado === filtroEstado);
  }, [turnos, filtroEstado]);

  const handleConfirmed = () => {
    setTurnoSeleccionado(null);
    queryClient.invalidateQueries({ queryKey: ["turnos-efectivo"] });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <main className="min-h-screen bg-background text-foreground px-6 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-primary font-bold">Panel de ventas</p>
            <h1 className="font-display italic uppercase text-2xl md:text-3xl font-black">
              Turnos · Beneficio pago en efectivo
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="rounded-none" onClick={() => refetch()} disabled={isFetching}>
              <RefreshCw className={`w-4 h-4 mr-1 ${isFetching ? "animate-spin" : ""}`} />
              {isFetching ? "Actualizando..." : "Actualizar"}
            </Button>
            <Link to="/panel-ventas/configuracion">
              <Button variant="outline" size="sm" className="rounded-none">
                <Settings className="w-4 h-4 mr-1" /> Precios
              </Button>
            </Link>
            <Button variant="ghost" size="sm" className="rounded-none" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-1" /> Salir
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : isError ? (
          <p className="text-destructive text-sm">
            {(error as Error)?.message ?? "No pudimos traer los turnos de Calendly."}
          </p>
        ) : (
          <>
            <ResumenVentas turnos={turnos} />

            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <Select value={filtroEstado} onValueChange={(v) => setFiltroEstado(v as typeof filtroEstado)}>
                  <SelectTrigger className="w-52 rounded-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FILTROS_ESTADO.map((f) => (
                      <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={rangoDias} onValueChange={(v) => setRangoDias(v as typeof rangoDias)}>
                  <SelectTrigger className="w-48 rounded-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {RANGOS_DIAS.map((r) => (
                      <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <p className="text-xs text-foreground/50">
                + próximos 14 días. Datos en vivo desde Calendly.
              </p>
            </div>

            <TurnosTable turnos={turnosFiltrados} onConfirmar={setTurnoSeleccionado} />
          </>
        )}

        <div className="mt-10">
          <Link to="/" className="text-xs text-foreground/50 hover:text-foreground uppercase tracking-[0.18em]">
            ← Volver al sitio
          </Link>
        </div>
      </div>

      <ConfirmarPagoDialog
        turno={turnoSeleccionado}
        planes={planes}
        onClose={() => setTurnoSeleccionado(null)}
        onConfirmed={handleConfirmed}
      />
    </main>
  );
};

export default PanelVentas;
