'use client';

import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import {
  FiDollarSign, FiTrash2, FiMinus, FiPlus,
  FiAlertCircle, FiCheckCircle,
  FiRefreshCw, FiUser, FiSearch, FiX, FiShoppingCart,
  FiClock, FiCheck, FiEdit3, FiPlusCircle, FiCopy
} from 'react-icons/fi';
import { VentasService, Venta } from '@/service/ventas';
import { ProductosService } from '@/service/productos';

interface CartItem {
  id: string;
  name: string;
  category: string;
  price: number;
  qty: number;
}

interface PendingOrder {
  id: string;
  label: string;
  items: CartItem[];
  client: string;
  note: string;
  createdAt: number;
}

const CATEGORY_LABELS: Record<string, string> = {
  all: 'Todo',
  Pieza: 'Tacos',
  Kg: 'Por Kg',
  Bebida: 'Bebidas',
  Paquete: 'Paquetes',
  Extras: 'Acompañamientos',
};

const CATEGORY_EMOJI: Record<string, string> = {
  Pieza: '🌮',
  Kg: '⚖️',
  Bebida: '🥤',
  Paquete: '👨‍👩‍👧‍👦',
  Extras: '🥑',
};

let orderCounter = 0;

export default function VentasView() {
  const [recentTransactions, setRecentTransactions] = useState<Venta[]>([]);
  const [productsList, setProductsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [lastSale, setLastSale] = useState<{
    doc: string;
    client: string;
    items: CartItem[];
    total: number;
    time: string;
  } | null>(null);

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [clientName, setClientName] = useState('');
  const [showMobileCart, setShowMobileCart] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const cartTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Multi-order state
  const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([]);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [showPendingPanel, setShowPendingPanel] = useState(false);
  const [editingOrderLabel, setEditingOrderLabel] = useState<string | null>(null);
  const [editLabelValue, setEditLabelValue] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [salesData, dbProducts] = await Promise.all([
        VentasService.getAll(),
        ProductosService.getAll()
      ]);
      setRecentTransactions(salesData);
      setProductsList(dbProducts || []);
    } catch {
      setProductsList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    if (showSearch && searchRef.current) {
      searchRef.current.focus();
    }
  }, [showSearch]);

  const showToastMsg = useCallback((msg: string) => {
    setToast(msg);
    if (cartTimerRef.current) clearTimeout(cartTimerRef.current);
    cartTimerRef.current = setTimeout(() => setToast(null), 3000);
  }, []);

  // ── Multi-order logic ──

  const currentOrder = useMemo(() => {
    if (!activeOrderId) return null;
    return pendingOrders.find(o => o.id === activeOrderId) || null;
  }, [activeOrderId, pendingOrders]);

  const syncCartWithActiveOrder = useCallback(() => {
    if (!activeOrderId) return;
    setPendingOrders(prev => prev.map(o =>
      o.id === activeOrderId
        ? { ...o, items: [...cart], client: clientName }
        : o
    ));
  }, [activeOrderId, cart, clientName]);

  useEffect(() => {
    syncCartWithActiveOrder();
  }, [cart, clientName, syncCartWithActiveOrder]);

  const createNewOrder = useCallback(() => {
    orderCounter++;
    const newOrder: PendingOrder = {
      id: `ord-${Date.now()}`,
      label: `Mesa ${orderCounter}`,
      items: [],
      client: '',
      note: '',
      createdAt: Date.now(),
    };
    setPendingOrders(prev => [...prev, newOrder]);
    setActiveOrderId(newOrder.id);
    setCart([]);
    setClientName('');
    setShowPendingPanel(false);
    showToastMsg(`Nueva orden: ${newOrder.label}`);
  }, [showToastMsg]);

  const switchOrder = useCallback((orderId: string) => {
    syncCartWithActiveOrder();
    const order = pendingOrders.find(o => o.id === orderId);
    if (order) {
      setActiveOrderId(order.id);
      setCart(order.items);
      setClientName(order.client);
    }
    setShowPendingPanel(false);
  }, [pendingOrders, syncCartWithActiveOrder]);

  const deletePendingOrder = useCallback((orderId: string) => {
    setPendingOrders(prev => prev.filter(o => o.id !== orderId));
    if (activeOrderId === orderId) {
      const remaining = pendingOrders.filter(o => o.id !== orderId);
      if (remaining.length > 0) {
        const next = remaining[0];
        setActiveOrderId(next.id);
        setCart(next.items);
        setClientName(next.client);
      } else {
        setActiveOrderId(null);
        setCart([]);
        setClientName('');
      }
    }
    showToastMsg('Orden eliminada');
  }, [activeOrderId, pendingOrders, showToastMsg]);

  const duplicateOrder = useCallback((orderId: string) => {
    const source = pendingOrders.find(o => o.id === orderId);
    if (!source) return;
    orderCounter++;
    const dup: PendingOrder = {
      ...source,
      id: `ord-${Date.now()}`,
      label: `${source.label} (copia)`,
      createdAt: Date.now(),
    };
    setPendingOrders(prev => [...prev, dup]);
    showToastMsg('Orden duplicada');
  }, [pendingOrders, showToastMsg]);

  const updateOrderLabel = useCallback((orderId: string, label: string) => {
    setPendingOrders(prev => prev.map(o =>
      o.id === orderId ? { ...o, label } : o
    ));
    setEditingOrderLabel(null);
  }, []);

  // ── Cart helpers ──

  const addToCart = useCallback((product: any) => {
    if (!activeOrderId) {
      createNewOrder();
    }
    const numericPrice = typeof product.price === 'number'
      ? product.price
      : parseFloat(String(product.price).replace('$', '')) || 0;

    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { id: product.id, name: product.name, category: product.category, price: numericPrice, qty: 1 }];
    });
  }, [activeOrderId, createNewOrder]);

  const updateQty = useCallback((id: string, delta: number) => {
    setCart(prev =>
      prev
        .map(i => i.id === id ? { ...i, qty: i.qty + delta } : i)
        .filter(i => i.qty > 0)
    );
  }, []);

  const removeFromCart = useCallback((id: string) => setCart(prev => prev.filter(i => i.id !== id)), []);

  const clearCart = useCallback(() => {
    setCart([]);
    setClientName('');
  }, []);

  const cartTotal = useMemo(() => cart.reduce((s, i) => s + i.price * i.qty, 0), [cart]);
  const cartCount = useMemo(() => cart.reduce((s, i) => s + i.qty, 0), [cart]);

  const parseMXN = useCallback((v: any) => parseFloat(String(v).replace('$', '').replace(',', '')) || 0, []);
  const initialCash = 0;
  const totalSalesCash = useMemo(() => recentTransactions.reduce((s, t) => s + parseMXN(t.total), 0), [recentTransactions, parseMXN]);
  const totalInBox = initialCash + totalSalesCash;

  const handleSubmit = async () => {
    if (cart.length === 0) return;
    setSubmitting(true);
    const items = cart.map(i => `${i.qty}x ${i.name}`).join(', ');
    const success = await VentasService.create({
      total: cartTotal,
      method: 'Efectivo',
      items,
      client: clientName || 'Público General'
    });

    if (success) {
      try {
        const { supabase } = await import('@/service/supabase');
        for (const item of cart) {
          if (typeof item.id === 'string' && !item.id.startsWith('def-')) {
            const { data: prod } = await supabase
              .from('products')
              .select('stock')
              .eq('id', item.id)
              .single();

            if (prod && parseFloat(prod.stock) !== -1) {
              const currentStock = parseFloat(prod.stock) || 0;
              const newStock = Math.max(0, currentStock - item.qty);
              const { status } = ProductosService.getStatusAndAccent(newStock);

              await supabase
                .from('products')
                .update({ stock: newStock, status })
                .eq('id', item.id);
            }
          }
        }
      } catch (err) {
        console.error('Error al descontar stock:', err);
      }

      const completedDoc = `TKT-${Math.floor(1000 + Math.random() * 9000)}`;
      const completedTime = new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });

      setLastSale({
        doc: completedDoc,
        client: clientName || 'Público General',
        items: [...cart],
        total: cartTotal,
        time: completedTime
      });

      // Remove completed order from pending
      if (activeOrderId) {
        setPendingOrders(prev => prev.filter(o => o.id !== activeOrderId));
        const remaining = pendingOrders.filter(o => o.id !== activeOrderId);
        if (remaining.length > 0) {
          const next = remaining[0];
          setActiveOrderId(next.id);
          setCart(next.items);
          setClientName(next.client);
        } else {
          setActiveOrderId(null);
          setCart([]);
          setClientName('');
        }
      } else {
        clearCart();
      }

      showToastMsg('¡Venta registrada con éxito!');
      loadData();
    }
    setSubmitting(false);
  };

  const categories = useMemo(
    () => ['all', ...Array.from(new Set(productsList.map(p => p.category)))],
    [productsList]
  );

  const filtered = useMemo(() => {
    return (activeCategory === 'all' ? productsList : productsList.filter(p => p.category === activeCategory))
      .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [activeCategory, productsList, searchQuery]);

  const handleToggleMobileCart = useCallback(() => setShowMobileCart(prev => !prev), []);

  const pendingCount = pendingOrders.length;
  const activeLabel = currentOrder?.label || '';

  return (
    <div className="min-h-screen flex flex-col pb-24 lg:pb-0">
      {toast && (
        <div className="fixed top-4 right-4 z-[60] flex items-center gap-2 bg-green-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-2xl animate-bounce">
          <FiCheckCircle size={16} /> {toast}
        </div>
      )}

      {/* Fixed top bar */}
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
            {/* Pending orders indicator */}
            <button
              onClick={() => setShowPendingPanel(s => !s)}
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
              onClick={() => { setShowSearch(s => !s); }}
              className={`p-2 rounded-lg transition-all cursor-pointer ${
                showSearch
                  ? 'bg-[#FF6701] text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <FiSearch size={16} />
            </button>
            <button
              onClick={loadData}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer"
            >
              <FiRefreshCw size={16} />
            </button>
            <button
              onClick={handleToggleMobileCart}
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

        {/* Active order badge */}
        {activeOrderId && (
          <div className="max-w-6xl mx-auto mt-2 flex items-center gap-2">
            {editingOrderLabel === activeOrderId ? (
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={editLabelValue}
                  onChange={e => setEditLabelValue(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') updateOrderLabel(activeOrderId, editLabelValue);
                    if (e.key === 'Escape') setEditingOrderLabel(null);
                  }}
                  className="w-32 px-2 py-1 rounded-lg border border-[#FF6701] bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-white outline-none"
                  autoFocus
                />
                <button onClick={() => updateOrderLabel(activeOrderId, editLabelValue)} className="text-green-500 cursor-pointer">
                  <FiCheck size={14} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => { setEditingOrderLabel(activeOrderId); setEditLabelValue(currentOrder?.label || ''); }}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF6701]/10 border border-[#FF6701]/30 text-[#FF6701] font-bold text-xs hover:bg-[#FF6701]/20 transition-all cursor-pointer"
              >
                <FiEdit3 size={11} />
                {activeLabel}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Search bar (always visible now) */}
      <div className="px-4 pt-3 pb-0">
        <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 bg-white/70 dark:bg-slate-700/50 transition-all ${
          searchQuery ? 'border-[#FF6701]' : 'border-[#FF6701]/15'
        }`}>
          <FiSearch className="text-base text-[#FF6701] flex-shrink-0" />
          <input
            ref={searchRef}
            type="text"
            placeholder="Buscar productos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent outline-none w-full font-semibold text-sm text-slate-900 dark:text-white"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-600 cursor-pointer flex-shrink-0">
              <FiX size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="px-4 pt-3 grid grid-cols-3 gap-2">
        {[
          { label: 'Apertura', value: initialCash },
          { label: 'Ventas', value: totalSalesCash, accent: true },
          { label: 'Caja', value: totalInBox },
        ].map(stat => (
          <div key={stat.label} className={`rounded-xl p-2.5 border shadow-sm flex flex-col ${stat.accent
            ? 'bg-[#FF6701] border-[#FF6701] text-white shadow-lg'
            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
            }`}>
            <span className={`text-[9px] font-bold uppercase tracking-wider ${stat.accent ? 'text-orange-100' : 'text-slate-400 dark:text-slate-500'}`}>
              {stat.label}
            </span>
            <span className={`text-sm md:text-base font-black mt-0.5 ${stat.accent ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
              ${stat.value.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </span>
          </div>
        ))}
      </div>

      {/* Main POS Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-5 gap-4 px-4 pt-4 max-w-6xl mx-auto w-full">
        {/* ── LEFT: Catalog ── */}
        <div className="lg:col-span-3 flex flex-col gap-3">

          {/* Category Tabs */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none -mx-4 px-4 lg:mx-0 lg:px-0">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
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

          {/* Product Grid */}
          {filtered.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center flex flex-col items-center justify-center gap-2">
              <span className="text-4xl">🌮</span>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">Sin Productos</h3>
              <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                {searchQuery ? 'No hay productos que coincidan con la búsqueda.' : 'Aún no tienes productos en esta categoría.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {filtered.map(product => {
                const inCart = cart.find(i => i.id === product.id);
                const isUnlimited = parseFloat(String(product.stock)) === -1 || String(product.stock).includes('Ilimitado');
                const isOutOfStock = !isUnlimited && parseFloat(String(product.stock)) <= 0;

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
                      onClick={() => addToCart(product)}
                      className="w-full text-left p-3 cursor-pointer touch-manipulation min-h-[80px]"
                    >
                      <span className="text-2xl block mb-1">{CATEGORY_EMOJI[product.category] ?? '🌮'}</span>
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
          )}

          {/* Create new order button at bottom of catalog on mobile */}
          <div className="lg:hidden">
            <button
              onClick={createNewOrder}
              className="w-full py-3 rounded-2xl border-2 border-dashed border-[#FF6701]/40 text-[#FF6701] font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#FF6701]/5 transition-all cursor-pointer touch-manipulation"
            >
              <FiPlusCircle size={16} /> Nueva Orden
            </button>
          </div>
        </div>

        {/* ── RIGHT: Cart + Pending (desktop sidebar) ── */}
        <div className="hidden lg:flex lg:col-span-2 flex-col gap-4">
          {activeOrderId && (
            <CartPanel
              key={activeOrderId}
              cart={cart}
              cartTotal={cartTotal}
              cartCount={cartCount}
              clientName={clientName}
              submitting={submitting}
              orderLabel={activeLabel}
              onUpdateQty={updateQty}
              onRemove={removeFromCart}
              onClear={clearCart}
              onClientChange={setClientName}
              onSubmit={handleSubmit}
              onNewOrder={createNewOrder}
            />
          )}
          {!activeOrderId && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden">
              <div className="p-8 text-center flex flex-col items-center gap-3">
                <FiShoppingCart size={32} className="text-slate-300 dark:text-slate-600" />
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Sin orden activa</p>
                <button
                  onClick={createNewOrder}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#FF6701] to-[#FFA040] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-2"
                >
                  <FiPlusCircle size={16} /> Nueva Orden
                </button>
              </div>
            </div>
          )}
          <PendingOrdersList
            orders={pendingOrders}
            activeOrderId={activeOrderId}
            onSwitch={switchOrder}
            onDelete={deletePendingOrder}
            onDuplicate={duplicateOrder}
          />
          {pendingCount === 0 && (
            <RecentSales transactions={recentTransactions} loading={loading} />
          )}
        </div>
      </div>

      {/* ── MOBILE BOTTOM BAR ── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shadow-2xl">
        <div className="flex">
          <button
            onClick={() => setShowPendingPanel(s => !s)}
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
            onClick={handleToggleMobileCart}
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

      {/* ── MOBILE PENDING ORDERS PANEL ── */}
      {showPendingPanel && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setShowPendingPanel(false)} />
          <div className="relative mt-auto bg-white dark:bg-slate-900 rounded-t-3xl shadow-2xl max-h-[70vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
              <h2 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <FiClock /> Órdenes pendientes
                {pendingCount > 0 && (
                  <span className="bg-[#FF6701] text-white text-[11px] font-black px-2 py-0.5 rounded-full">{pendingCount}</span>
                )}
              </h2>
              <div className="flex items-center gap-2">
                <button onClick={createNewOrder} className="text-xs font-bold text-[#FF6701] flex items-center gap-1 hover:underline cursor-pointer">
                  <FiPlus size={14} /> Nueva
                </button>
                <button onClick={() => setShowPendingPanel(false)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
                  <FiX size={18} className="text-slate-400" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
              {pendingOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-slate-300 dark:text-slate-600 gap-2">
                  <FiAlertCircle size={24} />
                  <p className="text-xs font-semibold">Sin órdenes pendientes</p>
                </div>
              ) : (
                pendingOrders.map(order => (
                  <div
                    key={order.id}
                    className={`p-3 rounded-xl border-2 transition-all cursor-pointer ${
                      order.id === activeOrderId
                        ? 'border-[#FF6701] bg-[#FF6701]/5 shadow-md'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50'
                    }`}
                    onClick={() => switchOrder(order.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-bold text-sm text-slate-800 dark:text-white truncate">{order.label}</span>
                        {order.id === activeOrderId && (
                          <span className="text-[9px] font-bold text-[#FF6701] bg-[#FF6701]/10 px-1.5 py-0.5 rounded-full">Activa</span>
                        )}
                      </div>
                      <span className="text-xs font-black text-[#FF6701] flex-shrink-0 ml-2">
                        ${order.items.reduce((s, i) => s + i.price * i.qty, 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-[10px] text-slate-400">
                        {order.items.reduce((s, i) => s + i.qty, 0)} artículos
                        {order.client ? ` · ${order.client}` : ''}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); duplicateOrder(order.id); }}
                          className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                          title="Duplicar"
                        >
                          <FiCopy size={11} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); deletePendingOrder(order.id); }}
                          className="p-1 rounded text-red-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer"
                          title="Eliminar"
                        >
                          <FiTrash2 size={11} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── MOBILE CART SHEET ── */}
      {showMobileCart && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setShowMobileCart(false)} />
          <div className="relative mt-auto bg-white dark:bg-slate-900 rounded-t-3xl shadow-2xl max-h-[85vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
              <h2 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
                🧾 {activeLabel || 'Pedido'}
                {cartCount > 0 && (
                  <span className="bg-[#FF6701] text-white text-[11px] font-black px-2 py-0.5 rounded-full">{cartCount}</span>
                )}
              </h2>
              <button onClick={() => setShowMobileCart(false)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
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
                      <button onClick={() => updateQty(item.id, -1)} className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-red-100 hover:text-red-500 transition-colors cursor-pointer touch-manipulation">
                        <FiMinus size={12} />
                      </button>
                      <span className="text-sm font-black text-slate-800 dark:text-white w-5 text-center">{item.qty}</span>
                      <button onClick={() => updateQty(item.id, +1)} className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-green-100 hover:text-green-500 transition-colors cursor-pointer touch-manipulation">
                        <FiPlus size={12} />
                      </button>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-600 transition-colors cursor-pointer ml-1">
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
                    onChange={e => setClientName(e.target.value)}
                    placeholder="Cliente (opcional)"
                    className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#FF6701]/60 transition-colors"
                  />
                </div>
                <button
                  onClick={handleSubmit}
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
                <button onClick={clearCart} className="w-full py-2.5 rounded-xl border border-red-200 dark:border-red-800 text-red-500 font-bold text-xs hover:bg-red-50 dark:hover:bg-red-900/20 transition-all cursor-pointer text-center">
                  <FiTrash2 size={12} className="inline mr-1" /> Limpiar carrito
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── MODAL TICKET ───────────────────────────────── */}
      {lastSale && (
        <div className="fixed inset-0 bg-slate-900/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:hidden">
          <div className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-6 flex flex-col items-center">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <FiCheckCircle size={28} className="animate-pulse" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-2">¡Venta Registrada!</h3>
              <p className="text-[11px] text-slate-400">El ticket ha sido generado.</p>
            </div>
            <div className="w-full bg-white text-slate-800 p-5 rounded-2xl shadow-inner border-t-4 border-[#FF6701] font-mono text-[11px] space-y-3 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-[radial-gradient(circle_at_bottom,_transparent_2px,_white_3px)] bg-[length:8px_8px] bg-repeat-x" />
              <div className="text-center">
                <h4 className="font-extrabold text-sm tracking-widest text-slate-900">CARNITAS POS</h4>
                <p className="text-[10px] text-slate-500">"Los Amigos"</p>
                <p className="text-[9px] text-slate-400">Sucursal Central</p>
              </div>
              <div className="border-t border-dashed border-slate-200 pt-2 space-y-1">
                <p><b>Folio:</b> {lastSale.doc}</p>
                <p><b>Fecha:</b> {new Date().toLocaleDateString('es-MX')} {lastSale.time}</p>
                <p><b>Cliente:</b> {lastSale.client}</p>
              </div>
              <div className="border-t border-dashed border-slate-200 pt-2">
                <table className="w-full text-left text-[10px]">
                  <thead>
                    <tr className="border-b border-dashed border-slate-200">
                      <th className="pb-1">Cant.</th>
                      <th className="pb-1">Producto</th>
                      <th className="pb-1 text-right">Importe</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lastSale.items.map(item => (
                      <tr key={item.id}>
                        <td className="py-1">{item.qty}x</td>
                        <td className="py-1 truncate max-w-[120px]">{item.name}</td>
                        <td className="py-1 text-right">${(item.price * item.qty).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="border-t border-dashed border-slate-200 pt-2 flex justify-between text-xs font-bold text-slate-950">
                <span>TOTAL:</span>
                <span>${lastSale.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="border-t border-dashed border-slate-200 pt-3 text-center space-y-0.5 text-[9px] text-slate-400">
                <p className="font-bold text-slate-600">¡Gracias por su preferencia!</p>
                <p>Hecho con mucho amor</p>
              </div>
            </div>
            <div className="w-full space-y-2.5">
              <button onClick={() => window.print()} className="w-full py-3 rounded-xl bg-gradient-to-r from-[#FF6701] to-[#FFA82F] text-white font-bold text-sm shadow-lg hover:shadow-xl hover:translate-y-[-1px] transition-all flex items-center justify-center gap-2 cursor-pointer">
                🖨️ Imprimir Ticket
              </button>
              <button onClick={() => setLastSale(null)} className="w-full py-2.5 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-200 font-extrabold text-xs hover:bg-slate-50 dark:hover:bg-slate-600 transition-all cursor-pointer text-center">
                Continuar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── TICKET TÉRMICO OCULTO ──────────────────────── */}
      <div id="thermal-receipt" className="hidden">
        {lastSale && (
          <div className="receipt-container">
            <h2 className="receipt-title">CARNITAS POS</h2>
            <p className="receipt-subtitle">"Los Amigos"</p>
            <p className="receipt-subtitle">Sucursal Central</p>
            <div className="receipt-divider">================================</div>
            <p className="receipt-text"><b>Folio:</b> {lastSale.doc}</p>
            <p className="receipt-text"><b>Fecha:</b> {new Date().toLocaleDateString('es-MX')} {lastSale.time}</p>
            <p className="receipt-text"><b>Cliente:</b> {lastSale.client}</p>
            <div className="receipt-divider">--------------------------------</div>
            <table className="receipt-table">
              <thead>
                <tr>
                  <th className="text-left" style={{ width: '15%' }}>Cant</th>
                  <th className="text-left" style={{ width: '60%' }}>Producto</th>
                  <th className="text-right" style={{ width: '25%' }}>Importe</th>
                </tr>
              </thead>
              <tbody>
                {lastSale.items.map(item => (
                  <tr key={item.id}>
                    <td>{item.qty}x</td>
                    <td>{item.name}</td>
                    <td className="text-right">${(item.price * item.qty).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="receipt-divider">--------------------------------</div>
            <div className="receipt-total" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
              <b>TOTAL:</b>
              <b>${lastSale.total.toFixed(2)}</b>
            </div>
            <div className="receipt-divider">================================</div>
            <p className="receipt-footer">¡Gracias por su preferencia!</p>
            <p className="receipt-footer">Hecho con mucho amor</p>
          </div>
        )}
      </div>

      <style>{`
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
        @media print {
          body * { visibility: hidden !important; background: none !important; box-shadow: none !important; }
          #thermal-receipt, #thermal-receipt * { visibility: visible !important; }
          #thermal-receipt { display: block !important; position: absolute !important; left: 0 !important; top: 0 !important; width: 80mm !important; padding: 2mm 4mm !important; font-family: 'Courier New', Courier, monospace !important; font-size: 12px !important; color: #000 !important; background: #fff !important; }
          .receipt-container { width: 100% !important; }
          .receipt-title { text-align: center !important; font-size: 16px !important; font-weight: bold !important; margin: 0 0 2px 0 !important; }
          .receipt-subtitle { text-align: center !important; font-size: 11px !important; margin: 0 0 3px 0 !important; }
          .receipt-divider { text-align: center !important; margin: 5px 0 !important; letter-spacing: -1px !important; font-weight: bold !important; }
          .receipt-text { margin: 2px 0 !important; font-size: 11px !important; line-height: 1.2 !important; }
          .receipt-table { width: 100% !important; border-collapse: collapse !important; font-size: 11px !important; margin-top: 4px !important; }
          .receipt-table th, .receipt-table td { padding: 2px 0 !important; line-height: 1.2 !important; }
          .receipt-total { font-size: 14px !important; font-weight: bold !important; }
          .receipt-footer { text-align: center !important; font-size: 10px !important; margin: 4px 0 0 0 !important; font-weight: bold !important; }
        }
      `}</style>
    </div>
  );
}

/* ── Cart Panel (desktop) ── */
function CartPanel({
  cart, cartTotal, cartCount, clientName, submitting, orderLabel,
  onUpdateQty, onRemove, onClear, onClientChange, onSubmit, onNewOrder
}: {
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
  onNewOrder: () => void;
}) {
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
              <span className="text-lg">{item.category === 'Pieza' ? '🌮' : CATEGORY_EMOJI[item.category] ?? '🍽️'}</span>
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

/* ── Pending Orders List ── */
function PendingOrdersList({
  orders, activeOrderId, onSwitch, onDelete, onDuplicate
}: {
  orders: PendingOrder[];
  activeOrderId: string | null;
  onSwitch: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
}) {
  if (orders.length === 0) return null;
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
        <h3 className="text-xs font-extrabold text-slate-800 dark:text-white flex items-center gap-1.5">
          <FiClock size={12} /> Órdenes pendientes
          <span className="bg-[#FF6701] text-white text-[9px] font-black px-1.5 py-0.5 rounded-full ml-1">{orders.length}</span>
        </h3>
      </div>
      <div className="divide-y divide-slate-50 dark:divide-slate-800 max-h-48 overflow-y-auto">
        {orders.map(order => {
          const total = order.items.reduce((s, i) => s + i.price * i.qty, 0);
          const itemCount = order.items.reduce((s, i) => s + i.qty, 0);
          const isActive = order.id === activeOrderId;
          return (
            <div
              key={order.id}
              className={`px-4 py-2.5 cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/30 ${
                isActive ? 'bg-[#FF6701]/5 border-l-2 border-[#FF6701]' : 'border-l-2 border-transparent'
              }`}
              onClick={() => onSwitch(order.id)}
            >
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                  {order.label}
                  {isActive && <span className="text-[8px] text-[#FF6701] font-black">●</span>}
                </p>
                <span className="text-[11px] font-black text-[#FF6701]">
                  ${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex items-center justify-between mt-0.5">
                <span className="text-[9px] text-slate-400">{itemCount} artículos{order.client ? ` · ${order.client}` : ''}</span>
                <div className="flex items-center gap-0.5">
                  <button onClick={(e) => { e.stopPropagation(); onDuplicate(order.id); }}
                    className="p-1 rounded text-slate-300 hover:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                    title="Duplicar">
                    <FiCopy size={10} />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); onDelete(order.id); }}
                    className="p-1 rounded text-red-200 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer"
                    title="Eliminar">
                    <FiTrash2 size={10} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Recent Sales ── */
function RecentSales({ transactions, loading }: { transactions: Venta[]; loading: boolean }) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
        <h3 className="text-xs font-extrabold text-slate-800 dark:text-white">Últimas ventas</h3>
      </div>
      <div className="divide-y divide-slate-50 dark:divide-slate-800 max-h-48 overflow-y-auto">
        {loading ? (
          <p className="text-xs text-center text-slate-400 font-bold py-5">Cargando...</p>
        ) : transactions.length === 0 ? (
          <p className="text-xs text-center text-slate-400 font-semibold py-5">Sin ventas aún.</p>
        ) : (
          transactions.slice(0, 6).map(t => (
            <div key={t.id} className="px-4 py-2.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-slate-800 dark:text-white">{t.doc}</p>
                <p className="text-[9px] text-slate-400 truncate max-w-[160px]">{t.time} · {t.items}</p>
              </div>
              <p className="text-xs font-black text-[#FF6701] flex-shrink-0">
                {typeof t.total === 'number' ? `$${t.total.toFixed(2)}` : t.total}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}