'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

interface StatCard {
  id: string;
  label: string;
  value: string;
  detail: string;
  icon: string;
  trend: string;
  trendUp: boolean;
  color: 'primary' | 'success' | 'warning' | 'info';
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
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      window.location.href = '/login';
    }
  };

  const stats: StatCard[] = [
    {
      id: 'sales',
      label: 'Total de Ventas',
      value: '$24,530',
      detail: 'Este mes',
      icon: '💰',
      trend: '12%',
      trendUp: true,
      color: 'primary',
    },
    {
      id: 'orders',
      label: 'Pedidos Completados',
      value: '1,428',
      detail: 'Este mes',
      icon: '✓',
      trend: '8%',
      trendUp: true,
      color: 'success',
    },
    {
      id: 'clients',
      label: 'Clientes Activos',
      value: '582',
      detail: 'Registrados',
      icon: '👥',
      trend: '3%',
      trendUp: false,
      color: 'warning',
    },
    {
      id: 'revenue',
      label: 'Ingresos Totales',
      value: '$128,450',
      detail: 'Este trimestre',
      icon: '📊',
      trend: '15%',
      trendUp: true,
      color: 'info',
    },
  ];

  const orders: Order[] = [
    {
      id: '1',
      orderNum: '#PED-001',
      client: 'Carlos López',
      product: 'Carnitas Doradas',
      quantity: '5 kg',
      amount: '$125.00',
      status: 'delivered',
    },
    {
      id: '2',
      orderNum: '#PED-002',
      client: 'María García',
      product: 'Carnitas Premium',
      quantity: '8 kg',
      amount: '$280.00',
      status: 'processing',
    },
    {
      id: '3',
      orderNum: '#PED-003',
      client: 'Juan Martínez',
      product: 'Mix de Carnes',
      quantity: '10 kg',
      amount: '$350.00',
      status: 'delivered',
    },
    {
      id: '4',
      orderNum: '#PED-004',
      client: 'Ana Rodríguez',
      product: 'Carnitas Especial',
      quantity: '6 kg',
      amount: '$195.00',
      status: 'pending',
    },
    {
      id: '5',
      orderNum: '#PED-005',
      client: 'Pedro Sánchez',
      product: 'Carnitas Caseras',
      quantity: '3 kg',
      amount: '$95.00',
      status: 'cancelled',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' as const },
    },
  };

  const getStatusClasses = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
      case 'processing':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400';
      case 'pending':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400';
      case 'cancelled':
        return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400';
      default:
        return '';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'Entregado';
      case 'processing':
        return 'En Proceso';
      case 'pending':
        return 'Pendiente';
      case 'cancelled':
        return 'Cancelado';
      default:
        return '';
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar activeMenu={activeMenu} onMenuChange={setActiveMenu} />

      <div className="flex-1 ml-64 flex flex-col overflow-hidden">
        <Navbar onLogout={handleLogout} />

        {/* Main Content */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex-1 overflow-y-auto p-8"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="mb-12">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
              Bienvenido al Dashboard
            </h1>
            <p className="text-slate-600 dark:text-slate-400 font-medium">
              Aquí puedes gestionar todas tus operaciones de ventas
            </p>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
          >
            {stats.map((stat) => (
              <motion.div
                key={stat.id}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-card dark:shadow-lg dark:shadow-slate-950/50 border border-slate-100 dark:border-slate-800 hover:border-primary/50 transition-all duration-300 cursor-pointer group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1 uppercase tracking-wider">
                      {stat.label}
                    </p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white">
                      {stat.value}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                      {stat.detail}
                    </p>
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                      stat.color === 'primary'
                        ? 'bg-primary/10 dark:bg-primary/20'
                        : stat.color === 'success'
                        ? 'bg-green-100 dark:bg-green-900/30'
                        : stat.color === 'warning'
                        ? 'bg-primary-light/10 dark:bg-primary-light/20'
                        : 'bg-blue-100 dark:bg-blue-900/30'
                    }`}
                  >
                    {stat.icon}
                  </motion.div>
                </div>
                <motion.div
                  className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                    stat.trendUp
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                  }`}
                >
                  {stat.trendUp ? '↑' : '↓'} {stat.trend} desde el mes anterior
                </motion.div>
              </motion.div>
            ))}
          </motion.div>

          {/* Recent Orders Table */}
          <motion.div
            variants={itemVariants}
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-card dark:shadow-lg dark:shadow-slate-950/50 border border-slate-100 dark:border-slate-800 overflow-hidden"
          >
            {/* Table Header */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                Pedidos Recientes
              </h3>
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-primary hover:text-white text-slate-900 dark:text-white font-semibold rounded-lg transition-all duration-300"
                >
                  Filtrar
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-primary hover:text-white text-slate-900 dark:text-white font-semibold rounded-lg transition-all duration-300"
                >
                  Exportar
                </motion.button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      ID Pedido
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      Producto
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      Cantidad
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      Monto
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order, index) => (
                    <motion.tr
                      key={order.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.4 }}
                      className="border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-300"
                    >
                      <td className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white">
                        {order.orderNum}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300 font-medium">
                        {order.client}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300 font-medium">
                        {order.product}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300 font-medium">
                        {order.quantity}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-white">
                        {order.amount}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${getStatusClasses(
                            order.status
                          )}`}
                        >
                          {getStatusLabel(order.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-8 h-8 rounded-lg border-2 border-slate-200 dark:border-slate-700 hover:bg-primary hover:border-primary hover:text-white text-lg transition-all duration-300 flex items-center justify-center"
                            title="Ver"
                          >
                            👁️
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-8 h-8 rounded-lg border-2 border-slate-200 dark:border-slate-700 hover:bg-primary hover:border-primary hover:text-white text-lg transition-all duration-300 flex items-center justify-center"
                            title="Editar"
                          >
                            ✏️
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-8 h-8 rounded-lg border-2 border-slate-200 dark:border-slate-700 hover:bg-red-500 hover:border-red-500 hover:text-white text-lg transition-all duration-300 flex items-center justify-center"
                            title="Eliminar"
                          >
                            🗑️
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
