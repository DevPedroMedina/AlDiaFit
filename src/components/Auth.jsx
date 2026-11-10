import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Dumbbell, Lock, Mail, AlertCircle, Loader2 } from 'lucide-react';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password
    });

    if (error) {
      setErrorMsg(
        error.message === 'Invalid login credentials'
          ? 'Correo o contraseña incorrectos'
          : error.message
      );
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-ig-black text-white flex items-center justify-center p-4 antialiased selection:bg-pink-500/30">
      <div className="w-full max-w-sm bg-ig-surface border border-ig-border rounded-3xl p-7 shadow-2xl relative overflow-hidden">
        {/* Glow sutil superior */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 bg-ig-gradient opacity-15 blur-3xl pointer-events-none rounded-full" />

        {/* Encabezado y Marca */}
        <div className="flex flex-col items-center mb-6 relative">
          <div className="p-3.5 rounded-2xl bg-ig-black border border-ig-border mb-3 shadow-inner">
            <div className="p-2 rounded-xl bg-ig-gradient text-white flex items-center justify-center shadow-[0_4px_16px_rgba(225,48,108,0.3)]">
              <Dumbbell className="w-6 h-6 stroke-[2.2]" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-orange-400 via-rose-500 to-fuchsia-500 bg-clip-text text-transparent">
            AlDiaFit
          </h1>
          <p className="text-xs text-ig-secondary mt-1">Control de Membresías</p>
        </div>

        {/* Alerta de error */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-950/40 border border-rose-500/50 rounded-xl text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleLogin} className="space-y-3.5 relative">
          <div>
            <label className="block text-[11px] font-medium text-ig-secondary mb-1.5 ml-1">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-ig-muted absolute left-3.5 top-3" />
              <input
                type="email"
                required
                className="w-full pl-10 pr-3.5 py-2.5 bg-ig-black border border-ig-border rounded-xl text-white text-xs placeholder-ig-muted focus:border-neutral-500 focus:outline-none transition-colors"
                placeholder="admin@aldiafit.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-ig-secondary mb-1.5 ml-1">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-ig-muted absolute left-3.5 top-3" />
              <input
                type="password"
                required
                className="w-full pl-10 pr-3.5 py-2.5 bg-ig-black border border-ig-border rounded-xl text-white text-xs placeholder-ig-muted focus:border-neutral-500 focus:outline-none transition-colors"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 rounded-xl bg-ig-gradient font-semibold text-xs text-white shadow-[0_4px_20px_rgba(225,48,108,0.35)] hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Iniciar Sesion'}
          </button>
        </form>

        <p className="mt-6 text-center text-[10px] text-ig-muted">
          Acceso administrativo protegido por Supabase Auth
        </p>
      </div>
    </div>
  );
}