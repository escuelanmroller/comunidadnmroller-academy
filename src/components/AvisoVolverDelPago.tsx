import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle, Loader2 } from "lucide-react";

// Aviso que se ve mientras la web arma el link de Mercado Pago y antes de saltar.
// Mercado Pago devuelve al comprador a /pago-confirmado solo si no cierra la app
// antes de tiempo — sin ese paso no llega el comprobante ni se confirma el plan.
// AlertDialog (no Dialog) para que no tenga botón de cerrar ni se cierre tocando afuera.
const AvisoVolverDelPago = ({ open }: { open: boolean }) => (
  <AlertDialog open={open}>
    <AlertDialogContent className="max-w-sm w-[calc(100%-2rem)] rounded-lg">
      <AlertDialogHeader className="items-center text-center sm:text-center">
        <AlertTriangle className="w-10 h-10 text-primary mb-1" />
        <AlertDialogTitle className="text-lg font-bold">
          Importante: después de pagar, volvé a esta web
        </AlertDialogTitle>
        <AlertDialogDescription className="text-sm leading-relaxed">
          Cuando termines el pago, esperá unos segundos a que Mercado Pago te devuelva acá. Ahí subís
          el comprobante y confirmamos tu plan. Si cerrás antes, no podemos activarlo.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <p className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <Loader2 className="w-3 h-3 animate-spin" />
        Te llevamos a Mercado Pago…
      </p>
    </AlertDialogContent>
  </AlertDialog>
);

export default AvisoVolverDelPago;
