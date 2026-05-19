import { supabase } from './supabase';

export interface Venta {
  id?: string | number;
  doc: string;
  time: string;
  total: string | number;
  method: 'Efectivo' | 'Tarjeta' | 'Transferencia';
  items: string;
  client?: string;
}

export class VentasService {
  /**
   * Obtiene todas las ventas registradas del turno desde la base de datos Supabase con fallback a mock data.
   */
  static async getAll(): Promise<Venta[]> {
    try {
      const { data, error } = await supabase
        .from('sales')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        return data.map((s: any) => ({
          id: s.id,
          doc: s.doc || `TKT-${s.id.toString().slice(0, 3).toUpperCase()}`,
          time: s.time || new Date(s.created_at).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
          total: `$${parseFloat(s.total).toFixed(2)}`,
          method: s.method || 'Efectivo',
          items: s.items || 'Productos varios',
          client: s.client || 'Público General'
        }));
      }

      throw new Error('Sin registros en la tabla sales de Supabase');
    } catch (err) {
      console.warn('VentasService: Retornando array vacío debido a:', err);
      return [];
    }
  }

  /**
   * Registra una nueva venta en la base de datos Supabase.
   */
  static async create(venta: Omit<Venta, 'id' | 'doc' | 'time'>): Promise<boolean> {
    try {
      const doc = `TKT-${Math.floor(100 + Math.random() * 900)}`;
      const time = new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
      const totalNum = typeof venta.total === 'number' ? venta.total : parseFloat(venta.total.toString().replace('$', '')) || 0;

      const { error } = await supabase
        .from('sales')
        .insert([{
          doc,
          time,
          total: totalNum,
          method: venta.method,
          items: venta.items,
          client: venta.client || 'Público General'
        }]);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Error en VentasService.create:', err);
      return false;
    }
  }
}
