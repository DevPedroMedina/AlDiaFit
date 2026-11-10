import React from 'react';
import { Trash2, Loader2, AlertTriangle } from 'lucide-react';

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message, loading }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-ig-surface border border-ig-border w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-200">
        
        {/* Icono con glow sutil carmesí */}
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-3 text-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.15)]">
            <Trash2 className="w-6 h-6 stroke-[2]" />
          </div>

          <h3 className="text-base font-bold text-white tracking-tight">
            {title || '¿Eliminar socio?'}
          </h3>

          <p className="text-xs text-ig-secondary mt-1.5 leading-relaxed px-2">
            {message}
          </p>
        </div>

        {/* Acciones */}
        <div className="flex gap-2.5 mt-6">
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="flex-1 py-2.5 bg-ig-black hover:bg-neutral-900 border border-ig-border text-ig-secondary hover:text-white font-medium rounded-xl text-xs transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-[0_4px_16px_rgba(225,29,72,0.3)] transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sí, eliminar'}
          </button>
        </div>
      </div>
    </div>
  );
}