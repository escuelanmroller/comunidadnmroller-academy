import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NewsletterDesdeCero from "./pages/NewsletterDesdeCero.tsx";
import RegistroConfirmadoNewsletter from "./pages/RegistroConfirmadoNewsletter.tsx";
import PagoConfirmado from "./pages/PagoConfirmado.tsx";
import ClasesMasAlquiler from "./pages/ClasesMasAlquiler.tsx";
import Masterclass from "./pages/Masterclass.tsx";
import ListaEsperaPage from "./pages/ListaEsperaPage.tsx";
import ListaEsperaConfirmada from "./pages/ListaEsperaConfirmada.tsx";
import ClaseGratis from "./pages/ClaseGratis.tsx";
import ClaseGratisConfirmada from "./pages/ClaseGratisConfirmada.tsx";
import ExclusivoSociosSportclub from "./pages/ExclusivoSociosSportclub.tsx";
import SportclubConfirmado from "./pages/SportclubConfirmado.tsx";
import TerminosCondiciones from "./pages/TerminosCondiciones.tsx";
import PoliticaPrivacidad from "./pages/PoliticaPrivacidad.tsx";
import NotFound from "./pages/NotFound.tsx";
import TutorialesPatinaje from "./pages/TutorialesPatinaje.tsx";
import PreguntasFrecuentes from "./pages/PreguntasFrecuentes.tsx";
import RutaDeAprendizaje from "./pages/RutaDeAprendizaje.tsx";
import PanelVentasLogin from "./pages/PanelVentasLogin.tsx";
import PanelVentas from "./pages/PanelVentas.tsx";
import PanelVentasConfiguracion from "./pages/PanelVentasConfiguracion.tsx";
import RequireAuth from "./components/panel-ventas/RequireAuth.tsx";
import WhatsappFloat from "./components/WhatsappFloat.tsx";
import ScrollToTop from "./components/ScrollToTop.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/newsletter-desde-cero" element={<NewsletterDesdeCero />} />
          <Route path="/registro-confirmado-newsletter" element={<RegistroConfirmadoNewsletter />} />
          <Route path="/pago-confirmado" element={<PagoConfirmado />} />
          <Route path="/clases-de-rollers-mas-alquiler" element={<ClasesMasAlquiler />} />
          <Route path="/masterclass-de-patinaje" element={<Masterclass />} />
          <Route path="/masterclass-de-patinaje/:slug" element={<Masterclass />} />
          <Route path="/masterclass-de-patinaje/:slug/lista-de-espera" element={<ListaEsperaPage />} />
          <Route path="/masterclass-de-patinaje/lista-de-espera-confirmada" element={<ListaEsperaConfirmada />} />
          <Route path="/clase-gratis" element={<ClaseGratis />} />
          <Route path="/clase-gratis-confirmada" element={<ClaseGratisConfirmada />} />
          <Route path="/exclusivo-de-socios-sportclub" element={<ExclusivoSociosSportclub />} />
          <Route path="/exclusivo-de-socios-sportclub-confirmado" element={<SportclubConfirmado />} />
          <Route path="/terminos-y-condiciones" element={<TerminosCondiciones />} />
          <Route path="/politicas-de-privacidad" element={<PoliticaPrivacidad />} />
          <Route path="/tutoriales-de-patinaje" element={<TutorialesPatinaje />} />
          <Route path="/preguntas-frecuentes" element={<PreguntasFrecuentes />} />
          <Route path="/ruta-de-aprendizaje" element={<RutaDeAprendizaje />} />
          <Route path="/panel-ventas/login" element={<PanelVentasLogin />} />
          <Route
            path="/panel-ventas"
            element={
              <RequireAuth>
                <PanelVentas />
              </RequireAuth>
            }
          />
          <Route
            path="/panel-ventas/configuracion"
            element={
              <RequireAuth>
                <PanelVentasConfiguracion />
              </RequireAuth>
            }
          />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <WhatsappFloat />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
