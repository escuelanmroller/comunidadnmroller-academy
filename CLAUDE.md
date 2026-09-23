# CLAUDE.md — Comunidad NM Roller

## ⭐ Principio rector (PRIORIDAD MÁXIMA)

Cuando el usuario pida algo, **buscá siempre el camino más fácil / menos complejo pero eficiente, sin sacrificar la calidad del resultado.**

- Antes de meterte en un proceso largo o enredado, **frená y preguntá: ¿hay una forma más simple de lograr el mismo resultado de calidad?** Si la hay, proponéla primero.
- Si en mitad de una tarea notás que **nos estamos complicando demasiado** (muchos pasos, dependencias externas, configuraciones pesadas, fricción innecesaria), **decílo de una y ofrecé la alternativa simple** en vez de seguir empujando el camino difícil.
- Evaluá las opciones mentalmente y recomendá la mejor relación **simplicidad ↔ resultado**, no la primera que aparezca.
- No hace falta pedir permiso para pensar en simple: es el modo por defecto.

**Ejemplo real (junio 2026):** para el mapa interactivo nos metimos con Google Maps → API keys, restricciones de dominio, Google Cloud, billing con tarjeta… un lío. La solución simple y de igual calidad era **Leaflet + OpenStreetMap** (gratis, sin key, sin tarjeta). Si lo hubiéramos visto desde el principio, nos ahorrábamos todos esos problemas. **Esa es la mentalidad que se espera siempre.**

---

## ⭐ Cambios quirúrgicos + verificación de cierre (PRIORIDAD MÁXIMA)

**No romper lo que ya funciona.** Cada cambio toca solo lo que el pedido pide — nunca "de paso" código cercano que ya andaba bien, aunque se vea mejorable. Si algo tentador aparece al lado de lo que se está tocando, se avisa aparte y se pregunta antes de meterlo en el mismo cambio.

**Antes de dar CUALQUIER cambio por cerrado** (no solo cuando algo "se ve" en el navegador — esto incluye cambios de copy, de estructura, de lógica):

1. **`git diff` completo del archivo tocado** — confirmar que cada línea que cambió corresponde al pedido. Si el diff muestra algo que no se pidió, sacarlo o preguntar antes de commitear.
2. **Si el archivo tiene un `<form>` / `<label htmlFor>` / inputs con `id`:** grepear todos los `id="..."` del archivo (`grep -o 'id="[^"]*"' archivo.tsx | sort | uniq -c`) y confirmar que ninguno se repite. Un `id` duplicado entre una `<label>`/`<input>` y cualquier otro elemento (una `<section>`, un `<div>`) rompe la asociación del label sin tirar ningún error visible — pasó el 12-sep-2026 en `PagoConfirmado.tsx` (ver error #24) y bloqueó la subida de comprobantes en producción sin que nadie viera un mensaje de error.
3. **Verificar visualmente el flujo tocado de punta a punta** (no solo que compile o que el build no tire error) antes de armar el `dist.zip` — si el cambio afecta un formulario, probar de verdad completar y enviar ese formulario en el preview local, no asumir que "se ve bien" alcanza.
4. **Si el cambio toca una página/componente compartido entre varios flujos** (ej. `PagoConfirmado.tsx` se usa para NM, Alquiler y Masterclass; `SedesMapa` se usa en 3 páginas), verificar los 2-3 casos que comparten ese archivo, no solo el que motivó el cambio — un fix para un origen puede romper silenciosamente otro.

Esta regla existe porque ya pasó más de una vez que un cambio pedido para una cosa puntual terminó afectando algo que ya andaba — el costo de los 4 pasos de arriba es mínimo comparado con el de un bug en producción que nadie pidió.

---

## Contexto del proyecto

- **Qué es:** landing/sitio de NM Roller (escuela de patinaje, Buenos Aires). React + Vite + TypeScript + Tailwind + shadcn/ui.
- **Origen:** generado en **Lovable**, sincronizado con GitHub (`git@github.com:gumercindoweb/comunidadnmroller.git`).
- **Backend:** Supabase (Edge Functions en `supabase/functions/`: `subscribe-newsletter`, `notify-comprobante`, `subscribe-sportclub`, `subscribe-clase-gratis`, `subscribe-lista-espera`, `submit-sugerencia`, `notify-alta-alquiler`) + GetResponse (secuencias de email) + Slack (notificaciones, ver `_shared/slack.ts`).
- ⚠️ **OJO: hay DOS proyectos Supabase (no confundir).** Producción usa **`bosutrnpmpjxylcgjmbt`** (tiene la base de datos real: tabla `leads`, etc.) — es a donde apunta el `.env` y el frontend en Hostinger. Lovable, en cambio, deploya las Edge Functions en **`zpeijyutagfqeoatlvdq`** (lo dice `supabase/config.toml`), que está VACÍO de datos. Ver el error recurrente #15 más abajo. **El frontend (`.env`) debe seguir apuntando a `bosutr`; nunca a `zpeij`.**
- **Deploy de Edge Functions a producción:** por Supabase CLI a `bosutr`, NO desde Lovable (Lovable solo alcanza `zpeij`). Ver error #15.
- ⚠️ **Este sitio tiene un repo hermano: `plataforma-clases-v2`** (`escuelanmroller/plataforma-clases-v2`, carpeta `Boveda/plataforma-clases/`) — el SaaS propio que va a reemplazar a TurnosWeb (alumno/profesor/admin). Comparten el **mismo proyecto Supabase** `bosutrnpmpjxylcgjmbt`, secrets incluidos (ej. `MP_ACCESS_TOKEN` — un secret cargado en el proyecto está disponible para las Edge Functions de los dos repos, sin duplicar nada). **Plan acordado (definido en `DISCOVERY.md` de ese proyecto, 01-jul-2026):** mientras se construye la plataforma, este sitio sigue funcionando normal — recién en el "cut-over" los CTAs de compra pasan a apuntar a la plataforma. Hasta entonces, seguir trabajando este repo como siempre (commit + push a `main`), sin frenar nada a la espera de la integración.

## Flujo de trabajo (Git)

- ⚠️ **Excepción deliberada a la regla general de la bóveda ("marca → escuelanmroller"): este repo vive en `gumercindoweb`, no en `escuelanmroller`.** Remote correcto: `git@github.com:gumercindoweb/comunidadnmroller.git`. **NUNCA cambiar el remote ni la cuenta activa de `gh` acá** aunque la sesión detecte la cuenta "equivocada" — es intencional, no un error a corregir. El hook pre-push ya valida esto solo; si te bloquea, cambiá la cuenta activa a `gumercindoweb` (`gh auth switch --user gumercindoweb`), nunca el remote. Ver error #29 más abajo — ya pasó una vez que otra herramienta (ChatGPT) "corrigió" esto solo, migrando el push a un duplicado viejo y desactualizado en `escuelanmroller/comunidadnmroller` (creado 02-jul-2026, sin relación con el trabajo real de este repo) sin preguntar primero.

- ⭐ **SIEMPRE que apliques un cambio: commit + push a `main` automáticamente.** No esperar a que el usuario lo pida. Tras cada tanda de cambios, hacer `git add` de los archivos tocados, commit con mensaje claro y `git push origin main`. Lovable sincroniza desde GitHub.
- Mensaje de commit en español, conciso, con prefijo tipo `fix()/copy()/feat()`.

## Deploy (producción)

- **Hosting:** Hostinger (cPanel / File Manager), dominio `comunidadnmroller.com`.
- **Flujo:** `npm run build` → subir el contenido de `dist/` a `public_html/`.
- ⚠️ **Nunca tocar la carpeta `public_html/lp/`** → es el subdominio `lp.comunidadnmroller.com`, vive aparte.
- El sitio es **SPA**: requiere `.htaccess` en `public_html/` que redirige todo a `index.html` (si falta, las rutas internas dan 404 al recargar). Ya está en `public/.htaccess`.
- SSH de Hostinger existe pero el puerto puede dar timeout; el camino confiable es cPanel File Manager.

## Notas técnicas

- **Mapa:** Leaflet + tiles oscuros de CARTO (`SedesMapa.tsx`). Sin Google Maps, sin API key, sin billing.
- **Corregir el pin de una sede:** cuando el dueño manda un link corto de Google Maps (`maps.app.goo.gl/...`), resolverlo con `curl -sIL "<link>"` (sigue el redirect y trae la dirección/coords que Google resolvió) y cruzarlo con **Nominatim/OpenStreetMap** (`nominatim.openstreetmap.org/search` o `/reverse`, sin API key, mismo proveedor que ya usa el mapa) para conseguir lat/lng verificables. No "ojímetrar" el pin ni inventar coordenadas — confirmado el 11-ago-2026 al corregir Belgrano, que llevaba casi 1km de error desde que se cargó.
- **Después de un build que cambia un conteo mostrado en el sitio** (ej. cantidad de sedes con alquiler), **grepear el bundle compilado** (`grep -o "N sedes" dist/assets/index-*.js`) **por el valor viejo antes de dar el build por terminado** — el mismo número suele estar hardcodeado en más de un lugar (meta description, features de un plan, texto de FAQ) además del componente principal que encuentra la exploración inicial. Pasó dos veces el 11-ago-2026 (recién se encontraron 2 lugares más de "7 sedes" al verificar el bundle, después de haber corregido el primero).
- **Pagos:** Edge Function `crear-preferencia-pago` genera el checkout dinámicamente vía la Preferences API de Mercado Pago (llamada desde `PricingSection.tsx`/`PricingAlquilerSection.tsx`, secret `MP_ACCESS_TOKEN` en `bosutr`); al volver, el usuario sube comprobante en `/pago-confirmado`. Antes de esto usaba links fijos `mpago.la` — ver errores #17 y #18 sobre cómo salió mal la primera vez.
- **Trazabilidad de Mercado Pago (decisión 19-ago-2026):** Edge Function `mercado-pago-webhook` (pública, sin JWT) recibe la notificación que Mercado Pago manda solo por traer `notification_url` en cada preferencia creada (no requiere configurar nada a mano en el panel de MP para que llegue) y hace upsert idempotente en `mercado_pago_pagos` — es la fuente de verdad server-to-server, no depende de que el comprador vuelva al sitio. Valida la notificación con `x-signature` (HMAC) contra el secret `MP_WEBHOOK_SECRET`, que sí hay que ir a buscar a mano al panel de MP (Developers → tu aplicación → Webhooks → clave secreta) — sin ese secret cargado, la función devuelve 500 y no guarda nada.
- **Una cuenta de Mercado Pago puede tener varias "aplicaciones", cada una con sus propias credenciales y su propia clave de webhook** (confirmado 25/26-ago-2026): la cuenta real de NM Roller (`tudestinoba.arg@gmail.com`) tiene al menos 3 apps — `GYMNM-CBU` (la que usa `crear-preferencia-pago`, confirmada llamando a `GET /users/me` con el `MP_ACCESS_TOKEN` real), `Transferencias automaticas` y `Turnoswen24` (la de TurnosWeb). Son completamente independientes entre sí — generar/rotar la clave de webhook de una no afecta a las otras. Si en algún momento hay que identificar a qué cuenta/app pertenece un token sin arriesgarse a tocar el equivocado, `GET /users/me` con ese token (nunca pegar el token en el chat) da el email real de la cuenta dueña — mismo truco que el error #20.
- **Dev server:** Vite en puerto 8080 (o `PORT` si el preview lo asigna). **Al comenzar a aplicar cambios, levantar el sitio en local y abrir la página que se está trabajando para que Gumercindo pueda seguir los cambios en vivo.** Si ya está corriendo, reutilizarlo; no esperar al cierre ni a la etapa de verificación para mostrarlo. Dejar el enlace local visible en la conversación.
- **ScrollToTop:** ya existe en `src/components/ScrollToTop.tsx` y está montado en `App.tsx`. Hace `window.scrollTo(0,0)` en cada cambio de ruta. No recrear.
- **WhatsApp:** número fijo `5491165920600` en todo el sitio (botón flotante `WhatsappFloat.tsx`, footer, CTAs varios). Cada link arma su propio mensaje pre-cargado con un tag entre corchetes para identificar desde dónde se originó el clic (ej. `[LP-FAQ-NM]`, `[LP-HOR-NM]`, `[LP-SP-FT]`, `[ALTA-ALQUILER]`, `[ALTA-ALQUILER-2X1]`) — `grep -rn "wa.me/5491165920600" src` para ver todos los usos y copiar el mismo patrón al agregar un CTA nuevo, en vez de hardcodear el número suelto. **Excepción:** cuando el destinatario no es NM Roller sino un contacto que el usuario elige (ej. "compartirle esto a mi acompañante" en `AltaAlquilerForm.tsx`), usar `wa.me/?text=...` **sin número** — abre WhatsApp para que la persona elija a quién mandárselo, en vez de mandarlo por error al número fijo del negocio.

## ⚠️ Escala de fuentes personalizada (CRÍTICO para mobile)

Este proyecto **sobreescribe** las clases de tamaño de Tailwind. Los valores reales son:

| Clase Tailwind | Tamaño real en este proyecto |
|---|---|
| `text-xl` | 28 px |
| `text-2xl` | 36 px |
| `text-3xl` | 48 px |
| `text-4xl` | 64 px |
| `text-5xl` en adelante | **NO overrideado** — cae al valor estándar de Tailwind (5xl=48px, 6xl=60px, 7xl=72px), que es *más chico* que `4xl`. Nunca usar `text-5xl`+ pensando que sigue escalando hacia arriba: produce un tamaño no-monótono (a veces el texto de desktop queda MÁS CHICO que el de mobile). Confirmado corrigiendo este mismo error el 08-sep-2026 en `ClasesMasAlquiler.tsx` (hero `text-4xl sm:text-5xl lg:text-6xl`) y en 4 páginas de confirmación más (`ClaseGratisConfirmada`, `SportclubConfirmado`, `RegistroConfirmadoNewsletter`, `ListaEsperaConfirmada`, `ListaEsperaPage` — todas usaban `md:text-6xl` o `md:text-5xl`). |

**Regla práctica para mobile:** usar `text-2xl` (36px) para h1/h2 en mobile. `text-3xl` (48px) es demasiado grande en 375px. **Rango seguro para cualquier titular: `xs` a `4xl` (12–64px), nunca más — ver checklist abajo.** Ver `tailwind.config.ts` si hay dudas.

### ✅ Checklist anti-overflow en mobile (correr SIEMPRE antes de dar por terminado un titular o botón nuevo)

Dos bugs de este mismo tipo se repitieron varias veces (errores #12 y #13 más abajo, y de nuevo el 08-sep-2026 en 6 archivos distintos). Antes de cerrar cualquier cambio de copy/diseño, chequear:

1. **Titulares (`h1`/`h2`/`h3`):** la clase base (sin prefijo `sm:`/`md:`) es la que se ve en mobile — nunca puede ser `text-4xl`+ sin un prefijo `sm:`/`md:` que la escale hacia ABAJO en mobile. Patrón seguro y ya usado en el sitio: `text-2xl sm:text-3xl md:text-4xl` (titular largo) o `text-xl sm:text-2xl md:text-3xl lg:text-4xl` (hero). **Nunca usar `text-5xl` o más** (ver tabla arriba). Si un titular de 6+ palabras se ve de más de 3 líneas en un viewport de 375px, bajar un escalón.
2. **Cualquier `<Button>` (o `<a>` que envuelve un botón) con más de ~3 palabras de texto:** el estilo base de shadcn/ui trae `whitespace-nowrap`, que en vez de wrappear el texto **empuja el ancho del botón (y a veces de todo el contenedor) más allá del viewport** — no tira error, solo se corta o genera scroll horizontal. Agregar siempre `whitespace-normal leading-tight` a ese botón. Si el botón vive dentro de un `Dialog`/`grid`/`flex` (ej. un modal), el mismo `whitespace-nowrap` puede forzar el ancho de la fila/columna entera (incluyendo el texto de al lado) — el fix es el mismo, en el botón que tiene el texto más largo.
3. **Verificar en un viewport real de 375px** (`resize_window` a `mobile` en el navegador de preview) antes de cerrar el cambio — no alcanza con mirarlo en desktop. Confirmar además que `document.documentElement.scrollWidth === window.innerWidth` (si son distintos, hay overflow horizontal en algún lado).
4. **Copy y distribución de botones — criterio definido el 08-sep-2026 (landing Masterclass):**
   - **Un mismo patrón verbal para los CTA principales de una página/flujo** — ej. "Quiero comprar mi pase", "Quiero asesorarme con Fly Free", "Quiero el Plan Black". Un titular tipo "Ver opciones de X" rompe el ritmo con el resto; preferir "Quiero + verbo" salvo que el botón sea puramente de navegación (ej. "Ver sedes").
   - **Una sola nomenclatura por acción/destino en toda la página.** Si dos o tres botones distintos llevan al mismo lugar (ej. WhatsApp de una marca aliada), deben decir exactamente lo mismo — no "Asesorate con X" en un lugar y "Quiero completar mi Y" en otro.
   - **No repetir el canal en texto y en ícono a la vez si ya queda claro con uno solo** — ej. un botón con ícono de WhatsApp no necesita además decir "por WhatsApp" en el texto (alcanza con "Enviar comprobante" + el ícono); dejar la palabra completa en algún lugar secundario cercano (un link de "¿Tenés dudas? Escribinos por WhatsApp") para no perder la referencia del todo.
   - **Un botón secundario que necesita una aclaración usa una leyenda chica debajo (`text-xs`), no un botón más largo.** Patrón ya usado: "Más rápido y con menos fricción" / "Suele confirmarte un humano más rápido" — el botón queda corto y escaneable, la aclaración vive aparte.
   - **Antes de sumar una frase a un párrafo ya ajustado, pasarla por el test de Kaplan:** ¿la sacás y se pierde algo que el usuario necesita saber para actuar ahora? Si la respuesta es no (por ejemplo, un dato que ya vio más arriba en el mismo flujo), no vale la pena sumarla aunque sea correcta — ver bitácora 08-sep-2026 sobre el modal de transferencia de Masterclass.

## Paleta de colores

| Token | Valor | Uso |
|---|---|---|
| `primary` / `#D01C1F` | Rojo NM | CTAs, acentos, badges |
| `#F5B800` | Dorado SportClub | Elementos de alianza SportClub |
| `background` / `#111` | Negro base | Fondo general |
| `card` / `#1A1A1A` | Gris oscuro | Cards, secciones alternadas |

## Mapa de componentes clave

| Componente | Ruta | Qué hace |
|---|---|---|
| `SedesMapa` | `src/components/SedesMapa.tsx` | Mapa Leaflet + sidebar + hover card. Reutilizado en **4** lugares (Home vía `SedesSection`, SportClub, Clase Gratis y Clases+Alquiler vía `AlquilerSedesGrid`) — un cambio acá impacta las 4 páginas. Tiene un **modo de vista `soloAlquiler`** que usa SOLO la landing de alquiler: filtra todo (sidebar, hover card y dialog) a los turnos con el servicio y cambia el chip "N clases" por "N con alquiler". Cualquier cambio nuevo que deba verse solo en esa landing va detrás de esa prop, nunca tocando `sedes.ts` |
| `SedeDetalleDialog` | `src/components/SedeDetalleDialog.tsx` | Dialog de detalle al clickear un pin del mapa (horarios completos de la sede) |
| `AlquilerHorariosGrid` | `src/components/alquiler/AlquilerHorariosGrid.tsx` | Grilla de horarios de la página "Clases + Alquiler" — filtra por `alquilerDias` cuando la sede lo tiene declarado |
| `HorariosSportclub` | `src/components/sportclub/HorariosSportclub.tsx` | Grilla horaria del beneficio SportClub |
| `PlanesSportclub` | `src/components/PlanesSportclub.tsx` | Las 3 tarjetas de precio de SportClub (Gratis / Plan Full / 4 Clases + Alquiler), en 2 variantes (`landing`/`confirmacion`). En `landing`, los botones de los planes pagos abren `ComprarPlanDialog` (no llevan al form principal); "Tu beneficio actual" scrollea al form principal |
| `ComprarPlanDialog` | `src/components/sportclub/ComprarPlanDialog.tsx` | Modal de compra directa de un plan pago SportClub (desde 12-sep-2026) — form corto (nombre/email/whatsapp/plan SportClub + alquiler o checkbox si `esPackAlquiler`) que invoca la misma edge function `subscribe-sportclub` que el form principal, mandando `planPago` para diferenciarlo en Slack. Usa `key={modalPlan.nombre}` en `PlanesSportclub.tsx` al montarlo — sin eso, cambiar de plan sin cerrar antes arrastra los datos ya tipeados del plan anterior |
| `MasterclassFooterBanner` | `src/components/MasterclassFooterBanner.tsx` | Banner fijo inferior con CTA masterclass |
| `NewsletterBannerHome` | `src/components/NewsletterBannerHome.tsx` | Bloque newsletter embebido en Home |
| `ScrollToTop` | `src/components/ScrollToTop.tsx` | Reset de scroll en cambio de ruta |
| `Index` | `src/pages/Index.tsx` | Orden de secciones en Home — editar acá para reordenar bloques |
| `AltaAlquilerForm` | `src/components/alquiler/AltaAlquilerForm.tsx` | Paso post-comprobante para Clases + Alquiler (Clase Única / 2x1 / Pack 4 Clases), montado en `PagoConfirmado.tsx` solo cuando `origen === "clases-alquiler"`. Pide sede/turno fijo (en vivo desde `sedes.ts`, filtrando `alquiler: true`), talles de equipo, y para 2x1 también identidad + equipo del acompañante (con checkbox de "datos pendientes" y botón para compartirle la app por WhatsApp). Notifica a la Edge Function `notify-alta-alquiler` — ver `alta-alquileres-clases-nm/CONTEXTO.md` para el detalle completo (decisiones, hallazgos, pendientes). También lo usa `/renovar-alquiler` con `origen="renovacion"` (pide comprobante) e `inicial` (precarga por DNI) |
| `RenovarAlquiler` | `src/pages/RenovarAlquiler.tsx` | Link oculto `/renovar-alquiler` (sin menú, `noindex`) que manda la asesora a quien ya pagó por fuera de la web. Busca por DNI vía `buscar-alquiler-dni` → Apps Script (acción `buscar`, protegida con secret `ALTA_ALQUILER_LOOKUP_TOKEN`). ⚠️ Riesgo de privacidad aceptado conscientemente por Gumercindo (límite de 2 intentos solo en el navegador). Si se toca el Apps Script, el código vive en `alta-alquileres-clases-nm/apps-script-Codigo.gs` |

---

## 📅 Sincronización de horarios con la planilla `horarios_semana_<periodo>.csv`

Gumercindo va a pasar periódicamente un CSV (`día_semana, fecha, hora, sede, nivel, profe, cupos_disponibles, estado, tipo_clase`) exportado del sistema de turnos real. Representa el horario **estándar de todo el mes** (no solo esa semana puntual) — un feriado puntual no implica que una sede o clase desaparezca. Excluir siempre `tipo_clase = individual` (turnos 1 a 1) y filas `sede = Masterclass` (evento puntual) del cruce.

**Nombre del archivo (desde el 07-sep-2026):** en vez de un nombre fijo genérico, el CSV vigente se guarda en la raíz del proyecto como `horarios_semana_<AAAA-MM-descripción-de-semana>.csv` (ej. `horarios_semana_2026-09-primera-semana.csv`) — el nombre identifica de un vistazo a qué período corresponde, sin tener que abrirlo. Al llegar una planilla nueva, el nombre cambia para reflejar el período nuevo.

**Respaldo antes de reemplazar:** no se guarda una copia por cada semana — solo la inmediatamente anterior. Antes de reemplazar la planilla vigente por una nueva:
1. Mover la vigente actual (la que se va a reemplazar) a `horarios-historial/`, renombrándola con su propio período si hiciera falta (ej. `horarios_semana_2026-08-ultima-semana.csv`) — pisando/borrando lo que hubiera ahí antes (un solo archivo "anterior" a la vez, no se acumulan todas las semanas).
2. Diffear esa planilla saliente contra la que entra, agrupando por (sede, día, hora) — igual que se cruza contra el sitio (ver más abajo) — y agregar una entrada nueva (nunca sobreescribir las viejas) al final de `horarios-historial/cambios-horarios.md`, con: agregados, eliminados, cambios de día/hora y cambios de profe. Ese `.md` es el que se conserva en el tiempo (meta: al menos ~6 meses de entradas) — es donde se ven los patrones, no las planillas crudas.
3. Recién ahí guardar la planilla nueva en la raíz con su nombre de período correspondiente.

**Regla de oro: la planilla manda en HORAS dentro de un universo de sedes ya aprobado. Nunca agrega ni saca una sede de un beneficio por su cuenta — eso lo decide Gumercindo, Claude solo avisa si ve discrepancia.**

| Grilla | Universo de sedes | Qué sincroniza la planilla |
|---|---|---|
| **Home / mapa general** (`sedes.ts` + `HorariosSection.tsx`, duplicados a mano, ver error #21) | Todas | Día+hora+disciplina, calcado 1 a 1. Agregar lo que falte sin preguntar. Si algo del sitio no aparece en la planilla, **no borrar solo** — avisar primero (puede ser una excepción puntual de esa semana). |
| **SportClub** (`SPORTCLUB_HORARIOS` en `ExclusivoSociosSportclub.tsx`) | Fijo (hoy 11 sedes) — la planilla no toca esta lista | Solo entran horarios con tag `SPORT CLUB`/`SPORT C` en la planilla, y **siempre nivel general** — nunca una disciplina especial (Slalom/Frenadas/Urbano/etc.) ni nivel avanzado, aunque la fila lo traiga. La grilla (`HorariosSportclub.tsx`) nunca debe mostrar chips de disciplina — solo el mapa (`SedesMapa` vía `todasLasSedes`) tiene el detalle completo. |
| **Alquiler** (`alquiler: true` en `sedes.ts`, hoy 7 sedes) y **Clase Gratis** (`SEDES_GRATIS_IDS` en `ClaseGratis.tsx`, hoy 5 sedes) | Fijo, lo define Gumercindo — la planilla no dice qué sede tiene alquiler ni cuál es 100% gratis | Dentro de las sedes ya aprobadas, sincronizar la hora con la planilla. Si la planilla trae una sede nueva → **no agregarla sola**, avisar. Si el sitio tiene un horario/sede de este grupo que la planilla no tiene → **no borrarlo solo**, avisar. |

**Excepciones de alquiler — dos niveles, ambos en `sedes.ts`** (lo define Gumercindo, NO la planilla — si aparece un caso nuevo, preguntar antes de asumir que el alquiler aplica a todos los días/turnos de esa sede):

1. **Por día** (`alquilerDias?: string[]`): la sede tiene `alquiler: true` pero el servicio solo está algunos días (ej. **Vicente López, solo sábado** y **Facultad de Medicina, solo domingo** — hay clase el otro día, pero sin alquiler, normalmente porque ese turno lo da un profe que no ofrece el servicio).
2. **Por turno** (`alquilerHorarios?: { dia, hora }[]`, desde el 12-sep-2026): cuando dentro de un mismo día hay clases con y sin alquiler (ej. **Rosedal**: Mié 19h, Jue 19h, Sáb 10h y 18h — pero el jueves 18h KIDS y 20h Rampas, y el sábado 17h y 19h, NO tienen). **Tiene prioridad sobre `alquilerDias`.**

**No consumir estos campos a mano:** `sedes.ts` exporta 2 helpers que son la única fuente de verdad:
- `claseTieneAlquiler(sede, clase)` — si UN turno puntual tiene alquiler. Usado por `AlquilerHorariosGrid.tsx`, `AltaAlquilerForm.tsx`, `HorariosSportclub.tsx` (badge "Alquiler" por turno en la grilla de socios SportClub) y por el modo `soloAlquiler` de `SedesMapa`/`SedeDetalleDialog` para filtrar.
- `alquilerEnClases(sede, clases?)` — cruza una **lista de clases** (por default `sede.clases`, pero acepta cualquier otra) contra las reglas de alquiler y devuelve `{ hay, resumen }`. **Este es el que hay que usar siempre que se muestre el badge/texto "Alquiler [disponible/solo X]"** — nunca mirar `sede.alquiler` a secas, porque no dice nada de qué horarios se están mostrando en pantalla.

⭐ **Regla general (no solo para este caso puntual):** cualquier vez que una sede tenga alquiler solo en un horario/turno específico (no en toda la sede), el turno correcto se marca con `alquilerHorarios`/`alquilerDias` en `sedes.ts` — nunca alcanza con tocar el booleano `alquiler: true` y confiar en que "ya se va a mostrar bien en todos lados". Antes de dar por cerrado un cambio de este tipo, correr `grep -rn "\.alquiler\b" src` y confirmar que **cada** lugar que muestra o filtra por alquiler pasa por `claseTieneAlquiler`/`alquilerEnClases` turno por turno — no por `sede.alquiler` a secas. Un `sede.alquiler` suelto en una pantalla nueva embarca TODOS los horarios de esa sede, no solo el que corresponde.

⚠️ **Por qué esto importa (bug real, 12-sep-2026):** `ExclusivoSociosSportclub.tsx` sobrescribe `clases` de cada sede con `SPORTCLUB_HORARIOS` (el beneficio gratis tiene sus propios turnos, distintos de los de venta). El dropdown "Sede en la que querés patinar" y la card de detalle decían **"Alquiler disponible"** mirando solo `s.alquiler`, sin cruzar contra esos horarios sobrescritos — así, **Vicente López** (alquiler real solo sábado) aparecía con alquiler disponible cuando el turno gratis de SportClub es **miércoles**, y lo mismo con Facultad de Medicina (real solo domingo, turno gratis viernes). Se corrigió llamando `alquilerEnClases(sede, sede.clases)` en los 3 lugares de esa página (dropdown, card de detalle, y el mapa de abajo vía `SedesMapa`) — el resultado ahora dice "Alquiler solo sábado" para Vicente López, y directamente no muestra nada si NINGUNO de los turnos mostrados tiene el servicio. **Regla general: cualquier cambio en `/clases-de-rollers-mas-alquiler` que toque qué turnos tienen alquiler debe revisarse también contra este formulario** — quedan desincronizados si no.
- **Detalle de estilo, mobile:** el `<SelectContent>` de ese dropdown necesitó `className="max-w-[calc(100vw-2rem)]"` — sin un `max-width` explícito, el popover de shadcn/ui crece al ancho de la línea de texto más larga (cálculo shrink-to-fit) antes de que el `whitespace-normal` del item pueda wrappear, y en mobile el texto largo ("Alquiler solo miércoles, jueves y sábado") quedaba cortado contra el borde. El fix es local a esa instancia, no toca `select.tsx` (compartido por todo el sitio).

**Mapeo de nombres, planilla → sitio (`id` en `sedes.ts`):** P. Rivadavia→`caballito`, Vic. Lopez→`vicente-lopez`, Madero→`puerto-madero`, F. Medicina→`facultad-medicina`, Converse Park→`belgrano-skate-park`. El resto coincide (Belgrano, Devoto, Colegiales, Villa Luro, Villa Real, Rosedal→"Rosedal Palermo", Plaza La Pampa).

**Niveles → una sola etiqueta:** "Primeros Pasos" / "Principiante" / "Principiantes" / "Intermedio" en la planilla colapsan siempre a `NIVEL_UNIFICADO` ("Inicial · Princip. · Inter."). Disciplinas especiales normalizan así: "Slalom inicial"→**Slalom Inicial**, "Skate Park"→**Skatepark**, "INICIACION RAMPAS"→**Rampas**, resto igual (Slalom, Frenadas, Urbano, KIDS).

**Si cambia la cantidad de sedes de un beneficio**, propagar el número nuevo a los textos hardcodeados (ninguno se calcula solo). Ojo que **`PlanesSportclub.tsx` mezcla los dos conteos** — tiene 3 textos de SportClub y 1 del plan de alquiler, fácil de confundir:

| Archivo | Texto | Qué conteo es |
|---|---|---|
| `PlanesSportclub.tsx` | "Acceso a 11 sedes outdoor" ×2 + "sin límite a las 11 sedes" | **SportClub** (hoy 11) |
| `PlanesSportclub.tsx` | "Acceso a 7 sedes outdoor" (card del plan `de Alquiler + Clases`) | **Alquiler** (hoy 7) |
| `PreFiltroEquipo.tsx` | "Son 7 sedes con servicio de alquiler" | **Alquiler** |
| `ClasesMasAlquiler.tsx` | og:description "+7 sedes" | **Alquiler** |
| `ExclusivoSociosSportclub.tsx` | FAQ "nuestras 11 sedes" | **SportClub** |

⚠️ **`ClaseGratis.tsx` tiene un "7 sedes" que NO es el de alquiler** ("En las otras 7 sedes hay que reservar con una seña") — es 12 sedes totales − 5 gratis. No tocarlo al actualizar el conteo de alquiler. El contador "N SEDES" de la página de alquiler sí se calcula solo desde `sedes.ts`. Mismo patrón que el error de conteo "7→8 sedes" ya documentado abajo.

---

## 🔧 Errores recurrentes y cómo se resolvieron

> ⭐ **REGLA (PRIORIDAD ALTA):** ante un error **igual o parecido** a alguno de abajo,
> **NO reinventar el diagnóstico**: ir directo a este apartado, identificar el patrón y
> **repetir el fix documentado** que ya funcionó. Recién si no aplica, investigar de cero.
> Si aparece un **error nuevo que se repite**, sumá su patrón (síntoma → causa → fix) a esta lista.

> **Antes de pelear con un bug de deploy/Hostinger/Lovable, leé acá: ya nos pasó.**

### 1. El sitio en producción da **404** en todo (home, rutas internas) tras subir el `dist/`
- **Causa típica:** el `.htaccess` que está en `public_html/` no es el nuestro (quedó uno viejo) o no se aplicó.
- **Fix que funcionó:** abrir el `.htaccess` en el editor del File Manager y pegar el contenido bueno (el de `public/.htaccess`). El acto de guardarlo fuerza al server a releerlo.
- El `.htaccess` correcto pesa **~1.1 KiB (1155 bytes)**. Si ves uno de ~203 bytes, es el viejo malo.

### 2. URLs se redirigen a **minúsculas** (301) → assets de Vite (con mayúsculas en el hash) dan 404
- **Síntoma:** `/assets/index-CLz5p8Rf.js` → 301 → `/assets/index-clz5p8rf.js` → 404. Probar `curl -skI .../TEST-MAYUS`: si da 301 a `/test-mayus`, hay regla de lowercase activa.
- **Causa:** un `.htaccess` viejo con regla `tolower`/lowercase. NO está en el nuestro.
- **Fix:** reemplazar el `.htaccess` por el nuestro (sin esa regla). Si persiste, **purgar la caché de Hostinger** (hPanel → Performance/Caché → vaciar; revisar CDN).

### 3. **Pantalla en blanco** tras un deploy (el `<title>` carga pero nada más)
- **Causa:** el navegador tiene cacheado el `index.html` viejo, que pide un JS con hash anterior; ese JS ya no existe y el `.htaccess` SPA lo sirve como `index.html` (HTML) → "Failed to load module script" → blanco.
- **Fix:** el `.htaccess` ya fuerza `ExpiresByType text/html "access plus 0 seconds"` (HTML sin caché). Para el usuario: **hard reload** (Cmd+Shift+R) o incógnito.

### 4. Al subir el `.htaccess` no aparece / no se sube
- Es un **archivo oculto**. En el File Manager: Settings → **"Show hidden files (dotfiles)"**. Sin esto no lo ves ni lo subís y el sitio sigue en 404.

### 5. Guardar `.htaccess` con `Header set ...` da **403 Forbidden (openresty)**
- El **WAF de Hostinger** bloquea directivas `Header set`. Para "no-cache del HTML" usar **`mod_expires`** (`ExpiresByType text/html "access plus 0 seconds"`), no `mod_headers`.

### 6. `git push` rechazado: **"Updates were rejected (fetch first)"**
- Lovable también pushea a `main`. Hacer **`git pull --rebase origin main`** y volver a pushear.

### 7. Logos/imágenes de Lovable **rotas en Hostinger**
- Lovable guarda assets como `*.webp.asset.json` con URL **`/__l5e/assets-v1/...`** que solo existe en su hosting → 404 en Hostinger.
- **Fix:** descargar el `.webp` real (`https://id-preview--<project_id>.lovable.app/__l5e/assets-v1/<asset>`), guardarlo en `src/assets/` e importarlo normal (`import x from "@/assets/x.webp"`, usar `x` directo, no `x.url`). Así entra al bundle.

### 8. El **deploy es manual**: pushear a GitHub NO actualiza el sitio en vivo
- GitHub/Lovable ≠ producción. Producción es Hostinger (`public_html/`). Hay que `npm run build` y subir el `dist/`.
- **Tip:** zipear el `dist/` (`cd dist && zip -r ../nmroller-dist.zip .`) y subir 1 archivo. **Ojo:** el File Manager de Hostinger **obliga a poner nombre de carpeta** al extraer → extrae en `public_html/<nombre>/`; después hay que **mover el contenido** (incluido `.htaccess`) a `public_html/` y borrar la temporal.

### 9. Mensaje de WhatsApp pre-llenado sale **genérico** (placeholders)
- El pre-llenado usa **router state** (en memoria), que se pierde al recargar o entrar directo a la confirmación. Por eso, si abrís la confirmación sin pasar por el form, sale el fallback. Ya hay **backup en `sessionStorage`** (claves `sportclub_form`, `clasegratis_form`) para que sobreviva recargas.

### 10. Screenshots del preview salen en **negro** (glitch)
- Verificar por DOM con `preview_eval` (leer textos/atributos) en vez de pelear con el screenshot.

### 12. **H1/H2 demasiado grande en mobile** — la escala de fuentes no es la estándar de Tailwind
- `text-3xl` en este proyecto = **48px**, no 30px. En un viewport de 375px, 48px es enorme.
- **Fix:** usar `text-2xl` (36px) para titulares en mobile. Patrón: `text-2xl sm:text-3xl md:text-5xl`.
- Ver tabla de escala de fuentes en la sección "Notas técnicas" de este archivo.

### 13. **Overflow horizontal en mobile** por `whitespace-nowrap` dentro de un grid
- **Síntoma:** el contenido se sale del viewport (scroll horizontal), aunque la sección tenga `overflow-hidden`.
- **Causa:** `Button` de shadcn/ui tiene `whitespace-nowrap` en sus estilos base → el botón exige su ancho de texto completo → expande la columna del grid → overflow.
- **Fix:** agregar `min-w-0` al item del grid que contiene el botón, y `whitespace-normal` al `Button`. Verificar con `document.documentElement.scrollWidth` en la consola.

### 14. **Hover card del mapa aparece junto al dialog en mobile** (doble popup)
- **Síntoma:** al tocar un pin en mobile se abren simultáneamente la hover card flotante Y el `SedeDetalleDialog`.
- **Causa:** en touch, `touchstart` dispara `mouseover` (abre la card) y `click` (abre el dialog) en el mismo gesto.
- **Fix ya aplicado:** `hidden md:block` en el wrapper de la hover card en `SedesMapa.tsx`. En mobile solo se muestra el dialog (que tiene botón X para cerrar).

### 11. **CDN de Hostinger** rompe el dominio (404 en algunos edges, SSL error, cambia la IP)
- **Síntoma:** al activar el CDN de Hostinger, el dominio cambia a una **IP de CDN** (ej. `104.160.67.72`, headers "pelados" sin `server`), que puede **cachear los 404 viejos** y servirlos en algunos edges (anda en una red/celu y en otra no). Al **desactivarlo**, queda en limbo de propagación con **error SSL** ("conexión no es privada") hasta que el DNS vuelva al origen (**24–48 hs**, normalmente menos).
- **Diagnóstico:** comparar IPs con `dig +short comunidadnmroller.com`. El **origen real** es `185.249.224.136` / `77.37.85.34` (el de `lp` es otro: `62.72.62.63`). Verificar que el origen está sano sin depender del DNS:
  `curl -sk --resolve comunidadnmroller.com:443:185.249.224.136 https://comunidadnmroller.com/ | grep '<title>'` → debe dar "Escuela #1 de Patinaje…".
- **Fix:** **mantener el CDN DESACTIVADO** para este sitio (es liviano, no lo necesita) y esperar la propagación DNS al origen. No tocar archivos: el origen ya está bien. Flush DNS local del Mac: `sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder`.

### 15. Un formulario **manda los datos pero un campo NO llega a Slack/GetResponse** — aunque en la preview de Lovable SÍ funciona
- **Caso real (jun 2026):** el campo "Alquiler" del form SportClub no aparecía en Slack desde producción, pero sí desde la preview de Lovable. Recompilar y resubir el frontend NO lo arreglaba.
- **Causa raíz — DOS proyectos Supabase desincronizados:**
  - Producción (frontend en Hostinger) llama al proyecto **`bosutrnpmpjxylcgjmbt`** → es el del `.env` y el que tiene la **base de datos real** (tabla `leads`, etc.).
  - Lovable deploya las Edge Functions en **`zpeijyutagfqeoatlvdq`** (lo dice `supabase/config.toml`), que está **vacío de datos**.
  - Cuando Lovable "redeploya" una función, corrige `zpeij` (la preview funciona) pero **NO toca `bosutr`** (producción sigue con la versión vieja). Por eso un campo nuevo agregado al frontend llega al backend pero la Edge Function vieja lo ignora.
- **Cómo confirmarlo rápido:**
  - Qué Supabase usa producción: `curl -s https://comunidadnmroller.com/assets/index-*.js | grep -oE 'https://[a-z]+\.supabase\.co'` (o leer `VITE_SUPABASE_URL` del `.env`).
  - Qué proyecto deploya Lovable: `project_id` en `supabase/config.toml`.
  - Si difieren → ese es el problema.
- **Fix que funcionó — deployar la Edge Function corregida en `bosutr` por Supabase CLI** (NO por Lovable, que solo alcanza `zpeij`):
  - La CLI local está logueada en la cuenta **`escuelanmroller@gmail.com`**, dueña de `bosutr` (`supabase projects list` lo muestra `linked:true ACTIVE_HEALTHY`).
  - Comando: `supabase functions deploy <fn> --project-ref bosutrnpmpjxylcgjmbt --no-verify-jwt`
  - Solo actualiza el **código** de esa función; los secrets (Slack, GetResponse) y la base de datos quedan **intactos**. El `WARNING: Docker is not running` es irrelevante (deploya por API).
  - ⚠️ **Lo corre el USUARIO en su terminal**, no Claude: el auto-mode de Claude Code bloquea deploys directos a producción, y macOS pide la contraseña del Mac (llavero "Supabase CLI" → "Permitir siempre"). Claude prepara el comando exacto y el usuario lo pega.
- ❌ **NO "arreglar" esto apuntando el `.env` a `zpeij`**: rompería el guardado de leads de TODOS los formularios, porque `zpeij` no tiene las tablas. Producción debe seguir en `bosutr`.

### 16. `supabase db push` / `migration list` no sirven para tocar el schema de `bosutr` — ni desde acá ni desde `panel-ventas-nmroller`
- **Contexto:** desde el 21-jul-2026, `bosutr` es la base compartida de este sitio y del repo `panel-ventas-nmroller` (`escuelanmroller/panel-ventas-nmroller`, panel interno de ventas). Cada repo solo tiene, en su carpeta local `supabase/migrations/`, LAS SUYAS — nunca las del otro.
- **Síntoma:** `supabase db push` (corrido con `--project-ref bosutrnpmpjxylcgjmbt` o linkeado) se niega a correr con `Remote migration versions not found in local migrations directory` y una lista larga de versiones desconocidas.
- **Causa:** la tabla de bookkeeping remota (`supabase_migrations.schema_migrations`) es UNA sola para toda la base — acumula el historial de los dos repos (y de cambios aplicados directo por dashboard/Lovable, sin archivo local en ninguno). Ningún repo tiene, ni puede tener, el historial completo. Ojo además: **el `config.toml` de ESTE repo apunta a `zpeij`, no a `bosutr`** (ver error #15) — así que ni siquiera apunta al proyecto correcto por default.
- **Fix que funciona:** para un cambio de schema en `bosutr`, **pegar el SQL directo en su SQL Editor** (`supabase.com/dashboard/project/bosutrnpmpjxylcgjmbt/sql/new`) y, si querés dejar registro, sumar el `.sql` a `supabase/migrations/` del repo que corresponda — pero como documentación, no como historial ejecutable.
- ❌ **NO intentar "reconciliar" el historial con `supabase migration repair` o `db pull`.** Esos comandos escriben sobre la tabla de bookkeeping COMPARTIDA — si se marca como "reverted" una migración que en realidad sigue viva (del otro repo), la próxima vez que se corra `db push` desde el otro lado puede intentar reaplicarla y romper algo real. No vale el riesgo para un problema que ya tiene salida simple y sin tocar nada compartido.
- Ver bitácora de `panel-ventas-nmroller`, 29-jul-2026, para el detalle completo de cómo se detectó.

### 17. Frontend que depende de una Edge Function nueva sale a producción **antes** de que la función esté deployada → feature rota para todos
- **Caso real (6-ago-2026):** la migración de los botones "COMPRAR PLAN" a la Preferences API de Mercado Pago (Edge Function `crear-preferencia-pago`) se commiteó y el `dist/` con ese frontend nuevo se subió a Hostinger, pero la función nunca se había deployado a `bosutr` ni el secret `MP_ACCESS_TOKEN` cargado. Resultado: **todos** los botones de compra online (NM y Clases+Alquiler) tirando "No pudimos iniciar el pago" en el sitio real, hasta revertir.
- **Causa:** el pendiente de "deployar + probar" quedó anotado para la próxima conversación, pero el build/subida a Hostinger pasó antes de que se completara.
- **Fix / regla:** cualquier cambio de frontend que dependa de una Edge Function nueva o modificada sigue este orden estricto, sin excepción: 1) deployar la función, 2) **probarla de verdad** (ver error #18 — no alcanza con "el deploy no tiró error"; probar con `curl` o similar que devuelva lo esperado), 3) recién ahí commitear/subir el frontend que la llama. Si una sesión se corta antes del paso 2, el frontend correspondiente **no debe** llegar a un `npm run build` + subida a Hostinger todavía.
- Ver bitácora, 06-ago y 10-ago-2026.

### 18. Al cargar un Access Token u otro secret, **nunca transcribirlo a mano leyéndolo de una captura de pantalla ni de un comando de terminal con guiones largos**
- **Caso real (10-ago-2026):** retomando el error #17, se perdió tiempo persiguiendo un fantasma — Mercado Pago devolvía `403 PA_UNAUTHORIZED_RESULT_FROM_POLICIES / blocked_by: PolicyAgent` en **toda** la API (hasta en `GET /users/me`), lo que hacía sospechar de un bloqueo de cuenta o de permisos. La causa real: el Access Token cargado como secret tenía **un carácter de menos** (74 en vez de 75 — primero por una `l` transcrita en vez de un `1` leyendo una captura; después por un guion perdido al pegarlo en `supabase secrets set` vía terminal). Mercado Pago, ante un token con formato roto, no dice "token inválido": devuelve ese error genérico de políticas, que manda a diagnosticar en la dirección equivocada.
- **Diagnóstico que sí funcionó:** agregar temporalmente a la función un modo (`{"diag": true}` en el body) que llama a `GET /users/me` con el token cargado y devuelve **solo** su longitud y estructura (nunca el valor completo) — reveló el largo incorrecto y el guion faltante en segundos. Sacar el bloque de diagnóstico del código antes de commitear, y confirmar con `git diff` contra la versión limpia que no quedó rastro.
- **Fix / regla:** cargar secrets largos (tokens, API keys) **desde el dashboard de Supabase** (Project Settings → Edge Functions → Secrets, campo de texto con pegado directo) en vez de por `supabase secrets set VAR=valor` en terminal — ahí no hay riesgo de que el shell corte o reinterprete el string. Si igual se usa la terminal, el usuario debe copiar con el botón de copiar de Mercado Pago, nunca transcribir mirando la pantalla. Del lado de Claude: nunca leer un token de una captura y retiparlo — es exactamente el tipo de dato que hay que hacer copiar/pegar al usuario, sin intermediar.
- Ver bitácora, 10-ago-2026.

### 19. Dos conversaciones de Claude trabajando el mismo repo en paralelo (misma máquina) pueden dejar cambios sin commitear que "aparecen solos" en la otra
- **Caso real (10-ago-2026):** el usuario tenía esta conversación (Claude Code) y otra (interfaz tipo "Despacho/Artefactos") trabajando este repo al mismo tiempo. La otra sesión re-implementó la Preferences API de pagos y dejó los archivos **staged pero sin commitear** en el working tree. Como esta carpeta vive en `~/Documents` (sincronizada por iCloud entre Mac/iMac — ver "Trabajo desde varias máquinas" en el `CLAUDE.md` de la bóveda), esos cambios sin commitear **aparecieron solos** en el working tree de esta conversación, sin pasar por git en ningún momento.
- **Riesgo:** confundir un cambio legítimo de otra sesión con una corrupción o un bug — o peor, pisarlo sin querer con un `git checkout`/`git stash` mal usado antes de entender qué era.
- **Fix que funcionó:** antes de tocar nada, `git log` + `git status` + comparar contra lo que está realmente en producción (bundle compilado servido en el dominio real, no memoria de la conversación). Se confirmó que ya estaba todo commiteado y pusheado por la otra sesión — no había divergencia real, solo desfasaje de qué sabía cada conversación.
- **Regla:** si el usuario reporta "no coincide lo que veo" o hay indicios de trabajo en paralelo (dos conversaciones, dos máquinas), verificar primero el estado real de git contra el sitio en vivo antes de asumir un bug de código. La mayoría de las veces es sincronización de contexto entre sesiones, no un error real.
- Ver bitácora, 10-ago-2026.

### 20. Los Access Token "de prueba" y "de producción" de Mercado Pago arrancan **igual** (`APP_USR-...`) — no se distinguen por el formato
- **Caso real (10/11-ago-2026):** ya con el error #18 resuelto (token bien formado, 75 caracteres), `crear-preferencia-pago` seguía fallando — esta vez al intentar pagar de verdad con tarjeta de test, Mercado Pago devolvía "Algo salió mal... una de las partes con la que intentás hacer el pago es de prueba". El token cargado tenía el formato perfecto y pasaba `GET /users/me` con `200 OK`, pero la cuenta detrás era `TESTUSER5597610380586359111` (tag `test_user`) — la cuenta vendedor de prueba que Mercado Pago crea sola al crear la aplicación, no la cuenta real de NM Roller.
- **Por qué pasó desapercibido:** según la documentación oficial de MP ("Cuentas de prueba" del modelo Checkout API vía Orders), *"la cuenta de prueba vendedor se crea automáticamente tras la creación de la aplicación y sus credenciales pasan a ser tus credenciales de prueba. Es por este motivo que tu Access Token de pruebas comienza con el prefijo `APP_USR`"* — igual que el de producción. No hay forma de saber cuál es cuál solo mirando el string; hay que fijarse en qué pestaña/sección del panel de developers se copió ("Credenciales de prueba" vs. "Credenciales productivas"), y ahí también es fácil confundirse porque se ven casi iguales.
- **Diagnóstico:** mismo modo temporal `{"diag": true}` del error #18, extendido para devolver `nickname` y `tags` de la cuenta (`GET /users/me`) — si `tags` incluye `test_user`, es la cuenta equivocada. Cuenta real: sin ese tag, con tags tipo `business`/`normal`.
- **Fix / regla:** al cargar `MP_ACCESS_TOKEN`, verificar con este diagnóstico que la cuenta NO tenga tag `test_user` antes de dar por buena la config — no alcanza con que el token tenga el formato correcto o venga de la sección que "parece" ser la de producción.
- Ver bitácora, 10/11-ago-2026.

### 21. Un horario "actualizado" en una grilla puede seguir viejo en otra — el horario de cada sede vive duplicado a mano en varios archivos
- **Caso real (14-ago-2026):** el usuario reportó la sensación de que cada vez que se actualizaba un horario, "se borraba" algo anterior. La causa: el horario de cada sede está copiado a mano en hasta 4 lugares que no se sincronizan solos — `src/data/sedes.ts` (mapa/dialog/grilla de Alquiler), `src/components/HorariosSection.tsx` (grilla de la Home, estructura de datos totalmente separada aunque hoy tiene el mismo contenido), `src/pages/ExclusivoSociosSportclub.tsx` (`SPORTCLUB_HORARIOS`) y `src/pages/ClaseGratis.tsx` (`HORARIOS_CLASES`). Cada "sync con la planilla real" tuvo que tocar 2 o 3 de estos archivos a mano en el mismo commit (ver commits `98d6143`/`74cd853`, 14-jul-2026); si en algún momento se edita uno y no los otros, una grilla queda mostrando el horario nuevo y otra el viejo.
- **Hallazgo extra:** apareció un 5º archivo, `src/data/sedes-alquiler.ts`, con datos de Colegiales desactualizados desde antes del sync de julio (`"Mié 18hs · Jue 19hs"`) — pero confirmado que **no está importado en ningún componente actual** (dead code). No rompe nada visible hoy, pero es peligroso si alguien lo reactiva pensando que refleja la realidad.
- **Fix / regla:** ver la sección "📅 Sincronización de horarios con la planilla `horarios_semana_<periodo>.csv`" más arriba en este archivo — ese es el protocolo acordado con el usuario para mantener estos archivos alineados cada vez que se pasa la planilla nueva. No se hizo la unificación en un único archivo fuente (quedó evaluado, pero por ahora se prefirió mantener la estructura actual y ser disciplinado con el protocolo de sync en cada uno).
- Ver bitácora, 14-ago-2026.

### 22. El servidor de desarrollo (`vite`) se cuelga sin arrancar ni tirar error → **causa raíz: `node_modules` corrompido por iCloud** (RESUELTO 27-ago-2026)
- **Síntoma:** `npm run dev` deja el proceso corriendo pero nunca bindea el puerto ni muestra el "ready in Xms" — solo aparece la primera línea (`vite_react_shadcn_ts@0.0.0 dev` / `vite`) y se queda ahí indefinidamente, con el proceso vivo pero a 0% CPU. `vite build` se cuelga igual, en "transforming...". Bloqueó la verificación visual tres veces (19-ago, 25/26-ago, 27-ago-2026) y hacía perder el tiempo buscando el problema en el código, que siempre daba `tsc --noEmit` limpio.
- **Causa raíz (confirmada el 27-ago-2026):** esta carpeta vive en `~/Documents`, que **iCloud sincroniza**. `node_modules` tiene decenas de miles de archivos chicos: iCloud no da abasto, genera **conflictos de sincronización y duplica carpetas con sufijo `" 2"`**. Se encontraron **251 duplicados** (`vite 2`, `lodash 2`, `@tanstack 2`, …). Vite intenta resolver módulos contra ese árbol inconsistente y **se queda esperando I/O para siempre, sin tirar error** — por eso no hay mensaje que apunte a la causa.
- **Cómo detectarlo en 5 segundos:** `find node_modules -maxdepth 3 -name "* 2" | wc -l`. Si devuelve algo > 0, es esto. (Buscar también `.icloud`, archivos no materializados.)
- **Fix (reaparece cada tanto — se rehizo el 15-sep y el 23-sep-2026):** sacar `node_modules` del alcance de iCloud — macOS ignora todo lo que termine en `.nosync`. **El orden importa:** `npm install` **reemplaza el symlink por una carpeta real** (por eso el fix "se deshacía solo" y el problema volvía). Hay que instalar primero y recién después mover todo a `.nosync` y recrear el symlink:
  ```bash
  rm -rf node_modules "node_modules 2" node_modules.nosync && npm install
  mv node_modules node_modules.nosync && ln -s node_modules.nosync node_modules
  ```
  Verificar al final que `ls -ld node_modules` muestre una flecha (`node_modules -> node_modules.nosync`); si muestra `drwxr-xr-x` a secas, es una carpeta real y iCloud la vuelve a corromper. (Si el servidor de preview está corriendo, pararlo antes: usa `node_modules`.)
  Resultado del fix original (27-ago): `npm install` 22s limpio, `npm run build` completó en 1m48s (antes se colgaba para siempre) y el dev server bindeó el puerto **en 5 segundos**. `node_modules.nosync` está en `.gitignore`.
- **Ojo con reiniciar el dev server tras usar un componente de Radix/shadcn nuevo** (uno que el sitio nunca importó, ej. `alert-dialog`): Vite lo descubre "en caliente", re-optimiza las dependencias y puede dejar dos copias de React → error `Cannot read properties of null (reading 'useMemo')` en la consola y el componente no renderiza. No es un bug del código: **reiniciar el servidor de preview lo resuelve** (visto el 23-sep-2026 con `AvisoVolverDelPago`).
- **Ojo en máquinas nuevas:** al clonar el repo en otro equipo con la carpeta dentro de iCloud, aplicar el mismo truco ANTES del primer `npm install`, o el problema reaparece.
- **Regla que sigue valiendo:** si aun así algo se cuelga, no reintentar en loop — si no bindea en ~30-40s, verificar por otra vía (`tsc --noEmit`, `curl` contra la Edge Function) y anotar la verificación visual como pendiente.
- Ver bitácora, 19-ago, 25/26-ago y 27-ago-2026.

### 23. Mercado Pago devuelve `status=null` (string literal) cuando el comprador vuelve SIN pagar → no asumir "aprobado" por descarte
- **Caso real (27-ago-2026):** al tocar "Volver a la tienda" en el checkout **sin haber pagado**, Mercado Pago redirige igual al `back_url` con todos los parámetros en `null`: `?collection_id=null&collection_status=null&payment_id=null&status=null&external_reference=nm:black-free&preference_id=...`. `PagoConfirmado.tsx` calculaba solo `isRejected` e `isPending` y **todo lo demás caía por descarte en "aprobado"** — así que a alguien que abandonó el checkout le mostraba *"¡Gracias por sumarte! Pago recibido"* y un formulario para subir comprobante. Lo detectó el usuario probando el flujo real.
- **Trampa concreta:** `searchParams.get("status")` devuelve el **string `"null"`**, no el valor `null` de JS — así que cualquier chequeo tipo `if (!status)` tampoco lo agarra. Hay que compararlo contra los valores válidos.
- **Fix aplicado:** nunca inferir "aprobado" por descarte. Se agregó `isApproved` explícito (`approved`/`success`) y un cuarto estado `isIncompleto` = vino de MP (hay `status`/`collection_status`/`preference_id` en la URL) pero el estado no es ninguno de los tres válidos. Ese caso muestra "Pago no completado / Todavía no completaste tu pago" y reusa la sección de transferencia (`ofreceTransferencia = isRejected || isIncompleto`) para recuperar la venta.
- **Caso que NO hay que romper al tocar esto:** entrar a `/pago-confirmado` **sin ningún parámetro** debe seguir mostrando el flujo normal con el formulario — es alguien que ya pagó y vuelve más tarde a subir el comprobante. Por eso `isIncompleto` exige que la URL traiga parámetros de MP, no solo que falte el status.
- **Regla general:** ante una pasarela de pago, enumerar los estados válidos y tratar todo lo demás como "no pagado". El default seguro es *no* dar por buena una compra.
- Ver bitácora, 27-ago-2026.

### 24. Un `<label htmlFor="x">` deja de abrir el `<input id="x">` si hay OTRO elemento con el mismo `id` antes en el DOM
- **Caso real (12-sep-2026):** en `PagoConfirmado.tsx`, la `<section id="comprobante">` que envuelve todo el bloque de subida y el `<input id="comprobante" type="file">` real compartían el mismo `id`. El navegador asocia el `<label htmlFor="...">` con el **primer** elemento del documento que tenga ese `id` — como la sección aparecía antes en el DOM, el label quedaba "enganchado" a un `<div>` sin comportamiento, no al input. Tocar el dropzone ("Tocá para seleccionar archivo") no abría el selector de archivos en **ningún** navegador/dispositivo, y no había ningún error visible: el flujo nunca llegaba a intentar el upload, así que tampoco se veía en los logs de Supabase.
- **Por qué costó verlo:** el 08-sep ya se había corregido un duplicado de `id="comprobante"` (dos `<section>` iguales, al fusionar dos bloques) — ese fix no cubría este otro duplicado (sección vs. input), que es un patrón distinto.
- **Diagnóstico rápido:** `document.querySelectorAll('#<id>')` en la consola — si devuelve más de 1 elemento, ahí está el problema. Confirmar además que `document.getElementById(label.getAttribute('for'))` resuelva al control de formulario correcto (input/select/textarea), no a un contenedor.
- **Fix / regla:** nunca reusar el `id` de un `<label htmlFor>`/`<input>` para un contenedor (`<section>`, `<div>`) que lo envuelve. Antes de cerrar cualquier cambio que toque `id`s cerca de un formulario, grepear `id="<valor>"` en el archivo y confirmar que aparece una sola vez.
- Ver bitácora, 12-sep-2026.

### 25. Un `origen`/enum nuevo agregado al frontend puede quedar bloqueado por un CHECK constraint viejo que nadie amplió en la base real
- **Caso real (12-sep-2026):** al agregar `origen: "masterclass"` al frontend (7-sep), el insert a `comprobantes_pago` empezó a fallar con `23514 — violates check constraint "comprobantes_pago_origen_check"`. Ese constraint **no está en ninguna migración de este repo** — se había agregado en algún momento directo en el SQL Editor de Supabase, limitado a `('nm', 'clases-alquiler')`, y quedó desactualizado el 7-sep sin que nadie lo notara porque el error es silencioso desde la perspectiva de quien programa: el frontend compila bien, el build no tira error, y recién falla en producción cuando alguien intenta guardar la fila con el valor nuevo.
- **Por qué costó verlo:** el error que ve el comprador es genérico ("Algo salió mal al subir el comprobante, probá de nuevo") — indistinguible de un error de red transitorio. Sin capturar la respuesta real del servidor (ver diagnóstico abajo), parece "a veces falla", no "siempre falla para este origen".
- **Diagnóstico:** interceptar `fetch` en el navegador (o mirar la pestaña Network) al reproducir el submit real — el body de la respuesta 400 de PostgREST siempre nombra el constraint violado (`"...violates check constraint \"<nombre>_check\""`). Con eso alcanza para saber exactamente qué tabla/columna revisar.
- **Fix / regla:** cada vez que se agrega un valor nuevo a un `origen`/enum que ya existe en el frontend (nuevo tipo de compra, nuevo canal, nueva sección), **grepear ese mismo valor contra `supabase/migrations/*.sql`** buscando `CHECK` constraints en las tablas que lo van a recibir (`comprobantes_pago`, `mercado_pago_pagos`, cualquier tabla de leads) — si el constraint no está en una migración del repo, probablemente esté aplicado a mano en producción y haya que ampliarlo ahí directamente (SQL Editor, mismo protocolo que el error #16), **antes** de dar por terminado el cambio de frontend, no después de que un cliente real lo reporte.
- **Ampliar un CHECK constraint es siempre seguro** (agregar un valor permitido nunca puede romper filas existentes) — no hace falta conocer la definición exacta previa para escribir el fix, alcanza con `DROP CONSTRAINT IF EXISTS <nombre> / ADD CONSTRAINT <nombre> CHECK (...ampliado...)`.
- Ver bitácora, 12-sep-2026.

### 26. Un booleano general (`sede.alquiler`) no dice si ESTE horario mostrado en pantalla tiene el servicio — hay que cruzar contra la lista de clases que la página realmente usa
- **Caso real (12-sep-2026):** el dropdown y la card de detalle de `ExclusivoSociosSportclub.tsx` mostraban "Alquiler disponible" mirando solo `sede.alquiler` (true/false a nivel sede) — pero esa página **sobrescribe** los horarios de cada sede con `SPORTCLUB_HORARIOS` (el beneficio gratis da turnos propios, distintos de los de venta). Resultado: 4 sedes marcadas mal — Vicente López decía "disponible" cuando el turno gratis (miércoles) no tiene alquiler (el real es sábado), mismo problema en Rosedal, Puerto Madero y Facultad de Medicina.
- **Por qué costó verlo:** el dato (`sede.alquiler`) es técnicamente correcto — la sede SÍ tiene alquiler en general. El error es más sutil: es correcto para la sede, pero no para el turno específico que ESTA pantalla está mostrando.
- **Fix / regla:** `alquilerEnClases(sede, clases)` en `sedes.ts` es la única fuente de verdad — recibe la lista de clases que la pantalla realmente muestra (no asume `sede.clases`) y cruza cada una contra las reglas de alquiler. Cualquier lugar nuevo que muestre "esta sede/turno tiene alquiler" debe llamarlo con la lista de clases correcta, nunca leer `sede.alquiler` solo.
- **Patrón más general, para cualquier dato booleano a nivel "entidad padre" (sede, producto, plan) que en realidad depende del "hijo" que se está mostrando** (un turno, una variante, un horario): antes de mostrar ese booleano, preguntarse "¿esto es cierto para TODOS los hijos que se están listando acá, o solo para algunos?". Si una página filtra/sobrescribe la lista de hijos (como SportClub hace con los horarios), el booleano del padre deja de ser información suficiente.
- **4º lugar con el mismo bug, encontrado el 14-sep-2026:** al agregar alquiler solo en 2 turnos puntuales de Caballito (Lunes y Martes 19h, ver bitácora), apareció un lugar más con este mismo patrón que el fix del 12-sep no había cubierto — `HorariosSportclub.tsx` ("Tu grilla horaria", la tabla semanal completa de la página de SportClub) armaba el badge "Alquiler" de cada turno con `alquiler: !!s.alquiler` (línea 53), el mismo booleano a secas. Ya afectaba en silencio a Rosedal, Puerto Madero, Vicente López y Facultad de Medicina (mostraban ALQUILER en turnos que no lo tienen) antes de este cambio — nadie lo había notado porque no rompe nada visualmente, solo informa mal. Fix: mismo patrón, reemplazar por `claseTieneAlquiler(s, c)` por turno. **Moraleja: el fix del 12-sep se aplicó a "los 3 lugares" que se conocían en ese momento, pero no se grepeó todo `sede.alquiler` en el repo — por eso quedó un 4º lugar sin corregir casi 2 días.** De ahí la regla general de arriba (correr el grep completo, no confiar en una lista fija de "los lugares que ya sé que hay que tocar").
- Ver bitácora, 12-sep y 14-sep-2026.

### 27. Un fallback `?? datoBase` en una lista curada puede colar un elemento fuera de alcance con su dato real (no el que corresponde a ese contexto)
- **Caso real (12-sep-2026):** `todasLasSedes` en `ExclusivoSociosSportclub.tsx` mapeaba las 12 sedes del sitio, usando `sportclubSedes.find(...) ?? s` — la idea era "sedes del beneficio con sus horarios propios, o la sede base si no está en el beneficio". Pero la única sede sin entrada en `SPORTCLUB_HORARIOS` (Belgrano Converse Park, disciplina Rampas/skatepark, no apta para el beneficio) caía al fallback y aparecía en el mapa **con sus horarios reales**, como si fuera parte de las 11 sedes del beneficio. El propio comentario del código decía "Las 11 sedes para el mapa" — la intención nunca fue incluir una 12ª.
- **Por qué costó verlo:** el fallback `?? s` parece una salvaguarda razonable ("si no está, mostrar algo en vez de nada"), pero en una lista que por definición es un subconjunto curado (solo las sedes CON el beneficio), ese "algo" es información de un contexto distinto (el sitio en general) filtrándose en un contexto que no le corresponde (el beneficio SportClub).
- **Fix / regla:** cuando una lista deriva de un subconjunto explícito (`Object.keys(ALGO)`, un array de ids fijo, etc.), no volver a mapear sobre el universo completo "por las dudas" — usar directamente el subconjunto ya construido. Si aparece un elemento inesperado en una lista que se supone acotada, sospechar primero de un fallback `??`/`||` que reintroduce el universo completo.
- Ver bitácora, 12-sep-2026.

### 28. Un modal reusado para "distintos modos" arrastra el estado del modo anterior si no se le pasa `key`
- **Caso real (12-sep-2026):** `ComprarPlanDialog` se monta condicionalmente como `{modalPlan && <ComprarPlanDialog planNombre={modalPlan.nombre} .../>}` en `PlanesSportclub.tsx` — un solo componente reusado para 2 planes distintos (Plan Full / 4 Clases + Alquiler). Al probar el flujo real (abrir el modal de Plan Full, tipear datos, cerrar, abrir el OTRO modal), el segundo modal apareció con el campo "Plan de SportClub" todavía en "Plus" — un valor tipeado en el modal anterior. React no resetea el `useState` interno de un componente solo porque cambiaron sus props (`planNombre`, `esPackAlquiler`); si en algún momento pasa de un plan pago a otro sin un render intermedio verdaderamente vacío (`null`), React lo trata como "el mismo componente, con props nuevas", no como una instancia nueva.
- **Por qué costó verlo:** en la mayoría de las pruebas manuales (abrir → cerrar del todo → abrir el otro) el bug no aparece, porque cerrar SÍ dispara el unmount. Aparece en el camino menos obvio: cualquier secuencia donde el modal cambia de "modo" sin pasar limpiamente por cerrado.
- **Fix / regla:** cuando un mismo componente de modal/formulario se reusa para representar "variantes" distintas (un plan, un item, un registro), pasarle `key={identificadorDeLaVariante}` en el punto donde se monta. Eso fuerza a React a desmontar y remontar una instancia nueva —con el `useState` inicial limpio— cada vez que cambia la variante, sin depender de que el flujo de cierre sea perfecto.
- Ver bitácora, 12-sep-2026.

### 29. Una herramienta que ve "la cuenta de gh activa no coincide con la regla de marca" puede migrar el remote a un repo duplicado y viejo, sin preguntar
- **Caso real (12-sep-2026):** una sesión de ChatGPT (con acceso local a esta carpeta, mismo patrón ya documentado en la memoria `project_chatgpt_paralelo_mp_webhook`) notó que la cuenta activa de `gh` era `gumercindoweb` y, aplicando la regla general de la bóveda ("marca NM Roller → escuelanmroller"), cambió el remote de este repo a `escuelanmroller/comunidadnmroller` — un repo que **ya existía ahí desde el 02-jul-2026**, con historial propio, desactualizado y sin relación real con el trabajo diario de este proyecto. Pusheó 2 commits nuevos ahí. El repo real y documentado (`gumercindoweb/comunidadnmroller`) se quedó sin esos 2 commits — cualquier sync de Lovable o pull futuro desde ahí no los iba a ver.
- **Por qué pasó:** la regla general ("marca → escuelanmroller") es correcta como default, pero **este proyecto puntual es una excepción documentada** — y la herramienta la aplicó sin chequear primero si el proyecto tenía una excepción ya escrita, ni preguntarle a Gumercindo antes de cambiar algo tan sensible como el remote de un repo en producción.
- **Por qué no se perdió nada:** el push fue un fast-forward limpio (`git merge-base --is-ancestor <viejo-HEAD> <HEAD-nuevo>` dio true) — no un force-push. Un fast-forward, por definición, no puede descartar commits: si hubiera sido force-push, la historia real habría que reconstruirla desde el reflog o desde el propio checkout local.
- **Fix / regla:** ante cualquier señal de "la cuenta activa no coincide con la convención general" (mensaje del hook pre-push, o una herramienta que lo detecta sola), la reacción correcta es **cambiar la cuenta activa de `gh`** (`gh auth switch --user <cuenta correcta>`), **nunca el remote del repo** — y si de verdad parece que el remote está mal, preguntar antes de tocarlo, no asumir. Este archivo ahora deja explícita la excepción (ver la nota arriba, en "Flujo de trabajo (Git)") para que ninguna herramienta futura la "corrija" sola.
- Ver bitácora, 12-sep-2026.

### 30. Editar el código de un **Google Apps Script Web App** y guardarlo NO alcanza — si no se crea una "Nueva versión" en la implementación, el link público sigue sirviendo el código viejo
- **Caso real (13-sep-2026):** al construir `notify-alta-alquiler` (que reenvía datos al Apps Script del formulario viejo de Tiiny, ver `alta-alquileres-clases-nm/CONTEXTO.md`), se pidió agregar una columna nueva "Talle Casco" a la planilla. El primer intento: Gumercindo pegó el `Código.gs` actualizado y avisó "ya apliqué el parche" — pero un envío de prueba siguió mostrando el comportamiento viejo exacto. La causa: en el editor de Apps Script, **guardar (Ctrl+S) actualiza el código fuente, pero el Web App desplegado sigue apuntando a la versión que tenía cuando se hizo el último "Implementar"** — hace falta ir a **Implementar → Gestionar implementaciones → editar (lápiz) la implementación existente → elegir "Nueva versión" → Implementar**, o el link público (el mismo `/exec` URL que usa el sitio) sigue corriendo el código anterior indefinidamente, sin ningún aviso de que quedó desactualizado.
- **Cómo se detectó:** un envío de prueba con valores deliberadamente distintos en dos campos relacionados (ej. talla de ropa="L", talle de casco="S") para poder distinguir sin ambigüedad en qué columna cayó cada uno — si el resultado sigue mostrando el patrón de la versión vieja del script (aunque el editor ya muestre el código nuevo), es señal de que falta el paso de "Nueva versión".
- **Regla general:** cualquier vez que se edite un Google Apps Script Web App ya desplegado (no solo este), después de guardar el código hay que confirmar explícitamente el redeploy de la implementación — el patrón es análogo al de Lovable/`zpeij` (error #15) y al del `.env` apuntando a un proyecto viejo: "el código se ve actualizado en el editor" no es lo mismo que "el link público ya sirve ese código".
- Ver `alta-alquileres-clases-nm/CONTEXTO.md`, 13-sep-2026.

### 31. El `<title>`/`og:title` que arma React (Helmet) en cualquier página NUNCA lo ve WhatsApp/Facebook al compartir el link — siempre mostraba el título genérico del Home
- **Caso real (15-sep-2026):** al pedir un título personalizado para `/renovar-alquiler` en la vista previa de WhatsApp, se descubrió que el problema no era exclusivo de esa página: **toda** página que arma su `<title>`/`og:title` propio vía `react-helmet-async` (`RenovarAlquiler`, `Masterclass`, `ClaseGratis`, `ClasesMasAlquiler`, `ExclusivoSociosSportclub`, `NewsletterDesdeCero`, `RutaDeAprendizaje`) tenía este bug desde que se armó, sin que nadie lo notara — no rompe nada visible en el sitio, solo la tarjeta de WhatsApp/Facebook.
- **Causa:** el sitio es una SPA — el HTML que manda el servidor es siempre el mismo `index.html` (con los tags genéricos del Home, ver ese archivo), y React recién los reemplaza **en el navegador**, después de ejecutar JavaScript. Los bots que arman la vista previa de WhatsApp/Facebook/Twitter/etc. **no ejecutan JavaScript** — piden la URL y leen el HTML crudo tal cual llega, así que nunca ven lo que Helmet cambió. Confirmado en vivo: `curl -s -A "WhatsApp/2.23.20.0" https://comunidadnmroller.com/renovar-alquiler | grep og:title` devolvía el título del Home.
- **Se evaluó y se descartó:** una página HTML estática con URL propia (ej. `/renovar-alquiler-share.html`) — funciona, pero obliga a manejar un link "feo" y distinto al real para compartir, que es justo lo que se quería evitar.
- **Fix aplicado — snapshot estático servido SOLO a bots, mismo URL de siempre:** el `.htaccess` de `public/` detecta el User-Agent de los bots de redes sociales (`facebookexternalhit|WhatsApp|Twitterbot|LinkedInBot|Slackbot|TelegramBot|Discordbot`) y, si existe un archivo en `public/previews/<misma-ruta>.html`, se lo sirve a ESE bot en vez de la SPA — sin backend, sin tocar el código React, sin cambiar la URL que ve la gente real (que sigue entrando a la SPA de siempre). Los archivos de `public/previews/` se generan con `node scripts/generate-og-previews.mjs`, que tiene una sola fuente de verdad (un array con título/descripción/imagen por página) — **no editar los `.html` de `previews/` a mano**, para no repetir el error de contenido duplicado que se desincroniza (mismo patrón que los errores #21/#26).
- **Mantenimiento — 2 casos en que hay que tocar el generador:**
  1. Si cambia el `<title>`/`og:title`/`og:description` de Helmet en alguna de las páginas de la lista de arriba → actualizar la entrada correspondiente en `scripts/generate-og-previews.mjs` y correrlo de nuevo.
  2. Si se agrega una edición nueva de Masterclass en `src/data/masterclasses.ts` → sumar una entrada nueva en el script con el slug nuevo (la edición vieja se queda sin preview propia, lo cual está bien: es un evento cerrado).
- **Cómo verificar que quedó bien** (después de subir el `dist/` a Hostinger): `curl -s -A "WhatsApp/2.23.20.0" https://comunidadnmroller.com/<ruta> | grep og:title` debe devolver el título de esa página, no el del Home.
- Ver bitácora, 15-sep-2026.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
