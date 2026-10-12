import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Loader2, Lock, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import {
  FIJAS_OBLIGATORIAS,
  FIJAS_TIPO_EDITABLE,
  ordenarPreguntas,
  TIPOS_CON_OPCIONES,
  TIPOS_LABEL,
  TIPOS_NUEVA,
  type Pregunta,
  type TipoPregunta,
} from "@/data/academyPreguntas";

type Borrador = {
  id?: string;
  etiqueta: string;
  tipo: TipoPregunta;
  opciones: string;
  requerida: boolean;
  placeholder: string;
  paso: number | "nuevo";
  pasoTituloNuevo: string;
  fija: boolean;
  clave?: string;
};

const NUEVO_PASO = "nuevo";

const inputCls =
  "w-full rounded-xl border border-border bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none";
const btnIcono =
  "flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-background hover:text-foreground disabled:opacity-30";
const btnTexto = "text-xs font-bold text-emerald-400 hover:underline";

const slug = (t: string) =>
  t
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 30);

const aPregunta = (d: {
  id: string;
  clave: string;
  etiqueta: string;
  tipo: string;
  opciones: unknown;
  requerida: boolean;
  placeholder: string | null;
  paso: number;
  paso_titulo: string;
  paso_bajada: string | null;
  orden: number;
  fija: boolean;
  activa: boolean;
}): Pregunta => ({ ...d, tipo: d.tipo as TipoPregunta, opciones: (d.opciones ?? []) as string[] });

export default function PreguntasEditor() {
  const [preguntas, setPreguntas] = useState<Pregunta[]>([]);
  const [loading, setLoading] = useState(true);
  const [borrador, setBorrador] = useState<Borrador | null>(null);
  const [errorForm, setErrorForm] = useState("");
  const [guardando, setGuardando] = useState(false);

  const cargar = useCallback(async () => {
    const { data, error } = await supabase.from("academy_preguntas").select("*");
    if (error) toast({ title: "No pudimos cargar las preguntas", description: error.message, variant: "destructive" });
    setPreguntas((data ?? []).map(aPregunta));
    setLoading(false);
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const pasos = useMemo(() => {
    const mapa = new Map<number, { paso: number; titulo: string; preguntas: Pregunta[] }>();
    ordenarPreguntas(preguntas.filter((p) => p.activa)).forEach((p) => {
      if (!mapa.has(p.paso)) mapa.set(p.paso, { paso: p.paso, titulo: p.paso_titulo, preguntas: [] });
      mapa.get(p.paso)!.preguntas.push(p);
    });
    return [...mapa.values()].sort((a, b) => a.paso - b.paso);
  }, [preguntas]);

  const quitadas = useMemo(() => ordenarPreguntas(preguntas.filter((p) => !p.activa)), [preguntas]);

  const aplicar = async (cambios: { id: string; patch: Partial<Pregunta> }[]) => {
    if (cambios.length === 0) return;
    const resultados = await Promise.all(
      cambios.map(({ id, patch }) => {
        const { fija: _f, id: _i, ...limpio } = patch;
        return supabase.from("academy_preguntas").update(limpio).eq("id", id);
      }),
    );
    const fallo = resultados.find((r) => r.error);
    if (fallo?.error) toast({ title: "No se pudo guardar", description: fallo.error.message, variant: "destructive" });
    await cargar();
  };

  /** Recalcula paso/orden de todas las preguntas según el orden dado y guarda solo lo que cambió. */
  const reordenar = (grupos: { titulo: string; preguntas: Pregunta[] }[]) => {
    const cambios: { id: string; patch: Partial<Pregunta> }[] = [];
    grupos.forEach((g, i) => {
      g.preguntas.forEach((p, j) => {
        if (p.paso !== i + 1 || p.orden !== j + 1) cambios.push({ id: p.id!, patch: { paso: i + 1, orden: j + 1 } });
      });
    });
    return aplicar(cambios);
  };

  const moverPregunta = (iPaso: number, iPreg: number, dir: -1 | 1) => {
    const grupos = pasos.map((p) => ({ titulo: p.titulo, preguntas: [...p.preguntas] }));
    const lista = grupos[iPaso].preguntas;
    const destino = iPreg + dir;
    if (destino < 0 || destino >= lista.length) return;
    [lista[iPreg], lista[destino]] = [lista[destino], lista[iPreg]];
    reordenar(grupos);
  };

  const moverPaso = (iPaso: number, dir: -1 | 1) => {
    const grupos = pasos.map((p) => ({ titulo: p.titulo, preguntas: p.preguntas }));
    const destino = iPaso + dir;
    if (destino < 0 || destino >= grupos.length) return;
    [grupos[iPaso], grupos[destino]] = [grupos[destino], grupos[iPaso]];
    reordenar(grupos);
  };

  const renombrarPaso = async (paso: number, titulo: string) => {
    const limpio = titulo.trim();
    if (!limpio) return cargar();
    await aplicar(preguntas.filter((p) => p.paso === paso && p.paso_titulo !== limpio).map((p) => ({ id: p.id!, patch: { paso_titulo: limpio } })));
  };

  const setActiva = (p: Pregunta, activa: boolean) => {
    if (!activa && p.fija) return;
    if (activa) {
      // Al volver a ponerla va al final de su paso original.
      const orden = Math.max(0, ...preguntas.filter((x) => x.paso === p.paso && x.activa).map((x) => x.orden)) + 1;
      aplicar([{ id: p.id!, patch: { activa: true, orden } }]);
    } else {
      aplicar([{ id: p.id!, patch: { activa: false } }]);
    }
  };

  const abrirNueva = (paso: number | "nuevo") =>
    setBorrador({
      etiqueta: "",
      tipo: "text",
      opciones: "",
      requerida: false,
      placeholder: "",
      paso,
      pasoTituloNuevo: "",
      fija: false,
    });

  const abrirEdicion = (p: Pregunta) =>
    setBorrador({
      id: p.id,
      clave: p.clave,
      etiqueta: p.etiqueta,
      tipo: p.tipo,
      opciones: p.opciones.join("\n"),
      requerida: p.requerida,
      placeholder: p.placeholder ?? "",
      paso: p.paso,
      pasoTituloNuevo: "",
      fija: p.fija,
    });

  const cambiarTipo = (tipo: TipoPregunta) =>
    setBorrador((b) =>
      b
        ? {
            ...b,
            tipo,
            opciones: b.opciones || (tipo === "escala" ? "1\n2\n3\n4\n5" : ""),
          }
        : b,
    );

  const guardar = async () => {
    if (!borrador) return;
    const etiqueta = borrador.etiqueta.trim();
    const opciones = borrador.opciones
      .split("\n")
      .map((o) => o.replace(/;/g, ",").trim())
      .filter(Boolean);
    if (!etiqueta) return setErrorForm("Escribí la pregunta.");
    if (TIPOS_CON_OPCIONES.includes(borrador.tipo) && opciones.length < 2) {
      return setErrorForm("Poné al menos 2 opciones (una por línea).");
    }
    if (borrador.paso === NUEVO_PASO && !borrador.pasoTituloNuevo.trim()) {
      return setErrorForm("Poné un título para el paso nuevo.");
    }

    setErrorForm("");
    setGuardando(true);

    const pasoNum = borrador.paso === NUEVO_PASO ? Math.max(0, ...preguntas.map((p) => p.paso)) + 1 : borrador.paso;
    const pasoTitulo =
      borrador.paso === NUEVO_PASO
        ? borrador.pasoTituloNuevo.trim()
        : (preguntas.find((p) => p.paso === pasoNum)?.paso_titulo ?? "");
    const ordenFinal = Math.max(0, ...preguntas.filter((p) => p.paso === pasoNum && p.activa).map((p) => p.orden)) + 1;
    const datos = {
      etiqueta,
      tipo: borrador.tipo,
      opciones: TIPOS_CON_OPCIONES.includes(borrador.tipo) ? opciones : [],
      requerida: borrador.requerida,
      placeholder: borrador.placeholder.trim() || null,
    };

    if (borrador.id) {
      const original = preguntas.find((p) => p.id === borrador.id)!;
      const cambioPaso = original.paso !== pasoNum;
      const { error } = await supabase
        .from("academy_preguntas")
        .update(cambioPaso ? { ...datos, paso: pasoNum, paso_titulo: pasoTitulo, paso_bajada: null, orden: ordenFinal } : datos)
        .eq("id", borrador.id);
      setGuardando(false);
      if (error) return setErrorForm(error.message);
    } else {
      const clave = `p_${slug(etiqueta)}_${Math.random().toString(36).slice(2, 6)}`;
      const { error } = await supabase
        .from("academy_preguntas")
        .insert({ ...datos, clave, paso: pasoNum, paso_titulo: pasoTitulo, orden: ordenFinal, fija: false, activa: true });
      setGuardando(false);
      if (error) return setErrorForm(error.message);
    }
    setBorrador(null);
    await cargar();
  };

  const tiposDisponibles = (b: Borrador): TipoPregunta[] => {
    if (!b.fija) return TIPOS_NUEVA;
    return FIJAS_TIPO_EDITABLE[b.clave ?? ""] ?? [b.tipo];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 p-10 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Cargando preguntas...
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground">
        Acá armás el formulario de inscripción. Los cambios se ven al instante en el formulario público. Las preguntas con{" "}
        <Lock className="mx-0.5 inline h-3.5 w-3.5" /> son fijas: se pueden editar pero no quitar. Las que quitás no se
        pierden: quedan abajo y las podés volver a poner.
      </section>

      {pasos.map((g, iPaso) => (
        <section key={g.paso} className="rounded-2xl border border-border bg-card p-4 sm:p-5">
          <div className="mb-4 flex items-center gap-2">
            <span className="shrink-0 rounded-full bg-primary/15 px-3 py-1 text-xs font-extrabold text-primary">
              Paso {iPaso + 1}
            </span>
            <input
              key={`${g.paso}-${g.titulo}`}
              defaultValue={g.titulo}
              onBlur={(e) => e.target.value.trim() !== g.titulo && renombrarPaso(g.paso, e.target.value)}
              aria-label={`Título del paso ${iPaso + 1}`}
              className="min-w-0 flex-1 rounded-lg border border-transparent bg-transparent px-2 py-1 text-base font-extrabold hover:border-border focus:border-primary focus:outline-none"
            />
            <button className={btnIcono} onClick={() => moverPaso(iPaso, -1)} disabled={iPaso === 0} aria-label="Subir paso">
              <ArrowUp className="h-4 w-4" />
            </button>
            <button
              className={btnIcono}
              onClick={() => moverPaso(iPaso, 1)}
              disabled={iPaso === pasos.length - 1}
              aria-label="Bajar paso"
            >
              <ArrowDown className="h-4 w-4" />
            </button>
          </div>

          <ul className="space-y-2">
            {g.preguntas.map((p, iPreg) => (
              <li key={p.id} className="flex items-center gap-2 rounded-xl border border-border bg-background/50 p-3">
                <div className="min-w-0 flex-1">
                  <p className="break-words text-sm font-semibold">
                    {p.fija && <Lock className="mr-1 inline h-3.5 w-3.5 text-muted-foreground" />}
                    {p.etiqueta}
                    {p.requerida && <span className="text-primary"> *</span>}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {TIPOS_LABEL[p.tipo]}
                    {p.opciones.length > 0 && ` · ${p.opciones.length} opciones`}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <button
                    className={btnIcono}
                    onClick={() => moverPregunta(iPaso, iPreg, -1)}
                    disabled={iPreg === 0}
                    aria-label="Subir pregunta"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button
                    className={btnIcono}
                    onClick={() => moverPregunta(iPaso, iPreg, 1)}
                    disabled={iPreg === g.preguntas.length - 1}
                    aria-label="Bajar pregunta"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>
                  <button className={`${btnTexto} ml-1`} onClick={() => abrirEdicion(p)}>
                    Editar
                  </button>
                  {!p.fija && (
                    <button className="text-xs font-bold text-red-400 hover:underline" onClick={() => setActiva(p, false)}>
                      Quitar
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>

          <button
            onClick={() => abrirNueva(g.paso)}
            className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs font-bold uppercase tracking-wider hover:bg-background"
          >
            <Plus className="h-3.5 w-3.5" /> Agregar pregunta
          </button>
        </section>
      ))}

      <button
        onClick={() => abrirNueva(NUEVO_PASO)}
        className="inline-flex h-12 items-center gap-2 rounded-full bg-primary px-6 text-xs font-extrabold uppercase tracking-widest text-primary-foreground hover:bg-primary/90"
      >
        <Plus className="h-4 w-4" /> Agregar paso nuevo
      </button>

      {quitadas.length > 0 && (
        <section className="rounded-2xl border border-border bg-card p-4 sm:p-5">
          <h2 className="mb-3 text-sm font-extrabold uppercase tracking-wider text-muted-foreground">
            Preguntas quitadas ({quitadas.length})
          </h2>
          <ul className="space-y-2">
            {quitadas.map((p) => (
              <li key={p.id} className="flex items-center gap-3 rounded-xl border border-border bg-background/50 p-3">
                <div className="min-w-0 flex-1">
                  <p className="break-words text-sm text-muted-foreground">{p.etiqueta}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.paso_titulo} · {TIPOS_LABEL[p.tipo]}
                  </p>
                </div>
                <button className={btnTexto} onClick={() => setActiva(p, true)}>
                  Volver a poner
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <Dialog open={!!borrador} onOpenChange={(o) => !o && !guardando && setBorrador(null)}>
        <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto rounded-2xl border-border bg-card p-6 sm:rounded-2xl [&>button]:hidden">
          {borrador && (
            <>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <DialogTitle className="text-xl font-extrabold leading-tight">
                    {borrador.id ? "Editar pregunta" : "Pregunta nueva"}
                  </DialogTitle>
                  <DialogDescription className="mt-1 text-xs">
                    {borrador.fija
                      ? "Esta pregunta es fija: se guarda en la ficha del candidato y no se puede quitar."
                      : "Elegí cómo se responde: texto, opciones, selección múltiple o año."}
                  </DialogDescription>
                </div>
                <DialogClose className="shrink-0 rounded-full border border-border px-4 py-2 text-xs font-bold uppercase tracking-wider hover:bg-background">
                  Cerrar
                </DialogClose>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="pq-etiqueta" className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                    Pregunta
                  </label>
                  <textarea
                    id="pq-etiqueta"
                    rows={2}
                    value={borrador.etiqueta}
                    onChange={(e) => setBorrador({ ...borrador, etiqueta: e.target.value })}
                    className={inputCls}
                  />
                </div>

                <div>
                  <label htmlFor="pq-tipo" className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                    Formato de respuesta
                  </label>
                  <select
                    id="pq-tipo"
                    value={borrador.tipo}
                    disabled={tiposDisponibles(borrador).length < 2}
                    onChange={(e) => cambiarTipo(e.target.value as TipoPregunta)}
                    className={`${inputCls} disabled:opacity-60`}
                  >
                    {tiposDisponibles(borrador).map((t) => (
                      <option key={t} value={t}>
                        {TIPOS_LABEL[t]}
                      </option>
                    ))}
                  </select>
                  {borrador.tipo === "anio" && (
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      Muestra una lista de años (desde este año hacia atrás hasta 1970).
                    </p>
                  )}
                </div>

                {TIPOS_CON_OPCIONES.includes(borrador.tipo) && (
                  <div>
                    <label htmlFor="pq-opciones" className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                      Opciones (una por línea)
                    </label>
                    <textarea
                      id="pq-opciones"
                      rows={5}
                      value={borrador.opciones}
                      onChange={(e) => setBorrador({ ...borrador, opciones: e.target.value })}
                      className={inputCls}
                    />
                  </div>
                )}

                {["text", "textarea", "number"].includes(borrador.tipo) && (
                  <div>
                    <label htmlFor="pq-placeholder" className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                      Texto de ejemplo dentro del campo (opcional)
                    </label>
                    <input
                      id="pq-placeholder"
                      value={borrador.placeholder}
                      onChange={(e) => setBorrador({ ...borrador, placeholder: e.target.value })}
                      className={inputCls}
                    />
                  </div>
                )}

                <div>
                  <label htmlFor="pq-paso" className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                    Paso del formulario
                  </label>
                  <select
                    id="pq-paso"
                    value={borrador.paso}
                    onChange={(e) =>
                      setBorrador({ ...borrador, paso: e.target.value === NUEVO_PASO ? NUEVO_PASO : Number(e.target.value) })
                    }
                    className={inputCls}
                  >
                    {pasos.map((g, i) => (
                      <option key={g.paso} value={g.paso}>
                        Paso {i + 1} · {g.titulo}
                      </option>
                    ))}
                    <option value={NUEVO_PASO}>+ Paso nuevo</option>
                  </select>
                  {borrador.paso === NUEVO_PASO && (
                    <input
                      aria-label="Título del paso nuevo"
                      placeholder="Título del paso nuevo"
                      value={borrador.pasoTituloNuevo}
                      onChange={(e) => setBorrador({ ...borrador, pasoTituloNuevo: e.target.value })}
                      className={`${inputCls} mt-2`}
                    />
                  )}
                </div>

                <label
                  htmlFor="pq-requerida"
                  className={`flex items-center gap-3 text-sm font-semibold ${
                    borrador.fija && FIJAS_OBLIGATORIAS.includes(borrador.clave ?? "") ? "opacity-60" : ""
                  }`}
                >
                  <input
                    id="pq-requerida"
                    type="checkbox"
                    checked={borrador.requerida}
                    disabled={borrador.fija && FIJAS_OBLIGATORIAS.includes(borrador.clave ?? "")}
                    onChange={(e) => setBorrador({ ...borrador, requerida: e.target.checked })}
                    className="h-5 w-5 accent-[#D01C1F]"
                  />
                  Respuesta obligatoria
                </label>

                {errorForm && (
                  <p className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">{errorForm}</p>
                )}

                <button
                  onClick={guardar}
                  disabled={guardando}
                  className="flex h-12 w-full items-center justify-center rounded-full bg-primary text-sm font-extrabold uppercase tracking-widest text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
                >
                  {guardando ? <Loader2 className="h-5 w-5 animate-spin" /> : "Guardar pregunta"}
                </button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
