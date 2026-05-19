'use client';

import { useEffect, useState } from 'react';
import { FiUsers, FiUserPlus, FiSearch, FiKey, FiMail, FiUser, FiAlertCircle } from 'react-icons/fi';
import { getEmployees, registerEmployee, UserAccount } from '@/service/registros';

export default function RegistrosView() {
  const [employees, setEmployees] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'user' | 'admin'>('user');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadEmployees = async () => {
    try {
      const data = await getEmployees();
      setEmployees(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!name.trim()) return setFormError('Por favor ingresa el nombre completo del empleado.');
    if (!email.trim()) return setFormError('Por favor ingresa el correo electrónico.');
    if (!password.trim() || password.length < 6) return setFormError('La contraseña debe tener al menos 6 caracteres.');

    setSubmitting(true);
    try {
      const res = await registerEmployee(name, email, password, role);
      if (res.success) {
        setFormSuccess('¡Empleado registrado de forma exitosa!');
        setName('');
        setEmail('');
        setPassword('');
        setRole('user');
        loadEmployees(); // Recargar lista de la base de datos
      } else {
        setFormError(res.error || 'Ocurrió un error al guardar el registro.');
      }
    } catch (err: any) {
      setFormError(err.message || 'Error al conectar con el servidor.');
    } finally {
      setSubmitting(false);
    }
  };

  // Filtrar personal según el término de búsqueda
  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Encabezado */}
      <div>
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
          <span className="p-2.5 rounded-2xl bg-[#FF6701] text-white shadow-lg">
            <FiUsers />
          </span>
          Gestión de <span style={{ color: '#FF6701', fontStyle: 'italic' }}>Personal y Accesos</span>
        </h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          Registra nuevos empleados y administradores en el sistema, y administra sus niveles de acceso al panel de Carnitas.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulario de Registro */}
        <div className="bg-[#FFF5F0]/90 dark:bg-slate-900/90 border border-[#FF6701]/30 rounded-3xl p-6 md:p-8 shadow-2xl">
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <FiUserPlus className="text-[#FF6701]" /> Registrar Nuevo Usuario
          </h2>

          <form className="space-y-4" onSubmit={handleRegister}>
            {formError && (
              <div className="p-3.5 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-450 text-xs font-semibold flex items-center gap-2">
                <FiAlertCircle className="text-base shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {formSuccess && (
              <div className="p-3.5 rounded-xl border border-green-500/20 bg-green-500/10 text-green-600 dark:text-green-450 text-xs font-semibold">
                {formSuccess}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">NOMBRE COMPLETO</label>
              <div className="relative">
                <FiUser className="absolute left-4 top-3.5 text-slate-450 dark:text-slate-400" />
                <input
                  type="text"
                  placeholder="Ej. Carlos López"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border bg-white dark:bg-slate-800 border-[#FF6701]/20 dark:border-slate-700 outline-none text-sm text-slate-800 dark:text-white font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">CORREO ELECTRÓNICO</label>
              <div className="relative">
                <FiMail className="absolute left-4 top-3.5 text-slate-450 dark:text-slate-400" />
                <input
                  type="email"
                  placeholder="ejemplo@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border bg-white dark:bg-slate-800 border-[#FF6701]/20 dark:border-slate-700 outline-none text-sm text-slate-800 dark:text-white font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">CONTRASEÑA</label>
              <div className="relative">
                <FiKey className="absolute left-4 top-3.5 text-slate-450 dark:text-slate-400" />
                <input
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border bg-white dark:bg-slate-800 border-[#FF6701]/20 dark:border-slate-700 outline-none text-sm text-slate-800 dark:text-white font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">ROL / NIVEL DE ACCESO</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as 'user' | 'admin')}
                className="w-full px-4 py-3 rounded-xl border bg-white dark:bg-slate-800 border-[#FF6701]/20 dark:border-slate-700 outline-none text-sm text-slate-800 dark:text-white font-medium"
              >
                <option value="user">Empleado (Vendedor / Cajero)</option>
                <option value="admin">Administrador (Acceso Total)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 text-white shadow-lg border mt-6 cursor-pointer hover:opacity-90 transition-all disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, #FF6701, #FFA82F)',
                borderColor: 'rgb(255 103 1 / 0.3)',
              }}
            >
              {submitting ? 'Registrando...' : 'Registrar Cuenta'}
            </button>
          </form>
        </div>

        {/* Listado de Empleados */}
        <div className="lg:col-span-2 bg-[#FFF5F0]/90 dark:bg-slate-900/90 border border-[#FF6701]/20 rounded-3xl p-6 shadow-2xl space-y-6 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FiUsers className="text-[#FF6701]" /> Personal Registrado
              </h2>
              <div className="flex items-center px-4 py-2 rounded-xl border border-[#FF6701]/20 bg-white dark:bg-slate-800 w-full sm:w-64">
                <FiSearch className="mr-2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar personal..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-transparent outline-none w-full text-xs font-medium text-slate-850 dark:text-white"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-[#FF6701]/10 dark:border-slate-800 text-xs font-extrabold uppercase tracking-wider text-slate-400">
                    <th className="pb-4 pl-2">Nombre</th>
                    <th className="pb-4">Correo</th>
                    <th className="pb-4">Rol</th>
                    <th className="pb-4 pr-2 text-right">F. Registro</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-400 font-bold">
                        Cargando personal...
                      </td>
                    </tr>
                  ) : filteredEmployees.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-400 font-bold">
                        No se encontraron empleados.
                      </td>
                    </tr>
                  ) : (
                    filteredEmployees.map((emp) => (
                      <tr key={emp.id} className="text-sm font-semibold text-slate-700 dark:text-slate-300 transition-colors hover:bg-white/40 dark:hover:bg-slate-800/20">
                        <td className="py-4 pl-2 font-black text-slate-900 dark:text-white">{emp.name}</td>
                        <td className="py-4 font-mono text-xs">{emp.email}</td>
                        <td className="py-4">
                          <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border shadow-sm ${
                            emp.role === 'admin' 
                              ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' 
                              : 'bg-green-500/10 text-green-500 border-green-500/20'
                          }`}>
                            {emp.role === 'admin' ? 'Administrador' : 'Empleado'}
                          </span>
                        </td>
                        <td className="py-4 pr-2 text-right text-slate-400 text-xs">{emp.created_at}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
