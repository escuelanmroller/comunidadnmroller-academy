import { useEffect, useRef, useState } from "react";
import { Clock, AlertTriangle } from "lucide-react";
import { differenceInSeconds } from "date-fns";

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
}

interface Props {
  ventaHasta: Date;
  cupos: number;
  onExpired?: () => void;
}

const TZ = "America/Argentina/Buenos_Aires";

// "hasta el jueves 9 de julio a las 12 del mediodía" — derivado de ventaHasta
// para que el texto nunca quede desactualizado respecto del contador.
const ventaHastaTexto = (ventaHasta: Date): string => {
  const fecha = ventaHasta
    .toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long", timeZone: TZ })
    .replace(",", "");
  const hora = Number(ventaHasta.toLocaleString("es-AR", { hour: "numeric", hour12: false, timeZone: TZ }));
  const minuto = Number(ventaHasta.toLocaleString("es-AR", { minute: "numeric", timeZone: TZ }));
  if (hora === 23 && minuto >= 59) return `hasta el ${fecha}`; // cierre a fin de día: sin hora
  if (hora === 12 && minuto === 0) return `hasta el ${fecha} a las 12 del mediodía`;
  return `hasta el ${fecha} a las ${hora}${minuto ? `:${String(minuto).padStart(2, "0")}` : ""} hs`;
};

const CountdownBanner = ({ ventaHasta, cupos, onExpired }: Props) => {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining | null>(null);
  const firedRef = useRef(false);

  useEffect(() => {
    const calculateCountdown = () => {
      const diffInSeconds = differenceInSeconds(ventaHasta, new Date());

      if (diffInSeconds <= 0) {
        setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
        if (!firedRef.current) {
          firedRef.current = true;
          onExpired?.();
        }
      } else {
        setTimeRemaining({
          days: Math.floor(diffInSeconds / (60 * 60 * 24)),
          hours: Math.floor((diffInSeconds % (60 * 60 * 24)) / (60 * 60)),
          minutes: Math.floor((diffInSeconds % (60 * 60)) / 60),
          seconds: diffInSeconds % 60,
          isExpired: false,
        });
      }
    };

    calculateCountdown();
    const interval = setInterval(calculateCountdown, 1000);
    return () => clearInterval(interval);
  }, [ventaHasta, onExpired]);

  if (!timeRemaining) return null;

  if (timeRemaining.isExpired) {
    return (
      <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-center">
        <p className="text-sm font-bold text-red-400">
          ⏰ La venta de pases ha cerrado
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-red-500/10 border border-amber-500/30 rounded-2xl p-6 text-center">
      <div className="flex items-center justify-center gap-2 mb-3">
        <Clock className="w-5 h-5 text-amber-400" />
        <AlertTriangle className="w-5 h-5 text-red-400" />
      </div>

      <p className="text-xs font-bold uppercase tracking-widest text-amber-300 mb-2">
        🎟️ Venta de pases {ventaHastaTexto(ventaHasta)}
      </p>
      <h3 className="text-xl sm:text-2xl font-black italic tracking-tight text-foreground mb-1">
        Asegurá uno de los {cupos} lugares
      </h3>
      <p className="text-sm text-muted-foreground mb-6">Quedan solo:</p>

      <div className="flex justify-center gap-3 mb-6">
        {[
          { label: "Días", value: timeRemaining.days },
          { label: "Horas", value: timeRemaining.hours },
          { label: "Min", value: timeRemaining.minutes },
          { label: "Seg", value: timeRemaining.seconds },
        ].map((unit) => (
          <div key={unit.label} className="flex flex-col items-center">
            <div className="bg-foreground/5 border border-foreground/10 rounded-lg px-3 py-2 min-w-16">
              <p className="text-2xl font-black text-foreground">
                {String(unit.value).padStart(2, "0")}
              </p>
            </div>
            <p className="text-xs text-muted-foreground mt-1 font-semibold">{unit.label}</p>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        No se repite seguido — reservá tu lugar ahora.
      </p>
    </div>
  );
};

export default CountdownBanner;
