import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import logoNM from "@/assets/Logo-NM-Rollers.png";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "Inicio", id: "top" },
  { label: "Sedes", id: "sedes" },
  { label: "Horarios", id: "horarios" },
  { label: "Planes", id: "planes" },
];

const NEWSLETTER_PATH = "/newsletter-desde-cero";
const ALQUILER_PATH = "/clases-de-rollers-mas-alquiler";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const goToSection = (id: string) => {
    setMobileOpen(false);
    const scroll = () => {
      if (id === "top") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      }
    };

    if (location.pathname !== "/") {
      navigate(id === "top" ? "/" : `/#${id}`);
      // Wait for Home to mount, then scroll
      setTimeout(scroll, 100);
    } else {
      scroll();
    }
  };

  const goToTopOfRoute = (path: string) => {
    setMobileOpen(false);
    if (location.pathname === path) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      navigate(path);
      setTimeout(() => window.scrollTo({ top: 0, behavior: "auto" }), 50);
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-background border-b ${
        scrolled ? "shadow-md border-border/50" : "shadow-none border-border/20"
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between h-16 px-6 lg:px-8">
        {/* Logo → Home */}
        <Link
          to="/"
          onClick={() => {
            if (location.pathname === "/") {
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
          }}
          className="flex-shrink-0"
        >
          <img src={logoNM} alt="NM Roller" className="h-10" />
        </Link>

        {/* Center nav links - desktop */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <button
              key={link.label}
              onClick={() => goToSection(link.id)}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              {link.label}
            </button>
          ))}
          <button
            onClick={() => goToTopOfRoute(ALQUILER_PATH)}
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200"
          >
            Clases + Alquiler
          </button>
          <Link
            to={NEWSLETTER_PATH}
            onClick={() => setMobileOpen(false)}
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200"
          >
            Newsletter
          </Link>
        </div>

        {/* CTA button - desktop */}
        <div className="hidden lg:block">
          <Button
            onClick={() => goToSection("planes")}
            className="bg-foreground hover:bg-foreground/90 text-background font-semibold text-sm px-6 py-5 rounded-full shadow-lg transition-all duration-200"
          >
            COMPRAR PLAN
          </Button>
        </div>

        {/* Mobile toggle */}
        <button
          className="lg:hidden p-2 rounded-lg transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? (
            <X className="h-5 w-5 text-foreground" />
          ) : (
            <Menu className="h-5 w-5 text-foreground" />
          )}
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-300 ${
          mobileOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="bg-background border-t border-border/30">
          <div className="flex flex-col items-start gap-1 py-4 px-6">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => goToSection(link.id)}
                className="text-muted-foreground hover:text-foreground font-medium text-sm py-2.5 w-full text-left transition-colors"
              >
                {link.label}
              </button>
            ))}
            <button
              onClick={() => goToTopOfRoute(ALQUILER_PATH)}
              className="text-muted-foreground hover:text-foreground font-medium text-sm py-2.5 w-full text-left transition-colors"
            >
              Clases + Alquiler
            </button>
            <Link
              to={NEWSLETTER_PATH}
              onClick={() => setMobileOpen(false)}
              className="text-muted-foreground hover:text-foreground font-medium text-sm py-2.5 w-full text-left transition-colors"
            >
              Newsletter
            </Link>
            <Button
              onClick={() => goToSection("planes")}
              className="bg-foreground hover:bg-foreground/90 text-background font-semibold px-6 py-5 rounded-full shadow-lg mt-2 w-full"
            >
              COMPRAR PLAN
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
