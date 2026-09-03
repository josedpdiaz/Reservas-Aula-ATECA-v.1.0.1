/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, Layers, CheckCircle2, Plus, Clock, Search, 
  User, ChevronLeft, ChevronRight, Sparkles, Filter, ChevronDown, ChevronUp,
  PanelRight, PanelTop, CalendarDays, Eye
} from 'lucide-react';
import { Reserva } from '../types';
import { getReservas, formatDateToYMD } from '../lib/storage';
import DayScheduleSheet from './DayScheduleSheet';

interface CalendarViewProps {
  onSelectBooking?: (booking: Reserva) => void;
  onRequestNewBookingWithDate?: (dateStr: string, startHour?: string, endHour?: string) => void;
  canCreateBookings?: boolean;
}

export default function CalendarView({ onSelectBooking, onRequestNewBookingWithDate, canCreateBookings }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Filters state
  const [filterZona, setFilterZona] = useState('Todas');
  const [filterEstado, setFilterEstado] = useState('Todas');
  const [filterProfesor, setFilterProfesor] = useState('');
  const [filterNivel, setFilterNivel] = useState('Todas');
  const [viewMode, setViewMode] = useState<'month' | 'day-sheet' | 'list'>('month');

  // Collapse / Expand & Layout States
  const [isMonthExpanded, setIsMonthExpanded] = useState(true);
  const [isDayDetailExpanded, setIsDayDetailExpanded] = useState(true);
  const [dayDetailPosition, setDayDetailPosition] = useState<'side' | 'top'>('side');

  // Selected calendar day for detail
  const [selectedDayStr, setSelectedDayStr] = useState<string>(() => {
    return formatDateToYMD();
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
        dateStr: formatDateToYMD(prevDate)
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const currDate = new Date(year, month, i);
      arr.push({
        date: currDate,
        isCurrentMonth: true,
        dayNum: i,
        dateStr: formatDateToYMD(currDate)
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
        dateStr: formatDateToYMD(nextDate)
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
    setSelectedDayStr(formatDateToYMD(today));
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
      case 'APROBADA': return 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
      case 'PENDIENTE': return 'bg-amber-50 text-amber-700 border-amber-200/80';
      case 'RECHAZADA': return 'bg-rose-50 text-rose-700 border-rose-200/80';
      case 'CANCELADA': return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'REALIZADA': return 'bg-sky-50 text-sky-700 border-sky-200/80';
      default: return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  // Helper to render Day Detail Card in either Top or Side position
  const renderDayDetailCard = (isTopLayout: boolean) => {
    return (
      <div className={`bg-white rounded-2xl border border-slate-200/80 p-5 space-y-4 shadow-xs transition-all ${
        isTopLayout ? 'w-full' : ''
      }`}>
        <div className="flex justify-between items-start border-b border-slate-100 pb-3">
          <div>
            <span className="text-[10px] text-indigo-600 font-extrabold uppercase tracking-wider font-mono">Detalle del Día</span>
            <h3 className="font-black text-slate-900 text-base flex items-center gap-1.5 mt-0.5">
              <CalendarIcon className="w-4 h-4 text-slate-500" />
              {selectedDayStr.split('-').reverse().join('/')}
            </h3>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
              {selectedDayReservas.length === 0 
                ? "Espacio totalmente libre para solicitar" 
                : `${selectedDayReservas.length} actividad(es) programada(s)`}
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200/60">
            {/* Toggle Position: Top vs Side */}
            <button
              onClick={() => setDayDetailPosition(p => p === 'side' ? 'top' : 'side')}
              title={dayDetailPosition === 'side' ? "Mover detalle encima del calendario" : "Mover detalle al lateral"}
              className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-2xs border border-slate-200/50"
            >
              {dayDetailPosition === 'side' ? <PanelTop className="w-3.5 h-3.5 text-indigo-600" /> : <PanelRight className="w-3.5 h-3.5 text-indigo-600" />}
              <span className="text-[10px] hidden sm:inline">{dayDetailPosition === 'side' ? 'Poner Arriba' : 'Poner al Lado'}</span>
            </button>

            {/* Toggle Collapse */}
            <button
              onClick={() => setIsDayDetailExpanded(p => !p)}
              title={isDayDetailExpanded ? "Colapsar detalle del día" : "Expandir detalle del día"}
              className="p-1.5 bg-white hover:bg-slate-100 text-slate-600 rounded-lg transition-all cursor-pointer shadow-2xs border border-slate-200/50"
            >
              {isDayDetailExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {isDayDetailExpanded && (
          selectedDayReservas.length === 0 ? (
            <div className={`text-center py-8 px-4 bg-slate-50/60 rounded-xl border border-dashed border-slate-200 flex flex-col items-center justify-center space-y-2.5 ${
              isTopLayout ? 'sm:flex-row sm:justify-between sm:text-left sm:space-y-0 sm:py-5 sm:px-6' : ''
            }`}>
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white text-slate-400 rounded-2xl shadow-xs border border-slate-100 shrink-0">
                  <Clock className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-700">Sin ocupación registrada</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">El Aula ATECA se encuentra libre en todas sus zonas para esta fecha.</p>
                </div>
              </div>
              {canCreateBookings && onRequestNewBookingWithDate && (
                <button
                  onClick={() => onRequestNewBookingWithDate(selectedDayStr)}
                  className="text-xs font-bold bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white cursor-pointer px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" /> Reservar en esta fecha
                </button>
              )}
            </div>
          ) : (
            <div className={`${
              isTopLayout 
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3' 
                : 'space-y-3 max-h-[380px] overflow-y-auto pr-1'
            }`}>
              {selectedDayReservas.map((res) => (
                <div
                  key={res.id_reserva}
                  onClick={() => onSelectBooking && onSelectBooking(res)}
                  className="p-3.5 bg-slate-50/60 hover:bg-white cursor-pointer active:scale-[0.99] border border-slate-200 hover:border-slate-300 rounded-xl transition-all space-y-2.5 text-xs shadow-2xs hover:shadow-xs flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <span className="font-extrabold text-slate-800 flex items-center gap-1.5 text-xs">
                        <Clock className="w-3.5 h-3.5 text-indigo-500" />
                        {res.hora_inicio} - {res.hora_fin}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getBadgeColor(res.estado)}`}>
                        {res.estado}
                      </span>
                    </div>

                    <div>
                      <p className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                        <User className="w-3 h-3 text-slate-400" /> {res.profesor}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{res.departamento} • {res.modulo_materia_area}</p>
                    </div>

                    <div className="bg-white p-2 rounded-lg text-[11px] border border-slate-150 space-y-1">
                      <p className="font-medium text-slate-700"><span className="text-slate-400 font-normal">Zona:</span> {res.zona_principal}</p>
                      <p className="text-slate-500 truncate"><span className="text-slate-400 font-normal">Meta:</span> {res.objetivo_didactico}</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400">
                    <span>Aforo: {res.numero_alumnos} alumnos</span>
                    <span className="font-bold text-indigo-600">Ver detalles →</span>
                  </div>
                </div>
              ))}

              {canCreateBookings && onRequestNewBookingWithDate && (
                <button
                  onClick={() => onRequestNewBookingWithDate(selectedDayStr)}
                  className={`border border-dashed border-slate-300 hover:border-indigo-400 hover:text-indigo-600 text-slate-600 rounded-xl font-bold text-xs cursor-pointer transition-all bg-white hover:bg-indigo-50/30 flex items-center justify-center gap-1.5 ${
                    isTopLayout ? 'p-4 min-h-[100px]' : 'w-full py-2.5'
                  }`}
                >
                  <Plus className="w-4 h-4" /> Solicitar otra reserva en este día
                </button>
              )}

              <button
                onClick={() => setViewMode('day-sheet')}
                className="w-full text-center py-2.5 bg-indigo-50/80 hover:bg-indigo-100 text-indigo-700 font-extrabold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-indigo-200/60 shadow-2xs mt-2"
              >
                <Clock className="w-3.5 h-3.5" /> Abrir Hoja Completa de Horarios (Mañana y Tarde)
              </button>
            </div>
          )
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters Header */}
      <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xs border border-slate-200/80 p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3.5">
            <div className="p-2.5 bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-xl shadow-xs">
              <CalendarIcon className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                Calendario de Ocupación
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-100">
                  <Sparkles className="w-3 h-3 text-indigo-500" /> Tiempo Real
                </span>
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">Consulta de franjas horarias y actividades didácticas</p>
            </div>
          </div>

          <div className="flex flex-wrap bg-slate-100/80 p-1 rounded-xl text-xs font-bold self-start md:self-center border border-slate-200/60 gap-1">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'month' ? 'bg-white text-slate-900 shadow-xs font-extrabold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5 text-slate-500" /> Vista Mensual
            </button>
            <button
              onClick={() => setViewMode('day-sheet')}
              className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'day-sheet' ? 'bg-white text-slate-900 shadow-xs font-extrabold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-indigo-500" /> Horario del Día ({selectedDayStr.split('-').reverse().join('/')})
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'list' ? 'bg-white text-slate-900 shadow-xs font-extrabold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Filter className="w-3.5 h-3.5 text-slate-500" /> Lista Completa ({filteredReservas.length})
            </button>
          </div>
        </div>

        {/* Quick Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block text-slate-500 font-bold mb-1.5 flex items-center gap-1 text-[11px] uppercase tracking-wide">
              <Layers className="h-3.5 w-3.5 text-slate-400" /> Zona ATECA
            </label>
            <select
              value={filterZona}
              onChange={(e) => setFilterZona(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200 hover:border-slate-300 focus:border-indigo-500 rounded-xl outline-none cursor-pointer transition-all font-medium text-slate-700"
            >
              <option value="Todas">Todas las zonas (Aula central)</option>
              <option value="Multimedia">Multimedia</option>
              <option value="Vídeo y audio">Vídeo y audio</option>
              <option value="Impresión 3D">Impresión 3D</option>
              <option value="Realidad virtual y simuladores">Realidad virtual y simuladores</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-500 font-bold mb-1.5 flex items-center gap-1 text-[11px] uppercase tracking-wide">
              <CheckCircle2 className="h-3.5 w-3.5 text-slate-400" /> Estado de reserva
            </label>
            <select
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200 hover:border-slate-300 focus:border-indigo-500 rounded-xl outline-none cursor-pointer transition-all font-medium text-slate-700"
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
            <label className="block text-slate-500 font-bold mb-1.5 flex items-center gap-1 text-[11px] uppercase tracking-wide">
              <Layers className="h-3.5 w-3.5 text-slate-400" /> Etapa / Nivel
            </label>
            <select
              value={filterNivel}
              onChange={(e) => setFilterNivel(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200 hover:border-slate-300 focus:border-indigo-500 rounded-xl outline-none cursor-pointer transition-all font-medium text-slate-700"
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
            <label className="block text-slate-500 font-bold mb-1.5 flex items-center gap-1 text-[11px] uppercase tracking-wide">
              <Search className="h-3.5 w-3.5 text-slate-400" /> Buscador texto
            </label>
            <div className="relative">
              <input
                type="text"
                value={filterProfesor}
                onChange={(e) => setFilterProfesor(e.target.value)}
                placeholder="Profesor, departamento..."
                className="w-full pl-8 pr-3 py-2 bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200 hover:border-slate-300 focus:border-indigo-500 rounded-xl outline-none text-xs transition-all font-medium text-slate-700 placeholder:text-slate-400"
              />
              <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>
        </div>
      </div>

      {viewMode === 'day-sheet' ? (
        <DayScheduleSheet
          dateStr={selectedDayStr}
          reservas={rawReservas}
          onBackToMonth={() => setViewMode('month')}
          onSelectDate={(newDate) => setSelectedDayStr(newDate)}
          onSelectBooking={(booking) => onSelectBooking && onSelectBooking(booking)}
          onRequestBookingWithSlot={(date, start, end) => {
            if (onRequestNewBookingWithDate) {
              onRequestNewBookingWithDate(date, start, end);
            }
          }}
          canCreateBookings={canCreateBookings}
        />
      ) : viewMode === 'month' ? (
        <div className="space-y-6">
          
          {/* Top position for day detail if selected by user */}
          {dayDetailPosition === 'top' && renderDayDetailCard(true)}

          {/* Grid Layout (either full width when top or 2/3 when side) */}
          <div className={dayDetailPosition === 'side' ? 'grid grid-cols-1 lg:grid-cols-3 gap-6 items-start' : 'w-full'}>
            
            {/* Calendar Grid Card */}
            <div className={`${dayDetailPosition === 'side' ? 'lg:col-span-2' : 'w-full'} bg-white rounded-2xl shadow-xs border border-slate-200/80 p-5 space-y-4`}>
              
              {/* Month & Year Navigation Header + Collapse Button */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
                  <h2 className="text-lg font-black text-slate-900 tracking-tight">
                    {monthNames[month]} <span className="text-indigo-600 font-extrabold">{year}</span>
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  {/* Prev / Today / Next Controls */}
                  <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
                    <button
                      onClick={handlePrevMonth}
                      aria-label="Mes anterior"
                      title="Mes anterior"
                      className="p-1.5 hover:bg-white text-slate-600 hover:text-slate-900 rounded-lg transition-all cursor-pointer shadow-none hover:shadow-xs"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleToday}
                      className="px-3 py-1 bg-white text-slate-900 hover:bg-slate-50 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer border border-slate-200/50"
                    >
                      Hoy
                    </button>
                    <button
                      onClick={handleNextMonth}
                      aria-label="Mes siguiente"
                      title="Mes siguiente"
                      className="p-1.5 hover:bg-white text-slate-600 hover:text-slate-900 rounded-lg transition-all cursor-pointer shadow-none hover:shadow-xs"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Month Expand / Collapse button */}
                  <button
                    onClick={() => setIsMonthExpanded(prev => !prev)}
                    title={isMonthExpanded ? "Colapsar vista mensual" : "Expandir vista mensual"}
                    className="p-2 bg-slate-100/80 hover:bg-slate-200 text-slate-700 rounded-xl transition-all cursor-pointer border border-slate-200/60 flex items-center gap-1 text-xs font-bold"
                  >
                    {isMonthExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    <span className="text-[10px] hidden md:inline">{isMonthExpanded ? 'Colapsar Mes' : 'Expandir Mes'}</span>
                  </button>
                </div>
              </div>

              {/* Collapsible Month Body */}
              {isMonthExpanded ? (
                <>
                  {/* Days of week header */}
                  <div className="grid grid-cols-7 text-center font-bold text-[11px] text-slate-400 uppercase tracking-wider py-2 bg-slate-50/70 rounded-xl border border-slate-100">
                    <div>Lun</div>
                    <div>Mar</div>
                    <div>Mié</div>
                    <div>Jue</div>
                    <div>Vie</div>
                    <div className="text-amber-700/80">Sáb</div>
                    <div className="text-amber-700/85">Dom</div>
                  </div>

                  {/* Calendar grid cells */}
                  <div className="grid grid-cols-7 gap-1.5">
                    {daysArray.map((cell, idx) => {
                      const isSelected = cell.dateStr === selectedDayStr;
                      const dailyReservations = getDayReservas(cell.dateStr);
                      const isToday = formatDateToYMD() === cell.dateStr;

                      return (
                        <div
                          key={idx}
                          onClick={() => {
                            setSelectedDayStr(cell.dateStr);
                            setViewMode('day-sheet');
                          }}
                          title={`Ver horario y reservas del ${cell.dateStr}`}
                          className={`min-h-20 md:min-h-22 p-2 rounded-xl cursor-pointer transition-all flex flex-col justify-between relative group border ${
                            cell.isCurrentMonth ? 'bg-white' : 'bg-slate-50/60 text-slate-400'
                          } ${
                            isSelected 
                              ? 'border-indigo-600 ring-2 ring-indigo-500/20 bg-indigo-50/30 shadow-xs' 
                              : 'border-slate-150 hover:border-indigo-300 hover:bg-indigo-50/20 hover:shadow-xs'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-md transition-all ${
                              isToday 
                                ? 'bg-gradient-to-br from-slate-900 to-indigo-950 text-white font-black shadow-xs' 
                                : isSelected ? 'text-indigo-950 font-black' : 'text-slate-700'
                            }`}>
                              {cell.dayNum}
                            </span>
                            
                            {dailyReservations.length > 0 && (
                              <span className="text-[9px] bg-indigo-50 border border-indigo-100 text-indigo-700 px-1.5 py-0.2 rounded-full font-extrabold font-mono">
                                {dailyReservations.length}
                              </span>
                            )}
                          </div>

                          {/* Indicators micro-chips */}
                          <div className="space-y-1 my-1 overflow-hidden pointer-events-none">
                            {dailyReservations.slice(0, 2).map((res, rIdx) => (
                              <div
                                key={rIdx}
                                className="text-[9px] px-1.5 py-0.5 rounded-md truncate border leading-tight flex items-center gap-1 font-medium shadow-2xs"
                                style={{
                                  backgroundColor: res.estado === 'APROBADA' ? '#f0fdf4' : res.estado === 'PENDIENTE' ? '#fffbeb' : '#f8fafc',
                                  borderColor: res.estado === 'APROBADA' ? '#bbf7d0' : res.estado === 'PENDIENTE' ? '#fde68a' : '#e2e8f0',
                                  color: res.estado === 'APROBADA' ? '#166534' : res.estado === 'PENDIENTE' ? '#92400e' : '#475569',
                                }}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                  res.estado === 'PENDIENTE' ? 'bg-amber-400' :
                                  res.estado === 'APROBADA' ? 'bg-emerald-500' :
                                  res.estado === 'REALIZADA' ? 'bg-sky-500' : 'bg-slate-400'
                                }`}></span>
                                <span className="truncate font-sans">
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
                </>
              ) : (
                <div 
                  onClick={() => setIsMonthExpanded(true)}
                  className="p-6 bg-slate-50/60 hover:bg-slate-100/70 border border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-500 font-semibold cursor-pointer transition-colors flex items-center justify-center gap-2"
                >
                  <CalendarDays className="w-4 h-4 text-indigo-500" />
                  <span>Cuadrícula mensual colapsada. Haz clic aquí o en «Expandir Mes» para mostrarla.</span>
                </div>
              )}

            </div>

            {/* Side position for day detail if selected by user */}
            {dayDetailPosition === 'side' && (
              <div className="lg:col-span-1">
                {renderDayDetailCard(false)}
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
