/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { CheckCircle, XCircle, AlertTriangle, FileText, BarChart3, Clock, FileCheck, CheckCircle2, Layers, Settings, GraduationCap, UserPlus, Lock, Search, ArrowLeft } from 'lucide-react';
import { Reserva, Usuario, isFpDepartment, getAllDepartments } from '../types';
import { getReservas, getValoraciones, updateReservaEstado, getUsuarios, toggleUserCompetencias, isTeacherAccredited, addUsuario } from '../lib/storage';
import { notifyReservaAprobada, notifyReservaRechazada } from '../lib/emailService';

interface CoordinatorPanelProps {
  onSelectBookingForReport: (booking: Reserva) => void;
  onSelectBooking?: (booking: Reserva) => void;
  onRefresh: () => void;
  currentUser: Usuario;
  onBackToCalendar?: () => void;
}

export default function CoordinatorPanel({ onSelectBookingForReport, onSelectBooking, onRefresh, currentUser, onBackToCalendar }: CoordinatorPanelProps) {
  const [observacionesInput, setObservacionesInput] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<'pending' | 'teachers' | 'unvalued' | 'all'>('pending');
  const [teacherSearch, setTeacherSearch] = useState('');
  const [newTeacherName, setNewTeacherName] = useState('');
  const [newTeacherEmail, setNewTeacherEmail] = useState('');
  const [newTeacherDept, setNewTeacherDept] = useState('Administración y Gestión');
  const [newTeacherTurno, setNewTeacherTurno] = useState<'Mañana' | 'Tarde-Noche' | 'Ambos'>('Ambos');
  const [newTeacherAcreditado, setNewTeacherAcreditado] = useState(false);
  const [teacherSuccessMsg, setTeacherSuccessMsg] = useState('');

  const canAuthorize = currentUser.rol === 'ADMIN' || currentUser.permisos_coordinador?.autorizar_reservas !== false;
  const canCreateUsers = currentUser.rol === 'ADMIN' || !!currentUser.permisos_coordinador?.crear_usuarios;

  const rawReservas = getReservas();
  const valoraciones = getValoraciones();
  const allUsers = getUsuarios();
  const allDepts = getAllDepartments();

  const handleAddTeacherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canCreateUsers) return;

    if (!newTeacherEmail.toLowerCase().endsWith('@gobiernodecanarias.org') &&
        newTeacherEmail.toLowerCase() !== 'josedpdiaz@gmail.com' &&
        newTeacherEmail.toLowerCase() !== 'phopsys@gmail.com') {
      alert('Solo se admiten correos institucionales (@gobiernodecanarias.org) o cuentas de prueba autorizadas.');
      return;
    }

    addUsuario({
      nombre: newTeacherName.trim(),
      email: newTeacherEmail.trim().toLowerCase(),
      rol: 'PROFESOR',
      departamento: newTeacherDept,
      turno: newTeacherTurno,
      activo: true,
      formacion_competencias: newTeacherAcreditado,
    });

    setTeacherSuccessMsg(`Docente ${newTeacherName.trim()} registrado correctamente.`);
    setTimeout(() => setTeacherSuccessMsg(''), 4000);
    setNewTeacherName('');
    setNewTeacherEmail('');
    setNewTeacherDept('Administración y Gestión');
    setNewTeacherTurno('Ambos');
    setNewTeacherAcreditado(false);
    onRefresh();
  };

  // Filter lists
  const pendingReservas = useMemo(() => {
    return rawReservas.filter(r => r.estado === 'PENDIENTE');
  }, [rawReservas]);

  const activeReservas = useMemo(() => {
    return rawReservas.filter(r => r.estado === 'APROBADA');
  }, [rawReservas]);

  const finishedReservas = useMemo(() => {
    return rawReservas.filter(r => r.estado === 'REALIZADA');
  }, [rawReservas]);

  const unvaluedReservas = useMemo(() => {
    return rawReservas.filter(r => r.estado === 'REALIZADA' && !valoraciones.some(v => v.id_reserva === r.id_reserva));
  }, [rawReservas, valoraciones]);

  // Statistics calculations
  const stats = useMemo(() => {
    const total = rawReservas.length;
    const pendingCount = pendingReservas.length;
    const approvedCount = activeReservas.length;
    const finishedCount = finishedReservas.length;
    const rejectedCount = rawReservas.filter(r => r.estado === 'RECHAZADA').length;
    const cancelledCount = rawReservas.filter(r => r.estado === 'CANCELADA').length;

    // Use of rooms count
    const usageZones: Record<string, number> = {
      "Multimedia": 0,
      "Vídeo y audio": 0,
      "Impresión 3D": 0,
      "Realidad virtual y simuladores": 0,
    };

    // Use of educational levels
    let fpCount = 0;
    let otherCount = 0;

    rawReservas.forEach(r => {
      if (usageZones[r.zona_principal] !== undefined) {
        usageZones[r.zona_principal] += 1;
      }
      if (r.nivel.includes('FP') || r.nivel.toLowerCase().includes('profesional')) {
        fpCount++;
      } else {
        otherCount++;
      }
    });

    return {
      total,
      pendingCount,
      approvedCount,
      finishedCount,
      rejectedCount,
      cancelledCount,
      usageZones,
      fpPercentage: total > 0 ? Math.round((fpCount / total) * 100) : 0,
      otherPercentage: total > 0 ? Math.round((otherCount / total) * 100) : 0,
    };
  }, [rawReservas, pendingReservas, activeReservas, finishedReservas]);

  const handleAction = (id: string, nuevoEstado: 'APROBADA' | 'RECHAZADA' | 'CANCELADA', obs: string) => {
    updateReservaEstado(id, nuevoEstado, obs);

    // Disparar notificación por correo al docente solicitante
    const targetBooking = rawReservas.find(r => r.id_reserva === id);
    if (targetBooking) {
      const allUsers = getUsuarios();
      const requestingUser = allUsers.find(u => u.email.toLowerCase() === targetBooking.email.toLowerCase()) || {
        id_usuario: 'temp',
        nombre: targetBooking.profesor,
        email: targetBooking.email,
        rol: 'PROFESOR' as const,
        departamento: targetBooking.departamento,
        turno: 'Ambos' as const,
        activo: true,
      };

      if (nuevoEstado === 'APROBADA') {
        notifyReservaAprobada(targetBooking, requestingUser, obs);
      } else if (nuevoEstado === 'RECHAZADA') {
        notifyReservaRechazada(targetBooking, requestingUser, obs || 'Ajuste de prioridades formativas o conflicto de calendario.');
      }
    }

    onRefresh();
    // clear input
    setObservacionesInput(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const getBadgeColor = (estado: string) => {
    switch (estado) {
      case 'APROBADA': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'PENDIENTE': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'RECHAZADA': return 'bg-red-50 text-red-700 border-red-100';
      case 'CANCELADA': return 'bg-slate-50 text-slate-700 border-slate-100';
      case 'REALIZADA': return 'bg-sky-50 text-sky-700 border-sky-100';
      default: return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-slate-900 text-white rounded-lg">
            <BarChart3 className="h-6 w-6 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Panel del Coordinador Aula ATECA</h1>
            <p className="text-xs text-slate-500">Aprobaciones, resolución de conflictos y memorias de innovación</p>
          </div>
        </div>
        {onBackToCalendar && (
          <button
            onClick={onBackToCalendar}
            className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs self-start sm:self-auto shrink-0"
            title="Volver al calendario / almanaque"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver al Calendario</span>
          </button>
        )}
      </div>

      {/* STATISTICS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* KPI 1: Pendientes */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between shadow-xs">
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Pendientes de validar</p>
            <p className="text-2xl font-black text-amber-600 mt-1">{stats.pendingCount}</p>
          </div>
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg">
            <Clock className="w-5 h-5 animate-pulse" />
          </div>
        </div>

        {/* KPI 2: Aprobadas próximas */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between shadow-xs">
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Próximas aprobadas</p>
            <p className="text-2xl font-black text-emerald-600 mt-1">{stats.approvedCount}</p>
          </div>
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 3: Realizadas / Memorias */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between shadow-xs">
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Realizadas completadas</p>
            <p className="text-2xl font-black text-sky-600 mt-1">{stats.finishedCount}</p>
          </div>
          <div className="p-2.5 bg-sky-50 text-sky-600 rounded-lg">
            <FileCheck className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 4: Sin Valorar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between shadow-xs">
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Pendientes de valoración</p>
            <p className="text-2xl font-black text-rose-600 mt-1">{unvaluedReservas.length}</p>
          </div>
          <div className="p-2.5 bg-rose-50 text-rose-600 rounded-lg">
            <FileText className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* METOLOGIES & FP WEIGHTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Curricular priorities weights */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-sm">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Layers className="w-4 h-4 text-slate-500" /> Distribución curricular de uso
          </h2>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                <span>Formación Profesional (Prioritaria)</span>
                <span>{stats.fpPercentage}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div style={{ width: `${stats.fpPercentage}%` }} className="bg-slate-800 h-full rounded-full" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                <span>Otros (ESO, Bachillerato, Proyectos)</span>
                <span>{stats.otherPercentage}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div style={{ width: `${stats.otherPercentage}%` }} className="bg-emerald-600 h-full rounded-full" />
              </div>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-[11px] leading-relaxed text-slate-500">
            <strong>Mensaje de prioridades Aula ATECA:</strong><br />
            “El espacio de innovación canario está destinado a la capacitación del alumnado de FP, priorizándose sus módulos específicos, sin excluir al resto de etapas si existieran huecos libres confirmados.”
          </div>
        </div>

        {/* Zones distribution chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-sm">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-400">Actividades estimadas por zonas del Aula ATECA</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.keys(stats.usageZones).map((zone) => {
              const occurrences = stats.usageZones[zone];
              const percentage = stats.total > 0 ? Math.round((occurrences / stats.total) * 100) : 0;
              return (
                <div key={zone} className="border border-slate-100 rounded-lg p-3 bg-slate-50/50 flex flex-col justify-between">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-700">{zone}</span>
                    <span className="bg-slate-200 px-2 py-0.5 rounded-full text-[10px] font-black text-slate-700">{occurrences} acts</span>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div style={{ width: `${percentage}%` }} className="bg-slate-800 h-full rounded-full" />
                    </div>
                    <span className="text-[11px] font-mono font-bold text-slate-500">{percentage}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* CORE WORKFLOW LISTS */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        {/* Navigation Tabs */}
        <div className="flex bg-slate-100 border-b border-slate-200 text-xs font-bold text-slate-500 overflow-x-auto">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-5 py-3 border-r border-slate-200 flex items-center gap-1.5 cursor-pointer whitespace-nowrap transition-colors ${
              activeTab === 'pending' ? 'bg-white text-slate-800 border-b-2 border-b-slate-900' : 'hover:bg-slate-50'
            }`}
          >
            Pendientes de Aprobar ({stats.pendingCount})
            {stats.pendingCount > 0 && <span className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-ping"></span>}
          </button>
          <button
            onClick={() => setActiveTab('teachers')}
            className={`px-5 py-3 border-r border-slate-200 flex items-center gap-1.5 cursor-pointer whitespace-nowrap transition-colors ${
              activeTab === 'teachers' ? 'bg-white text-slate-800 border-b-2 border-b-slate-900' : 'hover:bg-slate-50'
            }`}
          >
            <GraduationCap className="w-4 h-4 text-amber-600" />
            Docentes y Acreditaciones ({allUsers.length})
          </button>
          <button
            onClick={() => setActiveTab('unvalued')}
            className={`px-5 py-3 border-r border-slate-200 flex items-center gap-1.5 cursor-pointer whitespace-nowrap transition-colors ${
              activeTab === 'unvalued' ? 'bg-white text-slate-800 border-b-2 border-b-slate-900' : 'hover:bg-slate-50'
            }`}
          >
            Realizadas sin valoración ({unvaluedReservas.length})
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-5 py-3 flex items-center gap-1.5 cursor-pointer whitespace-nowrap transition-colors ${
              activeTab === 'all' ? 'bg-white text-slate-800 border-b-2 border-b-slate-900' : 'hover:bg-slate-50'
            }`}
          >
            Histórico general ({rawReservas.length})
          </button>
        </div>

        {/* Tab content list */}
        <div className="p-4">
          {activeTab === 'pending' && (
            <div className="space-y-4">
              {!canAuthorize && (
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3 text-amber-900 text-xs">
                  <Lock className="w-5 h-5 text-amber-600 shrink-0" />
                  <div>
                    <strong className="font-bold">Permiso de autorización restringido:</strong> Tu perfil de coordinador está configurado en modo consulta. La aprobación o rechazo de solicitudes de reserva pendientes requiere autorización expresa del administrador.
                  </div>
                </div>
              )}

              {pendingReservas.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  Aún no hay nuevas reservas en estado PENDIENTE. ¡El aula está al corriente!
                </div>
              ) : (
                pendingReservas.map(res => (
                  <div key={res.id_reserva} className="border border-slate-200 rounded-xl p-4 bg-slate-50/20 space-y-4">
                    {/* Header info */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-100 pb-2 text-xs">
                      <div>
                        <span className="font-extrabold text-slate-800 text-sm">{res.profesor}</span>
                        {isTeacherAccredited(res.email || res.profesor) && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-300 ml-2" title="Docente con competencias básicas ATECA acreditadas">
                            <GraduationCap className="w-2.5 h-2.5 text-amber-700" /> Acreditado
                          </span>
                        )}
                        <span className="text-slate-400 mx-2">|</span>
                        <span className="text-slate-500 font-medium">{res.departamento} • {res.grupo} • {res.nivel}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="px-2 py-0.5 bg-slate-900 text-white rounded text-[10px] font-bold">
                          {res.fecha_actividad.split('-').reverse().join('/')} (Horario: {res.hora_inicio} - {res.hora_fin})
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                          res.prioridad === 'ALTA' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                          res.prioridad === 'MEDIA' ? 'bg-indigo-50 text-indigo-800 border-indigo-200' :
                          'bg-slate-100 text-slate-700 border-slate-200'
                        }`}>
                          {res.prioridad === 'ALTA' ? 'P1 · Preferente FP' :
                           res.prioridad === 'MEDIA' ? 'P2 · Proyectos' :
                           'P3 · Ordinaria'}
                        </span>
                      </div>
                    </div>

                    {/* Didactic data details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      <div>
                        <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Eje temático y mÓdulo</p>
                        <p className="text-slate-700 font-semibold mt-1">{res.modulo_materia_area}</p>
                        <p className="text-slate-500 mt-1">Zona: <strong>{res.zona_principal}</strong> ({res.numero_alumnos} alumnos máx 12)</p>
                      </div>
                      <div>
                        <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Objetivo pedagÓgico</p>
                        <p className="text-slate-600 italic mt-1 leading-relaxed">"{res.objetivo_didactico}"</p>
                      </div>
                      <div>
                        <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Descripción actividad</p>
                        <p className="text-slate-600 mt-1 leading-relaxed">{res.descripcion_actividad}</p>
                      </div>
                    </div>

                    {/* Resources & coordinator aid */}
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-[11px] text-slate-600 grid grid-cols-1 md:grid-cols-2 gap-2">
                      <p>🛠️ <strong>Recursos requeridos:</strong> {res.recursos_necesarios || "Ninguno especificado"}</p>
                      <p>👥 <strong>¿Apoyo presencial?</strong> {res.necesita_apoyo ? "🚨 Sí, requiere soporte del coordinador" : "No requiere presencia física"}</p>
                    </div>

                    {/* Comments and approval block */}
                    <div className="flex flex-col md:flex-row gap-3 pt-2">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={observacionesInput[res.id_reserva] || ''}
                          onChange={(e) => setObservacionesInput(p => ({ ...p, [res.id_reserva]: e.target.value }))}
                          placeholder="Observaciones de autorización (enviadas al profesor, ej: Recordar recoger filamentos)"
                          className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-slate-400 rounded-lg text-xs outline-none"
                        />
                      </div>
                      <div className="flex gap-2 self-end md:self-auto flex-wrap">
                        {onSelectBooking && (
                          <button
                            onClick={() => onSelectBooking(res)}
                            className="px-3 py-2 border border-indigo-200 hover:bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                            title="Ver ficha completa de la reserva"
                          >
                            <Settings className="w-4 h-4" /> Ficha
                          </button>
                        )}
                        {canAuthorize ? (
                          <>
                            <button
                              onClick={() => handleAction(res.id_reserva, 'CANCELADA', observacionesInput[res.id_reserva] || 'Reserva cancelada por el coordinador.')}
                              className="px-3 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                            >
                              <AlertTriangle className="w-4 h-4" /> Cancelar
                            </button>
                            <button
                              onClick={() => handleAction(res.id_reserva, 'RECHAZADA', observacionesInput[res.id_reserva] || 'Reserva desestimada por el coordinador debido a solapamiento o necesidades del centro.')}
                              className="px-3 py-2 border border-red-200 hover:bg-red-50 text-red-600 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                            >
                              <XCircle className="w-4 h-4" /> Rechazar
                            </button>
                            <button
                              onClick={() => handleAction(res.id_reserva, 'APROBADA', observacionesInput[res.id_reserva] || 'Autorizada por el Coordinador Ateca.')}
                              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-white rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-xs"
                            >
                              <CheckCircle className="w-4 h-4 text-emerald-400" /> Aprobar reserva
                            </button>
                          </>
                        ) : (
                          <span className="px-3 py-2 bg-slate-100 text-slate-400 border border-slate-200 rounded-lg text-xs font-bold inline-flex items-center gap-1.5" title="Sin permiso para aprobar o rechazar">
                            <Lock className="w-3.5 h-3.5" /> Requiere permiso de autorización
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'teachers' && (
            <div className="space-y-5">
              {/* Formulario de registro de docentes si tiene permiso crear_usuarios */}
              {canCreateUsers ? (
                <form onSubmit={handleAddTeacherSubmit} className="bg-slate-50 p-4 border border-slate-200 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
                      <UserPlus className="w-4 h-4 text-slate-500" /> Dar de alta nuevo docente
                    </h3>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                      Permiso de Coordinación Activo
                    </span>
                  </div>
                  {teacherSuccessMsg && (
                    <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 font-medium">
                      ✓ {teacherSuccessMsg}
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Nombre y Apellidos</label>
                      <input
                        type="text"
                        required
                        value={newTeacherName}
                        onChange={(e) => setNewTeacherName(e.target.value)}
                        placeholder="Ej: Laura Palmer"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Email Institucional</label>
                      <input
                        type="email"
                        required
                        value={newTeacherEmail}
                        onChange={(e) => setNewTeacherEmail(e.target.value)}
                        placeholder="docente@gobiernodecanarias.org"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg outline-none"
                      />
                      <p className="text-[10px] text-slate-500 mt-1 leading-tight">
                        Matricula con @gobiernodecanarias.org (avisos a @canariaseducacion.es).
                      </p>
                    </div>
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Departamento</label>
                      <select
                        value={newTeacherDept}
                        onChange={(e) => setNewTeacherDept(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg outline-none font-medium cursor-pointer"
                      >
                        <optgroup label="⭐ Ciclos de FP (Prioridad P1)">
                          {allDepts.filter(d => d.isFP).map(d => (
                            <option key={d.id} value={d.name}>{d.name}</option>
                          ))}
                        </optgroup>
                        <optgroup label="📚 Secundaria / Bachillerato (P2/P3)">
                          {allDepts.filter(d => !d.isFP).map(d => (
                            <option key={d.id} value={d.name}>{d.name}</option>
                          ))}
                        </optgroup>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Turno</label>
                      <div className="flex gap-2">
                        <select
                          value={newTeacherTurno}
                          onChange={(e) => setNewTeacherTurno(e.target.value as any)}
                          className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg outline-none font-medium cursor-pointer"
                        >
                          <option value="Ambos">Ambos</option>
                          <option value="Mañana">Mañana</option>
                          <option value="Tarde-Noche">Tarde-Noche</option>
                        </select>
                        <button
                          type="submit"
                          className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg text-xs cursor-pointer shrink-0 transition-colors"
                        >
                          Registrar
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="pt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-amber-900 font-medium">
                      <input
                        type="checkbox"
                        checked={newTeacherAcreditado}
                        onChange={(e) => setNewTeacherAcreditado(e.target.checked)}
                        className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500 cursor-pointer"
                      />
                      <GraduationCap className="w-4 h-4 text-amber-600" />
                      <span>Docente con competencias básicas ATECA acreditadas</span>
                    </label>
                  </div>
                </form>
              ) : (
                <div className="p-3.5 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-slate-500 text-xs flex items-center gap-2.5">
                  <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>El alta de nuevos usuarios está reservada al administrador o a coordinadores con permiso concedido por la administración.</span>
                </div>
              )}

              {/* Barra de búsqueda e información */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={teacherSearch}
                    onChange={(e) => setTeacherSearch(e.target.value)}
                    placeholder="Buscar docente por nombre, email o departamento..."
                    className="w-full pl-9 pr-4 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-slate-400"
                  />
                </div>
                <div className="text-xs text-slate-600 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-amber-600" />
                  <span>Haz clic en la insignia para activar o desactivar la acreditación en competencias ATECA.</span>
                </div>
              </div>

              {/* Tabla de Docentes y Acreditaciones */}
              <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-2xs">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-3">Docente</th>
                      <th className="p-3">Email Institucional</th>
                      <th className="p-3">Departamento</th>
                      <th className="p-3 text-center">Turno</th>
                      <th className="p-3 text-center">Rol</th>
                      <th className="p-3 text-center">Acreditación ATECA</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {allUsers
                      .filter(u => {
                        if (!teacherSearch.trim()) return true;
                        const term = teacherSearch.toLowerCase();
                        return u.nombre.toLowerCase().includes(term) ||
                               u.email.toLowerCase().includes(term) ||
                               (u.departamento && u.departamento.toLowerCase().includes(term));
                      })
                      .map(usr => (
                        <tr key={usr.id_usuario} className="hover:bg-slate-50/50">
                          <td className="p-3 font-bold text-slate-800">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span>{usr.nombre}</span>
                              {usr.formacion_competencias && (
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                                  <GraduationCap className="w-2.5 h-2.5 text-amber-700" /> Acreditado
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-3 font-mono text-slate-500 text-[11px]">{usr.email}</td>
                          <td className="p-3 font-medium text-slate-600">
                            <div className="flex items-center gap-1.5">
                              <span>{usr.departamento || 'General'}</span>
                              {isFpDepartment(usr.departamento) ? (
                                <span className="text-[9px] bg-emerald-50 text-emerald-700 font-bold px-1 py-0.2 rounded border border-emerald-200">FP</span>
                              ) : (
                                <span className="text-[9px] bg-amber-50 text-amber-700 font-medium px-1 py-0.2 rounded border border-amber-200">P2/P3</span>
                              )}
                            </div>
                          </td>
                          <td className="p-3 text-center font-medium text-slate-500">{usr.turno || 'Ambos'}</td>
                          <td className="p-3 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${usr.rol === 'ADMIN' ? 'bg-purple-100 text-purple-700' : usr.rol === 'COORDINADOR' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>
                              {usr.rol}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <button
                              type="button"
                              onClick={() => {
                                toggleUserCompetencias(usr.id_usuario);
                                onRefresh();
                              }}
                              title={usr.formacion_competencias ? "Docente acreditado en ATECA (Clic para alternar)" : "Docente sin acreditar (Clic para alternar)"}
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-all border ${
                                usr.formacion_competencias
                                  ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100 shadow-2xs'
                                  : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100 hover:text-slate-600'
                              }`}
                            >
                              <GraduationCap className={`w-3.5 h-3.5 ${usr.formacion_competencias ? 'text-amber-600' : 'text-slate-400'}`} />
                              {usr.formacion_competencias ? '🎓 Acreditado' : 'Sin Acreditar'}
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'unvalued' && (
            <div className="space-y-4">
              {unvaluedReservas.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  No hay clases realizadas pendientes de memoria didáctica. ¡Buen trabajo!
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                        <th className="p-3">Docente responsable</th>
                        <th className="p-3">Materia / Grupo</th>
                        <th className="p-3">Fecha actividad</th>
                        <th className="p-3">Zona ATECA</th>
                        <th className="p-3 text-center">Estado</th>
                        <th className="p-3 text-right">Acción recordatorio</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {unvaluedReservas.map(res => (
                        <tr key={res.id_reserva} className="hover:bg-slate-50/50">
                          <td className="p-3 font-semibold text-slate-800">{res.profesor}</td>
                          <td className="p-3 text-slate-500">{res.modulo_materia_area} ({res.grupo})</td>
                          <td className="p-3 font-medium text-slate-600">{res.fecha_actividad.split('-').reverse().join('/')}</td>
                          <td className="p-3 font-medium text-slate-700">{res.zona_principal}</td>
                          <td className="p-3 text-center"><span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded-full font-bold">Sin valorar</span></td>
                          <td className="p-3 text-right">
                            <a
                              href={`mailto:${res.email}?subject=Recordatorio: Valoracion didactica Aula ATECA&body=Hola ${res.profesor}, por favor completa la ficha de valoracion de tu actividad del dia ${res.fecha_actividad} en la aplicacion Gestor ATECA para poder emitir el informe PDF correspondiente.`}
                              className="px-2.5 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold rounded text-[10px]"
                            >
                              Recordar por Email
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'all' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                    <th className="p-3">Docente</th>
                    <th className="p-3">Fecha y Grupo</th>
                    <th className="p-3">Zona</th>
                    <th className="p-3 text-center">Apoyo</th>
                    <th className="p-3 text-center">Prioridad</th>
                    <th className="p-3 text-center">Estado</th>
                    <th className="p-3 text-right">Informe</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {rawReservas.map((res) => {
                    const hasVal = valoraciones.some(v => v.id_reserva === res.id_reserva);

                    return (
                      <tr key={res.id_reserva} className="hover:bg-slate-50/50">
                        <td className="p-3">
                          <p className="font-bold text-slate-800 flex items-center gap-1.5 flex-wrap">
                            <span>{res.profesor}</span>
                            {isTeacherAccredited(res.email || res.profesor) && (
                              <span className="inline-flex items-center gap-0.5 px-1 py-0.2 rounded-full text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-300" title="Acreditado en competencias básicas ATECA">
                                <GraduationCap className="w-2.5 h-2.5 text-amber-700" /> Acreditado
                              </span>
                            )}
                          </p>
                          <p className="text-[10px] text-slate-500">{res.departamento}</p>
                        </td>
                        <td className="p-3">
                          <p className="font-semibold text-slate-600">{res.fecha_actividad.split('-').reverse().join('/')}</p>
                          <p className="text-[10px] text-slate-400">{res.grupo} • {res.modulo_materia_area}</p>
                        </td>
                        <td className="p-3 font-semibold text-slate-700">{res.zona_principal}</td>
                        <td className="p-3 text-center font-bold text-slate-500">{res.necesita_apoyo ? 'SÍ' : 'NO'}</td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold border ${
                            res.prioridad === 'ALTA' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                            res.prioridad === 'MEDIA' ? 'bg-indigo-50 text-indigo-800 border-indigo-200' :
                            'bg-slate-100 text-slate-700 border-slate-200'
                          }`}>
                            {res.prioridad === 'ALTA' ? 'P1 · FP' :
                             res.prioridad === 'MEDIA' ? 'P2 · Proyectos' :
                             'P3 · Ordinaria'}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getBadgeColor(res.estado)}`}>
                            {res.estado}
                          </span>
                        </td>
                        <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                          {onSelectBooking && (
                            <button
                              onClick={() => onSelectBooking(res)}
                              className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 active:bg-indigo-200 text-indigo-700 border border-indigo-200 rounded text-[10px] font-bold cursor-pointer inline-flex items-center gap-1 shadow-xs transition-colors"
                              title="Gestionar reserva (cambiar estado, reactivar o eliminar)"
                            >
                              <Settings className="w-3.5 h-3.5" /> Gestionar
                            </button>
                          )}
                          <button
                            onClick={() => onSelectBookingForReport(res)}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-white rounded text-[10px] font-bold cursor-pointer inline-flex items-center gap-1 shadow-sm transition-colors"
                          >
                            <FileText className="w-3.5 h-3.5 text-emerald-400" /> Informe PDF
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
