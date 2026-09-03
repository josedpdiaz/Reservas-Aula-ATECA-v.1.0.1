/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  UserPlus, Power, Settings, Trash, AlertTriangle, FileSpreadsheet, 
  Play, CheckCircle2, CloudLightning, Calendar, CalendarOff, Image as ImageIcon, 
  Upload, X, ShieldAlert, Sparkles, HelpCircle, Info
} from 'lucide-react';
import { Usuario, Bloqueo, DiaNoHabil, TipoDiaNoHabil } from '../types';
import { 
  getUsuarios, getReservas, getValoraciones, getBloqueos, getConfig, 
  modifyUsuario, addUsuario, addBloqueo, removeBloqueo, setConfig, 
  formatDateToYMD, getDiasNoHabiles, addDiaNoHabil, removeDiaNoHabil 
} from '../lib/storage';
import SheetsGuide from './SheetsGuide';

interface AdminPanelProps {
  onRefresh: () => void;
  currentUser: Usuario;
}

export default function AdminPanel({ onRefresh, currentUser }: AdminPanelProps) {
  // Config state
  const rawConfig = getConfig();
  const [nombreCentro, setNombreCentro] = useState(rawConfig.nombre_centro || '');
  const [nombreAula, setNombreAula] = useState(rawConfig.nombre_aula || '');
  const [horarioInicio, setHorarioInicio] = useState(rawConfig.horario_inicio || '08:00');
  const [horarioFin, setHorarioFin] = useState(rawConfig.horario_fin || '22:30');
  const [emailCoordinador, setEmailCoordinador] = useState(rawConfig.email_coordinador || '');
  const [gsheetUrl, setGsheetUrl] = useState(rawConfig.google_sheets_url || '');
  const [logoCentro, setLogoCentro] = useState(rawConfig.logo_centro || '');

  // Holidays state
  const [diasNoHabiles, setDiasNoHabiles] = useState<DiaNoHabil[]>(() => getDiasNoHabiles());
  const [dnhNombre, setDnhNombre] = useState('');
  const [dnhTipo, setDnhTipo] = useState<TipoDiaNoHabil>('VACACIONES');
  const [dnhInicio, setDnhInicio] = useState(() => formatDateToYMD());
  const [dnhFin, setDnhFin] = useState(() => formatDateToYMD());

  // User form
  const [newUsrName, setNewUsrName] = useState('');
  const [newUsrEmail, setNewUsrEmail] = useState('');
  const [newUsrRol, setNewUsrRol] = useState<'PROFESOR' | 'COORDINADOR' | 'ADMIN'>('PROFESOR');
  const [newUsrDept, setNewUsrDept] = useState('');

  // Lockout form
  const [blockFecha, setBlockFecha] = useState(() => formatDateToYMD());
  const [blockInicio, setBlockInicio] = useState('08:00');
  const [blockFin, setBlockFin] = useState('14:00');
  const [blockMotivo, setBlockMotivo] = useState('');

  const [activeTab, setActiveTab] = useState<'users' | 'blocks' | 'holidays' | 'settings' | 'sheets'>('users');
  const [syncStatus, setSyncStatus] = useState<{ loading: boolean; success?: boolean; msg?: string }>({ loading: false });

  const usuarios = getUsuarios();
  const bloqueos = getBloqueos();

  const handleUpdateUserRol = (id: string, rol: 'PROFESOR' | 'COORDINADOR' | 'ADMIN') => {
    modifyUsuario(id, { rol });
    onRefresh();
  };

  const handleToggleUserActive = (id: string, currentStatus: boolean) => {
    modifyUsuario(id, { activo: !currentStatus });
    onRefresh();
  };

  const handleAddUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsrName.trim() || !newUsrEmail.trim() || !newUsrDept.trim()) return;

    addUsuario({
      nombre: newUsrName.trim(),
      email: newUsrEmail.trim().toLowerCase(),
      rol: newUsrRol,
      departamento: newUsrDept.trim(),
      turno: "Ambos",
      activo: true,
    });

    setNewUsrName('');
    setNewUsrEmail('');
    setNewUsrDept('');
    onRefresh();
  };

  const handleBlockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!blockMotivo.trim()) return;

    addBloqueo({
      fecha: blockFecha,
      hora_inicio: blockInicio,
      hora_fin: blockFin,
      motivo: blockMotivo.trim(),
      creado_por: currentUser.nombre,
    });

    setBlockMotivo('');
    onRefresh();
  };

  const handleDeleteBlock = (id: string) => {
    removeBloqueo(id);
    onRefresh();
  };

  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024 * 1.5) {
      alert('El archivo es demasiado grande (máx 1.5 MB). Te sugerimos un logo SVG o PNG ligero de menos de 500 KB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setLogoCentro(result);
    };
    reader.readAsDataURL(file);
  };

  const handleAddHoliday = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dnhNombre.trim() || !dnhInicio || !dnhFin) return;
    if (dnhInicio > dnhFin) {
      alert('La fecha de inicio no puede ser posterior a la fecha de fin.');
      return;
    }

    addDiaNoHabil({
      nombre: dnhNombre.trim(),
      tipo: dnhTipo,
      fecha_inicio: dnhInicio,
      fecha_fin: dnhFin,
    });

    setDiasNoHabiles(getDiasNoHabiles());
    setDnhNombre('');
    onRefresh();
  };

  const handleDeleteHoliday = (id: string) => {
    removeDiaNoHabil(id);
    setDiasNoHabiles(getDiasNoHabiles());
    onRefresh();
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setConfig({
      ...rawConfig,
      nombre_centro: nombreCentro,
      nombre_aula: nombreAula,
      horario_inicio: horarioInicio,
      horario_fin: horarioFin,
      email_coordinador: emailCoordinador,
      google_sheets_url: gsheetUrl,
      logo_centro: logoCentro,
    });
    alert('Configuración y personalización del centro guardadas correctamente.');
    onRefresh();
  };

  // Google Sheets integration logic (fully works if URL is pasted, else simulated)
  const handleSheetsSync = async () => {
    if (!gsheetUrl) {
      alert('Por favor, introduce una URL de Google Apps Script primero.');
      return;
    }

    setSyncStatus({ loading: true });

    try {
      const payload = {
        action: "bulk_sync",
        data: {
          usuarios: getUsuarios(),
          reservas: getReservas(),
          valoraciones: getValoraciones(),
          configuracion: Object.entries(getConfig()).map(([clave, valor]) => ({ clave, valor })),
          bloqueos: getBloqueos()
        }
      };

      const response = await fetch(gsheetUrl, {
        method: 'POST',
        mode: 'no-cors', // standard Apps Script POST bypass
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      // No-cors won't give back status, but was sent.
      setSyncStatus({ 
        loading: false, 
        success: true, 
        msg: "Sincronización enviada con éxito. Los datos locales han sido transmitidos a tu archivo de Google Sheets." 
      });
      onRefresh();
    } catch (err: any) {
      setSyncStatus({ 
        loading: false, 
        success: false, 
        msg: "Error al comunicar con la URL: " + err.toString() 
      });
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Banner */}
      <div className="bg-slate-900 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3 text-white">
          <Settings className="h-6 w-6 text-indigo-400" />
          <div>
            <h1 className="text-xl font-bold">Consola de Administración</h1>
            <p className="text-xs text-indigo-200">Ajustes generales, bloqueos técnicos e integración de base de datos</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex-1 py-3 border-r border-slate-200 text-center cursor-pointer transition-colors ${
            activeTab === 'users' ? 'bg-white text-slate-800 border-b-2 border-b-slate-900' : 'hover:bg-slate-100'
          }`}
        >
          Gestión de Usuarios
        </button>
        <button
          onClick={() => setActiveTab('blocks')}
          className={`flex-1 py-3 border-r border-slate-200 text-center cursor-pointer transition-colors ${
            activeTab === 'blocks' ? 'bg-white text-slate-800 border-b-2 border-b-slate-900' : 'hover:bg-slate-100'
          }`}
        >
          Bloquear Horas (Bloqueos)
        </button>
        <button
          onClick={() => setActiveTab('holidays')}
          className={`flex-1 py-3 border-r border-slate-200 text-center cursor-pointer transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'holidays' ? 'bg-white text-slate-800 border-b-2 border-b-slate-900' : 'hover:bg-slate-100'
          }`}
        >
          <CalendarOff className="w-3.5 h-3.5 text-rose-500" /> Días No Hábiles
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex-1 py-3 border-r border-slate-200 text-center cursor-pointer transition-colors ${
            activeTab === 'settings' ? 'bg-white text-slate-800 border-b-2 border-b-slate-900' : 'hover:bg-slate-100'
          }`}
        >
          Parámetros Generales
        </button>
        <button
          onClick={() => setActiveTab('sheets')}
          className={`flex-1 py-3 text-center cursor-pointer transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'sheets' ? 'bg-white text-slate-800 border-b-2 border-b-slate-900' : 'hover:bg-slate-100'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" /> Google Sheets
        </button>
      </div>

      {/* Grid content */}
      <div className="p-6">
        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Create user */}
            <form onSubmit={handleAddUserSubmit} className="bg-slate-50/50 p-4 border border-slate-200 rounded-xl space-y-4">
              <h3 className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider"><UserPlus className="w-4 h-4 text-slate-500" /> Registrar nuevo docente</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Nombre y Apellidos</label>
                  <input
                    type="text"
                    required
                    value={newUsrName}
                    onChange={(e) => setNewUsrName(e.target.value)}
                    placeholder="Ej: Laura Palmer"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    required
                    value={newUsrEmail}
                    onChange={(e) => setNewUsrEmail(e.target.value)}
                    placeholder="docente@centro.edu"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Rol</label>
                  <select
                    value={newUsrRol}
                    onChange={(e) => setNewUsrRol(e.target.value as any)}
                    className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg outline-none font-medium cursor-pointer"
                  >
                    <option value="PROFESOR">PROFESOR</option>
                    <option value="COORDINADOR">COORDINADOR</option>
                    <option value="ADMIN">ADMINISTRADOR (ADMIN)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Departamento</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={newUsrDept}
                      onChange={(e) => setNewUsrDept(e.target.value)}
                      placeholder="Ej: Electrónica"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg outline-none"
                    />
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-slate-800 text-white font-bold rounded-lg hover:bg-slate-700 active:bg-slate-600 cursor-pointer text-xs"
                    >
                      Añadir
                    </button>
                  </div>
                </div>
              </div>
            </form>

            {/* Users lists */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                    <th className="p-3">Docente</th>
                    <th className="p-3">Email de cuenta</th>
                    <th className="p-3">Departamento</th>
                    <th className="p-3 text-center">Rol asignado</th>
                    <th className="p-3 text-center">Estado de acceso</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {usuarios.map(usr => (
                    <tr key={usr.id_usuario} className="hover:bg-slate-50/20">
                      <td className="p-3 font-semibold text-slate-800">{usr.nombre}</td>
                      <td className="p-3 font-mono text-slate-500">{usr.email}</td>
                      <td className="p-3 font-medium text-slate-600">{usr.departamento}</td>
                      <td className="p-3 text-center">
                        <select
                          value={usr.rol}
                          disabled={usr.id_usuario === currentUser.id_usuario}
                          onChange={(e) => handleUpdateUserRol(usr.id_usuario, e.target.value as any)}
                          className={`px-2 py-1 text-[11px] rounded-lg border font-bold bg-white text-slate-700 outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          <option value="PROFESOR">PROFESOR</option>
                          <option value="COORDINADOR">COORDINADOR</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          type="button"
                          disabled={usr.id_usuario === currentUser.id_usuario}
                          onClick={() => handleToggleUserActive(usr.id_usuario, usr.activo)}
                          className={`px-3 py-1 text-[10px] rounded-full font-bold cursor-pointer transition-all flex items-center justify-center gap-1 mx-auto disabled:opacity-50 disabled:cursor-not-allowed border ${
                            usr.activo 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100' 
                              : 'bg-red-50 text-red-700 border-red-100 hover:bg-red-100'
                          }`}
                        >
                          <Power className="w-3 h-3" />
                          {usr.activo ? 'ACTIVO' : 'DEBAJA'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'blocks' && (
          <div className="space-y-6">
            {/* Create Lockout */}
            <form onSubmit={handleBlockSubmit} className="bg-slate-50/50 p-4 border border-slate-200 rounded-xl space-y-4">
              <h3 className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider"><AlertTriangle className="w-4 h-4 text-rose-500" /> Crear Bloqueo de aula</h3>
              <p className="text-xs text-slate-400 leading-tight">Las franjas bloqueadas impedirán que los profesores puedan solicitar reservas ese día y rango. Úsalo para limpiezas, mantenimiento o reuniones especiales.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Fecha</label>
                  <input
                    type="date"
                    required
                    value={blockFecha}
                    onChange={(e) => setBlockFecha(e.target.value)}
                    className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Hora inicio</label>
                  <input
                    type="time"
                    required
                    value={blockInicio}
                    onChange={(e) => setBlockInicio(e.target.value)}
                    className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Hora fin</label>
                  <input
                    type="time"
                    required
                    value={blockFin}
                    onChange={(e) => setBlockFin(e.target.value)}
                    className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Motivo del Bloqueo técnico</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={blockMotivo}
                      onChange={(e) => setBlockMotivo(e.target.value)}
                      placeholder="Mantenimiento, limpieza..."
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg outline-none"
                    />
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 hover:shadow active:scale-95 text-white font-bold rounded-lg cursor-pointer text-xs"
                    >
                      Bloquear
                    </button>
                  </div>
                </div>
              </div>
            </form>

            {/* List lockout blocks */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                    <th className="p-3">Fecha del bloqueo</th>
                    <th className="p-3">Horario</th>
                    <th className="p-3">Motivo / Causa</th>
                    <th className="p-3">Creado por</th>
                    <th className="p-3 text-center">Deshacer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {bloqueos.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-5 text-center text-slate-400">No hay bloqueos activos programados.</td>
                    </tr>
                  ) : (
                    bloqueos.map(b => (
                      <tr key={b.id_bloqueo} className="hover:bg-slate-50/20">
                        <td className="p-3 font-semibold text-slate-800">{b.fecha.split('-').reverse().join('/')}</td>
                        <td className="p-3 font-mono font-bold text-slate-600">{b.hora_inicio} - {b.hora_fin}</td>
                        <td className="p-3 text-slate-600">{b.motivo}</td>
                        <td className="p-3 text-slate-400 italic">{b.creado_por}</td>
                        <td className="p-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleDeleteBlock(b.id_bloqueo)}
                            className="p-1 px-2.5 bg-red-100 hover:bg-red-200 text-red-700 rounded font-bold cursor-pointer inline-flex items-center gap-1 text-[10px]"
                          >
                            <Trash className="w-3.5 h-3.5" /> Borrar
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'holidays' && (
          <div className="space-y-6">
            {/* Weekend default rule banner */}
            <div className="bg-slate-900 text-white p-4 rounded-xl flex items-start gap-3 text-xs leading-relaxed shadow-xs">
              <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm text-white">Regla permanente: Sábados y Domingos No Hábiles</p>
                <p className="text-slate-300 mt-0.5">
                  Por normativa del centro, los fines de semana (sábados y domingos) quedan <strong>siempre marcados como no lectivos</strong> en el calendario de forma automática e impiden cualquier reserva en esas fechas.
                </p>
              </div>
            </div>

            {/* Form to add non-working period / holiday */}
            <form onSubmit={handleAddHoliday} className="bg-slate-50 p-4 border border-slate-200 rounded-xl space-y-3">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <CalendarOff className="w-4 h-4 text-rose-500" /> Añadir Festivo o Periodo No Lectivo al Calendario
              </h3>
              <p className="text-slate-500 text-xs">
                Registra vacaciones (Navidad, Semana Santa), festivos insulares/nacionales o días de libre disposición escolar aprobados por el Consejo Escolar.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Nombre / Motivo</label>
                  <input
                    type="text"
                    required
                    value={dnhNombre}
                    onChange={(e) => setDnhNombre(e.target.value)}
                    placeholder="Ej: Vacaciones de Navidad, Carnavales..."
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg outline-none text-xs focus:border-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Tipo de No Lectivo</label>
                  <select
                    value={dnhTipo}
                    onChange={(e) => setDnhTipo(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg outline-none text-xs font-bold text-slate-700"
                  >
                    <option value="VACACIONES">Vacaciones Escolares</option>
                    <option value="FESTIVO">Festivo Oficial</option>
                    <option value="LIBRE_DISPOSICION">Libre Disposición de Centro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Fecha de Inicio</label>
                  <input
                    type="date"
                    required
                    value={dnhInicio}
                    onChange={(e) => {
                      setDnhInicio(e.target.value);
                      if (dnhFin < e.target.value) setDnhFin(e.target.value);
                    }}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg outline-none text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Fecha de Fin</label>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      required
                      value={dnhFin}
                      min={dnhInicio}
                      onChange={(e) => setDnhFin(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg outline-none text-xs"
                    />
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg cursor-pointer text-xs shrink-0 shadow-2xs"
                    >
                      Añadir
                    </button>
                  </div>
                </div>
              </div>
            </form>

            {/* List of holidays */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                    <th className="p-3">Periodo / Festividad</th>
                    <th className="p-3">Tipo</th>
                    <th className="p-3">Desde</th>
                    <th className="p-3">Hasta</th>
                    <th className="p-3 text-center">Eliminar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {diasNoHabiles.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-5 text-center text-slate-400">No hay periodos no lectivos configurados aparte de los fines de semana.</td>
                    </tr>
                  ) : (
                    diasNoHabiles.map(d => (
                      <tr key={d.id} className="hover:bg-slate-50/40">
                        <td className="p-3 font-semibold text-slate-900">{d.nombre}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            d.tipo === 'VACACIONES' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                            d.tipo === 'LIBRE_DISPOSICION' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            'bg-sky-50 text-sky-700 border-sky-200'
                          }`}>
                            {d.tipo === 'VACACIONES' ? 'Vacaciones' : d.tipo === 'LIBRE_DISPOSICION' ? 'Libre Disposición' : 'Festivo'}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-slate-600">{d.fecha_inicio.split('-').reverse().join('/')}</td>
                        <td className="p-3 font-mono text-slate-600">{d.fecha_fin.split('-').reverse().join('/')}</td>
                        <td className="p-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleDeleteHoliday(d.id)}
                            className="p-1 px-2.5 bg-red-100 hover:bg-red-200 text-red-700 rounded font-bold cursor-pointer inline-flex items-center gap-1 text-[10px]"
                          >
                            <Trash className="w-3.5 h-3.5" /> Borrar
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <form onSubmit={handleSaveConfig} className="space-y-6 text-sm max-w-3xl">
            {/* LOGO PERSONALIZADO DEL CENTRO */}
            <div className="bg-slate-50/80 border border-slate-200 p-5 rounded-2xl space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-indigo-600" /> Logotipo Institucional del Centro
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Personaliza el icono de la cabecera superior con el escudo o logo oficial de tu centro escolar.
                  </p>
                </div>
                {logoCentro && (
                  <button
                    type="button"
                    onClick={() => setLogoCentro('')}
                    className="px-2.5 py-1 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg cursor-pointer transition-colors"
                  >
                    Restablecer icono original
                  </button>
                )}
              </div>

              {/* Live Preview Box */}
              <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-3.5 rounded-xl border border-slate-200/80">
                <div className="flex items-center gap-3 bg-slate-900 text-white p-3 rounded-xl border border-slate-800 shadow-2xs shrink-0">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">Vista previa:</span>
                  <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-700">
                    {logoCentro ? (
                      <img src={logoCentro} alt="Logo Centro" className="w-full h-full object-contain p-0.5" />
                    ) : (
                      <Sparkles className="w-5 h-5 text-emerald-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-black leading-tight">Gestor Aula ATECA</p>
                    <p className="text-[9px] text-slate-400 font-mono font-bold uppercase mt-0.5">{nombreCentro || "Tu Centro Educativo"}</p>
                  </div>
                </div>

                <div className="flex-1 w-full space-y-2">
                  <div className="flex gap-2 items-center">
                    <label className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 shadow-2xs">
                      <Upload className="w-3.5 h-3.5" /> Subir archivo de imagen...
                      <input
                        type="file"
                        accept="image/png,image/svg+xml,image/jpeg,image/webp"
                        onChange={handleLogoFileUpload}
                        className="hidden"
                      />
                    </label>
                    <span className="text-[11px] text-slate-400">o introduce URL directa:</span>
                  </div>
                  <input
                    type="url"
                    value={logoCentro}
                    onChange={(e) => setLogoCentro(e.target.value)}
                    placeholder="https://micentro.es/logo.png"
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-slate-400 font-mono"
                  />
                </div>
              </div>

              {/* Guía y especificaciones técnicas exactas para el Administrador */}
              <div className="bg-indigo-50/50 border border-indigo-150 rounded-xl p-3.5 text-[11px] leading-relaxed text-slate-600 space-y-1.5">
                <p className="font-bold text-indigo-950 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-indigo-600" /> Especificaciones técnicas recomendadas para el logotipo:
                </p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-slate-600 list-disc pl-4">
                  <li><strong>Formato idóneo:</strong> SVG vectorial o PNG con fondo transparente.</li>
                  <li><strong>Dimensiones óptimas:</strong> Cuadrado de <code>48x48 px</code> a <code>128x128 px</code> (o apaisado hasta <code>200x48 px</code>).</li>
                  <li><strong>Peso recomendado:</strong> Menor a <code>500 KB</code> para carga instantánea.</li>
                  <li><strong>Ubicación:</strong> Esquina superior izquierda de la cabecera en lugar del icono genérico.</li>
                </ul>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Nombre del Centro Educativo</label>
                <input
                  type="text"
                  required
                  value={nombreCentro}
                  onChange={(e) => setNombreCentro(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-slate-400 rounded-lg text-xs outline-none font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Nombre del Aula Tecnológica</label>
                <input
                  type="text"
                  required
                  value={nombreAula}
                  onChange={(e) => setNombreAula(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-slate-400 rounded-lg text-xs outline-none font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Hora Apertura (Lunes a Viernes)</label>
                <input
                  type="time"
                  required
                  value={horarioInicio}
                  onChange={(e) => setHorarioInicio(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-slate-400 rounded-lg text-xs outline-none font-mono font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Hora Cierre (Lunes a Viernes)</label>
                <input
                  type="time"
                  required
                  value={horarioFin}
                  onChange={(e) => setHorarioFin(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-slate-400 rounded-lg text-xs outline-none font-mono font-medium"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-500 mb-1">Correo del Coordinador ATECA habitual</label>
                <input
                  type="email"
                  required
                  value={emailCoordinador}
                  onChange={(e) => setEmailCoordinador(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-slate-400 rounded-lg text-xs outline-none font-medium"
                />
              </div>
            </div>

            <div className="border-t border-slate-100 pt-5 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2 hover:shadow bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-bold rounded-lg cursor-pointer text-xs transition-all shadow-sm"
              >
                Guardar cambios globales y logotipo
              </button>
            </div>
          </form>
        )}

        {activeTab === 'sheets' && (
          <div className="space-y-6">
            {/* Sheet webhook configure input */}
            <div className="bg-slate-50 p-4 border border-slate-200 rounded-xl space-y-4">
              <h3 className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider"><CloudLightning className="w-4 h-4 text-emerald-500" /> Endpoint de Apps Script API</h3>
              <p className="text-xs text-slate-400 leading-tight">Introduce aquí la URL del Web App de Google Apps Script generado. Esto permitirá sincronizar la base de datos de forma segura e inmediata.</p>
              
              <div className="flex gap-2">
                <input
                  type="url"
                  value={gsheetUrl}
                  onChange={(e) => setGsheetUrl(e.target.value)}
                  placeholder="Ej: https://script.google.com/macros/s/.../exec"
                  className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs outline-none leading-none"
                />
                <button
                  onClick={handleSheetsSync}
                  disabled={syncStatus.loading || !gsheetUrl}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 disabled:bg-slate-300 text-white font-bold rounded-lg cursor-pointer text-xs flex items-center gap-1 transition-colors"
                >
                  <Play className="w-3.5 h-3.5" /> {syncStatus.loading ? 'Enviando...' : 'Transferir todo (Sincronizar)'}
                </button>
              </div>

              {syncStatus.msg && (
                <div className={`p-3 text-xs rounded-lg font-semibold flex items-center gap-2 ${
                  syncStatus.success ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
                }`}>
                  <CheckCircle2 className="w-4 h-4" /> {syncStatus.msg}
                </div>
              )}
            </div>

            <SheetsGuide />
          </div>
        )}
      </div>
    </div>
  );
}
