import SedesMapa from "@/components/SedesMapa";
import { sedes } from "@/data/sedes";

const alquilerSedes = sedes.filter((s) => s.alquiler);

const AlquilerSedesGrid = () => {
  return <SedesMapa sedesList={alquilerSedes} sidebarTitle="Sedes con alquiler" soloAlquiler />;
};

export default AlquilerSedesGrid;
