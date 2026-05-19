import { supabase } from './supabase';

export interface DailyReport {
  id: string | number;
  date: string;
  totalSales: number;
  cashSales: number;
  cardSales: number;
  count: number;
  status: 'Cerrado' | 'Abierto';
}

export class ReportesService {
  /**
   * Obtiene el histórico diario de ventas y cortes de caja.
   * Agrupa las ventas reales de la base de datos por día y calcula los totales.
   */
  static async getDailyReports(): Promise<DailyReport[]> {
    try {
      // 1) Obtener todas las ventas registradas
      const { data: sales, error } = await supabase
        .from('sales')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (sales && sales.length > 0) {
        // Agrupar ventas por fecha (YYYY-MM-DD)
        const groups: { [key: string]: DailyReport } = {};

        sales.forEach((sale: any) => {
          const dateObj = new Date(sale.created_at);
          const dateStr = dateObj.toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          });

          const total = parseFloat(sale.total.toString().replace('$', '').replace(',', '')) || 0;
          const method = sale.method || 'Efectivo';

          if (!groups[dateStr]) {
            groups[dateStr] = {
              id: dateStr,
              date: dateStr,
              totalSales: 0,
              cashSales: 0,
              cardSales: 0,
              count: 0,
              status: 'Cerrado', // Los días anteriores siempre están cerrados
            };
          }

          groups[dateStr].totalSales += total;
          groups[dateStr].count += 1;
          
          if (method === 'Efectivo') {
            groups[dateStr].cashSales += total;
          } else {
            // Tarjeta o Transferencia
            groups[dateStr].cardSales += total;
          }
        });

        // Marcar el día de hoy como "Abierto" si es que hay ventas registradas hoy
        const todayStr = new Date().toLocaleDateString('es-MX', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
        if (groups[todayStr]) {
          groups[todayStr].status = 'Abierto';
        }

        return Object.values(groups);
      }

      throw new Error('Sin ventas en la base de datos');
    } catch (err) {
      console.warn('ReportesService.getDailyReports: Retornando array vacío debido a:', err);
      return [];
    }
  }
}
