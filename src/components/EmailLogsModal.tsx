/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Inbox, Mail, CheckCircle2, AlertCircle, Trash, X, 
  ExternalLink, Eye, RefreshCw, Send, Check
} from 'lucide-react';
import { EmailLog } from '../types';
import { getEmailLogs, clearEmailLogs } from '../lib/emailService';

interface EmailLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EmailLogsModal({ isOpen, onClose }: EmailLogsModalProps) {
  if (!isOpen) return null;

  const [logs, setLogs] = useState<EmailLog[]>(() => getEmailLogs());
  const [selectedLog, setSelectedLog] = useState<EmailLog | null>(null);
  const [copied, setCopied] = useState(false);

  const refreshLogs = () => {
    setLogs(getEmailLogs());
  };

  const handleClear = () => {
    if (window.confirm('¿Deseas vaciar el historial de registros de correos enviados?')) {
      clearEmailLogs();
      setLogs([]);
      setSelectedLog(null);
    }
  };

  const handleCopyHtml = (html: string) => {
    navigator.clipboard.writeText(html);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 md:p-6 z-50 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* HEADER */}
        <div className="p-4 md:p-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400">
              <Inbox className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Bandeja de Registro y Auditoría de Correos
              </h2>
              <p className="text-xs text-slate-300 font-medium">
                Historial de avisos y notificaciones automáticas generadas por el sistema ({logs.length} registrados)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={refreshLogs}
              title="Actualizar bandeja"
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* BODY (TWO COLUMNS: LIST & PREVIEW) */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-slate-200 min-h-[400px]">
          
          {/* LEFT LIST COLUMN (5 COLS) */}
          <div className="md:col-span-5 flex flex-col h-[50vh] md:h-auto overflow-hidden bg-slate-50/50">
            <div className="p-3 bg-white border-b border-slate-200 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">Mensajes Emitidos</span>
              {logs.length > 0 && (
                <button
                  onClick={handleClear}
                  className="text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Trash className="w-3.5 h-3.5" /> Vaciar
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {logs.length === 0 ? (
                <div className="p-8 text-center text-slate-400 space-y-2">
                  <Mail className="w-8 h-8 mx-auto opacity-40" />
                  <p className="text-xs font-semibold">No hay correos registrados todavía.</p>
                  <p className="text-[11px]">Los avisos generados al solicitar, aprobar o liberar reservas aparecerán aquí.</p>
                </div>
              ) : (
                logs.map((log) => {
                  const isSelected = selectedLog?.id === log.id;
                  return (
                    <div
                      key={log.id}
                      onClick={() => setSelectedLog(log)}
                      className={`p-3.5 text-xs cursor-pointer transition-all border-l-3 ${
                        isSelected
                          ? 'bg-indigo-50/90 border-indigo-600 shadow-xs'
                          : 'hover:bg-white border-transparent'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="font-bold text-slate-900 truncate">
                          {log.destinatario_nombre}
                        </span>
                        <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                          {log.fecha_hora}
                        </span>
                      </div>

                      <p className="font-medium text-slate-700 truncate mb-1.5">
                        {log.asunto}
                      </p>

                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-mono text-slate-500 truncate max-w-[170px]">
                          {log.destinatario_email}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1 ${
                          log.enviado_real
                            ? 'bg-emerald-100 text-emerald-800'
                            : log.error
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-indigo-100 text-indigo-800'
                        }`}>
                          {log.enviado_real ? (
                            <><CheckCircle2 className="w-3 h-3" /> Enviado</>
                          ) : log.error ? (
                            <><AlertCircle className="w-3 h-3" /> Info</>
                          ) : (
                            <><Mail className="w-3 h-3" /> Registrado</>
                          )}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* RIGHT PREVIEW COLUMN (7 COLS) */}
          <div className="md:col-span-7 flex flex-col h-[50vh] md:h-auto overflow-hidden bg-white">
            {selectedLog ? (
              <div className="flex-1 flex flex-col h-full overflow-hidden">
                
                {/* PREVIEW HEADER */}
                <div className="p-4 border-b border-slate-200 bg-slate-50/70 space-y-2 shrink-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{selectedLog.asunto}</h3>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        Para: <strong className="text-slate-800">{selectedLog.destinatario_nombre}</strong> &lt;{selectedLog.destinatario_email}&gt;
                      </p>
                    </div>

                    <button
                      onClick={() => handleCopyHtml(selectedLog.cuerpo_html)}
                      className="px-2.5 py-1 text-[11px] font-bold bg-white border border-slate-200 rounded-lg hover:bg-slate-100 text-slate-700 cursor-pointer flex items-center gap-1 transition-colors"
                    >
                      {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Eye className="w-3 h-3" />}
                      {copied ? '¡Copiado!' : 'Copiar HTML'}
                    </button>
                  </div>

                  {selectedLog.error && (
                    <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-900 font-medium flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>{selectedLog.error}</span>
                    </div>
                  )}
                </div>

                {/* HTML RENDER PREVIEW (SAFELY INSIDE IFRAME) */}
                <div className="flex-1 p-3 bg-slate-100 overflow-hidden flex flex-col">
                  <iframe
                    title="Vista previa correo"
                    srcDoc={selectedLog.cuerpo_html}
                    className="w-full flex-1 rounded-xl border border-slate-300 bg-white shadow-inner"
                    sandbox="allow-same-origin"
                  />
                </div>

              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-2">
                <Inbox className="w-12 h-12 stroke-1 opacity-40 text-slate-300" />
                <p className="text-sm font-bold text-slate-600">Selecciona un mensaje</p>
                <p className="text-xs max-w-xs text-slate-400">
                  Haz clic en cualquier correo de la lista izquierda para previsualizar la plantilla HTML tal y como la recibe el docente.
                </p>
              </div>
            )}
          </div>

        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <p className="text-slate-500 font-medium">
            💡 Conecta la URL de Google Apps Script en el panel de Administración para habilitar entregas reales inmediatas.
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2 font-bold text-slate-700 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
}
