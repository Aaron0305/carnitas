-- ============================================================================
-- PASO 2: CONFIGURACIÓN DE PRODUCTOS E INVENTARIO CON MÁRGENES
-- ============================================================================
-- Copia y ejecuta este script en el editor SQL de Supabase para configurar
-- el catálogo de tus productos con soporte de precio de costo y ganancia.
-- ============================================================================

-- 1) Crear la tabla de productos (products) con precio de costo y ganancia
CREATE TABLE IF NOT EXISTS public.products (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  category text NOT NULL,
  price numeric NOT NULL DEFAULT 0,
  stock numeric NOT NULL DEFAULT 0,
  cost_price numeric NOT NULL DEFAULT 0, -- Precio de compra/costo
  gain_price numeric NOT NULL DEFAULT 0, -- Margen de ganancia
  status text,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Si la tabla de productos ya existía, agregar las columnas financieras de forma segura
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS cost_price numeric DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS gain_price numeric DEFAULT 0;

-- Desactivar Row-Level Security (RLS) en la tabla 'products'
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
