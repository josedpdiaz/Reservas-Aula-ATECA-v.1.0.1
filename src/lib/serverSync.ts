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

/**
 * Elimina un elemento del servidor central de forma asíncrona
 */
export const deleteItemFromServer = async (
  itemType: 'reserva' | 'bloqueo',
  id: string
): Promise<boolean> => {
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
 * Sincroniza bidireccionalmente el localStorage del navegador con el servidor central
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
  let shouldUploadMerged = false;

  // 1. CONFIG
  const localConfigRaw = localStorage.getItem(storageKeys.CONFIG);
  const localConfig = localConfigRaw ? JSON.parse(localConfigRaw) : {};
  const mergedConfig = { ...localConfig, ...serverData.config };

  // Si local tiene google_sheets_url pero servidor no, conservamos la local y la subimos
  if (localConfig.google_sheets_url && !serverData.config.google_sheets_url) {
    mergedConfig.google_sheets_url = localConfig.google_sheets_url;
    shouldUploadMerged = true;
  }
  if (localConfig.google_sheets_doc_url && !serverData.config.google_sheets_doc_url) {
    mergedConfig.google_sheets_doc_url = localConfig.google_sheets_doc_url;
    shouldUploadMerged = true;
  }
  localStorage.setItem(storageKeys.CONFIG, JSON.stringify(mergedConfig));

  // 2. USUARIOS: Unir por email
  const localUsersRaw = localStorage.getItem(storageKeys.USERS);
  const localUsers: Usuario[] = localUsersRaw ? JSON.parse(localUsersRaw) : [];
  const serverUsers: Usuario[] = serverData.usuarios || [];

  const userMap = new Map<string, Usuario>();
  // Primero locales
  localUsers.forEach(u => userMap.set(u.email.toLowerCase(), u));
  // Sobrescribir o añadir con servidores
  serverUsers.forEach(u => userMap.set(u.email.toLowerCase(), u));

  // Si local tenía usuarios que el servidor no tiene, marcar para subir
  if (localUsers.some(lu => !serverUsers.some(su => su.email.toLowerCase() === lu.email.toLowerCase()))) {
    shouldUploadMerged = true;
  }
  const mergedUsers = Array.from(userMap.values());
  localStorage.setItem(storageKeys.USERS, JSON.stringify(mergedUsers));

  // 3. RESERVAS: Unir por id_reserva
  const localReservasRaw = localStorage.getItem(storageKeys.RESERVAS);
  const localReservas: Reserva[] = localReservasRaw ? JSON.parse(localReservasRaw) : [];
  const serverReservas: Reserva[] = serverData.reservas || [];

  const reservaMap = new Map<string, Reserva>();
  localReservas.forEach(r => reservaMap.set(r.id_reserva, r));
  serverReservas.forEach(r => reservaMap.set(r.id_reserva, r));

  if (localReservas.some(lr => !serverReservas.some(sr => sr.id_reserva === lr.id_reserva))) {
    shouldUploadMerged = true;
  }
  const mergedReservas = Array.from(reservaMap.values());
  localStorage.setItem(storageKeys.RESERVAS, JSON.stringify(mergedReservas));

  // 4. VALORACIONES
  const localValRaw = localStorage.getItem(storageKeys.VALORACIONES);
  const localVal: Valoracion[] = localValRaw ? JSON.parse(localValRaw) : [];
  const serverVal: Valoracion[] = serverData.valoraciones || [];

  const valMap = new Map<string, Valoracion>();
  localVal.forEach(v => valMap.set(v.id_valoracion, v));
  serverVal.forEach(v => valMap.set(v.id_valoracion, v));
  if (localVal.some(lv => !serverVal.some(sv => sv.id_valoracion === lv.id_valoracion))) {
    shouldUploadMerged = true;
  }
  const mergedVal = Array.from(valMap.values());
  localStorage.setItem(storageKeys.VALORACIONES, JSON.stringify(mergedVal));

  // 5. BLOQUEOS
  const localBloqRaw = localStorage.getItem(storageKeys.BLOQUEOS);
  const localBloq: Bloqueo[] = localBloqRaw ? JSON.parse(localBloqRaw) : [];
  const serverBloq: Bloqueo[] = serverData.bloqueos || [];

  const bloqMap = new Map<string, Bloqueo>();
  localBloq.forEach(b => bloqMap.set(b.id_bloqueo, b));
  serverBloq.forEach(b => bloqMap.set(b.id_bloqueo, b));
  if (localBloq.some(lb => !serverBloq.some(sb => sb.id_bloqueo === lb.id_bloqueo))) {
    shouldUploadMerged = true;
  }
  const mergedBloq = Array.from(bloqMap.values());
  localStorage.setItem(storageKeys.BLOQUEOS, JSON.stringify(mergedBloq));

  // 6. DÍAS NO HÁBILES
  if (serverData.dias_no_habiles && serverData.dias_no_habiles.length > 0) {
    localStorage.setItem(storageKeys.DIAS_NO_HABILES, JSON.stringify(serverData.dias_no_habiles));
  }

  // Si local tenía datos iniciales que el servidor no tenía, sincronizar hacia arriba
  if (shouldUploadMerged) {
    saveAllToServer({
      config: mergedConfig,
      usuarios: mergedUsers,
      reservas: mergedReservas,
      valoraciones: mergedVal,
      bloqueos: mergedBloq,
      dias_no_habiles: serverData.dias_no_habiles || [],
    });
  }

  return true;
};
