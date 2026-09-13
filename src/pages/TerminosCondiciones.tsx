import { Link } from "react-router-dom";
import LegalLayout, { Section, Bullets } from "@/components/LegalLayout";

const TerminosCondiciones = () => {
  return (
    <LegalLayout
      title="Términos y Condiciones"
      description="Términos y condiciones de uso del sitio, la plataforma de reservas y los servicios de Comunidad NM Roller."
      updated="Septiembre 2025"
    >
      <Section title="1. Quiénes somos">
        <p>
          Los presentes Términos y Condiciones regulan el uso del sitio web{" "}
          <a href="https://comunidadnmroller.com" className="text-primary hover:underline">comunidadnmroller.com</a>,
          su plataforma de reservas{" "}
          <a href="https://nmroller.turnosweb.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">nmroller.turnosweb.com</a>{" "}
          y la contratación de los servicios de clases de patinaje que ofrece{" "}
          <strong className="text-foreground">Comunidad NM Roller</strong>.
        </p>
      </Section>

      <Section title="2. Servicios incluidos">
        <Bullets
          items={[
            "Planes de clases presenciales: Clase Única, Basic Fun y Black Free.",
            "Servicio de alquiler de rollers y protecciones vinculado a las clases.",
            "Planes con alquiler incluido: opción que combina clases de patinaje y servicio de alquiler de rollers y protecciones en cada sesión. Aplica al Pack de 4 clases con alquiler u otros que se comuniquen en la web.",
          ]}
        />
      </Section>

      <Section title="3. Planes y precios">
        <p>
          Los planes se ofrecen bajo pago mensual. Los nombres, precios y beneficios podrán ser
          actualizados y comunicados a través de los canales oficiales.
        </p>
      </Section>

      <Section title="4. Niveles de patinaje y acceso a clases">
        <p>
          El estudiante se compromete a asistir al nivel que corresponda a sus habilidades
          (Inicial, Principiante, Intermedio, Avanzado). El profesor podrá sugerir el cambio de
          grupo en caso de no corresponder el nivel.
        </p>
      </Section>

      <Section title="5. Cancelaciones, reembolsos y pausas">
        <p>
          Los planes una vez abonados <strong className="text-foreground">no son reembolsables</strong>.
          El alumno podrá pausar su plan hasta por 3 meses en caso de enfermedad, lesión o viaje,
          presentando la documentación correspondiente.
        </p>
        <p className="font-semibold text-foreground">Cancelaciones de clases:</p>
        <Bullets
          items={[
            "Con hasta 2 hs de anticipación → se conserva el crédito.",
            "Con menos de 2 hs de anticipación → se descuenta el crédito.",
            "Si la escuela cancela una clase, la misma se reprogramará.",
          ]}
        />
        <p className="font-semibold text-foreground">En caso de lluvia:</p>
        <Bullets
          items={[
            "Planes Black, Basic y Clase Única → se devuelve el crédito/clase.",
            "Plan Black → no aplica extensión de vigencia.",
          ]}
        />
      </Section>

      <Section title="6. Vigencia de las clases">
        <p>
          Los planes tienen validez de 30 días desde la acreditación, salvo excepciones de pausa
          aprobadas y extensiones.
        </p>
      </Section>

      <Section title="7. Responsabilidades del alumno">
        <Bullets
          items={[
            "Asistir a las clases con casco y protecciones obligatorias (muñequeras, coderas, rodilleras).",
            "Reservar su clase en la app Turnos Web para contar con cobertura de seguro.",
            "Notificar cualquier condición médica relevante.",
            "Usar adecuadamente el equipamiento propio o alquilado.",
          ]}
        />
      </Section>

      <Section title="8. Responsabilidades de la escuela">
        <Bullets
          items={[
            "Brindar un entorno seguro y adecuado para la práctica.",
            "Contar con instructores calificados y capacitados.",
            "Notificar cambios de horario o sede con anticipación.",
          ]}
        />
      </Section>

      <Section title="9. Seguro contra accidentes">
        <p>
          Todos los alumnos cuentan con seguro médico durante las clases. El alumno acepta que la
          participación en salidas urbanas, RaNMchadas u otros eventos implica asumir los riesgos
          inherentes a la actividad, quedando la escuela exenta de responsabilidad más allá del
          seguro.
        </p>
      </Section>

      <Section title="10. Liberación de responsabilidad">
        <p>
          El alumno reconoce que la práctica del patinaje implica riesgos físicos inherentes
          (caídas, golpes, raspaduras, fracturas u otras lesiones) y asume plena responsabilidad
          por su participación, liberando a Comunidad NM Roller, sus directivos, empleados e
          instructores de cualquier eventualidad, más allá de la cobertura del seguro médico
          vigente.
        </p>
        <p>
          Asimismo, declara haber sido informado de los riesgos inherentes y entiende que, en caso
          de no cumplir las normas de seguridad, podrá ser excluido de la actividad. Esta liberación
          aplica también a Salidas Urbanas, RaNMchadas y otros eventos especiales organizados por la
          comunidad.
        </p>
      </Section>

      <Section title="11. Reglamento de convivencia">
        <Bullets
          items={[
            "Se espera respeto hacia instructores, compañeros y espacios de práctica.",
            "Está prohibido realizar maniobras riesgosas sin autorización del profesor.",
            "En caso de menores (clases KIDS): podrán participar de manera independiente bajo supervisión del instructor; no es obligatorio el acompañamiento de un adulto.",
            "La escuela podrá aplicar advertencias o suspensiones ante conductas que afecten la seguridad o la convivencia.",
          ]}
        />
      </Section>

      <Section title="12. Clases para Socios SportClub">
        <p>
          Comunidad NM Roller ofrece a los socios de SportClub acceso gratuito a clases de nivel
          Inicial y Principiante en sedes seleccionadas. En caso de que el socio desee acceder a:
        </p>
        <Bullets
          items={[
            "Más sedes, horarios y disciplinas → deberá abonar el Plan Full Socio SportClub.",
            "Clases con rollers y protecciones incluidas → deberá contratar el Pack de 4 clases con alquiler incluido.",
          ]}
        />
        <p>
          Estos servicios adicionales no están cubiertos por la membresía de SportClub y requieren
          el pago correspondiente. La reserva de clases se realiza únicamente mediante la plataforma
          Turnos Web y está sujeta a disponibilidad. Estas clases se rigen por las mismas normas de
          seguridad, convivencia y responsabilidad que el resto de los alumnos.
        </p>
      </Section>

      <Section title="13. Canales de comunicación oficiales">
        <p>
          Cualquier comunicación válida entre la escuela y el alumno se realizará únicamente por los
          siguientes medios:
        </p>
        <Bullets
          items={[
            <>Sitio web oficial <a href="https://comunidadnmroller.com" className="text-primary hover:underline">comunidadnmroller.com</a> y <a href="https://lp.comunidadnmroller.com" className="text-primary hover:underline">lp.comunidadnmroller.com</a></>,
            <>App Turnos Web <a href="https://nmroller.turnosweb.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">nmroller.turnosweb.com</a></>,
            <>WhatsApp oficial <a href="https://wa.me/5491165920600" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">+54 11 6592-0600</a></>,
            <>Correo electrónico <a href="mailto:hola@comunidadnmroller.com" className="text-primary hover:underline">hola@comunidadnmroller.com</a></>,
          ]}
        />
      </Section>

      <Section title="14. Privacidad">
        <p>
          El tratamiento de los datos personales de los alumnos y usuarios se rige por nuestra{" "}
          <Link to="/politicas-de-privacidad" className="text-primary hover:underline font-semibold">
            Política de Privacidad
          </Link>
          , que forma parte integrante de estos Términos y Condiciones.
        </p>
      </Section>

      <p className="text-sm text-muted-foreground pt-4 border-t border-border">
        Comunidad NM Roller © 2022 — Todos los derechos reservados.
      </p>
    </LegalLayout>
  );
};

export default TerminosCondiciones;
