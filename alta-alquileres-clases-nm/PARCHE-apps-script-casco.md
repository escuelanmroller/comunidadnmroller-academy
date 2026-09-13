# Parche pendiente — Apps Script "APP ALQUILER NM"

## Qué encontramos (13-sep-2026)

Renombraste el header de la columna K en "alquiler nm app NUEVO" → pestaña "Registros" de **"Talle ropa" a "Talle Casco"**. Pero el script no cambió: sigue escribiendo ahí el valor de **talla de ropa** (no el de casco). Confirmado mirando filas viejas: esa columna tiene valores S/M/L/XL que son tallas de ropa reales, no medidas de casco.

Hoy el talle de casco solo viaja como texto dentro de "Observaciones" (`Talle casco: M · ...`), no en una columna propia.

## Fix — 2 pasos en la planilla + 1 en el Apps Script

**En la planilla (`alquiler nm app NUEVO` → pestaña `Registros`):**
1. Volvé a poner el header de la columna K como **"Talle ropa"** (hoy dice "Talle Casco" por error).
2. Insertá **una columna nueva** a la derecha de esa (entre "Talle ropa" y "Observaciones") y titulala **"Talle Casco"**. Esto corre "Observaciones" un lugar más a la derecha — no pasa nada, el script no vuelve a tocar los headers de una hoja que ya existe.

**En el Apps Script** (script.google.com → proyecto "APP ALQUILER NM" → `Código.gs`): reemplazá el archivo completo por esto:

```js
const SHEET_NAME = 'Registros';

function doGet(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAME);

    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      const headers = ['Fecha y hora','Nombre','Apellido','WhatsApp','Correo','DNI','Pack','Sede','Horario preferido','Talle calzado','Talle ropa','Talle casco','Observaciones'];
      sheet.appendRow(headers);
      const headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setBackground('#C0392B');
      headerRange.setFontColor('#FFFFFF');
      headerRange.setFontWeight('bold');
      sheet.setFrozenRows(1);
    }

    const p = e.parameter;
    sheet.appendRow([
      p.timestamp || new Date().toLocaleString('es-AR'),
      p.nombre || '', p.apellido || '', p.whatsapp || '',
      p.correo || '', p.dni || '', p.pack || '',
      p.sede || '', p.horario || '',
      p.talle_calzado || '', p.talle_ropa || '', p.talle_casco || '', p.observaciones || ''
    ]);

    return ContentService.createTextOutput(JSON.stringify({ status: 'ok' })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: err.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}
```

**Único cambio real:** se agregó `p.talle_casco || ''` entre `talle_ropa` y `observaciones` (y el mismo campo en el array de `headers`, por si la hoja se recrea alguna vez desde cero). Después de pegar esto, **"Guardar" + "Implementar" → "Gestionar implementaciones" → editar la implementación existente → "Nueva versión"** (si no creás una nueva versión, el Web App sigue sirviendo el código viejo aunque hayas guardado).

## Del lado de este repo (ya hecho)

`supabase/functions/notify-alta-alquiler/index.ts` ya manda `talle_casco` como parámetro nuevo al Apps Script — no hace falta tocar nada más acá una vez que apliques el parche de arriba. Mientras tanto, el dato de casco se sigue viendo también en "Observaciones" como respaldo, para no perderlo en el medio.

## Cómo confirmar que quedó bien

Después de aplicar el parche, avisame y hago un envío de prueba (marcado como TEST) para confirmar que el valor cae en la columna "Talle Casco" nueva, no en "Talle ropa" ni en "Observaciones".
