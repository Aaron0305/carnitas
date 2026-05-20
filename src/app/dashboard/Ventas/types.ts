import { GiTacos, GiMeat, GiAvocado } from 'react-icons/gi';
import { FiPackage } from 'react-icons/fi';
import { LuCupSoda } from 'react-icons/lu';
import { MdOutlineDinnerDining } from 'react-icons/md';
import type { ElementType } from 'react';

export interface Product {
  id?: string | number;
  name: string;
  category: string;    // Tipo real: Taco, Bebida, Corte, Complemento, Combo, Otro
  unit: string;         // Unidad de venta: Pieza, Kg, Litro, etc.
  price: string | number;
  stock: string | number;
  status: string;
  accent?: string;
  cost_price?: number;
  gain_price?: number;
}

export interface CartItem {
  id: string;
  name: string;
  category: string;
  price: number;
  qty: number;
}

export interface PendingOrder {
  id: string;
  label: string;
  items: CartItem[];
  client: string;
  note: string;
  createdAt: number;
  isDbOrder?: boolean;
}

export interface LastSale {
  doc: string;
  client: string;
  items: CartItem[];
  total: number;
  time: string;
}

// ── Etiquetas por categoría real del producto ──
export const CATEGORY_LABELS: Record<string, string> = {
  all: 'Todo',
  Taco: 'Tacos',
  Corte: 'Por Kg',
  Bebida: 'Bebidas',
  Complemento: 'Extras',
  Combo: 'Paquetes',
  Otro: 'Otros',
};

// ── Iconos por categoría real del producto ──
export const CATEGORY_ICON: Record<string, ElementType> = {
  Taco: GiTacos,
  Corte: GiMeat,
  Bebida: LuCupSoda,
  Complemento: GiAvocado,
  Combo: FiPackage,
  Otro: MdOutlineDinnerDining,
};

// ── Emojis por categoría real del producto ──
export const CATEGORY_EMOJI: Record<string, string> = {
  Taco: '🌮',
  Corte: '🥩',
  Bebida: '🥤',
  Complemento: '🥑',
  Combo: '📦',
  Otro: '🍽️',
};
