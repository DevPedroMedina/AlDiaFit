import React, { useState, useEffect } from 'react';
import { getTodayDate, addDays } from '../lib/utils';
import { X, Loader2, Building2 } from 'lucide-react';

export default function MemberModal({ isOpen, onClose, onSave, memberToEdit, gymId, gyms = [] }) {
  const [selectedGym, setSelectedGym] = useState(gymId);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [startDate, setStartDate] = useState(getTodayDate());
  const [dueDate, setDueDate] = useState(addDays(getTodayDate(), 30));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (memberToEdit) {
      setSelectedGym(memberToEdit.gym_id || gymId);
      setFullName(memberToEdit.full_name || '');
      setPhone(memberToEdit.phone || '');
      setStartDate(memberToEdit.start_date || getTodayDate());
      setDueDate(memberToEdit.due_date || addDays(getTodayDate(), 30));
    } else {
      setSelectedGym(gymId);
      setFullName('');
      setPhone('');
      setStartDate(getTodayDate());
      setDueDate(addDays(getTodayDate(), 30));
    }
  }, [memberToEdit, gymId, isOpen]);

  if (!isOpen) return null;

  // Validación: solo números y máximo 10 caracteres
  const handlePhoneChange = (e) => {
    const numericValue = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhone(numericValue);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      gym_id: selectedGym,
      full_name: fullName.trim(),
      phone: phone.trim() || null,
      start_date: startDate,
      due_date: dueDate
    };

    // Si es edición incluimos el id; si es nuevo NO se incluye para evitar el error 400
    if (memberToEdit?.id) {
      payload.id = memberToEdit.id;
    }

    await onSave(payload);
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-zinc-900 border border-zinc-800 w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <h2 className="text-base font-semibold text-zinc-100">
            {memberToEdit ? 'Editar Socio' : 'Nuevo Socio'}
          </h2>
          <button 
            type="button" 
            onClick={onClose} 
            className="text-zinc-400 hover:text-zinc-100 p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Selector de Sucursal explícito */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">Sucursal Asignada *</label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5 pointer-events-none" />
              <select
                value={selectedGym}
                onChange={(e) => setSelectedGym(e.target.value)}
                required
                className="w-full pl-9 pr-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 text-sm focus:border-emerald-500 focus:outline-none"
              >
                {gyms.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">Nombre Completo *</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 text-sm focus:border-emerald-500 focus:outline-none"
              placeholder="Ej. Juan Pérez"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-medium text-zinc-300">Teléfono (WhatsApp)</label>
              <span className="text-[10px] text-zinc-500">{phone.length}/10 dígitos</span>
            </div>
            <input
              type="tel"
              inputMode="numeric"
              value={phone}
              onChange={handlePhoneChange}
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 text-sm focus:border-emerald-500 focus:outline-none"
              placeholder="Ej. 6671234567"
            />
          </div>

          {/* Fechas con disparador directo del calendario al clic */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Fecha de Inicio</label>
              <input
                type="date"
                required
                value={startDate}
                style={{ colorScheme: 'dark' }}
                onClick={(e) => e.currentTarget.showPicker && e.currentTarget.showPicker()}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 text-xs focus:border-emerald-500 focus:outline-none cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Vencimiento</label>
              <input
                type="date"
                required
                value={dueDate}
                style={{ colorScheme: 'dark' }}
                onClick={(e) => e.currentTarget.showPicker && e.currentTarget.showPicker()}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 text-xs focus:border-emerald-500 focus:outline-none cursor-pointer"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium rounded-lg text-sm transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-semibold rounded-lg text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}