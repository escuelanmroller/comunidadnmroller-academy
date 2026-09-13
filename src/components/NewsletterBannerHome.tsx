import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Loader2, Mail, Zap } from "lucide-react";

const FormSchema = z.object({
  name: z.string().trim().min(1, "Ingresá tu nombre").max(100),
  email: z.string().trim().email("Email inválido").max(255),
});

const NewsletterBannerHome = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = FormSchema.safeParse({ name, email });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Datos inválidos");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("subscribe-newsletter", {
        body: { ...parsed.data, website, ubicacion: "home-banner" },
      });
      if (error) throw error;
      if (data?.success) {
        toast.success(
          data.alreadySubscribed ? "Ya estabas en la lista." : "¡Listo! Revisá tu correo."
        );
        navigate("/registro-confirmado-newsletter");
      } else {
        throw new Error(data?.error ?? "Algo salió mal");
      }
    } catch (err: any) {
      toast.error(err?.message ?? "No pudimos sumarte. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-20 md:py-28 border-t border-border bg-card">
      <div className="container mx-auto px-6 lg:px-16 max-w-7xl">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div>
            <div className="inline-flex items-center gap-2 mb-4">
              <Mail className="w-4 h-4 text-primary" />
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary">
                Newsletter Desde Cero
              </span>
            </div>
            <h2 className="font-black italic text-3xl md:text-4xl lg:text-5xl text-foreground leading-tight mb-4">
              ¿Todavía no estás listo para sumarte?
            </h2>
            <p className="text-foreground/60 text-base leading-relaxed mb-4">
              Empezá por acá. Cada semana te mandamos tips para patinar con más confianza,
              motivación real y acceso anticipado a la{" "}
              <Link to="/ruta-de-aprendizaje" className="text-primary hover:underline font-semibold">
                Ruta de Aprendizaje
              </Link>{" "}
              — todo gratis, sin spam.
            </p>
            <ul className="space-y-1.5 text-sm text-foreground/60">
              {[
                "Tips simples para patinar con seguridad",
                "Motivación semanal y mini desafíos",
                "Acceso anticipado a la guía + Bitácora",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="text"
              name="website"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="hidden"
              tabIndex={-1}
              autoComplete="off"
            />
            <Input
              placeholder="Tu nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-background border-border text-foreground placeholder:text-foreground/40 h-12 rounded-none"
              required
            />
            <Input
              type="email"
              placeholder="Tu email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-background border-border text-foreground placeholder:text-foreground/40 h-12 rounded-none"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-white font-black italic text-sm uppercase tracking-[0.12em] py-3.5 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Quiero empezar desde cero
                </>
              )}
            </button>
            <p className="text-foreground/40 text-[11px] text-center">
              Sin spam. Podés darte de baja cuando quieras.
            </p>
          </form>
        </div>
      </div>
    </section>
  );
};

export default NewsletterBannerHome;
