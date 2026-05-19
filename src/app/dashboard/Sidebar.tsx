'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

interface SidebarProps {
  activeMenu?: string;
  onMenuChange?: (menu: string) => void;
}

export default function Sidebar({ activeMenu = 'dashboard', onMenuChange }: SidebarProps) {
  const [isHovered, setIsHovered] = useState<string | null>(null);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'ventas', label: 'Ventas', icon: '💰' },
    { id: 'pedidos', label: 'Pedidos', icon: '📦' },
    { id: 'clientes', label: 'Clientes', icon: '👥' },
    { id: 'productos', label: 'Productos', icon: '🍖' },
    { id: 'reportes', label: 'Reportes', icon: '📈' },
    { id: 'configuracion', label: 'Configuración', icon: '⚙️' },
  ];

  const handleMenuClick = (menuId: string) => {
    if (onMenuChange) {
      onMenuChange(menuId);
    }
  };

  const sidebarVariants = {
    hidden: { x: -280, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: 'easeOut' as const },
    },
  };

  const menuItemVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: (index: number) => ({
      x: 0,
      opacity: 1,
      transition: { delay: index * 0.05, duration: 0.4, ease: 'easeOut' as const },
    }),
  };

  return (
    <motion.aside
      variants={sidebarVariants}
      initial="hidden"
      animate="visible"
      className="w-64 bg-gradient-to-b from-primary to-primary-light dark:from-slate-900 dark:to-slate-800 text-white p-8 fixed h-screen left-0 top-0 z-50 overflow-y-auto shadow-2xl border-r border-primary-light/20 dark:border-slate-700"
    >
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-12 pb-8 border-b border-white/20"
      >
        <h2 className="text-3xl font-bold tracking-tight mb-2">🌮 Carnitas</h2>
        <p className="text-sm font-medium text-orange-100 opacity-90">Gestión Profesional</p>
      </motion.div>

      {/* Menu Items */}
      <ul className="space-y-3">
        {menuItems.map((item, index) => (
          <motion.li
            key={item.id}
            custom={index}
            variants={menuItemVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.button
              whileHover={{ x: 8 }}
              whileTap={{ scale: 0.98 }}
              onHoverStart={() => setIsHovered(item.id)}
              onHoverEnd={() => setIsHovered(null)}
              onClick={() => handleMenuClick(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg font-semibold text-base transition-all duration-300 relative group ${
                activeMenu === item.id
                  ? 'bg-white/20 text-white shadow-lg'
                  : 'text-orange-100 hover:bg-white/10'
              }`}
            >
              {/* Active indicator */}
              {activeMenu === item.id && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-lg"
                  transition={{ duration: 0.3 }}
                />
              )}

              <span className="text-2xl">{item.icon}</span>
              <span className="relative z-10">{item.label}</span>

              {/* Hover glow effect */}
              {isHovered === item.id && (
                <motion.div
                  className="absolute inset-0 bg-white/10 rounded-lg -z-10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
              )}
            </motion.button>
          </motion.li>
        ))}
      </ul>

      {/* Bottom Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="absolute bottom-8 left-8 right-8 p-4 bg-white/10 rounded-lg border border-white/20 backdrop-blur-sm"
      >
        <p className="text-xs text-orange-100 font-medium text-center">
          v1.0.0 • Carnitas Pro
        </p>
      </motion.div>
    </motion.aside>
  );
}
