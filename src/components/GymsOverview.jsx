import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { getStatus } from '../lib/utils';
import { 
  Building2, 
  Users, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ArrowUpRight,
  Sparkles,
  TrendingUp
} from 'lucide-react';

export default function GymsOverview({ gyms, onSelectGym }) {
  const [allMembers, setAllMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAllMembers() {
      setLoading(true);
      const { data, error } = await supabase
        .from('members')
        .select('*');

      if (!error && data) {
        setAllMembers(data);
      }
      setLoading(false);
    }

    fetchAllMembers();
  }, []);

  const { globalStats, branchStats } = useMemo(() => {
    const global = { total: allMembers.length, active: 0, warning: 0, expired: 0 };
    const branches = {};

    gyms.forEach((gym) => {
      branches[gym.id] = {
        name: gym.name,
        total: 0,
        active: 0,
        warning: 0,
        expired: 0
      };
    });

    allMembers.forEach((member) => {
      const { type } = getStatus(member.due_date);
      global[type]++;

      if (branches[member.gym_id]) {
        branches[member.gym_id].total++;
        branches[member.gym_id][type]++;
      }
    });

    return { globalStats: global, branchStats: branches };
  }, [allMembers, gyms]);

  if (loading) {
    return (
      <div className="py-20 text-center text-xs text-ig-muted">
        Cargando balance de sucursales...
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Banner de Estado Global del Negocio */}
      <div className="bg-gradient-to-br from-ig-surface via-ig-surface to-neutral-900 border border-ig-border rounded-3xl p-4 sm:p-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-ig-gradient opacity-10 blur-2xl pointer-events-none rounded-full" />
        
        {/* Encabezado del Banner */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 text-rose-400">
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span className="text-[10px] font-bold tracking-wider uppercase">Balance General</span>
          </div>
          <span className="text-[10px] text-ig-muted font-medium shrink-0">Ambas sedes</span>
        </div>

        {/* Cifra Principal y Badge */}
        <div className="flex items-center justify-between border-b border-ig-border pb-3.5 gap-2">
          <div className="min-w-0">
            <p className="text-3xl font-black text-white tracking-tight leading-none">{globalStats.total}</p>
            <p className="text-xs text-ig-secondary mt-1 font-medium truncate">Socios registrados en total</p>
          </div>
          <div className="flex items-center gap-1 text-emerald-400 text-xs font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-xl border border-emerald-500/20 shrink-0">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{globalStats.active} al día</span>
          </div>
        </div>

        {/* 3 Métricas Distribuidas */}
        <div className="grid grid-cols-3 gap-2 pt-3 text-center">
          <div className="bg-ig-black/60 border border-ig-border rounded-xl p-2">
            <p className="text-sm font-bold text-emerald-400 leading-tight">{globalStats.active}</p>
            <span className="text-[9px] text-ig-muted font-medium">Al corriente</span>
          </div>
          <div className="bg-ig-black/60 border border-ig-border rounded-xl p-2">
            <p className="text-sm font-bold text-amber-400 leading-tight">{globalStats.warning}</p>
            <span className="text-[9px] text-ig-muted font-medium">Por vencer</span>
          </div>
          <div className="bg-ig-black/60 border border-ig-border rounded-xl p-2">
            <p className="text-sm font-bold text-rose-400 leading-tight">{globalStats.expired}</p>
            <span className="text-[9px] text-ig-muted font-medium">Vencidos</span>
          </div>
        </div>
      </div>

      {/* Lista de Sedes Individuales */}
      <div className="space-y-2.5">
        <h2 className="text-xs font-bold tracking-wider uppercase text-ig-secondary px-1">
          Rendimiento por Sucursal
        </h2>

        {gyms.map((gym) => {
          const stats = branchStats[gym.id] || { total: 0, active: 0, warning: 0, expired: 0 };
          const percentActive = stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0;

          return (
            <div
              key={gym.id}
              onClick={() => onSelectGym(gym.id)}
              className="group bg-ig-surface border border-ig-border hover:border-neutral-700 rounded-2xl p-4 transition-all active:scale-[0.99] cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-ig-black border border-ig-border flex items-center justify-center text-white group-hover:border-neutral-600 transition-colors">
                    <Building2 className="w-5 h-5 text-rose-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-rose-400 transition-colors">
                      {gym.name}
                    </h3>
                    <p className="text-xs text-ig-secondary mt-0.5">
                      {stats.total} socios registrados
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-xs font-medium text-ig-muted group-hover:text-white transition-colors">
                  <span>Abrir</span>
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>

              {/* Barra de progreso de socios al corriente */}
              <div className="mt-4 pt-3 border-t border-ig-border">
                <div className="flex justify-between text-[11px] mb-1.5">
                  <span className="text-ig-muted">Cumplimiento de pagos</span>
                  <span className="font-semibold text-emerald-400">{percentActive}% al corriente</span>
                </div>
                <div className="w-full h-1.5 bg-ig-black rounded-full overflow-hidden border border-ig-border">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                    style={{ width: `${percentActive}%` }}
                  />
                </div>

                {/* Métricas pequeñas de la sucursal */}
                <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                  <div className="p-1.5 bg-ig-black rounded-lg border border-ig-border text-[10px]">
                    <span className="text-emerald-400 font-bold">{stats.active}</span>
                    <span className="text-ig-muted ml-1">al día</span>
                  </div>
                  <div className="p-1.5 bg-ig-black rounded-lg border border-ig-border text-[10px]">
                    <span className="text-amber-400 font-bold">{stats.warning}</span>
                    <span className="text-ig-muted ml-1">aviso</span>
                  </div>
                  <div className="p-1.5 bg-ig-black rounded-lg border border-ig-border text-[10px]">
                    <span className="text-rose-400 font-bold">{stats.expired}</span>
                    <span className="text-ig-muted ml-1">vencidos</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}