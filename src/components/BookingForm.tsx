/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, BookOpen, Layers, CheckCircle2, AlertTriangle, ArrowLeft, ShieldCheck } from 'lucide-react';
import { Reserva, Usuario } from '../types';
import { getReservas, getBloqueos, addReserva, checkTimeOverlap, formatDateToYMD, getConfig } from '../lib/storage';

interface BookingFormProps {
  currentUser: Usuario;
  onSuccess: (msg: string) => void;
  onCancel: () => void;
  initialDate?: string;
}

export default function BookingForm({ currentUser, onSuccess, onCancel, initialDate }: BookingFormProps) {
  const config = getConfig();
  
  // Form fields
  const [profesor, setProfesor] = useState(currentUser.nombre);
  const [email, setEmail] = useState(currentUser.email);
  const [departamento, setDepartamento] = useState(currentUser.departamento || '');
  const [nivel, setNivel] = useState('Grado Superior FP');
  const [grupo, setGrupo] = useState('');
  const [moduloMateria, setModuloMateria] = useState('');
  const [fecha, setFecha] = useState(() => initialDate || formatDateToYMD());
  const [horaInicio, setHoraInicio] = useState('09:00');
  const [horaFin, setHoraFin] = useState('11:00');
  const [zonaPrincipal, setZonaPrincipal] = useState('Multimedia');
  const [numAlumnos, setNumAlumnos] = useState(15);
  const [objetivoDidactico, setObjetivoDidactico] = useState('');
  const [descripcionActividad, setDescripcionActividad] = useState('');
  const [recursosNecesarios, setRecursosNecesarios] = useState('');
  const [necesitaApoyo, setNecesitaApoyo] = useState(false);
  const [prioridad, setPrioridad] = useState<'ALTA' | 'MEDIA' | 'NORMAL' | 'BAJA'>('NORMAL');

  // Warnings and calculations
  const [conflictType, setConflictType] = useState<'NONE' | 'BLOQUEO' | 'OVERLAP'>('NONE');
  const [conflictMsg, setConflictMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Auto-detect priority based on Nivel
  useEffect(() => {
    if (nivel.includes('FP') || nivel.includes('Profesional')) {
      setPrioridad('ALTA');
    } else if (nivel.includes('Proyecto')) {
      setPrioridad('MEDIA');
    } else if (nivel.includes('ESO') || nivel.includes('Bachillerato')) {
      setPrioridad('NORMAL');
    } else {
      setPrioridad('BAJA');
    }
  }, [nivel]);

  // Realtime conflict checker
  useEffect(() => {
    setConflictType('NONE');
    setConflictMsg('');

    if (!fecha || !horaInicio || !horaFin) return;

    // Check configuration limits
    const startHourConfig = config.horario_inicio || '08:00';
    const endHourConfig = config.horario_fin || '21:00';

    if (horaInicio < startHourConfig || horaFin > endHourConfig) {
      setConflictType('BLOQUEO');
      setConflictMsg(`El horario seleccionado está fuera del rango de apertura del aula (${startHourConfig} - ${endHourConfig}).`);
      return;
    }

    if (horaInicio >= horaFin) {
      setConflictType('BLOQUEO');
      setConflictMsg('La hora de inicio debe ser anterior a la hora de fin.');
      return;
    }

    // 1. Check lockouts
    const bloqueos = getBloqueos();
    const hasBlock = bloqueos.some(b => {
      if (b.fecha !== fecha) return false;
      return checkTimeOverlap(b.hora_inicio, b.hora_fin, horaInicio, horaFin);
    });

    if (hasBlock) {
      setConflictType('BLOQUEO');
      setConflictMsg('¡ATENCIÓN! El aula está BLOQUEADA por el coordinador para mantenimiento en esta fecha y franja horaria.');
      return;
    }

    // 2. Check approved reservations overlap
    const reservas = getReservas();
    const overlapRes = reservas.find(r => {
      if (r.estado !== 'APROBADA' && r.estado !== 'REALIZADA') return false;
      if (r.fecha_actividad !== fecha) return false;
      return checkTimeOverlap(r.hora_inicio, r.hora_fin, horaInicio, horaFin);
    });

    if (overlapRes) {
      setConflictType('OVERLAP');
      setConflictMsg(`¡AVISO DE CONFLICTO! Ya existe una reserva APROBADA de ${overlapRes.profesor} (${overlapRes.grupo} - ${overlapRes.zona_principal}) de ${overlapRes.hora_inicio} a ${overlapRes.hora_fin}. Tu reserva se registrará como PENDIENTE para que la valide el Coordinador.`);
    }
  }, [fecha, horaInicio, horaFin, config]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Field validation
    if (!grupo.trim() || !moduloMateria.trim() || !objetivoDidactico.trim() || !descripcionActividad.trim()) {
      setErrorMsg('Por favor, completa todos los campos del formulario didáctico.');
      return;
    }

    if (numAlumnos <= 0) {
      setErrorMsg('El número de alumnos debe ser mayor que 0.');
      return;
    }

    const { success, conflict, message } = addReserva({
      profesor,
      email,
      departamento,
      nivel,
      grupo,
      modulo_materia_area: moduloMateria,
      fecha_actividad: fecha,
      hora_inicio: horaInicio,
      hora_fin: horaFin,
      zona_principal: zonaPrincipal,
      numero_alumnos: Number(numAlumnos),
      objetivo_didactico: objetivoDidactico,
      descripcion_actividad: descripcionActividad,
      recursos_necesarios: recursosNecesarios,
      necesita_apoyo: necesitaApoyo,
      prioridad,
    });

    if (success) {
      onSuccess(message || 'Reserva registrada.');
    } else {
      setErrorMsg(message || 'Error al guardar la reserva.');
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden max-w-4xl mx-auto">
      <div className="bg-slate-900 px-6 py-4 flex items-center justify-between no-print text-white border-b border-slate-800">
        <div className="flex items-center space-x-3.5">
          <div className="p-2 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-xl border border-emerald-500/30">
            <BookOpen className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-lg font-black tracking-tight">Nueva Ficha de Reserva didáctica</h2>
            <p className="text-xs text-slate-400">Planificación curricular Aula ATECA</p>
          </div>
        </div>
        <button
          onClick={onCancel}
          id="btn_back_form"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 rounded-xl text-xs font-semibold cursor-pointer transition-all border border-slate-700 text-slate-200 hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Volver
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Info Box Priority */}
        <div className="bg-slate-50 border-l-4 border-slate-700 p-4 rounded-r-lg text-xs leading-relaxed text-slate-600">
          <p className="font-semibold text-slate-800 mb-1">ℹ️ Prioridad y Uso de Espacios:</p>
          El Aula ATECA está orientada prioritariamente a <strong>Formación Profesional</strong>, aunque puede ser utilizada por otros niveles cuando la actividad esté justificada y exista disponibilidad. El aula se reserva completa.
        </div>

        {errorMsg && (
          <div className="p-3.5 bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg font-medium flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            {errorMsg}
          </div>
        )}

        {conflictMsg && (
          <div className={`p-4 border rounded-lg text-xs flex items-start gap-2.5 font-medium ${
            conflictType === 'BLOQUEO' 
              ? 'bg-red-50 border-red-200 text-red-700' 
              : 'bg-amber-50 border-amber-200 text-amber-700'
          }`}>
            <AlertTriangle className={`h-5 w-5 flex-shrink-0 ${conflictType === 'BLOQUEO' ? 'text-red-500' : 'text-amber-500'}`} />
            <div>
              <p className="font-bold uppercase tracking-wider mb-0.5">
                {conflictType === 'BLOQUEO' ? 'Operación bloqueada' : 'Aviso de Agenda'}
              </p>
              <p>{conflictMsg}</p>
            </div>
          </div>
        )}

        {/* SECTION 1: DATOS DOCENTE */}
        <div className="border border-slate-100 rounded-lg p-4 bg-slate-50/50 space-y-4">
          <h3 className="font-bold text-slate-700 text-sm flex items-center gap-2 border-b border-slate-100 pb-2">
            <Users className="h-4 w-4 text-slate-500" />
            1. Datos del Profesor y Centro
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Nombre del Profesor/a</label>
              <input
                type="text"
                disabled
                value={profesor}
                placeholder="Nombre docente"
                className="w-full px-3 py-2 bg-slate-100 border border-slate-200 text-slate-500 rounded-lg text-xs cursor-not-allowed font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Correo Electrónico</label>
              <input
                type="email"
                disabled
                value={email}
                placeholder="Email docente"
                className="w-full px-3 py-2 bg-slate-100 border border-slate-200 text-slate-500 rounded-lg text-xs cursor-not-allowed font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Departamento Didáctico *</label>
              <input
                type="text"
                required
                value={departamento}
                onChange={(e) => setDepartamento(e.target.value)}
                placeholder="Ejemplo: Informática"
                className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-slate-400 focus:ring-1 focus:ring-slate-400 rounded-lg text-xs outline-none"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: DATOS DE LA ACTIVIDAD */}
        <div className="border border-slate-100 rounded-lg p-4 bg-slate-50/50 space-y-4">
          <h3 className="font-bold text-slate-700 text-sm flex items-center gap-2 border-b border-slate-100 pb-2">
            <Layers className="h-4 w-4 text-slate-500" />
            2. Contexto de Trabajo y Concreción Curricular
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Nivel Educativo / Ciclo *</label>
              <select
                value={nivel}
                onChange={(e) => setNivel(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 focus:border-slate-400 rounded-lg text-xs outline-none cursor-pointer"
              >
                <option value="Grado Superior FP">Grado Superior FP (Alta Prioridad)</option>
                <option value="Grado Medio FP">Grado Medio FP (Alta Prioridad)</option>
                <option value="FP Básica / Programas">FP Básica / Programas Especiales</option>
                <option value="Proyecto de Centro">Proyecto de Centro (Prioridad Media)</option>
                <option value="Bachillerato">Bachillerato (Prioridad Normal)</option>
                <option value="ESO">ESO (Prioridad Normal)</option>
                <option value="Prueba técnica / Demostración">Prueba técnica / Demostración</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Grupo de Alumnos *</label>
              <input
                type="text"
                required
                value={grupo}
                onChange={(e) => setGrupo(e.target.value)}
                placeholder="Ejemplo: 2º DAM, 4º ESO A"
                className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-slate-400 focus:ring-1 focus:ring-slate-400 rounded-lg text-xs outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Módulo / Materia / Área *</label>
              <input
                type="text"
                required
                value={moduloMateria}
                onChange={(e) => setModuloMateria(e.target.value)}
                placeholder="Ejemplo: Acceso a Datos"
                className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-slate-400 focus:ring-1 focus:ring-slate-400 rounded-lg text-xs outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Zona ATECA Principal *</label>
              <select
                value={zonaPrincipal}
                onChange={(e) => setZonaPrincipal(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 focus:border-slate-400 rounded-lg text-xs outline-none cursor-pointer font-medium"
              >
                <option value="Multimedia">Multimedia (Croma / Edición / Pizarra Interactiva)</option>
                <option value="Vídeo y audio">Vídeo y audio (Estudio de Grabación / Podcast)</option>
                <option value="Impresión 3D">Impresión 3D (Escaner / Impresoras PLA)</option>
                <option value="Realidad virtual y simuladores">Realidad virtual y simuladores (Meta Quest / VR)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Número estimado de Alumnos *</label>
              <input
                type="number"
                required
                min="1"
                max="35"
                value={numAlumnos}
                onChange={(e) => setNumAlumnos(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-slate-400 focus:ring-1 focus:ring-slate-400 rounded-lg text-xs outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Prioridad Asignada</label>
              <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold ${
                prioridad === 'ALTA' ? 'bg-red-50 text-red-600 border border-red-100' :
                prioridad === 'MEDIA' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                prioridad === 'NORMAL' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                'bg-slate-50 text-slate-600 border border-slate-100'
              }`}>
                {prioridad}
              </span>
            </div>
          </div>
        </div>

        {/* SECTION 3: CALENDARIO Y FECHA */}
        <div className="border border-slate-100 rounded-lg p-4 bg-slate-50/50 space-y-4">
          <h3 className="font-bold text-slate-700 text-sm flex items-center gap-2 border-b border-slate-100 pb-2">
            <Clock className="h-4 w-4 text-slate-500" />
            3. Fecha y Franja Horaria solicitada
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Fecha de la Actividad *</label>
              <input
                type="date"
                required
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 focus:border-slate-400 rounded-lg text-xs outline-none cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Hora de Inicio *</label>
              <input
                type="time"
                required
                value={horaInicio}
                onChange={(e) => setHoraInicio(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 focus:border-slate-400 rounded-lg text-xs outline-none cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Hora de Fin *</label>
              <input
                type="time"
                required
                value={horaFin}
                onChange={(e) => setHoraFin(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 focus:border-slate-400 rounded-lg text-xs outline-none cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* SECTION 4: FICHA DIDÁCTICA */}
        <div className="border border-slate-100 rounded-lg p-4 bg-slate-50/50 space-y-4">
          <h3 className="font-bold text-slate-700 text-sm flex items-center gap-2 border-b border-slate-100 pb-2">
            <BookOpen className="h-4 w-4 text-slate-500" />
            4. Ficha Didáctica Previa
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Objetivo Didáctico Principal *</label>
              <textarea
                required
                rows={2}
                value={objetivoDidactico}
                onChange={(e) => setObjetivoDidactico(e.target.value)}
                placeholder="Describe el objetivo de aprendizaje principal que esperas que alcance tu alumnado en el Aula ATECA..."
                className="w-full p-2.5 bg-white border border-slate-200 focus:border-slate-400 rounded-lg text-xs outline-none resize-none leading-relaxed"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Descripción Breve de la Actividad *</label>
              <textarea
                required
                rows={3}
                value={descripcionActividad}
                onChange={(e) => setDescripcionActividad(e.target.value)}
                placeholder="Breve explicación del desarrollo que los alumnos realizarán (dinámica de grupo, manipulación de dispositivos, edición, etc.)..."
                className="w-full p-2.5 bg-white border border-slate-200 focus:border-slate-400 rounded-lg text-xs outline-none resize-none leading-relaxed"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Recursos Necesarios (Materiales, software, filamento, gafas) *</label>
              <textarea
                rows={2}
                value={recursosNecesarios}
                onChange={(e) => setRecursosNecesarios(e.target.value)}
                placeholder="Especifica si necesitas cámaras, gafas VR específicas, filamento PLA, resina, trípodes, etc..."
                className="w-full p-2.5 bg-white border border-slate-200 focus:border-slate-400 rounded-lg text-xs outline-none resize-none leading-relaxed"
              />
            </div>

            <div className="flex items-center space-x-2 pt-1">
              <input
                type="checkbox"
                id="necesitaApoyoInp"
                checked={necesitaApoyo}
                onChange={(e) => setNecesitaApoyo(e.target.checked)}
                className="h-4 w-4 rounded-sm text-slate-800 border-slate-300 focus:ring-slate-400 cursor-pointer"
              />
              <label htmlFor="necesitaApoyoInp" className="text-xs font-medium text-slate-700 cursor-pointer select-none">
                ¿Necesita el soporte presencial de la Coordinadora Aula ATECA durante el transcurso de la sesión?
              </label>
            </div>
          </div>
        </div>

        {/* RGPD Educational Compliance Notice */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-[11px] text-slate-500 flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            <strong>Protección de datos:</strong> Tratamiento exclusivo con fines pedagógicos y organizativos del Aula ATECA (Art. 6.1.e RGPD). <strong>No se recogen datos identificativos de alumnos.</strong>
          </span>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="flex justify-end items-center gap-3 border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={onCancel}
            id="btn_cancel_booking"
            className="px-4 py-2 hover:bg-slate-100 active:bg-slate-200 text-slate-600 rounded-lg text-xs font-semibold transition-all cursor-pointer"
          >
            Cancelar solicitud
          </button>
          <button
            type="submit"
            disabled={conflictType === 'BLOQUEO'}
            id="btn_submit_booking"
            className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-[0.98] disabled:from-slate-300 disabled:to-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shadow-xs hover:shadow-md"
          >
            <CheckCircle2 className="h-4 w-4" /> Enviar solicitud de Reserva
          </button>
        </div>
      </form>
    </div>
  );
}
