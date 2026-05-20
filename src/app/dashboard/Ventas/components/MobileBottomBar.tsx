'use client';

import { FiClock, FiShoppingCart } from 'react-icons/fi';

interface Props {
  showPendingPanel: boolean;
  onTogglePendingPanel: () => void;
  onToggleMobileCart: () => void;
  pendingCount: number;
  cartCount: number;
}

export default function MobileBottomBar({
  showPendingPanel, onTogglePendingPanel, onToggleMobileCart,
  pendingCount, cartCount,
}: Props) {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shadow-2xl">
      <div className="flex">
        <button
          onClick={onTogglePendingPanel}
          className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-bold transition-all cursor-pointer touch-manipulation ${
            showPendingPanel ? 'bg-[#FF6701]/10 text-[#FF6701]' : 'text-slate-500'
          }`}
        >
          <FiClock size={14} />
          Órdenes
          {pendingCount > 0 && (
            <span className="bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">{pendingCount}</span>
          )}
        </button>
        <button
          onClick={onToggleMobileCart}
          className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-bold text-slate-500 transition-all cursor-pointer touch-manipulation"
        >
          <FiShoppingCart size={14} />
          Carrito
          {cartCount > 0 && (
            <span className="bg-[#FF6701] text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">{cartCount}</span>
          )}
        </button>
      </div>
    </div>
  );
}
