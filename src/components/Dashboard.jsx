import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { getStatus, addDays } from '../lib/utils';
import MemberModal from './MemberModal';
import ConfirmModal from './ConfirmModal';
import GymsOverview from './GymsOverview';
import {
  Building2, Plus, Search, CalendarPlus, Edit2,
  Trash2, Phone, LogOut, CheckCircle2, Clock, AlertTriangle, Users, Store
} from 'lucide-react';

export default function Dashboard() {
  const [gyms, setGyms] = useState([]);
  const [selectedGymId, setSelectedGymId] = useState('');
  const [activeTab, setActiveTab] = useState('members'); // 'members' | 'overview'
  const [members, setMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [memberToEdit, setMemberToEdit] = useState(null);
  const [memberToDelete, setMemberToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [loading, setLoading] = useState(true);

  // Cargar sucursales iniciales
  useEffect(() => {
    async function loadGyms() {
      const { data } = await supabase.from('gyms').select('*').order('name');
      if (data && data.length > 0) {
        setGyms(data);
        setSelectedGymId(data[0].id);
      }
    }
    loadGyms();
  }, []);

  // Cargar socios de la sucursal activa
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

  // Conteo de métricas de la sucursal seleccionada
  const counts = useMemo(() => {
    const res = { all: members.length, active: 0, warning: 0, expired: 0 };
    members.forEach((m) => {
      const { type } = getStatus(m.due_date);
      res[type]++;
    });
    return res;
  }, [members]);

  // Filtrado por buscador y estado
  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const matchesSearch = m.full_name.toLowerCase().includes(searchQuery.toLowerCase());
      const { type } = getStatus(m.due_date);
      const matchesStatus = statusFilter === 'all' || type === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [members, searchQuery, statusFilter]);

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

  const handleSaveMember = async (memberData) => {
    if (memberData.id) {
      const { id, ...updates } = memberData;
      const { error } = await supabase.from('members').update(updates).eq('id', id);
      if (error) alert('Error: ' + error.message);
      else loadMembers();
    } else {
      const { error } = await supabase.from('members').insert([memberData]);
      if (error) alert('Error: ' + error.message);
      else loadMembers();
    }
  };

  const toggleFilter = (filterKey) => {
    setStatusFilter((prev) => (prev === filterKey ? 'all' : filterKey));
  };

  return (
    <div className="min-h-screen bg-ig-black text-white flex flex-col antialiased selection:bg-pink-500/30">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-ig-black/90 backdrop-blur-md border-b border-ig-border px-4 py-3">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-orange-400 via-rose-500 to-fuchsia-500 bg-clip-text text-transparent">
            AlDiaFit
          </span>

          <div className="flex items-center gap-2">
            {activeTab !== 'overview' && (
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
            )}

            <button
              type="button"
              onClick={() => supabase.auth.signOut()}
              className="p-1.5 rounded-full bg-ig-surface border border-ig-border text-ig-muted hover:text-rose-400 hover:border-neutral-700 transition-colors"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Contenedor Principal */}
      <main className="max-w-md mx-auto px-3.5 py-3.5 w-full space-y-3.5 pb-28">
        {/* Vista 1: Balance General de Sedes */}
        {activeTab === 'overview' ? (
          <GymsOverview
            gyms={gyms}
            onSelectGym={(gymId) => {
              setSelectedGymId(gymId);
              setActiveTab('members');
              setStatusFilter('all');
            }}
          />
        ) : (
          /* Vista 2: Gestión de Socios */
          <>
            {/* 4 Tarjetas de Métricas y Filtros Rápidos */}
            <div className="grid grid-cols-4 gap-1.5">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`p-2 rounded-2xl border text-center transition-all ${
                  statusFilter === 'all'
                    ? 'bg-white/10 border-white text-white'
                    : 'bg-ig-surface border-ig-border text-ig-secondary hover:border-neutral-700'
                }`}
              >
                <div className="flex justify-center mb-1">
                  <Users className="w-3.5 h-3.5" />
                </div>
                <p className="text-lg font-bold leading-none text-white">{counts.all}</p>
                <span className="text-[9px] font-medium tracking-tight mt-1 block">Todos</span>
              </button>

              <button
                type="button"
                onClick={() => toggleFilter('active')}
                className={`p-2 rounded-2xl border text-center transition-all ${
                  statusFilter === 'active'
                    ? 'bg-emerald-950/50 border-emerald-500 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                    : 'bg-ig-surface border-ig-border text-ig-secondary hover:border-neutral-700'
                }`}
              >
                <div className="flex justify-center mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <p className="text-lg font-bold leading-none text-white">{counts.active}</p>
                <span className="text-[9px] font-medium tracking-tight mt-1 block">Al día</span>
              </button>

              <button
                type="button"
                onClick={() => toggleFilter('warning')}
                className={`p-2 rounded-2xl border text-center transition-all ${
                  statusFilter === 'warning'
                    ? 'bg-amber-950/50 border-amber-500 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                    : 'bg-ig-surface border-ig-border text-ig-secondary hover:border-neutral-700'
                }`}
              >
                <div className="flex justify-center mb-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <p className="text-lg font-bold leading-none text-white">{counts.warning}</p>
                <span className="text-[9px] font-medium tracking-tight mt-1 block truncate">Por vencer</span>
              </button>

              <button
                type="button"
                onClick={() => toggleFilter('expired')}
                className={`p-2 rounded-2xl border text-center transition-all ${
                  statusFilter === 'expired'
                    ? 'bg-rose-950/50 border-rose-500 text-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.2)]'
                    : 'bg-ig-surface border-ig-border text-ig-secondary hover:border-neutral-700'
                }`}
              >
                <div className="flex justify-center mb-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                </div>
                <p className="text-lg font-bold leading-none text-white">{counts.expired}</p>
                <span className="text-[9px] font-medium tracking-tight mt-1 block">Vencidos</span>
              </button>
            </div>

            {/* Buscador en tiempo real */}
            <div className="relative">
              <Search className="w-4 h-4 text-ig-muted absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Buscar socio por nombre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-ig-surface border border-ig-border rounded-xl text-xs text-white placeholder-ig-muted focus:outline-none focus:border-neutral-500 transition-colors"
              />
            </div>

            {/* Listado de Socios */}
            {loading ? (
              <div className="text-center py-12 text-xs text-ig-muted">Cargando socios...</div>
            ) : filteredMembers.length === 0 ? (
              <div className="text-center py-12 bg-ig-surface/40 rounded-2xl border border-ig-border text-xs text-ig-muted px-4">
                No se encontraron socios bajo este filtro.
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
                                href={`https://wa.me/${member.phone.replace(/\D/g, '')}?text=Hola%20${encodeURIComponent(member.full_name)},%20te%20escribimos%20de%20AlDiaFit%20sobre%20tu%20membres%C3%ADa.`}
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

                      {/* Botón de renovación rápida */}
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
          </>
        )}
      </main>

      {/* Dock Flotante Inferior de 3 Elementos Centrado (grid-cols-3) */}
      <nav className="fixed bottom-4 inset-x-4 max-w-xs mx-auto z-40 bg-ig-surface/90 backdrop-blur-xl border border-ig-border rounded-full px-3 py-2 shadow-2xl grid grid-cols-3 items-center justify-items-center">
        {/* 1. Izquierda: Sedes */}
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`flex flex-col items-center gap-0.5 transition-colors ${
            activeTab === 'overview' ? 'text-rose-400 font-bold' : 'text-ig-muted hover:text-white'
          }`}
        >
          <Store className="w-5 h-5" />
          <span className="text-[9px]">Sedes</span>
        </button>

        {/* 2. Centro: Botón de Agregar Nuevo Socio */}
        <button
          type="button"
          onClick={() => { setMemberToEdit(null); setModalOpen(true); }}
          className="relative -top-2.5 p-3 rounded-full bg-ig-gradient shadow-[0_4px_20px_rgba(225,48,108,0.4)] hover:scale-105 active:scale-95 transition-all text-white flex items-center justify-center"
          title="Nuevo Socio"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
        </button>

        {/* 3. Derecha: Socios */}
        <button
          type="button"
          onClick={() => { setActiveTab('members'); setStatusFilter('all'); }}
          className={`flex flex-col items-center gap-0.5 transition-colors ${
            activeTab === 'members' ? 'text-white font-bold' : 'text-ig-muted hover:text-white'
          }`}
        >
          <Users className="w-5 h-5" />
          <span className="text-[9px]">Socios</span>
        </button>
      </nav>

      {/* Modales */}
      <MemberModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveMember}
        memberToEdit={memberToEdit}
        gymId={selectedGymId}
        gyms={gyms}
      />

      <ConfirmModal
        isOpen={Boolean(memberToDelete)}
        onClose={() => setMemberToDelete(null)}
        onConfirm={handleConfirmDelete}
        loading={deleting}
        title="¿Eliminar socio?"
        message={
          <>
            ¿Estás seguro de que deseas eliminar a{' '}
            <strong className="text-white font-semibold">{memberToDelete?.full_name}</strong>?
          </>
        }
      />
    </div>
  );
}