// Apps Script "APP ALQUILER NM" — planilla "alquiler nm app NUEVO", pestaña "Registros".
// Copia versionada del Código.gs que corre en script.google.com.
// La clave real NO va acá (este archivo está en git): se reemplaza LOOKUP_TOKEN
// al pegarlo en el editor de Google, y la misma clave va como secret
// ALTA_ALQUILER_LOOKUP_TOKEN en Supabase (bosutr).

const SHEET_NAME = 'Registros';
const LOOKUP_TOKEN = '__PEGAR_CLAVE_ACA__';

function doGet(e) {
  try {
    const p = e.parameter || {};
    if (p.accion === 'buscar') return buscarPorDni_(p);

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

    sheet.appendRow([
      p.timestamp || new Date().toLocaleString('es-AR'),
      p.nombre || '', p.apellido || '', p.whatsapp || '',
      p.correo || '', p.dni || '', p.pack || '',
      p.sede || '', p.horario || '',
      p.talle_calzado || '', p.talle_ropa || '', p.talle_casco || '', p.observaciones || ''
    ]);

    return json_({ status: 'ok' });
  } catch (err) {
    return json_({ status: 'error', message: err.toString() });
  }
}

// Busca la fila MÁS RECIENTE con ese DNI. Columnas por nombre de header (no por
// posición), así sigue andando aunque se inserten columnas nuevas en la hoja.
function buscarPorDni_(p) {
  if (p.token !== LOOKUP_TOKEN) return json_({ status: 'unauthorized' });

  const dni = String(p.dni || '').replace(/\D/g, '');
  if (dni.length < 6) return json_({ status: 'ok', encontrado: false });

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet) return json_({ status: 'ok', encontrado: false });

  const values = sheet.getDataRange().getValues();
  const headers = values[0].map(function (h) { return String(h).trim().toLowerCase(); });
  const col = function (name) { return headers.indexOf(name); };
  const iDni = col('dni');
  if (iDni < 0) return json_({ status: 'error', message: 'sin columna DNI' });

  const get = function (row, name) {
    const i = col(name);
    return i < 0 ? '' : String(row[i] == null ? '' : row[i]).trim();
  };

  for (let r = values.length - 1; r >= 1; r--) {
    const row = values[r];
    if (String(row[iDni]).replace(/\D/g, '') !== dni) continue;
    return json_({
      status: 'ok',
      encontrado: true,
      datos: {
        nombre: get(row, 'nombre'),
        apellido: get(row, 'apellido'),
        whatsapp: get(row, 'whatsapp'),
        correo: get(row, 'correo'),
        sede: get(row, 'sede'),
        talle_calzado: get(row, 'talle calzado'),
        talle_ropa: get(row, 'talle ropa'),
      },
    });
  }
  return json_({ status: 'ok', encontrado: false });
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
