import React, { useState, useEffect } from 'react';
import { getTodayDate, addDays } from '../lib/utils';
import DatePicker from './DatePicker';
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

  const handlePhoneChange = (e) => {
    const numeric = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhone(numeric);
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

    if (memberToEdit?.id) {
      payload.id = memberToEdit.id;
    }

    await onSave(payload);
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-ig-surface border border-ig-border w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-200">
        
        {/* Encabezado */}
        <div className="flex items-center justify-between pb-4 border-b border-ig-border">
          <h2 className="text-base font-bold text-white tracking-tight">
            {memberToEdit ? 'Editar Socio' : 'Nuevo Socio'}
          </h2>
          <button 
            type="button" 
            onClick={onClose} 
            className="text-ig-muted hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Selector de Sucursal */}
          <div>
            <label className="block text-xs font-medium text-ig-secondary mb-1.5">Sucursal Asignada *</label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-ig-muted absolute left-3 top-2.5 pointer-events-none" />
              <select
                value={selectedGym}
                onChange={(e) => setSelectedGym(e.target.value)}
                required
                className="w-full pl-9 pr-3 py-2 bg-ig-black border border-ig-border rounded-xl text-white text-xs focus:border-neutral-500 focus:outline-none"
              >
                {gyms.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Nombre completo */}
          <div>
            <label className="block text-xs font-medium text-ig-secondary mb-1.5">Nombre Completo *</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-2 bg-ig-black border border-ig-border rounded-xl text-white text-xs placeholder-ig-muted focus:border-neutral-500 focus:outline-none"
              placeholder="Ej. Roberto Morales"
            />
          </div>

          {/* Teléfono (WhatsApp) */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-medium text-ig-secondary">Teléfono (WhatsApp)</label>
              <span className="text-[10px] text-ig-muted">{phone.length}/10 dígitos</span>
            </div>
            <input
              type="tel"
              inputMode="numeric"
              value={phone}
              onChange={handlePhoneChange}
              className="w-full px-3 py-2 bg-ig-black border border-ig-border rounded-xl text-white text-xs placeholder-ig-muted focus:border-neutral-500 focus:outline-none"
              placeholder="Ej. 6671234567"
            />
          </div>

          {/* Calendarios personalizados en español */}
          <div className="grid grid-cols-2 gap-3">
            <DatePicker
              label="Fecha de Inicio"
              value={startDate}
              onChange={setStartDate}
            />
            <DatePicker
              label="Fecha Vencimiento"
              value={dueDate}
              onChange={setDueDate}
            />
          </div>

          {/* Botones de acción */}
          <div className="flex gap-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-ig-black hover:bg-neutral-900 border border-ig-border text-ig-secondary hover:text-white font-medium rounded-xl text-xs transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 bg-ig-gradient hover:opacity-95 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(225,48,108,0.3)] transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Guardar Socio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}