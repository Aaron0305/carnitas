'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

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

  const navbarVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' as const },
    },
  };

  const iconVariants = {
    idle: { scale: 1 },
    hovered: {
      scale: 1.08,
      backgroundColor: '#FF6701',
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
      className="backdrop-blur px-8 py-4 shadow-lg flex justify-between items-center h-20 border-b"
      style={{
        backgroundColor: deviceTheme === 'dark' ? 'rgb(15 23 42 / 0.9)' : 'rgb(252 236 221 / 0.9)',
        borderColor: deviceTheme === 'dark' ? 'rgb(51 65 85 / 0.3)' : 'rgb(255 103 1 / 0.15)',
      }}
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
              ? '0 0 0 3px rgb(255 103 1 / 0.1)'
              : '0 0 0 0px rgba(255, 103, 1, 0)',
          }}
          className="flex items-center px-4 py-2 rounded-full min-w-80 border-2 transition-all duration-300"
          style={{
            backgroundColor: deviceTheme === 'dark' ? 'rgb(51 65 85 / 0.5)' : 'rgb(255 255 255 / 0.7)',
            borderColor: searchFocus ? '#FF6701' : (deviceTheme === 'dark' ? 'rgb(51 65 85 / 0.5)' : 'rgb(255 103 1 / 0.15)'),
          }}
        >
          <span className="mr-3 text-lg">🔍</span>
          <input
            type="text"
            placeholder="Buscar..."
            onFocus={() => setSearchFocus(true)}
            onBlur={() => setSearchFocus(false)}
            className="bg-transparent outline-none w-full font-medium"
            style={{
              color: deviceTheme === 'dark' ? 'white' : 'rgb(15 23 42)',
              placeholder: 'currentColor',
            }}
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
              className="w-10 h-10 rounded-full flex items-center justify-center text-lg cursor-pointer transition-all duration-300 border"
              style={{
                borderColor: deviceTheme === 'dark' ? 'rgb(51 65 85 / 0.5)' : 'rgb(255 103 1 / 0.15)',
                backgroundColor: deviceTheme === 'dark' ? 'rgba(51, 65, 85, 0.3)' : 'rgba(252, 236, 221, 0.7)',
              }}
            >
              {item.icon}
            </motion.button>
          ))}
        </div>

        {/* Divider */}
        <div className="h-8 w-px" style={{ backgroundColor: deviceTheme === 'dark' ? 'rgb(51 65 85 / 0.5)' : 'rgb(255 103 1 / 0.15)' }} />

        {/* User Profile */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          onClick={onLogout}
          title="Cerrar sesión"
          className="flex items-center gap-3 p-2 rounded-lg transition-all duration-300 group cursor-pointer"
          style={{
            '&:hover': {
              backgroundColor: deviceTheme === 'dark' ? 'rgb(51 65 85 / 0.5)' : 'rgb(255 103 1 / 0.1)',
            }
          }}
        >
          {/* Avatar */}
          <motion.div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
            style={{
              background: 'linear-gradient(135deg, #FF6701, #FFA82F)',
              boxShadow: '0 4px 15px rgb(255 103 1 / 0.3)',
            }}
            whileHover={{ boxShadow: '0 0 20px rgb(255 103 1 / 0.5)' }}
          >
            {userInitials}
          </motion.div>

          {/* User Info */}
          <div className="text-left hidden sm:block">
            <h3 className="text-sm font-bold" style={{ color: deviceTheme === 'dark' ? 'white' : 'rgb(15 23 42)' }}>
              {userName}
            </h3>
            <p className="text-xs font-medium" style={{ color: deviceTheme === 'dark' ? 'rgb(148 163 184)' : 'rgb(100 116 139)' }}>
              Gerente
            </p>
          </div>

          {/* Dropdown arrow */}
          <motion.span
            animate={{ rotate: hoveredIcon === 'profile' ? 180 : 0 }}
            className="hidden sm:inline ml-2"
            style={{ color: deviceTheme === 'dark' ? 'rgb(148 163 184)' : 'rgb(148 163 184)' }}
          >
            ▼
          </motion.span>
        </motion.button>
      </motion.div>
    </motion.nav>
  );
}
