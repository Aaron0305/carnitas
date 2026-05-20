'use client';

import { FiDollarSign, FiClock, FiSearch, FiRefreshCw, FiShoppingCart } from 'react-icons/fi';

interface Props {
  pendingCount: number;
  showPendingPanel: boolean;
  onTogglePendingPanel: () => void;
  showSearch: boolean;
  onToggleSearch: () => void;
  onRefresh: () => void;
  cartCount: number;
  onToggleMobileCart: () => void;
}

export default function TopBar({
  pendingCount, showPendingPanel, onTogglePendingPanel,
  showSearch, onToggleSearch, onRefresh,
  cartCount, onToggleMobileCart,
}: Props) {
  return (
    <div className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-2.5">
      <div className="flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center gap-2 min-w-0">
          <span className="p-1.5 rounded-lg bg-[#FF6701] text-white shadow-md flex-shrink-0">
            <FiDollarSign size={16} />
          </span>
          <h1 className="text-lg font-extrabold text-slate-900 dark:text-white truncate">
            Punto de Venta
          </h1>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={onTogglePendingPanel}
            className={`relative p-2 rounded-lg transition-all cursor-pointer ${
              showPendingPanel
                ? 'bg-[#FF6701] text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <FiClock size={16} />
            {pendingCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center px-1 shadow-lg border-2 border-white dark:border-slate-900">
                {pendingCount}
              </span>
            )}
          </button>
          <button
            onClick={onToggleSearch}
            className={`p-2 rounded-lg transition-all cursor-pointer ${
              showSearch
                ? 'bg-[#FF6701] text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <FiSearch size={16} />
          </button>
          <button
            onClick={onRefresh}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer"
          >
            <FiRefreshCw size={16} />
          </button>
          <button
            onClick={onToggleMobileCart}
            className="lg:hidden relative p-2 rounded-lg bg-[#FF6701] text-white shadow-md cursor-pointer"
          >
            <FiShoppingCart size={18} />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center px-1 shadow-lg border-2 border-white dark:border-slate-900">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
