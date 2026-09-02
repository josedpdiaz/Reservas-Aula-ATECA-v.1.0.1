/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Copy, Check, FileSpreadsheet, Key, CheckCircle2 } from 'lucide-react';

export default function SheetsGuide() {
  const [copied, setCopied] = useState(false);

  const appsScriptCode = `/**
 * Google Apps Script para conectar "Gestor Aula ATECA" con Google Sheets
 * 
 * Instrucciones de instalación:
 * 1. Crea una hoja de cálculo en Google Drive y nómbrala "Base de datos Aula ATECA".
 * 2. Crea 5 pestañas con los siguientes nombres exactos:
 *    - "Usuarios" (Columnas: id_usuario, nombre, email, rol, departamento, turno, activo)
 *    - "Reservas" (Columnas: id_reserva, fecha_creacion, profesor, email, departamento, nivel, grupo, modulo_materia_area, fecha_actividad, hora_inicio, hora_fin, zona_principal, numero_alumnos, objetivo_didactico, descripcion_actividad, recursos_necesarios, necesita_apoyo, prioridad, estado, observaciones_coordinador)
 *    - "Valoraciones" (Columnas: id_valoracion, id_reserva, fecha_valoracion, realizada_como_prevista, aspectos_positivos, dificultades, evidencias_generadas, mejoras_futuras, valoracion_general, actividad_innovacion, observaciones_finales)
 *    - "Configuracion" (Columnas: clave, valor)
 *    - "Bloqueos" (Columnas: id_bloqueo, fecha, hora_inicio, hora_fin, motivo, creado_por)
 * 3. En la hoja de cálculo, ve a Extensiones > Apps Script.
 * 4. Borra el código existente y pega este archivo completo.
 * 5. Haz clic en "Guardar" (icono de disquete).
 * 6. Haz clic en "Desplegar" > "Nuevo despliegue".
 * 7. Tipo: selecciona "Aplicación web".
 * 8. Configuración:
 *    - Ejecutar como: "Tú (tu dirección de correo)"
 *    - Quién tiene acceso: "Cualquiera" (necesario para permitir llamadas desde el cliente web)
 * 9. Haz clic en "Desplegar" y otorga los permisos necesarios de tu cuenta de Google.
 * 10. Copia la "URL de la aplicación web" generada (termina en /exec) y pégala en la Configuración del Panel de Admin.
 */

function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet();
  var action = e.parameter.action;
  
  if (!action) {
    return ContentService.createTextOutput(JSON.stringify({error: "Falta el parámetro 'action'."}))
                         .setMimeType(ContentService.MimeType.JSON);
  }
  
  try {
    var data;
    if (action === "getAll") {
      data = {
        usuarios: readSheetData(sheet.getSheetByName("Usuarios")),
        reservas: readSheetData(sheet.getSheetByName("Reservas")),
        valoraciones: readSheetData(sheet.getSheetByName("Valoraciones")),
        configuracion: readSheetData(sheet.getSheetByName("Configuracion")),
        bloqueos: readSheetData(sheet.getSheetByName("Bloqueos"))
      };
    } else {
      var targetSheet = sheet.getSheetByName(action);
      if (!targetSheet) {
        return ContentService.createTextOutput(JSON.stringify({error: "La hoja '" + action + "' no existe."}))
                             .setMimeType(ContentService.MimeType.JSON);
      }
      data = readSheetData(targetSheet);
    }
    
    return ContentService.createTextOutput(JSON.stringify({success: true, data: data}))
                         .setMimeType(ContentService.MimeType.JSON)
                         .setHeader("Access-Control-Allow-Origin", "*");
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({error: err.toString()}))
                         .setMimeType(ContentService.MimeType.JSON)
                         .setHeader("Access-Control-Allow-Origin", "*");
  }
}

function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet();
  
  try {
    var requestData = JSON.parse(e.postData.contents);
    var action = requestData.action; // "save_reserva", "save_usuario", "save_valoracion", "save_bloqueo", "delete_bloqueo", "bulk_sync"
    
    var result = {success: false};
    
    if (action === "bulk_sync") {
      // Sincronización completa bidireccional
      writeSheetData(sheet.getSheetByName("Usuarios"), requestData.data.usuarios);
      writeSheetData(sheet.getSheetByName("Reservas"), requestData.data.reservas);
      writeSheetData(sheet.getSheetByName("Valoraciones"), requestData.data.valoraciones);
      writeSheetData(sheet.getSheetByName("Configuracion"), requestData.data.configuracion);
      writeSheetData(sheet.getSheetByName("Bloqueos"), requestData.data.bloqueos);
      result = {success: true, message: "Sincronización masiva con Google Sheets completada."};
    } else if (action === "save_reserva") {
      upsertRow(sheet.getSheetByName("Reservas"), "id_reserva", requestData.payload);
      result = {success: true};
    } else if (action === "save_usuario") {
      upsertRow(sheet.getSheetByName("Usuarios"), "id_usuario", requestData.payload);
      result = {success: true};
    } else if (action === "save_valoracion") {
      upsertRow(sheet.getSheetByName("Valoraciones"), "id_valoracion", requestData.payload);
      result = {success: true};
    } else if (action === "save_bloqueo") {
      upsertRow(sheet.getSheetByName("Bloqueos"), "id_bloqueo", requestData.payload);
      result = {success: true};
    } else if (action === "delete_bloqueo") {
      deleteRow(sheet.getSheetByName("Bloqueos"), "id_bloqueo", requestData.id);
      result = {success: true};
    }
    
    return ContentService.createTextOutput(JSON.stringify(result))
                         .setMimeType(ContentService.MimeType.JSON)
                         .setHeader("Access-Control-Allow-Origin", "*");
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({error: err.toString()}))
                         .setMimeType(ContentService.MimeType.JSON)
                         .setHeader("Access-Control-Allow-Origin", "*");
  }
}

// Funciones auxiliares de lectura / escritura en Sheets
function readSheetData(sheet) {
  if (!sheet) return [];
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  
  var lastColumn = sheet.getLastColumn();
  var headers = sheet.getRange(1, 1, 1, lastColumn).getValues()[0];
  var values = sheet.getRange(2, 1, lastRow - 1, lastColumn).getValues();
  
  var list = [];
  for (var r = 0; r < values.length; r++) {
    var obj = {};
    for (var c = 0; c < headers.length; c++) {
      var val = values[r][c];
      // Convertir fechas a string seguro YYYY-MM-DD
      if (val instanceof Date) {
        obj[headers[c]] = Utilities.formatDate(val, Session.getScriptTimeZone(), "yyyy-MM-dd");
      } else {
        obj[headers[c]] = val;
      }
    }
    list.push(obj);
  }
  return list;
}

function writeSheetData(sheet, dataArray) {
  if (!sheet || !dataArray || dataArray.length === 0) return;
  
  var lastColumn = sheet.getLastColumn();
  var headers = sheet.getRange(1, 1, 1, lastColumn).getValues()[0];
  
  // Limpiar datos antiguos (fila 2 en adelante)
  var lastRow = sheet.getLastRow();
  if (lastRow >= 2) {
    sheet.deleteRows(2, lastRow - 1);
  }
  
  var rows = [];
  for (var i = 0; i < dataArray.length; i++) {
    var item = dataArray[i];
    var row = [];
    for (var c = 0; c < headers.length; c++) {
      var headerName = headers[c];
      row.push(item[headerName] !== undefined ? item[headerName] : "");
    }
    rows.push(row);
  }
  
  sheet.getRange(2, 1, rows.length, lastColumn).setValues(rows);
}

function upsertRow(sheet, keyColumnName, dataObject) {
  var lastRow = sheet.getLastRow();
  var lastColumn = sheet.getLastColumn();
  var headers = sheet.getRange(1, 1, 1, lastColumn).getValues()[0];
  var keyIndex = headers.indexOf(keyColumnName);
  
  if (keyIndex === -1) throw new Error("Llave de búsqueda '" + keyColumnName + "' no encontrada.");
  
  var foundRowIndex = -1;
  if (lastRow >= 2) {
    var keys = sheet.getRange(2, keyIndex + 1, lastRow - 1, 1).getValues();
    for (var r = 0; r < keys.length; r++) {
      if (String(keys[r][0]) === String(dataObject[keyColumnName])) {
        foundRowIndex = r + 2; // +2 porque el índice es 0-based y saltamos cabecera
        break;
      }
    }
  }
  
  // Construir fila
  var newRow = [];
  for (var c = 0; c < headers.length; c++) {
    var headerName = headers[c];
    newRow.push(dataObject[headerName] !== undefined ? dataObject[headerName] : "");
  }
  
  if (foundRowIndex !== -1) {
    // Actualizar
    sheet.getRange(foundRowIndex, 1, 1, lastColumn).setValues([newRow]);
  } else {
    // Insertar al final
    sheet.appendRow(newRow);
  }
}

function deleteRow(sheet, keyColumnName, keyVal) {
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return;
  
  var lastColumn = sheet.getLastColumn();
  var headers = sheet.getRange(1, 1, 1, lastColumn).getValues()[0];
  var keyIndex = headers.indexOf(keyColumnName);
  
  if (keyIndex === -1) throw new Error("Llave de búsqueda '" + keyColumnName + "' no encontrada.");
  
  var keys = sheet.getRange(2, keyIndex + 1, lastRow - 1, 1).getValues();
  for (var r = keys.length - 1; r >= 0; r--) {
    if (String(keys[r][0]) === String(keyVal)) {
      sheet.deleteRow(r + 2);
    }
  }
}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(appsScriptCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6">
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-3 bg-green-50 text-green-600 rounded-lg">
          <FileSpreadsheet className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Conexión con Google Sheets</h2>
          <p className="text-sm text-slate-500">Haz persistente y real tu panel conectándolo directamente con tu cuenta de Google.</p>
        </div>
      </div>

      <div className="space-y-4 text-slate-600 text-sm">
        <p>
          Esta aplicación funciona al 100% en local usando <strong>localStorage</strong> de tu navegador para que puedas probarla inmediatamente. 
          Si deseas que todas las reservas, usuarios y valoraciones se guarden directamente en un documento de <strong>Google Sheets</strong> compartido en tu centro educativo, solo debes seguir estos sencillos pasos:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
          <div className="border border-slate-100 rounded-lg p-4 bg-slate-50">
            <h3 className="font-semibold text-slate-800 flex items-center gap-1.5 mb-2">
              <span className="w-5 h-5 flex items-center justify-center bg-slate-800 text-white text-xs font-bold rounded-full">1</span>
              Preparar el documento de Google Sheets
            </h3>
            <p className="text-xs">
              Crea una hoja de cálculo en tu Drive y añade exactamente estas 5 pestañas:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-xs text-slate-500">
              <li><strong>Usuarios</strong></li>
              <li><strong>Reservas</strong></li>
              <li><strong>Valoraciones</strong></li>
              <li><strong>Configuracion</strong></li>
              <li><strong>Bloqueos</strong></li>
            </ul>
            <p className="text-xs mt-2 text-slate-400">Nota: No te preocupes por el formato, solo escribe los nombres exactos de las pestañas.</p>
          </div>

          <div className="border border-slate-100 rounded-lg p-4 bg-slate-50">
            <h3 className="font-semibold text-slate-800 flex items-center gap-1.5 mb-2">
              <span className="w-5 h-5 flex items-center justify-center bg-slate-800 text-white text-xs font-bold rounded-full">2</span>
              Desplegar Google Apps Script
            </h3>
            <p className="text-xs">
              Dentro de la hoja de cálculo, ve a <strong>Extensiones &gt; Apps Script</strong>, sustituye todo el contenido por el código de abajo, guárdalo y haz clic en <strong>Desplegar &gt; Nuevo despliegue</strong> como Aplicación Web abierta a "Cualquiera".
            </p>
            <p className="text-xs mt-2 text-slate-500">
              Copia la URL del Web App (ej: <code className="bg-slate-200 px-1 rounded">.../exec</code>) y pégala en el apartado de configuración del Panel del Administrador.
            </p>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex justify-between items-center mb-2 bg-slate-800 text-slate-300 px-4 py-2.5 rounded-t-lg">
            <span className="font-mono text-xs flex items-center gap-1.5"><Key className="w-3.5 h-3.5" /> GoogleAppsScript.js</span>
            <button
              onClick={copyToClipboard}
              id="btn_copy_script"
              className="px-3 py-1 bg-slate-700 hover:bg-slate-600 active:bg-slate-500 text-xs font-semibold text-white rounded-md flex items-center gap-1 transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3" /> Copiado
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" /> Copiar código
                </>
              )}
            </button>
          </div>
          <pre className="p-4 bg-slate-900 text-slate-300 font-mono text-[11px] leading-relaxed rounded-b-lg overflow-x-auto max-h-60 border-t border-slate-800">
            {appsScriptCode}
          </pre>
        </div>

        <div className="flex items-start gap-2 bg-emerald-50 border border-emerald-100 rounded-lg p-4 mt-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs text-emerald-800 font-semibold">Integración de sincronización bidireccional lista</p>
            <p className="text-xs text-emerald-600 mt-1">
              La conexión funciona haciendo llamadas HTTPS seguras (GET/POST) directamente desde esta aplicación web. No se guardan credenciales aquí, por lo que toda la seguridad es gestionada por Google en tu cuenta.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
