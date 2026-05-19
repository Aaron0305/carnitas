'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Por favor completa todos los campos');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Por favor ingresa un correo válido');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      window.location.href = '/dashboard';
      setLoading(false);
    }, 2000);
  };

  if (!mounted) return null;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' as const },
    },
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Gradiente de fondo */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#FFF9F5] via-[#FCECDD] to-[#FFF5F0] dark:from-[#0a0a0a] dark:via-[#1a1410] dark:to-[#0f0b08]" />

      {/* Elementos decorativos animados */}
      <motion.div
        animate={{
          x: [0, 50, 0],
          y: [0, 50, 0],
        }}
        transition={{ duration: 10, ease: 'easeInOut', repeat: Infinity }}
        className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-[#FF6701] via-[#FFA82F] to-[#FF6701]/30 rounded-full blur-3xl pointer-events-none opacity-25 dark:opacity-15"
      />

      <motion.div
        animate={{
          x: [0, -50, 0],
          y: [0, -50, 0],
        }}
        transition={{ duration: 12, ease: 'easeInOut', repeat: Infinity, delay: 1 }}
        className="absolute -bottom-40 -left-40 w-64 h-64 bg-gradient-to-tr from-[#FFC288]/40 via-[#FF6701]/20 to-[#FFA82F]/10 rounded-full blur-3xl pointer-events-none opacity-30 dark:opacity-20"
      />

      {/* Container principal */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-sm px-4 md:px-0"
      >
        {/* Card principal - Compacta */}
        <motion.div
          variants={itemVariants}
          className="bg-[#FCECDD] dark:bg-[#1a1410] backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-[#FFC288]/40 dark:border-[#FF6701]/20"
        >
          {/* Header Naranja - Más compacto */}
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            transition={{ duration: 0.8, ease: 'easeOut' as const }}
            className="bg-gradient-to-r from-[#FF6701] via-[#FFA82F] to-[#FF8A1F] px-6 pt-8 pb-8 text-center relative overflow-hidden"
          >
            {/* Shimmer */}
            <motion.div
              animate={{ x: ['0%', '100%'] }}
              transition={{ duration: 3, ease: 'linear', repeat: Infinity }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            />

            <div className="relative z-10">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.3, duration: 0.6, ease: 'easeOut' as const }}
                className="text-5xl mb-2"
              >
                🌮
              </motion.div>

              <motion.h1
                variants={itemVariants}
                className="text-3xl font-black text-white tracking-tight"
              >
                Carnitas
              </motion.h1>

              <motion.p
                variants={itemVariants}
                className="text-white/85 font-bold text-xs uppercase tracking-widest mt-1"
              >
                Punto de Venta
              </motion.p>
            </div>
          </motion.div>

          {/* Contenido - Compacto */}
          <div className="px-6 py-6 md:px-7 md:py-7">
            {/* Título */}
            <motion.h2
              variants={itemVariants}
              className="text-2xl font-black text-[#FF6701] dark:text-[#FFA82F] mb-1 text-center"
            >
              Inicia Sesión
            </motion.h2>

            <motion.p
              variants={itemVariants}
              className="text-center text-slate-600 dark:text-slate-400 mb-5 font-medium text-xs"
            >
              Accede con tus credenciales
            </motion.p>

            {/* Error Message */}
            <motion.div
              layout
              initial={{ opacity: 0, height: 0 }}
              animate={{
                opacity: error ? 1 : 0,
                height: error ? 'auto' : 0,
              }}
              transition={{ duration: 0.3 }}
              className="mb-4 overflow-hidden"
            >
              {error && (
                <div className="bg-[#FFE5E5] dark:bg-[#FF6701]/20 border-l-4 border-[#FF6701] text-[#CC3333] dark:text-[#FFA82F] px-3 py-2 rounded-lg font-bold text-xs">
                  ⚠️ {error}
                </div>
              )}
            </motion.div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <motion.div variants={itemVariants}>
                <label className="block text-xs font-black text-[#FF6701] dark:text-[#FFA82F] mb-2 uppercase tracking-wide">
                  📧 Correo
                </label>
                <input
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="w-full px-4 py-3 border-2 border-[#FFC288] dark:border-[#FF6701]/30 rounded-lg font-medium bg-white dark:bg-[#0f0b08] text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-600 transition-all duration-300 focus:outline-none focus:border-[#FF6701] dark:focus:border-[#FFA82F] focus:shadow-lg focus:shadow-[#FF6701]/30 disabled:opacity-50 text-sm"
                />
              </motion.div>

              {/* Password */}
              <motion.div variants={itemVariants}>
                <label className="block text-xs font-black text-[#FF6701] dark:text-[#FFA82F] mb-2 uppercase tracking-wide">
                  🔐 Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    className="w-full px-4 py-3 border-2 border-[#FFC288] dark:border-[#FF6701]/30 rounded-lg font-medium bg-white dark:bg-[#0f0b08] text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-600 transition-all duration-300 focus:outline-none focus:border-[#FF6701] dark:focus:border-[#FFA82F] focus:shadow-lg focus:shadow-[#FF6701]/30 disabled:opacity-50 text-sm"
                  />
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-lg cursor-pointer hover:opacity-70"
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </motion.button>
                </div>
              </motion.div>

              {/* Remember & Forgot */}
              <motion.div
                variants={itemVariants}
                className="flex items-center justify-between text-xs"
              >
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={loading}
                    className="w-4 h-4 rounded accent-[#FF6701] cursor-pointer border-2 border-[#FFC288] dark:border-[#FF6701]/40 dark:bg-[#1a1410]"
                  />
                  <span className="font-bold text-slate-700 dark:text-slate-300">Recuérdame</span>
                </label>
                <a href="#" className="font-bold text-[#FF6701] hover:text-[#FFA82F] dark:text-[#FFA82F] dark:hover:text-[#FF6701] transition-colors">
                  ¿Olvidaste?
                </a>
              </motion.div>

              {/* Submit Button */}
              <motion.button
                variants={itemVariants}
                whileHover={!loading ? { scale: 1.02, y: -2 } : {}}
                whileTap={!loading ? { scale: 0.98 } : {}}
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-[#FF6701] via-[#FFA82F] to-[#FF8A1F] hover:shadow-xl hover:shadow-[#FF6701]/40 text-white font-black text-sm rounded-lg transition-all duration-300 disabled:opacity-60 uppercase tracking-wide relative overflow-hidden group mt-4"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}>
                        ⏳
                      </motion.span>
                      Iniciando...
                    </>
                  ) : (
                    '✓ Iniciar Sesión'
                  )}
                </span>
              </motion.button>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
