'use client';

import { FiClock, FiCopy, FiTrash2 } from 'react-icons/fi';
import type { PendingOrder } from '../types';

interface Props {
  orders: PendingOrder[];
  activeOrderId: string | null;
  onSwitch: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
}

export default function PendingOrdersList({
  orders, activeOrderId, onSwitch, onDelete, onDuplicate
}: Props) {
  if (orders.length === 0) return null;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
        <h3 className="text-xs font-extrabold text-slate-800 dark:text-white flex items-center gap-1.5">
          <FiClock size={12} /> Órdenes pendientes
          <span className="bg-[#FF6701] text-white text-[9px] font-black px-1.5 py-0.5 rounded-full ml-1">{orders.length}</span>
        </h3>
      </div>
      <div className="divide-y divide-slate-50 dark:divide-slate-800 max-h-48 overflow-y-auto">
        {orders.map(order => {
          const total = order.items.reduce((s, i) => s + i.price * i.qty, 0);
          const itemCount = order.items.reduce((s, i) => s + i.qty, 0);
          const isActive = order.id === activeOrderId;
          return (
            <div
              key={order.id}
              className={`px-4 py-2.5 cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/30 ${
                isActive ? 'bg-[#FF6701]/5 border-l-2 border-[#FF6701]' : 'border-l-2 border-transparent'
              }`}
              onClick={() => onSwitch(order.id)}
            >
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                  {order.label}
                  {isActive && <span className="text-[8px] text-[#FF6701] font-black">●</span>}
                </p>
                <span className="text-[11px] font-black text-[#FF6701]">
                  ${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex items-center justify-between mt-0.5">
                <span className="text-[9px] text-slate-400">{itemCount} artículos{order.client ? ` · ${order.client}` : ''}</span>
                <div className="flex items-center gap-0.5">
                  <button onClick={(e) => { e.stopPropagation(); onDuplicate(order.id); }}
                    className="p-1 rounded text-slate-300 hover:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                    title="Duplicar">
                    <FiCopy size={10} />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); onDelete(order.id); }}
                    className="p-1 rounded text-red-200 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer"
                    title="Eliminar">
                    <FiTrash2 size={10} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
