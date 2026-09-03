/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Usuario, Reserva, Valoracion, Bloqueo, ConfigItem } from '../types';

// Pre-seeded configuration data
const DEFAULT_CONFIG: Record<string, string> = {
  nombre_centro: "IES Blas Cabrera Felipe",
  nombre_aula: "Aula ATECA Innovación",
  horario_inicio: "08:00",
  horario_fin: "21:00",
  duracion_minima_reserva: "30",
  duracion_maxima_reserva: "360",
  email_coordinador: "coordinador.ateca@centro.edu",
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
    turno: "Tarde",
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

// Helper to get dates relative to today
const getRelativeDateStr = (offsetDays: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return formatDateToYMD(d);
};

// Pre-seeded reservations
const DEFAULT_RESERVAS: Reserva[] = [
  {
    id_reserva: "res-1",
    fecha_creacion: "2026-05-20",
    profesor: "Juan Santana",
    email: "j.santana@centro.edu",
    departamento: "Electricidad",
    nivel: "Grado Superior FP",
    grupo: "2º Sistemas Electrotécnicos",
    modulo_materia_area: "Sistemas Inteligentes",
    fecha_actividad: getRelativeDateStr(-2), // 2 days ago
    hora_inicio: "09:00",
    hora_fin: "11:30",
    zona_principal: "Realidad virtual y simuladores",
    numero_alumnos: 18,
    objetivo_didactico: "Comprobar el despliegue del software de simulación eléctrica en VR.",
    descripcion_actividad: "Los estudiantes simularán una avería en un cuadro de alta tensión utilizando gafas Meta Quest y el simulador de subestaciones.",
    recursos_necesarios: "Gafas VR (x5) y cargadores.",
    necesita_apoyo: true,
    prioridad: "ALTA",
    estado: "REALIZADA",
    observaciones_coordinador: "Uso correcto del aula didáctica de realidad virtual autónoma.",
  },
  {
    id_reserva: "res-2",
    fecha_creacion: "2026-05-22",
    profesor: "Laura Pérez",
    email: "l.perez@centro.edu",
    departamento: "Administración",
    nivel: "Grado Medio FP",
    grupo: "1º Gestión Administrativa",
    modulo_materia_area: "Comunicación Empresarial",
    fecha_actividad: getRelativeDateStr(-1), // Yesterday
    hora_inicio: "15:00",
    hora_fin: "17:00",
    zona_principal: "Multimedia",
    numero_alumnos: 22,
    objetivo_didactico: "Grabar una presentación empresarial interactiva.",
    descripcion_actividad: "Los alumnos expondrán su proyecto de empresa simulada en el croma del Aula ATECA y grabarán su elevator pitch.",
    recursos_necesarios: "Cámara, focos, micrófono corbata y panel croma.",
    necesita_apoyo: false,
    prioridad: "ALTA",
    estado: "REALIZADA",
    observaciones_coordinador: "Recuerda limpiar el material al finalizar.",
  },
  {
    id_reserva: "res-3",
    fecha_creacion: "2026-05-28",
    profesor: "Juan Santana",
    email: "j.santana@centro.edu",
    departamento: "Electricidad",
    nivel: "Grado Superior FP",
    grupo: "2º Sistemas Electrotécnicos",
    modulo_materia_area: "Automatización Industrial",
    fecha_actividad: getRelativeDateStr(2), // 2 days is in the future
    hora_inicio: "11:30",
    hora_fin: "14:00",
    zona_principal: "Impresión 3D",
    numero_alumnos: 15,
    objetivo_didactico: "Diseñar e imprimir cajas para PLCs.",
    descripcion_actividad: "Sesión de impresión rápida de maquetas y carcasas protectoras para los relés lógicos utilizando Cura y las impresoras PLA del aula Ateca.",
    recursos_necesarios: "Filamento PLA negro, laca, software Cura preinstalado.",
    necesita_apoyo: false,
    prioridad: "ALTA",
    estado: "APROBADA",
    observaciones_coordinador: "Aprobada por prioridad de FP. Recuerde que hay filamento disponible en el almacén B.",
  },
  {
    id_reserva: "res-4",
    fecha_creacion: "2026-05-29",
    profesor: "José Díaz",
    email: "josedpdiaz@gmail.com",
    departamento: "Informática",
    nivel: "Grado Superior FP",
    grupo: "1º ASIR",
    modulo_materia_area: "Planificación de Redes",
    fecha_actividad: getRelativeDateStr(4), // 4 days in future
    hora_inicio: "08:30",
    hora_fin: "11:00",
    zona_principal: "Vídeo y audio",
    numero_alumnos: 20,
    objetivo_didactico: "Podcast técnico de ciberseguridad.",
    descripcion_actividad: "Grabación conjunta por equipos de un podcast técnico explicando vulnerabilidades y remediaciones. Uso de mesa de mezclas Rodecaster y micrófonos Shure.",
    recursos_necesarios: "Estación de podcasting, mesa Rodecaster, Audacity.",
    necesita_apoyo: true,
    prioridad: "ALTA",
    estado: "PENDIENTE",
    observaciones_coordinador: "",
  },
  {
    id_reserva: "res-5",
    fecha_creacion: "2026-05-26",
    profesor: "Laura Pérez",
    email: "l.perez@centro.edu",
    departamento: "Administración",
    nivel: "Bachillerato",
    grupo: "2º Bachillerato A",
    modulo_materia_area: "Tecnología Industrial II",
    fecha_actividad: getRelativeDateStr(1), // Tomorrow
    hora_inicio: "11:30",
    hora_fin: "13:30",
    zona_principal: "Realidad virtual y simuladores",
    numero_alumnos: 24,
    objetivo_didactico: "Simulación de brazos mecánicos industriales.",
    descripcion_actividad: "Exhibición virtual interactiva de aerogeneradores y brazos robóticos.",
    recursos_necesarios: "Gafas VR.",
    necesita_apoyo: false,
    prioridad: "NORMAL",
    estado: "PENDIENTE",
    observaciones_coordinador: "",
  },
  {
    id_reserva: "res-6",
    fecha_creacion: "2026-05-25",
    profesor: "María González",
    email: "m.gonzalez@centro.edu",
    departamento: "Tecnología",
    nivel: "ESO",
    grupo: "4º ESO B",
    modulo_materia_area: "Tecnología Creativa",
    fecha_actividad: getRelativeDateStr(5), // 5 days in future
    hora_inicio: "12:00",
    hora_fin: "14:00",
    zona_principal: "Multimedia",
    numero_alumnos: 16,
    objetivo_didactico: "Edición de vídeos con DaVinci Resolve.",
    descripcion_actividad: "Introducción a la edición de vídeo no lineal de los proyectos del trimestre en los ordenadores de alta gama del aula.",
    recursos_necesarios: "DaVinci Resolve.",
    necesita_apoyo: false,
    prioridad: "NORMAL",
    estado: "PENDIENTE",
    observaciones_coordinador: "",
  }
];

// Pre-seeded assessments
const DEFAULT_VALORACIONES: Valoracion[] = [
  {
    id_valoracion: "val-1",
    id_reserva: "res-1",
    fecha_valoracion: getRelativeDateStr(-2),
    realizada_como_prevista: true,
    aspectos_positivos: "La inmersión de los alumnos fue elevadísima, entendiendo de forma práctica e hiperrealista los riesgos en subestaciones sin peligro real alguno.",
    dificultades: "Inicialmente dos gafas perdieron el tracking por falta de iluminación a primera hora.",
    evidencias_generadas: "Fotos del grupo de alumnos operando y capturas del software guardadas en Drive.",
    mejoras_futuras: "Asegurarse de encender todas las luces de la sala y calibrar el espacio antes de comenzar.",
    valoracion_general: 5,
    actividad_innovacion: true,
    observaciones_finales: "Actividad excelente que repetiremos el próximo curso académico obligatoriamente.",
  },
  {
    id_valoracion: "val-2",
    id_reserva: "res-2",
    fecha_valoracion: getRelativeDateStr(-1),
    realizada_como_prevista: false,
    aspectos_positivos: "El croma funcionó a la perfección y motivó mucho al alumnado en su oratoria comercial.",
    dificultades: "Faltó tiempo para que los 22 alumnos grabaran su pitch de forma coordinada. Hicimos cola.",
    evidencias_generadas: "5 vídeos editados de 1 minuto subidos al canal de YouTube privado del centro.",
    mejoras_futuras: "Particionar la clase en grupos más definidos para no perder tiempo de espera pasivo.",
    valoracion_general: 4,
    actividad_innovacion: true,
    observaciones_finales: "Se sugiere un cronómetro grande para controlar los tiempos individuales de speech.",
  }
];

// Pre-seeded lockouts
const DEFAULT_BLOQUEOS: Bloqueo[] = [
  {
    id_bloqueo: "bloq-1",
    fecha: getRelativeDateStr(3), // 3 days in future
    hora_inicio: "08:00",
    hora_fin: "11:30",
    motivo: "Mantenimiento preventivo anual impresoras 3D y calibración de Realidad Virtual",
    creado_por: "María González (Coordinadora)",
  },
  {
    id_bloqueo: "bloq-2",
    fecha: getRelativeDateStr(10),
    hora_inicio: "10:00",
    hora_fin: "14:00",
    motivo: "Reunión de Coordinadores de Innovación del Norte de Tenerife",
    creado_por: "José Díaz (Administrador)",
  }
];

const STORAGE_KEYS = {
  USERS: 'ateca_usuarios',
  RESERVAS: 'ateca_reservas',
  VALORACIONES: 'ateca_valoraciones',
  BLOQUEOS: 'ateca_bloqueos',
  CONFIG: 'ateca_config',
  CURRENT_USER: 'ateca_usuario_actual',
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
  if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) {
    // Auto login as user u-1 (José Díaz, ADMIN) because of the email in additional metadata!
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(DEFAULT_USERS[0]));
  }
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
  return safeParse(localStorage.getItem(STORAGE_KEYS.RESERVAS), []);
};

export const getValoraciones = (): Valoracion[] => {
  return safeParse(localStorage.getItem(STORAGE_KEYS.VALORACIONES), []);
};

export const getBloqueos = (): Bloqueo[] => {
  return safeParse(localStorage.getItem(STORAGE_KEYS.BLOQUEOS), []);
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
