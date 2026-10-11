import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function AcademyInscribirse() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    nombre_apellido: "",
    email: "",
    instagram: "",
    pais_ciudad: "",
    anos_patinando: "",
    edad: "",
    whatsapp: "",
    como_me_conociste: "",
    motivacion: "",
    nivel: "",
    experiencia: "",
    disponibilidad: "",
    presupuesto: "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Insertar en la tabla
      const { error: dbError } = await supabase
        .from("academy_instructores")
        .insert([
          {
            nombre_apellido: formData.nombre_apellido,
            email: formData.email,
            instagram: formData.instagram,
            pais_ciudad: formData.pais_ciudad,
            anos_patinando: formData.anos_patinando,
            edad: parseInt(formData.edad) || null,
            whatsapp: formData.whatsapp,
            como_me_conociste: formData.como_me_conociste,
            respuestas: {
              motivacion: formData.motivacion,
              nivel: formData.nivel,
              experiencia: formData.experiencia,
              disponibilidad: formData.disponibilidad,
              presupuesto: formData.presupuesto,
            },
            estado: "nuevo",
          },
        ]);

      if (dbError) throw dbError;

      setSuccess(true);
      // Limpiar form
      setFormData({
        nombre_apellido: "",
        email: "",
        instagram: "",
        pais_ciudad: "",
        anos_patinando: "",
        edad: "",
        whatsapp: "",
        como_me_conociste: "",
        motivacion: "",
        nivel: "",
        experiencia: "",
        disponibilidad: "",
        presupuesto: "",
      });

      // Redirigir después de 3 segundos
      setTimeout(() => {
        navigate("/");
      }, 3000);
    } catch (err: any) {
      setError(err.message || "Error al enviar el formulario");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white flex items-center justify-center px-4">
        <div className="text-center max-w-lg">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold mb-4">¡Inscripción confirmada!</h1>
          <p className="text-gray-300 mb-6">
            Gracias por tu interés en NM Academy. Nico se pondrá en contacto
            pronto por WhatsApp para definir tu programa.
          </p>
          <p className="text-sm text-gray-400">
            Redirigiendo al home en 3 segundos...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <button
          onClick={() => navigate("/academy")}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Inscribite en NM Academy
          </h1>
          <p className="text-gray-400">
            Completá el formulario y nos contactaremos para definir tu programa
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 mb-6 text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Sección 1: Datos básicos */}
          <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-red-500">
              Datos Básicos
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Nombre y Apellido *
                </label>
                <input
                  type="text"
                  name="nombre_apellido"
                  value={formData.nombre_apellido}
                  onChange={handleChange}
                  required
                  className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:border-red-500 focus:outline-none"
                  placeholder="Ej: Juan Pérez"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:border-red-500 focus:outline-none"
                    placeholder="juan@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    WhatsApp (con código país) *
                  </label>
                  <input
                    type="tel"
                    name="whatsapp"
                    value={formData.whatsapp}
                    onChange={handleChange}
                    required
                    className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:border-red-500 focus:outline-none"
                    placeholder="+54 9 1234 5678"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Edad *
                  </label>
                  <input
                    type="number"
                    name="edad"
                    value={formData.edad}
                    onChange={handleChange}
                    required
                    className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:border-red-500 focus:outline-none"
                    placeholder="30"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Años patinando *
                  </label>
                  <input
                    type="text"
                    name="anos_patinando"
                    value={formData.anos_patinando}
                    onChange={handleChange}
                    required
                    className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:border-red-500 focus:outline-none"
                    placeholder="Ej: 5 años"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    País / Ciudad *
                  </label>
                  <input
                    type="text"
                    name="pais_ciudad"
                    value={formData.pais_ciudad}
                    onChange={handleChange}
                    required
                    className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:border-red-500 focus:outline-none"
                    placeholder="Buenos Aires, Argentina"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Instagram
                  </label>
                  <input
                    type="text"
                    name="instagram"
                    value={formData.instagram}
                    onChange={handleChange}
                    className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:border-red-500 focus:outline-none"
                    placeholder="@usuario"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    ¿Cómo me conociste? *
                  </label>
                  <select
                    name="como_me_conociste"
                    value={formData.como_me_conociste}
                    onChange={handleChange}
                    required
                    className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-red-500 focus:outline-none"
                  >
                    <option value="">Selecciona una opción</option>
                    <option value="instagram">Instagram</option>
                    <option value="tiktok">TikTok</option>
                    <option value="youtube">YouTube</option>
                    <option value="recomendacion">Recomendación</option>
                    <option value="facebook">Facebook</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Sección 2: Experiencia y motivación */}
          <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-red-500">
              Experiencia y Motivación
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  ¿Por qué te interesa ser instructor? *
                </label>
                <textarea
                  name="motivacion"
                  value={formData.motivacion}
                  onChange={handleChange}
                  required
                  rows={3}
                  className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:border-red-500 focus:outline-none"
                  placeholder="Cuéntanos tus motivaciones..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Tu nivel actual y disciplinas *
                </label>
                <textarea
                  name="nivel"
                  value={formData.nivel}
                  onChange={handleChange}
                  required
                  rows={2}
                  className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:border-red-500 focus:outline-none"
                  placeholder="Ej: Nivel intermedio, me interesa slalom y freestyle"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  ¿Has enseñado algo antes?
                </label>
                <textarea
                  name="experiencia"
                  value={formData.experiencia}
                  onChange={handleChange}
                  rows={2}
                  className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:border-red-500 focus:outline-none"
                  placeholder="Cuéntanos tu experiencia (opcional)"
                />
              </div>
            </div>
          </div>

          {/* Sección 3: Disponibilidad e inversión */}
          <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-red-500">
              Disponibilidad e Inversión
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Disponibilidad horaria *
                </label>
                <input
                  type="text"
                  name="disponibilidad"
                  value={formData.disponibilidad}
                  onChange={handleChange}
                  required
                  className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:border-red-500 focus:outline-none"
                  placeholder="Ej: Lunes a viernes después de las 18hs"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  ¿Cuánto presupuesto tienes en mente? *
                </label>
                <select
                  name="presupuesto"
                  value={formData.presupuesto}
                  onChange={handleChange}
                  required
                  className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-red-500 focus:outline-none"
                >
                  <option value="">Selecciona un rango</option>
                  <option value="hasta-350">Hasta $350 USD</option>
                  <option value="350-900">$350 - $900 USD</option>
                  <option value="900-1500">$900 - $1500 USD</option>
                  <option value="mas-1500">Más de $1500 USD</option>
                  <option value="sin-definir">Aún no sé</option>
                </select>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-4">
            <Button
              type="button"
              onClick={() => navigate("/academy")}
              variant="outline"
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                "Enviar inscripción"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
