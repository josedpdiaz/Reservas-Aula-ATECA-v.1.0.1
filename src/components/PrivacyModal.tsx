/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldCheck, X, FileText, CheckCircle2 } from 'lucide-react';
import { getConfig } from '../lib/storage';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PrivacyModal({ isOpen, onClose }: PrivacyModalProps) {
  if (!isOpen) return null;

  const config = getConfig();
  const centro = config.nombre_centro || "Centro Educativo (Canarias Educación)";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs no-print animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex justify-between items-center border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base font-bold leading-tight">Cláusula de Protección de Datos y Privacidad</h2>
              <p className="text-[11px] text-slate-400 font-mono">Conforme al RGPD (UE 2016/679) y LOPDGDD 3/2018</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-600 leading-relaxed">
          
          {/* Summary Box */}
          <div className="p-3.5 bg-emerald-50/50 border border-emerald-100 rounded-xl flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-emerald-900 text-[11px]">Protección de Datos de Alumnado Garantizada</p>
              <p className="text-[11px] text-emerald-800 mt-0.5">
                Esta aplicación <strong>no recopila ni almacena nombres, apellidos ni identificadores de alumnos</strong>. Únicamente se registran métricas numéricas globales (ej. «20 alumnos») y denominación de grupos formativos para control de aforo y memoria pedagógica.
              </p>
            </div>
          </div>

          {/* Section 1 */}
          <div>
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-500" /> 1. Responsable del Tratamiento
            </h3>
            <p>
              El responsable del tratamiento de los datos es la dirección del <strong>{centro}</strong>, en el marco de las competencias educativas atribuidas por la Consejería de Educación, Formación Profesional, Actividad Física y Deportes del Gobierno de Canarias.
            </p>
          </div>

          {/* Section 2 */}
          <div>
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-500" /> 2. Finalidad del Tratamiento
            </h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Gestión operativa de reservas de espacios y equipamiento tecnológico del Aula ATECA.</li>
              <li>Coordinación de recursos didácticos y soporte técnico entre el profesorado y la Coordinación ATECA.</li>
              <li>Elaboración de evidencias formativas y memorias anuales de innovación didáctica exigidas para la justificación del programa de Aulas de Tecnología Aplicada.</li>
            </ul>
          </div>

          {/* Section 3 */}
          <div>
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-500" /> 3. Base Jurídica de Legitimación
            </h3>
            <p>
              El tratamiento de los datos identificativos del personal docente se fundamenta en el <strong>artículo 6.1.e) del RGPD</strong>: el tratamiento es necesario para el cumplimiento de una misión realizada en <em>interés público</em> o en el ejercicio de poderes públicos conferidos al responsable del tratamiento (gestión de la función docente y recursos del centro educativo público).
            </p>
          </div>

          {/* Section 4 */}
          <div>
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-500" /> 4. Datos del Profesorado y Buenas Prácticas
            </h3>
            <p>
              Se recomienda el uso exclusivo de la <strong>cuenta de correo corporativa</strong> proporcionada por la Consejería de Educación o el centro educativo (ej. <code>@canariaseducacion.org</code>). Los datos tratados se limitan a: nombre y apellidos del profesorado solicitante, departamento didáctico, correo oficial y descripción de las actividades lectivas.
            </p>
          </div>

          {/* Section 5 */}
          <div>
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-500" /> 5. Destinatarios y Seguridad
            </h3>
            <p>
              Los datos no se cederán a terceros ajenos a la administración educativa salvo obligación legal. En caso de activación de la sincronización centralizada en la nube (Google Sheets), el tratamiento se realiza bajo los acuerdos de seguridad y privacidad formalizados entre la Consejería y los proveedores conforme al Esquema Nacional de Seguridad (ENS).
            </p>
          </div>

          {/* Section 6 */}
          <div>
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-500" /> 6. Ejercicio de Derechos
            </h3>
            <p>
              El profesorado interesado podrá ejercer sus derechos de acceso, rectificación, supresión o limitación del tratamiento dirigiéndose a la Secretaría del centro educativo o ante el Delegado de Protección de Datos (DPD) de la Consejería de Educación.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs">
          <span className="text-slate-400 text-[11px] font-mono">Aula ATECA • Red de Innovación FP Canarias</span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg transition-colors cursor-pointer shadow-xs"
          >
            Entendido y Aceptar
          </button>
        </div>

      </div>
    </div>
  );
}
