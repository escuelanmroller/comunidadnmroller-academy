import { useState } from "react";
import {
  PackageX,
  AlertTriangle,
  CircleCheck,
  ArrowRight,
  ShieldAlert,
  Star,
  ShoppingBag,
  Package,
  MapPin,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

const WHATSAPP = "5491165920600";
const wa = (txt: string) =>
  `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(txt)}`;

const FALTA_ALGO_MSG =
  "[LP|NM|SS] Hola, soy Socio de SportClub y me gustaría saber más información sobre [indique si desea comprar o alquilar]";

const KIT_URL = "https://lp.flyfreeurban.com/kit-de-iniciacion-adulto/";

const scrollTo = (id: string) =>
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

const PreFiltroEquipo = () => {
  const [open, setOpen] = useState(false);

  // Cierra el modal y luego scrollea (espera a que el target sea visible)
  const closeAndScroll = (id: string) => {
    setOpen(false);
    setTimeout(() => scrollTo(id), 80);
  };

  return (
    <section className="px-6 lg:px-16 py-16 border-b border-border">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-xs uppercase tracking-[0.18em] text-primary font-bold">
            Empezá acá
          </span>
        </div>
        <h2 className="font-display italic uppercase text-3xl md:text-5xl font-black mb-3">
          ¿Con qué equipo contás?
        </h2>
        <p className="text-foreground/70 max-w-2xl mb-8">
          Elegí la opción que te describe y te llevamos directo al lugar correcto.
        </p>

        <div className="grid md:grid-cols-3 gap-4">
          {/* No tengo equipo → abre el pop-up */}
          <button
            onClick={() => setOpen(true)}
            className="group text-left bg-card border border-border p-6 hover:border-primary/50 transition-colors flex flex-col"
          >
            <PackageX className="w-8 h-8 text-primary mb-4" strokeWidth={2} />
            <h3 className="font-display italic uppercase text-xl font-black mb-2">
              No tengo equipo
            </h3>
            <p className="text-foreground/60 text-sm leading-relaxed mb-6 flex-1">
              No tengo rollers ni protecciones. Quiero empezar de cero.
            </p>
            <span className="inline-flex items-center gap-2 text-primary font-bold uppercase tracking-[0.14em] text-xs">
              Ver mis opciones
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </button>

          {/* Me falta algo → WhatsApp */}
          <a
            href={wa(FALTA_ALGO_MSG)}
            target="_blank"
            rel="noopener noreferrer"
            className="group text-left bg-card border border-border p-6 hover:border-primary/50 transition-colors flex flex-col"
          >
            <AlertTriangle className="w-8 h-8 text-primary mb-4" strokeWidth={2} />
            <h3 className="font-display italic uppercase text-xl font-black mb-2">
              Me falta algo
            </h3>
            <p className="text-foreground/60 text-sm leading-relaxed mb-6 flex-1">
              Tengo rollers, pero me falta el casco o alguna protección (muñequeras,
              coderas o rodilleras).
            </p>
            <span className="inline-flex items-center gap-2 text-primary font-bold uppercase tracking-[0.14em] text-xs">
              Completar mi equipo
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </a>

          {/* Ya tengo todo → formulario */}
          <button
            onClick={() => scrollTo("form")}
            className="group text-left bg-card border border-border p-6 hover:border-primary/50 transition-colors flex flex-col"
          >
            <CircleCheck className="w-8 h-8 text-primary mb-4" strokeWidth={2} />
            <h3 className="font-display italic uppercase text-xl font-black mb-2">
              Ya tengo todo
            </h3>
            <p className="text-foreground/60 text-sm leading-relaxed mb-6 flex-1">
              Tengo rollers, casco y protecciones completas. Estoy listo/a para patinar.
            </p>
            <span className="inline-flex items-center gap-2 text-primary font-bold uppercase tracking-[0.14em] text-xs">
              Registrarme y elegir sede
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </button>
        </div>

        {/* Nota de obligatoriedad */}
        <div className="mt-6 flex items-start gap-3 border border-primary/30 bg-primary/5 p-4">
          <ShieldAlert className="w-5 h-5 text-primary mt-0.5 shrink-0" />
          <p className="text-sm text-foreground/80 leading-relaxed">
            <strong className="text-foreground">Importante:</strong> el{" "}
            <strong>casco</strong> y las <strong>protecciones</strong> (muñequeras, coderas
            y rodilleras) son{" "}
            <strong className="text-primary">obligatorios</strong> para tomar clase. Si no
            los tenés, podés alquilarlos como socio (50% OFF) o comprar tu kit.
          </p>
        </div>
      </div>

      {/* ── Pop-up: ¿Alquilás o comprás? ── */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg p-0 overflow-hidden border-border bg-background gap-0">
          <div className="p-6 md:p-8">
            <DialogTitle className="font-display italic uppercase text-2xl md:text-3xl font-black leading-tight mb-2">
              ¿Alquilás o comprás tu equipo?
            </DialogTitle>
            <p className="text-foreground/60 text-sm mb-6">
              Las dos opciones te sirven para arrancar. Te contamos cuál te conviene.
            </p>

            {/* Bloque 1 · Comprar (recomendado) */}
            <div className="relative border border-primary bg-primary/[0.06] p-5 mb-4">
              <div className="absolute -top-2.5 left-4 inline-flex items-center gap-1 bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-[0.16em] px-2.5 py-1">
                <Star className="w-3 h-3 fill-current" /> Recomendado
              </div>
              <div className="flex items-center gap-2 mt-2 mb-2">
                <ShoppingBag className="w-5 h-5 text-primary" />
                <h3 className="font-display italic uppercase text-lg font-black">
                  Comprá tu kit
                </h3>
              </div>
              <p className="text-foreground/70 text-sm leading-relaxed mb-3">
                Conseguí tu kit de iniciación: rollers + protecciones, todo lo que
                necesitás para empezar con lo tuyo.
              </p>
              <p className="text-foreground/50 text-xs leading-relaxed mb-4">
                El alquiler es ideal para <strong>probar y ver la calidad del equipo</strong>;
                después podés migrar a comprar tu propio kit.
              </p>
              <a
                href={KIT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-3 font-bold uppercase tracking-[0.14em] text-xs hover:shadow-[0_0_24px_hsl(var(--primary)/0.6)] transition-all"
              >
                Conocé el kit de iniciación
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>

            {/* Bloque 2 · Alquilar */}
            <div className="border border-border bg-card p-5">
              <div className="flex items-center gap-2 mb-2">
                <Package className="w-5 h-5 text-secondary" />
                <h3 className="font-display italic uppercase text-lg font-black">
                  Alquilá tu equipo
                </h3>
              </div>
              <p className="text-foreground/70 text-sm leading-relaxed mb-2 inline-flex items-start gap-1.5">
                <MapPin className="w-4 h-4 text-secondary mt-0.5 shrink-0" />
                <span>
                  Son <strong>7 sedes</strong> con servicio de alquiler — vas a poder elegir
                  tu sede.
                </span>
              </p>
              <p className="text-foreground/70 text-sm leading-relaxed mb-3">
                Con el plan <strong>4 clases + Alquiler</strong>: las clases son gratis,
                solo abonás el alquiler.
              </p>
              <div className="border-l-2 border-secondary/50 pl-3 mb-4">
                <p className="text-foreground/60 text-xs leading-relaxed">
                  ¿Te convence el equipo? Si arrancás con 4 clases + alquiler y a la{" "}
                  <strong className="text-foreground">2ª clase</strong> decidís comprar tu
                  equipo, lo que abonaste se toma como{" "}
                  <strong className="text-foreground">parte de pago</strong>: esas 2 primeras
                  clases quedan <strong className="text-primary">bonificadas</strong>.
                </p>
              </div>
              <button
                onClick={() => closeAndScroll("planes")}
                className="group inline-flex items-center gap-2 border border-border text-foreground px-5 py-3 font-bold uppercase tracking-[0.14em] text-xs hover:border-primary/50 transition-colors"
              >
                Ver plan de alquiler
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default PreFiltroEquipo;
