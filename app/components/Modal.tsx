'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export default function Modal({ isOpen, onClose, title, children, className = '' }: ModalProps) {
  // Cerrar modal con tecla Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevenir scroll del body cuando el modal está abierto
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-gray-900/60 to-gray-800/60 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className={`relative bg-white rounded-2xl shadow-2xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-hidden ${className}`}>
        {/* Header con gradiente dorado */}
        {title && (
          <div className="flex items-center justify-between p-6 bg-gradient-to-r from-[#FFD369] to-[#ffd96f] border-b-2 border-[#e6bf5d]">
            <h2 className="text-2xl font-bold text-[#222831] flex items-center gap-2">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="text-[#222831] hover:text-[#393E46] transition-colors p-2 hover:bg-white/30 rounded-lg"
              aria-label="Cerrar modal"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        )}
        
        {/* Content con scroll */}
        <div className="p-6 bg-white overflow-y-auto max-h-[calc(90vh-5rem)]">
          {children}
        </div>
      </div>
    </div>
  );
}
