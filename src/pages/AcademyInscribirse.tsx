import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  ETIQUETAS_RESPUESTAS,
  OPCIONES_CONOCISTE,
  OPCIONES_COSTO,
  OPCIONES_PRESUPUESTO,
  OPCIONES_REINVERTIRIA,
  OPCIONES_UTILIDAD,
} from "@/data/academy";
import logo from "@/assets/Logo-NM-Rollers.png";
import EcosistemaNM from "@/components/academy/EcosistemaNM";

type Campo = {
  key: string;
  label: string;
  tipo: "text" | "email" | "tel" | "number" | "textarea" | "opciones" | "multi" | "escala";
  requerido?: boolean;
  placeholder?: string;
  opciones?: string[];
};

type Paso = { titulo: string; bajada?: string; campos: Campo[] };

const L = (k: string) => ETIQUETAS_RESPUESTAS[k];

const PASOS: Paso[] = [
  {
    titulo: "Empecemos por vos",
    bajada: "Con estos datos te vamos a contactar.",
    campos: [
      { key: "nombre_apellido", label: "Nombre y apellido", tipo: "text", requerido: true, placeholder: "Ej: Juan Pérez" },
      { key: "email", label: "Email", tipo: "email", requerido: true, placeholder: "juan@email.com" },
      { key: "whatsapp", label: "WhatsApp (con código de tu país)", tipo: "tel", requerido: true, placeholder: "+54 9 11 1234 5678" },
    ],
  },
  {
    titulo: "¿De dónde sos?",
    campos: [
      { key: "pais_ciudad", label: "País y ciudad", tipo: "text", requerido: true, placeholder: "Buenos Aires, Argentina" },
      { key: "edad", label: "Edad", tipo: "number", requerido: true, placeholder: "30" },
      { key: "instagram", label: "Instagram (opcional)", tipo: "text", placeholder: "@usuario" },
    ],
  },
  {
    titulo: "Tu camino en el patín",
    campos: [
      { key: "anos_patinando", label: "¿Hace cuánto tiempo patinás?", tipo: "text", placeholder: "Ej: 5 años" },
      { key: "costo_aprender", label: L("costo_aprender"), tipo: "opciones", opciones: OPCIONES_COSTO },
      { key: "como_me_conociste", label: "¿Cómo me conociste? (podés marcar más de una)", tipo: "multi", opciones: OPCIONES_CONOCISTE },
    ],
  },
  {
    titulo: "Tu nivel",
    campos: [
      { key: "nivel", label: L("nivel"), tipo: "textarea", requerido: true, placeholder: "Ej: intermedio, me interesa freestyle y slalom" },
      { key: "experiencia", label: L("experiencia"), tipo: "textarea" },
      { key: "frecuencia_practica", label: L("frecuencia_practica"), tipo: "text", placeholder: "Ej: 3 veces por semana" },
    ],
  },
  {
    titulo: "Tu motivación",
    campos: [
      { key: "motivacion", label: L("motivacion"), tipo: "textarea", requerido: true },
      { key: "otros_objetivos", label: L("otros_objetivos"), tipo: "textarea" },
      { key: "frase_identidad", label: L("frase_identidad"), tipo: "text" },
    ],
  },
  {
    titulo: "Cómo enseñarías",
    bajada: "Contanos cómo actuarías en una clase real.",
    campos: [
      { key: "alumno_miedo", label: L("alumno_miedo"), tipo: "textarea" },
      { key: "ritmos_aprendizaje", label: L("ritmos_aprendizaje"), tipo: "textarea" },
      { key: "caida_alumno", label: L("caida_alumno"), tipo: "textarea" },
    ],
  },
  {
    titulo: "Tu compromiso",
    campos: [
      { key: "manejo_frustracion", label: L("manejo_frustracion"), tipo: "textarea" },
      { key: "tiempo_tecnicas", label: L("tiempo_tecnicas"), tipo: "textarea" },
      { key: "mantenerse_informado", label: L("mantenerse_informado"), tipo: "textarea" },
    ],
  },
  {
    titulo: "Tu futuro como instructor",
    campos: [
      { key: "importancia_equipo", label: L("importancia_equipo"), tipo: "textarea" },
      { key: "invertir_futuro", label: L("invertir_futuro"), tipo: "textarea" },
      { key: "mensaje_yo_18", label: L("mensaje_yo_18"), tipo: "text" },
    ],
  },
  {
    titulo: "Tu inversión",
    campos: [
      { key: "presupuesto", label: L("presupuesto"), tipo: "opciones", requerido: true, opciones: OPCIONES_PRESUPUESTO },
      { key: "reinvertiria", label: L("reinvertiria"), tipo: "opciones", opciones: OPCIONES_REINVERTIRIA },
      { key: "utilidad_encuesta", label: L("utilidad_encuesta"), tipo: "escala", opciones: OPCIONES_UTILIDAD },
    ],
  },
];

const COLUMNAS = ["nombre_apellido", "email", "whatsapp", "pais_ciudad", "edad", "instagram", "anos_patinando", "como_me_conociste"];

const inputCls =
  "w-full rounded-xl border border-border bg-background px-4 py-3 text-base text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none";

export default function AcademyInscribirse() {
  const navigate = useNavigate();
  const [paso, setPaso] = useState(0);
  const [datos, setDatos] = useState<Record<string, string>>({});
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [enviando, setEnviando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState("");
  const [enviado, setEnviado] = useState(false);

  const actual = PASOS[paso];
  const esUltimo = paso === PASOS.length - 1;

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
      nombre_apellido: datos.nombre_apellido.trim(),
      email: datos.email.trim(),
      instagram: datos.instagram?.trim() || null,
      pais_ciudad: datos.pais_ciudad.trim(),
      anos_patinando: datos.anos_patinando?.trim() || null,
      edad: Number(datos.edad) || null,
      whatsapp: datos.whatsapp.trim(),
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
          Paso {paso + 1} de {PASOS.length}
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
            aria-valuemax={PASOS.length}
            aria-valuenow={paso + 1}
            className="flex flex-1 gap-1"
          >
            {PASOS.map((p, i) => (
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
