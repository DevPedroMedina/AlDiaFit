import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  CalendarPlus, 
  Phone, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ChevronRight, 
  ChevronLeft, 
  X,
  Sparkles,
  Users,
  Store,
  ArrowRight
} from 'lucide-react';

const SLIDES = [
  {
    tag: 'Control Multisucursal',
    title: 'Alterna sedes y consulta el balance general',
    description: 'Cambia entre Sucursales desde el selector superior, o abre la pestaña "Sedes" para revisar el total de socios y cumplimiento de pagos.',
    renderPreview: () => (
      <div className="w-full bg-ig-black border border-ig-border rounded-2xl p-3.5 shadow-inner space-y-3">
        {/* Cabecera con selector real */}
        <div className="flex items-center justify-between border-b border-ig-border pb-2.5">
          <span className="text-xs font-bold bg-gradient-to-r from-orange-400 via-rose-500 to-fuchsia-500 bg-clip-text text-transparent">
            AlDiaFit
          </span>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-ig-surface border border-neutral-700 text-xs font-medium text-white">
            <Building2 className="w-3 h-3 text-ig-secondary" />
            <span>Sucursal</span>
          </div>
        </div>

        {/* Acceso a Sedes en la barra */}
        <div className="bg-ig-surface border border-ig-border rounded-xl p-2.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-ig-black border border-ig-border rounded-lg text-rose-400">
              <Store className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="font-semibold text-white text-[11px]">Pestaña Sedes</p>
              <p className="text-[10px] text-ig-secondary">Balance general de ambas sucursales</p>
            </div>
          </div>
          <span className="text-[10px] text-rose-400 font-semibold bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
            Global
          </span>
        </div>
      </div>
    )
  },
  {
    tag: 'Semáforo de Estados',
    title: 'Contadores y filtros al mismo tiempo',
    description: '4 tarjetas arriba que indican cuántos socios tienes y en qué estado están. Al pulsar cualquiera de ellas, filtras la lista de inmediato.',
    renderPreview: () => (
      <div className="w-full bg-ig-black border border-ig-border rounded-2xl p-3 space-y-2">
        <div className="grid grid-cols-4 gap-1 text-center">
          <div className="p-1.5 rounded-xl bg-white/10 border border-white text-white">
            <Users className="w-3 h-3 mx-auto mb-0.5" />
            <p className="text-xs font-bold">12</p>
            <span className="text-[8px] text-zinc-300">Todos</span>
          </div>
          <div className="p-1.5 rounded-xl bg-emerald-950/40 border border-emerald-500/70 text-emerald-400">
            <CheckCircle2 className="w-3 h-3 mx-auto mb-0.5" />
            <p className="text-xs font-bold text-white">9</p>
            <span className="text-[8px]">Al día</span>
          </div>
          <div className="p-1.5 rounded-xl bg-amber-950/40 border border-amber-500/70 text-amber-400">
            <Clock className="w-3 h-3 mx-auto mb-0.5" />
            <p className="text-xs font-bold text-white">2</p>
            <span className="text-[8px]">Por vencer</span>
          </div>
          <div className="p-1.5 rounded-xl bg-rose-950/40 border border-rose-500/70 text-rose-400">
            <AlertTriangle className="w-3 h-3 mx-auto mb-0.5" />
            <p className="text-xs font-bold text-white">1</p>
            <span className="text-[8px]">Vencidos</span>
          </div>
        </div>
        <p className="text-[10px] text-ig-muted text-center pt-1">
          Verde: &gt; 3 días · Amarillo: ≤ 3 días · Rojo: vencido
        </p>
      </div>
    )
  },
  {
    tag: 'Operación Diaria',
    title: 'Renovación en 1 toque y enlace directo a WhatsApp',
    description: 'Extiende 30 días la membresía con el botón "+1 Mes". Si necesitas contactar al socio, pulsa su teléfono para abrir un chat directo en WhatsApp.',
    renderPreview: () => (
      <div className="w-full bg-ig-black border border-ig-border rounded-2xl p-3 space-y-2.5">
        <div className="bg-ig-surface border border-ig-border rounded-xl p-3">
          <div className="flex justify-between items-center mb-1">
            <span className="font-semibold text-white text-xs">Carlos Mendoza</span>
            <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
              Al corriente
            </span>
          </div>
          
          <div className="flex items-center justify-between text-[11px] text-ig-secondary mt-1 mb-2">
            <div className="flex items-center gap-1 text-emerald-400">
              <Phone className="w-3 h-3" />
              <span>6671234567</span>
            </div>
            <span>Vence: <strong className="text-white">10 nov 2026</strong></span>
          </div>

          <button 
            type="button"
            className="w-full py-1.5 rounded-lg bg-ig-elevated border border-ig-border text-emerald-400 text-xs font-semibold flex items-center justify-center gap-1.5"
          >
            <CalendarPlus className="w-3.5 h-3.5" />
            <span>Renovar (+1 Mes)</span>
          </button>
        </div>
      </div>
    )
  }
];

export default function OnboardingModal({ isOpen, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Reinicia siempre a la primera diapositiva cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentSlide = SLIDES[currentIndex];
  const isLast = currentIndex === SLIDES.length - 1;

  const handleNext = () => {
    if (isLast) {
      onClose();
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-ig-surface border border-ig-border w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-200 flex flex-col justify-between max-h-[90vh]">
        
        {/* Barras de progreso superiores tipo Stories */}
        <div>
          <div className="flex items-center justify-between gap-1.5 mb-4">
            <div className="flex-1 flex gap-1">
              {SLIDES.map((_, i) => (
                <div
                  key={i}
                  className="h-1 flex-1 rounded-full overflow-hidden bg-white/10"
                >
                  <div
                    className={`h-full transition-all duration-300 ${
                      i <= currentIndex ? 'bg-gradient-to-r from-orange-400 to-rose-500' : 'w-0'
                    }`}
                    style={{ width: i <= currentIndex ? '100%' : '0%' }}
                  />
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="text-ig-muted hover:text-white p-1 rounded-full ml-2 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Etiqueta de sección */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-semibold tracking-wide uppercase mb-3">
            <Sparkles className="w-3 h-3" />
            <span>{currentSlide.tag}</span>
          </div>

          {/* Maqueta representativa de la App */}
          <div className="my-2">
            {currentSlide.renderPreview()}
          </div>

          {/* Título y descripción */}
          <div className="mt-4 space-y-1">
            <h3 className="text-base font-bold text-white tracking-tight leading-snug">
              {currentSlide.title}
            </h3>
            <p className="text-xs text-ig-secondary leading-relaxed">
              {currentSlide.description}
            </p>
          </div>
        </div>

        {/* Botones de navegación inferior */}
        <div className="flex items-center justify-between gap-3 pt-5 border-t border-ig-border mt-5">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className={`p-2 rounded-xl border border-ig-border text-ig-secondary transition-colors ${
              currentIndex === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-neutral-800 hover:text-white'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="flex-1 py-2.5 rounded-xl bg-ig-gradient hover:opacity-95 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-[0_4px_16px_rgba(225,48,108,0.35)] transition-all active:scale-[0.98]"
          >
            <span>{isLast ? 'Entendido / Iniciar Sesión' : 'Siguiente'}</span>
            {isLast ? <ArrowRight className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
}