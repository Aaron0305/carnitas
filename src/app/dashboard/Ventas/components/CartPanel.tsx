'use client';

import { FiTrash2, FiAlertCircle, FiMinus, FiPlus, FiUser, FiRefreshCw, FiCheckCircle } from 'react-icons/fi';
import { CATEGORY_EMOJI } from '../types';
import type { CartItem } from '../types';

interface Props {
  cart: CartItem[];
  cartTotal: number;
  cartCount: number;
  clientName: string;
  submitting: boolean;
  orderLabel: string;
  onUpdateQty: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
  onClientChange: (v: string) => void;
  onSubmit: () => void;
}

export default function CartPanel({
  cart, cartTotal, cartCount, clientName, submitting, orderLabel,
  onUpdateQty, onRemove, onClear, onClientChange, onSubmit,
}: Props) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden flex flex-col">
      <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <h2 className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-2">
          🧾 {orderLabel}
          {cartCount > 0 && (
            <span className="bg-[#FF6701] text-white text-[10px] font-black px-2 py-0.5 rounded-full">{cartCount}</span>
          )}
        </h2>
        <div className="flex items-center gap-2">
          {cart.length > 0 && (
            <button onClick={onClear} className="text-[10px] text-red-400 hover:text-red-600 font-semibold flex items-center gap-1 cursor-pointer transition-colors">
              <FiTrash2 size={11} /> Limpiar
            </button>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 max-h-[280px]">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-slate-300 dark:text-slate-600 gap-2">
            <FiAlertCircle size={24} />
            <p className="text-xs font-semibold">Selecciona productos</p>
          </div>
        ) : (
          cart.map(item => (
            <div key={item.id} className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 group">
              <span className="text-lg">{CATEGORY_EMOJI[item.category] ?? '🍽️'}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold text-slate-800 dark:text-white truncate">{item.name}</p>
                <p className="text-[10px] text-slate-400">${(item.price * item.qty).toFixed(2)}</p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => onUpdateQty(item.id, -1)} className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-red-100 hover:text-red-500 transition-colors cursor-pointer">
                  <FiMinus size={9} />
                </button>
                <span className="text-xs font-black text-slate-800 dark:text-white w-4 text-center">{item.qty}</span>
                <button onClick={() => onUpdateQty(item.id, +1)} className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-green-100 hover:text-green-500 transition-colors cursor-pointer">
                  <FiPlus size={9} />
                </button>
              </div>
              <button onClick={() => onRemove(item.id)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-all cursor-pointer">
                <FiTrash2 size={12} />
              </button>
            </div>
          ))
        )}
      </div>
      <div className="px-5 py-2.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30">
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total</span>
          <span className="text-xl font-black text-[#FF6701]">
            ${cartTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>
      <div className="px-5 py-3 space-y-3 border-t border-slate-100 dark:border-slate-800">
        <div className="relative">
          <FiUser size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={clientName}
            onChange={e => onClientChange(e.target.value)}
            placeholder="Cliente (opcional)"
            className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#FF6701]/60 transition-colors"
          />
        </div>
        <button
          onClick={onSubmit}
          disabled={cart.length === 0 || submitting}
          className="w-full py-3.5 rounded-2xl font-black text-sm text-white flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
          style={{ background: cart.length > 0 ? 'linear-gradient(135deg, #FF6701, #FFA040)' : '#ccc' }}
        >
          {submitting ? (
            <><FiRefreshCw className="animate-spin" size={14} /> Procesando…</>
          ) : (
            <><FiCheckCircle size={16} /> Cobrar — ${cartTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</>
          )}
        </button>
      </div>
    </div>
  );
}
