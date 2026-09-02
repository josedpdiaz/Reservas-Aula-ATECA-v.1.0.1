/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Star, Check, AlertTriangle, Sparkles, ArrowLeft } from 'lucide-react';
import { Reserva, Valoracion } from '../types';
import { saveValoracion } from '../lib/storage';

interface ValuationFormProps {
  reserva: Reserva;
  existingValuation?: Valoracion;
  onSuccess: (msg: string) => void;
  onCancel: () => void;
}

export default function ValuationForm({ reserva, existingValuation, onSuccess, onCancel }: ValuationFormProps) {
  // Form fields
  const [realizadaComoPrevista, setRealizadaComoPrevista] = useState(existingValuation ? existingValuation.realizada_como_prevista : true);
  const [aspectosPositivos, setAspectosPositivos] = useState(existingValuation ? existingValuation.aspectos_positivos : '');
  const [dificultades, setDificultades] = useState(existingValuation ? existingValuation.dificultades : '');
  const [evidenciasGeneradas, setEvidenciasGeneradas] = useState(existingValuation ? existingValuation.evidencias_generadas : '');
  const [mejorasFuturas, setMejorasFuturas] = useState(existingValuation ? existingValuation.mejoras_futuras : '');
  const [valoracionGeneral, setValoracionGeneral] = useState(existingValuation ? existingValuation.valoracion_general : 5);
  const [actividadInnovacion, setActividadInnovacion] = useState(existingValuation ? existingValuation.actividad_innovacion : true);
  const [observacionesFinales, setObservacionesFinales] = useState(existingValuation ? existingValuation.observaciones_finales : '');

  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!aspectosPositivos.trim() || !evidenciasGeneradas.trim()) {
      setErrorMsg('Por favor, indica cuáles han sido los aspectos positivos de la clase y qué evidencias didácticas has generado.');
      return;
    }

    saveValoracion({
      id_reserva: reserva.id_reserva,
      realizada_como_prevista: realizadaComoPrevista,
      aspectos_positivos: aspectosPositivos,
      dificultades: dificultades,
      evidencias_generadas: evidenciasGeneradas,
      mejoras_futuras: mejorasFuturas,
      valoracion_general: valoracionGeneral,
      actividad_innovacion: actividadInnovacion,
      observaciones_finales: observacionesFinales,
    });

    onSuccess('¡Valoración didáctica registrada correctamente! El estado de la reserva ha cambiado a REALIZADA.');
  };

  return (
    <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden max-w-3xl mx-auto">
      {/* Banner */}
      <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white">
        <div className="flex items-center space-x-3">
          <Sparkles className="h-6 w-6 text-amber-400" />
          <div>
            <h2 className="text-xl font-bold">Valoración Posterior de la Actividad</h2>
            <p className="text-xs text-slate-300">Generación de Evidencias de Innovación Pedagógica</p>
          </div>
        </div>
        <button
          onClick={onCancel}
          id="btn_back_val"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 rounded-lg text-xs font-semibold cursor-pointer transition-all"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Volver
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Info of the activity */}
        <div className="bg-slate-50 border border-slate-100 rounded-lg p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <p className="text-slate-400 font-semibold uppercase tracking-wider mb-1">Docente y actividad</p>
            <p className="font-bold text-slate-700 text-sm">{reserva.profesor}</p>
            <p className="text-slate-500 mt-0.5">{reserva.modulo_materia_area} — {reserva.grupo} ({reserva.nivel})</p>
          </div>
          <div>
            <p className="text-slate-400 font-semibold uppercase tracking-wider mb-1">Zona ATECA Utilizada</p>
            <p className="font-bold text-slate-700 text-sm flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-800"></span>
              {reserva.zona_principal}
            </p>
            <p className="text-slate-500 mt-0.5">Fecha: {reserva.fecha_actividad} (Horario: {reserva.hora_inicio} - {reserva.hora_fin})</p>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3.5 bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg font-medium flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            {errorMsg}
          </div>
        )}

        {/* 1. ¿Realizada como prevista? */}
        <div className="space-y-3">
          <label className="block text-sm font-bold text-slate-700">1. ¿Se realizó la actividad tal y como estaba prevista? *</label>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setRealizadaComoPrevista(true)}
              className={`flex-1 py-2.5 px-4 rounded-lg text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-2 ${
                realizadaComoPrevista
                  ? 'bg-slate-800 text-white border-slate-800 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              Sí, se cumplieron todos los objetivos
            </button>
            <button
              type="button"
              onClick={() => setRealizadaComoPrevista(false)}
              className={`flex-1 py-2.5 px-4 rounded-lg text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-2 ${
                !realizadaComoPrevista
                  ? 'bg-slate-800 text-white border-slate-800 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              No, surgieron imprevistos / adaptaciones
            </button>
          </div>
        </div>

        {/* 2 & 3. Text areas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">2. Aspectos Positivos Destacados *</label>
            <textarea
              required
              rows={3}
              value={aspectosPositivos}
              onChange={(e) => setAspectosPositivos(e.target.value)}
              placeholder="¿Qué ha funcionado mejor? Motivación, asimilación de conceptos, dinámicas grupales..."
              className="w-full p-2.5 border border-slate-200 focus:border-slate-400 rounded-lg text-xs outline-none resize-none leading-relaxed"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">3. Dificultades / Retos Encontrados</label>
            <textarea
              rows={3}
              value={dificultades}
              onChange={(e) => setDificultades(e.target.value)}
              placeholder="¿Hubo problemas de tiempo, técnicos, de espacio o de organización con los alumnos?..."
              className="w-full p-2.5 border border-slate-200 focus:border-slate-400 rounded-lg text-xs outline-none resize-none leading-relaxed"
            />
          </div>
        </div>

        {/* 4 & 5. Evidences & Improvements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">4. Evidencias Generadas (Enlace carpeta, producciones) *</label>
            <textarea
              required
              rows={3}
              value={evidenciasGeneradas}
              onChange={(e) => setEvidenciasGeneradas(e.target.value)}
              placeholder="Especifica enlaces de Drive, blogs, podcast grabados, piezas 3D impresas o productos de innovación..."
              className="w-full p-2.5 border border-slate-200 focus:border-slate-400 rounded-lg text-xs outline-none resize-none leading-relaxed"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">5. Propuestas de Mejora para futuras sesiones</label>
            <textarea
              rows={3}
              value={mejorasFuturas}
              onChange={(e) => setMejorasFuturas(e.target.value)}
              placeholder="Consejos o cambios de cara al próximo uso del Aula ATECA con este u otros grupos..."
              className="w-full p-2.5 border border-slate-200 focus:border-slate-400 rounded-lg text-xs outline-none resize-none leading-relaxed"
            />
          </div>
        </div>

        {/* 6. Valoración y de innovación */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center pt-2 border-t border-slate-100">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-2">6. Valoración General del equipamiento ATECA *</label>
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setValoracionGeneral(star)}
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(null)}
                  className="p-1 hover:scale-110 active:scale-90 transition-all cursor-pointer"
                >
                  <Star
                    className={`h-7 w-7 ${
                      (hoveredStar !== null ? star <= hoveredStar : star <= valoracionGeneral)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-350 fill-transparent'
                    }`}
                  />
                </button>
              ))}
              <span className="text-xs font-semibold text-slate-500 ml-2">
                ({valoracionGeneral} de 5 estrellas)
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-2">7. Grado de Innovación Pedagógica del Centro</label>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="act_innovacion_inp"
                checked={actividadInnovacion}
                onChange={(e) => setActividadInnovacion(e.target.checked)}
                className="h-4 w-4 rounded-sm text-slate-800 border-slate-300 focus:ring-slate-400 cursor-pointer"
              />
              <label htmlFor="act_innovacion_inp" className="text-xs font-medium text-slate-700 cursor-pointer select-none">
                ¿Consideras esta actividad como Innovación Pedagógica?
              </label>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Conlleva metodologías activas, aprendizaje basado en retos o tecnologías disruptivas.</p>
          </div>
        </div>

        {/* Observaciones finales */}
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5">8. Observaciones / Comentarios Finales (Opcional)</label>
          <textarea
            rows={2}
            value={observacionesFinales}
            onChange={(e) => setObservacionesFinales(e.target.value)}
            placeholder="Comentarios adicionales que quieras registrar para la memoria del Aula ATECA..."
            className="w-full p-2.5 border border-slate-200 focus:border-slate-400 rounded-lg text-xs outline-none resize-none leading-relaxed"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end items-center gap-3 border-t border-slate-100 pt-5">
          <button
            type="button"
            onClick={onCancel}
            id="btn_cancel_valuation"
            className="px-4 py-2 hover:bg-slate-100 active:bg-slate-200 text-slate-600 rounded-lg text-xs font-semibold transition-all cursor-pointer"
          >
            Atrás
          </button>
          <button
            type="submit"
            id="btn_submit_valuation"
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 active:bg-slate-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
          >
            <Check className="h-4 w-4" /> Guardar valoración didáctica
          </button>
        </div>
      </form>
    </div>
  );
}
