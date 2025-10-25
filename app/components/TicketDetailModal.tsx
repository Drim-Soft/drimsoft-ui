'use client';

import { useState, useEffect } from 'react';
import { Ticket } from '../types/ticket';
import { ticketService } from '../services/ticketService';
import { userService } from '../services/userService';
import { useAuth } from './AuthProvider';
import Modal from './Modal';
import { Clock, User, MessageSquare, CheckCircle, Send, RefreshCw } from 'lucide-react';

interface TicketDetailModalProps {
  ticket: Ticket | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: () => void;
}

export default function TicketDetailModal({ ticket, isOpen, onClose, onUpdate }: TicketDetailModalProps) {
  const { user } = useAuth();
  const [answer, setAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [drimsoftUserId, setDrimsoftUserId] = useState<number | null>(null);

  useEffect(() => {
    if (ticket) {
      setSelectedStatus(ticket.idticketstatus ?? null);
      setAnswer('');
      setError(null);
      setSuccess(null);
    }
  }, [ticket]);

  useEffect(() => {
    const fetchDrimsoftUserId = async () => {
      if (user?.id) {
        try {
          const drimsoftUser = await userService.getUserBySupabaseId(user.id);
          if (drimsoftUser?.idUser) {
            setDrimsoftUserId(drimsoftUser.idUser);
          }
        } catch (error) {
        }
      }
    };

    fetchDrimsoftUserId();
  }, [user]);

  if (!ticket) return null;

  const handleSubmitAnswer = async () => {
    if (!answer.trim()) {
      setError('Por favor ingresa una respuesta');
      return;
    }

    if (!drimsoftUserId) {
      setError('No se pudo identificar el usuario. Por favor, inicia sesión nuevamente.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      await ticketService.addAnswer(ticket.idtickets, {
        answer: answer.trim(),
        iddrimsoftuser: drimsoftUserId,
      });

      try {
        if (!ticket.iddrimsoftuser) {
          await ticketService.assignUser(ticket.idtickets, drimsoftUserId);
        }
      } catch (assignErr) {
      }

      setSuccess('Respuesta enviada exitosamente');
      setAnswer('');
      
      setTimeout(() => {
        onUpdate?.();
        onClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar respuesta');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (newStatusId: number) => {
    if (newStatusId === ticket.idticketstatus) return;

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      await ticketService.updateStatus(ticket.idtickets, newStatusId);
      setSelectedStatus(newStatusId);
      setSuccess('Estado actualizado exitosamente');
      
      setTimeout(() => {
        onUpdate?.();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar estado');
    } finally {
      setIsSubmitting(false);
    }
  };

  const statuses = [
    { id: 1, name: 'PENDING', label: 'Pendiente', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    { id: 2, name: 'IN_PROGRESS', label: 'En Progreso', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
    { id: 3, name: 'ANSWERED', label: 'Respondido', color: 'bg-purple-50 text-purple-700 border-purple-200' },
    { id: 4, name: 'CLOSED', label: 'Cerrado', color: 'bg-gray-50 text-gray-700 border-gray-200' },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Ticket #${ticket.idtickets}`}>
      <div className="space-y-6 p-2">
        {/* Mensajes de éxito y error */}
        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 rounded-r-xl p-4 flex items-start gap-3 shadow-sm">
            <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
            <p className="text-green-800 font-medium">{success}</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 rounded-r-xl p-4 flex items-start gap-3 shadow-sm">
            <div className="w-5 h-5 text-red-600 shrink-0 mt-0.5">⚠️</div>
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        )}

        {/* Título */}
        <div className="bg-gradient-to-r from-[#FFD369]/10 to-transparent p-4 rounded-xl">
          <label className="block text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide">
            Título del Ticket
          </label>
          <div className="text-xl font-bold text-[#222831]">{ticket.title}</div>
        </div>

        {/* Estado - Editable */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-3 uppercase tracking-wide">
            <Clock className="w-4 h-4 inline mr-1" />
            Estado del Ticket
          </label>
          <div className="flex flex-wrap gap-3">
            {statuses.map((status) => (
              <button
                key={status.id}
                onClick={() => handleStatusChange(status.id)}
                disabled={isSubmitting}
                className={`px-5 py-2.5 rounded-xl font-semibold transition-all border-2 shadow-sm ${
                  selectedStatus === status.id
                    ? status.color + ' ring-2 ring-[#FFD369] ring-offset-2 scale-105'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:shadow'
                } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}`}
              >
                {status.label}
              </button>
            ))}
          </div>
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-3 uppercase tracking-wide">
            <MessageSquare className="w-4 h-4 inline mr-1" />
            Descripción
          </label>
          <div className="bg-gray-50 border border-gray-200 p-5 rounded-xl text-gray-700 whitespace-pre-wrap shadow-sm">
            {ticket.description}
          </div>
        </div>

        {/* Respuesta existente */}
        {ticket.answer && (
          <div>
            <label className="block text-xs font-medium text-green-600 mb-3 uppercase tracking-wide">
              <CheckCircle className="w-4 h-4 inline mr-1" />
              Respuesta de Soporte
            </label>
            <div className="bg-gradient-to-r from-green-50 to-green-50/50 border-l-4 border-green-500 p-5 rounded-r-xl text-gray-700 whitespace-pre-wrap shadow-sm">
              {ticket.answer}
            </div>
          </div>
        )}

        {/* Formulario para nueva respuesta */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-3 uppercase tracking-wide">
            <Send className="w-4 h-4 inline mr-1" />
            {ticket.answer ? 'Agregar Nueva Respuesta' : 'Responder al Ticket'}
          </label>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Escribe tu respuesta aquí..."
            rows={5}
            disabled={isSubmitting}
            className="w-full px-4 py-3 text-gray-900 text-base border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FFD369] focus:border-[#FFD369] focus:outline-none resize-none shadow-sm transition-all placeholder:text-gray-400"
          />
          <button
            onClick={handleSubmitAnswer}
            disabled={isSubmitting || !answer.trim()}
            className="mt-3 w-full px-6 py-3 bg-gradient-to-r from-[#FFD369] to-[#ffd96f] text-[#222831] rounded-xl hover:from-[#e6bf5d] hover:to-[#FFD369] transition-all disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg flex items-center justify-center gap-2 shadow-lg"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Enviando Respuesta...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Enviar Respuesta
              </>
            )}
          </button>
        </div>

        {/* Usuario que creó el ticket */}
        <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl">
          <label className="block text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide">
            <User className="w-4 h-4 inline mr-1" />
            Usuario de Planifika
          </label>
          <div className="text-gray-900 font-semibold">ID: {ticket.idplanifikauser}</div>
        </div>

        {/* Botón cerrar */}
        <div className="flex justify-end pt-4 border-t-2 border-gray-100">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-[#222831] text-white rounded-xl hover:bg-[#393E46] transition-colors font-semibold shadow-lg"
          >
            Cerrar
          </button>
        </div>
      </div>
    </Modal>
  );
}
