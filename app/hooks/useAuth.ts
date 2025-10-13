// This file is deprecated. Use the AuthProvider from components/AuthProvider.tsx instead.
// Keeping this file for backward compatibility during migration.

'use client';
import { useAuth as useAuthProvider } from '../components/AuthProvider';

export function useAuth() {
  return useAuthProvider();
}
