import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Calendar, Clock, MapPin, ArrowRight, Sparkles } from "lucide-react";
import { getProximaMasterclass, precioVigente } from "@/data/masterclasses";

// Popup amigable que invita a la próxima Masterclass. Aparece a los pocos
// segundos en la Home y se recuerda por localStorage (una vez por evento) para
// no resultar molesto. Toma los datos de la próxima masterclass dinámicamente.
const MasterclassPopup = () => {
  const mc = getProximaMasterclass();
  const precios = precioVigente(mc);
  const storageKey = `mc_popup_${mc.slug}`;
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let visto = false;
    try {
      visto = !!localStorage.getItem(storageKey);
    } catch {}
    if (visto) return;
    const t = setTimeout(() => setOpen(true), 2500);
    return () => clearTimeout(t);
  }, [storageKey]);

  const marcarVisto = () => {
    try {
      localStorage.setItem(storageKey, "1");
    } catch {}
  };

  const cerrar = () => {
    marcarVisto();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && cerrar()}>
      <DialogContent className="max-w-md p-0 overflow-hidden border-primary/30">
        {/* Encabezado rojo */}
        <div className="bg-primary text-primary-foreground px-6 pt-6 pb-5">
          <div className="inline-flex items-center gap-1.5 bg-primary-foreground/15 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] mb-3">
            <Sparkles className="w-3 h-3" /> Evento especial
          </div>
          <DialogTitle className="font-display italic uppercase text-2xl md:text-3xl font-black leading-[0.95]">
            Masterclass de Patinaje
          </DialogTitle>
          <p className="text-primary-foreground/90 text-sm mt-2 leading-relaxed">
            Una clase intensiva para subir tu nivel en un solo día. Cupos limitados —
            ¡sumate antes de que se llene!
          </p>
        </div>

        {/* Detalles */}
        <div className="px-6 py-5 space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-primary shrink-0" />
            <span className="font-bold text-foreground">{mc.fechaLabel}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-primary shrink-0" />
            <span className="text-foreground/80">{mc.hora}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-primary shrink-0" />
            <span className="text-foreground/80">{mc.sede}</span>
          </div>

          <p className="text-xs text-foreground/60 pt-1">
            Desde <strong className="text-foreground">{precios.alumnos}</strong> (alumnos) ·{" "}
            <strong className="text-foreground">{precios.general}</strong> general.
          </p>

          <div className="flex flex-col gap-2 pt-2">
            <Link
              to={`/masterclass-de-patinaje/${mc.slug}`}
              onClick={marcarVisto}
              className="group inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground h-12 font-bold uppercase tracking-[0.16em] text-sm transition-all hover:shadow-[0_0_24px_hsl(var(--primary)/0.6)]"
            >
              Quiero sumarme
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <button
              onClick={cerrar}
              className="text-xs text-foreground/50 hover:text-foreground/80 uppercase tracking-[0.14em] font-bold py-1"
            >
              Ahora no
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MasterclassPopup;
