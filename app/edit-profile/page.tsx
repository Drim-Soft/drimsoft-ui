'use client';

import EditProfileForm from '../components/EditProfileForm';
import {UserCog} from "lucide-react";

export default function EditProfilePage() {
    return (
        <div className="p-8">
            {/* ---------- Header ---------- */}
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-[#FFD369] rounded-xl flex items-center justify-center">
                    <UserCog className="w-6 h-6 text-[#222831]" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Editar Perfil</h1>
                    <p className="text-gray-500 text-sm">Actualiza tu nombre y/o contraseña</p>
                </div>
            </div>

            {/* ---------- Form ---------- */}
            <div className="bg-white rounded-2xl shadow p-6">
                <EditProfileForm />
            </div>
        </div>
    );
}