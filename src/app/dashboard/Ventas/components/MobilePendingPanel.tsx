'use client';

import { FiClock, FiPlus, FiX, FiAlertCircle, FiCopy, FiTrash2, FiPrinter } from 'react-icons/fi';
import type { PendingOrder } from '../types';

interface Props {
  show: boolean;
  orders: PendingOrder[];
  activeOrderId: string | null;
  onClose: () => void;
  onSwitch: (id: string) => void;
  onNewOrder: () => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onQuickPrint?: () => void;
}

export default function MobilePendingPanel({
  show, orders, activeOrderId, onClose, onSwitch,
  onNewOrder, onDuplicate, onDelete, onQuickPrint,
}: Props) {
  if (!show) return null;

  return (
    <div className="lg:hidden fixed inset-0 z-50 flex flex-col">
      <div className="absolute inset-0 bg-slate-900/50" onClick={onClose} />
      <div className="relative mt-auto bg-white dark:bg-slate-900 rounded-t-3xl shadow-2xl max-h-[70vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
            <FiClock /> Órdenes pendientes
            {orders.length > 0 && (
              <span className="bg-[#FF6701] text-white text-[11px] font-black px-2 py-0.5 rounded-full">{orders.length}</span>
            )}
          </h2>
          <div className="flex items-center gap-2">
            {onQuickPrint && (
              <button
                onClick={(e) => { e.stopPropagation(); onQuickPrint(); }}
                className="text-[10px] text-slate-500 hover:text-[#FF6701] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                title="Impresión Rápida de Tickets"
              >
                <FiPrinter size={12} /> Rápida
              </button>
            )}
            <button onClick={onNewOrder} className="text-xs font-bold text-[#FF6701] flex items-center gap-1 hover:underline cursor-pointer">
              <FiPlus size={14} /> Nueva
            </button>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
              <FiX size={18} className="text-slate-400" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-slate-300 dark:text-slate-600 gap-2">
              <FiAlertCircle size={24} />
              <p className="text-xs font-semibold">Sin órdenes pendientes</p>
            </div>
          ) : (
            orders.map(order => (
              <div
                key={order.id}
                className={`p-3 rounded-xl border-2 transition-all cursor-pointer ${
                  order.id === activeOrderId
                    ? 'border-[#FF6701] bg-[#FF6701]/5 shadow-md'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50'
                }`}
                onClick={() => onSwitch(order.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-bold text-sm text-slate-800 dark:text-white truncate">{order.label}</span>
                    {order.id === activeOrderId && (
                      <span className="text-[9px] font-bold text-[#FF6701] bg-[#FF6701]/10 px-1.5 py-0.5 rounded-full">Activa</span>
                    )}
                  </div>
                  <span className="text-xs font-black text-[#FF6701] flex-shrink-0 ml-2">
                    ${order.items.reduce((s, i) => s + i.price * i.qty, 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-[10px] text-slate-400">
                    {order.items.reduce((s, i) => s + i.qty, 0)} artículos
                    {order.client ? ` · ${order.client}` : ''}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); onDuplicate(order.id); }}
                      className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                      title="Duplicar"
                    >
                      <FiCopy size={11} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onDelete(order.id); }}
                      className="p-1 rounded text-red-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer"
                      title="Eliminar"
                    >
                      <FiTrash2 size={11} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
