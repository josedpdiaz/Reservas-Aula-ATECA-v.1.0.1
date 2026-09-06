/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface NotificationPreferences {
  reserva_estado: boolean;          // Avisar si la reserva es aprobada o rechazada
  recordatorio_previo: boolean;     // Recordatorio 24h antes del uso del aula
  recordatorio_valoracion: boolean; // Recordatorio tras la clase para valorar
  nueva_solicitud_coord: boolean;   // (Coordinación) Aviso de nueva solicitud
  reserva_liberada_coord: boolean;  // (Coordinación) Aviso de aula liberada/cancelada
  alerta_bloqueo: boolean;          // Aviso de bloqueo técnico por mantenimiento
  email_alternativo?: string;       // Email alternativo opcional
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
}

export type TipoNotificacionEmail = 
  | 'CONFIRMACION_SOLICITUD'
  | 'APROBADA'
  | 'RECHAZADA'
  | 'RECORDATORIO_24H'
  | 'RECORDATORIO_VALORACION'
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
