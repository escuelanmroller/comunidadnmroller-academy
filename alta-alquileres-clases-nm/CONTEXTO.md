# Alta de alumnos — Clases + Alquiler

## Qué es esta carpeta

Base de trabajo para un flujo nuevo: un formulario de **alta de alumno** que se completa después de comprar un pack de Clases + Alquiler, para que el equipo pueda preparar rollers/casco/protecciones antes de la primera clase (sede, día/horario, talles). Nace de un prototipo externo que Gumercindo ya armó como referencia. Este archivo documenta ese prototipo, lo cruza contra el estado real del sitio, y registra las reglas de negocio ya definidas — como insumo para construirlo en `comunidadnmroller`.

Prototipo visual de cómo se vería el paso (Artifact, no es código del repo): https://claude.ai/code/artifact/e3160f7b-51b8-49be-9fa3-9d4169f92c71

## Fuente: prototipo en Tiiny

**URL:** https://registro-alumnos-alquiler.tiiny.site/index.html
**Qué es:** un HTML estático hosteado en Tiiny.site. ⚠️ Corrección respecto a una nota anterior de este archivo: **el formulario SÍ está conectado a un backend real**, no es un mockup muerto. El script inline de la página apunta a un **Google Apps Script Web App**:

```js
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx_bRsm8Ct5JsOa0pq1J-eS_AjhAruTCbBprqbdi_ou3izKCXT-wckdRYVRDGu8wD9B/exec';
```

Al enviar, hace `fetch(SCRIPT_URL + '?' + params, { method: 'GET', mode: 'no-cors' })` — el patrón clásico de "formulario HTML → Apps Script → escribe una fila en un Google Sheet".

### ⚠️ Esto NO es un prototipo abandonado — está en uso real, ahora mismo

Se ubicó y confirmó todo en el Drive de `escuelanmroller@gmail.com`:

- **Apps Script "APP ALQUILER NM"** — código confirmado. `doGet(e)` escribe en una pestaña **"Registros"** con columnas: Fecha y hora, Nombre, Apellido, WhatsApp, Correo, DNI, Pack, Sede, Horario preferido, Talle calzado, Talle ropa, Observaciones (mapeo 1 a 1 con los campos del form).
- **La planilla real**: [alquiler nm app NUEVO](https://docs.google.com/spreadsheets/d/1CuFySbTV1BdNmn0Mw8Kc95dDde67uvttLJCkMjSaaRI/edit) — **más de 100 filas reales, desde el 30-may-2026 hasta hoy 12-sep-2026**. El formulario de Tiiny está siendo usado por alumnos reales en este momento, no es un mockup descartado.

**Insights de esos datos reales (sin copiar filas con datos personales al repo — están solo en la planilla):**

1. **Confirma en vivo el problema ya detectado**: varios alumnos escriben en "Observaciones" que su horario real no aparece en el desplegable — *"la clase es el Miércoles a las 19:00, pero no aparece la opción"*, *"tengo sábado 10am reservado pero no me figuraba la opción"*. El `SEDE_HORARIOS` hardcodeado del script está causando fricción real hoy.
2. El campo "Horario preferido" es, en la práctica, **texto libre y ambiguo** ("Sabados o Domingos 10 am", "jueves, 19hs en invierno y 9hs en verano") — el turno fijo que vamos a construir tiene que eliminar esta ambigüedad de raíz, no heredarla.
3. Aparecen sedes reales que **no están ni en el prototipo ni en `sedes.ts` alquiler** (ej. "Tigre"), y un valor de escape **"Otra"** que la gente usa cuando su sede no está en la lista — señal de que el universo real de sedes con demanda de alquiler es más amplio que las 7 actuales.
4. El patrón "no necesito rollers" que se agregó al prototipo (ver más abajo) **ya aparece espontáneamente** en el texto libre real: "No", "No. Solo casco", "no necesito rollers, solo protecciones", "_" — confirma que la opción hacía falta.
5. Hay una **fila triplicada** (mismo alumno, mismo timestamp exacto) — indicio de doble-click en el envío; el form real necesita deshabilitar el botón al enviar (ya está así en el prototipo).
6. Hay también una **pestaña vieja separada**, un registro manual previo al Apps Script (desde principios de mayo 2026, con prefijos de quien tomó el dato a mano — "(Ana)", "(rama)") que sí trackea explícitamente el **profe por turno** (DANY, FRUTI, GUILLE, VLADI, MARTU) y el tipo de servicio (Kit completo / Set protecciones y casco / Roller solo). Es evidencia de que la asignación profe↔turno existe en la operación real, aunque no esté modelada en el código del sitio.

### Estructura completa del formulario

**Header:** "🛼 Bienvenido/a — Ya eres parte" + "Completá tus datos para que podamos preparar todo antes de tu primera clase."

**1. Tus datos**
- Nombre * (texto)
- Apellido * (texto)
- WhatsApp * (tel, placeholder "11 1234-5678")
- Correo electrónico (opcional, email)
- DNI * (texto, "sin puntos ni espacios")

**2. Tu pack** (radio, 3 opciones)
| Opción | Descripción |
|---|---|
| Clase Única | 1 clase grupal · Incluye rollers, casco y protecciones · Vigencia 1 mes |
| Clase 2x1 — Compartí la experiencia | 1 clase grupal para 2 personas · Solo domingos, sede Rosedal |
| Pack 4 Clases ⭐ Mejor opción | 4 clases · Rollers, casco y protecciones incluidos · Podés reprogramar hasta 2 veces sin costo |

**3. Sede y horario**
- Sede preferida * (select): Rosedal Palermo, Villa Real, Puerto Madero, Colegiales, Plaza La Pampa, Vicente López, Parque Rivadavia, Devoto
- Día y horario * (select, dependiente de la sede — **sí está wireado**: el script tiene un `SEDE_HORARIOS` hardcodeado que llena este segundo select al elegir la sede)

**4. Tu talle**
- Talle de calzado * (texto libre, "Ej: 39/40")
- Talle de ropa (select opcional): XS, S, M, L, XL, XXL — con ayuda "S = hasta 60kg aprox. · M = 60–75kg · L = 75–90kg · XL = 90+kg. Si tenés duda, elegí el más grande."

**5. Notas** — "¿Algo más que debamos saber?" (opcional, textarea libre — ejemplo: experiencia previa, principiante, lesión)

**Footer:** "Tus datos se usan solo para coordinar tu clase. No los compartimos con nadie."

**Pantalla de éxito (existe en el DOM, oculta):** "¡Listo! — Recibimos tus datos. En breve un profe te va a confirmar todos los detalles por WhatsApp."

## Cruce contra el estado real del sitio

⚠️ **Hay DOS listas de sede/horario distintas y ninguna coincide con `src/data/sedes.ts`** (única fuente de verdad del sitio real, ver `alquilerEnClases`/`claseTieneAlquiler` en ese archivo):

**1) Las sedes ofrecidas (el `<select>` visible) vs. `sedes.ts`:**

| Sede | ¿Tiene `alquiler: true` en `sedes.ts` hoy? |
|---|---|
| Rosedal Palermo | ✅ (por turno: ver `alquilerHorarios`) |
| Puerto Madero | ✅ |
| Vicente López | ✅ (`alquilerDias: ["Martes"]`) |
| Plaza La Pampa | ✅ |
| Devoto | ✅ |
| Villa Real | ✅ |
| **Facultad de Medicina** | ✅ — **está en el sitio real pero el prototipo no la incluye** |
| **Colegiales** | ❌ — el prototipo la ofrece pero hoy NO tiene alquiler |
| **Parque Rivadavia** (`caballito` en el código) | ❌ — el prototipo la ofrece pero hoy NO tiene alquiler |

**2) Los horarios por sede, hardcodeados en el script (`SEDE_HORARIOS`) vs. `sedes.ts`** — ejemplo Rosedal:
- Prototipo: Martes 9hs, Jueves 19hs, Viernes 9hs, Sábado 18hs, Domingo 10hs
- Real (`sedes.ts`, turnos con alquiler): Miércoles 19hs, Jueves 19hs, Sábado 10hs, Sábado 18hs

**No coinciden en casi nada.** El prototipo se armó (o quedó desactualizado) sin mirar el dato real. Antes de construir el form real, tanto la lista de sedes como los horarios por sede tienen que salir de `sedes.ts` filtrando por `alquiler === true` (mismo criterio que `claseTieneAlquiler`) — nunca hardcodeados de nuevo a mano ni copiados del prototipo. Mismo error recurrente ya documentado en `CLAUDE.md` del sitio, sección "Sincronización de horarios".

## Qué NO existe hoy en el sitio (por qué esto es una pieza nueva)

Hoy el flujo de compra de Clases + Alquiler termina en `/pago-confirmado` (`src/pages/PagoConfirmado.tsx`): el alumno sube el comprobante de pago y listo — no hay ningún paso que capture **talle de calzado/ropa** ni **preferencia de día/horario** para que el equipo prepare el equipo antes de la clase. Ese es el hueco que este formulario prototipo viene a cubrir.

Piezas relacionadas que ya existen y esto tendría que articular, no duplicar:
- `PagoConfirmado.tsx` — sube comprobante, dispara `notify-comprobante` (Slack) según `origen`. Hoy captura: nombre (nombre+apellido en un solo campo), email, teléfono, DNI, plan (`plan_final_slug`: `clase-unica` / `clase-2x1` / `pack-4-clases`) — estos son los datos que "ya vienen puestos" para el nuevo paso.
- `ComprarPlanDialog.tsx` — modal de compra directa (SportClub), mismo patrón de form corto.
- `AlquilerHorariosGrid.tsx` / `AlquilerSedesGrid.tsx` — ya calculan qué sede/turno tiene alquiler disponible (`alquilerEnClases`).
- Panel de ventas (`panel-ventas-nmroller`, repo hermano) — donde el equipo hoy confirma pagos; podría ser también donde vea los datos de alta/talles.

⚠️ **Detalle técnico a resolver:** los datos de `PagoConfirmado.tsx` (nombre/email/teléfono/DNI/plan) hoy solo viven en el estado de React de esa página mientras el usuario está ahí — no persisten solos a otra ruta. Si este paso nuevo vive en la MISMA página (como sección que aparece después de `done=true`, junto al bloque "Preparate para tu primera clase" que ya existe), no hace falta resolver nada — siguen en el mismo estado. Si en cambio se decide que sea una ruta separada, hace falta un puente de datos entre pantallas (mismo patrón que `intencionCompra.ts` usa hoy para plan/origen).

## Reglas de negocio ya definidas (por Gumercindo, 12-sep-2026)

1. **Turno fijo, no rotativo.** La combinación **sede + día + horario** (que trae asociado un profe específico, según la planilla real `horarios_semana_*.csv`) que el alumno elige acá queda fija para **todas** las clases del pack — no se puede elegir un horario distinto cada semana. Las opciones que se muestran tienen que ser turnos puntuales reales (día+hora, según `sedes.ts`/planilla), no un combo de sede seguido de un horario libre sin relación.
2. **Reprogramación — excepción acotada, fuera de este formulario.** Se puede reprogramar hasta 2 veces sin costo, **siempre dentro de la misma sede**, y **solo** si la causa es ajena a NM Roller (lluvia, ausencia del profe) — nunca porque el alumno cambió de idea. Esto se gestiona **por WhatsApp**, no es una opción de autogestión en este formulario.
3. **Anticipación mínima: 24 horas.** El formulario tiene que completarse con al menos 24hs de anticipación a la primera clase — ej. si compra el sábado a la noche, no puede elegir un turno del domingo. El equipo no llega a prepararse a tiempo.
4. **Opción "ya tengo mis propios rollers".** El talle de calzado debe poder marcarse como no aplicable — el alumno puede traer sus propios rollers y no necesitar que le presten. El input de talle de calzado usa teclado numérico (son números, ej. 39).
5. **Talle de casco — S/M/L.** Campo propio en "Tu equipo", separado de la talla de ropa/protecciones. Por ahora solo las 3 etiquetas (S/M/L); las medidas en cm de cada una quedan **pendientes de definir** para una iteración posterior.
6. **Bloque de acompañante — solo para el pack 2x1.** Si el pack elegido es Clase 2x1, aparece un bloque adicional pidiendo DNI, nombre, apellido y email de la segunda persona (con el email que usó para registrarse en Turnos Web), para poder acreditarle el beneficio a ella también. Para los otros dos packs, este bloque no existe.
7. **Retiro/devolución de equipo: solo en la sede, sin costo extra.** No se envía a domicilio, y se enmarca como beneficio ya incluido en lo que pagó — nunca como "hay un costo de traslado".
8. **Ausencia sin aviso = clase perdida.** Si el alumno no avisa por WhatsApp con al menos 48hs de anticipación que no va a poder ir, la clase queda tomada (no se recupera). El copy nunca explica el motivo logístico/de costos detrás de la regla — solo comunica la consecuencia, en tono neutro.

## ✅ Construido en el sitio real (12-sep-2026)

El paso ya está implementado en el código de `comunidadnmroller` (no solo en el Artifact de mockup):

- **`src/components/alquiler/AltaAlquilerForm.tsx`** — el formulario completo: sede/turno (en vivo desde `sedes.ts`, filtrando `alquiler === true`, mismo criterio que `claseTieneAlquiler`), cálculo automático de las 4 fechas reales para Pack 4 Clases, talle de calzado (numérico) + checkbox "ya tengo mis rollers", talla de ropa, talle de casco (S/M/L), bloque de acompañante solo para 2x1, y los 4 avisos de negocio (turno fijo, excepción de reprogramación por WhatsApp, 24hs de anticipación, 48hs para avisar ausencia).
- **Montado en `src/pages/PagoConfirmado.tsx`**, dentro del bloque que ya aparece después de subir el comprobante (`done`) — resuelve la pregunta 1: **es una sección de la misma página, no una ruta nueva**, así que no hizo falta ningún puente de datos (nombre/email/teléfono/DNI/plan ya estaban en el mismo estado de React). Solo se muestra si `origen === "clases-alquiler"` y el plan es uno de los 3 packs (`clase-unica`/`clase-2x1`/`pack-4-clases`).
- **`supabase/functions/notify-alta-alquiler/index.ts`** (nueva Edge Function) — resuelve la pregunta 2: al confirmar, notifica a un **canal de Slack nuevo** (`alta-alquiler-alumnos`, secret `SLACK_WEBHOOK_ALTA_ALQUILER` agregado a `_shared/slack.ts`) **y** reenvía el registro al mismo Apps Script que ya usa hoy el formulario de Tiiny — así sigue entrando a la planilla real `alquiler nm app NUEVO` sin tener que migrar a una tabla de Supabase nueva por ahora. Los campos que ese Apps Script no tiene (talle de casco, acompañante 2x1) se agregan al final de "Observaciones" para no perderlos.

### ✅ Backend deployado y probado de punta a punta (12/13-sep-2026)

Gumercindo deployó la función y cargó el secret `SLACK_WEBHOOK_ALTA_ALQUILER`. Se probó con dos envíos de prueba reales (marcados "TEST Claude" para poder identificarlos y borrarlos después, en la planilla y en Slack):

```json
{"ok":true,"slackOk":true,"excelOk":true}
```

Las dos vías (Slack `#alta-alquiler-alumnos` y la planilla `alquiler nm app NUEVO`) confirmadas funcionando. Recién con esto verificado se puede subir un build a Hostinger con este cambio (regla #17 del `CLAUDE.md`, ya cumplida).

### ⚠️ Hallazgo (13-sep-2026): la columna de "Talle Casco" en la planilla no es lo que parece

Gumercindo renombró el header de la columna K de "Talle ropa" a "Talle Casco" en la planilla real, pensando que así el talle de casco iba a caer ahí. **No es así** — el Apps Script no cambió, sigue escribiendo la talla de ropa en esa posición (confirmado mirando filas viejas: tienen valores S/M/L reales de ropa). El talle de casco hoy solo viaja embebido en "Observaciones".

**Fix completo en [`PARCHE-apps-script-casco.md`](PARCHE-apps-script-casco.md)** de esta misma carpeta — son 2 pasos manuales en la planilla (revertir el header de K a "Talle ropa" + insertar una columna nueva real para "Talle Casco") y pegar un `Código.gs` actualizado en el Apps Script (agrega `p.talle_casco` a la fila que escribe).

Del lado de este repo ya está listo: `notify-alta-alquiler/index.ts` manda `talle_casco` como parámetro nuevo al Apps Script (además de seguir dejándolo en "Observaciones" como respaldo). Se probó de nuevo el 13-sep con valores distintos a propósito (ropa="L", casco="S") para confirmar sin ambigüedad: la planilla quedó bien estructurada (columna "Talle ropa" correcta, columna "Casco" nueva creada), pero el valor que cayó en "Casco" fue el texto de observaciones, no "S" — señal de que el Apps Script sigue corriendo su código viejo (falta el paso "Implementar → Gestionar implementaciones → Nueva versión", que es fácil de saltear).

**Decisión (13-sep-2026): se deja así por ahora, no se sigue insistiendo con el redeploy del Apps Script.** El dato de casco no se pierde — sigue viajando en "Observaciones" como respaldo, visible para quien prepara el equipo, solo que no en su propia columna. Si en algún momento se quiere retomar, el fix ya está documentado en `PARCHE-apps-script-casco.md` y en `notify-alta-alquiler/index.ts` (que ya manda el parámetro correcto, solo falta que el script del lado de Google lo reciba).

⚠️ Quedaron **4 filas de prueba** en la planilla (`TEST Claude - ignorar`, `2`, `3`, `4`) y sus mensajes correspondientes en `#alta-alquiler-alumnos` — pendiente borrarlas a mano cuando se quiera, Claude solo tiene lectura sobre esa planilla.

## Preguntas que quedan abiertas

1. **A quién aplica exactamente:** hoy se muestra para los 3 packs de Clases + Alquiler. Falta confirmar esto contra el pricing real de `PricingAlquilerSection.tsx`, que no modela exactamente estos 3 packs de la misma forma.
2. **Corte / migración del Tiiny:** el formulario de Tiiny sigue activo y recibiendo alumnos reales todos los días. Gumercindo confirmó (12-sep-2026) que esto **no lo reemplaza todavía** — conviven. Falta definir hasta cuándo y en qué condición pasa a reemplazarlo del todo.
