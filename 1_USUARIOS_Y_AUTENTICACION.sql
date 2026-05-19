-- ============================================================================
-- PASO 1: CONFIGURACIÓN DE USUARIOS Y AUTENTICACIÓN
-- ============================================================================
-- Copia y ejecuta este script en el editor SQL de Supabase para configurar
-- el inicio de sesión y la tabla de usuarios inicial.
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
  name text, -- Nombre real de la persona
  role user_role NOT NULL DEFAULT 'user',
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Agregar la columna 'name' de forma segura por si la tabla ya existía
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
