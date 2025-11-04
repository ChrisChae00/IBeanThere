'use client';

import { useEffect, useState } from 'react';
import { CheckIcon } from './CheckIcon';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: () => void;
}

export default function Toast({ message, type = 'info', duration = 3000, onClose }: ToastProps) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onClose, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bgColor = {
    success: 'bg-success',
    error: 'bg-error',
    warning: 'bg-warning',
    info: 'bg-primary'
  }[type];

  const icon = {
    success: <CheckIcon className="w-5 h-5 text-white" />,
    error: <span className="text-white text-xl">✕</span>,
    warning: <span className="text-white text-xl">⚠</span>,
    info: <span className="text-white text-xl">ℹ</span>
  }[type];

  return (
    <div
      className={`
        fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50
        ${bgColor} text-white
        px-6 py-4 rounded-lg shadow-lg
        flex items-center gap-3 min-w-[300px] max-w-[90vw]
        transition-all duration-300
        ${isExiting ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}
      `}
    >
      <div className="flex-shrink-0">{icon}</div>
      <p className="text-sm font-medium">{message}</p>
      <button
        onClick={() => {
          setIsExiting(true);
          setTimeout(onClose, 300);
        }}
        className="ml-auto flex-shrink-0 text-white hover:text-white/80 transition-colors"
      >
        ✕
      </button>
    </div>
  );
}

