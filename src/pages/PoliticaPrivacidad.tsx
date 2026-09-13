import { Link } from "react-router-dom";
import LegalLayout, { Section, Bullets } from "@/components/LegalLayout";

const PoliticaPrivacidad = () => {
  return (
    <LegalLayout
      title="Política de Privacidad"
      description="Cómo Comunidad NM Roller recolecta, usa y protege tus datos personales, en cumplimiento de la Ley 25.326 de Protección de Datos Personales."
      updated="Junio 2026"
    >
      <p>
        En <strong className="text-foreground">Comunidad NM Roller</strong> nos tomamos en serio
        la privacidad de tus datos. Esta política explica qué información recolectamos, con qué
        fines, con quién la compartimos y qué derechos tenés sobre ella. Se aplica al sitio{" "}
        <a href="https://comunidadnmroller.com" className="text-primary hover:underline">comunidadnmroller.com</a>{" "}
        y a los formularios y servicios vinculados a él.
      </p>

      <Section title="1. Responsable del tratamiento">
        <p>El responsable del tratamiento de tus datos personales es:</p>
        <Bullets
          items={[
            <>Razón social: <strong className="text-foreground">PISAPPCO S.R.L.</strong></>,
            <>CUIT: <strong className="text-foreground">33-71803404-9</strong></>,
            <>Domicilio: Sinclair 3139, 5.º C, Ciudad Autónoma de Buenos Aires, Argentina</>,
            <>Email de contacto: <a href="mailto:hola@comunidadnmroller.com" className="text-primary hover:underline">hola@comunidadnmroller.com</a></>,
            <>WhatsApp: <a href="https://wa.me/5491165920600" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">+54 11 6592-0600</a></>,
          ]}
        />
      </Section>

      <Section title="2. Qué datos recolectamos">
        <p>Según cómo interactúes con nosotros, podemos recolectar:</p>
        <Bullets
          items={[
            "Datos de identificación y contacto: nombre, correo electrónico y teléfono.",
            "Comprobantes de pago: el archivo (imagen o PDF) que subís para confirmar tu inscripción.",
            "Datos de reservas y clases: historial de turnos y asistencia, gestionados a través de la plataforma Turnos Web.",
            "Comunicaciones: los mensajes que nos enviás por WhatsApp o correo electrónico.",
          ]}
        />
        <p>
          No recolectamos datos sensibles de forma deliberada. Si nos informás una condición médica
          relevante para tu seguridad en clase, la trataremos con la confidencialidad correspondiente.
        </p>
      </Section>

      <Section title="3. Cómo y cuándo los recolectamos">
        <Bullets
          items={[
            "Cuando te suscribís a nuestra newsletter (nombre y email).",
            "Cuando confirmás un pago y subís tu comprobante (nombre, email, teléfono y archivo).",
            "Cuando reservás una clase en la plataforma Turnos Web.",
            "Cuando nos escribís por WhatsApp o correo electrónico.",
          ]}
        />
      </Section>

      <Section title="4. Para qué usamos tus datos">
        <Bullets
          items={[
            "Gestionar tu inscripción, planes, pagos y reservas de clases.",
            "Enviarte novedades, beneficios, recordatorios y contenido educativo de la comunidad (si nos diste tu consentimiento).",
            "Brindar y coordinar la cobertura del seguro durante las clases.",
            "Responder tus consultas y brindarte soporte.",
            "Cumplir con obligaciones legales y requerimientos de aseguradoras.",
          ]}
        />
      </Section>

      <Section title="5. Base legal y consentimiento">
        <p>
          Tratamos tus datos sobre la base de tu consentimiento (que otorgás al completar nuestros
          formularios), la ejecución de la relación contractual (tus clases y planes) y el
          cumplimiento de obligaciones legales. Podés retirar tu consentimiento para las
          comunicaciones de marketing en cualquier momento (por ejemplo, con el enlace de baja de
          los correos o escribiéndonos).
        </p>
      </Section>

      <Section title="6. Con quién compartimos tus datos">
        <p>
          <strong className="text-foreground">No vendemos ni cedemos tus datos a terceros con
          fines comerciales.</strong>{" "}
          Solo los compartimos con proveedores que nos prestan servicios necesarios para operar
          (encargados del tratamiento), y únicamente para esas finalidades:
        </p>
        <Bullets
          items={[
            "GetResponse — envío de correos y gestión de la newsletter.",
            "Supabase — base de datos y almacenamiento seguro de la información.",
            "Make — automatización de procesos internos.",
            "Mercado Pago — procesamiento de pagos.",
            "Calendly — agendamiento de turnos para pago presencial.",
            "Turnos Web — gestión de reservas de clases.",
            "Hostinger — alojamiento (hosting) del sitio web.",
            "WhatsApp (Meta) — comunicación con la comunidad.",
          ]}
        />
        <p>
          También podremos compartir datos cuando exista una obligación legal o un requerimiento de
          aseguradoras vinculado a la cobertura de las clases.
        </p>
      </Section>

      <Section title="7. Transferencias internacionales">
        <p>
          Algunos de nuestros proveedores operan servidores fuera de la Argentina. En esos casos, la
          transferencia de datos se realiza al solo efecto de prestar los servicios descriptos,
          procurando que cuenten con niveles adecuados de protección.
        </p>
      </Section>

      <Section title="8. Conservación de los datos">
        <p>
          Conservamos tus datos personales mientras dure tu relación con Comunidad NM Roller y
          hasta <strong className="text-foreground">5 años</strong> después de tu última
          interacción. Los comprobantes y registros de pago se conservan por el plazo que exigen
          las obligaciones legales, contables e impositivas (hasta{" "}
          <strong className="text-foreground">10 años</strong>, conforme la normativa vigente).
          Cumplido el plazo, los datos se eliminan o anonimizan de forma segura.
        </p>
      </Section>

      <Section title="9. Tus derechos">
        <p>
          De acuerdo con la <strong className="text-foreground">Ley 25.326 de Protección de los
          Datos Personales</strong> (Argentina), tenés derecho a acceder, rectificar, actualizar y
          solicitar la supresión de tus datos personales. Para ejercerlos, escribinos a{" "}
          <a href="mailto:hola@comunidadnmroller.com" className="text-primary hover:underline">hola@comunidadnmroller.com</a>.
        </p>
        <p>
          La <strong className="text-foreground">Agencia de Acceso a la Información Pública (AAIP)</strong>,
          en su carácter de órgano de control de la Ley 25.326, tiene la atribución de atender
          denuncias y reclamos relacionados con el incumplimiento de las normas de protección de
          datos personales.
        </p>
      </Section>

      <Section title="10. Menores de edad">
        <p>
          Para las clases KIDS, la inscripción y el tratamiento de datos de menores se realiza con el
          consentimiento de su madre, padre o tutor/a, quien es responsable de la información
          brindada.
        </p>
      </Section>

      <Section title="11. Cookies y tecnologías de seguimiento">
        <p>
          Actualmente este sitio <strong className="text-foreground">no utiliza cookies de
          seguimiento ni herramientas de analítica publicitaria</strong>. El mapa de sedes utiliza
          OpenStreetMap/CARTO únicamente para mostrar las ubicaciones, sin recolectar datos
          personales. Si en el futuro incorporamos analítica o píxeles (por ejemplo, Google
          Analytics o Meta Pixel), actualizaremos esta sección.
        </p>
      </Section>

      <Section title="12. Seguridad de los datos">
        <p>
          Aplicamos medidas técnicas y organizativas razonables para proteger tus datos contra
          accesos no autorizados, pérdida o alteración. Ningún sistema es 100% infalible, pero
          trabajamos con proveedores que cumplen estándares de seguridad reconocidos.
        </p>
      </Section>

      <Section title="13. Cambios en esta política">
        <p>
          Podemos actualizar esta Política de Privacidad para reflejar cambios en nuestras prácticas
          o por motivos legales. Publicaremos la versión vigente en esta página, indicando la fecha
          de última actualización.
        </p>
      </Section>

      <Section title="14. Contacto">
        <p>
          Ante cualquier duda sobre esta política o el tratamiento de tus datos, escribinos a{" "}
          <a href="mailto:hola@comunidadnmroller.com" className="text-primary hover:underline">hola@comunidadnmroller.com</a>{" "}
          o por WhatsApp al{" "}
          <a href="https://wa.me/5491165920600" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">+54 11 6592-0600</a>.
          Consultá también nuestros{" "}
          <Link to="/terminos-y-condiciones" className="text-primary hover:underline font-semibold">
            Términos y Condiciones
          </Link>.
        </p>
      </Section>

      <p className="text-sm text-muted-foreground pt-4 border-t border-border">
        Comunidad NM Roller © 2022 — Todos los derechos reservados.
      </p>
    </LegalLayout>
  );
};

export default PoliticaPrivacidad;
