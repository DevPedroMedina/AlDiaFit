import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { getStatus, addDays } from '../lib/utils';
import MemberModal from './MemberModal';
import {
  Building2, Plus, Search, CalendarPlus, Edit2,
  Trash2, Phone, LogOut, CheckCircle2, Clock, AlertTriangle
} from 'lucide-react';

export default function Dashboard() {
  const [gyms, setGyms] = useState([]);
  const [selectedGymId, setSelectedGymId] = useState('');
  const [members, setMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [memberToEdit, setMemberToEdit] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Cargar sucursales existentes en Supabase
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

  // 2. Cargar socios cada vez que se cambia de sucursal
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

  // 3. Conteo de métricas en tiempo real
  const counts = useMemo(() => {
    const res = { active: 0, warning: 0, expired: 0 };
    members.forEach((m) => {
      const { type } = getStatus(m.due_date);
      res[type]++;
    });
    return res;
  }, [members]);

  // 4. Filtrado reactivo por nombre y estado
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
    }
  };

  // Eliminar socio
  const handleDeleteMember = async (id) => {
    if (!window.confirm('¿Deseas eliminar a este socio?')) return;
    const { error } = await supabase.from('members').delete().eq('id', id);
    if (!error) {
      setMembers((prev) => prev.filter((m) => m.id !== id));
    }
  };

  // Guardar (crear o editar)
  const handleSaveMember = async (memberData) => {
    if (memberData.id) {
      const { id, ...updates } = memberData;
      const { error } = await supabase
        .from('members')
        .update(updates)
        .eq('id', id);

      if (error) {
        alert('Error al actualizar: ' + error.message);
      } else {
        loadMembers();
      }
    } else {
      const { error } = await supabase
        .from('members')
        .insert([memberData]);

      if (error) {
        alert('Error al registrar: ' + error.message);
      } else {
        loadMembers();
      }
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      {/* Encabezado con selector de sucursal */}
      <header className="sticky top-0 z-30 bg-zinc-900/95 backdrop-blur border-b border-zinc-800 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <select
              value={selectedGymId}
              onChange={(e) => setSelectedGymId(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 text-sm font-semibold rounded-lg px-2.5 py-1.5 focus:border-emerald-500 focus:outline-none"
            >
              {gyms.map((g) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => { setMemberToEdit(null); setModalOpen(true); }}
              className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-semibold px-3 py-1.5 rounded-lg text-sm transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nuevo Socio</span>
            </button>
            <button
              onClick={() => supabase.auth.signOut()}
              className="p-1.5 text-zinc-400 hover:text-zinc-100 rounded-lg hover:bg-zinc-800 transition-colors"
              title="Cerrar sesión"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Cuerpo principal */}
      <main className="max-w-4xl mx-auto p-4 flex-1 w-full space-y-4">
        {/* Tarjetas KPI */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          <button
            onClick={() => setStatusFilter(statusFilter === 'active' ? 'all' : 'active')}
            className={`p-3 rounded-xl border text-left transition-all ${
              statusFilter === 'active'
                ? 'border-emerald-500/60 bg-emerald-500/10'
                : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
            }`}
          >
            <div className="flex items-center gap-1.5 text-emerald-400 mb-1">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-[11px] font-semibold uppercase tracking-wider hidden sm:inline">Al corriente</span>
            </div>
            <p className="text-2xl font-black text-zinc-100">{counts.active}</p>
          </button>

          <button
            onClick={() => setStatusFilter(statusFilter === 'warning' ? 'all' : 'warning')}
            className={`p-3 rounded-xl border text-left transition-all ${
              statusFilter === 'warning'
                ? 'border-amber-500/60 bg-amber-500/10'
                : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
            }`}
          >
            <div className="flex items-center gap-1.5 text-amber-400 mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-[11px] font-semibold uppercase tracking-wider hidden sm:inline">Por vencer</span>
            </div>
            <p className="text-2xl font-black text-zinc-100">{counts.warning}</p>
          </button>

          <button
            onClick={() => setStatusFilter(statusFilter === 'expired' ? 'all' : 'expired')}
            className={`p-3 rounded-xl border text-left transition-all ${
              statusFilter === 'expired'
                ? 'border-red-500/60 bg-red-500/10'
                : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
            }`}
          >
            <div className="flex items-center gap-1.5 text-red-400 mb-1">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-[11px] font-semibold uppercase tracking-wider hidden sm:inline">Vencidos</span>
            </div>
            <p className="text-2xl font-black text-zinc-100">{counts.expired}</p>
          </button>
        </div>

        {/* Buscador y Pestañas */}
        <div className="space-y-2">
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Buscar socio por nombre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-sm focus:border-emerald-500 focus:outline-none placeholder:text-zinc-500 text-zinc-100"
            />
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs">
            {[
              { id: 'all', label: 'Todos' },
              { id: 'active', label: 'Al corriente' },
              { id: 'warning', label: 'Por vencer' },
              { id: 'expired', label: 'Vencidos' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  statusFilter === tab.id
                    ? 'bg-zinc-800 text-zinc-100 border border-zinc-700'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Lista de Socios */}
        {loading ? (
          <div className="text-center py-12 text-zinc-500 text-xs">Cargando registros...</div>
        ) : filteredMembers.length === 0 ? (
          <div className="text-center py-12 text-zinc-500 text-xs bg-zinc-900/40 rounded-xl border border-zinc-900">
            No hay socios registrados en esta sucursal.
          </div>
        ) : (
          <div className="space-y-2">
            {filteredMembers.map((member) => {
              const status = getStatus(member.due_date);
              return (
                <div
                  key={member.id}
                  className="bg-zinc-900 border border-zinc-800/80 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-zinc-100 truncate text-sm">
                        {member.full_name}
                      </span>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${status.badgeClass}`}>
                        {status.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 mt-1.5 text-xs text-zinc-400">
                      {member.phone && (
                        <a
                          href={`https://wa.me/${member.phone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 hover:text-emerald-400 transition-colors"
                        >
                          <Phone className="w-3.5 h-3.5 text-zinc-500" />
                          <span>{member.phone}</span>
                        </a>
                      )}
                      <span>
                        Vence: <strong className="text-zinc-300 font-medium">{member.due_date}</strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-zinc-800">
                    <button
                      onClick={() => handleQuickRenew(member)}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1 text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-lg border border-emerald-500/20 transition-all active:scale-95"
                    >
                      <CalendarPlus className="w-3.5 h-3.5" />
                      <span>+1 Mes</span>
                    </button>
                    <button
                      onClick={() => { setMemberToEdit(member); setModalOpen(true); }}
                      className="p-1.5 text-zinc-400 hover:text-zinc-100 rounded-lg hover:bg-zinc-800 transition-colors"
                      title="Editar"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteMember(member.id)}
                      className="p-1.5 text-zinc-500 hover:text-red-400 rounded-lg hover:bg-zinc-800 transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Modal para crear / editar socio */}
      <MemberModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveMember}
        memberToEdit={memberToEdit}
        gymId={selectedGymId}
        gyms={gyms}
      />
    </div>
  );
}