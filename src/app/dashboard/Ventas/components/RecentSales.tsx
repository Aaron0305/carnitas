'use client';

import type { Venta } from '@/service/ventas';

interface Props {
  transactions: Venta[];
  loading: boolean;
}

export default function RecentSales({ transactions, loading }: Props) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
        <h3 className="text-xs font-extrabold text-slate-800 dark:text-white">Últimas ventas</h3>
      </div>
      <div className="divide-y divide-slate-50 dark:divide-slate-800 max-h-48 overflow-y-auto">
        {loading ? (
          <p className="text-xs text-center text-slate-400 font-bold py-5">Cargando...</p>
        ) : transactions.length === 0 ? (
          <p className="text-xs text-center text-slate-400 font-semibold py-5">Sin ventas aún.</p>
        ) : (
          transactions.slice(0, 6).map(t => (
            <div key={t.id} className="px-4 py-2.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-slate-800 dark:text-white">{t.doc}</p>
                <p className="text-[9px] text-slate-400 truncate max-w-[160px]">{t.time} · {t.items}</p>
              </div>
              <p className="text-xs font-black text-[#FF6701] flex-shrink-0">
                {typeof t.total === 'number' ? `$${t.total.toFixed(2)}` : t.total}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
