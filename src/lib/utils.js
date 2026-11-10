// Obtiene la fecha local de hoy en formato YYYY-MM-DD
export function getTodayDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Suma días a una fecha dada sin alterar la zona horaria
export function addDays(dateStr, days = 30) {
  const [year, month, day] = dateStr.split('-').map(Number);
  const target = new Date(year, month - 1, day);
  target.setDate(target.getDate() + days);

  const y = target.getFullYear();
  const m = String(target.getMonth() + 1).padStart(2, '0');
  const d = String(target.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Determina el estado del socio según los días restantes
export function getStatus(dueDateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [year, month, day] = dueDateStr.split('-').map(Number);
  const due = new Date(year, month - 1, day);
  due.setHours(0, 0, 0, 0);

  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      type: 'expired',
      label: 'Vencido',
      days: Math.abs(diffDays),
      badgeClass: 'bg-red-500/10 text-red-400 border-red-500/20'
    };
  }

  if (diffDays <= 3) {
    return {
      type: 'warning',
      label: 'Por vencer',
      days: diffDays,
      badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/20'
    };
  }

  return {
    type: 'active',
    label: 'Al corriente',
    days: diffDays,
    badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
  };
}