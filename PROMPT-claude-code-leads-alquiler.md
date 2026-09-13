# Prompt para Claude Code — Leads de "Clases + Alquiler" entrando al canal equivocado de Slack

> Copiá TODO lo que está debajo de la línea y pegalo en Claude Code dentro del repo `comunidadnmroller`.

---

## Situación

Necesito que me digas dónde están entrando los leads de la gente que compra **Clases + Alquiler** cuando sube el comprobante en la web.

En Slack tenemos dos canales separados a propósito:

- `#venta-de-planes` → compras de planes NM (home)
- `#venta-alquiler-clases` → compras de Clases + Alquiler

Mi sospecha es que las compras de Clases + Alquiler están cayendo en `#venta-de-planes` en lugar de `#venta-alquiler-clases`. La idea es que estén separados. Necesito saber **dónde están entrando realmente**, dónde quedó configurado ese ruteo, y resolverlo de raíz.

## Contexto ya investigado (arrancá desde acá, no lo re-investigues)

El ruteo vive en `supabase/functions/notify-comprobante/index.ts`:

```ts
const slackChannel = origen === "clases-alquiler"
  ? "venta-alquiler-clases"
  : "venta-de-planes";
```

Y en `supabase/functions/_shared/slack.ts` cada canal resuelve por secret:

| Canal | Secret |
|---|---|
| `venta-de-planes` | `SLACK_WEBHOOK_VENTA_PLANES` |
| `venta-alquiler-clases` | `SLACK_WEBHOOK_VENTA_ALQUILER` |

Todo depende de un único campo: `origen`. El default es `"nm"` → cae en `#venta-de-planes`.

### Hipótesis A — el `origen` se pierde en el viaje a Mercado Pago

El `origen` **no viaja por la URL**: Mercado Pago no arrastra el querystring hasta el `back_url` (está comentado en `src/lib/intencionCompra.ts`). Se guarda en `localStorage` (key `nm_intencion_compra`, TTL 6h) al hacer clic en COMPRAR PLAN y se lee al volver a `/pago-confirmado`.

Ese puente se rompe cuando:

- El link abre en `target="_blank"` y el pago se hace en la **app de Mercado Pago** o en el navegador in-app de Instagram/WhatsApp, y el usuario vuelve en otro navegador → no hay localStorage.
- Modo incógnito o storage bloqueado.
- Pasan más de 6 horas entre el clic y la subida del comprobante.
- El usuario entra directo a `/pago-confirmado` sin pasar por la sección de precios.

En todos esos casos `origen = "nm"` → notificación al canal equivocado.

### Hipótesis B — los dos proyectos Supabase desincronizados

Es el **error recurrente #15** documentado en `CLAUDE.md`. Producción (`bosutrnpmpjxylcgjmbt`) puede estar corriendo una versión vieja de `notify-comprobante` sin el ruteo por `origen`, mientras Lovable solo deploya en `zpeijyutagfqeoatlvdq`. Los únicos mensajes que veo en `#venta-alquiler-clases` son tests del 14 de junio ("Test Clases Alquiler"), así que pueden haber salido de la preview y no de producción.

## Lo que necesito que hagas

1. **Diagnóstico primero, sin tocar código.** La tabla `comprobantes_pago` guarda el campo `origen`. Prepará y ayudame a correr esta consulta en el SQL Editor de `bosutrnpmpjxylcgjmbt`:

   ```sql
   select origen, plan, nombre, email, created_at
   from comprobantes_pago
   order by created_at desc
   limit 30;
   ```

   Interpretación:
   - Filas con `origen = 'clases-alquiler'` que **no** llegaron a `#venta-alquiler-clases` → es la **Hipótesis B** (deploy viejo en `bosutr`).
   - Compras de alquiler guardadas con `origen = 'nm'` → es la **Hipótesis A** (localStorage).

2. **Verificá qué versión de `notify-comprobante` está viva en producción** (`bosutr`), no en `zpeij`. Confirmá si el código deployado tiene el ruteo por `origen`.

3. **Proponeme el fix de raíz, no un parche.** Quiero que el `origen` deje de depender de `localStorage`. Evaluá alternativas y recomendame **una sola**, la de mejor relación simplicidad ↔ resultado (ej.: una ruta de retorno propia tipo `/pago-confirmado-alquiler` configurada como `back_url` en cada link de MP, para que el origen viaje en la URL y no en storage). No me des un menú de opciones: elegí la mejor y explicame por qué.

4. **Antes de proponer nada, chequeá el principio rector y los errores recurrentes de `CLAUDE.md`.** Si hay un camino más simple del que estoy planteando, decímelo de una.

5. Si el fix implica deployar Edge Functions a producción, **preparame el comando exacto** para que lo corra yo en mi terminal (auto-mode bloquea deploys directos). Recordá: `supabase functions deploy <fn> --project-ref bosutrnpmpjxylcgjmbt --no-verify-jwt`.

Arrancá por el paso 1 y frená ahí para que revisemos juntos los datos antes de tocar nada.
