'use client';

import {useEffect, useState} from 'react';
import { useAuth } from './AuthProvider';
import { authService } from '../services/authService';
import {Button} from "@/app/components/button";
import {Eye, EyeOff, Save, User, X} from "lucide-react";


export default function EditProfileForm() {
    const { user, updateProfile } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        password: '',
        confirmPassword: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        if (user?.name) {
            setFormData((prev) => ({ ...prev, name: user.name }));
        } else {
            const storedUser = authService.getStoredUser();
            const userName = authService.getUserName();
            setFormData((prev) => ({
                ...prev,
                name: userName || storedUser?.name || '',
            }));
        }
    }, [user]);

    const handleChange = (field: 'name' | 'password' | 'confirmPassword', value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        if (!formData.name && !formData.password) {
            setMessage({ type: 'error', text: 'Debes modificar al menos un campo.' });
            return;
        }

        if (formData.password && formData.password !== formData.confirmPassword) {
            setMessage({ type: 'error', text: 'Las contraseñas no coinciden.' });
            return;
        }

        setLoading(true);
        try {
            await updateProfile({
                name: formData.name || undefined,
                password: formData.password || undefined,
            });

            setFormData((prev) => ({
                ...prev,
                name: formData.name,
                password: '',
                confirmPassword: '',
            }));

            setMessage({ type: 'success', text: 'Perfil actualizado correctamente.' });
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Error al actualizar el perfil.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Encabezado */}
            <div className="flex items-center mb-6">
                <div className="bg-gray-100 w-14 h-14 flex items-center justify-center rounded-full mr-4 border border-gray-200">
                    <span className="text-lg font-bold text-gray-700">
                            {formData.name ? formData.name.charAt(0).toUpperCase() : 'U'}
                    </span>
                </div>
                <div>
                    <h2 className="text-2xl font-semibold text-gray-800">
                        {formData.name || 'Editar Perfil'}
                    </h2>
                    <p className="text-gray-500 text-sm">Actualiza tu información personal y contraseña</p>
                </div>
            </div>

            {/* Mensajes */}
            {message && (
                <div
                    className={`p-3 rounded-md mb-6 text-sm ${
                        message.type === 'success'
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                    }`}
                >
                    {message.text}
                </div>
            )}

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="space-y-8">
                <div>
                    <h3 className="flex items-center text-gray-700 font-semibold text-base mb-3">
                        <User className="w-4 h-4 text-purple-600 mr-2" />
                        Información del Usuario
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Nombre */}
                        <div className="col-span-2">
                            <label className="block text-sm text-gray-600 mb-1">Nombre Completo</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-800"
                                placeholder="Tu nombre completo"
                            />
                        </div>

                        {/* Nueva contraseña */}
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Nueva Contraseña</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={(e) => handleChange('password', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-gray-800"
                                    placeholder="Mínimo 6 caracteres"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Confirmar contraseña */}
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Confirmar Contraseña</label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={formData.confirmPassword}
                                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-gray-800"
                                    placeholder="Repite la contraseña"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                                >
                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Botones */}
                <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                    <Button
                        type="button"
                        onClick={() => window.location.reload()}
                        variant="outline"
                        className="group bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center gap-2"
                    >
                    <span className="transition-colors group-hover:text-red-600">
                        <X size={16} />
                    </span>
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        disabled={loading}
                        className="bg-gray-900 hover:bg-gray-800 text-white flex items-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Guardando...
                            </>
                        ) : (
                            <>
                                <Save size={16} />
                                Guardar Cambios
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </>
    );
}