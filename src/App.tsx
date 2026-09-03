/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Calendar as CalendarIcon, ShieldAlert, CheckCircle, 
  Settings, Award, FileText, LogIn, LogOut, 
  PlusCircle, Activity, BookmarkCheck, ShieldCheck, Mail
} from 'lucide-react';

import { Usuario, Reserva } from './types';
import { 
  initializeStorage, getReservas, getValoraciones, 
  getCurrentUser, setCurrentUser, loginByEmail, getConfig 
} from './lib/storage';

import CalendarView from './components/CalendarView';
import BookingForm from './components/BookingForm';
import ValuationForm from './components/ValuationForm';
import CoordinatorPanel from './components/CoordinatorPanel';
import AdminPanel from './components/AdminPanel';
import ReportPDF from './components/ReportPDF';
import PrivacyModal from './components/PrivacyModal';
import MyBookingsView from './components/MyBookingsView';

export default function App() {
  // Initialize App Databases inside localStorage
  useEffect(() => {
    initializeStorage();
    forceUpdate();
  }, []);

  const [tick, setTick] = useState(0);
  const forceUpdate = () => setTick(p => p + 1);

  // App States
  const [user, setUser] = useState<Usuario | null>(() => getCurrentUser());
  const [loginEmail, setLoginEmail] = useState('');
  const [loginError, setLoginError] = useState('');

  // Active Navigation Screen State
  const [activeTab, setActiveTab] = useState<'calendar' | 'my-bookings' | 'coordinator' | 'admin'>('calendar');

  // Secondary sub-screen States for CRUD Modals/Views
  const [currentAction, setCurrentAction] = useState<'view' | 'new-booking' | 'new-valuation' | 'view-report' | 'view-booking-detail'>('view');
  const [selectedBooking, setSelectedBooking] = useState<Reserva | null>(null);
  
  // Custom Date pre-selected from visual calendar grid clicks
  const [initialBookingDate, setInitialBookingDate] = useState<string | undefined>(undefined);

  // Privacy & RGPD modal state
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  // Success notify toast state
  const [toastMsg, setToastMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Update list context when operations conclude
  const handleUpdate = () => {
    forceUpdate();
    setUser(getCurrentUser());
  };

  const triggerToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 5000);
  };

  // Switch logins simulation with single click!
  const handleProfileSwitch = (emailAddr: string) => {
    const res = loginByEmail(emailAddr);
    if (res.success) {
      setUser(res.user || null);
      setLoginError('');
      triggerToast(`Sesión cambiada a: ${res.user?.nombre} (${res.user?.rol})`);
      
      // Auto adjust appropriate view tab for the switched role
      if (res.user?.rol === 'ADMIN') {
        setActiveTab('admin');
      } else if (res.user?.rol === 'COORDINADOR') {
        setActiveTab('coordinator');
      } else {
        setActiveTab('calendar');
      }
      setCurrentAction('view');
    } else {
      triggerToast(res.error || 'Error al cambiar de usuario.', 'error');
    }
  };

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    
    if (!loginEmail.trim()) {
      setLoginError('Suministra una dirección de correo válida.');
      return;
    }

    const res = loginByEmail(loginEmail.trim());
    if (res.success) {
      setUser(res.user || null);
      triggerToast(`Identificación exitosa docente: ${res.user?.nombre}`);
      if (res.user?.rol === 'ADMIN') {
        setActiveTab('admin');
      } else if (res.user?.rol === 'COORDINADOR') {
        setActiveTab('coordinator');
      } else {
        setActiveTab('calendar');
      }
      setCurrentAction('view');
    } else {
      setLoginError(res.error || 'Hubo un inconveniente para ingresar.');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setUser(null);
    setLoginEmail('');
    triggerToast('Has cerrado la sesión de la plataforma.');
  };

  // Calculated categories counts
  const bookings = getReservas();
  const valoraciones = getValoraciones();
  const config = getConfig();

  const myBookingsCount = bookings.filter(b => b.email === user?.email).length;
  const myPendingValuationsCount = bookings.filter(b => b.email === user?.email && b.estado === 'REALIZADA' && !valoraciones.some(v => v.id_reserva === b.id_reserva)).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-50 to-indigo-50/20 text-slate-800 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* NO-PRINT ALERT AND QUICK SIMULATED LOGIN SELECTOR PANEL */}
      <div className="bg-slate-950/95 backdrop-blur-md border-b border-slate-800/80 px-4 py-2 text-white no-print text-xs flex flex-col md:flex-row justify-between items-center gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span className="font-mono text-[10px] text-slate-300">
            <strong>DEMO INTERACTIVA:</strong> Cambia de perfil al instante para probar permisos:
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => handleProfileSwitch('josedpdiaz@gmail.com')}
            className={`px-2.5 py-1 rounded-lg font-bold cursor-pointer transition-all text-[10px] ${
              user?.email === 'josedpdiaz@gmail.com' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-800/80 hover:bg-slate-750 text-slate-300'
            }`}
          >
            José Díaz (ADMIN)
          </button>
          <button
            onClick={() => handleProfileSwitch('m.gonzalez@centro.edu')}
            className={`px-2.5 py-1 rounded-lg font-bold cursor-pointer transition-all text-[10px] ${
              user?.email === 'm.gonzalez@centro.edu' ? 'bg-amber-600 text-white shadow-xs' : 'bg-slate-800/80 hover:bg-slate-750 text-slate-300'
            }`}
          >
            María González (COORDINADOR)
          </button>
          <button
            onClick={() => handleProfileSwitch('j.santana@centro.edu')}
            className={`px-2.5 py-1 rounded-lg font-bold cursor-pointer transition-all text-[10px] ${
              user?.email === 'j.santana@centro.edu' ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-800/80 hover:bg-slate-750 text-slate-300'
            }`}
          >
            Juan Santana (PROFESOR)
          </button>
          <button
            onClick={() => handleProfileSwitch('profe.inactivo@centro.edu')}
            className="px-2.5 py-1 rounded-lg font-semibold bg-slate-800/60 hover:bg-slate-800 text-slate-400 cursor-pointer text-[10px] transition-colors"
          >
            Profe inactivo
          </button>
        </div>
      </div>

      {/* PRIMARY APPLICATION HEADER BRAND */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/70 py-3.5 px-6 flex flex-col sm:flex-row justify-between items-center gap-4 no-print shadow-2xs sticky top-0 z-30">
        <div className="flex items-center gap-3.5">
          <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-2.5 rounded-xl flex items-center justify-center shadow-xs border border-indigo-500/20">
            <BookOpen className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-slate-900 leading-none">Gestor Aula ATECA</h1>
            <p className="text-[10px] text-slate-500 font-bold mt-1 tracking-wider uppercase font-mono">
              {config.nombre_centro || "Canarias Educación"} • reservas & innovación
            </p>
          </div>
        </div>

        {user && (
          <div className="flex items-center gap-3 bg-slate-50/80 hover:bg-slate-50 border border-slate-200/80 p-1.5 pl-3 rounded-2xl text-xs transition-colors shadow-2xs">
            <div className="text-right">
              <p className="font-bold text-slate-900 text-xs">{user.nombre}</p>
              <p className="text-[10px] text-slate-500 font-medium">
                {user.email} • <span className="font-bold text-indigo-600 uppercase tracking-wider">{user.rol}</span>
              </p>
            </div>
            <div className="w-px h-7 bg-slate-200"></div>
            <button
              onClick={handleLogout}
              id="btn_brand_logout"
              title="Cerrar sesión"
              className="p-1.5 px-2.5 bg-white border border-slate-200/80 hover:bg-rose-50 text-slate-600 hover:text-rose-600 rounded-xl cursor-pointer font-bold transition-all text-[10px] flex items-center gap-1 shadow-2xs"
            >
              <LogOut className="w-3 h-3" /> Salir
            </button>
          </div>
        )}
      </header>

      {/* MAIN VIEWPORT BODY CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">

        {/* NOTIFY TOASTS */}
        {toastMsg && (
          <div className={`p-4 border rounded-xl shadow-md flex items-center gap-2 max-w-xl mx-auto no-print text-xs font-bold leading-normal text-slate-700 animate-slide-up ${
            toastMsg.type === 'success' 
              ? 'bg-emerald-50 border-emerald-100 text-emerald-800' 
              : 'bg-rose-50 border-rose-100 text-rose-800'
          }`}>
            <CheckCircle className={`w-5 h-5 ${toastMsg.type === 'success' ? 'text-emerald-500' : 'text-rose-500'}`} />
            <span>{toastMsg.text}</span>
          </div>
        )}

        {/* NO LOGGED IN USER ACCESS GATE */}
        {!user ? (
          <div className="max-w-md mx-auto space-y-6 pt-10 no-print">
            <div className="bg-white border border-slate-200 p-8 rounded-2xl shadow-xl space-y-6 text-center">
              <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center mx-auto shadow-md">
                <BookOpen className="w-8 h-8 text-emerald-400" />
              </div>
              
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Acceso Gestor ATECA</h2>
                <p className="text-xs text-slate-500 mt-1">Escribe tu correo educativo o corporativo para ingresar</p>
              </div>

              {loginError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-xs font-semibold flex items-center gap-2">
                  <ShieldAlert className="w-4.5 h-4.5" />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleManualLogin} className="space-y-4">
                <div className="text-left">
                  <label className="block text-slate-400 font-bold text-[10px] uppercase mb-1 flex items-center gap-1.5 leading-none">
                    <Mail className="w-3.5 h-3.5" /> Correo electrónico institucional
                  </label>
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="ej: tu_nombre@iesblascabrera.es"
                    className="w-full px-3 py-2.5 bg-white border border-slate-200 focus:border-slate-400 focus:ring-1 focus:ring-slate-400 rounded-xl text-xs md:text-sm outline-none transition-all"
                  />
                </div>

                <button
                  type="submit"
                  id="btn_login_submit"
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2.5 font-bold text-xs rounded-xl cursor-pointer hover:shadow transition-all flex items-center justify-center gap-2"
                >
                  <LogIn className="w-4 h-4" /> Autenticarse con cuenta Google / TIC
                </button>
              </form>

              {/* Canary priorities warning msg */}
              <div className="bg-slate-50 p-4 border border-slate-100 rounded-xl text-left text-[11px] leading-relaxed text-slate-500">
                <p className="font-bold text-slate-700 flex items-center gap-1 mb-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-500" /> Nota sobre el Aula ATECA:
                </p>
                El Aula ATECA está orientada prioritariamente a <strong>Formación Profesional</strong>, aunque puede ser utilizada por otros niveles (ESO y Bachillerato) cuando la actividad esté justificada pedagógicamente y exista disponibilidad de agenda.
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Cuentas prediseñadas para evaluación:</h3>
              <p className="text-[11px] text-slate-400">Puedes probar diferentes roles simplemente haciendo clic en los botones de "DEMO INTERACTIVA" de la zona superior de la pantalla, o introduciendo estos correos:</p>
              <ul className="text-xs space-y-2 text-slate-550 list-disc pl-5">
                <li><strong>Administrador:</strong> <code className="bg-slate-100 px-1 font-semibold rounded">josedpdiaz@gmail.com</code></li>
                <li><strong>Coordinador:</strong> <code className="bg-slate-100 px-1 font-semibold rounded">m.gonzalez@centro.edu</code></li>
                <li><strong>Profesor Activo FP:</strong> <code className="bg-slate-100 px-1 font-semibold rounded">j.santana@centro.edu</code></li>
                <li><strong>Profesor de Baja:</strong> <code className="bg-slate-100 px-1 font-semibold rounded">profe.inactivo@centro.edu</code></li>
              </ul>
            </div>
          </div>
        ) : (
          /* FULL APPLICATION SHELL FOR WORKFLOWS */
          <div className="space-y-6">

            {/* TAB-NAVIGATION CONTROLS FOR USER ACTION (Hidden when printing reports) */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white/90 backdrop-blur-md p-2 border border-slate-200/80 rounded-2xl no-print shadow-xs">
              <div className="flex flex-wrap gap-1.5 text-xs font-bold text-slate-600">
                <button
                  onClick={() => { setActiveTab('calendar'); setCurrentAction('view'); }}
                  className={`px-4 py-2 rounded-xl flex items-center gap-2 cursor-pointer transition-all ${
                    activeTab === 'calendar' && currentAction === 'view' 
                      ? 'bg-slate-900 text-white shadow-xs font-extrabold' 
                      : 'hover:bg-slate-100/80 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <CalendarIcon className="w-4 h-4" /> Calendario / Reservas
                </button>

                {/* Professor direct bookings panel tabs */}
                <button
                  onClick={() => { setActiveTab('my-bookings'); setCurrentAction('view'); }}
                  className={`px-4 py-2 rounded-xl flex items-center gap-2 cursor-pointer relative transition-all ${
                    activeTab === 'my-bookings' && currentAction === 'view' 
                      ? 'bg-slate-900 text-white shadow-xs font-extrabold' 
                      : 'hover:bg-slate-100/80 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <BookmarkCheck className="w-4 h-4" /> Mis Actividades ({myBookingsCount})
                  {myPendingValuationsCount > 0 && (
                    <span className="w-2 h-2 bg-rose-500 rounded-full animate-ping block border border-white"></span>
                  )}
                </button>

                {/* Coordinator dashboard panels (COORDINADOR / ADMIN ONLY) */}
                {(user.rol === 'COORDINADOR' || user.rol === 'ADMIN') && (
                  <button
                    onClick={() => { setActiveTab('coordinator'); setCurrentAction('view'); }}
                    className={`px-4 py-2 rounded-xl flex items-center gap-2 cursor-pointer transition-all ${
                      activeTab === 'coordinator' && currentAction === 'view' 
                        ? 'bg-slate-900 text-white shadow-xs font-extrabold' 
                        : 'hover:bg-slate-100/80 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Activity className="w-4 h-4 text-emerald-500" /> Panel Coordinador
                  </button>
                )}

                {/* Administrator console settings (ADMIN ONLY) */}
                {user.rol === 'ADMIN' && (
                  <button
                    onClick={() => { setActiveTab('admin'); setCurrentAction('view'); }}
                    className={`px-4 py-2 rounded-xl flex items-center gap-2 cursor-pointer transition-all ${
                      activeTab === 'admin' && currentAction === 'view' 
                        ? 'bg-slate-900 text-white shadow-xs font-extrabold' 
                        : 'hover:bg-slate-100/80 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Settings className="w-4 h-4 text-indigo-500" /> Administración
                  </button>
                )}
              </div>

              {/* Floating action buttons */}
              <div className="self-end sm:self-auto flex gap-2">
                <button
                  onClick={() => {
                    setInitialBookingDate(undefined);
                    setCurrentAction('new-booking');
                  }}
                  id="btn_request_booking_header"
                  className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs hover:shadow-md cursor-pointer flex items-center gap-2 active:scale-[0.98]"
                >
                  <PlusCircle className="w-4 h-4" /> Solicitar Reserva
                </button>
              </div>
            </div>

            {/* CORE COMPONENT SWITCHBOARD LOGIC */}
            <div className="transition-all animate-fade-in">
              {currentAction === 'new-booking' ? (
                <BookingForm
                  currentUser={user}
                  onCancel={() => setCurrentAction('view')}
                  onSuccess={(msg) => {
                    triggerToast(msg);
                    setCurrentAction('view');
                    setActiveTab('calendar');
                    handleUpdate();
                  }}
                />
              ) : currentAction === 'new-valuation' && selectedBooking ? (
                <ValuationForm
                  reserva={selectedBooking}
                  existingValuation={valoraciones.find(v => v.id_reserva === selectedBooking.id_reserva)}
                  onCancel={() => setCurrentAction('view')}
                  onSuccess={(msg) => {
                    triggerToast(msg);
                    setCurrentAction('view');
                    setActiveTab('my-bookings');
                    handleUpdate();
                  }}
                />
              ) : currentAction === 'view-report' && selectedBooking ? (
                <ReportPDF
                  booking={selectedBooking}
                  onCancel={() => setCurrentAction('view')}
                />
              ) : currentAction === 'view-booking-detail' && selectedBooking ? (
                /* DETAILED PREVIEW CARD FOR SECTIONS */
                <div className="bg-white rounded-xl border border-slate-200 p-6 max-w-2xl mx-auto space-y-6">
                  <div className="flex justify-between items-start pb-3 border-b border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">ID RESERVA: {selectedBooking.id_reserva}</span>
                      <h3 className="text-lg font-black text-slate-800 mt-0.5">Detalle de Solicitud ATECA</h3>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                      selectedBooking.estado === 'APROBADA' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                      selectedBooking.estado === 'PENDIENTE' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                      selectedBooking.estado === 'REALIZADA' ? 'bg-sky-50 text-sky-700 border-sky-100' :
                      selectedBooking.estado === 'RECHAZADA' ? 'bg-red-50 text-red-700 border-red-100' :
                      'bg-slate-50 text-slate-700'
                    }`}>
                      {selectedBooking.estado}
                    </span>
                  </div>

                  {/* Summary grid */}
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <p className="text-slate-400 font-bold uppercase tracking-wider text-[9px] mb-0.5">Docente responsable</p>
                      <p className="font-bold text-slate-800 text-sm leading-tight">{selectedBooking.profesor}</p>
                      <p className="text-slate-500 mt-0.5">{selectedBooking.email} ({selectedBooking.departamento})</p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-bold uppercase tracking-wider text-[9px] mb-0.5">Fecha y rango</p>
                      <p className="font-bold text-slate-800 text-sm leading-tight">{selectedBooking.fecha_actividad.split('-').reverse().join('/')}</p>
                      <p className="text-slate-500 mt-0.5">{selectedBooking.hora_inicio} a {selectedBooking.hora_fin}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-bold uppercase tracking-wider text-[9px] mb-0.5">Área curricular y grupo</p>
                      <p className="font-bold text-slate-800 leading-tight">{selectedBooking.modulo_materia_area}</p>
                      <p className="text-slate-500 mt-0.5">{selectedBooking.grupo} ({selectedBooking.nivel})</p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-bold uppercase tracking-wider text-[9px] mb-0.5">Zona del aula</p>
                      <p className="font-bold text-slate-800">{selectedBooking.zona_principal}</p>
                      <p className="text-slate-500 mt-0.5">{selectedBooking.numero_alumnos} alumnos asistiendo</p>
                    </div>
                  </div>

                  {/* Didactic block */}
                  <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl space-y-3 text-xs leading-relaxed">
                    <p>🎯 <strong>Objetivo didáctico:</strong><br /><span className="text-slate-600 block mt-1">"{selectedBooking.objetivo_didactico}"</span></p>
                    <p>💡 <strong>Descripción de actividad:</strong><br /><span className="text-slate-600 block mt-1">{selectedBooking.descripcion_actividad}</span></p>
                    <p>🛠️ <strong>Recursos y material:</strong><br /><span className="text-slate-600 block mt-1">{selectedBooking.recursos_necesarios || "Ninguno especificado"}</span></p>
                  </div>

                  {selectedBooking.observaciones_coordinador && (
                    <div className="p-3 bg-indigo-50 border border-indigo-100 text-indigo-900 rounded-lg text-xs leading-normal">
                      💬 <strong>Indicación de Coordinación:</strong><br />
                      <span className="text-indigo-900 block mt-0.5">{selectedBooking.observaciones_coordinador}</span>
                    </div>
                  )}

                  {/* Operational actions footer inside modal detail */}
                  <div className="flex justify-end gap-2 text-xs border-t border-slate-100 pt-4">
                    <button
                      onClick={() => setCurrentAction('view')}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 hover:shadow rounded-lg font-bold text-slate-600 cursor-pointer"
                    >
                      Atrás
                    </button>
                    {selectedBooking.estado === 'REALIZADA' && (
                      <button
                        onClick={() => setCurrentAction('view-report')}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg cursor-pointer flex items-center gap-1"
                      >
                        <FileText className="w-4 h-4 text-emerald-300 animate-pulse" /> Generar Informe Evidencia
                      </button>
                    )}
                    {selectedBooking.email === user.email && selectedBooking.estado === 'APROBADA' && (
                      <button
                        onClick={() => setCurrentAction('new-valuation')}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg cursor-pointer flex items-center gap-1"
                      >
                        <Award className="w-4 h-4 text-amber-400" /> Completar Valoración
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                /* MAIN ROUTED TABS SCREEN PANELS */
                <div>
                  {activeTab === 'calendar' && (
                    <CalendarView
                      canCreateBookings={user.activo}
                      onRequestNewBookingWithDate={(date) => {
                        setInitialBookingDate(date);
                        setCurrentAction('new-booking');
                      }}
                      onSelectBooking={(booking) => {
                        setSelectedBooking(booking);
                        setCurrentAction('view-booking-detail');
                      }}
                    />
                  )}

                  {activeTab === 'my-bookings' && (
                    <MyBookingsView
                      currentUser={user}
                      bookings={bookings}
                      valoraciones={valoraciones}
                      onSelectBooking={(res) => { setSelectedBooking(res); setCurrentAction('view-booking-detail'); }}
                      onNewBooking={() => { setInitialBookingDate(undefined); setCurrentAction('new-booking'); }}
                      onValuateBooking={(res) => { setSelectedBooking(res); setCurrentAction('new-valuation'); }}
                      onViewDetail={(res) => { setSelectedBooking(res); setCurrentAction('view-booking-detail'); }}
                    />
                  )}

                  {activeTab === 'coordinator' && (user.rol === 'COORDINADOR' || user.rol === 'ADMIN') && (
                    <CoordinatorPanel
                      currentUser={user}
                      onRefresh={handleUpdate}
                      onSelectBookingForReport={(booking) => {
                        setSelectedBooking(booking);
                        setCurrentAction('view-report');
                      }}
                    />
                  )}

                  {activeTab === 'admin' && user.rol === 'ADMIN' && (
                    <AdminPanel
                      currentUser={user}
                      onRefresh={handleUpdate}
                    />
                  )}
                </div>
              )}
            </div>

          </div>
        )}
      </main>

      {/* LOWER FOOTER BRAND (Hidden when printing reports) */}
      <footer className="mt-12 py-6 bg-slate-900 border-t border-slate-800 text-slate-400 text-center text-[10px] md:text-xs font-medium no-print space-y-2">
        <p>© 2026 Gestor Aula ATECA. Diseñado para simplificar la planificación de innovación educativa y currículo en Formación Profesional canaria.</p>
        <div className="flex items-center justify-center gap-4 text-[11px] text-slate-400 font-semibold pt-1">
          <button
            onClick={() => setShowPrivacyModal(true)}
            className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 underline underline-offset-4 transition-colors cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5" /> Cláusula de Privacidad y Protección de Datos (RGPD)
          </button>
        </div>
        <p className="text-slate-500 font-bold font-mono uppercase text-[9px] tracking-widest pt-1">
          Consola optimizada para dispositivos Móviles, Tablets e iFrame. Sincronización Google Sheets Soportada.
        </p>
      </footer>

      {/* RGPD Privacy Modal */}
      <PrivacyModal isOpen={showPrivacyModal} onClose={() => setShowPrivacyModal(false)} />
    </div>
  );
}
