'use client';
import { useAuth } from '../../hooks/useAuth';
import Sidebar from '../components/Sidebar';
import { useState } from 'react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  useAuth();

  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar isCollapsed={isCollapsed} onToggle={() => setIsCollapsed(!isCollapsed)} />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
