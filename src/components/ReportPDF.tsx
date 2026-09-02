/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { Printer, ArrowLeft, ShieldAlert, FileText, Calendar, BookOpen, Layers } from 'lucide-react';
import { Reserva } from '../types';
import { getValoraciones, getConfig } from '../lib/storage';

interface ReportPDFProps {
  booking: Reserva;
  onCancel: () => void;
}

export default function ReportPDF({ booking, onCancel }: ReportPDFProps) {
  const config = getConfig();
  const valoraciones = getValoraciones();
  
  // Find related valuation if any
  const valuation = useMemo(() => {
    return valoraciones.find(v => v.id_reserva === booking.id_reserva);
  }, [booking, valoraciones]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top action bar buttons (hidden when printing) */}
      <div className="bg-slate-900 text-white rounded-xl p-4 flex justify-between items-center no-print shadow-sm">
        <div className="flex items-center space-x-3 text-xs md:text-sm">
          <FileText className="w-5 h-5 text-emerald-450" />
          <div>
            <p className="font-bold">Generador de Informes de Evidencia</p>
            <p className="text-[11px] text-slate-300">Formatos oficiales de innovación Aula ATECA Canarias</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            id="btn_back_report"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-650 rounded-lg text-xs font-semibold cursor-pointer text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Volver a paneles
          </button>
          <button
            onClick={handlePrint}
            id="btn_do_print"
            className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 font-bold rounded-lg text-xs cursor-pointer text-white shadow-xs transition-colors"
          >
            <Printer className="h-3.5 w-3.5" /> Imprimir / Guardar PDF
          </button>
        </div>
      </div>

      {/* Main Print Container Sheet */}
      <div className="print-area bg-white border border-slate-350 p-8 md:p-12 shadow-md rounded-xl max-w-4xl mx-auto text-slate-800 font-sans leading-relaxed relative">
        
        {/* Header - Mimicking official Canary Islands Educational Department Layout */}
        <div className="border-b-4 border-slate-900 pb-5 pl-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase font-mono">CONSEJERÍA DE EDUCACIÓN Y DEPORTES</p>
            <h1 className="text-xl font-black text-slate-900 uppercase mt-0.5 tracking-tight font-serif">
              {config.nombre_centro || "CENTRO EDUCATIVO DE CANARIAS"}
            </h1>
            <p className="text-xs text-slate-450 font-bold mt-0.5">{config.nombre_aula || "Aula ATECA de Innovación"}</p>
          </div>
          <div className="bg-slate-100 border border-slate-200 px-4 py-2.5 rounded-lg text-center font-mono select-none self-end sm:self-auto">
            <span className="text-[10px] text-slate-400 block font-bold leading-none">CÓDIGO INFORME</span>
            <span className="text-xs font-black text-slate-800 leading-none block mt-1.5">ATECA-{booking.id_reserva.toUpperCase()}</span>
          </div>
        </div>

        {/* Title */}
        <div className="my-8 text-center bg-slate-50 border-y border-slate-200 py-4 rounded-lg">
          <h2 className="text-base font-extrabold tracking-tight uppercase text-slate-900 font-mono">Informe de actividad • Evidencia de Innovación Pedagógica</h2>
          <p className="text-[11px] text-slate-400 text-center font-bold mt-1">Conforme a las directrices de Formación Profesional y Tecnologías Disruptivas</p>
        </div>

        {/* SECTION 1: DATOS GENERALES */}
        <div className="space-y-6">
          <div>
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 border-b-2 border-slate-800 pb-1 mb-3">1. Datos Generales de la Reserva</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-6 text-xs">
              <div>
                <span className="text-slate-400 font-bold block mb-0.5 uppercase tracking-wide text-[9px]">Nombre del Centro</span>
                <span className="font-bold text-slate-800">{config.nombre_centro || "IES Centro Tecnológico"}</span>
              </div>
              <div>
                <span className="text-slate-400 font-bold block mb-0.5 uppercase tracking-wide text-[9px]">Nombre del Aula</span>
                <span className="font-bold text-slate-800">{config.nombre_aula || "Aula ATECA"}</span>
              </div>
              <div>
                <span className="text-slate-400 font-bold block mb-0.5 uppercase tracking-wide text-[9px]">Profesor Responsable</span>
                <span className="font-bold text-slate-800">{booking.profesor}</span>
              </div>
              <div>
                <span className="text-slate-400 font-bold block mb-0.5 uppercase tracking-wide text-[9px]">Fecha de realización</span>
                <span className="font-bold text-slate-800">{booking.fecha_actividad.split('-').reverse().join('/')}</span>
              </div>
              <div>
                <span className="text-slate-400 font-bold block mb-0.5 uppercase tracking-wide text-[9px]">Grupo de Alumnado</span>
                <span className="font-bold text-slate-800">{booking.grupo}</span>
              </div>
              <div>
                <span className="text-slate-400 font-bold block mb-0.5 uppercase tracking-wide text-[9px]">Módulo o Materia</span>
                <span className="font-bold text-slate-800">{booking.modulo_materia_area}</span>
              </div>
              <div>
                <span className="text-slate-400 font-bold block mb-0.5 uppercase tracking-wide text-[9px]">Zona ATECA utilizada</span>
                <span className="font-bold text-slate-800">{booking.zona_principal}</span>
              </div>
              <div>
                <span className="text-slate-400 font-bold block mb-0.5 uppercase tracking-wide text-[9px]">Número de Alumnos</span>
                <span className="font-bold text-slate-800">{booking.numero_alumnos} asistentes</span>
              </div>
              <div>
                <span className="text-slate-400 font-bold block mb-0.5 uppercase tracking-wide text-[9px]">Estado de la actividad</span>
                <span className="font-black text-slate-900 uppercase">{booking.estado}</span>
              </div>
            </div>
          </div>

          {/* SECTION 2: CONTEXTO CURRICULAR */}
          <div>
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 border-b-2 border-slate-800 pb-1 mb-2">2. Contexto Curricular</h3>
            <p className="text-xs text-slate-700 leading-relaxed">
              La actividad forma parte integrada del currículo de la etapa educativa <strong>{booking.nivel}</strong> del departamento de <strong>{booking.departamento}</strong>, cumpliendo con los criterios de evaluación del bloque temático asociado.
            </p>
          </div>

          {/* SECTION 3: ZONA ATECA UTILIZADA */}
          <div>
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 border-b-2 border-slate-800 pb-1 mb-2">3. Detalle de Zona Tecnológica</h3>
            <p className="text-xs text-slate-705 leading-relaxed">
              La actividad se ha coordinado en el aula completa focalizando en la zona técnica: <strong>{booking.zona_principal}</strong>. Esta zona incorpora recursos y hardware especializados idóneos para simular contextos de productividad real en la empresa educativa actual.
            </p>
          </div>

          {/* SECTION 4: OBJETIVO DIDÁCTICO */}
          <div>
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 border-b-2 border-slate-800 pb-1 mb-2">4. Objetivo Didáctico Principal</h3>
            <p className="text-xs text-slate-750 italic leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-150">
              "{booking.objetivo_didactico}"
            </p>
          </div>

          {/* SECTION 5: DESCRIPCIÓN DE LA ACTIVIDAD */}
          <div>
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 border-b-2 border-slate-800 pb-1 mb-2">5. Descripción de la Actividad</h3>
            <p className="text-xs text-slate-700 leading-relaxed bg-slate-50/50 p-4 rounded-lg border border-slate-100 whitespace-pre-wrap">
              {booking.descripcion_actividad}
            </p>
          </div>

          {/* SECTION 6: RECURSOS UTILIZADOS */}
          <div>
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 border-b-2 border-slate-800 pb-1 mb-2">6. Recursos Técnicos Utilizados</h3>
            <p className="text-xs text-slate-700 leading-relaxed">
              {booking.recursos_necesarios || "Uso del equipamiento estándar e instalaciones del aula completa."}
            </p>
            {booking.necesita_apoyo && (
              <p className="text-xs font-bold text-slate-700 mt-2">
                * Requirió el soporte presencial de personal del centro para coordinar la conexión o calibración del material tecnológico específico.
              </p>
            )}
          </div>

          {/* PAGE BREAK PREPARATION FOR PRINTING VALUATIONS IF COMPLETED */}
          <div className={`${valuation ? 'page-break mt-12 pt-10' : ''}`}>
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 border-b-2 border-slate-800 pb-1 mb-4">
              7. Desarrollo y Evidencias de Ejecución (Valoración posterior)
            </h3>

            {valuation ? (
              <div className="space-y-6">
                {/* 7. DEVELOPMENT & EVIDENCES */}
                <div>
                  <h4 className="font-bold text-[11px] text-slate-500 uppercase mb-1">Evidencias Tecnológicas y Educativas Generadas</h4>
                  <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-150">
                    {valuation.evidencias_generadas}
                  </p>
                </div>

                {/* 8. VALORACIÓN DOCENTE */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-bold text-[11px] text-slate-500 uppercase mb-1">8. Valoración Didáctica general del Docente</h4>
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs">
                      <p className="font-bold text-slate-800">{valuation.valoracion_general} de 5 estrellas</p>
                      <p className="text-slate-500 mt-1">
                        Considerado un rendimiento didáctico {valuation.valoracion_general >= 4 ? 'excelente y altamente recomendable' : 'favorable e incremental'}.
                      </p>
                    </div>
                  </div>

                  {/* 11. INNNOVATION */}
                  <div>
                    <h4 className="font-bold text-[11px] text-slate-500 uppercase mb-1">11. Consideración como Actividad de Innovación</h4>
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs flex items-center justify-between">
                      <span className="font-bold text-slate-850">¿Innovación Pedagógica?</span>
                      <span className={`px-2.5 py-0.5 rounded-full font-black text-[10px] ${
                        valuation.actividad_innovacion 
                          ? 'bg-slate-850 text-white' 
                          : 'bg-slate-200 text-slate-700'
                      }`}>
                        {valuation.actividad_innovacion ? 'SÍ, INNOVACIÓN' : 'SÍ, METODOLOGÍA ACTIVA'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {/* 9. DIFICULTADES ENCONTRADAS */}
                  <div>
                    <h4 className="font-bold text-[11px] text-slate-500 uppercase mb-1">9. Dificultades o Contingencias encontradas</h4>
                    <p className="text-slate-650 bg-slate-50/50 p-3 rounded-lg border border-slate-100 leading-relaxed min-h-16">
                      {valuation.dificultades || "Ninguna reseñable por el docente responsable."}
                    </p>
                  </div>

                  {/* 10. MEJORAS FUTURAS */}
                  <div>
                    <h4 className="font-bold text-[11px] text-slate-500 uppercase mb-1">10. Propuestas de Mejora sugeridas</h4>
                    <p className="text-slate-650 bg-slate-50/50 p-3 rounded-lg border border-slate-100 leading-relaxed min-h-16">
                      {valuation.mejoras_futuras || "Mantener la misma dinámica docente de cara al futuro."}
                    </p>
                  </div>
                </div>

                {/* 12. OBSERVACIONES FINALES */}
                <div>
                  <h4 className="font-bold text-[11px] text-slate-500 uppercase mb-1">12. Observaciones Generales Finales</h4>
                  <p className="text-xs text-slate-750 italic leading-relaxed">
                    {valuation.observaciones_finales || "Ficha didáctica y evidencia pedagógica completada conforme a la normativa de evaluación formativa de FP canaria."}
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl text-xs flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold uppercase tracking-wide text-[10px] mb-1">MEMORIA DE VALORACIÓN DIDÁCTICA PENDIENTE</p>
                  <p className="leading-relaxed">
                    El informe técnico se encuentra pre-elaborado, pero los datos referentes al Desarrollo, Valoración Docente y Evidencias (puntos 7 a 12) aparecerán impresos una vez que el profesor acceda a su Panel de Profesor y complete la correspondiente <strong>Ficha de valoración posterior</strong>.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Closing layout & signatures */}
        <div className="mt-16 pt-10 border-t border-slate-100 grid grid-cols-2 gap-8 text-center text-[10px]">
          <div>
            <p className="font-bold text-slate-400 uppercase tracking-widest text-[8px] mb-8">Firma del Coordinador del Aula</p>
            <div className="w-28 mx-auto h-0.5 bg-slate-300 mb-1" />
            <p className="font-bold text-slate-700">{config.email_coordinador || "Firma Autorizada"}</p>
            <p className="text-slate-400 mt-0.5">D./Dña. María González (Coordinadora)</p>
          </div>
          <div>
            <p className="font-bold text-slate-400 uppercase tracking-widest text-[8px] mb-8">Firma del Profesor/a Responsable</p>
            <div className="w-28 mx-auto h-0.5 bg-slate-300 mb-1" />
            <p className="font-bold text-slate-700">{booking.profesor}</p>
            <p className="text-slate-400 mt-0.5">D./Dña. {booking.profesor}</p>
          </div>
        </div>

        <div className="mt-12 text-center text-[9px] text-slate-400 font-bold border-t border-slate-105 pt-3 select-none">
          Documento descriptivo elaborado y persistido mediante Gestor Web ATECA. 
          Generado del estado oficial actual en {new Date().toLocaleDateString('es-ES')}.
        </div>

      </div>
    </div>
  );
}
