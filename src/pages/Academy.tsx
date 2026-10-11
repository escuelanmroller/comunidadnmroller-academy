import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Users, Zap, Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Academy() {
  const navigate = useNavigate();

  const programas = [
    {
      nombre: "STARTER",
      precio: "$350",
      duracion: "3 meses",
      descripcion: "Formación técnica completa para comenzar a enseñar",
      features: [
        "Curso pregrabado completo",
        "Acceso 3 meses",
        "Comunidad general",
        "Plantillas + recursos",
      ],
      cta: "Comenzar",
      highlight: false,
    },
    {
      nombre: "VIP",
      precio: "$900",
      duracion: "6 meses",
      descripcion: "Acompañamiento estructurado + mentoría individual",
      features: [
        "Todo de STARTER +",
        "6 mentorías 1:1",
        "Grupo VIP exclusivo",
        "Consultas por WhatsApp (3 meses)",
        "Grabaciones de clases",
      ],
      cta: "Seleccionar VIP",
      highlight: true,
    },
    {
      nombre: "ELITE",
      precio: "$1.500",
      duracion: "6 meses",
      descripcion: "Transformación completa: técnica + negocio",
      features: [
        "Todo de VIP +",
        "Masterclass mensual",
        "Mentoría de Nico incluida",
        "Plantillas de negocio",
        "1 año de acceso",
      ],
      cta: "Acceso ELITE",
      highlight: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white">
      {/* Hero */}
      <section className="pt-20 px-4 pb-16 max-w-5xl mx-auto">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-full px-4 py-2 mb-6">
            <Zap className="w-4 h-4 text-red-500" />
            <span className="text-sm font-semibold text-red-400">
              Formación Profesional de Instructores
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold mb-6 leading-tight">
            Convertite en{" "}
            <span className="text-red-500">Instructor de Patinaje</span>
          </h1>

          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
            Programa completo de formación técnica para enseñar patinaje con
            metodología NM Roller. Aprende a patinar, enseña con confianza.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate("/academy/inscribirse")}
              className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 text-lg font-semibold"
              size="lg"
            >
              Ver programas <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-4 bg-gray-900/50 border-y border-gray-800">
        <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-red-500 mb-2">87+</div>
            <p className="text-sm text-gray-400">Candidatos inscritos</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-500 mb-2">6</div>
            <p className="text-sm text-gray-400">Meses acompañamiento</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-500 mb-2">17+</div>
            <p className="text-sm text-gray-400">Años de experiencia</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-500 mb-2">20+</div>
            <p className="text-sm text-gray-400">Países representados</p>
          </div>
        </div>
      </section>

      {/* Qué incluye */}
      <section className="py-16 px-4 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold mb-12 text-center">
          ¿Qué incluye la formación?
        </h2>

        <div className="grid sm:grid-cols-2 gap-8">
          <div className="flex gap-4">
            <CheckCircle2 className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold mb-2">Curso pregrabado completo</h3>
              <p className="text-gray-400 text-sm">
                Acceso a todo el contenido de patinaje + metodología de enseñanza
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <CheckCircle2 className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold mb-2">Clases en vivo (VIP+)</h3>
              <p className="text-gray-400 text-sm">
                Sesiones quincenales sobre temas específicos con Nico
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <CheckCircle2 className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold mb-2">Mentoría individual (VIP+)</h3>
              <p className="text-gray-400 text-sm">
                6 encuentros 1:1 focalizados en tu caso y progreso
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <CheckCircle2 className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold mb-2">Comunidad exclusiva</h3>
              <p className="text-gray-400 text-sm">
                Grupo VIP para compartir experiencias y aprender juntos
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <CheckCircle2 className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold mb-2">Plantillas profesionales</h3>
              <p className="text-gray-400 text-sm">
                Guiones de clase, estructura de sesión, horarios
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <CheckCircle2 className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold mb-2">Masterclass mensuales (ELITE)</h3>
              <p className="text-gray-400 text-sm">
                Temas avanzados: retención, precios, liderazgo
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Programas */}
      <section className="py-16 px-4 bg-gray-900/50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">
            Elige tu programa
          </h2>

          <div className="grid sm:grid-cols-3 gap-6">
            {programas.map((prog, idx) => (
              <div
                key={idx}
                className={`rounded-lg border transition-all ${
                  prog.highlight
                    ? "border-red-500 bg-red-500/5 ring-1 ring-red-500/20 scale-105"
                    : "border-gray-700 bg-gray-800/30 hover:border-gray-600"
                }`}
              >
                <div className="p-6">
                  {prog.highlight && (
                    <div className="inline-block bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-4">
                      MÁS POPULAR
                    </div>
                  )}

                  <h3 className="text-2xl font-bold mb-2">{prog.nombre}</h3>
                  <div className="text-3xl font-bold text-red-500 mb-1">
                    {prog.precio}
                  </div>
                  <p className="text-sm text-gray-400 mb-4">{prog.duracion}</p>
                  <p className="text-sm text-gray-300 mb-6">{prog.descripcion}</p>

                  <ul className="space-y-3 mb-6">
                    {prog.features.map((feature, fidx) => (
                      <li
                        key={fidx}
                        className="text-sm text-gray-300 flex items-start gap-2"
                      >
                        <span className="text-red-500 font-bold mt-0.5">+</span>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => navigate("/academy/inscribirse")}
                    className={`w-full ${
                      prog.highlight
                        ? "bg-red-500 hover:bg-red-600 text-white"
                        : "border border-gray-600 text-gray-300 hover:bg-gray-700"
                    }`}
                  >
                    {prog.cta}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 px-4 max-w-5xl mx-auto text-center">
        <h2 className="text-2xl font-bold mb-4">¿Dudas sobre el programa?</h2>
        <p className="text-gray-400 mb-6">
          Escribí a Nico por WhatsApp para consultar qué programa se adapta mejor a tu caso
        </p>
        <a
          href="https://wa.me/5491165920600?text=Hola%20Nico,%20me%20interesa%20NM%20Academy"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
        >
          Escribir por WhatsApp
        </a>
      </section>
    </div>
  );
}
