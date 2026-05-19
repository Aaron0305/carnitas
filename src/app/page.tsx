'use client';

import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    // Redirigir automáticamente a login
    window.location.href = '/login';
  }, []);

  return null;
}
