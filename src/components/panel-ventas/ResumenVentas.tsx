import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { Turno } from "@/lib/panelVentasApi";

// Leyenda de cada variable del resumen, visible al pasar el cursor.
const TOOLTIPS = {
  turnos: "Turnos agendados en Calendly dentro del rango elegido. No cuenta los cancelados ni los que reprogramaron (esos siguen su curso en su turno nuevo).",
  pendientes: "Turnos sin resultado cargado todavía: nadie confirmó si la persona pagó, no vino, o vino y no pagó.",
  pagados: "Turnos confirmados como pagados en efectivo por un vendedor. Son las conversiones reales.",
  noShow: "La persona no se presentó al turno y no reprogramó.",
  noPago: "La persona vino al showroom pero no concretó el pago.",
  reprogramados: "La persona movió su turno a otra fecha. El turno viejo deja de contar y el nuevo aparece como pendiente.",
  conversion: "Pagados ÷ turnos del rango (sin cancelados ni reprogramados). Al lado, el desglose de qué plan pagó cada uno.",
} as const;

const CardConTooltip = ({
  label, value, tooltip, highlight,
}: { label: string; value: number; tooltip: string; highlight?: boolean }) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <Card className={`p-4 rounded-none cursor-help ${highlight ? "border-primary/40 bg-primary/5" : "bg-card border-border"}`}>
        <p className={`text-[11px] uppercase tracking-wide font-bold ${highlight ? "text-primary" : "text-foreground/50"}`}>{label}</p>
        <p className={`text-2xl font-black ${highlight ? "text-primary" : ""}`}>{value}</p>
      </Card>
    </TooltipTrigger>
    <TooltipContent className="max-w-64 text-xs leading-relaxed">{tooltip}</TooltipContent>
  </Tooltip>
);

const ResumenVentas = ({ turnos }: { turnos: Turno[] }) => {
  const stats = useMemo(() => {
    // Cancelados y reprogramados quedan fuera del embudo: no son turnos que
    // puedan convertir (el reprogramado convierte —o no— en su turno nuevo).
    const activos = turnos.filter((t) => t.estado_calendly !== "cancelado" && t.estado !== "reprogramado");
    const pagados = turnos.filter((t) => t.estado === "pagado");
    const noShow = turnos.filter((t) => t.estado === "no_show");
    const noPago = turnos.filter((t) => t.estado === "no_pago");
    const pendientes = turnos.filter((t) => t.estado === "pendiente");
    const reprogramados = turnos.filter((t) => t.estado === "reprogramado");
    const tasaConversion = activos.length > 0 ? (pagados.length / activos.length) * 100 : 0;

    const porPlan = new Map<string, number>();
    for (const t of pagados) {
      const plan = t.plan_pagado || "Sin especificar";
      porPlan.set(plan, (porPlan.get(plan) ?? 0) + 1);
    }

    const confirmados = turnos.filter((t) => t.estado === "pagado" || t.estado === "no_show" || t.estado === "no_pago");
    const porVendedor = new Map<string, number>();
    for (const t of confirmados) {
      const vendedor = t.vendedor || "Sin especificar";
      porVendedor.set(vendedor, (porVendedor.get(vendedor) ?? 0) + 1);
    }

    return {
      totalActivos: activos.length,
      pagados: pagados.length,
      noShow: noShow.length,
      noPago: noPago.length,
      pendientes: pendientes.length,
      reprogramados: reprogramados.length,
      tasaConversion,
      porPlan: Array.from(porPlan.entries()).sort((a, b) => b[1] - a[1]),
      porVendedor: Array.from(porVendedor.entries()).sort((a, b) => b[1] - a[1]),
    };
  }, [turnos]);

  return (
    <div className="space-y-4 mb-8">
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <CardConTooltip label="Turnos" value={stats.totalActivos} tooltip={TOOLTIPS.turnos} />
        <CardConTooltip label="Pendientes" value={stats.pendientes} tooltip={TOOLTIPS.pendientes} />
        <CardConTooltip label="Pagados" value={stats.pagados} tooltip={TOOLTIPS.pagados} highlight />
        <CardConTooltip label="No se presentó" value={stats.noShow} tooltip={TOOLTIPS.noShow} />
        <CardConTooltip label="Vino, no pagó" value={stats.noPago} tooltip={TOOLTIPS.noPago} />
        <CardConTooltip label="Reprogramaron" value={stats.reprogramados} tooltip={TOOLTIPS.reprogramados} />
      </div>
      <div className="flex flex-wrap items-center gap-4 border border-border bg-card/50 p-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="cursor-help">
              <p className="text-[11px] uppercase tracking-wide text-foreground/50 font-bold">Tasa de conversión</p>
              <p className="text-xl font-black text-primary">{stats.tasaConversion.toFixed(1)}%</p>
            </div>
          </TooltipTrigger>
          <TooltipContent className="max-w-64 text-xs leading-relaxed">{TOOLTIPS.conversion}</TooltipContent>
        </Tooltip>
        {stats.porPlan.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {stats.porPlan.map(([plan, count]) => (
              <span key={plan} className="text-xs border border-border px-2 py-1 uppercase tracking-wide">
                {plan}: <strong>{count}</strong>
              </span>
            ))}
          </div>
        )}
      </div>
      {stats.porVendedor.length > 0 && (
        <div className="flex flex-wrap items-center gap-4 border border-border bg-card/50 p-4">
          <p className="text-[11px] uppercase tracking-wide text-foreground/50 font-bold">Por vendedor</p>
          <div className="flex flex-wrap gap-2">
            {stats.porVendedor.map(([vendedor, count]) => (
              <span key={vendedor} className="text-xs border border-border px-2 py-1 uppercase tracking-wide">
                {vendedor}: <strong>{count}</strong>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumenVentas;
