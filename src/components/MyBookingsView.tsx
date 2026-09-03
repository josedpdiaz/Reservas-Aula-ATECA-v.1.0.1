/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Award, Calendar, Clock, PlusCircle, Search, LayoutGrid, List, 
  Layers, CheckCircle2, ChevronDown, ChevronUp, ArrowUpDown, Filter, Eye,
  Edit3, CalendarX, HeartHandshake, Trash2
} from 'lucide-react';
import { Reserva, Usuario, Valoracion } from '../types';
import { updateReserva, deleteReserva, cancelReserva } from '../lib/storage';

interface MyBookingsViewProps {
  currentUser: Usuario;
  bookings: Reserva[];
  valoraciones: Valoracion[];
  onSelectBooking: (booking: Reserva) => void;
  onNewBooking: () => void;
  onEditBooking: (booking: Reserva) => void;
  onValuateBooking: (booking: Reserva) => void;
  onViewDetail: (booking: Reserva) => void;
  onRefresh: () => void;
}

export default function MyBookingsView({
  currentUser,
  bookings,
  valoraciones,
  onSelectBooking,
  onNewBooking,
  onEditBooking,
  onValuateBooking,
  onViewDetail,
  onRefresh,
}: MyBookingsViewProps) {
  // View mode: 'cards' (etiquetas/tarjetas) vs 'list' (lista con filtrado)
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');
  
  // Filters & search
  const [statusFilter, setStatusFilter] = useState<string>('TODAS');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Modal state for releasing / cancelling booking
  const [bookingToRelease, setBookingToRelease] = useState<Reserva | null>(null);
  const [releaseMode, setReleaseMode] = useState<'cancel' | 'delete'>('cancel');
  const [releaseMotivo, setReleaseMotivo] = useState('');

  // Filter only current user's bookings
  const myAllBookings = useMemo(() => {
    return bookings.filter(b => b.email === currentUser.email);
  }, [bookings, currentUser.email]);

  const myBookingsCount = myAllBookings.length;
  const myPendingValuationsCount = myAllBookings.filter(
    b => b.estado === 'REALIZADA' && !valoraciones.some(v => v.id_reserva === b.id_reserva)
  ).length;

  // Filtered and sorted bookings
  const filteredBookings = useMemo(() => {
    return myAllBookings.filter(res => {
      const val = valoraciones.find(v => v.id_reserva === res.id_reserva);

      // Status filter
      if (statusFilter === 'SIN_VALORAR') {
        if (res.estado !== 'REALIZADA' || val) return false;
      } else if (statusFilter !== 'TODAS') {
        if (res.estado !== statusFilter) return false;
      }

      // Search query
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matMatch = res.modulo_materia_area.toLowerCase().includes(q);
        const grpMatch = res.grupo.toLowerCase().includes(q);
        const objMatch = res.objetivo_didactico.toLowerCase().includes(q);
        const dateMatch = res.fecha_actividad.includes(q);
        const zoneMatch = res.zona_principal.toLowerCase().includes(q);
        if (!matMatch && !grpMatch && !objMatch && !dateMatch && !zoneMatch) return false;
      }

      return true;
    }).sort((a, b) => {
      const dateA = a.fecha_actividad + ' ' + a.hora_inicio;
      const dateB = b.fecha_actividad + ' ' + b.hora_inicio;
      return sortOrder === 'desc' ? dateB.localeCompare(dateA) : dateA.localeCompare(dateB);
    });
  }, [myAllBookings, valoraciones, statusFilter, searchQuery, sortOrder]);

  const getBadgeStyle = (estado: string) => {
    switch (estado) {
      case 'APROBADA': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'PENDIENTE': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'REALIZADA': return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'RECHAZADA': return 'bg-rose-50 text-rose-700 border-rose-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner with Stats & View Switcher */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-lg font-black tracking-tight text-slate-900">Mi Agenda y Memorias Docentes</h2>
          <p className="text-xs text-slate-500 mt-0.5">Control de tus actividades didácticas y justificaciones en el Aula ATECA</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Stats Pills */}
          <div className="flex gap-2 text-xs font-mono font-bold">
            <div className="bg-slate-50 border border-slate-200 px-3.5 py-1.5 rounded-xl text-center">
              <span className="text-slate-400 block text-[9px] uppercase">Tus Reservas</span>
              <span className="text-base text-slate-800 font-black leading-tight">{myBookingsCount}</span>
            </div>
            <div className="bg-rose-50 border border-rose-100 px-3.5 py-1.5 rounded-xl text-center text-rose-700">
              <span className="text-rose-500 block text-[9px] uppercase">Sin Valorar</span>
              <span className="text-base text-rose-700 font-black leading-tight">{myPendingValuationsCount}</span>
            </div>
          </div>

          {/* View Mode Toggle: Cards (Etiquetas) vs List */}
          <div className="flex bg-slate-100/80 p-1 rounded-xl border border-slate-200/60 text-xs font-bold">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'cards' 
                  ? 'bg-white text-slate-900 shadow-xs font-extrabold' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Etiquetas / Tarjetas</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'list' 
                  ? 'bg-white text-slate-900 shadow-xs font-extrabold' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Lista Filtrada</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 border border-slate-200/80 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-3 text-xs">
          {/* Status Filter */}
          <div>
            <label className="block text-slate-500 font-bold mb-1 flex items-center gap-1 text-[11px] uppercase tracking-wide">
              <Filter className="w-3 h-3 text-slate-400" /> Filtrar por estado
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-xl outline-none font-medium text-slate-700 cursor-pointer transition-all"
            >
              <option value="TODAS">Todos los estados ({myAllBookings.length})</option>
              <option value="APROBADA">Aprobadas</option>
              <option value="PENDIENTE">Pendientes de validación</option>
              <option value="REALIZADA">Realizadas</option>
              <option value="SIN_VALORAR">⚠️ Pendientes de Valorar ({myPendingValuationsCount})</option>
              <option value="RECHAZADA">Rechazadas</option>
            </select>
          </div>

          {/* Search text */}
          <div className="sm:col-span-2">
            <label className="block text-slate-500 font-bold mb-1 flex items-center gap-1 text-[11px] uppercase tracking-wide">
              <Search className="w-3 h-3 text-slate-400" /> Buscar en tus actividades
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por módulo, grupo, objetivo o fecha (AAAA-MM-DD)..."
                className="w-full pl-8 pr-3 py-2 bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-xl outline-none text-xs transition-all font-medium text-slate-700 placeholder:text-slate-400"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>

          {/* Sort order */}
          <div>
            <label className="block text-slate-500 font-bold mb-1 flex items-center gap-1 text-[11px] uppercase tracking-wide">
              <ArrowUpDown className="w-3 h-3 text-slate-400" /> Ordenar por fecha
            </label>
            <button
              onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
              className="w-full px-3 py-2 bg-slate-50/80 hover:bg-slate-100 border border-slate-200 rounded-xl text-left font-medium text-slate-700 flex items-center justify-between cursor-pointer transition-colors"
            >
              <span>{sortOrder === 'desc' ? 'Más recientes primero' : 'Más antiguas primero'}</span>
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content: Empty State vs Cards vs List */}
      {filteredBookings.length === 0 ? (
        <div className="bg-white border border-slate-200 text-slate-400 p-12 rounded-2xl text-center text-xs leading-relaxed space-y-3 shadow-xs">
          <Award className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="font-medium text-slate-600 text-sm">No se encontraron actividades con los filtros seleccionados.</p>
          <p className="text-slate-400 text-xs max-w-sm mx-auto">Prueba a limpiar la búsqueda o crea una nueva solicitud de reserva didáctica en el Aula ATECA.</p>
          <button
            onClick={onNewBooking}
            className="mt-2 bg-slate-900 hover:bg-slate-800 text-white font-bold px-5 py-2.5 text-xs rounded-xl transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
          >
            <PlusCircle className="w-4 h-4" /> Solicitar Reserva
          </button>
        </div>
      ) : viewMode === 'cards' ? (
        /* VISTA 1: EN ETIQUETAS / TARJETAS (CARDS) */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredBookings.map((res) => {
            const val = valoraciones.find(v => v.id_reserva === res.id_reserva);
            
            return (
              <div 
                key={res.id_reserva} 
                className="bg-white border border-slate-200/80 rounded-2xl p-5 hover:shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-[10px] bg-slate-900 text-white font-mono font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider flex items-center gap-1.5 shadow-2xs">
                      <Calendar className="w-3 h-3 text-emerald-400" />
                      {res.fecha_actividad.split('-').reverse().join('/')}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getBadgeStyle(res.estado)}`}>
                      {res.estado}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-black text-slate-900 text-sm tracking-tight">{res.modulo_materia_area}</h3>
                    <p className="text-[11px] text-slate-500 font-bold mt-0.5">Grupo: {res.grupo} ({res.nivel})</p>
                    <p className="text-[11px] text-slate-500 font-medium mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-indigo-500" /> {res.hora_inicio} a {res.hora_fin} • Zona: {res.zona_principal}
                    </p>
                  </div>

                  <div className="bg-slate-50 border border-slate-150 p-3 rounded-xl text-slate-600 text-[11px] leading-relaxed">
                    <strong className="text-slate-700">Objetivo:</strong> {res.objetivo_didactico}
                  </div>

                  {val && (
                    <div className="p-2.5 bg-emerald-50/50 border border-emerald-100 rounded-xl text-[11px] text-slate-600 flex items-center justify-between">
                      <span className="font-bold text-emerald-800 flex items-center gap-1">
                        🎖️ Valorada ({val.valoracion_general}★)
                      </span>
                      {val.actividad_innovacion && (
                        <span className="bg-indigo-600 text-white font-mono text-[9px] px-2 py-0.5 rounded-md font-bold">
                          INNOVACIÓN
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Operations on single booking */}
                <div className="border-t border-slate-100 pt-3 flex flex-wrap justify-between items-center gap-2 text-xs">
                  <button
                    onClick={() => onViewDetail(res)}
                    className="text-slate-500 hover:text-slate-800 font-bold cursor-pointer transition-colors flex items-center gap-1 text-[11px]"
                  >
                    <Eye className="w-3.5 h-3.5" /> Detalles
                  </button>

                  <div className="flex flex-wrap items-center gap-1.5">
                    {res.estado !== 'CANCELADA' && (
                      <>
                        <button
                          onClick={() => onEditBooking(res)}
                          title="Editar datos de esta reserva"
                          className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-1 border border-indigo-200/60"
                        >
                          <Edit3 className="w-3.5 h-3.5" /> Editar
                        </button>
                        <button
                          onClick={() => {
                            setBookingToRelease(res);
                            setReleaseMotivo('');
                            setReleaseMode('cancel');
                          }}
                          title="Liberar aula para que otros compañeros puedan reservar"
                          className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-1 border border-rose-200/60"
                        >
                          <CalendarX className="w-3.5 h-3.5" /> Liberar
                        </button>
                      </>
                    )}

                    {(res.estado === 'APROBADA' || (res.estado === 'REALIZADA' && !val)) && (
                      <button
                        onClick={() => onValuateBooking(res)}
                        className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1.5 transition-all shadow-xs"
                      >
                        <Award className="w-3.5 h-3.5 text-amber-400" /> Valorar clase
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* VISTA 2: EN LISTA FILTRADA COMPACTA */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold text-[10px]">
                <tr>
                  <th className="py-3 px-4">Fecha y Horario</th>
                  <th className="py-3 px-4">Módulo / Materia</th>
                  <th className="py-3 px-4">Grupo y Nivel</th>
                  <th className="py-3 px-4">Zona</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4">Memoria Didáctica</th>
                  <th className="py-3 px-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150">
                {filteredBookings.map((res) => {
                  const val = valoraciones.find(v => v.id_reserva === res.id_reserva);
                  
                  return (
                    <tr key={res.id_reserva} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-800 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                          <span>{res.fecha_actividad.split('-').reverse().join('/')}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-sans font-medium flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" /> {res.hora_inicio} - {res.hora_fin}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-900 max-w-[200px] truncate">{res.modulo_materia_area}</p>
                        <p className="text-[10px] text-slate-400 truncate max-w-[220px]">{res.objetivo_didactico}</p>
                      </td>

                      <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                        <span className="font-bold text-slate-800">{res.grupo}</span>
                        <span className="block text-[10px] text-slate-400">{res.nivel}</span>
                      </td>

                      <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                        <span className="px-2 py-0.5 bg-slate-100 rounded-md text-[10px] font-medium text-slate-700">
                          {res.zona_principal}
                        </span>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getBadgeStyle(res.estado)}`}>
                          {res.estado}
                        </span>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        {val ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-lg">
                            ★ {val.valoracion_general}/5
                            {val.actividad_innovacion && <span className="text-[9px] bg-indigo-600 text-white px-1 rounded font-mono ml-1">INN</span>}
                          </span>
                        ) : res.estado === 'REALIZADA' ? (
                          <span className="text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-lg">
                            ⚠️ Pendiente
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[10px]">No requerida aún</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap space-x-1.5">
                        <button
                          onClick={() => onViewDetail(res)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                        >
                          Ver
                        </button>
                        {res.estado !== 'CANCELADA' && (
                          <>
                            <button
                              onClick={() => onEditBooking(res)}
                              title="Editar datos de esta reserva"
                              className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold cursor-pointer transition-colors border border-indigo-200/50"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => {
                                setBookingToRelease(res);
                                setReleaseMotivo('');
                                setReleaseMode('cancel');
                              }}
                              title="Liberar aula para que otros compañeros puedan reservar"
                              className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-bold cursor-pointer transition-colors border border-rose-200/50"
                            >
                              Liberar
                            </button>
                          </>
                        )}
                        {(res.estado === 'APROBADA' || (res.estado === 'REALIZADA' && !val)) && (
                          <button
                            onClick={() => onValuateBooking(res)}
                            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors"
                          >
                            Valorar
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL COLABORATIVO: LIBERAR ESPACIO / CANCELAR RESERVA */}
      {bookingToRelease && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in no-print">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-5 animate-scale-up">
            <div className="flex items-start gap-3.5">
              <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100 shrink-0">
                <CalendarX className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 tracking-tight">Liberar Reserva en el Aula ATECA</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {bookingToRelease.modulo_materia_area} • {bookingToRelease.fecha_actividad.split('-').reverse().join('/')} ({bookingToRelease.hora_inicio} - {bookingToRelease.hora_fin})
                </p>
              </div>
            </div>

            {/* Mensaje de cortesía y civismo colaborativo */}
            <div className="bg-gradient-to-br from-indigo-50/80 to-emerald-50/50 border border-indigo-100/80 rounded-xl p-4 text-xs leading-relaxed space-y-2 text-slate-700">
              <div className="flex items-center gap-1.5 font-bold text-indigo-950">
                <HeartHandshake className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Colaboración y aprovechamiento didáctico del claustro:</span>
              </div>
              <p className="text-slate-600">
                Al liberar esta reserva, la franja horaria volverá a estar <strong>inmediatamente disponible en el calendario</strong> para que cualquier compañero o compañera pueda aprovechar el equipamiento tecnológico del Aula ATECA con su alumnado.
              </p>
              <p className="text-emerald-800 font-semibold text-[11px] flex items-center gap-1">
                🌱 ¡Muchas gracias por avisar y colaborar con el resto de compañeros docentes!
              </p>
            </div>

            {/* Opciones de liberación */}
            <div className="space-y-2 text-xs">
              <label className="block font-bold text-slate-700">¿Qué deseas hacer con esta reserva?</label>
              <div className="space-y-2">
                <label className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                  releaseMode === 'cancel' ? 'bg-amber-50/70 border-amber-300 ring-1 ring-amber-400/20' : 'border-slate-200 hover:bg-slate-50'
                }`}>
                  <input
                    type="radio"
                    name="releaseMode"
                    value="cancel"
                    checked={releaseMode === 'cancel'}
                    onChange={() => setReleaseMode('cancel')}
                    className="mt-0.5 text-amber-600"
                  />
                  <div>
                    <span className="font-bold text-slate-900 block">Marcar como Cancelada (Recomendado)</span>
                    <span className="text-[11px] text-slate-500">Libera el aula al instante y conserva el registro en tu historial como cancelada.</span>
                  </div>
                </label>

                <label className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                  releaseMode === 'delete' ? 'bg-rose-50/70 border-rose-300 ring-1 ring-rose-400/20' : 'border-slate-200 hover:bg-slate-50'
                }`}>
                  <input
                    type="radio"
                    name="releaseMode"
                    value="delete"
                    checked={releaseMode === 'delete'}
                    onChange={() => setReleaseMode('delete')}
                    className="mt-0.5 text-rose-600"
                  />
                  <div>
                    <span className="font-bold text-slate-900 block">Eliminar permanentemente del calendario</span>
                    <span className="text-[11px] text-slate-500">Borra la ficha por completo de la base de datos sin dejar rastro en el historial.</span>
                  </div>
                </label>
              </div>
            </div>

            {releaseMode === 'cancel' && (
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Motivo de la liberación o cancelación (opcional)</label>
                <input
                  type="text"
                  value={releaseMotivo}
                  onChange={(e) => setReleaseMotivo(e.target.value)}
                  placeholder="Ej: Cambio de fecha, salida pedagógica, reprogramación de módulo..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-slate-400"
                />
              </div>
            )}

            <div className="flex justify-end gap-2.5 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => setBookingToRelease(null)}
                className="px-4 py-2 hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Mantener mi reserva
              </button>
              <button
                type="button"
                onClick={() => {
                  if (releaseMode === 'delete') {
                    deleteReserva(bookingToRelease.id_reserva);
                  } else {
                    cancelReserva(bookingToRelease.id_reserva, releaseMotivo);
                  }
                  setBookingToRelease(null);
                  onRefresh();
                }}
                className={`px-5 py-2 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
                  releaseMode === 'delete' ? 'bg-rose-600 hover:bg-rose-500' : 'bg-amber-600 hover:bg-amber-500'
                }`}
              >
                {releaseMode === 'delete' ? 'Eliminar y Liberar Aula' : 'Confirmar y Liberar Aula'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
