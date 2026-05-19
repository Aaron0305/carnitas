-- ============================================================================
-- SCRIPT DE CONFIGURACIÓN COMPLETO - EJECUTAR POR BLOQUES INDEPENDIENTES
-- ============================================================================
-- Instrucciones:
-- En el editor SQL de Supabase, puedes copiar y pegar cada bloque por separado
-- y hacer clic en "Run" (Ejecutar) para una instalación limpia paso a paso.
-- ============================================================================


-- ============================================================================
-- BLOQUE 1: CONFIGURACIÓN DE USUARIOS Y AUTENTICACIÓN
-- ============================================================================

-- 1) Habilitar la extensión pgcrypto para encriptar contraseñas
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2) Crear el tipo enum para los roles
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('user', 'admin');
  END IF;
END$$;

-- 3) Crear la tabla de usuarios (users)
CREATE TABLE IF NOT EXISTS public.users (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL UNIQUE,
  hashed_password text,
  name text, -- Nombre real
  role user_role NOT NULL DEFAULT 'user',
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Agregar columna 'name' si la tabla ya existía
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS name text;

-- Trigger para actualizar 'updated_at' automáticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at ON public.users;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Desactivar Row-Level Security (RLS) en la tabla 'users'
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Crear el usuario Administrador Inicial
-- Email: admin@gmail.com
-- Contraseña: prueba123
INSERT INTO public.users (email, hashed_password, role, name)
VALUES (
  'admin@gmail.com',
  crypt('prueba123', gen_salt('bf')),
  'admin',
  'Juan Pérez'
)
ON CONFLICT (email) DO UPDATE
SET
  hashed_password = EXCLUDED.hashed_password,
  role = EXCLUDED.role,
  name = EXCLUDED.name,
  updated_at = now();


-- ============================================================================
-- BLOQUE 2: CONFIGURACIÓN DE PRODUCTOS E INVENTARIO CON MÁRGENES
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


-- ============================================================================
-- BLOQUE 3: CONFIGURACIÓN DE TRANSACCIONES DE VENTAS (POS)
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
