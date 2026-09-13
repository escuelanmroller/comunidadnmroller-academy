import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ArrowLeft, MessageCircle } from "lucide-react";
import logoNM from "@/assets/Logo-NM-Rollers.png";
import React from "react";

const WA_SOPORTE =
  "https://wa.me/5491165920600?text=%5BLP-FAQ-NM%5D+Hola%21+Te+escribo+desde+la+p%C3%A1gina+de+Preguntas+Frecuentes+de+Comunidad+NM+Roller.+Tengo+una+consulta+espec%C3%ADfica%3A+%5Bespecifique+su+duda%5D";

interface FaqItem {
  q: string;
  a: React.ReactNode;
}
interface FaqSection {
  id: string;
  emoji: string;
  titulo: string;
  items: FaqItem[];
}

const SECCIONES: FaqSection[] = [
  {
    id: "empezar",
    emoji: "🛼",
    titulo: "Empezar desde cero",
    items: [
      {
        q: "¿Necesito experiencia previa para tomar clases?",
        a: "Para nada. Nuestras clases de nivel inicial están diseñadas para personas que nunca se pusieron unos rollers. Tu profe te guía desde el primer paso hasta que logres moverte con confianza.",
      },
      {
        q: "¿A partir de qué edad se puede tomar clases?",
        a: "Trabajamos con adultos y adolescentes (a partir de 14 años aproximadamente). Si tenés dudas sobre una edad específica, escribinos por WhatsApp y te orientamos.",
      },
      {
        q: "¿Qué necesito llevar a la primera clase?",
        a: "Solo ropa cómoda y ganas. Si no tenés equipo, podés alquilar patines y protecciones en la sede. Si tenés tus propios rollers y protecciones, podés traerlos.",
      },
      {
        q: "¿Hay una clase de prueba gratuita?",
        a: (
          <>
            Sí. Ofrecemos una clase de prueba gratuita para que conozcas la dinámica, la sede y al
            profe antes de comprometerte con un plan.{" "}
            <Link to="/clase-gratis" className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors">
              Reservá tu lugar acá →
            </Link>
          </>
        ),
      },
      {
        q: "¿Es obligatorio usar protecciones?",
        a: "Sí. Rodilleras, coderas, muñequeras y casco son obligatorios en todas las clases. Podés alquilar el set completo en la sede si no tenés el tuyo.",
      },
      {
        q: "¿Qué pasa si llueve?",
        a: "Las clases son al aire libre. Si llueve o el piso está mojado, la clase se reprograma automáticamente para otra fecha sin costo extra. Te avisamos siempre con anticipación.",
      },
    ],
  },
  {
    id: "planes",
    emoji: "💳",
    titulo: "Planes y pagos",
    items: [
      {
        q: "¿Cuánto cuestan las clases?",
        a: (
          <>
            Tenemos varios planes: clase suelta, pack mensual y pack 4 clases + alquiler de equipo.{" "}
            <Link to="/#planes" className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors">
              Ver precios actualizados →
            </Link>
          </>
        ),
      },
      {
        q: "¿Cómo se paga?",
        a: "Aceptamos transferencia bancaria y Mercado Pago. Al elegir tu plan te compartimos el link de pago.",
      },
      {
        q: "¿Hay contrato? ¿Me puedo ir cuando quiero?",
        a: "No hay contratos ni fidelización. Podés cancelar tu plan en cualquier momento. No te atamos a nada.",
      },
      {
        q: "¿Cuántas clases puedo tomar por semana?",
        a: (
          <>
            Depende del plan: podés tomar 1 clase por semana o 4 en el mes. Con el{" "}
            <strong className="text-foreground">Plan Black</strong> podés tomar hasta{" "}
            <strong className="text-foreground">2 clases por día</strong>.{" "}
            <Link to="/#planes" className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors">
              Ver todos los planes →
            </Link>
          </>
        ),
      },
      {
        q: "¿Puedo tomar clases en cualquier sede con el mismo plan?",
        a: (
          <>
            Sí, siempre y cuando tu plan lo incluya. Esto queda especificado al momento de
            comprar: cada plan indica claramente si es de sede fija o multi-sede.{" "}
            <Link to="/#planes" className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors">
              Revisá los detalles de cada plan →
            </Link>
          </>
        ),
      },
    ],
  },
  {
    id: "alquiler",
    emoji: "🎽",
    titulo: "Alquiler de equipo",
    items: [
      {
        q: "¿Qué incluye el alquiler de equipo?",
        a: "Patines en línea de tu talle + set completo de protecciones: casco, muñequeras, rodilleras y coderas. Todo listo cuando llegás a la sede.",
      },
      {
        q: "¿Hay rollers de mi talle?",
        a: "Tenemos un rango amplio de talles para adultos y adolescentes. Al reservar te pedimos tu talle para asegurar disponibilidad.",
      },
      {
        q: "¿Con cuánta anticipación tengo que reservar el equipo?",
        a: "Con al menos 24 hs de anticipación para garantizar tu talle y equipo completo.",
      },
      {
        q: "¿Puedo cambiar o cancelar la reserva de alquiler?",
        a: (
          <>
            Sí. Podés reprogramar avisando con{" "}
            <strong className="text-foreground">al menos 24 hs de anticipación a la hora de tu clase</strong>.
            Si no avisás a tiempo, el crédito se pierde y no se reembolsa. En caso de lluvia, la
            clase se reprograma automáticamente sin costo.
          </>
        ),
      },
      {
        q: "¿El equipo de alquiler es higiénico?",
        a: "Sí. Limpiamos y desinfectamos los rollers, el casco y todas las protecciones después de cada uso. Si querés podés traer tus propias medias largas.",
      },
      {
        q: "¿Puedo alquilar equipo sin tomar una clase?",
        a: (
          <>
            El alquiler está pensado para acompañar a las clases. Si buscás alquilar patines para
            pasear de forma recreativa de manera independiente, te recomendamos{" "}
            <a href="https://www.alquilerdepatines.com" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors">
              alquilerdepatines.com
            </a>{" "}
            de nuestros amigos de{" "}
            <a href="https://www.flyfreeurban.com" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors">
              Fly Free Urban
            </a>.
          </>
        ),
      },
    ],
  },
  {
    id: "sedes",
    emoji: "📍",
    titulo: "Sedes y horarios",
    items: [
      {
        q: "¿Dónde están ubicadas las sedes?",
        a: (
          <>
            Tenemos más de 10 sedes en Buenos Aires: Palermo, Puerto Madero, Caballito, Vicente
            López, Belgrano, Villa Luro, Núñez, Retiro y más.{" "}
            <Link to="/#sedes" className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors">
              Ver mapa completo →
            </Link>
          </>
        ),
      },
      {
        q: "¿Las clases son en interiores o al aire libre?",
        a: "Todas nuestras clases son al aire libre, en parques y espacios públicos de Buenos Aires.",
      },
      {
        q: "¿Con qué frecuencia hay clases?",
        a: "Tenemos más de 40 clases semanales distribuidas entre todas las sedes. Hay opciones de lunes a domingo en distintos horarios.",
      },
      {
        q: "¿Cómo veo los horarios disponibles?",
        a: (
          <>
            Podés filtrar por sede y ver todos los días y horarios en{" "}
            <Link to="/#horarios" className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors">
              la sección de horarios →
            </Link>
          </>
        ),
      },
    ],
  },
  {
    id: "masterclass",
    emoji: "⚡",
    titulo: "Masterclass",
    items: [
      {
        q: "¿Qué es la Masterclass?",
        a: (
          <>
            Es un <strong className="text-foreground">encuentro mensual</strong> donde se reúne
            toda la comunidad: alumnos activos y nuevos miembros, con el propósito de desafiarse y
            conocerse. Ese día podés elegir{" "}
            <strong className="text-foreground">2 clases a elección</strong> entre las disciplinas
            disponibles: nivel inicial, principiante, slalom, saltos/rampas y frenadas. El
            encuentro cierra con una <strong className="text-foreground">salida urbana</strong> o
            una <strong className="text-foreground">ranchada</strong> — un momento para tomar mate,
            comer y charlar, ideal para integrarse al grupo y conocer personas.
          </>
        ),
      },
      {
        q: "¿Qué nivel necesito para ir a la Masterclass?",
        a: (
          <>
            <strong className="text-foreground">Ninguno.</strong> La Masterclass tiene clases para
            todos los niveles, incluyendo personas que arrancan desde cero. Cada disciplina está
            pensada para que puedas sumarte independientemente de tu experiencia previa.{" "}
            <Link to="/masterclass-de-patinaje" className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors">
              Ver detalles de la próxima edición →
            </Link>
          </>
        ),
      },
      {
        q: "¿Cuándo es la próxima Masterclass?",
        a: (
          <>
            Las fechas se actualizan en{" "}
            <Link to="/masterclass-de-patinaje" className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors">
              la página de Masterclass →
            </Link>{" "}
            Podés anotarte en la lista de espera si el cupo se agotó o para que te avisemos de la
            próxima fecha.
          </>
        ),
      },
      {
        q: "¿Cómo se paga la Masterclass?",
        a: (
          <>
            Hay distintos tipos de pase (completo, medio día, etc.) con sus respectivos precios. El
            pago se realiza por Mercado Pago.{" "}
            <Link to="/masterclass-de-patinaje" className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors">
              Ver opciones y precios →
            </Link>
          </>
        ),
      },
    ],
  },
  {
    id: "sportclub",
    emoji: "🏋️",
    titulo: "Beneficio Socios SportClub",
    items: [
      {
        q: "¿Qué planes de SportClub aplican?",
        a: "Los planes Plus, Total, Elite y Flex. Si tenés alguno de esos planes, accedés sin costo extra a clases de nivel inicial y principiante en las sedes habilitadas.",
      },
      {
        q: "¿Qué niveles cubre el beneficio?",
        a: (
          <>
            Solo nivel inicial y principiante. Para acceder a nivel intermedio, disciplinas y más
            frecuencia de clases podés sumar{" "}
            <Link to="/exclusivo-de-socios-sportclub#planes" className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors">
              el Plan Full Socios SportClub →
            </Link>
          </>
        ),
      },
      {
        q: "¿Tiene algún costo para el socio?",
        a: "No. La clase está incluida en tu beneficio de socio SportClub. Solo el alquiler de equipo (si lo necesitás) tiene valor, y para socios es 50% OFF.",
      },
      {
        q: "¿Necesito mi propio equipo?",
        a: (
          <>
            No es obligatorio. Podés alquilar rollers y protecciones en las sedes habilitadas a
            mitad de precio (con 24 hs de anticipación). También tenemos el{" "}
            <Link to="/exclusivo-de-socios-sportclub#planes" className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors">
              plan 4 Clases + Alquiler →
            </Link>{" "}
            que incluye todo el equipo desde el primer día.
          </>
        ),
      },
      {
        q: "¿Cómo acredito que soy socio SportClub?",
        a: (
          <>
            Completá el{" "}
            <Link to="/exclusivo-de-socios-sportclub#form" className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors">
              formulario de registro →
            </Link>{" "}
            y seguí las indicaciones que te llegan después. Luego envianos los datos de tu
            membresía por WhatsApp para que podamos validar tu beneficio gratuito de Socio
            SportClub.
          </>
        ),
      },
      {
        q: "¿Los cupos son limitados?",
        a: (
          <>
            Sí. Las clases son grupales con atención personalizada, por lo que el cupo por sede y
            horario es limitado. Te recomendamos{" "}
            <Link to="/exclusivo-de-socios-sportclub" className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors">
              registrarte cuanto antes →
            </Link>
          </>
        ),
      },
    ],
  },
  {
    id: "equipo",
    emoji: "🛒",
    titulo: "Comprar mi propio equipo",
    items: [
      {
        q: "¿Cuándo conviene comprar mis propios rollers?",
        a: "Una vez que sabés que el patinaje te enganchó y querés practicar con más frecuencia, conviene tener tu propio equipo. Mientras estás probando, el alquiler es la opción más inteligente.",
      },
      {
        q: "¿Qué equipo recomiendan para principiantes?",
        a: (
          <>
            Para empezar: patines en línea con freno trasero, rodilleras, coderas, muñequeras y
            casco. La marca y modelo dependen de tu presupuesto. Podés consultar a nuestros profes
            a través de{" "}
            <a href="https://www.flyfreeurban.com/marcas/" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors">
              Fly Free Urban
            </a>
            : son patinadores activos que enseñan y practican el deporte constantemente, no
            vendedores de mostrador.
          </>
        ),
      },
      {
        q: "¿Dónde puedo comprar equipo de calidad?",
        a: (
          <>
            Tenemos alianza con{" "}
            <a href="https://www.flyfreeurban.com/marcas/" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors">
              Fly Free Urban
            </a>
            . Lo que los diferencia: quienes te asesoran son{" "}
            <strong className="text-foreground">profesores del staff de NM Roller</strong> —
            patinadores que enseñan y practican el deporte constantemente. No te atiende alguien
            que vende desde el mostrador sin conocer el producto desde adentro. También podés
            consultarles directamente por WhatsApp desde nuestra{" "}
            <Link to="/tutoriales-de-patinaje" className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors">
              sección de tutoriales →
            </Link>
          </>
        ),
      },
      {
        q: "¿Puedo traer mis propios rollers a la clase?",
        a: "Sí, siempre que el equipo esté en buen estado y cuentes con todas las protecciones (rodilleras, coderas, muñequeras y casco). Eso es obligatorio.",
      },
    ],
  },
];

const PreguntasFrecuentes = () => (
  <>
    <Helmet>
      <title>Preguntas Frecuentes | Comunidad NM Roller</title>
      <meta
        name="description"
        content="Todas las respuestas sobre clases de patinaje, planes, alquiler de equipo, sedes, masterclass y más. NM Roller — Buenos Aires."
      />
    </Helmet>

    <main className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="pt-10 pb-6 px-6 flex flex-col items-center gap-4 border-b border-border">
        <Link to="/">
          <img src={logoNM} alt="NM Roller" className="h-14" />
        </Link>
        <div className="text-center">
          <p className="text-primary font-bold text-xs tracking-[0.18em] uppercase mb-1">
            Centro de ayuda
          </p>
          <h1 className="font-display italic uppercase text-3xl md:text-5xl font-black leading-tight">
            Preguntas frecuentes
          </h1>
          <p className="text-foreground/60 text-sm mt-2 max-w-md mx-auto">
            Todo lo que necesitás saber sobre clases, planes, equipo y más.
          </p>
        </div>
      </header>

      {/* Índice rápido */}
      <nav className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border px-4 py-3 overflow-x-auto">
        <div className="flex gap-2 min-w-max mx-auto justify-center">
          {SECCIONES.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-foreground/60 hover:text-primary transition-colors whitespace-nowrap px-3 py-1.5 rounded-full hover:bg-primary/10"
            >
              <span>{s.emoji}</span>
              {s.titulo}
            </a>
          ))}
        </div>
      </nav>

      {/* Secciones */}
      <div className="flex-1 max-w-3xl mx-auto w-full px-6 py-12 space-y-16">
        {SECCIONES.map((seccion) => (
          <section key={seccion.id} id={seccion.id} className="scroll-mt-20">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl">{seccion.emoji}</span>
              <h2 className="font-display italic uppercase text-2xl md:text-3xl font-black text-foreground">
                {seccion.titulo}
              </h2>
            </div>
            <Accordion type="single" collapsible className="w-full space-y-2">
              {seccion.items.map((item, i) => (
                <AccordionItem
                  key={i}
                  value={`${seccion.id}-${i}`}
                  className="bg-card border border-border rounded-xl px-5"
                >
                  <AccordionTrigger className="text-left font-bold text-foreground text-sm md:text-base hover:no-underline hover:text-primary transition-colors">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-foreground/70 text-sm leading-relaxed">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        ))}

        {/* CTA WhatsApp */}
        <section className="bg-card border border-border rounded-2xl p-8 text-center">
          <div className="w-12 h-12 bg-[#25D366]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-6 h-6 text-[#25D366]" />
          </div>
          <h3 className="font-black italic text-xl text-foreground mb-2">
            ¿No encontrás lo que buscás?
          </h3>
          <p className="text-foreground/60 text-sm mb-6 max-w-sm mx-auto">
            Escribinos por WhatsApp y te respondemos en minutos.
          </p>
          <a
            href={WA_SOPORTE}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1fba59] text-white font-bold uppercase tracking-[0.12em] text-sm px-7 py-3.5 rounded-full transition-colors shadow-lg shadow-[#25D366]/20"
          >
            <MessageCircle className="w-4 h-4" />
            Escribirnos por WhatsApp
          </a>
        </section>
      </div>

      {/* Volver */}
      <div className="py-8 text-center border-t border-border">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-foreground/50 hover:text-foreground uppercase tracking-[0.18em] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Volver al sitio
        </Link>
      </div>
    </main>
  </>
);

export default PreguntasFrecuentes;
