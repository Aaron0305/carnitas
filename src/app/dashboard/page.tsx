'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import ProductosView from './Productos/ProductosView';
import VentasView from './Ventas/VentasView';
import ReportesView from './Reportes/ReportesView';
import RegistrosView from './Registros/RegistrosView';
import { FiDollarSign, FiPackage, FiUsers, FiBarChart2, FiPlusCircle, FiArrowRight } from 'react-icons/fi';

interface StatCard {
  id: string;
  label: string;
  value: string;
  detail: string;
  icon: React.ComponentType<{ className?: string }>;
  trend: string;
  trendUp: boolean;
  accent: 'primary' | 'warning' | 'rose' | 'info';
}

interface Order {
  id: string;
  orderNum: string;
  client: string;
  product: string;
  quantity: string;
  amount: string;
  status: 'delivered' | 'processing' | 'pending' | 'cancelled';
}

export default function Dashboard() {
  const [activeMenu, setActiveMenu] = useState('dashboard');

  const handleLogout = () => {
    window.location.href = '/login';
  };

  const stats: StatCard[] = [
    {
      id: 'sales',
      label: 'Total de Ventas',
      value: '$345,980',
      detail: 'Este mes',
      icon: FiDollarSign,
      trend: '+12%',
      trendUp: true,
      accent: 'primary',
    },
    {
      id: 'orders',
      label: 'Pedidos Completados',
      value: '1,428',
      detail: 'Este mes',
      icon: FiPackage,
      trend: '+8%',
      trendUp: true,
      accent: 'warning',
    },
    {
      id: 'customers',
      label: 'Clientes Activos',
      value: '582',
      detail: 'Registrados',
      icon: FiUsers,
      trend: '-3%',
      trendUp: false,
      accent: 'rose',
    },
    {
      id: 'revenue',
      label: 'Ingresos Totales',
      value: '$128,450',
      detail: 'Este trimestre',
      icon: FiBarChart2,
      trend: '+15%',
      trendUp: true,
      accent: 'info',
    },
  ];

  const recentOrders: Order[] = [
    { id: '1', orderNum: '#PED-001', client: 'Carlos López',   product: 'Carnitas Doradas', quantity: '5 kg',  amount: '$125.00', status: 'delivered'  },
    { id: '2', orderNum: '#PED-002', client: 'María García',   product: 'Carnitas Premium',  quantity: '8 kg',  amount: '$280.00', status: 'processing' },
    { id: '3', orderNum: '#PED-003', client: 'Juan Martínez',  product: 'Mix de Carnes',     quantity: '10 kg', amount: '$350.00', status: 'delivered'  },
    { id: '4', orderNum: '#PED-004', client: 'Ana Rodríguez',  product: 'Carnitas Especial', quantity: '6 kg',  amount: '$195.00', status: 'pending'    },
    { id: '5', orderNum: '#PED-005', client: 'Pedro Sánchez',  product: 'Carnitas Caseras',  quantity: '3 kg',  amount: '$95.00',  status: 'cancelled'  },
  ];

  const statusConfig = {
    delivered: {
      label: 'Entregado',
      className: 'bg-primary/10 text-primary border-primary/20 dark:bg-primary/20 dark:text-primary-light dark:border-primary/30',
    },
    processing: {
      label: 'En Proceso',
      className: 'bg-primary-light/20 text-primary-light border-primary-light/30 dark:bg-primary-light/20 dark:text-primary-light dark:border-primary-light/40',    },
    pending: {
      label: 'Pendiente',
      className: 'bg-accent-light/70 text-slate-700 border-accent-light/60 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    },
    cancelled: {
      label: 'Cancelado',
      className: 'bg-accent/70 text-slate-600 border-accent-light/60 dark:bg-slate-800/70 dark:text-slate-400 dark:border-slate-700',
    },
  };



  const Spark = ({ up }: { up: boolean }) => (
    <svg width="60" height="28" viewBox="0 0 60 28" fill="none">
      {[4, 10, 7, 14, 9, 18, 12, 20, 16, 24, 20, 28].map((h, i) => (
        <rect
          key={i}
          x={i * 5}
          y={28 - h}
          width="3"
          height={h}
          rx="1.5"
          className={up ? 'fill-primary' : 'fill-primary-light'}
          opacity={0.3 + (i / 12) * 0.7}
        />
      ))}
    </svg>
  );

  return (
    <div className="relative flex h-screen overflow-hidden bg-[linear-gradient(135deg,rgb(252,236,221)_0%,rgb(252,236,221)_50%,rgb(255,245,240)_100%)] dark:bg-[linear-gradient(135deg,rgb(15,23,42)_0%,rgb(15,23,42)_50%,rgb(30,41,59)_100%)]">
      <motion.div
        animate={{ x: [0, 40, 0], y: [0, 40, 0] }}
        transition={{ duration: 12, ease: 'easeInOut', repeat: Infinity }}
        className="pointer-events-none absolute -top-32 -right-32 w-72 h-72 rounded-full blur-3xl"
        style={{ backgroundColor: 'rgb(255 103 1 / 0.2)' }}
      />
      <motion.div
        animate={{ x: [0, -40, 0], y: [0, -40, 0] }}
        transition={{ duration: 14, ease: 'easeInOut', repeat: Infinity }}
        className="pointer-events-none absolute -bottom-36 -left-36 w-80 h-80 rounded-full blur-3xl"
        style={{ backgroundColor: 'rgb(255 168 47 / 0.2)' }}
      />
      <motion.div
        animate={{ opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 8, ease: 'easeInOut', repeat: Infinity }}
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[34rem] h-[34rem] rounded-full blur-3xl"
        style={{ backgroundColor: 'rgb(255 103 1 / 0.1)' }}
      />
      <Sidebar activeMenu={activeMenu} onMenuChange={setActiveMenu} onLogout={handleLogout} />

      <div className="relative z-10 flex-1 ml-64 flex flex-col overflow-hidden">
        <Navbar onLogout={handleLogout} />
        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto space-y-8">
            {activeMenu === 'dashboard' && (
              <>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white">
                  Panel de <span style={{ color: '#FF6701', fontStyle: 'italic' }}>Control</span>
                </h1>
                <p className="mt-2 flex items-center gap-2 text-slate-500 dark:text-slate-400">
                  <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#FF6701' }} />
                  Bienvenido de nuevo. Aquí está el resumen de hoy.
                </p>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.02, translateY: -2 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 text-white shadow-xl border"
                style={{
                  background: 'linear-gradient(135deg, #FF6701, #FFA82F)',
                  borderColor: 'rgb(255 103 1 / 0.3)',
                  boxShadow: '0 15px 35px rgb(255 103 1 / 0.3)',
                }}
              >
                <FiPlusCircle className="text-lg animate-pulse" /> Nuevo Pedido
              </motion.button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
              {stats.map((s) => (
                <motion.div
                  key={s.id}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  className={`rounded-2xl p-5 cursor-pointer relative overflow-hidden shadow-xl ring-1 bg-[#FCECDD]/90 dark:bg-slate-900/80 ${
                    s.accent === 'primary' ? 'border-primary/20 ring-primary/5' :
                    s.accent === 'warning' ? 'border-orange-200 ring-orange-100' :
                    s.accent === 'rose' ? 'border-rose-200 ring-rose-100' :
                    'border-slate-200 ring-slate-100'
                  }`}
                  style={{
                    borderTopWidth: '4px',
                    borderTopColor: s.accent === 'primary' ? '#FF6701' : s.accent === 'warning' ? '#FFA82F' : s.accent === 'rose' ? '#F43F5E' : '#3B82F6'
                  }}
                >
                  <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full blur-2xl opacity-20"
                    style={{
                      backgroundColor: s.accent === 'primary' ? 'rgb(255 103 1 / 1)' : 'rgb(255 168 47 / 1)',
                    }}
                  />
                  
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 rounded-xl bg-white dark:bg-slate-800 shadow-inner" style={{ color: s.accent === 'primary' ? '#FF6701' : s.accent === 'warning' ? '#FFA82F' : s.accent === 'rose' ? '#F43F5E' : '#3B82F6' }}>
                      <s.icon className="text-2xl" />
                    </div>
                    <div className={`px-2 py-1 rounded-lg text-xs font-bold border ${
                      s.trendUp ? 'bg-green-100 text-green-600 border-green-200' : 'bg-rose-100 text-rose-600 border-rose-200'
                    }`}>
                      {s.trend}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-slate-500 dark:text-slate-400 font-medium text-sm">{s.label}</h3>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">{s.value}</span>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-xs text-slate-400 font-medium italic">{s.detail}</span>
                      <Spark up={s.trendUp} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="backdrop-blur-xl rounded-3xl p-6 md:p-8 shadow-2xl border bg-[#FFF5F0]/90 dark:bg-slate-900/90 border-[#FF6701]">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                  <h2 className="text-2xl font-bold flex items-center gap-3 text-slate-900 dark:text-white">
                    <span className="p-2 rounded-xl flex items-center justify-center bg-[#FF6701] text-white">
                      <FiPackage className="text-xl" />
                    </span>
                    Pedidos Recientes
                  </h2>
                  <p className="text-sm mt-1 text-slate-500 dark:text-slate-400">Últimas transacciones registradas en el sistema</p>
                </div>
                <button className="text-sm font-bold flex items-center gap-2 transition-all hover:gap-3 text-[#FF6701]">
                  Ver todo el historial <FiArrowRight className="text-lg" />
                </button>
              </div>

              <div className="overflow-x-auto -mx-6 -mb-6 md:-mx-8 md:-mb-8 rounded-b-3xl bg-[#FF6701]/5 dark:bg-slate-900/50">
                <table className="w-full text-left border-separate border-spacing-y-3">
                  <thead>
                    <tr className="uppercase text-[10px] tracking-[0.2em] font-black" style={{ color: '#FF6701' }}>
                      <th className="px-6 py-4">ID Pedido</th>
                      <th className="px-6 py-4">Cliente</th>
                      <th className="px-6 py-4">Producto</th>
                      <th className="px-6 py-4">Cantidad</th>
                      <th className="px-6 py-4">Venta Total</th>
                      <th className="px-6 py-4 text-center">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((ord, idx) => (
                      <motion.tr 
                        key={ord.id}
                        className={`group rounded-2xl shadow-sm transition-all duration-200 px-6 hover:bg-[#FF6701]/15 dark:hover:bg-[#FF6701]/20 ${
                          idx % 2 === 0 
                            ? 'bg-white/90 dark:bg-slate-700/30' 
                            : 'bg-[#FFF5F0]/50 dark:bg-transparent'
                        }`}
                      >
                        <td className="px-6 py-5 first:rounded-l-2xl">
                          <span className="font-black text-xs px-3 py-1.5 rounded-lg border" style={{ color: '#FF6701', backgroundColor: 'rgb(255 103 1 / 0.1)', borderColor: 'rgb(255 103 1 / 0.2)' }}>
                            {ord.orderNum}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-slate-900 dark:text-slate-300">
                          <span className="font-bold">{ord.client}</span>
                        </td>
                        <td className="px-6 py-5 text-slate-600 dark:text-slate-400">
                          <span className="text-sm">{ord.product}</span>
                        </td>
                        <td className="px-6 py-5 text-slate-600 dark:text-slate-400">
                          <span className="text-sm italic font-medium">{ord.quantity}</span>
                        </td>
                        <td className="px-6 py-5 text-slate-900 dark:text-white font-bold">
                          <span>{ord.amount}</span>
                        </td>
                        <td className="px-6 py-5 last:rounded-r-2xl text-center">
                          <span className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider border shadow-sm" 
                            style={{
                              color: ord.status === 'delivered' ? 'rgb(34 197 94)' : ord.status === 'processing' ? '#FFA82F' : ord.status === 'pending' ? '#FF6701' : 'rgb(107 114 128)',
                              backgroundColor: ord.status === 'delivered' ? 'rgb(34 197 94 / 0.1)' : ord.status === 'processing' ? 'rgb(255 168 47 / 0.1)' : ord.status === 'pending' ? 'rgb(255 103 1 / 0.1)' : 'rgb(107 114 128 / 0.1)',
                              borderColor: ord.status === 'delivered' ? 'rgb(34 197 94 / 0.2)' : ord.status === 'processing' ? 'rgb(255 168 47 / 0.2)' : ord.status === 'pending' ? 'rgb(255 103 1 / 0.2)' : 'rgb(107 114 128 / 0.2)',
                            }}
                          >
                            {statusConfig[ord.status].label}
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

            {activeMenu === 'productos' && <ProductosView />}
            {activeMenu === 'ventas' && <VentasView />}
            {activeMenu === 'reportes' && <ReportesView />}
            {activeMenu === 'registros' && <RegistrosView />}
          </div>
        </main>
      </div>
    </div>
  );
}
