/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Usuario, Reserva, Valoracion, Bloqueo, ConfigItem, DiaNoHabil } from '../types';

// Pre-seeded configuration data
const DEFAULT_CONFIG: Record<string, string> = {
  nombre_centro: "IES Blas Cabrera Felipe",
  nombre_aula: "Aula ATECA Innovación",
  horario_inicio: "08:00",
  horario_fin: "22:30",
  duracion_minima_reserva: "30",
  duracion_maxima_reserva: "360",
  email_coordinador: "coordinador.ateca@centro.edu",
  logo_centro: "", // Optional Base64 or URL logo
};

// Pre-seeded users
const DEFAULT_USERS: Usuario[] = [
  {
    id_usuario: "u-1",
    nombre: "José Díaz",
    email: "josedpdiaz@gmail.com", // User's email from metadata to auto-login as Admin!
    rol: "ADMIN",
    departamento: "Informática",
    turno: "Ambos",
    activo: true,
  },
  {
    id_usuario: "u-2",
    nombre: "María González",
    email: "m.gonzalez@centro.edu",
    rol: "COORDINADOR",
    departamento: "Tecnología",
    turno: "Mañana",
    activo: true,
  },
  {
    id_usuario: "u-3",
    nombre: "Juan Santana",
    email: "j.santana@centro.edu",
    rol: "PROFESOR",
    departamento: "Electricidad",
    turno: "Ambos",
    activo: true,
  },
  {
    id_usuario: "u-4",
    nombre: "Laura Pérez",
    email: "l.perez@centro.edu",
    rol: "PROFESOR",
    departamento: "Administración",
    turno: "Tarde-Noche",
    activo: true,
  },
  {
    id_usuario: "u-5",
    nombre: "Pedro Ramírez",
    email: "p.ramirez@centro.edu",
    rol: "PROFESOR",
    departamento: "Sanidad",
    turno: "Mañana",
    activo: false, // Inactive
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
  if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) {
    // Auto login as user u-1 (José Díaz, ADMIN) because of the email in additional metadata!
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(DEFAULT_USERS[0]));
  }

  // Limpieza inicial para fase de pruebas / producción sin datos mock
  if (localStorage.getItem('ateca_production_clean_v122') !== 'true') {
    localStorage.setItem(STORAGE_KEYS.RESERVAS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.VALORACIONES, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.BLOQUEOS, JSON.stringify([]));
    localStorage.setItem('ateca_production_clean_v122', 'true');
  }

  // PURGA INMEDIATA: Elimina cualquier tarea, reserva o bloqueo que se encuentre en sábado o domingo
  purgeWeekendTasks();
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
  const users = getUsuarios();
  const emailLower = email.trim().toLowerCase();
  const user = users.find(u => u.email.trim().toLowerCase() === emailLower);

  if (!user) {
    // Default fallback: create an active PROFESOR if email is entered
    const defaultUser: Usuario = {
      id_usuario: generateUniqueId('u'),
      nombre: emailSplitName(email),
      email: email.trim(),
      rol: 'PROFESOR',
      departamento: "General",
      turno: "Ambos",
      activo: true,
    };
    const newUsersList = [...users, defaultUser];
    setUsuarios(newUsersList);
    setCurrentUser(defaultUser);
    return { success: true, user: defaultUser };
  }

  if (!user.activo) {
    return { success: false, error: "Tu usuario existe pero se encuentra DESACTIVADO. Contacta con el administrador." };
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

  const nuevoEstado = 'PENDIENTE';

  const finalReserva: Reserva = {
    ...reserva,
    id_reserva,
    fecha_creacion,
    estado: nuevoEstado,
    observaciones_coordinador: hasApprovedOverlap 
      ? 'Aviso: Solapamiento potencial con reserva aprobada preexistente. Pendiente de resolución por Coordinación.'
      : 'Reserva pendiente de revisión por el Coordinador.',
  };

  reservasArr.unshift(finalReserva); // put on top
  setReservas(reservasArr);

  return {
    success: true,
    reserva: finalReserva,
    conflict: hasApprovedOverlap,
    message: hasApprovedOverlap
      ? "Solicitud registrada como PENDIENTE con aviso de solapamiento para revisión de Coordinación."
      : "Reserva creada de forma PENDIENTE. Un coordinador revisará la solicitud."
  };
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
    setReservas(arr);
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

  arr[idx] = { ...arr[idx], ...reserva };
  setReservas(arr);
  return { success: true };
};

// Permanently remove reservation (leaves slot free for other teachers)
export const deleteReserva = (id_reserva: string): boolean => {
  const arr = getReservas();
  const filtered = arr.filter(r => r.id_reserva !== id_reserva);
  setReservas(filtered);
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
  }
};

// Add user
export const addUsuario = (user: Omit<Usuario, 'id_usuario'>): Usuario => {
  const users = getUsuarios();
  const id_usuario = generateUniqueId('u');
  const newUsr: Usuario = { ...user, id_usuario };
  users.push(newUsr);
  setUsuarios(users);
  return newUsr;
};

// Add block
export const addBloqueo = (bloq: Omit<Bloqueo, 'id_bloqueo'>): Bloqueo => {
  const bloqs = getBloqueos();
  const id_bloqueo = generateUniqueId('bloq');
  const newB: Bloqueo = { ...bloq, id_bloqueo };
  bloqs.unshift(newB);
  setBloqueos(bloqs);
  return newB;
};

// Delete block
export const removeBloqueo = (blockId: string) => {
  const bloqs = getBloqueos();
  const filtered = bloqs.filter(b => b.id_bloqueo !== blockId);
  setBloqueos(filtered);
};
