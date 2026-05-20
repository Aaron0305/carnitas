'use client';

import { FiCheckCircle } from 'react-icons/fi';

interface Props {
  toast: string | null;
}

export default function ToastNotification({ toast }: Props) {
  if (!toast) return null;

  return (
    <div className="fixed top-4 right-4 z-[60] flex items-center gap-2 bg-green-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-2xl animate-bounce">
      <FiCheckCircle size={16} /> {toast}
    </div>
  );
}
