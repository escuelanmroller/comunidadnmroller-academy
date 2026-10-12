import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { anosDisponibles, armarPasos, PREGUNTAS_DEFAULT, type Paso, type Pregunta } from "@/data/academyPreguntas";
import logo from "@/assets/Logo-NM-Rollers.png";
import EcosistemaNM from "@/components/academy/EcosistemaNM";

const COLUMNAS = ["nombre_apellido", "email", "whatsapp", "pais_ciudad", "edad", "instagram", "anos_patinando", "como_me_conociste"];

const inputCls =
  "w-full rounded-xl border border-border bg-background px-4 py-3 text-base text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none";

export default function AcademyInscribirse() {
  const navigate = useNavigate();
  const [pasos, setPasos] = useState<Paso[]>(() => armarPasos(PREGUNTAS_DEFAULT));
  const [cargando, setCargando] = useState(true);
  const [paso, setPaso] = useState(0);
  const [datos, setDatos] = useState<Record<string, string>>({});
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [enviando, setEnviando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState("");
  const [enviado, setEnviado] = useState(false);

  useEffect(() => {
    let cancelado = false;
    supabase
      .from("academy_preguntas")
      .select("*")
      .eq("activa", true)
      .then(({ data, error }) => {
        if (cancelado) return;
        // Si la base no responde, se usa el formulario de origen para no perder inscripciones.
        if (!error && data && data.length > 0) {
          setPasos(armarPasos(data.map((d) => ({ ...d, tipo: d.tipo as Pregunta["tipo"], opciones: (d.opciones ?? []) as string[] }))));
        }
        setCargando(false);
      });
    return () => {
      cancelado = true;
    };
  }, []);

  const actual = pasos[Math.min(paso, pasos.length - 1)];
  const esUltimo = paso >= pasos.length - 1;

  const set = (key: string, valor: string) => {
    setDatos((d) => ({ ...d, [key]: valor }));
    if (errores[key]) setErrores((e) => ({ ...e, [key]: "" }));
  };

  const toggleMulti = (key: string, opcion: string) => {
    const lista = (datos[key] ?? "").split(";").filter(Boolean);
    set(key, (lista.includes(opcion) ? lista.filter((o) => o !== opcion) : [...lista, opcion]).join(";"));
  };

  const validar = (): boolean => {
    const nuevos: Record<string, string> = {};
    actual.campos.forEach((c) => {
      const v = (datos[c.key] ?? "").trim();
      if (c.requerido && !v) nuevos[c.key] = "Este dato es obligatorio";
      else if (c.key === "email" && v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) nuevos[c.key] = "Revisá el email";
      else if (c.key === "whatsapp" && v && v.replace(/\D/g, "").length < 8) nuevos[c.key] = "Revisá el número";
      else if (c.key === "edad" && v && (Number(v) < 10 || Number(v) > 99)) nuevos[c.key] = "Revisá la edad";
    });
    setErrores(nuevos);
    return Object.keys(nuevos).length === 0;
  };

  const irAPaso = (n: number) => {
    setPaso(n);
    window.scrollTo({ top: 0 });
  };

  const enviar = async () => {
    setEnviando(true);
    setErrorEnvio("");
    const respuestas: Record<string, string> = {};
    Object.entries(datos).forEach(([k, v]) => {
      if (!COLUMNAS.includes(k) && v.trim()) respuestas[k] = v.trim();
    });
    if (datos.instagram?.trim()) respuestas.instagram = datos.instagram.trim();

    const { error } = await supabase.from("academy_instructores").insert({
      nombre_apellido: (datos.nombre_apellido ?? "").trim(),
      email: (datos.email ?? "").trim(),
      instagram: datos.instagram?.trim() || null,
      pais_ciudad: datos.pais_ciudad?.trim() || null,
      anos_patinando: datos.anos_patinando?.trim() || null,
      edad: Number(datos.edad) || null,
      whatsapp: datos.whatsapp?.trim() || null,
      como_me_conociste: datos.como_me_conociste || null,
      respuestas,
      estado: "nuevo",
    });
    setEnviando(false);
    if (error) {
      setErrorEnvio(
        error.code === "23505"
          ? "Ya tenemos una inscripción con ese email. Si querés cambiar algo, escribinos por WhatsApp."
          : "No pudimos enviar tu inscripción. Probá de nuevo en un momento.",
      );
      return;
    }
    setEnviado(true);
    window.scrollTo({ top: 0 });
  };

  const siguiente = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validar()) return;
    if (esUltimo) enviar();
    else irAPaso(paso + 1);
  };

  const volver = () => {
    if (paso === 0) navigate("/academy");
    else irAPaso(paso - 1);
  };

  const opcionCls = (activa: boolean) =>
    `w-full rounded-2xl border-2 px-4 py-3 text-left text-sm font-semibold transition-colors ${
      activa ? "border-emerald-500 bg-emerald-500/10 text-emerald-300" : "border-border bg-background hover:border-border/80"
    }`;

  if (cargando) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </main>
    );
  }

  if (enviado) {
    return (
      <main className="min-h-screen bg-background px-4 py-8 text-foreground">
        <div className="mx-auto w-full max-w-3xl space-y-10">
          <div className="mx-auto w-full max-w-xl rounded-3xl border border-border bg-card p-8 text-center">
            <CheckCircle2 className="mx-auto mb-5 h-14 w-14 text-emerald-400" />
            <h1 className="mb-3 text-xl font-extrabold sm:text-2xl">¡Inscripción enviada!</h1>
            <p className="mb-6 text-sm text-muted-foreground">
              Gracias por tu interés en NM Academy. Nico se va a poner en contacto con vos por WhatsApp para definir tu
              programa.
            </p>
            <button
              onClick={() => navigate("/academy")}
              className="h-12 w-full rounded-full bg-primary text-sm font-extrabold uppercase tracking-widest text-primary-foreground hover:bg-primary/90"
            >
              Volver al inicio
            </button>
          </div>
          <EcosistemaNM />
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-8 text-foreground">
      <form onSubmit={siguiente} noValidate className="w-full max-w-xl rounded-3xl border border-border bg-card p-5 sm:p-8">
        <img src={logo} alt="NM Roller" className="mx-auto mb-3 h-16 w-16 rounded-full object-contain" />
        <h1 className="text-center text-xl font-extrabold sm:text-2xl">Inscribite en NM Academy</h1>
        <p className="mb-5 mt-1 text-center text-sm text-muted-foreground">
          Paso {paso + 1} de {pasos.length}
        </p>

        <div className="mb-6 flex items-center gap-3">
          <button
            type="button"
            onClick={volver}
            className="shrink-0 rounded-full border border-border px-4 py-2 text-xs font-bold hover:bg-background"
          >
            ← Volver
          </button>
          <div
            role="progressbar"
            aria-valuemin={1}
            aria-valuemax={pasos.length}
            aria-valuenow={paso + 1}
            className="flex flex-1 gap-1"
          >
            {pasos.map((p, i) => (
              <span key={p.titulo} className={`h-1 flex-1 rounded-full ${i <= paso ? "bg-primary" : "bg-border"}`} />
            ))}
          </div>
        </div>

        <h2 className="text-lg font-extrabold">{actual.titulo}</h2>
        {actual.bajada && <p className="mb-1 mt-1 text-sm text-muted-foreground">{actual.bajada}</p>}

        <div className="mt-5 space-y-5">
          {actual.campos.map((c) => {
            const id = `academy-${c.key}`;
            const valor = datos[c.key] ?? "";
            return (
              <div key={c.key}>
                {c.tipo === "opciones" || c.tipo === "multi" || c.tipo === "escala" ? (
                  <p className="mb-2 text-sm font-semibold">
                    {c.label}
                    {c.requerido && <span className="text-primary"> *</span>}
                  </p>
                ) : (
                  <label htmlFor={id} className="mb-2 block text-sm font-semibold">
                    {c.label}
                    {c.requerido && <span className="text-primary"> *</span>}
                  </label>
                )}

                {(c.tipo === "text" || c.tipo === "email" || c.tipo === "tel" || c.tipo === "number") && (
                  <input
                    id={id}
                    type={c.tipo}
                    inputMode={c.tipo === "number" ? "numeric" : undefined}
                    value={valor}
                    onChange={(e) => set(c.key, e.target.value)}
                    placeholder={c.placeholder}
                    className={inputCls}
                  />
                )}

                {c.tipo === "textarea" && (
                  <textarea
                    id={id}
                    rows={3}
                    value={valor}
                    onChange={(e) => set(c.key, e.target.value)}
                    placeholder={c.placeholder}
                    className={inputCls}
                  />
                )}

                {c.tipo === "anio" && (
                  <select id={id} value={valor} onChange={(e) => set(c.key, e.target.value)} className={inputCls}>
                    <option value="">Elegí un año</option>
                    {anosDisponibles().map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                )}

                {c.tipo === "opciones" && (
                  <div id={id} className="space-y-2">
                    {c.opciones?.map((o) => (
                      <button type="button" key={o} onClick={() => set(c.key, o)} className={opcionCls(valor === o)}>
                        {o} {valor === o && "✓"}
                      </button>
                    ))}
                  </div>
                )}

                {c.tipo === "multi" && (
                  <div id={id} className="grid grid-cols-2 gap-2">
                    {c.opciones?.map((o) => {
                      const activa = valor.split(";").includes(o);
                      return (
                        <button type="button" key={o} onClick={() => toggleMulti(c.key, o)} className={opcionCls(activa)}>
                          {o} {activa && "✓"}
                        </button>
                      );
                    })}
                  </div>
                )}

                {c.tipo === "escala" && (
                  <div id={id} className="flex gap-2">
                    {c.opciones?.map((o) => (
                      <button
                        type="button"
                        key={o}
                        onClick={() => set(c.key, o)}
                        className={`${opcionCls(valor === o)} text-center`}
                      >
                        {o}
                      </button>
                    ))}
                  </div>
                )}

                {errores[c.key] && <p className="mt-1.5 text-xs font-semibold text-red-400">{errores[c.key]}</p>}
              </div>
            );
          })}
        </div>

        {errorEnvio && (
          <p className="mt-5 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">{errorEnvio}</p>
        )}

        <button
          type="submit"
          disabled={enviando}
          className="mt-6 flex h-14 w-full items-center justify-center rounded-full bg-primary text-sm font-extrabold uppercase tracking-widest text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
        >
          {enviando ? <Loader2 className="h-5 w-5 animate-spin" /> : esUltimo ? "Enviar inscripción" : "Siguiente"}
        </button>
      </form>
    </main>
  );
}
