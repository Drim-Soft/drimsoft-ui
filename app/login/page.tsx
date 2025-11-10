'use client';

import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Mail, Lock } from 'lucide-react';
import { Button } from '../components/button';
import { Input } from '../components/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/card';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f7fb] text-[#222831] dark:bg-[#f5f7fb] dark:text-[#222831]">
      <Card className="w-full max-w-md bg-white shadow-xl border border-gray-200 rounded-2xl dark:bg-white dark:border-gray-200">
        <CardHeader className="text-center pt-8">
          <div className="mx-auto w-16 h-16 bg-[#ffffff] rounded-2xl flex items-center justify-center mb-4 shadow-sm">
            <img
              src="/assets/images/DrimSoft logo.png"
              alt="DrimSoft"
              className="w-10 h-10"
            />
          </div>
          <CardTitle className="text-2xl font-bold text-[#3A6EA5] dark:text-[#3A6EA5]">
            DrimSoft Admin
          </CardTitle>
          <CardDescription className="text-gray-500 mt-1 dark:text-gray-600">
            Inicia sesión para acceder al panel de administración
          </CardDescription>
        </CardHeader>

        <CardContent className="p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-center">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-700">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="tu.nombre@drimsoft.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10 border-gray-200 text-[#222831] dark:text-[#222831]"
                />
              </div>
            </div>

            {/* Contraseña */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-700">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Ingresa tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-10 border-gray-200 text-[#222831] dark:text-[#222831]"
                />
              </div>
            </div>

            {/* Botón */}
            <Button
              type="submit"
              className="w-full bg-[#3A6EA5] hover:bg-[#325d8e] text-white font-medium py-2.5 rounded-lg transition-all shadow-md hover:shadow-lg"
              disabled={loading}
            >
              {loading ? 'Ingresando...' : 'Iniciar Sesión'}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-600">
              Acceso restringido solo a empleados de DrimSoft
            </p>
            <p className="text-xs text-gray-400 mt-1 dark:text-gray-500">
              Cualquier contraseña es válida para usuarios @drimsoft.com
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
