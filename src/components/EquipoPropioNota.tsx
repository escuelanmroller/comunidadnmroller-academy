import { ShieldCheck } from "lucide-react";

// Nota de responsabilidad que aparece al elegir "tengo mi propio equipo" en los
// formularios. Comprometé al usuario con que viene con equipo completo y le
// recuerda (con guiño al seguro) que las protecciones son obligatorias, dándole
// la salida si le falta algo puntual.
const EquipoPropioNota = () => (
  <div className="mt-2 flex items-start gap-3 border border-primary/30 bg-primary/5 p-4">
    <ShieldCheck className="w-5 h-5 text-primary mt-0.5 shrink-0" />
    <p className="text-xs text-foreground/80 leading-relaxed">
      <strong className="text-foreground">Tu seguridad va con vos.</strong> Al marcar esta
      opción confirmás que venís con tu equipo completo: rollers,{" "}
      <strong>casco y protecciones</strong> (muñequeras, coderas y rodilleras). Son
      obligatorias para tomar la clase — el seguro solo cubre si las usás. ¿Te falta algo
      puntual? Podés elegir <em>"Estoy pensando en comprar mi propio equipo"</em> o
      avisarnos por WhatsApp qué necesitás.
    </p>
  </div>
);

export default EquipoPropioNota;
