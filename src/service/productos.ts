import { supabase } from './supabase';

export interface Product {
  id?: string | number;
  name: string;
  category: string;   // Tipo de producto: Taco, Bebida, Corte, Complemento, Combo, Otro
  unit: string;        // Unidad de venta: Pieza, Kg, Litro, Porción, Paquete, Gramo, Caja
  price: string | number;
  stock: string | number;
  status: 'Disponible' | 'Por agotar' | 'Agotado';
  accent?: string;
  cost_price?: number;
  gain_price?: number;
}

export class ProductosService {
  /**
   * Determina el estado del producto y la clase de estilo CSS correspondiente según su stock.
   */
  static getStatusAndAccent(stockNum: number) {
    if (stockNum <= 0) {
      return {
        status: 'Agotado' as const,
        accent: 'bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400',
      };
    } else if (stockNum < 10) {
      return {
        status: 'Por agotar' as const,
        accent: 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400',
      };
    } else {
      return {
        status: 'Disponible' as const,
        accent: 'bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400',
      };
    }
  }

  /**
   * Obtiene todos los productos desde la base de datos Supabase.
   */
  static async getAll(): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      
      if (data && data.length > 0) {
        return data.map((p: any) => {
          const stockNum = parseFloat(p.stock);
          const isUnlimited = stockNum === -1;
          const unit = p.unit || 'Pieza';
          
          const { status, accent } = isUnlimited
            ? { status: 'Disponible' as const, accent: 'bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400' }
            : this.getStatusAndAccent(stockNum);

          let cat = p.category || 'Otro';
          
          // Auto-migrate legacy categories (units) to real categories based on product name
          if (['Pieza', 'Kg', 'Litro', 'Gramo', 'Paquete', 'Caja', 'Porción'].includes(cat)) {
            const nameLower = p.name.toLowerCase();
            if (nameLower.includes('taco')) cat = 'Taco';
            else if (nameLower.includes('kilo') || nameLower.includes('kg') || nameLower.includes('carnita')) cat = 'Corte';
            else if (nameLower.match(/agua|pepsi|7up|mirinda|corona|cafe|coca|refresco|jugo/)) cat = 'Bebida';
            else cat = 'Otro';
          }

          return {
            id: p.id,
            name: p.name,
            category: cat,
            unit,
            price: `$${parseFloat(p.price).toFixed(2)}`,
            stock: isUnlimited ? 'Ilimitado' : `${p.stock} ${unit}`,
            status,
            accent,
            cost_price: parseFloat(p.cost_price) || 0,
            gain_price: parseFloat(p.gain_price) || 0
          };
        });
      }
      
      return [];
    } catch (err) {
      console.warn('ProductosService: Retornando array vacío debido a:', err);
      return [];
    }
  }

  /**
   * Crea un producto en Supabase.
   */
  static async create(product: Omit<Product, 'id' | 'status' | 'accent'>): Promise<boolean> {
    try {
      const stockNum = typeof product.stock === 'number' ? product.stock : parseFloat(product.stock) || 0;
      const isUnlimited = stockNum === -1;
      
      const { status } = isUnlimited
        ? { status: 'Disponible' as const }
        : this.getStatusAndAccent(stockNum);
      
      const priceNum = typeof product.price === 'number' ? product.price : parseFloat(product.price.toString().replace('$', '')) || 0;
      const costNum = product.cost_price ? (typeof product.cost_price === 'number' ? product.cost_price : parseFloat(String(product.cost_price)) || 0) : 0;
      const gainNum = Math.max(0, priceNum - costNum);

      const { error } = await supabase
        .from('products')
        .insert([{
          name: product.name,
          category: product.category,
          unit: product.unit || 'Pieza',
          price: priceNum,
          stock: stockNum,
          status: status,
          cost_price: costNum,
          gain_price: gainNum
        }]);

      if (error) throw error;
      return true;
    } catch (err: any) {
      console.error('Error en ProductosService.create:', err);
      // Check if it's the missing column error from Supabase
      if (err?.code === '42703' && err?.message?.includes('unit')) {
        alert('⚠️ ¡Te falta un paso! Necesitas ir a Supabase y crear la columna "unit" (tipo text) en la tabla "products". Revisa mis instrucciones anteriores.');
      } else if (err?.message) {
        alert(`Error al guardar: ${err.message}`);
      }
      return false;
    }
  }

  /**
   * Elimina un producto de la base de datos Supabase.
   */
  static async delete(id: string | number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Error en ProductosService.delete:', err);
      return false;
    }
  }
}
