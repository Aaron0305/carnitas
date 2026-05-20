'use client';

import { motion } from 'framer-motion';
import { useSyncExternalStore } from 'react';
import { FiBell, FiMessageSquare, FiChevronDown, FiMenu, FiX, FiSettings } from 'react-icons/fi';
import { GiTacos } from 'react-icons/gi';

interface NavbarProps {
  userName?: string;
  userInitials?: string;
  onLogout?: () => void;
  onMenuToggle?: () => void;
  isSidebarOpen?: boolean;
}

export default function Navbar({
  userName: propUserName,
  userInitials: propUserInitials,
  onMenuToggle,
  isSidebarOpen = false,
}: NavbarProps) {
  const fallbackName = propUserName || 'Juan Pérez';
  const fallbackInitials = propUserInitials || 'JP';

  const storedUserSerialized = useSyncExternalStore(
    (onStoreChange) => {
      if (typeof window === 'undefined') return () => {};

      const handler = () => onStoreChange();
      window.addEventListener('storage', handler);
      window.addEventListener('carnitas:user', handler as EventListener);
      return () => {
        window.removeEventListener('storage', handler);
        window.removeEventListener('carnitas:user', handler as EventListener);
      };
    },
    () => {
      // If props were provided, prefer them and avoid touching localStorage.
      if (propUserName || propUserInitials) {
        return JSON.stringify([fallbackName, fallbackInitials]);
      }

      try {
        const savedName = localStorage.getItem('user_name');
        if (savedName) {
          const initials = savedName
            .trim()
            .split(/\s+/)
            .map((part) => part[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
          return JSON.stringify([savedName, initials || 'JP']);
        }

        const email = localStorage.getItem('user_email');
        if (email) {
          if (email === 'admin@gmail.com') return JSON.stringify(['Administrador', 'AD']);
          const parts = email.split('@')[0] || '';
          const formattedName = parts ? parts.charAt(0).toUpperCase() + parts.slice(1) : 'Usuario';
          const initials = parts.substring(0, 2).toUpperCase() || 'US';
          return JSON.stringify([formattedName, initials]);
        }
      } catch {
        // ignore
      }

      return JSON.stringify([fallbackName, fallbackInitials]);
    },
    () => JSON.stringify([fallbackName, fallbackInitials])
  );

  let userName = fallbackName;
  let userInitials = fallbackInitials;
  try {
    const parsed = JSON.parse(storedUserSerialized) as unknown;
    if (Array.isArray(parsed)) {
      const maybeName = typeof parsed[0] === 'string' ? parsed[0] : undefined;
      const maybeInitials = typeof parsed[1] === 'string' ? parsed[1] : undefined;
      userName = maybeName || fallbackName;
      userInitials = maybeInitials || fallbackInitials;
    }
  } catch {
    // ignore
  }

  const navIcons = [
    { id: 'notifications', icon: FiBell, title: 'Notificaciones' },
    { id: 'messages', icon: FiMessageSquare, title: 'Mensajes' },
    { id: 'settings', icon: FiSettings, title: 'Configuración' },
  ];

  return (
    <nav className="w-full backdrop-blur-md bg-white/80 dark:bg-slate-950/80 border-b border-[#FF6701]/10 dark:border-slate-800/50">
      <div className="px-4 md:px-8 py-3 flex items-center justify-between h-16">
        
        {/* Left Section: Logo + Menu Button */}
        <div className="flex items-center gap-3 md:gap-4">
          {/* Hamburger Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onMenuToggle}
            className="p-2.5 rounded-lg text-[#FF6701] hover:bg-[#FF6701]/10 transition-all duration-200 flex-shrink-0"
          >
            <motion.div
              animate={{ rotate: isSidebarOpen ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              {isSidebarOpen ? <FiX className="text-2xl" /> : <FiMenu className="text-2xl" />}
            </motion.div>
          </motion.button>

          {/* Logo - Desktop Only */}
          <div className="hidden md:flex items-center gap-2 text-white font-black text-lg" 
            style={{
              background: 'linear-gradient(135deg, #FF6701, #FFA82F)',
              padding: '6px 12px',
              borderRadius: '8px',
            }}>
            <GiTacos className="text-xl" />
            <span>Carnitas</span>
          </div>
        </div>

        {/* Center Section: Empty spacer for balance */}
        <div className="flex-1" />

        {/* Right Section: Icons + User */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Icon Buttons */}
          <div className="flex items-center gap-1 md:gap-2">
            {navIcons.map((item) => (
              <motion.button
                key={item.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title={item.title}
                className="p-2 md:p-2.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-[#FF6701]/10 hover:text-[#FF6701] transition-all duration-200"
              >
                <item.icon className="text-lg md:text-xl" />
              </motion.button>
            ))}
          </div>

          {/* Divider */}
          <div className="h-6 w-px bg-[#FF6701]/15 dark:bg-slate-700/50 mx-1 md:mx-2" />

          {/* User Profile */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-2 md:gap-3 px-2 md:px-3 py-1.5 md:py-2 rounded-lg hover:bg-[#FF6701]/5 transition-all cursor-pointer"
          >
            {/* Avatar */}
            <div
              className="w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center text-white text-xs md:text-sm font-bold flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, #FF6701, #FFA82F)',
              }}
            >
              {userInitials}
            </div>

            {/* User Info - Hidden on mobile */}
            <div className="hidden sm:flex flex-col gap-0">
              <p className="text-xs md:text-sm font-bold text-slate-900 dark:text-white leading-tight">
                {userName}
              </p>
              <p className="text-[10px] text-[#FF6701] font-semibold">En línea</p>
            </div>

            {/* Dropdown Arrow */}
            <FiChevronDown className="hidden sm:block text-slate-400 text-sm md:text-base flex-shrink-0" />
          </motion.div>
        </div>
      </div>
    </nav>
  );
}
