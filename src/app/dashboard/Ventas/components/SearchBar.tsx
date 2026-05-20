'use client';

import { FiSearch, FiX } from 'react-icons/fi';

interface Props {
  searchQuery: string;
  onSearchChange: (v: string) => void;
  onClear: () => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
}

export default function SearchBar({ searchQuery, onSearchChange, onClear, inputRef }: Props) {
  return (
    <div className="px-4 pt-3 pb-0">
      <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 bg-white/70 dark:bg-slate-700/50 transition-all ${
        searchQuery ? 'border-[#FF6701]' : 'border-[#FF6701]/15'
      }`}>
        <FiSearch className="text-base text-[#FF6701] flex-shrink-0" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Buscar productos..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="bg-transparent outline-none w-full font-semibold text-sm text-slate-900 dark:text-white"
        />
        {searchQuery && (
          <button onClick={onClear} className="text-slate-400 hover:text-slate-600 cursor-pointer flex-shrink-0">
            <FiX size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
