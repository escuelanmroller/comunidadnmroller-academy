import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  MoreVertical,
  Filter,
  Download,
  MessageCircle,
  Eye,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type Instructor = {
  id: string;
  created_at: string;
  nombre_apellido: string;
  email: string;
  whatsapp: string;
  pais_ciudad: string;
  edad: number | null;
  anos_patinando: string;
  estado: "nuevo" | "contactado" | "seleccionado" | "rechazado";
  tier: "starter" | "vip" | "elite" | null;
  respuestas: any;
  notas_internas: string | null;
};

export default function AdminAcademy() {
  const [instructores, setInstructores] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState<string>("");
  const [filtroTier, setFiltroTier] = useState<string>("");
  const [filtroPais, setFiltroPais] = useState<string>("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState<string | null>(null);

  // Cargar datos
  useEffect(() => {
    loadInstructores();
  }, []);

  const loadInstructores = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("academy_instructores")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setInstructores(data || []);
    } catch (err: any) {
      console.error("Error cargando instructores:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar
  const filtered = instructores.filter((i) => {
    if (filtroEstado && i.estado !== filtroEstado) return false;
    if (filtroTier && i.tier !== filtroTier) return false;
    if (filtroPais && !i.pais_ciudad?.includes(filtroPais)) return false;
    return true;
  });

  // Actualizar estado
  const updateEstado = async (id: string, nuevoEstado: string) => {
    try {
      const { error } = await supabase
        .from("academy_instructores")
        .update({ estado: nuevoEstado })
        .eq("id", id);

      if (error) throw error;
      loadInstructores();
    } catch (err) {
      console.error("Error actualizando:", err);
    }
  };

  // Actualizar tier
  const updateTier = async (id: string, nuevoTier: string) => {
    try {
      const { error } = await supabase
        .from("academy_instructores")
        .update({ tier: nuevoTier || null })
        .eq("id", id);

      if (error) throw error;
      loadInstructores();
    } catch (err) {
      console.error("Error actualizando:", err);
    }
  };

  const handleWhatsApp = (whatsapp: string, nombre: string) => {
    const mensaje = `Hola ${nombre.split(" ")[0]}, te escribo desde NM Academy...`;
    const url = `https://wa.me/${whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, "_blank");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">NM Academy - Panel</h1>
          <div className="text-sm text-gray-400">
            {filtered.length} instructores
          </div>
        </div>

        {/* Filtros */}
        <div className="grid sm:grid-cols-4 gap-4 mb-6 bg-gray-800/30 p-4 rounded-lg border border-gray-700">
          <div>
            <label className="text-xs font-semibold text-gray-400 mb-2 block">
              Estado
            </label>
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-sm"
            >
              <option value="">Todos</option>
              <option value="nuevo">Nuevo</option>
              <option value="contactado">Contactado</option>
              <option value="seleccionado">Seleccionado</option>
              <option value="rechazado">Rechazado</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-400 mb-2 block">
              Tier
            </label>
            <select
              value={filtroTier}
              onChange={(e) => setFiltroTier(e.target.value)}
              className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-sm"
            >
              <option value="">Todos</option>
              <option value="starter">Starter</option>
              <option value="vip">VIP</option>
              <option value="elite">Elite</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-400 mb-2 block">
              País
            </label>
            <input
              type="text"
              value={filtroPais}
              onChange={(e) => setFiltroPais(e.target.value)}
              placeholder="Ej: Argentina"
              className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-400 mb-2 block">
              Acciones
            </label>
            <Button
              onClick={loadInstructores}
              className="w-full bg-gray-700 hover:bg-gray-600 text-sm"
            >
              Recargar
            </Button>
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto border border-gray-700 rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-gray-800/50 border-b border-gray-700">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Nombre</th>
                <th className="px-4 py-3 text-left font-semibold">Email</th>
                <th className="px-4 py-3 text-left font-semibold">País</th>
                <th className="px-4 py-3 text-left font-semibold">Estado</th>
                <th className="px-4 py-3 text-left font-semibold">Tier</th>
                <th className="px-4 py-3 text-left font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filtered.map((instructor) => (
                <tr key={instructor.id} className="hover:bg-gray-800/30">
                  <td className="px-4 py-3 font-semibold">
                    {instructor.nombre_apellido}
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {instructor.email}
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {instructor.pais_ciudad}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={instructor.estado}
                      onChange={(e) =>
                        updateEstado(instructor.id, e.target.value)
                      }
                      className="bg-gray-900 border border-gray-600 rounded px-2 py-1 text-xs"
                    >
                      <option value="nuevo">Nuevo</option>
                      <option value="contactado">Contactado</option>
                      <option value="seleccionado">Seleccionado</option>
                      <option value="rechazado">Rechazado</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={instructor.tier || ""}
                      onChange={(e) =>
                        updateTier(instructor.id, e.target.value)
                      }
                      className="bg-gray-900 border border-gray-600 rounded px-2 py-1 text-xs"
                    >
                      <option value="">Sin tier</option>
                      <option value="starter">Starter</option>
                      <option value="vip">VIP</option>
                      <option value="elite">Elite</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 flex gap-2">
                    <button
                      onClick={() =>
                        handleWhatsApp(
                          instructor.whatsapp,
                          instructor.nombre_apellido
                        )
                      }
                      className="p-2 hover:bg-green-500/20 rounded transition-colors"
                      title="WhatsApp"
                    >
                      <MessageCircle className="w-4 h-4 text-green-500" />
                    </button>
                    <button
                      onClick={() =>
                        setShowDetails(
                          showDetails === instructor.id ? null : instructor.id
                        )
                      }
                      className="p-2 hover:bg-blue-500/20 rounded transition-colors"
                      title="Ver detalles"
                    >
                      <Eye className="w-4 h-4 text-blue-500" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Detalles expandibles */}
        {showDetails && (
          <div className="mt-6 bg-gray-800/30 border border-gray-700 rounded-lg p-6">
            {instructores
              .filter((i) => i.id === showDetails)
              .map((instructor) => (
                <div key={instructor.id}>
                  <h2 className="text-xl font-bold mb-4">
                    {instructor.nombre_apellido}
                  </h2>

                  <div className="grid sm:grid-cols-2 gap-6">
                    {/* Datos básicos */}
                    <div>
                      <h3 className="font-semibold text-red-500 mb-3">
                        Datos Básicos
                      </h3>
                      <div className="space-y-2 text-sm">
                        <p>
                          <span className="text-gray-400">Email:</span>{" "}
                          {instructor.email}
                        </p>
                        <p>
                          <span className="text-gray-400">WhatsApp:</span>{" "}
                          {instructor.whatsapp}
                        </p>
                        <p>
                          <span className="text-gray-400">Edad:</span>{" "}
                          {instructor.edad || "N/A"}
                        </p>
                        <p>
                          <span className="text-gray-400">Años patinando:</span>{" "}
                          {instructor.anos_patinando}
                        </p>
                        <p>
                          <span className="text-gray-400">País:</span>{" "}
                          {instructor.pais_ciudad}
                        </p>
                        <p>
                          <span className="text-gray-400">Instagram:</span>{" "}
                          {instructor.respuestas?.instagram || "N/A"}
                        </p>
                      </div>
                    </div>

                    {/* Respuestas */}
                    <div>
                      <h3 className="font-semibold text-red-500 mb-3">
                        Respuestas
                      </h3>
                      <div className="space-y-3 text-sm">
                        <div>
                          <p className="text-gray-400 font-semibold">
                            Motivación:
                          </p>
                          <p className="text-gray-300">
                            {instructor.respuestas?.motivacion}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400 font-semibold">Nivel:</p>
                          <p className="text-gray-300">
                            {instructor.respuestas?.nivel}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400 font-semibold">
                            Presupuesto:
                          </p>
                          <p className="text-gray-300">
                            {instructor.respuestas?.presupuesto}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-semibold mb-2">
                      Notas internas:
                    </label>
                    <textarea
                      defaultValue={instructor.notas_internas || ""}
                      onBlur={(e) => {
                        if (e.target.value !== instructor.notas_internas) {
                          supabase
                            .from("academy_instructores")
                            .update({ notas_internas: e.target.value })
                            .eq("id", instructor.id)
                            .then(() => loadInstructores());
                        }
                      }}
                      className="w-full bg-gray-900 border border-gray-600 rounded px-4 py-2 text-sm text-white"
                      rows={3}
                    />
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
