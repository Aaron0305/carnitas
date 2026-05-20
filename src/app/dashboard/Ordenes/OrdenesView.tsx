'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiClock, FiCheckCircle, FiPlayCircle, FiXCircle, 
  FiRefreshCw, FiVolume2, FiAlertCircle, FiClipboard 
} from 'react-icons/fi';
import { OrdenesService, Order } from '@/service/ordenes';

export default function OrdenesView() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  const prevOrdersCountRef = useRef<number>(0);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Sintetizar sonido de campana de cocina de forma nativa sin archivos externos
  const playKitchenChime = () => {
    if (!soundEnabled) return;
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      
      // Primera nota
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, ctx.currentTime); // Nota D5
      gain1.gain.setValueAtTime(0.12, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start();
      osc1.stop(ctx.currentTime + 0.4);

      // Segunda nota (armonía después de 80ms)
      setTimeout(() => {
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(880.00, ctx.currentTime); // Nota A5
        gain2.gain.setValueAtTime(0.10, ctx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start();
        osc2.stop(ctx.currentTime + 0.5);
      }, 80);

    } catch (e) {
      console.warn('AudioContext no soportado o bloqueado por interacción del navegador.');
    }
  };

  async function loadOrders(silent = false) {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    
    try {
      const active = await OrdenesService.getActiveOrders();
      setOrders(active);
      
      // Si hay más órdenes pendientes que antes, suena la campana de cocina
      const currentPendingCount = active.filter(o => o.status === 'Pendiente').length;
      if (currentPendingCount > prevOrdersCountRef.current) {
        playKitchenChime();
      }
      prevOrdersCountRef.current = currentPendingCount;
    } catch (err) {
      console.error('Error cargando órdenes en cocina:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  // Carga inicial y sondeo en tiempo real cada 5 segundos
  useEffect(() => {
    loadOrders();
    const interval = setInterval(() => {
      loadOrders(true);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [soundEnabled]);

  const handleStatusChange = async (id: string, newStatus: Order['status']) => {
    const success = await OrdenesService.updateStatus(id, newStatus);
    if (success) {
      // Optimistic state update
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
      loadOrders(true);
    }
  };

  const handleCancelOrder = async (id: string) => {
    if (!confirm('¿Seguro que deseas cancelar esta orden de cocina?')) return;
    const success = await OrdenesService.updateStatus(id, 'Cancelado');
    if (success) {
      setOrders(prev => prev.filter(o => o.id !== id));
      loadOrders(true);
    }
  };

  // Cronómetro del tiempo transcurrido en minutos
  const ElapsedTimer = ({ createdAt }: { createdAt: string }) => {
    const [minutes, setMinutes] = useState(0);

    useEffect(() => {
      const calculateTime = () => {
        const diffMs = Date.now() - new Date(createdAt).getTime();
        setMinutes(Math.max(0, Math.floor(diffMs / 60000)));
      };
      
      calculateTime();
      const interval = setInterval(calculateTime, 30000); // Actualiza cada 30 segundos
      return () => clearInterval(interval);
    }, [createdAt]);

    let colorClass = 'text-green-600 dark:text-green-400 bg-green-500/10';
    if (minutes >= 12) {
      colorClass = 'text-rose-600 dark:text-rose-400 bg-rose-500/20 animate-pulse font-black';
    } else if (minutes >= 6) {
      colorClass = 'text-amber-600 dark:text-amber-400 bg-amber-500/10 font-bold';
    }

    return (
      <span className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg ${colorClass}`}>
        <FiClock size={11} /> Hace {minutes} min
      </span>
    );
  };

  const pending = orders.filter(o => o.status === 'Pendiente');
  const prepping = orders.filter(o => o.status === 'Preparando');
  const ready = orders.filter(o => o.status === 'Listo');

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2 md:gap-3">
            <span className="p-2 md:p-2.5 rounded-2xl bg-[#FF6701] text-white shadow-lg text-lg md:text-xl"><FiClipboard /></span>
            Pantalla de <span style={{ color: '#FF6701', fontStyle: 'italic' }}>Cocina</span>
          </h1>
          <p className="mt-2 text-xs md:text-sm text-slate-500 dark:text-slate-400">
            Control de comanda en tiempo real. Los meseros envían pedidos aquí.
          </p>
        </div>
        <div className="flex items-center gap-3 self-end sm:self-center">
          {/* Sonido */}
          <button 
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              if (!soundEnabled) {
                // Activar sonido requiere interacción de usuario para el AudioContext
                setTimeout(() => playKitchenChime(), 100);
              }
            }}
            className={`p-2.5 rounded-xl border flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
              soundEnabled 
                ? 'bg-orange-50 border-orange-200 text-[#FF6701] dark:bg-orange-950/20 dark:border-orange-900/50' 
                : 'bg-white border-slate-200 text-slate-400 dark:bg-slate-900 dark:border-slate-800'
            }`}
            title="Activar o desactivar sonido de comanda"
          >
            <FiVolume2 className="text-sm" /> 
            <span className="hidden sm:inline">{soundEnabled ? 'Timbre Activo' : 'Timbre Mudo'}</span>
          </button>
          
          {/* Refrescar */}
          <button
            onClick={() => loadOrders()}
            disabled={refreshing}
            className="p-2.5 rounded-xl border bg-white border-slate-200 text-slate-600 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 hover:border-[#FF6701]/50 cursor-pointer flex items-center gap-1 text-xs font-bold disabled:opacity-50"
          >
            <FiRefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Actualizar</span>
          </button>
        </div>
      </div>

      {/* Grid de Columnas de Cocina */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        
        {/* COLUMNA 1: PENDIENTES */}
        <div className="rounded-3xl p-4 bg-[#FFF5F0]/90 dark:bg-slate-900/60 border border-[#FF6701]/20 shadow-xl flex flex-col min-h-[70vh]">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#FF6701]/10">
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-white flex items-center gap-2">
              📥 Por Preparar
              <span className="px-2 py-0.5 rounded-full bg-[#FF6701] text-white text-[11px] font-black">
                {pending.length}
              </span>
            </h3>
          </div>
          
          <div className="space-y-4 overflow-y-auto flex-1 max-h-[65vh] pr-1.5 custom-scrollbar">
            <AnimatePresence mode="popLayout">
              {pending.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-12 text-center text-slate-400 dark:text-slate-600 flex flex-col items-center gap-2 justify-center h-full"
                >
                  <FiCheckCircle size={32} className="text-slate-300 dark:text-slate-700" />
                  <p className="text-xs font-semibold">¡Sin pedidos pendientes!</p>
                </motion.div>
              ) : (
                pending.map(order => (
                  <motion.div
                    key={order.id}
                    layoutId={`order-${order.id}`}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 shadow-md flex flex-col gap-3 group relative overflow-hidden"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                          🪑 {order.table_name}
                        </h4>
                        {order.client_name && (
                          <p className="text-[11px] text-slate-400 mt-0.5">Cliente: {order.client_name}</p>
                        )}
                      </div>
                      <ElapsedTimer createdAt={order.created_at} />
                    </div>

                    {/* Items */}
                    <div className="border-y border-slate-100 dark:border-slate-800/80 py-2.5 space-y-1.5">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-start text-xs">
                          <span className="text-slate-800 dark:text-slate-200 font-bold">
                            <span className="text-[#FF6701] font-black mr-2 bg-[#FF6701]/10 px-1.5 py-0.5 rounded-md text-[10px]">{item.qty}x</span>
                            {item.name}
                          </span>
                          <span className="text-[10px] text-slate-400 uppercase tracking-widest">{item.category}</span>
                        </div>
                      ))}
                    </div>

                    {order.notes && (
                      <p className="text-[10px] italic text-amber-600 bg-amber-500/10 px-2.5 py-1.5 rounded-lg border border-amber-500/20">
                        💬 Nota: {order.notes}
                      </p>
                    )}

                    {/* Acciones */}
                    <div className="flex gap-2 mt-1">
                      <button
                        onClick={() => handleStatusChange(order.id, 'Preparando')}
                        className="flex-1 py-2 rounded-xl text-xs font-black text-white cursor-pointer transition-all flex items-center justify-center gap-1 shadow-md hover:-translate-y-0.5"
                        style={{ background: 'linear-gradient(135deg, #FF6701, #FFA82F)' }}
                      >
                        <FiPlayCircle size={13} /> Preparar
                      </button>
                      <button
                        onClick={() => handleCancelOrder(order.id)}
                        className="p-2 rounded-xl border border-slate-200 hover:border-rose-300 dark:border-slate-800 text-slate-400 hover:text-rose-500 cursor-pointer transition-colors"
                        title="Cancelar Orden"
                      >
                        <FiXCircle size={14} />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* COLUMNA 2: PREPARANDO */}
        <div className="rounded-3xl p-4 bg-amber-500/5 dark:bg-slate-900/60 border border-amber-500/20 shadow-xl flex flex-col min-h-[70vh]">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-amber-500/10">
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-white flex items-center gap-2">
              🍳 En Preparación
              <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[11px] font-black">
                {prepping.length}
              </span>
            </h3>
          </div>

          <div className="space-y-4 overflow-y-auto flex-1 max-h-[65vh] pr-1.5 custom-scrollbar">
            <AnimatePresence mode="popLayout">
              {prepping.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-12 text-center text-slate-400 dark:text-slate-600 flex flex-col items-center gap-2 justify-center h-full"
                >
                  <FiAlertCircle size={32} className="text-slate-300 dark:text-slate-700" />
                  <p className="text-xs font-semibold">Sin comanda en preparación.</p>
                </motion.div>
              ) : (
                prepping.map(order => (
                  <motion.div
                    key={order.id}
                    layoutId={`order-${order.id}`}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-amber-500/20 shadow-md flex flex-col gap-3 group relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 right-0 h-[3px] bg-amber-500" />
                    
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                          🪑 {order.table_name}
                        </h4>
                        {order.client_name && (
                          <p className="text-[11px] text-slate-400 mt-0.5">Cliente: {order.client_name}</p>
                        )}
                      </div>
                      <ElapsedTimer createdAt={order.created_at} />
                    </div>

                    {/* Items */}
                    <div className="border-y border-slate-100 dark:border-slate-800/80 py-2.5 space-y-1.5">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-start text-xs">
                          <span className="text-slate-800 dark:text-slate-200 font-bold">
                            <span className="text-amber-600 font-black mr-2 bg-amber-500/10 px-1.5 py-0.5 rounded-md text-[10px]">{item.qty}x</span>
                            {item.name}
                          </span>
                          <span className="text-[10px] text-slate-400 uppercase tracking-widest">{item.category}</span>
                        </div>
                      ))}
                    </div>

                    {order.notes && (
                      <p className="text-[10px] italic text-amber-600 bg-amber-500/10 px-2.5 py-1.5 rounded-lg border border-amber-500/20">
                        💬 Nota: {order.notes}
                      </p>
                    )}

                    {/* Acciones */}
                    <div className="flex gap-2 mt-1">
                      <button
                        onClick={() => handleStatusChange(order.id, 'Listo')}
                        className="flex-1 py-2 rounded-xl text-xs font-black text-white cursor-pointer transition-all flex items-center justify-center gap-1 shadow-md hover:-translate-y-0.5"
                        style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}
                      >
                        <FiCheckCircle size={13} /> ¡Listo / Terminado!
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* COLUMNA 3: LISTO */}
        <div className="rounded-3xl p-4 bg-emerald-500/5 dark:bg-slate-900/60 border border-emerald-500/20 shadow-xl flex flex-col min-h-[70vh]">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-emerald-500/10">
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-white flex items-center gap-2">
              🔔 Listos para Servir
              <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[11px] font-black">
                {ready.length}
              </span>
            </h3>
          </div>

          <div className="space-y-4 overflow-y-auto flex-1 max-h-[65vh] pr-1.5 custom-scrollbar">
            <AnimatePresence mode="popLayout">
              {ready.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-12 text-center text-slate-400 dark:text-slate-600 flex flex-col items-center gap-2 justify-center h-full"
                >
                  <FiAlertCircle size={32} className="text-slate-300 dark:text-slate-700" />
                  <p className="text-xs font-semibold">Sin pedidos listos para servir.</p>
                </motion.div>
              ) : (
                ready.map(order => (
                  <motion.div
                    key={order.id}
                    layoutId={`order-${order.id}`}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-500/30 shadow-md flex flex-col gap-3 group relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 right-0 h-[3px] bg-emerald-500" />
                    
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                          🪑 {order.table_name}
                        </h4>
                        {order.client_name && (
                          <p className="text-[11px] text-slate-400 mt-0.5">Cliente: {order.client_name}</p>
                        )}
                      </div>
                      <span className="text-[10px] px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-extrabold uppercase animate-pulse">
                        ¡Listo!
                      </span>
                    </div>

                    {/* Items */}
                    <div className="border-y border-slate-100 dark:border-slate-800/80 py-2.5 space-y-1.5">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-start text-xs line-through text-slate-400 decoration-slate-300">
                          <span className="font-bold">
                            <span className="text-slate-400 font-black mr-2 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md text-[10px]">{item.qty}x</span>
                            {item.name}
                          </span>
                          <span className="text-[10px] text-slate-400 uppercase tracking-widest">{item.category}</span>
                        </div>
                      ))}
                    </div>

                    {/* Acciones */}
                    <div className="flex gap-2 mt-1">
                      <button
                        onClick={() => handleStatusChange(order.id, 'Entregado')}
                        className="flex-1 py-2 rounded-xl text-xs font-black text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 cursor-pointer transition-colors shadow-sm text-center"
                      >
                        Archivar / Entregado
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>
    </div>
  );
}
