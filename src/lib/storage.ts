/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Usuario, Reserva, Valoracion, Bloqueo, ConfigItem, DiaNoHabil, isFpDepartment } from '../types';
import { syncToGoogleSheets } from './syncService';
import { 
  syncItemToServer, deleteItemFromServer, saveAllToServer, hydrateFromServer, markReservaAsDeleted 
} from './serverSync';
// Pre-seeded configuration data (Producción Oficial)
const DEFAULT_CONFIG: Record<string, string> = {
  nombre_centro: "IES Agustín de Betancourt",
  nombre_aula: "Aula ATECA Innovación",
  horario_inicio: "08:00",
  horario_fin: "22:30",
  duracion_minima_reserva: "30",
  duracion_maxima_reserva: "360",
  email_coordinador: "jpacdia@gobiernodecanarias.org",
  nombre_coordinador: "José P. Díaz",
  logo_centro: "/logo_iesb.png", // Logo oficial IES Agustín de Betancourt
};

// Cuentas excepcionales autorizadas exclusivamente para pruebas
export const ALLOWED_TEST_ACCOUNTS: string[] = ['josedpdiaz@gmail.com', 'phopsys@gmail.com'];

/**
 * Valida si un correo electrónico está autorizado para acceder al sistema
 * (Exclusivamente cuentas oficiales @gobiernodecanarias.org y las 2 cuentas de prueba)
 */
export const isAllowedLoginEmail = (email: string): boolean => {
  const clean = (email || '').trim().toLowerCase();
  return clean.endsWith('@gobiernodecanarias.org') || clean.endsWith('@canariaseducacion.es') || ALLOWED_TEST_ACCOUNTS.includes(clean);
};

// Pre-seeded users (Administrador oficial del centro y usuarios de prueba autorizados)
const DEFAULT_USERS: Usuario[] = [
  {
    id_usuario: "u-1",
    nombre: "José Díaz",
    email: "jpacdia@gobiernodecanarias.org",
    rol: "ADMIN",
    departamento: "Administración y Gestión",
    turno: "Ambos",
    activo: true,
  },
  {
    id_usuario: "u-test-fp",
    nombre: "José Díaz (Pruebas FP)",
    email: "josedpdiaz@gmail.com",
    rol: "PROFESOR",
    departamento: "Administración y Gestión", // Prioridad P1 (Auto-aprobada directa)
    turno: "Ambos",
    activo: true,
  },
  {
    id_usuario: "u-test-sec",
    nombre: "Usuario Pruebas (Secundaria)",
    email: "phopsys@gmail.com",
    rol: "PROFESOR",
    departamento: "Tecnología", // Prioridad P2/P3 (Requiere aprobación de Coordinación/Admin)
    turno: "Ambos",
    activo: true,
  }
];

// Robust local date formatting to YYYY-MM-DD avoiding UTC/timezone shift bugs
export const formatDateToYMD = (date: Date = new Date()): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

// Check if a YYYY-MM-DD date falls on a Saturday or Sunday
export const isWeekend = (dateStr: string): boolean => {
  if (!dateStr) return false;
  try {
    const parts = dateStr.split('-');
    if (parts.length !== 3) return false;
    const y = Number(parts[0]);
    const m = Number(parts[1]);
    const d = Number(parts[2]);
    const dateObj = new Date(y, m - 1, d);
    const dayOfWeek = dateObj.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6; // 0 = Domingo, 6 = Sábado
  } catch {
    return false;
  }
};

// Helper to get dates relative to today GUARANTEEING they only fall on Monday-Friday (never Saturday or Sunday)
export const getRelativeWeekdayStr = (targetOffset: number): string => {
  const d = new Date();
  let added = 0;
  const step = targetOffset >= 0 ? 1 : -1;
  const total = Math.abs(targetOffset);

  // If today is weekend, advance to next or prev weekday first
  while (d.getDay() === 0 || d.getDay() === 6) {
    d.setDate(d.getDate() + step);
  }

  while (added < total) {
    d.setDate(d.getDate() + step);
    const day = d.getDay();
    if (day !== 0 && day !== 6) { // 0: Sunday, 6: Saturday
      added++;
    }
  }
  return formatDateToYMD(d);
};

// Pre-seeded reservations (Vacío para producción y fase de pruebas)
const DEFAULT_RESERVAS: Reserva[] = [];

// Pre-seeded assessments (Vacío para producción y fase de pruebas)
const DEFAULT_VALORACIONES: Valoracion[] = [];

// Pre-seeded lockouts (Vacío para producción y fase de pruebas)
const DEFAULT_BLOQUEOS: Bloqueo[] = [];

// Pre-seeded School Calendar Non-Working Periods (Canarias Educación)
const DEFAULT_DIAS_NO_HABILES: DiaNoHabil[] = [
  {
    id: "dnh-1",
    fecha_inicio: "2026-12-23",
    fecha_fin: "2027-01-07",
    nombre: "Vacaciones de Navidad",
    tipo: "VACACIONES",
  },
  {
    id: "dnh-2",
    fecha_inicio: "2027-03-22",
    fecha_fin: "2027-03-29",
    nombre: "Semana Santa",
    tipo: "VACACIONES",
  },
  {
    id: "dnh-3",
    fecha_inicio: "2026-10-12",
    fecha_fin: "2026-10-12",
    nombre: "Fiesta Nacional de España",
    tipo: "FESTIVO",
  },
  {
    id: "dnh-4",
    fecha_inicio: "2026-11-27",
    fecha_fin: "2026-11-27",
    nombre: "Día del Enseñante y del Estudiante",
    tipo: "LIBRE_DISPOSICION",
  },
  {
    id: "dnh-5",
    fecha_inicio: "2026-12-06",
    fecha_fin: "2026-12-08",
    nombre: "Puente de la Constitución e Inmaculada",
    tipo: "FESTIVO",
  },
  {
    id: "dnh-6",
    fecha_inicio: "2027-05-30",
    fecha_fin: "2027-05-30",
    nombre: "Día de Canarias",
    tipo: "FESTIVO",
  }
];

const STORAGE_KEYS = {
  USERS: 'ateca_usuarios',
  RESERVAS: 'ateca_reservas',
  VALORACIONES: 'ateca_valoraciones',
  BLOQUEOS: 'ateca_bloqueos',
  CONFIG: 'ateca_config',
  CURRENT_USER: 'ateca_usuario_actual',
  DIAS_NO_HABILES: 'ateca_dias_no_habiles',
  THEME: 'ateca_theme',
  FONT_SIZE: 'ateca_font_size',
};

// Sincronización explícita con el servidor central de Hostinger
export const syncWithServer = async (): Promise<boolean> => {
  return await hydrateFromServer(STORAGE_KEYS);
};

// Main controller to boot the storage
export const initializeStorage = (force: boolean = false) => {
  if (force || !localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEFAULT_USERS));
  }
  if (force || !localStorage.getItem(STORAGE_KEYS.RESERVAS)) {
    localStorage.setItem(STORAGE_KEYS.RESERVAS, JSON.stringify(DEFAULT_RESERVAS));
  }
  if (force || !localStorage.getItem(STORAGE_KEYS.VALORACIONES)) {
    localStorage.setItem(STORAGE_KEYS.VALORACIONES, JSON.stringify(DEFAULT_VALORACIONES));
  }
  if (force || !localStorage.getItem(STORAGE_KEYS.BLOQUEOS)) {
    localStorage.setItem(STORAGE_KEYS.BLOQUEOS, JSON.stringify(DEFAULT_BLOQUEOS));
  }
  if (force || !localStorage.getItem(STORAGE_KEYS.CONFIG)) {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(DEFAULT_CONFIG));
  }
  if (force || !localStorage.getItem(STORAGE_KEYS.DIAS_NO_HABILES)) {
    localStorage.setItem(STORAGE_KEYS.DIAS_NO_HABILES, JSON.stringify(DEFAULT_DIAS_NO_HABILES));
  }
  // Remove light mode, default to intermediate (soft / rest mode)
  const currentTheme = localStorage.getItem(STORAGE_KEYS.THEME);
  if (!currentTheme || currentTheme === 'light') {
    localStorage.setItem(STORAGE_KEYS.THEME, 'intermediate');
  }
  if (!localStorage.getItem(STORAGE_KEYS.FONT_SIZE)) {
    localStorage.setItem(STORAGE_KEYS.FONT_SIZE, '100');
  }

  // Configuración inicial de centro IES Agustín de Betancourt y logo en producción
  if (localStorage.getItem('ateca_ies_betancourt_v3') !== 'true') {
    const rawCfg = localStorage.getItem(STORAGE_KEYS.CONFIG);
    if (!rawCfg) {
      localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(DEFAULT_CONFIG));
    } else {
      const cfg = safeParse<Record<string, string>>(rawCfg, {});
      cfg.nombre_centro = DEFAULT_CONFIG.nombre_centro;
      cfg.logo_centro = DEFAULT_CONFIG.logo_centro;
      localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(cfg));
    }
    localStorage.setItem('ateca_ies_betancourt_v3', 'true');
  }

  // Limpieza inicial para producción sin datos mock (solo si el servidor no tiene datos)
  if (localStorage.getItem('ateca_production_clean_v122') !== 'true') {
    if (!localStorage.getItem(STORAGE_KEYS.RESERVAS)) {
      localStorage.setItem(STORAGE_KEYS.RESERVAS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.VALORACIONES)) {
      localStorage.setItem(STORAGE_KEYS.VALORACIONES, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.BLOQUEOS)) {
      localStorage.setItem(STORAGE_KEYS.BLOQUEOS, JSON.stringify([]));
    }
    localStorage.setItem('ateca_production_clean_v122', 'true');
  }

  // PURGA INMEDIATA: Elimina cualquier tarea, reserva o bloqueo que se encuentre en sábado o domingo
  purgeWeekendTasks();

  // Migración automática de Informática / Ofimática hacia 'Administración y Gestión' y limpieza de prefijo 'Departamento de'
  try {
    const rawUsers = localStorage.getItem(STORAGE_KEYS.USERS);
    if (rawUsers) {
      const usersList = safeParse<Usuario[]>(rawUsers, []);
      let changed = false;
      const migrated = usersList.map(u => {
        let d = (u.departamento || '').trim();
        const dUpper = d.toUpperCase();
        if (dUpper.includes('INFORMÁTICA') || dUpper.includes('INFORMATICA') || dUpper.includes('OFIMÁTICA') || dUpper.includes('OFIMATICA')) {
          d = 'Administración y Gestión';
          changed = true;
        } else if (/^departamento\s+(de\s+)?/i.test(d)) {
          d = d.replace(/^departamento\s+(de\s+)?/i, '').trim();
          changed = true;
        }
        return { ...u, departamento: d };
      });
      if (changed) {
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(migrated));
      }
    }
    const current = getCurrentUser();
    if (current) {
      let cd = (current.departamento || '').trim();
      const cUpper = cd.toUpperCase();
      let changedCurrent = false;
      if (cUpper.includes('INFORMÁTICA') || cUpper.includes('INFORMATICA') || cUpper.includes('OFIMÁTICA') || cUpper.includes('OFIMATICA')) {
        cd = 'Administración y Gestión';
        changedCurrent = true;
      } else if (/^departamento\s+(de\s+)?/i.test(cd)) {
        cd = cd.replace(/^departamento\s+(de\s+)?/i, '').trim();
        changedCurrent = true;
      }
      if (changedCurrent) {
        setCurrentUser({ ...current, departamento: cd });
      }
    }
  } catch (e) {
    console.error('Error en migración de departamentos:', e);
  }

  // Asegurar que las cuentas excepcionales de prueba estén registradas
  try {
    const rawUsers = localStorage.getItem(STORAGE_KEYS.USERS);
    const usersList = rawUsers ? safeParse<Usuario[]>(rawUsers, []) : [];
    let updatedUsers = false;
    for (const testUser of DEFAULT_USERS) {
      if (!usersList.some(u => u.email.toLowerCase() === testUser.email.toLowerCase())) {
        usersList.push(testUser);
        updatedUsers = true;
      }
    }
    if (updatedUsers) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(usersList));
    }
  } catch (e) {
    console.error('Error al asegurar cuentas de prueba:', e);
  }

  // Sincronización transparente con el servidor central de Hostinger
  syncWithServer().catch(() => {});
};

// Reiniciar base de datos a limpia para fase de pruebas / producción
export const clearAllReservasAndValoraciones = (): void => {
  localStorage.setItem(STORAGE_KEYS.RESERVAS, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.VALORACIONES, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.BLOQUEOS, JSON.stringify([]));
};

// Helper for safe JSON parsing
const safeParse = <T>(value: string | null, fallback: T): T => {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

// Purge any reservation or lockout located on Saturday or Sunday
export const purgeWeekendTasks = (): { deletedReservas: number; deletedBloqueos: number } => {
  const allReservas = safeParse<Reserva[]>(localStorage.getItem(STORAGE_KEYS.RESERVAS), []);
  const cleanReservas = allReservas.filter(r => !isWeekend(r.fecha_actividad));
  const deletedReservas = allReservas.length - cleanReservas.length;
  if (deletedReservas > 0) {
    localStorage.setItem(STORAGE_KEYS.RESERVAS, JSON.stringify(cleanReservas));
  }

  const allBloqueos = safeParse<Bloqueo[]>(localStorage.getItem(STORAGE_KEYS.BLOQUEOS), []);
  const cleanBloqueos = allBloqueos.filter(b => !isWeekend(b.fecha));
  const deletedBloqueos = allBloqueos.length - cleanBloqueos.length;
  if (deletedBloqueos > 0) {
    localStorage.setItem(STORAGE_KEYS.BLOQUEOS, JSON.stringify(cleanBloqueos));
  }

  return { deletedReservas, deletedBloqueos };
};

// Helper for modern unique ID generation without deprecated substr
const generateUniqueId = (prefix: string): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
  }
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
};

// Getter functions
export const getUsuarios = (): Usuario[] => {
  return safeParse(localStorage.getItem(STORAGE_KEYS.USERS), []);
};

export const getReservas = (): Reserva[] => {
  const all = safeParse<Reserva[]>(localStorage.getItem(STORAGE_KEYS.RESERVAS), []);
  const valid = all.filter(r => !isWeekend(r.fecha_actividad));
  if (valid.length !== all.length) {
    localStorage.setItem(STORAGE_KEYS.RESERVAS, JSON.stringify(valid));
  }
  return valid;
};

export const getValoraciones = (): Valoracion[] => {
  return safeParse(localStorage.getItem(STORAGE_KEYS.VALORACIONES), []);
};

export const getBloqueos = (): Bloqueo[] => {
  const all = safeParse<Bloqueo[]>(localStorage.getItem(STORAGE_KEYS.BLOQUEOS), []);
  const valid = all.filter(b => !isWeekend(b.fecha));
  if (valid.length !== all.length) {
    localStorage.setItem(STORAGE_KEYS.BLOQUEOS, JSON.stringify(valid));
  }
  return valid;
};

export const getConfig = (): Record<string, string> => {
  return safeParse(localStorage.getItem(STORAGE_KEYS.CONFIG), {});
};

export const getCurrentUser = (): Usuario | null => {
  return safeParse(localStorage.getItem(STORAGE_KEYS.CURRENT_USER), null);
};

// Setter & Modifier functions
export const setUsuarios = (usuarios: Usuario[]) => {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(usuarios));
};

export const setReservas = (reservas: Reserva[]) => {
  localStorage.setItem(STORAGE_KEYS.RESERVAS, JSON.stringify(reservas));
};

export const setValoraciones = (valoraciones: Valoracion[]) => {
  localStorage.setItem(STORAGE_KEYS.VALORACIONES, JSON.stringify(valoraciones));
};

export const setBloqueos = (bloqueos: Bloqueo[]) => {
  localStorage.setItem(STORAGE_KEYS.BLOQUEOS, JSON.stringify(bloqueos));
};

export const setConfig = (config: Record<string, string>) => {
  localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
  syncItemToServer('config', config);
};

export const setCurrentUser = (usuario: Usuario | null) => {
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(usuario));
};

export const getDiasNoHabiles = (): DiaNoHabil[] => {
  return safeParse(localStorage.getItem(STORAGE_KEYS.DIAS_NO_HABILES), []);
};

export const setDiasNoHabiles = (dias: DiaNoHabil[]) => {
  localStorage.setItem(STORAGE_KEYS.DIAS_NO_HABILES, JSON.stringify(dias));
};

export const addDiaNoHabil = (dia: Omit<DiaNoHabil, 'id'>): DiaNoHabil => {
  const arr = getDiasNoHabiles();
  const nuevo: DiaNoHabil = {
    ...dia,
    id: generateUniqueId('dnh'),
  };
  arr.push(nuevo);
  setDiasNoHabiles(arr);
  return nuevo;
};

export const removeDiaNoHabil = (id: string) => {
  const arr = getDiasNoHabiles();
  const filtered = arr.filter(d => d.id !== id);
  setDiasNoHabiles(filtered);
};

export const getTheme = (): 'intermediate' | 'dark' => {
  const val = localStorage.getItem(STORAGE_KEYS.THEME);
  if (val === 'dark') return 'dark';
  return 'intermediate';
};

export const setTheme = (theme: 'intermediate' | 'dark') => {
  localStorage.setItem(STORAGE_KEYS.THEME, theme);
};

export const getFontSize = (): number => {
  const saved = localStorage.getItem(STORAGE_KEYS.FONT_SIZE);
  const num = saved ? Number(saved) : 100;
  return isNaN(num) ? 100 : Math.min(130, Math.max(85, num));
};

export const setFontSize = (size: number) => {
  localStorage.setItem(STORAGE_KEYS.FONT_SIZE, String(size));
};

// Check if a given YYYY-MM-DD date is a weekend or holiday/vacation
export const isNonWorkingDay = (dateStr: string): { isNonWorking: boolean; reason?: string; isWeekend?: boolean } => {
  if (!dateStr) return { isNonWorking: false };

  // 1. Weekend Check (Saturday or Sunday)
  const [y, m, d] = dateStr.split('-').map(Number);
  const dateObj = new Date(y, m - 1, d);
  const dayOfWeek = dateObj.getDay(); // 0 is Sunday, 6 is Saturday
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return {
      isNonWorking: true,
      reason: dayOfWeek === 0 ? 'Domingo (Fin de semana)' : 'Sábado (Fin de semana)',
      isWeekend: true,
    };
  }

  // 2. Holidays & Vacations Check configured in School Calendar
  const dias = getDiasNoHabiles();
  for (const dia of dias) {
    if (dateStr >= dia.fecha_inicio && dateStr <= dia.fecha_fin) {
      const tipoLabel = dia.tipo === 'VACACIONES' ? 'Vacaciones' : dia.tipo === 'LIBRE_DISPOSICION' ? 'Libre Disposición' : 'Festivo';
      return {
        isNonWorking: true,
        reason: `${dia.nombre} (${tipoLabel})`,
        isWeekend: false,
      };
    }
  }

  return { isNonWorking: false };
};

// Business operations
export const loginByEmail = (email: string): { success: boolean; user?: Usuario; error?: string } => {
  const emailLower = email.trim().toLowerCase();

  // En producción oficial se exige la terminación institucional @gobiernodecanarias.org (o su buzón asociado @canariaseducacion.es)
  if (!isAllowedLoginEmail(emailLower)) {
    return {
      success: false,
      error: "Acceso restringido: Debes identificarte con tu cuenta oficial del Gobierno de Canarias (@gobiernodecanarias.org)."
    };
  }

  const enrolledLower = emailLower.endsWith('@canariaseducacion.es')
    ? emailLower.replace('@canariaseducacion.es', '@gobiernodecanarias.org')
    : emailLower;

  const users = getUsuarios();
  const user = users.find(u => {
    const uEmail = u.email.trim().toLowerCase();
    return uEmail === enrolledLower || uEmail === emailLower;
  });

  if (!user) {
    // Si la cuenta es del Gobierno de Canarias pero aún no está en el listado, se matricula oficialmente con @gobiernodecanarias.org
    const defaultUser: Usuario = {
      id_usuario: generateUniqueId('u'),
      nombre: emailSplitName(enrolledLower),
      email: enrolledLower,
      rol: 'PROFESOR',
      departamento: "General",
      turno: "Ambos",
      activo: true,
    };
    const newUsersList = [...users, defaultUser];
    setUsuarios(newUsersList);
    setCurrentUser(defaultUser);
    syncItemToServer('usuario', defaultUser);
    syncToGoogleSheets('save_usuario', defaultUser);
    return { success: true, user: defaultUser };
  }

  if (!user.activo) {
    return { success: false, error: "Tu usuario existe pero se encuentra DESACTIVADO. Contacta con la Coordinación o Administración del centro." };
  }

  setCurrentUser(user);
  return { success: true, user };
};

const emailSplitName = (email: string): string => {
  const namepart = email.split('@')[0];
  return namepart.split('.').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

// Add reservation
export const addReserva = (reserva: Omit<Reserva, 'id_reserva' | 'fecha_creacion' | 'estado' | 'observaciones_coordinador'>): { success: boolean; reserva?: Reserva; conflict?: boolean; message?: string } => {
  const id_reserva = generateUniqueId('res');
  const fecha_creacion = formatDateToYMD();
  
  // 0. Check if non-working day (weekend or school holiday)
  const nonWorking = isNonWorkingDay(reserva.fecha_actividad);
  if (nonWorking.isNonWorking) {
    return {
      success: false,
      conflict: true,
      message: `No se pueden programar reservas en días no lectivos: ${nonWorking.reason}.`
    };
  }

  // Check conflicts
  const reservasArr = getReservas();
  const bloqueosArr = getBloqueos();

  // 1. Is there a block on that date and range?
  const hasBlock = bloqueosArr.some(b => {
    if (b.fecha !== reserva.fecha_actividad) return false;
    return checkTimeOverlap(b.hora_inicio, b.hora_fin, reserva.hora_inicio, reserva.hora_fin);
  });

  if (hasBlock) {
    return {
      success: false,
      conflict: true,
      message: "Conflicto: Hay un bloqueo programado para mantenimiento en este horario."
    };
  }

  // 2. Check if there is an approved reservation on that same date and time range
  const hasApprovedOverlap = reservasArr.some(r => {
    if (r.estado !== 'APROBADA' && r.estado !== 'REALIZADA') return false;
    if (r.fecha_actividad !== reserva.fecha_actividad) return false;
    return checkTimeOverlap(r.hora_inicio, r.hora_fin, reserva.hora_inicio, reserva.hora_fin);
  });

  const isFP = isFpBooking(reserva);

  // Para nivel P1 de Formación Profesional y Tecnológica, aprobación directa automática
  const nuevoEstado = isFP ? 'APROBADA' : 'PENDIENTE';

  const observaciones = isFP
    ? 'Aprobada automáticamente por nivel P1 de Formación Profesional (FP / Prueba técnica).'
    : hasApprovedOverlap 
      ? 'Aviso: Solapamiento potencial con reserva preexistente. Requiere validación de Coordinación o Administración.'
      : 'Reserva registrada como PENDIENTE. Requiere aprobación de Administrador o Coordinadores (Nivel P2/P3).';

  const finalReserva: Reserva = {
    ...reserva,
    numero_alumnos: Math.min(12, Math.max(1, Number(reserva.numero_alumnos) || 1)),
    id_reserva,
    fecha_creacion,
    estado: nuevoEstado,
    observaciones_coordinador: observaciones,
  };

  reservasArr.unshift(finalReserva); // put on top

  // Si la nueva reserva es aprobada automáticamente (FP), desplazar reservas en standby que ocupen esa franja
  if (nuevoEstado === 'APROBADA') {
    reservasArr.forEach(other => {
      if (other.id_reserva !== finalReserva.id_reserva && other.estado === 'PENDIENTE' && other.fecha_actividad === finalReserva.fecha_actividad) {
        if (checkTimeOverlap(other.hora_inicio, other.hora_fin, finalReserva.hora_inicio, finalReserva.hora_fin)) {
          if (other.en_standby_por_no_confirmar) {
            other.observaciones_coordinador = `Desplazada por nueva reserva prioritaria de FP (${finalReserva.profesor} - ${finalReserva.modulo_materia_area}). Franja concedida a FP.`;
            syncItemToServer('reserva', other);
            syncToGoogleSheets('save_reserva', other);
          }
        }
      }
    });
  }

  setReservas(reservasArr);

  // Sincronización automática con Servidor Central y Google Sheets
  syncItemToServer('reserva', finalReserva);
  syncToGoogleSheets('save_reserva', finalReserva);

  return {
    success: true,
    reserva: finalReserva,
    conflict: hasApprovedOverlap,
    message: nuevoEstado === 'APROBADA'
      ? "¡Reserva P1 (FP / Prueba técnica) aprobada automáticamente en el calendario!"
      : hasApprovedOverlap
        ? "Solicitud registrada como PENDIENTE con aviso de solapamiento para revisión de Coordinación."
        : "Reserva registrada como PENDIENTE. Requiere aprobación de Administrador o Coordinadores (P2/P3)."
  };
};

/**
 * Niveles oficiales de Formación Profesional y Tecnológica (P1 · Preferente ATECA).
 * Todas estas opciones del Apartado 2 gozan de APROBACIÓN AUTOMÁTICA DIRECTA e inmediata.
 */
export const P1_FP_LEVELS = [
  'Grado Superior FP',
  'Grado Medio FP',
  'FP Básica',
  'Proyecto de Centro de FP',
  'Prueba técnica / Demostración'
];

/**
 * Determina si una reserva tiene Aprobación Automática Directa (P1 de FP).
 * Criterio oficial del centro:
 * 1. El docente debe pertenecer a un departamento oficial de FP (Administración y Gestión, Comercio o FOL).
 * 2. El nivel seleccionado debe ser estrictamente un ciclo o actividad de FP (P1).
 * Si el docente pertenece a otro departamento, o si el docente de FP selecciona Bachillerato o ESO,
 * la reserva pasa automáticamente a estado PENDIENTE (P2/P3) para revisión de Coordinación o Administración.
 */
export const isFpBooking = (reserva: Partial<Reserva>, userDept?: string): boolean => {
  const dept = (reserva.departamento || userDept || '').trim();

  // 1. El departamento del docente debe ser obligatoriamente de ciclos de FP
  if (!isFpDepartment(dept)) {
    return false;
  }

  const nivel = (reserva.nivel || '').trim();
  const upper = nivel.toUpperCase();

  // 2. Exclusión estricta de P2 (No FP) y P3 (Bachillerato, ESO)
  if (
    upper.includes('NO FP') ||
    upper.includes('NO-FP') ||
    upper.includes('BACHILLERATO') ||
    upper.includes('ESO')
  ) {
    return false;
  }

  // 3. Coincidencia exacta con las opciones P1 del selector de Nivel
  if (P1_FP_LEVELS.some(p1 => p1.toLowerCase() === nivel.toLowerCase())) {
    return true;
  }

  // 4. Coincidencia con variantes descriptivas de P1
  if (
    upper.includes('GRADO SUPERIOR') ||
    upper.includes('GRADO MEDIO') ||
    upper.includes('FP BÁSICA') ||
    upper.includes('FP BASICA') ||
    upper.includes('PROYECTO DE CENTRO DE FP') ||
    upper.includes('PRUEBA TÉCNICA') ||
    upper.includes('PRUEBA TECNICA') ||
    upper.includes('DEMOSTRACIÓN') ||
    upper.includes('DEMOSTRACION')
  ) {
    return true;
  }

  return false;
};

export const checkTimeOverlap = (start1: string, end1: string, start2: string, end2: string): boolean => {
  const [h1s, m1s] = start1.split(':').map(Number);
  const [h1e, m1e] = end1.split(':').map(Number);
  const [h2s, m2s] = start2.split(':').map(Number);
  const [h2e, m2e] = end2.split(':').map(Number);

  const t1s = h1s * 60 + m1s;
  const t1e = h1e * 60 + m1e;
  const t2s = h2s * 60 + m2s;
  const t2e = h2e * 60 + m2e;

  return t1s < t2e && t2s < t1e;
};

// Add or edit valuation
export const saveValoracion = (val: Omit<Valoracion, 'id_valoracion' | 'fecha_valoracion'>): Valoracion => {
  const vals = getValoraciones();
  const existingIdx = vals.findIndex(v => v.id_reserva === val.id_reserva);

  const fecha_valoracion = formatDateToYMD();

  if (existingIdx >= 0) {
    const updated = {
      ...vals[existingIdx],
      ...val,
      fecha_valoracion,
    };
    vals[existingIdx] = updated;
    setValoraciones(vals);

    // Turn reservation to REALIZADA if valorated
    updateReservaEstado(val.id_reserva, 'REALIZADA');

    syncItemToServer('valoracion', updated);
    syncToGoogleSheets('save_valoracion', updated);

    return updated;
  } else {
    const newId = generateUniqueId('val');
    const newVal: Valoracion = {
      ...val,
      id_valoracion: newId,
      fecha_valoracion,
    };
    vals.push(newVal);
    setValoraciones(vals);

    // Turn reservation to REALIZADA if valorated
    updateReservaEstado(val.id_reserva, 'REALIZADA');

    syncItemToServer('valoracion', newVal);
    syncToGoogleSheets('save_valoracion', newVal);

    return newVal;
  }
};

export const updateReservaEstado = (reservaId: string, nuevoEstado: 'PENDIENTE' | 'APROBADA' | 'RECHAZADA' | 'CANCELADA' | 'REALIZADA', observaciones?: string) => {
  const arr = getReservas();
  const idx = arr.findIndex(r => r.id_reserva === reservaId);
  if (idx >= 0) {
    arr[idx].estado = nuevoEstado;
    if (observaciones !== undefined) {
      arr[idx].observaciones_coordinador = observaciones;
    }

    // Si la reserva es aprobada por administración o coordinación, comprobar si desplaza reservas en standby
    if (nuevoEstado === 'APROBADA') {
      const approved = arr[idx];
      arr.forEach((other, oIdx) => {
        if (oIdx !== idx && other.estado === 'PENDIENTE' && other.fecha_actividad === approved.fecha_actividad) {
          if (checkTimeOverlap(other.hora_inicio, other.hora_fin, approved.hora_inicio, approved.hora_fin)) {
            if (other.en_standby_por_no_confirmar) {
              other.observaciones_coordinador = `Desplazada por decisión administrativa: franja horaria reasignada a ${approved.profesor} (${approved.modulo_materia_area} - ${approved.grupo}).`;
              syncItemToServer('reserva', other);
              syncToGoogleSheets('save_reserva', other);
            }
          }
        }
      });
    }

    setReservas(arr);
    syncItemToServer('reserva', arr[idx]);
    syncToGoogleSheets('save_reserva', arr[idx]);
  }
};

// Update entire reservation (for editing own bookings)
export const updateReserva = (reserva: Reserva): { success: boolean; message?: string } => {
  const arr = getReservas();
  const idx = arr.findIndex(r => r.id_reserva === reserva.id_reserva);
  if (idx < 0) return { success: false, message: 'Reserva no encontrada.' };

  // Check if non-working day
  const nonWorking = isNonWorkingDay(reserva.fecha_actividad);
  if (nonWorking.isNonWorking) {
    return {
      success: false,
      message: `No se pueden programar reservas en días no lectivos: ${nonWorking.reason}.`
    };
  }

  // Check lockout blocks
  const bloqueosArr = getBloqueos();
  const hasBlock = bloqueosArr.some(b => {
    if (b.fecha !== reserva.fecha_actividad) return false;
    return checkTimeOverlap(b.hora_inicio, b.hora_fin, reserva.hora_inicio, reserva.hora_fin);
  });

  if (hasBlock) {
    return {
      success: false,
      message: "Conflicto: El aula se encuentra bloqueada por mantenimiento en este horario."
    };
  }

  // Si la reserva editada corresponde a nivel P1 de Formación Profesional, queda automáticamente APROBADA.
  // Si corresponde a P2 (Proyecto No FP) o P3 (Bachillerato/ESO), pasa a PENDIENTE para revisión de Coordinación o Administración.
  const isFP = isFpBooking(reserva);
  const nuevoEstado = isFP ? 'APROBADA' : 'PENDIENTE';
  const updatedReserva: Reserva = {
    ...arr[idx],
    ...reserva,
    numero_alumnos: Math.min(12, Math.max(1, Number(reserva.numero_alumnos) || 1)),
    estado: nuevoEstado,
    observaciones_coordinador: isFP
      ? 'Aprobada automáticamente por nivel P1 de Formación Profesional (FP / Prueba técnica).'
      : (reserva.observaciones_coordinador || 'Reserva registrada como PENDIENTE. Requiere aprobación de Administrador o Coordinadores (Nivel P2/P3).'),
  };

  arr[idx] = updatedReserva;
  setReservas(arr);
  syncItemToServer('reserva', arr[idx]);
  syncToGoogleSheets('save_reserva', arr[idx]);
  return { success: true };
};

// Permanently remove reservation (leaves slot free for other teachers)
export const deleteReserva = (id_reserva: string): boolean => {
  markReservaAsDeleted(id_reserva);
  const arr = getReservas();
  const filtered = arr.filter(r => r.id_reserva !== id_reserva);
  setReservas(filtered);
  deleteItemFromServer('reserva', id_reserva);
  return true;
};

// Cancel reservation keeping historical trace
export const cancelReserva = (id_reserva: string, motivo?: string): boolean => {
  const arr = getReservas();
  const idx = arr.findIndex(r => r.id_reserva === id_reserva);
  if (idx >= 0) {
    arr[idx].estado = 'CANCELADA';
    if (motivo) {
      arr[idx].observaciones_coordinador = `Cancelada: ${motivo}`;
    }
    setReservas(arr);
    syncItemToServer('reserva', arr[idx]);
    syncToGoogleSheets('save_reserva', arr[idx]);
    return true;
  }
  return false;
};

// Update user settings (ADMIN)
export const modifyUsuario = (userId: string, updates: Partial<Usuario>) => {
  const users = getUsuarios();
  const idx = users.findIndex(u => u.id_usuario === userId);
  if (idx >= 0) {
    users[idx] = { ...users[idx], ...updates };
    setUsuarios(users);

    // Si el usuario modificado es el usuario actualmente en sesión, actualizar de inmediato su sesión activa
    const current = getCurrentUser();
    if (current && (current.id_usuario === userId || current.email.toLowerCase() === users[idx].email.toLowerCase())) {
      setCurrentUser(users[idx]);
    }
    syncItemToServer('usuario', users[idx]);
    syncToGoogleSheets('save_usuario', users[idx]);
  }
};

/**
 * Elimina definitivamente y por completo a un usuario y todos sus registros asociados
 * (reservas, valoraciones, memorias y códigos de acceso), limpiando la base de datos de usuarios.
 * Salvaguarda: No permite eliminar al Administrador Principal del centro.
 */
export const deleteUserCompletely = (userIdOrEmail: string): { success: boolean; message: string; deletedBookingsCount?: number } => {
  const cleanTarget = userIdOrEmail.trim().toLowerCase();
  const users = getUsuarios();

  const user = users.find(u => u.id_usuario === cleanTarget || u.email.trim().toLowerCase() === cleanTarget);
  if (!user) {
    return { success: false, message: 'Usuario no encontrado en la plataforma.' };
  }

  const userEmail = user.email.trim().toLowerCase();
  const userId = user.id_usuario;

  // Salvaguarda de seguridad institucional: Prohibido eliminar la cuenta de administración principal del centro
  if (
    userEmail === 'jpacdia@gobiernodecanarias.org' ||
    userEmail === 'jpadiaz@gobiernodecanarias.org' ||
    userId === 'u-1'
  ) {
    return {
      success: false,
      message: 'Operación denegada: No se puede eliminar la cuenta principal de Administración del centro.'
    };
  }

  // 1. Purgar al usuario de la lista de usuarios
  const newUsers = users.filter(u => u.id_usuario !== userId && u.email.trim().toLowerCase() !== userEmail);
  setUsuarios(newUsers);

  // 2. Purgar todas sus reservas asociadas
  const allReservas = getReservas();
  const deletedReservaIds: string[] = [];
  const remainingReservas = allReservas.filter(r => {
    if (r.email.trim().toLowerCase() === userEmail) {
      if (r.id_reserva) {
        deletedReservaIds.push(r.id_reserva);
        markReservaAsDeleted(r.id_reserva);
      }
      return false;
    }
    return true;
  });
  setReservas(remainingReservas);

  // 3. Purgar valoraciones asociadas a las reservas del usuario
  const allVals = getValoraciones();
  const remainingVals = allVals.filter(v => {
    return !deletedReservaIds.includes(v.id_reserva);
  });
  setValoraciones(remainingVals);

  // 4. Si el usuario eliminado era el actualmente logueado (caso extremo), desloguear
  const cur = getCurrentUser();
  if (cur && (cur.id_usuario === userId || cur.email.trim().toLowerCase() === userEmail)) {
    setCurrentUser(null);
  }

  // 5. Notificar al servidor central para persistencia atómica en disco y borrado en auth_codes.json
  deleteItemFromServer('usuario_completo', userId, { email: userEmail, id_usuario: userId });

  return {
    success: true,
    message: `El usuario ${user.nombre} (${userEmail}) y todos sus registros (${deletedReservaIds.length} reserva(s)) han sido eliminados definitivamente del sistema.`,
    deletedBookingsCount: deletedReservaIds.length
  };
};

// Delete user (ADMIN)
export const deleteUsuario = (userId: string): boolean => {
  return deleteUserCompletely(userId).success;
};

// Add user
export const addUsuario = (user: Omit<Usuario, 'id_usuario'>): Usuario => {
  const users = getUsuarios();
  const id_usuario = generateUniqueId('u');
  const newUsr: Usuario = { ...user, id_usuario };
  users.push(newUsr);
  setUsuarios(users);
  syncItemToServer('usuario', newUsr);
  syncToGoogleSheets('save_usuario', newUsr);
  return newUsr;
};

// Add block
export const addBloqueo = (bloq: Omit<Bloqueo, 'id_bloqueo'>): Bloqueo => {
  const bloqs = getBloqueos();
  const id_bloqueo = generateUniqueId('bloq');
  const newB: Bloqueo = { ...bloq, id_bloqueo };
  bloqs.unshift(newB);
  setBloqueos(bloqs);
  syncItemToServer('bloqueo', newB);
  syncToGoogleSheets('save_bloqueo', newB);
  return newB;
};

// Delete block
export const removeBloqueo = (blockId: string) => {
  const bloqs = getBloqueos();
  const filtered = bloqs.filter(b => b.id_bloqueo !== blockId);
  setBloqueos(filtered);
  deleteItemFromServer('bloqueo', blockId);
  syncToGoogleSheets('delete_bloqueo', blockId);
};

/**
 * Comprueba si una fecha y hora de fin ya han vencido respecto a la hora actual
 */
export const hasBookingConcluded = (fecha_actividad: string, hora_fin: string): boolean => {
  try {
    const now = new Date();
    const [year, month, day] = fecha_actividad.split('-').map(Number);
    const [hours, minutes] = hora_fin.split(':').map(Number);
    const bookingEnd = new Date(year, month - 1, day, hours, minutes, 0);
    return now.getTime() >= bookingEnd.getTime();
  } catch {
    return false;
  }
};

const SENT_VALUATION_REMINDERS_KEY = 'ateca_sent_valuation_reminders';

export const getSentValuationReminderIds = (): Set<string> => {
  try {
    const raw = localStorage.getItem(SENT_VALUATION_REMINDERS_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
};

export const markValuationReminderSent = (id_reserva: string) => {
  const set = getSentValuationReminderIds();
  set.add(id_reserva);
  const arr = Array.from(set).slice(-200);
  localStorage.setItem(SENT_VALUATION_REMINDERS_KEY, JSON.stringify(arr));
};

/**
 * Revisa reservas que han concluido según horario oficial y no tienen valoración.
 * Actualiza el estado a REALIZADA si estaba APROBADA y envía recordatorio por correo al docente.
 */
export const checkAndTriggerValuationReminders = async (): Promise<boolean> => {
  const reservas = getReservas();
  const valoraciones = getValoraciones();
  const users = getUsuarios();
  const sentReminders = getSentValuationReminderIds();

  let modified = false;

  for (const r of reservas) {
    if (r.estado !== 'APROBADA' && r.estado !== 'REALIZADA') continue;

    const hasVal = valoraciones.some(v => v.id_reserva === r.id_reserva);
    if (hasVal) continue;

    if (hasBookingConcluded(r.fecha_actividad, r.hora_fin)) {
      if (r.estado === 'APROBADA') {
        updateReservaEstado(
          r.id_reserva,
          'REALIZADA',
          'Sesión lectiva finalizada según horario oficial. Pendiente de cumplimentar memoria didáctica.'
        );
        modified = true;
      }

      if (!sentReminders.has(r.id_reserva)) {
        markValuationReminderSent(r.id_reserva);
        const teacher = users.find(u => u.email.toLowerCase() === r.email.toLowerCase()) || {
          id_usuario: 'docente',
          nombre: r.profesor,
          email: r.email,
          rol: 'PROFESOR' as const,
          departamento: r.departamento,
          turno: 'Ambos' as const,
          activo: true,
        };

        try {
          const { notifyRecordatorioValoracion } = await import('./emailService');
          await notifyRecordatorioValoracion(r, teacher);
        } catch (err) {
          console.warn('No se pudo enviar recordatorio de valoración:', err);
        }
      }
    }
  }

  return modified;
};

/**
 * Devuelve la fecha del lunes correspondiente a la semana de una fecha dada (YYYY-MM-DD)
 */
export const getMondayOfWeek = (dateStr: string): string => {
  try {
    const parts = dateStr.split('-');
    const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    const day = d.getDay(); // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const date = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${date}`;
  } catch {
    return dateStr;
  }
};

const SENT_WEEKLY_REMINDERS_KEY = 'ateca_sent_weekly_reminders';

export const getSentWeeklyReminderIds = (): Set<string> => {
  try {
    const raw = localStorage.getItem(SENT_WEEKLY_REMINDERS_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
};

export const markWeeklyReminderSent = (id_reserva: string) => {
  const set = getSentWeeklyReminderIds();
  set.add(id_reserva);
  const arr = Array.from(set).slice(-200);
  localStorage.setItem(SENT_WEEKLY_REMINDERS_KEY, JSON.stringify(arr));
};

/**
 * Determina si una reserva es elegible para el recordatorio semanal preventivo (lunes 08:00 AM)
 * Reglas:
 * 1. Estado APROBADA
 * 2. No haber sido notificada previamente de forma semanal
 * 3. Creada con antelación previa a la semana de la actividad (fecha_creacion < lunes_semana_actividad)
 * 4. La fecha/hora actual es >= al lunes de la semana de la actividad a las 08:00 AM
 * 5. La actividad aún no ha comenzado (no está en el pasado)
 */
export const isWeeklyReminderDue = (reserva: Reserva, now = new Date()): boolean => {
  if (reserva.estado !== 'APROBADA') return false;
  if (reserva.recordatorio_semanal_enviado) return false;

  const sentSet = getSentWeeklyReminderIds();
  if (sentSet.has(reserva.id_reserva)) return false;

  const mondayOfActivity = getMondayOfWeek(reserva.fecha_actividad);

  // Comprobar que fue creada antes del lunes de la semana lectiva de la reserva
  const fechaCreacion = reserva.fecha_creacion || (reserva as any).created_at?.slice(0, 10);
  if (fechaCreacion && fechaCreacion >= mondayOfActivity) {
    // Si se creó durante la misma semana de la actividad, no aplica aviso semanal
    return false;
  }

  // Comprobar momento actual
  const todayStr = formatDateToYMD(now);
  const currentHours = String(now.getHours()).padStart(2, '0');
  const currentMinutes = String(now.getMinutes()).padStart(2, '0');
  const currentTime = `${currentHours}:${currentMinutes}`;

  // Si hoy es anterior al lunes de la semana, todavía no toca
  if (todayStr < mondayOfActivity) return false;

  // Si hoy es el mismo lunes, debe ser a partir de las 08:00
  if (todayStr === mondayOfActivity && currentTime < '08:00') return false;

  // Comprobar que la actividad no haya pasado ni haya empezado
  if (todayStr > reserva.fecha_actividad) return false;
  if (todayStr === reserva.fecha_actividad && currentTime >= reserva.hora_inicio) return false;

  return true;
};

/**
 * Escanea reservas autorizadas y envía el recordatorio semanal preventivo con confirmación/liberación
 */
export const checkAndTriggerWeeklyReminders = async (): Promise<boolean> => {
  const reservas = getReservas();
  const users = getUsuarios();
  let modified = false;

  for (const r of reservas) {
    if (isWeeklyReminderDue(r)) {
      r.recordatorio_semanal_enviado = true;
      r.fecha_recordatorio_semanal = new Date().toISOString();
      markWeeklyReminderSent(r.id_reserva);
      modified = true;

      const teacher = users.find(u => u.email.toLowerCase() === r.email.toLowerCase()) || {
        id_usuario: 'docente',
        nombre: r.profesor,
        email: r.email,
        rol: 'PROFESOR' as const,
        departamento: r.departamento,
        turno: 'Ambos' as const,
        activo: true,
      };

      try {
        const { notifyRecordatorioSemanalConfirmacion } = await import('./emailService');
        await notifyRecordatorioSemanalConfirmacion(r, teacher);
      } catch (err) {
        console.warn('No se pudo enviar recordatorio semanal preventivo:', err);
      }

      // Sincronizar actualización de la reserva
      syncItemToServer('reserva', r);
    }
  }

  if (modified) {
    setReservas(reservas);
  }

  return modified;
};

/**
 * 48 Horas de espera tras el recordatorio semanal:
 * Si el docente no confirma su asistencia en 48 horas desde el envío del recordatorio semanal,
 * la reserva pasa automáticamente a estado 'PENDIENTE' (Standby).
 * La franja horaria queda libre para que la Administración o Coordinación pueda reasignarla
 * a otra solicitud (por ejemplo, con prioridad FP o necesidad justificada), desplazando la reserva no confirmada.
 */
export const checkAndTriggerStandbyReservas = async (): Promise<boolean> => {
  const reservas = getReservas();
  const users = getUsuarios();
  let modified = false;
  const now = Date.now();
  const FORTY_EIGHT_HOURS_MS = 48 * 60 * 60 * 1000;

  for (const r of reservas) {
    // Aplica a reservas autorizadas que recibieron el recordatorio semanal y NO han sido confirmadas
    if (
      r.estado === 'APROBADA' &&
      r.recordatorio_semanal_enviado &&
      !r.confirmada_por_docente &&
      r.fecha_recordatorio_semanal
    ) {
      const sentTime = new Date(r.fecha_recordatorio_semanal).getTime();
      if (!isNaN(sentTime) && (now - sentTime >= FORTY_EIGHT_HOURS_MS)) {
        // Solo si la actividad aún no ha concluido
        if (!hasBookingConcluded(r.fecha_actividad, r.hora_fin)) {
          r.estado = 'PENDIENTE';
          r.en_standby_por_no_confirmar = true;
          r.fecha_pase_a_standby = new Date().toISOString();
          const motivoStandby = 'Pase a STANDBY (PENDIENTE): No confirmada en 48h tras el recordatorio semanal. Franja disponible para reasignación o desplazamiento.';
          r.observaciones_coordinador = r.observaciones_coordinador 
            ? `${r.observaciones_coordinador} | ${motivoStandby}`
            : motivoStandby;
          
          modified = true;

          const teacher = users.find(u => u.email.toLowerCase() === r.email.toLowerCase()) || {
            id_usuario: 'docente',
            nombre: r.profesor,
            email: r.email,
            rol: 'PROFESOR' as const,
            departamento: r.departamento,
            turno: 'Ambos' as const,
            activo: true,
          };

          try {
            const { notifyReservaStandbyAdmin, notifyReservaStandbyDocente } = await import('./emailService');
            await notifyReservaStandbyAdmin(r);
            await notifyReservaStandbyDocente(r, teacher);
          } catch (err) {
            console.warn('Error al notificar pase a standby de reserva:', err);
          }

          syncItemToServer('reserva', r);
          syncToGoogleSheets('save_reserva', r);
        }
      }
    }
  }

  if (modified) {
    setReservas(reservas);
  }

  return modified;
};

/**
 * Confirmación expresa de asistencia por parte del docente
 */
export const confirmReservaDocente = (id_reserva: string): { success: boolean; message: string } => {
  const arr = getReservas();
  const idx = arr.findIndex(r => r.id_reserva === id_reserva);
  if (idx >= 0) {
    const res = arr[idx];

    // Verificar si la franja ya fue ocupada por otra reserva autorizada durante el standby
    const isOccupied = arr.some((other, oIdx) => {
      if (oIdx === idx) return false;
      if (other.estado !== 'APROBADA' && other.estado !== 'REALIZADA') return false;
      if (other.fecha_actividad !== res.fecha_actividad) return false;
      return checkTimeOverlap(other.hora_inicio, other.hora_fin, res.hora_inicio, res.hora_fin);
    });

    if (isOccupied && res.estado === 'PENDIENTE') {
      return {
        success: false,
        message: 'No es posible confirmar: la franja horaria ya ha sido reasignada a otra solicitud tras expirar las 48h de reserva.'
      };
    }

    res.confirmada_por_docente = true;
    // Si estaba en standby y la franja sigue libre, reactivar a APROBADA
    if (res.en_standby_por_no_confirmar && res.estado === 'PENDIENTE') {
      res.estado = 'APROBADA';
      res.observaciones_coordinador = (res.observaciones_coordinador || '') + ' | Asistencia confirmada por el docente tras standby. Reserva reactivada.';
    }

    setReservas(arr);
    syncItemToServer('reserva', res);
    syncToGoogleSheets('save_reserva', res);
    return {
      success: true,
      message: '¡Asistencia confirmada con éxito! Tu reserva se mantiene activa en el Aula ATECA.'
    };
  }
  return { success: false, message: 'Reserva no encontrada.' };
};

/**
 * Comprueba si un docente cuenta con la acreditación de competencias básicas del Aula ATECA
 */
export const isTeacherAccredited = (emailOrName?: string): boolean => {
  if (!emailOrName) return false;
  const users = getUsuarios();
  const lower = emailOrName.trim().toLowerCase();
  const u = users.find(usr => 
    usr.email.toLowerCase() === lower || 
    usr.nombre.toLowerCase() === lower
  );
  return Boolean(u?.formacion_competencias);
};

/**
 * Conmuta el estado de acreditación de competencias básicas de un usuario (Admin y Coordinación)
 */
export const toggleUserCompetencias = (userId: string): boolean => {
  const users = getUsuarios();
  const u = users.find(usr => usr.id_usuario === userId);
  if (!u) return false;
  const nextVal = !u.formacion_competencias;
  modifyUsuario(userId, { formacion_competencias: nextVal });
  return nextVal;
};

