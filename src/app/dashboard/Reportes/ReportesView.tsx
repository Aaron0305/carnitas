'use client';

import { useEffect, useState } from 'react';
import { FiBarChart2, FiDollarSign, FiTrendingUp, FiShoppingBag, FiLayers, FiPrinter } from 'react-icons/fi';
import { ReportesService, DailyReport } from '@/service/reportes';

export default function ReportesView() {
  const [dailyReports, setDailyReports] = useState<DailyReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await ReportesService.getDailyReports();
        setDailyReports(data);
      } catch (err) {
        console.error('Error al cargar cortes de caja:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Calcular totales históricos acumulados para las tarjetas superiores de KPI
  const accumulatedTotal = dailyReports.reduce((sum, r) => sum + r.totalSales, 0);
  const accumulatedCash = dailyReports.reduce((sum, r) => sum + r.cashSales, 0);
  const accumulatedCard = dailyReports.reduce((sum, r) => sum + r.cardSales, 0);
  const accumulatedCount = dailyReports.reduce((sum, r) => sum + r.count, 0);

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2 md:gap-3">
          <span className="p-2 md:p-2.5 rounded-2xl bg-[#FF6701] text-white shadow-lg text-lg md:text-xl">
            <FiBarChart2 />
          </span>
          Cortes de <span style={{ color: '#FF6701', fontStyle: 'italic' }}>Caja y Ventas Diarias</span>
        </h1>
        <p className="mt-2 text-xs md:text-sm text-slate-500 dark:text-slate-400">
          Visualiza el histórico diario de ventas, el desglose de métodos de pago y el control de arqueo para los cortes de caja del negocio.
        </p>
      </div>

      {/* Tarjetas de Resumen Acumulado de la Semana */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="rounded-2xl p-4 md:p-6 bg-[#FCECDD]/80 dark:bg-slate-900/80 border border-[#FF6701]/10 dark:border-slate-800 shadow-xl">
          <p className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-slate-400">Total Acumulado</p>
          <h2 className="text-xl md:text-2xl font-black text-slate-850 dark:text-white mt-1">
            {loading ? '...' : `$${accumulatedTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}
          </h2>
          <span className="text-[10px] text-green-500 font-semibold mt-2 block flex items-center gap-1">
            <FiTrendingUp /> Histórico de cierres
          </span>
        </div>

        <div className="rounded-2xl p-4 md:p-6 bg-[#FCECDD]/80 dark:bg-slate-900/80 border border-[#FF6701]/10 dark:border-slate-800 shadow-xl">
          <p className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-slate-400">Caja en Efectivo</p>
          <h2 className="text-xl md:text-2xl font-black text-[#FF6701] mt-1">
            {loading ? '...' : `$${accumulatedCash.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}
          </h2>
          <span className="text-[10px] text-slate-450 mt-2 block">Ventas físicas acumuladas</span>
        </div>

        <div className="rounded-2xl p-4 md:p-6 bg-[#FCECDD]/80 dark:bg-slate-900/80 border border-[#FF6701]/10 dark:border-slate-800 shadow-xl">
          <p className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-slate-400">Tarjetas y Transf.</p>
          <h2 className="text-xl md:text-2xl font-black text-slate-850 dark:text-white mt-1">
            {loading ? '...' : `$${accumulatedCard.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}
          </h2>
          <span className="text-[10px] text-[#FFA82F] font-semibold mt-2 block">Terminales activas</span>
        </div>

        <div className="rounded-2xl p-4 md:p-6 bg-[#FCECDD]/80 dark:bg-slate-900/80 border border-[#FF6701]/10 dark:border-slate-800 shadow-xl">
          <p className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-slate-400">Transacciones</p>
          <h2 className="text-xl md:text-2xl font-black text-slate-850 dark:text-white mt-1">
            {loading ? '...' : `${accumulatedCount} ventas`}
          </h2>
          <span className="text-[10px] text-green-500 font-semibold mt-2 block flex items-center gap-1">
            <FiShoppingBag /> Pedidos atendidos
          </span>
        </div>
      </div>

      {/* Histórico de Cortes Diarios */}
      <div className="bg-[#FFF5F0]/90 dark:bg-slate-900/90 border border-[#FF6701]/25 rounded-3xl p-4 md:p-6 lg:p-8 shadow-2xl space-y-6">
        <h2 className="text-lg md:text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <FiLayers className="text-[#FF6701]" /> Bitácora Histórica de Ventas y Cierres Diarios
        </h2>

        <div className="overflow-x-auto -mx-4 -mb-4 md:-mx-6 md:-mb-6 lg:-mx-8 lg:-mb-8 rounded-b-3xl bg-[#FF6701]/5 dark:bg-slate-900/50">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-[#FF6701]/10 dark:border-slate-800 text-[10px] md:text-xs font-extrabold uppercase tracking-wider text-slate-400">
                <th className="pb-4 pl-4 md:pl-6">Fecha del Corte</th>
                <th className="pb-4 hidden sm:table-cell">Ventas en Efectivo</th>
                <th className="pb-4 hidden md:table-cell">Ventas con Tarjeta</th>
                <th className="pb-4">Total Diario</th>
                <th className="pb-4 text-center hidden lg:table-cell">Transacciones</th>
                <th className="pb-4 text-center">Estado de Caja</th>
                <th className="pb-4 pr-4 md:pr-6 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 font-bold animate-pulse text-xs md:text-sm">
                    Cargando histórico diario...
                  </td>
                </tr>
              ) : dailyReports.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 font-bold text-xs md:text-sm">
                    No se registran ventas históricas en el sistema.
                  </td>
                </tr>
              ) : (
                dailyReports.map((report) => (
                  <tr key={report.id} className="text-xs md:text-sm font-semibold text-slate-700 dark:text-slate-300 transition-colors hover:bg-white/40 dark:hover:bg-slate-800/20">
                    <td className="py-4 pl-4 md:pl-6 font-black text-slate-900 dark:text-white">{report.date}</td>
                    <td className="py-4 hidden sm:table-cell text-[#FF6701]">${report.cashSales.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                    <td className="py-4 hidden md:table-cell">${report.cardSales.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                    <td className="py-4 font-black text-slate-900 dark:text-white">${report.totalSales.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                    <td className="py-4 text-center hidden lg:table-cell">{report.count}</td>
                    <td className="py-4 text-center">
                      <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border shadow-sm ${
                        report.status === 'Abierto' 
                          ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                          : 'bg-slate-500/10 text-slate-500 border-slate-500/20'
                      }`}>
                        {report.status}
                      </span>
                    </td>
                    <td className="py-4 pr-4 md:pr-6 text-right">
                      <button
                        onClick={() => alert(`Imprimiendo comprobante de corte de caja del ${report.date}`)}
                        className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-[#FF6701]/20 hover:bg-[#FF6701]/10 text-[#FF6701] cursor-pointer shadow-sm transition-all inline-block"
                        title="Imprimir Corte de Caja"
                      >
                        <FiPrinter className="text-sm" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
