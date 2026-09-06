/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Usuario, Reserva, Bloqueo, NotificationPreferences, EmailLog, TipoNotificacionEmail } from '../types';
import { getConfig, getUsuarios } from './storage';

const EMAIL_LOGS_KEY = 'ateca_email_logs';

/**
 * Preferencias predeterminadas según el rol del usuario
 */
export const getDefaultNotificationPreferences = (rol: 'PROFESOR' | 'COORDINADOR' | 'ADMIN'): NotificationPreferences => ({
  reserva_estado: true,
  recordatorio_previo: true,
  recordatorio_valoracion: true,
  nueva_solicitud_coord: rol === 'COORDINADOR' || rol === 'ADMIN',
  reserva_liberada_coord: rol === 'COORDINADOR' || rol === 'ADMIN',
  alerta_bloqueo: true,
});

/**
 * Consulta de registros de correos enviados
 */
export const getEmailLogs = (): EmailLog[] => {
  try {
    const data = localStorage.getItem(EMAIL_LOGS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

/**
 * Agregar registro de correo
 */
export const addEmailLog = (log: EmailLog): void => {
  const logs = getEmailLogs();
  logs.unshift(log);
  if (logs.length > 150) logs.length = 150; // Límite de retención
  localStorage.setItem(EMAIL_LOGS_KEY, JSON.stringify(logs));
};

/**
 * Vaciar historial de correos
 */
export const clearEmailLogs = (): void => {
  localStorage.setItem(EMAIL_LOGS_KEY, JSON.stringify([]));
};

/**
 * Comprobar si el usuario consiente recibir este tipo específico de notificación
 */
export const shouldSendNotification = (user: Usuario, type: TipoNotificacionEmail): boolean => {
  const prefs = user.notificaciones || getDefaultNotificationPreferences(user.rol);
  switch (type) {
    case 'CONFIRMACION_SOLICITUD':
      return true;
    case 'APROBADA':
    case 'RECHAZADA':
      return prefs.reserva_estado;
    case 'RECORDATORIO_24H':
      return prefs.recordatorio_previo;
    case 'RECORDATORIO_VALORACION':
      return prefs.recordatorio_valoracion;
    case 'NUEVA_SOLICITUD_COORD':
      return prefs.nueva_solicitud_coord;
    case 'AULA_LIBERADA_COORD':
      return prefs.reserva_liberada_coord;
    case 'BLOQUEO_TECNICO':
      return prefs.alerta_bloqueo;
    case 'TEST':
      return true;
    default:
      return true;
  }
};

/**
 * Generador de plantilla HTML estilizada, responsive y con identidad ATECA
 */
const buildHtmlTemplate = ({
  centerName,
  roomName,
  title,
  badgeText,
  badgeBg = '#059669',
  contentHtml,
  details = [],
  buttonText,
  buttonUrl,
}: {
  centerName: string;
  roomName: string;
  title: string;
  badgeText: string;
  badgeBg?: string;
  contentHtml: string;
  details?: { label: string; value: string }[];
  buttonText?: string;
  buttonUrl?: string;
}): string => {
  const detailsRows = details
    .map(
      (d) => `
      <tr>
        <td style="padding: 7px 10px; font-weight: 600; color: #475569; width: 35%; border-bottom: 1px solid #f1f5f9; font-size: 13px;">
          ${d.label}:
        </td>
        <td style="padding: 7px 10px; color: #0f172a; font-weight: 500; border-bottom: 1px solid #f1f5f9; font-size: 13px;">
          ${d.value}
        </td>
      </tr>`
    )
    .join('');

  const detailsBlock = details.length > 0
    ? `
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; margin: 18px 0;">
      <table style="width: 100%; border-collapse: collapse; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        ${detailsRows}
      </table>
    </div>`
    : '';

  const actionButton = buttonText
    ? `
    <div style="text-align: center; margin: 26px 0 10px 0;">
      <a href="${buttonUrl || 'http://localhost:3000'}" style="background-color: #4f46e5; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 10px; font-weight: bold; font-size: 14px; display: inline-block; box-shadow: 0 2px 4px rgba(79, 70, 229, 0.2);">
        ${buttonText}
      </a>
    </div>`
    : '';

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 20px 10px; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03); border: 1px solid #e2e8f0;">
    
    <!-- HEADER -->
    <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 24px 28px; text-align: left;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
        <span style="font-size: 11px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: #38bdf8;">
          ${centerName || 'Canarias Educación'}
        </span>
        <span style="background-color: ${badgeBg}; color: #ffffff; padding: 3px 10px; border-radius: 9999px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; display: inline-block;">
          ${badgeText}
        </span>
      </div>
      <h1 style="margin: 0; font-size: 20px; font-weight: 900; color: #ffffff; letter-spacing: -0.02em;">
        ${roomName || 'Aula ATECA Innovación'}
      </h1>
      <p style="margin: 4px 0 0 0; font-size: 12px; color: #94a3b8;">
        Sistema de Gestión de Reservas y Actividades de FP
      </p>
    </div>

    <!-- BODY -->
    <div style="padding: 26px 28px; color: #334155; line-height: 1.55;">
      <h2 style="margin-top: 0; font-size: 17px; font-weight: 800; color: #0f172a;">
        ${title}
      </h2>
      
      <div style="font-size: 14px; color: #334155;">
        ${contentHtml}
      </div>

      ${detailsBlock}

      ${actionButton}
    </div>

    <!-- FOOTER -->
    <div style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 18px 28px; text-align: center; font-size: 11px; color: #64748b;">
      <p style="margin: 0 0 6px 0; font-weight: 600;">
        Gestor de Reservas Aula ATECA • Red de Innovación Pedagógica
      </p>
      <p style="margin: 0; color: #94a3b8;">
        Puedes personalizar o desactivar los tipos de alertas por correo en cualquier momento desde tu perfil en la aplicación.
      </p>
    </div>

  </div>
</body>
</html>
  `.trim();
};

/**
 * Dispatcher central de correos electrónicos
 */
export interface SendEmailPayload {
  toUser: Usuario;
  type: TipoNotificacionEmail;
  subject: string;
  title: string;
  badgeText: string;
  badgeBg?: string;
  contentHtml: string;
  contentText: string;
  details?: { label: string; value: string }[];
  buttonText?: string;
  buttonUrl?: string;
}

export const dispatchNotificationEmail = async (payload: SendEmailPayload): Promise<{ success: boolean; log: EmailLog }> => {
  const { toUser, type, subject, title, badgeText, badgeBg, contentHtml, contentText, details, buttonText, buttonUrl } = payload;
  const config = getConfig();

  // 1. Validar si el usuario tiene habilitado este tipo de aviso en sus preferencias
  if (!shouldSendNotification(toUser, type)) {
    const skippedLog: EmailLog = {
      id: `mail-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      fecha_hora: new Date().toLocaleString('es-ES'),
      destinatario_email: toUser.notificaciones?.email_alternativo || toUser.email,
      destinatario_nombre: toUser.nombre,
      asunto: subject,
      cuerpo_html: '<p>Aviso omitido por preferencias del usuario.</p>',
      cuerpo_texto: 'Aviso omitido por preferencias del usuario.',
      tipo: type,
      enviado_real: false,
      error: 'Omitido: El usuario ha desactivado esta categoría de aviso en su perfil',
    };
    addEmailLog(skippedLog);
    return { success: false, log: skippedLog };
  }

  const targetEmail = toUser.notificaciones?.email_alternativo || toUser.email;
  const fullHtml = buildHtmlTemplate({
    centerName: config.nombre_centro || 'Canarias Educación',
    roomName: config.nombre_aula || 'Aula ATECA Innovación',
    title,
    badgeText,
    badgeBg,
    contentHtml,
    details,
    buttonText,
    buttonUrl,
  });

  const fullText = `[${config.nombre_centro || 'Canarias Educación'} - ${config.nombre_aula || 'Aula ATECA'}]\n\n${title}\n\n${contentText}\n\n${
    details?.map(d => `${d.label}: ${d.value}`).join('\n') || ''
  }\n\nAccede al Gestor ATECA: http://localhost:3000`;

  let enviadoReal = false;
  let errorMsg: string | undefined = undefined;

  // 2. Intentar envío real si hay webhook de Google Apps Script configurado
  const gsheetUrl = config.google_sheets_url;
  if (gsheetUrl && gsheetUrl.startsWith('http')) {
    try {
      await fetch(gsheetUrl, {
        method: 'POST',
        mode: 'no-cors', // Evita bloqueos de CORS con Google Apps Script redirects
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'sendEmail',
          to: targetEmail,
          subject,
          htmlBody: fullHtml,
          textBody: fullText,
        }),
      });
      enviadoReal = true;
    } catch (err: any) {
      errorMsg = err?.message || 'Error de conexión con Google Apps Script';
      console.warn('Fallo al despachar email vía Apps Script:', err);
    }
  }

  const log: EmailLog = {
    id: `mail-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    fecha_hora: new Date().toLocaleString('es-ES'),
    destinatario_email: targetEmail,
    destinatario_nombre: toUser.nombre,
    asunto: subject,
    cuerpo_html: fullHtml,
    cuerpo_texto: fullText,
    tipo: type,
    enviado_real: enviadoReal,
    error: errorMsg,
  };

  addEmailLog(log);
  return { success: true, log };
};

// ==========================================
// MÉTODOS DE NEGOCIO ESPECÍFICOS POR EVENTO
// ==========================================

/**
 * 1. Confirmación de recepción de solicitud para el docente
 */
export const notifySolicitudRecibida = async (reserva: Reserva, usuario: Usuario) => {
  return dispatchNotificationEmail({
    toUser: usuario,
    type: 'CONFIRMACION_SOLICITUD',
    subject: `Solicitud registrada: ${reserva.modulo_materia_area} (${reserva.fecha_actividad})`,
    title: 'Hemos recibido tu solicitud de reserva',
    badgeText: 'Recibida',
    badgeBg: '#6366f1',
    contentHtml: `
      <p>Hola <strong>${usuario.nombre}</strong>,</p>
      <p>Tu solicitud para utilizar el Aula ATECA ha quedado correctamente registrada y se encuentra en estado <strong>PENDIENTE</strong> de revisión por parte de la Coordinación del aula.</p>
      <p>Te notificaremos por correo electrónico en cuanto tu solicitud sea aprobada o si se requiere algún ajuste de horario.</p>
    `,
    contentText: `Hola ${usuario.nombre}. Tu solicitud para el Aula ATECA ha quedado registrada como PENDIENTE.`,
    details: [
      { label: 'Fecha solicitada', value: reserva.fecha_actividad.split('-').reverse().join('/') },
      { label: 'Horario', value: `${reserva.hora_inicio} - ${reserva.hora_fin}` },
      { label: 'Grupo / Nivel', value: `${reserva.grupo} (${reserva.nivel})` },
      { label: 'Módulo / Materia', value: reserva.modulo_materia_area },
      { label: 'Zona didáctica', value: reserva.zona_principal },
      { label: 'Alumnos previstos', value: `${reserva.numero_alumnos} estudiantes` },
      { label: 'Prioridad asignada', value: reserva.prioridad },
    ],
    buttonText: 'Ver mis reservas',
  });
};

/**
 * 2. Aviso a Coordinadores de que ha entrado una nueva solicitud
 */
export const notifyNuevaSolicitudCoordinacion = async (reserva: Reserva) => {
  const users = getUsuarios();
  const coords = users.filter((u) => (u.rol === 'COORDINADOR' || u.rol === 'ADMIN') && u.activo);

  for (const coord of coords) {
    await dispatchNotificationEmail({
      toUser: coord,
      type: 'NUEVA_SOLICITUD_COORD',
      subject: `Nueva solicitud Aula ATECA: ${reserva.profesor} (${reserva.grupo})`,
      title: 'Nueva solicitud pendiente de validación',
      badgeText: 'Para Coordinación',
      badgeBg: '#8b5cf6',
      contentHtml: `
        <p>Hola <strong>${coord.nombre}</strong>,</p>
        <p>El docente <strong>${reserva.profesor}</strong> (${reserva.departamento}) ha solicitado el Aula ATECA para una actividad formativa.</p>
        <p>Por favor, revisa los recursos solicitados y el cumplimiento de prioridades de FP para su validación.</p>
      `,
      contentText: `Nueva solicitud de ${reserva.profesor} para el día ${reserva.fecha_actividad}.`,
      details: [
        { label: 'Docente solicitante', value: reserva.profesor },
        { label: 'Departamento', value: reserva.departamento },
        { label: 'Fecha', value: reserva.fecha_actividad.split('-').reverse().join('/') },
        { label: 'Horario', value: `${reserva.hora_inicio} - ${reserva.hora_fin}` },
        { label: 'Módulo / Materia', value: reserva.modulo_materia_area },
        { label: 'Zona requerida', value: reserva.zona_principal },
        { label: 'Prioridad', value: reserva.prioridad },
      ],
      buttonText: 'Gestionar en Panel de Coordinación',
    });
  }
};

/**
 * 3. Notificación de reserva APROBADA al profesor
 */
export const notifyReservaAprobada = async (reserva: Reserva, usuario: Usuario, observaciones?: string) => {
  return dispatchNotificationEmail({
    toUser: usuario,
    type: 'APROBADA',
    subject: `¡Reserva APROBADA! Aula ATECA para ${reserva.grupo} (${reserva.fecha_actividad})`,
    title: '¡Tu reserva ha sido aprobada!',
    badgeText: 'Aprobada',
    badgeBg: '#10b981',
    contentHtml: `
      <p>Hola <strong>${usuario.nombre}</strong>,</p>
      <p>Nos complace informarte de que tu reserva para el Aula ATECA ha sido <strong>APROBADA</strong> satisfactoriamente por la Coordinación.</p>
      ${observaciones ? `<div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 10px 14px; border-radius: 6px; margin: 12px 0;"><strong style="color: #065f46;">Indicaciones del Coordinador:</strong><p style="margin: 4px 0 0 0; color: #047857; font-size: 13px;">${observaciones}</p></div>` : ''}
      <p style="font-size: 13px; color: #64748b;">Recuerda dejar el espacio y los recursos tecnológicos recogidos y apagados al finalizar la sesión.</p>
    `,
    contentText: `¡Tu reserva para el Aula ATECA ha sido APROBADA! Fecha: ${reserva.fecha_actividad} de ${reserva.hora_inicio} a ${reserva.hora_fin}.`,
    details: [
      { label: 'Fecha confirmada', value: reserva.fecha_actividad.split('-').reverse().join('/') },
      { label: 'Horario reservado', value: `${reserva.hora_inicio} - ${reserva.hora_fin}` },
      { label: 'Grupo', value: reserva.grupo },
      { label: 'Módulo', value: reserva.modulo_materia_area },
      { label: 'Zona', value: reserva.zona_principal },
      { label: 'Apoyo técnico', value: reserva.necesita_apoyo ? 'Solicitado' : 'Autónomo' },
    ],
    buttonText: 'Consultar Reserva',
  });
};

/**
 * 4. Notificación de reserva RECHAZADA con motivo explicativo
 */
export const notifyReservaRechazada = async (reserva: Reserva, usuario: Usuario, motivo: string) => {
  return dispatchNotificationEmail({
    toUser: usuario,
    type: 'RECHAZADA',
    subject: `No ha sido posible atender tu reserva en Aula ATECA (${reserva.fecha_actividad})`,
    title: 'Reserva no atendida',
    badgeText: 'No Aprobada',
    badgeBg: '#f43f5e',
    contentHtml: `
      <p>Hola <strong>${usuario.nombre}</strong>,</p>
      <p>Lamentamos comunicarte que no ha sido posible autorizar tu solicitud de reserva para la fecha y franja horaria solicitadas.</p>
      <div style="background-color: #fff1f2; border-left: 4px solid #f43f5e; padding: 12px 16px; border-radius: 8px; margin: 14px 0;">
        <strong style="color: #9f1239;">Motivo / Justificación pedagógica:</strong>
        <p style="margin: 4px 0 0 0; color: #be123c; font-size: 13px;">${motivo || 'Conflicto de disponibilidad o prioridad con otros grupos formativos.'}</p>
      </div>
      <p style="font-size: 13px;">Puedes consultar el calendario interactivo para seleccionar otra franja horaria disponible o coordinarte con el equipo ATECA.</p>
    `,
    contentText: `Tu solicitud para el día ${reserva.fecha_actividad} no ha podido ser autorizada. Motivo: ${motivo}`,
    details: [
      { label: 'Fecha intentada', value: reserva.fecha_actividad.split('-').reverse().join('/') },
      { label: 'Horario', value: `${reserva.hora_inicio} - ${reserva.hora_fin}` },
      { label: 'Módulo / Materia', value: reserva.modulo_materia_area },
    ],
    buttonText: 'Buscar otra fecha en el calendario',
  });
};

/**
 * 5. Notificación a Coordinación cuando un docente LIBERA o cancela su reserva
 */
export const notifyAulaLiberada = async (reserva: Reserva, profesor: Usuario, motivo?: string) => {
  const users = getUsuarios();
  const coords = users.filter((u) => (u.rol === 'COORDINADOR' || u.rol === 'ADMIN') && u.activo);

  for (const coord of coords) {
    await dispatchNotificationEmail({
      toUser: coord,
      type: 'AULA_LIBERADA_COORD',
      subject: `Aula ATECA liberada para el ${reserva.fecha_actividad} (${reserva.hora_inicio}-${reserva.hora_fin})`,
      title: 'Un docente ha liberado una franja horaria',
      badgeText: 'Espacio Disponible',
      badgeBg: '#0ea5e9',
      contentHtml: `
        <p>Hola <strong>${coord.nombre}</strong>,</p>
        <p>El profesor <strong>${profesor.nombre}</strong> ha cancelado/liberado su reserva, dejando el Aula ATECA libre para que otros compañeros puedan aprovechar el espacio.</p>
        ${motivo ? `<p><strong>Motivo indicado:</strong> <em>${motivo}</em></p>` : ''}
      `,
      contentText: `Aula liberada por ${profesor.nombre} para el día ${reserva.fecha_actividad} de ${reserva.hora_inicio} a ${reserva.hora_fin}.`,
      details: [
        { label: 'Profesor saliente', value: profesor.nombre },
        { label: 'Fecha liberada', value: reserva.fecha_actividad.split('-').reverse().join('/') },
        { label: 'Franja horaria libre', value: `${reserva.hora_inicio} - ${reserva.hora_fin}` },
        { label: 'Zona', value: reserva.zona_principal },
      ],
      buttonText: 'Abrir Calendario de Ocupación',
    });
  }
};

/**
 * 6. Alerta de bloqueo técnico por avería o mantenimiento
 */
export const notifyBloqueoTecnico = async (bloqueo: Bloqueo) => {
  const users = getUsuarios();
  const activeUsers = users.filter((u) => u.activo);

  for (const usr of activeUsers) {
    await dispatchNotificationEmail({
      toUser: usr,
      type: 'BLOQUEO_TECNICO',
      subject: `Aviso técnico Aula ATECA: Mantenimiento el ${bloqueo.fecha}`,
      title: 'Aviso de Mantenimiento / Bloqueo Técnico',
      badgeText: 'Mantenimiento',
      badgeBg: '#f59e0b',
      contentHtml: `
        <p>Estimado/a docente,</p>
        <p>Te informamos de que se ha programado un bloqueo técnico en el Aula ATECA durante el cual las instalaciones no estarán disponibles para actividades didácticas ordinarias.</p>
        <p><strong>Motivo técnico:</strong> ${bloqueo.motivo}</p>
      `,
      contentText: `Mantenimiento programado en Aula ATECA el día ${bloqueo.fecha} (${bloqueo.hora_inicio}-${bloqueo.hora_fin}). Motivo: ${bloqueo.motivo}`,
      details: [
        { label: 'Fecha de intervención', value: bloqueo.fecha.split('-').reverse().join('/') },
        { label: 'Horario', value: `${bloqueo.hora_inicio} - ${bloqueo.hora_fin}` },
        { label: 'Registrado por', value: bloqueo.creado_por },
      ],
    });
  }
};

/**
 * 7. Correo de prueba para verificar configuración del docente
 */
export const notifyTestEmail = async (usuario: Usuario) => {
  return dispatchNotificationEmail({
    toUser: usuario,
    type: 'TEST',
    subject: `Prueba de conectividad y avisos Aula ATECA: ${usuario.nombre}`,
    title: '¡Tu sistema de avisos por correo está listo!',
    badgeText: 'Prueba Exitosa',
    badgeBg: '#10b981',
    contentHtml: `
      <p>Hola <strong>${usuario.nombre}</strong>,</p>
      <p>Este es un correo de prueba generado automáticamente para comprobar que tus preferencias de notificación y la dirección de envío están funcionando a la perfección.</p>
      <p>A partir de este momento, recibirás avisos puntuales sobre el estado de tus reservas, recordatorios de tus clases y memorias pedagógicas según los interruptores que hayas activado.</p>
    `,
    contentText: `Hola ${usuario.nombre}. Esta es una prueba de envío exitosa del Gestor Aula ATECA.`,
    details: [
      { label: 'Docente', value: usuario.nombre },
      { label: 'Correo destinatario', value: usuario.notificaciones?.email_alternativo || usuario.email },
      { label: 'Rol en el sistema', value: usuario.rol },
      { label: 'Fecha de prueba', value: new Date().toLocaleString('es-ES') },
    ],
    buttonText: 'Ir a Gestor ATECA',
  });
};