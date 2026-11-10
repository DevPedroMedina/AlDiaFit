import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const DAYS_HEADER = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];

export default function DatePicker({ value, onChange, label }) {
  const [isOpen, setIsOpen] = useState(false);

  // Parsear fecha inicial (YYYY-MM-DD)
  const initialDate = value ? new Date(value + 'T00:00:00') : new Date();
  const [currentMonth, setCurrentMonth] = useState(initialDate.getMonth());
  const [currentYear, setCurrentYear] = useState(initialDate.getFullYear());

  const containerRef = useRef(null);

  // Días del mes actual
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  
  // Día de la semana en que inicia el mes (0=Dom, 1=Lun...)
  let startDayIndex = new Date(currentYear, currentMonth, 1).getDay();
  // Ajuste para iniciar la semana en Lunes (0=Lu, 6=Do)
  startDayIndex = startDayIndex === 0 ? 6 : startDayIndex - 1;

  const handlePrevMonth = (e) => {
    e.stopPropagation();
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = (e) => {
    e.stopPropagation();
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleSelectDay = (day) => {
    const formattedMonth = String(currentMonth + 1).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    onChange(`${currentYear}-${formattedMonth}-${formattedDay}`);
    setIsOpen(false);
  };

  // Formato legible para mostrar en el botón (Ej. 10 nov 2026)
  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return 'Seleccionar fecha';
    const [y, m, d] = dateStr.split('-');
    const monthShort = MONTH_NAMES[parseInt(m, 10) - 1].slice(0, 3).toLowerCase();
    return `${parseInt(d, 10)} ${monthShort} ${y}`;
  };

  return (
    <div className="relative" ref={containerRef}>
      {label && <label className="block text-xs font-medium text-ig-secondary mb-1">{label}</label>}
      
      {/* Botón que simula el input */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center justify-between px-3 py-2 bg-ig-black border border-ig-border rounded-xl text-white text-xs hover:border-neutral-600 transition-colors"
      >
        <span>{formatDisplayDate(value)}</span>
        <CalendarIcon className="w-4 h-4 text-ig-muted" />
      </button>

      {/* Modal / Popover del Calendario */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-[310px] bg-ig-surface border border-ig-border rounded-2xl p-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            {/* Header del Calendario: Mes y Año */}
            <div className="flex items-center justify-between mb-3">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg hover:bg-neutral-800 text-ig-secondary hover:text-white transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="text-xs font-bold text-white tracking-wide">
                {MONTH_NAMES[currentMonth]} {currentYear}
              </span>

              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg hover:bg-neutral-800 text-ig-secondary hover:text-white transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Días de la semana */}
            <div className="grid grid-cols-7 gap-1 text-center mb-1">
              {DAYS_HEADER.map((d) => (
                <span key={d} className="text-[10px] font-semibold text-ig-muted py-1">
                  {d}
                </span>
              ))}
            </div>

            {/* Matriz de días */}
            <div className="grid grid-cols-7 gap-1 text-center">
              {/* Espacios vacíos antes del día 1 */}
              {Array.from({ length: startDayIndex }).map((_, i) => (
                <div key={`empty-${i}`} className="w-8 h-8" />
              ))}

              {/* Días del mes */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const formattedMonth = String(currentMonth + 1).padStart(2, '0');
                const formattedDay = String(day).padStart(2, '0');
                const thisDateStr = `${currentYear}-${formattedMonth}-${formattedDay}`;
                const isSelected = value === thisDateStr;

                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleSelectDay(day)}
                    className={`w-8 h-8 rounded-lg text-xs font-medium flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-ig-gradient text-white font-bold shadow-[0_2px_10px_rgba(225,48,108,0.4)]'
                        : 'text-zinc-200 hover:bg-neutral-800'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            {/* Acciones inferiores */}
            <div className="flex items-center justify-between border-t border-ig-border mt-3 pt-3">
              <button
                type="button"
                onClick={() => {
                  const today = new Date();
                  const y = today.getFullYear();
                  const m = String(today.getMonth() + 1).padStart(2, '0');
                  const d = String(today.getDate()).padStart(2, '0');
                  onChange(`${y}-${m}-${d}`);
                  setIsOpen(false);
                }}
                className="text-[11px] font-semibold text-emerald-400 hover:underline"
              >
                Hoy
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-[11px] font-medium text-ig-muted hover:text-white"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}