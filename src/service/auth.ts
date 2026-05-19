'use server';

import { supabase } from './supabase';
import bcrypt from 'bcryptjs';

export async function validateLogin(email: string, password: string) {
  try {
    // 1) Consultar usuario por correo
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, hashed_password, name, role')
      .eq('email', email)
      .maybeSingle();

    if (error) {
      console.error('Error al consultar usuario en Supabase:', error);
      return { success: false, error: 'Error de conexión con la base de datos' };
    }

    if (!user || !user.hashed_password) {
      return { success: false, error: 'Usuario o contraseña incorrectos' };
    }

    // 2) Comparar la contraseña ingresada con el hash de bcrypt en la BD
    const isPasswordValid = await bcrypt.compare(password, user.hashed_password);

    if (!isPasswordValid) {
      return { success: false, error: 'Usuario o contraseña incorrectos' };
    }

    // 3) Autenticación exitosa. Retornar datos seguros.
    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name || '',
        role: user.role,
      },
    };
  } catch (err: any) {
    console.error('Error inesperado durante la validación de login:', err);
    return { success: false, error: 'Ocurrió un error inesperado al iniciar sesión' };
  }
}
