import { useState } from "react";
import { useParams, Navigate, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Calendar, MapPin, Clock, ArrowRight, Mail } from "lucide-react";
import FlyFreePanel from "@/components/FlyFreePanel";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { getMasterclass } from "@/data/masterclasses";

const FormSchema = z.object({
  name: z.string().trim().min(2, "Ingresá tu nombre"),
  email: z.string().trim().email("Email inválido"),
  phone: z.string().trim().max(40).optional(),
  equipo: z.string().min(1, "Indicá tu situación de equipo"),
  motivacion: z.string().min(1, "Elegí una opción"),
  website: z.string().max(0).optional(),
});

type FormData = z.infer<typeof FormSchema>;

const EQUIPO_OPCIONES = [
  { value: "alquiler", label: "Sí, voy a necesitar alquilar equipo" },
  { value: "propio", label: "No, tengo mi propio equipo" },
  { value: "considerando", label: "Estoy pensando en comprar mi propio equipo" },
];

const MOTIVACIONES = [
  "Aprender desde cero",
  "Mejorar mis habilidades",
  "Conectar con la comunidad",
  "Probar algo nuevo y moverme",
];

const ListaEsperaPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const mc = getMasterclass(slug);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [equipoValue, setEquipoValue] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(FormSchema),
  });

  if (!mc) return <Navigate to="/" replace />;

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setApiError(null);
    try {
      const { data: res, error } = await supabase.functions.invoke(
        "subscribe-lista-espera",
        {
          body: {
            name: data.name,
            email: data.email,
            phone: data.phone ?? "",
            sede: mc.sede,
            equipo: data.equipo,
            motivacion: data.motivacion,
            website: data.website ?? "",
          },
        }
      );
      if (error) throw error;
      if (res?.success) {
        navigate("/masterclass-de-patinaje/lista-de-espera-confirmada", {
          state: { sede: mc.sede, fechaLabel: mc.fechaLabel },
        });
      } else {
        setApiError("No pudimos registrarte. Intentá de nuevo.");
      }
    } catch {
      setApiError("Algo salió mal. Intentá de nuevo en un momento.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Lista de Espera — Masterclass {mc.sede} | NM Roller</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <Navbar />

      {/* HERO */}
      <section
        className="relative min-h-[50vh] flex items-center overflow-hidden pt-20 pb-12"
        style={{
          backgroundImage: `url('/patinadores-comunidad.png')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/65" />
        <div className="relative z-10 max-w-3xl mx-auto px-6 w-full text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/60 bg-primary/20 backdrop-blur-md px-4 py-1.5 mb-5">
            <span className="text-xs font-bold uppercase tracking-widest text-primary">
              Lista de Espera
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white leading-tight mb-4">
            La venta cerró, pero podés ser{" "}
            <span className="text-primary">el primero en la próxima</span>
          </h1>
          <p className="text-white/80 text-base sm:text-lg mb-8">
            Anotate ahora y te avisamos antes que nadie cuando abran los cupos.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { Icon: Calendar, label: mc.fechaLabel },
              { Icon: Clock, label: mc.hora },
              { Icon: MapPin, label: mc.sede },
            ].map(({ Icon, label }) => (
              <div
                key={label}
                className="bg-white/10 border border-white/20 rounded-xl px-4 py-2 flex items-center gap-2 backdrop-blur-sm"
              >
                <Icon className="w-4 h-4 text-primary" />
                <span className="text-xs font-semibold text-white">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FORMULARIO */}
      <section className="py-16 bg-background">
        <div className="max-w-lg mx-auto px-6">
          <div className="bg-card border border-border rounded-2xl p-8 shadow-xl">
            {/* Badge urgencia */}
            <div className="flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-4 py-1.5 mb-6 w-fit mx-auto">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-bold text-primary uppercase tracking-widest">
                Sumate a la lista prioritaria · Asegurá tu lugar antes que nadie
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-center mb-3">
              ¿Querés ser parte de la próxima{" "}
              <span className="text-primary">Masterclass</span>?
            </h2>
            <p className="text-sm text-muted-foreground text-center mb-8 leading-relaxed">
              Reservá tu cupo anticipado para vivir una jornada única de aprendizaje,
              comunidad y práctica real.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
              {/* Honeypot */}
              <input type="text" {...register("website")} className="hidden" tabIndex={-1} autoComplete="off" />

              <div className="space-y-1.5">
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  placeholder="Tu nombre"
                  {...register("name")}
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && (
                  <p className="text-xs text-red-500">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email">Tu mejor correo</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="correo@ejemplo.com"
                  {...register("email")}
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && (
                  <p className="text-xs text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phone">
                  WhatsApp{" "}
                  <span className="text-muted-foreground font-normal">(opcional)</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+54 9 11 1234-5678"
                  {...register("phone")}
                />
              </div>

              {/* Campo equipo */}
              <div className="space-y-1.5">
                <Label>¿Vas a necesitar alquilar equipo?</Label>
                <Select
                  onValueChange={(val) => {
                    setEquipoValue(val);
                    setValue("equipo", val, { shouldValidate: true });
                  }}
                >
                  <SelectTrigger className={errors.equipo ? "border-red-500" : ""}>
                    <SelectValue placeholder="Elegí una opción…" />
                  </SelectTrigger>
                  <SelectContent>
                    {EQUIPO_OPCIONES.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.equipo && (
                  <p className="text-xs text-red-500">{errors.equipo.message}</p>
                )}

                {equipoValue === "considerando" && <FlyFreePanel />}
              </div>

              <div className="space-y-1.5">
                <Label>¿Qué te motiva a sumarte?</Label>
                <Select onValueChange={(val) => setValue("motivacion", val, { shouldValidate: true })}>
                  <SelectTrigger className={errors.motivacion ? "border-red-500" : ""}>
                    <SelectValue placeholder="Elegí una opción…" />
                  </SelectTrigger>
                  <SelectContent>
                    {MOTIVACIONES.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.motivacion && (
                  <p className="text-xs text-red-500">{errors.motivacion.message}</p>
                )}
              </div>

              {apiError && (
                <p className="text-sm text-red-500 text-center">{apiError}</p>
              )}

              <Button
                type="submit"
                size="lg"
                disabled={isLoading}
                className="w-full rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-base py-6 group whitespace-normal leading-tight"
              >
                {isLoading ? "Registrando…" : "Quiero que me avisen primero"}
                {!isLoading && (
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center leading-relaxed">
                <Mail className="w-3 h-3 inline mr-1 mb-0.5" />
                Al registrarte vas a recibir información de tu interés sobre la comunidad
                NM Roller: novedades, fechas, beneficios y más. Podés darte de baja cuando
                quieras.
              </p>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ListaEsperaPage;
