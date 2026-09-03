/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, BookOpen, Layers, CheckCircle2, AlertTriangle, ArrowLeft, ShieldCheck, Edit3 } from 'lucide-react';
import { Reserva, Usuario } from '../types';
import { 
  getReservas, getBloqueos, addReserva, updateReserva, 
  isNonWorkingDay, checkTimeOverlap, formatDateToYMD, getConfig 
} from '../lib/storage';

interface BookingFormProps {
  currentUser: Usuario;
  onSuccess: (msg: string) => void;
  onCancel: () => void;
  initialDate?: string;
  initialStartTime?: string;
  initialEndTime?: string;
  bookingToEdit?: Reserva | null;
}

export default function BookingForm({ 
  currentUser, 
  onSuccess, 
  onCancel, 
  initialDate,
  initialStartTime,
  initialEndTime,
  bookingToEdit
}: BookingFormProps) {
  const config = getConfig();
  
  // Form fields (prefilled with existing booking if in edit mode)
  const [profesor, setProfesor] = useState(() => bookingToEdit ? bookingToEdit.profesor : currentUser.nombre);
  const [email, setEmail] = useState(() => bookingToEdit ? bookingToEdit.email : currentUser.email);
  const [departamento, setDepartamento] = useState(() => bookingToEdit ? bookingToEdit.departamento : (currentUser.departamento || ''));
  const [nivel, setNivel] = useState(() => bookingToEdit ? bookingToEdit.nivel : 'Grado Superior FP');
  const [grupo, setGrupo] = useState(() => bookingToEdit ? bookingToEdit.grupo : '');
  const [moduloMateria, setModuloMateria] = useState(() => bookingToEdit ? bookingToEdit.modulo_materia_area : '');
  const [fecha, setFecha] = useState(() => bookingToEdit ? bookingToEdit.fecha_actividad : (initialDate || formatDateToYMD()));
  const [horaInicio, setHoraInicio] = useState(() => bookingToEdit ? bookingToEdit.hora_inicio : (initialStartTime || '09:00'));
  const [horaFin, setHoraFin] = useState(() => bookingToEdit ? bookingToEdit.hora_fin : (initialEndTime || '11:00'));
  const [zonaPrincipal, setZonaPrincipal] = useState(() => bookingToEdit ? bookingToEdit.zona_principal : 'Multimedia');
  const [numAlumnos, setNumAlumnos] = useState(() => bookingToEdit ? bookingToEdit.numero_alumnos : 15);
  const [objetivoDidactico, setObjetivoDidactico] = useState(() => bookingToEdit ? bookingToEdit.objetivo_didactico : '');
  const [descripcionActividad, setDescripcionActividad] = useState(() => bookingToEdit ? bookingToEdit.descripcion_actividad : '');
  const [recursosNecesarios, setRecursosNecesarios] = useState(() => bookingToEdit ? bookingToEdit.recursos_necesarios : '');
  const [necesitaApoyo, setNecesitaApoyo] = useState(() => bookingToEdit ? bookingToEdit.necesita_apoyo : false);
  const [prioridad, setPrioridad] = useState<'ALTA' | 'MEDIA' | 'NORMAL' | 'BAJA'>(() => bookingToEdit ? bookingToEdit.prioridad : 'NORMAL');

  // Warnings and calculations
  const [conflictType, setConflictType] = useState<'NONE' | 'BLOQUEO' | 'OVERLAP'>('NONE');
  const [conflictMsg, setConflictMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Auto-detect priority based on Nivel
  useEffect(() => {
    if (nivel === 'Proyecto de Centro (No FP)') {
      setPrioridad('MEDIA');
    } else if (
      nivel === 'Grado Superior FP' ||
      nivel === 'Grado Medio FP' ||
      nivel === 'FP Básica' ||
      nivel === 'Proyecto de Centro de FP' ||
      nivel === 'Prueba técnica / Demostración'
    ) {
      setPrioridad('ALTA');
    } else if (nivel === 'Bachillerato' || nivel === 'ESO') {
      setPrioridad('NORMAL');
    } else {
      setPrioridad('NORMAL');
    }
  }, [nivel]);

  // Realtime conflict checker
  useEffect(() => {
    setConflictType('NONE');
    setConflictMsg('');

    if (!fecha || !horaInicio || !horaFin) return;

    // 0. Check Non-Working Day / School Holidays
    const nonWorking = isNonWorkingDay(fecha);
    if (nonWorking.isNonWorking) {
      setConflictType('BLOQUEO');
      setConflictMsg(`¡ATENCIÓN! La fecha seleccionada es un día no lectivo: ${nonWorking.reason}. No se pueden programar reservas este día.`);
      return;
    }

    // Check configuration limits
    const startHourConfig = config.horario_inicio || '08:00';
    const endHourConfig = config.horario_fin || '22:30';

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

    // 2. Check approved reservations overlap (excluding own booking if editing)
    const reservas = getReservas();
    const overlapRes = reservas.find(r => {
      if (bookingToEdit && r.id_reserva === bookingToEdit.id_reserva) return false;
      if (r.estado !== 'APROBADA' && r.estado !== 'REALIZADA') return false;
      if (r.fecha_actividad !== fecha) return false;
      return checkTimeOverlap(r.hora_inicio, r.hora_fin, horaInicio, horaFin);
    });

    if (overlapRes) {
      setConflictType('OVERLAP');
      setConflictMsg(`¡AVISO DE CONFLICTO! Ya existe una reserva APROBADA de ${overlapRes.profesor} (${overlapRes.grupo} - ${overlapRes.zona_principal}) de ${overlapRes.hora_inicio} a ${overlapRes.hora_fin}. Tu reserva se registrará como PENDIENTE para que la valide el Coordinador.`);
    }
  }, [fecha, horaInicio, horaFin, config, bookingToEdit]);

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

    if (bookingToEdit) {
      const res = updateReserva({
        ...bookingToEdit,
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

      if (res.success) {
        onSuccess('Reserva modificada y actualizada con éxito en el calendario.');
      } else {
        setErrorMsg(res.message || 'Error al actualizar la reserva.');
      }
    } else {
      const { success, message } = addReserva({
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
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden max-w-4xl mx-auto">
      <div className="bg-slate-900 px-6 py-4 flex items-center justify-between no-print text-white border-b border-slate-800">
        <div className="flex items-center space-x-3.5">
          <div className="p-2 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-xl border border-emerald-500/30">
            {bookingToEdit ? <Edit3 className="h-5 w-5 text-emerald-400" /> : <BookOpen className="h-5 w-5 text-emerald-400" />}
          </div>
          <div>
            <h2 className="text-lg font-black tracking-tight">
              {bookingToEdit ? 'Modificar Ficha de Reserva didáctica' : 'Nueva Ficha de Reserva didáctica'}
            </h2>
            <p className="text-xs text-slate-400">
              {bookingToEdit ? `Actualizando reserva #${bookingToEdit.id_reserva}` : 'Planificación curricular Aula ATECA'}
            </p>
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
                className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 rounded-lg text-xs outline-none cursor-pointer font-medium text-slate-800"
              >
                <optgroup label="⭐ Formación Profesional y Tecnológica (P1 · Preferente ATECA)">
                  <option value="Grado Superior FP">Grado Superior FP</option>
                  <option value="Grado Medio FP">Grado Medio FP</option>
                  <option value="FP Básica">FP Básica</option>
                  <option value="Proyecto de Centro de FP">Proyecto de Centro de FP</option>
                  <option value="Prueba técnica / Demostración">Prueba técnica / Demostración</option>
                </optgroup>
                <optgroup label="💡 Proyectos Transversales del Centro (P2 · Proyectos)">
                  <option value="Proyecto de Centro (No FP)">Proyecto de Centro (No FP)</option>
                </optgroup>
                <optgroup label="📚 Enseñanzas Generales (P3 · Ordinaria)">
                  <option value="Bachillerato">Bachillerato</option>
                  <option value="ESO">ESO</option>
                </optgroup>
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
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-1">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-extrabold border shadow-2xs ${
                  prioridad === 'ALTA' ? 'bg-emerald-50 text-emerald-800 border-emerald-200 ring-1 ring-emerald-500/20' :
                  prioridad === 'MEDIA' ? 'bg-indigo-50 text-indigo-800 border-indigo-200 ring-1 ring-indigo-500/20' :
                  'bg-slate-100 text-slate-700 border-slate-200'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${
                    prioridad === 'ALTA' ? 'bg-emerald-500 animate-pulse' :
                    prioridad === 'MEDIA' ? 'bg-indigo-500' : 'bg-slate-400'
                  }`}></span>
                  {prioridad === 'ALTA' ? 'P1 · Preferente FP' :
                   prioridad === 'MEDIA' ? 'P2 · Proyectos' :
                   'P3 · Ordinaria'}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  {prioridad === 'ALTA' ? 'Acceso prioritario ATECA' :
                   prioridad === 'MEDIA' ? 'Actividad de centro' :
                   'Acceso general'}
                </span>
              </div>
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
            <CheckCircle2 className="h-4 w-4" /> {bookingToEdit ? 'Guardar Cambios de la Reserva' : 'Enviar solicitud de Reserva'}
          </button>
        </div>
      </form>
    </div>
  );
}
