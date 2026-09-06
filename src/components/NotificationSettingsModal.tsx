/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Bell, Mail, CheckCircle2, ShieldCheck, X, Send, 
  Sparkles, Clock, FileText, AlertTriangle, UserCheck, Inbox
} from 'lucide-react';
import { Usuario, NotificationPreferences } from '../types';
import { getDefaultNotificationPreferences, notifyTestEmail } from '../lib/emailService';
import { modifyUsuario, setCurrentUser } from '../lib/storage';

interface NotificationSettingsModalProps {
  user: Usuario;
  isOpen: boolean;
  onClose: () => void;
  onSaved: (updatedUser: Usuario, message: string) => void;
}

export default function NotificationSettingsModal({
  user,
  isOpen,
  onClose,
  onSaved,
}: NotificationSettingsModalProps) {
  if (!isOpen) return null;

  const initialPrefs: NotificationPreferences = 
    user.notificaciones || getDefaultNotificationPreferences(user.rol);

  const [prefs, setPrefs] = useState<NotificationPreferences>(initialPrefs);
  const [emailAlt, setEmailAlt] = useState(user.notificaciones?.email_alternativo || '');
  const [useAltEmail, setUseAltEmail] = useState(Boolean(user.notificaciones?.email_alternativo));
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; msg: string } | null>(null);

  const isCoordOrAdmin = user.rol === 'COORDINADOR' || user.rol === 'ADMIN';

  const toggle = (key: keyof NotificationPreferences) => {
    setPrefs(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = () => {
    const finalPrefs: NotificationPreferences = {
      ...prefs,
      email_alternativo: useAltEmail && emailAlt.trim() ? emailAlt.trim().toLowerCase() : undefined,
    };

    const updatedUser: Usuario = {
      ...user,
      notificaciones: finalPrefs,
    };

    modifyUsuario(user.id_usuario, { notificaciones: finalPrefs });
    setCurrentUser(updatedUser);
    onSaved(updatedUser, 'Preferencias de notificaciones por correo guardadas.');
    onClose();
  };

  const handleSendTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const tempUser: Usuario = {
        ...user,
        notificaciones: {
          ...prefs,
          email_alternativo: useAltEmail && emailAlt.trim() ? emailAlt.trim().toLowerCase() : undefined,
        },
      };
      const res = await notifyTestEmail(tempUser);
      if (res.success) {
        setTestResult({
          success: true,
          msg: `Correo de prueba emitido con éxito a ${tempUser.notificaciones?.email_alternativo || tempUser.email}`,
        });
      } else {
        setTestResult({
          success: false,
          msg: res.log.error || 'No se pudo despachar el correo de prueba.',
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        msg: err?.message || 'Error inesperado al generar el correo.',
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* HEADER */}
        <div className="p-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Avisos por Correo Electrónico
              </h2>
              <p className="text-xs text-slate-300 font-medium">
                {user.nombre} • <span className="text-indigo-300 font-bold uppercase">{user.rol}</span>
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-700 text-xs">
          
          {/* INTRODUCTORY CARD */}
          <div className="bg-indigo-50/70 border border-indigo-150 p-3.5 rounded-xl text-indigo-950 leading-relaxed space-y-1">
            <p className="font-bold flex items-center gap-1.5 text-xs text-indigo-900">
              <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" /> Configuración pedagógica y privada
            </p>
            <p className="text-[11px] text-slate-600">
              Personaliza qué avisos didácticos deseas recibir en tu correo. El sistema respetará escrupulosamente tus preferencias y solo emitirá notificaciones relevantes para tu labor docente en el Aula ATECA.
            </p>
          </div>

          {/* EMAIL DESTINATION CONFIG */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-indigo-600" /> Dirección de recepción de avisos
                </p>
                <p className="text-[11px] text-slate-500">
                  Por defecto se utiliza tu correo corporativo institucional.
                </p>
              </div>
              <span className="font-mono font-bold text-xs text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100">
                {user.email}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-200/80">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useAltEmail}
                  onChange={(e) => setUseAltEmail(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <span className="text-xs font-semibold text-slate-700">
                  Recibir avisos en un correo secundario o personal
                </span>
              </label>

              {useAltEmail && (
                <div className="mt-2.5">
                  <input
                    type="email"
                    value={emailAlt}
                    onChange={(e) => setEmailAlt(e.target.value)}
                    placeholder="ejemplo.docente@gmail.com"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              )}
            </div>
          </div>

          {/* NOTIFICATION CATEGORIES */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
              Alertas para el Docente Solicitante
            </h3>

            {/* Toggle 1: Estado reserva */}
            <div className="flex items-start justify-between gap-4 p-3 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition-colors">
              <div className="space-y-0.5">
                <p className="font-bold text-slate-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Aprobación o Rechazo de Reservas
                </p>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Recibe confirmación inmediata cuando Coordinación autorice o deniegue tu solicitud (incluyendo indicaciones u observaciones pedagógicas).
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                <input
                  type="checkbox"
                  checked={prefs.reserva_estado}
                  onChange={() => toggle('reserva_estado')}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            {/* Toggle 2: Recordatorio previo 24h */}
            <div className="flex items-start justify-between gap-4 p-3 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition-colors">
              <div className="space-y-0.5">
                <p className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-500" /> Recordatorio de Clase (24h antes)
                </p>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Aviso la víspera de la actividad didáctica recordando la franja horaria, grupo y preparación de equipamiento tecnológico necesario.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                <input
                  type="checkbox"
                  checked={prefs.recordatorio_previo}
                  onChange={() => toggle('recordatorio_previo')}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            {/* Toggle 3: Recordatorio memoria post-clase */}
            <div className="flex items-start justify-between gap-4 p-3 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition-colors">
              <div className="space-y-0.5">
                <p className="font-bold text-slate-900 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-sky-600" /> Recordatorio de Memoria Pedagógica
                </p>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Aviso amistoso tras la clase para completar en 1 minuto la ficha de valoración didáctica e incidencias de los simuladores o equipos.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                <input
                  type="checkbox"
                  checked={prefs.recordatorio_valoracion}
                  onChange={() => toggle('recordatorio_valoracion')}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            {/* Toggle 4: Alertas de bloqueo técnico */}
            <div className="flex items-start justify-between gap-4 p-3 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition-colors">
              <div className="space-y-0.5">
                <p className="font-bold text-slate-900 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-500" /> Bloqueos y Mantenimiento del Aula
                </p>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Notificación urgente si el aula debe cerrarse temporalmente por calibración, avería sobrevenida o mantenimiento de equipamiento.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                <input
                  type="checkbox"
                  checked={prefs.alerta_bloqueo}
                  onChange={() => toggle('alerta_bloqueo')}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
          </div>

          {/* COORDINATOR & ADMIN EXCLUSIVE TOGGLES */}
          {isCoordOrAdmin && (
            <div className="space-y-3 pt-2 border-t border-slate-200">
              <h3 className="text-xs font-bold text-indigo-900 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-indigo-600" /> Funciones de Coordinación ATECA
              </h3>

              {/* Toggle 5: Nueva solicitud */}
              <div className="flex items-start justify-between gap-4 p-3 bg-indigo-50/40 border border-indigo-200/80 rounded-xl">
                <div className="space-y-0.5">
                  <p className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Inbox className="w-4 h-4 text-indigo-600" /> Nueva Solicitud de Reserva Registrada
                  </p>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    Aviso inmediato cada vez que un compañero docente solicita el aula para que puedas validarla con agilidad.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                  <input
                    type="checkbox"
                    checked={prefs.nueva_solicitud_coord}
                    onChange={() => toggle('nueva_solicitud_coord')}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              {/* Toggle 6: Reserva liberada */}
              <div className="flex items-start justify-between gap-4 p-3 bg-indigo-50/40 border border-indigo-200/80 rounded-xl">
                <div className="space-y-0.5">
                  <p className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-600" /> Aula Liberada por un Docente
                  </p>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    Aviso cuando un profesor cancela o libera su franja horaria para conocer qué huecos quedan disponibles.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                  <input
                    type="checkbox"
                    checked={prefs.reserva_liberada_coord}
                    onChange={() => toggle('reserva_liberada_coord')}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>
            </div>
          )}

          {/* TEST FEEDBACK NOTIFICATION */}
          {testResult && (
            <div className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
              testResult.success 
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}>
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{testResult.msg}</span>
            </div>
          )}

        </div>

        {/* FOOTER ACTIONS */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleSendTest}
            disabled={testing}
            className="px-3.5 py-2 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 active:scale-95 rounded-xl border border-indigo-200 transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" /> {testing ? 'Enviando prueba...' : 'Enviar correo de prueba'}
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200/70 rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 active:scale-95 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              Guardar preferencias
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
