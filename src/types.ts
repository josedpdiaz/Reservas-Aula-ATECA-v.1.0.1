/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const APP_VERSION = '1.4.1';

export interface NotificationPreferences {
  reserva_estado: boolean;          // Avisar si la reserva es aprobada o rechazada
  recordatorio_previo: boolean;     // Recordatorio 24h antes del uso del aula
  recordatorio_semanal?: boolean;   // Recordatorio semanal preventivo (lunes 08:00) con confirmación/liberación
  recordatorio_valoracion: boolean; // Recordatorio tras la clase para valorar
  nueva_solicitud_coord: boolean;   // (Coordinación) Aviso de nueva solicitud
  reserva_liberada_coord: boolean;  // (Coordinación) Aviso de aula liberada/cancelada
  alerta_bloqueo: boolean;          // Aviso de bloqueo técnico por mantenimiento
  email_alternativo?: string;       // Email alternativo opcional
}

export interface CoordinadorPermisos {
  autorizar_reservas?: boolean; // Permiso para aprobar o rechazar reservas pendientes (defecto: true)
  crear_usuarios?: boolean;     // Permiso para dar de alta nuevos miembros/docentes (defecto: false)
}

export interface Usuario {
  id_usuario: string;
  nombre: string;
  email: string;
  rol: 'PROFESOR' | 'COORDINADOR' | 'ADMIN';
  departamento: string;
  turno: 'Mañana' | 'Tarde' | 'Tarde-Noche' | 'Ambos';
  activo: boolean;
  notificaciones?: NotificationPreferences;
  permisos_coordinador?: CoordinadorPermisos;
  formacion_competencias?: boolean; // Acreditado con competencias básicas ATECA
}

export interface OfficialDepartment {
  id: string;
  name: string;
  isFP: boolean;
  category: 'FP' | 'SECUNDARIA_GENERAL' | 'OTROS';
}

export const DEFAULT_OFFICIAL_DEPARTMENTS: OfficialDepartment[] = [
  // Ciclos Formativos de Formación Profesional (Prioridad P1 · Aprobación Automática)
  { id: 'admon', name: 'Administración y Gestión', isFP: true, category: 'FP' },
  { id: 'pga', name: 'Procesos de Gestión Administrativa', isFP: true, category: 'FP' },
  { id: 'fol', name: 'Formación y Orientación Laboral', isFP: true, category: 'FP' },
  { id: 'comercio', name: 'Comercio', isFP: true, category: 'FP' },

  // Enseñanzas Generales / Secundaria / No FP (Prioridad P2/P3 · Requieren Aprobación)
  { id: 'tecno', name: 'Tecnología', isFP: false, category: 'SECUNDARIA_GENERAL' },
  { id: 'fq', name: 'Física y Química', isFP: false, category: 'SECUNDARIA_GENERAL' },
  { id: 'mates', name: 'Matemáticas', isFP: false, category: 'SECUNDARIA_GENERAL' },
  { id: 'ingles', name: 'Inglés', isFP: false, category: 'SECUNDARIA_GENERAL' },
  { id: 'geohist', name: 'Geografía e Historia', isFP: false, category: 'SECUNDARIA_GENERAL' },
  { id: 'lengua', name: 'Lengua Castellana y Literatura', isFP: false, category: 'SECUNDARIA_GENERAL' },
];

export const OFFICIAL_DEPARTMENTS = DEFAULT_OFFICIAL_DEPARTMENTS;

export const getCustomDepartments = (): OfficialDepartment[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('ateca_custom_departments');
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const saveCustomDepartment = (name: string, isFP: boolean): OfficialDepartment => {
  const cleanName = name.trim().replace(/^departamento\s+(de\s+)?/i, '').trim();
  if (!cleanName) return { id: 'dept-unknown', name: cleanName, isFP, category: isFP ? 'FP' : 'SECUNDARIA_GENERAL' };
  
  const current = getCustomDepartments();
  const existing = current.find(d => d.name.toLowerCase() === cleanName.toLowerCase());
  if (existing) {
    if (existing.isFP !== isFP) {
      existing.isFP = isFP;
      existing.category = isFP ? 'FP' : 'SECUNDARIA_GENERAL';
      localStorage.setItem('ateca_custom_departments', JSON.stringify(current));
    }
    return existing;
  }
  const newDept: OfficialDepartment = {
    id: 'dept-custom-' + Date.now(),
    name: cleanName,
    isFP,
    category: isFP ? 'FP' : 'SECUNDARIA_GENERAL'
  };
  current.push(newDept);
  localStorage.setItem('ateca_custom_departments', JSON.stringify(current));
  return newDept;
};

export const getAllDepartments = (): OfficialDepartment[] => {
  const custom = getCustomDepartments();
  const map = new Map<string, OfficialDepartment>();
  DEFAULT_OFFICIAL_DEPARTMENTS.forEach(d => map.set(d.name.toLowerCase(), d));
  custom.forEach(d => map.set(d.name.toLowerCase(), d));
  return Array.from(map.values());
};

export const isFpDepartment = (departamento?: string): boolean => {
  if (!departamento) return false;
  const deptClean = departamento.trim().replace(/^departamento\s+(de\s+)?/i, '').trim();
  const deptUpper = deptClean.toUpperCase();
  if (
    deptUpper.includes('ADMINISTRACIÓN Y GESTIÓN') ||
    deptUpper.includes('ADMINISTRACION Y GESTION') ||
    deptUpper.includes('PROCESOS DE GESTIÓN ADMINISTRATIVA') ||
    deptUpper.includes('PROCESOS DE GESTION ADMINISTRATIVA') ||
    deptUpper.includes('PGA') ||
    deptUpper.includes('FORMACIÓN Y ORIENTACIÓN LABORAL') ||
    deptUpper.includes('FORMACION Y ORIENTACION LABORAL') ||
    deptUpper.includes('FOL') ||
    deptUpper.includes('COMERCIO') ||
    deptUpper.includes('MANTENIMIENTO')
  ) {
    return true;
  }
  const custom = getCustomDepartments();
  const found = custom.find(c => c.name.toUpperCase() === deptUpper);
  if (found) {
    return found.isFP;
  }
  return false;
};

export type TipoNotificacionEmail = 
  | 'CONFIRMACION_SOLICITUD'
  | 'APROBADA'
  | 'RECHAZADA'
  | 'RECORDATORIO_24H'
  | 'RECORDATORIO_SEMANAL'
  | 'RECORDATORIO_VALORACION'
  | 'RESERVA_STANDBY_ADMIN'
  | 'RESERVA_STANDBY_DOCENTE'
  | 'NUEVA_SOLICITUD_COORD'
  | 'AULA_LIBERADA_COORD'
  | 'BLOQUEO_TECNICO'
  | 'TEST';

export interface EmailLog {
  id: string;
  fecha_hora: string;
  destinatario_email: string;
  destinatario_nombre: string;
  asunto: string;
  cuerpo_html: string;
  cuerpo_texto: string;
  tipo: TipoNotificacionEmail;
  enviado_real: boolean;
  error?: string;
}

export type RolTipo = 'PROFESOR' | 'COORDINADOR' | 'ADMIN';

export type EstadoReserva = 'PENDIENTE' | 'APROBADA' | 'RECHAZADA' | 'CANCELADA' | 'REALIZADA';

export interface Reserva {
  id_reserva: string;
  fecha_creacion: string;
  profesor: string;
  email: string;
  departamento: string;
  nivel: string;
  grupo: string;
  modulo_materia_area: string;
  fecha_actividad: string; // YYYY-MM-DD
  hora_inicio: string; // HH:MM
  hora_fin: string; // HH:MM
  zona_principal: string; // Multimedia, Vídeo y audio, Impresión 3D, Realidad virtual y simuladores
  numero_alumnos: number;
  objetivo_didactico: string;
  descripcion_actividad: string;
  recursos_necesarios: string;
  necesita_apoyo: boolean;
  prioridad: 'ALTA' | 'MEDIA' | 'NORMAL' | 'BAJA';
  estado: EstadoReserva;
  observaciones_coordinador: string;
  recordatorio_semanal_enviado?: boolean;
  fecha_recordatorio_semanal?: string;
  confirmada_por_docente?: boolean;
  en_standby_por_no_confirmar?: boolean;
  fecha_pase_a_standby?: string;
}

export interface Valoracion {
  id_valoracion: string;
  id_reserva: string;
  fecha_valoracion: string;
  realizada_como_prevista: boolean;
  aspectos_positivos: string;
  dificultades: string;
  evidencias_generadas: string;
  mejoras_futuras: string;
  valoracion_general: number; // 1-5 estrellas
  actividad_innovacion: boolean;
  observaciones_finales: string;
}

export interface Bloqueo {
  id_bloqueo: string;
  fecha: string; // YYYY-MM-DD
  hora_inicio: string; // HH:MM
  hora_fin: string; // HH:MM
  motivo: string;
  creado_por: string; // email o nombre
}

export interface ConfigItem {
  clave: string;
  valor: string;
}

export type TipoDiaNoHabil = 'FESTIVO' | 'VACACIONES' | 'LIBRE_DISPOSICION';

export interface DiaNoHabil {
  id: string;
  fecha_inicio: string; // YYYY-MM-DD
  fecha_fin: string;    // YYYY-MM-DD
  nombre: string;
  tipo: TipoDiaNoHabil;
}
