'use client';

import { FiEdit3, FiCheck } from 'react-icons/fi';
interface Props {
  activeOrderId: string | null;
  editingOrderLabel: string | null;
  editLabelValue: string;
  onEditLabelChange: (v: string) => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveLabel: () => void;
  activeLabel: string;
  onNewOrder: () => void;
}

export default function ActiveOrderBadge({
  activeOrderId, editingOrderLabel,
  editLabelValue, onEditLabelChange, onStartEdit,
  onCancelEdit, onSaveLabel, activeLabel, onNewOrder
}: Props) {
  if (!activeOrderId) return null;

  return (
    <div className="max-w-6xl mx-auto mt-2 flex items-center justify-between w-full px-4">
      <div className="flex items-center gap-2">
        {editingOrderLabel === activeOrderId ? (
          <div className="flex items-center gap-1">
            <input
              type="text"
              value={editLabelValue}
              onChange={e => onEditLabelChange(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') onSaveLabel();
                if (e.key === 'Escape') onCancelEdit();
              }}
              className="w-32 px-2 py-1 rounded-lg border border-[#FF6701] bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-white outline-none"
              autoFocus
            />
            <button onClick={onSaveLabel} className="text-green-500 cursor-pointer">
              <FiCheck size={14} />
            </button>
          </div>
        ) : (
          <button
            onClick={onStartEdit}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF6701]/10 border border-[#FF6701]/30 text-[#FF6701] font-bold text-xs hover:bg-[#FF6701]/20 transition-all cursor-pointer"
          >
            <FiEdit3 size={11} />
            {activeLabel}
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={onNewOrder}
        className="hidden lg:flex items-center gap-1.5 px-4 py-1.5 rounded-xl border-2 border-dashed border-[#FF6701] text-[#FF6701] font-extrabold text-xs hover:bg-[#FF6701]/5 transition-all cursor-pointer"
      >
        + Nueva Orden
      </button>
    </div>
  );
}
