'use client';

import { useEffect, useState } from 'react';
import {
  FiPackage, FiTrash2, FiPlus, FiAlertCircle,
  FiCheckCircle, FiX, FiDollarSign, FiTag,
  FiLayers, FiBox, FiToggleLeft, FiHash
} from 'react-icons/fi';
import { ProductosService, Product } from '@/service/productos';

// ─── Catálogo de categorías ────────────────────────────────────────────────
const CATEGORIAS = [
  { value: 'Taco', label: 'Taco', emoji: '🌮', desc: 'Tacos individuales por pieza' },
  { value: 'Corte', label: 'Corte / Kg', emoji: '🥩', desc: 'Venta por kilogramo' },
  { value: 'Bebida', label: 'Bebida', emoji: '🥤', desc: 'Refrescos, aguas, etc.' },
  { value: 'Complemento', label: 'Complemento', emoji: '🫙', desc: 'Salsas, tortillas, extras' },
  { value: 'Combo', label: 'Combo / Paquete', emoji: '📦', desc: 'Combos o paquetes especiales' },
  { value: 'Otro', label: 'Otro', emoji: '🍽️', desc: 'Cualquier otro producto' },
];

const UNIDADES = ['Pieza', 'Kg', 'Litro', 'Porción', 'Paquete', 'Gramo', 'Caja'];

const UNIDAD_DEFAULT: Record<string, string> = {
  Taco: 'Pieza', Corte: 'Kg', Bebida: 'Pieza',
  Complemento: 'Pieza', Combo: 'Paquete', Otro: 'Pieza',
};

// ─── Tipos del formulario extendido ───────────────────────────────────────
interface ProductForm {
  name: string;
  categoria: string;
  unidad: string;
  price: string;
  costPrice: string;
  gain: string;
  description: string;
  trackStock: boolean;
  stock: string;
  minStock: string;
  sku: string;
}

const emptyForm = (): ProductForm => ({
  name: '', categoria: 'Taco', unidad: 'Pieza',
  price: '', costPrice: '', gain: '', description: '',
  trackStock: false, stock: '', minStock: '',
  sku: '',
});

export default function ProductosView() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState<ProductForm>(emptyForm());
  const [step, setStep] = useState<1 | 2>(1);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const [isAdmin, setIsAdmin] = useState(false);

  async function loadProducts() {
    setLoading(true);
    try { setProducts(await ProductosService.getAll()); }
    catch { /* silent */ }
    finally { setLoading(false); }
  }

  useEffect(() => {
    loadProducts();
    const role = localStorage.getItem('user_role');
    setIsAdmin(role === 'admin');
  }, []);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const openModal = () => { setForm(emptyForm()); setStep(1); setIsModalOpen(true); };
  const closeModal = () => setIsModalOpen(false);

  const setField = <K extends keyof ProductForm>(key: K, val: ProductForm[K]) =>
    setForm(prev => ({ ...prev, [key]: val }));

  const handleCategorySelect = (cat: string) => {
    setForm(prev => ({ ...prev, categoria: cat, unidad: UNIDAD_DEFAULT[cat] ?? 'Pieza' }));
  };

  // Paso 1 válido si tiene nombre y categoría
  const step1Valid = form.name.trim() !== '' && form.categoria !== '';
  // Paso 2 válido si tiene costo y ganancia, sumando más de cero
  const step2Valid = form.costPrice !== '' && form.gain !== '' && (parseFloat(form.costPrice) + parseFloat(form.gain)) > 0;

  const handleSubmit = async () => {
    if (!step2Valid) return;
    setSubmitting(true);

    const cost = parseFloat(form.costPrice) || 0;
    const gain = parseFloat(form.gain) || 0;
    const calculatedPrice = cost + gain;

    const success = await ProductosService.create({
      name: form.name,
      category: form.unidad,          // campo original del servicio
      price: calculatedPrice,
      stock: form.trackStock ? parseFloat(form.stock) || 0 : -1,
      cost_price: cost
    });

    setSubmitting(false);
    if (success) {
      closeModal();
      showToast('¡Producto registrado con éxito!');
      loadProducts();
    } else {
      showToast('Ocurrió un error al registrar el producto.', 'error');
    }
  };

  const handleDelete = async (id: string | number) => {
    if (!confirm('¿Eliminar este producto?')) return;
    const ok = await ProductosService.delete(id);
    if (ok) { showToast('Producto eliminado.'); loadProducts(); }
    else showToast('No se pudo eliminar.', 'error');
  };

  // Margen de ganancia real calculado en tiempo real
  const margin = form.costPrice && form.gain
    ? ((parseFloat(form.gain) / (parseFloat(form.costPrice) + parseFloat(form.gain))) * 100).toFixed(1)
    : null;

  const totalItems = products.length;
  const lowStock = products.filter(p => p.status === 'Por agotar').length;
  const outOfStock = products.filter(p => p.status === 'Agotado').length;

  // Sumarizar valores de stock para el administrador
  const parseValue = (val: string | number) => typeof val === 'number' ? val : parseFloat(String(val).replace('$', '').replace(',', '')) || 0;
  
  let totalCostValue = 0;
  let totalSaleValue = 0;
  let totalProfitValue = 0;
  
  products.forEach(p => {
    const stockNum = parseFloat(String(p.stock));
    if (stockNum > 0 && stockNum !== -1) {
      const priceNum = parseValue(p.price);
      const costNum = p.cost_price || 0;
      const gainNum = p.gain_price || 0;
      
      totalCostValue += costNum * stockNum;
      totalSaleValue += priceNum * stockNum;
      totalProfitValue += gainNum * stockNum;
    }
  });

  return (
    <div className="space-y-8 relative">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-2 text-white text-sm font-semibold px-5 py-3 rounded-2xl shadow-2xl animate-bounce ${toast.type === 'error' ? 'bg-rose-600' : 'bg-green-600'}`}>
          {toast.type === 'error' ? <FiAlertCircle /> : <FiCheckCircle />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2 md:gap-3">
            <span className="p-2 md:p-2.5 rounded-2xl bg-[#FF6701] text-white shadow-lg text-lg md:text-xl"><FiPackage /></span>
            Inventario de <span style={{ color: '#FF6701', fontStyle: 'italic' }}>Productos</span>
          </h1>
          <p className="mt-2 text-xs md:text-sm text-slate-500 dark:text-slate-400">
            Gestiona tu catálogo, controla el stock disponible y define precios de venta.
          </p>
        </div>
        <button
          onClick={openModal}
          className="px-4 md:px-5 py-2 md:py-3 rounded-2xl text-xs md:text-sm font-bold flex items-center gap-2 text-white shadow-xl border cursor-pointer transition-all hover:-translate-y-0.5 w-full md:w-auto justify-center md:justify-start"
          style={{ background: 'linear-gradient(135deg, #FF6701, #FFA82F)', borderColor: 'rgba(255,103,1,0.3)' }}
        >
          <FiPlus className="text-lg" /> Añadir Producto
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
        {[
          { label: 'Total Artículos', value: `${totalItems}`, icon: <FiPackage />, color: 'text-[#FF6701]', bg: 'bg-[#FF6701]/10' },
          { label: 'Poco Stock', value: `${lowStock}`, icon: <FiAlertCircle />, color: 'text-amber-500', bg: 'bg-amber-500/10' },
          { label: 'Agotados', value: `${outOfStock}`, icon: <FiAlertCircle />, color: 'text-rose-500', bg: 'bg-rose-500/10' },
        ].map(s => (
          <div key={s.label} className="rounded-2xl p-4 md:p-5 bg-[#FCECDD]/80 dark:bg-slate-900/80 border border-[#FF6701]/10 dark:border-slate-800 shadow-xl flex justify-between items-center">
            <div>
              <p className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-slate-400">{s.label}</p>
              <h3 className={`text-xl md:text-2xl font-black mt-1 ${s.color}`}>{loading ? '…' : s.value}</h3>
            </div>
            <span className={`p-2 md:p-2.5 rounded-xl text-lg ${s.bg} ${s.color}`}>{s.icon}</span>
          </div>
        ))}
      </div>

      {/* Admin financial aggregates row */}
      {isAdmin && !loading && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 animate-fadeIn">
          {[
            { label: 'Valor Inventario (Costo)', value: `$${totalCostValue.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, icon: <FiDollarSign />, color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' },
            { label: 'Valor Estimado Venta', value: `$${totalSaleValue.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, icon: <FiDollarSign />, color: 'text-amber-600 bg-amber-500/10 border-amber-500/20' },
            { label: 'Ganancia Estimada Total', value: `$${totalProfitValue.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, icon: <FiCheckCircle />, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
          ].map(s => (
            <div key={s.label} className={`rounded-2xl p-5 bg-white dark:bg-slate-900 border shadow-xl flex justify-between items-center ${s.color}`}>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{s.label}</p>
                <h3 className="text-2xl font-black mt-1 text-slate-800 dark:text-white">{s.value}</h3>
              </div>
              <span className={`p-2.5 rounded-xl text-lg bg-white/70 dark:bg-slate-800 shadow-sm`}>{s.icon}</span>
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="bg-[#FFF5F0]/90 dark:bg-slate-900/90 border border-[#FF6701]/25 rounded-3xl p-4 md:p-6 lg:p-8 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto -mx-4 -mb-4 md:-mx-6 md:-mb-6 lg:-mx-8 lg:-mb-8 rounded-b-3xl bg-[#FF6701]/5 dark:bg-slate-900/50">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-[#FF6701]/10 dark:border-slate-800 text-[10px] md:text-xs font-extrabold uppercase tracking-wider text-slate-400">
                <th className="pb-4 pl-4 md:pl-6">Producto</th>
                <th className="pb-4 hidden md:table-cell">Presentación</th>
                {isAdmin && <th className="pb-4 hidden lg:table-cell text-slate-450">P. Costo</th>}
                {isAdmin && <th className="pb-4 hidden lg:table-cell text-emerald-500">Ganancia</th>}
                <th className="pb-4">P. Venta</th>
                <th className="pb-4 hidden sm:table-cell">Stock</th>
                <th className="pb-4">Estado</th>
                <th className="pb-4 pr-4 md:pr-6 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {loading ? (
                <tr><td colSpan={8} className="py-8 text-center text-slate-400 font-bold animate-pulse text-xs md:text-sm">Cargando productos...</td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan={8} className="py-8 text-center text-slate-400 font-semibold text-xs md:text-sm">No hay productos registrados.</td></tr>
              ) : products.map(p => (
                <tr key={p.id} className="text-xs md:text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-white/40 dark:hover:bg-slate-800/20 transition-colors">
                  <td className="py-4 pl-4 md:pl-6 font-black text-slate-900 dark:text-white">{p.name}</td>
                  <td className="py-4 hidden md:table-cell">{p.category}</td>
                  {isAdmin && <td className="py-4 hidden lg:table-cell text-slate-400 font-bold">${(p.cost_price || 0).toFixed(2)}</td>}
                  {isAdmin && (
                    <td className="py-4 hidden lg:table-cell font-black text-emerald-600 dark:text-emerald-400">
                      +${(p.gain_price || 0).toFixed(2)}
                    </td>
                  )}
                  <td className="py-4 text-[#FF6701] font-black">{p.price}</td>
                  <td className="py-4 hidden sm:table-cell">{p.stock}</td>
                  <td className="py-4">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${p.accent}`}>{p.status}</span>
                  </td>
                  <td className="py-4 pr-4 md:pr-6">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => handleDelete(p.id!)} className="p-2 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all cursor-pointer" title="Eliminar">
                        <FiTrash2 className="text-sm" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── MODAL ──────────────────────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-3 md:p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[95vh] md:max-h-[90vh]">

            {/* Modal Header */}
            <div className="px-5 md:px-7 py-4 md:py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2 md:gap-3">
                <span className="p-2 rounded-xl bg-[#FF6701] text-white shadow text-sm md:text-base"><FiPackage size={14} className="md:w-4 md:h-4" /></span>
                <div>
                  <h2 className="text-sm md:text-base font-extrabold text-slate-900 dark:text-white">Registrar Nuevo Producto</h2>
                  <p className="text-[10px] md:text-[11px] text-slate-400 mt-0.5">Paso {step} de 2 — {step === 1 ? 'Información básica' : 'Precios y stock'}</p>
                </div>
              </div>
              <button onClick={closeModal} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-all cursor-pointer flex-shrink-0">
                <FiX size={16} className="md:w-5 md:h-5" />
              </button>
            </div>

            {/* Step indicator */}
            <div className="px-5 md:px-7 pt-3 md:pt-4 shrink-0">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 rounded-full bg-[#FF6701]" />
                <div className={`flex-1 h-1.5 rounded-full transition-colors ${step === 2 ? 'bg-[#FF6701]' : 'bg-slate-200 dark:bg-slate-700'}`} />
              </div>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto flex-1 px-5 md:px-7 py-4 md:py-5 space-y-4 md:space-y-5">

              {/* ── PASO 1 ─────────────────────────────────────────── */}
              {step === 1 && (
                <>
                  {/* Nombre */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">
                      <FiTag size={10} className="inline mr-1.5" />Nombre del Producto *
                    </label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={e => setField('name', e.target.value)}
                      placeholder="Ej. Taco de Maciza, Coca-Cola 600ml, Costilla por Kg…"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#FF6701]/60 focus:bg-white dark:focus:bg-slate-800 transition-all"
                    />
                  </div>

                  {/* Categoría */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">
                      <FiLayers size={10} className="inline mr-1.5" />Categoría *
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {CATEGORIAS.map(cat => (
                        <button
                          key={cat.value}
                          type="button"
                          onClick={() => handleCategorySelect(cat.value)}
                          className={`flex items-start gap-2.5 p-3 rounded-xl border-2 text-left transition-all cursor-pointer ${form.categoria === cat.value
                            ? 'border-[#FF6701] bg-[#FF6701]/5 dark:bg-[#FF6701]/10'
                            : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-[#FF6701]/40'
                            }`}
                        >
                          <span className="text-xl leading-none mt-0.5">{cat.emoji}</span>
                          <div>
                            <p className={`text-xs font-bold leading-tight ${form.categoria === cat.value ? 'text-[#FF6701]' : 'text-slate-800 dark:text-white'}`}>{cat.label}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">{cat.desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Unidad de venta */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">
                      <FiBox size={10} className="inline mr-1.5" />Unidad de Venta
                    </label>
                    <div className="flex gap-2 flex-wrap">
                      {UNIDADES.map(u => (
                        <button
                          key={u}
                          type="button"
                          onClick={() => setField('unidad', u)}
                          className={`px-3.5 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${form.unidad === u
                            ? 'bg-[#FF6701] border-[#FF6701] text-white'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-[#FF6701]/50 bg-white dark:bg-slate-800'
                            }`}
                        >
                          {u}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Descripción */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">
                      Descripción / Notas (opcional)
                    </label>
                    <textarea
                      rows={2}
                      value={form.description}
                      onChange={e => setField('description', e.target.value)}
                      placeholder="Notas internas sobre este producto (proveedor, ingredientes, especificaciones…)"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#FF6701]/60 focus:bg-white dark:focus:bg-slate-800 transition-all resize-none"
                    />
                  </div>

                  {/* SKU */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">
                      <FiHash size={10} className="inline mr-1.5" />Código / SKU (opcional)
                    </label>
                    <input
                      type="text"
                      value={form.sku}
                      onChange={e => setField('sku', e.target.value)}
                      placeholder="Ej. TCO-001, BEB-CC600"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#FF6701]/60 transition-all"
                    />
                  </div>
                </>
              )}

              {/* ── PASO 2 ─────────────────────────────────────────── */}
              {step === 2 && (
                <>
                  {/* Resumen del producto */}
                  <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#FF6701]/5 dark:bg-[#FF6701]/10 border border-[#FF6701]/20">
                    <span className="text-2xl">{CATEGORIAS.find(c => c.value === form.categoria)?.emoji ?? '🍽️'}</span>
                    <div>
                      <p className="text-sm font-black text-slate-900 dark:text-white">{form.name}</p>
                      <p className="text-[11px] text-slate-500">{form.categoria} · {form.unidad}{form.sku ? ` · SKU: ${form.sku}` : ''}</p>
                    </div>
                  </div>

                  {/* Precios */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">
                        <FiDollarSign size={10} className="inline mr-1" />Precio de Costo *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">$</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          required
                          value={form.costPrice}
                          onChange={e => setField('costPrice', e.target.value)}
                          placeholder="0.00"
                          className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-800 dark:text-white font-bold focus:outline-none focus:border-[#FF6701]/60 focus:bg-white dark:focus:bg-slate-800 transition-all"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">
                        Ganancia Deseada *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">$</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          required
                          value={form.gain}
                          onChange={e => setField('gain', e.target.value)}
                          placeholder="0.00"
                          className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-800 dark:text-white font-bold focus:outline-none focus:border-[#FF6701]/60 focus:bg-white dark:focus:bg-slate-800 transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Precio de Venta Calculado (Suma Automática) */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-[#FF6701]/10 to-[#FFA82F]/10 border border-[#FF6701]/25 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Precio de Venta (Costo + Ganancia)</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">El sistema suma ambos valores para definir el precio final de venta.</p>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-black text-[#FF6701]">
                        ${((parseFloat(form.costPrice) || 0) + (parseFloat(form.gain) || 0)).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Margen calculado */}
                  {margin !== null && !isNaN(parseFloat(margin)) && parseFloat(margin) >= 0 && (
                    <div className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-bold ${parseFloat(margin) >= 50 ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
                      : parseFloat(margin) >= 20 ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                        : 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                      }`}>
                      <FiDollarSign size={14} />
                      Margen de ganancia real: <span className="text-base font-black">{margin}%</span>
                      {parseFloat(margin) < 20 && <span className="ml-auto text-[11px]">⚠️ Margen muy bajo</span>}
                      {parseFloat(margin) >= 50 && <span className="ml-auto text-[11px]">✅ Excelente margen</span>}
                    </div>
                  )}

                  {/* Control de Inventario */}
                  <div className="rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="px-4 py-4 flex items-center justify-between bg-slate-50 dark:bg-slate-800/40">
                      <div>
                        <h4 className="text-xs font-black text-slate-800 dark:text-white flex items-center gap-1.5">
                          <FiToggleLeft size={14} className="text-[#FF6701]" /> Controlar Inventario / Stock
                        </h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">Los tacos generalmente no requieren control de stock.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer select-none shrink-0">
                        <input
                          type="checkbox"
                          checked={form.trackStock}
                          onChange={e => setField('trackStock', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-10 h-5 bg-slate-200 dark:bg-slate-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#FF6701]" />
                      </label>
                    </div>

                    {form.trackStock && (
                      <div className="px-4 py-4 border-t border-slate-200 dark:border-slate-700 grid grid-cols-2 gap-4 bg-white dark:bg-slate-900">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Stock Inicial *</label>
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            value={form.stock}
                            onChange={e => setField('stock', e.target.value)}
                            placeholder="Ej. 50"
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-[#FF6701]/60 transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Alerta mínima de stock</label>
                          <input
                            type="number"
                            step="1"
                            min="0"
                            value={form.minStock}
                            onChange={e => setField('minStock', e.target.value)}
                            placeholder="Ej. 10"
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-[#FF6701]/60 transition-all"
                          />
                          <p className="text-[10px] text-slate-400 mt-1">Aviso cuando el stock baje de este número.</p>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-7 py-5 border-t border-slate-100 dark:border-slate-800 flex gap-3 shrink-0 bg-white dark:bg-slate-900">
              <button
                type="button"
                onClick={() => step === 1 ? closeModal() : setStep(1)}
                className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold text-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
              >
                {step === 1 ? 'Cancelar' : '← Atrás'}
              </button>

              {step === 1 ? (
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={!step1Valid}
                  className="flex-2 flex-1 py-3 rounded-xl font-bold text-sm text-white cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: 'linear-gradient(135deg, #FF6701, #FFA82F)', flex: 2 }}
                >
                  Siguiente: Precios y Stock →
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!step2Valid || submitting}
                  className="flex-2 flex-1 py-3 rounded-xl font-bold text-sm text-white cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #FF6701, #FFA82F)', flex: 2 }}
                >
                  {submitting ? (
                    <><span className="animate-spin">↻</span> Guardando…</>
                  ) : (
                    <><FiCheckCircle size={15} /> Registrar Producto</>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}