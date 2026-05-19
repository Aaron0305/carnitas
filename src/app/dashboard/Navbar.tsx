'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

interface NavbarProps {
  userName?: string;
  userInitials?: string;
  onLogout?: () => void;
}

export default function Navbar({
  userName = 'Juan Pérez',
  userInitials = 'JP',
  onLogout,
}: NavbarProps) {
  const [searchFocus, setSearchFocus] = useState(false);
  const [hoveredIcon, setHoveredIcon] = useState<string | null>(null);

  const navbarVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' as const },
    },
  };

  const iconVariants = {
    idle: { scale: 1, backgroundColor: 'rgb(240, 245, 250)' },
    hovered: {
      scale: 1.1,
      backgroundColor: 'rgb(255, 103, 1)',
      color: 'white',
      transition: { duration: 0.3 },
    },
  };

  const navIcons = [
    { id: 'notifications', icon: '🔔', title: 'Notificaciones' },
    { id: 'messages', icon: '💬', title: 'Mensajes' },
    { id: 'help', icon: '❓', title: 'Ayuda' },
  ];

  return (
    <motion.nav
      variants={navbarVariants}
      initial="hidden"
      animate="visible"
      className="bg-white dark:bg-slate-900 px-8 py-4 shadow-card dark:shadow-lg dark:shadow-slate-950/50 flex justify-between items-center h-20 border-b border-slate-200 dark:border-slate-800"
    >
      {/* Left Section - Search */}
      <motion.div
        className="flex items-center gap-6 flex-1"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
        <motion.div
          animate={{
            boxShadow: searchFocus
              ? '0 0 0 3px rgba(255, 103, 1, 0.1)'
              : '0 0 0 0px rgba(255, 103, 1, 0)',
          }}
          className="flex items-center bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-full min-w-80 border-2 border-transparent hover:border-primary transition-all duration-300"
        >
          <span className="text-slate-400 dark:text-slate-500 mr-3 text-lg">🔍</span>
          <input
            type="text"
            placeholder="Buscar..."
            onFocus={() => setSearchFocus(true)}
            onBlur={() => setSearchFocus(false)}
            className="bg-transparent outline-none text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 w-full font-medium"
          />
        </motion.div>
      </motion.div>

      {/* Right Section */}
      <motion.div
        className="flex items-center gap-6"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
        {/* Icon Buttons */}
        <div className="flex items-center gap-3">
          {navIcons.map((item) => (
            <motion.button
              key={item.id}
              variants={iconVariants}
              initial="idle"
              whileHover="hovered"
              onMouseEnter={() => setHoveredIcon(item.id)}
              onMouseLeave={() => setHoveredIcon(null)}
              title={item.title}
              className="w-10 h-10 rounded-full flex items-center justify-center text-lg cursor-pointer transition-all duration-300"
            >
              {item.icon}
            </motion.button>
          ))}
        </div>

        {/* Divider */}
        <div className="h-8 w-px bg-slate-200 dark:bg-slate-700" />

        {/* User Profile */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          onClick={onLogout}
          title="Cerrar sesión"
          className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-300 group cursor-pointer"
        >
          {/* Avatar */}
          <motion.div
            className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-primary-light flex items-center justify-center text-white font-bold text-sm shadow-glow-primary"
            whileHover={{ boxShadow: '0 0 20px rgba(255, 103, 1, 0.5)' }}
          >
            {userInitials}
          </motion.div>

          {/* User Info */}
          <div className="text-left hidden sm:block">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {userName}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Gerente
            </p>
          </div>

          {/* Dropdown arrow */}
          <motion.span
            animate={{ rotate: hoveredIcon === 'profile' ? 180 : 0 }}
            className="text-slate-400 dark:text-slate-500 hidden sm:inline ml-2"
          >
            ▼
          </motion.span>
        </motion.button>
      </motion.div>
    </motion.nav>
  );
}
