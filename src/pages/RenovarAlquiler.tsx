import { useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Search, CheckCircle2, AlertCircle } from "lucide-react";
import logoNM from "@/assets/Logo-NM-Rollers.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import AltaAlquilerForm from "@/components/alquiler/AltaAlquilerForm";
import { sedes } from "@/data/sedes";
import { supabase } from "@/integrations/supabase/client";

// Link "oculto" (sin menú, noindex) que la asesora le manda a quien ya alquiló y
// pagó por fuera de la web. Mismo formulario de equipo/turno que la compra online.

const PLANES = [
  { slug: "clase-unica", label: "Clase Única + Alquiler" },
  { slug: "clase-2x1", label: "Clase 2x1 + Alquiler" },
  { slug: "pack-4-clases", label: "Pack 4 Clases + Alquiler" },
] as const;

const TALLES_ROPA = ["XS", "S", "M", "L", "XL", "XXL"];
const MAX_INTENTOS = 2;
const INTENTOS_KEY = "renovar_alquiler_intentos";

const leerIntentos = () => {
  try {
    return Number(localStorage.getItem(INTENTOS_KEY) ?? 0) || 0;
  } catch {
    return 0;
  }
};

interface DatosPrevios {
  nombre?: string;
  apellido?: string;
  whatsapp?: string;
  correo?: string;
  sede?: string;
  talle_calzado?: string;
  talle_ropa?: string;
}

type EstadoBusqueda = "idle" | "buscando" | "encontrado" | "no-encontrado" | "error";

const opcionClass = (activa: boolean) =>
  `flex-1 min-h-12 px-4 py-3 border-2 font-bold uppercase tracking-[0.12em] text-xs whitespace-normal leading-tight transition-colors ${
    activa ? "border-primary bg-primary text-primary-foreground" : "border-foreground/15 bg-background hover:border-primary/60"
  }`;

const RenovarAlquiler = () => {
  const [yaAlquilo, setYaAlquilo] = useState<boolean | null>(null);
  const [dniBusqueda, setDniBusqueda] = useState("");
  const [estado, setEstado] = useState<EstadoBusqueda>("idle");
  const [intentos, setIntentos] = useState(leerIntentos);
  const [versionPrecarga, setVersionPrecarga] = useState(0);
  const [inicial, setInicial] = useState<{ sedeId?: string; talleCalzado?: string; talleRopa?: string; sinRollers?: boolean }>();

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [dni, setDni] = useState("");
  const [yaPague, setYaPague] = useState(false);
  const [planSlug, setPlanSlug] = useState("");

  const sinIntentos = intentos >= MAX_INTENTOS;
  const mostrarDatos =
    yaAlquilo === false || estado === "encontrado" || estado === "error" || (estado === "no-encontrado" && sinIntentos);
  const contactoOk =
    nombre.trim().length > 1 && /^\S+@\S+\.\S+$/.test(email) && telefono.trim().length >= 6 && dni.trim().length >= 6;
  const plan = PLANES.find((p) => p.slug === planSlug);

  const precargar = (d: DatosPrevios) => {
    setNombre([d.nombre, d.apellido].filter(Boolean).join(" ").trim());
    setEmail(d.correo ?? "");
    setTelefono(d.whatsapp ?? "");
    const sede = sedes.find(
      (s) => s.alquiler && s.nombre.trim().toLowerCase() === (d.sede ?? "").trim().toLowerCase(),
    );
    const calzado = (d.talle_calzado ?? "").trim();
    const traeRollers = calzado.toLowerCase().startsWith("no aplica");
    setInicial({
      sedeId: sede?.id,
      sinRollers: traeRollers,
      talleCalzado: traeRollers ? "" : calzado.replace(/\D/g, ""),
      talleRopa: TALLES_ROPA.includes((d.talle_ropa ?? "").toUpperCase()) ? d.talle_ropa!.toUpperCase() : "",
    });
    setVersionPrecarga((v) => v + 1);
  };

  const buscar = async () => {
    if (sinIntentos || dniBusqueda.replace(/\D/g, "").length < 6) return;
    setEstado("buscando");
    setDni(dniBusqueda.trim());
    try {
      // Nunca dejar a la persona trabada en "Buscando…": si no hay respuesta, completa a mano.
      const { data, error } = await Promise.race([
        supabase.functions.invoke("buscar-alquiler-dni", { body: { dni: dniBusqueda.trim() } }),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error("timeout")), 25000)),
      ]);
      if (error || !data || "error" in data) throw error ?? new Error("lookup_failed");
      if (data.encontrado && data.datos) {
        precargar(data.datos as DatosPrevios);
        setEstado("encontrado");
        return;
      }
      const nuevos = intentos + 1;
      setIntentos(nuevos);
      try {
        localStorage.setItem(INTENTOS_KEY, String(nuevos));
      } catch {
        /* sin storage: el límite queda solo en memoria */
      }
      setEstado("no-encontrado");
    } catch {
      setEstado("error");
    }
  };

  return (
    <>
      <Helmet>
        <title>Reservá tu turno · NM Roller</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <main className="min-h-screen bg-background text-foreground">
        <header className="pt-8 pb-4 flex justify-center bg-primary">
          <Link to="/" aria-label="Volver al inicio">
            <img src={logoNM} alt="NM Roller" className="h-14" />
          </Link>
        </header>

        <section className="bg-primary text-primary-foreground pt-8 pb-12 px-6 text-center">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase italic leading-tight mb-4">
              Volvé a patinar con equipo incluido
            </h1>
            <p className="text-sm md:text-base text-primary-foreground/85 leading-relaxed">
              Completá esto para que te preparemos rollers, casco y protecciones para tu turno.
            </p>
          </div>
        </section>

        <section className="px-4 sm:px-6 py-10 md:py-14">
          <div className="max-w-2xl mx-auto space-y-8">
            {/* Paso 1 — ¿ya alquiló? */}
            <div className="space-y-3">
              <p className="uppercase tracking-[0.12em] text-xs font-bold">¿Ya alquilaste antes con nosotros?</p>
              <div className="flex gap-3">
                <button type="button" className={opcionClass(yaAlquilo === true)} onClick={() => setYaAlquilo(true)}>
                  Sí, ya alquilé
                </button>
                <button
                  type="button"
                  className={opcionClass(yaAlquilo === false)}
                  onClick={() => {
                    setYaAlquilo(false);
                    setEstado("idle");
                  }}
                >
                  No, es mi primera vez
                </button>
              </div>
            </div>

            {yaAlquilo === true && estado !== "encontrado" && (
              <div className="border-2 border-foreground/10 p-5 space-y-3">
                <Label htmlFor="ren-dni-busqueda">Tu DNI</Label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Input
                    id="ren-dni-busqueda"
                    inputMode="numeric"
                    placeholder="Solo números"
                    value={dniBusqueda}
                    disabled={sinIntentos || estado === "buscando"}
                    onChange={(e) => setDniBusqueda(e.target.value)}
                  />
                  <Button
                    type="button"
                    onClick={buscar}
                    disabled={sinIntentos || estado === "buscando" || dniBusqueda.replace(/\D/g, "").length < 6}
                    className="sm:w-auto whitespace-normal leading-tight"
                  >
                    <Search className="w-4 h-4 mr-2 shrink-0" /> {estado === "buscando" ? "Buscando..." : "Buscar mis datos"}
                  </Button>
                </div>
                {estado === "no-encontrado" && !sinIntentos && (
                  <p className="text-xs text-primary flex items-start gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    No encontramos ese DNI. Revisalo bien: te queda 1 intento.
                  </p>
                )}
                {sinIntentos && (
                  <p className="text-xs text-foreground/70">
                    No pudimos encontrar tus datos — completalos abajo y listo.
                  </p>
                )}
                {estado === "error" && (
                  <p className="text-xs text-foreground/70">
                    No pudimos buscar tus datos en este momento — completalos abajo.
                  </p>
                )}
              </div>
            )}

            {estado === "encontrado" && (
              <p className="border border-[#25D366]/40 bg-[#25D366]/10 p-3.5 text-sm flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#25D366] mt-0.5 shrink-0" />
                ¡Te encontramos! Revisá que tus datos sigan siendo correctos y corregí lo que haya cambiado.
              </p>
            )}

            {/* Paso 2 — datos de contacto */}
            {mostrarDatos && (
              <div className="space-y-4">
                <p className="uppercase tracking-[0.12em] text-xs font-bold">Tus datos</p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="ren-nombre">Nombre y apellido *</Label>
                    <Input id="ren-nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="ren-dni">DNI *</Label>
                    <Input id="ren-dni" inputMode="numeric" value={dni} onChange={(e) => setDni(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="ren-email">Email *</Label>
                    <Input id="ren-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="ren-telefono">WhatsApp *</Label>
                    <Input
                      id="ren-telefono"
                      inputMode="tel"
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Paso 3 — pago y plan */}
            {mostrarDatos && (
              <div className="space-y-4">
                <div className="flex items-start gap-2">
                  <Checkbox
                    id="ren-ya-pague"
                    checked={yaPague}
                    onCheckedChange={(v) => setYaPague(v === true)}
                    className="mt-0.5"
                  />
                  <Label htmlFor="ren-ya-pague" className="text-sm leading-snug cursor-pointer">
                    Ya pagué mi alquiler con mi asesora *
                  </Label>
                </div>

                {yaPague && (
                  <div className="space-y-3">
                    <p className="uppercase tracking-[0.12em] text-xs font-bold">¿Qué pagaste?</p>
                    <div className="grid sm:grid-cols-3 gap-3">
                      {PLANES.map((p) => (
                        <button
                          key={p.slug}
                          type="button"
                          className={opcionClass(planSlug === p.slug)}
                          onClick={() => setPlanSlug(p.slug)}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Paso 4 — equipo, turno y comprobante (mismo formulario que la compra online) */}
            {mostrarDatos && yaPague && plan && (
              <>
                {!contactoOk && (
                  <p className="text-xs text-foreground/55 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> Completá tus datos de arriba para continuar.
                  </p>
                )}
                <div hidden={!contactoOk}>
                  <AltaAlquilerForm
                    key={`${plan.slug}-${versionPrecarga}`}
                    nombre={nombre.trim()}
                    email={email.trim()}
                    telefono={telefono.trim()}
                    dni={dni.trim()}
                    planSlug={plan.slug}
                    planLabel={plan.label}
                    origen="renovacion"
                    inicial={inicial}
                  />
                </div>
              </>
            )}
          </div>
        </section>
      </main>
    </>
  );
};

export default RenovarAlquiler;
