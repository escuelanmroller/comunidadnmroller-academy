import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { sedes } from "@/data/sedes";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ValueProposition from "@/components/ValueProposition";
import ForWhom from "@/components/ForWhom";
import PricingSection from "@/components/PricingSection";
import SedesSection from "@/components/SedesSection";
import HorariosSection from "@/components/HorariosSection";
import Testimonials from "@/components/Testimonials";
import AppSection from "@/components/AppSection";
import Footer from "@/components/Footer";
import BannerAlquilerHome from "@/components/alquiler/BannerAlquilerHome";
import NewsletterBannerHome from "@/components/NewsletterBannerHome";
import VideoSocialProof from "@/components/VideoSocialProof";

const Index = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#", "");
      // Wait a tick for sections to render
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      }, 80);
    }
  }, [location]);

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>Escuela #1 de Patinaje en Argentina — NM Roller</title>
        <meta name="description" content={`Aprende a patinar desde cero o mejorá tu técnica con NM Roller. +3.000 alumnos, +${sedes.length} sedes outdoor en CABA. Clases ilimitadas, seguro médico incluido, sin contratos.`} />
        <meta property="og:title" content="Escuela #1 de Patinaje en Argentina" />
        <meta property="og:description" content={`Aprende desde cero o mejorá tu técnica. +${sedes.length} sedes, profesores certificados, sin contratos ni permanencia.`} />
        <meta property="og:image" content="/og-home.png" />
        <meta property="og:url" content="https://comunidadnmroller.com" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="NM Roller — Escuela de Patinaje" />
        <meta name="twitter:description" content="Clases ilimitadas de patinaje en Buenos Aires. Desde cero hasta avanzado." />
        <meta name="twitter:image" content="/og-home.png" />
      </Helmet>
      <Navbar />
      <HeroSection />
      <ValueProposition />
      <ForWhom />
      <SedesSection />
      <BannerAlquilerHome />
      <PricingSection />
      <HorariosSection />
      <AppSection />
      <VideoSocialProof />
      <Testimonials />
      <NewsletterBannerHome />
      <Footer />
    </div>
  );
};

export default Index;

