'use client';

import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { FiPlusCircle } from 'react-icons/fi';
import { VentasService, Venta } from '@/service/ventas';
import { ProductosService } from '@/service/productos';
import type { CartItem, PendingOrder, LastSale } from './types';

import ToastNotification from './components/ToastNotification';
import TopBar from './components/TopBar';
import ActiveOrderBadge from './components/ActiveOrderBadge';
import SearchBar from './components/SearchBar';
import StatsRow from './components/StatsRow';
import CategoryTabs from './components/CategoryTabs';
import ProductGrid from './components/ProductGrid';
import MobileBottomBar from './components/MobileBottomBar';
import MobilePendingPanel from './components/MobilePendingPanel';
import MobileCartSheet from './components/MobileCartSheet';
import TicketModal from './components/TicketModal';
import CartPanel from './components/CartPanel';
import PendingOrdersList from './components/PendingOrdersList';
import RecentSales from './components/RecentSales';

let orderCounter = 0;

export default function VentasView() {
  const [recentTransactions, setRecentTransactions] = useState<Venta[]>([]);
  const [productsList, setProductsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [lastSale, setLastSale] = useState<LastSale | null>(null);

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [clientName, setClientName] = useState('');
  const [showMobileCart, setShowMobileCart] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const cartTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

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
  const clearCart = useCallback(() => { setCart([]); setClientName(''); }, []);

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
  const handleToggleSearch = useCallback(() => setShowSearch(s => !s), []);
  const handleTogglePendingPanel = useCallback(() => setShowPendingPanel(s => !s), []);

  const pendingCount = pendingOrders.length;
  const activeLabel = currentOrder?.label || '';

  const handleStartEditLabel = useCallback(() => {
    setEditingOrderLabel(activeOrderId);
    setEditLabelValue(currentOrder?.label || '');
  }, [activeOrderId, currentOrder]);

  const handleSaveLabel = useCallback(() => {
    if (activeOrderId) updateOrderLabel(activeOrderId, editLabelValue);
  }, [activeOrderId, editLabelValue, updateOrderLabel]);

  return (
    <div className="min-h-screen flex flex-col pb-24 lg:pb-0">
      <ToastNotification toast={toast} />

      <TopBar
        pendingCount={pendingCount}
        showPendingPanel={showPendingPanel}
        onTogglePendingPanel={handleTogglePendingPanel}
        showSearch={showSearch}
        onToggleSearch={handleToggleSearch}
        onRefresh={loadData}
        cartCount={cartCount}
        onToggleMobileCart={handleToggleMobileCart}
      />

      <ActiveOrderBadge
        activeOrderId={activeOrderId}
        editingOrderLabel={editingOrderLabel}
        editLabelValue={editLabelValue}
        onEditLabelChange={setEditLabelValue}
        onStartEdit={handleStartEditLabel}
        onCancelEdit={() => setEditingOrderLabel(null)}
        onSaveLabel={handleSaveLabel}
        activeLabel={activeLabel}
      />

      <SearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onClear={() => setSearchQuery('')}
        inputRef={searchRef}
      />

      <StatsRow
        initialCash={initialCash}
        totalSalesCash={totalSalesCash}
        totalInBox={totalInBox}
      />

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-5 gap-4 px-4 pt-4 max-w-6xl mx-auto w-full">
        <div className="lg:col-span-3 flex flex-col gap-3">
          <CategoryTabs
            categories={categories}
            activeCategory={activeCategory}
            onSelect={setActiveCategory}
          />

          <ProductGrid
            products={filtered}
            cart={cart}
            onAddToCart={addToCart}
            searchQuery={searchQuery}
          />

          <div className="lg:hidden">
            <button
              onClick={createNewOrder}
              className="w-full py-3 rounded-2xl border-2 border-dashed border-[#FF6701]/40 text-[#FF6701] font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#FF6701]/5 transition-all cursor-pointer touch-manipulation"
            >
              <FiPlusCircle size={16} /> Nueva Orden
            </button>
          </div>
        </div>

        <div className="hidden lg:flex lg:col-span-2 flex-col gap-4">
          {activeOrderId ? (
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
            />
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden">
              <div className="p-8 text-center flex flex-col items-center gap-3">
                <FiPlusCircle size={32} className="text-slate-300 dark:text-slate-600" />
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

      <MobileBottomBar
        showPendingPanel={showPendingPanel}
        onTogglePendingPanel={handleTogglePendingPanel}
        onToggleMobileCart={handleToggleMobileCart}
        pendingCount={pendingCount}
        cartCount={cartCount}
      />

      <MobilePendingPanel
        show={showPendingPanel}
        orders={pendingOrders}
        activeOrderId={activeOrderId}
        onClose={() => setShowPendingPanel(false)}
        onSwitch={switchOrder}
        onNewOrder={createNewOrder}
        onDuplicate={duplicateOrder}
        onDelete={deletePendingOrder}
      />

      <MobileCartSheet
        show={showMobileCart}
        cart={cart}
        cartTotal={cartTotal}
        cartCount={cartCount}
        clientName={clientName}
        submitting={submitting}
        activeLabel={activeLabel}
        onClose={() => setShowMobileCart(false)}
        onClientChange={setClientName}
        onUpdateQty={updateQty}
        onRemove={removeFromCart}
        onClear={clearCart}
        onSubmit={handleSubmit}
      />

      <TicketModal
        lastSale={lastSale}
        onClose={() => setLastSale(null)}
      />
    </div>
  );
}
