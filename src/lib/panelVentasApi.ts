import { supabase } from "@/integrations/supabase/client";

// "reprogramado" es un estado calculado en vivo (no se guarda): el cliente
// movió su turno a otra fecha, así que el turno viejo deja de contar y el
// nuevo aparece por su cuenta como pendiente.
export type EstadoTurno = "pendiente" | "cancelado" | "pagado" | "no_show" | "no_pago" | "reprogramado";

export interface Turno {
  calendly_event_uuid: string;
  calendly_invitee_uuid: string | null;
  start_time: string;
  end_time: string;
  estado_calendly: "agendado" | "cancelado";
  cancellation: { canceled_by: string; reason: string | null; canceler_type: string } | null;
  reprogramado: boolean;
  nombre: string | null;
  nombre_pila: string | null;
  apellido: string | null;
  email: string | null;
  telefono: string | null;
  dni: string | null;
  plan_preguntado: string | null;
  via: string | null;
  comentario: string | null;
  agendado_en: string | null;
  estado: EstadoTurno;
  plan_pagado: string | null;
  plan_categoria: CategoriaPlan | null;
  notas: string | null;
  vendedor: string | null;
  confirmado_por: string | null;
  confirmado_en: string | null;
}

export async function listarTurnos(params?: { desde?: string; hasta?: string }): Promise<Turno[]> {
  const { data, error } = await supabase.functions.invoke("listar-turnos-efectivo", {
    body: params ?? {},
  });
  if (error) throw error;
  if (!data?.ok) throw new Error(data?.error ?? "No pudimos traer los turnos.");
  return data.turnos as Turno[];
}

export interface ConfirmarPagoInput {
  calendly_event_uuid: string;
  calendly_invitee_uuid?: string | null;
  estado: "pagado" | "no_show" | "no_pago";
  vendedor: string;
  plan_preguntado?: string | null;
  plan_pagado?: string | null;
  plan_categoria?: CategoriaPlan | null;
  nombre?: string | null;
  nombre_pila?: string | null;
  apellido?: string | null;
  email: string;
  telefono?: string | null;
  dni?: string | null;
  notas?: string | null;
}

export async function confirmarPago(input: ConfirmarPagoInput) {
  const { data, error } = await supabase.functions.invoke("confirmar-pago-efectivo", {
    body: input,
  });
  if (error) throw error;
  if (!data?.ok) throw new Error(data?.error ?? "No pudimos guardar la confirmación.");
  return data;
}

// Mismo formato que usa el sitio ("$55.000"), para que el precio se vea
// igual en el panel que en la web.
export function formatPrecioARS(value: number): string {
  return `$${Math.round(value).toLocaleString("es-AR")}`;
}

export type CategoriaPlan = "nm-mensual" | "nm-trimestral" | "alquiler";

export interface PlanEfectivo {
  id: string;
  categoria: CategoriaPlan;
  nombre: string;
  plan_slug: string;
  precio_efectivo: number;
  orden: number;
  activo: boolean;
}

export async function listarPlanesEfectivo(): Promise<PlanEfectivo[]> {
  const { data, error } = await supabase.functions.invoke("listar-planes-efectivo", { body: {} });
  if (error) throw error;
  if (!data?.ok) throw new Error(data?.error ?? "No pudimos traer el catálogo de planes.");
  return data.planes as PlanEfectivo[];
}

export async function actualizarPrecioPlan(input: { id: string; precio_efectivo: number }): Promise<PlanEfectivo> {
  const { data, error } = await supabase.functions.invoke("actualizar-precio-plan", { body: input });
  if (error) throw error;
  if (!data?.ok) throw new Error(data?.error ?? "No pudimos actualizar el precio.");
  return data.plan as PlanEfectivo;
}
