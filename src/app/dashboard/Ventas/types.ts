export interface Product {
  id?: string | number;
  name: string;
  category: string;
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
}

export interface LastSale {
  doc: string;
  client: string;
  items: CartItem[];
  total: number;
  time: string;
}

export const CATEGORY_LABELS: Record<string, string> = {
  all: 'Todo',
  Pieza: 'Tacos',
  Kg: 'Por Kg',
  Bebida: 'Bebidas',
  Paquete: 'Paquetes',
  Extras: 'Acompañamientos',
};

export const CATEGORY_EMOJI: Record<string, string> = {
  Pieza: '🌮',
  Kg: '⚖️',
  Bebida: '🥤',
  Paquete: '👨‍👩‍👧‍👦',
  Extras: '🥑',
};
