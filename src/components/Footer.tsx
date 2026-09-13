import { Instagram, Mail, Phone, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import logoNM from "@/assets/Logo-NM-Rollers.png";
import { getProximaMasterclass } from "@/data/masterclasses";
import MasterclassFooterBanner from "@/components/MasterclassFooterBanner";

const FLY_FREE_KIT_URL = "https://lp.flyfreeurban.com/kit-de-iniciacion-adulto/";
const FLY_FREE_TIENDA_URL = "https://www.flyfreeurban.com/marcas/";

const Footer = () => {
  const proxMc = getProximaMasterclass();

  const scrollTo = (id: string) => () =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  const noop = (e: React.MouseEvent) => e.preventDefault();

  const colHeading = "font-bold mb-3 text-sm uppercase text-foreground/90";
  const linkCls = "hover:text-primary transition-colors text-left";

  return (
    <footer className="bg-card text-foreground py-12 md:py-16 border-t border-border">
      <div className="container mx-auto px-4">
        {/* 5 columnas: Marca+Contacto (fila propia en mobile) / Nosotros / Clases / Alianzas / Recursos (2x2 en mobile) */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-x-6 gap-y-8 sm:gap-10 mb-8 sm:mb-12">
          {/* 1. Marca + Contacto */}
          <div className="col-span-2 lg:col-span-1">
            <img src={logoNM} alt="NM Roller" className="h-12 mb-4" />
            <p className="text-foreground/50 text-sm leading-relaxed mb-5">
              Comunidad de patinaje urbano en Buenos Aires.
            </p>
            <div className="hidden md:flex gap-3 mb-5">
              <a
                href="https://instagram.com/nmroller"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram NM Roller"
                className="w-9 h-9 rounded-full bg-foreground/10 flex items-center justify-center hover:bg-primary transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
            </div>
            <ul className="space-y-2 text-foreground/60 text-sm">
              <li className="flex items-start gap-2">
                <Mail className="w-3.5 h-3.5 mt-1 shrink-0 text-foreground/40" />
                <a href="mailto:hola@comunidadnmroller.com" className="hover:text-primary transition-colors break-all">
                  hola@comunidadnmroller.com
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="w-3.5 h-3.5 mt-1 shrink-0 text-foreground/40" />
                <a
                  href="https://wa.me/5491165920600"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors"
                >
                  +54 11 6592-0600
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 mt-1 shrink-0 text-foreground/40" />
                <span>Buenos Aires, Argentina</span>
              </li>
            </ul>
          </div>

          {/* 2. Nosotros */}
          <div>
            <h4 className={colHeading}>Nosotros</h4>
            <ul className="space-y-2 text-foreground/60 text-sm">
              <li><button onClick={scrollTo("propuesta")} className={linkCls}>¿Por qué NM?</button></li>
              <li>
                {/* TODO: crear página /staff */}
                <a href="#" onClick={noop} className={linkCls}>Staff de profes</a>
              </li>
              <li><button onClick={scrollTo("sedes")} className={linkCls}>Sedes</button></li>
              <li><button onClick={scrollTo("testimonios")} className={linkCls}>Testimonios</button></li>
            </ul>
          </div>

          {/* 3. Clases & Planes */}
          <div>
            <h4 className={colHeading}>Clases & Planes</h4>
            <ul className="space-y-2 text-foreground/60 text-sm">
              <li><button onClick={scrollTo("planes")} className={linkCls}>Planes</button></li>
              <li><Link to="/clases-de-rollers-mas-alquiler" className={linkCls}>Clases + Alquiler</Link></li>
              <li><Link to="/clase-gratis" className={linkCls}>Clase de prueba gratis</Link></li>
              <li><Link to={`/masterclass-de-patinaje/${proxMc.slug}`} className={linkCls}>Masterclass de patinaje</Link></li>
            </ul>
          </div>

          {/* 4. Alianzas comerciales */}
          <div>
            <h4 className={colHeading}>Alianzas comerciales</h4>
            <ul className="space-y-2 text-foreground/60 text-sm">
              <li><Link to="/exclusivo-de-socios-sportclub" className={linkCls}>Beneficio Socios SportClub</Link></li>
              <li>
                <a href="https://www.alquilerdepatines.com" target="_blank" rel="noopener noreferrer" className={linkCls}>Alquiler recreativo (Fly Free)</a>
              </li>
              <li>
                <a href={FLY_FREE_KIT_URL} target="_blank" rel="noopener noreferrer" className={linkCls}>
                  Kit de iniciación (Fly Free)
                </a>
              </li>
              <li>
                <a href={FLY_FREE_TIENDA_URL} target="_blank" rel="noopener noreferrer" className={linkCls}>
                  Equipamiento · Tienda Fly Free
                </a>
              </li>
            </ul>
          </div>

          {/* 5. Recursos */}
          <div>
            <h4 className={colHeading}>Recursos</h4>
            <ul className="space-y-2 text-foreground/60 text-sm">
              <li><Link to="/preguntas-frecuentes" className={linkCls}>Preguntas frecuentes</Link></li>
              <li><Link to="/newsletter-desde-cero" className={linkCls}>Newsletter Desde Cero</Link></li>
              <li>
                <Link to="/ruta-de-aprendizaje" className={linkCls}>Ruta de aprendizaje</Link>
              </li>
              <li>
                <Link to="/tutoriales-de-patinaje" className={linkCls}>Tutoriales</Link>
              </li>
              <li>
                <a
                  href="https://wa.me/5491165920600?text=%5BLP-SP-FT%5D+Hola%21+Te+escribo+desde+el+sitio+web+de+Comunidad+NM+Roller.+Necesito+ayuda+con+%5Bespecifique+su+pregunta%5D"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkCls}
                >Soporte y ayuda</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Banner Masterclass (entre grid y Legal) */}
        <MasterclassFooterBanner />

        {/* Fila inferior: Legal + Copyright */}
        <div className="border-t border-border/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-foreground/40 text-sm">
          <p>© {new Date().getFullYear()} NM Roller. Todos los derechos reservados.</p>
          <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <li><Link to="/terminos-y-condiciones" className="hover:text-primary transition-colors">Términos y Condiciones</Link></li>
            <li><Link to="/politicas-de-privacidad" className="hover:text-primary transition-colors">Política de Privacidad</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
