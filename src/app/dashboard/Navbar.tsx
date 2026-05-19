'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { FiBell, FiMessageSquare, FiHelpCircle, FiSearch, FiChevronDown, FiMenu, FiX } from 'react-icons/fi';

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
  const [searchFocus, setSearchFocus] = useState(false);
  const [hoveredIcon, setHoveredIcon] = useState<string | null>(null);

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
    { id: 'notifications', icon: FiBell, title: 'Notificaciones' },
    { id: 'messages', icon: FiMessageSquare, title: 'Mensajes' },
    { id: 'help', icon: FiHelpCircle, title: 'Ayuda' },
  ];

  return (
    <nav
      className="backdrop-blur px-4 md:px-8 py-4 shadow-lg flex justify-between items-center h-20 border-b bg-[#FCECDD]/90 border-[#FF6701]/15 dark:bg-slate-900/90 dark:border-slate-800/30"
    >
      {/* Hamburger Menu - Móvil */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={onMenuToggle}
        className="md:hidden p-2 rounded-lg text-[#FF6701] hover:bg-[#FF6701]/10"
      >
        {isSidebarOpen ? <FiX className="text-2xl" /> : <FiMenu className="text-2xl" />}
      </motion.button>

      {/* Left Section - Search */}
      <div className="flex items-center gap-3 md:gap-6 flex-1">
        <motion.div
          animate={{
            boxShadow: searchFocus
              ? '0 0 0 3px rgb(255 103 1 / 0.1)'
              : '0 0 0 0px rgba(255, 103, 1, 0)',
          }}
          className={`flex items-center px-3 md:px-4 py-2 rounded-full w-full md:min-w-80 border-2 transition-all duration-300 bg-white/70 dark:bg-slate-700/50 ${
            searchFocus ? 'border-[#FF6701]' : 'border-[#FF6701]/15 dark:border-slate-700/50'
          }`}
        >
          <FiSearch className="mr-2 md:mr-3 text-lg md:text-xl text-[#FF6701] flex-shrink-0" />
          <input
            type="text"
            placeholder="Buscar..."
            onFocus={() => setSearchFocus(true)}
            onBlur={() => setSearchFocus(false)}
            className="bg-transparent outline-none w-full font-medium text-sm md:text-base text-slate-900 dark:text-white"
          />
        </motion.div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3 md:gap-6">
        {/* Icon Buttons */}
        <div className="hidden sm:flex items-center gap-3">
          {navIcons.map((item) => (
            <motion.button
              key={item.id}
              variants={iconVariants}
              initial="idle"
              whileHover="hovered"
              onMouseEnter={() => setHoveredIcon(item.id)}
              onMouseLeave={() => setHoveredIcon(null)}
              title={item.title}
              className="w-10 h-10 rounded-full flex items-center justify-center text-lg cursor-pointer transition-all duration-300 border border-[#FF6701]/15 bg-[#FCECDD]/70 dark:border-slate-700/50 dark:bg-slate-800/30"
            >
              <item.icon className="text-xl" />
            </motion.button>
          ))}
        </div>

        {/* Divider */}
        <div className="hidden md:block h-8 w-px bg-[#FF6701]/15 dark:bg-slate-700/50" />

        {/* User Profile - Info Estática */}
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md"
            style={{
              background: 'linear-gradient(135deg, #FF6701, #FFA82F)',
            }}
          >
            {userInitials}
          </div>

          {/* User Info */}
          <div className="text-left hidden sm:block">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {userName}
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider bg-[#FF6701]/10 text-[#FF6701] dark:bg-slate-800/50 dark:text-slate-300">
              Conectado
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
}
