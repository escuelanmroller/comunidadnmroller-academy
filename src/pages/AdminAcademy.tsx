import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { ETIQUETAS_RESPUESTAS } from "@/data/academy";
import PreguntasEditor from "@/components/academy/PreguntasEditor";
import logo from "@/assets/Logo-NM-Rollers.png";

type Instructor = Database["public"]["Tables"]["academy_instructores"]["Row"];

const ESTADOS = [
  { id: "nuevo", label: "Nuevo", color: "text-foreground" },
  { id: "contactado", label: "Contactado", color: "text-amber-300" },
  { id: "seleccionado", label: "Seleccionado", color: "text-emerald-400" },
  { id: "rechazado", label: "Rechazado", color: "text-red-400" },
] as const;

const TIERS = [
  { id: "starter", label: "Starter" },
  { id: "vip", label: "VIP" },
  { id: "elite", label: "Elite" },
] as const;

const selectCls =
  "h-9 rounded-full border border-border bg-background px-3 text-xs font-semibold focus:border-primary focus:outline-none";

const fecha = (iso: string) => new Date(iso).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" });

const colorEstado = (estado: string) => ESTADOS.find((e) => e.id === estado)?.color ?? "text-foreground";

const linkWhatsapp = (whatsapp: string | null, nombre: string) => {
  const digits = (whatsapp ?? "").replace(/\D/g, "");
  if (!digits) return null;
  const texto = `Hola ${nombre.trim().split(" ")[0]}, te escribo desde NM Academy...`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(texto)}`;
};

export default function AdminAcademy() {
  const navigate = useNavigate();
  const [instructores, setInstructores] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroTier, setFiltroTier] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [abiertoId, setAbiertoId] = useState<string | null>(null);
  const [vista, setVista] = useState<"candidatos" | "preguntas">("candidatos");
  const [etiquetasExtra, setEtiquetasExtra] = useState<Record<string, string>>({});

  const cargar = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("academy_instructores")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast({ title: "No pudimos cargar los candidatos", description: error.message, variant: "destructive" });
    setInstructores(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  // Textos actuales de las preguntas (incluye las agregadas desde el panel) para mostrar la ficha.
  useEffect(() => {
    supabase
      .from("academy_preguntas")
      .select("clave, etiqueta")
      .then(({ data }) => setEtiquetasExtra(Object.fromEntries((data ?? []).map((d) => [d.clave, d.etiqueta]))));
  }, [vista]);

  const actualizar = async (id: string, cambios: Partial<Pick<Instructor, "estado" | "tier" | "notas_internas">>) => {
    setInstructores((prev) => prev.map((i) => (i.id === id ? { ...i, ...cambios } : i)));
    const { error } = await supabase.from("academy_instructores").update(cambios).eq("id", id);
    if (error) {
      toast({ title: "No se pudo guardar el cambio", description: error.message, variant: "destructive" });
      cargar();
    }
  };

  const conteo = useMemo(() => {
    const c: Record<string, number> = {};
    instructores.forEach((i) => {
      c[i.estado] = (c[i.estado] ?? 0) + 1;
    });
    return c;
  }, [instructores]);

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return instructores.filter((i) => {
      if (filtroEstado && i.estado !== filtroEstado) return false;
      if (filtroTier && i.tier !== filtroTier) return false;
      if (q && !`${i.nombre_apellido} ${i.email} ${i.pais_ciudad ?? ""}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [instructores, filtroEstado, filtroTier, busqueda]);

  const abierto = instructores.find((i) => i.id === abiertoId) ?? null;
  const respuestas = (abierto?.respuestas ?? {}) as Record<string, string>;
  const respuestasOrdenadas = abierto
    ? [
        ...Object.keys(ETIQUETAS_RESPUESTAS).filter((k) => respuestas[k]),
        ...Object.keys(respuestas).filter((k) => k !== "instagram" && !(k in ETIQUETAS_RESPUESTAS) && respuestas[k]),
      ]
    : [];

  const salir = async () => {
    await supabase.auth.signOut();
    navigate("/panel-ventas/login", { replace: true });
  };

  const pill = (activo: boolean) =>
    `rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
      activo
        ? "bg-primary text-primary-foreground"
        : "border border-border bg-card text-muted-foreground hover:text-foreground"
    }`;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <header className="mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={logo} alt="NM Roller" className="h-11 w-11 rounded-full object-contain" />
            <div>
              <h1 className="text-xl font-extrabold leading-tight sm:text-2xl">NM Academy · Panel</h1>
              <p className="text-xs text-muted-foreground">
                {filtrados.length} de {instructores.length} candidatos
              </p>
            </div>
          </div>
          <button
            onClick={salir}
            className="rounded-full border border-border px-4 py-2 text-xs font-bold uppercase tracking-wider hover:bg-card"
          >
            Salir
          </button>
        </header>

        <div className="mb-4 flex gap-2">
          <button onClick={() => setVista("candidatos")} className={pill(vista === "candidatos")}>
            Candidatos
          </button>
          <button onClick={() => setVista("preguntas")} className={pill(vista === "preguntas")}>
            Preguntas del formulario
          </button>
        </div>

        {vista === "preguntas" && <PreguntasEditor />}

        <div className={vista === "candidatos" ? "" : "hidden"}>
        <section className="mb-4 rounded-2xl border border-border bg-card p-4">
          <div className="mb-4 flex flex-wrap gap-2">
            <button onClick={() => setFiltroEstado("")} className={pill(filtroEstado === "")}>
              Todos · {instructores.length}
            </button>
            {ESTADOS.map((e) => (
              <button key={e.id} onClick={() => setFiltroEstado(e.id)} className={pill(filtroEstado === e.id)}>
                {e.label} · {conteo[e.id] ?? 0}
              </button>
            ))}
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="search"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre, email o país"
              className="h-11 flex-1 rounded-xl border border-border bg-background px-4 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
            <select
              value={filtroTier}
              onChange={(e) => setFiltroTier(e.target.value)}
              aria-label="Filtrar por tier"
              className="h-11 rounded-xl border border-border bg-background px-4 text-sm focus:border-primary focus:outline-none"
            >
              <option value="">Todos los tiers</option>
              {TIERS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-border bg-card">
          {loading ? (
            <div className="flex items-center justify-center gap-2 p-10 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Cargando candidatos...
            </div>
          ) : filtrados.length === 0 ? (
            <p className="p-10 text-center text-sm text-muted-foreground">
              No hay candidatos para mostrar. Si esperabas ver la lista completa, revisá que hayas entrado con un
              usuario administrador.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="px-4 py-3 font-semibold">Nombre</th>
                    <th className="hidden px-4 py-3 font-semibold md:table-cell">País</th>
                    <th className="hidden px-4 py-3 font-semibold lg:table-cell">Inscripto</th>
                    <th className="px-4 py-3 font-semibold">Estado</th>
                    <th className="px-4 py-3 font-semibold">Tier</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {filtrados.map((i) => {
                    const wa = linkWhatsapp(i.whatsapp, i.nombre_apellido);
                    return (
                      <tr key={i.id} className="border-t border-border hover:bg-white/[0.03]">
                        <td className="px-4 py-3">
                          <p className="font-bold">{i.nombre_apellido}</p>
                          <p className="text-xs text-muted-foreground">{i.email}</p>
                        </td>
                        <td className="hidden max-w-[220px] px-4 py-3 text-muted-foreground md:table-cell">
                          {i.pais_ciudad}
                        </td>
                        <td className="hidden px-4 py-3 text-muted-foreground lg:table-cell">{fecha(i.created_at)}</td>
                        <td className="px-4 py-3">
                          <select
                            value={i.estado}
                            onChange={(e) => actualizar(i.id, { estado: e.target.value })}
                            aria-label={`Estado de ${i.nombre_apellido}`}
                            className={`${selectCls} ${colorEstado(i.estado)}`}
                          >
                            {ESTADOS.map((e) => (
                              <option key={e.id} value={e.id}>
                                {e.label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={i.tier ?? ""}
                            onChange={(e) => actualizar(i.id, { tier: e.target.value || null })}
                            aria-label={`Tier de ${i.nombre_apellido}`}
                            className={selectCls}
                          >
                            <option value="">Sin tier</option>
                            {TIERS.map((t) => (
                              <option key={t.id} value={t.id}>
                                {t.label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-right">
                          {wa && (
                            <a
                              href={wa}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mr-4 font-bold text-emerald-400 hover:underline"
                            >
                              WhatsApp
                            </a>
                          )}
                          <button
                            onClick={() => setAbiertoId(i.id)}
                            className="font-bold text-emerald-400 hover:underline"
                          >
                            Ficha
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
        </div>
      </div>

      <Dialog open={!!abierto} onOpenChange={(o) => !o && setAbiertoId(null)}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto rounded-2xl border-border bg-card p-6 sm:rounded-2xl [&>button]:hidden">
          {abierto && (
            <>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <DialogTitle className="text-xl font-extrabold leading-tight">{abierto.nombre_apellido}</DialogTitle>
                  <DialogDescription className="mt-1 text-xs">
                    Inscripto el {fecha(abierto.created_at)}
                  </DialogDescription>
                </div>
                <DialogClose className="shrink-0 rounded-full border border-border px-4 py-2 text-xs font-bold uppercase tracking-wider hover:bg-background">
                  Cerrar
                </DialogClose>
              </div>

              <div className="rounded-xl border border-border bg-background/50 p-4">
                <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-primary">Datos</h3>
                <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
                  {[
                    ["Email", abierto.email],
                    ["WhatsApp", abierto.whatsapp],
                    ["País / ciudad", abierto.pais_ciudad],
                    ["Edad", abierto.edad],
                    ["Tiempo patinando", abierto.anos_patinando],
                    ["Instagram", abierto.instagram],
                    ["Cómo nos conoció", abierto.como_me_conociste],
                  ].map(([k, v]) => (
                    <div key={k as string} className="min-w-0">
                      <dt className="text-xs text-muted-foreground">{k}</dt>
                      <dd className="break-words font-medium">{v || "—"}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div className="rounded-xl border border-border bg-background/50 p-4">
                <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-primary">Respuestas</h3>
                {respuestasOrdenadas.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Sin respuestas cargadas.</p>
                ) : (
                  <div className="space-y-4">
                    {respuestasOrdenadas.map((k) => (
                      <div key={k}>
                        <p className="text-xs text-muted-foreground">{etiquetasExtra[k] ?? ETIQUETAS_RESPUESTAS[k] ?? k}</p>
                        <p className="mt-0.5 whitespace-pre-wrap text-sm">{respuestas[k]}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-border bg-background/50 p-4">
                <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-primary">Seguimiento</h3>
                <div className="mb-4 flex flex-wrap gap-3">
                  <select
                    value={abierto.estado}
                    onChange={(e) => actualizar(abierto.id, { estado: e.target.value })}
                    aria-label="Estado"
                    className={`${selectCls} ${colorEstado(abierto.estado)}`}
                  >
                    {ESTADOS.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.label}
                      </option>
                    ))}
                  </select>
                  <select
                    value={abierto.tier ?? ""}
                    onChange={(e) => actualizar(abierto.id, { tier: e.target.value || null })}
                    aria-label="Tier"
                    className={selectCls}
                  >
                    <option value="">Sin tier</option>
                    {TIERS.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
                <label htmlFor="academy-notas" className="mb-2 block text-xs text-muted-foreground">
                  Notas internas (se guardan al salir del campo)
                </label>
                <textarea
                  id="academy-notas"
                  key={abierto.id}
                  defaultValue={abierto.notas_internas ?? ""}
                  onBlur={(e) => {
                    if (e.target.value !== (abierto.notas_internas ?? "")) {
                      actualizar(abierto.id, { notas_internas: e.target.value });
                    }
                  }}
                  rows={3}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
                />
              </div>

              {linkWhatsapp(abierto.whatsapp, abierto.nombre_apellido) && (
                <a
                  href={linkWhatsapp(abierto.whatsapp, abierto.nombre_apellido) as string}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500 px-6 py-3 text-sm font-bold uppercase tracking-wider text-white hover:bg-emerald-600"
                >
                  <MessageCircle className="h-4 w-4" /> Escribir por WhatsApp
                </a>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
