'use client';

import { CATEGORY_LABELS, CATEGORY_EMOJI } from '../types';

interface Props {
  categories: string[];
  activeCategory: string;
  onSelect: (cat: string) => void;
}

export default function CategoryTabs({ categories, activeCategory, onSelect }: Props) {
  return (
    <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none -mx-4 px-4 lg:mx-0 lg:px-0">
      {categories.map(cat => (
        <button
          key={cat}
          onClick={() => onSelect(cat)}
          className={`flex-shrink-0 px-3.5 py-2 rounded-lg text-[11px] font-bold tracking-wide border transition-all cursor-pointer touch-manipulation ${
            activeCategory === cat
              ? 'bg-[#FF6701] text-white border-[#FF6701] shadow-md'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-[#FF6701]/50'
          }`}
        >
          {cat !== 'all' && CATEGORY_EMOJI[cat] ? `${CATEGORY_EMOJI[cat]} ` : ''}{CATEGORY_LABELS[cat] ?? cat}
        </button>
      ))}
    </div>
  );
}
