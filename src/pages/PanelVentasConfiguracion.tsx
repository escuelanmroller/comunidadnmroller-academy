import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  actualizarPrecioPlan, listarPlanesEfectivo, type CategoriaPlan, type PlanEfectivo,
} from "@/lib/panelVentasApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ArrowLeft } from "lucide-react";

const CATEGORIA_LABEL: Record<CategoriaPlan, string> = {
  "nm-mensual": "Planes mensuales",
  "nm-trimestral": "Planes trimestrales",
  "alquiler": "Clases + alquiler",
};

const CATEGORIA_ORDEN: CategoriaPlan[] = ["nm-mensual", "nm-trimestral", "alquiler"];

const FilaPlan = ({ plan, onSaved }: { plan: PlanEfectivo; onSaved: (plan: PlanEfectivo) => void }) => {
  const [precio, setPrecio] = useState(String(plan.precio_efectivo));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setPrecio(String(plan.precio_efectivo));
  }, [plan.precio_efectivo]);

  const dirty = Number(precio) !== plan.precio_efectivo;

  const handleGuardar = async () => {
    const valor = Number(precio);
    if (!precio.trim() || Number.isNaN(valor) || valor < 0) {
      toast.error("Ingresá un precio válido.");
      return;
    }
    setLoading(true);
    try {
      const actualizado = await actualizarPrecioPlan({ id: plan.id, precio_efectivo: valor });
      onSaved(actualizado);
      toast.success(`Precio de "${plan.nombre}" actualizado.`);
    } catch (err: any) {
      toast.error(err?.message ?? "No pudimos actualizar el precio.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-between gap-4 border border-border bg-card p-4">
      <div className="min-w-0">
        <p className="font-bold uppercase text-sm tracking-wide">{plan.nombre}</p>
        <p className="text-xs text-foreground/50">{plan.plan_slug}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-foreground/60">$</span>
        <Input
          type="number"
          min={0}
          step={1}
          value={precio}
          onChange={(e) => setPrecio(e.target.value)}
          disabled={loading}
          className="w-32 rounded-none bg-background border-border text-right"
        />
        <Button
          size="sm"
          className="rounded-none bg-primary hover:bg-primary/90"
          onClick={handleGuardar}
          disabled={loading || !dirty}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Guardar"}
        </Button>
      </div>
    </div>
  );
};

const PanelVentasConfiguracion = () => {
  const queryClient = useQueryClient();
  const { data: planes = [], isLoading, isError } = useQuery({
    queryKey: ["planes-efectivo"],
    queryFn: () => listarPlanesEfectivo(),
  });

  const handleSaved = (actualizado: PlanEfectivo) => {
    queryClient.setQueryData<PlanEfectivo[]>(["planes-efectivo"], (prev) =>
      (prev ?? []).map((p) => (p.id === actualizado.id ? actualizado : p)),
    );
  };

  return (
    <main className="min-h-screen bg-background text-foreground px-6 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <p className="text-[11px] uppercase tracking-[0.18em] text-primary font-bold">Panel de ventas</p>
          <h1 className="font-display italic uppercase text-2xl md:text-3xl font-black">
            Precios de pago en efectivo
          </h1>
          <p className="text-foreground/60 text-sm mt-2">
            Estos precios son los que se muestran al confirmar un turno como pagado. No afectan los
            precios publicados en el sitio — si cambian ahí, hay que actualizarlos acá a mano.
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : isError ? (
          <p className="text-destructive text-sm">No pudimos traer el catálogo de planes.</p>
        ) : (
          <div className="space-y-8">
            {CATEGORIA_ORDEN.map((categoria) => {
              const planesCategoria = planes.filter((p) => p.categoria === categoria);
              if (planesCategoria.length === 0) return null;
              return (
                <div key={categoria}>
                  <h2 className="text-xs uppercase tracking-[0.18em] text-foreground/50 font-bold mb-3">
                    {CATEGORIA_LABEL[categoria]}
                  </h2>
                  <div className="space-y-2">
                    {planesCategoria.map((plan) => (
                      <FilaPlan key={plan.id} plan={plan} onSaved={handleSaved} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-10">
          <Link
            to="/panel-ventas"
            className="inline-flex items-center gap-2 text-xs text-foreground/50 hover:text-foreground uppercase tracking-[0.18em]"
          >
            <ArrowLeft className="w-4 h-4" /> Volver al panel
          </Link>
        </div>
      </div>
    </main>
  );
};

export default PanelVentasConfiguracion;
