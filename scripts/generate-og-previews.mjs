// Genera los snapshots estáticos de public/previews/ que le sirve el .htaccess
// SOLO a bots de redes sociales (WhatsApp, Facebook, etc. — no ejecutan JS, así
// que nunca ven el título/og que arma react-helmet-async en el navegador).
//
// Una sola fuente de verdad acá abajo, para no repetir el error de contenido
// duplicado a mano que se desincroniza (ver errores #21/#26 del CLAUDE.md del
// proyecto). Cuando cambies el <title>/og:title/og:description de Helmet en
// alguna de estas páginas (o sumes una edición nueva de Masterclass), actualizá
// la entrada correspondiente acá y volvé a correr:
//   node scripts/generate-og-previews.mjs

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const SITE = "https://comunidadnmroller.com";
const DEFAULT_IMAGE = `${SITE}/og-home.png`;

const paginas = [
  {
    ruta: "renovar-alquiler",
    title: "Reservá tu turno · NM Roller",
    description: "Completá tus datos para que te preparemos el equipo para tu próxima clase.",
  },
  {
    ruta: "clases-de-rollers-mas-alquiler",
    title: "Clases de rollers + alquiler de equipo | NM Roller",
    description: "No tenés rollers? Te los damos. Clases grupales en +8 sedes con todo el equipo incluido.",
  },
  {
    ruta: "clase-gratis",
    title: "Clase de prueba gratis · NM Roller",
    description: "Probá una clase de patinaje antes de comprometerte con un plan.",
  },
  {
    ruta: "exclusivo-de-socios-sportclub",
    title: "Exclusivo socios SportClub · NM Roller",
    description: "Aprendé a patinar sin costo extra si sos socio SportClub.",
  },
  {
    ruta: "newsletter-desde-cero",
    title: "Newsletter Desde Cero — Comunidad NM Roller",
    description: "Empezá a patinar desde cero con tips, motivación y desafíos suaves en tu inbox.",
  },
  {
    ruta: "ruta-de-aprendizaje",
    title: "Ruta de Aprendizaje — Comunidad NM Roller",
    description: "Tu progreso sobre ruedas, paso a paso. Mapa de aprendizaje de NM Roller.",
  },
  // Masterclass: una entrada por edición activa (agregar acá al sumar una nueva
  // fecha en src/data/masterclasses.ts — el link viejo deja de tener preview
  // propia y cae al default del Home, lo cual está bien para un evento cerrado).
  {
    ruta: "masterclass-de-patinaje/puerto-madero-27-septiembre",
    title: "Sumate a la Masterclass | Domingo 27 de Septiembre en Puerto Madero",
    description: "Aprende técnicas avanzadas el Domingo 27 de Septiembre a las 14 hs. Cupos limitados. Incluye 2 clases a elección + seguro médico.",
    image: `${SITE}/og-masterclass.png`,
  },
];

const escapeHtml = (s) =>
  s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const render = ({ ruta, title, description, image = DEFAULT_IMAGE }) => {
  const url = `${SITE}/${ruta}`;
  const t = escapeHtml(title);
  const d = escapeHtml(description);
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>${t}</title>
<meta property="og:type" content="website">
<meta property="og:title" content="${t}">
<meta property="og:description" content="${d}">
<meta property="og:image" content="${image}">
<meta property="og:url" content="${url}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${t}">
<meta name="twitter:description" content="${d}">
<meta name="twitter:image" content="${image}">
<meta http-equiv="refresh" content="0; url=${url}">
</head>
<body>
<p><a href="${url}">Continuar a NM Roller</a></p>
</body>
</html>
`;
};

for (const pagina of paginas) {
  const outPath = join(ROOT, "public", "previews", `${pagina.ruta}.html`);
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, render(pagina));
  console.log("✓", outPath.replace(ROOT + "/", ""));
}
