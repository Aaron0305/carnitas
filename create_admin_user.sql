-- create_admin_user.sql
-- Inserta (o actualiza) un usuario administrador en la tabla `public.users`.
-- Requiere que el enum `user_role` y la tabla `public.users` existan (create_users.sql).

-- Usamos pgcrypto/crypt para hashear la contraseña en la base de datos.
-- Si tu base de datos no tiene pgcrypto, ejecuta: CREATE EXTENSION IF NOT EXISTS pgcrypto;

INSERT INTO public.users (email, hashed_password, role)
VALUES (
  'admin@gmail.com',
  crypt('prueba123', gen_salt('bf')),
  'admin'
)
ON CONFLICT (email) DO UPDATE
SET
  hashed_password = EXCLUDED.hashed_password,
  role = EXCLUDED.role,
  updated_at = now();
