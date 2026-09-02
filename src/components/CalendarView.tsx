/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Calendar as CalendarIcon, Layers, CheckCircle2, Plus, Clock, Search, ListFilter, User } from 'lucide-react';
import { Reserva } from '../types';
import { getReservas } from '../lib/storage';

interface CalendarViewProps {
  onSelectBooking?: (booking: Reserva) => void;
  onRequestNewBookingWithDate?: (date: string) => void;
  canCreateBookings: boolean;
}

export default function CalendarView({ onSelectBooking, onRequestNewBookingWithDate, canCreateBookings }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Filters state
  const [filterZona, setFilterZona] = useState('Todas');
  const [filterEstado, setFilterEstado] = useState('Todas');
  const [filterProfesor, setFilterProfesor] = useState('');
  const [filterNivel, setFilterNivel] = useState('Todas');
  const [viewMode, setViewMode] = useState<'month' | 'list'>('month');

  // Selected calendar day for detail
  const [selectedDayStr, setSelectedDayStr] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  const rawReservas = getReservas();

  // Apply filters
  const filteredReservas = useMemo(() => {
    return rawReservas.filter(res => {
      if (filterZona !== 'Todas' && res.zona_principal !== filterZona) return false;
      if (filterEstado !== 'Todas' && res.estado !== filterEstado) return false;
      if (filterNivel !== 'Todas' && res.nivel !== filterNivel) return false;
      
      if (filterProfesor.trim() !== '') {
        const query = filterProfesor.toLowerCase();
        const profMatch = res.profesor.toLowerCase().includes(query);
        const deptMatch = res.departamento.toLowerCase().includes(query);
        const subMatch = res.modulo_materia_area.toLowerCase().includes(query);
        if (!profMatch && !deptMatch && !subMatch) return false;
      }
      return true;
    });
  }, [rawReservas, filterZona, filterEstado, filterProfesor, filterNivel]);

  // Calendar calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  const daysInMonth = useMemo(() => {
    return new Date(year, month + 1, 0).getDate();
  }, [year, month]);

  const firstDayIndex = useMemo(() => {
    const rawIndex = new Date(year, month, 1).getDay();
    // Adjust index to start on Monday (0: Monday ... 6: Sunday)
    return rawIndex === 0 ? 6 : rawIndex - 1;
  }, [year, month]);

  const prevMonthDays = useMemo(() => {
    return new Date(year, month, 0).getDate();
  }, [year, month]);

  const daysArray = useMemo(() => {
    const arr = [];
    
    // Previous month padding days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const prevDate = new Date(year, month - 1, prevMonthDays - i);
      arr.push({
        date: prevDate,
        isCurrentMonth: false,
        dayNum: prevMonthDays - i,
        dateStr: prevDate.toISOString().split('T')[0]
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const currDate = new Date(year, month, i);
      arr.push({
        date: currDate,
        isCurrentMonth: true,
        dayNum: i,
        dateStr: currDate.toISOString().split('T')[0]
      });
    }

    // Next month padding days to complete 42 cells (6 rows)
    const remaining = 42 - arr.length;
    for (let i = 1; i <= remaining; i++) {
      const nextDate = new Date(year, month + 1, i);
      arr.push({
        date: nextDate,
        isCurrentMonth: false,
        dayNum: i,
        dateStr: nextDate.toISOString().split('T')[0]
      });
    }

    return arr;
  }, [year, month, daysInMonth, firstDayIndex, prevMonthDays]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDayStr(today.toISOString().split('T')[0]);
  };

  // Group reservations of the selected day
  const selectedDayReservas = useMemo(() => {
    return rawReservas.filter(r => r.fecha_actividad === selectedDayStr);
  }, [rawReservas, selectedDayStr]);

  const getDayReservas = (dateStr: string) => {
    return rawReservas.filter(r => r.fecha_actividad === dateStr);
  };

  // Helper for colors
  const getBadgeColor = (estado: string) => {
    switch (estado) {
      case 'APROBADA': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'PENDIENTE': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'RECHAZADA': return 'bg-red-100 text-red-800 border-red-200';
      case 'CANCELADA': return 'bg-slate-100 text-slate-800 border-slate-200';
      case 'REALIZADA': return 'bg-sky-100 text-sky-800 border-sky-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  const activeDayHasIndicator = (dateStr: string) => {
    const dayRes = getDayReservas(dateStr);
    if (dayRes.length === 0) return null;
    if (dayRes.some(r => r.estado === 'PENDIENTE')) return 'bg-amber-500';
    if (dayRes.some(r => r.estado === 'APROBADA')) return 'bg-emerald-500';
    if (dayRes.some(r => r.estado === 'REALIZADA')) return 'bg-sky-500';
    return 'bg-slate-400';
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters Header */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-4">
          <div className="flex items-center space-x-3">
            <CalendarIcon className="h-6 w-6 text-slate-700" />
            <div>
              <h1 className="text-xl font-bold text-slate-800">Calendario de Ocupación</h1>
              <p className="text-xs text-slate-500">Consulta de franjas horarias y actividades didácticas</p>
            </div>
          </div>

          <div className="flex bg-slate-100 rounded-lg p-1 text-xs font-semibold self-start md:self-center">
            <button
              onClick={() => setViewMode('month')}
              className={`px-4 py-1.5 rounded-md transition-colors cursor-pointer ${
                viewMode === 'month' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Vista Mensual
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-1.5 rounded-md transition-colors cursor-pointer ${
                viewMode === 'list' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Lista Completa ({filteredReservas.length})
            </button>
          </div>
        </div>

        {/* Quick Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block text-slate-500 font-semibold mb-1 flex items-center gap-1">
              <Layers className="h-3.5 w-3.5" /> Zona ATECA
            </label>
            <select
              value={filterZona}
              onChange={(e) => setFilterZona(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-none cursor-pointer"
            >
              <option value="Todas">Todas las zonas (Aula central)</option>
              <option value="Multimedia">Multimedia</option>
              <option value="Vídeo y audio">Vídeo y audio</option>
              <option value="Impresión 3D">Impresión 3D</option>
              <option value="Realidad virtual y simuladores">Realidad virtual y simuladores</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-500 font-semibold mb-1 flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" /> Estado de reserva
            </label>
            <select
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-none cursor-pointer"
            >
              <option value="Todas">Todos los estados</option>
              <option value="PENDIENTE">PENDIENTE</option>
              <option value="APROBADA">APROBADA</option>
              <option value="REALIZADA">REALIZADA</option>
              <option value="RECHAZADA">RECHAZADA</option>
              <option value="CANCELADA">CANCELADA</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-500 font-semibold mb-1 flex items-center gap-1">
              <ListFilter className="h-3.5 w-3.5" /> Etapa / Nivel
            </label>
            <select
              value={filterNivel}
              onChange={(e) => setFilterNivel(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-none cursor-pointer"
            >
              <option value="Todas">Todos los niveles</option>
              <option value="Grado Superior FP">Grado Superior FP</option>
              <option value="Grado Medio FP">Grado Medio FP</option>
              <option value="FP Básica / Programas">FP Básica</option>
              <option value="Bachillerato">Bachillerato</option>
              <option value="ESO">ESO</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-500 font-semibold mb-1 flex items-center gap-1">
              <Search className="h-3.5 w-3.5" /> Buscador texto
            </label>
            <div className="relative">
              <input
                type="text"
                value={filterProfesor}
                onChange={(e) => setFilterProfesor(e.target.value)}
                placeholder="Profesor, departamento o materia..."
                className="w-full pl-7 pr-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-none text-xs"
              />
              <Search className="h-3 w-3 text-slate-400 absolute left-2.5 top-2" />
            </div>
          </div>
        </div>
      </div>

      {viewMode === 'month' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar Grid card */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-xs border border-slate-200 p-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base font-bold text-slate-800 font-mono">
                {monthNames[month]} {year}
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={handlePrevMonth}
                  className="p-1 px-3 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded text-xs font-semibold cursor-pointer"
                >
                  Anterior
                </button>
                <button
                  onClick={handleToday}
                  className="p-1 px-3 bg-slate-800 text-white hover:bg-slate-700 active:bg-slate-600 rounded text-xs font-semibold cursor-pointer"
                >
                  Hoy
                </button>
                <button
                  onClick={handleNextMonth}
                  className="p-1 px-3 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded text-xs font-semibold cursor-pointer"
                >
                  Siguiente
                </button>
              </div>
            </div>

            {/* Days header */}
            <div className="grid grid-cols-7 text-center font-bold text-slate-500 text-xs py-2 border-b border-slate-100 bg-slate-50 rounded-lg mb-2">
              <div>Lunes</div>
              <div>Martes</div>
              <div>Miérc.</div>
              <div>Jueves</div>
              <div>Viernes</div>
              <div className="text-amber-600/80">Sáb.</div>
              <div className="text-amber-600/85">Dom.</div>
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {daysArray.map((cell, idx) => {
                const isSelected = cell.dateStr === selectedDayStr;
                const dailyReservations = getDayReservas(cell.dateStr);
                const hasResState = activeDayHasIndicator(cell.dateStr);
                const isToday = new Date().toISOString().split('T')[0] === cell.dateStr;

                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedDayStr(cell.dateStr)}
                    className={`min-h-16 md:min-h-20 p-1.5 border rounded-lg cursor-pointer transition-all flex flex-col justify-between relative group ${
                      cell.isCurrentMonth ? 'bg-white' : 'bg-slate-50 text-slate-400'
                    } ${
                      isSelected 
                        ? 'border-slate-800 ring-2 ring-slate-800/10' 
                        : 'border-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${
                        isToday ? 'bg-slate-900 text-white font-black' : ''
                      }`}>
                        {cell.dayNum}
                      </span>
                      
                      {dailyReservations.length > 0 && (
                        <span className="text-[9px] bg-slate-100 px-1 rounded font-bold text-slate-600">
                          x{dailyReservations.length}
                        </span>
                      )}
                    </div>

                    {/* Indicators list */}
                    <div className="space-y-0.5 max-h-11 overflow-hidden pointer-events-none">
                      {dailyReservations.slice(0, 2).map((res, rIdx) => (
                        <div
                          key={rIdx}
                          className="text-[8px] px-1 py-0.5 rounded truncate border border-slate-100 leading-tight flex items-center gap-0.5"
                        >
                          <span className={`w-1 h-1 rounded-full ${
                            res.estado === 'PENDIENTE' ? 'bg-amber-400' :
                            res.estado === 'APROBADA' ? 'bg-emerald-400' :
                            res.estado === 'REALIZADA' ? 'bg-sky-400' :
                            'bg-slate-400'
                          }`}></span>
                          <span className="font-medium max-w-[85%] truncate uppercase font-sans text-slate-700">
                            {res.profesor.split(' ')[0]}
                          </span>
                        </div>
                      ))}
                      {dailyReservations.length > 2 && (
                        <div className="text-[8px] text-slate-400 font-bold text-center">
                          +{dailyReservations.length - 2} más
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Agenda of selected day inside sidebar */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 space-y-4">
            <div className="border-b border-slate-200 pb-3">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Fecha seleccionada</p>
              <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-1.5 mt-0.5">
                <CalendarIcon className="w-4 h-4 text-slate-600" />
                {selectedDayStr.split('-').reverse().join('/')}
              </h3>
            </div>

            {selectedDayReservas.length === 0 ? (
              <div className="text-center py-8 px-4 bg-white rounded-lg border border-slate-100 flex flex-col items-center justify-center space-y-3">
                <div className="p-3 bg-slate-50 text-slate-400 rounded-full">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-600">No hay reservas</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">La franja de este día se encuentra totalmente disponible.</p>
                </div>
                {canCreateBookings && onRequestNewBookingWithDate && (
                  <button
                    onClick={() => onRequestNewBookingWithDate(selectedDayStr)}
                    className="mt-2 text-[11px] font-bold bg-slate-800 text-white cursor-pointer px-3 py-1.5 rounded hover:bg-slate-700 active:bg-slate-600 transition-colors flex items-center gap-1 shadow-xs"
                  >
                    <Plus className="w-3 h-3" /> Crear reserva aquí
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                <p className="text-[11px] font-bold text-slate-500">Reservadas ({selectedDayReservas.length} actividades):</p>
                {selectedDayReservas.map((res) => (
                  <div
                    key={res.id_reserva}
                    onClick={() => onSelectBooking && onSelectBooking(res)}
                    className="p-3 bg-white hover:bg-slate-100/70 cursor-pointer active:scale-[0.99] border border-slate-200 rounded-lg transition-all space-y-2 text-xs"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <span className="font-bold text-slate-800 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {res.hora_inicio} - {res.hora_fin}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getBadgeColor(res.estado)}`}>
                        {res.estado}
                      </span>
                    </div>

                    <div>
                      <p className="font-bold text-slate-700 flex items-center gap-1 text-[11px]">
                        <User className="w-3 h-3 text-slate-400" /> {res.profesor}
                      </p>
                      <p className="text-[10px] text-slate-500">{res.departamento} • {res.modulo_materia_area}</p>
                    </div>

                    <div className="bg-slate-50 p-1.5 rounded text-[10px] border border-slate-100 space-y-1">
                      <p className="font-medium text-slate-600"><span className="text-slate-400 font-normal">Zona:</span> {res.zona_principal}</p>
                      <p className="text-slate-500 truncate"><span className="text-slate-400 font-normal">Meta:</span> {res.objetivo_didactico}</p>
                    </div>
                  </div>
                ))}

                {canCreateBookings && onRequestNewBookingWithDate && (
                  <button
                    onClick={() => onRequestNewBookingWithDate(selectedDayStr)}
                    className="w-full text-center py-2 border border-dashed border-slate-300 hover:border-slate-500 text-slate-600 rounded-lg font-bold text-[11px] cursor-pointer block transition-colors bg-white hover:bg-slate-50"
                  >
                    + Solicitar otra reserva este día
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Full list view mode */
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
          {filteredReservas.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              No hay reservas registradas que coincidan con los filtros seleccionados.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                    <th className="p-3">Docente / Grupo</th>
                    <th className="p-3">Fecha y Hora</th>
                    <th className="p-3">Zona principal</th>
                    <th className="p-3 text-center">Nivel</th>
                    <th className="p-3 text-center">Alumnos</th>
                    <th className="p-3 text-center">Apoyo</th>
                    <th className="p-3 text-center">Prioridad</th>
                    <th className="p-3 text-center">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredReservas.map((res) => (
                    <tr
                      key={res.id_reserva}
                      onClick={() => onSelectBooking && onSelectBooking(res)}
                      className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                    >
                      <td className="p-3">
                        <p className="font-bold text-slate-800">{res.profesor}</p>
                        <p className="text-[10px] text-slate-500">{res.departamento} • {res.modulo_materia_area}</p>
                      </td>
                      <td className="p-3 font-semibold text-slate-600">
                        {res.fecha_actividad.split('-').reverse().join('/')}
                        <div className="text-[10px] text-slate-400 font-normal">{res.hora_inicio} - {res.hora_fin}</div>
                      </td>
                      <td className="p-3 font-medium text-slate-700">{res.zona_principal}</td>
                      <td className="p-3 text-center font-medium text-slate-500">{res.nivel}</td>
                      <td className="p-3 text-center font-bold text-slate-600">{res.numero_alumnos}</td>
                      <td className="p-3 text-center font-semibold text-slate-500">{res.necesita_apoyo ? 'SÍ' : 'NO'}</td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold leading-tight ${
                          res.prioridad === 'ALTA' ? 'bg-red-50 text-red-700 border border-red-100' :
                          res.prioridad === 'MEDIA' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                          res.prioridad === 'NORMAL' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                          'bg-slate-50 text-slate-700'
                        }`}>
                          {res.prioridad}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-black border ${getBadgeColor(res.estado)}`}>
                          {res.estado}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
