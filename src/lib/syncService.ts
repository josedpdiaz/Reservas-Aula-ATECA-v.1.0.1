/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type SyncAction = 
  | 'save_reserva' 
  | 'save_usuario' 
  | 'save_valoracion' 
  | 'save_bloqueo' 
  | 'delete_bloqueo' 
  | 'bulk_sync';

/**
 * Obtiene la URL configurada del Web App de Google Apps Script.
 */
const getGsheetUrl = (): string | null => {
  try {
    const raw = localStorage.getItem('ateca_config');
    if (!raw) return null;
    const cfg = JSON.parse(raw);
    return cfg?.google_sheets_url || null;
  } catch {
    return null;
  }
};

/**
 * Envía una actualización a Google Sheets en segundo plano de forma asíncrona y no bloqueante.
 * Si no hay URL configurada, la llamada se ignora de forma transparente.
 */
export const syncToGoogleSheets = async (action: SyncAction, payload?: any): Promise<boolean> => {
  try {
    const gsheetUrl = getGsheetUrl();

    if (!gsheetUrl || !gsheetUrl.startsWith('http')) {
      // Sin webhook configurado, no hacemos nada
      return false;
    }

    let requestBody: Record<string, any> = { action };

    if (action === 'delete_bloqueo') {
      requestBody.id = typeof payload === 'string' ? payload : payload?.id;
    } else if (action === 'bulk_sync') {
      requestBody.data = payload;
    } else {
      requestBody.payload = payload;
    }

    // Petición no bloqueante con mode: 'no-cors' para Apps Script
    await fetch(gsheetUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    return true;
  } catch (err) {
    // Silencioso para no interferir en la experiencia de usuario
    console.warn('Sync en segundo plano a Google Sheets falló de forma no crítica:', err);
    return false;
  }
};
