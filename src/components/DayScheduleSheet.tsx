/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { 
  ArrowLeft, Calendar as CalendarIcon, Clock, Plus, User, 
  ChevronLeft, ChevronRight, Sun, Moon, ShieldAlert, CheckCircle2,
  Sparkles, Layers
} from 'lucide-react';
import { Reserva, Bloqueo } from '../types';
import { getBloqueos, formatDateToYMD, checkTimeOverlap } from '../lib/storage';

interface DayScheduleSheetProps {
  dateStr: string; // YYYY-MM-DD
  reservas: Reserva[];
  onBackToMonth: () => void;
  onSelectDate: (dateStr: string) => void;
  onSelectBooking: (booking: Reserva) => void;
  onRequestBookingWithSlot: (dateStr: string, startHour: string, endHour: string) => void;
  canCreateBookings?: boolean;
}

// Horarios lectivos según normativa:
// Mañana: 08:00 a 14:00 (6 sesiones de 50 min + recreo)
const MORNING_SLOTS = [
  { start: '08:00', end: '08:50', label: '1ª Sesión (50m)' },
  { start: '08:50', end: '09:40', label: '2ª Sesión (50m)' },
  { start: '09:40', end: '10:30', label: '3ª Sesión (50m)' },
  { start: '10:30', end: '11:00', label: 'Recreo / Descanso Mañana (30m)', isBreak: true },
  { start: '11:00', end: '11:50', label: '4ª Sesión (50m)' },
  { start: '11:50', end: '12:40', label: '5ª Sesión (50m)' },
  { start: '12:40', end: '13:30', label: '6ª Sesión (50m)' },
  { start: '13:30', end: '14:00', label: 'Franja Flexible / Cierre (30m)' },
];

// Tarde: 6 sesiones de 50 min con descanso de 20 min tras la 3ª sesión
const AFTERNOON_SLOTS = [
  { start: '17:00', end: '17:50', label: '1ª Sesión Tarde (50m)' },
  { start: '17:50', end: '18:40', label: '2ª Sesión Tarde (50m)' },
  { start: '18:40', end: '19:30', label: '3ª Sesión Tarde (50m)' },
  { start: '19:30', end: '19:50', label: 'Descanso Tarde (20m)', isBreak: true },
  { start: '19:50', end: '20:40', label: '4ª Sesión Tarde (50m)' },
  { start: '20:40', end: '21:30', label: '5ª Sesión Tarde (50m)' },
  { start: '21:30', end: '22:20', label: '6ª Sesión Tarde (50m)' },
];

export default function DayScheduleSheet({
  dateStr,
  reservas,
  onBackToMonth,
  onSelectDate,
  onSelectBooking,
  onRequestBookingWithSlot,
  canCreateBookings = true,
}: DayScheduleSheetProps) {
  // Parse date for formatted header
  const formattedDate = useMemo(() => {
    try {
      const parts = dateStr.split('-');
      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      return new Intl.DateTimeFormat('es-ES', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      }).format(d);
    } catch {
      return dateStr;
    }
  }, [dateStr]);

  // Navigate to previous day
  const handlePrevDay = () => {
    const parts = dateStr.split('-');
    const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]) - 1);
    onSelectDate(formatDateToYMD(d));
  };

  // Navigate to next day
  const handleNextDay = () => {
    const parts = dateStr.split('-');
    const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]) + 1);
    onSelectDate(formatDateToYMD(d));
  };

  const handleToday = () => {
    onSelectDate(formatDateToYMD());
  };

  // Filter reservations and lockouts for this day
  const dayReservations = useMemo(() => {
    return reservas.filter(r => r.fecha_actividad === dateStr);
  }, [reservas, dateStr]);

  const dayBloqueos = useMemo(() => {
    return getBloqueos().filter(b => b.fecha === dateStr);
  }, [dateStr]);

  const isToday = formatDateToYMD() === dateStr;

  const getBadgeStyle = (estado: string) => {
    switch (estado) {
      case 'APROBADA': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'PENDIENTE': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'REALIZADA': return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'RECHAZADA': return 'bg-rose-50 text-rose-700 border-rose-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  // Helper to render a group of slots (morning or afternoon)
  const renderSlotGroup = (
    title: string, 
    icon: React.ReactNode, 
    slots: typeof MORNING_SLOTS,
    badgeBg: string
  ) => {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col">
        {/* Shift Header */}
        <div className={`p-4 border-b border-slate-150 flex items-center justify-between ${badgeBg}`}>
          <div className="flex items-center gap-2">
            {icon}
            <h3 className="font-black text-sm tracking-tight text-slate-900">{title}</h3>
          </div>
          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">
            {slots[0].start} - {slots[slots.length - 1].end}
          </span>
        </div>

        {/* Shift Slots Timeline */}
        <div className="p-4 space-y-3 flex-1 bg-slate-50/40">
          {slots.map((slot, idx) => {
            if (slot.isBreak) {
              return (
                <div 
                  key={idx} 
                  className="py-2 px-3 bg-slate-150/60 rounded-xl text-center text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>{slot.label} ({slot.start} - {slot.end})</span>
                </div>
              );
            }

            // Check if there is a lockout
            const slotLock = dayBloqueos.find(b => checkTimeOverlap(b.hora_inicio, b.hora_fin, slot.start, slot.end));

            // Check if there is a reservation overlapping this slot
            const slotRes = dayReservations.find(r => 
              r.estado !== 'RECHAZADA' && 
              r.estado !== 'CANCELADA' && 
              checkTimeOverlap(r.hora_inicio, r.hora_fin, slot.start, slot.end)
            );

            return (
              <div 
                key={idx}
                className="bg-white border border-slate-200/80 rounded-xl p-3 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-300 transition-all"
              >
                {/* Time Indicator */}
                <div className="sm:w-28 shrink-0 flex sm:flex-col justify-between sm:justify-center items-start">
                  <span className="text-xs font-black font-mono text-slate-900 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-indigo-500" />
                    {slot.start} - {slot.end}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                    {slot.label}
                  </span>
                </div>

                {/* Content Column */}
                <div className="flex-1">
                  {slotLock ? (
                    /* Locked Slot */
                    <div className="p-2.5 bg-rose-50/70 border border-rose-100 rounded-lg text-xs text-rose-700 flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0" />
                      <div>
                        <strong className="block font-bold text-[11px] uppercase tracking-wide">Aula Bloqueada por Coordinación</strong>
                        <span className="text-[10px] text-rose-600">{slotLock.motivo || "Mantenimiento / Uso exclusivo"}</span>
                      </div>
                    </div>
                  ) : slotRes ? (
                    /* Booked Slot */
                    <div 
                      onClick={() => onSelectBooking(slotRes)}
                      className="p-3 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 rounded-xl cursor-pointer transition-all space-y-1.5 group"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <span className="font-extrabold text-xs text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {slotRes.modulo_materia_area}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider ${getBadgeStyle(slotRes.estado)}`}>
                          {slotRes.estado}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
                        <span className="font-bold text-slate-700 flex items-center gap-1">
                          <User className="w-3 h-3 text-slate-400" /> {slotRes.profesor}
                        </span>
                        <span>•</span>
                        <span>{slotRes.grupo}</span>
                        <span>•</span>
                        <span className="text-slate-600 font-medium">Zona: {slotRes.zona_principal}</span>
                      </div>

                      <p className="text-[10px] text-slate-400 truncate">
                        <span className="font-medium text-slate-500">Objetivo:</span> {slotRes.objetivo_didactico}
                      </p>
                    </div>
                  ) : (
                    /* Free Slot */
                    <div className="p-2.5 bg-emerald-50/30 border border-dashed border-emerald-200 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span className="text-xs font-bold text-emerald-900">Franja Disponible</span>
                      </div>
                      {canCreateBookings && (
                        <button
                          onClick={() => onRequestBookingWithSlot(dateStr, slot.start, slot.end)}
                          className="px-3 py-1 bg-white hover:bg-slate-900 hover:text-white text-slate-800 border border-slate-200 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-2xs flex items-center gap-1 active:scale-[0.98]"
                        >
                          <Plus className="w-3 h-3" /> Reservar
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header with Date and Day Navigation */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToMonth}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 shadow-2xs"
            title="Volver al calendario mensual"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Vista Mensual</span>
          </button>
          
          <div className="w-px h-8 bg-slate-200 hidden sm:block"></div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                Horario del Día
              </span>
              {isToday && (
                <span className="text-[10px] font-black uppercase tracking-wider bg-slate-900 text-white px-2 py-0.5 rounded-md shadow-2xs">
                  Hoy
                </span>
              )}
            </div>
            <h2 className="text-lg font-black tracking-tight text-slate-900 capitalize mt-0.5 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-slate-500" />
              {formattedDate}
            </h2>
          </div>
        </div>

        {/* Day Navigator */}
        <div className="flex items-center gap-2 self-stretch md:self-auto justify-between sm:justify-end">
          <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
            <button
              onClick={handlePrevDay}
              className="p-1.5 hover:bg-white text-slate-600 hover:text-slate-900 rounded-lg transition-all cursor-pointer"
              title="Día anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleToday}
              className="px-3 py-1 bg-white text-slate-900 hover:bg-slate-50 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-2xs border border-slate-200/50"
            >
              Hoy
            </button>
            <button
              onClick={handleNextDay}
              className="p-1.5 hover:bg-white text-slate-600 hover:text-slate-900 rounded-lg transition-all cursor-pointer"
              title="Día siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {canCreateBookings && (
            <button
              onClick={() => onRequestBookingWithSlot(dateStr, '09:00', '11:00')}
              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs hover:shadow-md cursor-pointer flex items-center gap-1.5 active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" /> Nueva Reserva
            </button>
          )}
        </div>
      </div>

      {/* Summary Stats Strip for this day */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Actividades Programadas</span>
            <p className="text-xl font-black text-slate-900 mt-0.5">{dayReservations.length}</p>
          </div>
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Estado del Aula</span>
            <p className="text-sm font-bold text-slate-800 mt-0.5">
              {dayBloqueos.length > 0 ? (
                <span className="text-rose-600">Bloqueo de Coordinación</span>
              ) : dayReservations.length === 0 ? (
                <span className="text-emerald-600">Completamente Libre</span>
              ) : (
                <span className="text-indigo-600">Ocupación Parcial</span>
              )}
            </p>
          </div>
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Reservas Aprobadas</span>
            <p className="text-xl font-black text-slate-900 mt-0.5">
              {dayReservations.filter(r => r.estado === 'APROBADA' || r.estado === 'REALIZADA').length}
            </p>
          </div>
          <div className="p-2.5 bg-sky-50 text-sky-600 rounded-xl">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Two Columns: Turno de Mañana & Turno de Tarde */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Turno de Mañana */}
        {renderSlotGroup(
          'Turno de Mañana', 
          <Sun className="w-4 h-4 text-amber-500" />, 
          MORNING_SLOTS,
          'bg-gradient-to-r from-amber-50/60 to-transparent'
        )}

        {/* Turno de Tarde */}
        {renderSlotGroup(
          'Turno de Tarde', 
          <Moon className="w-4 h-4 text-indigo-500" />, 
          AFTERNOON_SLOTS,
          'bg-gradient-to-r from-indigo-50/60 to-transparent'
        )}
      </div>

    </div>
  );
}
