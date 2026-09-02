/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { CheckCircle, XCircle, AlertTriangle, FileText, BarChart3, Clock, FileCheck, CheckCircle2, Layers } from 'lucide-react';
import { Reserva, Usuario } from '../types';
import { getReservas, getValoraciones, updateReservaEstado } from '../lib/storage';

interface CoordinatorPanelProps {
  onSelectBookingForReport: (booking: Reserva) => void;
  onRefresh: () => void;
  currentUser: Usuario;
}

export default function CoordinatorPanel({ onSelectBookingForReport, onRefresh, currentUser }: CoordinatorPanelProps) {
  const [observacionesInput, setObservacionesInput] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<'pending' | 'all' | 'unvalued'>('pending');

  const rawReservas = getReservas();
  const valoraciones = getValoraciones();

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
      <div className="flex items-center space-x-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="p-3 bg-slate-900 text-white rounded-lg">
          <BarChart3 className="h-6 w-6 text-emerald-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800">Panel del Coordinador Aula ATECA</h1>
          <p className="text-xs text-slate-500">Aprobaciones, resolución de conflictos y memorias de innovación</p>
        </div>
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
        <div className="flex bg-slate-100 border-b border-slate-200 text-xs font-bold text-slate-500">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-5 py-3 border-r border-slate-200 flex items-center gap-1.5 cursor-pointer transition-colors ${
              activeTab === 'pending' ? 'bg-white text-slate-800 border-b-2 border-b-slate-900' : 'hover:bg-slate-50'
            }`}
          >
            Pendientes de Aprobar ({stats.pendingCount})
            {stats.pendingCount > 0 && <span className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-ping"></span>}
          </button>
          <button
            onClick={() => setActiveTab('unvalued')}
            className={`px-5 py-3 border-r border-slate-200 flex items-center gap-1.5 cursor-pointer transition-colors ${
              activeTab === 'unvalued' ? 'bg-white text-slate-800 border-b-2 border-b-slate-900' : 'hover:bg-slate-50'
            }`}
          >
            Realizadas sin valoración ({unvaluedReservas.length})
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-5 py-3 flex items-center gap-1.5 cursor-pointer transition-colors ${
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
                        <span className="text-slate-400 mx-2">|</span>
                        <span className="text-slate-500 font-medium">{res.departamento} • {res.grupo} • {res.nivel}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="px-2 py-0.5 bg-slate-900 text-white rounded text-[10px] font-bold">
                          {res.fecha_actividad.split('-').reverse().join('/')} (Horario: {res.hora_inicio} - {res.hora_fin})
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          res.prioridad === 'ALTA' ? 'bg-red-50 text-red-700' :
                          res.prioridad === 'MEDIA' ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'
                        }`}>
                          Prioridad: {res.prioridad}
                        </span>
                      </div>
                    </div>

                    {/* Didactic data details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      <div>
                        <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Eje temático y mÓdulo</p>
                        <p className="text-slate-700 font-semibold mt-1">{res.modulo_materia_area}</p>
                        <p className="text-slate-500 mt-1">Zona: <strong>{res.zona_principal}</strong> ({res.numero_alumnos} alumnos)</p>
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
                      </div>
                    </div>
                  </div>
                ))
              )}
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
                          <p className="font-bold text-slate-800">{res.profesor}</p>
                          <p className="text-[10px] text-slate-500">{res.departamento}</p>
                        </td>
                        <td className="p-3">
                          <p className="font-semibold text-slate-600">{res.fecha_actividad.split('-').reverse().join('/')}</p>
                          <p className="text-[10px] text-slate-400">{res.grupo} • {res.modulo_materia_area}</p>
                        </td>
                        <td className="p-3 font-semibold text-slate-700">{res.zona_principal}</td>
                        <td className="p-3 text-center font-bold text-slate-500">{res.necesita_apoyo ? 'SÍ' : 'NO'}</td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                            res.prioridad === 'ALTA' ? 'bg-red-50 text-red-700' :
                            res.prioridad === 'MEDIA' ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'
                          }`}>
                            {res.prioridad}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getBadgeColor(res.estado)}`}>
                            {res.estado}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => onSelectBookingForReport(res)}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-white rounded text-[10px] font-bold cursor-pointer inline-flex items-center gap-1 shadow-sm"
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
