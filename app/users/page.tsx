'use client';

import { Users, UserPlus, Search, MoreVertical } from 'lucide-react';

export default function UsersPage() {
  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-r from-[#FFD369] to-[#FFD369]/80 rounded-xl">
              <Users className="w-6 h-6 text-[#222831]" />
            </div>
            <h1 className="text-3xl font-bold text-[#222831]">Usuarios</h1>
          </div>
          <p className="text-gray-600">Gestiona todos los usuarios registrados en el sistema</p>
        </div>

        {/* Coming Soon */}
        <div className="bg-white rounded-2xl shadow-lg p-12">
          <div className="text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[#222831] mb-2">Módulo de Usuarios</h3>
            <p className="text-gray-600 mb-4">Esta funcionalidad está en desarrollo</p>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#FFD369]/10 text-[#222831] rounded-lg">
              <div className="w-2 h-2 bg-[#FFD369] rounded-full animate-pulse"></div>
              Próximamente disponible
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}