import { supabase } from './supabase';

export interface OrderItem {
  id: string | number;
  name: string;
  qty: number;
  category: string;
  price: number;
  note?: string;
}

export interface Order {
  id: string;
  created_at: string;
  table_name: string;
  client_name?: string;
  items: OrderItem[];
  status: 'Pendiente' | 'Preparando' | 'Listo' | 'Entregado' | 'Cancelado';
  total: number;
  notes?: string;
}

export class OrdenesService {
  /**
   * Obtiene todas las órdenes que no han sido entregadas o canceladas (activas para la cocina).
   */
  static async getActiveOrders(): Promise<Order[]> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .in('status', ['Pendiente', 'Preparando', 'Listo'])
        .order('created_at', { ascending: true });

      if (error) throw error;
      return (data || []) as Order[];
    } catch (err) {
      console.error('Error en OrdenesService.getActiveOrders:', err);
      return [];
    }
  }

  /**
   * Obtiene el historial completo de órdenes.
   */
  static async getAllOrders(): Promise<Order[]> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as Order[];
    } catch (err) {
      console.error('Error en OrdenesService.getAllOrders:', err);
      return [];
    }
  }

  /**
   * Registra una nueva orden enviada desde Ventas.
   */
  static async create(order: Omit<Order, 'id' | 'created_at' | 'status'>): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .insert([{
          table_name: order.table_name,
          client_name: order.client_name || '',
          items: order.items,
          total: order.total || 0,
          notes: order.notes || '',
          status: 'Pendiente'
        }])
        .select('id')
        .single();

      if (error) throw error;
      return data?.id || null;
    } catch (err) {
      console.error('Error en OrdenesService.create:', err);
      return null;
    }
  }

  /**
   * Actualiza una orden existente (por ejemplo, si el mesero añade más productos).
   */
  static async updateOrder(id: string, order: Partial<Omit<Order, 'id' | 'created_at'>>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('orders')
        .update(order)
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error(`Error en OrdenesService.updateOrder para ID ${id}:`, err);
      return false;
    }
  }

  /**
   * Actualiza el estado de una orden (ej: de Pendiente a Preparando, de Preparando a Listo).
   */
  static async updateStatus(id: string, status: Order['status']): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error(`Error en OrdenesService.updateStatus para ID ${id}:`, err);
      return false;
    }
  }

  /**
   * Elimina/Cancela una orden de la base de datos.
   */
  static async delete(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error(`Error en OrdenesService.delete para ID ${id}:`, err);
      return false;
    }
  }
}
