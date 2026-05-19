'use client';

import { useEffect, useState } from 'react';
import {
  FiDollarSign, FiTrash2, FiPlusCircle, FiMinus, FiPlus,
  FiSmartphone, FiAlertCircle, FiCheckCircle,
  FiRefreshCw, FiUser
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

  // Catalog state
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // Cart state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [clientName, setClientName] = useState('');

  const loadData = async () => {
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
  };

  useEffect(() => { loadData(); }, []);

  // ─── Cart helpers ────────────────────────────────────────────────
  const addToCart = (product: any) => {
    // Parsear el precio a número de forma segura (removiendo el símbolo '$' si viene de la DB)
    const numericPrice = typeof product.price === 'number' 
      ? product.price 
      : parseFloat(String(product.price).replace('$', '')) || 0;

    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { id: product.id, name: product.name, category: product.category, price: numericPrice, qty: 1 }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart(prev =>
      prev
        .map(i => i.id === id ? { ...i, qty: i.qty + delta } : i)
        .filter(i => i.qty > 0)
    );
  };

  const removeFromCart = (id: string) => setCart(prev => prev.filter(i => i.id !== id));

  const clearCart = () => {
    setCart([]);
    setClientName('');
  };

  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  // ─── Stats ───────────────────────────────────────────────────────
  const parseMXN = (v: any) => parseFloat(String(v).replace('$', '').replace(',', '')) || 0;
  const initialCash = 0; // Caja Inicial por defecto
  const totalSalesCash = recentTransactions.reduce((s, t) => s + parseMXN(t.total), 0);
  const totalInBox = initialCash + totalSalesCash;

  // ─── Submit ──────────────────────────────────────────────────────
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
      // DESCUENTO AUTOMÁTICO DE INVENTARIO
      try {
        const { supabase } = await import('@/service/supabase');
        for (const item of cart) {
          // Buscamos si es un producto real de Supabase (no mock de pruebas)
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

      clearCart();
      showToast('¡Venta registrada con éxito!');
      loadData();
    }
    setSubmitting(false);
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // ─── Filtered products ───────────────────────────────────────────
  const categories = ['all', ...Array.from(new Set(productsList.map(p => p.category)))];
  const filtered = activeCategory === 'all' ? productsList : productsList.filter(p => p.category === activeCategory);

  // ─── Render ──────────────────────────────────────────────────────
  return (
    <div className="space-y-6 relative">

      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2 bg-green-600 text-white text-sm font-semibold px-5 py-3 rounded-2xl shadow-2xl animate-bounce">
          <FiCheckCircle /> {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2 md:gap-3">
            <span className="p-2 md:p-2.5 rounded-xl bg-[#FF6701] text-white shadow-md text-lg md:text-xl">
              <FiDollarSign />
            </span>
            Punto de Venta
          </h1>
          <p className="mt-1 text-xs md:text-sm text-slate-500 dark:text-slate-400">
            Selecciona productos del catálogo y regístralos en el carrito.
          </p>
        </div>
        <button
          onClick={loadData}
          className="flex items-center gap-2 text-xs font-bold px-3 md:px-4 py-2 md:py-2.5 rounded-xl border border-[#FF6701]/30 text-[#FF6701] hover:bg-[#FF6701]/10 transition-all cursor-pointer w-full md:w-auto justify-center md:justify-start"
        >
          <FiRefreshCw size={14} /> Recargar
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
        {[
          { label: 'Caja Inicial (Apertura)', value: initialCash, info: 'Fondo fijo de cambio', accent: false },
          { label: 'Ventas del Turno', value: totalSalesCash, info: `${recentTransactions.length} transacciones`, accent: true },
          { label: 'Efectivo Total en Caja', value: totalInBox, info: 'Arqueo teórico esperado', accent: false },
        ].map(stat => (
          <div key={stat.label} className={`rounded-2xl p-4 md:p-5 border shadow-sm flex flex-col gap-1 ${stat.accent
            ? 'bg-[#FF6701] border-[#FF6701] text-white shadow-lg'
            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
            }`}>
            <span className={`text-[10px] md:text-[11px] font-bold uppercase tracking-widest ${stat.accent ? 'text-orange-100' : 'text-slate-400 dark:text-slate-500'}`}>
              {stat.label}
            </span>
            <span className={`text-lg md:text-2xl font-black ${stat.accent ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
              ${stat.value.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </span>
            <span className={`text-[10px] md:text-[11px] font-semibold ${stat.accent ? 'text-orange-200' : 'text-slate-400'}`}>
              {stat.info}
            </span>
          </div>
        ))}
      </div>

      {/* Main POS Area */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 md:gap-6">

        {/* ── LEFT: Catalog ── */}
        <div className="lg:col-span-3 flex flex-col gap-4">

          {/* Category Tabs */}
          <div className="flex gap-2 flex-wrap">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide border transition-all cursor-pointer ${activeCategory === cat
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
            <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center flex flex-col items-center justify-center gap-3">
              <span className="text-4xl">🌮</span>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">Sin Productos en esta Categoría</h3>
              <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                Aún no tienes productos creados en esta pestaña. Agrega tus tacos, refrescos o paquetes desde la sección de <strong>Productos</strong>.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filtered.map(product => {
                const inCart = cart.find(i => i.id === product.id);
                // Si el stock es -1, mostramos que es ilimitado
                const isUnlimited = parseFloat(String(product.stock)) === -1 || String(product.stock).includes('Ilimitado');
                const isOutOfStock = !isUnlimited && parseFloat(String(product.stock)) <= 0;
                
                return (
                  <button
                    key={product.id}
                    disabled={isOutOfStock}
                    onClick={() => addToCart(product)}
                    className={`relative text-left p-4 rounded-2xl border-2 transition-all cursor-pointer group ${isOutOfStock 
                      ? 'opacity-40 cursor-not-allowed border-slate-100 bg-slate-50 dark:bg-slate-800/20 dark:border-slate-800' 
                      : inCart
                        ? 'border-[#FF6701] bg-[#FF6701]/5 dark:bg-[#FF6701]/10 shadow-md'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-[#FF6701]/50 hover:shadow-md'
                    }`}
                  >
                    {/* Badge de cantidad en carrito */}
                    {inCart && (
                      <span className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-[#FF6701] text-white text-[10px] font-black flex items-center justify-center shadow">
                        {inCart.qty}
                      </span>
                    )}
                    <span className="text-3xl block mb-2">{CATEGORY_EMOJI[product.category] ?? '🌮'}</span>
                    <p className="text-sm font-bold text-slate-850 dark:text-white leading-tight">{product.name}</p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{product.category}</p>
                    
                    <div className="flex justify-between items-end mt-3">
                      <p className="text-base font-black text-[#FF6701]">
                        {typeof product.price === 'number' ? `$${product.price.toFixed(2)}` : product.price}
                      </p>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                        isUnlimited 
                          ? 'bg-green-500/10 text-green-600' 
                          : isOutOfStock 
                            ? 'bg-rose-500/10 text-rose-600' 
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                      }`}>
                        {isOutOfStock ? 'Agotado' : isUnlimited ? 'Ilimitado' : product.stock}
                      </span>
                    </div>

                    {/* Hover overlay */}
                    <div className={`absolute inset-0 rounded-2xl flex items-center justify-center bg-[#FF6701]/90 opacity-0 group-hover:opacity-100 transition-opacity ${inCart || isOutOfStock ? 'hidden' : ''}`}>
                      <FiPlusCircle className="text-white text-3xl" />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ── RIGHT: Cart ── */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl overflow-hidden flex flex-col">

            {/* Cart Header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h2 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
                🧾 Pedido actual
                {cartCount > 0 && (
                  <span className="bg-[#FF6701] text-white text-[11px] font-black px-2 py-0.5 rounded-full">{cartCount}</span>
                )}
              </h2>
              {cart.length > 0 && (
                <button onClick={clearCart} className="text-[11px] text-red-400 hover:text-red-600 font-semibold flex items-center gap-1 cursor-pointer transition-colors">
                  <FiTrash2 size={12} /> Limpiar
                </button>
              )}
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 max-h-[280px]">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-slate-300 dark:text-slate-600 gap-2">
                  <FiAlertCircle size={28} />
                  <p className="text-xs font-semibold">Selecciona productos del catálogo</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 group">
                    <span className="text-xl">{CATEGORY_EMOJI[item.category] ?? '🍽️'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{item.name}</p>
                      <p className="text-[11px] text-slate-400">${(item.price * item.qty).toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => updateQty(item.id, -1)}
                        className="w-6 h-6 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-red-100 hover:text-red-500 transition-colors cursor-pointer"
                      >
                        <FiMinus size={10} />
                      </button>
                      <span className="text-xs font-black text-slate-800 dark:text-white w-4 text-center">{item.qty}</span>
                      <button
                        onClick={() => updateQty(item.id, +1)}
                        className="w-6 h-6 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-green-100 hover:text-green-500 transition-colors cursor-pointer"
                      >
                        <FiPlus size={10} />
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-all cursor-pointer ml-1"
                    >
                      <FiTrash2 size={13} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Total Bar */}
            <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total</span>
                <span className="text-2xl font-black text-[#FF6701]">
                  ${cartTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Payment + Client */}
            <div className="px-6 py-4 space-y-4 border-t border-slate-100 dark:border-slate-800">

              {/* Cliente */}
              <div className="relative">
                <FiUser size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={clientName}
                  onChange={e => setClientName(e.target.value)}
                  placeholder="Nombre de Cliente (Opcional)"
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#FF6701]/60 transition-colors"
                />
              </div>

              {/* Cobrar button */}
              <button
                onClick={handleSubmit}
                disabled={cart.length === 0 || submitting}
                className="w-full py-4 rounded-2xl font-black text-base text-white flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                style={{ background: cart.length > 0 ? 'linear-gradient(135deg, #FF6701, #FFA040)' : '#ccc' }}
              >
                {submitting ? (
                  <><FiRefreshCw className="animate-spin" size={16} /> Procesando…</>
                ) : (
                  <><FiCheckCircle size={18} /> Registrar Venta — ${cartTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</>
                )}
              </button>
            </div>
          </div>

          {/* Recent Sales */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-extrabold text-slate-800 dark:text-white">Últimas ventas del turno</h3>
            </div>
            <div className="divide-y divide-slate-50 dark:divide-slate-800 max-h-52 overflow-y-auto">
              {loading ? (
                <p className="text-xs text-center text-slate-400 font-bold py-6">Cargando...</p>
              ) : recentTransactions.length === 0 ? (
                <p className="text-xs text-center text-slate-400 font-semibold py-6">Sin ventas aún.</p>
              ) : (
                recentTransactions.slice(0, 8).map(t => (
                  <div key={t.id} className="px-5 py-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-white">{t.doc}</p>
                      <p className="text-[10px] text-slate-400">{t.time} · {t.items}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-[#FF6701]">
                        {typeof t.total === 'number' ? `$${t.total.toFixed(2)}` : t.total}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Las sentencias de modal y de impresión van aquí, dentro del div principal wrapper */}

      {/* ─── MODAL TICKET DE COMPRA ───────────────────────────────── */}
      {lastSale && (
        <div className="fixed inset-0 bg-slate-900/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:hidden">
          <div className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-6 flex flex-col items-center">
            
            {/* Encabezado éxito */}
            <div className="text-center space-y-1">
              <div className="w-12 h-12 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <FiCheckCircle size={28} className="animate-pulse" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-2">¡Venta Registrada con Éxito!</h3>
              <p className="text-[11px] text-slate-400">El ticket de compra ha sido generado.</p>
            </div>

            {/* Vista Previa del Ticket (Skeuomorphic Paper Receipt) */}
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

            {/* Acciones */}
            <div className="w-full space-y-2.5">
              <button
                onClick={() => window.print()}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#FF6701] to-[#FFA82F] text-white font-bold text-sm shadow-lg hover:shadow-xl hover:translate-y-[-1px] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                🖨️ Imprimir Ticket (Impresora)
              </button>
              <button
                onClick={() => setLastSale(null)}
                className="w-full py-2.5 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-200 font-extrabold text-xs hover:bg-slate-50 dark:hover:bg-slate-600 transition-all cursor-pointer text-center"
              >
                Empezar Nueva Venta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── TICKET TÉRMICO OCULTO PARA IMPRESIÓN DIRECTA ─────────── */}
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

      {/* Estilos CSS específicos de impresión */}
      <style>{`
        @media print {
          /* Ocultar todo el sitio principal */
          body * {
            visibility: hidden !important;
            background: none !important;
            box-shadow: none !important;
          }
          /* Mostrar únicamente el contenedor de ticket térmico */
          #thermal-receipt, #thermal-receipt * {
            visibility: visible !important;
          }
          #thermal-receipt {
            display: block !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 80mm !important;
            padding: 2mm 4mm !important;
            font-family: 'Courier New', Courier, monospace !important;
            font-size: 12px !important;
            color: #000 !important;
            background: #fff !important;
          }
          .receipt-container {
            width: 100% !important;
          }
          .receipt-title {
            text-align: center !important;
            font-size: 16px !important;
            font-weight: bold !important;
            margin: 0 0 2px 0 !important;
          }
          .receipt-subtitle {
            text-align: center !important;
            font-size: 11px !important;
            margin: 0 0 3px 0 !important;
          }
          .receipt-divider {
            text-align: center !important;
            margin: 5px 0 !important;
            letter-spacing: -1px !important;
            font-weight: bold !important;
          }
          .receipt-text {
            margin: 2px 0 !important;
            font-size: 11px !important;
            line-height: 1.2 !important;
          }
          .receipt-table {
            width: 100% !important;
            border-collapse: collapse !important;
            font-size: 11px !important;
            margin-top: 4px !important;
          }
          .receipt-table th, .receipt-table td {
            padding: 2px 0 !important;
            line-height: 1.2 !important;
          }
          .receipt-total {
            font-size: 14px !important;
            font-weight: bold !important;
          }
          .receipt-footer {
            text-align: center !important;
            font-size: 10px !important;
            margin: 4px 0 0 0 !important;
            font-weight: bold !important;
          }
        }
      `}</style>
    </div>
  );
}