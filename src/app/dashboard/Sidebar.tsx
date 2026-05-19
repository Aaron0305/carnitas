'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { FiHome, FiDollarSign, FiPackage, FiBarChart2, FiClipboard, FiLogOut } from 'react-icons/fi';
import { GiTacos } from 'react-icons/gi';

interface SidebarProps {
  activeMenu?: string;
  onMenuChange?: (menu: string) => void;
  onLogout?: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ activeMenu = 'dashboard', onMenuChange, onLogout, isOpen = true, onClose }: SidebarProps) {
  const [isHovered, setIsHovered] = useState<string | null>(null);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: FiHome },
    { id: 'ventas', label: 'Ventas', icon: FiDollarSign },
    { id: 'productos', label: 'Productos', icon: FiPackage },
    { id: 'reportes', label: 'Reportes', icon: FiBarChart2 },
    { id: 'registros', label: 'Registros', icon: FiClipboard }
  ];

  const handleMenuClick = (menuId: string) => {
    if (onMenuChange) {
      onMenuChange(menuId);
    }
    // Cerrar sidebar en móvil después de hacer clic
    if (window.innerWidth < 768 && onClose) {
      onClose();
    }
  };

  return (
    <>
      {/* Overlay para móvil */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="md:hidden fixed inset-0 bg-black/50 z-30"
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -256 }}
        animate={{ x: isOpen ? 0 : -256 }}
        transition={{ duration: 0.3 }}
        className="w-64 fixed h-screen left-0 top-0 z-40 md:z-40 overflow-y-auto border-r px-6 py-7 shadow-xl backdrop-blur bg-[#FCECDD]/95 border-[#FF6701]/15 dark:bg-slate-900 dark:border-slate-800/50 md:translate-x-0"
      >
      {/* Logo */}
      <div className="mb-8">
        <div className="flex items-center gap-3 p-3 rounded-xl text-white shadow-lg"
          style={{
            background: 'linear-gradient(135deg, #FF6701, #FFA82F)',
            boxShadow: '0 10px 30px rgb(255 103 1 / 0.3)',
          }}
        >
          <GiTacos className="text-3xl text-white" />
          <div>
            <h2 className="text-lg font-black leading-tight">Carnitas</h2>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/90">Gestión</p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <ul className="space-y-2">
        {menuItems.map((item, index) => (
          <li key={item.id}>
            <motion.button
              whileHover={{ x: 6 }}
              whileTap={{ scale: 0.98 }}
              onHoverStart={() => setIsHovered(item.id)}
              onHoverEnd={() => setIsHovered(null)}
              onClick={() => handleMenuClick(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-300 relative group border ${
                activeMenu === item.id 
                  ? 'bg-[#FF6701]/15 text-[#FF6701] border-[#FF6701]/30' 
                  : 'bg-transparent text-slate-700 border-transparent dark:text-slate-300 hover:bg-[#FF6701]/10'
              }`}
            >
              {activeMenu === item.id && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute left-0 top-2 bottom-2 w-1 rounded-full"
                  style={{ backgroundColor: '#FF6701' }}
                  transition={{ duration: 0.3 }}
                />
              )}
              <span className="text-xl"><item.icon /></span>
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
          </li>
        ))}
      </ul>

      {/* Botón de Cerrar Sesión al final */}
      <div className="absolute bottom-6 left-6 right-6">
        <motion.button
          whileHover={{ x: 6 }}
          whileTap={{ scale: 0.98 }}
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-300 border text-rose-500 border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 dark:border-rose-500/30 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 cursor-pointer"
        >
          <FiLogOut className="text-xl" />
          <span>Cerrar Sesión</span>
        </motion.button>
      </div>
    </motion.aside>
    </>
  );
}
