/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UserPlus, Power, Key, Settings, Trash, AlertTriangle, FileSpreadsheet, Play, CheckCircle2, CloudLightning } from 'lucide-react';
import { Usuario, Bloqueo } from '../types';
import { getUsuarios, getBloqueos, getConfig, modifyUsuario, addUsuario, addBloqueo, removeBloqueo, setConfig } from '../lib/storage';
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
  const [horarioFin, setHorarioFin] = useState(rawConfig.horario_fin || '21:00');
  const [emailCoordinador, setEmailCoordinador] = useState(rawConfig.email_coordinador || '');
  const [gsheetUrl, setGsheetUrl] = useState(rawConfig.google_sheets_url || '');

  // User form
  const [newUsrName, setNewUsrName] = useState('');
  const [newUsrEmail, setNewUsrEmail] = useState('');
  const [newUsrRol, setNewUsrRol] = useState<'PROFESOR' | 'COORDINADOR' | 'ADMIN'>('PROFESOR');
  const [newUsrDept, setNewUsrDept] = useState('');

  // Lockout form
  const [blockFecha, setBlockFecha] = useState(new Date().toISOString().split('T')[0]);
  const [blockInicio, setBlockInicio] = useState('08:00');
  const [blockFin, setBlockFin] = useState('14:00');
  const [blockMotivo, setBlockMotivo] = useState('');

  const [activeTab, setActiveTab] = useState<'users' | 'blocks' | 'settings' | 'sheets'>('users');
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
    });
    alert('Configuración guardada correctamente.');
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
          reservas: JSON.parse(localStorage.getItem('ateca_reservas') || '[]'),
          valoraciones: JSON.parse(localStorage.getItem('ateca_valoraciones') || '[]'),
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
      <div className="flex bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-505">
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
            <form onSubmit={handleAddUserSubmit} className="bg-slate-50/50 p-4 border border-slate-150 rounded-xl space-y-4">
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
                      <td className="p-3 font-medium text-slate-650">{usr.departamento}</td>
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
            <form onSubmit={handleBlockSubmit} className="bg-slate-50/50 p-4 border border-slate-150 rounded-xl space-y-4">
              <h3 className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider"><AlertTriangle className="w-4 h-4 text-rose-500" /> Crear Bloqueo de aula</h3>
              <p className="text-xs text-slate-400 leading-tight">Las franjas bloqueadas impedirán que los profesores puedan solicitar reservas ese día y rango. Úsalo para limpiezas, mantenimiento o reuniones especiales.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                <div>
                  <label className="block text-slate-405 font-bold mb-1">Fecha</label>
                  <input
                    type="date"
                    required
                    value={blockFecha}
                    onChange={(e) => setBlockFecha(e.target.value)}
                    className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-405 font-bold mb-1">Hora inicio</label>
                  <input
                    type="time"
                    required
                    value={blockInicio}
                    onChange={(e) => setBlockInicio(e.target.value)}
                    className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-405 font-bold mb-1">Hora fin</label>
                  <input
                    type="time"
                    required
                    value={blockFin}
                    onChange={(e) => setBlockFin(e.target.value)}
                    className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-405 font-bold mb-1">Motivo del Bloqueo técnico</label>
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
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-550 font-bold uppercase tracking-wider">
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
                        <td className="p-3 font-semibold text-slate-850">{b.fecha.split('-').reverse().join('/')}</td>
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

        {activeTab === 'settings' && (
          <form onSubmit={handleSaveConfig} className="space-y-6 text-sm max-w-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Nombre del Centro Educativo</label>
                <input
                  type="text"
                  required
                  value={nombreCentro}
                  onChange={(e) => setNombreCentro(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-205 focus:border-slate-450 rounded-lg text-xs outline-none font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Nombre del Aula Tecnológica</label>
                <input
                  type="text"
                  required
                  value={nombreAula}
                  onChange={(e) => setNombreAula(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-205 focus:border-slate-450 rounded-lg text-xs outline-none font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Hora Apertura (Lunes a Viernes)</label>
                <input
                  type="time"
                  required
                  value={horarioInicio}
                  onChange={(e) => setHorarioInicio(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-205 focus:border-slate-450 rounded-lg text-xs outline-none font-mono font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Hora Cierre (Lunes a Viernes)</label>
                <input
                  type="time"
                  required
                  value={horarioFin}
                  onChange={(e) => setHorarioFin(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-205 focus:border-slate-450 rounded-lg text-xs outline-none font-mono font-medium"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-500 mb-1">Correo del Coordinador ATECA habitual</label>
                <input
                  type="email"
                  required
                  value={emailCoordinador}
                  onChange={(e) => setEmailCoordinador(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-205 focus:border-slate-450 rounded-lg text-xs outline-none font-medium"
                />
              </div>
            </div>

            <div className="border-t border-slate-100 pt-5 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2 hover:shadow bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-bold rounded-lg cursor-pointer text-xs transition-all shadow-sm"
              >
                Guardar cambios globales
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
