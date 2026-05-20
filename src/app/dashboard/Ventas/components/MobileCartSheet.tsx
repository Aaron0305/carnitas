'use client';

import { FiAlertCircle, FiMinus, FiPlus, FiTrash2, FiUser, FiRefreshCw, FiCheckCircle, FiX } from 'react-icons/fi';
import { CATEGORY_EMOJI } from '../types';
import type { CartItem } from '../types';

interface Props {
  show: boolean;
  cart: CartItem[];
  cartTotal: number;
  cartCount: number;
  clientName: string;
  submitting: boolean;
  activeLabel: string;
  onClose: () => void;
  onClientChange: (v: string) => void;
  onUpdateQty: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
  onSubmit: () => void;
}

export default function MobileCartSheet({
  show, cart, cartTotal, cartCount, clientName, submitting, activeLabel,
  onClose, onClientChange, onUpdateQty, onRemove, onClear, onSubmit,
}: Props) {
  if (!show) return null;

  return (
    <div className="lg:hidden fixed inset-0 z-50 flex flex-col">
      <div className="absolute inset-0 bg-slate-900/50" onClick={onClose} />
      <div className="relative mt-auto bg-white dark:bg-slate-900 rounded-t-3xl shadow-2xl max-h-[85vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
            🧾 {activeLabel || 'Pedido'}
            {cartCount > 0 && (
              <span className="bg-[#FF6701] text-white text-[11px] font-black px-2 py-0.5 rounded-full">{cartCount}</span>
            )}
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
            <FiX size={18} className="text-slate-400" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-slate-300 dark:text-slate-600 gap-2">
              <FiAlertCircle size={28} />
              <p className="text-xs font-semibold">Selecciona productos</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <span className="text-xl">{CATEGORY_EMOJI[item.category] ?? '🍽️'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{item.name}</p>
                  <p className="text-[11px] text-slate-400">${(item.price * item.qty).toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => onUpdateQty(item.id, -1)} className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-red-100 hover:text-red-500 transition-colors cursor-pointer touch-manipulation">
                    <FiMinus size={12} />
                  </button>
                  <span className="text-sm font-black text-slate-800 dark:text-white w-5 text-center">{item.qty}</span>
                  <button onClick={() => onUpdateQty(item.id, +1)} className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-green-100 hover:text-green-500 transition-colors cursor-pointer touch-manipulation">
                    <FiPlus size={12} />
                  </button>
                </div>
                <button onClick={() => onRemove(item.id)} className="text-red-400 hover:text-red-600 transition-colors cursor-pointer ml-1">
                  <FiTrash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>
        {cart.length > 0 && (
          <div className="border-t border-slate-100 dark:border-slate-800 p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total</span>
              <span className="text-2xl font-black text-[#FF6701]">
                ${cartTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="relative">
              <FiUser size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={clientName}
                onChange={e => onClientChange(e.target.value)}
                placeholder="Cliente (opcional)"
                className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#FF6701]/60 transition-colors"
              />
            </div>
            <button
              onClick={onSubmit}
              disabled={submitting}
              className="w-full py-4 rounded-2xl font-black text-base text-white flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-40 shadow-md hover:shadow-lg"
              style={{ background: 'linear-gradient(135deg, #FF6701, #FFA040)' }}
            >
              {submitting ? (
                <><FiRefreshCw className="animate-spin" size={16} /> Procesando…</>
              ) : (
                <><FiCheckCircle size={18} /> Cobrar ${cartTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</>
              )}
            </button>
            <button onClick={onClear} className="w-full py-2.5 rounded-xl border border-red-200 dark:border-red-800 text-red-500 font-bold text-xs hover:bg-red-50 dark:hover:bg-red-900/20 transition-all cursor-pointer text-center">
              <FiTrash2 size={12} className="inline mr-1" /> Limpiar carrito
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
