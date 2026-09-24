/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Usuario, Reserva, Valoracion, Bloqueo, DiaNoHabil } from '../types';

export const ATECA_SECURITY_TOKEN = 'ateca_iesb_sec_2026_9d';

export interface ServerStore {
  config: Record<string, string>;
  usuarios: Usuario[];
  reservas: Reserva[];
  valoraciones: Valoracion[];
  bloqueos: Bloqueo[];
  dias_no_habiles: DiaNoHabil[];
  updated_at?: string;
}

const API_BASE_URL = '/api.php';

/**
 * Consulta la base de datos central en el servidor de Hostinger
 */
export const fetchServerStore = async (): Promise<{ success: boolean; data?: ServerStore; error?: string }> => {
  try {
    const res = await fetch(`${API_BASE_URL}?action=load&t=${Date.now()}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'X-Ateca-Token': ATECA_SECURITY_TOKEN,
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      return { success: false, error: `HTTP error ${res.status}` };
    }

    const json = await res.json();
    if (json && json.success && json.data) {
      return { success: true, data: json.data };
    }

    return { success: false, error: json?.error || 'Respuesta inválida del servidor' };
  } catch (err: any) {
    // Si estamos en entorno sin PHP (ej. dev puro local sin servidor web), falla silenciosamente
    return { success: false, error: err?.message || 'Error de red con el servidor' };
  }
};

/**
 * Guarda un elemento específico en el servidor central de forma asíncrona
 */
export const syncItemToServer = async (
  itemType: 'reserva' | 'usuario' | 'config' | 'valoracion' | 'bloqueo',
  item: any
): Promise<boolean> => {
  try {
    const res = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Ateca-Token': ATECA_SECURITY_TOKEN,
      },
      body: JSON.stringify({
        action: 'save_item',
        item_type: itemType,
        item,
      }),
    });

    return res.ok;
  } catch (err) {
    console.warn(`Error al sincronizar ${itemType} con servidor central:`, err);
    return false;
  }
};

const DELETED_RESERVAS_KEY = 'ateca_deleted_reservas';

export const getDeletedReservaIds = (): Set<string> => {
  try {
    const raw = localStorage.getItem(DELETED_RESERVAS_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
};

export const markReservaAsDeleted = (id: string) => {
  const set = getDeletedReservaIds();
  set.add(id);
  const arr = Array.from(set).slice(-200);
  localStorage.setItem(DELETED_RESERVAS_KEY, JSON.stringify(arr));
};

/**
 * Elimina un elemento del servidor central de forma asíncrona
 */
export const deleteItemFromServer = async (
  itemType: 'reserva' | 'bloqueo' | 'usuario' | 'usuario_completo',
  id: string,
  extraData?: { email?: string; id_usuario?: string }
): Promise<boolean> => {
  if (itemType === 'reserva') {
    markReservaAsDeleted(id);
  }
  try {
    const res = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Ateca-Token': ATECA_SECURITY_TOKEN,
      },
      body: JSON.stringify({
        action: 'delete_item',
        item_type: itemType,
        id,
        email: extraData?.email,
        id_usuario: extraData?.id_usuario,
      }),
    });

    return res.ok;
  } catch (err) {
    console.warn(`Error al eliminar ${itemType} en servidor central:`, err);
    return false;
  }
};

/**
 * Guarda todo el estado en el servidor central
 */
export const saveAllToServer = async (store: ServerStore): Promise<boolean> => {
  try {
    const res = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Ateca-Token': ATECA_SECURITY_TOKEN,
      },
      body: JSON.stringify({
        action: 'save_all',
        data: store,
      }),
    });

    return res.ok;
  } catch (err) {
    console.warn('Error al guardar estado global en servidor:', err);
    return false;
  }
};

/**
 * Sincroniza el localStorage del navegador con el servidor central (servidor como fuente de verdad)
 */
export const hydrateFromServer = async (
  storageKeys: {
    USERS: string;
    RESERVAS: string;
    VALORACIONES: string;
    BLOQUEOS: string;
    CONFIG: string;
    DIAS_NO_HABILES: string;
  }
): Promise<boolean> => {
  const result = await fetchServerStore();
  if (!result.success || !result.data) {
    return false;
  }

  const serverData = result.data;
  const deletedSet = getDeletedReservaIds();

  // 1. CONFIG
  const localConfigRaw = localStorage.getItem(storageKeys.CONFIG);
  const localConfig = localConfigRaw ? JSON.parse(localConfigRaw) : {};
  const mergedConfig = { ...localConfig, ...serverData.config };

  let shouldUploadConfig = false;
  if (localConfig.google_sheets_url && !serverData.config.google_sheets_url) {
    mergedConfig.google_sheets_url = localConfig.google_sheets_url;
    shouldUploadConfig = true;
  }
  if (localConfig.google_sheets_doc_url && !serverData.config.google_sheets_doc_url) {
    mergedConfig.google_sheets_doc_url = localConfig.google_sheets_doc_url;
    shouldUploadConfig = true;
  }
  localStorage.setItem(storageKeys.CONFIG, JSON.stringify(mergedConfig));
  if (shouldUploadConfig) {
    syncItemToServer('config', mergedConfig);
  }

  // 2. USUARIOS: El servidor es la fuente central
  if (serverData.usuarios && serverData.usuarios.length > 0) {
    localStorage.setItem(storageKeys.USERS, JSON.stringify(serverData.usuarios));
  }

  // 3. RESERVAS: El servidor es la fuente central, respetando los borrados
  const serverReservas: Reserva[] = (serverData.reservas || []).filter(r => !deletedSet.has(r.id_reserva));
  localStorage.setItem(storageKeys.RESERVAS, JSON.stringify(serverReservas));

  // 4. VALORACIONES: El servidor es la fuente central
  if (serverData.valoraciones) {
    localStorage.setItem(storageKeys.VALORACIONES, JSON.stringify(serverData.valoraciones));
  }

  // 5. BLOQUEOS: El servidor es la fuente central
  if (serverData.bloqueos) {
    localStorage.setItem(storageKeys.BLOQUEOS, JSON.stringify(serverData.bloqueos));
  }

  // 6. DÍAS NO HÁBILES: El servidor es la fuente central
  if (serverData.dias_no_habiles && serverData.dias_no_habiles.length > 0) {
    localStorage.setItem(storageKeys.DIAS_NO_HABILES, JSON.stringify(serverData.dias_no_habiles));
  }

  return true;
};
