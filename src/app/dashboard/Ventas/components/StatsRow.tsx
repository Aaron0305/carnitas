'use client';

interface Props {
  initialCash: number;
  totalSalesCash: number;
  totalInBox: number;
}

export default function StatsRow({ initialCash, totalSalesCash, totalInBox }: Props) {
  const stats = [
    { label: 'Apertura', value: initialCash, accent: false },
    { label: 'Ventas', value: totalSalesCash, accent: true },
    { label: 'Caja', value: totalInBox, accent: false },
  ];

  return (
    <div className="px-4 pt-3 grid grid-cols-3 gap-2">
      {stats.map(stat => (
        <div key={stat.label} className={`rounded-xl p-2.5 border shadow-sm flex flex-col ${stat.accent
          ? 'bg-[#FF6701] border-[#FF6701] text-white shadow-lg'
          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
        }`}>
          <span className={`text-[9px] font-bold uppercase tracking-wider ${stat.accent ? 'text-orange-100' : 'text-slate-400 dark:text-slate-500'}`}>
            {stat.label}
          </span>
          <span className={`text-sm md:text-base font-black mt-0.5 ${stat.accent ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
            ${stat.value.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </span>
        </div>
      ))}
    </div>
  );
}
