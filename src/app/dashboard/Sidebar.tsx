'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface SidebarProps {
  activeMenu?: string;
  onMenuChange?: (menu: string) => void;
}

export default function Sidebar({ activeMenu = 'dashboard', onMenuChange }: SidebarProps) {
  const [isHovered, setIsHovered] = useState<string | null>(null);
  const [deviceTheme, setDeviceTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const syncTheme = () => {
      setDeviceTheme(mediaQuery.matches ? 'dark' : 'light');
    };
    syncTheme();
    mediaQuery.addEventListener('change', syncTheme);
    return () => mediaQuery.removeEventListener('change', syncTheme);
  }, []);

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
      className="w-64 fixed h-screen left-0 top-0 z-40 overflow-y-auto border-r px-6 py-7 shadow-xl backdrop-blur"
      style={{
        backgroundColor: deviceTheme === 'dark' ? 'rgb(15 23 42)' : 'rgb(252 236 221 / 0.95)',
        borderColor: deviceTheme === 'dark' ? 'rgb(51 65 85 / 0.5)' : 'rgb(255 103 1 / 0.15)',
      }}
    >
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 p-3 rounded-xl text-white shadow-lg"
          style={{
            background: 'linear-gradient(135deg, #FF6701, #FFA82F)',
            boxShadow: '0 10px 30px rgb(255 103 1 / 0.3)',
          }}
        >
          <span className="text-2xl">🌮</span>
          <div>
            <h2 className="text-lg font-black leading-tight">Carnitas</h2>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/90">Gestión</p>
          </div>
        </div>
      </motion.div>

      {/* Menu Items */}
      <ul className="space-y-2">
        {menuItems.map((item, index) => (
          <motion.li
            key={item.id}
            custom={index}
            variants={menuItemVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.button
              whileHover={{ x: 6 }}
              whileTap={{ scale: 0.98 }}
              onHoverStart={() => setIsHovered(item.id)}
              onHoverEnd={() => setIsHovered(null)}
              onClick={() => handleMenuClick(item.id)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-300 relative group border"
              style={{
                backgroundColor: activeMenu === item.id ? 'rgb(255 103 1 / 0.15)' : 'transparent',
                color: activeMenu === item.id ? '#FF6701' : (deviceTheme === 'dark' ? 'rgb(203 213 225)' : 'rgb(55 65 81)'),
                borderColor: activeMenu === item.id ? 'rgb(255 103 1 / 0.3)' : 'transparent',
              }}
            >
              {activeMenu === item.id && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute left-0 top-2 bottom-2 w-1 rounded-full"
                  style={{ backgroundColor: '#FF6701' }}
                  transition={{ duration: 0.3 }}
                />
              )}
              <span className="text-xl">{item.icon}</span>
              <span className="relative z-10">{item.label}</span>

              {isHovered === item.id && (
                <motion.div
                  className="absolute inset-0 rounded-xl -z-10"
                  style={{ backgroundColor: 'rgb(255 103 1 / 0.1)' }}
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
        className="absolute bottom-6 left-6 right-6 p-3 rounded-lg border"
        style={{
          backgroundColor: deviceTheme === 'dark' ? 'rgb(51 65 85 / 0.5)' : 'rgb(255 103 1 / 0.1)',
          borderColor: 'rgb(255 103 1 / 0.2)',
        }}
      >
        <p className="text-[11px] font-semibold text-center"
          style={{ color: deviceTheme === 'dark' ? 'rgb(203 213 225)' : 'rgb(55 65 81)' }}
        >
          v1.0.0 • Carnitas Pro
        </p>
      </motion.div>
    </motion.aside>
  );
}
