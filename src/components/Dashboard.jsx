import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { getStatus, addDays } from '../lib/utils';
import MemberModal from './MemberModal';
import ConfirmModal from './ConfirmModal';
import {
  Building2, Plus, Search, CalendarPlus, Edit2,
  Trash2, Phone, LogOut, CheckCircle2, Clock, AlertTriangle, Users
} from 'lucide-react';

export default function Dashboard() {
  const [gyms, setGyms] = useState([]);
  const [selectedGymId, setSelectedGymId] = useState('');
  const [members, setMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [memberToEdit, setMemberToEdit] = useState(null);
  const [memberToDelete, setMemberToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [loading, setLoading] = useState(true);

  // 1. Cargar sucursales registradas en Supabase
  useEffect(() => {
    async function loadGyms() {
      const { data, error } = await supabase.from('gyms').select('*').order('name');
      if (data && data.length > 0) {
        setGyms(data);
        setSelectedGymId(data[0].id);
      }
    }
    loadGyms();
  }, []);

  // 2. Cargar socios cuando cambie la sucursal activa
  useEffect(() => {
    if (!selectedGymId) return;
    loadMembers();
  }, [selectedGymId]);

  const loadMembers = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('members')
      .select('*')
      .eq('gym_id', selectedGymId)
      .order('due_date', { ascending: true });
    setMembers(data || []);
    setLoading(false);
  };

  // 3. Conteo en tiempo real de los 3 estados operativos
  const counts = useMemo(() => {
    const res = { active: 0, warning: 0, expired: 0 };
    members.forEach((m) => {
      const { type } = getStatus(m.due_date);
      res[type]++;
    });
    return res;
  }, [members]);

  // 4. Filtrado reactivo por buscador de texto y pestaña de estado
  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const matchesSearch = m.full_name.toLowerCase().includes(searchQuery.toLowerCase());
      const { type } = getStatus(m.due_date);
      const matchesStatus = statusFilter === 'all' || type === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [members, searchQuery, statusFilter]);

  // Acción rápida: sumar 30 días al vencimiento
  const handleQuickRenew = async (member) => {
    const newDueDate = addDays(member.due_date, 30);
    const { error } = await supabase
      .from('members')
      .update({ due_date: newDueDate })
      .eq('id', member.id);

    if (!error) {
      setMembers((prev) =>
        prev.map((m) => (m.id === member.id ? { ...m, due_date: newDueDate } : m))
      );
    } else {
      alert('Error al renovar: ' + error.message);
    }
  };

  // Confirmar eliminación del socio
  const handleConfirmDelete = async () => {
    if (!memberToDelete) return;
    setDeleting(true);

    const { error } = await supabase
      .from('members')
      .delete()
      .eq('id', memberToDelete.id);

    if (error) {
      alert('Error al eliminar: ' + error.message);
    } else {
      setMembers((prev) => prev.filter((m) => m.id !== memberToDelete.id));
      setMemberToDelete(null);
    }
    setDeleting(false);
  };

  // Guardar (crear nuevo o editar existente)
  const handleSaveMember = async (memberData) => {
    if (memberData.id) {
      const { id, ...updates } = memberData;
      const { error } = await supabase
        .from('members')
        .update(updates)
        .eq('id', id);

      if (error) alert('Error al actualizar: ' + error.message);
      else loadMembers();
    } else {
      const { error } = await supabase
        .from('members')
        .insert([memberData]);

      if (error) alert('Error al registrar: ' + error.message);
      else loadMembers();
    }
  };

  return (
    <div className="min-h-screen bg-ig-black text-white flex flex-col antialiased selection:bg-pink-500/30">
      {/* Top Header Minimalista */}
      <header className="sticky top-0 z-30 bg-ig-black/90 backdrop-blur-md border-b border-ig-border px-4 py-3">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-orange-400 via-rose-500 to-fuchsia-500 bg-clip-text text-transparent">
              AlDiaFit
            </span>
          </div>

          {/* Selector de Sucursal en cápsula estilo Instagram */}
          <div className="relative flex items-center">
            <Building2 className="w-3.5 h-3.5 text-ig-secondary absolute left-2.5 pointer-events-none" />
            <select
              value={selectedGymId}
              onChange={(e) => setSelectedGymId(e.target.value)}
              className="bg-ig-surface border border-ig-border text-xs font-medium rounded-full pl-7 pr-3 py-1.5 text-white focus:outline-none focus:border-neutral-500 cursor-pointer"
            >
              {gyms.map((g) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* Contenedor Principal */}
      <main className="max-w-md mx-auto px-4 py-3 w-full space-y-4 pb-28">
        {/* Tarjetas de Métricas KPI */}
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setStatusFilter(statusFilter === 'active' ? 'all' : 'active')}
            className={`p-2.5 rounded-2xl border text-center transition-all ${
              statusFilter === 'active'
                ? 'bg-emerald-950/40 border-emerald-500/80 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                : 'bg-ig-surface border-ig-border hover:border-neutral-700'
            }`}
          >
            <div className="flex justify-center mb-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-xl font-bold leading-none">{counts.active}</p>
            <span className="text-[10px] text-ig-secondary font-medium tracking-tight">Al día</span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter(statusFilter === 'warning' ? 'all' : 'warning')}
            className={`p-2.5 rounded-2xl border text-center transition-all ${
              statusFilter === 'warning'
                ? 'bg-amber-950/40 border-amber-500/80 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                : 'bg-ig-surface border-ig-border hover:border-neutral-700'
            }`}
          >
            <div className="flex justify-center mb-1">
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-xl font-bold leading-none">{counts.warning}</p>
            <span className="text-[10px] text-ig-secondary font-medium tracking-tight">Por vencer</span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter(statusFilter === 'expired' ? 'all' : 'expired')}
            className={`p-2.5 rounded-2xl border text-center transition-all ${
              statusFilter === 'expired'
                ? 'bg-rose-950/40 border-rose-500/80 shadow-[0_0_15px_rgba(244,63,94,0.15)]'
                : 'bg-ig-surface border-ig-border hover:border-neutral-700'
            }`}
          >
            <div className="flex justify-center mb-1">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            </div>
            <p className="text-xl font-bold leading-none">{counts.expired}</p>
            <span className="text-[10px] text-ig-secondary font-medium tracking-tight">Vencidos</span>
          </button>
        </div>

        {/* Buscador de Socios */}
        <div className="relative">
          <Search className="w-4 h-4 text-ig-muted absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Buscar por nombre..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-ig-surface border border-ig-border rounded-xl text-xs text-white placeholder-ig-muted focus:outline-none focus:border-neutral-500 transition-colors"
          />
        </div>

        {/* Filtros Rápidos en Pastillas */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          {[
            { id: 'all', label: 'Todos' },
            { id: 'active', label: 'Al corriente' },
            { id: 'warning', label: 'Por vencer' },
            { id: 'expired', label: 'Vencidos' }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                statusFilter === tab.id
                  ? 'bg-white text-black'
                  : 'bg-ig-surface text-ig-secondary border border-ig-border hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Listado de Socios */}
        {loading ? (
          <div className="text-center py-12 text-xs text-ig-muted">Cargando socios...</div>
        ) : filteredMembers.length === 0 ? (
          <div className="text-center py-12 bg-ig-surface/40 rounded-2xl border border-ig-border text-xs text-ig-muted">
            No se encontraron socios en esta sucursal.
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredMembers.map((member) => {
              const status = getStatus(member.due_date);
              return (
                <div
                  key={member.id}
                  className="bg-ig-surface border border-ig-border rounded-2xl p-3.5 transition-all hover:border-neutral-700"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm truncate text-white">
                          {member.full_name}
                        </span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${status.badgeClass}`}>
                          {status.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 mt-1.5 text-xs text-ig-secondary">
                        {member.phone && (
                          <a
                            href={`https://wa.me/${member.phone.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1 text-emerald-400 hover:underline"
                          >
                            <Phone className="w-3 h-3" />
                            <span>{member.phone}</span>
                          </a>
                        )}
                        <span>
                          Vence: <strong className="text-white font-medium">{member.due_date}</strong>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => { setMemberToEdit(member); setModalOpen(true); }}
                        className="p-1.5 text-ig-secondary hover:text-white rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setMemberToDelete(member)}
                        className="p-1.5 text-ig-muted hover:text-rose-400 rounded-lg transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Botón ergonómico para renovar +30 días */}
                  <button
                    type="button"
                    onClick={() => handleQuickRenew(member)}
                    className="mt-3 w-full py-1.5 rounded-xl bg-ig-elevated hover:bg-neutral-800 border border-ig-border text-xs font-semibold text-emerald-400 flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
                  >
                    <CalendarPlus className="w-3.5 h-3.5" />
                    <span>Renovar (+1 Mes)</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Dock Flotante Inferior */}
      <nav className="fixed bottom-4 inset-x-4 max-w-sm mx-auto z-40 bg-ig-surface/90 backdrop-blur-xl border border-ig-border rounded-full px-6 py-2.5 shadow-2xl flex items-center justify-between">
        <button
          type="button"
          onClick={() => { setStatusFilter('all'); setSearchQuery(''); }}
          className={`flex flex-col items-center gap-0.5 transition-colors ${
            statusFilter === 'all' && !searchQuery ? 'text-white' : 'text-ig-muted hover:text-white'
          }`}
        >
          <Users className="w-5 h-5" />
          <span className="text-[9px] font-medium">Socios</span>
        </button>

        {/* Botón Central Destacado con Gradiente */}
        <button
          type="button"
          onClick={() => { setMemberToEdit(null); setModalOpen(true); }}
          className="relative -top-2.5 p-3 rounded-full bg-ig-gradient shadow-[0_4px_20px_rgba(225,48,108,0.4)] hover:scale-105 active:scale-95 transition-all text-white flex items-center justify-center"
          title="Nuevo Socio"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
        </button>

        <button
          type="button"
          onClick={() => supabase.auth.signOut()}
          className="flex flex-col items-center gap-0.5 text-ig-muted hover:text-rose-400 transition-colors"
          title="Salir"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-[9px] font-medium">Salir</span>
        </button>
      </nav>

      {/* Modal para Crear y Editar Socio */}
      <MemberModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveMember}
        memberToEdit={memberToEdit}
        gymId={selectedGymId}
        gyms={gyms}
      />

      {/* Modal Minimalista de Confirmación de Eliminación */}
      <ConfirmModal
        isOpen={Boolean(memberToDelete)}
        onClose={() => setMemberToDelete(null)}
        onConfirm={handleConfirmDelete}
        loading={deleting}
        title="¿Eliminar socio?"
        message={
          <>
            ¿Estás seguro de que deseas eliminar a{' '}
            <strong className="text-white font-semibold">
              {memberToDelete?.full_name}
            </strong>
            ? Se borrará permanentemente de esta sucursal.
          </>
        }
      />
    </div>
  );
}