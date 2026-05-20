'use client';

import { MdOutlineDinnerDining } from 'react-icons/md';
import { CATEGORY_ICON } from '../types';
import type { CartItem, Product } from '../types';

interface Props {
  products: Product[];
  cart: CartItem[];
  onAddToCart: (product: Product) => void;
  searchQuery: string;
}

export default function ProductGrid({ products, cart, onAddToCart, searchQuery }: Props) {
  if (products.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center flex flex-col items-center justify-center gap-2">
        <MdOutlineDinnerDining className="text-4xl text-slate-300" />
        <h3 className="text-sm font-bold text-slate-800 dark:text-white">Sin Productos</h3>
        <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
          {searchQuery ? 'No hay productos que coincidan con la búsqueda.' : 'Aún no tienes productos en esta categoría.'}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
      {products.map(product => {
        const inCart = cart.find(i => i.id === product.id);
        const isUnlimited = parseFloat(String(product.stock)) === -1 || String(product.stock).includes('Ilimitado');
        const isOutOfStock = !isUnlimited && parseFloat(String(product.stock)) <= 0;

        // Usa la categoría real del producto para el ícono (Taco, Bebida, Corte, etc.)
        const Icon = CATEGORY_ICON[product.category] ?? MdOutlineDinnerDining;

        return (
          <div
            key={product.id}
            className={`relative rounded-xl border-2 transition-all overflow-hidden ${
              isOutOfStock
                ? 'opacity-40 border-slate-100 bg-slate-50 dark:bg-slate-800/20 dark:border-slate-800'
                : inCart
                  ? 'border-[#FF6701] bg-[#FF6701]/5 dark:bg-[#FF6701]/10 shadow-md'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900'
            }`}
          >
            {inCart && (
              <span className="absolute top-2 right-2 z-10 min-w-[22px] h-[22px] rounded-full bg-[#FF6701] text-white text-[10px] font-black flex items-center justify-center px-1 shadow">
                {inCart.qty}
              </span>
            )}
            <button
              disabled={isOutOfStock}
              onClick={() => onAddToCart(product)}
              className="w-full text-left p-3 cursor-pointer touch-manipulation min-h-[80px]"
            >
              <Icon className="text-2xl block mb-1" />
              <p className="text-sm font-bold text-slate-850 dark:text-white leading-tight">{product.name}</p>
              <div className="flex justify-between items-center mt-2">
                <p className="text-base font-black text-[#FF6701]">
                  {typeof product.price === 'number' ? `$${product.price.toFixed(2)}` : product.price}
                </p>
              </div>
            </button>
          </div>
        );
      })}
    </div>
  );
}
