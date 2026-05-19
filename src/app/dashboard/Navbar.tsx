'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
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
  onLogout,
  onMenuToggle,
  isSidebarOpen = false,
}: NavbarProps) {
  const [userName, setUserName] = useState(propUserName || 'Juan Pérez');
  const [userInitials, setUserInitials] = useState(propUserInitials || 'JP');

  useEffect(() => {
    if (!propUserName) {
      const savedName = localStorage.getItem('user_name');
      if (savedName) {
        setUserName(savedName);
        const initials = savedName
          .split(' ')
          .map((part) => part[0])
          .join('')
          .toUpperCase()
          .slice(0, 2);
        setUserInitials(initials || 'JP');
      } else {
        const email = localStorage.getItem('user_email');
        if (email) {
          if (email === 'admin@gmail.com') {
            setUserName('Administrador');
            setUserInitials('AD');
          } else {
            const parts = email.split('@')[0];
            const formattedName = parts.charAt(0).toUpperCase() + parts.slice(1);
            setUserName(formattedName);
            setUserInitials(parts.substring(0, 2).toUpperCase());
          }
        }
      }
    }
  }, [propUserName]);

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
