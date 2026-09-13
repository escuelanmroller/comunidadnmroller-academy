import { useState } from "react";
import { Play, ArrowRight, Package, ShoppingBag } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

import logoFlyfree from "@/assets/logo-flyfree-urban.webp";

// Video de YouTube que se reproduce en modal (dentro de la misma landing)
const YT_ID = "qgwPjKBUlCI";
const KIT_URL = "https://lp.flyfreeurban.com/kit-de-iniciacion-adulto/";
const FLYFREE_YELLOW = "#F5C518";
const FLYFREE_YELLOW_DIM = "rgba(245,197,24,0.12)";

const scrollToForm = () =>
  document.getElementById("form")?.scrollIntoView({ behavior: "smooth" });

const EquipoBanners = () => {
  const [videoOpen, setVideoOpen] = useState(false);

  return (
    <section id="equipo" className="px-6 lg:px-16 py-16 border-t border-border scroll-mt-20">
      <div className="max-w-5xl mx-auto">
        {/* Co-branding: alianza con FlyFree */}
        <div className="flex flex-col items-center text-center mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-[#F5C518] font-black text-lg leading-none opacity-60">«</span>
            <p className="text-[11px] uppercase tracking-[0.22em] text-foreground/50 font-bold">
              Equipo en alianza con
            </p>
            <span className="text-[#F5C518] font-black text-lg leading-none opacity-60">»</span>
          </div>
          <span className="inline-flex items-center justify-center bg-white rounded-lg px-6 py-3 shadow-[0_0_24px_rgba(245,197,24,0.25)]">
            <img src={logoFlyfree} alt="FlyFree Urban" className="h-9 md:h-11" />
          </span>
        </div>

        {/* Banners publicitarios (simples) */}
        <div className="grid md:grid-cols-2 gap-5">
          {/* Banner 1 · Alquiler 50% OFF */}
          <div
            className="relative flex flex-col p-7 md:p-8 bg-card border-2 overflow-hidden"
            style={{ borderColor: FLYFREE_YELLOW }}
          >
            <div
              className="inline-flex items-center gap-1.5 self-start text-[10px] font-black uppercase tracking-[0.16em] px-2.5 py-1 mb-4 text-[#111]"
              style={{ backgroundColor: FLYFREE_YELLOW }}
            >
              <Package className="w-3 h-3" /> Alquiler · Socios SportClub
            </div>
            <h3 className="font-display italic uppercase text-2xl md:text-3xl font-black leading-[0.95] mb-3">
              Alquilá los patines con{" "}
              <span style={{ color: FLYFREE_YELLOW }}>50% OFF</span>
            </h3>
            <p className="text-foreground/70 text-sm leading-relaxed mb-6 flex-1">
              Por ser socio SportClub, en efectivo. Rollers y protecciones listos para tu
              clase — sin comprar nada.
            </p>
            <button
              onClick={scrollToForm}
              className="group inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3.5 font-bold uppercase tracking-[0.14em] text-xs md:text-sm hover:shadow-[0_0_24px_hsl(var(--primary)/0.6)] transition-all"
            >
              Me interesa alquilar
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Banner 2 · Kit de iniciación */}
          <div
            className="relative flex flex-col p-7 md:p-8 bg-card border-2 overflow-hidden"
            style={{ borderColor: FLYFREE_YELLOW, background: `linear-gradient(135deg, ${FLYFREE_YELLOW_DIM} 0%, transparent 60%)` }}
          >
            <div
              className="inline-flex items-center gap-1.5 self-start text-[10px] font-black uppercase tracking-[0.16em] px-2.5 py-1 mb-4 text-[#111]"
              style={{ backgroundColor: FLYFREE_YELLOW }}
            >
              <ShoppingBag className="w-3 h-3" /> Kit de iniciación
            </div>
            <h3 className="font-display italic uppercase text-2xl md:text-3xl font-black leading-[0.95] mb-3">
              Armá tu{" "}
              <span style={{ color: FLYFREE_YELLOW }}>propio kit</span>
            </h3>
            <p className="text-foreground/70 text-sm leading-relaxed mb-6 flex-1">
              Rollers + protecciones, todo lo que necesitás para arrancar con lo tuyo.
              Mirá el video y conocé el kit completo.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <a
                href={KIT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center justify-center gap-2 px-6 py-3.5 font-bold uppercase tracking-[0.14em] text-xs md:text-sm transition-all hover:opacity-90"
                style={{ backgroundColor: FLYFREE_YELLOW, color: "#111" }}
              >
                Conocé el kit
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
              <button
                onClick={() => setVideoOpen(true)}
                className="inline-flex items-center gap-2 text-foreground/70 hover:text-foreground font-bold uppercase tracking-[0.14em] text-xs transition-colors"
              >
                <span className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center">
                  <Play className="w-3.5 h-3.5 text-black fill-black ml-0.5" />
                </span>
                Ver video
              </button>
            </div>
          </div>
        </div>

        {/* Nota de alianza */}
        <p className="text-center text-foreground/45 text-xs mt-8">
          Servicio de alquiler y venta del kit de iniciación en colaboración con{" "}
          <span className="font-bold" style={{ color: FLYFREE_YELLOW }}>
            FlyFree Urban
          </span>
          .
        </p>
      </div>

      {/* Modal de video (YouTube embebido en la misma landing) */}
      <Dialog open={videoOpen} onOpenChange={setVideoOpen}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden border-border bg-background">
          <DialogTitle className="sr-only">
            Armá tu kit para arrancar a patinar
          </DialogTitle>
          <div className="relative w-full aspect-video bg-black">
            {videoOpen && (
              <iframe
                className="absolute inset-0 w-full h-full"
                src={`https://www.youtube.com/embed/${YT_ID}?autoplay=1&rel=0`}
                title="Armá tu kit para arrancar a patinar"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default EquipoBanners;
