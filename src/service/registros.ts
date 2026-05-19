'use server';

import { supabase } from './supabase';
import bcrypt from 'bcryptjs';

export interface UserAccount {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  created_at: string;
}

/**
 * Recupera el listado de empleados/administradores registrados en el sistema.
 */
export async function getEmployees(): Promise<UserAccount[]> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, name, role, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    if (data && data.length > 0) {
      return data.map((u: any) => ({
        id: u.id,
        email: u.email,
        name: u.name || 'Sin nombre',
        role: u.role || 'user',
        created_at: new Date(u.created_at).toLocaleDateString('es-MX', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      }));
    }

    throw new Error('Sin usuarios en Supabase');
  } catch (err) {
    console.warn('RegistrosService.getEmployees: Retornando array vacío debido a:', err);
    return [];
  }
}

/**
 * Registra un nuevo empleado o administrador en la tabla de Supabase.
 * Encripta la contraseña de forma segura usando bcryptjs en el servidor.
 */
export async function registerEmployee(name: string, email: string, password: string, role: 'user' | 'admin') {
  try {
    if (!name || !email || !password || !role) {
      return { success: false, error: 'Todos los campos son obligatorios' };
    }

    // 1) Cifrar contraseña con bcryptjs
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 2) Insertar en Supabase
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          name,
          email,
          hashed_password: hashedPassword,
          role
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error al registrar usuario en Supabase:', error);
      return { success: false, error: 'Error al registrar: ' + error.message };
    }

    return { 
      success: true, 
      user: {
        id: data.id,
        email: data.email,
        name: data.name,
        role: data.role
      } 
    };
  } catch (err: any) {
    console.error('Error en registerEmployee:', err);
    return { success: false, error: err.message || 'Ocurrió un error inesperado al registrar el usuario' };
  }
}
