-- ============================================================================
-- PASO 3: CONFIGURACIÓN DE TRANSACCIONES DE VENTAS (POS)
-- ============================================================================
-- Copia y ejecuta este script en el editor SQL de Supabase para configurar
-- el registro de tus ventas realizadas en efectivo.
-- ============================================================================

-- 1) Crear la tabla de ventas (sales)
CREATE TABLE IF NOT EXISTS public.sales (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  doc text NOT NULL,
  time text NOT NULL,
  total numeric NOT NULL DEFAULT 0,
  method text NOT NULL DEFAULT 'Efectivo',
  items text NOT NULL,
  client text DEFAULT 'Público General',
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Desactivar Row-Level Security (RLS) en la tabla 'sales'
ALTER TABLE public.sales DISABLE ROW LEVEL SECURITY;
