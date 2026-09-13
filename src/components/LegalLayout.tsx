import { useEffect, ReactNode } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface LegalLayoutProps {
  title: string;
  description: string;
  updated: string;
  children: ReactNode;
}

const LegalLayout = ({ title, description, updated, children }: LegalLayoutProps) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{title} — Comunidad NM Roller</title>
        <meta name="description" content={description} />
      </Helmet>
      <Navbar />

      <main className="max-w-3xl mx-auto px-6 pt-28 pb-20">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Volver al inicio
        </Link>

        <h1 className="text-3xl sm:text-4xl font-black italic tracking-tight text-foreground mb-2">
          {title}
        </h1>
        <p className="text-sm text-muted-foreground mb-10">
          Última actualización: {updated}
        </p>

        <div className="space-y-8 text-[15px] leading-relaxed text-muted-foreground">
          {children}
        </div>
      </main>

      <Footer />
    </div>
  );
};

// Sección con título, reutilizable dentro de las páginas legales
export const Section = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => (
  <section>
    <h2 className="text-lg sm:text-xl font-black text-foreground mb-3">{title}</h2>
    <div className="space-y-3">{children}</div>
  </section>
);

// Lista con viñetas, reutilizable
export const Bullets = ({ items }: { items: ReactNode[] }) => (
  <ul className="list-disc pl-5 space-y-1.5 marker:text-primary">
    {items.map((it, i) => (
      <li key={i}>{it}</li>
    ))}
  </ul>
);

export default LegalLayout;
